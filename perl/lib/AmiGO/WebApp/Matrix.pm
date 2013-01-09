=head1 AmiGO::WebApp::Matrix

...

=cut

package AmiGO::WebApp::Matrix;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::WebApp::Input;
use AmiGO::External::HTML::Wiki::BBOPJS;

##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 0;

  ## Configure how the session stuff is going to be handled when and
  ## if it is necessary.
  $self->session_config(CGI_SESSION_OPTIONS =>
			["driver:File",
			 $self->query,
			 {Directory=>
			  $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR')}
			],
			COOKIE_PARAMS => {-path  => '/'},
			SEND_COOKIE => 1);

  ## Templates.
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html');

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
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile();
  $self->_common_params_settings($params);

  ## Page settings.
  $self->set_template_parameter('page_title',
				'Matrix');
  $self->set_template_parameter('content_title',
				'Matrix');
  ##
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'com.jquery.jqamigo.custom',
     ],
     javascript_library =>
     [
      'org.d3',
      'com.jquery',
      'com.jquery-ui',
      'com.jquery.jstree',
      'bbop',
      'amigo',
     ],
     javascript =>
     [
      $self->{JS}->get_lib('Matrix.js')
     ]
    };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  my $jsinit ='MatrixInit();';
  $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));

  $self->add_template_content('pages/matrix.tmpl');
  #$output = $self->generate_template_page({header=>0});
  $output = $self->generate_template_page();

  return $output;
}



1;
