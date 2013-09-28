=head1 AmiGO::Worker::GOlr::ComplexAnnotationUnit

Generates consumable static information about complex
annotation units, backed by a GOlr document store.

This is not a search tool, but an efficient data retrieval tool.

This worker follows the format of the Solr document rather closer
since it is not bound by old templates.

=cut

package AmiGO::Worker::GOlr::ComplexAnnotationUnit;
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
    my $found_doc = $self->{AEJS_GOLR_DOC}->get_by_id($arg);

    my $intermediate = undef;

    if( $found_doc ){

      $intermediate =
	{
	 ## Unit.
	 annotation_unit_id => $found_doc->{annotation_unit},
	 annotation_unit_label => $found_doc->{annotation_unit_label},

	 ## Group.
	 annotation_group_id => $found_doc->{annotation_group},
	 annotation_group_label => $found_doc->{annotation_group_label},

	 ## Enabled by/bioentity.
	 enabled_by_id => $found_doc->{enabled_by},
	 enabled_by_label => $found_doc->{enabled_by_label},

	 ## Process.
	 process_class_id => $found_doc->{process_class},
	 process_class_label => $found_doc->{process_class_label},

	 ## Function.
	 function_class_id => $found_doc->{function_class},
	 function_class_label => $found_doc->{function_class_label},

	 ## Location.
	 location_id_list => $found_doc->{location_list},
	 location_label_list => $found_doc->{location_list_label},

	 ## Graph.
	 topology_graph_json => $found_doc->{topology_graph_json},
	};
    }
    $self->{AWGG_INFO}{$arg} = $intermediate;
  }

  bless $self, $class;
  return $self;
}


=item get_info

Args: n/a
Returns: hash ref containing complex annotation information, keyed by acc

=cut
sub get_info {

  my $self = shift;
  return $self->{AWGG_INFO};
}



1;
