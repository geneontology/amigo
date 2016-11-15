=head1 10_simple_solr_query.t

Test...

=cut

## Unnecessary libs.
use strict;
use Test::More 'no_plan';

## Necessary libs.
use AmiGO::External::JSON::Solr::GOlr;


## Get document, parse, etc.
my $solr = AmiGO::External::JSON::Solr::GOlr->new('http://golr.geneontology.org/');
$solr->query('q=id:"GO:0022008"');

## Run tests.
is($solr->total(), 1, 'found just one');
is($solr->first_doc()->{'annotation_class_label'},
   'neurogenesis', 'we are neurogenesis');
