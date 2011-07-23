#!/usr/bin/perl -w
####
#### Run this after installation or after a DB update.
#### Usage:
####    reset; time perl ./refresh.pl
####
#### Note: Test::WWW::Mechanize::CGIApp seems very handy for
#### auto-testing...but in this case, we're just stealing some of the
#### mechanism to get our data without depending on silly ol' apache.
####
#### Note: To cut down on the testing time, pare out most homolsets:
####    mysql> delete from homolset where id > 1;
####    mysql> delete from gene_product_homolset where homolset_id > 1;
####

BEGIN { require "config.pl"; }
use lib $ENV{GO_DEV_ROOT} . '/go-perl';
use lib $ENV{GO_DEV_ROOT} . '/go-db-perl';
use lib $ENV{GO_DEV_ROOT} . '/amigo/perl';
use lib $ENV{GOBO_ROOT};

## Bring in necessaries.
use utf8;
use strict;
use Data::Dumper;
use Test::More qw(no_plan);
#use Test::More;
use Test::WWW::Mechanize::CGIApp;
use AmiGO::WebApp::HTMLClient;
use Getopt::Std;
#use File::Path qw(remove_tree);
use File::Path; # old versions don't have this
use File::Find;
use File::stat;
#use Time::Local;
use Time::localtime;
use File::Temp qw(tempfile);

#BEGIN { plan tests => 0; }

use vars qw(
	     $opt_h
	     $opt_r
	     $opt_c
	     $opt_s
	     $opt_g
	     $opt_p
	     $opt_q
	     $opt_l
	  );

## Setup.
getopts('hrcsgpql');
my $core = AmiGO->new();
my @errors = ();

## Embedded help through perldoc.
if( $opt_h ){
  system('perldoc', __FILE__);
  exit 0;
}

## Take care of arguments.
my $be_chatty = 1;
my $do_remove = 0;
my $do_cache = 0;
my $do_summary = 0;
my $do_svg = 0;
my $do_png = 0;
my $do_lucene = 0;
if ( $opt_r ){ $do_remove = 1; }
if ( $opt_c ){ $do_cache = 1; }
if ( $opt_s ){ $do_summary = 1; }
if ( $opt_g ){ $do_svg = 1; }
if ( $opt_p ){ $do_png = 1; }
if ( $opt_q ){ $be_chatty = 0; }
if ( $opt_l ){ $do_lucene = 1; }

## Nothing at all? Then do everything.
if ( ! $opt_r &&
     ! $opt_c &&
     ! $opt_s &&
     ! $opt_g &&
     ! $opt_p &&
     ! $opt_l ){
  $do_remove = 1;
  $do_cache = 1;
  $do_summary = 1;
  $do_svg = 1;
  $do_png = 1;
  $do_lucene = 1;
}

###
### Remove old files, do general cleaning as much as possible. Out of
### necessity, this cannot include the lucene indexes and the speed
### caches, which are handled separately below. All generic cleaning
### can/should be handled here.
###

if( $do_remove ){

  ll("Starting general cleaning, please wait...") if $be_chatty;


  ## Function to decide if the file or diectory has reached its
  ## lifespan limit. Wired to one day (see variable below).
  sub lifespan {

    my $file = shift || die "need a file argument...";
    my $retval = 0;

    ## One day in seconds
    #my $lifespan_limit_one_day = 1; # for debug
    my $lifespan_limit_one_day = 86400;

    ## Calc. time.
    my $now = time;
    my $mtime = stat($file)->mtime;
    my $tdiff = $now - $mtime;

    if( $tdiff >= $lifespan_limit_one_day ){
      $retval = 1;
    }

    return $retval;
  }

  ## Scrub out the generated images, maps, and directories (?!).
  sub temp_images{
    if( (/\.png$/ || /\.gif$/ || /\.map$/ ) && lifespan($File::Find::name) ){
      unlink $File::Find::name;
    }elsif( /amigo/ && -d && lifespan($File::Find::name) ){
      #remove_tree($File::Find::name, {safe => 1});
      #rmtree($File::Find::name, {safe => 1});
      rmtree($File::Find::name);
    }
  }
  finddepth(\&temp_images, ($core->amigo_env('AMIGO_TEMP_IMAGE_DIR')));
  ll("Finished removing generated images.");

  ## Scrub out new session files.
  sub new_sessions{
    if( /^cgisess_/ && lifespan($File::Find::name) ){
      unlink $File::Find::name;
    }
  }
  finddepth(\&new_sessions, ($core->amigo_env('AMIGO_SESSIONS_ROOT_DIR')));
  ll("Finished removing new session files.");

  ## Scrub out old session files.
  sub old_sessions{
    if( /_data$/ && lifespan($File::Find::name) ){
      #remove_tree($File::Find::name, {safe => 1});
      #rmtree($File::Find::name, {safe => 1});
      rmtree($File::Find::name);
    }
  }
  finddepth(\&old_sessions, ($core->amigo_env('AMIGO_SESSIONS_ROOT_DIR')));
  ll("Finished removing old session files.");

  ## Scrub out anything hanging out in scratch.
  #sub itch_scratch{
  #remove_tree($core->amigo_env('AMIGO_SCRATCH_DIR'),
  rmtree($core->amigo_env('AMIGO_SCRATCH_DIR'),
	 #{safe => 1, keep_root => 1} );
	 {keep_root => 1} );
  #}
  ll("Finished cleaning scratch directory.");

  reinit_caches();

  ll("Finished general cleaning.");
}

###
### Update old cache files and catch cruft where possible.
###

if( $do_cache ){

  ll("Making cache files, please wait...");

  make_spec();

  make_misc();

  make_dblinks();

  make_go_meta_js();

  reinit_caches();

  ll("Finished refreshing cache files.");
}

###
### Update RG SVG/PNG graphs...
###

my @formats = ();
push @formats, 'svg' if $do_svg;
push @formats, 'png' if $do_png;
if( scalar(@formats) ){

  $core->kvetch("Making graph images, please wait...");

  foreach my $format (@formats){

    my $hs_q = GOBO::DBIC::GODBModel::Query->new({type=>'homolset'});
    my $all_hs = $hs_q->get_all_results();
    $core->kvetch("Snagged a total of " . scalar(@$all_hs) . " homolsets.");
    foreach my $hs (@$all_hs){

      my $set = $hs->id;

      my $fname_no_cache = $core->get_interlink({mode=>'homolset_graph',
						 arg=>{set=>$set,
						       cache=>'no',
						       format=>$format}});
      my $url_no_cache = $core->amigo_env('CGI_URL') . '/' . $fname_no_cache;

      $core->kvetch("Will try: \"$url_no_cache\"");

      ## Get it internally instead of externally.
      my $mech = Test::WWW::Mechanize::CGIApp->new();
      $mech->app("AmiGO::WebApp::HTMLClient");
      $mech->get_ok($fname_no_cache);

      if ( ! $mech->success() ){
	$core->kvetch("Failed with \"$url_no_cache\"");
	push @errors, "ERRORS: $fname_no_cache (" .
	  $mech->response->status_line . ") ... [$!]";
      }else{

	my $output = $mech->content();

	## Output to output dir.
	my $fname = $core->get_interlink({mode=>'homolset_graph',
					  arg=>{set=>$set,
						format=>$format}});
	my $out_fname = $core->amigo_env('PRE_RENDER_DIR') . '/' . $fname;
	open(FILE, "> $out_fname")
	  || die "Couldn't open output file: " . $out_fname;
	print FILE $output;
	close FILE;

	$core->kvetch("Wrote to: \"$out_fname\"");
      }
    }
  }
}

###
### Update RG summary page...
###

if( $do_summary ){

  $core->kvetch("Making RG summary, please wait...");

  my $summary_try_link = $core->get_interlink({mode=>'homolset_summary',
					       arg=>{cache=>'no'}});
  my $try_url = $core->amigo_env('CGI_URL') . '/' . $summary_try_link;

  $core->kvetch("Will try: \"$try_url\"");

  ## Get it internally instead of externally.
  #$mech->get($try_url);
  my $mech = Test::WWW::Mechanize::CGIApp->new();
  $mech->app("AmiGO::WebApp::HTMLClient");
  $mech->get_ok($summary_try_link);

  if ( ! $mech->success() ){
    $core->kvetch("Failed with \"$try_url\"");
    push @errors, "ERRORS: $try_url (" .
      $mech->response->status_line . ") ... [$!]";
  }else{

    my $output = $mech->content();

    ## Output to output dir.
    my $summary_fname = $core->get_interlink({mode=>'homolset_summary'});
    my $out_fname = $core->amigo_env('PRE_RENDER_DIR') . '/' . $summary_fname;
    open(FILE, "> $out_fname")
      || die "Couldn't open output file: " . $out_fname;
    print FILE $output;
    close FILE;

    #$core->kvetch("\t...got it.");
  }
}

$core->kvetch('Number of errors : ' . scalar(@errors));
foreach my $error (@errors){
  $core->kvetch($error);
}


##
if( $do_lucene ){

  $core->kvetch("Making lucene indexes, please wait...");

  ## Add new indexes; no args needed--from here, luigi knows where to go.
  my @args = ("perl", $core->amigo_env('GO_DEV_ROOT') . "/amigo/scripts/luigi");
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";

  ## Scrub out "old" index files. There is a little vagueness in
  ## figuring out what index files are in use without using
  ## lucene. We'll take the term segement file and remove anything
  ## more than two hours older.
  my $lifespan_limit_two_hours = 7200; # two hours in seconds
  my $term_segfile = $core->amigo_env('INDEX_DIR_TERM') . "/segments";
  my $seg_mtime = stat($term_segfile)->mtime;
  sub old_indexes{
    if( /\.cfs$/ && lifespan($File::Find::name) ){
      my $file_mtime = stat($File::Find::name)->mtime;
      if( ($seg_mtime - $file_mtime) >= $lifespan_limit_two_hours ){
	unlink $File::Find::name;
      }
    }
  }
  find(\&old_indexes,
       ($core->amigo_env('INDEX_DIR_GENERAL'),
	$core->amigo_env('INDEX_DIR_TERM'),
	$core->amigo_env('INDEX_DIR_GENE_PRODUCT')));
  ll("Finished removing old index files.");

  $core->kvetch("Finished indexing.");
}


## If we got here, we're good. To make Test::More happy (no tests with
## no_plan returns an error on some systems), we'll leave with a
## trivial test. Although, we could use this opportunity to drop some
## tests in here at some point...
## Make this testing quiet.
if( ! $be_chatty ){
  my($tmp_fh, $tmp_fn) = tempfile();
  Test::More->builder->output($tmp_fn);
}
ll("Starting testing...");
ok( 1 == 1 );
ll("Exit testing...");

###
### Subs.
###

  ## Species.
sub make_spec {
  my @args = ("perl",
	      $core->amigo_env('GO_DEV_ROOT')."/amigo/scripts/make_spec_key.pl",
	      $core->amigo_env('CGI_ROOT_DIR'), "50");
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
  ll("Finished making spec_key file.");
}


## Misc.
sub make_misc {
  my @args = ("perl",
	      $core->amigo_env('GO_DEV_ROOT')."/amigo/scripts/make_misc_key.pl",
	      $core->amigo_env('CGI_ROOT_DIR'));
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
  ll("Finished making misc_key file.");
}


## Places for the new speed caches and clean out the old ones.
sub reinit_caches {
  my @args = ("perl",
	      $core->amigo_env('GO_DEV_ROOT')."/amigo/scripts/reinit_caches.pl");
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
  ll("Finished removing/initing(?) runtime caches.");
}


## Make db links through the database (cache for bypass of
## NameMunger).
sub make_dblinks {
  my @args = ("perl",
	      $core->amigo_env('GO_DEV_ROOT')."/amigo/scripts/make_dblinks.pl",
	      '-f', $core->amigo_env('CGI_ROOT_DIR'));
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
  ll("Finished making dblinks file.");
}


## Generated JS meta-data.
sub make_go_meta_js {
  my @args =
    ("perl",
     $core->amigo_env('GO_DEV_ROOT') . "/amigo/scripts/make_go_meta_js.pl",
     $core->amigo_env('AMIGO_HTDOCS_ROOT_DIR').'/js/org/bbop/amigo/go_meta.js');
  $core->kvetch("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
  ll("Finished making go_meta JS file.");
}


## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $be_chatty;
  $core->kvetch($str);
}


=head1 NAME

refresh.pl

=head1 SYNOPSIS

refresh.pl [-h] [-r] [-c] [-s] [-g] [-p] [-l]

=head1 DESCRIPTION

This script creates caches for some of the various
subsystems. Required caches are also created during the installation
process (install.pl) using this script (with just the "-c" option).

As a stand-alone, this script is useful for refreshing caches and
taking some of the load off of the processing needed for Reference
Genome subsystems (which probably aren't really necessary for most
installations of AmiGO, but very much necessary for ones that use the
RG as supplied in the GO).

=head1 OPTIONS

Please note that if you don't specify any of the options, they are all
assumed to be on.

=over

=item -r

Perform routine cleaning of working directories. This includes
removing session and files that appear to be too old. This option does
not affect the Lucene indexes and Reference Genome caches.

=item -c

Regenerate the species and other misc. caches that were generated
during the initial AmiGO installation process.

=item -s

Generate (or regenerate) the cache file for the Reference Genome
summary page. For this page to be useful, you will probably have to
run this at some point as the page is very large indeed. May take on
the order of hours to run.

=item -g

Generate (or regenerate) the cache files for all of the Reference
Genome interactive graphs (SVGs). May take on the order of hours to
run.

=item -p

Generate (or regenerate) the cache files for all of the Reference
Genome static graphs (PNGs). May take on the order of hours to run.

=item -l

Regenerate the lucene indexes, as well as attempt to clean out the old
ones. May take on the order of hours to run.

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
