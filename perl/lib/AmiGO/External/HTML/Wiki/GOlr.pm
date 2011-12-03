=head1 AmiGO::External::HTML::Wiki::GOlr

Defines a specific interface to contact the GO SQL examples page.

Usage:
use AmiGO::External::HTML::Wiki::GOlr;
$x = AmiGO::External::HTML::Wiki::GOlr->new();
print scalar(@{$x->extract_sql()});
print ${$x->extract()}[0]->{title};
print ${$x->extract()}[0]->{value};

=cut

use utf8;
use strict;
use Data::Dumper;

package AmiGO::External::HTML::Wiki::GOlr;

use base ("AmiGO::External::HTML::Wiki");


=item $URL_FOR_GOLRWIKI

This is the URL that points to the GO GOlr wiki.

=cut
my $URL_FOR_GOLRWIKI =
  'http://wiki.geneontology.org/index.php/Example_Solr_Queries';
my $MATCH_FOR_GOLRWIKI = '<span class=\"mw-headline\" id=\"[\w\s\_\-\:\;\,\.]*\">\s*([^\n]*?)<\/span><\/h[2-4]>.*?<p>GOOSE.*?<\/p>.*?<pre>\s*(.*?)<\/pre>';


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new($URL_FOR_GOLRWIKI);
  bless $self, $class;
  return $self;
}


=item extract

...

=cut
sub extract {

  my $self = shift;
  my $retval = [];

  #$self->kvetch("Extracted: " . $self->{EXT_DATA});
  #$self->kvetch("Have: " . ref(\%examples));
  #$self->kvetch("Have: " . scalar(keys(%examples)));

  my %examples = $self->{EXT_DATA} =~ /$MATCH_FOR_GOLRWIKI/gs;
  foreach my $title (sort keys %examples){

    #$self->kvetch('pre: ' . $examples{$title});

    ## Transform any problem causing characters.
    my $munched = $examples{$title};
    #$munched =~ s/ +/ /g;
    #$munched =~ s/\n/\\n/g;
    #$munched =~ s/\t/\\t/g;
    #$munched =~ s/"/\&quote\;/g; # works
    #$munched =~ s/"/'/g; # works
    $munched =~ s/"/\"/g;

    #$self->kvetch('post: ' . $examples{$title});

    push @$retval,
      {
       title => $title || 'nil',
       solr => $munched || 'nil',
      };
  }

  return $retval;
}



1;
