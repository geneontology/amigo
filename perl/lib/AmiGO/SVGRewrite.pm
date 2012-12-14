=head1 AmiGO::SVGRewrite

A wrapper to make transforming GV SVG into something usable a little
more tolerable. The long term fix will be to redo GV in JS. Be aware
that this module is nearly worthless outside of a GraphViz context.

There will be references to "old" and "new" GraphViz in the code. For
the sake of the code, "old" is 2.20.2 and "new" is 2.26.3.

=cut

package AmiGO::SVGRewrite;

use base 'AmiGO::SVG';
use utf8;
use strict;
use AmiGO::Aid::ReferenceGenome;

use AmiGO::JavaScript;
my $js = AmiGO::JavaScript->new(1);


=item new

Args: none.
Returns:...

=cut
sub new {

  ##
  my $class = shift;
  my $vars = shift || {};

  my $self  = $class->SUPER::new();

  ##
  $self->{JS_VARIABLE} = [];
  $self->{JS_LIBRARY} = [];
  $self->{JS_INIT} = [];
  $self->{JS_SVG_TITLE} = '';
  $self->{JS_SVG_SEGEMENT} = [];

  ## TODO: necessary--we'll be using the symbols pretty
  ## consistantly...
  $self->{SVG_SYMBOL} = {};

  bless $self, $class;
  return $self;
}


=item add_svg_title

Args: add a title string to the SVG ()
Returns nil

=cut
sub add_svg_title {

  my $self = shift;
  my $t = shift || '';
  $self->{JS_SVG_TITLE} = $t;
}


=item add_svg_segment

Args: add a raw segement of SVG text to the rewritten document.
Returns nil

=cut
sub add_svg_segment {

  my $self = shift;
  my $segement = shift || '';

  push @{$self->{JS_SVG_SEGEMENT}}, $segement;
}


=item add_js_variable

Args: name and a perl variable to be converted into JS
Returns nil

=cut
sub add_js_variable {

  my $self = shift;
  my $name = shift || 'unknown_variable';
  my $value = shift || undef;

  push @{$self->{JS_VARIABLE}}, {
				 name  => $name,
				 value => $value
				};
}


=item add_js_library

Args: "name" of lib
Returns nil

=cut
sub add_js_library {

  my $self = shift;
  my $value = shift || undef;

  push @{$self->{JS_LIBRARY}}, $value;
}


=item set_js_initializer

Args: fun string for JS init
Returns nil

=cut
sub add_js_initializer {

  my $self = shift;
  my $value = shift || '';

  push @{$self->{JS_INIT}}, $value;
}


=item add_svg_symbol

Args: symbol text
Returns nil

=cut
sub add_svg_symbol {

  my $self = shift;
  my $value = shift || undef;

  $self->{SVG_SYMBOL}{$value} = 1;
}


=item rewrite

Args: incoming raw SVG file as string
Returns: an SVG object that "knows" how to do things for AmiGO.

=cut
sub rewrite {

  my $self = shift;
  my $svg_file = shift || '';


  ##
  ## Chew the GraphViz produced SVG into submission.
  ##

  ## Fish out key values. TODO/BUG: for the time being, we're just
  ## going to go ahead and fix the width at 8.5x11in. We want to keep
  ## a minimum.
  $svg_file =~ /\<svg(.*?)width\s*=\s*\"(.*?)\"(.*?)\>/s;
  my $svg_width = $2;
  $svg_file =~ /\<svg(.*?)height\s*=\s*\"(.*?)\"(.*?)\>/s;
  my $svg_height = $2;

  $self->kvetch('detected width: ' . $svg_width);
  $self->kvetch('detected height: ' . $svg_height);

  ## Actally, let's just use mootools...wait...this is perl...
  ## TODO: move this bit of code into the JS (if render speed allows).
  #$svg_width = Window.getWidth . 'px';
  #$svg_height = Window.getHeight . 'px';
  #$svg_width = '11.0in'; # hacky
  #$svg_height = '8.5in';
  #$svg_width = ''; # infinite space works everywhere but safari and chrome
  #$svg_height = '';
  $svg_width = '32.0in'; # 
  $svg_height = '32.0in';

  $self->kvetch('using width: ' . $svg_width);
  $self->kvetch('using height: ' . $svg_height);

  #$file =~ /\<svg(.*?)viewBox\s*=\s*\"(.*?)\"(.*?)\>/s;
  #my $svg_viewbox = $2;

  ## Replace top, make it something saner.
  my $top = '';
  $top .= "<!-- BEGIN modified area -->\n";
  $top .= '<svg id="rgsvg" width="';
  $top .= $svg_width;
  $top .= '" height="';
  $top .= $svg_height;
  $top .= '"';
  $top .= ' zoomAndPan="disable"';
  $top .= ' xmlns="http://www.w3.org/2000/svg"';
  $top .= ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  $top .= ' xml:space="preserve"';
  #$top .= ' onload="RefGenomeVizInit('rgsvg','tform_matrix','underlay_context','overlay_context','control_context','detail_context'";
  #$top .= ")\"
  $top .= ">\n";

  ## Add a title.
  $top .= "<title>" . $self->{JS_SVG_TITLE} . "</title>\n"
    if $self->{JS_SVG_TITLE};

  ## While correct, having this destroys a lot of the nice layout we have.
  # ## TODO: to style or not to style...will be necessary if we do
  # ## dynamic box resizing.
  # $top .= "<style type=\"text/css\">text {font-family:monospace;}</style>\n";

  ## Add additional segments JS if requested.
  foreach my $seg (@{$self->{JS_SVG_SEGEMENT}}){
    $top .= $seg . "\n";
  }

  ## Standard JS libraries for these graphs. TODO: the newer one
  ## doesn't seem to like what is going on in carto...
  $top .= $js->get_lib('net.mootools-old');
  $top .= $js->get_lib('org.bbop.kvetch');
  $top .= $js->get_lib('org.bbop.go');
  $top .= $js->get_lib('org.bbop.AffineSVG');
  $top .= $js->get_lib('org.bbop.SVG');
  $top .= $js->get_lib('net.carto.helperFunctions');
  $top .= $js->get_lib('net.carto.timer');
  $top .= $js->get_lib('net.carto.button');
  $top .= $js->get_lib('net.carto.checkboxAndRadiobutton');
  $top .= $js->get_lib('net.carto.combobox');
  $top .= $js->get_lib('net.carto.mapApp');
  #$top .= $js->get_lib('org.bbop.Viewer');

  ## Requested JS initializer libraries.
  #$top .= $js->get_lib('RefGenome');
  foreach my $l (@{$self->{JS_LIBRARY}}){
    $top .= $js->get_lib($l);
  }

  ## Added JS variables.
  foreach my $pair (@{$self->{JS_VARIABLE}}){
    $top .= $js->make_var($pair->{name}, $pair->{value});
  }

  ## TODO: Standard JS initializer library for pan and zoom.
  ## TODO: cross-session (cookie-based) view memory.
  #$top .= $js->get_lib('RefGenome');

  ## Added initializers.
  foreach my $i (@{$self->{JS_INIT}}){
    $top .= $js->initializer($i)
  }

  ## Trying different things to make shift correct. NOTE: This seems
  ## to be fairly well conserved between GV version.
  $svg_file =~ /\<g id=\"graph[0-9]\" class=\"graph\" transform=\"scale\((.*?) (.*?)\) rotate\(0\) translate\((.*?) (.*?)\)\"\>/;
  my $x_scale = $1;
  my $y_scale = $2;
  my $x_trans = $3;
  my $y_trans = $4;
  $x_scale = 1;
  $y_scale = 1;
  #$x_trans = $1 * $3;
  #$y_trans = $2 * $4;
  $x_trans = $3;
  $y_trans = $4;

  $self->kvetch('detected x_scale: ' . $x_scale);
  $self->kvetch('detected y_scale: ' . $y_scale);
  $self->kvetch('detected x_trans: ' . $x_trans);
  $self->kvetch('detected y_trans: ' . $y_trans);

  ###
  ### Add commonly used symbols.
  ###

  ## Controls.
  $self->add_defs_symbol($self->make_symbol_checkboxes('checkBoxRect',
						       'checkBoxCross',
						       'checkBoxFill'));

  ## Coverage highlights.
  $self->add_defs_symbol($self->make_symbol_highlite_circle());

  ## Try new pie system.
  my $rg_aid = AmiGO::Aid::ReferenceGenome->new();
  my $colors = $rg_aid->get_status_colors();
  my $exp_color = $colors->{'exp'};
  my $good_color = $colors->{'good'};
  my $index = 1;
  if( defined $self->{SVG_PIE_SPECIES} &&
      scalar(@{$self->{SVG_PIE_SPECIES}}) ){

    ## Get the pie species into the correct order.
    my $tmp_pie_spec_hash = {};
    foreach my $spc (@{$self->{SVG_PIE_SPECIES}}){
      $tmp_pie_spec_hash->{$spc} = 1;
    }
    my @ordered_pie_species = ();
    foreach my $spc (@{$rg_aid->species_list()}){
      if( defined $tmp_pie_spec_hash->{$spc} ){
	push @ordered_pie_species, $spc;
      }
    }

    ## Create necessary pie glyphs.
    #foreach my $spc (@{$self->{SVG_PIE_SPECIES}}){
    foreach my $spc (@ordered_pie_species){
      $self->add_defs_symbol($self->make_pie_slice($spc . '_pie', $index));
      $self->add_defs_symbol($self->make_pie_slice($spc . '_pie_exp', $index,
						   $exp_color));
      $self->add_defs_symbol($self->make_pie_slice($spc . '_pie_iss', $index,
						   $good_color));
      $index++;
    }
  }

  ##
  $self->add_defs_symbol($self->make_mini_symbols());

  ## Add to SVG.
  $top .= $self->emit_defs();

  ##
  $top .= '<g id="tform_matrix" transform="matrix(';
  $top .= $x_scale || '1';
  $top .= ', 0';
  $top .= ', 0, ';
  $top .= $y_scale || '1';
  $top .= ', ';
  $top .= $x_trans || '0';
  $top .= ', ';
  $top .= $y_trans || '0';
  $top .= ')">' . "\n";
  $top .= "<g id\=\"underlay_context_1\"\/>\n";
  $top .= "<g id\=\"underlay_context_2\"\/>\n";
  $top .= "<g id\=\"underlay_context_3\"\/>\n";
  $top .= "<!-- END modified area -->\n";
  $svg_file =~ s/(\<svg(.*?)\>)/$top/s;

  $self->kvetch('generated $top START');
  $self->kvetch($top);
  $self->kvetch('generated $top END');

  ## Remove the initial transformation the GV wants to use.  NOTE: Not
  ## quite as plastic here--the old and new versions end up giving
  ## different numbers to this initial transform.
  my $init = '';
  $init .= "<!-- CHANGE: removed initial transformation. -->\n";
  $init .= '<g id="graph0" class="graph">';
  $init .= "\n<!-- END modified area -->\n";
  $svg_file =~ s/(\<g id="graph[0-9]" class="graph"(.*?)\>)/$init/s;

  ## Get rid of the big white BG polygon. NOTE: not really conserved
  ## at all between versions of GV, so something pretty general here.
  my $remove_poly_message = '';
  $remove_poly_message .= "<!-- CHANGE: removed annoying white bg poly. -->\n";
  $remove_poly_message .= "<!-- END CHANGE -->\n";
  $svg_file =~ s/(\<polygon fill(.*?)white(.*?)stroke(.*?)white(.*?)points(.*?)\>)/$remove_poly_message/s;

  ## Get rid of the rest of the white polygons. NOTE: there appears to
  ## be a difference with visualize and RG here, so both are covered;
  ## the new seems to be a little different as well.
  my $remove_rest_message =
    "<!-- CHANGE: removed unwanted white poly (1). END -->";
  $svg_file =~ s/(\<polygon style=\"fill\:\#ffffff\;stroke\:\#ffffff\;\"(.*?)\>)/$remove_rest_message/gs;
  $remove_rest_message =
    "<!-- CHANGE: removed unwanted white poly (2). END -->";
  $svg_file =~ s/(\<polygon style=\"fill\:white\;stroke\:white\;\"(.*?)\>)/$remove_rest_message/gs;
  $remove_rest_message =
    "<!-- CHANGE: removed unwanted white poly (new 1). END -->";
  $svg_file =~ s/(\<polygon fill=\"\#ffffff\" stroke=\"\#ffffff"(.*?)\>)/$remove_rest_message/gs;
  $remove_rest_message =
    "<!-- CHANGE: removed unwanted white poly (new 2). END -->";
  $svg_file =~ s/(\<polygon fill=\"white\" stroke=\"white"(.*?)\>)/$remove_rest_message/gs;

  ## Alter those nasty font sizes. NOTE: this is somewhat different
  ## between old and new GV, so let's be careful here.
  $svg_file =~ s/(font\-size\:\d+)\.00\;/$1px\;/gs; # old font-size:10.00;
  $svg_file =~ s/(font\-size\=\"\d+)\.00"/$1px\"/gs; # new font-size="10.00"

  ## Try and get the new font-family as the nicer old one.  TODO:
  ## could this be in the GV args? It looks like new repects the
  ## global style (unlike old).
  $svg_file =~
    s/font\-family\=\"Times Roman,serif\"/font\-family\=\"Times New Roman\"/gs;

  ## Replace bottom.
  ## Changed this because of the removal of the second graph group above.
  my $bottom = '';
  $bottom .= '<!-- BEGIN modified area bottom -->';
  $bottom .= '<g id="overlay_context"></g>';
  $bottom .= '</g>';
  $bottom .= '<g id="control_context"></g>';
  $bottom .= '<g id="detail_context"></g>';
  $bottom .= '<g id="super_context"></g>';
  $bottom .= '</svg>';
  $bottom .= '<!-- END modified area -->';
  $svg_file =~ s/(\<\/svg>)/$bottom/s;

  #$self->kvetch('_6_time: ' . tv_interval($t));
  #sleep 2;

  return $svg_file;
}


1;
