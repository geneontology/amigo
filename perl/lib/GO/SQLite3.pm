=head1 GO::SQLite3

A library to make high-level SQLite3 handling safe and fun!

=cut

package GO::SQLite3;

use utf8;
use strict;
use DBD::SQLite;


=item new

Args: full name path of wanted database.
Returns: 1/0 on success or failure.

=cut
sub new {

  ##
  my $class = shift;
  my $args = shift || {};

  ##
  # print STDERR "%args\n";
  # print STDERR "_" .scalar( keys(%args) ) . "\n";
  # print STDERR "_" . (keys(%args))[0] . "\n";
  # print STDERR "_" . $args{'location'} . "\n";

  my $location = $args->{location} || die "gotta have a name path here $!";
  my $permissive_p = $args->{permissive} || 0;
  my $schema = $args->{schema} || undef;

  ## 
  my $self = {};
  $self->{GO_SQLITE3_LOCATION} = $location;
  $self->{GO_SQLITE3_PERMISSIVE_P} = $permissive_p;
  $self->{GO_SQLITE3_SCHEMA} = $schema;
  $self->{GO_SQLITE3_DBH} = undef;
  bless $self, $class;

  ##
  $self->create();

  return $self;
}


=item destroy

Args:
Returns: 1/0 on creation or not.

If it isn't there, create/connnect, then disconnect.

=cut
sub create {

  my $self = shift;
  my $retval = 0; # we haven't made anything yet...

  ## If the file is not already there, create the database by touching
  ## it.
  if( ! -f $self->{GO_SQLITE3_LOCATION} ){
    my $dbh =
      DBI->connect('dbi:SQLite:dbname=' . $self->{GO_SQLITE3_LOCATION}, '','',
		   { RaiseError => 1, })
	|| die "Database connection not made: $DBI::errstr";

    ## Add schema if one has been defined.
    if( defined $self->{GO_SQLITE3_SCHEMA} ){
      $dbh->do( $self->{GO_SQLITE3_SCHEMA} )
	or die $self->dbh->errstr;
    }

    $dbh->disconnect;
    $retval = 1; # we made something...

    ## Make permissive is possible and desired.
    if( $self->{GO_SQLITE3_PERMISSIVE_P} ){
      my $mode = 0777;
      eval {
	chmod $mode, $self->{GO_SQLITE3_LOCATION};
      };
    }
  }

  return $retval;
}


=item destroy

Args:
Returns:

=cut
sub destroy {

  my $self = shift;

  $self->close();
  if( -f $self->{GO_SQLITE3_LOCATION} ){
    unlink $self->{GO_SQLITE3_LOCATION};
  }
}


=item open

Args:
Returns:

=cut
sub open {
  my $self = shift;
  if( ! defined $self->{GO_SQLITE3_DBH} ){
    $self->{GO_SQLITE3_DBH} =
      DBI->connect('dbi:SQLite:dbname=' . $self->{GO_SQLITE3_LOCATION},
		   '','',
		   { RaiseError => 1, })
	|| die "Database connection not made: $DBI::errstr";

  }
  return $self->{GO_SQLITE3_DBH};
}


=item close

Args:
Returns:

=cut
sub close {
  my $self = shift;
  if( defined $self->{GO_SQLITE3_DBH} ){
    $self->{GO_SQLITE3_DBH}->disconnect();
    $self->{GO_SQLITE3_DBH} = undef;
  }
}


## Make sure that we at least drop our connection if we fall out of
## scope or something...
sub DESTROY {
  my $self = shift;
  $self->close();
}



1;
