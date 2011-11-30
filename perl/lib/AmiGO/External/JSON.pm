=head1 AmiGO::External::JSON

TODO: Specialize onto HTML resources. Add ??? for EXT_DATA and such.

=cut

package AmiGO::External::JSON;

use base ("AmiGO::External");
use AmiGO::JavaScript;

=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  #my $arg = shift || {};

  ##
  $self->{EXT_DATA} = undef;

  bless $self, $class;
  return $self;
}


=item get_external_data

Sets up internal data structures.
Returns the JSON string if you really want to play with it.

=cut
sub get_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->get($url);
  };
  if( $@ ){
    $self->kvetch("error in GETing the document from: '$url': $@");
    $self->set_error_message("error in GETing the document from: '$url': $@");
    ## Grab the content if possible.
    #$self->kvetch("c: " . $mech->response->content());
    $doc = $mech->response->content();
    $self->{EXT_DATA} = $doc if $doc;
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
      $self->set_error_message("failed to contact data source at: $url");
    }else{
      ## Grab the content.
      $doc = $mech->content();
      #$self->kvetch("got some content: " . $doc);
      #$self->kvetch("got some content");
      $self->{EXT_DATA} = $doc;
    }
  }

  return $doc;
}


=item try

Try and convert the implicit returned string into a JSON blob. Failure
will result in an empty hash.

TODO: This is probably an overload of the original concept or "try"
and should be moved elsewhere.

=cut
sub try {

  my $self = shift;

  #$self->kvetch("convert attempt");
  my $json_string = $self->{EXT_DATA};
  my $js = AmiGO::JavaScript->new();
  my $json_blob = $js->parse_json_data($json_string);

  return $json_blob;
}


=item raw

Return the raw response.

=cut
sub raw {
  my $self = shift;
  return $self->{EXT_DATA};
}



1;
