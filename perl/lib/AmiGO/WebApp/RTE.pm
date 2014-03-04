=head1 AmiGO::WebApp::RTE

...

=cut

package AmiGO::WebApp::RTE;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::External::XML::PANTHERTermEnrichment;
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
  $self->start_mode('rte');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'rte'      => 'mode_rte',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## Maybe how things should look in this framework?
sub mode_rte {

  my $self = shift;

  ## Do what I can with parameters.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('remote_term_enrichment');
  my $ontology = $params->{ontology};
  my $input = $params->{input};
  my $species = $params->{species};
  my $correction = $params->{correction};
  my $format = $params->{format}; # forward or process locally
  my $resource = $params->{resource};
  $self->_common_params_settings($params);

  ## If arguments are good, forward or process. Otherwise, if any
  ## argument is out of sort, drop into filled form mode.
  if( $ontology && $input && $species && $correction && $format && $resource ){

    ## TODO: 
    ## Forward on HTML argument.
    if( $format eq 'html' ){
      ## TODO: forward
      return $self->mode_fatal("forwarding not yet implemented");
      #return '';
    }else{
      ## Otherwise, display ourselves.
      my $te_args =
	{
	 'ontology' => $ontology,
	 'input' => $input,
	 'species' => $species,
	 'correction' => $correction,
	 'format' => $format
	};
      my $te = AmiGO::External::XML::PANTHERTermEnrichment->new($te_args);

      ## TODO:

      return $self->mode_fatal("display not yet implemented");
    }

  }else{

    ## Allow people to put in what they want.

    ## Page settings.
    $self->set_template_parameter('page_title',
				  'Remote Term Enrichment');
    $self->set_template_parameter('content_title',
				  'Remote Term Enrichment');

    ## If we are going to display a page, fill in what we can.
    $self->set_template_parameter('rte_ontology', $ontology);
    $self->set_template_parameter('rte_input', $input);
    $self->set_template_parameter('rte_species', $species);
    $self->set_template_parameter('rte_correction', $correction);
    $self->set_template_parameter('rte_format', $format);
    $self->set_template_parameter('rte_resource', $resource);

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
	'com.jquery.tablesorter',
	'bbop',
	'amigo2'
       ],
       javascript =>
       [
	#$self->{JS}->make_var('global_facet1', $facet1),
	#$self->{JS}->make_var('global_facet2', $facet2),
	#$self->{JS}->make_var('global_manager', $manager),
	$self->{JS}->get_lib('GeneralSearchForwarding.js')#,
	#$self->{JS}->get_lib('RTE.js')
       ],
       javascript_init =>
       [
	'GeneralSearchForwardingInit();'#,
	#'RTEInit();'
       ],
       content =>
       [
	'pages/rte.tmpl'
       ]
      };
    $self->add_template_bulk($prep);
    $output = $self->generate_template_page_with();
  }

  return $output;
}


1;
