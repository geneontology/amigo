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

P31946   ,P62258
Q04917,P61981
P31947  baxter
P27348,
P63104 ,  Q96QU6
Q8NCW5 ,

AKT1
CRIM1
EIF2AK3
GHR
GIGYF1
GIGYF2
GRB10
IGF1
IGF1R
IGF2R
IRS1
PIK3R1
PLCB1
TSC2
fluffier
fluffiest

=cut

package AmiGO::WebApp::RTE;
use base 'AmiGO::WebApp';

use YAML qw(LoadFile);
use Clone;
use Data::Dumper;
#use Math::BigFloat;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use CGI::Application::Plugin::Redirect;
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

    ## First things first: decode the file and unfold the resources.
    my $rte_rsrc_loc =
      $self->{CORE}->amigo_env('AMIGO_ROOT') . '/conf/rte_resources.yaml';
    my $resources_list = LoadFile($rte_rsrc_loc);
    my $resources = {};
    foreach my $rli (@$resources_list){
      my $rid = $rli->{id};
      $resources->{$rid} = $rli;
      ## Decide if it is a local or remote logo image.
      my $logo_loc = $resources->{$rid}{logo};
      if( $logo_loc =~ /^http\:\/\// ){
	$resources->{$rid}{local_logo} = '';
	$resources->{$rid}{remote_logo} = $logo_loc;
      }else{
	$resources->{$rid}{local_logo} = $logo_loc;
	$resources->{$rid}{remote_logo} = '';
      }
    }
    my $rsrc = $resources->{$resource};
    if( ! $rsrc ){
      die 'could not resolve incoming resource id';
    }

    ## Pre-process the input a little bit. The input, as we stand
    ## right now, must be newline separated when it goes across the wire.
    ## WS convert.
    ## First, clean out commas--somebody may stick them in there.
    $input =~ s/\,/ /g;
    my $inplist = $self->{CORE}->clean_list($input);
    $input = join("\n", @$inplist);

    ## URL useful for forwarding and examination.
    my $srv = $rsrc->{webservice};
    my $play_url = $srv . '?' .
      'ontology=' . $ontology . '&' .
	'input=' . $input . '&' .
	  'species=' . $species . '&' .
	    'correction=' . $correction . '&' .
	      'format=' . $format;

    ## Forward on HTML argument.
    if( $format eq 'html' ){

      return $self->redirect($play_url, '303 See Other');
      #return $self->mode_fatal("forwarding not yet implemented");

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

      ## TODO/BUG: tab is coming back as json...so make it return xml
      ## and we'll take care of the rest.
      $self->{CORE}->kvetch($play_url);
      if( $te_args->{format} eq 'tab' ){
	  $te_args->{format} = 'xml';
      }

      my $te = AmiGO::External::XMLFast::RemoteTermEnrichment->new($te_args);
      my $got = $te->remote_call($srv);

      ## Get the results out of the resource.
      my $rfm = $te->get_reference_mapped_count() || 0;
      my $rfum = $te->get_reference_unmapped_count() || 0;
      my $ilm = $te->get_input_list_mapped_count() || 0;
      my $ilum = $te->get_input_list_unmapped_count() || 0;
      my $inunm = $te->get_input_list_unmapped_list() || [];
      my $res = $te->get_results() || [];

      my $input_count = $ilm + $ilum;

      ## Try to sort the results. Also, lower the precision.
      my @sorted_res = sort {

	  ## Collect values.
	  my $bp_str = $b->{p_value};
	  my $ap_str = $a->{p_value};
	  my $be_str = $b->{p_expected};
	  my $ae_str = $a->{p_expected};

	  ## Reduce value precision.
	  # Math::BigFloat->precision(-3);
	  # $b->{p_value} = Math::BigFloat->new($bp_str);
	  # $a->{p_value} = Math::BigFloat->new($ap_str);
	  # $b->{expected} = Math::BigFloat->new($be_str);
	  # $a->{expected} = Math::BigFloat->new($ae_str);
	  $b->{p_value} = sprintf("%.3e", $bp_str);
	  $a->{p_value} = sprintf("%.3e", $ap_str);
	  $b->{expected} = sprintf("%.3e", $be_str);
	  $a->{expected} = sprintf("%.3e", $ae_str);

	  ## Try and sort on p-value.
	  if( $ap_str != $bp_str ){
	      return $ap_str <=> $bp_str;
	  }
	  ## Otherwise, try expected value.
	  return $ae_str <=> $be_str;
      } @$res;

      ## Tab results get outputted directly, "xml" results get the
      ## page treatment.
      if( $format eq 'tab' ){

	## Assemble tab output.
	my $lines = [];
	foreach my $r (@$res){
	  push @$lines, join "\t", (
				    $r->{id},
				    $r->{number_in_population},
				    $r->{number_in_sample},
				    $r->{expected},
				    $r->{plus_or_minus},
				    $r->{p_value}
				   );
	}
	$output = join "\n", @$lines;

	## Change header type.
	$self->header_add( -type => 'text/plain' );

      }else{

	## Page settings.
	$self->set_template_parameter('page_title',
				      'Term Enrichment Results');
	$self->set_template_parameter('content_title',
				      'Term Enrichment Results');

	## If we are going to display a page, fill in what we can.
	$self->set_template_parameter('rte_play_url', $play_url);
	#
	$self->set_template_parameter('rte_web_service', $srv);
	$self->set_template_parameter('rte_format', $format);
	$self->set_template_parameter('rte_input', $input);
	$self->set_template_parameter('rte_input_count', $input_count);
	$self->set_template_parameter('rte_species', $species);
	$self->set_template_parameter('rte_ontology', $ontology);
	$self->set_template_parameter('rte_correction', $correction);
	#
	$self->set_template_parameter('rte_resource', $rsrc);
	$self->set_template_parameter('rte_reference_mapped', $rfm);
	$self->set_template_parameter('rte_reference_unmapped', $rfum);
	$self->set_template_parameter('rte_input_list_mapped', $ilm);
	$self->set_template_parameter('rte_input_list_unmapped', $ilum);
	$self->set_template_parameter('rte_input_list_unmapped_list', $inunm);
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
				  'Term Enrichment Service');
    $self->set_template_parameter('content_title',
				  'Term Enrichment Service');

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
