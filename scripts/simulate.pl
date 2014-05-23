#!/usr/bin/perl -w
# $id$
####
#### Determine what is necessary for AmiGO 2 in a realistic environment.
####

###
### Main test area.
###

use strict;
use Cwd;
use vars qw(
	     $opt_j
	  );
use Getopt::Std;
getopts('j');

## All scripts to probe.
my $util_scripts =
  [
   "refresh.pl",
   "scripts/luigi",
   "scripts/make_dblinks.pl",
   "scripts/make_go_meta_js.pl",
   "scripts/make_misc_key.pl",
   "scripts/make_spec_key.pl",
   "scripts/reinit_caches.pl",
   "scripts/term_enrichment_batch.pl"
  ];
my $web_scripts =
  [
   "amigo",
   "visualize",
   "term_details",
  ];

## Things that we might not see that we need.
my $must_list =
  [
   # 'GO::TermFinder',
  ];

## Things that we might see, but don't want to worry about. These tend
## to be things that are optionally tested and loaded. Or thing I have
## no idea about.
my %ignore_hash =
  (
   'JSON::XS' => 1,
   'Log::Agent' => 1,
   'B' => 1,
   'Encode::ConfigLocal' => 1,
  );


## Setup a *very* minimal config file if none exists (so many scripts
## require its existance).
my $amigo_base = getcwd();
my $go_base = substr($amigo_base, 0, 0 - length('/amigo'));
my $created_tmp_config = 0;
my $cname = 'config.pl';
if( -f $cname ){
  #  print "YES\n";
}else{
  $created_tmp_config = 1;
  #  print "NO\n";
  open CONF, ">$cname" or die "unable to create temporary config: $!";
  print CONF "\$ENV{GO_DEV_ROOT}=\'" . $go_base .  "\'\;\n";
  print CONF "1;\n";
  close CONF;
}


##
sub collect{

  ## Create.
  my $script = shift;
  my $command =
    "perl -c -I" . $amigo_base . "/perl -Mscripts::ListDependencies " . $script . " 2> /dev/null";
  die "No command given: $!" if ! $command;

  ## Run.
  #print "Starting: ($command).\n";
  my $output = `$command`;

  ## Chew.
  my $final_things = [];
  my @tmp_things = split(/[\n]+/, $output);
  foreach my $t (@tmp_things){
    ## filter out errors and compile static.
    if( $t =~ /^[a-zA-Z0-9\:\.\_\-\/]+$/ ){
      if( ! defined $ignore_hash{$t} ){
	push @$final_things, $t;
	#print ">>>" . $t . "\n";
      }
    }
  }

  return $final_things;
}


###
###
###

##
my %all_libs = ();

## Get everything that is scripty.
foreach my $script (@$util_scripts){
  my $libs = collect($script);
  foreach my $lib (@$libs){
    $all_libs{$lib} = 1;
  }
}

## Get everything in the cgi-bin
foreach my $script (@$web_scripts){
  my $libs = collect("amigo/cgi-bin/" . $script);
  foreach my $lib (@$libs){
    $all_libs{$lib} = 1;
  }
}

## Merge in must list.
foreach my $m (@$must_list){
  $all_libs{$m} = 1;
}

## Check library existance. Caches the lost ones.
my $error_p = 0;
my $lost_libs = [];
foreach my $lib (sort keys %all_libs){
  print "Checking for: " . $lib . "...";

  if( ! eval "require $lib" ){
    print "not found.";
    push @$lost_libs,  "\t" . $lib . "\n";
    $error_p++;
  }else{
    print "ok.";
  }
  print "\n";
}


## Check that we have a proper version of Template.
eval {
  do Template;
  if( defined Template->VERSION ){
    my $required_tt_version = 2.19;
    my $actual_tt_version = Template->VERSION + 0.0;
    if( $actual_tt_version < $required_tt_version ){
      $error_p++;
      push @$lost_libs, "AmiGO 2 requires at least version " .
	$actual_tt_version . " of Template Toolkit.";
    }else{
      print "Checking Template::Toolkit version...ok.\n";
    }
  }
};

## Undo temporary config env if we created one...
if( $created_tmp_config ){
  if( ! unlink $cname ){
    die "unable to remove temporary $cname--please remove manually: $!";
  }
}

## How did we do?
my $remainders = join "", @$lost_libs;
if( $error_p ){

  print <<MSG;

Not all of the requirements have been met.
Please install the following perl modules:

$remainders
MSG

}else{

  print <<MSG;

It looks like all requirements have been met.
Please use "make install" to install AmiGO 2.

MSG

}

###
### Dump all necessary libs to JSON file.
###

if( $opt_j ){
  eval {

    require JSON;

    my @lib_list = keys %all_libs;
    @lib_list = sort { $a cmp $b } @lib_list;

    my $json = JSON->new();
    $json->pretty(1);
    $json->indent(1);
    $json->space_after(1);
    $json->utf8(1);
    my $jtext = $json->encode(\@lib_list);
    open(JFILE, ">perl_libs.json");
    print JFILE $jtext;
    close(JFILE);
  };
  if($@){
    print <<MSG;

Cannot export results to JSON without JSON.pm installed.
Please install JSON.pm.

MSG

    exit -1;
  }
}


=head1 NAME

simulate.pl

=head1 SYNOPSIS

simulate.pl

=head1 DESCRIPTION

This AmiGO 2 script checks the environment's perl libraries by running
the perl checker over them and makes suggestions about what should
still be installed. It should probably run first if you have upgraded
to a newer version of AmiGO 2.

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_2_Manual:_Installation

=cut
