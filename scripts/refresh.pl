#!/usr/bin/perl -w
####
#### Run this periodically tp get rid of old cached files and
#### sessions.
####
####  Usage: reset; time perl ./refresh.pl
####

BEGIN {
  ## Try and find our env config file.
  if( -f "./config.pl" ){
    require "./config.pl";
  }elsif( -f "./conf/config.pl" ){
    require "./conf/config.pl";
  }elsif( -f "../conf/config.pl" ){
    require "../conf/config.pl";
  }else{
    die "unable to find config.pl";
  }
}
use lib $ENV{AMIGO_ROOT} . '/perl/lib';

## Bring in necessaries.
use utf8;
use strict;
use Data::Dumper;
#use AmiGO::WebApp::HTMLClient;
use Getopt::Std;
#use File::Path qw(remove_tree);
use File::Path; # old versions don't have this
use File::Find;
use File::stat;
#use Time::Local;
use Time::localtime;
use File::Temp qw(tempfile);
use AmiGO::KVStore;
use AmiGO::KVStore::Filesystem;

my $core = AmiGO->new();

## Setup.
use vars qw(
	     $opt_h
	     $opt_v
	     $opt_s
	     $opt_c
	     $opt_r
	     $opt_x
	  );
getopts('hvscrx');

## Embedded help through perldoc.
if( $opt_h ){
  system('perldoc', __FILE__);
  exit 0;
}

## Take care of arguments.
my $do_sessions = 0;
my $do_caches = 0;
my $do_scratch = 0;
my $execute = 0;
if ( $opt_s ){ $do_sessions = 1; }
if ( $opt_c ){ $do_caches = 1; }
if ( $opt_r ){ $do_scratch = 1; }
if ( $opt_x ){ $execute = 1; }

## Nothing at all? Then do everything.
if ( ! $opt_s && ! $opt_c && ! $opt_r ){
  ll("Will perform all tasks.");
  $do_sessions = 1;
  $do_caches = 1;
  $do_scratch = 1;
}

if( $execute ){
  ll("Execute flag set--will recursively delete filesystem items!");
}

###
### Remove old files, do general cleaning as much as possible. All
### generic cleaning can/should be handled here.
###

if( $do_sessions ){

  ll("Starting session cleaning...");

  ## Scrub out new session type files.
  ll(" Removing session files.");
  sub new_sessions{
    if( /^cgisess_/ && lifespan($File::Find::name) ){
      ll("  Removing: " . $File::Find::name);
      unlink $File::Find::name if $execute;
    }
  }
  finddepth(\&new_sessions, ($core->amigo_env('AMIGO_SESSIONS_ROOT_DIR')));

  ll("Finished session cleaning.");
}


if( $do_caches ){

  ll("Starting cache cleaning...");

  ## Clean out old KVStore caches.
  ll(" Removing KVStore caches...");
  foreach my $ca (@{ AmiGO::KVStore::list() }){
    ll("  Removing: $ca");
    unlink $ca if -f $ca && $execute;
  }

  ## Clean out old KVStore::Filesystem caches (not (currently) a
  ## subclass of KVStore, so not on its list).
  ll(" Removing KVStore::Filesystem caches...");
  foreach my $ca (@{ AmiGO::KVStore::Filesystem::list() }){
    ll("  Removing tree: $ca");
    rmtree($ca, {safe => 1}) if -d $ca && $execute;
  }

  ll("Finished cache cleaning.");
}

if( $do_scratch ){

  ## Scrub out anything hanging out in scratch.
  ll("Resetting scratch directory: " . $core->amigo_env('AMIGO_SCRATCH_DIR'));
  rmtree($core->amigo_env('AMIGO_SCRATCH_DIR'),
  	 #{safe => 1, keep_root => 1} );
  	 {keep_root => 1} ) if $execute;

}

###
### Subs.
###

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

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $opt_v;
  $core->kvetch($str);
}


=head1 NAME

refresh.pl

=head1 SYNOPSIS

refresh.pl [-h] [-v] [-s] [-c] [-r] [-x]

=head1 DESCRIPTION

Run this periodically tp get rid of old cached files and sessions.

=head1 OPTIONS

Please note that if you don't specify any of the options, they are all
assumed to be on.

=over

=item -s

Perform routine cleaning of sessions. This includes removing session
and files that appear to be more than a day old.

=item -c

Perform routine cleaning of caches. This will remove any cached files
from the server so that a new one will have to be fetched or
generated.

=item -r

Reset the scratch directory.

=item -x

Since we're changing the filesystem and doing recursive deletes and
the like, we won't actually do anything unless we have this flag.

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
