=head1 AmiGO::WebApp::REPL

...

=cut

package AmiGO::WebApp::REPL;
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
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile();
  $self->_common_params_settings($params);
  #$params->{STANDARD_CSS} = 'yes';

  ## ...and the message queue.
  $self->check_for_condition_files();

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
      #'standard', # basic GO-styles
      'com.jquery.jqamigo.custom',
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'com.jquery.jstree',
      'bbop',
      'amigo',
     ],
     javascript =>
     [
      $self->{JS}->get_lib('REPL.js')
     ]
    };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  my $jsinit ='REPLInit();';
  $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));

  ## BUG?: Juggle onto absolute version of header template.
  #$self->set_template_parameter('page_name', 'amigo'); # menu bar okay
  #$self->set_template_parameter('is_bbop_js_p', '1'); # ...but we are bbop_js
  #$self->set_template_parameter('page_name', 'bbop_js'); # rm menu bar
  #$self->add_template_content('common/header.tmpl');
  $self->add_template_content('pages/repl.tmpl');
  #$output = $self->generate_template_page({header=>0});
  $output = $self->generate_template_page();

  return $output;
}



1;
