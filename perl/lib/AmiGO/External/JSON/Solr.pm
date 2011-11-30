=head1 AmiGO::External::JSON::Solr

Specialize onto external document store resource.

=cut

use utf8;
use strict;
use Carp;

package AmiGO::External::JSON::Solr;

use base ("AmiGO::External::JSON");
use Data::Dumper;


=item new

Arguments: (optional) full URL as string including the final slash.
e.g.: http://skewer.lbl.gov:8080/solr/
No argument will use AmiGO's internal GOlr url.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  #my $args = shift || {};
  my $target = shift || $self->amigo_env('AMIGO_PUBLIC_GOLR_URL');
  #my $host = $args->{host} || die "need a host: $!";

  ## http://skewer.lbl.gov:8080/solr/select?qt=standard&indent=on&wt=json&version=2.2&rows=10&start=0&fl=*%2Cscore&q=id:%22GO:0022008%22
  $self->{AEJS_BASE_HASH} =
    {
     'qt' => 'standard',
     'indent' => 'on',
     'wt' => 'json',
     'version' => 2.2,
     'rows' => 10,
     'start' => 0,
     'fl' => '*%2Cscore',
    };

  $self->{AEJS_BASE_URL} = $target . 'select?';
  $self->{AEJS_LAST_URL} = undef;
  $self->{AEJS_RESPONSE} = undef;

  bless $self, $class;
  return $self;
}


=item query

Arguments: Post "select?" query string or internal hash manipulation.
Return: true or false on minimal success

Basically, the main way subclasses should be handling Solr queries.
Also updates last URL tried, count, etc.

=cut
sub query {

  my $self = shift;
  my $qstr = shift || undef;
  my $retval = 0;

  #$self->kvetch("base hash: " . Dumper($self->{AEJS_BASE_HASH}));

  ## Create URL.
  my $url = $self->{AEJS_BASE_URL} .
    $self->hash_to_query_string($self->{AEJS_BASE_HASH});

  ## Add more if it is defined as an argument.
  $url = $url . '&' . $qstr if $qstr;

  $self->{AEJS_LAST_URL} = $url;

  ## Make query against resource and try to perlify it.
  $self->kvetch("url: " . $url);
  $self->get_external_data($url);
  my $doc_blob = $self->try();

  $self->kvetch("doc_blob: " . Dumper($doc_blob));

  ## Make sure we got something.
  if( ! $self->empty_hash_p($doc_blob) &&
      $doc_blob->{response} ){
    $self->{AEJS_RESPONSE} = $doc_blob;
    $retval = 1;
  }

  return $retval;
}


=item url

Return: the last url used as a string.

=cut
sub url {
  my $self = shift;
  return $self->{AEJS_LAST_URL};
}


=item total

Return: int or undef

Total number of possible docs found during last query.

=cut
sub total {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{numFound} ){
    $retval = $self->{AEJS_RESPONSE}{response}{numFound};
  }

  return $retval;
}


=item count

Return: int or undef

Count of returned docs found during last query.

=cut
sub count {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} ){
    $retval = scalar(@{$self->{AEJS_RESPONSE}{response}{docs}});
  }

  return $retval;
}


=item docs

Return: docs as aref or undef

The docs found during last query.

=cut
sub docs {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} ){
    $retval = $self->{AEJS_RESPONSE}{response}{docs};
  }

  return $retval;
}


=item first_doc

Return: doc or undef

The first doc found during last query.

=cut
sub first_doc {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} &&
      $self->{AEJS_RESPONSE}{response}{docs}[0] ){
    $retval = $self->{AEJS_RESPONSE}{response}{docs}[0];
  }

  return $retval;
}


## No longer have to worry about open connections.
sub DESTROY {
  my $self = shift;
  #if( defined $self->{EXT_DB} ){
  #$self->{EXT_DB}->disconnect();
  #$self->{EXT_DB} = undef;
  #}
}



1;
