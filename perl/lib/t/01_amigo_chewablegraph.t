use strict;
use Test::More 'no_plan';
use Data::Dumper;

use AmiGO::ChewableGraph;

## Centered on GO:0003334? So, GO:0003335 is below...
## http://localhost/cgi-bin/amigo/term_details?term=GO:0003334
## Also often the #1 doc when using luke to examine the index.
my $json_graph_target = 'GO:0003334';
my $json_graph_string =
  '{"nodes":[{"id":"GO:0009987","label":"cellular process"},{"id":"GO:0048468","label":"cell development"},{"id":"GO:0048869","label":"cellular developmental process"},{"id":"GO:0048513","label":"organ development"},{"id":"GO:0007275","label":"multicellular organismal development"},{"id":"GO:0048731","label":"system development"},{"id":"GO:0030154","label":"cell differentiation"},{"id":"GO:0003335","label":"corneocyte development"},{"id":"GO:0048856","label":"anatomical structure development"},{"id":"GO:0003334","label":"keratinocyte development"},{"id":"GO:0008150","label":"biological_process"},{"id":"GO:0009913","label":"epidermal cell differentiation"},{"id":"GO:0030855","label":"epithelial cell differentiation"},{"id":"GO:0032502","label":"developmental process"},{"id":"GO:0032501","label":"multicellular organismal process"},{"id":"GO:0002064","label":"epithelial cell development"},{"id":"GO:0008544","label":"epidermis development"},{"id":"GO:0030216","label":"keratinocyte differentiation"},{"id":"GO:0009888","label":"tissue development"},{"id":"GO:0060429","label":"epithelium development"}],"edges":[{"subject_id":"GO:0002064","object_id":"GO:0030855","predicate_id":"part_of"},{"subject_id":"GO:0048513","object_id":"GO:0048731","predicate_id":"part_of"},{"subject_id":"GO:0048731","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0030216","object_id":"GO:0009913","predicate_id":"is_a"},{"subject_id":"GO:0009913","object_id":"GO:0030154","predicate_id":"is_a"},{"subject_id":"GO:0048869","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0048869","predicate_id":"is_a"},{"subject_id":"GO:0048513","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0003335","object_id":"GO:0003334","predicate_id":"part_of"},{"subject_id":"GO:0030216","object_id":"GO:0030855","predicate_id":"is_a"},{"subject_id":"GO:0009913","object_id":"GO:0008544","predicate_id":"part_of"},{"subject_id":"GO:0030855","object_id":"GO:0030154","predicate_id":"is_a"},{"subject_id":"GO:0048731","object_id":"GO:0007275","predicate_id":"part_of"},{"subject_id":"GO:0008544","object_id":"GO:0048513","predicate_id":"part_of"},{"subject_id":"GO:0030855","object_id":"GO:0060429","predicate_id":"part_of"},{"subject_id":"GO:0009888","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0002064","object_id":"GO:0048468","predicate_id":"is_a"},{"subject_id":"GO:0032501","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0032502","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0060429","object_id":"GO:0009888","predicate_id":"is_a"},{"subject_id":"GO:0007275","object_id":"GO:0032501","predicate_id":"is_a"},{"subject_id":"GO:0048869","object_id":"GO:0009987","predicate_id":"is_a"},{"subject_id":"GO:0048856","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0007275","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0030154","predicate_id":"part_of"},{"subject_id":"GO:0009987","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0008544","object_id":"GO:0009888","predicate_id":"is_a"},{"subject_id":"GO:0030154","object_id":"GO:0048869","predicate_id":"is_a"},{"subject_id":"GO:0048468","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0030216","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0002064","predicate_id":"is_a"}]}';
my $json_lineage_graph_string =
  '{"nodes":[{"id":"GO:0009987","label":"cellular process"},{"id":"GO:0048468","label":"cell development"},{"id":"GO:0048869","label":"cellular developmental process"},{"id":"GO:0048513","label":"organ development"},{"id":"GO:0007275","label":"multicellular organismal development"},{"id":"GO:0048731","label":"system development"},{"id":"GO:0030154","label":"cell differentiation"},{"id":"GO:0048856","label":"anatomical structure development"},{"id":"GO:0003334","label":"keratinocyte development"},{"id":"GO:0008150","label":"biological_process"},{"id":"GO:0009913","label":"epidermal cell differentiation"},{"id":"GO:0030855","label":"epithelial cell differentiation"},{"id":"GO:0032502","label":"developmental process"},{"id":"GO:0032501","label":"multicellular organismal process"},{"id":"GO:0002064","label":"epithelial cell development"},{"id":"GO:0008544","label":"epidermis development"},{"id":"GO:0030216","label":"keratinocyte differentiation"},{"id":"GO:0009888","label":"tissue development"},{"id":"GO:0060429","label":"epithelium development"}],"edges":[{"subject_id":"GO:0003334","object_id":"GO:0048869","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0032502","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0009913","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0008544","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0048856","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0008150","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0060429","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0009987","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0048731","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0048468","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0048869","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0007275","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0030154","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0009888","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0032501","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0032502","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0030216","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0030855","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0008150","predicate_id":"part_of"},{"subject_id":"GO:0003334","object_id":"GO:0009987","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0002064","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0048856","predicate_id":"is_a"},{"subject_id":"GO:0003334","object_id":"GO:0048513","predicate_id":"part_of"}]}';

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
				       $json_graph_string,
				       $json_lineage_graph_string);

ok( defined($cgraph), "is defined");

## Check roots.
my $roots = $cgraph->get_roots();
is( scalar(keys %$roots), 1, "got the one root");
my @rkeys = keys %$roots;
my $rkey = $rkeys[0];
ok( $cgraph->is_root_p($rkey), "definitely is a root");
ok( ! $cgraph->is_root_p('GO:0022008'), "definitely not a root");

## Check leaves.
ok( ! $cgraph->is_leaf_p($rkey), "definitely is not a leaf (1)");
ok( ! $cgraph->is_leaf_p('GO:0003334'), "definitely is not a leaf (2)");
ok( $cgraph->is_leaf_p('GO:0003335'), "definitely is a leaf");


## Check children.
my $ks1 = $cgraph->get_children('GO:0003335');
my $ks2 = $cgraph->get_children('GO:0003334');
my $ks3 = $cgraph->get_children('GO:0030855');
my $kn1 = scalar(@$ks1);
my $kn2 = scalar(@$ks2);
my $kn3 = scalar(@$ks3);
is( $kn1, 0, "no kids");
is( $kn2, 1, "one kid");
is( $kn3, 2, "two kids");
is( $ks2->[0], 'GO:0003335', 'the right kid');
foreach my $ks3s (@$ks3){
  if( $ks3s eq 'GO:0002064' ){
    pass('the right kid (a)');
  }elsif( $ks3s eq 'GO:0030216' ){
    pass('the right kid (b)');
  }else{
    fail('what kid is that?');
  }
}

## Check parents.
my $ps1 = $cgraph->get_parents('GO:0008150');
my $pn1 = scalar(@$ps1);
is( $pn1, 0, "no parents");
my $ps2 = $cgraph->get_parents('GO:0003335');
my $pn2 = scalar(@$ps2);
is( $pn2, 1, "one parent");
foreach my $ps2s (@$ps2){
  if( $ps2s eq 'GO:0003334' ){
    pass('the right parent (a)');
  }else{
    fail('what parent is that? (a): ' . $ps2s);
  }
}
my $ps3 = $cgraph->get_parents('GO:0002064');
my $pn3 = scalar(@$ps3);
is( $pn3, 2, "two parents (b)");
#_ll('ps3:', $ps3);
foreach my $ps3s (@$ps3){
  if( $ps3s eq 'GO:0048468' ){
    pass('the right parent (d)');
  }elsif( $ps3s eq 'GO:0030855' ){
    pass('the right parent (e)');
  }else{
    fail('what parent is that? (b): ' . $ps3s);
  }
}

## Check child relationships.
my $cr1 = $cgraph->get_child_relationships('GO:0030154');
#_ll("DUMP: ", Dumper($cr1));
is( scalar(@$cr1), 3, "three child rels");
foreach my $cri1 (@$cr1){
  if( $cri1->{subject_id} eq 'GO:0048468' ){
    pass('the right child in rel (a)');
    if( $cri1->{predicate_id} eq 'part_of' ){
      pass('the right child rel in rel (a)');
    }else{
      fail('the wrong child rel in rel (a): ' . $cri1->{predicate_id});
    }
  }elsif( $cri1->{subject_id} eq 'GO:0030855' ){
    pass('the right child in rel (b)');
    if( $cri1->{predicate_id} eq 'is_a' ){
      pass('the right child rel in rel (b)');
    }else{
      fail('the wrong child rel in rel (b): ' . $cri1->{predicate_id});
    }
  }elsif( $cri1->{subject_id} eq 'GO:0009913' ){
    pass('the right child in rel (c)');
    if( $cri1->{predicate_id} eq 'is_a' ){
      pass('the right child rel in rel (c)');
    }else{
      fail('the wrong child rel in rel (c): ' . $cri1->{predicate_id});
    }
  }else{
    fail('what child rel is that?: ' . $cri1->{subject_id});
  }
}

## Check parent relationships.
my $pr1 = $cgraph->get_parent_relationships('GO:0048468');
#_ll("DUMP: ", Dumper($pr1));
is( scalar(@$pr1), 3, "three parent rels");
foreach my $pri1 (@$pr1){
  if( $pri1->{object_id} eq 'GO:0030154' ){
    pass('the right parent in rel (a)');
    if( $pri1->{predicate_id} eq 'part_of' ){
      pass('the right parent rel in rel (a)');
    }else{
      fail('the wrong parent rel in rel (a): ' . $pri1->{predicate_id});
    }
  }elsif( $pri1->{object_id} eq 'GO:0048869' ){
    pass('the right parent in rel (b)');
    if( $pri1->{predicate_id} eq 'is_a' ){
      pass('the right parent rel in rel (b)');
    }else{
      fail('the wrong parent rel in rel (b): ' . $pri1->{predicate_id});
    }
  }elsif( $pri1->{object_id} eq 'GO:0048856' ){
    pass('the right parent in rel (c)');
    if( $pri1->{predicate_id} eq 'is_a' ){
      pass('the right parent rel in rel (c)');
    }else{
      fail('the wrong parent rel in rel (c): ' . $pri1->{predicate_id});
    }
  }else{
    fail('what parent rel is that?: ' . $pri1->{object_id});
  }
}

## Check the depth information.
_ll(Dumper($cgraph->_ensure_max_depth_info()));
is($cgraph->max_depth('GO:0008150'), 0, "root depth 0");
is($cgraph->max_depth('GO:0003334'), 8, "target node is deep");

## TODO: test the rest

#is($cgraph->max_depth('GO:0008150'), 0, "root depth 0");
# ok( $cgraph->is_leaf_p('GO:0003335'), "definitely is a leaf");
# pass('the right parent (d)');
# fail('what parent is that? (b): ' . $ps3s);
