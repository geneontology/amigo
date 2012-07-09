=head1 AmiGO::Worker::GOlr::Closure

Experimental.  Get the closure list (default over isa_partof_closure)
for a list of term accs.

=cut

package AmiGO::Worker::GOlr::Closure;
use base ("AmiGO::Worker::GOlr");

#use AmiGO::External::JSON::Solr::GOlr;
#use AmiGO::Worker::GOlr::Term;


=item new

Constructor.
Arguments: n/a

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  $self->{AWGC_GOLR_CFNAME} = 'isa_partof_closure';

  bless $self, $class;
  return $self;
}


=item set_closure_field

Set the closure field name.

Args: string
Returns: n/a

=cut
sub set_closure_field {
  my $self = shift;
  my $cfname = shift || die 'need a closure field to function';
  $self->{AWGC_GOLR_CFNAME} = $cfname;
}


=item get_closure

Get the closure set list for the input accs.

Args: term acc or term acc list ref
Returns: term acc list ref

=cut
sub get_closure {

  my $self = shift;
  my $term_ids = shift || die 'need a term id or ids to function';

  ## Only array refs internally.
  if( ref $term_ids ne 'ARRAY' ){ $term_ids = [$term_ids]; }

  ## The actual worker; very similar to AmiGO::Worker::GOlr::Term::new.
  my $closure = {};
  foreach my $arg (@$term_ids){
    my $found_doc = $self->{AEJS_GOLR_DOC}->get_by_id($arg);
    if( $found_doc && $found_doc->{$self->{AWGC_GOLR_CFNAME}} ){

      ## Add everything we found to the closure.
      my $c_set = $found_doc->{$self->{AWGC_GOLR_CFNAME}};
      foreach my $ci (@$c_set){
	$closure->{$ci} = 1;
      }

      ## And add self.
      $closure->{$arg} = 1;
    }
  }

  my @set = keys %$closure;
  return \@set;
}



1;
