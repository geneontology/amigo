=head1 AmiGO::WebApp::Grebe

...

=cut

package AmiGO::WebApp::Grebe;
use base 'AmiGO::WebApp';

use YAML qw(LoadFile);
use Clone;
use Data::Dumper;

use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;

use AmiGO::WebApp::Input;

use AmiGO::External::HTML::Wiki::GOlr;
#use AmiGO::External::JSON::Solr::GOlr::Status;
#use AmiGO::External::JSON::Solr::GOlr::SafeQuery;

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
  $self->start_mode('grebe');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'grebe'    => 'mode_grebe',
		   'AUTOLOAD' => 'mode_exception'
		  );
}


## TODO/NOTE: These are separate for what again...?
my $tmpl_args =
  {
   title => 'Error!',
   header => 'Grebe could not proceed!',
   message => 'Grebe is very confused. Grebe falls over.',
  };


## Get the LEAD SQL examples from the wiki.
sub _grebe_get_wiki_golr_examples {

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

## Maybe how things should look in this framework?
sub mode_grebe {

  my $self = shift;

  ## Input handling.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('goose');
  my $in_format = $params->{format};
  my $in_limit = $self->{CORE}->atoi($params->{limit}); # convert to int
  my $in_mirror = $params->{mirror};
  my $in_query = $params->{query};

  ## Try and come to terms with Galaxy.
  my($in_galaxy, $galaxy_external_p) = $i->comprehend_galaxy('general');
  $self->galaxy_settings($in_galaxy, $galaxy_external_p);

  # ## Get various examples from the wiki.
  # $self->set_template_parameter('golr_examples_list',
  # 				$self->_grebe_get_wiki_golr_examples());

  ## Pull in our wizard questions from conf/grebe.yaml.
  my $questions_loc =
    $self->{CORE}->amigo_env('AMIGO_ROOT') . '/conf/grebe.yaml';
  my $questions_info = LoadFile($questions_loc);
  #$self->{CORE}->kvetch("_q_dump_:".Dumper($questions_info));

  ## Convert the double-piped fields into actual input fields. Also,
  ## tag the jump image onto the end.
  foreach my $question_info (@$questions_info){

    ## First, grab the question string and grab the field translations
    ## and try and replace the double-piped strings with proper input
    ## fields.
    my $question_id = $question_info->{'question_id'};
    my $question = $question_info->{'question'};
    my $group_label = $question_info->{'group_label'} || undef;

    ## We also have the group labels in there, so try and sort them
    ## out, and leave untouched for final processing.
    if( $group_label ){
      ## No-op.
    }else{

      my $translations = $question_info->{'field_translations'} || [];
      foreach my $trans (@$translations){

	my $field_id = $trans->{'field_id'};

	my $from = '{{' . $field_id . '}}';
	my $to = '<input id="'. $field_id . '"' .
	  ' style="border:1px solid black;"' .
	    ' title="Hint: add a space after completing a word to' .
	      ' narrow the search."' .
		' class="amigo-grebe-tooltip"' .
		  '>';
	my $ind = index($question, $from);
	substr($question, $ind, length($from)) = $to;
	#$question =~ s/$from/$to/;
      }
      ## Make the cumulative switch.
      $question_info->{'question'} = $question;

      ## Finally, tag the jump image onto the end.
      $question_info->{'question'} = '<span id="' .
	$question_id . '">' .
	  $question_info->{'question'} . ' ' .
	    '<img class="amigo-grebe-action-icon" title="Jump to AmiGO 2 Search" alt="[search]" src="' . $self->{CORE}->amigo_env('AMIGO_IMAGE_URL') . '/info-jump.png" />' . '</span>';
    }
  }

  $self->set_template_parameter('questions', $questions_info);

  ## Page settings.
  $self->set_template_parameter('page_name', 'grebe');
  $self->set_template_parameter('page_title', 'AmiGO 2: Grebe');
  $self->set_template_parameter('content_title',
				'Grebe Search Wizard');

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
      'amigo'
     ],
     javascript =>
     [
      $self->{JS}->get_lib('GeneralSearchForwarding.js'),
      $self->{JS}->get_lib('Grebe.js'),
      $self->{JS}->make_var('global_grebe_questions', $questions_info),
     ],
     javascript_init =>
     [
      'GeneralSearchForwardingInit();',
      'GrebeInit();'
     ],
     content =>
     [
      'pages/grebe.tmpl'
     ]
    };
  $self->add_template_bulk($prep);

  # ## Initialize javascript app.
  # my $jsinit ='GrebeInit();';
  # $self->add_template_javascript($self->{JS}->initializer_jquery($jsinit));
  # $self->add_template_content('pages/grebe.tmpl');
  # #$output = $self->generate_template_page({header=>0});
  $output = $self->generate_template_page();

  return $output;
}



1;
