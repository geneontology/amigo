=head1 AmiGO::External::XML::PANTHERTermEnrichment

Defines a specific interface to contact the PANTHER term enrichment
resource.

Input format:

ontology=(biological_process|molecular_function|cellular_component)&
input=WHITESPACE-SEPARATED-LIST-OF-IDS&
species=TAXON_ID&
correction=Bonferroni|None [DEFAULT=Bonferroni]
format=(html|xml)

Payload:

<results>
<input>
<mapped>ID1</mapped>
<mapped>ID2</mapped>
...
<unmapped>ID1</unmapped>
<unmapped>ID2</unmapped>
...
</input>
<result>
<term>
<id>GO:nnn</id>
<label>fatty acid metabolic process</label>
</term>
<number_in_population>188</number_in_population>
<number_in_sample>45</number_in_sample>
<expected>3.98</expected>
<plus_or_minus>+</plus_or_minus>
<p_value>6.88</p_value>
</result>
...
</results>

=cut

use utf8;
use strict;

package AmiGO::External::XML::PANTHERTermEnrichment;

use base ("AmiGO::External::XML");
use Date::Format;


=item $URL_FOR_PANTHER

This is the URL that points to the PANTHER data source.

=cut
my $URL_FOR_PANTHER = 'http://gowiki.tamu.edu/rest/is_edited.php';


=item new

# Currently marks a year as the cutoff.

=cut
sub new {

  ##
  my $class = shift;
  #my $url = shift || die('required arg url');
  my $args = shift || {};
  my $self  = $class->SUPER::new();

  my $ontology = $args->{ontology} || die('required arg');
  my $input = $args->{input} || die('required arg');
  my $species = $args->{species} || die('required arg');
  my $correction = $args->{correction} || die('required arg');
  my $format = $args->{format} || die('required arg');

  #$self->{URL} = $url;
  $self->{ARGS} = $args;

  bless $self, $class;
  return $self;
}

=item remote_call

my $te = AmiGO::External::XML::PANTHER->new();
my $xmlout = $te->remote_call(...);

## Print out XML to STDERR.
print STDERR $xmlout . "\n";

=cut
sub remote_call {

  my $self = shift;

  ## If we got the URL together properly, go get it.
  my $ret = undef;
  $ret = $self->post_external_data($URL_FOR_PANTHER, $self->{ARGS});

  return $ret;
}

=item get_mapped

# Return list of mapped IDs.

# =cut
# sub get_mapped {
#   my $self = shift;
#   return $self->try('/results/input/mapped', []);
# }


# =item get_unmapped

# Return list of unmapped IDs.

# =cut
# sub get_unmapped {
#   my $self = shift;
#   return $self->try('/results/input/unmapped', []);
# }

=item get_results

mapped => []
unmapped => []
id
label
number_in_population
number_in_sample
expected
plus_or_minus
p_value

Return an aref of hashrefs, containing the above keys

=cut
sub get_terms {
  my $self = shift;

  my $ret = [];
  my $results = $self->try('/results/result', []);
  if( ! $results->isa('XML::XPath::NodeSet') ){
    ## TODO: bad res
  }else{
    foreach my $result ($results->get_nodelist()){

      my $id = $self->try('./term/id', '', $result);
      my $label = $self->try('./term/label', '', $result);
      my $number_in_population =
	$self->try('./number_in_population', '', $result);
      my $number_in_sample = $self->try('./number_in_sample', '', $result);
      my $expected = $self->try('./expected', '', $result);
      my $plus_or_minus = $self->try('./plus_or_minus', '', $result);
      my $p_value = $self->try('./p_value', '', $result);

      my $rhash =
	{
	 id => $id,
	 label => $label,
	 number_in_population => $number_in_population,
	 number_in_sample => $number_in_sample,
	 expected => $expected,
	 plus_or_minus => $plus_or_minus,
	 p_value => $p_value
	};
      push @$ret, $rhash;
    }
  }

  return $ret;
}



1;
