####
#### TODO/BUG: session_id needs to be stored as a cookie, caching reasons, etc.
####
#### TODO: replace internal $core calls with the one saved in
#### AmiGO::WebApp::$self as much as possible (save on things like
#### species caching, etc.)
####

package AmiGO::WebApp::HTMLClient;
use base 'AmiGO::WebApp';

use strict;

##
use AmiGO::WebApp::Input;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use CGI::Application::Plugin::Redirect;
#use AmiGO::Aid::ReferenceGenome;
use AmiGO::Aid;

#use GOBO::DBIC::GODBModel::Schema;
#use JSON;
#use Data::Dumper;

## Real external workers.
#use AmiGO::Worker::GOlr::Term;
#use AmiGO::Worker::Subset;
#use AmiGO::Worker::HomolsetGraph2;
#use AmiGO::Worker::HomolsetSummary2;
#use AmiGO::Worker::GPInformation::HomolsetInformation;

## Helper helping.
#my $aid = AmiGO::Aid::ReferenceGenome->new();
my $aid = AmiGO::Aid->new();


##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 0;

  ## Configure how the session stuff is going to be handled when and
  ## if it is necessary.
  my $sess_dir = $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR');
  $self->session_config(CGI_SESSION_OPTIONS =>
			["driver:File",
			 $self->query,
			 {Directory=>
			  $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR')}
			],
			COOKIE_PARAMS => {-path  => '/'},
			SEND_COOKIE => 1);

  # $self->tt_config(TEMPLATE_OPTIONS =>
  # 		   {INCLUDE_PATH =>
  # 		    $self->{CORE}->amigo_env('AMIGO_ROOT') .
  # 		    '/templates/html'});
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('software_list');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'visualize'           => 'mode_visualize',
		   'software_list'       => 'mode_software_list',
		   'subset_summary'      => 'mode_subset_summary',
		   'live_search_gold'    => 'mode_live_search_gold',
		   'css'                 => 'mode_dynamic_style',
		   'AUTOLOAD'            => 'mode_exception'
		  );
}


## This is just a very thin pass-through client.
## TODO/BUG: not accepting "inline" parameter yet...
sub mode_visualize {

  my $self = shift;
  my $output = '';

  ##
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('visualize');
  my $format = $params->{format};
  my $input_term_data_type = $params->{term_data_type};
  my $input_term_data = $params->{term_data};

  ## Cleanse input data of newlines.
  $input_term_data =~ s/\n/ /gso;

  ## If there is no incoming data, display the "client" page.
  ## Otherwise, forward to render app.
  if( ! defined $input_term_data ){

    ##
    $self->_common_params_settings({title=>'AmiGO: Visualization',
				    'amigo_mode' => 'visualize'});
    $self->add_template_content('html/main/visualize.tmpl');
    $output = $self->generate_template_page();

  }else{

    ## What kind of data do we have?
    #     my $data_type = 'string';
    #     if( $input_term_data_type eq 'json' ){
    #       $data_type = 'json';
    #     }

    #$self->{CORE}->kvetch(Dumper($input_term_data_type));
    #$self->{CORE}->kvetch(Dumper($input_term_data));
    #print STDERR Dumper($input_term_data_type);
    #print STDERR Dumper($input_term_data);
    #print STDERR $input_term_data;

    ## Check to see if this JSON is even parsable...that's really all
    ## that we're doing here.
    if( $input_term_data_type eq 'json' ){
      eval {
	JSON::decode_json($input_term_data);
      };
      if ($@) {
	my $str = 'Your JSON was not formatted correctly...please go back and retry. Look at the "advanced format" documentation for more details.';
	#return $self->mode_die_with_message($str . '<br />' . $@);
	return $self->mode_die_with_message($str);
      }
    }

    ## TODO: Until I can think of something better...
    if( $format eq 'navi' ){

      ## BETA: Just try and squeeze out whatever I can.
      my $in_terms = $self->{CORE}->clean_term_list($input_term_data);
      my $jump = $self->{CORE}->get_interlink({mode=>'layers_graph',
				       arg => {
					       terms => $in_terms,
					      }});
      return $self->redirect($jump, '302 Found');
    }else{
      my $jump = $self->{CORE}->get_interlink({mode=>'visualize',
				       #optional => {url_safe=>1, html_safe=>0},
				       #optional => {html_safe=>0},
				       arg => {
					       format => $format,
					       data_type =>
					       $input_term_data_type,
					       data => $input_term_data,
					      }});
      #$self->{CORE}->kvetch("Jumping to: " . $jump);
      ##
      #$output = $jump;
      return $self->redirect($jump, '302 Found');
    }
  }

  return $output;
}


##
sub mode_software_list {

  my $self = shift;

  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile();

  $self->_common_params_settings({title=>'AmiGO: Software List'});

  ## Where would the ancient demos page hide...?
  my $foo = $self->{CORE}->amigo_env('AMIGO_CGI_PARTIAL_URL');
  $self->set_template_parameter('OLD_LOC', $foo);

  $self->add_template_content('html/main/software_list.tmpl');
  return $self->generate_template_page();
}


##
sub mode_dynamic_style {

  my $self = shift;
  $self->header_add( -type => 'text/css' ); #,-expires=>'+7d');
  my @dstack = ();

  ## 
  my $rg = $aid->species_information($aid->species_list({num_p => 1}));
  foreach my $spc (keys %$rg){
    push @dstack, sprintf('.taxid_%s { background-color: %s }',
			  $spc, $rg->{$spc}{species_color});
  }

  return join("\n", @dstack);
}


## A committed client based on the jQuery libraries and GOlr. The
## future.
sub mode_live_search_gold {

  my $self = shift;

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please
  $self->set_template_parameter('STANDARD_CSS', 'no');

  ## Grab resources we want.
  $self->set_template_parameter('STAR_IMAGE',
				$self->{CORE}->get_image_resource('star'));

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard',
      #'com.jquery.redmond.custom',
      'com.jquery.jqamigo.custom',
      'org.bbop.amigo.ui.widgets'
      #'org.bbop.amigo.ui.interactive'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      #'org.bbop.amigo.live_search',
      'org.bbop.amigo.ui.widgets',
      'org.bbop.amigo.ui.interactive'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('LiveSearchGOlr.js')
     ],
     javascript_init =>
     [
      'LiveSearchGOlrInit();'
     ],
     content =>
     [
      'html/main/live_search_gold.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page();
}



1;
