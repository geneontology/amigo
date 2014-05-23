=head1 AmiGO::External::Raw

Pass through any external target with no processing.

=cut


package AmiGO::External::Raw;

use base ("AmiGO::External");


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  #my $arg = shift || {};

  ##.
  $self->{EXT_DATA} = undef;

  bless $self, $class;
  return $self;
}


=item get_external_data

Sets up internal data structures. Uses GET.
Returns the external resource as a string.

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

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("error in document from: '$url': $@");
      }else{
	## Check the document size.
	$self->{EXT_DATA} = $mech->content();
      }
    }
  }

  return $self->{EXT_DATA};
}


=item post_external_data

Sets up internal data structures. Uses POST.

The arguments are a URL and an optional POST "form" pointer from LWP::UserAgent.

Returns the external resource as a string.

=cut
sub post_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $form = shift || undef;
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->post($url, $form);
  };
  if( $@ ){
    $self->kvetch("error in POSTing the document from: '$url': $@");
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
    }else{

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("error in document from: '$url': $@");
      }else{
	## Check the document size.
	$self->{EXT_DATA} = $mech->content();
      }
    }
  }

  return $self->{EXT_DATA};
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
