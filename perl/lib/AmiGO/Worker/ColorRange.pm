=head1 AmiGO::Worker::ColorRange

Experimental.
Defined a range and then give back fore and back color sets.

=cut

package AmiGO::Worker::ColorRange;
use base ("AmiGO::Worker");


=item new

Constructor.
Arguments: range low and range high

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();
  $self->{AWCR_LOW} = shift; # || die 'need low number';
  $self->{AWCR_HIGH} = shift; # || die 'need high number';

  bless $self, $class;
  return $self;
}

=item color_set_for

Get the color set for a number.

Args: number
Returns: [fore_color_str, back_color_str]

=cut
sub color_set_for {

  my $self = shift;
  my $num = shift || die 'need a number to function';
  $num = $num * 1.0; # coerce

  ## Get num between 0.0 and <15.99999...
  #$self->kvetch('old num:' . $num);
  $num = ($num - $self->{AWCR_LOW}) / ($self->{AWCR_HIGH} - $self->{AWCR_LOW});
  #$self->kvetch('new num: ' . $num);
  $num = $num * 16.0;
  #$self->kvetch('range num: ' . $num);

  ## Color placement.
  my $color_fill = '#ffffff';
  my $color_font = '#0000ff';
  if( $num < 1.0 ){
    # status quo
  }elsif( $num < 2.0 ){
    $color_fill = '#eeeeee';
  }elsif( $num < 3.0 ){
    $color_fill = '#dddddd';
  }elsif( $num < 4.0 ){
    $color_fill = '#cccccc';
  }elsif( $num < 5.0 ){
    $color_fill = '#bbbbbb';
  }elsif( $num < 6.0 ){
    $color_fill = '#aaaaaa';
  }elsif( $num < 7.0 ){
    $color_fill = '#999999';
  }elsif( $num < 8.0 ){
    $color_fill = '#888888';
  }elsif( $num < 9.0 ){
    $color_fill = '#777777';
  }elsif( $num < 10.0 ){
    $color_fill = '#666666';
  }elsif( $num < 11.0 ){
    $color_fill = '#555555';
    $color_font = '#add8e6';
  }elsif( $num < 12.0 ){
    $color_fill = '#444444';
    $color_font = '#add8e6';
  }elsif( $num < 13.0 ){
    $color_fill = '#333333';
    $color_font = '#add8e6';
  }elsif( $num < 14.0 ){
    $color_fill = '#222222';
    $color_font = '#add8e6';
  }elsif( $num < 15.0 ){
    $color_fill = '#111111';
    $color_font = '#add8e6';
  }else{
    $color_fill = '#000000';
    $color_font = '#add8e6';
  }

  return [$color_font, $color_fill];
}



1;
