=head1 AmiGO::JavaScript

A library to help integrate Workers that depend heavily on JavaScript
(SVG viewers and the like).

For instructions on updating jQuery and jQuery UI, see the README.txt
in geneontology/AmiGO/trunk/javascript/com.

=cut

package AmiGO::JavaScript;

use base 'AmiGO';
use utf8;
use strict;
use Data::Dumper;


## Signifier to path translation.
## TODO: These need to be put into the documentation somewhere.
## Note, these are more or less in order of dependency.
## NOTE: YUI are kept on their severs, so not stored here.
my $sig2path =
  {
   'net.carto.timer' =>
   'net/carto/timer.js',

   'net.carto.button' =>
   'net/carto/button.js',

   'net.carto.checkboxAndRadiobutton' =>
   'net/carto/checkbox_and_radiobutton.js',

   'net.carto.helperFunctions' =>
   'net/carto/helper_functions.js',

   'net.carto.combobox' =>
   'net/carto/combobox.js',

   'net.carto.mappApp' =>
   'net/carto/mapApp.js',

   ## TODO: Two different mootools now, need to figure
   ## out why carto isn't playing well with the newer
   ## one...
   'net.mootools-old' =>
   'net/mootools.v1.11.js',
   'net.mootools' =>
   'net/mootools-1.2.1-core-yc.js',
   'net.mootools-more' =>
   'net/mootools-1.2-more.js',

   ## Introducing Modernizr to help us into HTML5 and friends.
   'com.modernizr' =>
   'com/modernizr-1.0.min.js',

   ## JQuery. I think this is layout 1.2, aimed for 1.3
   ## and 1.7.
   'com.jquery' =>
   'com/jquery-1.8.0.min.js',
   #'com/jquery-1.8.0.js',
   #'com/jquery-1.5.1.min.js',
   #'com/jquery-1.6.1.min.js',
   #'com/jquery-1.4.2.min.js',
   #'com/jquery-1.4.2.js',
   #'com/jquery-1.3.2.min.js',

   ## UI plugin; we'll likely be using this a bit.
   'com.jquery-ui' =>
   'com/jquery-ui-1.8.23.custom.min.js',
   #'com/jquery-ui-1.8.13.custom.min.js',

   ## And plugin for trees.
   'com.jquery.jstree' =>
   'com/jquery.jstree.js',

   ## More plugins.
   'com.jquery.treeview'          => 'com/jquery.treeview.js',
   'com.jquery.treeview.async'    => 'com/jquery.treeview.async.js',
   'com.jquery.tablesorter'       => 'com/jquery.tablesorter.min.js',
   'com.jquery.tablesorter.pager' => 'com/jquery.tablesorter.pager.js',

   ## TODO/BUG: temporary newick locations and links. These are not
   ## automatically copied at installation time at this point as they
   ## are kept in SVN, not CVS. This will be taken care of after the
   ## merge.
   'newick.json' =>
   'newick_tree/json2.js',
   'newick.tree' =>
   'newick_tree/NewickTree.js',
   'newick.tree_utils' =>
   'newick_tree/NewickTreeUtils.js',
   'newick.phylo' =>
   'newick_tree/phylo_tree.js',

   ## TODO/BUG: better layout for "external" libs
   'com.raphael' =>
   'external/raphael-min.js',
   'com.raphael.graffle' =>
   'external/graffle.js',

   # ## The graph and tree models.
   # ## TODO/BUG: better layout for "external" libs
   # 'bbop.model' =>
   # 'bbop/model.js',
   # 'bbop.tree' =>
   # 'bbop/tree.js',

   ## Renderers live elsewhere...
   'bbop.graph.render.phylo' =>
   'graph/render/phylo.js',
   ## BUG: These two really have to go.
   'exp' =>
   'graph/render/exp.js',
   'pthr10170' =>
   'graph/render/pthr10170.js',

   ## TODO/BUG: better layout for Ajax-Solr libs
   'as.core.abstractfacetwidget' =>
   'com/github/ajax-solr/core/AbstractFacetWidget.js',
   'as.core.abstractmanager' =>
   'com/github/ajax-solr/core/AbstractManager.js',
   'as.core.abstractspatialwidget' =>
   'com/github/ajax-solr/core/AbstractSpatialWidget.js',
   'as.core.abstractspellcheckwidget' =>
   'com/github/ajax-solr/core/AbstractSpellcheckWidget.js',
   'as.core.abstracttextwidget' =>
   'com/github/ajax-solr/core/AbstractTextWidget.js',
   'as.core.abstractwidget' =>
   'com/github/ajax-solr/core/AbstractWidget.js',
   'as.core.core' =>
   'com/github/ajax-solr/core/Core.js',
   'as.core.parameterhashstore' =>
   'com/github/ajax-solr/core/ParameterHashStore.js',
   'as.core.parameter' =>
   'com/github/ajax-solr/core/Parameter.js',
   'as.core.parameterstore' =>
   'com/github/ajax-solr/core/ParameterStore.js',
   'as.helpers.ajaxsolr.support' =>
   'com/github/ajax-solr/helpers/ajaxsolr.support.js',
   'as.helpers.ajaxsolr.theme' =>
   'com/github/ajax-solr/helpers/ajaxsolr.theme.js',
   'as.helpers.jquery.ajaxsolr.theme' =>
   'com/github/ajax-solr/helpers/jquery/ajaxsolr.theme.js',
   'as.managers.jquery' =>
   'com/github/ajax-solr/managers/Manager.jquery.js',
   'as.widgets.jquery.pagerwidget' =>
   'com/github/ajax-solr/widgets/jquery/PagerWidget.js',

   ## EXT JS.
   'com.ext' =>
   'com/ext.js',
   ## The way it exists.
   'com.ext-core' =>
   'com/ext-core.js',
   'com.ext-all' =>
   'com/ext-all.js',
   ## The way I wish it was.
   'com.ext.core' =>
   'com/ext-core.js',
   'com.ext.all' =>
   'com/ext-all.js',

   ## NOTE/TODO: fairly complicated--let's just used the hosted one
   ## for now...
   #'org.openlayers' =>
   #'org/OpenLayers.js',

   'org.prototype' =>
   'org/prototype-1.6.0.3.js',

   ## Should be pick-up anyways.
   # 'bbop.core' =>
   # 'bbop/core.js',

   # 'bbop.json' =>
   # 'bbop/json.js',

   # 'bbop.logger' =>
   # 'bbop/logger.js',

   # 'bbop.html' =>
   # 'bbop/html.js',

   # 'bbop.go' =>
   # 'bbop/go.js',

   # 'bbop.amigo' =>
   # 'bbop/amigo.js',

   # 'bbop.amigo.workspace' =>
   # 'bbop/amigo/workspace.js',

   # 'bbop.amigo.live_search.term' =>
   # 'bbop/amigo/live_search/term.js',

   # 'bbop.amigo.live_search.gene_product' =>
   # 'bbop/amigo/live_search/gene_product.js',

   # 'bbop.amigo.go_meta' =>
   # 'bbop/amigo/go_meta.js',

   # 'bbop.amigo.opensearch' =>
   # 'bbop/amigo/opensearch.js',

   # 'bbop.amigo.ui.standard' =>
   # 'bbop/amigo/ui/standard.js',

   # 'bbop.amigo.ui.autocomplete' =>
   # 'bbop/amigo/ui/autocomplete.js',

   # 'bbop.amigo.ui.widgets' =>
   # 'bbop/amigo/ui/widgets.js',

   # 'bbop.SVG' =>
   # 'bbop/SVG.js',

   # 'bbop.AffineSVG' =>
   # 'bbop/AffineSVG.js',

   # 'GONavi' =>
   # 'GONavi.js',

   # #'bbop.Viewer' =>
   # #'bbop/Viewer.js',

   # ## If they're in the right place with the right name, they'll be
   # ## picked up anyways.
   # #'RefGenome' =>
   # #'RefGenome.js',
   # #'orb' =>
   # #'orb.js',
  };


=item new

Args: bool--whether or not to use xlink to define URLs.
Returns: a JS object that "knows" about script locations and structure.

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


=item get_lib

Args: the signifier for a lib.
Returns: a script line for html

=cut
sub get_lib {

  my $self = shift;
  my $sig = shift || '';

  my @mbuf = ();
  if( $self->{USE_XLINK} ){
    push @mbuf, '<script type="text/javascript" xlink:href="';
  }else{
    #push @mbuf, '<script type="text/javascript" href="';
    push @mbuf, '<script type="text/javascript" src="';
  }

  ## If it is not in the registry, transform and hope for the best...
  push @mbuf, $self->amigo_env('AMIGO_HTML_URL');
  push @mbuf, '/javascript/';
  my $path = $sig2path->{$sig} ? $sig2path->{$sig} : $sig;
  if( $path =~ /\.js$/ ){
    push @mbuf, $path;
  }else{
    $path =~ s/\./\//gs;
    $path .= '.js';
    push @mbuf, $path;
  }

  push @mbuf, '"></script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item acquire_source

Args: a js lib url
Returns: a script line for html

=cut
sub acquire_source {

  my $self = shift;
  my $source = shift || '';

  my @mbuf = ();
  if( $self->{USE_XLINK} ){
    push @mbuf, '<script type="text/javascript" xlink:href="';
  }else{
    push @mbuf, '<script type="text/javascript" src="';
  }

  push @mbuf, $source;

  push @mbuf, '"></script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item get_yui_libs

Args: TODO
Returns: script line(s)

=cut
sub get_yui_libs {

  my $self = shift;
  my $args = shift || {};

  ## Defaults.
  my $libs = [];
  my $version = '2.7.0';
  my $type = 'min';
  my $use_xlink = 0;

  ## Get the args.
  $libs = $args->{libs} if defined $args->{libs};
  $version = $args->{version} if defined $args->{version};
  $type = $args->{type} if defined $args->{type};

  ## If it's a string, make it an array ref.
  $libs = [$libs] if ref($libs) ne 'ARRAY';

  my @mbuf = ();
  foreach my $lib (@$libs){
    if( defined($lib) && $lib ){
      if( $use_xlink ){
	push @mbuf, '<script type="text/javascript" xlink:href="';
      }else{
	push @mbuf, '<script type="text/javascript" src="';
      }
      push @mbuf, 'http://yui.yahooapis.com/';
      push @mbuf, $version;
      push @mbuf, '/build/';
      push @mbuf, $lib;
      push @mbuf, '/';
      push @mbuf, $lib;
      push @mbuf, '-';
      push @mbuf, $type;
      push @mbuf, '.js';
    }
    push @mbuf, '"></script>';
    push @mbuf, "\n";
  }

  return join '', @mbuf;
}


=item make_js

Args: a perl data scalar.
Returns: a JSONified string.

TODO: Switch to more complete JSON backend once packages reach Ubuntu.

=cut
sub make_js {

  my $self = shift;
  my $perl_var = shift || undef;

  my $retval = '';
  ## Pass the recursive buck...mine is better at simple things--the
  ## real one seems to require a ref.
  if( ref($perl_var) eq "HASH" ||
      ref($perl_var) eq "ARRAY" ){
    ## Try the new version, if not, use the old version.
    eval{
      $retval = $self->{JSON}->encode($perl_var);
    };
    # if ($@) {
    #    $retval = $self->{JSON}->to_json($perl_var);
    # }
  }else{
    $retval = _emit_scalar($perl_var);
  }

  return $retval;
}


=item make_var

Args: a perl data scalar and name.
Returns: a JSONified var string.

TODO: Switch to more complete JSON backend once packages reach Ubuntu.

=cut
sub make_var {

  my $self = shift;
  my $variable_name = shift || 'unknown_var';
  my $perl_var = shift || undef;

  my @mbuf = ();
  push @mbuf, '<script type="text/javascript">';
  #push @mbuf, "\n<!--//--><![CDATA[//><!--\n";
  push @mbuf, 'var ';
  push @mbuf, $variable_name;
  push @mbuf, ' = ';

  ## It looks like we'll have to take out newlines as JS in HTML can
  ## interpret them badly.
  my $conv_var = $self->make_js($perl_var);
  $conv_var =~ s/\n+//g;
  push @mbuf, $conv_var;

  push @mbuf, ';';
  #push @mbuf, "\n//--><!]]>\n";
  push @mbuf, '</script>';
  push @mbuf, "\n";
  return join '', @mbuf;
}


##
sub _emit_scalar {

  my $scalar = shift || undef;

  my @mbuf = ();

  ## Right now, we're mostly interested in scalars and hash pointers.
  if( ! $scalar ){

    ## Nothingness.
    push @mbuf, 'null';

  }elsif( ref($scalar) eq 'HASH' ){

    ## Examine the hash and descend.
    push @mbuf, rec_des_on_hash($scalar);

  }else{

    ## Typical.
    push @mbuf, '"';
    push @mbuf, $scalar;
    push @mbuf, '"';
  }

  return join '', @mbuf;
}


##
sub rec_des_on_hash {

  my $hash = shift || undef;

  my @mbuf = ();
  push @mbuf, '{';
  if( $hash && %$hash && keys %{$hash} ){
    foreach my $key (keys %{$hash}){
      push @mbuf, '"';
      push @mbuf, $key;
      push @mbuf, '":';
      push @mbuf, _emit_scalar($hash->{$key});
      push @mbuf, ',';
    }
    pop @mbuf;
  }

  push @mbuf, '}';
  return join '', @mbuf;
}


=item initializer

Args: the signifier for a lib.
Returns: a URL

NOTE: for mootools...which we no longer use. Try jquery instead.

=cut
sub initializer {

  my $self = shift;
  my $f_string = shift || "alert('no initializer function found');";
  #my $rest = 

  my @mbuf = ();
  push @mbuf, '<script type="text/javascript">';
  #push @mbuf, "\n<!--//--><![CDATA[//><!--\n";
  push @mbuf, "window.addEvent(\'load\', function() { ";
  #push @mbuf, "window.addEvent(\'domready\', function() { ";
  push @mbuf, $f_string;
  push @mbuf, ' });';
  #push @mbuf, "\n//--><!]]>\n";
  push @mbuf, '</script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item initializer_jquery

Args: the signifier for a lib.
Returns: a URL

NOTE: for jquery...

=cut
sub initializer_jquery {

  my $self = shift;
  my $f_string = shift || "alert('no initializer function found');";
  #my $rest = 

  my @mbuf = ();
  push @mbuf, '<script type="text/javascript">';
  #push @mbuf, "\n<!--//--><![CDATA[//><!--\n";
  push @mbuf, 'jQuery(document).ready(function(){ ';
  push @mbuf, $f_string;
  push @mbuf, ' });';
  #push @mbuf, "\n//--><!]]>\n";
  push @mbuf, '</script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item initializer_ext

Args: the signifier for a lib.
Returns: a URL

NOTE: for ext...

=cut
sub initializer_ext {

  my $self = shift;
  my $f_string = shift || "alert('no initializer function found');";
  #my $rest = 

  my @mbuf = ();
  push @mbuf, '<script type="text/javascript">';
  #push @mbuf, "\n<!--//--><![CDATA[//><!--\n";
  push @mbuf, "Ext.onReady(function(){ ";
  push @mbuf, $f_string;
  push @mbuf, ' });';
  #push @mbuf, "\n//--><!]]>\n";
  push @mbuf, '</script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item initializer_yui

Args: the signifier for a lib.
Returns: a URL

NOTE: for yui...

=cut
sub initializer_yui {

  my $self = shift;
  my $f_string = shift || "alert('no initializer function found');";
  #my $rest = 

  my @mbuf = ();
  push @mbuf, '<script type="text/javascript">';
  #push @mbuf, "\n<!--//--><![CDATA[//><!--\n";
  push @mbuf, "YAHOO.util.Event.onDOMReady(function(){ ";
  push @mbuf, $f_string;
  push @mbuf, ' });';
  #push @mbuf, "\n//--><!]]>\n";
  push @mbuf, '</script>';
  push @mbuf, "\n";

  return join '', @mbuf;
}


=item parse_json_data

Arg: a json hash string of terms and their hashed data
Return: perl object of the same structure.

The json/perl structure associates a single scalar value with a single
term. The dev can figure out what evil to do with it...

NOTE:  JSON errors will silently pass into empty data.

=cut
sub parse_json_data {

  my $self = shift;
  my $in_str = shift || '{}';

  #$self->kvetch("AmiGO::JavaScript::parse_json_data in_str: " . $in_str);

  ## This means that errors will silently pass into empty data.
  my $perl_struct = {};
  eval {
    #$perl_struct = $self->{JSON}->decode_json($in_str);
    $perl_struct = $self->{JSON}->decode($in_str);
  };
  if($@){
    $self->kvetch("AmiGO::JavaScript::parse_json_data - ERROR: " . $@);
  }

  return $perl_struct;
}


=item parse_json_file

Arg: a path to a file containing JSON
Return: perl object of the same structure.

NOTE:  JSON errors will silently pass into empty data.

=cut
sub parse_json_file {

  my $self = shift;
  my $in_file = shift || die "need a file argument: $!";
  my $retval = undef;

  if( -f $in_file ){

    ## Get string as fast as possible.
    my $json_str = '';
    {
      local $/ = undef;
      open FILE, $in_file or die "Couldn't open file: $!";
      $json_str = <FILE>;
      close FILE;
    }

    ## Squeeze out JS if possible.
    $retval = $self->parse_json_data($json_str);
  }

  return $retval;
}


=item parse_json_viz_data

Arg: a json hash string of terms and their hashed data
Return: perl object of the same structure.

The json/perl structure associates a single scalar value with a single
term. The dev can figure out what evil to do with it...

Specializes on GV data (does some constraints).

NOTE:  JSON errors will silently pass into empty data.

=cut
sub parse_json_viz_data {

  my $self = shift;
  my $in_str = shift || '{}';

  #$self->kvetch("_1_" . $in_str);

  ## This means that errors will silently pass into empty data.
  my $perl_struct = {};
  eval {
    $perl_struct = $self->{JSON}->decode($in_str);
  };

  ## Data check: ID and scalar.
  my $regexp = $self->term_regexp_string();
  my $clean_perl_struct = {};
  foreach my $gid (keys %$perl_struct){
    if( $gid =~ /$regexp/ ){
        #$self->kvetch("_2_" . $gid);
      $clean_perl_struct->{$gid} = $perl_struct->{$gid};
    }
  }

  return $clean_perl_struct;
}



1;
