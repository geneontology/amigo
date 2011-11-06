=head1 AmiGO::KVStore::Filesystem

A library to store blobs on the file system. This is supposed to be
used for files, but it seems to work with scalar (string?) data in
general.

NOTE: While sharing the safe namespace and interface as KVStore, this
is not actually a subclass--it works directly with the filesystem and
does not use SQLite3.

NOTE/TODO: You'll notice some very...strange...things going on with
the handling of numbers in _make_file_key. This is because different
versions of perl have (or don't have) bignum hex--which is necessary
to what I'm doing in there. To get around this in a non-platform
specific way, I'm making a detour through BigInt and strings. After a
year or so, when all of the machines are off of 8.04, we can flip it
back to the obvious way (and all of that goes for rmtree
vs. remove_tree in File::Path).

use AmiGO::KVStore::Filesystem;
my $foo = AmiGO::KVStore::Filesystem->new('blah')
$foo->put('a', 'b')
print $foo->get('a')

=cut

package AmiGO::KVStore::Filesystem;

use base 'AmiGO';
#use File::Path;
use File::Slurp;
use Digest::SHA;
#use bignum qw/hex/;
#use bignum;
use Math::BigInt;


my $AFSS_PREFIX = 'afs_';
my $AFSS_SUFFIX = '_files';
my $AFSS_KEY_PREFIX = 'key_';
my $AFSS_WRAP = 1000; # default number of mapable subdirectories.


=item new

Args: name/id, fs wrap (optional int)
Returns:

Creates (or recognizes an extant) filesystem store.

=cut
sub new {

  ##
  my $class = shift;
  my $loc = shift || die "gotta have a name path here $!";
  my $wrap = shift || $AFSS_WRAP;
  my $self = $class->SUPER::new();

  ## Create canonical name.
  $self->{AFSS_LOCATION} =
    $self->amigo_env('AMIGO_CACHE_DIR') . '/' .
      $AFSS_PREFIX . $loc . $AFSS_SUFFIX;

  $self->{AFSS_WRAP} = $wrap;

  ## Create if not already on the filesystem...
  $self->kvetch('checking store: ' . $self->{AFSS_LOCATION});
  if( -d $self->{AFSS_LOCATION} && ! -W $self->{AFSS_LOCATION} ){
    die "some permission issues here...";
  }else{
    $self->kvetch('making store: ' . $self->{AFSS_LOCATION});
    mkdir $self->{AFSS_LOCATION} || die "unable to create directory...";
    chmod 0777, $self->{AFSS_LOCATION} || die "unable to chmod directory...";
  }

  bless $self, $class;
  return $self;
}


## Turn a key into a filesystem location. If that location involves a
## non-existant directory, create it.
sub _make_file_key {

  my $self = shift;
  my $in_key = shift || die "need key here";

  ## Generate subdir.
  # my $shash = hex(Digest::SHA::sha1_hex($in_key));
  # my $sub_int = $shash % $self->{AFSS_WRAP};
  my $shash = Digest::SHA::sha1_hex($in_key);
  my $y = sprintf("0x%s", $shash);
  my $z = Math::BigInt->new($y);
  my $sub_int = $z->bmod( $self->{AFSS_WRAP} );

  $self->kvetch('shash: ' . $shash);
  $self->kvetch('sub_int: ' . $sub_int);

  my $sub_dir =  $self->{AFSS_LOCATION} . '/' . $sub_int;
  if( ! -d $sub_dir ){
    $self->kvetch('making sub-store: ' . $sub_dir);
    mkdir $sub_dir || die "unable to create sub-directory...";
    chmod 0777, $sub_dir || die "unable to make permissive sub-directory...";
  }

  ## Return fully qualified
  return $sub_dir . '/' . $AFSS_KEY_PREFIX . $in_key;
}


=item get

Args: key
Ret: undef or blob--your job to figure out what it is...

=cut
sub get {

  my $self = shift;
  my $key = shift || die "need key here";
  my $retval = undef;

  ##
  my $file_key = $self->_make_file_key($key);
  if( -f $file_key ){
    $retval = read_file($file_key, binmode => ':raw');
  }

  return $retval;
}


=item put

Args: key, blob
Ret: 1/0

=cut
sub put {

  my $self = shift;
  my $key = shift || die "need key";
  my $val = shift || die "need val";

  my $file_key = $self->_make_file_key($key);
  my $retval = write_file($file_key, {binmode => ':raw', atomic => 1}, $val);
  chmod 0666, $file_key || die "permissions problem here...";
  return $retval;
}


=item list

Args: n/a
Returns: array ref of fully qualified strings for AmiGO::KVStore databases.

Useful for cleaning duties.

=cut
sub list {

  my $a = AmiGO->new();
  my @all = glob($a->amigo_env('AMIGO_CACHE_DIR') . '/' .
		 $AFSS_PREFIX . '*' . $AFSS_SUFFIX);

  return \@all;
}



1;
