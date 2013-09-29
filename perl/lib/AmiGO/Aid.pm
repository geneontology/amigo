=head1 AmiGO::Aid



=cut

package AmiGO::Aid;

use base 'AmiGO';

my $READABLE =
  {
   'biological_process' => 'Biological Process',
   'cellular_component' => 'Cellular Component',
   'molecular_function' => 'Molecular Function',
   'is_a' => 'is a',
   'part_of' => 'part of',
   'positively_regulates' => 'positively regulates',
   'negatively_regulates' => 'negatively regulates',
   'regulates' => 'regulates',
   'develops_from' => 'develops from',
   ## Some more modern stuff:
   'BFO_0000050' => 'part of',
   'http://purl.obolibrary.org/obo/BFO_0000050' => 'part of',
   'directly_activates' => 'directly activates',
   'http://purl.obolibrary.org/obo/directly_activates' => 'directly activates',
  };

## TODO: These should maybe be switched with hex colors.
my %REL_COLOR_MAPPING =
  (
   'is_a' =>                 'blue',
   'part_of' =>              'lightblue',
   'develops_from' =>        'brown',
   'regulates' =>            'black',
   'negatively_regulates' => 'red',
   'positively_regulates' => 'green',
   ## Some more modern stuff:
   'BFO_0000050' => 'lightblue',
   'http://purl.obolibrary.org/obo/BFO_0000050' => 'lightblue',
   ## Regulates.
   'RO_0002211' => 'black',
   'http://purl.obolibrary.org/obo/RO_0002211' => 'black',
   'RO_0002212' => 'red',
   'http://purl.obolibrary.org/obo/RO_0002212' => 'red',
   'RO_0002213' => 'green',
   'http://purl.obolibrary.org/obo/RO_0002213' => 'green',
   ## Activates.
   'directly_activates' => 'coral4',
   'http://purl.obolibrary.org/obo/directly_activates' => 'coral4',
   ## ???
   'enabled_by' => 'lightpink',
   'RO_0002333' => 'lightpink',
   'http://purl.obolibrary.org/obo/RO_0002333' => 'lightpink',
   'regulates_levels_of' => 'lightpink',
   'RO_0002332' => 'lightpink',
   'http://purl.obolibrary.org/obo/RO_0002332' => 'lightpink',
   'genomically_related_to' => 'lightpink',
   'RO_0002330' => 'lightpink',
   'http://purl.obolibrary.org/obo/RO_0002330' => 'lightpink',
   ## ???
   'http://purl.obolibrary.org/obo/BFO_0000051' => 'lightpink',
   'http://purl.obolibrary.org/obo/upstream_of' => 'lightpink',
   'http://purl.obolibrary.org/obo/directly_inhibits' => 'lightpink',
   'http://purl.obolibrary.org/obo/indirectly_disables_action_of' => 'lightpink',
  );

my %ONT_COLOR_MAPPING =
  (
   'C' => '#a020f0',
   'P' => '#00ee76',
   'F' => '#ffd700',
  );


=item new



=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  bless $self, $class;
  return $self;
}


=item readable

Getter.
Returns a human readable form of the inputted string.

=cut
sub readable {

  my $self = shift;
  my $ret = shift || '';

  $ret = $READABLE->{$ret}
    if defined $READABLE->{$ret};

  return $ret;
}


=item relationship_color

Return the string of a color of a rel.
TODO: This should be defined from ENV?

=cut
sub relationship_color {

  my $self = shift;
  my $rel_str = shift || '';

  return $REL_COLOR_MAPPING{$rel_str} || 'grey';
}


=item term_information

DEPRECATED

Given an array ref of our DBIx term objects, return a hash ref of
useful term information. This done be core information.

=cut
sub term_information {

  my $self = shift;
  my $terms = shift || [];

  # Term
  my %term_hash = ();
  foreach my $term (@$terms){

    if( ! defined $term_hash{$term->acc} ){

      ## Start the bundle.
      $term_hash{$term->acc} =
	{
	 acc => $term->acc,
	 name => $term->name,
	 ontology_readable => $self->readable($term->term_type),
	 ontology => $term->term_type,
	 term_link =>
	 $self->get_interlink({mode=>'term-details', arg=>{acc=>$term->acc}}),
	 obsolete_p => $term->is_obsolete || 0,
	 definition => undef,
	 comment => undef,
	 subsets => [],
	 synonyms => [],
	 dbxrefs => [],
	 term_dbxrefs => [],
	};

      ###
      ### Fun, but possibly non-extant addons.
      ###

      ## Go and try and grab xrefs.
      ## TODO: This should be somewhere else in aid--too much here.
      foreach my $txr ($term->term_dbxref->all) {

	##
	my $dbx = $txr->dbxref;
	my $db = $dbx->xref_dbname;
	my $key = $dbx->xref_key;
	if( $txr->is_for_definition ){
	  push @{$term_hash{$term->acc}{term_dbxrefs}},
	    {
	     id => $db . ':' . $key,
	     dbname => $db,
	     key => $key,
	     link => $self->database_link($db, $key),
	    };
	}else{
	  push @{$term_hash{$term->acc}{dbxrefs}},
	    {
	     id => $db . ':' . $key,
	     dbname => $db,
	     key => $key,
	     link => $self->database_link($db, $key),
	    };
	}
      }
      ## Sort if necessary.
      @{$term_hash{$term->acc}{term_dbxrefs}} =
	sort { lc($a->{id}) cmp lc($b->{id}) }
	  @{$term_hash{$term->acc}{term_dbxrefs}};
      @{$term_hash{$term->acc}{dbxrefs}} =
	sort { lc($a->{id}) cmp lc($b->{id}) }
	  @{$term_hash{$term->acc}{dbxrefs}};

      ## Term and acc synonyms. Prevent dupes, even if they shouldn't
      ## be in there.
      my $syn_dupe_check = {};
      foreach my $syn ($term->term_synonym->all) {

	## Dig out scope if we can first.
	my $scope = undef;
	if( $syn->synonym_type && $syn->synonym_type->acc ){
	  $scope = $syn->synonym_type->acc;
	 }

	## Dig out the acc.
	my $syn_acc = undef;
	if( $syn->term_synonym ){
	  $syn_acc = $syn->term_synonym;
	}elsif( $syn->acc_synonym ){
	  $syn_acc = $syn->acc_synonym;
	}

	## Dupe check and add.
	if( defined $syn_acc and $syn_acc ){

	  my $syn_str = $syn_acc;
	  my $tmp = { acc => $syn_acc };

	  if( defined $scope and $scope ){
	    $tmp->{scope} = $scope;
	    $syn_str .= '<>' . $scope;
	  }

	  if( ! $syn_dupe_check->{$syn_str} ){
	    $syn_dupe_check->{$syn_str} = 1;
	    push @{$term_hash{$term->acc}{synonyms}}, $tmp;
	  }
	}
      }

      ## Term def and comment from term_def table.
      #$self->kvetch("_>d_");
      if( $term->term_definition ){ # &&
	if( $term->term_definition->term_definition ){
	  #$self->kvetch("_<dd_");
	  $term_hash{$term->acc}{definition} =
	    $term->term_definition->term_definition;
	}
	if( $term->term_definition->term_comment ){
	  #$self->kvetch("_<dc_");
	  $term_hash{$term->acc}{comment} =
	    $term->term_definition->term_comment;
	}
      }

      ## Collect subsets.
      #$self->kvetch("_>s_");
      if( $term->subset ){ # &&
	foreach my $tsub ($term->subset->all){
	  #$self->kvetch("_<s_" . $tsub);
	  my $ssacc = $tsub->subset->acc;
	  push @{$term_hash{$term->acc}{subsets}},
	    {
	     name => $tsub->subset->name,
	     acc => $ssacc,
	     link => $self->get_interlink({mode=>'term-subset',
					   arg=>{acc=>$ssacc}}),
	    };
	}
      }
    }
  }

  return \%term_hash;
}


=item lite_term_information

Given an array ref of our DBIx term objects, return a hash ref of
useful term information. This done be core information.

=cut
sub lite_term_information {

  my $self = shift;
  my $terms = shift || [];

  # Term
  my %term_hash = ();
  foreach my $term (@$terms){

    if( ! defined $term_hash{$term->acc} ){

      ## Start the bundle.
      $term_hash{$term->acc} =
	{
	 acc => $term->acc,
	 name => $term->name,
	 ontology_readable => $self->readable($term->term_type),
	 ontology => $term->term_type,
	 term_link =>
	 $self->get_interlink({mode=>'term-details', arg=>{acc=>$term->acc}}),
	 obsolete_p => $term->is_obsolete || 0,
	 definition => undef,
	 comment => undef,
	 subsets => [],
	 synonyms => [],
	 dbxrefs => [],
	 term_dbxrefs => [],
	};
    }
  }

  return \%term_hash;
}


# =item deep_term_information

# Given an array ref of our DBIx term objects, return a hash ref of
# useful term information. This done be core information.

# =cut
# sub deep_term_information {

#   my $self = shift;
#   my $terms = shift || [];

#   # Term
#   my %term_hash = ();
#   foreach my $term (@$terms){

#     if( ! defined $term_hash{$term->acc} ){

#       ## Start the bundle.
#       $term_hash{$term->acc} =
# 	{
# 	 acc => $term->acc,
# 	 name => $term->name,
# 	 ontology_readable => $self->readable($term->term_type),
# 	 ontology => $term->term_type,
# 	 term_link =>
# 	 $self->get_interlink({mode=>'term-details', arg=>{acc=>$term->acc}}),
# 	};
#     }
#   }

#   return \%term_hash;
# }


=item gene_product_information

Given an array ref of our DBIx gene product objects, return a hash ref
of useful gp information.

=cut
sub gene_product_information {

  my $self = shift;
  my $gps = shift || [];

  # GP
  my %gp_hash = ();
  foreach my $gp (@$gps){

    my $gp_acc = $gp->dbxref->xref_dbname . ':' . $gp->dbxref->xref_key;

    if( ! defined $gp_hash{$gp_acc} ){

      ## Got homolset?  TODO: We can actually also get this from
      ## AmiGO::ReferenceGenome (which should actually be under either
      ## Worker or Model along with Term and GeneProduct).
      my $homolsets = [];
      my @gphs = $gp->gene_product_homolset;
      #$self->kvetch("0|" . $gp_acc . '|');
      #$self->kvetch('1|' . @gphs . '|');
      #$self->kvetch('2|' . scalar(@gphs) . '|');
      use Data::Dumper;
      #$self->kvetch('3|' . Dumper(\@gphs) . '|');
      if( @gphs && scalar(@gphs) >= 1 && defined($gphs[0]) ){
	foreach my $gph (@gphs){
	  #$self->kvetch('4|' . $gph . '|');
	  my $sym = $gph->homolset->symbol;
	  push @$homolsets, $sym;
	  #$self->kvetch("\t3|" . $sym . '|');
	}
      }

      ## Got sequences?
      my $sequences = [];
      my $number_of_sequences = 0;
      my @gpseq = $gp->gene_product_seq;
      if( scalar @gpseq ){
	foreach my $gps (@gpseq){
	  $number_of_sequences++;
	  my $did = $gps->seq->display_id;
	  push @$sequences, $did; # TODO: probably want more information here
	}
      }

      ## 
      $gp_hash{$gp_acc} =
	{
	 # GP
	 acc => $gp_acc,
	 symbol => $gp->symbol,
	 full_name => $gp->full_name,
	 homolsets => $homolsets,
	 sequences => $sequences,
	 number_of_sequences => $number_of_sequences,
	 gene_product_link =>
	 $self->get_interlink({mode=>'gp-details',
			       arg=>{db=>$gp->dbxref->xref_dbname,
				     acc=>$gp->dbxref->xref_key}}),
	};
    }
  }

  return \%gp_hash;
}


=item pval_to_color

converts a float p-val to a readable fill and font pair

=cut
sub pval_to_color {

  my $self = shift;
  my $pval = shift || 0;
  my $color_fill = '#ffffff';
  my $color_font = '#0000ff';

  if( $pval ){
    #p_val = parseFloat(p_val);
    if( $pval > 0.1 ){
      $color_fill = '#eeeeee';
    }elsif( $pval > 0.01 ){
      $color_fill = '#dddddd';
    }elsif( $pval > 0.001 ){
      $color_fill = '#cccccc';
    }elsif( $pval > 0.0001 ){
      $color_fill = '#bbbbbb';
    }elsif( $pval > 0.00001 ){
      $color_fill = '#aaaaaa';
    }elsif( $pval > 0.000001 ){
      $color_fill = '#999999';
    }elsif( $pval > 0.0000001 ){
      $color_fill = '#888888';
    }elsif( $pval > 0.00000001 ){
      $color_fill = '#777777';
    }elsif( $pval > 0.000000001 ){
      $color_fill = '#666666';
    }elsif( $pval > 0.0000000001 ){
      $color_fill = '#555555';
      $color_font = '#add8e6';
    }elsif( $pval > 0.00000000001 ){
      $color_fill = '#444444';
      $color_font = '#add8e6';
    }elsif( $pval > 0.000000000001 ){
      $color_fill = '#333333';
      $color_font = '#add8e6';
    }elsif( $pval > 0.0000000000001 ){
      $color_fill = '#222222';
      $color_font = '#add8e6';
    }elsif( $pval > 0.00000000000001 ){
      $color_fill = '#111111';
      $color_font = '#add8e6';
    }else{
      $color_fill = '#000000';
      $color_font = '#add8e6';
    }
  }

  return $color_fill, $color_font;
}


=item ticks_to_quot

Coverts the '"' in a string to '&quot;'

=cut
sub ticks_to_quot {

  my $self = shift;
  my $str = shift || '';
  $str =~ s/\"/\&quot\;/g;
  #$str =~ s/\'/\&quot\;/g;
  return $str;
}


=item pvals_to_json

Converts a hashref of GO id & p-vals into viz's JSON representation.

=cut
sub pvals_to_json {

  my $self = shift;
  my $idpvals = shift || {};

  my $out_struct = {};
  foreach my $id (keys %$idpvals){
    my $val = $idpvals->{$id};
    if( defined $val ){
      my ($fill, $font) = $self->pval_to_color($val);
      $out_struct->{$id} = {};
      $out_struct->{$id}{title} = $id . ' (' . $val . ')';
      #$out_struct->{body}
      #$out_struct->{border}
      $out_struct->{$id}{fill} = $fill;
      $out_struct->{$id}{font} = $font;

#       $self->kvetch("val: " . $val);
#       $self->kvetch("id: " . $id);
#       $self->kvetch("fill: " . $fill);
#       $self->kvetch("font: " . $font);
#       $self->kvetch("");
    }
  }
  my $jout = $self->{JSON}->encode($out_struct);
  return $jout;
}


=item ontology_to_color

converts an gene ontology code ('C', 'P', 'F') to a color.

=cut
sub ontology_to_color {

  my $self = shift;
  my $code = shift || '';
  my $color = '#ffffff';

  $color = $ONT_COLOR_MAPPING{$code}
    if defined($ONT_COLOR_MAPPING{$code});

  return $color;
}


# =item get_color_spread

# Return an array ref of a spread of hex colors.
# TODO: This should be defined from ENV?

# ## BUG/TODO: Check the license of this...from perlmonks...

# =cut
# sub get_color_spread {

#   use POSIX 'ceil';

#   my $self = shift;
#   my $n = shift || 1;

#   my $discrete = ceil($n ** (1/3));
#   #my @colors = ([1,1,1]);
#   my @colors = ();
#   #for my $i (1..$n-1) {
#   for my $i (1..$n) {
#     push @colors, [
# 		   map {1-($_ % $discrete)/$discrete}
# 		   $i/($discrete**2),
# 		   $i/$discrete,
# 		   $i
# 		  ];
#   }
#   \@colors;
# }



1;
