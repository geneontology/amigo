=head1 AmiGO::External::HTML::Wiki

Base

Could be directly used, but see the subclasses.

=cut

use utf8;
use strict;

package AmiGO::External::HTML::Wiki;

use base ("AmiGO::External::HTML");


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  my $wiki_url = shift || die "need to supply a URL";
  #my $wiki_parser = shift || die "need to supply a parser for the page";

  $self->get_external_data($wiki_url);
  #$self->{AEHW_PARSER} = $wiki_parser;

  bless $self, $class;
  return $self;
}


=item extract

A methid to get the data out of EXT_DATA.

=cut
sub extract { die "must override extract method in subclass $!"; }


=item try

Unnecessary as this resource is single.

=cut
sub try { 1; }



1;
