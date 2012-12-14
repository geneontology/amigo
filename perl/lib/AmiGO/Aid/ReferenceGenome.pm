=head1 AmiGO::Aid::ReferenceGenome

A collection of color operations for often used species and the like.

=cut

package AmiGO::Aid::ReferenceGenome;

use base 'AmiGO::Aid';
use utf8;
use strict;


##
our @RG_CODE_ORDER =
  qw(
      9606
      10090
      10116
      9031
      7955
      7227
      6239
      44689
      3702
      4932
      4896
      83333
   );

my %RG_STATUS_COLORS =
  (
   exp => '#80FF80',
   good => '#8080FF',
   #odd => '#FFFF80',
   odd => '#D3D3D3',
   bad => '#FF8080',
   );


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  bless $self, $class;
  return $self;
}


=item species_information

given an array ref of taxids, return a hash ref of useful term
information.

=cut
sub species_information {

  my $self = shift;
  my $species = shift || [];

  ## 
  my %sp_hash = ();
  foreach my $spec (@$species){
    $sp_hash{$spec} =
      {
       species_name => $self->taxid2readable({spec_id=>$spec, web_safe=>1}),
       species_color => $self->taxid2color($spec),
       species_color_lite => $self->taxid2color($spec, 1),
      };
  }

  return \%sp_hash;
}


=item get_status_colors



=cut
sub get_status_colors {

  my $class = shift;
  return \%RG_STATUS_COLORS;
}


=item species_list

take bool for taxa_id or readable return; defaults to readable
Returns an ordered array ref of RG species as readable.

=cut
sub species_list {

  my $self = shift;
  my $arg = shift || {};
  $arg->{num_p} = 0 if ! defined $arg->{num_p};
  $arg->{safely} = 0 if ! defined $arg->{safely};
  my $num_p = $arg->{num_p};
  my $safely = $arg->{safely};

  my @life_order = ();
  if( $num_p ){
    foreach my $i (@RG_CODE_ORDER){
      push @life_order, $i;
      $self->kvetch("spec: " . $i);
    }
  }else{
    foreach my $i (@RG_CODE_ORDER){
      $self->kvetch("spec ($i, $safely):" .
		    $self->taxid2readable({spec_id=>$i,web_safe=>$safely}));
      push @life_order, $self->taxid2readable({spec_id=>$i,web_safe=>$safely});
    }
  }

  return \@life_order;
}


=item taxid2readable

Argument: the speciecs id of a ref genome species. optional boolean
for "web safe" string to be returned

Return a *friendly* species string.

=cut
sub taxid2readable {

  my $self = shift;
  my $arg = shift || {};
  $arg->{spec_id} = 0 if ! defined $arg->{spec_id};
  $arg->{web_safe} = 0 if ! defined $arg->{web_safe};
  my $spec_id = $arg->{spec_id};
  my $web_safe = $arg->{web_safe};

  my $ret_string =  'unknown_species';
  my $species_hash = $self->species();
  if( defined $species_hash && defined $species_hash->{$spec_id} ){
    $ret_string = $species_hash->{$spec_id};
    ## HACK/NOTE/WARNING: E. coli string long and ugly in RG displays.
    $ret_string = 'E. coli' if $spec_id == 83333;
  }else{
    ## BUG: Occasionally, chicken misses the threshold, need to move
    ## to fuller caching system.
    if( $spec_id == 9031 ){
      $ret_string = 'G. gallus';
    }
  }

  ## Nice not to have the line break there...
  if( $web_safe == 1 ){
    $ret_string = $self->html_break_safe($ret_string);
  }
  return $ret_string;
}


=item taxid2color

Argument: the speciecs id of a ref genome species.
Return a hex color string.

TODO: real color module

=cut
sub taxid2color {

  my $self = shift;
  my $spec_str = shift || '';
  my $light_p = shift || 0;

  ##
  my %color_mapping = ();
  if( ! $light_p ){
    ## H: (x+1) * 30, S: 80, V: 100
    %color_mapping = (
		      '9606'=>"#FF6347", # human
		      '10090'=>"#C0D9D9", # mouse
		      '10116'=>"#FFD700", # rat
		      '6239'=>"#DAA520", # worm
		      '7227'=>"#00CED1", # fly
		      '44689'=>"#FF8C00", # dicty
		      '9031'=>"#DB70DB", # chicken
		      '7955'=>"#6495ED", # zfish
		      '3702'=>"#9ACD32", # dicot
		      '4932'=>"#00FFFF", # yeast
		      '4896'=>"#8A2BE2", # pombi
		      '83333'=>"#98FB98" # ecoli
		     );
    #'83333'=>"#98FB98" # ecoli
    ## Old color partition.
    # 		      '9606'  => '#FF9933',
    # 		      '10090' => '#FFFF33',
    # 		      '10116' => '#99FF33',
    # 		      '6239'  => '#33FF33',
    # 		      '7227'  => '#33FF99',
    # 		      '44689' => '#33FFFF',
    # 		      '9031'  => '#3399FF',
    # 		      '7955'  => '#3333FF',
    # 		      '3702'  => '#9933FF',
    # 		      '4932'  => '#00FFFF',
    # 		      '4896'  => '#FF33FF',
    # 		      '562'   => '#FF3399'
    # 		     );
  }else{
    ## H: (x+1) * 30, S: 40, V: 100
    ## WARNING: this whole section should be deprecated...
    %color_mapping = (
		      '9606'  => '#FFCC99',
		      '10090' => '#FFFF99',
		      '10116' => '#CCFF99',
		      '6239'  => '#99FF99',
		      '7227'  => '#99FFCC',
		      '44689' => '#99FFFF',
		      '9031'  => '#99CCFF',
		      '7955'  => '#9999FF',
		      '3702'  => '#CC99FF',
		      '4932'  => '#00FFFF',
		      '4896'  => '#FF99FF',
		      '83333'   => '#FF99CC'
		     );
  }

  #print STDERR "_col_" . $spec_str . "\n";
  #print STDERR "_col_" . $color_mapping{$spec_str};
  #sleep 1;

  return $color_mapping{$spec_str} || '#000000';
}


1;
