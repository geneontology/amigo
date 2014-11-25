=head1 AmiGO::CSS

A library to help integrate Workers that depend on various CSS.

=cut

package AmiGO::CSS;

use base 'AmiGO';
use utf8;
use strict;
use Data::Dumper;


## For CSS for use with JS.
my $uicss2path =
  {
   'org.bbop.amigo.ui.autocomplete' =>
   'org/bbop/amigo/ui/css/autocomplete.css',

   'org.bbop.amigo.ui.standard' =>
   'org/bbop/amigo/ui/css/standard.css',

   'org.bbop.amigo.ui.widgets' =>
   'org/bbop/amigo/ui/css/widgets.css',

   ## jQuery's stuff in a strange place.
   'com.jquery.redmond.custom' =>
   'com/jquery/css/redmond/jquery-ui-1.7.1.custom.css',
   'com.jquery.jqamigo.custom' =>
   'com/jquery/css/jqamigo-1.10.3/jquery-ui-1.10.3.custom.min.css',
   #'com/jquery/css/jqamigo-1.8.23/jquery-ui-1.8.23.custom.css',
   #'com/jquery/css/jqamigo-1.8.13/jquery-ui-1.8.13.custom.css',
   #'com/jquery/css/jqamigo/jquery-ui-1.8rc3.custom.css',
   'com.jquery.tablesorter' =>
   'com/jquery/css/tablesorter/style.css',

   ##
   'com.ext.resources.ext-all' =>
   'com/ext/resources/css/ext-all.css',

   ##
   'com.jstree' =>
   'com/jstree/style.min.css',
  };

## For independant CSS.
my $css2path =
  {
   ## Bootstrap.
   'com.bootstrap' =>
   'bootstrap.min.css',
   'com.bootstrap-theme' =>
   'bootstrap-theme.min.css',

   ## BBOP.
   'bbop' =>
   'bbop.css',

   ## AmiGO.
   'amigo' =>
   'amigo.css',

   ## Use this:
   'standard' =>
   'formatting.css',

   ## TODO: Deprecated:
   'formatting' =>
   'formatting.css',

   'GONavi' =>
   'GONavi.css',
  };

## For generated/dynamic CSS. Not actually a map, just a name to let
## us know it's there.
my $dyncss2path =
  {
   'dynamic' =>
   'dynamic',
  };


=item new

Args: bool--whether or not to use xlink to define URLs.
Returns: a CSS object that "knows" about locations and structure.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  $self->{USE_XLINK} = shift || 0;

  ## We'll borrow SUCCESS and ERROR_MESSAGE from AmiGO.

  bless $self, $class;
  return $self;
}


=item get_css

Args: the signifier for a css lib.
Returns: a css line for html

NOTE: done separately from the JS so as to make it easier for
end-users to override with their own styles.

=cut
sub get_css {

  my $self = shift;
  my $sig = shift || '';

  my @mbuf = ();
  if( $self->{USE_XLINK} ){
    push @mbuf, '<link rel="stylesheet" type="text/css" xlink:src="'
  }else{
    push @mbuf, '<link rel="stylesheet" type="text/css" href="'
  }

  ## Check JS w/CSS registery first, then try the standalone
  ## registry. Otherwise, hope the transformations goes well...
  if( $uicss2path->{$sig} ){
    push @mbuf, $self->amigo_env('AMIGO_JS_URL') . '/';
    push @mbuf, $uicss2path->{$sig};
  }elsif( $css2path->{$sig} ){
    push @mbuf, $self->amigo_env('AMIGO_CSS_URL') . '/';
    push @mbuf, $css2path->{$sig};
  }elsif( $dyncss2path->{$sig} ){
    ## A little more complicated since we're going to ask the cgi
    ## part.
    push @mbuf, $self->get_interlink({mode=>'style',
				      optional=>{full=>1},
				      arg=>{}})
  }else{
    push @mbuf, $self->amigo_env('AMIGO_CSS_URL') . '/';
    $sig =~ s/\./\//gs;
    $sig .= '.css';
    push @mbuf, $sig;
  }

  push @mbuf, '">';
  push @mbuf, "\n";

  return join '', @mbuf;
}



1;
