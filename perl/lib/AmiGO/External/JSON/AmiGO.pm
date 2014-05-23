=head1 AmiGO::External::JSON::AmiGO

Specialize onto external AmiGO web service resource.
In all likelyhood, myself.

Very experimental.

=cut

package AmiGO::External::JSON::AmiGO;
use base ("AmiGO::External::JSON");

use utf8;
use strict;
use Carp;
use Clone;
use Data::Dumper;
use POSIX qw(ceil);

=item new

Arguments: (optional) full URL as string including the final slash.
e.g.: http://skewer.lbl.gov:8080/solr/
No argument will use AmiGO's internal GOlr url.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  my $target = shift || $self->amigo_env('AMIGO_SERVICE_URL');

  ## ...
  $self->{AEJA_BASE_URL} = $target;
  $self->{AEJA_BASE_HASH} = {};
  $self->{AEJE_LAST_URL} = undef;
  $self->{AEJS_RESPONSE} = undef;

  bless $self, $class;
  return $self;
}


=item _query_url

Arguments: Post "select?" query string or internal hash manipulation.
Return: query string

Helper function (not meant to be called directly) to get the url of
the current state of the object.

Does not change object state.

=cut
sub _query_url {

  my $self = shift;
  my $qstr = shift || undef;

  #$self->kvetch("base hash: " . Dumper($self->{AEJA_BASE_HASH}));

  ## Create URL.
  my $url = $self->{AEJA_BASE_URL} .
    '?' .
      $self->hash_to_query_string($self->{AEJA_BASE_HASH});

  ## Add more if it is defined as an argument.
  $url = $url . '&' . $qstr if $qstr;

  ## Make query against resource and try to perlify it.
  $self->kvetch("url: " . $url);

  return $url;
};


=item query

Arguments: Post "aserve?" query string or internal hash manipulation.
Return: true or false on minimal success

This is the most raw of the searches. Hope you know what you're doing.

Also updates last URL tried, etc.

=cut
sub query {

  my $self = shift;
  my $qstr = shift || undef;
  my $retval = 0;

  ## Create URL.
  my $url = $self->_query_url($qstr);

  ## Update last query url.
  $self->{AEJA_LAST_URL} = $url;

  ## Make query against resource and try to perlify it.
  $self->get_external_data($url);
  my $doc_blob = $self->try();

  #$self->kvetch("doc_blob: " . Dumper($doc_blob));

  ## Make sure we got something.
  if( ! $self->empty_hash_p($doc_blob) ){
    $self->{AEJA_RESPONSE} = $doc_blob;
    $retval = 1;
  }

  return $retval;
}


=item variables

Arguments: n/a
Returns: aref of current variable keys

=cut
sub variables {

  my $self = shift;
  my $retref;

  foreach my $k (keys %{$self->{AEJA_BASE_HASH}} ){
    push @$retref, $k;
  }

  return $retref;
}


=item get_variable

Arguments: string name of solr variable.
Returns: variable or undef

=cut
sub get_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $retval = undef;

  if( defined $qkey && defined $self->{AEJA_BASE_HASH}{$qkey} ){
    $retval = $self->{AEJA_BASE_HASH}{$qkey};
  }

  return $retval;
}


=item set_variable

Arguments: string name of solr variable, value
Returns: the value of the set variable

=cut
sub set_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $qval = shift;
  my $retval = $qval;

  if( defined $qkey ){
    $self->{AEJA_BASE_HASH}{$qkey} = $qval;
  }

  return $qval;
}


=item add_variable

Arguments: string name of solr variable, value to be added to key
Returns: the value of the added variable

=cut
sub add_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $qval = shift || undef;
  my $retval = $qval;

  if( defined $qkey ){
    if( ! defined $self->{AEJA_BASE_HASH}{$qkey} ){
      $self->{AEJA_BASE_HASH}{$qkey} = $qval;
    }elsif( defined $self->{AEJA_BASE_HASH}{$qkey} &&
	    ref($self->{AEJA_BASE_HASH}{$qkey}) eq 'ARRAY' ){
      push @{$self->{AEJA_BASE_HASH}{$qkey}}, $qval;
    }else{
      my $tmp_val = $self->{AEJA_BASE_HASH}{$qkey};
      $self->{AEJA_BASE_HASH}{$qkey} = [];
      push @{$self->{AEJA_BASE_HASH}{$qkey}}, $tmp_val;
      push @{$self->{AEJA_BASE_HASH}{$qkey}}, $qval;
    }
  }

  return $qval;
}


=item last_url

Return: the last url used as a string.

=cut
sub last_url {
  my $self = shift;
  return $self->{AEJA_LAST_URL};
}


=item results

Return: results href or undef

The results found during last query.

=cut
sub results {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJA_RESPONSE}{results} ){
    $retval = $self->{AEJA_RESPONSE}{results};
  }

  return $retval;
}


=item errors

Return: an aref of error strings

=cut
sub errors {

  my $self = shift;
  my $retval = [];

  ## Make sure we got something.
  if( $self->{AEJA_RESPONSE}{errors} ){
    $retval = $self->{AEJA_RESPONSE}{errors};
  }

  return $retval;
}


=item warnings

Return: an aref of warning strings

=cut
sub warnings {

  my $self = shift;
  my $retval = [];

  ## Make sure we got something.
  if( $self->{AEJA_RESPONSE}{warnings} ){
    $retval = $self->{AEJA_RESPONSE}{warnings};
  }

  return $retval;
}


=item success_p

Return: bool on call success

=cut
sub success_p {

  my $self = shift;
  my $retval = 0;

  ## Make sure we got something that looks 1-ish.
  if( $self->{AEJA_RESPONSE}{success} &&
      ($self->{AEJA_RESPONSE}{success} == 1 ||
       $self->{AEJA_RESPONSE}{success} eq '1' )){
    $retval = 1;
  }

  return $retval;
}


## No longer have to worry about open connections.
sub DESTROY {
  my $self = shift;
  ## Something to disconnect would go here...
}



1;
