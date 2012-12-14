=head1 AmiGO::SVG

A library to help integrate Workers that depend heavily on SVG
(SVG viewers and the like).

=cut

package AmiGO::SVG;

use base 'AmiGO';
use utf8;
use strict;
use Math::Trig;
use AmiGO::Aid::ReferenceGenome;


=item new

Args: none.
Returns: an SVG object that "knows" how to do things for AmiGO.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  $self->{SYMBOLS} = [];
  $self->{SVG_PIE_SPECIES} = [];

  ## We'll borrow SUCCESS and ERROR_MESSAGE from AmiGO.

  bless $self, $class;
  return $self;
}


=item add_species

Args: an array ref of species to be used to calculate pie overlay
information
Returns:

=cut
sub add_species {

  my $self = shift;
  my $spec = shift || [];
  $self->{SVG_PIE_SPECIES} = $spec;
}


=item add_defs_symbol

Args: a symbol string (probably made by another function)
Returns:

=cut
sub add_defs_symbol {

  my $self = shift;
  my $symbol = shift || '';

  push @{$self->{SYMBOLS}}, $symbol;
}


=item emit_defs

Args: none
Returns: a string of all added symbols wrapped in <defs> tags.

=cut
sub emit_defs {

  my $self = shift;

  my @mbuf = ();
  push @mbuf, '<defs>';
  push @mbuf, "\n";

  foreach my $symbol (@{$self->{SYMBOLS}}){
    push @mbuf, $symbol;
  }

  push @mbuf, '</defs>';
  push @mbuf, "\n";
  return join '', @mbuf;
}


## Args: ID string.
## Returns: An SVG graphic wrapped in an IDed symbol tag set
sub _create_symbol_block {

  my $self = shift;
  my $symbol_id = shift || 'unknown_id';
  my $graphic_string = shift || '';

  my @mbuf = ();
  push @mbuf, '<symbol id="';
  push @mbuf, $symbol_id;
  push @mbuf, '" overflow="visible">';
  push @mbuf, $graphic_string;
  push @mbuf, '</symbol>';
  push @mbuf, "\n";
  return join '', @mbuf;
}


# ## Emit concentric ellipses.
# sub _emit_concentric_ellipses {

#   my $self = shift;

#   my @mbuf = ();
#   my @radius = (200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0);
#   foreach my $r (@radius){
#     push @mbuf, '<ellipse rx="';
#     push @mbuf, $r;
#     push @mbuf, '" ry="60" stroke-width="7" stroke-opacity=".5" ';
#     push @mbuf, 'fill-opacity="0" cx="0" cy="0"/>';
#   }
#   ## Think outline.
#   push @mbuf, '<ellipse rx="';
#   push @mbuf, 200;
#   push @mbuf, '" ry="60" stroke-width="5" stroke="';
#   push @mbuf, '#000000';
#   push @mbuf, '" fill-opacity="0" cx="0" cy="0"/>';

#   return join '', @mbuf;
# }


# ## Emit concentric ellipses.
# sub _emit_concentric_circles {

#   my $self = shift;

#   my @mbuf = ();

#     ##
#   my @radius = (120, 100, 80, 60, 40);
#   foreach my $r (@radius){
#     push @mbuf, '<circle r="';
#     push @mbuf, $r;
#     push @mbuf, '" stroke-width="7" stroke-opacity=".5" ';
#     push @mbuf, 'fill-opacity="0" cx="0" cy="0"/>';
#   }
#   ## Think outline.
#   push @mbuf, '<circle r="';
#   push @mbuf, 130;
#   push @mbuf, '" stroke-width="7" stroke="';
#   push @mbuf, '#000000';
#   push @mbuf, '" fill-opacity="0" cx="0" cy="0"/>';

#   return join '', @mbuf;
# }


# ## Emit cpie slices.
# sub _emit_pie_slice {

#   my $self = shift;

#   my $slice = shift || 1;
#   my $of_slices = shift || 2;

#   ## Slice trig.
#   my $size = 110;
#   my $seg_in_rad = (2 * pi) / $of_slices;
#   my $sin = (sin $seg_in_rad) * $size;
#   my $cos = $size - ((cos $seg_in_rad) * $size);
#   my $deg = rad2deg(($slice -1) * $seg_in_rad);

#   ##
#   my @mbuf = ();
#   push @mbuf, '<g pointer-events="none" transform="rotate(' . $deg . ')">';
#   #push @mbuf, '<path d="M0,0 0 -100 a100,100 0 0,1 86.6,50 z" ';
#   push @mbuf, '<path d="M0,0 0 -';
#   push @mbuf, $size;
#   push @mbuf, ' a';
#   push @mbuf, $size;
#   push @mbuf, ',';
#   push @mbuf, $size;
#   push @mbuf, ' 0 0,1 '. $sin .','. $cos .' z" ';
#   push @mbuf, 'fill-opacity=".9" stroke="black" stroke-width="5"/>';
#   push @mbuf, '</g>';

#   return join '', @mbuf;
# }


## Emit cpie slices.
sub _emit_pie_slice_complex {

  my $self = shift;

  my $slice = shift || 1;
  my $of_slices = shift || 2;
  my $color = shift || '';

  ## Slice trig.
  my $size = 110;
  my $seg_in_rad = (2 * pi) / $of_slices;
  my $sin = (sin $seg_in_rad) * $size;
  my $cos = (cos $seg_in_rad) * $size;
  my $adj_cos = $size - $cos;
  my $deg = rad2deg(($slice -1) * $seg_in_rad);

  ##
  my @mbuf = ();
  push @mbuf, '<g pointer-events="none" transform="rotate(' . $deg . ')">';

  ## Pie wedge.
  #push @mbuf, '<path d="M0,0 0 -100 a100,100 0 0,1 86.6,50 z" ';
  push @mbuf, '<path d="M0,0 0 -';
  push @mbuf, $size;
  push @mbuf, ' a';
  push @mbuf, $size;
  push @mbuf, ',';
  push @mbuf, $size;
  push @mbuf, ' 0 0,1 '. $sin .','. $adj_cos .' z" ';
  push @mbuf, 'fill-opacity=".9" stroke="black" stroke-width="5"/>';

  if( $color ){
    ## Circle inscribed into above's arc.
    my $radius = 22;
    my $sin = (sin ($seg_in_rad/2));# * $size;
    my $cos = (cos ($seg_in_rad/2));# * $size;
    my $scaled_sin = $sin * $size;
    my $scaled_cos = $cos * $size;
    ## Circle inscribed into above's arc.
    #push @mbuf, '<circle r="'. $radius .'" stroke-width="5" stroke="black" fill="' . $color . '" fill-opacity=".9" cx="' . $scaled_sin . '" cy="' . (-1 * $scaled_cos) . '"/>';
    ## Circle inscribed inside above's arc.
    #push @mbuf, '<circle r="'. $radius .'" stroke-width="5" stroke="black" fill="' . $color . '" fill-opacity=".9" cx="' . ($scaled_sin - ($radius * $sin)) . '" cy="' . ((-1 * $scaled_cos) + ($radius * $cos)) . '"/>';
    ## Circle inscribed a little into above's arc.
    push @mbuf, '<circle r="'. $radius .'" stroke-width="7" stroke="black" fill="' . $color . '" fill-opacity=".9" cx="' . ($scaled_sin - ($radius * $sin *.5)) . '" cy="' . ((-1 * $scaled_cos) + ($radius * $cos * .5)) . '"/>';
  }

  push @mbuf, '</g>';

  return join '', @mbuf;
}


## ...
sub _emit_highlight {

  my $self = shift;
  my $color = shift || 'black';

  ##
  my @mbuf = ();
  push @mbuf, '<circle r="100" stroke-width="5" stroke="';
  push @mbuf, $color;
  push @mbuf, '" fill-opacity=".5" cx="0" cy="0"/>';
  return join '', @mbuf;
}


=item make_mini_symbols

...

TODO: add ID variables

=cut
sub make_mini_symbols {

  my $self = shift;
  #my $mini_1_id = shift || 'unknown_1_id';
  #my $mini_2_id = shift || 'unknown_2_id';
  #my $mini_3_id = shift || 'unknown_3_id';

  ## ...
  my @mbuf = ();
#   push @mbuf, $self->_create_symbol_block('miniCircles',
# 					  '<g transform="scale(.09)">' .
# 					  $self->_emit_concentric_circles() .
# 					  '</g>');
#   push @mbuf, $self->_create_symbol_block('miniEllipses',
# 					  '<g transform="scale(.09)">' .
# 					  $self->_emit_concentric_ellipses() .
# 					  '</g>');
  my $rg_aid = AmiGO::Aid::ReferenceGenome->new();
  my $colors = $rg_aid->get_status_colors();
  my $exp_color = $colors->{'exp'};
  my $good_color = $colors->{'good'};
  push @mbuf, $self->_create_symbol_block('mini_pie',
					  '<g transform="scale(.125)">' .
					  $self->_emit_pie_slice_complex(1,6).
					  '</g>');
  push @mbuf,
    $self->_create_symbol_block('mini_pie_exp',
				'<g transform="scale(.125)">' .
				$self->_emit_pie_slice_complex(1,6,$exp_color).
				'</g>');
  push @mbuf,
    $self->_create_symbol_block('mini_pie_iss',
				'<g transform="scale(.125)">' .
				$self->_emit_pie_slice_complex(1,6,$good_color)
				. '</g>');
  push @mbuf, $self->_create_symbol_block('miniHighlightSymbol',
  					  '<g transform="scale(.09)">' .
  					  $self->_emit_highlight .
  					  '</g>');
  return join '', @mbuf;
}


=item make_symbol_checkboxes

Args: border id string and check id string
Returns: A string for SVG symbols for checkbox and check.

TODO: add ID variables

=cut
sub make_symbol_checkboxes {

  my $self = shift;
  my $border_id = shift || 'unknown_border';
  my $check_id = shift || 'unknown_check';
  my $fill_id = shift || 'unknown_fill';

  ## Checkbox container.
  my @boxbuf = ();
  push @boxbuf, '<rect x="-7.5" y="-7.5" width="15" height="15" fill="white" stroke="black" stroke-width="1" cursor="pointer"/>';

  ## The check itself.
  my @chkbuf = ();
  push @chkbuf, '<g pointer-events="none" stroke="black" stroke-width="2">';
  push @chkbuf, '<line x1="-5" y1="-5" x2="5" y2="5"/>';
  push @chkbuf, '<line x1="5" y1="-5" x2="-5" y2="5"/>';
  push @chkbuf, '</g>';

  ## The fill.
  my @fillbuf = ();
  push @fillbuf, '<g pointer-events="none" stroke="black" stroke-width="2">';
  push @fillbuf, '<rect x="-5" y="-5" width="10" height="10" fill="black" stroke="black" stroke-width="1" />';
  push @fillbuf, '</g>';

  ## Chunk them together.
  my @mbuf = ();
  push @mbuf, $self->_create_symbol_block($fill_id, join('', @fillbuf));
  push @mbuf, $self->_create_symbol_block($check_id, join('', @chkbuf));
  push @mbuf, $self->_create_symbol_block($border_id, join('', @boxbuf));
  return join '', @mbuf;
}


# =item make_symbol_radiobuttons

# Args: border id string and check id string
# Returns: A string for SVG symbols for radiobuttons and their fill.

# =cut
# sub make_symbol_radiobuttons {

#   my $self = shift;
#   my $border_id = shift || 'unknown_border';
#   my $check_id = shift || 'unknown_check';

#   ## Border for radio button.
#   my @bbuf = ();
#   push @bbuf, '<circle fill="white" stroke="black" stroke-width="1" r="7" />';

#   ## Fill for radio button.
#   my @rbuf = ();
#   push @rbuf, '<circle fill="black" r="5" pointer-events="none" />';

#   ## Chunk them together.
#   my @mbuf = ();
#   push @mbuf, $self->_create_symbol_block($border_id, join('', @bbuf));
#   push @mbuf, $self->_create_symbol_block($check_id, join('', @rbuf));
#   return join '', @mbuf;
# }


# =item make_symbol_star

# Args: Currently, none.
# Returns: A string for SVG symbols for ISS only markings.

# TODO: add ID variables

# =cut
# sub make_symbol_star {

#   my $self = shift;
#   my $id = shift || 'starSymbol';
#   my $color = shift || '#3030FF';
#   my $xform = shift || '';

#   my @mbuf = ();

#   ##
#   push @mbuf, '<g pointer-events="none" stroke="';
#   push @mbuf, $color;
#   push @mbuf, '" stroke-width="5" transform="' . $xform . '">';
#   push @mbuf, '<line x1="90" y1="0" x2="-90" y2="0"/>';
#   push @mbuf, '<line x1="0" y1="90" x2="0" y2="-90"/>';

#   push @mbuf, '<line x1="-64" y1="-64" x2="64" y2="64"/>';
#   push @mbuf, '<line x1="64" y1="-64" x2="-64" y2="64"/>';

#   push @mbuf, '<line x1="-34" y1="-83" x2="34" y2="83"/>';
#   push @mbuf, '<line x1="-34" y1="83" x2="34" y2="-83"/>';
#   push @mbuf, '<line y1="-34" x1="-83" y2="34" x2="83"/>';
#   push @mbuf, '<line y1="-34" x1="83" y2="34" x2="-83"/>';

#   push @mbuf, '</g>';

#   return $self->_create_symbol_block($id, join('', @mbuf));
# }


=item make_symbol_highlite_circle

Args: Currently, none.
Returns: A string for SVG symbols for the highlight circles.

TODO: add ID variables

=cut
sub make_symbol_highlite_circle {

  my $self = shift;
  my $color = shift || 'black';

  return $self->_create_symbol_block('highlightSymbol',
				     $self->_emit_highlight($color));
}


# =item make_target_symbol

# Args: Currently, none.
# Returns: A string for SVG symbols for the target circles.

# TODO: add ID variables

# =cut
# sub make_target_symbol {

#   my $self = shift;
#   my $id = shift || 'targetSymbol';
#   my $color = shift || 'black';
#   my $shift = shift || 0;

#   my @mbuf = ();

#   ##
#   push @mbuf, '<symbol id="' . $id . '" overflow="visible">';
#   my @radius = (120, 100, 80, 60, 40);
#   foreach my $r (@radius){
#     push @mbuf, '<circle r="';
#     push @mbuf, $r - $shift;
#     push @mbuf, '" stroke-width="7" stroke="';
#     #push @mbuf, $color;
#     push @mbuf, '" fill-opacity="0" cx="0" cy="0"/>';
#   }
#   ## Think outline.
#   push @mbuf, '<circle r="';
#   push @mbuf, 125;
#   push @mbuf, '" stroke-width="5" stroke="';
#   push @mbuf, '#000000';
#   push @mbuf, '" fill-opacity="0" cx="0" cy="0"/>';
#   push @mbuf, '</symbol>';

#   push @mbuf, "\n";
#   return join '', @mbuf;
# }


=item make_pie_slice

Args: symbol_id, color, time.
Returns: A string for SVG symbols for the highlight circle slice.

TODO:

=cut
sub make_pie_slice {

  my $self = shift;
  my $symbol_id = shift || 'unknown_symbol_id';
  my $slice = shift || 1;
  my $color = shift || '';
  my $of_slices = scalar @{$self->{SVG_PIE_SPECIES}};

  my @mbuf = ();
  #push @mbuf, $self->_emit_pie_slice($slice, $of_slices);
  push @mbuf, $self->_emit_pie_slice_complex($slice, $of_slices, $color);
  return $self->_create_symbol_block($symbol_id, join('', @mbuf));
}


=item make_target_symbol

Args: symbol_id, color, time.
Returns: A string for SVG symbols for the highlight circle slice.

TODO:

=cut
sub make_target_symbol {

  my $self = shift;
  my $symbol_id = shift || 'unknown_symbol_id';

  my @mbuf = ();
  push @mbuf, $self->_emit_concentric_circles();
  return $self->_create_symbol_block($symbol_id, join('', @mbuf));
}


=item make_wedge_symbol

Args: symbol_id, color, time.
Returns: A string for SVG symbols for the highlight wedge (now an ellipse).

TODO:

=cut
sub make_wedge_symbol {

  my $self = shift;
  my $symbol_id = shift || 'unknown_symbol_id';

  my @mbuf = ();
  push @mbuf, $self->_emit_concentric_ellipses();
  return $self->_create_symbol_block($symbol_id, join('', @mbuf));
}



1;
