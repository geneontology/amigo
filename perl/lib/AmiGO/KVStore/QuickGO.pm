=head1 AmiGO::KVStore::QuickGO

Wrapper for QuickGO ontology visualization. Final layer in
storage/cache.

=cut

package AmiGO::KVStore::QuickGO;

use base ("AmiGO::KVStore");


=item new

# Sets the right parameters for the super class.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new('qg_ont');

  bless $self, $class;
  return $self;
}



1;
