=head1 AmiGO::WebApp::GOOSE

...

=cut

package AmiGO::WebApp::GOOSE;
use base 'AmiGO::WebApp';

use YAML qw(LoadFile);
#use Data::Dumper;

use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use Utility::Sanitize;
use AmiGO::WebApp::Input;
use AmiGO::External::HTML::SQLWiki;
use AmiGO::External::LEAD::Status;
use AmiGO::External::LEAD::Query;
use AmiGO::External::GOLD::Status;
use AmiGO::External::GOLD::Query;

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
  my $in_sql = $params->{sql};

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
  my $main_mirrors = {};
  my $aux_mirrors = {};
  my $dead_mirrors = {};
  my $alive_mirrors = {};
  my $default_mirrors = {};
  foreach my $m (keys %$mirror_info){

    my $mirror = $mirror_info->{$m};
    #$self->{CORE}->kvetch("_mirrors_:" . Dumper($mirror));

    ## Mark main or not.
    if( defined $mirror->{is_main_p} && $mirror->{is_main_p} ){
      $main_mirrors->{$m} = 1;
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
	$alive_mirrors->{$m} = 1;
	$mirror_info->{$m}{is_alive_p} = 1;
	$mirror_info->{$m}{release_name} = $status->release_name();
	$mirror_info->{$m}{release_type} = $status->release_type();

	## Since we're alive, anything main here would be a good
	## default--mark them as well.
	$default_mirrors->{$m} = 1
	  if defined $mirror->{is_main_p} && $mirror->{is_main_p};
      }
    }
  }

  ## How do we pick our mirror? First check to see if there is an
  ## incoming mirror and if it is on the alive list. If not that,
  ## pick a random mirror from the intersection of the alive and main
  ## list. Finally, bail and pick any alive mirror.
  #$self->{CORE}->kvetch("GOOSE: will use mirror: " . $in_mirror);
  #$self->{CORE}->kvetch("GOOSE: alive_mirrors: " . Dumper($alive_mirrors));
  my $my_mirror = undef;
  if( defined $alive_mirrors->{$in_mirror} ){
    $my_mirror = $in_mirror;
  }else{
    ## Pick a random default if there is one.
    if( scalar(keys %$default_mirrors) > 0 ){
      $my_mirror = $self->{CORE}->random_hash_key($default_mirrors);
    }else{
      ## Otherwise, pick a random living mirror.
      if( scalar(keys %$alive_mirrors) > 0 ){
	$my_mirror = $self->{CORE}->random_hash_key($alive_mirrors);
      }
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
  my $results = undef;
  my $count = undef;
  my $headers = undef;
  if( $in_sql && defined $in_limit ){

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

    ## Get the right query worker.
    my $q = undef;
    if( $mirror->{type} eq 'mysql' ){
      $q = AmiGO::External::LEAD::Query->new($props, $in_limit);
    }elsif( $mirror->{type} eq 'psql' ){
      $q = AmiGO::External::GOLD::Query->new($props, $in_limit);
    }else{
      $self->{CORE}->kvetch("_unknown database_");
      $tmpl_args->{message} = "_unknown database_";
      return $self->mode_generic_message($tmpl_args);
    }

    ## Try sql.
    $self->{CORE}->kvetch("trying sql:" . $in_sql);
    $self->{CORE}->kvetch("using limit: " . $in_limit);
    $results = $q->try($in_sql);
    #$self->{CORE}->kvetch("_res_: " . Dumper($results));

    ## Check processing.
    if( ! $q->ok() ){
      $self->{CORE}->kvetch("_not ok_!");
      $tmpl_args->{message} = $q->error_message();
      return $self->mode_generic_message($tmpl_args);
    }

    ## Let's check it again.
    if( defined $results ){
      $count = $q->count() || 0;
      $self->{CORE}->kvetch("Got results: " . $count);
      $headers = $q->headers();
    }else{
      ## Final run sanity check.
      $tmpl_args->{message} =
	"Something failed in the final results check. Bailing";
      return $self->mode_generic_message($tmpl_args);
    }
  }


  ###
  ### Quick if format is tab, otherwise go to standard page prep.
  ### TODO: This should be muxed out to a different function.
  ###
  ### Otherwise: Page preparation.
  ###

  my $output = '';
  if( $in_format eq 'tab' ){

    $self->header_add( -type => 'plain/text' );

    my $nlbuf = [];
    foreach my $row (@$results){
      my $tabbuf = [];
      foreach my $col (@$row){
	push @$tabbuf, $col;
      }
      push @$nlbuf, join "\t", @$tabbuf;
    }
    $output = join "\n", @$nlbuf;

  }else{

    ## Cycle through results and webify them. This may include
    ## cleaning, text IDing for linking, etc.
    my $htmled_results = [];
    my $found_terms = [];
    my $found_terms_i = 0;
    if( defined $results ){

      ## TODO: fix headers
      #$q->escapeHTML($header);

      ##
      my $treg = $self->{CORE}->term_regexp();
      foreach my $row (@$results){
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
    $self->set_template_parameter('sql', $in_sql);
    $self->set_template_parameter('results_count', $count);
    $self->set_template_parameter('results_headers', $headers);
    $self->set_template_parameter('results', $htmled_results);

    ## Things that worry about term visualization.
    $self->set_template_parameter('terms_count', scalar(@$found_terms));
    $self->set_template_parameter('terms_limit', $VISUALIZE_LIMIT);
    $self->set_template_parameter('viz_link',
				  $self->{CORE}->get_interlink({mode=>'visualize_term_list', arg=>{terms=>$found_terms}}));

    ## Sort mirrors into ordered list.
    my $mlist = [];
    foreach my $m (keys %$main_mirrors){ push @$mlist, $m; }
    foreach my $m (keys %$aux_mirrors){ push @$mlist, $m; }
    $self->set_template_parameter('all_mirrors', $mlist);
    $self->set_template_parameter('my_mirror', $my_mirror);
    $self->set_template_parameter('mirror_info', $mirror_info);

    ## Non-standard settings.
    $self->set_template_parameter('STANDARD_YUI', 'no'); # no YUI please
    $self->set_template_parameter('page_title', 'GO Online SQL Environment');

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
       ],
       javascript_library =>
       [
	'com.jquery',
	'org.bbop.amigo',
	'GOOSE'
       ]
      };
    $self->add_template_bulk($prep);

    ## Initialize javascript app.
    my $jsinit ='GOOSEInit();';
    $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));

    ## Juggle onto absolute version of header template.
    $self->set_template_parameter('page_name', 'amigo'); # menu bar okay
    $self->set_template_parameter('is_goose_p', '1'); # ...but we are goose
    #$self->set_template_parameter('page_name', 'goose'); # rm menu bar
    $self->add_template_content('common/header.tmpl');
    $self->add_template_content('pages/goose.tmpl');
    $output = $self->generate_template_page({header=>0});
  }
  return $output;
}



1;
