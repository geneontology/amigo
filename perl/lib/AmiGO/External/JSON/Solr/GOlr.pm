=head1 AmiGO::External::JSON::Solr::GOlr

Specifically handle GOlr.
Mostly a little extra workaround for the "secure" URLs.

=cut

package AmiGO::External::JSON::Solr::GOlr;
use base ("AmiGO::External::JSON::Solr");

use utf8;
use strict;
use Carp;
use Clone;
use Data::Dumper;

=item new

As before, but we only have access below "select", so trim that out a
little.

=cut
sub new {

  ##
  my $class = shift;
  my $target = shift || undef;
  my $self = $class->SUPER::new($target);

  ## Should be handled by super-class.
  # my $target = shift ||
  #   $self->amigo_env('AMIGO_PUBLIC_GOLR_URL') ||
  #     'http://localhost:8080/solr/';

  # $self->{AEJS_BASE_URL} = $target . 'select?';

  bless $self, $class;
  return $self;
}



1;
