=head1 AmiGO::External::JSON::GOlrSearch

...

=cut

package AmiGO::External::JSON::Solr::GOlrSearch;
use base ("AmiGO::External::JSON::Solr");


=item new

#

=cut
sub new {

  ## Pass the buck back for getting a sensible default.
  my $class = shift;
  my $target = shift || undef;
  my $self  = $class->SUPER::new($target);

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
  my $final_hash = $self->merge($self->{AEJS_BASE_HASH}, $in_hash);
  #$self->kvetch("in_hash:" . Dumper($in_hash));

  ## Create URL.
  my $url = $self->{AEJS_BASE_URL} .
    $self->hash_to_query_string($self->{AEJS_BASE_HASH});
  $self->{AEJS_LAST_URL} = $url;

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
