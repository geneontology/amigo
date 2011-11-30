=head1  AmiGO::Worker::GOlr::Meta

Solr/JSON interface for getting interesting meta/base information out of a
GOlr resource using a null query and facets.

=cut

package AmiGO::Worker::GOlr::Meta;
use base ("AmiGO::Worker::GOlr");

use AmiGO::External::JSON::GOlrSearch;


=item new

# TODO: doc

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  ## TODO: Try to find a cache first, the do it for reals.

  $self->{AWGS_BASE_HASH} =
    {
     query => '',
     #document_category => $doctype,
     count => 10,
     index => 1,
    };

  ## Merge incoming with default template.
  my $final_hash = $self->merge($self->{AWGS_BASE_HASH}, $in_hash);
  #$self->kvetch("in_hash:" . Dumper($in_hash));

  ## Create URL.
  my $url = $self->hash_to_golr_url($final_hash);

  ## Make query against resource and try to perlify it.
  $self->kvetch("url:" . $url);
  $self->get_external_data($url);
  my $final_blob = $self->try();

  ## Make sure we got something.
  if( ! $self->empty_hash_p($final_blob) ){
    $retval = $final_blob;
  }

  bless $self, $class;
  return $self;
}


=item species

Args: n/a
Return: hashref for

=cut
sub species {

  my $self = shift;
  my $ret = undef;

  return $ret;
}

#ontology
#database_link
#gptype
#source
#species
#iss_evidence_hash
#experimental_evidence_hash
#iss_evidence_codes
#experimental_evidence_codes
#evidence_codes_sans
#evidence_codes
#release_type
#release_name
# my $EXP_EVCODES = [
# 		   'EXP',
# 		   'IDA',
# 		   'IPI',
# 		   'IMP',
# 		   'IGI',
# 		   'IEP'
# 		   ];
# my $ISS_EVCODES = [
# 		   'ISS',
# 		   'ISO',
# 		   'ISA',
# 		   'ISM'
# 		   ];



1;
