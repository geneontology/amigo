####
#### TODO/BUG: session_id needs to be stored as a cookie, caching
#### reasons, etc.
####
#### TODO: replace internal $core calls with the one saved in
#### AmiGO::WebApp::$self as much as possible (save on things like
#### species caching, etc.)
####

package AmiGO::WebApp::HTMLClient;
use base 'AmiGO::WebApp';

use strict;
use utf8;
use Data::Dumper;

##
use AmiGO::Input;
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use CGI::Application::Plugin::Redirect;

# ## Internal workers.
# use AmiGO::ChewableGraph;

## Real external workers.
use AmiGO::Worker::GOlr::Term;
use AmiGO::Worker::GOlr::GeneProduct;
use AmiGO::Worker::GOlr::ModelAnnotation;
use AmiGO::External::QuickGO::Term;
use AmiGO::External::XML::GONUTS;
#use AmiGO::External::Raw;

## TODO: Maybe make this a worker later when we get the feel for it.
use AmiGO::External::JSON::Solr::GOlr::Search;


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
  $self->start_mode('landing');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   ## Special cases.
		   'special'             => 'mode_special',
		   ## Standard.
		   'landing'             => 'mode_landing',
		   #'search'              => 'mode_live_search',
		   'search'              => 'mode_search',
		   'specific_search'     => 'mode_search',
		   'bulk_search'         => 'mode_bulk_search',
		   'browse'              => 'mode_browse',
		   'dd_browse'           => 'mode_dd_browse',
		   'base_statistics'     => 'mode_base_statistics',
		   'free_browse'         => 'mode_free_browse',
		   'term'                => 'mode_term_details',
		   'gene_product'        => 'mode_gene_product_details',
		   'model'               => 'mode_model_details',
		   'biology'             => 'mode_model_biology',
		   'software_list'       => 'mode_software_list',
		   'schema_details'      => 'mode_schema_details',
		   'load_details'        => 'mode_load_details',
		   'owltools_details'    => 'mode_owltools_details',
		   'medial_search'       => 'mode_medial_search',
		   ## ???
		   'phylo_graph'         => 'mode_phylo_graph',
		   ## Fallback.
		   'simple_search'       => 'mode_simple_search',
		   'AUTOLOAD'            => 'mode_exception'
		  );
}


###
### Helper functions.
###


## Now add the filters that come in from the YAML-defined simple
## public bookmarking API.
sub _add_search_bookmark_api_to_filters {
    my $self = shift;
    my $params = shift || {};
    my $filters = shift || {};

    ## Going through all of the configured argument to GOlr maps,
    ## check them and add them to the standard 'fq' filters.
    my $bmapi = $self->{CORE}->bookmark_api_configuration();
    foreach my $entry ( keys(%$bmapi) ){
	if( $params->{$entry} ){

	    ## Pull the current filter and ensure an array.
	    my $items = $params->{$entry} || [];
	    $items = [$items] if ref($items) ne 'ARRAY';

	    foreach my $item (@$items){
		my $map_to = $bmapi->{$entry};
		
		## Check to see if it is a negative call or not.
		my $created_filter = undef;
		my $possible_neg = substr($item, 0, 1);
		if( $possible_neg ne '-' ){
		    $created_filter = $map_to . ':"' . $item . '"';
		}else{
		    ## Extract the rest of the string and add a
		    ## negative filter.
		    my $stripped_item = substr($item, 1, length($item));
		    $created_filter = '-'. $map_to .':"'. $stripped_item .'"';
		}
		push @$filters, $created_filter;
		$self->{CORE}->kvetch('BMAPI: ' . $created_filter);
	    }
	}
    }
    return $filters;
}


###
### Run modes.
###


## Special runmode for special cases. Current use occurs with serving
## static content from root in embedded mode. Right now, specifically
## robots.txt. See AmiGO::dynamic_dispatch_table_amigo for more
## discussion.
sub mode_special {

  my $self = shift;

  my $path = $self->{CORE}->amigo_env('AMIGO_STATIC_PATH') . '/robots.txt';

  my $ctype = 'text/plain';
  my $cont = '';

  if( ! -r $path ){
    $self->{CORE}->kvetch('no readable path: ' . $path);
  }else{
    $self->{CORE}->kvetch('will read path: ' . $path);
    $ctype = $self->decide_content_type_by_filename($path);
    $cont = $self->get_content_by_filename($path);

    $self->{CORE}->kvetch('birf: ' . $ctype);
    $self->{CORE}->kvetch('barf: ' . $cont);
  }

  ## Finalize.
  $self->header_add('-type' => $ctype);
  return $cont;
}


##
sub mode_landing {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'landing';
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
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
      #'bbop',
      #'amigo2'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('LandingGraphs.js')
     ],
     content =>
     [
      'pages/landing.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  #return $self->generate_template_page_with();
  return $self->generate_template_page_with({search=>0});
}


##
sub mode_browse {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'browse';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Get the layout info to describe which buttons should be
  ## generated.
  #my $bbinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_BROWSE');
  #$self->set_template_parameter('browse_button_info', $bbinfo);
  ## Pick the first to be the default.
  #my $sb = $$bbinfo[0]->{id};
  #$self->set_template_parameter('starting_button', $sb);

  ## Our AmiGO services CSS.
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
      'bbop',
      'amigo2'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('Browse.js')
     ],
     javascript_init =>
     [
      'BrowseInit();'
     ],
     content =>
     [
      'pages/browse.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_dd_browse {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'dd_browse';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Get the layout info to describe which buttons should be
  ## generated.
  #my $bbinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_BROWSE');
  #$self->set_template_parameter('browse_button_info', $bbinfo);
  ## Pick the first to be the default.
  #my $sb = $$bbinfo[0]->{id};
  #$self->set_template_parameter('starting_button', $sb);

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      #'standard',
      'com.bootstrap',
      'com.jquery.jqamigo.custom',
      'com.jstree',
      'amigo',
      'bbop'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.bootstrap',
      'com.jquery-ui',
      'com.jstree'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('DDBrowse.js')
     ],
     content =>
     [
      'pages/dd_browse.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_base_statistics {

=head1 AmiGO::WebApp

Mostly super class stuff for clients. This should be bringing in the
CGI::Application stuff that we'll be needing.

Also, here we'll be handling the basics of the cart and preferences
(both abstracted parts of the session), and the database connection
(which actually should maybe be tossed into the data section under an
ORM, with only the meta-stuff for display residing here).

I've started adding the cart logic here as well--it should be useful
to all clients.

NOTE: this will eventually be separated into a common superclass for
HTML and JSON flavored user classes.

=cut
package AmiGO::WebApp;

use base 'CGI::Application';

use CGI::Application::Plugin::Forward;
use AmiGO;
use AmiGO::JSON;
use AmiGO::JavaScript;
use AmiGO::CSS;
use DBI;
use Data::Dumper;
use File::Slurp;
use File::Basename;


## NOTE: This will run on app init (once even in a mod_perl env).
## Perform some project-specific init behavior
## such as to load settings from a database or file.
## Maybe : Get params, connect to DB, get meta-info, etc.
sub cgiapp_init {
  my $self = shift;

  ## ...
  $self->{CORE} = AmiGO->new();
  $self->{JS} = AmiGO::JavaScript->new();
  $self->{CSS} = AmiGO::CSS->new();

  # ## Say goonight, Gracie.
  # $self->{CORE}->kvetch('running: '. $self->get_current_runmode() || '???');

  ## Make the encoding something usable--a Windows encoding seems to
  ## be default.
  $self->header_add(-type => "text/html; charset=UTF-8");

  ## What the default prefix looks like.
  $self->{SESSION_STRING} = 'cgisess_';

  ## Which template set to use when rendering.
  $self->{AW_TEMPLATE_SET} = undef;

  ## Pull the different search information that we'll use for the
  ## menus and pages.
  if( defined $self->{AW_SEARCH_LIST} ){
    $self->{CORE}->kvetch('already have assembled layouts');
  }else{
    $self->{CORE}->kvetch('create assembled layouts variable');

    ## Pulling: AMIGO_LAYOUT_SEARCH
    my $search_list_to_try =
	$self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_SEARCH');
    my $golr_conf = $self->{CORE}->golr_configuration();
    my $search_list = [];
    foreach my $search_entry (@$search_list_to_try){
      my $search_entry_id = $search_entry->{'id'};

      $self->{CORE}->kvetch('   entry: ' . $search_entry_id);
      if( defined $golr_conf->{$search_entry_id} ){
	## Add in the search link.
	my $item_conf = $golr_conf->{$search_entry_id};
	## Add live search link.
	$item_conf->{'amigo_live_search_interlink'} =
	  $self->{CORE}->get_interlink({mode=>'live_search',
					arg=>{type=>$search_entry_id}});
	# $self->{CORE}->kvetch('live search layout a2i: '.
	# 		      $item_conf->{amigo_live_search_interlink});
	## Add bulk search link.
	$item_conf->{'amigo_bulk_search_interlink'} =
	  $self->{CORE}->get_interlink({mode=>'bulk_search',
					arg=>{type=>$search_entry_id}});
	# $self->{CORE}->kvetch('bulk search layout a2i: '.
	# 		      $item_conf->{amigo_bulk_search_interlink});
	## Add to generic list.
	push @$search_list, $item_conf;
      }else{
	$self->{CORE}->kvetch('unable to find search layout entry: ' .
			      $search_entry_id);
      }
    }
    $self->{AW_SEARCH_LIST} = $search_list;
  }

  ## TODO: change the default. I wanted to do the below, but it seemed
  ## to prevent the application's ability to recover a previous
  ## session.
  #   $CGI::Session::Driver::file::FileName =
  #     $self->{SESSION_STRING} . '%s.perl.dat';
}

## NOTE: This will run on every request (once in a CGI env, maybe many
## times in a mod_perl env).
sub cgiapp_prerun {

  my $self = shift;

  ## DEBUG
  $self->{CORE}->kvetch("_in prerun for mode: " . $self->get_current_runmode());

  ## Structures needed for internal template handling.
  $self->{CORE}->kvetch("_in prerun...defining template structures");
  $self->{WEBAPP_CSS} = [];
  $self->{WEBAPP_JAVASCRIPT} = [];
  $self->{WEBAPP_CONTENT} = [];
  $self->{WEBAPP_TEMPLATE_PARAMS} = {};

  ## Make sure we have the right path for our internal system.
  ## Default to the current sane base.
  my $tmpl_local_set = $self->{CORE}->amigo_env('AMIGO_TEMPLATE_SET') || 'bs3';
  $self->template_set($tmpl_local_set);

  ## Setup template environment.
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html/' . $self->template_set());

  ## Hold on to the various message queues.
  $self->{WEBAPP_MQ} =
    {
     'error' => [],
     'warning' => [],
     'notice' => [],
     'success' => [],
    };

  ## Basic variable definitions.
  $self->{CORE}->kvetch("_in prerun...defining variables");
  $self->_common_params_settings();

  ## If we are stateless, don't worry about sessions, carts, etc...
  if( $self->{STATELESS} ){
    $self->{CORE}->kvetch("_in prerun...we are stateless");
    ## Empty?
  }else{

    $self->{CORE}->kvetch("_in prerun...we are stateful");

    ## TODO?: Check for the bookmark flag which will override the
    ## session handling stuff, and create a new session based on the
    ## incoming parameters.

    ## Will retrieve session if found, and otherwise create one. If
    ## you want more control (say for expired or empty), try using
    ## load.
    my $session = $self->session;

    ## TODO: This is where when we'll save our session stuff.
    $self->{CORE}->kvetch("_in prerun...setting up session");
    $self->{CORE}->kvetch("_in prerun...id will be: " . $session->id());

    ## Let's work on handling this session a little bit...
    if( $session->is_new ){
      $self->{CORE}->kvetch("_in prerun...have new session");
    }else{
      $self->{CORE}->kvetch("_in prerun...using old session");
    }

    ## SQLite3 session db instantiation.
    $self->session_db_soft_create_from_sid($session->id());

#     ###
#     ### Essentially, session db unit testing. TODO: split out of here for
#     ### heaven's sake!
#     ###

#     ## WS adding tests.
#     $self->session_db_add_workspace('default');
#     $self->session_db_add_workspace('foo');
#     $self->session_db_add_workspace('foo');

#     ## WS listing tests.
#     $self->session_db_list_workspaces();

#     ## Item adding tests.
#     $self->session_db_add_item({key=>'GO:123', name=>'bar'});
#     $self->session_db_add_item({key=>'GO:456'}, 'default');
#     $self->session_db_add_item({key=>'GO:789', name=>'bar'});
#     $self->session_db_add_item({key=>'GO:abc',name=>'bar'},'foo');
#     $self->session_db_add_item({key=>'GO:def'}, 'foo');
#     $self->session_db_add_item({key=>'GO:nan'}, 'bar');

#     ## Item listing tests.
#     $self->session_db_list_workspace_items();
#     $self->session_db_list_workspace_items('foo');
#     $self->session_db_list_workspace_items('bar');

#     ## WS clearing test.
#     $self->session_db_clear_workspace('foo');
#     $self->session_db_add_item({key=>'GO:ghi'}, 'foo');
#     $self->session_db_list_workspace_items('foo');

#     ## Item remove tests.
#     $self->session_db_remove_item('GO:789');
#     $self->session_db_remove_item('GO:asdfasdf');
#     $self->session_db_remove_item('GO:asdfasdf', 'foo');
#     $self->session_db_remove_item('GO:asdfasdf', 'bar');
#     $self->session_db_list_workspace_items();
#     $self->session_db_list_workspace_items('foo');

#     ## WS remove tests.
#     $self->session_db_remove_workspace();
#     $self->session_db_remove_workspace('foo');
#     $self->session_db_list_workspace_items('foo');
#     $self->session_db_list_workspaces();

    ## 1) Make sure that at least workspaces here
    ## TODO: and it is well-formed.
    #   my $workspaces = $session->param('workspaces');
    #   if( ! defined( $workspaces ) || ! $workspaces ){
    #     $self->{CORE}->kvetch("_in prerun...reseting workspaces...");
    #     $session->param('workspaces', {default => undef});
    #   }

#     $self->_workspace_safety();
#     ## Make sure that everything in workspaces is well-defined.
#     my $workspaces = $session->param('workspaces');
#     foreach my $workspace_name (keys %$workspaces){
#       $self->_workspace_safety($workspace_name);
#     }
  }

  ## Okay, here we're going to add a little system of passing messages
  ## globally through filesystem manipulation.
  my $root_dir = $self->{CORE}->amigo_env('AMIGO_DYNAMIC_PATH');
  my @root_a_files = glob($root_dir . '/.amigo.*');
  foreach my $afile (@root_a_files){
    if( $afile =~ /\.amigo\.success.*/ ){
      my $cstr = _min_slurp($afile);
      $self->add_mq('success', $cstr) if $cstr;
    }elsif( $afile =~ /\.amigo\.notice.*/ ){
      my $cstr = _min_slurp($afile);
      $self->add_mq('notice', $cstr) if $cstr;
    }elsif( $afile =~ /\.amigo\.warning.*/ ){
      my $cstr = _min_slurp($afile);
      $self->add_mq('warning', $cstr) if $cstr;
    }elsif( $afile =~ /\.amigo\.error.*/ ){
      my $cstr = _min_slurp($afile);
      $self->add_mq('error', $cstr) if $cstr;
    }else{
      ## Everything else is ignored.
    }
  }

  ## We are also going to bail out early if it looks like our
  ## environment is bad and we have the balancer flag set.
  my $reportable_error = undef;
  if( $self->{CORE}->amigo_env('AMIGO_BALANCER') ){
    #foreach my $queue (("warning", "error")){
    foreach my $queue (("error")){ # warnings aren't always bad?
      my $messages = $self->get_mq($queue);
      foreach my $message (@$messages){
	## Grab the last message.
	$reportable_error = $queue . ': ' . $message;
      }
    }
  }
  ## Trip if there is a reportable error.
  if( defined($reportable_error) ){
    ## The journey ends here.
    #$self->{CORE}->kvetch("done with status $code and message ($message)");
    #$self->_status_message_exit(503, $reportable_error);
    my $final_err = $self->mode_fatal($reportable_error);
    $self->_status_message_exit(503, $final_err);
    exit;
  }
}

## NOTE: typical post processing purposes...
#   * Your run modes return structured data (such as XML), which you
#     want to transform using a standard mechanism (such as XSLT).
#   * You want to post-process CGI-App output through another system,
#     such as HTML::Mason.
#   * You want to modify HTTP headers in a particular way across all
#     run modes, based on particular criteria.
sub cgiapp_postrun {
  my $self = shift;

  ## If we are stateless, don't worry about sessions, carts, etc...
  if( $self->{STATELESS} ){
    ## Empty?
    $self->{CORE}->kvetch("_in postrun...still stateless");
  }else{

    ## Disconnecting from sqlite3 db.
    $self->{CORE}->kvetch("_in postrun...severing session db connection");
    $self->{SESSION_DB}->disconnect();

    ## TODO: This is where when we'll save our session stuff.
    $self->{CORE}->kvetch("_in postrun...saving and transmitting session");
    my $session = $self->session;
    $self->session->flush();
  }
}


=item add_mq

Args: queue string and message string
Returns: the message added to the queue or undef if no such queue was found

=cut
sub add_mq {
  my $self = shift;
  my $queue = shift || die "need to define a queue";
  my $message = shift || die "need to define a queue";
  my $retval = undef;

  if( defined $self->{WEBAPP_MQ}{$queue} ){
    push @{$self->{WEBAPP_MQ}{$queue}}, $message;
    $retval = $message;
  }

  return $retval;
}


=item flush_mq

Args: queue string
Returns: true if messages were flushed, false otherwise

=cut
sub flush_mq {
  my $self = shift;
  my $queue = shift || die "need to define a queue";
  my $retval = 0;

  if( defined $self->{WEBAPP_MQ}{$queue} &&
      scalar( @{$self->{WEBAPP_MQ}{$queue}} ) ){
    $retval = 1;
  }
  $self->{WEBAPP_MQ}{$queue} = [];

  return $retval;
}


=item get_mq

Args: queue string
Returns: aref of message strings or undef if no such queue

=cut
sub get_mq {
  my $self = shift;
  my $queue = shift || die "need to define a queue";
  my $retval = undef;

  if( defined $self->{WEBAPP_MQ}{$queue} ){
    $retval = $self->{WEBAPP_MQ}{$queue};
  }

  return $retval;
}


=item decide_content_type_by_filename

Args: filename
Returns: content type as string

=cut
sub decide_content_type_by_filename {
  my $self = shift;
  my $path = shift || '';

  my $ctype = 'text/plain';

  ## First, take a guess at the content type.
  my($fname, $fpath, $fsuffix) = fileparse($path, qr/\.[^.]*/);
  #$self->{CORE}->kvetch('content type identified suffix: ' . $fsuffix);
  if( $fsuffix eq '.css' ){
      $ctype = 'text/css';
  }elsif( $fsuffix eq '.html' ){
      $ctype = 'text/html';
  }elsif( $fsuffix eq '.js' ){
      $ctype = 'text/javascript';
  }elsif( $fsuffix eq '.gif' ){
      $ctype = 'image/gif';
  }elsif( $fsuffix eq '.png' ){
      $ctype = 'image/png';
  }elsif( $fsuffix eq '.jpg' ){
      $ctype = 'image/jpeg';
  }elsif( $fsuffix eq '.jpeg' ){
      $ctype = 'image/jpeg';
  }elsif( $fsuffix eq '.ico' ){
      $ctype = 'image/x-icon';
  }elsif( $fsuffix eq '.txt' ){
      $ctype = 'text/plain';
  }elsif( $fsuffix eq '.text' ){
      $ctype = 'text/plain';
  }
  
  return $ctype;
}


=item get_content_by_filename

Args: filename
Returns: content as string, raw or text depending

=cut
sub get_content_by_filename {
  my $self = shift;
  my $path = shift || '';

  my $cont = '';
  my $ctype = $self->decide_content_type_by_filename($path);

  ## Next, get the content according to type.
  if( $ctype eq 'text/css' ||
      $ctype eq 'text/html' ||
      $ctype eq 'text/javascript' ){
      $cont = read_file($path);
  }else{
      ## All else as binary.
      $cont = read_file($path, { binmode => ':raw' });
  }
  
  return $cont;
}


=item galaxy_settings

Args: GALAXY_URL (invalid okay) and 1 on it being an external setting

Side effects: adds 'galaxy_url', and 'galaxy_url_external_p' to the
template parameters as well as adding an mq notice when the URL is
external and a global_galaxy_url variable for JS if extant.

Returns: true when it has had side-effects

=cut
sub galaxy_settings {
  my $self = shift;
  my $retval = 0;

  my $in_galaxy = shift || '';
  my $galaxy_external_p = shift || undef;

  if( $in_galaxy ){
    $retval = 1;
    $self->set_template_parameter('galaxy_url', $in_galaxy);
    $self->set_template_parameter('galaxy_url_external_p', $galaxy_external_p);
    if( $galaxy_external_p ){
      $self->add_mq('notice', 'Welcome Galaxy visitor!');
    }

    ## Add a global galaxy URL if we're good.
    my $gjs = $self->{JS}->make_var('global_galaxy_url', $in_galaxy);
    $self->add_template_javascript($gjs);
  }

  return $retval;
}

#sub cgiapp_get_query {
#  my $self = shift;
#  require CGI;
#  return  CGI->new();
#}

###
### New (sqlite3-based) workspace handling. All functions should
### return undef in case of an error. TODO: actually add that
### invariant--some are just returning the constant 1;
###

sub session_db_soft_create_from_sid {
  my $self = shift;
  my $sid = shift || die "sid is a required argument: $!";

  my $sess_str = $self->{SESSION_STRING} || '';
  my $as_rdir = $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR') || '';
  my $dbloc = $as_rdir . '/' . $sess_str . $sid . '.sqlite3.db';

  #my $retval = 0;
  my $dbh = undef;
  if( -f $dbloc ){
    $self->{CORE}->kvetch("_in sdb...found session db");
    $dbh = DBI->connect( "dbi:SQLite:dbname=" . $dbloc, "", "" )
      or die $dbh->errstr;
  }else{

    ## Create by connection.
    $self->{CORE}->kvetch("_in sdb...creating session db: " . $dbloc);
    $dbh = DBI->connect( "dbi:SQLite:dbname=" . $dbloc, "", "" )
      or die $dbh->errstr;

    ## Two tables, and workspace id 1 is special to us.
    my $id = 'id INTEGER PRIMARY KEY';
    my $date = 'date DATE';

    ## Table: workspace
    $dbh->do( 'CREATE TABLE workspace (' . $id . ',name);' )
      or die $dbh->errstr;

    ## Table: item
    $dbh->do( 'CREATE TABLE item (' . $id . ',workspace_id,key,name,'. $date .');' )
      or die $dbh->errstr;

    ## Trigger to enter time on item insert.
    $dbh->do( "CREATE TRIGGER insert_item_date AFTER INSERT ON item BEGIN UPDATE item SET date = DATETIME('NOW') WHERE rowid = new.rowid; END;" )
      or die $dbh->errstr;

    ## Initial insert 'default' (special) workspace.
    $dbh->do( "INSERT INTO workspace(name) VALUES(\'default\');" )
      or die $dbh->errstr;
  }

  $self->{SESSION_DB} = $dbh;

  return 1;
}


## Add workspace of name (string).
sub session_db_add_workspace {

  my $self = shift;
  my $ws_name = shift || die "ws_name is a required argument: $!";

  $self->{CORE}->kvetch("_in sdb...considering ws: " . $ws_name);

  ## If not 'default'--that's special.
  my $retval = undef;
  if( $ws_name ne 'default' ){

    ## Check if already in database.
    my $dbh = $self->{SESSION_DB};
    my $query = "SELECT * FROM workspace WHERE name = ?";
    my $sth = $dbh->prepare($query)
      or die "Couldn't prepare statement: " . $dbh->errstr;
    #my $rv =
    $sth->execute(($ws_name))
      or die "Couldn't execute statement: " . $sth->errstr;

    #$self->{CORE}->kvetch("_in sdb...rv: " . $rv);

    ## If something is there, do nothing, otherwise make a new ws.
    if( $sth->fetchrow_array() ){
      $self->{CORE}->kvetch("_in sdb...something like this ws already exists");
    }else{

      $self->{CORE}->kvetch("_in sdb...creating new workspace");

      ## Create new workspace.
      my $query ="INSERT INTO workspace(name) VALUES(?)";
      my $sth = $dbh->prepare($query)
	or die "Couldn't prepare statement: " . $dbh->errstr;
      $sth->execute(($ws_name))
	or die "Couldn't execute statement: " . $sth->errstr;

      $retval = 1;
    }

  }else{
    $self->{CORE}->kvetch("_in sdb...default ws always exists");
  }
  return $retval;
}


##
sub session_db_add_item {

  my $self = shift;

  my $item_hash = shift || {};
  my $ws_name = shift || 'default';
  my $retval = undef;

  ## Get args at least minimally check or die trying.
  my $key = $item_hash->{key} || die "key => is a required argument: $!";
  my $name = $item_hash->{name} || '';

  my $dbh = $self->{SESSION_DB};

  ## BUG/TODO: check if ws exists. In the meantime, it looks like sqlite3
  ## drops them quietly.

  $self->{CORE}->kvetch("_in sdb...try to add '".$key ."' to '".$ws_name."'");

  ## If exists, add item to it.
  ## TODO: check for item key uniqueness.
  my $query ="INSERT INTO item(workspace_id,key,name) select workspace.id, ?, ? from workspace where name = ?";
  my $sth = $dbh->prepare($query)
    or die "Couldn't prepare statement: " . $dbh->errstr;
  $retval = $sth->execute(($key,$name,$ws_name))
    or die "Couldn't execute statement: " . $sth->errstr;

  return $retval;
}


##
sub session_db_list_workspaces {

  my $self = shift;
  my $retraref = [];

  ##
  my $dbh = $self->{SESSION_DB};
  my $query = "SELECT name FROM workspace";
  my $sth = $dbh->prepare($query)
    or die "Couldn't prepare statement: " . $dbh->errstr;
  my $undef_p = $sth->execute()
    or die "Couldn't execute statement: " . $sth->errstr;

  while( my @row = $sth->fetchrow_array() ) {
    $self->{CORE}->kvetch("_in sdb...in ws list: " . $row[0]);
    push @$retraref, $row[0];
  }

  ## Not great, but change to undef if it looks funny.
  if( ! defined($retraref) ||
      scalar(@$retraref) == 0 || # there should at least be default
      ! defined($undef_p) ){
    $retraref = undef;
  }
  return $retraref;
}


##
sub session_db_list_workspace_items {

  my $self = shift;
  my $ws_name = shift || 'default';
  my $retraref = [];

  ##
  my $dbh = $self->{SESSION_DB};
  my $query = "SELECT item.id, item.key, item.name, item.date FROM item INNER JOIN workspace ON (item.workspace_id = workspace.id) WHERE workspace.name = ?";
  my $sth = $dbh->prepare($query)
    or die "Couldn't prepare statement: " . $dbh->errstr;
  my $undef_p = $sth->execute(($ws_name))
    or die "Couldn't execute statement: " . $sth->errstr;

  while( my @row = $sth->fetchrow_array() ) {
    $self->{CORE}->kvetch("_in sdb...in ws/item '".$ws_name."' item: ".$row[1]);
    push @$retraref,
      {
       #id => $row[0],
       key => $row[1],
       name => $row[2],
       date => $row[3],
      };
  }

  ## Not great, but change to undef if it looks funny.
  if( ! defined($retraref) ||
      ! defined($undef_p) ){
    $retraref = undef;
  }
  return $retraref;
}

## Copy the content of one workspace to another workspace. This is a
## purely synthetic operation. Returns the number of items copied.
sub session_db_copy_workspace {

  my $self = shift;
  my $src_ws_name = shift || 'default';
  my $dest_ws_name = shift || 'default';

  my $retval = 0;
  $self->{CORE}->kvetch("_in sdb...try to copy ws '".
			$src_ws_name ."' to ws '". $dest_ws_name ."'");

  ## Get items and copy them over.
  my $items = $self->session_db_list_workspace_items($src_ws_name);
  foreach my $item (@$items){
    $self->session_db_add_item({
				key => $item->{key},
				name => $item->{name},
			       },
			       $dest_ws_name
			      );
    $retval++;
  }

  return $retval;
}


## Remove all of the items in a workspace.
sub session_db_clear_workspace {

  my $self = shift;
  my $ws_name = shift || 'default';
  my $retval = undef;

  $self->{CORE}->kvetch("_in sdb...clearing: ".$ws_name);

  my $dbh = $self->{SESSION_DB};
  my $query = "DELETE FROM item WHERE workspace_id IN ( SELECT id FROM workspace WHERE name = ?)";
  my $sth = $dbh->prepare($query)
    or die "Couldn't prepare statement: " . $dbh->errstr;
  $retval = $sth->execute(($ws_name))
    or die "Couldn't execute statement: " . $sth->errstr;

  return $retval;
}

##
sub session_db_remove_item {

  my $self = shift;
  my $key = shift || die "key is a required argument: $!";
  my $ws_name = shift || 'default';
  my $retval = undef;

  $self->{CORE}->kvetch("_in sdb...removing item: '".$key."' from '".$ws_name."'");

  my $dbh = $self->{SESSION_DB};
  my $query = "DELETE FROM item WHERE key = ? AND workspace_id IN ( SELECT id FROM workspace WHERE name = ?)";
  my $sth = $dbh->prepare($query)
    or die "Couldn't prepare statement: " . $dbh->errstr;
  $retval = $sth->execute(($key, $ws_name))
    or die "Couldn't execute statement: " . $sth->errstr;

  return $retval;
}

##
sub session_db_remove_workspace {

  my $self = shift;
  my $ws_name = shift || 'default';
  my $retval = undef;

  ## I said it before and I'll say it again, you can't remove
  ## 'default'--it's special.
  if( $ws_name ne 'default' ){

    ## First, clear it so nothing is dangling.
    $self->session_db_clear_workspace($ws_name);

    $self->{CORE}->kvetch("_in sdb...removing workspace: '".$ws_name."'");

    ## Remove the actual workspace.
    my $dbh = $self->{SESSION_DB};
    my $query = "DELETE FROM workspace WHERE name = ?";
    my $sth = $dbh->prepare($query)
      or die "Couldn't prepare statement: " . $dbh->errstr;
    $retval = $sth->execute(($ws_name))
      or die "Couldn't execute statement: " . $sth->errstr;
  }

  return $retval;
}


###
### Template methods for easier handling.
###

## Correcting wrapper for core sub.
sub _atoi {
  my $self = shift;
  my $thing = shift || 0;
  $thing = $self->{CORE}->atoi($thing);
  return $thing || 0;
}

## Turn a page name into info for links to external help.
sub _resolve_page_settings {
  my $self = shift;
  my $page_name = shift || 'amigo';

  ## Sensible defaults.
  my $page_title = 'AmiGO 2';
  my $page_content_title = 'AmiGO Help';
  my $wiki_base = 'http://wiki.geneontology.org/index.php/';
  my $page_help_link = $wiki_base . 'AmiGO_2_Manual';

  if( $page_name eq 'browse' ){
    $page_title = 'AmiGO 2: Browse';
    $page_content_title = 'Browse';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Browse';
  }elsif( $page_name eq 'base_statistics' ){
    $page_title = 'AmiGO 2: Base Statistics';
    $page_content_title = 'Base Statistics';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Base_Statistics';
  }elsif( $page_name eq 'dd_browse' ){
    $page_title = 'AmiGO 2: Drill-down Browse';
    $page_content_title = 'Drill-down Browse';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Drill-down_Browse';
  }elsif( $page_name eq 'free_browse' ){
    $page_title = 'AmiGO 2: Free Browse';
    $page_content_title = 'Free Browse';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Free_Browse';
  }elsif( $page_name eq 'landing' ){
    $page_title = 'AmiGO 2: Welcome';
    $page_content_title = 'Home';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Home';
  }elsif( $page_name eq 'goose' ){
    $page_title = 'AmiGO 2: GO Online SQL/Solr Environment (GOOSE)';
    $page_content_title = 'GO Online SQL/Solr Environment (GOOSE)';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_GOOSE';
  }elsif( $page_name eq 'gannet' ){
    $page_title = 'AmiGO 2';
    $page_content_title = 'Gannet';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Gannet';
  }elsif( $page_name eq 'grebe' ){
    $page_title = 'AmiGO 2: Search Templates';
    $page_content_title = 'Search Templates';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Search_Templates';
  }elsif( $page_name eq 'visualize' ){
    $page_title = 'AmiGO 2: Visualize';
    $page_content_title = 'Visualize an Arbitrary GO Graph';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Visualize';
  }elsif( $page_name eq 'visualize_freeform' ){
    $page_title = 'AmiGO 2: Visualize Freeform';
    $page_content_title = 'Visualize an Arbitrary Graph';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Visualize_Freeform';
  }elsif( $page_name eq 'live_search' ){
    $page_title = 'AmiGO 2: Search';
    $page_content_title = 'Search';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Search';
  }elsif( $page_name eq 'simple_search' ){
    $page_title = 'AmiGO 2: Simple Search';
    $page_content_title = 'Simple Search';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Simple_Search';
  }elsif( $page_name eq 'medial_search' ){
    $page_title = 'AmiGO 2: Search Directory';
    $page_content_title = 'Search Directory';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Search_Directory';
  }elsif( $page_name eq 'bulk_search' ){
    $page_title = 'AmiGO 2: Bulk Search';
    $page_content_title = 'Bulk Search';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Bulk_Search';
  }elsif( $page_name eq 'software_list' ){
    $page_title = 'AmiGO 2: Tools and Resources';
    $page_content_title = 'Tools and Resources';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Tools_and_Resources';
  }elsif( $page_name eq 'term' ){ # typically won't use
    $page_title = 'AmiGO 2';
    $page_content_title = 'Term Page';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Term_Page';
  }elsif( $page_name eq 'gene_product' ){ # typically won't use
    $page_title = 'AmiGO 2';
    $page_content_title = 'Gene Product Page';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Gene_Product_Page';
  }elsif( $page_name eq 'model' ){ # typically won't use
    $page_title = 'AmiGO 2';
    $page_content_title = 'Model Page';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Model_Page';
  }elsif( $page_name eq 'schema_details' ){
    $page_title = 'AmiGO 2: Schema Details';
    $page_content_title = 'Instance Schema Details';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Schema_Details';
  }elsif( $page_name eq 'load_details' ){
    $page_title = 'AmiGO 2: Load Details';
    $page_content_title = 'Current instance load information';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Load_Details';
  }elsif( $page_name eq 'owltools_details' ){
    $page_title = 'AmiGO 2: OWLTools/Loader Details';
    $page_content_title = 'Current OWLTools and loader information';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_OWLTools_Details';
  }elsif( $page_name eq 'xrefs' ){
    $page_title = 'AmiGO 2: Cross References';
    $page_content_title = 'Current Cross Reference Abbreviations';
    $page_help_link = $wiki_base . 'AmiGO_2_Manual:_Cross_References';
  }

  return ($page_title,
	  $page_content_title,
	  $page_help_link);
}

## The the params variable to the most common settings that we use.
## Will either modify a current params or make a new one.
sub _common_params_settings {

  my $self = shift;
  my $additional = shift || {};

  my $params = {};

  ## Check for and use google analytics.
  $params->{GOOGLE_ANALYTICS_ID} = $self->{CORE}->google_analytics_id();

  #$params->{STANDARD_CSS} = 'yes';

  ## General menu/link items all templates have access to.
  $params->{interlink_landing} =
    $self->{CORE}->get_interlink({mode=>'landing'});
  $params->{interlink_tools} =
    $self->{CORE}->get_interlink({mode=>'tools'});
  ## No longer anything simple about search.
  $params->{interlink_grebe} =
    $self->{CORE}->get_interlink({mode=>'grebe'});
  $params->{interlink_visualize_client_amigo} =
    $self->{CORE}->get_interlink({mode=>'visualize_client_amigo'});
  $params->{interlink_visualize_client_freeform} =
    $self->{CORE}->get_interlink({mode=>'visualize_client_freeform'});
  $params->{interlink_visualize_service_freeform} =
    $self->{CORE}->get_interlink({mode=>'visualize_service_freeform'});
  $params->{interlink_visualize_service_amigo} =
    $self->{CORE}->get_interlink({mode=>'visualize_service_amigo'});
  $params->{interlink_goose} =
    $self->{CORE}->get_interlink({mode=>'goose'});
  $params->{interlink_schema_details} =
    $self->{CORE}->get_interlink({mode=>'schema_details'});
  $params->{interlink_load_details} =
    $self->{CORE}->get_interlink({mode=>'load_details'});
  $params->{interlink_owltools_details} =
    $self->{CORE}->get_interlink({mode=>'owltools_details'});
  $params->{interlink_browse} =
    $self->{CORE}->get_interlink({mode=>'browse'});
  $params->{interlink_base_statistics} =
    $self->{CORE}->get_interlink({mode=>'base_statistics'});
  $params->{interlink_dd_browse} =
    $self->{CORE}->get_interlink({mode=>'dd_browse'});
  $params->{interlink_free_browse} =
    $self->{CORE}->get_interlink({mode=>'free_browse'});
  $params->{interlink_medial_search} =
    $self->{CORE}->get_interlink({mode=>'medial_search'});
  $params->{interlink_simple_search} =
    $self->{CORE}->get_interlink({mode=>'simple_search'});
  $params->{interlink_gannet} =
    $self->{CORE}->get_interlink({mode=>'gannet'});
  $params->{interlink_repl} =
    $self->{CORE}->get_interlink({mode=>'repl'});
  $params->{interlink_xrefs} =
    $self->{CORE}->get_interlink({mode=>'xrefs'});
  $params->{interlink_rte} =
    #$self->{CORE}->get_interlink({mode=>'rte'});
    ## Temporary fix for: https://github.com/geneontology/amigo/issues/198
    'http://pantherdb.org/webservices/go/overrep.jsp';
  ## Since there is no default search page, arrange for one.
  # my $def_search = $self->{CORE}->get_amigo_search_default();
  # $params->{interlink_search_default} =
  #   $self->{CORE}->get_interlink({mode=>'live_search',
  # 				  arg=>{type=>$def_search}});
  $params->{interlink_term_details_base} =
    $self->{CORE}->get_interlink({mode=>'term_details_base'});
  ## Phylo experiments.
  $params->{interlink_phylo_graph} =
    $self->{CORE}->get_interlink({mode=>'phylo_graph'});

  ## Create and add to output buffer.
  $params->{base} = $self->{CORE}->amigo_env('AMIGO_DYNAMIC_URL');
  # $params->{public_base} =
  #   $self->{CORE}->amigo_env('AMIGO_PUBLIC_CGI_BASE_URL');
  # $params->{public_opensearch} =
  #   $self->{CORE}->amigo_env('AMIGO_PUBLIC_OPENSEARCH_URL');
  $params->{public_1x_base} =
    $self->{CORE}->amigo_env('AMIGO_1X_PUBLIC_CGI_BASE_URL') ||
      $params->{public_base};
  $params->{noctua_base} = $self->{CORE}->amigo_env('AMIGO_PUBLIC_NOCTUA_URL');
  $params->{BETA} =
    $self->_atoi($self->{CORE}->amigo_env('AMIGO_BETA'));
  $params->{IS_GO_P} =
    $self->_atoi($self->{CORE}->amigo_env('AMIGO_FOR_GO'));
  $params->{VERBOSE} =
    $self->_atoi($self->{CORE}->amigo_env('AMIGO_VERBOSE'));
  $params->{last_load_date} =
    $self->{CORE}->amigo_env('GOLR_TIMESTAMP_LAST');
  $params->{root_terms} = $self->{CORE}->get_root_terms();
  #$params->{release_name} = $self->{CORE}->release_name();
  #$params->{release_type} = $self->{CORE}->release_type();
  $params->{release_date} = $params->{release_name};
  $params->{page_name} = 'amigo';
  $params->{amigo_mode} = $additional->{amigo_mode} || '';
  $params->{search_layout_list} = $self->{AW_SEARCH_LIST}; # for menus
  $params->{image_dir} =
    $self->{CORE}->amigo_env('AMIGO_STATIC_URL') . '/images';
  $params->{js_dir} =
    $self->{CORE}->amigo_env('AMIGO_STATIC_URL') .'/js';
  # $params->{js_dir} =
  #   $self->{CORE}->amigo_env('AMIGO_STATIC_URL') .'/javascript';
  $params->{css_dir} =
    $self->{CORE}->amigo_env('AMIGO_STATIC_URL') . '/css';
  $params->{html_url} = $self->{CORE}->amigo_env('AMIGO_STATIC_URL');
  $params->{version} = $self->{CORE}->amigo_env('AMIGO_VERSION');
  my $sid = $params->{session_id} || '';
  $params->{session_id_for_url} = 'session_id=' . $sid;
  $params->{server_name} =
    $self->{CORE}->amigo_env('AMIGO_SERVER_NAME') || '';
  ## Filters and the like.
  $params->{browse_filter_idspace} =
      $self->{CORE}->amigo_env('AMIGO_BROWSE_FILTER_IDSPACE') || undef;

  ## Titles seems to be the odds ones out for some reason.
  $params->{page_title} = 'AmiGO';
  if( $additional->{title} || $additional->{page_title} ){
    $params->{page_title} = $additional->{title} || $additional->{page_title};
  }

  ##
  $self->{WEBAPP_TEMPLATE_PARAMS} = $params;
  return $self->{WEBAPP_TEMPLATE_PARAMS};
}

## Reset the content buffers in extreme cases.
sub _wipe_buffered_content {

  my $self = shift;
  $self->{WEBAPP_CSS} = [];
  $self->{WEBAPP_JAVASCRIPT} = [];
  $self->{WEBAPP_CONTENT} = [];
  #$self->{WEBAPP_TEMPLATE_PARAMS} = {};
}

##
sub _eval_content {

  my $self = shift;
  my $content = shift || undef;

  my $retval = '';
  if( defined $content && $content =~ /\.tmpl$/ ){
    $retval = ${ $self->tt_process($content, $self->{WEBAPP_TEMPLATE_PARAMS}) };
  }else{
    $retval = $content;
  }

  return $retval;
}


##
sub _add_something {

  my $self = shift;
  my $thing = shift || undef;
  my $thing_type = shift || die "need a thing type to add something";

  my $retval = '';
  if( defined $thing ){
    ## TODO/BUG: it is nice to eval at this point, but we are now
    ## double buffering.
    $retval = $self->_eval_content($thing);
    #$retval = $thing;
    push @{$self->{$thing_type}}, $retval;
  }

  return $retval;
}

# ##
# sub _add_template {

#   my $self = shift;
#   my $thing = shift || undef;
#   my $thing_type = shift || die "need a thing type to add something";

#   my $set_name = $self->template_set() || die 'no defined template set';

#   my $retval = '';
#   if( defined $thing ){
#     ## TODO/BUG: it is nice to eval at this point, but we are now
#     ## double buffering.
#     $retval = $self->_eval_content($set_name . '/' . $thing);
#     #$retval = $thing;
#     push @{$self->{$thing_type}}, $retval;
#   }

#   return $retval;
# }

##
sub set_template_parameter {

  my $self = shift;
  my $name = shift || undef;
  my $value = shift; # we love zeros too
  if( defined $name && defined $value ){
    $self->{WEBAPP_TEMPLATE_PARAMS}{$name} = $value;
    $self->{CORE}->kvetch($name .': '. $self->{WEBAPP_TEMPLATE_PARAMS}{$name});
  }
}


##
sub template_parameters {

  my $self = shift;
  return $self->{WEBAPP_TEMPLATE_PARAMS};
}


##
sub add_template_css { return _add_something(@_, 'WEBAPP_CSS'); }
sub add_template_javascript { return _add_something(@_, 'WEBAPP_JAVASCRIPT'); }
sub add_template_content { return _add_something(@_, 'WEBAPP_CONTENT'); }
# sub add_template_content {
#   my $self = shift;
#   return $self->_add_template(@_, 'WEBAPP_CONTENT');
# }

##
sub add_template_bulk {

  my $self = shift;
  my $args = shift || {};

  # ## Get ready for rewrites based on template set.
  # my $set_name = $self->template_set() || die 'no defined template set';

  if( defined $args->{css_library} ){
    foreach my $css_lib (@{$args->{css_library}}){
      $self->add_template_css( $self->{CSS}->get_css($css_lib) );
    }
  }
  if( defined $args->{css} ){
    foreach my $css (@{$args->{css}}){
      $self->add_template_css( $css );
    }
  }
  if( defined $args->{javascript_library} ){
    foreach my $js_lib (@{$args->{javascript_library}}){
      $self->add_template_javascript( $self->{JS}->get_lib($js_lib) );
    }
  }
  if( defined $args->{javascript} ){
    foreach my $js (@{$args->{javascript}}){
      $self->add_template_javascript( $js );
    }
  }
  if( defined $args->{javascript_init} ){
    # foreach my $jsi (@{$args->{javascript_init}}){
    #  $self->add_template_javascript($self->{JS}->initializer_jquery($jsi));
    # }
    my $alljs = join("\n", @{$args->{javascript_init}});
    $self->add_template_javascript($self->{JS}->initializer_jquery( $alljs ));
  }
  ## At this stage we'll rewrite to the correct template path.
  if( defined $args->{content} ){
    foreach my $c (@{$args->{content}}){
      $self->add_template_content( $c );
    }
  }
}


# ## 1 (default) is full page, 0 is empty (ultra-lite) page.
# sub generate_template_page {

#   my $self = shift;
#   my $args = shift || {};

#   ## Check vs. defaults.
#   ## TODO: pull documentation up.
#   my $lite_p = 0;
#   $lite_p = 1 if defined $args->{lite} && $args->{lite} == 1;
#   my $footer_p = 1;
#   $footer_p = 0 if defined $args->{footer} && $args->{footer} == 0;
#   my $header_p = 1;
#   $header_p = 0 if defined $args->{header} && $args->{header} == 0;
#   # my $search_p = 1;
#   # $search_p = 0 if defined $args->{search} && $args->{search} == 0;

#   ## Generate the page output.
#   my @mbuf = ();

#   ## Do head. First CSS, then JS.
#   push @mbuf, $self->_eval_content('common/head_open.tmpl');
#   push @mbuf, $self->_eval_content('common/head_info_lite.tmpl') if ! $lite_p;
#   foreach my $css (@{$self->{WEBAPP_CSS}}){ push @mbuf, $css; }
#   foreach my $js (@{$self->{WEBAPP_JAVASCRIPT}}){ push @mbuf, $js; }
#   push @mbuf, $self->_eval_content('common/head_close.tmpl');

#   ## Do body.
#   push @mbuf, $self->_eval_content('common/body_open.tmpl');

#   ## Optional debugging output.
#   if( $self->{CORE}->verbose_p() ){
#     push @mbuf, '<!-- DEBUG -->';
#     foreach my $key (keys %{$self->{WEBAPP_TEMPLATE_PARAMS}}){
#       my $val = $self->{WEBAPP_TEMPLATE_PARAMS}{$key} || '<undefined>';
#       push @mbuf, "<!-- $key : $val -->";
#     }
#   }

#   ## The usual everywhere header.
#   push @mbuf, $self->_eval_content('common/header.tmpl')
#     if ! $lite_p && $header_p;

#   ## Pre-main content output.
#   push @mbuf, $self->_eval_content('common/content_open.tmpl');

#   ## TODO: It looks like RoR-stlye messages and the like should go
#   ## here.
#   ## First error (X), then warning (!), then notice (<check>).
#   #foreach my $queue (("error", "warning", "notice")){
#   foreach my $queue (("notice", "warning", "error")){
#     my $messages = $self->get_mq($queue);
#     foreach my $message (@$messages){
#       $self->{CORE}->kvetch('in queue output try: '. $queue . ": " . $message);
#       $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message_type'} = $queue;
#       $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message'} = $message;
#       push @mbuf, $self->_eval_content('common/mq_message.tmpl')
#     }
#   }

#   ## Main content output.
#   foreach my $content (@{$self->{WEBAPP_CONTENT}}){ push @mbuf, $content; }
#   push @mbuf, $self->_eval_content('common/content_close.tmpl');
#   push @mbuf, $self->_eval_content('common/footer.tmpl')
#     if ! $lite_p && $footer_p;
#   push @mbuf, $self->_eval_content('common/close.tmpl');

#   ## Merge and return.
#   my $output = '';
#   $output = join "\n", @mbuf;
#   return $output;
# }

=item template_set

Experimental template setup build around BS3.

Args: set name as string; optional
Returns: the page text

=cut
sub template_set {

  my $self = shift;
  my $set_name = shift || undef;
  if( defined $set_name && $set_name ){
    $self->{AW_TEMPLATE_SET} = $set_name;
  }

  return $self->{AW_TEMPLATE_SET};
}

=item generate_template_page_with

Experimental template setup build around BS3.
Uses the return value of template_set as the default output

Args: optional
Returns: the page text

=cut
sub generate_template_page_with {

  my $self = shift;
  my $args = shift || {};
#  my $set_name = $self->template_set() || die 'no defined template set';

  ## Check vs. defaults.
  ## TODO: pull documentation up.
  # my $lite_p = 0;
  # $lite_p = 1 if defined $args->{lite} && $args->{lite} == 1;
  my $header_p = 1;
  $header_p = 0 if defined $args->{header} && $args->{header} == 0;
  my $search_p = 1;
  $search_p = 0 if defined $args->{search} && $args->{search} == 0;
  my $footer_p = 1;
  $footer_p = 0 if defined $args->{footer} && $args->{footer} == 0;

  ## Before we start, make sure that the beta is announced.
  my $is_beta = $self->_atoi($self->{CORE}->amigo_env('AMIGO_BETA'));
  if( defined $is_beta && $is_beta ){
    $self->add_mq('notice', 'You are using an'.
		  ' <a title="Go to AmiGO Labs explanation page"'.
		  ' href="http://wiki.geneontology.org/index.php/AmiGO_Labs"'.
		  ' class="alert-link">'.
		  ' AmiGO Labs</a> prototype. See ' .
		  ' <a title="Go to AmiGO Labs explanation page"'.
		  ' href="http://wiki.geneontology.org/index.php/AmiGO_Labs"'.
		  ' class="alert-link">'.
		  ' here</a> for more information.');
  }

  ## Generate the page output.
  my @mbuf = ();

  ## Do head. First CSS, then JS.
  push @mbuf, $self->_eval_content('common/head_open.tmpl');
  #push @mbuf, $self->_eval_content('common/head_info_lite.tmpl') if ! $lite_p;
  foreach my $css (@{$self->{WEBAPP_CSS}}){ push @mbuf, $css; }
  foreach my $js (@{$self->{WEBAPP_JAVASCRIPT}}){ push @mbuf, $js; }
  push @mbuf, $self->_eval_content('common/head_close.tmpl');

  ## Do body.
  push @mbuf, $self->_eval_content('common/body_open.tmpl');

  ## Optional debugging output.
  if( $self->{CORE}->verbose_p() ){
    push @mbuf, '<!-- DEBUG -->';
    foreach my $key (keys %{$self->{WEBAPP_TEMPLATE_PARAMS}}){
      my $val = $self->{WEBAPP_TEMPLATE_PARAMS}{$key} || '<undefined>';
      push @mbuf, "<!-- $key : $val -->";
    }
  }

  ## The usual everywhere header. The search box is handled within
  ## here.
  my $add_search_box_to_header = 0;
  if( defined $search_p && $search_p ){
    $add_search_box_to_header = 1;
  }
  $self->set_template_parameter('add_search_box_to_header',
				$add_search_box_to_header);
  push @mbuf, $self->_eval_content('common/header.tmpl')
    if $header_p;

  ## Pre-main content output.
  push @mbuf, $self->_eval_content('common/content_open.tmpl');

  ## RoR-style messages and the like.
  foreach my $queue (("success", "notice", "warning", "error")){
    my $messages = $self->get_mq($queue);
    foreach my $message (@$messages){
      $self->{CORE}->kvetch('in queue output try: '. $queue . ": " . $message);
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message_type'} = $queue;
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message'} = $message;
      push @mbuf, $self->_eval_content('common/mq_message.tmpl')
    }
  }

  ## The actual title, if defined in variables.
  push @mbuf, $self->_eval_content('common/content_title.tmpl');

  ## Main content output.
  foreach my $content (@{$self->{WEBAPP_CONTENT}}){
    push @mbuf, '' . $content;
  }

  ## Close up.
  push @mbuf, $self->_eval_content('common/footer.tmpl')
    if $footer_p;
  push @mbuf, $self->_eval_content('common/content_close.tmpl');
  #push @mbuf, $self->_eval_content('common/content_close.tmpl');

  ## Merge and return.
  my $output = '';
  $output = join "\n", @mbuf;
  return $output;
}

###
### Message queue environment handling.
###

## Quick helper to read a file in as a string.
sub _min_slurp {
  my $infile = shift || die "need file here";
  my $string = '';
  open INFILE, $infile or die "Couldn't open file: $!";
  while( <INFILE> ){ $string .= $_; }
  close INFILE;
  return $string;
}

# ##
# sub check_for_condition_files {

#   my $self = shift;

#   # ## Okay, here we're going to add a little system of passing messages
#   # ## globally through filesystem manipulation.
#   # my $root_dir = $self->{CORE}->amigo_env('AMIGO_CGI_ROOT_DIR');
#   # my @root_a_files = glob($root_dir . '/.amigo.*');
#   # foreach my $afile (@root_a_files){
#   #   if( $afile =~ /\.amigo\.warning.*/ ){
#   #     my $cstr = _min_slurp($afile);
#   #     $self->add_mq('warning', $cstr) if $cstr;
#   #   }elsif( $afile =~ /\.amigo\.error.*/ ){
#   #     my $cstr = _min_slurp($afile);
#   #     $self->add_mq('error', $cstr) if $cstr;
#   #   }else{
#   #     ## Everything else is ignored.
#   #   }
#   # }

#   # ## If we are set as a load balancer, stop the processing if we have
#   # ## any issues. Look for a reportable error if we have the right
#   # ## variable set.
#   # my $reportable_error = undef;
#   # if( $self->{CORE}->amigo_env('AMIGO_BALANCER') ){
#   #   foreach my $queue (("warning", "error")){
#   #     my $messages = $self->get_mq($queue);
#   #     foreach my $message (@$messages){
#   # 	## Grab the last message.
#   # 	$reportable_error = $queue . ': ' . $message;
#   #     }
#   #   }
#   # }
#   # ## Trip if there is a reportable error.
#   # if( defined($reportable_error) ){
#   #   ## The journey ends here.
#   #   #$self->header_props(-status => 503);
#   #   #$self->query->status(503);
#   #   $self->mode_done_with_status_and_message('503', $reportable_error);
#   # }
# }

###
### Common mode handling (HTML).
###

##
sub mode_status {
  my $self = shift;
  my $service_name = shift || 'unidentified';

  $self->set_template_parameter('service_name', $service_name);
  $self->set_template_parameter('hid', $self->{CORE}->current_time());
  $self->set_template_parameter('page_title',
				'AmiGO 2: Service Status for ' . $service_name);

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
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();'
     ],
     content =>
     [
      'pages/status.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
  # $self->add_template_content('page/status.tmpl');
  # $self->{CORE}->kvetch("added status");
  # #return $self->generate_template_page();
  # return $self->generate_template_page_with();
}

##
sub _status_message_exit {

  my $self = shift;
  my $code = shift || die 'requires a status code';
  my $message = shift || die 'requires a message';

  $self->{CORE}->kvetch("done with status $code and message ($message)");

  $self->header_props(-status => $code);
  $self->teardown();
  print $self->_send_headers();
  print $message;

  #$self->header_add( -status => $code );
  #return $self->generate_template_page();
  exit;
}

## Generic internal fatal error. Uses $@.
sub mode_fatal {

  my $self = shift;
  my $err = shift || $@ || $! || $? || $^E || 'no error captured';

  ## Purge content buffers.
  $self->_wipe_buffered_content();

  $self->header_add( -status => '500 Internal Server Error' );

  $self->set_template_parameter('page_title', 'AmiGO 2: Fatal Error');
  # # $self->{CORE}->kvetch('ERROR: falling into mode_error: ' . $@);
  # my $ers = [];
  # # foreach my $er ($@, $!, $?, $^E){
  # foreach my $er ($@, $!, $?){
  #   if( defined $er && $er ne '' ){
  #     push @$ers, $er;
  #   }
  # }
  # $self->set_template_parameter('error', join('; ', @$ers));
  $self->set_template_parameter('error', $err);

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
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();'
     ],
     content =>
     [
      'pages/error.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}

# ## Specific internal fatal error. Uses argument as message.
# sub mode_fatal_with_message {
#   my $self = shift;
#   my $message = shift || '';
#   $self->header_add( -status => '500 Internal Server Error' );
#   $self->set_template_parameter('page_title', 'AmiGO 2: Fatal Error');
#   $self->set_template_parameter('error', $message);
#   $self->add_template_content('common/error.tmpl');
#   #return $self->generate_template_page();
#   return $self->generate_template_page_with();
# }

## What the user is looking for is not there.
sub mode_not_found {

  my $self = shift;
  my $input_id = shift || die "requires input id";
  my $input_type = shift || die "requires input type";

  $self->header_add( -status => '404 Not Found');
  $self->set_template_parameter('page_title',
				'AmiGO 2: Enitity Not Found (404)');
  $self->set_template_parameter('amigo_mode', 'not_found');

  $self->set_template_parameter('input_id', $input_id);
  $self->set_template_parameter('input_type', $input_type);

  ## Generate a specific search link.
  $self->set_template_parameter('search_link',
				$self->{CORE}->get_interlink({mode=>
							      'landing'}));

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
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();'
     ],
     content =>
     [
      'pages/not_found_generic.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}

## Very lightly catching errors from the user that couldn't be
## prevented before reaching the server.
sub mode_generic_message {

  my $self = shift;
  my $in_args = shift || {};

  #$self->{CORE}->kvetch("_do_generic_message_");

  ## Merge incoming args with template.
  my $args = $self->{CORE}->merge({
				   title => '',
				   header => '!!!',
				   message => 'Unknown issue.',
				   error => 1,
				  }, $in_args);

  #$self->{CORE}->kvetch("_in_" . Dumper($in_args));
  #$self->{CORE}->kvetch("_out_" . Dumper($args));

  ## Page variables.
  $self->set_template_parameter('title', $args->{title});
  $self->set_template_parameter('header', $args->{header});
  $self->set_template_parameter('message', $args->{message});
  $self->set_template_parameter('error', $args->{error});

  ## Deeper page settings.
  if( $args->{error} ){
    $self->header_add( -status => '500 Internal Server Error' );
    $self->set_template_parameter('page_title', 'AmiGO 2: 500 Error');
  }else{
    $self->set_template_parameter('page_title', 'AmiGO 2: Message');
  }

  ## Purge content buffers.
  $self->_wipe_buffered_content();
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
      'bbop',
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();'
     ],
     content =>
     [
      'pages/message_generic.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}

## Catching mode errors through fatal.
sub mode_exception {
  my $self = shift;
  my $intended_runmode = shift;
  return $self->mode_fatal("Looking for run mode \"$intended_runmode\", but found no such method.");
}

###
### Common mode handling (JSON).
###

# ##
# sub mode_js_status {
#   my $self = shift;
#   my $json_resp = AmiGO::JSON->new('status');
#   $self->header_add( -type => 'application/json' );
#   $json_resp->set_results({
# 			   heartbeat => $self->{JS}->{JSON_TRUE},
# 			   id => $self->{CORE}->unique_id(),
# 			  });
#   return $json_resp->render_json();
# }

# ## Catching nasty errors.
# sub mode_js_fatal {
#   my $self = shift;
#   $self->header_add( -status => '500 Internal Server Error' );
#   $self->header_add( -type => 'application/json' );
#   ##
#   my $json_resp = AmiGO::JSON->new('fatal');
#   $json_resp->add_error($@);
#   $json_resp->failed(1);
#   return $json_resp->render_json();
# }

# ## Catching nasty errors.
# sub mode_js_fatal_with_message {
#   my $self = shift;
#   my $message = shift || '';
#   $self->header_add( -status => '500 Internal Server Error' );
#   $self->header_add( -type => 'application/json' );
#   return $core->render_json($message);
# }

# ## Catching mode errors.
# sub mode_js_exception {
#   my $self = shift;
#   my $intended_runmode = shift;
#   $self->header_add( -status => '500 Internal Server Error' );
#   $self->header_add( -type => 'application/json' );
#   ##
#   my $json_resp = AmiGO::JSON->new('exception');
#   $json_resp->add_error($intended_runmode . " doesn\'t exist");
#   $json_resp->failed(1);
#   return $json_resp->render_json();
# }

###
### Utility functions for the applications.
###

## Just a true|false sanity check on JSON arguments.
## TODO: May want to move this to WebApp/Input.pm.
sub json_parsable_p {
  my $self = shift;
  my $json_str = shift || die 'required json string not found';

  my $retval = 1;
  eval {
    $self->{CORE}->_read_json_string($json_str);
  };
  if( $@ ){
      $self->{CORE}->kvetch("problem decoding JSON: " . $@);
      $self->{CORE}->kvetch("with JSON: " . $json_str);
      $retval = 0;
    }
  
  return $retval;
}

## Irritating FormValidator can return scalar or array
## ref. Normalize on array ref.
sub to_array_ref {

  my $self = shift;
  my $thing = shift || undef;

  my $required = [];
  if( defined $thing ){
    $self->{CORE}->kvetch('incoming thing to filter');
    if( ref($thing) eq 'ARRAY' ){
      $required = $thing;
      $self->{CORE}->kvetch('thing convert: leave alone');
    }else{
      $required = [$thing];
      $self->{CORE}->kvetch('thing convert: single convert');
    }
  }else{
    $self->{CORE}->kvetch('no thing to filter');
  }

  return $required;
}


## Return a 2JS-friendly data structure of raw incoming paramenters
## (useful for figuring out what state I'm in during multiple async
## actions).
sub raw_params {

  my $self = shift;

  my $raw_ds = {};
  my $q = $self->query();
  my @all = $q->param();
  foreach my $param (@all){
    $raw_ds->{$param} = $q->param($param);
  }

  return $raw_ds;
}


## Last called before the lights go out.
## NOTE: Should actually be defined in the subclasses, but is so
## rarely used that I'm just gunna keep it here for now.
sub teardown {
  my $self = shift;

  # Disconnect when we're done, (Although DBI usually does this automatically)
  #$self->dbh->disconnect();
}



1;
  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'base_statistics';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      #'standard',
      'com.bootstrap',
      'com.jquery.jqamigo.custom',
      'com.jstree',
      'amigo',
      'bbop'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.bootstrap',
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('BaseStatistics.js')
     ],
     content =>
     [
      'pages/base_statistics.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_free_browse {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'free_browse';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Get the layout info to describe which buttons should be
  ## generated.
  #my $bbinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_BROWSE');
  #$self->set_template_parameter('browse_button_info', $bbinfo);
  ## Pick the first to be the default.
  #my $sb = $$bbinfo[0]->{id};
  #$self->set_template_parameter('starting_button', $sb);

  ## Our AmiGO services CSS.
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
      'org.cytoscape',
      'bbop',
      'amigo2'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('CytoDraw.js'),
      $self->{JS}->get_lib('FreeBrowse.js')
     ],
     javascript_init =>
     [
      'FreeBrowseInit();'
     ],
     content =>
     [
      'pages/free_browse.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_simple_search {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('simple_search');

  ## Tally up if we have insufficient information to do a query.
  my $insufficient_info_p = 2;

  ## Pull our query parameter.
  my $q = $params->{query};
  if( ! defined $q || $q eq '' ){
    #$self->add_mq('warning', 'No search query was defined--please try again.');
  }else{
    $self->set_template_parameter('query', $q);
    $self->{CORE}->kvetch('query: ' . $q);
    $insufficient_info_p--;
  }

  ## Pull our golr_class parameter.
  my $gc = $params->{golr_class};
  if( ! defined $gc || $gc eq '' ){
    # $self->add_mq('warning',
    # 		  'No search category was defined--please try again.');
  }else{
    $self->set_template_parameter('golr_class', $gc);
    $self->{CORE}->kvetch('golr_class: ' . $gc);
    $insufficient_info_p--;
  }

  ## Pull our page parameter. 1 if nothing else.
  my $page = $self->{CORE}->atoi($params->{page}) || 1;
  $self->set_template_parameter('page_number', $page);

  ## See if there are any results.
  my $results_p = 0;
  my $results_docs = undef;

  ## Only attempt a search if there is not insufficient
  ## information. Otherwise, we'll let the warnings speak for
  ## themselves.
  if( $insufficient_info_p != 0 ){
    $self->set_template_parameter('search_performed_p', 0);
  }else{
    $self->set_template_parameter('search_performed_p', 1);

    ## Actually do the search up proper.

    my $gs = AmiGO::External::JSON::Solr::GOlr::Search->new();
    #$self->{CORE}->kvetch("target: " . $gs->{AEJS_BASE_URL});
    my $results_ok_p = $gs->smart_query($q, $gc, $page);

    $results_docs = $gs->docs();
    my $results_total = $gs->total();
    my $results_count = $gs->count();
    if( $results_ok_p && $results_docs && $gs->count() > 0 ){
      $results_p = 1;
    }

    ## Set with our findings.
    $self->set_template_parameter('results_p', $results_p);
    $self->set_template_parameter('results', $results_docs);
    $self->set_template_parameter('results_total', $results_total);
    $self->set_template_parameter('results_count', $results_count);

    ## See if we can get links.
    ## BUG: Right now, we only understand internal links.
    my $results_links_local = {};
    foreach my $doc (@{$results_docs}) {
      #my $rdoc = $results_docs->{$rid};
      if( $doc->{id} ){
	my $linkable_field = ['annotation_class', 'bioentity',
			      'evidence_with',
			      'taxon',
			      'panther_family'];
	foreach my $curr_field (@$linkable_field){
	  ## Make sure we're dealing with a list.
	  my $curr_field_val_list = $doc->{$curr_field} || [];
	  $curr_field_val_list = [$curr_field_val_list]
	    if ref $curr_field_val_list ne 'ARRAY';
	  foreach my $curr_field_val (@$curr_field_val_list){
	    if( $curr_field_val ){
	      if( $curr_field eq 'annotation_class' ){
		$results_links_local->{$curr_field_val} =
		  $self->{CORE}->get_interlink({mode => 'term_details',
						arg => {acc=>$curr_field_val}});
	      }elsif( $curr_field eq 'bioentity' ){
		$results_links_local->{$curr_field_val} =
		  $self->{CORE}->get_interlink({mode => 'gp_details',
						arg => {gp=>$curr_field_val}});
	      }else{
		## All others for through the general abbs linker.
		my($cdb, $ckey) =
		  $self->{CORE}->split_gene_product_acc($curr_field_val);
		my $link_try = $self->{CORE}->database_link($cdb, $ckey);
		if( $link_try ){
		  $results_links_local->{$curr_field_val} = $link_try;
		}
	      }
	    }
	  }
	}
      }
    }
    #$self->{CORE}->kvetch('results_links_local: ' . Dumper($results_links_local));
    $self->set_template_parameter('results_links_local', $results_links_local);

    ## And highlighting.
    my $hlite = $gs->highlighting();
    #$self->{CORE}->kvetch('highlighting: ' . Dumper($hlite));
    $self->set_template_parameter('highlighting', $hlite);

    ## Take care of paging.
    my $next_page_url =
      $self->{CORE}->get_interlink({mode => 'simple_search',
				    arg => {'query' => $q,
					    'golr_class'=> $gc,
					    'page' => $page + 1},
				    optional => {'frag' => 'nav_anchor'}});
    my $prev_page_url =
      $self->{CORE}->get_interlink({mode => 'simple_search',
				    arg => {'query' => $q,
					    'golr_class'=> $gc,
					    'page' => $page - 1},
				    optional => {'frag' => 'nav_anchor'}});
    my $first_page_url =
      $self->{CORE}->get_interlink({mode => 'simple_search',
				    arg => {'query' => $q,
					    'golr_class'=> $gc,
					    'page' => 1},
				    optional => {'frag' => 'nav_anchor'}});
    my $last_page_url =
      $self->{CORE}->get_interlink({mode => 'simple_search',
				    arg => {'query' => $q,
					    'golr_class'=> $gc,
					    'page' => $gs->last_page()},
				    optional => {'frag' => 'nav_anchor'}});
    $self->set_template_parameter('first_page_url', $first_page_url);
    $self->set_template_parameter('last_page_url', $last_page_url);
    $self->set_template_parameter('next_page_url', $next_page_url);
    $self->set_template_parameter('prev_page_url', $prev_page_url);
    $self->set_template_parameter('next_page_p', $gs->more_p($page));
    $self->set_template_parameter('range_high', $gs->range_high($page));
    $self->set_template_parameter('range_low', $gs->range_low($page));
    $self->set_template_parameter('range', $gs->count());

    ## Nice to know the category that we searched in.
    my $dc = $self->{CORE}->golr_class_document_category($gc);
    $self->set_template_parameter('document_category', $dc);

    ## Okay, the main search stuff is done, now let's sort out all of
    ## the information needed for the headers.
    my $gci = $self->{CORE}->golr_class_info($gc);
    $self->set_template_parameter('golr_class_info', $gci);
    #$self->{CORE}->kvetch('golr_class_info: ' . Dumper($gci));
    my $result_weights_hash = $self->{CORE}->golr_class_weights($gc, 'result');
    my @results_order = sort {
      $result_weights_hash->{$b} <=> $result_weights_hash->{$a}
    } (keys %{$result_weights_hash});
    $self->set_template_parameter('results_order', \@results_order);
    #$self->{CORE}->kvetch('results_order: ' . Dumper(\@results_order));
  }

  ## Page settings.
  my $page_name = 'simple_search';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Grab the config info for the simple search form construction.
  my $ss_info = $self->{CORE}->golr_class_info_list_by_weight(25);
  $self->set_template_parameter('simple_search_form_info', $ss_info);

  ## The rest of our environment.
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
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js')
     ],
     content =>
     [
      'pages/simple_search.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


## WARNING/TODO: Without pivot tables, this is expensive, taking
## multiple passes at the server to assemble the necessarily grouped
## data.
sub mode_medial_search {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('medial_search');
  ## Deal with the different types of dispatch we might be facing.
  $params->{q} = $self->param('q')
    if ! $params->{q} && $self->param('q');
  $self->{CORE}->kvetch(Dumper($params));
  my $q = $params->{q};

  ## Pull our query parameter.
  if( ! defined $q || $q eq '' ){
    my $str = "No query found. Please go back and try again.";
    return $self->mode_fatal($str);
  }

  $self->set_template_parameter('query', $q);
  $self->{CORE}->kvetch('query: ' . $q);

  ## Try and figure out if the user might be trying to get annotation
  ## information about a specific internal term.
  my $probable_term = undef;
  my $probable_term_info = undef;
  if( $q ){
    ## Clean input and make sure it is a single item.
    my $tlist = $self->{CORE}->clean_term_list($q);
    $self->{CORE}->kvetch('have query: ' . $q);
    if( @$tlist && scalar(@$tlist) == 1 ){
      ## Make sure the one item is an internal term that we'll have
      ## info about.
      my $tid = $tlist->[0];
      $self->{CORE}->kvetch('have t: ' . $tid);
      if( $self->{CORE}->is_term_acc_p($tid) ){
	## Okay, we're good--get info.
	my $tworker = AmiGO::Worker::GOlr::Term->new($tid);
	my $tinfo_hash = $tworker->get_info();
	if( defined($tinfo_hash) ){ # check again
	  $probable_term = $tid;
	  $probable_term_info = $tinfo_hash->{$tid};
	}
      }
    }
  }
  ## The consumable from the above.
  $self->set_template_parameter('TERM_INFO', $probable_term_info);


  ## Get the layout info to describe which personalities are
  ## available.
  my $stinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_SEARCH');
  my $stinfo_hash = {};
  my $personality_list = [];
  my $accu_results = 0;
  foreach my $sti (@$stinfo){

    my $st_id = $sti->{id};
    my $st_name = $sti->{display_name};
    my $st_desc = $sti->{description};
    my $st_cat = $sti->{document_category};
    my $st_weight = $sti->{weight};

    $stinfo_hash->{$st_id} =
      {
       'id' => $st_id,
       'name' => $st_name,
       'description' => $st_desc,
       'document_category' => $st_cat,
       'weight' => $st_weight,
       'count' => 0,
       'link' => $self->{CORE}->get_interlink({mode=>'live_search',
					       arg => {
						       type => $st_id,
						       query => $q,
						      }}),
      };

    #push @$personality_list, $st_id;
    #$personality_list = [$st_id];
    my $gs = AmiGO::External::JSON::Solr::GOlr::Search->new();
    my $cqs = $gs->comfy_query_string($q);
    #my $results_ok_p = $gs->counting_query($cqs, $personality_list);
    my $results_ok_p = $gs->counting_query($cqs, $st_id);
    #my $result_facets = $gs->facet_field('document_category');
    my $results_total = $gs->total();
    if( $results_total ){
      $stinfo_hash->{$st_id}{count} = $results_total;
      $accu_results += $results_total;
    }
  }

  my $results_p = 0;
  if( $accu_results ){
    $results_p = 1;
  }

  ## Make our data into a weight-ordered list for rendering.
  my @info_array =
    sort { return $b->{weight} <=> $a->{weight}; } values %$stinfo_hash;
  $self->{CORE}->kvetch('results_info: ' . Dumper(\@info_array));

  ## Set with our findings.
  $self->set_template_parameter('results_info', \@info_array);
  $self->set_template_parameter('results_p', $results_p);
  #$self->set_template_parameter('results_total', $results_total);
  #$self->set_template_parameter('results_count', $results_count);
  #$self->{CORE}->kvetch('results_order: ' . Dumper(\@results_order));

  ## Page settings.
  my $page_name = 'medial_search';
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## The rest of our environment.
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
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('Medial.js'),
      $self->{JS}->make_var('global_acc', $probable_term)
     ],
     content =>
     [
      'pages/medial_search.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_software_list {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'software_list';
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  # ## Where would the ancient demos page hide...?
  # my $foo = $self->{CORE}->amigo_env('AMIGO_CGI_PARTIAL_URL');
  # $self->set_template_parameter('OLD_LOC', $foo);

  ## Get Galaxy, and add a variable for it in the page.
  $self->set_template_parameter('GO_GALAXY',
				$self->{CORE}->amigo_env('AMIGO_PUBLIC_GALAXY_URL'));

  # ## DEBUG:
  # ## Let's try getting some random messages out.
  # $self->add_mq('warning', 'warning floats to middle');
  # $self->add_mq('notice', 'Hello, World!');
  # $self->add_mq('error', 'error floats to top');
  # $self->add_mq('notice', 'Part2: Hello, World!');

  ## Our AmiGO services CSS.
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
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js')
     ],
     content =>
     [
      'pages/software_list.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_schema_details {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Page settings.
  my $page_name = 'schema_details';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Get Galaxy, and add a variable for it in the page.
  $self->set_template_parameter('GO_GALAXY',
				$self->{CORE}->amigo_env('AMIGO_PUBLIC_GALAXY_URL'));

  ## Our AmiGO services CSS.
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
      'com.jquery.tablesorter'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('Schema.js')
     ],
     content =>
     [
      'pages/schema_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


##
sub mode_load_details {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Load in the GOlr timestamp details.
  #my $glog = $self->{CORE}->amigo_env('GOLR_TIMESTAMP_LOCATION');
  my $glog =
      $self->{CORE}->amigo_env('AMIGO_WORKING_PATH') . '/golr_timestamp.log';
  my $ts_details = $self->{CORE}->golr_timestamp_log($glog);
  if( $ts_details && scalar(@$ts_details) ){
    $self->set_template_parameter('TS_DETAILS_P', 1);

    ## We have something, now let's sort out the ontology and GAF sections.
    my $ts_ont = [];
    my $ts_gaf = [];
    foreach my $item (@$ts_details){
      if( $item->{type} eq 'ontology' ){
	push @$ts_ont, $item;
      }elsif( $item->{type} eq 'gaf' ){
	push @$ts_gaf, $item;
      }else{
	## Not covering anything else yet.
      }
    }

    #die "ARGH! " . scalar(@$ts_gaf);

    $self->set_template_parameter('TS_DETAILS_ONT', $ts_ont);
    $self->set_template_parameter('TS_DETAILS_GAF', $ts_gaf);

  }else{
    $self->set_template_parameter('TS_DETAILS_P', 0);
  }

  ## Page settings.
  my $page_name = 'load_details';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);  
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Get Galaxy, and add a variable for it in the page.
  $self->set_template_parameter('GO_GALAXY',
				$self->{CORE}->amigo_env('AMIGO_PUBLIC_GALAXY_URL'));

  ## Our AmiGO services CSS.
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
      'com.jquery.tablesorter'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('LoadDetails.js')
     ],
     content =>
     [
      'pages/load_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}

##
sub mode_owltools_details {

  my $self = shift;

  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile();

  ## Load in the OWLTools info.
  my $owltools =
    'java -Xms2048M -DentityExpansionLimit=4086000 -Djava.awt.headless=true -jar ' . $self->{CORE}->amigo_env('AMIGO_ROOT') . '/java/lib/owltools-runner-all.jar --version';
  my $ot_raw = `$owltools`;
  my @ot_lines = split(/\n+/, $ot_raw);
  my $ot = [];
  foreach my $ot_line (@ot_lines){
    my @bits = split(/\t+/, $ot_line);
    push @$ot, \@bits;
  }
  $self->set_template_parameter('OT_DETAILS', $ot);

  ## Page settings.
  my $page_name = 'owltools_details';
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
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
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js')
     ],
     content =>
     [
      'pages/owltools_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}

## A committed client based on the jQuery libraries and GOlr. The
## future.
sub mode_search {

  my $self = shift;

  ## Pull out the bookmark parameter.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('live_search');
  ## Deal with the different types of dispatch we might be facing.
  $params->{personality} = $self->param('personality')
    if ! $params->{personality} && $self->param('personality');

  ## Normal incoming args.
  my $bookmark = $params->{bookmark} || '';
  my $query = $params->{q} || '';
  my $filters = $params->{fq} || [];
  my $pins = $params->{sfq} || [];
  ## Ensure listref input on multi-inputs.
  $pins = [$pins] if ref($pins) ne 'ARRAY';
  $filters = [$filters] if ref($filters) ne 'ARRAY';

  ## Now add the filters that come in from the YAML-defined simple
  ## public bookmarking API.
  $filters = $self->_add_search_bookmark_api_to_filters($params, $filters);

  ## Try and come to terms with Galaxy.
  my($in_galaxy, $galaxy_external_p) = $i->comprehend_galaxy();
  $self->galaxy_settings($in_galaxy, $galaxy_external_p);

  ## Heavy-duty manager-level bookmark system: if it is defined, try
  ## to decode it into something useful that we can pass in as
  ## javascript.
  if( $bookmark ){
    # $bookmark = $self->{CORE}->render_json($bookmark);
    $bookmark =~ s/\"/\\\"/g;
  }
  $self->{CORE}->kvetch('bookmark: ' . $bookmark || '???');

  ## Page settings.
  my $page_name = 'live_search';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## See if there is a desired browsing filter.
  my $browse_filter_idspace =
    $self->{WEBAPP_TEMPLATE_PARAMS}{browse_filter_idspace} || undef;

  ## Make sure the personality is in our known set if it's even
  ## defined.
  my $personality = $params->{personality} || '';
  my $personality_name = 'n/a';
  my $personality_desc = 'No description.';
  if( $personality ){

    ## Get the layout info to describe which personalities are
    ## available.
    my $stinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_SEARCH');

    ## Check that it is in our search set.
    my $allowed_personality = 0;
    foreach my $sti (@$stinfo){
      my $stid = $sti->{id};
      if( $personality eq $stid ){
	$allowed_personality = 1;
	$personality_name = $sti->{display_name};
	$personality_desc = $sti->{description};
	last;
      }
    }

    ## If not, kick out to error.
    if( ! $allowed_personality ){
      $self->set_template_parameter('content_title', '');
      #$self->set_template_parameter('STANDARD_CSS', 'yes');
      return $self->mode_not_found($personality, 'search personality');
    }
  }else{
    ## No incoming personality.
    return $self->mode_not_found('undefined', 'search personality');
  }

  ## Set personality for template, and later JS var.
  $self->set_template_parameter('personality', $personality);
  $self->set_template_parameter('page_content_subtitle', $personality_name);
  $self->set_template_parameter('personality_name', $personality_name);
  $self->set_template_parameter('personality_description', $personality_desc);

  # ## Temporary test of new template system based on BS3.
  # my $template_system = $self->template_set() || die 'no template system set';
  # if( $template_system && $template_system eq 'bs3' ){
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
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->make_var('global_live_search_personality', $personality),
      $self->{JS}->make_var('global_live_search_bookmark', $bookmark),
      $self->{JS}->make_var('global_live_search_query', $query),
      $self->{JS}->make_var('global_live_search_filters', $filters),
      $self->{JS}->make_var('global_live_search_filter_idspace',
			    $browse_filter_idspace),
      $self->{JS}->make_var('global_live_search_pins', $pins),
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('LiveSearchGOlr.js')
     ],
     content =>
     [
      'pages/live_search_golr.tmpl'
     ]
    };
  $self->add_template_bulk($prep);
  return $self->generate_template_page_with();
}


## Largely the same as mode_search. Simpler in some cases, like no
## bookmarking, not particularly dynamic, etc.
sub mode_bulk_search {

  my $self = shift;

  ## Pull out the bookmark parameter.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('live_search');
  ## Deal with the different types of dispatch we might be facing.
  $params->{personality} = $self->param('personality')
    if ! $params->{personality} && $self->param('personality');

  ## Page settings.
  my $page_name = 'bulk_search';
  my($page_title, 
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings($page_name);
  $self->set_template_parameter('page_name', $page_name);
  $self->set_template_parameter('page_title', $page_title);
  $self->set_template_parameter('page_content_title', $page_content_title);
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Make sure the personality is in our known set if it's even
  ## defined.
  my $personality = $params->{personality} || '';
  my $personality_name = 'n/a';
  my $personality_desc = 'No description.';
  if( $personality ){

    ## Get the layout info to describe which personalities are
    ## available.
    my $stinfo = $self->{CORE}->get_amigo_layout('AMIGO_LAYOUT_SEARCH');

    ## Check that it is in our search set.
    my $allowed_personality = 0;
    foreach my $sti (@$stinfo){
      my $stid = $sti->{id};
      if( $personality eq $stid ){
	## Make sure we're on the list.
	$allowed_personality = 1;
	$personality_name = $sti->{display_name};
	$personality_desc = $sti->{description};

	## Pull out detailed personality information to assemble the
	## UI.
	## TODO: ?

	last;
      }
    }

    ## If not, kick out to error.
    if( ! $allowed_personality ){
      $self->set_template_parameter('content_title', '');
      #$self->set_template_parameter('STANDARD_CSS', 'yes');
      return $self->mode_not_found($personality, 'search personality');
    }
  }else{
    ## No incoming personality.
    return $self->mode_not_found('undefined', 'search personality');
  }

  ## Set personality for template, and later JS var.
  $self->set_template_parameter('personality', $personality);
  $self->set_template_parameter('page_content_subtitle', $personality_name);
  $self->set_template_parameter('personality_name', $personality_name);
  $self->set_template_parameter('personality_description', $personality_desc);

  # ## Temporary test of new template system based on BS3.
  # my $template_system = $self->template_set() || die 'no template system set';
  # if( $template_system && $template_system eq 'bs3' ){
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
      #'bbop',
      #'amigo2'
     ],
     javascript =>
     [
      $self->{JS}->make_var('global_bulk_search_personality', $personality),
      # $self->{JS}->make_var('global_live_search_query', $query),
      # $self->{JS}->make_var('global_live_search_filters', $filters),
      # $self->{JS}->make_var('global_live_search_pins', $pins),
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('BulkSearch.js')
     ],
     # javascript_init =>
     # [
     #  'GeneralSearchForwardingInit();',
     #  'BulkSearchInit();'
     # ],
     content =>
     [
      'pages/bulk_search.tmpl'
     ]
    };
  $self->add_template_bulk($prep);
  return $self->generate_template_page_with();
}


## Experimental try at the term details page, in perl, backed by the
## solr index.
sub mode_term_details {

  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('term');
  ## Deal with the different types of dispatch we might be facing.
  $params->{cls} = $self->param('cls')
    if ! $params->{cls} && $self->param('cls');
  $params->{format} = $self->param('format')
    if ! $params->{format} && $self->param('format');
  $self->{CORE}->kvetch(Dumper($params));

  ## Standard inputs for page control.
  my $input_term_id = $params->{cls};
  my $input_format = $params->{format} || 'html';

  ## Optional RESTmark input for embedded search_pane--external
  ## version.
  my $query = $params->{q} || '';
  my $filters = $params->{fq} || [];
  my $pins = $params->{sfq} || [];
  ## Ensure listref input on multi-inputs.
  $pins = [$pins] if ref($pins) ne 'ARRAY';
  $filters = [$filters] if ref($filters) ne 'ARRAY';

  ## Now add the filters that come in from the YAML-defined simple
  ## public bookmarking API.
  $filters = $self->_add_search_bookmark_api_to_filters($params, $filters);

  ## Input sanity check.
  if( ! $input_term_id ){
    return $self->mode_fatal("No term acc input argument.");
  }
  if( $input_format ne 'html' && $input_format ne 'json' ){
    return $self->mode_fatal('Bad output format: "' . $input_format . ':');
  }

  ## Experimental bookmark capture.
  my $pin = $params->{pin} || '';
  if( $pin ){ $pin =~ s/\"/\\\"/g; }
  $self->{CORE}->kvetch('incoming pin: ' . ($pin || '<none>'));

  ###
  ### Get full term info.
  ###

  ## Get the data from the store.
  my $term_worker = AmiGO::Worker::GOlr::Term->new($input_term_id);
  my $term_info_hash = $term_worker->get_info();

  ## First make sure that things are defined.
  if( ! defined($term_info_hash) ||
      $self->{CORE}->empty_hash_p($term_info_hash) ||
      ! defined($term_info_hash->{$input_term_id}) ){
    return $self->mode_not_found($input_term_id, 'term');
  }

  #$self->{CORE}->kvetch('solr docs: ' . Dumper($term_info_hash));
  # $self->{CORE}->kvetch('solr doc: ' .
  # 			Dumper($term_info_hash->{$input_term_id}));

  ## Should just be one now, yeah?
  #my $foo = (keys %$term_info_hash)[0];
  #$self->{CORE}->kvetch('$term_info: ' . Dumper($term_info->{$foo}));
  $self->set_template_parameter('TERM_INFO',
				$term_info_hash->{$input_term_id});

  ## First switch on internal term vs. external.
  my $is_term_acc_p = $self->{CORE}->is_term_acc_p($input_term_id);
  my $acc_list_for_gpc_info = [];
  my $input_term_id_list = [];
  my $exotic_p = undef;
  if( $is_term_acc_p ){

    $self->{CORE}->kvetch('Looks like a term acc: ' . $input_term_id);
    $exotic_p = 0;

  }else{

    ## Looks exotic.
    $self->{CORE}->kvetch('Looks like an exotic acc: ' . $input_term_id);
    $exotic_p = 1;

    ## Let's try and get a link for the exotic ID.
    my($edb, $eid) = $self->{CORE}->split_gene_product_acc($input_term_id);
    my $exotic_link = $self->{CORE}->database_link($edb, $eid) || '';

    ## Try to make the message link out.
    my $exotic_term = '';
    if( $exotic_link ){
      $exotic_term = '<a href="' .
	$exotic_link . '" title="Go to the homepage for ' .
	  $input_term_id . '">' .
	    $input_term_id . '</a>';
    }else{
      $exotic_term = $input_term_id;
    }

    ## Add a nice message.
    $self->add_mq('warning', "The term $exotic_term" .
		  ' is not an internal term,' .
		  ' but likely comes from an external resource.' .
		  ' For full information on this term,' .
		  ' please refer to the originating resource.');
  }
  $self->set_template_parameter('EXOTIC_P', $exotic_p);

  ## Link to GO histories if available; obviously only for GO terms.
  my $go_hist = undef;
  if( $input_term_id =~ /^GO\:\d{7}/ ){
    my $qg_term = AmiGO::External::QuickGO::Term->new();
    $go_hist = $qg_term->get_term_link($input_term_id) . '#term=history';
   }
  $self->set_template_parameter('GO_HISTORY_LINK', $go_hist);

  ###
  ### Bail with JS here is we're going to.
  ###

  ## TODO/BUG: Should this be a separate client sub-system?
  if( $input_format eq 'json' ){
    $self->header_add( -type => 'application/json' );
    my $json_resp = AmiGO::JSON->new('term');
    $json_resp->set_results($term_info_hash->{$input_term_id});
    $json_resp->add_warning('exotic') if $exotic_p;
    my $jdump = $json_resp->render();
    return $jdump;
  }

  ###
  ### Get neighborhood below term.
  ###

  ## Note: won't be included in subset case (too messy), so don't
  ## push.
  #if( $is_term_acc_p ){
  my $sorted_child_chunks =
    $term_worker->get_child_info_for($input_term_id);
  #$self->{CORE}->kvetch('scc: ' . Dumper($sorted_child_chunks));
  foreach my $cinfo (@$sorted_child_chunks){ 
    push @$acc_list_for_gpc_info, $cinfo->{acc};
  }
  $self->set_template_parameter('CHILD_CHUNKS', $sorted_child_chunks);
  #}

  ###
  ### Get term ancestor information.
  ###

  # #$self->{CORE}->kvetch("input_term_id_list" . Dumper($input_term_id_list));

  ##
  my $anc_info = undef;
  if( $is_term_acc_p ){
    $anc_info = $term_worker->get_ancestor_info($input_term_id);
  }else{
    ## We want to include self in ancestors in this case.
    $anc_info =
      $term_worker->get_ancestor_info($input_term_id, {reflexive=>1});
  }
  $self->set_template_parameter('MAX_DEPTH', $anc_info->{max_depth});
  $self->set_template_parameter('MAX_DISPLACEMENT',
  				$anc_info->{max_displacement});
  $self->set_template_parameter('PARENT_CHUNKS_BY_DEPTH',
  				$anc_info->{parent_chunks_by_depth});
  push @$acc_list_for_gpc_info, @{$anc_info->{seen_acc_list}};

  ## Bridge variables from old system.
  #$self->set_template_parameter('cgi', 'term-details');
  $self->set_template_parameter('cgi', 'browse');
  $self->set_template_parameter('vbridge', 'term=' . $input_term_id);

  ###
  ### External links.
  ###

  $self->set_template_parameter(
      'VIZ_STATIC_LINK',
      $self->{CORE}->get_interlink({'mode' => 'visualize_service_amigo',
				    'arg' => {'data' => $input_term_id,
					      'format' => 'png'}}));
  $self->set_template_parameter(
      'VIZ_DYNAMIC_LINK',
      $self->{CORE}->get_interlink({'mode' => 'visualize_service_amigo',
				    'arg' => {'data' => $input_term_id,
					      'format' => 'svg'}}));
  $self->set_template_parameter(
      'NAVIGATION_LINK',
      $self->{CORE}->get_interlink({'mode'=>'layers_graph',
				    'arg' => {'terms' => $input_term_id}}));

  $self->set_template_parameter(
      'OLSVIS_GO_LINK',
      $self->{CORE}->get_interlink({'mode' => 'olsvis_go',
				    'arg' => {'term' => $input_term_id},
				    'optional' => {'full' => 0}}));

  $self->set_template_parameter(
      'VIZ_QUICKGO_LINK',
      $self->{CORE}->get_interlink({'mode' => 'visualize_service_simple',
				    'arg' => {'engine'=>'quickgo',
					      'term'=>$input_term_id}}));

  ## Only need QuickGO for internal terms.
  if( ! $exotic_p ){
    my $qg_term = AmiGO::External::QuickGO::Term->new();
    $self->set_template_parameter(
	'QUICKGO_TERM_LINK',
	$qg_term->get_term_link($input_term_id));
    $self->set_template_parameter(
	'QUICKGO_ENGINE_P',
	$self->{CORE}->amigo_env('AMIGO_GO_ONLY_GRAPHICS'));
  }

  ###
  ### GONUTs
  ###

  ## TODO: I'd like to be able to set this up for some trivial GONUTS
  ## kappa tests.
  ## GONuts query.
  ## Cutoff a year ago (in seconds).
  ## TODO: we should compact this into a worker now that we have a chance.
  my $gonuts = AmiGO::External::XML::GONUTS->new({cutoff_time => 31536000});
  my $answer_p = $gonuts->query_term($input_term_id);
  $self->set_template_parameter('GONUTS_SUCCESS', 0);
  if( $answer_p ){
    $self->set_template_parameter('GONUTS_SUCCESS', 1);
    $self->set_template_parameter('GONUTS_TOTAL_COUNT',
				  $gonuts->get_total_count());
    $self->set_template_parameter('GONUTS_RECENT_COUNT',
				  $gonuts->get_recent_count());
    $self->set_template_parameter('GONUTS_PAGE_TITLE',
				  $gonuts->get_page_title());
    $self->set_template_parameter('GONUTS_PAGE_URL',
				  $gonuts->get_page_url());
    $self->set_template_parameter('GONUTS_DATE_STRING',
				  $gonuts->get_date_string());

      # ## DEBUG
      # $gonuts->kvetch('GONUTS: got an answer:');
      # $gonuts->kvetch("\t" . $gonuts->get_total_count());
      # $gonuts->kvetch("\t" . $gonuts->get_recent_count());
      # $gonuts->kvetch("\t" . $gonuts->get_page_title());
      # $gonuts->kvetch("\t" . $gonuts->get_page_url());
  }

  ###
  ### Standard setup.
  ### TODO: We see this a lot--should this be abstracted out too? No?
  ###

  ## Page settings.
  ## Don't use usual mechanism--a little special.
  $self->set_template_parameter('page_name', 'term');
  $self->set_template_parameter('page_title',
				'AmiGO 2: Term Details for "' .
				$term_info_hash->{$input_term_id}{'name'} .
				'" (' .	$input_term_id . ')');
  $self->set_template_parameter('content_title',
				$term_info_hash->{$input_term_id}{'name'});
  $self->set_template_parameter('page_content_title',
				$term_info_hash->{$input_term_id}{'name'});
  my($page_title, $page_content_title, $page_help_link) =
      $self->_resolve_page_settings('term');
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
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
      'com.jquery.tablesorter'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('TermDetails.js'),
      # $self->{JS}->make_var('global_count_data', $gpc_info),
      # $self->{JS}->make_var('global_rand_to_acc', $rand_to_acc),
      # $self->{JS}->make_var('global_acc_to_rand', $acc_to_rand),
      $self->{JS}->make_var('global_live_search_query', $query),
      $self->{JS}->make_var('global_live_search_filters', $filters),
      $self->{JS}->make_var('global_live_search_pins', $pins),
      $self->{JS}->make_var('global_label',
			    $term_info_hash->{$input_term_id}{'name'}),
      $self->{JS}->make_var('global_acc', $input_term_id)
     ],
     content =>
     [
      'pages/term_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


## Experimental try at the gp details page, in perl, backed by the
## solr index.
sub mode_gene_product_details {

  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('gp');
  ## Deal with the different types of dispatch we might be facing.
  $params->{gp} = $self->param('gp')
    if ! $params->{gp} && $self->param('gp');
  $params->{format} = $self->param('format')
    if ! $params->{format} && $self->param('format');
  $self->{CORE}->kvetch(Dumper($params));

  ## Standard inputs for page control.
  my $input_gp_id = $params->{gp};
  my $input_format = $params->{format} || 'html';

  ## Optional RESTmark input for embedded search_pane.
  my $query = $params->{q} || '';
  my $filters = $params->{fq} || [];
  my $pins = $params->{sfq} || [];
  ## Ensure listref input on multi-inputs.
  $pins = [$pins] if ref($pins) ne 'ARRAY';
  $filters = [$filters] if ref($filters) ne 'ARRAY';

  ## Now add the filters that come in from the YAML-defined simple
  ## public bookmarking API.
  $filters = $self->_add_search_bookmark_api_to_filters($params, $filters);

  ## Input sanity check.
  if( ! $input_gp_id ){
    return $self->mode_fatal("No input gene product acc argument.");
  }
  if( $input_format ne 'html' && $input_format ne 'json' ){
    return $self->mode_fatal('Bad output format: "' . $input_format . ':');
  }

  ###
  ### Get full gp info.
  ###

  ## Get the data from the store.
  my $gp_worker = AmiGO::Worker::GOlr::GeneProduct->new($input_gp_id);
  my $gp_info_hash = $gp_worker->get_info();

  ## First make sure that things are defined.
  if( ! defined($gp_info_hash) ||
      $self->{CORE}->empty_hash_p($gp_info_hash) ||
      ! defined($gp_info_hash->{$input_gp_id}) ){
    return $self->mode_not_found($input_gp_id, 'gene product');
  }

  # $self->{CORE}->kvetch('solr docs: ' . Dumper($gp_info_hash));
  $self->set_template_parameter('GP_INFO', $gp_info_hash->{$input_gp_id});

  ## TODO/BUG: Should this be a separate client?
  if( $input_format eq 'json' ){
    $self->header_add( -type => 'application/json' );
    my $json_resp = AmiGO::JSON->new('gene_product');
    $json_resp->set_results($gp_info_hash->{$input_gp_id});
    my $jdump = $json_resp->render();
    return $jdump;
  }

  ## PANTHER info if there.
  my $pgraph = $gp_info_hash->{$input_gp_id}{'phylo_graph'};
  if( $pgraph ){
    $self->set_template_parameter(
	'PHYLO_TREE_LINK',
	$self->{CORE}->get_interlink({'mode' => 'phylo_graph',
				      'arg' => {'gp' => $input_gp_id}}));
  }

  ###
  ### TODO: pull in additional annotation, etc. info.
  ###

  ###
  ### Standard setup.
  ###

  ## Again, a little different.
  ## Start by figuring out the best title we can.
  my $best_title = $input_gp_id; # start with the worst as a default
  if ( $gp_info_hash->{$input_gp_id}{'name'} ){
    $best_title = $gp_info_hash->{$input_gp_id}{'name'};
  }elsif( $gp_info_hash->{$input_gp_id}{'label'} ){
    $best_title = $gp_info_hash->{$input_gp_id}{'label'};
  }
  ## Page settings.
  $self->set_template_parameter('page_name', 'gene_product');
  $self->set_template_parameter('page_title',
				'AmiGO 2: Gene Product Details for ' .
				$input_gp_id);
  $self->set_template_parameter('content_title', $best_title);
  $self->set_template_parameter('page_content_title', $best_title);
  my($page_title,
     $page_content_title,
     $page_help_link) = $self->_resolve_page_settings('gene_product');
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
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
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('GPDetails.js'),
      # $self->{JS}->make_var('global_count_data', $gpc_info),
      # $self->{JS}->make_var('global_rand_to_acc', $rand_to_acc),
      # $self->{JS}->make_var('global_acc_to_rand', $acc_to_rand),
      $self->{JS}->make_var('global_live_search_query', $query),
      $self->{JS}->make_var('global_live_search_filters', $filters),
      $self->{JS}->make_var('global_live_search_pins', $pins),
      $self->{JS}->make_var('global_acc', $input_gp_id)
     ],
     content =>
     [
      'pages/gene_product_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


## Model annotation information.
sub mode_model_details {

  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('model');
  ## Deal with the different types of dispatch we might be facing.
  $params->{model} = $self->param('model')
    if ! $params->{model} && $self->param('model');
  my $input_id = $params->{model};

  ## Input sanity check.
  if ( ! $input_id ) {
    return $self->mode_fatal("No input model annotation argument.");
  }

  ## Warn people away for now.
  $self->add_mq('warning',
		'This page is considered <strong>ALPHA</strong> software.');

  ###
  ### Get full info.
  ###

  ## Get the data from the store.
  my $ma_worker = AmiGO::Worker::GOlr::ModelAnnotation->new($input_id);
  my $ma_info_hash = $ma_worker->get_info();

  ## First make sure that things are defined.
  if ( ! defined($ma_info_hash) ||
       $self->{CORE}->empty_hash_p($ma_info_hash) ||
       ! defined($ma_info_hash->{$input_id}) ) {
    return $self->mode_not_found($input_id, 'model');
  }

  $self->{CORE}->kvetch('solr docs: ' . Dumper($ma_info_hash));
  $self->set_template_parameter('MA_INFO', $ma_info_hash->{$input_id});

  ###
  ### Standard setup.
  ###

  ## Page settings.
  ## Again, a little special.
  $self->set_template_parameter('page_name', 'model');
  $self->set_template_parameter('page_title',
				'AmiGO 2: Model Details for ' .
				$input_id);
  my($page_title, $page_content_title, $page_help_link) =
    $self->_resolve_page_settings('model');
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Figure out the best title we can.
  my $best_title = $input_id;	# start with the worst
  if ( $ma_info_hash->{$input_id}{'model_label'} ) {
    $best_title = $ma_info_hash->{$input_id}{'model_label'};
  }
  $self->set_template_parameter('page_content_title', $best_title);

  ## Extract the string representation of the model.
  my $model_json = undef;
  if ( $ma_info_hash->{$input_id}{'model_graph'} ) {
    my $model_annotation_string = $ma_info_hash->{$input_id}{'model_graph'};
    $model_json = $self->{CORE}->_read_json_string($model_annotation_string);
  }
  ## Because of the round-tripping, it's possible to have information,
  ## but no model.
  if ( $model_json ) {
    $self->set_template_parameter('has_model_content_p', 1);
  } else {
    $self->set_template_parameter('has_model_content_p', 0);
  }

  ## BUG/TODO: Some silliness to get the variables right; will need to
  ## revisit later on.
  my $github_base =
    'https://github.com/geneontology/noctua-models/blob/master/models/';
  my $noctua_base = $self->{WEBAPP_TEMPLATE_PARAMS}{noctua_base};
  my $editor_base = $noctua_base . 'editor/graph/';
  my $viewer_base = $noctua_base . 'workbench/cytoview/';
  ## We need to translate some of the document information.
  ## TODO/BUG: This is temporary as we work out what we'll actually have.
  my @s = split(':', $input_id);
  my $fid = $s[scalar(@s) -1];
  ## 
  my $repo_file_url = $github_base . $fid;
  my $edit_file_url = $editor_base . $input_id;
  my $view_file_url = $viewer_base . $input_id;
  $self->set_template_parameter('repo_file_url', $repo_file_url);
  $self->set_template_parameter('edit_file_url', $edit_file_url);
  $self->set_template_parameter('view_file_url', $view_file_url);

  ## Our AmiGO services CSS.
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
      'com.jquery-ui'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      #$self->{JS}->get_lib('ModelDetails.js'),
      $self->{JS}->get_lib('AmiGOCytoView.js'),
      ## Things to make AmiGOCytoView.js work. HACKY! TODO/BUG
      $self->{JS}->make_var('global_id', $input_id),
      ## TODO: get load to have same as wire protocol.
      $self->{JS}->make_var('global_model', $model_json),
      # $self->{JS}->make_var('global_model',
      # 			    $ma_info_hash->{$input_id}{'model_graph'}),
      $self->{JS}->make_var('global_barista_token',  undef),
      $self->{JS}->make_var('global_minerva_definition_name',
			    "minerva_public"),
      $self->{JS}->make_var('global_barista_location',
			    "http://barista.berkeleybop.org"),
      $self->{JS}->make_var('global_collapsible_relations',
			    ["RO:0002333",
			     "BFO:0000066",
			     "RO:0002233",
			     "RO:0002488"])
     ],
     content =>
     [
      'pages/model_details.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


## Model /all/ noctua annotation information.
sub mode_model_biology {

  my $self = shift;

  ## Warn people away for now.
  $self->add_mq('warning',
		'This page is considered <strong>ALPHA</strong> software.');

  ###
  ### Standard setup.
  ###

  ## Page settings.
  ## Again, a little special.
  $self->set_template_parameter('page_name', 'biology');
  $self->set_template_parameter('page_title', 'AmiGO 2: Biology');
  my($page_title, $page_content_title, $page_help_link) =
      $self->_resolve_page_settings('biology');
  $self->set_template_parameter('page_help_link', $page_help_link);

  ## Our AmiGO services CSS.
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
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('AmiGOBioView.js'),
      $self->{JS}->make_var('global_model', undef),
      $self->{JS}->make_var('global_barista_token',  undef),
      $self->{JS}->make_var('global_minerva_definition_name',
			    "minerva_public"),
      $self->{JS}->make_var('global_barista_location',
			    "http://barista.berkeleybop.org"),
      $self->{JS}->make_var('global_collapsible_relations',
			    ["RO:0002333",
			     "BFO:0000066",
			     "RO:0002233",
			     "RO:0002488"])
     ],
     content =>
     [
      'pages/model_biology.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page_with();
}


## Very similar at this point to the gp details page, but instead
## we're just trying to load the phylo tree.
sub mode_phylo_graph {

  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('family');
  ## Deal with the different types of dispatch we might be facing.
  $params->{family} = $self->param('family')
    if ! $params->{family} && $self->param('family');
  my $input_family_id = $params->{family} || '';

  ## Input sanity check.
  if( ! $input_family_id ){
    $self->add_mq('warning', "Family ID argument not found. " .
		  "Will use <strong>demo mode</strong> instead.");
  }

  ###
  ### Standard setup.
  ###

  ## Page seetings.
  my $global_family = undef;
  if( $input_family_id ){
    $self->set_template_parameter('page_title',
				  'AmiGO 2:  Family tree for ' .
				  $input_family_id);
    $self->set_template_parameter('page_content_title', $input_family_id);
    $self->set_template_parameter('demo_mode', 'false');
    $global_family = $input_family_id;
  }else{
    $self->set_template_parameter('page_title', 'AmiGO 2:  Family tree demo');
    $self->set_template_parameter('page_content_title', 'Family tree demo');
    $self->set_template_parameter('demo_mode', 'true');
    $global_family = undef;
  }

  ## Our AmiGO services CSS.
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
      #'com.raphael',
      #'com.raphael.graffle',
      'bbop',
      'amigo2'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('PhyloGraph.js'),
      $self->{JS}->make_var('global_family', $global_family)
     ],
     javascript_init =>
     [
      'PhyloGraphInit();'
     ],
     content =>
     [
      'pages/phylo_graph.tmpl'
     ]
   };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  #$self->add_template_javascript($self->{JS}->get_lib('PANTHERTree.js'));
  # $self->add_template_javascript($self->{JS}->initializer_jquery('PT();'));

  # $self->add_template_content('pages/phylo_graph.tmpl');

  ## Nothing for now.
  return $self->generate_template_page_with({
					     #header=>0,
					     #footer=>0,
					    });
}



1;
