=head1 AmiGO::Worker::GOlr

Base class for things trying to get static consumable data out of an
external GOlr index.

=cut

use utf8;
use strict;

package AmiGO::Worker::GOlr;

use base ("AmiGO::Worker");

use Data::Dumper;
use AmiGO::Aid;
use AmiGO::External::JSON::GOlrDocument;
use AmiGO::External::JSON::GOlrSearch;


=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  $self->{A_AID} = AmiGO::Aid->new();
  $self->{AEJ_GOLR_DOC} = AmiGO::External::JSON::GOlrDocument->new();
  $self->{AEJ_GOLR_SEARCH} = AmiGO::External::JSON::GOlrSearch->new();
  $self->{AWST_DOC} = undef;

  bless $self, $class;
  return $self;
}



1;
