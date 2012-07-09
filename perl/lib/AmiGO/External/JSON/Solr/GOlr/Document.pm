=head1 AmiGO::External::JSON::GOlr::Document

Solr/JSON interface for retrieving objects with useful ids from the
GOlr. Transforms the returned JSON into a similar perl object or
returns nothing.

=cut

package AmiGO::External::JSON::Solr::GOlr::Document;
use base ("AmiGO::External::JSON::Solr::GOlr");
use Data::Dumper;


=item new

#

=cut
sub new {

  ## Pass the buck back for getting a sensible default.
  my $class = shift;
  my $target = shift || undef;
  my $self  = $class->SUPER::new($target);

  bless $self, $class;
  return $self;
}


=item get_by_id

Args: document id (string)
Return: perl hash structure (see TODO) or undef

=cut
sub get_by_id {

  my $self = shift;
  my $in_id = shift || die "need to have an id argument";
  my $retval = undef;

  ## Merge in id with template. Make sure the quotes are encoded/safe.
  $self->{AEJS_BASE_HASH}{q} = 'id:%22' . $in_id . '%22';

  ## Use the superclass to finish.
  if( $self->query() ){
    $retval = $self->first_doc();
    # }else{
    #   ## TODO: add errors? die?
    #   $self->
  }

  #$self->kvetch('$retval: ' . Dumper($retval));

  return $retval;
}



1;
