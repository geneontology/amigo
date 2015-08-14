=head1 AmiGO::WebApp::Xrefs

...

=cut

package AmiGO::WebApp::Xrefs;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::Input;

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

  # ## Templates.
  # $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
  # 			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('xrefs');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'xrefs'    => 'mode_xrefs',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## Maybe how things should look in this framework?
sub mode_xrefs {

  my $self = shift;

  ## No parameters.
  $self->_common_params_settings($params);

  ## Page settings.
  my $page_name = 'xrefs';
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Assemble something that can be nicely rendered in order.
  my $all = $self->{CORE}->database_bulk();
  my @unsorted_all = ();
  foreach my $db (keys $all){
    my $entry = $all->{$db};
    push @unsorted_all, $entry;
  }
  my @sorted_all = sort {$a->{id} cmp $b->{id}} @unsorted_all;

  $self->set_template_parameter('xref_data', \@sorted_all);

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
      'com.jquery',
      'com.bootstrap',
      'com.jquery-ui',
      #'com.jquery.tablesorter',
      'bbop',
      'amigo2'
     ],
     javascript =>
     [
      #$self->{JS}->make_var('global_facet1', $facet1),
      #$self->{JS}->make_var('global_facet2', $facet2),
      #$self->{JS}->make_var('global_manager', $manager),
      $self->{JS}->get_lib('GeneralSearchForwarding.js')#,
      #$self->{JS}->get_lib('Xrefs.js')
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();'#,
	#'XrefsInit();'
     ],
     content =>
     [
      'pages/xrefs.tmpl'
     ]
    };
  $self->add_template_bulk($prep);
  $output = $self->generate_template_page_with();
  return $output;
}



1;
