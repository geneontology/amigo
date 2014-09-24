#!/usr/bin/perl -w
####
#### Generic script template.
####

## Bring in generic necessaries.
use utf8;
use strict;
use Data::Dumper;
use Getopt::Long;

## Argument definitions.
my $verbose = '';
my $help = '';
my $file = '';
my $cutoff = 0;
GetOptions ('verbose' => \$verbose,
	    'help' => \$help,
	    'cutoff=s' => \$cutoff,
	    'file=s' => \$file);

## Embedded help through perldoc.
if ( $help ) {
  system('perldoc', __FILE__);
  exit 0;
}

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $verbose;
}
ll("Verbose ON.");

## File argument check.
if( ! $file ){
  die "ERROR: unable to find file";
}else{
  ll("Using: " . $file);
}
if( ! $cutoff ){
  die "ERROR: unable to find cutoff argument";
}elsif ( $cutoff < 2 ){
  die "ERROR: cutoff too small (>2)";
}else{
  ll("Using a cutoff of: " . $cutoff);
}

###
### Main: splodes the IEA file into current directory by gp ID.
###

my $current_file_ext = 0;
my $file_handle = undef;
sub _next_filehandle(){
  ## Close current filehandle.
  if( $file_handle ){
    close $file_handle;
  }

  $current_file_ext = $current_file_ext + 1;
  my $ofname =  './iea.' . $current_file_ext;
  open(my $out_fhandle, ">$ofname") or
    die "Could not open $ofname: $!";

  $file_handle = $out_fhandle;

  return $out_fhandle;
}

##
my $last_id = undef;
my $curr_id = undef;
my $sect_num = 0;
my $outhandle = _next_filehandle(); # initial filehandle
open(my $iea_fhandle, $file) or
  die "Could not open $file: $!";
while ( my $line = <$iea_fhandle> ) {

  if ( $line =~ /^\!/ ) {
    # for now, ignore comments
    # TODO: collect comments and prepend them to all final files
  } else {

    $sect_num++;

    ## Get ID by sploding, rotate ids.
    my @fields = split(/\t/, $line);
    my $gpdb = $fields[0];
    my $gpid = $fields[1];
    $last_id = $curr_id;
    $curr_id = $gpdb . $gpid;

    ## Start looking for a place to break.
    if( $sect_num > $cutoff ){ # warning: if cutoff < 2, can error here
      if( $last_id ne $curr_id ){
	## Found switch point.
	$outhandle = _next_filehandle();
	$sect_num = 0;
      }
    }

    print $outhandle $line;
  }
}

## Close output and input.
close $outhandle;
close $iea_fhandle;

ll("Done.");

###
### Help.
###

=head1 NAME

process-ieas.pl

=head1 SYNOPSIS

script-template.pl [-h/--help] [-v/--verbose] [-f/--file FILE] OTHER_ARGUMENTS

=head1 DESCRIPTION

A generic template/example script.

=head1 OPTIONS

=over

=item -v/--verbose

Turn on verbose messages--make this script chatty.

=item -h/--help

This help message.

=item -f/--file FILE

File argument.

=back

=head1 SEE ALSO

http://localhost/

=cut
