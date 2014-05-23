=head1 AmiGO::Worker::GOlr::IC

Experimental.
Calculate the information content of a term using the GOlr backend.

=cut

package AmiGO::Worker::GOlr::IC;
use base ("AmiGO::Worker");

use AmiGO::External::JSON::Solr::GOlr;
use AmiGO::Worker::GOlr::Closure;


=item new

Constructor.
Arguments: n/a

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  $self->{AWGI_GOLR} = AmiGO::External::JSON::Solr::GOlr->new();

  ## First, our world of discourse: annotations.
  $self->{AWGI_GOLR}->set_variable('q', '*:*');
  $self->{AWGI_GOLR}->set_variable('rows', 0);
  #$self->{AWGI_GOLR}->set_variable('rows', 1);

  bless $self, $class;
  return $self;
}

=item get_ic

Get the general (over all annotations) information content of an
ontology term.

Args: term acc
Returns: IC float or undef

=cut
sub get_ic {

  my $self = shift;
  my $term_id = shift || die 'need a term id to function';

  ## Essentially reset if we're doing multiple calls.
  $self->{AWGI_GOLR}->set_variable('fq', 'document_category:annotation');

  ## Then total number of annotations.
  $self->{AWGI_GOLR}->query();
  my $big_N = $self->{AWGI_GOLR}->total();

  ## Then the number of indirect to this term (in closure).
  $self->{AWGI_GOLR}->add_variable('fq', 'isa_partof_closure:"'. $term_id .'"');
  $self->{AWGI_GOLR}->query();
  my $little_n = $self->{AWGI_GOLR}->total();

  my $retval = undef;
  if( $little_n != 0 && $big_N != 0 ){
    $retval = -1.0 * (log($little_n / $big_N) / log(10));
    # $self->kvetch('n: ' . $little_n);
    # $self->kvetch('N: ' . $big_N);
    # $self->kvetch('n/N: ' . ($little_n / $big_N));
    # $self->kvetch('log(n/N): ' . log($little_n / $big_N));
    # $self->kvetch('log(n/N)/log(10): ' . (log($little_n / $big_N) / log(10)));
  }
  return $retval;
}


# =item set_closure_field

# Set the closure field name.

# Args: string
# Returns: n/a

# =cut
# sub set_closure_field {
#   my $self = shift;
#   my $cfname = shift || die 'need a closure field to function';
#   $self->{AWGI_GOLR_CFNAME} = $cfname;
# }


# =item get_ic_closure

# Get the closure set list for the input accs.

# Args: term acc or term acc list ref
# Returns: hashref of accs to IC content

# =cut
# sub get_ic_closure {

#   my $self = shift;
#   my $term_ids = shift || die 'need a term id or ids to function';

#   ## Only array refs internally.
#   if( ref $term_ids ne 'ARRAY' ){ $term_ids = [$term_ids]; }

#   ## The actual worker; very similar to AmiGO::Worker::GOlr::Term::new.
#   my $closure = {};
#   foreach my $arg (@$term_ids){
#     my $found_doc = $self->{AEJS_GOLR_DOC}->get_by_id($arg);
#     if( $found_doc && $found_doc->{$self->{AWGI_GOLR_CFNAME}} ){

#       my $c_set = $found_doc->{$self->{AWGI_GOLR_CFNAME}};
#       foreach my $ci (@$c_set){
# 	$closure->{$ci} = 1;
#       }
#     }
#   }

#   my @set = keys %$closure;
#   return \@set;
# }



1;
