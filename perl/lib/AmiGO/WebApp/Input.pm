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

  $self->{AWI_VALIDATION_RESULTS} = undef;

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
  $self->_add_global_settings();
  if( $profile_name eq '' ){
    ## Default nothingness.
  }elsif( $profile_name eq 'term' ){
    ## Due to dispatch, done through app.

    ##
    #$self->_add_loose_term();
    #$self->_add_simple_argument('format', 'html');
    #$self->_add_data_format('html');
    #$self->_add_galaxy();

    ## Experimental consumption of a REST API style bookmark.
    $self->_add_simple_optional_argument('query', '');
    $self->_add_simple_optional_argument('filter', '');
    $self->_add_simple_optional_argument('pin', '');

  }elsif( $profile_name eq 'gp' ){
    ## Due to dispatch, done through app.
    #$self->_add_gps_string();
  }elsif( $profile_name eq 'family' ){
    ## Optional string at this point since we have optional behavior.
    $self->_add_simple_argument('family', '');
  }elsif( $profile_name eq 'complex_annotation' ){
    #$self->_add_simple_argument('annotation_group', '');
    #$self->_add_simple_argument('annotation_unit', '');
    $self->_add_simple_argument('complex_annotation', '');
  }elsif( $profile_name eq 'matrix' ){
    $self->_add_named_terms_string();
    $self->_add_species();
    $self->_add_simple_argument('graph_type', 'all', ['all', 'no_regulates']);
  }elsif( $profile_name eq 'facet_matrix' ){
    $self->_add_simple_argument('facet1', '');
    $self->_add_simple_argument('facet2', '');
    $self->_add_simple_argument('manager', '');
  }elsif( $profile_name eq 'nmatrix' ){
    $self->_add_named_terms_string('term_set_1');
    $self->_add_named_terms_string('term_set_2');
    $self->_add_named_terms_string('term_set_3');
    $self->_add_named_terms_string('term_set_4');
    $self->_add_species();
    $self->_add_simple_argument('graph_type', 'all', ['all', 'no_regulates']);
  # }elsif( $profile_name eq 'external_resource' ){
  #   $self->_add_url();
  }elsif( $profile_name eq 'visualize_client' ){
    $self->_add_visual_format();
    $self->_add_term_data();
    $self->_add_term_data_type();
  }elsif( $profile_name eq 'visualize' ){
    $self->_add_inline_p();
    $self->_add_visual_format();
    $self->_add_term_data();
    $self->_add_term_data_type();
  }elsif( $profile_name eq 'visualize_freeform' ){
    $self->_add_inline_p();
    $self->_add_visual_format();
    $self->_add_term_data();
    $self->_add_graph_data();
  }elsif( $profile_name eq 'visualize_complex_annotation' ){
    $self->_add_inline_p();
    $self->_add_visual_format();
    $self->_add_simple_argument('complex_annotation', '');
  }elsif( $profile_name eq 'visualize_single' ){
    $self->_add_inline_p();
    $self->_add_loose_term();
  }elsif( $profile_name eq 'visualize_subset' ){
    $self->_add_inline_p();
    $self->_add_simple_argument('subset', '');
  }elsif( $profile_name eq 'gander' ){
    #$self->_add_visual_format();
    $self->_add_terms_string();
    $self->_add_geo_set();
  # }elsif( $profile_name eq 'id' ){
  #   $self->_add_simple_argument('id', '');
  # }elsif( $profile_name eq 'id_request' ){
  #   $self->_add_simple_argument('data', '');
  }elsif( $profile_name eq 'goose' ){
    $self->_add_simple_argument('limit', '1000',
				['0', '10', '100', '1000', '10000']);
    $self->_add_simple_argument('mirror', '');
    $self->_add_simple_argument('query', '');
  }elsif( $profile_name eq 'medial_search' ){
    $self->_add_simple_search_set();
  }elsif( $profile_name eq 'simple_search' ){
    $self->_add_simple_argument('golr_class', '');
    $self->_add_simple_argument('page', '1');
    $self->_add_simple_search_set();
  }elsif( $profile_name eq 'live_search' ){
    $self->_add_simple_argument('bookmark', '');
    $self->_add_simple_argument('query', '');
    ## TODO: I think we'll need to remove this once we
    ## we separate.
    $self->_add_simple_argument('golr_class', '');
    # ## Temp variable as we experiement with new template systems.
    # $self->_add_simple_argument('template', 'default');
  }elsif( $profile_name eq 'workspace' ){
    $self->_add_workspace_set();
  }else{
    die "no such input type (Input.pm)";
  }

  #$self->query();
  my $results = Data::FormValidator->check( $self->query(), $profile );
  $self->{AWI_VALIDATION_RESULTS} = $results;
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
  if( $results->{unknown} && scalar(keys %{$results->{unknown}}) ){
    $self->{CORE}->kvetch("Unknown:");
    foreach my $item (keys %{$results->{unknown}}){
      $self->{CORE}->kvetch("$item => " . $results->{unknown}->{$item});
    }
  }

  ## Lets wrap-up with the valids.
  if( $results->{valid} ){
    $self->{CORE}->kvetch("Valid:");
    foreach my $item (keys %{$results->{valid}}){
      $self->{CORE}->kvetch("\t$item => " . $results->{valid}->{$item});
    }
  }

  #my %nice_params = ();
  return $results->{valid};
}


=item comprehend_galaxy

A helper function to help keep track of which galaxy we're supposed to
be using and what's valid given the incoming GALAXY_URL which trumps
the local internal variable.

Keep in mind that it is up to the application writer to preserve the
variable when bouncing around--we're still restful, there is no
session!

Side effects: affects the message queue if there is a valid external
galaxy.

Returns: an array: first value galaxy url to use (or ''), second value
1 if external 0 if internal (sensible results only if the first value
is valid)

=cut
sub comprehend_galaxy {

  my $self = shift;
  my $flavor = shift || 'general'; # that's a TODO for upstream

  my $results = $self->{AWI_VALIDATION_RESULTS};
  my $params = $results->{valid};

  ## Galaxy prep if we don't have an incoming URL to work with, take
  ## the one from our configuration. If that's not there, skip it.
  ## We are also deciding if the galaxy url is internal or external.
  my $in_galaxy = $params->{GALAXY_URL};
  my $in_galaxy_external_p = undef;
  if( $in_galaxy ){ # note the external URL
    $in_galaxy_external_p = 1;
  }
  if( ! $in_galaxy ){
    ## Get the Galaxy return URL if we can.
    $in_galaxy = $self->{CORE}->get_interlink({mode => 'galaxy_by_tool',
					       arg => {tool_id => $flavor}});
    if( $in_galaxy ){ # use whatever is defined first in the template
      $in_galaxy_external_p = 0;
    }
  }

  return ($in_galaxy, $in_galaxy_external_p);
}

## Global settings for all inputs.
sub _add_global_settings {
  my $self = shift;
  ## I think this will be easier in the end for the optional args.
  $profile->{missing_optional_valid} = 1;
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
      $self->is_in_list_p(@$list);
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
      $self->is_in_list_p(@$list);
  }
}


## Allow for incoming galaxy instances.
sub _add_galaxy {
  my $self = shift;
  $self->_add_simple_argument('GALAXY_URL', '');
}


## Optional packet for async ordering.
sub _add_packet_order {
  my $self = shift;
  push @{$profile->{optional}}, 'packet';
  $profile->{constraint_methods}{packet} = qr/^[0-9]+$/;
}


# ## TODO/BUG: this needs a whiltelist or something--very dangerous, but will
# ## let slide for now because it's on a test machine only...
# sub _add_url {
#   my $self = shift;

#   push @{$profile->{required}}, 'external_resource';
#   $profile->{defaults}{external_resource} = '';
#   # $profile->{constraint_methods}{format} =
#   #   $self->is_in_list_p('svg', 'svg_raw', 'png', 'dot', 'navi');

#   # my $return_val = 0;
#   # if ( length($string) &&
#   #      $string =~ /^[a-zA-Z0-9\-\_\:\_\/\.]+$/ ){
#   #   $return_val = 1;
#   # }

#   # return $return_val;
# }


## Format.
sub _add_data_format {
  my $self = shift;
  my $default_format = shift || 'html';

  push @{$profile->{required}}, 'format';
  $profile->{defaults}{format} = $default_format;
  $profile->{constraint_methods}{format} =
    $self->is_in_list_p('html', 'json', 'xml', 'tab');
}


## Format.
sub _add_visual_format {
  my $self = shift;
  my $default_format = shift || 'png';

  push @{$profile->{required}}, 'format';
  $profile->{defaults}{format} = $default_format;
  $profile->{constraint_methods}{format} =
    $self->is_in_list_p('svg', 'svg_raw', 'png', 'dot', 'navi');
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
  #   $self->is_in_list_p(@{$self->{POSSIBLE_SPECIES_LIST}});
}


## Possible source.
sub _add_source {
  my $self = shift;
  push @{$profile->{optional}}, 'source';
  # $profile->{constraint_methods}{source} =
  #   $self->is_in_list_p(@{$self->{POSSIBLE_SOURCE_LIST}});
}


## Possible gene product types.
sub _add_gptype {
  my $self = shift;
  push @{$profile->{optional}}, 'gptype';
  # $profile->{constraint_methods}{gptype} =
  #   $self->is_in_list_p(@{$self->{POSSIBLE_GPTYPE_LIST}});
}


##
## TODO: add generalized constraint.
sub _add_loose_term {

  my $self = shift;

  ## Terms.
  #push @{$profile->{optional}}, 'term';
  push @{$profile->{required}}, 'term';
  # my $regexp = $self->{CORE}->term_regexp_string();
  # $profile->{constraint_methods}{term} = qr/^(\s*$regexp\s*)*$/;
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
  push @{$profile->{optional}}, 'gp';
  $profile->{constraint_methods}{gp} =
    qr/^(\s*[\w\d\-\_\.]+\:[\w\d\:\-\_\.]+\s*)*$/;
}


## Term data will be something like a JSON string or acc list...
## BUG: a little weak...
sub _add_term_data {
  my $self = shift;

  ## A string on incoming terms.
  push @{$profile->{optional}}, 'term_data';
  ## TODO: could add some constraints...
}


## Graph data will be JSON.
## BUG: a little weak...
sub _add_graph_data {
  my $self = shift;

  ## A string on incoming terms.
  push @{$profile->{optional}}, 'graph_data';
  ## TODO: could add some constraints...
}


##
sub _add_term_data_type {
  my $self = shift;

  push @{$profile->{required}}, 'term_data_type';
  $profile->{defaults}{term_data_type} = 'string';
  $profile->{constraint_methods}{term_data_type} =
    $self->is_in_list_p('string', 'json');
}


##
sub _add_inline_p {
  my $self = shift;
  push @{$profile->{required}}, 'inline';
  $profile->{defaults}{inline} = 'false';
  $profile->{constraint_methods}{inline} =
    $self->is_in_list_p('false', 'true');
}


##
sub _add_full_p {
  my $self = shift;
  push @{$profile->{required}}, 'full';
  $profile->{defaults}{full} = 'false';
  $profile->{constraint_methods}{full} =
    $self->is_in_list_p('false', 'true');
}

## Settings for geo-type things
sub _add_geo_set {
  my $self = shift;

  ##
  push @{$profile->{optional}}, 'lon';
  push @{$profile->{optional}}, 'lat';
  push @{$profile->{optional}}, 'focus';
  push @{$profile->{optional}}, 'zoom';
}


##
sub _add_workspace_set {
  my $self = shift;

  ##
  push @{$profile->{required}}, 'workspace';
  $profile->{defaults}{workspace} = 'default';

  push @{$profile->{required}}, 'action';
  $profile->{defaults}{action} = 'list';
  $profile->{constraint_methods}{action} =
    $self->is_in_list_p('list',
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


## Just a query.
sub _add_simple_search_set {
  my $self = shift;
  push @{$profile->{required}}, 'query';
  $profile->{defaults}{query} = '';
}


## For inputs that need to define a range for results.  TODO: should
## be constrained more for length, etc. Right not, it mostly looks
## like the paging one.
sub _add_range_set {
  my $self = shift;

  push @{$profile->{required}}, 'index';
  $profile->{defaults}{index} = '1';
  $profile->{constraint_methods}{index} = qr/^[0-9]+$/;

  push @{$profile->{required}}, 'count';
  $profile->{defaults}{count} = '20';
  $profile->{constraint_methods}{count} = qr/^[0-9]+$/;
}


##
sub _add_paging {
  my $self = shift;

  push @{$profile->{required}}, 'page';
  $profile->{defaults}{page} = 1;
  push @{$profile->{required}}, 'per_page';
  $profile->{defaults}{per_page} = 20;
}


=item is_small_p

Arguments: arg
Returns: 1 or 0

=cut
sub is_small_p {

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
sub is_medium_p {

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
sub is_large_p {

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
  my $self = shift;

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
  my $self = shift;
  return $self->is_in_list_p('yes', 'no');
}



1;
