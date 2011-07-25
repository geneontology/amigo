=head1 AmiGO::External::HTML

TODO: Specialize onto HTML resources. Add ??? for EXT_DATA and such.

=cut

use utf8;
use strict;
use XML::XPath;
use Carp;

package AmiGO::External::HTML;

use base ("AmiGO::External");


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  #my $arg = shift || {};

  ## A little XML readying.
  $self->{EXT_DATA} = undef;
  $self->{MATCH} = '<span class=\"mw-headline\">\s*([^\n]*?)<\/span><\/h[3-4]>.*?<pre>\s*(.*?)<\/pre>';
  $self->{EXAMPLES} = undef;

  bless $self, $class;
  return $self;
}


=item get_external_data

Sets up internal data structures.
Returns the HTML string if you really want to play with it.

=cut
sub get_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->get($url);
  };
  if( $@ ){
    $self->kvetch("error in GETing the document from: '$url': $@");
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
    }else{

      ## Grab the content.
      $doc = $mech->content();
      $self->{EXT_DATA} = $doc;
    }
  }

  return $doc;
}



1;
