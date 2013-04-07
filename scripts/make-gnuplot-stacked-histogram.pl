#!/usr/bin/perl -w
####
#### Make a nice histogram got GO data.
####
#### Usage: see perldoc this file.
####


## Bring in necessaries.
use utf8;
use strict;
use Getopt::Long;

my $verbose = '';
my $help = '';
my $input = '';
my $output = '';
my $title = '';
my $xlabel = '';
my $ylabel = '';
GetOptions ('verbose' => \$verbose,
	    'help' => \$help,
	    'input=s' => \$input,
	    'output=s' => \$output,
	    'title=s' => \$title,
	    'xlabel=s' => \$xlabel,
	    'ylabel=s' => \$ylabel);

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
if( ! $input || ! -f $input ){
  die "need to define input file name"
}else{
  ll("Using input: " . $input);
}
if( ! $output ){
  die "need to define output file name"
}else{
  ll("Using output: " . $output);
}

my $pset =
  [
   'set term png size 1200, 500',
   'set output "' . $output . '"',
   'set title "' . $title . '"',
   #'set style histogram columnstacked',
   'set style data histogram', #
   'set style histogram rowstacked gap 1.25', #
   'set boxwidth 0.8', #
   'set style fill solid 1.0 border -1', #
   'set key invert reverse Left outside',
   #'set yrange [0:*]',
   #'set key autotitle columnheader',
   'set ylabel "'. $ylabel . '"',
   'set xlabel "' . $xlabel . '"',
   #'set tics scale 0.0',
   #'set ytics',
   #'set auto x',
   #'unset xtics',
   #'set xtics norotate nomirror',
   'set xtic rotate by -45 scale 0 font ",8"',
   'set datafile separator "\t"',
   'plot for [i=2:9] "'. $input .'" using i:xtic(1) ti col',
   ];

open GP, '| gnuplot' or die "Couldn't open gnuplot: $!";
foreach my $pcmd (@$pset){
  print GP $pcmd . "\n";
  #sleep 2;
}
close GP;


=head1 NAME

make-gnuplot-stacked-histogram.pl

=head1 SYNOPSIS

make-gnuplot-stacked-histogram.pl [-h/--help] [-v/--verbose] [-i/--input] [-o/--output] [-t/--title] [-x/--xlabel] [-y/--ylabel]

=head1 DESCRIPTION

Make a nice stacked histogram a la: http://gnuplot.sourceforge.net/demo/histograms.html.

=head1 OPTIONS

=over

=item -v/--verbose

Verbose

=item -h/--help

Help.

=item -i/--input

Input file name.

The data should look like: 

AXES	similarity evidence	experimental evidence	curator inference	author statement	combinatorial evidence	genomic context evidence	biological system reconstruction	imported information
UniProtKB	125774	112195	91831	58582	625	224	0	0
PDB	5469	33131	2799	3575	0	0	0	0

Or:

AXES	Count
UniProtKB	985870
PDB	796625
MGI	277320
RGD	239625
TAIR	211732
AspGD	187533
TIGR_CMR	100842
CGD	98753
ZFIN	98377
FB	84714
SGD	84321
WB	68387
dictyBase	54754
JCVI_CMR	53271
GR_protein	48882
PomBase	38770
NCBI	32318
ENSEMBL	25666
GeneDB_Pfalciparum	4546
PseudoCAP	4394
GeneDB_Tbrucei	3520
Gene	2560
GeneDB_Lmajor	897
Reactome	824
RefSeq	824
SGN	562
Ensembl	385
ASAP	296
NCBI_NP	142
NCBI_GP	62
EcoCyc	20
PAMGO_VMD	13
MetaCyc	7

=item -o/--output

Output file name.

=item -t/--title

Histogram title.

=item -x/--xlabel

Label on the x-axis

=item -y/--ylabel

Label on the y-axis

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_2_Manual:_Installation

=cut
