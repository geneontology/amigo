=head1 AmiGO::ChewableGraph

A somewhat abstract graph (rendered out of a JSON blob for starters)
and run off of Graph::Directed and company.

The primary purpose is to keep a bit of a compatibility layer with the
old templates and other paths; we're trying to get the "Inferred Tree View"
and "Ancestors and Children" working again with as little fuss as
possible, but we can maybe use this to resurrect GraphViz components
as well.

=cut

package AmiGO::ChewableGraph;

use base 'AmiGO';
use utf8;
use strict;
use Graph::Directed;
use Graph::TransitiveClosure;
use Data::Dumper;


=item new

=cut
sub new {

  ##
  my $class = shift;
  my $args = shift || {};
  my $self  = $class->SUPER::new($args);

  ## Defined in super now...
  #   $self->{SCHEMA} =
  #     GO::Schema->connect($self->{CONNECT_INFO});
  #$args->{type} = 'term2term_over_graph_path';
  #$self->{GRAPH_Q} = GO::Query->new($args);

  ## TODO: Let's start trying life without t2t:
  #$args->{type} = 'graph_path';
  #$self->{GRAPH_PATH} = GO::Query->new($args);

  ## We'll borrow SUCCESS and ERROR_MESSAGE from GO.

  ### Nodes are defined as terms (keyed by acc) and edges are defined
  ### as two terms, a relationship, and a completeness (keyed
  ### accordingly).
  #$self->{NODES} = {};
  #$self->{EDGES} = {};

  ## TODO/BUG: the below would be preferable if the GO wasn't borked.
  #my $rrs = $schema->resultset('Term')->search({is_root => 1});

  # ## Try and guess which term id the "bad" root.
  # my $all_db_id = 1;
  # my $tmp_rs = $self->{SCHEMA}->resultset('Term')->search({ is_root => 1 });
  # my $possible_root_term = $tmp_rs->next;
  # if( $possible_root_term && $possible_root_term->acc eq 'all' ){
  #   $all_db_id = $possible_root_term->id;
  # }

  $self->{ACG_ROOTS} = {};
  # my $rrs =
  # $self->{SCHEMA}->resultset('Term2Term')->search({ term1_id => $all_db_id });
  # while( my $possible_root_rel = $rrs->next ){
  #   my $term = $possible_root_rel->subject;
  #   if( ! $term->is_obsolete && $term->name ne 'all' ){
  #     $self->{ACG_ROOTS}{$term->acc} = $term;
  #   }
  # }

  bless $self, $class;
  return $self;
}


## Internal convenience function.
## From Chris: "{-,+} reg < reg < {part_of,has_part} < is_a"
sub relation_weight {

  my $self = shift;
  my $rel = shift || '';
  my $default = shift || 0;

  my $order =
    {
     is_a => 1,
     has_part => 2,
     part_of => 3,
     regulates => 4,
     negatively_regulates => 5,
     positively_regulates => 6,
    };

  my $ret = $default;
  if( defined $rel &&
      $rel &&
      defined $order->{$rel} ){
    $ret = $order->{$rel};
  }
  #print STDERR ";;; $rel $ret\n";

  return $ret;
}


## Internal convenience function.
sub _convert_term_or_acc_to_acc {

  my $self = shift;
  my $term = shift || '';

  ## Convert string or obj to acc string.
  my $term_acc = $term; # assume as string
  if( $term && (ref $term eq 'GO::Schema::Term' ) ){
    $term_acc = $term->acc;
  }

  return $term_acc;
}


## Internal convenience function. Convert pretty much anything into
## acc string array ref.
sub _convert_whatever_to_acc_aref {

  my $self = shift;
  my $term = shift || '';
  my $ret_thing = [];

  if( ref($term) eq "ARRAY" ){
    #$self->kvetch('what: term (many): ' . Dumper($term));
    for my $t (@$term){
      push @$ret_thing, $self->_convert_term_or_acc_to_acc($t);
    }
  }else{
    #$self->kvetch('what: term (single): ' .  Dumper($term));
    push @$ret_thing, $self->_convert_term_or_acc_to_acc($term);
  }

  #$self->kvetch('what: ret_thing: ' . Dumper($ret_thing));
  return $ret_thing;
}


=item get_roots

Returns the root nodes.

=cut
sub get_roots {
  my $self = shift;

  ## We don't want to actually pass this thing...makes Continuity.pm
  ## cry.
  my $copy = {};
  foreach my $key (keys %{$self->{ACG_ROOTS}}){
    $copy->{$key} = $self->{ACG_ROOTS}{$key};
  }
  return $copy;
}


=item is_root_p

Boolean on acc string or DBIx::Class Term.

=cut
sub is_root_p {
  my $self = shift;
  my $thing = shift || '';

  ##
  my $retval = 0;
  my $acc = $self->_convert_term_or_acc_to_acc($thing);
  #$self->kvetch('_root_p_acc_: ' . $acc);
  if( defined $self->{ACG_ROOTS}{$acc} ){
    $retval = 1;
  }
  #$self->kvetch('_root_p_ret_: ' . $retval);
  return $retval;
}


=item is_leaf_p

Boolean on acc string or DBIx::Class Term.

=cut
sub is_leaf_p {
  my $self = shift;
  my $thing = shift || '';
  # $self->kvetch('>>><<<');

  ## Assume leafiness until proven otherwise.
  my $retval = 1;
  my $res = $self->get_child_relationships($thing);
  if( $res && scalar(@$res) ){
    $retval = 0;
  }
  return $retval;
}


=item get_term

TODO?: accept arrayrefs as well. That should help the speedups.

Gets a term from an acc string or DBIx::Class Term.
A Term just gets passed through (little overhead).

=cut
sub get_term {

  my $self = shift;
  my $reterm = shift || undef;

  #$self->kvetch('AmiGO::ChewableGraph::get_term in: '.$reterm);
  #$self->kvetch('AmiGO::ChewableGraph::get_term ref: '.ref($reterm));

  ## Convert to Term object if it looks like a (acc) string.
  if( defined $reterm && ref $reterm ne 'GO::Schema::Term' ){
    my $term_rs = $self->{SCHEMA}->resultset('Term')->search({acc => $reterm});
    $reterm = $term_rs->first || undef;
  }

  return $reterm;
}


=item get_children

In: acc string, Term, or aref of either.
Out: Children term (object) list ref.

=cut
sub get_children {

  my $self = shift;
  #my $term = shift || undef;
  my $thing = shift || '';
  #my $acc = $self->_convert_term_or_acc_to_acc($thing);
  my $accs = $self->_convert_whatever_to_acc_aref($thing);

  # my $all = $self->{GRAPH_Q}->get_all_results({'graph_object.acc' => $acc,
  # 					       'graph_path.distance' => 1});
  my $all = $self->{GRAPH_PATH}->get_all_results({'object.acc' => $accs,
						  'me.distance' => 1});

  my $ret = [];
  foreach my $gp (@$all){
    if( ! $gp->subject->is_obsolete ){
      push @$ret, $gp->subject;
      # $self->kvetch("AmiGO::ChewableGraph::get_children: kid: " .
      # 		    $t2t->subject->acc);
    }
  }
  return $ret;
}


=item get_relationship

In: term, term; take string or object.
Out: String.

=cut
sub get_relationship {

  my $self = shift;
  my $obj_thing = shift || '';
  my $sub_thing= shift || '';
  my $obj_acc = $self->_convert_term_or_acc_to_acc($obj_thing);
  my $sub_acc = $self->_convert_term_or_acc_to_acc($sub_thing);

  ## 
  my $all = $self->{GRAPH_PATH}->get_all_results({'object.acc' => $obj_acc,
  						  'subject.acc' => $sub_acc});

  ## Should be just one.
  my $ret = undef;
  foreach my $gp (@$all){
    $ret = $gp->relationship->name;
    last;
  }

  return $ret;
}


=item get_child_relationships

Takes DBIx::Class Term or acc string, or aref of either.
Gets the term2term links from a term.

# TODO/BUG: track down functions that use this to switch over to running
# through returned graph_paths. Seems to appear many times.

=cut
sub get_child_relationships {

  my $self = shift;
  my $term = shift || undef;
  #my $term_acc = $self->_convert_term_or_acc_to_acc($term);
  my $term_accs = $self->_convert_whatever_to_acc_aref($term);

  return $self->{GRAPH_Q}->get_all_results({'graph_object.acc' => $term_accs,
  					    'graph_path.distance' => 1});
}


=item get_parent_relationships

Takes DBIx::Class Term or acc string, or aref of either.
Gets the term2term links from a term.

TODO/BUG: track down functions that use this to switch over to running
through returned graph_paths. It seems to just appear once.

=cut
sub get_parent_relationships {

  my $self = shift;
  my $term = shift || undef;
  #my $term_acc = $self->_convert_term_or_acc_to_acc($term);
  my $term_accs = $self->_convert_whatever_to_acc_aref($term);

  return
    $self->{GRAPH_Q}->get_all_results({'graph_subject.acc' => $term_accs,
				       'graph_path.distance' => 1});
}


=item climb

With an array ref of terms, will climb to the top of the ontology
(with an added 'all' stopper for GO).

This returns an array of five things:
   (\%nodes, \%edges, \%tc_desc, \%tc_anc, \%tc_depth);
   *) a link list
   *) a term (node)
   *) a hashref of of nodes in terms of in-graph descendants

=cut
sub climb {

  my $self = shift;
  my $in_thing = shift || [];

  ## TODO: could probably use _convert_whatever_to_acc_aref here...
  ## Whatever it is, arrayify it.
  if( ref $in_thing ne 'ARRAY' ){
    $in_thing = [$in_thing];
  }

  ## Whatever is in there, make sure that they're all Terms. Use
  ## Graph::get_term pass-through.
  my @seed_terms = map {
    $self->get_term($_);
  } @$in_thing;

  ## For doing transitive closure on the graph to help with
  ## association transfer.
  my $booking_graph = Graph::Directed->new();

  # $self->kvetch("Climb: IN");

  ## Pre-seed the nodes list.
  my %edges = ();
  my %nodes = ();
  foreach my $seed ( @seed_terms ){
    $nodes{$seed->acc} = $seed;
    # $self->kvetch("Climb: added seed: " . $seed->acc);
  }

  ##
  my %in_graph_by_acc = ();
  while( @seed_terms ){

    my $current_term = pop @seed_terms;

    ## BUG: Prevent super root (not really our bug though).
    my $current_acc = $current_term->acc;
    if( $current_acc ne 'all' ){

      ## Add node to hash if not already there.
      if( ! $nodes{$current_acc} ){
	$nodes{$current_acc} = $current_term;
	# $self->kvetch("Climb: adding node: " . $current_acc);
	$booking_graph->add_vertex($current_acc);
      }

      ## Find parent relations each time.
      #my $parent_rs = $current_term->parent_relations;
      #my @all_parents = $parent_rs->all;
      #foreach my $parent_rel (@all_parents){
      #$self->kvetch('new code', 1);
      my $all_parents = $self->get_parent_relationships($current_term);
      foreach my $parent_rel (@$all_parents){

	my $id = $parent_rel->id;

	my $obj = $parent_rel->object;
	my $obj_acc = $obj->acc;

	## BUG: Prevent links to super root (not really our bug though).
	if( $obj_acc ne 'all' ){

	  my $sub = $parent_rel->subject;
	  my $sub_acc = $sub->acc;
	  #my $rel_id = $parent_rel->relationship_type_id;
	  my $rel_id = $parent_rel->relationship->name;

	  ## Add edge to hash if not already there.
	  if( ! defined $edges{$id} ){
	    $edges{$id} = $parent_rel;
	    # $self->kvetch("Climb adding edge: $sub_acc $rel_id $obj_acc");
	    $booking_graph->add_edge($sub_acc, $obj_acc);
	  }

	  ## Make sure that there is a space in the indirect hash
	  ## if it is not already there.
	  if( ! defined $in_graph_by_acc{$obj_acc} ){
	    $in_graph_by_acc{$obj_acc} = {};
	  }

	  ## TODO: double check the correctness of this...
	  ## If we haven't seen it, mark it and climb.
	  if( ! defined $in_graph_by_acc{$obj_acc}{$sub_acc} ){

	    $in_graph_by_acc{$obj_acc}{$sub_acc} = 1;
	    push @seed_terms, $obj;
	  }
	}
      }
    }
  }

  ###
  ### From here on is just reworking everything using the Graph module
  ### to pull out useful information.
  ###

  ## Calculate the transitive closure to help with figuring out the
  ## association transitivity in other components.
  my $tc_graph = Graph::TransitiveClosure->new($booking_graph,
					       reflexive => 0,
					       path_length => 1);
  my %tc_desc = ();
  my %tc_anc = ();

  ## Iterate through the combinations making the anc and desc hashes.
  foreach my $obj (keys %nodes){

    $tc_desc{$obj} = {} if ! defined $tc_desc{$obj};
    $tc_anc{$obj} = {} if ! defined $tc_anc{$obj};

    foreach my $sub (keys %nodes){

      if( $tc_graph->is_reachable($obj, $sub) ){
	$tc_anc{$obj}{$sub} = 1;
      }
      if( $tc_graph->is_reachable($sub, $obj) ){
	$tc_desc{$obj}{$sub} = 1;
      }
    }
  }

  ## Down here, we're doing something separate--we're going to get
  ## the depth of the node.
  #TODO
  my %tc_depth = ();
  foreach my $sub (keys %nodes){
    foreach my $root (keys %{$self->{ACG_ROOTS}}){
      my $len = $tc_graph->path_length($sub, $root);
      if( defined $len ){
	$tc_depth{$sub} = $len;
	# $self->kvetch('Depth of ' . $sub . ' is ' . $len);
      }
    }
  }

  #return (\%nodes, \%edges, \%in_graph_by_acc);
  #return (\%nodes, \%edges, \%tc_desc);
  return (\%nodes, \%edges, \%tc_desc, \%tc_anc, \%tc_depth);
}


=item lineage

BUG/TODO: clearly differentiate climb and lineage.

Not quite get ancestors, as we're getting depth and inference info as well.

With an array ref of terms, will climb to the top of the ontology
(with an added 'all' stopper for GO). This should be an easy and
lightweight alternative to climb for some use cases.

# Takes optional arg {reflexive => (0|1)}. If not set to one, will
# ignore distance 0 reflexive relationsships.

This returns an array of five things:
   (\%nodes, \%edges, \%tc_desc, \%tc_anc, \%tc_depth);
   *) a link list
   *) a term (node)
   *) a hashref of of nodes in terms of in-graph descendants

=cut
sub lineage {

  my $self = shift;
  my $sub_thing = shift || '';
  #my $opt_arg = shift || {};

  #my $sub_acc = $self->_convert_term_or_acc_to_acc($sub_thing);
  #$self->kvetch('sub_thing: ' . $sub_thing);
  my $sub_accs = $self->_convert_whatever_to_acc_aref($sub_thing);
  #$self->kvetch('sub_accs: ' . Dumper($sub_accs));

  my $nodes = {};
  my $node_depth = {};
  my $node_rel = {};
  my $node_rel_inf = {};

  # ## Thinks that we can logically tease out, but only if we care about
  # ## reflexive relationships.
  # if( $opt_arg && $opt_arg->{reflexive} ){
  #   foreach my $acc (@$sub_accs){
  #     ## Reflexive relations are direct.
  #     $node_rel_inf->{$acc} = 0;
  #     $node_rel->{$acc} = 'is_a'; # BUG: technically, this is a go-ism
  #     $node_depth->{$acc} = 0;
  #     $nodes->{$acc} = $self->get_term;
  #   }
  # }

  ## Things that we need to ask the database about.
  my $all = $self->{GRAPH_PATH}->get_all_results({'subject.acc' => $sub_accs});
  my $max_depth = 0;
  foreach my $gp (@$all){

    if( ! $gp->object->is_obsolete &&
	$gp->object->acc ne 'all' ){ # GO-specific control

      #$self->kvetch('accs if: ' . $gp->object->acc);

      ## Increment maximum depth if necessary.
      if( $gp->distance > $max_depth ){ $max_depth = $gp->distance; }

      ## We'll start by assuming that relations aren't direct unless
      ## proven otherwise.
      if( ! defined $node_rel_inf->{$gp->object->acc} ){
	$node_rel_inf->{$gp->object->acc} = 1;
      }

      ## Check existance, if it's not there yet, make it. If it's
      ## already there, modify the entry accordingly.
      if( ! defined $node_rel->{$gp->object->acc} ){
	# $self->kvetch('distance: ' . $gp->object->acc .
	# 	      ' : ' . $gp->distance .
	# 	      ' : ' . $gp->subject->acc);
	$node_rel->{$gp->object->acc} = $gp->relationship_type->acc;
	$node_depth->{$gp->object->acc} = $gp->distance;
	$nodes->{$gp->object->acc} = $gp->object;
      }else{

	## Take the dominating relation.
	## NOTE/WARNING: this may be GO specific.
	my $curr_scale =
	  $self->relation_weight($node_rel->{$gp->object->acc}, 1000);
	my $test_scale =
	  $self->relation_weight($gp->relationship_type->acc, 1000);
	if( $curr_scale < $test_scale ){ # less specific
	#if( $curr_scale > $test_scale ){ # more specific
	  $node_rel->{$gp->object->acc} = $gp->relationship_type->acc;
	  #print STDERR "  :in>: $curr_scale $test_scale\n";
	}

	## Take the greater distance.
	if( $node_depth->{$gp->object->acc} < $gp->distance ){
	  $node_depth->{$gp->object->acc} = $gp->distance;
	}
      }

      ## Update if it looks like a direct relationship.
      if( $gp->distance == 1 ){
	$node_rel_inf->{$gp->object->acc} = 0;
      }
    }
  }

  ## Now go through and correct distance to depth.
  foreach my $acc (keys %$node_depth){
    #$self->kvetch('final acc: ' . $acc);
    my $d = $node_depth->{$acc};
    $d = $d - $max_depth;
    $d = abs($d);
    $node_depth->{$acc} = $d;
  }

  # my @foo = keys(%$nodes);
  # $self->kvetch('nodes: ' . Dumper(\@foo));
  return ($nodes, $node_rel, $node_rel_inf, $node_depth, $max_depth);
}


# =item ancestors

# Takes a model term, returns an array ref of model term ancestors

# =cut
# sub ancestors {

#   my $self = shift;
#   my $term = shift;
#   my $ancestors = [];

#   ##
  

#   return $ancestors;
# }



1;
