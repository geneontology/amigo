=head1 AmiGO::External::JSON::Solr::SafeQuery

TODO

high-level Solr handling-as-client that tries to be safe for the
server.

=cut

package AmiGO::External::JSON::Solr::SafeQuery;

use base 'AmiGO::External::JSON::Solr';
#use AmiGO::Sanitize;
use Data::Dumper;


=item new

Low level handler constructor. Requires connection hashref info and
optional input size limit

Usage: ...

=cut
sub new {

  ##
  my $class = shift;
  my $solr_serv = shift || undef;
  my $max_query_len = shift;
  my $self  = $class->SUPER::new($solr_serv);

  ## Zero and undef are different. If nothing is really there, default
  ## to 5000.
  if( ! defined($max_query_len) ){
    $max_query_len = 5000;
    $self->kvetch("using default max query length: " . $max_query_len);
  }

  ## No sanitizer, but lets just make sure we're not going nuts...
  $self->{LENGTH_LIMIT} = $max_query_len;

  bless $self, $class;
  return $self;
}


=item safe_query

TODO

...

=cut
sub safe_query {

  my $self = shift;
  my $in_query = shift || '';

  my $retval = 0;

  ## Query coming in?
  if( $in_query ){

    if( length($in_query) > $self->{LENGTH_LIMIT} ){
      $self->set_error_message("Query too long.");
    }else{

      ## Cleanse input.
      $in_query =~ tr/\r/\n/; # convert invisible \r to \n
      $in_query =~ s/^\s+//; # trim ws from front
      $in_query =~ s/\s+$//; # trim ws from end
      $in_query =~ tr/\n//s; # remove extra newlines
      $in_query =~ tr/\n/&/; # convert newlines to ampersands
      ## Convert input into hash.
      my $in_hash = $self->query_string_to_hash($in_query);

      ## If it's in the preset hash, overwrite it; otherwise, add it
      ## in--there may be multiples.
      foreach my $key (keys %$in_hash){
	my $val = $in_hash->{$key};
	## BUG/TODO
	if( defined $self->get_variable($key) ){
	  $self->set_variable($key, $val);
	}else{
	  $self->add_variable($key, $val);
	}
      }

      #$self->kvetch("query to run: " . $in_query);
      #$self->query($in_query);

      ## Run query...
      $self->query();
      $retval = 1;
    }
  }

  return $retval;
}



1;
