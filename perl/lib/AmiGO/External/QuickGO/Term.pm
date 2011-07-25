=head1 AmiGO::External::QuickGO::Term

Really, just a way to get the page link right now.

=cut


package AmiGO::External::QuickGO::Term;

use base ("AmiGO::External::Raw");
#use AmiGO::KVStore;


=item $URL_FOR_QUICKGO_TERM

This is the URL that points to the QuickGO services API.

=cut
my $URL_FOR_QUICKGO_TERM =
  'http://www.ebi.ac.uk/ego/DisplayGoTerm?id=';

=item new

#

=cut
sub new {
  my $class = shift;
  my $self  = $class->SUPER::new();
  bless $self, $class;
  return $self;
}


=item get_term_link

...

=cut
sub get_term_link {

  ##
  my $self = shift;
  my $acc = shift || die "acc required $!";
  my $url = $URL_FOR_QUICKGO_TERM . $acc;
  return $url;
}


=item try

Does nothing here...

=cut
sub try {
  my $self = shift;
  return 1;
}



1;
