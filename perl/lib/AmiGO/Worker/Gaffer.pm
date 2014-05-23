=head1 AmiGO::Worker::Gaffer

A Swiss Army knife class for GOlr to GAF (and whatever else)
translations. The idea is to make

=cut

package AmiGO::Worker::Gaffer;
use base ("AmiGO::Worker");

use AmiGO::External::JSON::Solr;


=item new

Constructor.
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

  #$self->kvetch('$server_url: ' . $server_url);
  #$self->kvetch('$query: ' . $query);

  ## Get the agent, and give it a large timeout as some of these might
  ## take a while...
  $self->{AWG_SOLR} = AmiGO::External::JSON::Solr->new($server_url);
  $self->{AWG_SOLR}{MECH}->timeout(60); # give it a minute

  ## Clobber certain fiddly fields with the incoming parameters.
  $self->{AWG_SOLR}->update($query, ['q', 'fl', 'wt', 'facet', 'indent',
				     'qt', 'version', 'start', 'rows']);

  ## Run the query and get the docs.
  $self->{AWG_SOLR}->query();
  $self->{AWG_SOLR_DOCS} = $self->{AWG_SOLR}->docs();

  bless $self, $class;
  return $self;
}


=item solr_to_id_list

Return only the ids of any documents we find. Handy for things like
term or GP mining.

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


=item _unwind

Unpack a JSON glob into GAF entry.

=cut
sub _unwind {

  my $self = shift;
  my $thing = shift;
  my $default = shift || '';
  my $separator = shift || '|';

  my $retval = '';

  if( defined $thing ){

    if( ref($thing) eq 'ARRAY' ){

      my $buf = [];
      foreach my $item (@$thing){
	push @$buf, $item;
      }
      $retval = join $separator, @$buf;

    }else{
      $retval = $thing;
    }

  }else{
    $retval = $default;
  }

  return $retval;
}


=item solr_to_gaf

Return the GAF for any associations found. All other document types
will be ignored.

=cut
sub solr_to_gaf {

  ##
  my $self = shift;

  ## Simply walk through the docs looking for 'id's, and then collapse
  ## the accumulator.
  my $output = '';
  my $super_buffer = [];
  foreach my $doc (@{$self->{AWG_SOLR_DOCS}}){
    if( defined $doc->{document_category} &&
	$doc->{document_category} eq 'annotation' ){

      my $buffer = [];

      ## TODO: 1: DB.
      push @$buffer, $self->_unwind($doc->{TODO}, '???');
      ## TODO: 2: DB Object ID.
      push @$buffer, $self->_unwind($doc->{TODO}, '???');
      ## TODO???: 3: DB Object label.
      push @$buffer, $self->_unwind($doc->{bioentity_label}, '???');
      ## 4: Qualifier.
      push @$buffer, $self->_unwind($doc->{qualifier}, '');
      ## 5: GO ID.
      push @$buffer, $self->_unwind($doc->{annotation_class}, '???');
      ## TODO: 6: DB:Reference(|s).
      push @$buffer, $self->_unwind($doc->{evidence_with}, '???', '|');
      ## 7: Evidence code.
      push @$buffer, $self->_unwind($doc->{evidence_type}, '???');
      ## TODO: 8: With/from.
      push @$buffer, $self->_unwind($doc->{TODO}, '');
      ## 9: Aspect.
      push @$buffer, $self->_unwind($doc->{aspect}, '???');
      # TODO: 10: DB object name.
      push @$buffer, $self->_unwind($doc->{TODO}, '');
      # TODO: 11: DB object synonym(|s).
      push @$buffer, $self->_unwind($doc->{TODO}, '', '|');
      # 12: DB object type.
      push @$buffer, $self->_unwind($doc->{type}, '???');
      # 13: Taxon(|s).
      push @$buffer, $self->_unwind($doc->{taxon}, '???', '|');
      # 14: Date.
      push @$buffer, $self->_unwind($doc->{date}, '???');
      # 15: Assigned-by.
      push @$buffer, $self->_unwind($doc->{source}, '???');
      # TODO: 16: Annotation extension(|s).
      push @$buffer, $self->_unwind($doc->{annotation_extension_class},'','|');
      # TODO???: 17: Gene product form ID(|s).
      #push @$buffer, $self->_unwind($doc->{bioentity_id}, '');
      push @$buffer, '';

      push @$super_buffer, join "\t", @$buffer;
    }
  }
  ## Zip up accumulator.
  if( scalar(@$super_buffer) ){
    $output = join "\n", @$super_buffer;
  }

  return $output;
}



1;
