=head1 AmiGO::WebApp::Matrix

...

=cut

package AmiGO::WebApp::Matrix;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::Input;
use AmiGO::External::HTML::Wiki::BBOPJS;

##
sub setup {

  my $self = shift;

  # ## Configure how the session stuff is going to be handled when and
  # ## if it is necessary.
  $self->{STATELESS} = 1;
  # $self->{STATELESS} = 0;
  # $self->session_config(CGI_SESSION_OPTIONS =>
  # 			["driver:File",
  # 			 $self->query,
  # 			 {Directory=>
  # 			  $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR')}
  # 			],
  # 			COOKIE_PARAMS => {-path  => '/'},
  # 			SEND_COOKIE => 1);

  $self->mode_param('mode');
  $self->start_mode('matrix');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'matrix'    => 'mode_matrix',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## Maybe how things should look in this framework?
sub mode_matrix {

  my $self = shift;

  ## Incoming template.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  $self->set_template_parameter('page_title', 'Matrix');
  $self->set_template_parameter('content_title', 'Matrix');
  ##
  my $prep =
    {
     css_library =>
     [
      #'standard',
      'com.bootstrap',
      'com.jquery.jqamigo.custom',
      'amigo',
      'bbop'
     ],
     javascript_library =>
     [
      'org.d3',
      'com.jquery',
      'com.bootstrap',
      'com.jquery-ui',
      #'com.jquery.jstree',
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('Matrix.js')
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();',
      'MatrixInit()',
     ],
     content =>
     [
      'pages/matrix.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}



1;
