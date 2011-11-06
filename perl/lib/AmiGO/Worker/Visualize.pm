=head1 AmiGO::Worker::Visualize

TODO: Return a blob that visualizes the ontology.

TODO: Rationalize visual (so it's just an intelligent web wrapper) and
add in QuickGO resource.

variables:
simple_terms,
complex_terms,
format,
source

=cut

package AmiGO::Worker::Visualize;

## Use a slightly different base...
use base ("AmiGO::Worker");

use AmiGO::GraphViz;
use AmiGO::JavaScript;
use AmiGO::JSON;
use AmiGO::KVStore::Filesystem::QuickGO;
use AmiGO::KVStore::QuickGO;
use AmiGO::External::QuickGO::OntGraphics;


=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  my $term_list = shift || [];
  $self->{AV_TERMS} = undef;

  # $self->kvetch("FOO: " . $term_list);

  ## Fix just a string coming in.
  if( ref $term_list ne 'ARRAY' ){
    $term_list = [$term_list];
  }

  ## Double check.
  if( ! defined($term_list) ||
      scalar(@$term_list) == 0 ){
    die "terms must be defined in the term list: $!";
  }else{
    ## Sort # and create a serialization.
    $self->{AV_TERMS} = [sort @$term_list];
  }

  # ## Build graph with term list.
  # ## Go through build graph routine only if there is something coming
  # ## in.
  # if( defined($term_list) &&
  #     scalar(@$term_list) != 0 ){

  #   my $graph = GOBO::DBIC::GODBModel::Graph->new();

  #   ## Convert string terms to DBIC terms.
  #   my $terms = [];
  #   foreach my $acc (@$term_list){
  #     my $term = $graph->get_term($acc);
  #     if( defined $term ){
  # 	push @$terms, $term;
  #     }
  #   }
  # }

  bless $self, $class;
  return $self;
}


## NOTE: Just does one acc at a time.
## Connect to store, if fail, build url, get, and stuff in store.
## Return image blob or undef.
sub quickgo {

  my $self = shift;

  my $acc = $self->{AV_TERMS}[0];

  ## Toggle between SQLite3 and filesystem paths.
  my $qg = undef;
  if( 1 ){
    $qg = AmiGO::KVStore::Filesystem::QuickGO->new();
  }else{
    $qg = AmiGO::KVStore::QuickGO->new();
  }
  $self->kvetch("will use backend: $qg");

  ## Try images from QuickGO.
  my $qg_data = $qg->get($acc);
  if( defined $qg_data ){
    $self->kvetch("in cache: $acc");
  }else{
    $self->kvetch("not in cache: $acc");

    ## Looks like it wasn't in the cache; go get it off of the
    ## internet.
    my $external_qg = AmiGO::External::QuickGO::OntGraphics->new();
    $qg_data = $external_qg->get_graph_image($acc);

    ## If it looks like we can't get it here either, undef our return
    ## value and slink out. Otherwise, add to cache.
    if( ! defined $qg_data ){
      $self->kvetch("problem getting img data");
      return undef;
    }else{
      $qg->put($acc, $qg_data);
    }
  }

  return $qg_data;
}



1;
