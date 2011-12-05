=head1 AmiGO::Worker::GOlr

Base class for things trying to get static consumable data out of an
external GOlr index.

=cut

package AmiGO::Worker::GOlr;
use base ("AmiGO::Worker");

##use AmiGO::External::JSON::Solr::GOlrDocument;
use AmiGO::External::JSON::Solr::GOlrDocument;
use AmiGO::External::JSON::Solr::GOlrSearch;

=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  $self->{AEJS_GOLR_DOC} = AmiGO::External::JSON::Solr::GOlrDocument->new();
  $self->{AEJS_SOLR_SEARCH} = AmiGO::External::JSON::Solr->new();
  $self->{AWST_DOC} = undef;

  bless $self, $class;
  return $self;
}



1;
