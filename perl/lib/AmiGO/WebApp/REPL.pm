=head1 AmiGO::WebApp::REPL

...

=cut

package AmiGO::WebApp::REPL;
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

  ## Templates.
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('bbop_js');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'bbop_js'    => 'mode_bbop_js',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## TODO/NOTE: These are separate for what again...?
my $tmpl_args =
  {
   title => 'Error!',
   header => 'REPL could not proceed!',
   message => 'This query could not be processed by REPL.',
  };


## Get the session examples from the wiki.
sub _bbop_js_get_session_examples {

  my $self = shift;

  ##
  my $x = AmiGO::External::HTML::Wiki::BBOPJS->new();
  my $examples_list = $x->extract();
  if( scalar(@$examples_list) ){

    ## Push on default.
    unshift @$examples_list,
      {
       title => '(Select example GOlr/BBOP JS session from the wiki)',
       bbopjs => '',
      };
  }

  return $examples_list;
}


## Maybe how things should look in this framework?
sub mode_bbop_js {

  my $self = shift;

  ## Incoming template.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();
  $self->_common_params_settings($params);
  #$params->{STANDARD_CSS} = 'yes';

  # ## ...and the message queue.
  # $self->check_for_condition_files();

  ## Get various examples from the wiki.
  $self->set_template_parameter('bbop_js_examples_list',
				$self->_bbop_js_get_session_examples());

  ## Page settings.
  $self->set_template_parameter('page_title',
				'GOlr/BBOP JS Environment');
  $self->set_template_parameter('content_title',
				'GOlr/BBOP JS Environment');
  ##
  my $prep =
    {
     css_library =>
     [
      #'standard',
      'com.bootstrap',
      'com.jquery.jqamigo.custom',
      #'com.jquery.tablesorter',
      'amigo',
      'bbop'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.bootstrap',
      'com.jquery-ui',
      #'com.jquery.tablesorter',
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('REPL.js')
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();',
      'REPLInit();'
     ],
     content =>
     [
      'pages/repl.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  $output = $self->generate_template_page_with();

  return $output;
}



1;
