#!/usr/bin/perl -w
# $id$
####
#### Convert a JSON owltools shunt graph file into something GraphViz can use.
#### Bits stolen from AmiGO.pm.
#### See perldoc for more info.
####

use strict;
use utf8;
use JSON::XS;
use GraphViz;
use Data::Dumper;

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

## Try and get the file read in.
my $file = $ARGV[0];
die "No file defined: $!" if ! $file;
die "No JSON file found ($ARGV[0]): $!" if ! -f $file;
open(FILE, '<', $file) or die "Cannot open $file: $!";
my $json_str = <FILE>;
close FILE;

## Parse the read file to a perl hash.
my $js = JSON::XS->new();
my $hash = $js->decode($json_str);

## Ready the graph (and set it) for loading.
my $g = GraphViz->new(directed => 1, layout => 'dot');

#_ll(Dumper($g));

## Load nodes.
foreach my $n (@{$hash->{nodes}}){
  my $id = $n->{id} || die 'wtf?';
  my $label = $n->{label} || $id;
  $g->add_node($id, 'label' => $label);
}

## Load edges.
foreach my $n (@{$hash->{edges}}){
  my $sid = $n->{subject_id};
  my $oid = $n->{object_id};
  my $pid = $n->{predicate_id};
  $g->add_edge($oid, $sid, 'label' => $pid, 'dirType' => 'forward');
}

## Dump out to STDOUT for capture.
print $g->as_text . "\n";


=head1 NAME

json-to-graphviz.pl

=head1 SYNOPSIS

json-to-graphviz.pl

json-to-graphviz.pl /tmp/graph.json > /tmp/graph.dot
dot -Tpng -O /tmp/graph.dot
eog /tmp/graph.dot.png

=head1 DESCRIPTION

Convert a JSON owltools shunt graph file into something GraphViz can
use.

=cut
