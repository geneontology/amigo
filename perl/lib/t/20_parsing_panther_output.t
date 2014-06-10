=head1 20_parsing_panther_output.t

Test...

=cut

## Unnecessary libs.
use strict;
use Test::More 'no_plan';

## Necessary libs.
use utf8;
use strict;
use XML::LibXML;
use File::Slurp;
use AmiGO::External::XMLFast::RemoteTermEnrichment;

my $xml1 = read_file('_data/rte-1.xml');
my $xml2 = read_file('_data/rte-2.xml');

###
###
###

my $dummy_args =
  {
   ontology => 1,
   input => 1,
   species => 1,
   correction => 1,
   format => 1,
  };
my $rte = AmiGO::External::XMLFast::RemoteTermEnrichment->new($dummy_args);

$rte->get_local_data($xml1);

is($rte->get_reference_mapped_count(), 21804, 'xml1: ref m c');
is($rte->get_reference_unmapped_count(), 0, 'xml1: ref u c');
is($rte->get_input_list_mapped_count(), 9, 'xml1: lst m c');
is($rte->get_input_list_unmapped_count(), 0, 'xml1: lst u c');

is(@{$rte->get_reference_mapped_list()}, 0, 'xml1: ref m l');
is(@{$rte->get_reference_unmapped_list()}, 0, 'xml1: ref u l');
is(@{$rte->get_input_list_mapped_list()}, 9, 'xml1: lst m l');
is(@{$rte->get_input_list_unmapped_list()}, 0, 'xml1: lst u l');

$rte->get_local_data($xml2);

is($rte->get_reference_mapped_count(), 21804, 'xml2: ref m c');
is($rte->get_reference_unmapped_count(), 0, 'xml2: ref u c');
is($rte->get_input_list_mapped_count(), 4, 'xml2: lst m c');
is($rte->get_input_list_unmapped_count(), 1, 'xml2: lst u c');

is(@{$rte->get_reference_mapped_list()}, 0, 'xml2: ref m l');
is(@{$rte->get_reference_unmapped_list()}, 0, 'xml2: ref u l');
is(@{$rte->get_input_list_mapped_list()}, 4, 'xml2: lst m l');
is(@{$rte->get_input_list_unmapped_list()}, 1, 'xml2: lst u l');

###
###
###

## Run tests.
#is(1, 1, 'one');
# is($solr->first_doc()->{'annotation_class_label'},
#    'neurogenesis', 'we are neurogenesis');
