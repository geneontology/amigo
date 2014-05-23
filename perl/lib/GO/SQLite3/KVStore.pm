=head1 GO::SQLite3::KVStore

A simple key-value store written for SQLite3.

=cut

package GO::SQLite3::KVStore;

use base 'GO::SQLite3';


=item new

Args:
Returns:

=cut
sub new {

  my $class = shift;
  my $args = shift || {};
  $args->{schema} =
    qq{
       CREATE TABLE store (
	  key TEXT PRIMARY KEY,
	  value BLOB
       )
    };

  ## Create the database at location.
  my $self = $class->SUPER::new($args);

  ## Add the table to the database if we're creating it for the first
  ## time.
  # if( $self->create() ){
  #   $self->initialize();
  # }

  bless $self, $class;
  return $self;
}


=item put

Args: some kind of key, some kind of value.
Returns: ...

Will remove/replace values on same key.

=cut
sub put {

  my $self = shift;
  my $key = shift || die "gotta have a key $!";
  my $value = shift || die "gotta have value $!";

  ## 
  $self->open();

  ##
  my $sth = $self->{GO_SQLITE3_DBH}->prepare('INSERT OR REPLACE INTO store (key, value) VALUES (?,?)')
    or die "Couldn't prepare statement: " . $self->{GO_SQLITE3_DBH}->errstr;
  my $undef_p = $sth->execute($key, $value)
    or die "Couldn't execute statement: " . $sth->errstr;

  ##
  undef $sth;
  $self->close();
  return $ret;
}


=item get

Args: key
Returns: value or undef

=cut
sub get {

  my $self = shift;
  my $key = shift || die "gotta have a key $!";

  ##
  my $ret = undef;

  ##
  $self->open();
  my $query = "SELECT * FROM store WHERE key = ?";
  my $sth = $self->{GO_SQLITE3_DBH}->prepare($query)
    or die "Couldn't prepare statement: " . $self->{GO_SQLITE3_DBH}->errstr;
  my $undef_p = $sth->execute($key)
    or die "Couldn't execute statement: " . $sth->errstr;

  ## Extract from the results.
  my @row = $sth->fetchrow_array();
  if( $row[0] && $row[1] ){
    $ret = $row[1];
    # {
    #  id => $row[0],
    #  key => $row[1],
    #  value => $row[2]
    # };
  }

  undef $sth;
  $self->close();
  return $ret;
}



1;
