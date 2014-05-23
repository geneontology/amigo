#!/usr/bin/perl -w
####
#### Make ready to release the JS to npmjs.org.
#### This script depends on already having the built files in staging/.
#### See 'perldoc <this_file>' for usage and flags.
####

use utf8;
use strict;
use Template;
use File::Basename;
use Cwd;
use vars qw(
	     $opt_v
	     $opt_h
	     $opt_i
	     $opt_o
	     $opt_r
	  );
use Getopt::Std;

## Since internal checks are done, get ready for user input.
getopts('vhi:o:r:');

## Embedded help through perldoc.
if( $opt_h ){
  system('perldoc', __FILE__);
  exit 0;
}

## Check our options.
ll("Will print verbose messages.");

## Should only be run in the top directory.
if ( ! -f "./scripts/release-npm.pl" ){
  ll("This does not seem to be the correct base directory!");
  ll("Please run this script from the base like: ./scripts/release-npm.pl");
  exit 0;
}

## Make sure we have the necessary flags to get our input and output
## in the right places.
die "need -i option--use -h flag for help" if ! $opt_i;
die "need -o option--use -h flag for help" if ! $opt_o;
die "need -r option--use -h flag for help" if ! $opt_r;

###
### Get oriented.
###

my $base = getcwd();
ll('Base: ' . $base);
my $bundle_input_fname = $base . '/' . $opt_i;
ll('Bundle input: ' . $bundle_input_fname);
my $output_dir_fname = $base . '/' . $opt_o;
ll('Output directory: ' . $output_dir_fname);
my $revision = $opt_r;
ll('Revision: ' . $revision);

## Verify what we can.
if( ! -f $bundle_input_fname ){
  die "Could not find input bundle";
}else{
  ll("Input file: " . $bundle_input_fname);
}

###
### Produce pakage.json and put it in the right place.
###

my $package_json_location = $output_dir_fname . '/package.json';

## If the file is already there, blow it away.
unlink $package_json_location if -f $package_json_location;
open(FILE, ">$package_json_location")
  or die "cannot open $package_json_location: $!";

## Template to string output.
my $output = '';
my $tt = Template->new();
$tt->process('templates/conf/package.json',
	     {
	      version => $revision,
	     },
	     \$output)
  || die $tt->error;
print FILE $output;

## Close file.
close(FILE);
make_readable($package_json_location);
ll("Created package.json file at: \"$package_json_location\".");

###
### Copy the ready bundle.
###

ll('Copying bundle: ' . $bundle_input_fname . ' to ' . $output_dir_fname);
force_copy($bundle_input_fname, $output_dir_fname);

###
### Helper functions.
###

##
sub force_copy {

  my $from = shift || die "no first arg";
  my $to = shift || die "no second arg";

  #my @args = ("cp", "-r", "-f", $from, $to);
  my @args = ("rsync", "-r",
	      "--exclude=.svn",
	      "--exclude=.git",
	      "--exclude=.emacs.desktop",
	      $from, $to);
  ll("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
}

##
sub make_readable {

  my $file = shift || die "no first arg";

  my @args = ("chmod", "644", $file);
  ll("System: \"@args\"");
  system(@args) == 0 || die "System \"@args\" failed: $?";
}

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $opt_v;
}


=head1 NAME

release-npm.pl

=head1 SYNOPSIS

release-npm.pl [-h] [-v] -i <input directory/name (full path)> -o <output directory/name (full path)> -r <revision string>

=head1 DESCRIPTION

Readys the pre-set NPM package for shipping out.

=head1 OPTIONS

=over

=item -v

Enable more verbose messages.

=item -h

Print this help message.

=item -i <path>

Full path for the location of the JS release bundle file.

=item -o <path>

Full path for the location of the JS release bundle file.

=item -r <version number>

The major.minor.bugfix-tag version number to use (e.g. "0.9.1-foo", "1.2.0").

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_2

=cut
