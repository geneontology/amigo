=head1 AmiGO::External::JSON::Solr::GOlr::Status

...

Usage:
...

=cut

use utf8;
use strict;

package AmiGO::External::JSON::Solr::GOlr::Status;

use base ("AmiGO::External::JSON::Solr::GOlr");
use Date::Format;


=item new

See AmiGO::External::JSON::Solr::GOlr

=cut
sub new {

  ##
  my $class = shift;
  my $args = shift || {};
  my $self = $class->SUPER::new($args);

  ## Setup.
  $self->{EXT_OKAY_P} = 0;
  $self->{EXT_REL} = 'GOlr';
  $self->{EXT_TYPE} = 'Solr';

  ## Try the risky statments
  $self->{AEJS_BASE_HASH}{q} = "*:*";

  if( $self->query() ){
    $self->{EXT_OKAY_P} = 1;
  }

  bless $self, $class;
  return $self;
}


=item alive

...

=cut
sub alive {
  my $self = shift;
  return $self->{EXT_OKAY_P};
}


=item release_name

...

=cut
sub release_name {
  my $self = shift;
  return $self->{EXT_REL} || 'unknown';
}


=item release_type

...

=cut
sub release_type {
  my $self = shift;
  return $self->{EXT_TYPE} || 'unknown';
}


# =item try

# Unnecessary as this resource is single.

# =cut
# sub try { 1; }



1;
