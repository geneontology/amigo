=head1 15_gaffer_xform.t

Test gaffer turning a url into something else.

NOTE: Gaffer is done for now.
TODO: Should I remove this test (which was out of date anyways).

=cut

# ## Unnecessary libs.
# use strict;
# use Test::More 'no_plan';
# use Data::Dumper;

# ## Necessary libs.
# use AmiGO::Worker::Gaffer;
# use AmiGO::External::JSON::Solr::GOlr;


# ###
# ### Make a solr url.
# ###

# my $solr = AmiGO::External::JSON::Solr::GOlr->new('http://localhost:8080/solr/');
# $solr->query('q=*:*');

# ## ...
# # print STDOUT "url: " . $solr->url() . "\n";
# # print STDOUT "full url: " . $solr->full_results_url() . "\n";
# ## The kind of url to pass as an argument.
# # print STDOUT "safe url: " . $solr->uri_safe($solr->url()) . "\n";

# ###
# ### Gaffer not on the wire.
# ###

# my $url = 'http://localhost:8080/solr/select?qt=standard&fl=*%2Cscore&version=2.2&wt=json&facet=true&facet.field=document_category&facet.field=type&facet.field=evidence_type&facet.field=evidence_type_closure&facet.field=source&facet.field=taxon&facet.field=isa_partof_closure_label&facet.field=annotation_extension_class_closure_label&rows=10&indent=on&q=*:*&fq=document_category:%22annotation%22&fq=isa_partof_closure_label:%22cellular%20response%20to%20stress%22&start=0';

# ## Get document, parse, etc.
# my $gaffer = AmiGO::Worker::Gaffer->new($url);
# my $out = $gaffer->solr_to_id_list();

# ## DEBUG
# # print STDOUT "out:\n" . $out . "\n";

# ## Run tests.
# is(scalar(split("\n", $out)), 10, 'found ten');
