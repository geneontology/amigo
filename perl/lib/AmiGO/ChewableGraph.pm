=head1 AmiGO::ChewableGraph

A somewhat abstract graph (rendered out of a JSON blob for starters)
and run off of Graph::Directed and company.

The primary purpose is to keep a bit of a compatibility layer with the
old templates and other paths; we're trying to get the "Inferred Tree View"
and "Ancestors and Children" working again with as little fuss as
possible, but we can maybe use this to resurrect GraphViz components
as well.

WARNING: we make a closed-world assumption since we are assuming that
we get properly closed graphs coming in from our loadedd GOlr.

=cut

package AmiGO::ChewableGraph;

use base 'AmiGO';
use utf8;
use strict;
use AmiGO::JavaScript;
use Graph::Directed;
use Graph::TransitiveClosure;
use Data::Dumper;


## Internal helper function for creating a commonly used hashref
## pattern for my graphs.
sub _cram_hash {
  my $hashref = shift || die 'necessary arg 1';
  my $lvl1 = shift || die 'necessary arg 2';
  my $lvl2 = shift || die 'necessary arg 3';
  my $last = shift || die 'necessary arg 4';

  if( ! defined $hashref->{$lvl1} ){
    $hashref->{$lvl1} = {};
  }
  if( ! defined $hashref->{$lvl1}{$lvl2} ){
    $hashref->{$lvl1}{$lvl2} = {};
  }
  $hashref->{$lvl1}{$lvl2}{$last} = 1;

  return $hashref;
}

=item new

TODO

Take a JSON blob and turn it into a usable graphy thing.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  my $jstr = shift || die "need an incoming argument";

  ## Get the perl object.
  $self->{ACG_RAW_OBJ} = $self->_read_json_string($jstr);


  ## Unwind our perl object into a couple of lookups and the actual
  ## engine graph.
  $self->{ACG_NODES} = {};
  $self->{ACG_EDGE_SOP} = {};
  $self->{ACG_EDGE_OSP} = {};
  $self->{ACG_EDGE_PSO} = {};
  $self->{ACG_EDGE_POS} = {};
  $self->{ACG_GRAPH} = Graph::Directed->new();
  foreach my $node (@{$self->{ACG_RAW_OBJ}{'nodes'}}){
    my $acc = $node->{'id'};
    $self->{ACG_NODES}{$acc} = $node;
    $self->{ACG_GRAPH}->add_vertex($acc);
  }
  foreach my $edge (@{$self->{ACG_RAW_OBJ}{'edges'}}){
    my $sid = $edge->{'subject_id'};
    my $oid = $edge->{'object_id'};
    my $pid = $edge->{'predicate_id'};

    ## Add simple graph edge.
    $self->{ACG_GRAPH}->add_edge($sid, $oid);

    ## Add the usual lookup triplets.
    ## SO
    $self->{ACG_EDGE_SOP} = _cram_hash($self->{ACG_EDGE_SOP}, $sid, $oid, $pid);
    $self->{ACG_EDGE_PSO} = _cram_hash($self->{ACG_EDGE_PSO}, $pid, $sid, $oid);
    ## OS
    $self->{ACG_EDGE_OSP} = _cram_hash($self->{ACG_EDGE_OSP}, $oid, $sid, $pid);
    $self->{ACG_EDGE_POS} = _cram_hash($self->{ACG_EDGE_POS}, $pid, $oid, $sid);
  }

  ## A little lite calculation on what we got out of the graph.
  # $self->kvetch('sinks: ' . join(', ', $self->{ACG_GRAPH}->sink_vertices()));
  # $self->kvetch('sources: ' .
  # 		join(', ', $self->{ACG_GRAPH}->source_vertices()));
  $self->{ACG_ROOTS} = {};
  $self->{ACG_LEAVES} = {};
  foreach my $root ($self->{ACG_GRAPH}->sink_vertices()){
    $self->{ACG_ROOTS}{$root} = $root;
  }
  foreach my $leaf ($self->{ACG_GRAPH}->source_vertices()){
    $self->{ACG_LEAVES}{$leaf} = $leaf;
  }

  bless $self, $class;
  return $self;
}


## Internal convenience function.
## From Chris: "{-,+} reg < reg < {part_of,has_part} < is_a"
sub _relation_weight {

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


=item get_roots

Returns the root nodes as string href.

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

Boolean on acc string.

=cut
sub is_root_p {
  my $self = shift;
  my $acc = shift || die 'need arg';

  ##
  my $retval = 0;
  #$self->kvetch('_root_p_acc_: ' . $acc);
  #print('IN: ' . $acc . "\n");
  if( defined $self->{ACG_ROOTS}{$acc} ){
    $retval = 1;
  }
  #$self->kvetch('_root_p_ret_: ' . $retval);
  return $retval;
}


=item is_leaf_p

Boolean on acc string.

=cut
sub is_leaf_p {
  my $self = shift;
  my $thing = shift || '';

  ##
  my $retval = 0;
  my $acc = $thing;
  if( defined $self->{ACG_LEAVES}{$acc} ){
    $retval = 1;
  }
  return $retval;
}


=item get_children

In: acc string or aref of acc strings.
Out: Children term list ref.

=cut
sub get_children {

  my $self = shift;
  my $things = shift || [];
  if( ref($things) ne 'ARRAY' ){
    $things = [$things];
  }

  ## Get the children for each incoming acc.
  ## Dedupe using a hash in the process.
  my $ret_hash = {};
  foreach my $thing (@$things){
    my @children = $self->{ACG_GRAPH}->predecessors($thing);
    foreach my $kid (@children){
      $ret_hash->{$kid} = 1;
    }
  }

  ## Unfold the dedupe hash into an aref.
  my $ret = [];
  foreach my $deduped_acc (keys %$ret_hash){
    push @$ret, $deduped_acc;
  }

  return $ret;
}


=item get_parents

In: acc string or aref of acc strings.
Out: Parent term acc list ref.

=cut
sub get_parents {

  my $self = shift;
  my $things = shift || [];
  if( ref($things) ne 'ARRAY' ){
    $things = [$things];
  }

  ## Get the parents for each incoming acc.
  ## Dedupe using a hash in the process.
  my $ret_hash = {};
  foreach my $thing (@$things){
    my @parents = $self->{ACG_GRAPH}->successors($thing);
    foreach my $par (@parents){
      $ret_hash->{$par} = 1;
    }
  }

  ## Unfold the dedupe hash into an aref.
  my $ret = [];
  foreach my $deduped_acc (keys %$ret_hash){
    push @$ret, $deduped_acc;
  }

  return $ret;
}


# =item get_relationship

# In: term acc, term acc.
# Out: String.

# =cut
# sub get_relationship {

#   my $self = shift;
#   my $obj_thing = shift || '';
#   my $sub_thing= shift || '';
#   my $obj_acc = $obj_thing;
#   my $sub_acc = $sub_thing;

#   ## 
#   my $all = $self->{GRAPH_PATH}->get_all_results({'object.acc' => $obj_acc,
#   						  'subject.acc' => $sub_acc});

#   ## Should be just one.
#   my $ret = undef;
#   foreach my $gp (@$all){
#     $ret = $gp->relationship->name;
#     last;
#   }

#   return $ret;
# }


=item get_child_relationships

Takes a term acc string.
Essentially, get child edges.
Gets something like:
 [{'subject_id' => 'X', 'object_id' => 'Y', 'predicate_id' => 'Z'}, ...]

=cut
sub get_child_relationships {

  my $self = shift;
  my $oid = shift || die 'gotta define whose relationship';

  my $ret = [];

  ## First, get children, right?
  foreach my $kid (@{$self->get_children($oid)}){

    # BUG/TODO; need unit test for this graph stuff--will be insane otherwise
    ## Now that we have subject and object, we can pull the relationships.
    if( defined $self->{ACG_EDGE_SOP} &&
	defined $self->{ACG_EDGE_SOP}{$kid} &&
	defined $self->{ACG_EDGE_SOP}{$kid}{$oid} ){

      foreach my $rel (keys %{$self->{ACG_EDGE_SOP}{$kid}{$oid}}){
	my $sub_name = $self->{ACG_NODES}{$kid}{label} || $kid;
	push @$ret,
	  {
	   'subject_id' => $kid,
	   'object_id' => $oid,
	   'predicate_id' => $rel,
	  };
      }
    }
  }

  return $ret;
}


# =item get_parent_relationships

# Takes a term or acc string.
# Gets the term2term links from a term.

# =cut
# sub get_parent_relationships {

#   my $self = shift;
#   my $term = shift || undef;
#   my $term_accs = $term;

#   return
#     $self->{GRAPH_Q}->get_all_results({'graph_subject.acc' => $term_accs,
# 				       'graph_path.distance' => 1});
# }


=item collect

Collect various bits of graph information to help with rendering.

This returns an array of five things:
   (\%nodes, \%edges, \%tc_desc, \%tc_anc, \%tc_depth);
   *) a hashref of term accs to term info hashes
   *) an empty href
   *) a hashref of of nodes in terms of in-graph descendants
   *) a hashref of of nodes in terms of in-graph ancestors
   *) a hashref of of nodes in terms of in-graph "depth"

=cut
sub collect {

  my $self = shift;
  my $in_things = shift || [];

  ## Whatever it is, arrayify it.
  if( ref $in_things ne 'ARRAY' ){
    $in_things = [$in_things];
  }

  ## Calculate the transitive closure to help with figuring out the
  ## association transitivity in other components.
  my $tc_graph = Graph::TransitiveClosure->new($self->{ACG_GRAPH},
					       reflexive => 0,
					       path_length => 1);
  my %tc_desc = ();
  my %tc_anc = ();

  ## Iterate through the combinations making the anc and desc hashes.
  foreach my $obj (keys %{$self->{ACG_NODES}}){

    $tc_desc{$obj} = {} if ! defined $tc_desc{$obj};
    $tc_anc{$obj} = {} if ! defined $tc_anc{$obj};

    foreach my $sub (keys %{$self->{ACG_NODES}}){

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
  my %tc_depth = ();
  foreach my $sub (keys %{$self->{ACG_NODES}}){
    foreach my $root (keys %{$self->{ACG_ROOTS}}){
      my $len = $tc_graph->path_length($sub, $root);
      if( defined $len ){
	$tc_depth{$sub} = $len;
	# $self->kvetch('depth of ' . $sub . ' is ' . $len);
      }
    }
  }

  return ($self->{ACG_NODES}, {}, \%tc_desc, \%tc_anc, \%tc_depth);
}


=item lineage

BUG/TODO: clearly differentiate collect and lineage.

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

  my $sub_accs = $sub_thing;
  #$self->kvetch('sub_accs: ' . Dumper($sub_accs));

  ## Items to return.
  my $nodes = {};
  my $node_depth = {};
  my $node_rel = {};
  my $node_rel_inf = {};
  my $max_depth = 0;

  ## Things that we need to ask the database about.
  my $all = $self->{GRAPH_PATH}->get_all_results({'subject.acc' => $sub_accs});
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
	  $self->_relation_weight($node_rel->{$gp->object->acc}, 1000);
	my $test_scale =
	  $self->_relation_weight($gp->relationship_type->acc, 1000);
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



1;
