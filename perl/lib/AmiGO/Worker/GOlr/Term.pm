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
	 name => $found_doc->{label},
	 #ontology_readable => $self->{A_AID}->readable($found_doc->{source}),
	 ontology_readable => $found_doc->{source},
	 ontology => $found_doc->{source},
	 term_link =>
	 $self->get_interlink({mode=>'term-details',
			       arg=>{acc=>$found_doc->{id}}}),
	 definition => $found_doc->{description},
	 comment => $found_doc->{comment},
	 ## TODO/BUG: everything below here.
	 #obsolete_p => $term->is_obsolete || 0, # TODO: get this into schema?
	 is_obsolete => $found_doc->{is_obsolete} || 'false',
	 subsets => $found_doc->{subset} || [],
	 alternate_ids => $found_doc->{alternate_id} || [],
	 synonyms => $found_doc->{synonym} || [],
	 #dbxrefs => [],
	 term_dbxrefs => $found_doc->{definition_xref} || [],
	 graph => $found_doc->{graph},
	 lineage_graph => $found_doc->{lineage_graph},
	};
    }
    $self->{AWGT_INFO}{$arg} = $intermediate;
  }

  ## Places to put the graphs I'll possibly create.
  $self->{AWGT_GRAPH} = {};

  bless $self, $class;
  return $self;
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

Args: term acc string of term we already info about
Returns: hash containing various term infomation, keyed by (int) order

=cut
sub get_child_info_for {

  my $self = shift;
  my $arg = shift || die "need an argument";

  ## Check input.
  die "not a defined argument" if ! defined $self->{AWGT_INFO}{$arg};

  ## Pull out some of the graph stuff for operation. Try and only do
  ## it once.
  my $cgraph = undef;
  my $json_graph_str = $self->{AWGT_INFO}{$arg}{'graph'};
  my $json_lineage_graph_str = $self->{AWGT_INFO}{$arg}{'lineage_graph'};
  if( ! defined $json_graph_str || ! $json_graph_str ||
      ! defined $json_lineage_graph_str || ! $json_lineage_graph_str ){
    $self->{CORE}->kvetch('could find no complete graph information!');
  }elsif( ! defined $self->{AWGT_GRAPH}{$arg} ){
    ## Store, and make it easier to get to next time.
    $self->{AWGT_GRAPH}{$arg} =
      AmiGO::ChewableGraph->new($arg, $json_graph_str, $json_lineage_graph_str);
    $cgraph = $self->{AWGT_GRAPH}{$arg};
  }

  ###
  ### Get neighborhood below term.
  ###

  ## We're capable of getting multiple child relations from the
  ## graph_path table, so we are going to filter for the "strongest"
  ## one and use that as the single representative child.
  my $the_single_child = {};
  my $child_rels = $self->{AW_TG}->get_child_relationships($arg);
  #$self->kvetch('_a_: ' . $child_rels);
  #$self->kvetch('_b_: ' . scalar(@$child_rels));
  foreach my $child_rel (@$child_rels){

    my $rel = $child_rel->relationship; #->name;
    my $sub = $child_rel->subject;

    #my $rel_name = $rel->name;
    my $rel_acc = $rel->acc;
    my $sub_acc = $sub->acc;
    my $sub_name = $sub->name;

    # $self->kvetch('_c.r_: ' . $rel_acc);
    # $self->kvetch('_c.s_: ' . $sub_acc);
    # $self->kvetch('_c.n_: ' . $sub_name);

    my $add_it_p = 1;

    ## If the item is already in, check weight.
    if( defined $the_single_child->{$sub_acc} ){
      if( $self->{AW_TG}->relation_weight($rel_acc, 1000) <
	  $self->{AW_TG}->relation_weight($the_single_child->{$sub_acc}{rel},
					  1000) ){
	$add_it_p = 0;
      }
    }

    ## If it passed that above tests, add it.
    if( $add_it_p ){

      $the_single_child->{$sub_acc} =
	{
	 acc => $sub_acc,
	 name => $sub_name,
	 rel => $rel_acc,
	 link => $self->get_interlink({mode => 'term_details',
				       arg => {acc => $sub_acc},
				      }),
	 #optional => {frag => 'lineage'}}),
	};
    }
  }

  ## Unwind hash key for gpc info list and child chunks.
  my $child_chunks = [];
  foreach my $sub_acc (keys %$the_single_child){
    #push @$acc_list_for_gpc_info, $sub_acc;
    push @$child_chunks, $the_single_child->{$sub_acc};
  }

  ## Name ordering.
  my @sorted_child_chunks = sort {
    lc($a->{name}) cmp lc($b->{name})
  } @$child_chunks;


  return \@sorted_child_chunks;
}


# =item get_ancestor_info

# Args: term acc string or arrayref of term acc strings.
#     : takes optional arg {reflexive => (0|1)}
# Returns: hash containing various term infomation, keyed by (string) type

# =cut
# sub get_ancestor_info {

#   my $self = shift;
#   my $arg = shift || die "need an argument";
#   my $opt_arg = shift || {};

#   my $is_reflexive_p = 0;
#   $is_reflexive_p = 1 if $opt_arg && $opt_arg->{reflexive};

#   ## Only array refs.
#   if( ref $arg ne 'ARRAY' ){ $arg = [$arg]; }

#   ###
#   ### Get neighborhood above term(s).
#   ###

#   $self->{AW_TG}->verbose(1);

#   #$self->kvetch("Start lineage arg: " . Dumper($arg));
#   my($lnodes, $lnode_rel, $lnode_rel_inf, $lnode_depth, $max_ldepth) =
#     $self->{AW_TG}->lineage($arg);
#   #$self->kvetch('lnodes: ' . Dumper($lnodes));
#   # $self->kvetch('lnode_rel: ' . Dumper($lnode_rel));
#   # $self->kvetch('lnode_depth: ' . Dumper($lnode_depth));
#   # $self->kvetch('max_depth: ' . Dumper($max_ldepth));
#   #$self->kvetch("Stop lineage");
#   #die;

#   ## Adjust if we want depth done to reflexive levels.
#   if( $is_reflexive_p ){
#     $max_ldepth += 1;
#   }

#   ## We'll want to know if later input is in the incoming arg list.
#   my %in_arg_list = map { $_ => 1 } @$arg;

#   ## Sort into buckets depending on reported depth.
#   my $acc_list_for_gpc_info = [];
#   my $nodes_by_depth = {};
#   # my $max_depth = 0;
#   foreach my $acc (keys %$lnodes){

#     ## Only continue if not self, don't want reflexive input.
#     #if( $acc ne $input_term_id ){
#     #$self->kvetch("looking at1: " . $acc);
#     if( ! $in_arg_list{$acc} || $is_reflexive_p ){

#       ## 
#       my $depth = $lnode_depth->{$acc};
#       $self->kvetch("looking at: " . $acc . ', depth: ' . $depth);
#       if( ! defined $nodes_by_depth->{$depth} ){
# 	$nodes_by_depth->{$depth} = [];
# 	$self->kvetch('made level: ' . $depth);
#       }

#       ## Add manufactured struct.
#       my $term = $lnodes->{$acc};
#       my $rel = $lnode_rel->{$acc};
#       my $inf = $lnode_rel_inf->{$acc};

#       ## Looks like it's not a member of this "reduced" graph.
#       if( ! defined $rel ){ $rel = 'fatal'; }

#       #$self->kvetch("_rel: " . $rel);
#       push @{$nodes_by_depth->{$depth}},
# 	{
# 	 acc => $acc,
# 	 inferred_p => $inf,
# 	 name => $term->name,
# 	 rel => $rel,
# 	 link => $self->get_interlink({
# 				       mode => 'term_details',
# 				       arg => {acc => $acc},
# 				      }),
# 	};
#       push @$acc_list_for_gpc_info, $acc;
#     }
#   }
#   #$self->kvetch("nodes_by_depth:\n" . Dumper($nodes_by_depth));
#   ##$self->kvetch("adepth:\n" . Dumper($adepth));
#   $self->kvetch("_max_depth: " . $max_ldepth);
#   my $nodes_sorted_by_depth = {};
#   for( my $depth = 0; $depth < $max_ldepth; $depth++ ){
#     #$self->kvetch("_depth: " . $depth);
#     if( defined $nodes_by_depth->{$depth} ){
#       my @blah = sort {
# 	lc($a->{name}) cmp lc($b->{name})
#       } @{$nodes_by_depth->{$depth}};
#       $nodes_sorted_by_depth->{$depth} = \@blah;
#     }
#     #$self->kvetch("nbd:\n" .Dumper($nodes_by_depth->{$depth}));
#     $self->kvetch("nsbd $depth:\n" .Dumper($nodes_sorted_by_depth->{$depth}));
#   }

#   ## Out.
#   return
#     {
#      'seen_acc_list' => $acc_list_for_gpc_info,
#      'max_depth' => $max_ldepth,
#      'max_displacement' => $max_ldepth + 2,
#      'parent_chunks_by_depth' => $nodes_sorted_by_depth,
#     };
# }



1;
