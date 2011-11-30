=head1 AmiGO::External::JSON::GOlrDocument

Solr/JSON interface for retrieving objects with useful ids from the
GOlr. Transforms the returned JSON into a similar perl object or
returns nothing.

=cut

package AmiGO::External::JSON::GOlrDocument;
use base ("AmiGO::External::JSON");


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  ## Allow for non-local targets.
  my $target = shift || $self->amigo_env('AMIGO_PUBLIC_GOLR_URL');

  ## http://skewer.lbl.gov:8080/solr/select?qt=standard&indent=on&wt=json&version=2.2&rows=10&start=0&fl=*%2Cscore&q=id:%22GO:0022008%22
  $self->{JSLS_BASE_HASH} =
    {
     'qt' => 'standard',
     'indent' => 'on',
     'wt' => 'json',
     'version' => 2.2,
     'rows' => 10,
     'start' => 0,
     'fl' => '*%2Cscore',
    };

  $self->{JSLS_BASE_URL} = $target . 'select?';
  $self->{JSLS_LAST_URL} = undef;

  bless $self, $class;
  return $self;
}


=item get_by_id

Args: document id (string)
Return: perl hash structure (see TODO) or undef

=cut
sub get_by_id {

  my $self = shift;
  my $in_id = shift || die "need to have and id argument";
  my $retval = undef;

  ## Merge in id with template.
  $self->{JSLS_BASE_HASH}{q} = 'id:%22' . $in_id . '%22';

  ## Create URL.
  my $url = $self->{JSLS_BASE_URL} .
    $self->hash_to_query_string($self->{JSLS_BASE_HASH});
  $self->{JSLS_LAST_URL} = $url;

  ## Make query against resource and try to perlify it.
  $self->kvetch("url:" . $url);
  $self->get_external_data($url);
  my $doc_blob = $self->try();

  ## Make sure we got something.
  if( ! $self->empty_hash_p($doc_blob) &&
      $doc_blob->{response} &&
      $doc_blob->{response}{docs} &&
      $doc_blob->{response}{docs}[0] ){
    $retval = $doc_blob->{response}{docs}[0];
  }

  return $retval;
}


=item last_url

Args: none
Return: the last url queried as a string

=cut
sub last_url {
  my $self = shift;
  return $self->{JSLS_LAST_URL};
}


1;
