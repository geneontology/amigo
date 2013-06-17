#!/usr/bin/perl -w
####
#### Script to moderate global messages in AmiGO 2.
####

BEGIN {
  ## Try and find our env config file if we can't get it out of the
  ## environment.
  #if( ! defined($ENV{AMIGO_CGI_ROOT_DIR}) || $ENV{AMIGO_CGI_ROOT_DIR} eq '' ){
  if( -f "./config.pl" ){
    require "./config.pl";
  }elsif( -f "./conf/config.pl" ){
    require "./conf/config.pl";
  }elsif( -f "../conf/config.pl" ){
    require "../conf/config.pl";
  }else{
    die "unable to find config.pl";
  }
  #}
}

## Bring in necessaries.
use utf8;
use strict;
use Data::Dumper;
use Getopt::Long;
use File::Path; # old versions don't have this
use File::Find;
use File::stat;
use Time::localtime;
use File::Temp qw(tempfile);

my $verbose = '';
my $help = '';
my $clear = '';
my $warning = '';
my $error = '';
GetOptions ('verbose' => \$verbose,
	    'help' => \$help,
	    'clear' => \$clear,
	    'warning=s' => \$warning,
	    'error=s' => \$error);

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $verbose;
}
ll("Verbose ON.");

## Embedded help through perldoc.
if( $help ){
  system('perldoc', __FILE__);
  exit 0;
}

## Make sure we have the right environment.
my $root_dir = $ENV{AMIGO_CGI_ROOT_DIR};
if( ! $root_dir ){
  die "unable to find AmiGO root directory"
}else{
  ll("Using: " . $root_dir);
}

## Clear all messages on clear.
if( $clear ){
  my @root_a_files = glob($root_dir . '/.amigo.*');
  foreach my $afile (@root_a_files){
    ll("Found: " . $afile);
    if( $afile =~ /\.amigo\.warning.*/ || $afile =~ /\.amigo\.error.*/ ){
      ll(" Deleting: " . $afile);
      unlink $afile or warn "Could not unlink $afile: $!";
    }else{
      ll(" Ignoring: " . $afile);
    }
  }
}

sub _write_to_file {
  my $fname = shift || die "need a file arg";
  my $cont = shift || die "need a contents arg";

  my $final_fname = $root_dir . '/' . $fname;
  open OFILE, ">$final_fname" or die "Couldn't open file $final_fname: $!";
  print OFILE $cont;
  close OFILE;

  ll("Wrote to $final_fname: \"$cont\"");
}

if( $warning ){ _write_to_file(".amigo.warning", $warning); }
if( $error ){ _write_to_file(".amigo.error", $error); }


=head1 NAME

global-message.pl

=head1 SYNOPSIS

global-message.pl [-h/--help] [-v/--verbose] [-c/--clear] [-w/--warning MESSAGE] [-e/--error MESSAGE]

=head1 DESCRIPTION

This script adds a warning or error message to AmiGO globally.

=head1 OPTIONS

=over

=item -v/--verbose

Verbose

=item -h/--help

Help.

=item -c/--clear

Clear out/remove all warning and error messages.

=item -w/--warning MESSAGE

Add a warning message.

=item -e/--error MESSAGE

Add an error message.

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
