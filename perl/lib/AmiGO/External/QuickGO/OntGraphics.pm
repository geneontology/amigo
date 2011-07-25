=head1 AmiGO::External::QuickGO::OntGraphics

Pass through any external target with no processing.

=cut


package AmiGO::External::QuickGO::OntGraphics;

use base ("AmiGO::External::Raw");
use AmiGO::KVStore;


=item $URL_FOR_QUICKGO_IMAGE

This is the URL that points to the QuickGO services API.

=cut
my $URL_FOR_QUICKGO_IMAGE =
  'http://www.ebi.ac.uk/QuickGO/GMultiTerm?format=image&id=';


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  #my $arg = shift || {};

  ## Since we're not doing this work, let's give ourselves a larger
  ## window.
  $self->{MECH}->timeout(5);

  ##.
  $self->{EXT_DATA} = undef;

  bless $self, $class;
  return $self;
}


=item get_graph_image

...

=cut
sub get_graph_image {

  ##
  my $self = shift;
  my $acc = shift || die "acc required $!";
  my $url = shift || $URL_FOR_QUICKGO_IMAGE . $acc;
  return $self->get_external_data($url);
}


=item try

Basically does nothing here...
TODO: Maybe this should make an attempt to parse given a function?

=cut
sub try {

  my $self = shift;
  # my $path = shift || '';
  my $retval = shift || 0;

  ## Make a safe attempt at a path.
  my $try = undef;
  eval {
    $try = $self->{EXT_DATA};
  };
  if($@){
    $self->kvetch("error: $@");
  }else{
    $retval = $try;
  }

  return $retval;
}



1;
