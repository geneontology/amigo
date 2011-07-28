=head1 AmiGO::Worker

General things that workers will probably want to have to make life
easier.

NOTE: Things used to live here, but not any more. Perhaps this should
take the place of the old AmiGO::Aid then?

=cut

package AmiGO::Worker;
use base ("AmiGO");

#use AmiGO::Aid;
#use GOBO::DBIC::GODBModel::Schema;
#use GOBO::DBIC::GODBModel::Query;
#use GOBO::DBIC::GODBModel::Graph;
#use GOBO::DBIC::GODBModel::Graph2;
#use Time::HiRes qw(gettimeofday tv_interval);


=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  #$self->{SCHEMA} = GOBO::DBIC::GODBModel::Schema->connect($self->db_connector);
  #$self->{GRAPH} = GOBO::DBIC::GODBModel::Graph->new();
  #$self->{GRAPH} = GOBO::DBIC::GODBModel::Graph2->new();
  #$self->{AID} = AmiGO::Aid->new();

  bless $self, $class;
  return $self;
}



1;
