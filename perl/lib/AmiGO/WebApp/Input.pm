=head1 AmiGO::WebApp::Input

TODO: In order to validate things like ontology and such, this is
going to need a hook into the database to get to the goodies. We have
to move all of this stuff into one of the AmiGO subclasses, preferable
a CGI subclass so we can get our mits on CGI as well.

=cut

use utf8;
use strict;
use Data::FormValidator;
use AmiGO;
#use CGI qw/:standard/;
## No more carping--we'll do it from here on for style issues.
#use CGI::Carp qw(warningsToBrowser fatalsToBrowser);

package AmiGO::WebApp::Input;

use base "AmiGO::WebApp";

use constant LARGE_SIZE  => 10000;
use constant MEDIUM_SIZE => 256;
use constant SMALL_SIZE  => 4;

#my $core = AmiGO->new();

# my %known_formats =
#   (
#    'html' => 1,
#    'xml' => 1,
#    'json' => 1,
#    'tab' => 1,
#   );

# my %known_requests =
#   (
#    'client' => 1,
#    'results' => 1,
#    'jsapi' => 1,
#    'wsdl' => 1,
#   );


## BUG: why isn't this in new()?
## Our working profiles.
my $profile = {
	       required => [],
	       constraint_methods => {},
	       defaults => {},
};


=item new

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  #my $arg = shift || {};

  # # my @foo = keys %{$self->{CORE}->species()};
  # # $self->{POSSIBLE_SPECIES_LIST} = \@foo;
  # # $self->{CORE}->kvetch('_in_spec_ ' . join ' ', @foo);
  # $self->{POSSIBLE_SPECIES_LIST} = [keys %{$self->{CORE}->species()}];
  # $self->{POSSIBLE_SOURCE_LIST} = [keys %{$self->{CORE}->source()}];
  # $self->{POSSIBLE_GPTYPE_LIST} = [keys %{$self->{CORE}->gptype()}];
  # $self->{POSSIBLE_ONTOLOGY_LIST} = [keys %{$self->{CORE}->ontology()}];

  # $self->{CORE}->kvetch('_spec_'.join(' ',@{$self->{POSSIBLE_SPECIES_LIST}}));
  # $self->{CORE}->kvetch('_src_'.join(' ',@{$self->{POSSIBLE_SOURCE_LIST}}));
  # $self->{CORE}->kvetch('_gpt_'.join(' ',@{$self->{POSSIBLE_GPTYPE_LIST}}));
  # $self->{CORE}->kvetch('_ont_'.join(' ',@{$self->{POSSIBLE_ONTOLOGY_LIST}}));

  ## TODO: Junk below?
  ## We'll borrow SUCCESS and ERROR_MESSAGE from AmiGO.
  ## Set up CGI environment,
  ## TODO: Consider using CGI::Simple instead.
  #$CGI::POST_MAX = 1024 * 100000; ## 100M uploads max.
  # Get CGI query object
  #$self->{CGI} = $self->query();
  #$self->{ERROR} = AmiGO::Error->new(__PACKAGE__);
  ## TODO: Replace these with is_too_long etc. functions.
  #$self->{SMALL_LIMIT} = 256;
  #$self->{LARGE_LIMIT} = 100000;
  ## First, check the required default arguments.
  #foreach my $req_arg (keys %amigo_args){
  #}

  bless $self, $class;
  return $self;
}


=item input_profile

This function inspects the incoming input and returns a hash of all
valid variables.

Side effects: error accumulation.

=cut
sub input_profile {

  my $self = shift;
  my $profile_name = shift || '';

  ## Dynamically generate our argument profile.
  $self->_add_core_set();
  if( $profile_name eq '' ){
    ## Default nothingness.
  }elsif( $profile_name eq 'term' ){
    $self->_add_ontology();
    $self->_add_compat_term();
    # ## TODO: remove these later after testing.
    #$self->_add_simple_argument('graph_type', 'correct', ['all', 'correct']);
  }elsif( $profile_name eq 'gp' ){
    $self->_add_gp_set();
  }elsif( $profile_name eq 'gaffer' ){
    $self->_add_simple_argument('data_url', '');
  }elsif( $profile_name eq 'matrix' ){
    $self->_add_named_terms_string();
    $self->_add_species();
    $self->_add_simple_argument('graph_type', 'all', ['all', 'no_regulates']);
  }elsif( $profile_name eq 'nmatrix' ){
    $self->_add_named_terms_string('term_set_1');
    $self->_add_named_terms_string('term_set_2');
    $self->_add_named_terms_string('term_set_3');
    $self->_add_named_terms_string('term_set_4');
    $self->_add_species();
    $self->_add_simple_argument('graph_type', 'all', ['all', 'no_regulates']);
  }elsif( $profile_name eq 'external_resource' ){
    $self->_add_url();
  }elsif( $profile_name eq 'homolset_summary' ){
    $self->_add_homolset_summary_set();
  }elsif( $profile_name eq 'homolset_graph' ){
    $self->_add_homolset_graph_set();
  }elsif( $profile_name eq 'homolset_annotation' ){
    $self->_add_homolset_annotation_set();
  }elsif( $profile_name eq 'exp_search' ){
    $self->_add_exp_search_set();
  }elsif( $profile_name eq 'visualize_client' ){
    $self->_add_visual_format();
    $self->_add_term_data();
    $self->_add_term_data_type();
  }elsif( $profile_name eq 'visualize' ){
    $self->_add_inline_p();
    $self->_add_visual_format();
    $self->_add_term_data();
    $self->_add_term_data_type();
  }elsif( $profile_name eq 'visualize_single' ){
    $self->_add_inline_p();
    $self->_add_term();
  }elsif( $profile_name eq 'visualize_subset' ){
    $self->_add_inline_p();
    $self->_add_simple_argument('subset', '');
  }elsif( $profile_name eq 'gander' ){
    #$self->_add_visual_format();
    $self->_add_terms_string();
    $self->_add_geo_set();
#   }elsif( $profile_name eq 'terms_info' ){
#     $self->_add_terms_string();
#     $self->_add_full_p();
  }elsif( $profile_name eq 'id' ){
    $self->_add_simple_argument('id', '');
  }elsif( $profile_name eq 'id_request' ){
    $self->_add_simple_argument('data', '');
  }elsif( $profile_name eq 'goose' ){
    $self->_add_simple_argument('limit', '1000',
				['0', '10', '100', '1000', '10000']);
    $self->_add_simple_argument('mirror', '');
    $self->_add_simple_argument('query', '');
  }elsif( $profile_name eq 'term_info' ){
    $self->_add_terms_string();
    $self->_add_full_p();
  }elsif( $profile_name eq 'gene_product_info' ){
    $self->_add_gps_string();
    $self->_add_full_p();
  }elsif( $profile_name eq 'slimmer' ){
    $self->_add_terms_string();
    $self->_add_gps_string();
  }elsif( $profile_name eq 'slimmerish' ){
    $self->_add_terms_string();
    $self->_add_gps_string();
    $self->_add_simple_argument('load', '');
  }elsif( $profile_name eq 'simple_search' ){
    $self->_add_simple_search_set();
  }elsif( $profile_name eq 'live_search_term' ){
    $self->_add_simple_search_set();
    $self->_add_range_set();
    $self->_add_packet_order();
    $self->_add_ontology();
  }elsif( $profile_name eq 'live_search_gene_product' ){
    $self->_add_simple_search_set();
    $self->_add_range_set();
    $self->_add_packet_order();
    $self->_add_species();
    $self->_add_scientific();
    $self->_add_source();
    $self->_add_gptype();
    $self->_add_simple_optional_argument('homolset', ['included', 'excluded']);
  }elsif( $profile_name eq 'live_search_association' ){

    ## Bookkeeping.
    $self->_add_simple_search_set();
    $self->_add_range_set();
    $self->_add_packet_order();

    ## Term.
    $self->_add_ontology();

    ## GP.
    $self->_add_species();
    $self->_add_scientific();
    $self->_add_source();
    $self->_add_gptype();

    ## Association.
    $self->_add_evidence();

  }elsif( $profile_name eq 'live_search_association_golr' ){

    ## Bookkeeping.
    $self->_add_simple_search_set();
    $self->_add_range_set();
    $self->_add_packet_order();

    ## Term.
    $self->_add_ontology();

    ## GP.
    $self->_add_species();
    $self->_add_scientific();
    $self->_add_source();
    $self->_add_gptype();

    ## Association.
    $self->_add_evidence();

  }elsif( $profile_name eq 'paged_search' ){
    $self->_add_simple_search_set();
    $self->_add_paging();
  }elsif( $profile_name eq 'workspace' ){
    $self->_add_workspace_set();
  }elsif( $profile_name eq 'xp_term_request' ){
    $self->_add_xp_term_request();
  }elsif( $profile_name eq 'orb' ){
    $self->_add_orb_set();
  }elsif( $profile_name eq 'orb_client' ){
    $self->_add_orb_client_set();
  }elsif( $profile_name eq 'assoc' ){
    $self->_add_ontology();
    $self->_add_term();
    $self->_add_gp_set();
    $self->_add_assoc_set();
  }else{
    die "no such input type (Input.pm)";
  }

  #$self->query();
  my $results = Data::FormValidator->check( $self->query(), $profile );
  #my $results = Data::FormValidator->check( $self->{CGI}, $profile );

  ## TODO: Throw errors, tantrum, to message...something.
  if( $results->has_missing() ){
    $self->{CORE}->kvetch("Missing:");
    foreach my $item (keys %{$results->{missing}}){
      $self->{CORE}->kvetch("$item => " . $results->{missing}->{$item});
    }
  }

  ## TODO: Throw errors, tantrum, to message...something.
  if( $results->has_invalid() ){
    $self->{CORE}->kvetch("Invalid:");
    foreach my $item (keys %{$results->{invalid}}){
      $self->{CORE}->kvetch("$item => " . $results->{invalid}->{$item});
    }
  }


  ## For the time being, these can just rot, but I'm sure we'll want
  ## them for something later.
  #if( $results->{unknown} ){
  #  print STDERR "<p>\n";
  #  print STDERR "Unknown: <br />\n";
  #  foreach my $item (keys %{$results->{unknown}}){
  #    print STDERR "<p>$item => " . $results->{unknown}->{$item} . "</p>\n";
  #  }
  #  print STDERR "</p>\n";
  #}

  ## Lets wrap-up the valids
  if( $results->{valid} ){
    $self->{CORE}->kvetch("Valid:");
    foreach my $item (keys %{$results->{valid}}){
      $self->{CORE}->kvetch("$item => " . $results->{valid}->{$item});
    }
  }

  #my %nice_params = ();
  return $results->{valid};
}


##
sub _add_core_set {

  my $self = shift;

  ## I think this will be easier in the end for the optional args.
  $profile->{missing_optional_valid} = 1;

  ## Allow for incoming galaxy instances.
  $self->_add_simple_argument('GALAXY_URI', '');

  ## Request.
  #push @{$profile->{required}}, 'request';
  #$profile->{defaults}{request} = 'client';
  #$profile->{constraint_methods}{request} = qr/^client|data$/;

  ## Let's try and move away from this as well--this should be defined
  ## by the kind of WebApp rather than in here.
  ## Format.
  push @{$profile->{required}}, 'format';
  $profile->{defaults}{format} = 'html';
  $profile->{constraint_methods}{format} =
    is_in_list_p('html', 'xml', 'tab', 'text', 'json',
		 'svg', 'svg_raw', 'png', 'dot',
		 'navi');

  ## Let's try and move away from this...
  # ## Session ID.
  # push @{$profile->{optional}}, 'session_id';
  # ## TODO: correct this, shall I generate this here?
  # #$profile->{constraint_methods}{session_id} = qr/^GO\:\d{7}$/;
}


## Optional packet for async ordering.
sub _add_packet_order {

  ##
  push @{$profile->{optional}}, 'packet';
  $profile->{constraint_methods}{packet} = qr/^[0-9]+$/;
}


##
sub _add_simple_argument {

  my $self = shift;
  my $arg = shift || die "need to provide an argument: $!";
  my $default = shift;
  my $list = shift || [];

  ## Okay if it's 0 or '';
  if( ! defined $default ){
    die "need to provide a default: $!";
  }

  ##
  push @{$profile->{required}}, $arg;
  $profile->{defaults}{$arg} = $default;
  if( $list && scalar(@$list) > 0 ){
    $profile->{constraint_methods}{$arg} =
      is_in_list_p(@$list);
  }
}


##
sub _add_simple_optional_argument {

  my $self = shift;
  my $arg = shift || die "need to provide an argument: $!";
  my $list = shift || [];

  ##
  push @{$profile->{optional}}, $arg;
  if( $list && scalar(@$list) > 0 ){
    $profile->{constraint_methods}{$arg} =
      is_in_list_p(@$list);
  }
}


## BUG: this needs a whiltelist or something--very dangerous, but will
## let slide for now because it's on a test machine only...
sub _add_url {

  ##
  push @{$profile->{required}}, 'external_resource';
  $profile->{defaults}{external_resource} = '';
  # $profile->{constraint_methods}{format} =
  #   is_in_list_p('svg', 'svg_raw', 'png', 'dot', 'navi');

  # my $return_val = 0;
  # if ( length($string) &&
  #      $string =~ /^[a-zA-Z0-9\-\_\:\_\/\.]+$/ ){
  #   $return_val = 1;
  # }

  # return $return_val;
}


##
sub _add_visual_format {

  ## Format.
  push @{$profile->{required}}, 'format';
  $profile->{defaults}{format} = 'png';
  $profile->{constraint_methods}{format} =
    is_in_list_p('svg', 'svg_raw', 'png', 'dot', 'navi');
}


##
sub _add_ontology {

  ## One ontology.
  #push @{$profile->{required}}, 'ontology';
  push @{$profile->{optional}}, 'ontology';
  # $profile->{defaults}{ontology} = 'all';
  $profile->{constraint_methods}{ontology} =
    ## BUG: why is this still hard-coded!? Core is available, right?
    is_in_list_p('all',
		 'biological_process',
		 'cellular_component',
		 'molecular_function');
}


##
sub _add_saxis {

  my $self = shift;

  my $in_arg_val = shift;
  my $arg_val = 'species';
  $arg_val = $in_arg_val . '_species' if $in_arg_val;

  ## One species.
  push @{$profile->{required}}, $arg_val;
  $profile->{defaults}{$arg_val} = 'null'; #
}


## Evidence codes.
## TODO: restricted list easier/better?
sub _add_evidence {
  my $self = shift;
  push @{$profile->{optional}}, 'evidence';
}


## Scientific name.
sub _add_scientific {
  my $self = shift;
  push @{$profile->{optional}}, 'scientific';
}


## Possible ncbi taxa id/species.
sub _add_species {
  my $self = shift;
  push @{$profile->{optional}}, 'species';
  # $profile->{constraint_methods}{species} =
  #   is_in_list_p(@{$self->{POSSIBLE_SPECIES_LIST}});
}


## Possible source.
sub _add_source {
  my $self = shift;
  push @{$profile->{optional}}, 'source';
  # $profile->{constraint_methods}{source} =
  #   is_in_list_p(@{$self->{POSSIBLE_SOURCE_LIST}});
}


## Possible gene product types.
sub _add_gptype {
  my $self = shift;
  push @{$profile->{optional}}, 'gptype';
  # $profile->{constraint_methods}{gptype} =
  #   is_in_list_p(@{$self->{POSSIBLE_GPTYPE_LIST}});
}


##
## TODO: add generalized constraint.
sub _add_term {

  my $self = shift;

  ## Terms.
  push @{$profile->{optional}}, 'term';
  my $regexp = $self->{CORE}->term_regexp_string();
  $profile->{constraint_methods}{term} = qr/^(\s*$regexp\s*)$/;
}


## This is specifically for the case where we want ot be compatible
## with the old term-details.cgi and allow for subset accs and normal
## go_ids. Likely only useful for term_details.
sub _add_compat_term {

  my $self = shift;

  ## Terms.
  push @{$profile->{required}}, 'term';
  my $regexp = $self->{CORE}->term_regexp_string();
  $profile->{constraint_methods}{term} = sub {

    my ($dfv, $val) = @_;
    #$dfv->set_current_constraint_name('my_constraint_name');
    my $retval = 0;
    if( $val =~ /^(\s*$regexp\s*)$/ ){
      $retval = 1;
    }else{
      my $ss = $self->{CORE}->subset();
      if( $ss->{$val} ){
	$retval = 1;
      }
    }

    return $retval;
  }
}


##
sub _add_terms_string {

  my $self = shift;

  ## A string of incoming terms.
  push @{$profile->{optional}}, 'term';
  push @{$profile->{optional}}, 'terms';
  my $regexp = $self->{CORE}->term_regexp_string();
  $profile->{constraint_methods}{term} = qr/^(\s*$regexp\s*)*$/;
  $profile->{constraint_methods}{terms} = qr/^(\s*$regexp\s*)*$/;
}


##
sub _add_named_terms_string {

  my $self = shift;
  my $name = shift || 'terms';

  ## A string on incoming terms.
  push @{$profile->{optional}}, $name;
  my $regexp = $self->{CORE}->term_regexp_string();
  $profile->{constraint_methods}{$name} = qr/^(\s*$regexp\s*)*$/;
}


##
sub _add_gps_string {

  my $self = shift;

  ## A string on incoming (possible) gps.
  push @{$profile->{optional}}, 'gene_product';
  $profile->{constraint_methods}{gene_product} =
    qr/^(\s*[\w\d\-\_\.]+\:[\w\d\:\-\_\.]+\s*)*$/;
}


## Term data will be something like a JSON string or acc list...
## BUG: a little weak...
sub _add_term_data {

  ## A string on incoming terms.
  push @{$profile->{optional}}, 'term_data';
  ## TODO: could add some constraints...
}


##
sub _add_term_data_type {
  push @{$profile->{required}}, 'term_data_type';
  $profile->{defaults}{term_data_type} = 'string';
  $profile->{constraint_methods}{term_data_type} =
    is_in_list_p('string', 'json');
}


##
sub _add_inline_p {
  push @{$profile->{required}}, 'inline';
  $profile->{defaults}{inline} = 'false';
  $profile->{constraint_methods}{inline} =
    is_in_list_p('false', 'true');
}


##
sub _add_full_p {
  push @{$profile->{required}}, 'full';
  $profile->{defaults}{full} = 'false';
  $profile->{constraint_methods}{full} =
    is_in_list_p('false', 'true');
}


## Settings for geo-type things
sub _add_geo_set {

  ##
  push @{$profile->{optional}}, 'lon';
  push @{$profile->{optional}}, 'lat';
  push @{$profile->{optional}}, 'focus';
  push @{$profile->{optional}}, 'zoom';
}


##
sub _add_workspace_set {

  ##
  push @{$profile->{required}}, 'workspace';
  $profile->{defaults}{workspace} = 'default';

  push @{$profile->{required}}, 'action';
  $profile->{defaults}{action} = 'list';
  $profile->{constraint_methods}{action} =
    is_in_list_p('list',
		 #'list_workspace',
		 'add_workspace',
		 'copy_workspace',
		 'clear_workspace',
		 'remove_workspace',
		 'add_item',
		 'remove_item');

  ## Stuff for adding and removing items.
  push @{$profile->{optional}}, 'key';
  push @{$profile->{optional}}, 'name';
  push @{$profile->{optional}}, 'type';

  ## Stuff for copying.
  push @{$profile->{optional}}, 'copy_to_workspace';
  $profile->{defaults}{copy_to_workspace} = 'default';
}


##
sub _add_homolset_summary_set {

  ## Use cache?
  push @{$profile->{required}}, 'cache';
  $profile->{defaults}{cache} = 'yes';

  ## Table ordering.
  #push @{$profile->{required}}, 'order';
  #$profile->{defaults}{order} = 'by_symbol';
  #$profile->{constraint_methods}{order} =
  #  is_in_list_p('by_count',
  #		 'by_symbol');

  ## Show additional evidence code information.
  #push @{$profile->{required}}, 'show_ev';
  #$profile->{defaults}{show_ev} = 'no';
  #$profile->{constraint_methods}{show_ev} =
  #  is_in_list_p('no',
  #		 'yes');
}


##
sub _add_homolset_graph_set {

  ## One single integer.
  push @{$profile->{required}}, 'set';
  $profile->{constraint_methods}{set} = qr/^[0-9]+$/;

  ## TODO: This is a 'hidden' bit just to run some testing on
  ## GraphViz. It should be removed for production.`
  push @{$profile->{optional}}, 'format';
  $profile->{constraint_methods}{format} =
    is_in_list_p('dot', 'svg', 'svg_raw', 'png', 'dot', 'navi');

  ## Use cache?
  push @{$profile->{required}}, 'cache';
  $profile->{defaults}{cache} = 'yes';
}


##
sub _add_homolset_annotation_set {

  ## One single integer.
  push @{$profile->{required}}, 'set';
  $profile->{constraint_methods}{set} = qr/^[0-9]+$/;

  ## Ordering argument.
  push @{$profile->{required}}, 'order';
  $profile->{defaults}{order} = 'default';
  $profile->{constraint_methods}{order} =
    is_in_list_p('default', 'name', 'depth', 'information');
}


## Possible gene product types.
sub _add_xp_term_request {
  my $self = shift;
  push @{$profile->{optional}}, 'target';
  push @{$profile->{optional}}, 'genus';
  push @{$profile->{optional}}, 'relation';
  push @{$profile->{optional}}, 'name';
}


##
sub _add_orb_client_set {

  ### One single integer.
  #push @{$profile->{required}}, 'set';
  #$profile->{constraint_methods}{set} = qr/^[0-9]+$/;
}


##
sub _add_orb_set {

  ## One single integer.
  push @{$profile->{required}}, 'request';
  $profile->{defaults}{request} = 'information';
  $profile->{constraint_methods}{request} =
    is_in_list_p(
		 'information',
		 'trackers',
		 'tracker_information',
		 'items',
		 'add',
		 'jsapi'
		);

# ## Who is calling?
# my $agent = $query->param('agent');
# if ( $agent && length($agent) > 128 ){
#   die_xml('illegitimate agent (not well defined)');
# }

# ## What format do they want?
# my $format = $query->param('format');
# if ( $format ){
#   if ( length($format) > 128 &&
#        $format ne 'xml' &&
#        $format ne 'obo' ){
#     die_xml('illegitimate format (not well defined)'); }
# }else {
#   $format = 'xml'
# }

# ## One of three or the info message.
# my $request = $query->param('request');
# if ( $request && ( $request ne 'trackers' &&
# 		   $request ne 'tracker_information' &&
# 		   $request ne 'items' &&
# 		   $request ne 'add' &&
# 		   $request ne 'jsapi' )) {
#   die_xml('illegitimate request (unknown value)');
# }

# ## The ontology id must be known from the trackers list.
# my $ontology_id = $query->param('ontology_id');
# if ( $ontology_id && ! $$trackers{$ontology_id} ){
#   die_xml('illegitimate ontology id (unknown value)');
# }

# ## Details of individual items? We default to 'false'.
# my $detailed_information = $query->param('detailed_information');
# if ( $detailed_information && length($detailed_information) > 128 ){
#   die_xml('illegitimate detail value (not well structured)');
# }elsif( $detailed_information &&
# 	$detailed_information ne 'true' &&
# 	$detailed_information ne 'false' ){
#   die_xml('illegitimate detail value (not well defined)');
# }elsif( ! $detailed_information ){
#   $detailed_information = 'false';
# }

# ## The summary to add.
# my $summary = $query->param('summary');
# if ( $summary && length($summary) > 128) {
#   die_xml('illegitimate summary (too many characters)');
# }

# ## Optional: proposed definition.
# my $definition = $query->param('definition');
# if ( $definition && length($definition) > 2048) {
#   die_xml('illegitimate definition (too many characters)');
# }

# ## The details to add.
# my $details = $query->param('details');
# if ( $details && length($details) > 2048 ) {
#   die_xml('illegitimate details (too many characters)');
# }

# ## The category id to add and sane default.
# my $category_id = $query->param('category_id');
# if ( $category_id &&
#      (length($category_id) > 10 ||
#       length($category_id) < 1 ||
#       ! ($category_id =~ /^[0-9]+$/)) ) {
#   die_xml('illegitimate category id (odd structure)');
# }
# $category_id = $global_category_id_default if ! $category_id;

# ## The artifact group id to add and sane default.
# my $artifact_group_id = $query->param('artifact_group_id');
# if ( $artifact_group_id &&
#      (length($artifact_group_id) > 10 ||
#       length($artifact_group_id) < 1 ||
#       ! ($artifact_group_id =~ /^[0-9]+$/)) ) {
#   die_xml('illegitimate artifact group id (odd structure)');
# }
# $artifact_group_id = $global_artifact_group_id_default
#   if ! $artifact_group_id;

# ## The username (login for status checks) to use.
# my $username = $query->param('username');
# if ( $username && length($username) > 64) {
#   die_xml('illegitimate username (too many characters)');
# }

# ## The login (for adding terms) to use.
# my $login = $query->param('login');
# if ( $login && length($login) > 64) {
#   die_xml('illegitimate login (too many characters)');
# }

# ## The password to use.
# my $password = $query->param('password');
# if ( $password && length($password) > 64) {
#   die_xml('illegitimate password (too many characters)');
# }

# ## Optional: type of modification.
# my $modtype = $query->param('modtype');
# if ( $modtype && ( $modtype ne 'new' &&
# 		   $modtype ne 'modify' &&
# 		   $modtype ne 'other')) {
#   die_xml('illegitimate modification type (unknown value)');
# }

# ## Optional: attribution string.
# my $attribution = $query->param('attribution');
# if ( $attribution && length($attribution) > 256) {
#   die_xml('illegitimate attribution (too many characters)');
# }

# ## TODO/BUG/DEBUG: Only work with my TEST.
# if( $request eq 'add' && $ontology_id && $ontology_id ne 'TEST' ){
#   die_xml('ORB only works with TEST right now');
# }

}


##
sub _add_exp_search_set {

  push @{$profile->{optional}}, 'type';
  $profile->{constraint_methods}{type} =
    is_in_list_p('gp', 'term', 'gene_product');
  push @{$profile->{required}}, 'query';
  $profile->{defaults}{query} = '';
  push @{$profile->{required}}, 'page';
  $profile->{defaults}{page} = '1';
}


## Just a query.
sub _add_simple_search_set {
  push @{$profile->{required}}, 'query';
  $profile->{defaults}{query} = '';
}


## For inputs that need to define a range for results.  TODO: should
## be constrained more for length, etc. Right not, it mostly looks
## like the paging one.
sub _add_range_set {

  push @{$profile->{required}}, 'index';
  $profile->{defaults}{index} = '1';
  $profile->{constraint_methods}{index} = qr/^[0-9]+$/;

  push @{$profile->{required}}, 'count';
  $profile->{defaults}{count} = '20';
  $profile->{constraint_methods}{count} = qr/^[0-9]+$/;
}


##
sub _add_paging {

  push @{$profile->{required}}, 'page';
  $profile->{defaults}{page} = 1;
  push @{$profile->{required}}, 'per_page';
  $profile->{defaults}{per_page} = 20;
}


##
sub _add_gp_set {

  ## GPs.
  push @{$profile->{optional}}, 'gp';
  ## TODO: get a tighter definition of a gene product.
  $profile->{constraint_methods}{gp} = qr/^[\w\d\:]+$/i;
}


##
sub _add_assoc_set {

  ## TODO:
}


# ## Optional but necessary numeric argument.
# #
# if( $min_gps &&
#     ( length($min_gps) > $upper_arg_size_limit ||
#       $min_gps =~ /[^0-9]+/ ) ){ # TODO: Make this a better check.
#   die_template({MESSAGE => 'illegitimate min_gps value',
# 		STAMP => $time_stamp, URL => $html_url});
# }elsif( $min_gps ){
#   $min_gps = $min_gps + 0;
# }else{
#   $min_gps = 2;
# }


## We should be moving over to a cookie based system, but...
# #    session_id =>
## Not even sure what this was supposed to be.
# #    version =>
## This is now unneeded because of the exception/message queues.
# #    force =>


=item is_small_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_small_p{

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && length($in) < SMALL_SIZE ) {
    $result = 1;
  }

  return $result;
}


=item is_medium_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_medium_p{

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && length($in) < MEDIUM_SIZE ) {
    $result = 1;
  }

  return $result;
}


=item is_large_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_large_p{

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && length($in) < LARGE_SIZE ) {
    $result = 1;
  }

  return $result;
}


=item is_whole_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_whole_p {

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && $in =~ /^[0-9]+$/ ) {
    $result = 1;
  }

  return $result;
}


=item is_integer_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_integer_p {

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && $in =~ /^[\+\-]?[0-9]+$/ ) {
    $result = 1;
  }

  return $result;
}


=item is_float_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_float_p {

  my $self = shift;
  my $in = shift || undef;
  my $result = 0;

  if ( $in && $in =~ /^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/ ) {
    $result = 1;
  }

  return $result;
}


=item is_in_list_p

Arguments: variable number of strings.
Returns: a function which returns a boolean from the arguments.

Note: This is a good example of using closures to get hand written
constraints.

=cut
sub is_in_list_p {

  my @possibilities = @_;

  return sub{

    my $dfv = shift;
    #my $name = $dfv->get_current_constraint_name();
    my $value = $dfv->get_current_constraint_value();

    my $return_val = 0;

    foreach my $possibility (@possibilities){
      if( $possibility eq $value ){
	$return_val = 1;
	last;
      }
    }

    return $return_val;
  }
}


=item is_yes_no_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_yes_no_p {

  return is_in_lis_tp('yes', 'no');
}




# ## Gene labels in the input box for enrichment processing.
# my $gp_list = $query->param('gp_list');
# if( $gp_list &&
#     ( length($gp_list) > $upper_list_arg_size_limit ||
#       $gp_list =~ /[^0-9a-zA-Z\_\.\s\-\[\]\(\)\:]+/ ) ){
#   die_template({MESSAGE => 'illegitimate gene list value',
# 		STAMP => $time_stamp, URL => $html_url});
# }
# if( $gp_list && $gp_list !~ /[a-z0-9]/i ){ # text in there too
#   $gp_list = '';
# }

# ## Stub for the background gene product list.
# my $bggp_list = $query->param('bggp_list');
# if( $bggp_list &&
#     ( length($bggp_list) > $upper_list_arg_size_limit ||
#       $bggp_list =~ /[^0-9a-zA-Z\_\.\s\-\[\]\(\)\:]+/ ) ){
#   die_template({MESSAGE => 'illegitimate background gene list value',
# 		STAMP => $time_stamp, URL => $html_url});
# }
# if( $bggp_list && $bggp_list !~ /[a-z0-9]/i ){ # text in there too
#   $bggp_list = '';
# }
# #my $bggp_list = '';

# ## The gene product list file.
# my $gp_filehandle = $query->upload('gp_file');
# if ( ! $gp_filehandle  && $query->cgi_error() ){
#   my $error = $query->cgi_error();
#   die_template({MESSAGE => "gp_file upload failed: $error ",
# 		STAMP => $time_stamp, URL => $html_url});
# }else{
#   if ( $gp_filehandle && (
# 			  $gp_filehandle =~ /\.gz/i ||
# 			  $gp_filehandle =~ /\.bz/i ||
# 			  $gp_filehandle =~ /\.bz2/i ||
# 			  $gp_filehandle =~ /\.zip/i ||
# 			  $gp_filehandle =~ /\.z/i ||
# 			  $gp_filehandle =~ /\.tgz/i ) ){
#     die_template({MESSAGE =>
# 		  "AmiGO does not currently accept compressed files. " .
# 		  "Please uncompress your file and try again.",
# 		  STAMP => $time_stamp, URL => $html_url});
#   }
# }

# ## The background gene product list file.
# my $bggp_filehandle = $query->upload('bggp_file');
# if ( ! $bggp_filehandle  && $query->cgi_error() ){
#   my $error = $query->cgi_error();
#   die_template({MESSAGE => "bggp_file upload failed: $error ",
# 		STAMP => $time_stamp, URL => $html_url});
# }else{
#   if ( $bggp_filehandle && (
# 			  $bggp_filehandle =~ /\.gz/i ||
# 			  $bggp_filehandle =~ /\.bz/i ||
# 			  $bggp_filehandle =~ /\.bz2/i ||
# 			  $bggp_filehandle =~ /\.zip/i ||
# 			  $bggp_filehandle =~ /\.z/i ||
# 			  $bggp_filehandle =~ /\.tgz/i ) ){
#     die_template({MESSAGE =>
# 		  "AmiGO does not currently accept compressed files. " .
# 		  "Please uncompress your file and try again.",
# 		  STAMP => $time_stamp, URL => $html_url});
#   }
# }

# ## What is the GP file type?
# my $gp_file_type = $query->param('gp_file_type');
# if( $gp_file_type && length($gp_file_type) > $upper_arg_size_limit ){
#   die_template({MESSAGE => "illegitimate gp_file_type value",
# 		STAMP => $time_stamp, URL => $html_url});
# }elsif( $gp_file_type && ( $gp_file_type eq 'list' ||
# 			   $gp_file_type eq 'ga' ) ){
#   ## OK, let it go.
# }elsif( $gp_file_type ){
#   die_template({MESSAGE => "unknown gp_file_type value",
# 		STAMP => $time_stamp, URL => $html_url});
# }

# ## What is the BGGP file type?
# my $bggp_file_type = $query->param('bggp_file_type');
# if( $bggp_file_type && length($bggp_file_type) > $upper_arg_size_limit ){
#   die_template({MESSAGE => "illegitimate bggp_file_type value",
# 		STAMP => $time_stamp, URL => $html_url});
# }elsif( $bggp_file_type && ( $bggp_file_type eq 'list' ||
# 			     $bggp_file_type eq 'ga' ) ){
#   ## OK, let it go.
# }elsif( $bggp_file_type ){
#   die_template({MESSAGE => "unknown bggp_file_type value",
# 		STAMP => $time_stamp, URL => $html_url});
# }

# ## Optional but necessary numeric argument.
# #my $cutoff = $query->param('cutoff');
# if( $cutoff &&
#     ( length($cutoff) > $upper_arg_size_limit ||
#       $cutoff =~ /[^0-9\.]+/ ) ){ # TODO: Make this a better check.
#   die_template({MESSAGE => 'illegitimate cutoff value',
# 		STAMP => $time_stamp, URL => $html_url});
# }elsif( $cutoff ){
#   $cutoff = $cutoff + 0.0;
# }else{
#   $cutoff = 0.1;
# }


# ## Optional but necessary numeric argument.
# #my $min_gps = $query->param('min_gps');
# if( $min_gps &&
#     ( length($min_gps) > $upper_arg_size_limit ||
#       $min_gps =~ /[^0-9]+/ ) ){ # TODO: Make this a better check.
#   die_template({MESSAGE => 'illegitimate min_gps value',
# 		STAMP => $time_stamp, URL => $html_url});
# }elsif( $min_gps ){
#   $min_gps = $min_gps + 0;
# }else{
#   $min_gps = 2;
# }


# ##
# sub is_under_small_length_bounds_p {

#   my $arg = shift || '';
#   my $return_val = 0;

#   if( $arg < $upper_small_arg_size_limit ){
#     $return_val = 1
#   }else{
#     ## TODO: add real error here.
#     print STDERR "not under small bound\n";
#   }

#   return $return_val;
# }


# ##
# sub is_under_large_length_bounds_p {

#   my $arg = shift || '';
#   my $return_val = 0;

#   if( $arg < $upper_large_arg_size_limit ){
#     $return_val = 1
#   }else{
#     ## TODO: add real error here.
#     print STDERR "not under large bound\n";
#   }

#   return $return_val;
# }


# ##
# sub is_a_gp_list_p {

#   my $arg = shift || '';
#   my $return_val = 0;

#       $gp_list
#   die_template({MESSAGE => 'illegitimate gene list value',
# 		STAMP => $time_stamp, URL => $html_url});
# }
# if( $gp_list !~ /[a-z0-9]/i ){ # text in there too


#   if( $arg =~ /[^0-9a-zA-Z\_\.\s\-\[\]\(\)\:]+/ ){
#     if( $gp_list !~ /[a-z0-9]/i ){ # text in there too

#   }else{
#   }
#       $arg
#  ){
#     $return_val = 1
#   }else{
#     ## TODO: add real error here.
#     print STDERR "not string boolean\n";
#   }

#   return $return_val;
# }



# ##
# ##
# ## 
# ##

# ## These are arguments that required by all amigo components.
# ## request: if it is not defined, 

# ##########
# ##
# ## Sanity check all possible incoming parameters:
# ##
# ## Flow arguments:
# ## 'request' drop into data mode, build data structure
# ## 'force' this will force continuation instead of dying for *small*
# ## problems
# ##
# ## Results arguments:
# ## 'output' what we output (e.g. map, gafile, count, etc.)
# ## 'format' how we output
# ##
# ## Data arguments:
# ## 'gp_list' list of gene ids
# ## 'gp_file' content of a gene id file (post)
# ## 'gp_file_type'
# ## 'bggp_file' content of a gene id file (post) for the background set
# ## 'bggp_file_type'
# ##
# ## Filter arguments:
# ## 'cutoff'
# ## 'min_gps'
# ## 'speciesdb'
# ## 'ontology'
# ##### 'evcode' TODO
# ##


# ## TODO: output?
# ## TODO: force?
# ## These are arguments that may be required by all amigo components.
# ## TODO: Lamers are below the gap.
# my @amigo_optional_args = qw(
# 			      term
# 			      term_list
# 			      gp
# 			      gp_list
# 			      homology

# 			      chunk

# 			      output
# 			   );

# ## These are the possible groups of filters for AmiGO components.
# ## 
# ## gene_product_group: tax_id, species_db, gp_type
# ## association_group:  evcode, qualifier, assigned_by
# ## term_group:         ont
# my @amigo_filter_group_args = qw(
# 				  gene_product_group
# 				  association_group
# 				  term_group
# 			       );


# ##
# sub is_a_string_or_empty_p {

#   my $string = shift;
#   die "this function requires an argument: $!" if ! defined $string;

#   my $return_val = 0;
#   if ( length($string) &&
#        $string =~ /^[a-zA-Z0-9\.\-\_\/\\:]+$/ ){
#     $return_val = 1;
#   }elsif( $string eq '' ){
#     $return_val = 1;
#   }

#   return $return_val;
# }


# ##
# sub is_a_binary_p {

#   my $string = shift;
#   die "this function requires an argument: $!" if ! defined $string;

#   my $return_val = 0;
#   if ( length($string) &&
#        -e $string ){
#        #-e $string &&
#        #-f $string &&
#        #-X $string ){
#     $return_val = 1;
#   }

#   return $return_val;
# }


# ##
# sub is_a_directory_p {

#   my $string = shift;
#   die "this function requires an argument: $!" if ! defined $string;

#   my $return_val = 0;
#   if ( length($string) &&
#        -e $string &&
#        -d $string &&
#        -R $string ){
#     $return_val = 1;
#   }

#   return $return_val;
# }


# ##
# sub depends_is_filters_false_p {

#   my $return_val = 0;
#   if ( $env_conf{GO_USE_DEFAULT_AMIGO_FILTERS}{NEW_VALUE} eq '0' ){
#     $return_val = 1;
#   }

#   return $return_val;
# }


# ##
# sub is_always_true {
#   return 1;
# }


# ##
# sub depends_is_blast_pbs_true_p {

#   my $return_val = 0;
#   if ( $env_conf{GO_SHOW_BLAST}{NEW_VALUE} eq '1' ){
#     if ( $env_conf{GO_BLAST_METHOD}{NEW_VALUE} eq 'pbs' ){
#       $return_val = 1;
#     }
#   }

#   return $return_val;
# }




1;
