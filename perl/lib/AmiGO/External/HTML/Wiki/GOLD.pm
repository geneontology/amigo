=head1 AmiGO::External::HTML::Wiki::GOLD

Defines a specific interface to contact the GO SQL examples page.

Usage:
use AmiGO::External::HTML::Wiki::GOLD;
$x = AmiGO::External::HTML::Wiki::GOLD->new();
print scalar(@{$x->extract_sql()});
print ${$x->extract()}[0]->{title};
print ${$x->extract()}[0]->{value};

=cut

use utf8;
use strict;

package AmiGO::External::HTML::Wiki::GOLD;

use base ("AmiGO::External::HTML::Wiki");


=item $URL_FOR_SQLWIKI

This is the URL that points to the GO SQL wiki.

=cut
my $URL_FOR_SQLWIKI = 'http://wiki.geneontology.org/index.php/Example_GOLD_Queries';
my $MATCH_FOR_SQLWIKI = '<span class=\"mw-headline\" id=\"[\w\s\_\-\:\;\,\.]*\">\s*([^\n]*?)<\/span><\/h[3-4]>.*?<pre>\s*(.*?)<\/pre>';


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new($URL_FOR_SQLWIKI);

  bless $self, $class;
  return $self;
}


=item extract

...

=cut
sub extract {

  # my $self = shift;
  # return $self->{AEHW_PARSER}->($self->{EXT_DATA});
  my $self = shift;
  #my $data = shift || die "need a data argument";
  my $retval = [];

  #$self->kvetch("Extracted: " . $data);

  my %examples = $self->{EXT_DATA} =~ /$MATCH_FOR_SQLWIKI/gs;
  foreach my $title (sort keys %examples){

    #$self->kvetch("Extracted: " . $self->{EXT_DATA});

    ## Transform any problem causing characters.
    my $munched = $examples{$title};
    #$munched =~ s/ +/ /g;
    #$munched =~ s/\n/\\n/g;
    $munched =~ s/\t/\\t/g;
    $munched =~ tr/"/\"/;

    push @$retval,
      {
       title => $title,
       sql => $munched,
      };
  }

  return $retval;
}



1;
