=head1 AmiGO::External::LEAD

TODO: Specialize onto external database resources. We don't even need
an HTTP agent for this so we'll ignore some of our parentage in the
constructor.

=cut

use utf8;
use strict;
use Carp;

package AmiGO::External::LEAD;

use base ("AmiGO::External");


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  my $args = shift || {};
  my $login = $args->{login} || '';
  my $password = $args->{password} || '';
  my $host = $args->{host} || die "need a host: $!";
  my $port = $args->{port} || '3306';
  my $database = $args->{database} || die "need a database: $!";

  $self->{EXT_DB} = undef;
  eval{
    $self->{EXT_DB} =
      DBI->connect("DBI:mysql:" . $database . ":" . $host . ":" . $port,
		   $login,
		   $password)
	|| die "Unable to connect: $DBI::errstr\n";
  };
  if($@){
    $self->{EXT_DB} = undef;
  }

  bless $self, $class;
  return $self;
}


=item count

Get a row count after trying a statement. Remember to set your CALC if
you want it...

=cut
sub count {

  my $self = shift;
  my $retval = undef;

  ## Run.
  my $statement = undef;
  $statement = $self->{EXT_DB}->prepare("SELECT FOUND_ROWS()")
    or die "Couldn't prepare query.";
  $statement->execute()
    or die "Couldn't run count.";

  ## Grab the count.
  my @meta_info = $statement->fetchrow_array();
  $retval = $meta_info[0] if $meta_info[0];

  ## Close connection.
  $statement->finish();

  return $retval;
}


## Make sure that we at least drop our connection if we fall out of
## scope or something...
sub DESTROY {
  my $self = shift;
  if( defined $self->{EXT_DB} ){
    $self->{EXT_DB}->disconnect();
    $self->{EXT_DB} = undef;
  }
}


# =item get_external_data

# ...

# =cut
# sub get_external_data {

#   ##
#   my $self = shift;
#   my $url = shift || '';
#   my $mech = $self->{MECH};

#   ## Go and try and get the external document.
#   my $doc = '';
#   eval {
#     $mech->get($url);
#   };
#   if( $@ ){
#     $self->kvetch("error in GETing the document from: '$url': $@");
#   }else{

#     if ( ! $mech->success() ){
#       $self->kvetch("failed to contact data source at: $url");
#     }else{

#       ## Grab the content.
#       $doc = $mech->content();
#       $self->{EXT_DATA} = $doc;
#     }
#   }

#   return $doc;
# }



1;
