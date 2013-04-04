=head1 AmiGO::WebApp::Gannet

...

=cut

package AmiGO::WebApp::Gannet;
use base 'AmiGO::WebApp';

use YAML qw(LoadFile);
use Clone;
use Data::Dumper;

use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use AmiGO::Sanitize;
use AmiGO::WebApp::Input;

#use AmiGO::External::HTML::Wiki::LEAD;
#use AmiGO::External::HTML::Wiki::GOLD;
use AmiGO::External::HTML::Wiki::GOlr;
#use AmiGO::External::LEAD::Status;
#use AmiGO::External::LEAD::Query;
#use AmiGO::External::GOLD::Status;
#use AmiGO::External::GOLD::Query;
use AmiGO::External::JSON::Solr::GOlr::Status;
use AmiGO::External::JSON::Solr::GOlr::SafeQuery;

my $VISUALIZE_LIMIT = 50;

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
  $self->start_mode('gannet');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'gannet'    => 'mode_gannet',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## TODO/NOTE: These are separate for what again...?
my $tmpl_args =
  {
   title => 'Error!',
   header => 'Gannet could not proceed!',
   message => 'This query could not be processed by Gannet.',
  };


## Get the LEAD SQL examples from the wiki.
sub _gannet_get_wiki_golr_examples {

  my $self = shift;

  ##
  my $x = AmiGO::External::HTML::Wiki::GOlr->new();
  my $examples_list = $x->extract();
  if( scalar(@$examples_list) ){

    ## Push on default.
    unshift @$examples_list,
      {
       title => '(Select example GOlr Solr query from the wiki)',
       solr => '',
      };
  }

  return $examples_list;
}


## Return a properties hash usable for *::Status functions. Assume the
## the arguments are mostly legit.
sub _gannet_get_mirror_properties {

  my $self = shift;
  my $mirror = shift || die 'need a mirror';
  my $mirror_info = shift || die 'need a mirror info hash';

  my $props =
    {
     'login' => $mirror_info->{$mirror}{login} || '',
     'password' => $mirror_info->{$mirror}{password} || '',
     'host' => $mirror_info->{$mirror}{host} || undef,
     'port' => $mirror_info->{$mirror}{port} || '3306',
     'database' => $mirror_info->{$mirror}{database} || undef,
     'type' => $mirror_info->{$mirror}{type} || undef,
    };

  return $props;
}


## Return the status of the mirror, with a proper properties hash as
## an argument.
sub _gannet_get_mirror_status {

  my $self = shift;
  my $mirror_props = shift || die 'need a mirror property hash';
  my $retval = 0;

  ## Get the right status worker.
  my $status = undef;
  # if( $mirror_props->{type} =~ /lead/ ){
  #   $status = AmiGO::External::LEAD::Status->new($mirror_props);
  # }elsif( $mirror_props->{type} =~ /gold/ ){
  #   $status = AmiGO::External::GOLD::Status->new($mirror_props);
  # }elsif( $mirror_props->{type} =~ /solr/ ){
  if( $mirror_props->{type} =~ /solr/ ){
    ## Solr behaves a little differently.
    $status =
      AmiGO::External::JSON::Solr::GOlr::Status->new($mirror_props->{database});
  }else{
    $self->{CORE}->kvetch("_unknown database_");
    #$tmpl_args->{message} = "_unknown database_";
    #return $self->mode_generic_message($tmpl_args);
  }

  ## If we got a status, see if it's alive.
  if( $status ){
    if( $status->alive() ){
      $retval = 1;
    }
  }

  return $retval;
}


## Try and select a random live mirror from a set of mirrors. Return a
## mirror string for success, otherwise undef.
sub _gannet_mirror_select_from_set {

  my $self = shift;
  my $in_mirror_set = shift || die 'need a mirror set';
  my $wanted_mirror = shift || undef; # optional first try in the set
  my $ret_mirror = undef;

  ## Clone the mirror set as well be doing some destructive operations
  ## on it since we don't want a repeat in the loop.
  my $mirror_set = Clone::clone($in_mirror_set);

  ## First test if the wanted mirror is okay.
  if( defined $wanted_mirror ){ # do we have an incoming mirror?

    if( defined $mirror_set->{$wanted_mirror} ){ # is it in the set?

      ## If the wanted mirror looks good, take it.
      my $mirror_props =
	$self->_gannet_get_mirror_properties($wanted_mirror, $mirror_set);
      if( $self->_gannet_get_mirror_status($mirror_props) ){
	$ret_mirror = $wanted_mirror;
      }

      ## Either way, let's take the wanted mirror out of the
      ## set...only important if it turns out that it wasn't any good
      ## so we can skip it in the loop below.
      delete $mirror_set->{$wanted_mirror};
    }
  }

  ## If $ret_mirror is still not defined...
  if( ! defined $ret_mirror ){

    ## Randomly walk through the rest of the set and try them out,
    ## break out if we find one.
    foreach my $rand_mirror (@{$self->{CORE}->random_hash_keys($mirror_set)}){
      my $mirror_props =
	$self->_gannet_get_mirror_properties($rand_mirror, $mirror_set);
      if( $self->_gannet_get_mirror_status($mirror_props) ){
	$ret_mirror = $rand_mirror;
	last;
      }
    }
  }

  return $ret_mirror;
}


## Maybe how things should look in this framework?
sub mode_gannet {

  my $self = shift;

  ## Input handling.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('goose');
  my $in_format = $params->{format};
  my $in_limit = $self->{CORE}->atoi($params->{limit}); # convert to int
  my $in_mirror = $params->{mirror};
  my $in_query = $params->{query};

  ## Try and come to terms with Galaxy.
  my($in_galaxy, $galaxy_external_p) = $i->comprehend_galaxy('gannet');
  $self->galaxy_settings($in_galaxy, $galaxy_external_p);

  ## Get various examples from the wiki.
  $self->set_template_parameter('golr_examples_list',
				$self->_gannet_get_wiki_golr_examples());

  ###
  ### The idea is to make Gannet more responsive by not checking all of
  ### the mirrors, but using either a random main mirror or trying to
  ### use the user's selected mirror as an initial hint. Availability
  ### will be communicated only after the fact through the mq system
  ### or an error page. The whole purpose of this next section is to
  ### try and get values for: $my_mirror and $mirror_type_mismatch_p.
  ###

  my $my_mirror = undef;
  my $mirror_type_mismatch_p = 0;

  ## Read in known mirror information and check status.
  my $mirror_loc =
    $self->{CORE}->amigo_env('AMIGO_ROOT') . '/conf/go_solr_mirrors.yaml';
  #my $mirror_conf_info = $self->{JS}->parse_json_file($mirror_loc);
  my $mirror_conf_info = LoadFile($mirror_loc);
  #$self->{CORE}->kvetch("_mirror_conf_info_dump_:".Dumper($mirror_conf_info));

  ## Go through all of our mirrors and categorize them into the
  ## exclusive class sets.
  my $main_mirrors = {}; # have the class flag 'main'
  my $aux_mirrors = {}; # have the class flag 'aux'
  my $exp_mirrors = {}; # have the class flag 'exp'
  foreach my $m (keys %$mirror_conf_info){

    my $mirror = $mirror_conf_info->{$m};
    #$self->{CORE}->kvetch("curr mirror: " .  Dumper($mirror_conf_info));
    #$self->{CORE}->kvetch("curr mirror: " .  Dumper($mirror));

    if( defined $mirror->{class} ){
      if( $mirror->{class} eq 'main' ){
	$main_mirrors->{$m} = $mirror;
      }elsif( $mirror->{class} eq 'aux' ){
	$aux_mirrors->{$m} = $mirror;
      }elsif( $mirror->{class} eq 'exp' ){
	$exp_mirrors->{$m} = $mirror;
      }else{
	$self->{CORE}->kvetch('unknown mirror class, dropping...');
      }
    }else{
      $self->{CORE}->kvetch('class not defined for this mirror, dropping...');
    }
  }

  ## If there is an already selected mirror, check to see if it's
  ## okay. If it's not okay, do nothing and send message back.
  my $in_mirror_type = undef;
  if( defined $in_mirror && $in_mirror ){
    if( defined $mirror_conf_info->{$in_mirror} ){
      ## Make an attempt at contacting the chosen mirror.
      my $props =
	$self->_gannet_get_mirror_properties($in_mirror, $mirror_conf_info);
      $in_mirror_type = $props->{'type'};
      if( $self->_gannet_get_mirror_status($props) ){
	$my_mirror = $in_mirror;
      }else{
	$self->{CORE}->kvetch('selection not contactable: ' . $in_mirror);
	$self->add_mq('warning', "Gannet couldn't contact your selection; " .
		      "Gannet will try and use another mirror...")
      }
    }else{
      $self->{CORE}->kvetch('undefined $in_mirror');
      $self->add_mq('warning', "The mirror you selected wasn't defined; " .
		    "Gannet will try and use another mirror...")
    }
  }

  ## If my mirror isn't defined, either none came in or the one we
  ## wanted is no longer available. Try and find something else: main
  ## > aux > exp.
  if( defined $my_mirror ){
    $self->{CORE}->kvetch('found a usable incoming mirror: ' . $my_mirror);
  }else{

    ## First try the main mirrors.
    $my_mirror = $self->_gannet_mirror_select_from_set($main_mirrors);
    if( defined $my_mirror ){
      $self->{CORE}->kvetch('found a usable main mirror: ' . $my_mirror);
    }else{

      ## Odd, there should be a main mirror...
      $self->add_mq('warning', "No main recommended mirror was found! " .
		    "Gannet will try and select an auxiliary mirror...");

      ## Next try the aux mirrors.
      $my_mirror = $self->_gannet_mirror_select_from_set($aux_mirrors);
      if(  defined $my_mirror ){
	$self->{CORE}->kvetch('found a usable aux mirror: ' . $my_mirror);
      }else{

	## Odd, not even an experimental mirror...
	$self->add_mq('warning', "No auxiliary mirror was found! " .
		      "Gannet will try and select an experimental mirror...");

	## Finally try the exp mirrors.
	$my_mirror = $self->_gannet_mirror_select_from_set($exp_mirrors);
	if( defined $my_mirror ){
	  $self->{CORE}->kvetch('found a usable exp mirror: ' . $my_mirror);
	}else{
	  $self->add_mq('error', "No live mirror was found! " .
			"Please contact the GO Helpdesk for assistance.");
	  $self->{CORE}->kvetch('no usable exp mirror');
	}
      }
    }
  }

  # $self->{CORE}->kvetch("main_mirrors: " . Dumper($main_mirrors));
  # $self->{CORE}->kvetch("aux_mirrors: " . Dumper($aux_mirrors));
  # $self->{CORE}->kvetch("exp_mirrors: " . Dumper($exp_mirrors));

  ## Check for major malfunctions/problems in finding a mirror.
  if( ! defined $my_mirror ){
    $tmpl_args->{message} =
      "No functioning mirror found--please contact GO Help.";
    return $self->mode_generic_message($tmpl_args);
  }else{
    $self->{CORE}->kvetch("using_mirror: " . $my_mirror);
  }

  $self->{CORE}->kvetch('$in_mirror_type: ' . $in_mirror_type);
  $self->{CORE}->kvetch('reported mirror type: ' .
			$mirror_conf_info->{$in_mirror}{type});

  ## Was there a critical change in mirror type?
  if( defined $in_mirror_type &&
      $in_mirror_type ne $mirror_conf_info->{$my_mirror}{type} ){
    $self->{CORE}->kvetch("mirror type mismatch!");
    $mirror_type_mismatch_p = 1;
    $self->add_mq('error', "A mirror of the same type could not be found; " . 
		 'please select another method for your query.');
  }

  ###
  ### Everything is safe if we're here and usable mirror has been
  ### selected--otherwise, we would have errored out earlier. Make an
  ### actual query if there is input. We do skip the query if there
  ### was a mirror class mismatch.
  ###

  ##
  my $in_type = $mirror_conf_info->{$my_mirror}{type};
  my $sql_results = undef;
  my $count = undef;
  my $sql_headers = undef; # for sql results
  my $direct_solr_url = undef; # for solr results
  my $solr_results = undef; # for solr results
  my $direct_solr_results = undef; # for solr results
  if( $in_query && defined $in_limit && ! $mirror_type_mismatch_p ){

    ## Get connection info.
    my $mirror = $mirror_conf_info->{$my_mirror};
    my $props =
      $self->_gannet_get_mirror_properties($my_mirror, $mirror_conf_info);

    ###
    ### From this point on, two work flows--one for Solr and one for
    ### SQL (else).
    ###

    $self->{CORE}->kvetch("trying query:" . $in_query);

    ## Grab the solr worker.
    my $q =
      AmiGO::External::JSON::Solr::GOlr::SafeQuery->new($props->{database});
    $q->safe_query($in_query);
    $solr_results = $q->docs();

    ## Let's check it again.
    if( defined $solr_results ){

      ## Basic results.
      $count = $q->total() || 0;
      $in_limit = $q->count() || 0;
      $self->{CORE}->kvetch("Got Solr results #: " . $count);
      $direct_solr_url = $q->url();
      $direct_solr_results = $q->raw();

      ## Prepare the direct links to the GOlr data.
      my $golr_id_url = $q->download_results_url('id');
      my $golr_all_url = $q->download_results_url('*');
      $self->{CORE}->kvetch('golr id url: ' . $golr_id_url);
      $self->{CORE}->kvetch('golr all url: ' . $full_gaf_url);
      $self->set_template_parameter('direct_id_url_safe',
				    $self->{CORE}->html_safe($golr_id_url));
      $self->set_template_parameter('direct_all_url_safe',
				    $self->{CORE}->html_safe($golr_all_url));
    }else{

      ## Final run sanity check.
      #$self->{CORE}->kvetch('$q: ' . Dumper($q));
      if( $q->error_p() ){
	if( $q->raw() ){
	  my $raw_out = $q->html_safe($q->raw());
	  $tmpl_args->{message} = $q->error_message() . " " . $raw_out;
	}else{
	  $tmpl_args->{message} = $q->error_message();
	}
      }else{
	$tmpl_args->{message} =
	  "Something failed in Solr query process. Bailing.";
      }
      return $self->mode_generic_message($tmpl_args);
    }
  }

  ###
  ### Four gross choices for output: text vs. html and SQL vs. Solr.
  ###

  my $output = '';
  if( $in_format eq 'text' && $in_type =~ /solr/ ){
    $self->{CORE}->kvetch("text/solr combination: " . $direct_solr_results);
    $self->header_add( -type => 'plain/text' );
    $output = $direct_solr_results;
  }else{
    $self->{CORE}->kvetch("some html combination");

    ## HTML output collection.
    my $htmled_results = [];
    my $found_terms = [];
    my $found_terms_i = 0;

    if( $in_type =~ /solr/ ){
      $self->{CORE}->kvetch("html/solr combination");
      #push @$htmled_results, "TODO: solr html output";

      # $direct_solr_results =~ s/\n/\<br \/\>/g;
      # push @$htmled_results, '<pre>' . $direct_solr_results . '</pre>';

      my $treg = $self->{CORE}->term_regexp();

      foreach my $doc_hash (@$solr_results){
	my $sbuf = [];

	#$self->{CORE}->kvetch("row: " . Dumper($doc_hash));
	my @solr_keys = keys %$doc_hash;
	my @sorted_solr_keys =
	  sort {
	    if( $a eq 'id' ){
	      return -1;
	    }elsif( $b eq 'id' ){
	      return 1;
	    }else{
	      return 0;
	    }
	  }
	  @solr_keys;
	foreach my $k (@sorted_solr_keys){
	  my $v = $doc_hash->{$k};
	  if( ref($v) eq 'HASH' ){
	    push @$sbuf, '<b>' . $k . '</b>: ' . $v;
	  }elsif( ref($v) eq 'ARRAY' ){
	    push @$sbuf, '<b>' . $k . '</b>: ' . join(', ', @$v);
	  }else{
	    if( $v =~ /($treg)/ ){
	      my $link =
		$self->{CORE}->get_interlink({
					      mode => 'term_details',
					      arg => { acc => $1 }
					     });
	      $v = '<a title="'. $1 .'" href="'. $link .'">'. $1 .'</a>';
	    }
	    push @$sbuf, '<b>' . $k . '</b>: ' . $v;
	  }
	}

	push @$htmled_results,
	  '<ul></li>' . join('</li><li>', @$sbuf) . '</li></ul>';
      }

    }else{
      ## Huh...that shouldn't happen...
      $self->{CORE}->kvetch("Unknown combination");
      $tmpl_args->{message} = "Unknown type/format combination";
      return $self->mode_generic_message($tmpl_args);
    }

    ## HTML return phrasing.
    $self->set_template_parameter('database_type', $in_type);
    $self->set_template_parameter('query', $in_query);
    $self->set_template_parameter('results_count', $count);
    $self->set_template_parameter('results_headers', $sql_headers);
    $self->set_template_parameter('direct_solr_url',
				  $self->{CORE}->html_safe($direct_solr_url));
    $self->set_template_parameter('results', $htmled_results);

    ## Things that worry about term visualization.
    $self->set_template_parameter('terms_count', scalar(@$found_terms));
    $self->set_template_parameter('terms_limit', $VISUALIZE_LIMIT);
    $self->set_template_parameter('viz_link',
				  $self->{CORE}->get_interlink({mode=>'visualize_term_list', arg=>{terms=>$found_terms}}));

    ## Sort mirrors into ordered list by desirability.
    my $mlist = [];
    foreach my $m (keys %$main_mirrors){ push @$mlist, $m; }
    foreach my $m (keys %$aux_mirrors){ push @$mlist, $m; }
    foreach my $m (keys %$exp_mirrors){ push @$mlist, $m; }
    $self->set_template_parameter('all_mirrors', $mlist);
    $self->set_template_parameter('my_mirror', $my_mirror);
    $self->set_template_parameter('mirror_info', $mirror_conf_info);

    ## Page settings.
    $self->set_template_parameter('page_title',
				  'Gannet: GOOSE-like Solr Environment');
    $self->set_template_parameter('content_title',
				  'Gannet: GOOSE-like Solr Environment');

    ## 
    $self->{CORE}->kvetch("pre-template limit: " . $in_limit);
    $self->set_template_parameter('limit', $in_limit);
    # #$self->set_template_parameter('ARGH', $in_limit);
    # $self->set_template_parameter('ARGH', '...');

    ##
    my $prep =
      {
       css_library =>
       [
	'standard', # basic GO-styles
	'com.jquery.jqamigo.custom',
       ],
       javascript_library =>
       [
	'com.jquery',
	'com.jquery-ui',
	'bbop',
	#'amigo',
	'Gannet'
       ]
      };
    $self->add_template_bulk($prep);

    ## Initialize javascript app.
    my $jsinit ='GannetInit();';
    $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));

    ## BUG?: Juggle onto absolute version of header template.
    #$self->set_template_parameter('page_name', 'amigo'); # menu bar okay
    #$self->set_template_parameter('is_gannet_p', '1'); # ...but we are gannet
    #$self->set_template_parameter('page_name', 'gannet'); # rm menu bar
    #$self->add_template_content('common/header.tmpl');
    $self->add_template_content('pages/gannet.tmpl');
    #$output = $self->generate_template_page({header=>0});
    $output = $self->generate_template_page();
  }
  return $output;
}



1;
