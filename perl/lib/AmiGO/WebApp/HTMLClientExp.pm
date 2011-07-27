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
use AmiGO::Aid;

## Real external workers.
use AmiGO::Worker::GOlr::Term;
use AmiGO::Worker::GOlr::GeneProduct;

# use Cache::Memcached; # TODO: can't go bigger than 1MB (still,
#                       # probably best to explore);
#use Cache::FileCache; # can't do complex objects.
#use FreezeThaw qw(freeze thaw); # infinite recur?

## Helper helping.
my $aid = AmiGO::Aid->new();


##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 0;

  ## Configure how the session stuff is going to be handled when and
  ## if it is necessary.
  $self->session_config(
			CGI_SESSION_OPTIONS => [
						"driver:File",
						$self->query,
						{Directory=> $self->{CORE}->amigo_env('AMIGO_SESSIONS_ROOT_DIR')}
					       ],
			COOKIE_PARAMS       => {
						-path  => '/',
					       },
			SEND_COOKIE         => 1,
 );

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
		   'golr_term_details'   =>  'mode_golr_term_details',
		   'golr_gene_product_details' =>
		   'mode_golr_gene_product_details',

		   'live_search_term'    => 'mode_live_search_term',
		   'live_search_gene_product'=>'mode_live_search_gene_product',

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


## Experimental try at the term details page, in perl, backed by the
## solr index.
sub mode_golr_term_details {

  my $self = shift;

  ##
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('term');
  my $input_term_id = $params->{term};
  $self->_common_params_settings({'title' =>
				  'AmiGO: Term Details for ' . $input_term_id});

  ## Input sanity check.
  if( ! $input_term_id ){
    return $self->mode_die_with_message("Term acc could not be found! Is it".
					" possible that what you're looking".
					" for is not a term acc?");
  }

  ###
  ### Get full term info.
  ###

  my $term_worker = AmiGO::Worker::GOlr::Term->new();
  my $term_info_hash = $term_worker->get_info($input_term_id);
  if( ! defined($term_info_hash) ||
      $self->{CORE}->empty_hash_p($term_info_hash) ){
    return $self->mode_die_with_message("Term acc could not be found" .
					" in the index!");
  }

  $self->{CORE}->kvetch('solr docs: ' . Dumper($term_info_hash));

  ## Should just be one now, yeah?
  #my $foo = (keys %$term_info_hash)[0];
  #$self->{CORE}->kvetch('$term_info: ' . Dumper($term_info->{$foo}));
  $self->set_template_parameter('TERM_INFO',
				$term_info_hash->{$input_term_id});

  ## First switch on term vs. subset.
  my $is_term_acc_p = $self->{CORE}->is_term_acc_p($input_term_id);
  my $acc_list_for_gpc_info = [];
  my $input_term_id_list = [];
  if( $is_term_acc_p ){

    $self->{CORE}->kvetch('Looks like a term acc...');

    #   ## Even if just a single acc, put it into list form--that's what
    #   ## we'll be using.
    #   $input_term_id_list = [$input_term_id];
    #   push @$acc_list_for_gpc_info, $input_term_id;

  }else{

    $self->{CORE}->kvetch('Looks like a subset acc...');

    #   ## Convert input subset acc to term accs.
    #   my $sget = AmiGO::Worker::Subset->new();
    #   my @subset_term_list = keys(%{$sget->get_term_accs($input_term_id)});
    #   foreach my $k (@subset_term_list){
    #     push @$input_term_id_list, $k;
    #     push @$acc_list_for_gpc_info, $k;
    #   }
  }

  # ###
  # ### Get neighborhood below term.
  # ###

  # ## Note: won't be included in subset case (too messy), so don't
  # ## push.
  # if( $is_term_acc_p ){
  #   my $sorted_child_chunks = $term_q->get_child_info($input_term_id_list);
  #   #$self->{CORE}->kvetch('scc: ' . Dumper($sorted_child_chunks));
  #   foreach my $cinfo (@$sorted_child_chunks){ 
  #     push @$acc_list_for_gpc_info, $cinfo->{acc};
  #   }
  #   $self->set_template_parameter('CHILD_CHUNKS', $sorted_child_chunks);
  # }

  # ###
  # ### Get term ancestor information.
  # ###

  # #$self->{CORE}->kvetch("input_term_id_list" . Dumper($input_term_id_list));

  # ##
  # my $anc_info = undef;
  # if( $is_term_acc_p ){
  #   $anc_info = $term_q->get_ancestor_info($input_term_id_list);
  # }else{
  #   ## We want to include self in ancestors in this case.
  #   $anc_info = $term_q->get_ancestor_info($input_term_id_list, {reflexive=>1});
  # }
  # $self->set_template_parameter('MAX_DEPTH', $anc_info->{max_depth});
  # $self->set_template_parameter('MAX_DISPLACEMENT',
  # 				$anc_info->{max_displacement});
  # $self->set_template_parameter('PARENT_CHUNKS_BY_DEPTH',
  # 				$anc_info->{parent_chunks_by_depth});
  # push @$acc_list_for_gpc_info, @{$anc_info->{seen_acc_list}};

  # ## Now that we have all accs that we want counts for, create a
  # ## mapping between terms and a random address.
  # my $rand_to_acc = {};
  # my $acc_to_rand = {};
  # for( my $i = 0; $i < scalar(@$acc_list_for_gpc_info); $i++ ){
  #   my $acc = $acc_list_for_gpc_info->[$i];
  #   my $rand = $self->{CORE}->unique_id();
  #   $rand_to_acc->{$rand} = $acc;
  #   $acc_to_rand->{$acc} = $rand;
  # }

  # $self->set_template_parameter('ACC_TO_RAND', $acc_to_rand);
  # $self->set_template_parameter('RAND_TO_ACC', $rand_to_acc);

  # ###
  # ### Pull gene_product_count info.
  # ###

  # #print STDERR "<<TIME_START>>\n";
  # ## TODO/BUG: If nothing explodes, memoize this sucker a la Visualize:
  # my $gpc_q = AmiGO::Worker::GeneProductCount->new($input_term_id,
  #                                                  $acc_list_for_gpc_info);
  # #print STDERR "<<TIME_MID>>\n";
  # my $gpc_info = $gpc_q->get_info();

  # ## Get total counts for all terms (to use in fallback cases where JS
  # ## is not enabled).
  # my $gpc_total_count = {};
  # foreach my $acc (@$acc_list_for_gpc_info){
  #   $gpc_total_count->{$acc} = $gpc_q->get_count($acc);
  # }
  # $self->set_template_parameter('GPA_COUNTS', $gpc_total_count);
  # $self->set_template_parameter('GENE_PRODUCT_ASSOCIATIONS_COUNT',
  # 				$gpc_total_count->{$input_term_id});

  ## Bridge variables from old system.
  #$self->set_template_parameter('cgi', 'term-details');
  $self->set_template_parameter('cgi', 'browse');
  $self->set_template_parameter('vbridge', 'term=' . $input_term_id);

  # ## These things are of limited use to subsets.
  # if( $is_term_acc_p ){

  ###
  ### External links.
  ###

  $self->set_template_parameter('GENE_PRODUCT_ASSOCIATIONS_LINK',
				$self->{CORE}->get_interlink({mode => 'term-assoc',
							      arg =>
							      {acc =>
							       $input_term_id}}));
  $self->set_template_parameter('VIZ_STATIC_LINK',
				$self->{CORE}->get_interlink({mode => 'visualize',
							      arg =>
							      {data => $input_term_id,
							       format => 'png'}}));
  $self->set_template_parameter('VIZ_DYNAMIC_LINK',
				$self->{CORE}->get_interlink({mode => 'visualize',
							      arg =>
							      {data => $input_term_id,
							       format => 'svg'}}));
  $self->set_template_parameter('NAVIGATION_LINK',
				$self->{CORE}->get_interlink({mode => 'layers_graph',
							      arg =>
							      {terms =>
							       $input_term_id}}));

  $self->set_template_parameter('VIZ_QUICKGO_LINK',
				$self->{CORE}->get_interlink({mode=>'visualize_simple',
							      arg =>
							      {engine=>'quickgo',
							       term =>
							       $input_term_id}}));

  my $qg_term = AmiGO::External::QuickGO::Term->new();
  $self->set_template_parameter('QUICKGO_TERM_LINK',
				$qg_term->get_term_link($input_term_id));

  $self->set_template_parameter('QUICKGO_ENGINE_P',
				$self->{CORE}->amigo_env('AMIGO_GO_ONLY_GRAPHICS'));

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

  # }else{

  #   ## It'll be good to differentiate subset stuff from the οἱ πολλοί.
  #   my %in_term_hash = map { $_ => 1 } @$input_term_id_list;
  #   $self->set_template_parameter('SUBSET_TERMS', \%in_term_hash);

  #   $self->set_template_parameter('VIZ_STATIC_LINK',
  #     $self->{CORE}->get_interlink({mode => 'visualize_subset',
  # 				    arg => {subset => $input_term_id}}));
  # }

  ###
  ### Standard setup.
  ### TODO: We see this a lot--should this be abstracted out too? No?
  ###

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please
  # $self->set_template_parameter('STANDARD_YUI', 1);

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      # 'standard', # basic GO-styles
      # 'org.bbop.amigo.ui.autocomplete'
      'standard', # basic GO-styles
      'com.jquery.jqamigo.custom',
      #'com.jquery.tablesorter',
      'org.bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'com.jquery.tablesorter',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.ui.widgets'
     ],
     javascript =>
     [
      # $self->{JS}->make_var('global_count_data', $gpc_info),
      # $self->{JS}->make_var('global_rand_to_acc', $rand_to_acc),
      # $self->{JS}->make_var('global_acc_to_rand', $acc_to_rand),
      $self->{JS}->make_var('global_acc', $input_term_id)
     ]
    };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  $self->add_template_javascript($self->{JS}->get_lib('TermDetails.js'));
  $self->add_template_javascript($self->{JS}->initializer_jquery('TermDetailsInit();'));

  ##
  ## These things are of limited use to subsets.
  # if( $is_term_acc_p ){
    # if( $type eq 'compact' ){
    #   $self->add_template_content('html/main/term_details_compact.tmpl');
    # }else{
      $self->add_template_content('html/main/term_details.tmpl');
    # }
  # }else{
  #   $self->add_template_content('html/main/subset_details.tmpl');
  # }

  return $self->generate_template_page();
}


## Experimental try at the gp details page, in perl, backed by the
## solr index.
sub mode_golr_gene_product_details {

  my $self = shift;

  ##
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('gp');
  my $input_gp_id = $params->{gp};
  $self->_common_params_settings({'title' =>
				  'AmiGO: Gene Product Details for ' .
				  $input_gp_id});

  ## Input sanity check.
  if( ! $input_gp_id ){
    return $self->mode_die_with_message("GP acc could not be found! Is it".
					" possible that what you're looking".
					" for is not a GP acc?");
  }

  ###
  ### Get full gp info.
  ###

  my $gp_worker = AmiGO::Worker::GOlr::GeneProduct->new();
  my $gp_info_hash = $gp_worker->get_info($input_gp_id);
  if( ! defined($gp_info_hash) || $self->{CORE}->empty_hash_p($gp_info_hash) ){
    return $self->mode_die_with_message("GP acc could not be found" .
					" in the index!");
  }

  $self->{CORE}->kvetch('solr docs: ' . Dumper($gp_info_hash));
  $self->set_template_parameter('GP_INFO', $gp_info_hash->{$input_gp_id});

  ###
  ### TODO: pull in additional annotation, etc. info.
  ###

  ###
  ### Standard setup.
  ###

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      # 'standard', # basic GO-styles
      # 'org.bbop.amigo.ui.autocomplete'
      'standard', # basic GO-styles
      'com.jquery.jqamigo.custom',
      #'com.jquery.tablesorter',
      'org.bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'com.jquery.tablesorter',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.ui.widgets'
     ],
     javascript =>
     [
      # $self->{JS}->make_var('global_count_data', $gpc_info),
      # $self->{JS}->make_var('global_rand_to_acc', $rand_to_acc),
      # $self->{JS}->make_var('global_acc_to_rand', $acc_to_rand),
      $self->{JS}->make_var('global_acc', $input_gp_id)
     ]
    };
  $self->add_template_bulk($prep);

  # ## Initialize javascript app.
  # $self->add_template_javascript($self->{JS}->get_lib('GPDetails.js'));
  # $self->add_template_javascript($self->{JS}->initializer_jquery('GPDetailsInit();'));

  $self->add_template_content('html/main/gene_product_details.tmpl');

  return $self->generate_template_page();
}


##
sub mode_live_search_term {

  my $self = shift;

  ## This bit is (and should be) a direct lift from Services. Since
  ## we're low speed, packets will not be needed.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('live_search_term');
  my $query = $params->{query};
  my $index = $params->{index} + 0; # coerce to int?
  my $count = $params->{count} + 0; # coerce to int?
  #my $packet = $params->{packet} + 0; # coerce to int?
  my $ontology = $params->{ontology};
  $self->{CORE}->kvetch("query: ". $query);
  $self->{CORE}->kvetch("index: ". $index);
  $self->{CORE}->kvetch("count: ". $count);
  #$self->{CORE}->kvetch("packet: ". $packet);
  $self->{CORE}->kvetch("ontology: ". $ontology);

  #$self->{CORE}->kvetch("page: ". $page);
  $self->set_template_parameter('SEARCHED_P', 0);

  if( $query && length($query) < 3 ){
    $self->mode_die_with_message('You need a query of at least' .
				 ' three characters.');
  }elsif( $query ){

    my $args_hash =
      {
       query => $query,
       index => $index,
       count => $count,
       ontology => $ontology,
      };
    my $tq = AmiGO::External::JSON::LiveSearch::Term->new();
    my $results = $tq->query($args_hash);
    my $next_url = $tq->next_url($args_hash);
    my $prev_url = $tq->previous_url($args_hash);

    ## Flag to let the template know that we got results.
    $self->set_template_parameter('SEARCHED_P', 1);

    $self->{CORE}->kvetch(Dumper($results));

    ## Add them into the parameters.
    $self->set_template_parameter('RESULTS', $results);
    $self->set_template_parameter('RESULTS_LIST', $results->{results}{hits});
    $self->set_template_parameter('RESULTS_TOTAL',
				  $results->{results}{meta}{total});
    $self->set_template_parameter('RESULTS_FIRST',
				  $results->{results}{meta}{first});
    $self->set_template_parameter('RESULTS_LAST',
				  $results->{results}{meta}{last});

    $self->set_template_parameter('NEXT_LINK', $next_url);
    $self->set_template_parameter('PREV_LINK', $prev_url);
  }

  ###
  ###
  ###

  ##
  $self->set_template_parameter('selected_ontology_hash',
				$self->{CORE}->to_hash($ontology));
  $self->set_template_parameter('ontology_hash', $self->{CORE}->ontology());

  ## 
  $self->set_template_parameter('query', $self->{CORE}->html_safe($query));
  $self->add_template_content('html/main/live_search_term.tmpl');
  return $self->generate_template_page();
}


## NOTE/WARNING: We're just going to ignore the homolset args for this
## one (unlike the real live version)--I'm not sure they really add
## much here.
sub mode_live_search_gene_product {

  my $self = shift;

  ## This bit is (and should be) a direct lift from Services. Since
  ## we're low speed, packets will not be needed.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('live_search_gene_product');
  my $query = $params->{query};
  my $index = $params->{index} + 0; # coerce to int?
  my $count = $params->{count} + 0; # coerce to int?
  my $species = $params->{species};
  my $source = $params->{source};
  my $gptype = $params->{gptype};
  $self->{CORE}->kvetch("query: ". $query);
  $self->{CORE}->kvetch("index: ". $index);
  $self->{CORE}->kvetch("count: ". $count);
  $self->{CORE}->kvetch("species: ". $species);
  $self->{CORE}->kvetch("source: ". $source);
  $self->{CORE}->kvetch("gptype: ". $gptype);

  #$self->{CORE}->kvetch("page: ". $page);
  $self->set_template_parameter('SEARCHED_P', 0);

  if( $query && length($query) < 3 ){
    $self->mode_die_with_message('You need a query of at least' .
				 ' three characters.');
  }elsif( $query ){

    ## Flag to let the template know that we got results.
    $self->set_template_parameter('SEARCHED_P', 1);
    ## Flag to say that we didn't barf...until proven otherwise.
    $self->set_template_parameter('SUCCESS_P', 1);

    my $args_hash =
      {
       query => $query,
       index => $index,
       count => $count,
       species => $species,
       source => $source,
       gptype => $gptype,
      };
    my $tq = AmiGO::External::JSON::LiveSearch::GeneProduct->new();
    my $results = $tq->query($args_hash);

    ## Try and describe a fail mode, but let everything else run as
    ## normal. Work it out in the template.
    if( ! $results->{success}){
      my $error = 'There was a problem: please try again or modify your query,';
      ## To get a non-generic error, cut things out after any newline.
      if( $results->{errors} && scalar(@{$results->{errors}}) > 0 ){
	my $raw_doc = $results->{errors}[0];
	my @raw_doc_split = split(/\n+/, $raw_doc);
	$error = $raw_doc_split[0];
	chomp($error);
      }
      $self->{CORE}->kvetch("error message: " . $error);
      $self->set_template_parameter('SUCCESS_P', 0);
      $self->set_template_parameter('ERROR_MESSAGE', $error);
    }

    ##
    my $next_url = $tq->next_url($args_hash);
    my $prev_url = $tq->previous_url($args_hash);

    # $self->{CORE}->kvetch(Dumper($results));

    ## Add them into the parameters.
    $self->set_template_parameter('RESULTS', $results);
    $self->set_template_parameter('RESULTS_LIST', $results->{results}{hits});
    $self->set_template_parameter('RESULTS_TOTAL',
				  $results->{results}{meta}{total});
    $self->set_template_parameter('RESULTS_FIRST',
				  $results->{results}{meta}{first});
    $self->set_template_parameter('RESULTS_LAST',
				  $results->{results}{meta}{last});

    $self->set_template_parameter('NEXT_LINK', $next_url);
    $self->set_template_parameter('PREV_LINK', $prev_url);
  }

  ###
  ###
  ###

  ## Selected hashes (what came in).
  $self->set_template_parameter('selected_species_hash',
				$self->{CORE}->to_hash($species));
  $self->set_template_parameter('selected_source_hash',
				$self->{CORE}->to_hash($source));
  $self->set_template_parameter('selected_gptype_hash',
				$self->{CORE}->to_hash($gptype));

  ## Form hashes.
  $self->set_template_parameter('species_hash', $self->{CORE}->species());
  $self->set_template_parameter('source_hash', $self->{CORE}->source());
  $self->set_template_parameter('gptype_hash', $self->{CORE}->gptype());

  ## 
  $self->set_template_parameter('query', $self->{CORE}->html_safe($query));
  $self->add_template_content('html/main/live_search_gene_product.tmpl');
  return $self->generate_template_page();
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

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'org.bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'newick.json',
      'newick.tree',
      'newick.tree_utils',
      'newick.phylo',
      'com.jquery',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.ui.widgets'
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
  $self->add_template_content('html/main/phylo_ntree.tmpl');
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

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'org.bbop.amigo.ui.widgets'
     ],
     javascript_library =>
     [
      'newick.json',
      'newick.tree',
      'newick.tree_utils',
      'newick.phylo',
      'com.jquery',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.ui.widgets'
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
  $self->add_template_content('html/main/phylo_ntree.tmpl');
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

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'org.bbop.amigo.ui.standard',
      'org.bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.workspace',
      'org.bbop.amigo.ui.workspace',
      'org.bbop.amigo.ui.widgets',
      'org.bbop.amigo.ui.cart',
      'org.bbop.amigo.ui.shield',
      'org.bbop.amigo.ui.wait',
      'org.bbop.amigo.ui.shopping'
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
  $self->add_template_content('html/main/scratch.tmpl');
  return $self->generate_template_page();
}


##
sub mode_workspace_client {

  my $self = shift;

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      #'org.bbop.amigo.ui.autocomplete',
      'org.bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     ## Our AmiGO services JSS.
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'com.jquery-layout',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      #'org.bbop.amigo.opensearch',
      #'org.bbop.amigo.ui.autocomplete',
      'org.bbop.amigo.workspace',
      'org.bbop.amigo.ui.widgets'
     ],
     content =>
     [
      '<div class="ui-layout-north">',
      'includes/header.tmpl',
      '</div>',
      '<div class="ui-layout-center">',
      'html/main/workspace_client.tmpl',
      '</div>',
      '<div class="ui-layout-south">',
      'includes/footer.tmpl',
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
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please
  $self->set_template_parameter('STANDARD_CSS', 'no');

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      #'org.bbop.amigo.ui.standard',
      #'org.bbop.amigo.ui.widgets',
      'com.jquery.redmond.custom'
     ],
     javascript_library =>
     [
      'com.jquery',
      'com.jquery-ui',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'as.core.core',
      'as.core.abstractmanager',
      'as.managers.jquery',
      'as.core.parameter',
      'as.core.parameterstore',
      'as.core.abstractwidget',
      'as.helpers.jquery.ajaxsolr.theme',
      'as.widgets.jquery.pagerwidget',
      'as.core.abstractfacetwidget'
      #'org.bbop.amigo.workspace',
      #'org.bbop.amigo.ui.workspace',
      #'org.bbop.amigo.ui.widgets',
      #'org.bbop.amigo.ui.cart',
      #'org.bbop.amigo.ui.shield',
      #'org.bbop.amigo.ui.wait',
      #'org.bbop.amigo.ui.shopping'
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
      'html/main/exhibit_exp.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  return $self->generate_template_page();
}


##
sub mode_front_page {

  my $self = shift;

  ## Non-standard settings.
  $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please
  $self->set_template_parameter('page_name', 'front'); # mimic front page

  ## Our AmiGO services CSS.
  my $prep =
    {
     css_library =>
     [
      'standard', # basic GO-styles
      'org.bbop.amigo.ui.autocomplete'
     ],
     javascript_library =>
     [
      'com.jquery',
      'org.bbop.amigo',
      'org.bbop.amigo.go_meta',
      'org.bbop.amigo.opensearch',
      'org.bbop.amigo.ui.autocomplete'
     ]
    };
  $self->add_template_bulk($prep);

  ## Initialize javascript app.
  $self->add_template_javascript($self->{JS}->initializer_jquery('new org.bbop.amigo.ui.autocomplete({id:"query", search_type:"general", completion_type:"acc", jump: true});'));

  ##
  $self->add_template_content('html/main/front_page.tmpl');
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
  $self->add_template_content('html/main/forward_to_main.tmpl');

  return $self->generate_template_page();
}



1;
