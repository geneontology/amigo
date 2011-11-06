=head1 AmiGO::GraphViz

A GraphViz setup just for AmiGO.

=cut

package AmiGO::GraphViz;

use base 'AmiGO';
use utf8;
use strict;
#use Utility::GraphViz;
use GraphViz;
use AmiGO::Aid;


=item new


=cut
sub new {

  ##
  my $class = shift;
  my $arg_hash = shift || {};
  my $self  = $class->SUPER::new();

  #my $session = shift || undef;
  my $bitmap = $arg_hash->{bitmap} || 0;
  my $fontsize = $arg_hash->{fontsize} || 10;

  ## Prettiness.
  $self->{PRETTY} = AmiGO::Aid->new();

  ## Build display graph.
  if( $bitmap ){
    $self->{GV} = GraphViz->new({
				 rankdir => 0,
				 # nodesep=>0.001,
				 # ranksep=>0.001,
				 # mclimit=>0.1,
				 directed => 1,
				 node => {
					  shape => 'plaintext',
					  color => 'black',
					  style => 'filled',
					  fontsize => $fontsize,
					  #fontsize => '10px',
					  fillcolor => 'white',
					  #fontcolor => 'blue',
					  fontcolor => 'black',
					 },
				 edge => {
					  fontsize => $fontsize,
					 }
				});
  }else{
    $self->{GV} = GraphViz->new({
				 width => 12,
				 height => 8,
				 rankdir => 0,
				 directed => 1,
				 node => {
					  shape => 'plaintext',
					  color => 'black',
					  style => 'filled',
					  fontsize => $fontsize,
					  #fontsize => '10px',
					  fillcolor => 'white',
					  #fontcolor => 'blue',
					  fontcolor => 'black',
					  #fontname => 'Times Roman,serif',
					  #fontname => 'monospace',
					 },
				 edge => {
					  fontsize => $fontsize,
					 }
				});
  }

  ## Hidden internal meta-information produced when generating
  ## images. Hopefully constent. TODO: check!
  $self->{GV_INTERNAL_TEXT} = undef;

  bless $self, $class;
  return $self;
}


=item add_stacked_node

Adds a schema node to the graph. Should really only be used for
specific ref genome stuff.

=cut
sub add_stacked_node {

  my $self = shift;
  my $node = shift || undef;
  my $in_stack = shift || [];
  my $acc = $node->acc;
  my $name = $node->name;

  $self->kvetch("\tGV::glyph acc: " . $acc);

  #my $wnum = 12;
  my $wnum = 20; # TODO: this protection no longer needed?

  ## BUG: Word wrap works on smaller graphs, but causes GV to explode
  ## on larger ones. Haven't found a work-around yet. I think that it
  ## might be the <br /> period.

  ## Simple word wrap: go $wnum letters, then put in a <br /> at the
  ## first ws that we run into.
  ## First, see if we even need to be adding wrap.
#   my @name_stack = ();
#   my $number_of_times_wrapped = 0;
#   if( length($name) >= $wnum && $name =~ /\s/){

#     my @word_list = split / /, $name;

#     my $current_sum = 0;
#     foreach my $n (@word_list){
#       $current_sum += length($n);
#       if( $current_sum >= $wnum ){
# 	push @name_stack, $n;
# 	push @name_stack, '<br />';
# 	$number_of_times_wrapped++;
# 	$current_sum = 0;
#       }else{
# 	push @name_stack, $n;
# 	push @name_stack, ' ';
#       }
#     }
#     pop @name_stack; # whatever the last thing was, we didn't need it.
#     $name = join '', @name_stack;
#   }

  ## Maybe shortening works instead?
  ## BUG: in this case, a total length > 13 causes failure
  ## THERE ARE *SO* MANY GV bugs...
  $name = _name_wrap($name, $wnum);

  ## BUG: This does not seem to be mine. It looks like perl graphviz
  ## barfs if there are too many rows in the table. We'll tune this
  ## out for now. I've experimentally found the limit (21 sends things
  ## around the bend for some graphs).
  #my $limit = 20 - $number_of_times_wrapped; # BUG COVER
  #my $limit = 19; # BUG COVER
  my $limit = 50; # BUG COVER -- TODO: no longer needed?
  my $too_much = 0;# BUG COVER
  if( @$in_stack > $limit ){# BUG COVER
    $too_much = 1;# BUG COVER
  }# BUG COVER
  my $i = 1;# BUG COVER
  my @mbuf = ();
  foreach my $item (@$in_stack){

    ## BUG: again GV's...what is going on here?
    #$self->kvetch("\t\tcolor: " . $item->{color});
    #$self->kvetch("\t\t^^^^^: problem: " . $item->{color})
    #  if ! ($item->{color} =~ /^\#[0-9ABCDEF]{6}$/);

    ## BUG: Found it. GV. Again. C'MON! Why is this so hard?!
    if ( 1 == 1 ){
      push @mbuf, '<TR>';
      push @mbuf, '<TD ALIGN="LEFT" BALIGN="LEFT">';
    }elsif ( 1 == 2 ){
      if( $item->{direct_p} > 0 ){
	push @mbuf, '<TR BGCOLOR="#000000">';
	push @mbuf, '<TD BGCOLOR="#000000">';
      }else{
	push @mbuf, '<TR>';
	push @mbuf, '<TD>';
      }
    }else{
      push @mbuf, '<TR BGCOLOR="';
      push @mbuf, $item->{color};
      push @mbuf, '">';
      push @mbuf, '<TD BGCOLOR="';
      push @mbuf, $item->{color};
      push @mbuf, '">';
    }
    push @mbuf, '<FONT COLOR="blue">' if $item->{direct_p} > 0;
    push @mbuf, $item->{name};
    push @mbuf, '</FONT>' if $item->{direct_p} > 0;
    push @mbuf, ' (';
    push @mbuf, $item->{gp_symbol};

    ## DEBUG
    #if( $item->{gp_symbol} !~ /^[a-zA-Z0-9\.\_]+$/ ){
    #  print STDERR "_X_" . $item->{gp_symbol} . "\n";
    #  sleep 2;
    #}

    push @mbuf, ')';
    #push @mbuf, '<FONT BGCOLOR="green">e</FONT>' if $item->{has_exp_p};
    my @mini_buf = ();
    push @mini_buf, 'E' if $item->{has_exp_p};
    push @mini_buf, 'I' if $item->{has_good_iss_p};
    #push @mini_buf, 'i' if $item->{has_odd_iss_p};
    #my $mini_str = join ' ', @mini_buf;
    my $mini_str = join '', @mini_buf;
    if( length($mini_str) > 0 ){
      $mini_str = ' [' . $mini_str . '] ';
      #$mini_str = ' [' . $mini_str . ']';
      push @mbuf, $mini_str;
    }
    #push @mbuf, ' ‡' if $item->{iss_only_p};
    push @mbuf, '</TD></TR>';
    last if $i >= $limit;# BUG COVER
    $i++;# BUG COVER
  }
  if( $too_much ){# BUG COVER
    push @mbuf, '<TR BGCOLOR="white">';# BUG COVER
    push @mbuf, '<TD BGCOLOR="white">';# BUG COVER
    push @mbuf, 'hover for more info...';# BUG COVER
    push @mbuf, '</TD></TR>';# BUG COVER
  }# BUG COVER

  my $stack_str = join '',  @mbuf;

  #my $label_str = join '', ($acc, ' ', $name);
  #my $label_str = join '', ($acc, '.......');
  #my $label_str = join '', ($acc, '<br />', '....................');
  #my $label_str = join '', ($acc, '<br />', $name, '<br />', '.....');
  my $label_str = join '<br/>', ($acc, $name);

  $self->{GV}->add_node(
			$acc,
			#label => $acc,
			#label => "<<TABLE TOOLTIP=\"$acc\" TITLE=\"$acc\" BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\"><TR><TD>$acc</TD></TR></TABLE>>",
			#label => "<<TABLE TOOLTIP=\"$acc\" TITLE=\"$acc\" BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\" ALIGN=\"right\"><TR><TD>$label_str</TD></TR>$stack_str</TABLE>>",
			#label => "<<TABLE TOOLTIP=\"$acc\" TITLE=\"$acc\" BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\"><TR><TD>$acc</TD></TR>$stack_str</TABLE>>",
			label => "<<TABLE BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\"><TR><TD>$label_str</TD></TR>$stack_str</TABLE>>",
			shape => 'plaintext',

			## TODO: I'd like this in in some way...but it
			## just seems to interfere with the node
			## detail poop-up.
			#URL => 'amigo?mode=term_detail&acc=' . $acc,

			#fontname => 'Courier',
			##fontname => 'monopsace',
			#color => $outline_color,
			#fillcolor => $fill_color,
			#fontcolor => $font_color
		       )
    if $acc;

  #print STDERR "_nodes_" . $acc . "\n";
}


=item add_node

Adds a schema node to the graph.

=cut
sub add_node {

  my $self = shift;
  my $acc = shift || '';
  my $title = shift || '';
  my $body = shift || '';
  my $coloration = shift || {};

  my $color = '#000000';
  my $fillcolor = '#ffffff';
  my $fontcolor = '#000000';

  ## Get additional values if extant.
  $color = $coloration->{color}
    if defined $coloration->{color} && $coloration->{color};
  $fillcolor = $coloration->{fillcolor}
    if defined $coloration->{fillcolor} && $coloration->{fillcolor};
  $fontcolor = $coloration->{fontcolor}
    if defined $coloration->{fontcolor} && $coloration->{fontcolor};

  #my $wnum = 12;
  my $wnum = 20; # TODO: this protection no longer needed?
  $body = _name_wrap($body, $wnum);

  my $label_str = join '<br/>', ($title, $body);
  $self->{GV}->add_node($acc,
			 label => "<<TABLE BORDER=\"0\" CELLBORDER=\"1\" CELLSPACING=\"0\"><TR><TD>$label_str</TD></TR></TABLE>>",
			 shape => 'plaintext',
			#fontname => 'Times Roman',
			#fontname => 'monospace',
 			color => $color,
 			fillcolor => $fillcolor,
 			fontcolor => $fontcolor,
			)
    if $acc;

  #print STDERR "_nodes_" . $acc . "\n";
}


=item add_edge

Adds an edge to the graph.

=cut
sub add_edge {

  my $self = shift;
  my $sub_id = shift  || 'unknown_subject';
  my $pred_id = shift || 'unknown_predicate';
  my $obj_id = shift  || 'unknown_object';

  $self->{GV}->add_edge(
			$obj_id => $sub_id,
			#label => $self->{PRETTY}->readable($pred_id),
			color => $self->{PRETTY}->relationship_color($pred_id),
			arrowhead => 'none',
			arrowtail => 'normal',
			style => 'bold'
		       );

  #print STDERR "_edge_ " . $sub_id . ' ' . $pred_id  .  ' ' .  $obj_id . "\n";
}


=item get_svg

Arguments:
Returns: svg text of graph

=cut
sub get_svg {

  my $self = shift;
  my $output = '';

  ## TODO: could this be speeded up with an array buffer.
  $self->{GV}->as_svg(
		      sub {
			$output .= shift
		      }
		     );
  $self->{GV_INTERNAL_TEXT} = $self->get_plain();

  return $output;
}


=item get_dot

Arguments:
Returns: dot text of graph

=cut
sub get_dot {

  my $self = shift;
  my $output = '';

  $self->{GV}->as_canon(
			sub {
			  $output .= shift
			}
		       );
  $self->{GV_INTERNAL_TEXT} = $self->get_plain();

  return $output;
}


=item get_png

Arguments:
Returns: png of graph

=cut
sub get_png {

  my $self = shift;
  my $output = '';

  $self->{GV}->as_png(
			sub {
			  $output .= shift
			}
		       );
  $self->{GV_INTERNAL_TEXT} = $self->get_plain();

  return $output;
}


=item get_plain

Arguments:
Returns: simple text description of graph

=cut
sub get_plain {

  my $self = shift;
  my $output = '';

  $self->{GV}->as_plain(
			sub {
			  $output .= shift
			}
		       );
  $self->{GV_INTERNAL_TEXT} = $output;

  return $output;
}


##
sub label_merge {

  my $tacc = shift || '';
  my $str = "";
  my @mbuf = ();

  #my $gp_hash = $term2gp{$tacc};
  #foreach my $gp_id (keys %$gp_hash){
  #  push @mbuf, $gp_id;
  #}

  $str = join "\n", @mbuf;
  #return $str = "\n" . $str;
  return "\nTODO";
}


# ##
# sub _name_wrap {

#   my $name = shift || '';
#   my $wnum = shift || 20;

#   ## Cut name into length 20 segments.
#   my $tname = $name;
#   my @label_segs = ();
#   my $index = 0;
#   ## with a test to supress substr errors for when out of bounds.
#   while(1){
#     my $seg = '';
#     if( length($tname) >= $index ){
#       $seg = substr($tname, $index, $wnum);
#     }
#     if( length($seg) > 0 ){
#       $index += $wnum;
#       push @label_segs, $seg;
#     }else{
#       last;
#     }
#   }

#   return join '<br />', @label_segs;
# }


##
sub _accumulated_length{
  my $foo = shift || [];
  return length(join ' ', @$foo);
}


##
sub _name_wrap {

  my $name = shift || '';
  my $wnum = shift || 20;

  my @phrases = split ' ', $name;
#   foreach my $p (@phrases){
#     print "___" . $p . "\n";
#   }

  ## As long as we have phrases to break down...
  my @final_phrases = ();
  while( @phrases ){

    my @tmp_phrase_reg = ();
    while( @phrases ){

      my $phrase = shift @phrases;
      my $total_length =
	length($phrase) + _accumulated_length(\@tmp_phrase_reg);

      if( $total_length > $wnum && $#tmp_phrase_reg >= 0 ){
	## Replace and break (so we can accumulate).
	unshift @phrases, $phrase;
#	print "case 1: replace \"$phrase\"\n";
	last;
      }elsif( $total_length > $wnum ){
	## 
	my $first_part = substr($phrase, 0, $wnum);
	push @tmp_phrase_reg, $first_part;
	##
	my $second_part = substr($phrase, $wnum + 1);
	unshift @phrases, $second_part;
#	print "case 2: push \"" . $first_part .
#	  "\", replace \"" . $second_part . "\"\n";
      }else{
	push @tmp_phrase_reg, $phrase;
#	print "case 3: push \"$phrase\"\n";
      }
    }

    push @final_phrases, join(' ', @tmp_phrase_reg);
    @tmp_phrase_reg = ();
  }

  return join '<br />', @final_phrases;
}



1;
