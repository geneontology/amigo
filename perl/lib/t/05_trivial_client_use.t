=head1 05_trivial_client_use.t

Test...

=cut

## Unnecessary libs.
use strict;
use Test::More 'no_plan';

## Necessary libs.
use WWW::Mechanize;
#use JSON::PP;
use JSON::XS;


## Start with a simple agent.
my $mech = WWW::Mechanize->new();

## Get document.
my $url = 'http://skewer.lbl.gov:8080/solr/select?qt=standard&indent=on&wt=json&version=2.2&rows=10&start=0&fl=*%2Cscore&q=id:"GO:0022008"';
$mech->get($url);
my $json_doc = $mech->content();
print STDERR "Found document:\n" . $json_doc . "\n";

## Parse JSON.
#my $json_parser = JSON::PP->new();
my $json_parser = JSON::XS->new();
my $results = $json_parser->decode($json_doc);

## Run tests.
is($results->{'response'}{'numFound'}, 1, 'found just one');
is($results->{'response'}{'docs'}[0]->{'label'},
   'neurogenesis', 'we are neurogenesis');
