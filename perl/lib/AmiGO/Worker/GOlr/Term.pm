=head1 AmiGO::Worker::GOlr::Term

Generates consumable static information about ontology terms, and
backed by a GOlr document store. It should be similar in structure to
AmiGO::Worker::Term (which should be eventually removed).

This is not a search tool, but an efficient data retrieval tool.

=cut

package AmiGO::Worker::GOlr::Term;
use base ("AmiGO::Worker::GOlr");
use Data::Dumper;
use AmiGO::ChewableGraph;


=item new

Args: term acc string or arrayref of term acc strings.

=cut
sub new {

  my $class = shift;
  my $args = shift || die "need an argument";
  my $self = $class->SUPER::new();

  ## Default closure relation. Starting setup to deal with
  ## future of #620.
  my $default_closure_relation_set = 'regulates';
  #my $default_closure_relation_set = 'isa_partof';

  #$self->kvetch('searcher: ' . $self->{AEJS_GOLR_DOC});

  ## Only array refs internally.
  if( ref $args ne 'ARRAY' ){ $args = [$args]; }

  ## Basically, this is a retread of the operations performed in
  ## (deprecated) AmiGO::Aid::term_information, except now that the
  ## incoming data is so much easier to work with, we remove the extra
  ## layer of abstraction.
  $self->{AWGT_INFO} = {};
  foreach my $arg (@$args){
    my $found_doc = $self->{AEJS_GOLR_DOC}->get_by_id($arg);

    #$self->kvetch('$found_doc: ' . Dumper($found_doc));

    my $intermediate = undef;
    if( $found_doc ){
      $intermediate =
	{
	 acc => $found_doc->{id},
	 name => $found_doc->{annotation_class_label},
	 #ontology_readable => $self->{A_AID}->readable($found_doc->{source}),
	 ontology_readable => $found_doc->{source},
	 ontology => $found_doc->{source},
	 idspace => $found_doc->{idspace},
	 term_link =>
	 $self->get_interlink({mode=>'term_details',
			       arg=>{acc=>$found_doc->{id}}}),
	 definition => $found_doc->{description},
	 comment => $found_doc->{comment},
	 ## TODO/BUG: everything below here.
	 #obsolete_p => $term->is_obsolete || 0, # TODO: get this into schema?
	 is_obsolete => $found_doc->{is_obsolete} || 'false',
	 subsets => $found_doc->{subset} || [],
	 alternate_ids => $found_doc->{alternate_id} || [],
	 consider_info =>
	 $self->_term_accs_to_info($found_doc->{consider}),
	 replaced_by_info =>
	 $self->_term_accs_to_info($found_doc->{replaced_by}),
	 synonyms => $found_doc->{synonym} || [],
	 #dbxrefs => [],
	 term_dbxrefs => $found_doc->{definition_xref} || [],
	 dbxrefs => $found_doc->{database_xref} || [],
	 topology_graph_json => $found_doc->{topology_graph_json},
	 regulates_transitivity_graph_json =>
	 $found_doc->{regulates_transitivity_graph_json},
	 isa_partof_transitivity_graph_json =>
	 $found_doc->{isa_partof_transitivity_graph_json},
	 neighborhood_graph_json =>
	 $found_doc->{neighborhood_graph_json},
	 neighborhood_limited_graph_json =>
	 $found_doc->{neighborhood_limited_graph_json},

	 ## Convert the dbxrefs into something usable/linkable.
	 term_dbxref_links =>
	 $self->database_link_set($found_doc->{definition_xref}),
	 dbxref_links =>
	 $self->database_link_set($found_doc->{database_xref}),

	 ## A secondary data structure.
	 chewable_graph =>
	 AmiGO::ChewableGraph->new($found_doc->{id},
				   $found_doc->{topology_graph_json},
				   $found_doc->{$default_closure_relation_set .
						'_transitivity_graph_json'}),
	 chewable_neighborhood_graph =>
	 AmiGO::ChewableGraph->new($found_doc->{id},
				   $found_doc->{neighborhood_graph_json} || '{}',
				   $found_doc->{neighborhood_graph_json} || '{}'),
	};
    }
    $self->{AWGT_INFO}{$arg} = $intermediate;
  }

  bless $self, $class;
  return $self;
}


## Helper to convert term ACCs to links.
sub _term_accs_to_info {
  my $self = shift;
  my $accs = shift || [];
  my $retlist = [];

  foreach my $acc (@$accs){
    push @$retlist,
      {
       acc => $acc,
       link => $self->get_interlink({mode=>'term_details',
				     arg=>{acc=>$acc}})
      };
  }

  return $retlist;
}


=item get_info

Args: n/a
Returns: hash ref containing various bits of term information, keyed by acc.

=cut
sub get_info {

  my $self = shift;
  return $self->{AWGT_INFO};
}


=item get_child_info_for

Args: term acc string of term we already got info for
Returns: hash containing various term information, keyed by (int) order

=cut
sub get_child_info_for {

  my $self = shift;
  my $arg = shift || die "need an argument";

  ## First see if this is one that we can actually use.
  my $cgraph = $self->{AWGT_INFO}{$arg}{chewable_graph}
    || die 'not searched for document';

  ###
  ### Get nodes below term.
  ###

  ## Go through the relationships and find the most representative.
  my $the_single_representative_child = {};
  my $child_rels = $cgraph->get_child_relationships($arg);
  #$self->kvetch('_a_: ' . $child_rels);
  #$self->kvetch('_b_: ' . scalar(@$child_rels));
  foreach my $child_rel (@$child_rels){

    my $rel_acc = $child_rel->{pred};
    my $sub_acc = $child_rel->{sub};

    ## Spaces to underscore.
    $rel_acc =~ s/ /_/;

    ## A little wiggle to get the label.
    my $sub_label = $cgraph->node_label($sub_acc);
    $the_single_representative_child->{$sub_acc} =
      {
       acc => $sub_acc,
       name => $sub_label,
       rel => $rel_acc,
       link => $self->get_interlink({mode => 'term_details',
				     arg => {acc => $sub_acc},
				    }),
      };
  }

  ## Unwind hash key for gpc info list and child chunks.
  my $child_chunks = [];
  foreach my $sub_acc (keys %$the_single_representative_child){
    #push @$acc_list_for_gpc_info, $sub_acc;
    push @$child_chunks, $the_single_representative_child->{$sub_acc};
  }

  ## Name ordering.
  my @sorted_child_chunks = sort {
    lc($a->{name}) cmp lc($b->{name})
  } @$child_chunks;

  return \@sorted_child_chunks;
}


=item get_ancestor_info

Args: term acc string or arrayref of term acc strings.
    : takes optional arg {reflexive => (0|1)}
Returns: hash containing various term information, keyed by (string) type

=cut
sub get_ancestor_info {

  my $self = shift;
  my $arg = shift || die "need an argument";
  my $opt_arg = shift || {};

  ## First see if this is one that we can actually use.
  my $cgraph = $self->{AWGT_INFO}{$arg}{chewable_graph}
    || die 'not searched for document';

  my $is_reflexive_p = 0;
  $is_reflexive_p = 1 if $opt_arg && $opt_arg->{reflexive};

  # ## Only array refs.
  # if( ref $arg ne 'ARRAY' ){ $arg = [$arg]; }

  ###
  ### Get transitive nodes above term(s).
  ###

  #$self->{AW_TG}->verbose(1);

  #$self->kvetch("Start lineage arg: " . Dumper($arg));
  #$self->kvetch("Start lineage");
  my($lnodes, $lnode_rel, $lnode_rel_inf, $lnode_depth, $max_ldepth) =
    $cgraph->lineage_info($arg);
  # $self->kvetch('lnodes: ' . Dumper($lnodes));
  # $self->kvetch('lnode_rel: ' . Dumper($lnode_rel));
  # $self->kvetch('lnode_depth: ' . Dumper($lnode_depth));
  # $self->kvetch('max_depth: ' . Dumper($max_ldepth));
  #$self->kvetch("Stop lineage");
  #die;

  ## Adjust if we want depth done to reflexive levels.
  if( $is_reflexive_p ){
    $max_ldepth += 1;
  }

  ## We'll want to know if later input is in the incoming arg list.
  my %in_arg_list = map { $_ => 1 } @$arg;

  ## Sort into buckets depending on reported depth.
  my $acc_list_for_gpc_info = [];
  my $nodes_by_depth = {};
  # my $max_depth = 0;
  foreach my $acc (keys %$lnodes){

    ## Only continue if not self, don't want reflexive input.
    #if( $acc ne $input_term_id ){
    #$self->kvetch("looking at1: " . $acc);
    if( ! $in_arg_list{$acc} || $is_reflexive_p ){

      ##
      my $depth = $lnode_depth->{$acc};
      # $self->kvetch("looking at: " . $acc . ', depth: ' . $depth);
      if( ! defined $nodes_by_depth->{$depth} ){
	$nodes_by_depth->{$depth} = [];
	$self->kvetch('made level: ' . $depth);
      }

      ## Add manufactured struct.
      my $term = $lnodes->{$acc};
      my $rel = $lnode_rel->{$acc};
      my $inf = $lnode_rel_inf->{$acc};

      ## Looks like it's not a member of this "reduced" graph.
      if( ! defined $rel ){
	#$rel = 'fatal';
	## It's definitely "related to", but somehow it barfed.
	## Generic fall-through.
	## ---
	## BUG/TODO: This is the temporary workaround for
	## incomplete transitivity graphs in some cases:
	## https://github.com/kltm/bbop-js/wiki/TransitivityGraph#troubleshooting-caveats-and-fail-modes
	$rel = 'related_to';
      }

      ## Spaces to underscore.
      $rel =~ s/ /_/;

      #$self->kvetch("_rel: " . $rel);
      push @{$nodes_by_depth->{$depth}},
	{
	 acc => $acc,
	 inferred_p => $inf,
	 name => $term->{label},
	 rel => $rel,
	 link => $self->get_interlink({
				       mode => 'term_details',
				       arg => {acc => $acc},
				      }),
	};
      push @$acc_list_for_gpc_info, $acc;
    }
  }
  #$self->kvetch("nodes_by_depth:\n" . Dumper($nodes_by_depth));
  ##$self->kvetch("adepth:\n" . Dumper($adepth));
  $self->kvetch("_max_depth: " . $max_ldepth);
  my $nodes_sorted_by_depth = {};
  for( my $depth = 0; $depth < $max_ldepth; $depth++ ){
    #$self->kvetch("_depth: " . $depth);
    if( defined $nodes_by_depth->{$depth} ){
      my @blah = sort {
	lc($a->{name}) cmp lc($b->{name})
      } @{$nodes_by_depth->{$depth}};
      $nodes_sorted_by_depth->{$depth} = \@blah;
    }
    #$self->kvetch("nbd:\n" .Dumper($nodes_by_depth->{$depth}));
    # $self->kvetch("nsbd $depth:\n" .Dumper($nodes_sorted_by_depth->{$depth}));
  }

  ## Out.
  return
    {
     'seen_acc_list' => $acc_list_for_gpc_info,
     'max_depth' => $max_ldepth,
     'max_displacement' => $max_ldepth + 2,
     'parent_chunks_by_depth' => $nodes_sorted_by_depth,
    };
}


=item get_neighborhood_info

Args: term acc string or arrayref of term acc strings.
Returns: hash containing various term information, keyed by (string) type

=cut
sub get_neighborhood_info {

  my $self = shift;
  my $arg = shift || die "need an argument";

  ## First see if this is one that we can actually use.
  my $cgraph = $self->{AWGT_INFO}{$arg}{chewable_neighborhood_graph}
    || die 'not searched for document';

  my $ret_parents = [];
  my $parents = $cgraph->get_parents($arg);
  foreach my $acc (@$parents){

    my $rel = $cgraph->get_direct_relationship($arg, $acc);
    if( ! defined $rel ){
      $rel = 'related_to';
    }
    $rel =~ s/ /_/;

    push @$ret_parents,
      {
       acc => $acc,
       name => $cgraph->node_label($acc) || $acc,
       rel => $rel,
       link => $self->get_interlink({
				     mode => 'term_details',
				     arg => {acc => $acc},
				    }),
      };
  }

  my $ret_kids = [];
  my $kids = $cgraph->get_children($arg);
  foreach my $acc (@$kids){

    my $rel = $cgraph->get_direct_relationship($acc, $arg);
    if( ! defined $rel ){
      $rel = 'related_to';
    }
    $rel =~ s/ /_/;

    push @$ret_kids,
      {
       acc => $acc,
       name => $cgraph->node_label($acc) || $acc,
       rel => $rel,
       link => $self->get_interlink({
				     mode => 'term_details',
				     arg => {acc => $acc},
				    }),
      };
  }

  ## Out.
  return
    {
     'parents' => $ret_parents,
     'children' => $ret_kids
    };
}



1;
