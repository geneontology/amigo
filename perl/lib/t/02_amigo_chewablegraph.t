####
#### Test case from issue: https://github.com/kltm/amigo/issues/68
####
#### Run like:
####  ~/local/src/git/amigo$:( perl -I ./perl/lib/ ./perl/lib/t/02_amigo_chewablegraph.t
####

use strict;
use Test::More 'no_plan';
use Data::Dumper;

use AmiGO::ChewableGraph;

## Centered on "positive regulation of action potential".
my $json_graph_target = 'GO:0045760';
my $json_trans_graph_string =
  '{"nodes":[{"id":"GO:0042391","lbl":"regulation of membrane potential"},{"id":"GO:0098900","lbl":"regulation of action potential"},{"id":"GO:0045760","lbl":"positive regulation of action potential"},{"id":"GO:0050789","lbl":"regulation of biological process"},{"id":"GO:0065007","lbl":"biological regulation"},{"id":"GO:0065008","lbl":"regulation of biological quality"},{"id":"GO:0001508","lbl":"action potential"},{"id":"GO:0048518","lbl":"positive regulation of biological process"},{"id":"GO:0008150","lbl":"biological_process"}],"edges":[{"sub":"GO:0045760","obj":"GO:0065007","pred":"regulates"},{"sub":"GO:0045760","obj":"GO:0042391","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0008150","pred":"regulates"},{"sub":"GO:0045760","obj":"GO:0001508","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0098900","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0001508","pred":"regulates"},{"sub":"GO:0045760","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0048518","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0065007","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0065008","pred":"regulates"},{"sub":"GO:0045760","obj":"GO:0050789","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0065007","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0065008","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0001508","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0008150","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0042391","pred":"regulates"}]}';

my $json_topo_graph_string =
  '{"nodes":[{"id":"GO:0042391","lbl":"regulation of membrane potential"},{"id":"GO:0098900","lbl":"regulation of action potential"},{"id":"GO:0045760","lbl":"positive regulation of action potential"},{"id":"GO:0050789","lbl":"regulation of biological process"},{"id":"GO:0065007","lbl":"biological regulation"},{"id":"GO:0065008","lbl":"regulation of biological quality"},{"id":"GO:0001508","lbl":"action potential"},{"id":"GO:0048518","lbl":"positive regulation of biological process"},{"id":"GO:0008150","lbl":"biological_process"}],"edges":[{"sub":"GO:0001508","obj":"GO:0042391","pred":"is_a"},{"sub":"GO:0065007","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0042391","obj":"GO:0065008","pred":"is_a"},{"sub":"GO:0065008","obj":"GO:0065007","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0098900","pred":"is_a"},{"sub":"GO:0045760","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0098900","obj":"GO:0001508","pred":"regulates"},{"sub":"GO:0050789","obj":"GO:0065007","pred":"is_a"},{"sub":"GO:0098900","obj":"GO:0050789","pred":"is_a"},{"sub":"GO:0048518","obj":"GO:0065007","pred":"is_a"},{"sub":"GO:0050789","obj":"GO:0008150","pred":"regulates"},{"sub":"GO:0045760","obj":"GO:0048518","pred":"is_a"},{"sub":"GO:0048518","obj":"GO:0050789","pred":"is_a"},{"sub":"GO:0048518","obj":"GO:0008150","pred":"positively_regulates"},{"sub":"GO:0045760","obj":"GO:0001508","pred":"positively_regulates"}]}';

## A helper function for when we're debugging...
sub _ll {
  foreach my $arg (@_){
    if( ref($arg) eq 'ARRAY'){
      print("" . join(', ', @$arg) . "\n");
    }else{
      print("" . $arg . "\n");
    }
  }
}

## Check base.
my $cgraph = AmiGO::ChewableGraph->new($json_graph_target,
				       $json_topo_graph_string,
				       $json_trans_graph_string);

ok( defined($cgraph), "is defined");

## Check roots--should just be GO:0008150
my $roots = $cgraph->get_roots();
is( scalar(keys %$roots), 1, "got the one root");
my @rkeys = keys %$roots;
my $rkey = $rkeys[0];
ok( $cgraph->is_root_p($rkey), "definitely is a root");
ok( $rkey eq 'GO:0008150', "GO:0008150 is root");
ok( ! $cgraph->is_root_p('GO:0065007'),
    "biological regulation definitely not a root");

## Check leaves--should just be GO:0045760.
my $leaves = $cgraph->get_leaves();
is( scalar(keys %$leaves), 1, "got the leaf");
my @lkeys = keys %$leaves;
my $lkey = $lkeys[0];
ok( $cgraph->is_leaf_p($lkey), "definitely is a leaf");
ok( $lkey eq 'GO:0045760', "GO:0045760 is the leaf");
ok( $cgraph->is_leaf_p('GO:0045760'), "definitely is a leaf");

## Try and see what is going wrong in our traversal.
# print STDOUT "A: " . $cgraph->max_distance('GO:0008150');
# print STDOUT "\nB: " . $cgraph->max_distance('GO:0065007');
# print STDOUT "\nB: " . $cgraph->max_distance('GO:0001508');
ok( $cgraph->max_distance('GO:0008150') < $cgraph->max_distance('GO:0065007'),
    "the root, in this case, must be the smallest number");
