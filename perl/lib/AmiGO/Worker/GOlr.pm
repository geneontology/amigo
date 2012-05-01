=head1 AmiGO::Worker::GOlr

Base class for things trying to get static consumable data out of an
external GOlr index.

=cut

package AmiGO::Worker::GOlr;
use base ("AmiGO::Worker");

use AmiGO::External::JSON::Solr::GOlr::Document;
#use AmiGO::External::JSON::Solr::GOlr::Search;

=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  $self->{AEJS_GOLR_DOC} = AmiGO::External::JSON::Solr::GOlr::Document->new();
  #$self->{AEJS_GOLR_SEARCH} = AmiGO::External::JSON::Solr::GOlr->new();
  $self->{AWST_DOC} = undef;

  bless $self, $class;
  return $self;
}



1;
