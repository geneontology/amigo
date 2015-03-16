#!/usr/bin/perl -w
####
####
####

BEGIN {
  ## Try and find our env config file.
  if( -f "./config.pl" ){
    require "./config.pl";
  }elsif( -f "./conf/config.pl" ){
    require "./conf/config.pl";
  }elsif( -f "./perl/bin/config.pl" ){
    require "./perl/bin/config.pl";
  }elsif( -f "../perl/bin/config.pl" ){
    require "../perl/bin/config.pl";
  }else{
    die "unable to find config.pl";
  }
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
	    'help' => \$help);

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
my $log_dir = $ENV{AMIGO_LOG_DIR};
if( ! $log_dir ){
  die "unable to find AmiGO log directory"
}else{
  ll("Using: " . $log_dir);
}

## Clear and restart log/kvetch.log.
my $lfile = $log_dir . '/kvetch.log';
if( -f $lfile ){
  ll(" Deleting: " . $lfile);
  unlink $lfile or warn "Could not unlink $lfile: $!";
  ll(" Creating: " . $lfile);
  open(FILE,">$lfile") or die "Could not create $lfile: $!";
  close(FILE);
  chmod 0666, $lfile;
}else{
  ll(" Nothing found: " . $lfile);
}

=head1 NAME

blank-kvetch.pl

=head1 SYNOPSIS

blank-kvetch.pl [-h/--help] [-v/--verbose]

=head1 DESCRIPTION

This script wipes out and restart the kvetch.log file.

=head1 OPTIONS

=over

=item -v/--verbose

Verbose

=item -h/--help

Help...this message.

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
