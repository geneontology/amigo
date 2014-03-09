=head1 AmiGO::External::XMLFast::RemoteTermEnrichment

Defines a specific interface to contact the remote term enrichment
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

package AmiGO::External::XMLFast::RemoteTermEnrichment;

use base ("AmiGO::External::XMLFast");
use Date::Format;


# =item $URL_FOR_REMOTE

# This is the URL that points to the remote data source.

# =cut
# my $URL_FOR_REMOTE = 'http://173.255.211.222:8050/webservices/go/overrep.jsp';

=item new

...

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

my $te = AmiGO::External::XML::RemoteTermEnrichment->new();
my $xmlout = $te->remote_call(...);

## Print out XML to STDERR.
print STDERR $xmlout . "\n";

=cut
sub remote_call {

  my $self = shift;
  my $url = shift || die 'need a URL to make a remote call';

  ## If we got the URL together properly, go get it.
  my $ret = undef;
  $self->{MECH}->timeout(300);
  $ret = $self->post_external_data($url, $self->{ARGS});

  return $ret;
}

=item get_reference_mapped

...

=cut
sub get_reference_mapped {
  my $self = shift;
  return $self->try('/results/reference/mapped', undef);
}


=item get_reference_unmapped

...

=cut
sub get_reference_unmapped {
  my $self = shift;
  return $self->try('/results/reference/unmapped', undef);
}


=item get_input_list_mapped

...

=cut
sub get_input_list_mapped {
  my $self = shift;
  return $self->try('/results/input_list/mapped', undef);
}


=item get_input_list_unmapped

...

=cut
sub get_input_list_unmapped {
  my $self = shift;
  return $self->try('/results/input_list/unmapped', undef);
}


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
sub get_results {
  my $self = shift;

  my $ret = [];
  my $results = $self->{EXT_DATA}->findnodes('/results/result') || [];
  foreach my $rnode (@$results){

      my $id = $rnode->findvalue('./term/id') || '';
      my $link = $self->get_interlink({mode=>'term_details', arg=>{acc=>$id}});
      my $label = $rnode->findvalue('./term/label') || '';
      my $number_in_population =
	$rnode->findvalue('./number_in_reference') || '';
      my $number_in_sample = $rnode->findvalue('./number_in_list') || '';
      my $expected = $rnode->findvalue('./expected') || '';
      my $plus_or_minus = $rnode->findvalue('./plus_minus') || '';
      my $p_value = $rnode->findvalue('./pValue') || '';

      my $rhash =
	{
	 id => $id,
	 link => $link,
	 label => $label,
	 number_in_population => $number_in_population,
	 number_in_sample => $number_in_sample,
	 expected => $expected,
	 plus_or_minus => $plus_or_minus,
	 p_value => $p_value
	};
      push @$ret, $rhash;
    }
  
  return $ret;
}



1;
