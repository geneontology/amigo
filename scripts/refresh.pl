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
	  );
getopts('hvsc');

## Embedded help through perldoc.
if( $opt_h ){
  system('perldoc', __FILE__);
  exit 0;
}

## Take care of arguments.
my $be_chatty = 0;
my $do_sessions = 0;
my $do_caches = 0;
if ( $opt_v ){ $be_chatty = 1; }
if ( $opt_s ){ $do_sessions = 1; }
if ( $opt_c ){ $do_caches = 1; }

## Nothing at all? Then do everything.
if ( ! $opt_s && ! $opt_c ){
  $do_sessions = 1;
  $do_caches = 1;
}

###
### Remove old files, do general cleaning as much as possible. All
### generic cleaning can/should be handled here.
###

if( $do_sessions ){

  ll("Starting session cleaning, please wait...") if $be_chatty;

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

  # ## Scrub out the generated images, maps, and directories (?!).
  # sub temp_images{
  #   if( (/\.png$/ || /\.gif$/ || /\.map$/ ) && lifespan($File::Find::name) ){
  #     unlink $File::Find::name;
  #   }elsif( /amigo/ && -d && lifespan($File::Find::name) ){
  #     #remove_tree($File::Find::name, {safe => 1});
  #     #rmtree($File::Find::name, {safe => 1});
  #     rmtree($File::Find::name);
  #   }
  # }
  # finddepth(\&temp_images, ($ENV{AMIGO_TEMP_IMAGE_DIR}));
  # ll("Finished removing generated images.");

  ## Scrub out new session type files.
  sub new_sessions{
    if( /^cgisess_/ && lifespan($File::Find::name) ){
      #ll(" unlink: " . $File::Find::name);
      unlink $File::Find::name;
    }
  }
  finddepth(\&new_sessions, ($ENV{AMIGO_SESSIONS_ROOT_DIR}));
  ll("Finished removing new session files.");

  # ## Scrub out anything hanging out in scratch.
  # # rmtree($ENV{AMIGO_SCRATCH_DIR},
  # # 	 #{safe => 1, keep_root => 1} );
  # # 	 {keep_root => 1} );
  ll("Finished cleaning scratch directory: " . $ENV{AMIGO_SCRATCH_DIR});

  ll("Finished session cleaning.");
}


if( $do_caches ){

  ll("Starting cache cleaning, please wait...");

  my $core = AmiGO->new();

  ## Clean out old KVStore caches.
  $core->kvetch("Removing old KVStore caches...");
  foreach my $ca (@{ AmiGO::KVStore::list() }){
    $core->kvetch("Removing: $ca");
    #unlink $ca if -f $ca;
  }

  ## Clean out old KVStore::Filesystem caches (not (currently) a
  ## subclass of KVStore, so not on its list).
  $core->kvetch("Removing old KVStore::Filesystem caches...");
  foreach my $ca (@{ AmiGO::KVStore::Filesystem::list() }){
    $core->kvetch("Removing: $ca");
    #rmtree($ca, {safe => 1});
  }

  ll("Finished cache cleaning.");
}

###
### Subs.
###

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $be_chatty;
  #$core->kvetch($str);
}


=head1 NAME

refresh.pl

=head1 SYNOPSIS

refresh.pl [-h] [-v] [-s] [-c]

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

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
