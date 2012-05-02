=head1 AmiGO::External::JSON::Solr::GOlr::Search

...

=cut

package AmiGO::External::JSON::Solr::GOlr::Search;
use base ("AmiGO::External::JSON::Solr::GOlr");


=item new

#

=cut
sub new {

  ## Pass the buck back for getting a sensible default.
  my $class = shift;
  my $target = shift || undef;
  my $self = $class->SUPER::new($target);

  bless $self, $class;
  return $self;
}


=item smart_query

Arguments: simple query string
Return: true or false on minimal success

edismax built through our config hash

mostly runs off of Solr::query

=cut
sub smart_query {

  my $self = shift;
  my $qstr = shift || undef;


  ## TODO: Manipulate the config to get the hash.
  $self->kvetch("query with: " . $qstr);

  ## TODO: Fold the hash into what we have.

  ## Call the main engine.
  my $retval = $self->query();

  return $retval;
}



1;
