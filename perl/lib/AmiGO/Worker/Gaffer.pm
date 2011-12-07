=head1 AmiGO::Worker::Gaffer

A Swiss Army knife class for GOlr to GAF (and whatever else) translations. The idea is to make

=cut

package AmiGO::Worker::Gaffer;
use base ("AmiGO::Worker");

use AmiGO::External::JSON::Solr;


=item new

Arguments: takes the string location of the finished solr query

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  my $play_url = shift || die 'need a url argument to function';

  ## Transform the incoming url into a standard external solr query,
  ## then operate on it in the methods.
  my($server_url, $query) = split "select\\?", $play_url;
  if( ! defined $server_url || ! defined $query ){
    die 'unable to parse incoming target solr url';
  }

  $self->kvetch('$server_url: ' . $server_url);
  $self->kvetch('$query: ' . $query);

  ## Run the query.
  $self->{AWG_SOLR} = AmiGO::External::JSON::Solr->new($server_url);
  ## Clobber certain fiddly fields with the incoming parameters.
  $self->{AWG_SOLR}->update($query, ['q', 'qt', 'fl', 'wt', 'facet', 'indent',
				     'version', 'start', 'rows']);
  $self->{AWG_SOLR}->query();
  $self->{AWG_SOLR_DOCS} = $self->{AWG_SOLR}->docs();

  bless $self, $class;
  return $self;
}


=item solr_to_id_list

Constructor.

=cut
sub solr_to_id_list {

  ##
  my $self = shift;

  ## Simply walk through the docs looking for 'id's, and then collapse
  ## the accumulator.
  my $output = '';
  my $buffer = [];
  foreach my $doc (@{$self->{AWG_SOLR_DOCS}}){
    if( defined $doc->{id} ){
      push @$buffer, $doc->{id};
    }
  }
  ## Zip up accumulator.
  if( scalar(@$buffer) ){
    $output = join "\n", @$buffer;
  }

  return $output;
}



1;
