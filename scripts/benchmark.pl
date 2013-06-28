#!/usr/bin/perl -w
####
#### Benchmark an AmiGO 2 installation (not GOlr).
####
#### Designed to be used for frontend benchmarking.
####

## Bring in necessaries.
use utf8;
use strict;
use Data::Dumper;
use Getopt::Long;
use HTTPD::Bench::ApacheBench;

my $verbose = '';
my $help = '';
my $base = '';
my $concurrency = 1;
my $repeat = 1;
GetOptions ('verbose' => \$verbose,
	    'help' => \$help,
	    'base=s' => \$base,
	    'concurrency=n' => \$concurrency,
	    'repeat=n' => \$repeat);

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $verbose;
}

$concurrency = int($concurrency);
$repeat = int($repeat);
ll("Verbose ON.");
ll("Concurrency is: " . $concurrency);
ll("Repeat is: " . $repeat);

## Embedded help through perldoc.
if( $help ){
  system('perldoc', __FILE__);
  exit 0;
}

my $url_tails =
  [
   '/',
   '/amigo/landing',
   '/amigo/gene_product/MGI:MGI:1919202',
   '/amigo/search',
   '/amigo/browse',
   '/amigo/software_list',
  ];
my $urls = [];
foreach my $url_tail (@$url_tails){
  push @$urls, $base . $url_tail;
}

my $b = HTTPD::Bench::ApacheBench->new();
$b->concurrency($concurrency);
$b->repeat($repeat);


## Add the different runs.
my $run1 = HTTPD::Bench::ApacheBench::Run->new({
						urls => $urls,
					       });
$b->add_run($run1);

## Execute all the runs we've added.
my $ro = $b->execute();

## Print calculations.
ll((1000 * $b->total_requests / $b->total_time) . " req/sec");
ll(join(', ', @{$run1->request_times}));


=head1 NAME

benchmark.pl

=head1 SYNOPSIS

benchmark.pl [-h/--help] [-v/--verbose] [-b/--base URL]

=head1 DESCRIPTION

This script does some AmiGO 2 benchmarking.

=head1 OPTIONS

=over

=item -v/--verbose

Verbose

=item -h/--help

Help.

=item -b/--base URL

The base URL to use. E.g. "http://localhost/cgi-bin/amigo2".

=back

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation

=cut
