####
#### Stateless services.
####

package AmiGO::WebApp::Services;
use base 'AmiGO::WebApp';

use strict;
use utf8;
use Data::Dumper;
#use AmiGO::JavaS

##
use AmiGO::Input;
use CGI::Application::Plugin::TT;
#use CGI::Application::Plugin::Redirect;

## Real external workers.
use AmiGO::Worker::GOlr::IC;
use AmiGO::Worker::GOlr::Closure;


##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 1;

  ## Templates.
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
  			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('status');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'status'             => 'mode_status',
		   'term_ic'            => 'mode_term_ic',
		   'term_closure'       => 'mode_term_closure',
		   'term_ic_closure'    => 'mode_term_ic_closure',
		   'AUTOLOAD'           => 'mode_exception'
		  );
}


## Basic nothing
sub mode_status {

  my $self = shift;

  my $json_resp = AmiGO::JSON->new('status');
  $self->header_add( -type => 'application/json' );
  $json_resp->set_arguments($self->raw_params());
  $json_resp->set_results({'ok' => 'true'});
  return $json_resp->make_js();
}


## ...
sub mode_term_ic {

  my $self = shift;

  ## Grab incoming.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('term_info');
  my $input_term_list =
    $self->{CORE}->clean_term_list($params->{terms}) ||
      $self->{CORE}->clean_term_list($params->{term});
  ## NOTE: Full not used.
  my $use_full_p = 0;
  $use_full_p = 1 if $params->{full} eq 'true';

  ## Prepare the the results package (we might need to add errors and
  ## stuff as we go).
  my $json_resp = AmiGO::JSON->new('term_ic');
  $json_resp->set_arguments($self->raw_params());

  ## Get the IC for each term that we have.
  ## Calculate the IC for the incoming terms; undef if nothing ot no
  ## term.
  my $resp = {};
  my $tried = {};
  my $icky = AmiGO::Worker::GOlr::IC->new();
  foreach my $tid (@$input_term_list){
    if( ! defined $tried->{$tid} ){ # done it before?
      $tried->{$tid} = 1; # mark

      ## Actual calculation.
      my $val_try = $icky->get_ic($tid);
      if( defined $val_try ){
	$resp->{$tid} = $val_try;
      }
    }
  }

  ## Finish and send results.
  $self->header_add( -type => 'application/json' );
  $json_resp->set_results($resp);
  return $json_resp->make_js();
}


## BUG/TODO: we use the default isa_partof_closure.
sub mode_term_closure {

  my $self = shift;

  ## Grab incoming.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('term_info');
  my $input_term_list =
    $self->{CORE}->clean_term_list($params->{terms}) ||
      $self->{CORE}->clean_term_list($params->{term});
  ## NOTE: Full not used.
  my $use_full_p = 0;
  $use_full_p = 1 if $params->{full} eq 'true';

  ## Prepare the the results package (we might need to add errors and
  ## stuff as we go).
  my $json_resp = AmiGO::JSON->new('term_closure');
  $json_resp->set_arguments($self->raw_params());

  ## Get the closure for each term that we have.
  my $closer = AmiGO::Worker::GOlr::Closure->new();
  my $resp = $closer->get_closure($input_term_list);

  ## Finish and send results.
  $self->header_add( -type => 'application/json' );
  $json_resp->set_results($closer->get_closure($input_term_list));
  return $json_resp->make_js();
}


## Based from term_ic
sub mode_term_ic_closure {

  my $self = shift;

  ## Grab incoming.
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('term_info');
  my $input_term_list =
    $self->{CORE}->clean_term_list($params->{terms}) ||
      $self->{CORE}->clean_term_list($params->{term});
  ## NOTE: Full not used.
  my $use_full_p = 0;
  $use_full_p = 1 if $params->{full} eq 'true';

  ## Prepare the the results package (we might need to add errors and
  ## stuff as we go).
  my $json_resp = AmiGO::JSON->new('term_ic_closure');
  $json_resp->set_arguments($self->raw_params());

  ## Closure for the input list.
  my $closer = AmiGO::Worker::GOlr::Closure->new();
  my $closed_input_term_list = $closer->get_closure($input_term_list);

  ## Get the IC for each term that we have.  Calculate the IC for the
  ## incoming term closuress; undef if nothing ot no term.
  my $resp = {};
  my $input_tried = {};
  my $icky = AmiGO::Worker::GOlr::IC->new();
  foreach my $tid (@$closed_input_term_list){
    if( ! defined $input_tried->{$tid} ){ # done input id before?
      $input_tried->{$tid} = 1; # mark

      ## Actual calculation.
      my $val_try = $icky->get_ic($tid);
      if( defined $val_try ){
	$resp->{$tid} = $val_try;
      }
    }
  }

  ## Finish and send results.
  $self->header_add( -type => 'application/json' );
  $json_resp->set_results($resp);
  return $json_resp->make_js();
}



1;
