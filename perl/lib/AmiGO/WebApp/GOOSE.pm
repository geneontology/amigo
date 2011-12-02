=head1 AmiGO::WebApp::GOOSE

...

=cut

package AmiGO::WebApp::GOOSE;
use base 'AmiGO::WebApp';

use YAML qw(LoadFile);
use Data::Dumper;

use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use AmiGO::Sanitize;
use AmiGO::WebApp::Input;

use AmiGO::External::HTML::SQLWiki;
use AmiGO::External::LEAD::Status;
use AmiGO::External::LEAD::Query;
use AmiGO::External::GOLD::Status;
use AmiGO::External::GOLD::Query;
use AmiGO::External::JSON::Solr::Status;
use AmiGO::External::JSON::Solr::SafeQuery;

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
  $self->start_mode('goose');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'goose'    => 'mode_goose',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


my $tmpl_args =
  {
   title => 'Error!',
   header => 'GOOSE could not proceed!',
   message => 'This query could not be processed by GOOSE.',
  };

## Maybe how things should look in this framework?
sub mode_goose {

  my $self = shift;

  ## Input handling.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('goose');
  my $in_format = $params->{format};
  my $in_limit = $self->{CORE}->atoi($params->{limit}); # convert to int
  my $in_mirror = $params->{mirror};
  my $in_query = $params->{query};

  ###
  ### Get SQL from wiki. Add the discovered template variables at the
  ### end.
  ###

  $self->set_template_parameter('examples_list', undef);

  ##
  my $x = AmiGO::External::HTML::SQLWiki->new();
  my $examples_list = $x->extract_sql();
  if( scalar(@$examples_list) ){

    ## Push on default.
    unshift @$examples_list,
      {
       title => '(Select example query from the wiki)',
       sql => '',
      };

    ## Override undefined default.
    $self->set_template_parameter('examples_list', $examples_list);
  }

  ###
  ### Read in mirror information and check status. Add status
  ### information to the mirror information hash.
  ###

  my $mirror_loc =
    $self->{CORE}->amigo_env('AMIGO_ROOT') . '/conf/go_mirrors.yaml';

  #my $mirror_info = $self->{JS}->parse_json_file($mirror_loc);
  my $mirror_info = LoadFile($mirror_loc);
  #$self->{CORE}->kvetch("_mirror_info_dump_:" . Dumper($mirror_info));

  ## Run the mirror test on every mirror and at the same time see if
  ## they are a "main" (mirrors that should be considered for random
  ## default status) mirror or not.
  ## All mirrors go into one of these three mutually exclusive categories.
  my $main_mirrors = {};
  my $aux_mirrors = {};
  my $exp_mirrors = {};
  ## These are mutually exclusive, but not complete (no exp).
  my $alive_main_mirrors = {};
  my $alive_aux_mirrors = {};
  my $alive_exp_mirrors = {};
  my $dead_mirrors = {};
  foreach my $m (keys %$mirror_info){

    my $mirror = $mirror_info->{$m};
    #$self->{CORE}->kvetch("_mirrors_:" . Dumper($mirror));

    ## Mark main or not, exp or not.
    $self->{CORE}->kvetch("mirror: " . $m .
			  ", is_main_p: " . $mirror->{is_main_p} .
			  ", is_exp_p: " . $mirror->{is_exp_p});
    if( defined $mirror->{is_main_p} && $mirror->{is_main_p} eq 'true' ){
      $main_mirrors->{$m} = 1;
    }elsif( defined $mirror->{is_exp_p} && $mirror->{is_exp_p} eq 'true' ){
      $exp_mirrors->{$m} = 1;
    }else{
      $aux_mirrors->{$m} = 1;
    }

    ## Gather connection information.
    my $props =
      {
       'login' => $mirror->{login} || '',
       'password' => $mirror->{password} || '',
       'host' => $mirror->{host} || undef,
       'port' => $mirror->{port} || '3306',
       'database' => $mirror->{database} || undef,
       'type' => $mirror->{type} || undef,
      };

    ## Get the right status worker.
    my $status = undef;
    if( $mirror->{type} eq 'mysql' ){
      $status = AmiGO::External::LEAD::Status->new($props);
    }elsif( $mirror->{type} eq 'psql' ){
      $status = AmiGO::External::GOLD::Status->new($props);
    }elsif( $mirror->{type} eq 'solr' ){
      ## Solr behaves a little differently.
      $status = AmiGO::External::JSON::Solr::Status->new($mirror->{database});
    }else{
      $self->{CORE}->kvetch("_unknown database_");
      $tmpl_args->{message} = "_unknown database_";
      return $self->mode_generic_message($tmpl_args);
    }

    ## Check aliveness status and mark/cache accordingly.
    if( defined $status ){
      if( ! $status->alive() ){
	#$self->{CORE}->kvetch("DEAD DEAD DEAD " . $m);
	$dead_mirrors->{$m} = 1;
	$mirror_info->{$m}{is_alive_p} = 0;
      }else{
	#$self->{CORE}->kvetch($m . " is ALIVE!!!");

	## Mark alive and cache status.
	if( defined $main_mirrors->{$m} ){
	  $alive_main_mirrors->{$m} = 1;
	}elsif( defined $aux_mirrors->{$m} ){
	  $alive_aux_mirrors->{$m} = 1;
	}elsif( defined $exp_mirrors->{$m} ){
	  $alive_exp_mirrors->{$m} = 1;
	}
	$mirror_info->{$m}{is_alive_p} = 1;
	$mirror_info->{$m}{release_name} = $status->release_name();
	$mirror_info->{$m}{release_type} = $status->release_type();
      }
    }
  }

  # ## DEBUG.
  # $self->{CORE}->kvetch("main_mirrors: " . Dumper($main_mirrors));
  # $self->{CORE}->kvetch("aux_mirrors: " . Dumper($aux_mirrors));
  # $self->{CORE}->kvetch("exp_mirrors: " . Dumper($exp_mirrors));
  # $self->{CORE}->kvetch("alive_main_mirrors: " . Dumper($alive_main_mirrors));
  # $self->{CORE}->kvetch("alive_aux_mirrors: " . Dumper($alive_aux_mirrors));
  # $self->{CORE}->kvetch("alive_exp_mirrors: " . Dumper($alive_exp_mirrors));

  ## How do we pick our mirror? First check to see if there is an
  ## incoming mirror and if it is on the alive list. If not that,
  ## pick a random mirror from the intersection of the alive and main
  ## list. Finally, bail and pick any alive mirror.
  my $my_mirror = undef;
  if( defined $alive_main_mirrors->{$in_mirror} ||
      defined $alive_aux_mirrors->{$in_mirror} ||
      defined $alive_exp_mirrors->{$in_mirror} ){
    $my_mirror = $in_mirror;
    #$self->{CORE}->kvetch("will use default incoming mirror: " . $my_mirror);
  }else{
    ## Pick a random default if there is one.
    if( scalar(keys %$alive_main_mirrors) > 0 ){
      $my_mirror = $self->{CORE}->random_hash_key($alive_main_mirrors);
      #$self->{CORE}->kvetch("will use random alive main mirror: " .$my_mirror);
    }elsif( scalar(keys %$alive_aux_mirrors) > 0 ){
      $my_mirror = $self->{CORE}->random_hash_key($alive_aux_mirrors);
      #$self->{CORE}->kvetch("will use random alive aux mirror: " .$my_mirror);
    }
  }

  ## Check for major malfunction/problem.
  if( ! defined $my_mirror ){
    $tmpl_args->{message} =
      "No functioning mirror found--please contact GO Help.";
    return $self->mode_generic_message($tmpl_args);
  }else{
    $self->{CORE}->kvetch("GOOSE: using_mirror: " . $my_mirror);
  }

  ###
  ### TODO: Everything is safe if we're here and usable mirror has
  ### been selected. Make actual query if there is input.
  ###

  ##
  my $in_type = $mirror_info->{$my_mirror}{type};
  my $sql_results = undef;
  my $count = undef;
  my $sql_headers = undef; # for sql results
  my $direct_solr_url = undef; # for solr results
  my $solr_results = undef; # for solr results
  my $direct_solr_results = undef; # for solr results
  if( $in_query && defined $in_limit ){

    ## Get connection info.
    my $mirror = $mirror_info->{$my_mirror};
    my $props =
      {
       'login' => $mirror->{login} || '',
       'password' => $mirror->{password} || '',
       'host' => $mirror->{host} || undef,
       'port' => $mirror->{port} || '3306',
       'database' => $mirror->{database} || undef,
       'type' => $mirror->{type} || undef,
      };

    ###
    ### From this point on, two work flows--one for Solr and one for
    ### SQL (else).
    ###

    $self->{CORE}->kvetch("trying query:" . $in_query);

    ## Solr work, otherwise SQL.
    if( $in_type eq 'solr' ){

      ## Grab the solr worker.
      my $q = AmiGO::External::JSON::Solr::SafeQuery->new($props->{database});
      $q->safe_query($in_query);
      $solr_results = $q->docs();

      ## Let's check it again.
      if( defined $solr_results ){
	$count = $q->total() || 0;
	$in_limit = $q->count() || 0;
	$self->{CORE}->kvetch("Got Solr results #: " . $count);
	$direct_solr_url = $q->url();
	$direct_solr_results = $q->raw();
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

    }else{

      ## Get the right query worker for SQL.
      my $q = undef;
      if( $in_type eq 'mysql' ){
	$q = AmiGO::External::LEAD::Query->new($props, $in_limit);
      }elsif( $in_type eq 'psql' ){
	$q = AmiGO::External::GOLD::Query->new($props, $in_limit);
      }else{
	$self->{CORE}->kvetch("_unknown database_");
	$tmpl_args->{message} = "_unknown database_";
	return $self->mode_generic_message($tmpl_args);
      }

      ## Try sql.
      $self->{CORE}->kvetch("using limit: " . $in_limit);
      $sql_results = $q->try($in_query);
      #$self->{CORE}->kvetch("_res_: " . Dumper($sql_results));

      ## Check processing.
      if( ! $q->ok() ){
	$self->{CORE}->kvetch("_not ok_!");
	$tmpl_args->{message} = $q->error_message();
	return $self->mode_generic_message($tmpl_args);
      }

      ## Let's check it again.
      if( defined $sql_results ){
	$count = $q->count() || 0;
	$self->{CORE}->kvetch("Got SQL results #: " . $count);
	$sql_headers = $q->sql_headers();
      }else{
	## Final run sanity check.
	$tmpl_args->{message} =
	  "Something failed in the final SQL results check. Bailing";
	return $self->mode_generic_message($tmpl_args);
      }
    }
  }

  ###
  ### Four gross choices for output: text vs. html and SQL vs. Solr.
  ###

  my $output = '';
  if( $in_format eq 'text' && ( $in_type eq 'mysql' || $in_type eq 'psql' )){
    $self->{CORE}->kvetch("text/sql combination");

    $self->header_add( -type => 'plain/text' );

    my $nlbuf = [];
    foreach my $row (@$sql_results){
      my $tabbuf = [];
      foreach my $col (@$row){
	push @$tabbuf, $col;
      }
      push @$nlbuf, join "\t", @$tabbuf;
    }
    $output = join "\n", @$nlbuf;

  }elsif( $in_format eq 'text' && $in_type eq 'solr' ){
    $self->{CORE}->kvetch("text/solr combination: " . $direct_solr_results);
    $self->header_add( -type => 'plain/text' );
    $output = $direct_solr_results;
  }else{
    $self->{CORE}->kvetch("some html combination");

    if( $in_type eq 'mysql' || $in_type eq 'psql' ){
      $self->{CORE}->kvetch("html/sql combination");

      ## Cycle through results and webify them. This may include
      ## cleaning, text IDing for linking, etc.
      my $htmled_results = [];
      my $found_terms = [];
      my $found_terms_i = 0;
      if( defined $sql_results ){

	## TODO: fix sql_headers
	#$q->escapeHTML($header);

	##
	my $treg = $self->{CORE}->term_regexp();
	foreach my $row (@$sql_results){
	  my $rowbuf = [];
	  foreach my $col (@$row){
	    ## Some things may be undef.
	    if( $col ){
	      $col =~ s/\&/\&amp\;/g;
	      $col =~ s/\</\&lt\;/g;
	      $col =~ s/\>/\&gt\;/g;

	      ## Linkify things that look like terms.
	      if( $col =~ /($treg)/ ){
		my $link =
		  $self->{CORE}->get_interlink({
						mode => 'term-details-old',
						optional => { public => 1 },
						arg => { acc => $1 }
					       });
		$col = '<a title="'. $1 .'" href="'. $link .'">'. $1 .'</a>';
		if( $found_terms_i < $VISUALIZE_LIMIT ){
		  $found_terms_i++;
		  push @$found_terms, $1;
		}
	      }
	    }
	    push @$rowbuf, $col;
	  }
	  push @$htmled_results, $rowbuf;
	}
      }
    }elsif( $in_type eq 'solr' ){
      $self->{CORE}->kvetch("html/solr combination");
      #push @$htmled_results, "TODO: solr html output";

      # $direct_solr_results =~ s/\n/\<br \/\>/g;
      # push @$htmled_results, '<pre>' . $direct_solr_results . '</pre>';

      #$self->{CORE}->kvetch("results: " . Dumper($results));
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
    $self->set_template_parameter('mirror_info', $mirror_info);

    ## Page settings.
    $self->set_template_parameter('page_title',
				  'GO Online SQL/Solr Environment');
    $self->set_template_parameter('content_title',
				  'GO Online SQL/Solr Environment');

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
	'bbop.core',
	'bbop.logger',
	'bbop.amigo',
	'GOOSE'
       ]
      };
    $self->add_template_bulk($prep);

    ## Initialize javascript app.
    my $jsinit ='GOOSEInit();';
    $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));

    ## BUG?: Juggle onto absolute version of header template.
    #$self->set_template_parameter('page_name', 'amigo'); # menu bar okay
    #$self->set_template_parameter('is_goose_p', '1'); # ...but we are goose
    #$self->set_template_parameter('page_name', 'goose'); # rm menu bar
    #$self->add_template_content('common/header.tmpl');
    $self->add_template_content('pages/goose.tmpl');
    #$output = $self->generate_template_page({header=>0});
    $output = $self->generate_template_page();
  }
  return $output;
}



1;
