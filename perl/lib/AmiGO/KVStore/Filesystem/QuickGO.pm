=head1 AmiGO::KVStore::Filesystem::QuickGO

Wrapper for QuickGO ontology visualization. Final layer in
storage/cache.

=cut

package AmiGO::KVStore::Filesystem::QuickGO;

use base 'AmiGO::KVStore::Filesystem';


=item new

# Sets the right parameters for the super class.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new('qg_ont', 200);

  bless $self, $class;
  return $self;
}



1;
