=head1 AmiGO::Aid



=cut

package AmiGO::Aid;

use base 'AmiGO';
use YAML::Loader;
use Data::Dumper;

## TODO: This should be refactored into a YAML config for better sharing.
## We're getting a lot of colors and aliases coming from different
## sources, so let's try and merge our data better into one spot.
my $super_data =
  {
   ## Terms.
   'GO_0008150' => {
		    readable => 'biological process',
		    color => 'grey',
		   },
   'GO_0005575' => {
		    readable => 'cellular component',
		    color => 'grey',
		   },
   'GO_0003674' => {
		    readable => 'molecular function',
		    color => 'grey',
		   },
   ## Relations.
   'BFO_0000050' =>
   {
    readable => 'part of',
    color => 'lightblue',
   },
   'BFO_0000051' =>
   {
    readable => 'has part',
    color => 'cornflowerblue',
   },
   'BFO_0000066' =>
   {
    readable => 'occurs in',
    color => 'aquamarine4',
   },
   'RO_0002202' =>
   {
    readable => 'develops from',
    color => 'brown',
   },
   'RO_0002211' =>
   {
    readable => 'regulates',
    color => 'gray25',
   },
   'RO_0002212' =>
   {
    readable => 'negatively regulates',
    color => 'red',
   },
   'RO_0002213' =>
   {
    readable => 'positively regulates',
    color => 'green',
   },
   'RO_0002213' =>
   {
    readable => 'positively regulates',
    color => 'green',
   },
   'RO_0002330' =>
   {
    readable => 'genomically related to',
    color => 'darkorchid',
   },
   'RO_0002331' =>
   {
    readable => 'involved in',
    color => 'darksalmon',
   },
   'RO_0002332' =>
   {
    readable => 'regulates level of',
    color => 'darkolivegreen',
   },
   'RO_0002333' =>
   {
    readable => 'enabled by',
    color => 'darkgoldenrod',
   },
   ## ???
   'directly_activates' =>
   {
    readable => 'directly activates',
    color => 'darkseagreen',
   },
   'upstream_of' =>
   {
    readable => 'upstream of',
    color => 'deeppink',
   },
   'directly_inhibits' =>
   {
    readable => 'directly inhibits',
    color => 'chartreuse',
   },
   'indirectly_disables_action_of' =>
   {
    readable => 'indirectly disables action of',
    color => 'darkslateblue',
   },
  };

my $super_alias =
  {
   ## GO.
   'biological_process' => 'GO_0008150',
   'cellular_component' => 'GO_0005575',
   'molecular_function' => 'GO_0003674',
   'B' => 'GO_0008150',
   'P' => 'GO_0005575',
   'F' => 'GO_0003674',
   ## BFO.
   'http://purl.obolibrary.org/obo/BFO_0000050' => 'BFO_0000050',
   'http://purl.obolibrary.org/obo/part_of' => 'BFO_0000050',
   'part_of' => 'BFO_0000050',
   'http://purl.obolibrary.org/obo/BFO_0000051' => 'BFO_0000051',
   'has_part' => 'BFO_0000051',
   'http://purl.obolibrary.org/obo/BFO_0000066' => 'BFO_0000066',
   'occurs_in' => 'BFO_0000066',
   'occurs in' => 'BFO_0000066',
   ## RO.
   'http://purl.obolibrary.org/obo/RO_0002211' => 'RO_0002211',
   'http://purl.obolibrary.org/obo/RO_0002212' => 'RO_0002212',
   'http://purl.obolibrary.org/obo/RO_0002213' => 'RO_0002213',
   ## ???
   'http://purl.obolibrary.org/obo/indirectly_disables_action_of' => 'indirectly_disables_action_of',
   'http://purl.obolibrary.org/obo/directly_activates' => 'directly_activates',
   'http://purl.obolibrary.org/obo/upstream_of' => 'upstream_of',
   'http://purl.obolibrary.org/obo/directly_inhibits' => 'directly_inhibits',
  };

# my %ONT_COLOR_MAPPING =
#   (
#    'C' => '#a020f0',
#    'P' => '#00ee76',
#    'F' => '#ffd700',
#   );


=item new



=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  ## Pull in the shared context file.
  my $yaml_fname = $self->amigo_env('AMIGO_ROOT') . '/conf/context.yaml';
  $self->kvetch('context file: ' . $yaml_fname);

  ## Slurp in YAML context one time.
  my $yml = '';
  open(YAMLFILE, '<', $yaml_fname) or die "Cannot open context: $yaml_fname: $!";
  while( <YAMLFILE> ){
    $yml .= $_;
  }
  close YAMLFILE;
  #$self->kvetch("context (yaml raw): \n" . $yml);

  my $yloader = YAML::Loader->new();
  my $context_data = $yloader->load($yml);
  #$self->kvetch('context: ' . Dumper($context_data));

  ## Setup what we need to get at the context data.
  $self->{AAID} = {};
  $self->{AAID}{CONTEXT} = $context_data;
  $self->{AAID}{DEALIAS} = {};

  ## Create a way to get at aliases.
  foreach my $entry_key (keys %$context_data){
    #$self->kvetch('entry_key: ' . $entry_key);

    my $entry = $context_data->{$entry_key};

    if( $entry && $entry->{aliases} ){
      foreach my $alias ( @{$entry->{aliases}} ){
	$self->{AAID}{DEALIAS}{$alias} = $entry_key;
      }
    }
  }
  #$self->kvetch('aliases: ' . Dumper($self->{AAID}{DEALIAS}));

  bless $self, $class;
  return $self;
}

## Helper fuction to go from unknown id -> alias -> data structure.
sub _dealias_data {
  my $self = shift;
  my $id = shift || undef;

  #$self->kvetch('dealias id: ' . $id);

  my $ret = undef;
  if( defined $id ){
    #$self->kvetch('dealias defined');

    ## First, try and dealias via the new data, otherwise fallback.
    if( $self->{AAID}{CONTEXT}{$id} ){
      $ret = $self->{AAID}{CONTEXT}{$id};
    }elsif( $self->{AAID}{DEALIAS}{$id} &&
	$self->{AAID}{CONTEXT}{$self->{AAID}{DEALIAS}{$id}} ){
      $ret = $self->{AAID}{CONTEXT}{$self->{AAID}{DEALIAS}{$id}};

    }elsif( defined $super_data->{$id} ){ # directly pull
      #$self->kvetch('dealias direct pull');
      $ret = $super_data->{$id};
    }elsif( defined $super_alias->{$id} ){ # dealias
      my $unalias = $super_alias->{$id};
      #$self->kvetch('dealias unalias: ' . $unalias);
      if( defined $super_data->{$unalias} ){ # indirect pull
	#$self->kvetch('dealias indirect pull');
	$ret = $super_data->{$unalias};
      }

    }else{
      ## no-op
    }
  }

  return $ret;
}


=item readable

Getter.
Returns a human readable form of the inputted string.

=cut
sub readable {
  my $self = shift;
  my $in = shift || '';

  my $ret = $in;
  my $data = $self->_dealias_data($in);
  if( $data && defined $data->{readable} ){
    $ret = $data->{readable};
  }

  return $ret;
}


=item relationship_color

Return the string of a color of a rel.

=cut
sub relationship_color {
  my $self = shift;
  my $in = shift || '';

  my $ret = 'grey';
  my $data = $self->_dealias_data($in);
  if( $data && defined $data->{color} ){
    $ret = $data->{color};
  }

  return $ret;
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


# =item ontology_to_color

# converts an gene ontology code ('C', 'P', 'F') to a color.

# =cut
# sub ontology_to_color {

#   my $self = shift;
#   my $code = shift || '';
#   my $color = '#ffffff';

#   $color = $ONT_COLOR_MAPPING{$code}
#     if defined($ONT_COLOR_MAPPING{$code});

#   return $color;
# }


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
