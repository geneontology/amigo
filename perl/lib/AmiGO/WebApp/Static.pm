=head1 AmiGO::WebApp::Static

A cheap way to deploy static docs with proper headers because
CGI::Application::Server is so very very bad.

=cut

package AmiGO::WebApp::Static;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use File::Slurp;
use File::Basename;

use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use AmiGO::Input;

##
sub setup {

  my $self = shift;


  # ## Configure how the session stuff is going to be handled when and
  # ## if it is necessary.
  $self->{STATELESS} = 1;

  $self->mode_param('mode');
  $self->start_mode('deliver');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'deliver' => 'mode_deliver',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## Can handle a path up to five deep.
sub mode_deliver {

  my $self = shift;

  # ## Incoming template.
  # my $i = AmiGO::Input->new($self->query());
  # my $params = $i->input_profile('static');
  ## Grab special variable from C::A::D.
  my $path = $self->param('dispatch_url_remainder') || '';

  my $cont = '';
  my $ctype = 'text/plain';
  # $cont = 'got: ' . join(', ', $path);

  ## Start to drill down and see if this is for real.
  if( ! $path ){
    $self->{CORE}->kvetch('no incoming path');
  }else{

    ## Orient the desired path to our static docs.
    $path = $self->{CORE}->amigo_env('AMIGO_STATIC_PATH') . '/' . $path;

    if( ! -r $path ){
      $self->{CORE}->kvetch('no readable path: ' . $path);
    }else{
      $self->{CORE}->kvetch('will read path: ' . $path);

      ## First, take a guess at the content type.
      $ctype = $self->decide_content_type_by_filename($path);
      $cont =  $self->get_content_by_filename($path);
    }
  }

  ## Finalize.
  $self->header_add('-type' => $ctype);
  return $cont;
}



1;
