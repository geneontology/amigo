=head1 AmiGO::External::JSON::Solr::Query

TODO

high-level Solr handling-as-client that tries to be safe for the
server.

=cut

package AmiGO::External::JSON::Solr::Query;

use base 'AmiGO::External::JSON::Solr';
#use AmiGO::Sanitize;


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

      $self->kvetch("query to run: " . $in_query);

      ## TODO: clean input?

      ## Run query...
      $self->query($in_query);
      $retval = 1;
    }
  }

  return $retval;
}



1;
