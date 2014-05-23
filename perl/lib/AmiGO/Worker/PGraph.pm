=head1 AmiGO::Worker::PGraph

TODO:

=cut

package AmiGO::Worker::PGraph;
use base ("AmiGO::Worker");


=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  #my $term_list = shift || [];
  #$self->{AV_TERMS} = undef;

  bless $self, $class;
  return $self;
}



1;
