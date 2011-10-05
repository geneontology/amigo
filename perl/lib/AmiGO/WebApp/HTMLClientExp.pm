####
#### Place to keep experimntal things without polluting the main
#### app. Also makes installation of main and exp separate.
####

package AmiGO::WebApp::HTMLClientExp;
use base 'AmiGO::WebApp';

##
use AmiGO::External::XML::GONUTS;
use AmiGO::External::Raw;
use AmiGO::External::QuickGO::Term;
#use AmiGO::External::LEAD::Query;

# ## Take SuGR for a test drive.
# use SuGR::Render;
# use SuGR::Partition;
# use Graph::Directed;
# use SuGR::BaryMatrix;
# use SuGR::Sugiyama;

use File::Basename;

#use CGI::Application::Plugin::DBH (qw/dbh_config dbh/);
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use AmiGO::WebApp::Input;

## Real external workers.
use AmiGO::Worker::GOlr::Term;
use AmiGO::Worker::GOlr::GeneProduct;

# use Cache::Memcached; # TODO: can't go bigger than 1MB (still,
#                       # probably best to explore);
#use Cache::FileCache; # can't do complex objects.
#use FreezeThaw qw(freeze thaw); # infinite recur?


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

  # $self->tt_config(TEMPLATE_OPTIONS =>
  # 		   {INCLUDE_PATH =>
  # 		    $self->{CORE}->amigo_env('AMIGO_ROOT') .
  # 		    '/templates/html'});
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('kick_to_main');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   ## Client apps.
		   'ntree'               => 'mode_ntree',
		   'ptree'               => 'mode_ptree',
		   'scratch'             => 'mode_scratch',
		   'workspace_client'    => 'mode_workspace_client',

		   'exhibit'             => 'mode_exhibit_exp',

		   ## Replacements.
		   'front_page'          => 'mode_front_page',

		   ## Service apps.
		   'workspace'           => 'mode_workspace',

		   ## System apps.
		   'kick_to_main'        => 'mode_kick_to_main',
		   'AUTOLOAD'            => 'mode_exception'
		  );
}


## displaying them.
sub mode_ntree {

  my $self = shift;

  ## Incoming template.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('external_resource');
  $self->_common_params_settings($params);

  ## Was there input? Could we successfully get data from somewhere?
  my $rsc = $params->{external_resource} || '';
  my $raw_data = undef;
  my $external_status = 'todo';
  if( $rsc ){
    my $external = AmiGO::External::Raw->new();
    $raw_data = $external->get_external_data($rsc);
    if( defined $raw_data && $raw_data && length($raw_data) > 0 ){
      $external_status = 'success';
    }else{
      $external_status = 'failure';
    }
  }
  $self->set_template_parameter('external_resource', $rsc);
  $self->set_template_parameter('external_status', $external_status);
  $self->set_template_parameter('raw_data', $raw_data);

  ###
  ### Page settings.
  ###

  ## Grab all the *.tree files from somewhere.
  my $pdir = $self->{CORE}->amigo_env('AMIGO_HTDOCS_ROOT_DIR') . '/panther';
  my $ppath = $self->{CORE}->amigo_env('AMIGO_HTML_URL') . '/panther';
  my @full_tree_files = glob("$pdir/*.tree");
  my @tree_files = map { [fileparse($_)]->[0] } @full_tree_files;
  $self->set_template_parameter('tree_path', $ppath);
  $self->set_template_parameter('tree_files', \@tree_files);

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'newick.json',
      'newick.tree',
      'newick.tree_utils',
      'newick.phylo',
      'com.jquery',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      'bbop.amigo.ui.widgets'
     ],
     javascript =>
     [
      $self->{JS}->make_var('global_raw_data', $raw_data)
     ]
    };
  $self->add_template_bulk($prep);

  ## Our client JS.
  $self->add_template_javascript($self->{JS}->get_lib('PhyloTreeClient.js'));

  ## Initialize javascript app, but only when we have appropriate
  ## downloaded data.
  if( $external_status eq 'success' ){
    #$self->{CORE}->kvetch('bar:' . $external_status);
    $self->add_template_javascript($self->{JS}->initializer_jquery('PhyloTreeBuilder();'));
  }

  $self->{CORE}->kvetch('resource: ' . $rsc);
  $self->{CORE}->kvetch('status: ' . $external_status);
  $self->{CORE}->kvetch('raw: ' . $raw_data);

  ##
  $self->add_template_content('pages/phylo_ntree.tmpl');
  return $self->generate_template_page();
}


## TODO/BUG: some highly unsafe/unchecked calls in here--need better
## sanitation.
sub mode_ptree {

  my $self = shift;

  ## Incoming template.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('id');
  $self->_common_params_settings($params);

  ## Was there input? Could we successfully get data from somewhere?
  my $id = $params->{id} || '';
  my $raw_data = undef;
  #my $raw_data_name = undef;
  if( defined $id && $id ){
    my $pprop = AmiGO::Worker::PANTHERTree->new();
    $raw_data = $pprop->get_tree($id);
    ## Hopefully just the one for now.
    if( ! defined $raw_data || ! $raw_data || scalar(@$raw_data) != 1 ){
      die "this does not appear to be an appropriate panther id";
    }else{
      ## TODO/BUG: too tired to deal will multiple data, etc. right
      ## now, just peel off the last tree and use the ntree
      ## template...
      $raw_data = $raw_data->[0]{tree};
      #$raw_data_name = $raw_data->[0]{name};
    }
  }

  ## TODO: Temporarily reuse the ntree template.
  $self->set_template_parameter('raw_data', $raw_data);
  $self->set_template_parameter('tree_name', $id);
  $self->set_template_parameter('external_status', 'success');
  $self->set_template_parameter('no_controls', 1);

  ###
  ### Page settings.
  ###

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'newick.json',
      'newick.tree',
      'newick.tree_utils',
      'newick.phylo',
      'com.jquery',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      'bbop.amigo.ui.widgets'
     ],
     javascript =>
     [
      $self->{JS}->make_var('global_raw_data', $raw_data)
     ]
    };
  $self->add_template_bulk($prep);

  ## Our client JS.
  $self->add_template_javascript($self->{JS}->get_lib('PhyloTreeClient.js'));
  $self->add_template_javascript($self->{JS}->initializer_jquery('PhyloTreeBuilder();'));

  $self->{CORE}->kvetch('raw: ' . $raw_data);

  ##
  $self->add_template_content('pages/phylo_ntree.tmpl');
  return $self->generate_template_page();
}


##
sub mode_scratch {

  my $self = shift;

  ## Incoming template.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile();
  $self->_common_params_settings($params);

  ###
  ### Page settings.
  ###

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'bbop.amigo.ui.standard',
      'bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      'bbop.amigo.workspace',
      'bbop.amigo.ui.workspace',
      'bbop.amigo.ui.widgets',
      'bbop.amigo.ui.cart',
      'bbop.amigo.ui.shield',
      'bbop.amigo.ui.wait',
      'bbop.amigo.ui.shopping'
     ],
     javascript => []
    };
  $self->add_template_bulk($prep);

  ## Make sure that the cart image is in the mix.
  ## TODO: make this less stilted.
  my $cart_png = $self->{CORE}->amigo_env('IMAGE_URL') . '/cart.png';
  $self->add_template_javascript($self->{JS}->make_var('global_cart_image', $cart_png));
  $self->set_template_parameter('cart_image', $cart_png);

  $self->set_template_parameter('filler_n', 500);

  ## Our client JS.
  $self->add_template_javascript($self->{JS}->get_lib('ScratchClient.js'));
  ## Initialize javascript app.
  $self->add_template_javascript($self->{JS}->initializer_jquery('ScratchClientInit();'));

  ##
  $self->add_template_content('pages/scratch.tmpl');
  return $self->generate_template_page();
}


##
sub mode_workspace_client {

  my $self = shift;

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      #'bbop.amigo.ui.autocomplete',
      'bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     ## Our AmiGO services JSS.
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'com.jquery-layout',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      #'bbop.amigo.opensearch',
      #'bbop.amigo.ui.autocomplete',
      'bbop.amigo.workspace',
      'bbop.amigo.ui.widgets'
     ],
     content =>
     [
      '<div class="ui-layout-north">',
      'common/header.tmpl',
      '</div>',
      '<div class="ui-layout-center">',
      'pages/workspace_client.tmpl',
      '</div>',
      '<div class="ui-layout-south">',
      'common/footer.tmpl',
      '</div>'
     ],
    };
  $self->add_template_bulk($prep);

  ## Our client JS, and init.
  $self->add_template_javascript($self->{JS}->get_lib('WorkspaceClient.js'));

  ## Initialize javascript app.
  $self->add_template_javascript($self->{JS}->initializer_jquery('WorkspaceClientInit();'));

  ##
  return $self->generate_template_page();
}


##
sub mode_exhibit_exp {

  my $self = shift;

  ###
  ### Page settings.
  ###

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_CSS', 'no');

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      #'bbop.amigo.ui.standard',
      #'bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      'as.core.core',
      'as.core.abstractmanager',
      'as.managers.jquery',
      'as.core.parameter',
      'as.core.parameterstore',
      'as.core.abstractwidget',
      'as.helpers.jquery.ajaxsolr.theme',
      'as.widgets.jquery.pagerwidget',
      'as.core.abstractfacetwidget'
      #'bbop.amigo.workspace',
      #'bbop.amigo.ui.workspace',
      #'bbop.amigo.ui.widgets',
      #'bbop.amigo.ui.cart',
      #'bbop.amigo.ui.shield',
      #'bbop.amigo.ui.wait',
      #'bbop.amigo.ui.shopping'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('LiveSearchAS.js')
     ],
     javascript_init =>
     [
      'LiveSearchASInit();'
     ],
     content =>
     [
      'pages/exhibit_exp.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page();
}


##
sub mode_front_page {

  my $self = shift;

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'bbop.amigo.ui.autocomplete'
     ],
     javascript_library =>
     [
      'com.jquery',
      'bbop.core',
      'bbop.logger',
      'bbop.amigo',
      'bbop.amigo.go_meta',
      'bbop.amigo.opensearch',
      'bbop.amigo.ui.autocomplete'
     ]
    };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  $self->add_template_javascript($self->{JS}->initializer_jquery('new bbop.amigo.ui.autocomplete({id:"query", search_type:"general", completion_type:"acc", jump: true});'));

  ##
  $self->add_template_content('pages/front_page.tmpl');
  return $self->generate_template_page();
}


## While this is really a service and should may exist with aserve, it
## does do sessioning, so needs the STATELESS = 0, so I'll keep it
## here until fully tested and then spin it out into a stateful
## session service or something.
## TODO: This will actually evolve into the session and piping module.
sub mode_workspace {

  my $self = shift;
  my $json_resp = AmiGO::JSON->new('workspace');

  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('workspace');

  my $retstruct = {};

  ## Attempt all operations and save failure messages for later use.
  my $ws = $params->{workspace};
  my $action = $params->{action};
  if( $action eq 'add_workspace' ){

    $ws =~ s/\ /\_/g; # spaces to underscore
    $self->session_db_add_workspace($ws)
      || $json_resp->add_error('could not add workspace');

  }elsif( $action eq 'copy_workspace' ){

    ## Non-trivial operation. Only perform if everything is defined.
    my $ws_from = $params->{workspace} || undef;
    my $ws_to = $params->{copy_to_workspace} || undef;
    if( ! defined $ws_from ){
      $json_resp->add_error('using an undefined source workspace');
    }elsif( ! defined $ws_to ){
      $json_resp->add_error('using an undefined destination workspace');
    }else{
      $self->session_db_copy_workspace($ws_from, $ws_to)
	|| $json_resp->add_error('could not copy workspace');
    }

  }elsif( $action eq 'clear_workspace' ){

    $self->session_db_clear_workspace($ws)
      || $json_resp->add_error('could not clear workspace');

  }elsif( $action eq 'remove_workspace' ){

    $self->session_db_remove_workspace($ws)
      || $json_resp->add_error('could not remove workspace');

  }elsif( $action eq 'add_item' ){

    ## Non-trivial operation. Only perform if everything is defined.
    my $key = $params->{key};
#     my $type = $params->{type};
    my $name = $params->{name} || '';
    if( ! defined $key || ! $key ){
      $json_resp->add_error('key not defined');
    }elsif( ! defined $ws || ! $ws ){
      $json_resp->add_error('type not defined');
#     }elsif( ! defined $type || ! $type ){
#       $json_resp->add_error('undefined type');
    }else{
      $self->session_db_add_item({
				  key => $key,
# 				  type => $type,
				  name => $name,
				 },
				 $ws)
	|| $json_resp->add_error('could not add item');
    }

  }elsif( $action eq 'remove_item' ){

    ## Non-trivial operation. Only perform if everything is defined.
    my $key = $params->{key};
    if( ! defined $key || ! $key ){
      $json_resp->add_error('undefined key');
    }elsif( ! defined $ws || ! $ws ){
      $json_resp->add_error('undefined workspace');
    }else{
      $self->session_db_remove_item($key, $ws)
	|| $json_resp->add_error('could not remove item');
    }

  }elsif( $action eq 'list_workspaces' ){

    ##
    foreach my $ws_name (@{$self->session_db_list_workspaces()}){
      $retstruct->{$ws_name} = [];
    }

  }elsif( $action eq 'list_items' ){

    ##
    $retstruct->{$ws} = [];
    foreach my $item (@{$self->session_db_list_workspace_items($ws)}){
      push @{$retstruct->{$ws}}, $item;
    }

  }else{

    ## Our action is probably list/status then...
    foreach my $ws_name (@{$self->session_db_list_workspaces()}){
      $retstruct->{$ws_name} = [];
      foreach my $item (@{$self->session_db_list_workspace_items($ws_name)}){
	push @{$retstruct->{$ws_name}}, $item;
      }
    }

  }

  ##
  $json_resp->set_results($retstruct);

  ##
  $self->header_add( -type => 'application/json' );
  return $json_resp->make_js();
}


## Go to main.
sub mode_kick_to_main {

  my $self = shift;

  $self->set_template_parameter('page_title', 'AmiGO: No Page Here');
  $self->add_template_content('pages/forward_to_main.tmpl');

  return $self->generate_template_page();
}



1;
