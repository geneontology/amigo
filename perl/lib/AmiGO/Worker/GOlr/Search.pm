=head1  AmiGO::Worker::GOlr::Search

...

=cut

package AmiGO::Worker::GOlr::Search;
use base ("AmiGO::Worker::GOlr");

use AmiGO::External::JSON::GOlrSearch;


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  #my $doctype = shift || die "Need a document category type: $!";

  $self->{AWGS_BASE_HASH} =
    {
     query => '',
     #document_category => $doctype,
     count => 10,
     index => 1,
    };

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

  return $retval;
}


=item next_url

Args: hash ref (see service/js docs)
Return: url for the _next_ "page" on the service

=cut
sub next_url {

  my $self = shift;
  my $in_hash = shift || {};
  my $returl = undef;

  ## Merge incoming with default template.
  my $final_hash = $self->merge($self->{AWGS_BASE_HASH}, $in_hash);

  ## Try and step the "index" forward.
  if( $final_hash->{index} ){
    $final_hash->{index} = $final_hash->{index} + 1;
  }else{
    $final_hash->{index} = 1;
  }

  return $self->get_interlink({mode=>'term_search',
			       arg=>$final_hash});
}


=item previous_url

Args: hash ref (see service/js docs)
Return: url for the _previous_ "page" on the service

=cut
sub previous_url {

  my $self = shift;
  my $in_hash = shift || {};
  my $returl = undef;

  ## Merge incoming with default template.
  my $final_hash = $self->merge($self->{AWGS_BASE_HASH}, $in_hash);

  ## Try and step the "index" backward.
  if( $final_hash->{index} ){
    $final_hash->{index} = $final_hash->{index} - 1;
  }else{
    $final_hash->{index} = 1;
  }

  return $self->get_interlink({mode=>'term_search',
			       arg=>$final_hash});
}



1;
