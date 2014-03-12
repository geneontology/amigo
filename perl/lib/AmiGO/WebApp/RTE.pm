=head1 AmiGO::WebApp::RTE

P31946
P62258
Q04917
P61981
P31947
P27348
P63104
Q96QU6
Q8NCW5

=cut

package AmiGO::WebApp::RTE;
use base 'AmiGO::WebApp';

use Clone;
use Data::Dumper;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::External::XMLFast::RemoteTermEnrichment;
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

    ## First things first: decode the resource.
    ## TODO: this will be from an external file in the future, but
    ## just PANTHER for now.
    my $resources =
      {
       'PANTHER' =>
       {
	'id' => 'PANTHER', # same as above
	'label' => 'PANTHER',
	'description' => '',
	# 'website' =>'http://173.255.211.222:8050/',
	# 'webservice' => 'http://173.255.211.222:8050/webservices/go/overrep.jsp',
	'website' => 'http://panthertest2.usc.edu:8086',
	'webservice' => 'http://panthertest2.usc.edu:8086/webservices/go/overrep.jsp',
	'remote_logo' => '',
	'local_logo' => 'logo_panther.jpg',
       }
      };
    my $rsrc = $resources->{$resource};
    if( ! $rsrc ){
      die 'could not resolve incoming resource id';
    }

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
      my $te = AmiGO::External::XMLFast::RemoteTermEnrichment->new($te_args);
      my $got = $te->remote_call($rsrc->{webservice});

      ## Get the results out of the resource.
      my $rfm = $te->get_reference_mapped() || 0;
      my $rfum = $te->get_reference_unmapped() || 0;
      my $ilm = $te->get_input_list_mapped() || 0;
      my $ilum = $te->get_input_list_unmapped() || 0;
      my $res = $te->get_results() || [];

      ## Try and sort the results.
      my @sorted_res = sort {
	my $bp_str = $b->{p_value};
	my $ap_str = $b->{p_value};
	return $ap_str <=> $bp_str;
      } @$res;

      ## Page settings.
      $self->set_template_parameter('page_title',
				    'Remote Term Enrichment Results');
      $self->set_template_parameter('content_title',
				    'Remote Term Enrichment Results');

      ## If we are going to display a page, fill in what we can.
      $self->set_template_parameter('rte_resource', $rsrc);
      $self->set_template_parameter('rte_reference_mapped', $rfm);
      $self->set_template_parameter('rte_reference_unmapped', $rfum);
      $self->set_template_parameter('rte_input_list_mapped', $ilm);
      $self->set_template_parameter('rte_input_list_unmapped', $ilum);
      $self->set_template_parameter('rte_results', \@sorted_res);

      ## 
      my $prep =
	{
	 css_library =>['com.bootstrap', 'com.jquery.jqamigo.custom',
			'amigo','bbop'],
	 javascript_library =>['com.jquery','com.bootstrap','com.jquery-ui',
			       'com.jquery.tablesorter','bbop','amigo2'],
	 javascript =>[$self->{JS}->get_lib('GeneralSearchForwarding.js')],
	 javascript_init =>['GeneralSearchForwardingInit();'],
	 content => ['pages/rte_results.tmpl']
	};
      $self->add_template_bulk($prep);
      $output = $self->generate_template_page_with();
    }

  }else{

    ## Allow people to put in what they want.
    ## Is it their first time?
    my $first_time_p = 1;
    if( $ontology || $input || $species || $correction || $format || $resource ){
      $first_time_p = 0;
    }

    ## Page settings.
    $self->set_template_parameter('page_title',
				  'Remote Term Enrichment');
    $self->set_template_parameter('content_title',
				  'Remote Term Enrichment');

    ## If we are going to display a page, fill in what we can.
    $self->set_template_parameter('first_time_p', $first_time_p);
    $self->set_template_parameter('rte_ontology', $ontology);
    $self->set_template_parameter('rte_input', $input);
    $self->set_template_parameter('rte_species', $species);
    $self->set_template_parameter('rte_correction', $correction);
    $self->set_template_parameter('rte_format', $format);
    $self->set_template_parameter('rte_resource', $resource);

    ## 
    my $prep =
      {
       css_library =>['com.bootstrap', 'com.jquery.jqamigo.custom',
		      'amigo','bbop'],
       javascript_library =>['com.jquery','com.bootstrap','com.jquery-ui',
			     'com.jquery.tablesorter','bbop','amigo2'],
       javascript =>[$self->{JS}->get_lib('GeneralSearchForwarding.js')],
       javascript_init =>['GeneralSearchForwardingInit();'],
       content => ['pages/rte.tmpl']
      };
    $self->add_template_bulk($prep);
    $output = $self->generate_template_page_with();
  }

  return $output;
}


1;
