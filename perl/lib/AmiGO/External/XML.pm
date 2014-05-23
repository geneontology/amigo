=head1 AmiGO::External::XML

Specialize onto XML resources. Add XPATH for EXT_DATA and such.

=cut

use utf8;
use strict;
use XML::XPath;
use Carp;

package AmiGO::External::XML;

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

  bless $self, $class;
  return $self;
}


=item get_external_data

Sets up internal data structures.
Returns the XML string if you really want to play with it.

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

      ## Chew the document.
      $doc = $mech->content();
      eval {
	$self->{EXT_DATA} = XML::XPath->new( xml => $doc );
      };

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("error in document from: '$url': $@");
      }else{
	## Looks like it's well-formed--yay!
      }
    }
  }

  return $doc;
}


=item post_external_data

Sets up internal data structures.
Returns the XML string if you really want to play with it.

=cut
sub post_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $form = shift || {};
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->post($url, $form);
  };
  if( $@ ){
    $self->kvetch("error in POSTing to: '$url': $@");
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
    }else{

      ## Chew the document.
      $doc = $mech->content();
      eval {
	$self->{EXT_DATA} = XML::XPath->new( xml => $doc );
      };

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("error in document from: '$url': $@");
      }else{
	## Looks like it's well-formed--yay!
      }
    }
  }

  return $doc;
}


=item try

Tries to extract a path from a document. May take an optional second
argument for what to return in the case of failure.

=cut
sub try {

  my $self = shift;
  my $path = shift || '';
  my $retval = shift || 0;
  my $context = shift || undef;

  ## Make a safe attempt at a path.
  my $try = undef;
  eval {
    if( $context ){
      $try = $self->{EXT_DATA}->find($path, $context);
    }else{
      $try = $self->{EXT_DATA}->find($path);
    }
  };
  if($@){
    $self->kvetch("error in path from: '$path': $@");
  }else{
    $retval = $try;
  }

  return $retval;
}



1;
