=head1 AmiGO::External::HTML::SQLWiki

Defines a specific interface to contact the GO SQL examples page.

Usage:
use AmiGO::External::HTML::SQLWiki;
$x = AmiGO::External::HTML::SQLWiki->new();
print scalar(@{$x->extract_sql()});
print ${$x->extract_sql()}[0]->{title};
print ${$x->extract_sql()}[0]->{value};

=cut

use utf8;
use strict;

package AmiGO::External::HTML::SQLWiki;

use base ("AmiGO::External::HTML");
use Date::Format;


=item $URL_FOR_SQLWIKI

This is the URL that points to the GO SQL wiki.

=cut
my $URL_FOR_SQLWIKI = 'http://wiki.geneontology.org/index.php/Example_Queries';
my $MATCH_FOR_SQLWIKI = '<span class=\"mw-headline\" id=\"[\w\s\_\-\:\;\,\.]*\">\s*([^\n]*?)<\/span><\/h[3-4]>.*?<pre>\s*(.*?)<\/pre>';


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  $self->get_external_data($URL_FOR_SQLWIKI);

  bless $self, $class;
  return $self;
}


=item extract_sql

...

=cut
sub extract_sql {

  my $self = shift;
  my $retval = [];

  #$self->kvetch("Extracted: " . $self->{EXT_DATA});

  if( ! defined $self->{EXAMPLES} ){

    my $wikimatch = $self->{MATCH};
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
  }

  return $retval;
}


=item try

Unnecessary as this resource is single.

=cut
sub try { 1; }



1;
