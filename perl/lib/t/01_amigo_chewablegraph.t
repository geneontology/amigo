use strict;
use Test::More 'no_plan';
use Data::Dumper;

use AmiGO::ChewableGraph;

my $json_graph_string = '{"nodes":[{"id":"GO:0009987","label":"cellular process"},{"id":"GO:0048468","label":"cell development"},{"id":"GO:0048869","label":"cellular developmental process"},{"id":"GO:0048513","label":"organ development"},{"id":"GO:0007275","label":"multicellular organismal development"},{"id":"GO:0048731","label":"system development"},{"id":"GO:0030154","label":"cell differentiation"},{"id":"GO:0003335","label":"corneocyte development"},{"id":"GO:0048856","label":"anatomical structure development"},{"id":"GO:0003334","label":"keratinocyte development"},{"id":"GO:0008150","label":"biological_process"},{"id":"GO:0009913","label":"epidermal cell differentiation"},{"id":"GO:0030855","label":"epithelial cell differentiation"},{"id":"GO:0032502","label":"developmental process"},{"id":"GO:0032501","label":"multicellular organismal process"},{"id":"GO:0002064","label":"epithelial cell development"},{"id":"GO:0008544","label":"epidermis development"},{"id":"GO:0030216","label":"keratinocyte differentiation"},{"id":"GO:0009888","label":"tissue development"},{"id":"GO:0060429","label":"epithelium development"}],"edges":[{"subject_id":"GO:0002064","object_id":"GO:0030855","predicate_id":"part_of"},{"subject_id":"GO:0048513","object_id":"GO:0048731","predicate_id":"part_of"},{"subject_id":"GO:0048731","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0009913","object_id":"GO:0030154","predicate_id":"is_a"},{"subject_id":"GO:0030216","object_id":"GO:0009913","predicate_id":"is_a"},{"subject_id":"GO:0048869","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0048869","predicate_id":"is_a"},{"subject_id":"GO:0048513","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0003335","object_id":"GO:0003334","predicate_id":"part_of"},{"subject_id":"GO:0030216","object_id":"GO:0030855","predicate_id":"is_a"},{"subject_id":"GO:0030855","object_id":"GO:0030154","predicate_id":"is_a"},{"subject_id":"GO:0009913","object_id":"GO:0008544","predicate_id":"part_of"},{"subject_id":"GO:0048731","object_id":"GO:0007275","predicate_id":"part_of"},{"subject_id":"GO:0008544","object_id":"GO:0048513","predicate_id":"part_of"},{"subject_id":"GO:0030855","object_id":"GO:0060429","predicate_id":"part_of"},{"subject_id":"GO:0009888","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0002064","object_id":"GO:0048468","predicate_id":"is_a"},{"subject_id":"GO:0032501","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0032502","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0060429","object_id":"GO:0009888","predicate_id":"is_a"},{"subject_id":"GO:0007275","object_id":"GO:0032501","predicate_id":"is_a"},{"subject_id":"GO:0048869","object_id":"GO:0009987","predicate_id":"is_a"},{"subject_id":"GO:0048856","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0007275","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0030154","predicate_id":"part_of"},{"subject_id":"GO:0009987","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0008544","object_id":"GO:0009888","predicate_id":"is_a"},{"subject_id":"GO:0030154","object_id":"GO:0048869","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0030216","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0002064","predicate_id":"is_a"}]}';

my $cgraph = AmiGO::ChewableGraph->new($json_graph_string);

ok( defined($cgraph), "is defined");

## Check roots.
my $roots = $cgraph->get_roots();
is(scalar(keys %$roots), 1, "got the one root");
my @rkeys = keys %$roots;
print('foo: ' . $rkeys[0]. "\n");
print('bar: ' . $roots->{$rkeys[0]} . "\n");
print('bib: ' . $cgraph->is_root_p($roots->{$rkeys[0]}) . "\n");
ok($cgraph->is_root_p($roots->{$rkeys[0]}), "definitely is a root");

# ## Check kids.
# my $numk1 = $g->get_children("GO:0022008");
# ok( scalar(@$numk1) eq 5, "GO:0022008 has 5 kids");
# my $numk2 = $g->get_children(["GO:0016787"]);
# ok( scalar(@$numk2) eq 19, "GO:0016787 has 19 kids");
# my $numk3 = $g->get_children(["GO:0016787", "GO:0022008"]);
# ok( scalar(@$numk3) eq 24, "GO:0016787 and GO:0022008 have 24 kids");

#   ## Check kid rels.
#   my $numkr1 = $g->get_child_relationships("GO:0022008");
#   ok( scalar(@$numk1) eq 5, "GO:0022008 has 5 kid rels");
#   my $numkr2 = $g->get_child_relationships(["GO:0016787"]);
#   ok( scalar(@$numk2) eq 19, "GO:0016787 has 19 kid rels");
#   my $numkr3 = $g->get_child_relationships(["GO:0016787", "GO:0022008"]);
#   ok( scalar(@$numk3) eq 24, "GO:0016787 and GO:0022008 have 24 kid rels");

#   ## Get a couple lineage sets.
#   my($lnodes1, $lnode_rel1, $lnode_rel_inf1, $lnode_depth1, $max_ldepth1) =
#     $g->lineage('GO:0022008');
#   my($lnodes2, $lnode_rel2, $lnode_rel_inf2, $lnode_depth2, $max_ldepth2) =
#     $g->lineage(['GO:0007399']);
#   # $g->kvetch('lnode_depth1: ' . Dumper($lnode_depth1));
#   # $g->kvetch('lnode_depth2: ' . Dumper($lnode_depth2));

#   ## Get a list of depths for each term.
#   my $cache = {};
#   my $fold_in = sub {
#     my $inhash = shift || {};
#     foreach my $k (keys %$inhash){
#       if( ! $cache->{$k} ){ $cache->{$k} = []; }
#       push @{$cache->{$k}}, $inhash->{$k};
#     }
#   };
#   &$fold_in($lnode_depth1);
#   &$fold_in($lnode_depth2);
#   # $g->kvetch('folded: ' . Dumper($cache));

#   ## Examine lists of length two, and see who has the highest
#   ## collected depth.
#   my $sums = {};
#   foreach my $k (keys %$cache){
#     if( scalar(@{$cache->{$k}}) == 2 ){
#       $sums->{$k} = $cache->{$k}[0] + $cache->{$k}[1];
#     }
#   }
#   # $g->kvetch('sums: ' . Dumper($sums));

#   ## Sort according to accumulated depth.
#   my @done = sort { $sums->{$b} <=> $sums->{$a} } keys(%$sums);
#   # $g->kvetch('done: ' . Dumper(\@done));

#   ## Ancestor deepest sums.
#   ok( $done[0] eq 'GO:0007399', "GO:0007399 is accu highest");
#   ok( $done[1] eq 'GO:0048731', "GO:0048731 is accu next");
# }


