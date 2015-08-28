=head1 AmiGO::Worker::GOlr::ModelAnnotation

Generates consumable static information about model
annotations, backed by a GOlr document store.

This is not a search tool, but an efficient data retrieval tool.

This worker follows the format of the Solr document rather closer
since it is not bound by old templates.

=cut

package AmiGO::Worker::GOlr::ModelAnnotation;
use base ("AmiGO::Worker::GOlr");


=item new

Args: acc string # or arrayref of gp acc strings.
Returns: hash containing various gp infomation, keyed by acc

=cut
sub new {

  my $class = shift;
  my $args = shift || die "need an argument";
  my $self = $class->SUPER::new();

  ## Only array refs internally.
  if( ref $args ne 'ARRAY' ){ $args = [$args]; }

  ## ...
  $self->{AWGG_INFO} = {};
  foreach my $arg (@$args){
    #my $found_doc = $self->{AEJS_GOLR_DOC}->get_by_id($arg);
    ## Works 'cause only found in model_annotation right now.
    ## Further changes would mean that we need to narrow this to the 
    ## document category "model_annotation".
    my $found_doc =
      $self->{AEJS_GOLR_DOC}->get_by_proxy('model', $arg);

    my $intermediate = undef;

    if( $found_doc ){

      ## We need to translate some of the document information.
      ## TODO/BUG: This is temporary as we work out what we'll actually have.
      my $mid = $found_doc->{model} || '???';
      my @s = split(':', $mid);
      my $fid = $s[scalar(@s) -1];

      ## TODO/BUG: Again, temporary badness for Noctua.
      my $noctua_base = 'http://noctua-dev.berkeleybop.org:8909/editor/graph/';
      my $github_base = 'https://github.com/geneontology/noctua-models/blob/master/models/';

      ## We'll have the document assembly here.
      $intermediate =
	{
	 ## Pull model information from this one random individual.
	 model_id => $found_doc->{model},
	 model_label => $found_doc->{model_label},
	 model_date => $found_doc->{model_date},
	 #model_date => $found_doc->{contributor},

	 ## 
	 repo_file_url => $github_base . $fid,
	 edit_file_url => $noctua_base . $mid
	};
    }
    $self->{AWGG_INFO}{$arg} = $intermediate;
  }

  bless $self, $class;
  return $self;
}


=item get_info

Args: n/a
Returns: hash ref containing model annotation information, keyed by acc

=cut
sub get_info {

  my $self = shift;
  return $self->{AWGG_INFO};
}



1;
