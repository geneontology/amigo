=head1 AmiGO::KVStore

A library to manage and access the produced key-value stores (the subclasses).

=cut

package AmiGO::KVStore;

use base 'AmiGO';
use GO::SQLite3::KVStore;
use AmiGO::JavaScript;

# sub make_js
# sub parse_json_data

my $AKVS_PREFIX = 'akv_';
my $AKVS_SUFFIX = '.db';


=item new

Args: name
Returns: 1/0

Creates (or opens an extant) key-value store.

=cut
sub new {

  ##
  my $class = shift;
  my $loc = shift || die "gotta have a name path here $!";
  my $self = $class->SUPER::new();

  ## Get the store out on disk.
  $self->{AKVS_LOCATION} =
    $self->amigo_env('AMIGO_CACHE_DIR') . '/' .
      $AKVS_PREFIX . $loc . $AKVS_SUFFIX;
  $self->{AKVS_STORE} =
    GO::SQLite3::KVStore->new({location => $self->{AKVS_LOCATION},
			       permissive => 1});

  bless $self, $class;
  return $self;
}

###
### No multi-inherit here, so duck it on.
###

=item get

See superclass docs.

=cut
sub get {
  my $self = shift;
  return $self->{AKVS_STORE}->get(@_);
}


=item put

See superclass docs.

=cut
sub put {
  my $self = shift;
  return $self->{AKVS_STORE}->put(@_);
}


=item list

Args: n/a
Returns: array ref of fully qualified strings for AmiGO::KVStore databases.

Useful for cleaning duties.

=cut
sub list {

  my $a = AmiGO->new();
  my @all = glob($a->amigo_env('AMIGO_CACHE_DIR') . '/' .
		 $AKVS_PREFIX . '*' . $AKVS_SUFFIX);

  return \@all;
}



1;
