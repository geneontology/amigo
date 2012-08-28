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


## A helper function for when we're debugging...
sub _ll {
  # foreach my $arg (@_){
  #   if( ref($arg) eq 'ARRAY'){
  #     print("" . join(', ', @$arg) . "\n");
  #   }else{
  #     print("" . $arg . "\n");
  #   }
  # }
}


## Internal helper function for creating a commonly used hashref
## pattern for my graphs.
sub __deep_hash_placement {
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


## Internal helper function for creating Graph objects out of the
## hashes that we work with (owltools ShuntGraph JSON output).
sub __create_graph_structures {

  ## WARNING: I have to do this little dance with Graph::Directed here
  ## since it looks like the scalar context is overridden in their
  ## code to produce the graph for printing. However this deeply
  ## screws things up when you are argument testing and have passed an
  ## empty graph--the thing seems to be defined, but has zero content
  ## (and maybe it's getting treated as an empty string).
  my $inhashref = shift || die 'necessary arg (in hash)';
  my $mod_graph = shift;
  die 'necessary arg (self graph)' if ! defined $mod_graph;
  my $mod_hash = shift || die 'necessary arg (self hash)';

  ## Add the proper caching data structures.
  $mod_hash->{NODES} = {};
  $mod_hash->{EDGE_SOP} = {};
  $mod_hash->{EDGE_OSP} = {};
  $mod_hash->{EDGE_PSO} = {};
  $mod_hash->{EDGE_POS} = {};

  ## Cache nodes.
  foreach my $node (@{$inhashref->{'nodes'}}){
    my $acc = $node->{'id'};
    $mod_hash->{NODES}{$acc} = $node;
    $mod_graph->add_vertex($acc);
  }
  ## Get out edges and the like squared away.
  foreach my $edge (@{$inhashref->{'edges'}}){
    my $sid = $edge->{'subject_id'};
    my $oid = $edge->{'object_id'};
    my $pid = $edge->{'predicate_id'};

    ## Add the usual lookup triplets.
    ## SO
    $mod_hash->{EDGE_SOP} =
      __deep_hash_placement($mod_hash->{EDGE_SOP}, $sid, $oid, $pid);
    $mod_hash->{EDGE_PSO} =
      __deep_hash_placement($mod_hash->{EDGE_PSO}, $pid, $sid, $oid);
    ## OS
    $mod_hash->{EDGE_OSP} =
      __deep_hash_placement($mod_hash->{EDGE_OSP}, $oid, $sid, $pid);
    $mod_hash->{EDGE_POS} =
      __deep_hash_placement($mod_hash->{EDGE_POS}, $pid, $oid, $sid);

    ## Add to the fast graph.
    $mod_graph->add_edge($sid, $oid);
  }
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


=item new

TODO

Args: acc, JSON graph, JSON lineage graph

Take blobs and turn them into a usable graphy thing.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  my $acc_str = shift || die "need an incoming acc argument";
  my $jstr_topology_graph =
    shift || die "need an incoming graph argument";
  my $jstr_transitivity_graph =
    shift || die "need an incoming lineage graph argument";

  ## Unwind our perl object into a couple of lookups and the actual
  ## engine graph.
  $self->{ACG_ACC} = $acc_str;

  ## Opportunistically create these when necessary in functions that
  ## need them--see the helper function: _ensure_max_distance_info
  $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT} = undef;

  _ll('passed 1');

  ## Produce the topology graph and cache for easy operations.
  my $topology_graph_hash = $self->_read_json_string($jstr_topology_graph);
  $self->{ACG_TOPOLOGY_GRAPH} = Graph::Directed->new();
  $self->{ACG_TOPOLOGY} = {};

  # _ll('0: ' . $jstr_topology_graph);
  # _ll('1: ' . $topology_graph_hash);
  # print('1.5: ' .  $self->{ACG_TOPOLOGY_GRAPH} . "\n");
  # print('1.75: ' .  defined($self->{ACG_TOPOLOGY_GRAPH}) . "\n");
  # _ll('2: ' . $self->{ACG_TOPOLOGY_GRAPH});
  # _ll('3: ' . $self->{ACG_TOPOLOGY});

  __create_graph_structures($topology_graph_hash,
			    $self->{ACG_TOPOLOGY_GRAPH},
			    $self->{ACG_TOPOLOGY});

  ## Produce the topology graph and cache for easy operations.
  my $transitivity_graph_hash =
    $self->_read_json_string($jstr_transitivity_graph);
  $self->{ACG_TRANSITIVITY_GRAPH} = Graph::Directed->new();
  $self->{ACG_LINEAGE} = {};
  __create_graph_structures($transitivity_graph_hash,
			    $self->{ACG_TRANSITIVITY_GRAPH},
			    $self->{ACG_LINEAGE});

  # ## A little extra lite calculation on what we got out of the graph.
  # # $self->kvetch('sinks: ' . join(', ',
  # #     $self->{ACG_TOPOLOGY_GRAPH}->sink_vertices()));
  # # $self->kvetch('sources: ' .
  # # 		join(', ', $self->{ACG_TOPOLOGY_GRAPH}->source_vertices()));
  # $self->{ACG_TOPOLOGY_ROOTS} = {};
  # $self->{ACG_TOPOLOGY_LEAVES} = {};
  # foreach my $root ($self->{ACG_TOPOLOGY_GRAPH}->sink_vertices()){
  #   $self->{ACG_TOPOLOGY_ROOTS}{$root} = $root;
  # }
  # foreach my $leaf ($self->{ACG_TOPOLOGY_GRAPH}->source_vertices()){
  #   $self->{ACG_TOPOLOGY_LEAVES}{$leaf} = $leaf;
  # }

  bless $self, $class;
  return $self;
}


=item get_roots

Returns the root nodes as string href.

=cut
sub get_roots {
  my $self = shift;

  ## We don't want to actually pass this thing...makes Continuity.pm
  ## cry.
  my $copy = {};
  foreach my $root ($self->{ACG_TOPOLOGY_GRAPH}->sink_vertices()){
    $copy->{$root} = $root;
  }

  return $copy;
}


=item get_leaves

Returns the leaf nodes as string href.

=cut
sub get_leaves {
  my $self = shift;

  ## We don't want to actually pass this thing...makes Continuity.pm
  ## cry.
  my $copy = {};
  foreach my $leaf ($self->{ACG_TOPOLOGY_GRAPH}->source_vertices()){
    $copy->{$leaf} = $leaf;
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
  my $roots = $self->get_roots();
  if( defined $roots->{$acc} ){
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
  my $acc = shift || die 'need arg';

  ##
  my $retval = 0;
  #$self->kvetch('_leaf_p_acc_: ' . $acc);
  #print('IN: ' . $acc . "\n");
  my $leaves = $self->get_leaves();
  if( defined $leaves->{$acc} ){
    $retval = 1;
  }
  #$self->kvetch('_leaf_p_ret_: ' . $retval);
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
    my @children = $self->{ACG_TOPOLOGY_GRAPH}->predecessors($thing);
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
    my @parents = $self->{ACG_TOPOLOGY_GRAPH}->successors($thing);
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


=item dominant_relationship

Given a bunch of relationships, return the one that is more
"dominant".

In: lists, whatever, of relationship ids
Out: relationship id or undef

=cut
sub dominant_relationship {

  my $self = shift;

  ## Collect all of the relations, unwinding as necessary.
  my $all_rels = [];
  foreach my $arg (@_){
    if( ref($arg) eq 'ARRAY' ){
      push @$all_rels, $self->dominant_relationship(@$arg);
    }else{
      push @$all_rels, $arg;
    }
  }

  my $ret = undef;

  ## Sort them according to _relation_weight.
  my @all_rels_sorted =
    sort { $self->_relation_weight($b) <=> $self->_relation_weight($a) }
      @$all_rels;

  ## Choose the top if it's there.
  if( scalar(@all_rels_sorted) ){
    $ret = $all_rels_sorted[0];
  }

  return $ret;
}


## A helper generic version of get_transitive_relationship and
## get_direct_relationship since they are just one hash differnt.
sub _get_generic_relationship {

  my $self = shift;
  my $hash_name = shift || die 'need to work against an engine hash!';
  my $first_arg = shift || die 'need at least one arg';
  my $second_arg = shift || undef;

  my $sub_acc = $self->{ACG_ACC};
  my $obj_acc = undef;

  ## Choose between the first and second forms.
  if( ! defined $second_arg ){
    ## One arg setup.
    $obj_acc = $first_arg;
  }else{
    ## Two arg setup.
    $sub_acc = $first_arg;
    $obj_acc = $second_arg;
    #die 'not yet implemented (in the data backend)'
  }

  my $ret = undef;

  ## Gather the relationships, then get the dominant one.
  my $all_preds = [];
  if( defined $self->{$hash_name}{EDGE_SOP} &&
      defined $self->{$hash_name}{EDGE_SOP}{$sub_acc} &&
      defined $self->{$hash_name}{EDGE_SOP}{$sub_acc}{$obj_acc} ){

    ## Allow the capture of multiple predicates along this edge.
    my $preds_href = $self->{$hash_name}{EDGE_SOP}{$sub_acc}{$obj_acc};
    foreach my $rel (keys %$preds_href){
      push @$all_preds, $rel;
    }
  }

  return $self->dominant_relationship($all_preds);
}


=item get_direct_relationship

Get the dominant /direct/ relationship between the central/target node
and another node in the graph (if extant).

If only one argument is given, it is considered to be relative to the
initial argument acc (i.e. the initial target acc is the subject
node). Case 1.

For case 2, the first argument is the subject and the second argument
is the object.

Remember that relationships are directed, so A->B does not imply that
B->A (see test cases).

In (1): term object acc.
In (2): term subject acc, term object acc. (WARNING: not yet implemented)
Out: String or undef

=cut
sub get_direct_relationship {
  my $self = shift;
  return $self->_get_generic_relationship('ACG_TOPOLOGY', @_);
}


=item get_transitive_relationship

Get the /dominant/ calculated relationship between the central/target
node and another node in the graph (if extant).

If only one argument is given, it is considered to be relative to the
initial argument acc (i.e. the initial target acc is the subject
node). Case 1.

Case 2 has not yet been implemented, but would be trivial with added
information to the GOlr transitive closure graph data (transitivity_graph).

In (1): term object acc.
In (2): term subject acc, term object acc. (WARNING: not yet implemented)
Out: String or undef

=cut
sub get_transitive_relationship {
  my $self = shift;
  return $self->_get_generic_relationship('ACG_LINEAGE', @_);
}


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

    ## Now that we have subject and object, we can pull the
    ## relationships.
    if( defined $self->{ACG_TOPOLOGY}{EDGE_SOP} &&
	defined $self->{ACG_TOPOLOGY}{EDGE_SOP}{$kid} &&
	defined $self->{ACG_TOPOLOGY}{EDGE_SOP}{$kid}{$oid} ){

      ## Allow the capture of multiple predicates along this edge.
      foreach my $rel (keys %{$self->{ACG_TOPOLOGY}{EDGE_SOP}{$kid}{$oid}}){
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


=item get_parent_relationships

Takes a term acc string.
Essentially, get parent edges.
Gets something like:
 [{'subject_id' => 'X', 'object_id' => 'Y', 'predicate_id' => 'Z'}, ...]

=cut
sub get_parent_relationships {

  my $self = shift;
  my $sid = shift || die 'gotta define whose relationship';

  my $ret = [];

  ## First, get parents, right?
  foreach my $par (@{$self->get_parents($sid)}){

    ## Now that we have subject and object, we can pull the
    ## relationships.
    if( defined $self->{ACG_TOPOLOGY}{EDGE_OSP} &&
	defined $self->{ACG_TOPOLOGY}{EDGE_OSP}{$par} &&
	defined $self->{ACG_TOPOLOGY}{EDGE_OSP}{$par}{$sid} ){

      ## Allow the capture of multiple predicates along this edge.
      foreach my $rel (keys %{$self->{ACG_TOPOLOGY}{EDGE_OSP}{$par}{$sid}}){
	push @$ret,
	  {
	   'object_id' => $par,
	   'subject_id' => $sid,
	   'predicate_id' => $rel,
	  };
      }
    }
  }

  return $ret;
}


## A helper function to fill out:
##  $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT} = undef;
## Since is caches results, it can be called whenever without penalty.
sub _ensure_max_distance_info {
  my $self = shift;

  ## Memoize.
  if( ! $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT} ){

    ## Run the actual climber with starting parameters.
    my $climb_counts = $self->_max_info_climber($self->{ACG_ACC});
    my $abs_max = 0;
    foreach my $c (values %$climb_counts){
      if( $c > $abs_max ){
	$abs_max = $c;
      }
    }

    ## Now that we have the absolute max, adjust the values for
    ## storage.
    foreach my $n (keys %$climb_counts){
      $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT}{$n} =
	$abs_max - $climb_counts->{$n};
    }
  }

  ## (Unecessary, but using for debugging; TODO: remove.)
  return $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT};
}


## Another helper function, this time for _ensure_max_distance_info.
## This is the actual path climbing agent.
sub _max_info_climber {
  my $self = shift;
  my $curr = shift || die 'need an incoming argument';

  ## We either initialize there (first run) or pull them in.
  my $curr_distance = shift || 0;
  my $max_hist = shift || {};
  my $encounter_hist = shift || {};

  ## Only recur if our encounter history sez that either this node
  ## is new or if we have a higher distance count (in which case we add
  ## it and continue on our merry way).
  if( ! defined $encounter_hist->{$curr} ){

    ## Note that we have encountered this node before.
    $encounter_hist->{$curr} = 1;

    ## Our first distance is the current one!
    $max_hist->{$curr} = $curr_distance;

    ## Increment our distance.
    $curr_distance++;

    ## 
    foreach my $p (@{$self->get_parents($curr)}){

      ## Since this is a new node encounter, let's see what else is
      ## out there to discover.
      $self->_max_info_climber($p, $curr_distance, $max_hist, $encounter_hist);
    }

  }elsif( $encounter_hist->{$curr} ){

    ## If we're seeing this node again, but with a separate history,
    ## we'll add the length or our history to the current, but will
    ## not recur in any case (we've been here before).
    if( $max_hist->{$curr} < $curr_distance ){
      $max_hist->{$curr} = $curr_distance;
    }
  }

  ## Return the collected histories.
  return $max_hist;
}


=item max_distance

Calculate the maximum distance of a node from the roots minus the
global maximum. This is /not/ depth, but rather a node specific
property that is mostly used for a certain type of graphical
layout. If you're not sure, this is likely not the function that you
want.

Arg: acc string
Return: int (if defined)

=cut
sub max_distance {
  my $self = shift;
  my $acc = shift || die 'need an arg';
  my $ret = undef;

  $self->_ensure_max_distance_info();
  if( defined $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT}{$acc} ){
    $ret = $self->{ACG_MAX_NODE_DISTANCE_FROM_ROOT}{$acc};
  }

  return $ret;
}

=item node_label

Arg: acc string
Return: string (if defined)

=cut
sub node_label {
  my $self = shift;
  my $acc = shift || die 'need an arg';
  my $ret = undef;

  if( defined $self->{ACG_TOPOLOGY}{NODES}{$acc} &&
      defined $self->{ACG_TOPOLOGY}{NODES}{$acc}{label} ){
    $ret = $self->{ACG_TOPOLOGY}{NODES}{$acc}{label};
  }

  return $ret;
}

=item lineage_info

Get information concerning the transitive position of this node in the
graph (as opposed to the immediate relations of all ancestors that is
provided by climb).

Not quite get ancestors, as we're getting distance and inference
info as well.

This function assumes that the initial target node is the subject.
Potentially, this could trivially be extended to any node that had the
transitive relations calculated in transitivity_graph.

This returns an array of five things:
 *) a hashref of node/object ids to light data structures about those nodes
 *) a hashref of node/object ids to their dominant relation
 *) a hashref of node/object ids to whether or not their dominant relation is
    inferred
 *) a hashref of node/object ids to the calculated layout distance from root(s)
 *) a scalar of the max layout distance found

Yes, an odd an inefficient bunch, but supported for the time being for
historical reasons of driving as much of the AmiGO 1.x code as
possible.

Given how thin this wrapper is, it may just be easier to do away with
this function all together at some point...

=cut
sub lineage_info {

  my $self = shift;

  ## See the doc above; but for now we'll just use our internal target.
  #my $sub_acc = shift || die 'need an arg';
  my $sub_acc = $self->{ACG_ACC};

  ## Keep an eye on these: they are the items we return.
  my $nodes = {};
  my $node_rel = {};
  my $node_rel_inf_p = {};
  my $node_distance = {};
  my $max_distance = 0;

  ## 1) Process $nodes.
  ## Copy them out.
  foreach my $obj_acc (keys %{$self->{ACG_TOPOLOGY}{NODES}}){

    ## Let's skip talking about ourselves and our children.
    my $ignorables = {};
    $ignorables->{$sub_acc} = 1;
    my $iks = $self->get_children('GO:0003334');
    foreach my $ks (@$iks){
      $ignorables->{$ks} = 1;
    }
    if( ! defined $ignorables->{$obj_acc} ){

      ## 1) Process $nodes.
      $nodes->{$obj_acc} =
	{
	 id => $self->{ACG_TOPOLOGY}{NODES}{$obj_acc}{id},
	 label => $self->node_label($obj_acc),
	 #link => 'http://localhost#TODO',
	};

      ## 2) Process $node_rel.
      $node_rel->{$obj_acc} = $self->get_transitive_relationship($obj_acc);

      ## 3) Process $node_rel_inf_p.
      $node_rel_inf_p->{$obj_acc} = 1;
      if( defined $self->get_direct_relationship($obj_acc) &&
	  ($self->get_direct_relationship($obj_acc) eq
	   $self->get_transitive_relationship($obj_acc) ) ){
	$node_rel_inf_p->{$obj_acc} = 0;
      }

      ## 4) Process $node_distance.
      $node_distance->{$obj_acc} = $self->max_distance($obj_acc);
    }
  }

  ## 5) Process $max_distance.
  $max_distance = $self->max_distance($sub_acc); # already done!

  return ($nodes, $node_rel, $node_rel_inf_p, $node_distance, $max_distance);
}


# =item collect

# Collect various bits of graph information to help with rendering.
# Also see "lineage".

# This returns an array of five things:
#    (\%nodes, \%edges, \%tc_desc, \%tc_anc, \%tc_distance);
#    *) a hashref of term accs to term info hashes
#    *) an empty href
#    *) a hashref of of nodes in terms of in-graph descendants
#    *) a hashref of of nodes in terms of in-graph ancestors
#    *) a hashref of of nodes in terms of in-graph "distance"

# =cut
# sub collect {

#   my $self = shift;
#   my $in_things = shift || [];

#   ## Whatever it is, arrayify it.
#   if( ref $in_things ne 'ARRAY' ){
#     $in_things = [$in_things];
#   }

#   ## Calculate the transitive closure to help with figuring out the
#   ## association transitivity in other components.
#   my $tc_graph = Graph::TransitiveClosure->new($self->{ACG_TOPOLOGY_GRAPH},
# 					       reflexive => 0,
# 					       path_length => 1);
#   my %tc_desc = ();
#   my %tc_anc = ();

#   ## Iterate through the combinations making the anc and desc hashes.
#   foreach my $obj (keys %{$self->{ACG_TOPOLOGY_NODES}}){

#     $tc_desc{$obj} = {} if ! defined $tc_desc{$obj};
#     $tc_anc{$obj} = {} if ! defined $tc_anc{$obj};

#     foreach my $sub (keys %{$self->{ACG_TOPOLOGY_NODES}}){

#       if( $tc_graph->is_reachable($obj, $sub) ){
# 	$tc_anc{$obj}{$sub} = 1;
#       }
#       if( $tc_graph->is_reachable($sub, $obj) ){
# 	$tc_desc{$obj}{$sub} = 1;
#       }
#     }
#   }

#   ## Down here, we're doing something separate--we're going to get
#   ## the distance of the node.
#   my %tc_distance = ();
#   foreach my $sub (keys %{$self->{ACG_TOPOLOGY_NODES}}){
#     foreach my $root (keys %{$self->{ACG_TOPOLOGY_ROOTS}}){
#       my $len = $tc_graph->path_length($sub, $root);
#       if( defined $len ){
# 	$tc_distance{$sub} = $len;
# 	# $self->kvetch('distance of ' . $sub . ' is ' . $len);
#       }
#     }
#   }

#  return ($self->{ACG_TOPOLOGY_NODES}, {}, \%tc_desc, \%tc_anc, \%tc_distance);
# }



1;
