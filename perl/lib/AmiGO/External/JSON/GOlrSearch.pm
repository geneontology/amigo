=head1 AmiGO::External::JSON::GOlrSearch

...

=cut

package AmiGO::External::JSON::GOlrSearch;
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


=item query

Args: hash ref (see service/js docs)
Return: perl hash structure (see service/js docs) or undef

=cut
sub query {

  my $self = shift;
  my $in_hash = shift || {};
  my $retval = undef;

  ## Merge incoming with default template.
  my $final_hash = $self->merge($self->{JSLS_BASE_HASH}, $in_hash);
  #$self->kvetch("in_hash:" . Dumper($in_hash));

  ## Create URL.
  my $url = $self->{JSLS_BASE_URL} .
    $self->hash_to_query_string($self->{JSLS_BASE_HASH});
  $self->{JSLS_LAST_URL} = $url;

  ## Make query against resource and try to perlify it.
  $self->kvetch("url:" . $url);
  $self->get_external_data($url);
  my $final_blob = $self->try();

  ## Make sure we got something.
  if ( ! $self->empty_hash_p($final_blob) ) {
    $retval = $final_blob;
  }

  return $retval;
}



1;
