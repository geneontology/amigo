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
#use AmiGO::Input.pm


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

  ## What the default prefix looks like.
  $self->{SESSION_STRING} = 'cgisess_';

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

  ## Structures needed for internal template handling.
  $self->{CORE}->kvetch("_in prerun...defining template structures");
  $self->{WEBAPP_CSS} = [];
  $self->{WEBAPP_JAVASCRIPT} = [];
  $self->{WEBAPP_CONTENT} = [];
  $self->{WEBAPP_TEMPLATE_PARAMS} = {};

  ## Hold on to the various message queues.
  $self->{WEBAPP_MQ} =
    {
     'error' => [],
     'warning' => [],
     'notice' => [],
     'success' => [],
    };

  ## 
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
  my $root_dir = $self->{CORE}->amigo_env('AMIGO_CGI_ROOT_DIR');
  my @root_a_files = glob($root_dir . '/.amigo.*');
  foreach my $afile (@root_a_files){
    if( $afile =~ /\.amigo\.warning.*/ ){
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
    foreach my $queue (("warning", "error")){
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
    #$self->query->status(503);
    $self->_status_message_exit('503', $reportable_error);
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
      length(@$retraref) == 0 || # there should at least be default
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

## The the params variable to the most common settings that we use.
## Will either modify a current params or make a new one.
sub _common_params_settings {

  my $self = shift;
  my $additional = shift || {};

  my $params = {};

  ## Check for and use google analytics.
  $params->{GOOGLE_ANALYTICS_ID} = $self->{CORE}->google_analytics_id();

  $params->{STANDARD_CSS} = 'yes';

  sub _atoi {
    my $thing = shift || 0;
    $thing = $self->{CORE}->atoi($thing);
    return $thing || 0;
  }

  ## Create and add to output buffer.
  ## TODO: these need to be folded in somewhere--shouldn't be here...
  $params->{base} = $self->{CORE}->amigo_env('AMIGO_CGI_URL');
  $params->{public_base} = $self->{CORE}->amigo_env('AMIGO_PUBLIC_CGI_URL');
  $params->{BETA} =
    _atoi($self->{CORE}->amigo_env('AMIGO_BETA'));
  $params->{last_load_date} = $self->{CORE}->amigo_env('GOLR_TIMESTAMP_LAST');
  #$params->{release_name} = $self->{CORE}->release_name();
  #$params->{release_type} = $self->{CORE}->release_type();
  $params->{release_date} = $params->{release_name};
  $params->{page_name} = 'amigo';
  $params->{amigo_mode} = $additional->{amigo_mode} || '';
  $params->{image_dir} = $self->{CORE}->amigo_env('AMIGO_HTML_URL') . '/images';
  $params->{js_dir} = $self->{CORE}->amigo_env('AMIGO_HTML_URL') .'/javascript';
  $params->{css_dir} = $self->{CORE}->amigo_env('AMIGO_HTML_URL') . '/css';
  $params->{show_blast} =
    _atoi($self->{CORE}->amigo_env('AMIGO_SHOW_BLAST'));
  $params->{html_url} = $self->{CORE}->amigo_env('AMIGO_HTML_URL');
  $params->{version} = $self->{CORE}->amigo_env('AMIGO_VERSION');
  my $sid = $params->{session_id} || '';
  $params->{session_id_for_url} = 'session_id=' . $sid;
  $params->{server_name} = $self->{CORE}->amigo_env('AMIGO_SERVER_NAME') || '';

  ## Titles seems to be the odds ones out for some reason.
  $params->{page_title} = 'AmiGO';
  if( $additional->{title} || $additional->{page_title} ){
    $params->{page_title} = $additional->{title} || $additional->{page_title};
  }

  ##
  $self->{WEBAPP_TEMPLATE_PARAMS} = $params;
  return $self->{WEBAPP_TEMPLATE_PARAMS};
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

##
sub add_template_bulk {

  my $self = shift;
  my $args = shift || {};

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
  if( defined $args->{content} ){
    foreach my $c (@{$args->{content}}){
      $self->add_template_content( $c );
    }
  }
}


## 1 (default) is full page, 0 is empty (ultra-lite) page.
sub generate_template_page {

  my $self = shift;
  my $args = shift || {};

  ## Check vs. defaults.
  ## TODO: pull documentation up.
  my $lite_p = 0;
  $lite_p = 1 if defined $args->{lite} && $args->{lite} == 1;
  my $footer_p = 1;
  $footer_p = 0 if defined $args->{footer} && $args->{footer} == 0;
  my $header_p = 1;
  $header_p = 0 if defined $args->{header} && $args->{header} == 0;
  # my $search_p = 1;
  # $search_p = 0 if defined $args->{search} && $args->{search} == 0;

  ## Generate the page output.
  my @mbuf = ();

  ## Do head. First CSS, then JS.
  push @mbuf, $self->_eval_content('common/head_open.tmpl');
  push @mbuf, $self->_eval_content('common/head_info_lite.tmpl') if ! $lite_p;
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

  ## The usual everywhere header.
  push @mbuf, $self->_eval_content('common/header.tmpl')
    if ! $lite_p && $header_p;

  ## Pre-main content output.
  push @mbuf, $self->_eval_content('common/content_open.tmpl');

  ## TODO: It looks like RoR-stlye messages and the like should go
  ## here.
  ## First error (X), then warning (!), then notice (<check>).
  #foreach my $queue (("error", "warning", "notice")){
  foreach my $queue (("notice", "warning", "error")){
    my $messages = $self->get_mq($queue);
    foreach my $message (@$messages){
      $self->{CORE}->kvetch('in queue output try: '. $queue . ": " . $message);
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message_type'} = $queue;
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message'} = $message;
      push @mbuf, $self->_eval_content('common/mq_message.tmpl')
    }
  }

  ## Main content output.
  foreach my $content (@{$self->{WEBAPP_CONTENT}}){ push @mbuf, $content; }
  push @mbuf, $self->_eval_content('common/content_close.tmpl');
  push @mbuf, $self->_eval_content('common/footer.tmpl')
    if ! $lite_p && $footer_p;
  push @mbuf, $self->_eval_content('common/close.tmpl');

  ## Merge and return.
  my $output = '';
  $output = join "\n", @mbuf;
  return $output;
}

=item new_generate_template_page

Experimental template setup build around BS3.

Args: ???
Returns: the page text

=cut
sub new_generate_template_page {

  my $self = shift;
  my $args = shift || {};

  ## Check vs. defaults.
  ## TODO: pull documentation up.

  ## Before we start, make sure that the beta is announced.
  $self->add_mq('notice', 'You are using'.
		' <a title="Go to AmiGO Labs explanation page"'.
		' href="http://wiki.geneontology.org/index.php/AmiGO_Labs"'.
		' class="alert-link">'.
		' AmiGO Labs</a>');

  ## Generate the page output.
  my @mbuf = ();

  ## Do head. First CSS, then JS.
  push @mbuf, $self->_eval_content('common/bs3/head_open.tmpl');
  foreach my $css (@{$self->{WEBAPP_CSS}}){ push @mbuf, $css; }
  foreach my $js (@{$self->{WEBAPP_JAVASCRIPT}}){ push @mbuf, $js; }
  push @mbuf, $self->_eval_content('common/bs3/head_close.tmpl');

  ## Do body.
  push @mbuf, $self->_eval_content('common/bs3/body_open.tmpl');

  ## Optional debugging output.
  if( $self->{CORE}->verbose_p() ){
    push @mbuf, '<!-- DEBUG -->';
    foreach my $key (keys %{$self->{WEBAPP_TEMPLATE_PARAMS}}){
      my $val = $self->{WEBAPP_TEMPLATE_PARAMS}{$key} || '<undefined>';
      push @mbuf, "<!-- $key : $val -->";
    }
  }

  ## The usual everywhere header.
  push @mbuf, $self->_eval_content('common/bs3/header.tmpl');
  #  if ! $lite_p && $header_p;

  ## Pre-main content output.
  push @mbuf, $self->_eval_content('common/bs3/content_open.tmpl');

  ## RoR-style messages and the like.
  foreach my $queue (("success", "notice", "warning", "error")){
    my $messages = $self->get_mq($queue);
    foreach my $message (@$messages){
      $self->{CORE}->kvetch('in queue output try: '. $queue . ": " . $message);
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message_type'} = $queue;
      $self->{WEBAPP_TEMPLATE_PARAMS}{'mq_last_message'} = $message;
      push @mbuf, $self->_eval_content('common/bs3/mq_message.tmpl')
    }
  }

  ## Main content output.
  foreach my $content (@{$self->{WEBAPP_CONTENT}}){ push @mbuf, $content; }
  #push @mbuf, $self->_eval_content('common/content_close.tmpl');
  push @mbuf, $self->_eval_content('common/bs3/footer.tmpl');
  #  if ! $lite_p && $footer_p;
  push @mbuf, $self->_eval_content('common/bs3/close.tmpl');

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

  $self->set_template_parameter('hid', $self->{CORE}->unique_id());
  $self->set_template_parameter('page_title', 'AmiGO 2: Status');
  $self->add_template_content('common/status.tmpl');
  $self->{CORE}->kvetch("added status");
  return $self->generate_template_page();
}

##
sub _status_message_exit {

  my $self = shift;
  my $code = shift || die 'requires a status code';
  my $message = shift || die 'requires a message';

  $self->{CORE}->kvetch("done with status $code and message ($message)");

  $self->header_props(-status => 503);
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
  my $err = shift || $@ || $! || $? || $^E;

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

  $self->add_template_content('common/error.tmpl');
  return $self->generate_template_page();
}


## Specific internal fatal error. Uses argument as message.
sub mode_fatal_with_message {

  my $self = shift;
  my $message = shift || '';

  $self->header_add( -status => '500 Internal Server Error' );

  $self->set_template_parameter('page_title', 'AmiGO 2: Fatal Error');
  $self->set_template_parameter('error', $message);

  $self->add_template_content('common/error.tmpl');
  return $self->generate_template_page();
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
				   header => 'Error!',
				   message => 'Unknown problem.',
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
  $self->header_add( -status => '500 Internal Server Error' );
  $self->set_template_parameter('page_title', 'AmiGO 2: Input Error');

  $self->add_template_content('pages/generic_message.tmpl');
  return $self->generate_template_page();
}


## Catching user and input errors.
sub mode_die_with_message {

  my $self = shift;
  my $message = shift || '';

  $self->header_add( -status => '500 Internal Server Error' );

  $self->set_template_parameter('page_title', 'AmiGO 2: Input Error');
  $self->set_template_parameter('error', $message);

  $self->add_template_content('common/die.tmpl');
  return $self->generate_template_page();
}

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
							      'live_search'}));

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
      'common/not_found.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  #$self->add_template_content('common/not_found.tmpl');
  return $self->generate_template_page();
}


## Catching mode errors.
sub mode_exception {

  my $self = shift;
  my $intended_runmode = shift;

  $self->header_add( -status => '500 Internal Server Error' );

  $self->set_template_parameter('page_title', 'AmiGO 2: Exception');
  $self->set_template_parameter('error', "Looking for \"$intended_runmode\", but found no such method.");

  $self->add_template_content('common/error.tmpl');
  return $self->generate_template_page();
}


###
### Common mode handling (JSON).
###


##
sub mode_js_status {

  my $self = shift;

  my $json_resp = AmiGO::JSON->new('status');

  $self->header_add( -type => 'application/json' );

  $json_resp->set_results({
			   heartbeat => $self->{JS}->{JSON_TRUE},
			   id => $self->{CORE}->unique_id(),
			  });

  return $json_resp->make_js();
}


## Catching nasty errors.
sub mode_js_fatal {

  my $self = shift;

  $self->header_add( -status => '500 Internal Server Error' );
  $self->header_add( -type => 'application/json' );

  ##
  my $json_resp = AmiGO::JSON->new('fatal');
  $json_resp->add_error($@);
  $json_resp->failed(1);
  return $json_resp->make_js();
}


# ## Catching nasty errors.
# sub mode_js_fatal_with_message {
#   my $self = shift;
#   my $message = shift || '';
#   $self->header_add( -status => '500 Internal Server Error' );
#   $self->header_add( -type => 'application/json' );
#   return $core->make_js($message);
# }


## Catching mode errors.
sub mode_js_exception {

  my $self = shift;
  my $intended_runmode = shift;

  $self->header_add( -status => '500 Internal Server Error' );
  $self->header_add( -type => 'application/json' );

  ##
  my $json_resp = AmiGO::JSON->new('exception');
  $json_resp->add_error($intended_runmode . " doesn\'t exist");
  $json_resp->failed(1);
  return $json_resp->make_js();
}

###
### Utility functions for the applications.
###

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
