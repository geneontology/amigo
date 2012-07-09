=head1 AmiGO::WebApp::Gaffer

...

=cut

package AmiGO::WebApp::Gaffer;
use base 'AmiGO::WebApp';

## Basics.
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::TT;
use AmiGO::WebApp::Input;

## Things for data transformation.
use AmiGO::Worker::Gaffer;
#use AmiGO::External::JSON::Solr;

## Misc.
use Data::Dumper;


##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 1;

  ## Templates.
  $self->tt_include_path($self->{CORE}->amigo_env('AMIGO_ROOT') .
			 '/templates/html');

  $self->mode_param('mode');
  $self->start_mode('nil');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'nil'             => 'mode_nil',
		   'solr_proxy'      => 'mode_solr_proxy',
		   'solr_to_id_list' => 'mode_solr_to_id_list',
		   'solr_to_gaf'     => 'mode_solr_to_gaf',
		   'AUTOLOAD'        => 'mode_exception'
		  );
}


## Nothing to see here.
sub mode_nil {
  my $self = shift;
  $self->header_add( -type => 'plain/text' );
  return 'nil';
}

## TODO: possible future home of GOlr proxy--gotta keep those kids
## out.
sub mode_solr_proxy {
  my $self = shift;
  $self->header_add( -type => 'plain/text' );
  return 'solr proxy';
}


## ...
sub mode_solr_to_id_list {

  my $self = shift;

  ## Input handling.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('gaffer');
  my $data_url = $params->{data_url};

  $self->{CORE}->kvetch('data_url: ' . $data_url);

  my $output = '';
  if( $data_url ){
    my $gaffer = AmiGO::Worker::Gaffer->new($data_url);
    $output = $gaffer->solr_to_id_list();
  }

  $self->header_add( -type => 'plain/text' );
  return $output;
}


## ...
sub mode_solr_to_gaf {

  my $self = shift;

  ## Input handling.
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('gaffer');
  my $data_url = $params->{data_url};

  $self->{CORE}->kvetch('data_url: ' . $data_url);

  my $output = '';
  if( $data_url ){
    my $gaffer = AmiGO::Worker::Gaffer->new($data_url);
    $output = $gaffer->solr_to_gaf();
  }

  $self->header_add( -type => 'plain/text' );
  return $output;
}



1;
