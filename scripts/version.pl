#!/usr/bin/perl -w
# $id$

#use ExtUtils::MakeMaker;
#use Config;
use strict;
use Cwd;
use File::Find;

###
### Remember, during the library search, we are chucking out all
### things that start with "GO" or "AmiGO" during the scrounging
### process, while borderline cases like "Utility" (which we defined
### but may be a cpan namespace) are not.
###

## Things that we might not find or see that we need.
my %must_list =
  (
#   'GO::TermFinder' => 1, # called incidentally
   'FreezeThaw' => 1,     # not picked-up automatically for some reason
   'DBD::SQLite' => 1,   # not picked-up automatically for some reason
  );

## Things that we might find, but don't want to worry about.
my %ignore_list =
  (
   ## TODO: AmiGO 2 utilities that need to be (re?)moved. Maybe I should
   ## just filter these out with the rest.
   'Utility' => 1,
   'Utility::GODBMeta' => 1,
   'Utility::Sanitize' => 1,
   'Utility::TrivialError' => 1,
   'Utility::Message' => 1,
   'Utility::TSLParser' => 1,

   ## SuGR is only needed in the experimental stuff.
   'SuGR' => 1,
   'SuGR::BaryMatrix' => 1,
   'SuGR::Partition' => 1,
   'SuGR::Render' => 1,
   'SuGR::Sugiyama' => 1,
   'SuGR::TrivialGraph' => 1,
   'Algorithm::Permute' => 1,
   'Cairo' => 1,
   'Graphics::ColorNames' => 1,
   'Log::Log4perl' => 1,
   'Math::Round' => 1,
   'Text::WrapI18N' => 1,

   ## Used for GOOSE.
   'SQL::Tokenizer' => 1,

   ## Used by experimental CGIs.
   'Cache::Memcached' => 1,
   'Cache::FileCache' => 1,
   'CGI::Simple' => 1,
   'CGI::Fast' => 1,
   'HTML::TableExtract' => 1,
   'Search::Xapian' => 1,
   'XML::Generator' => 1,

   ## Experimental libs for experimental apps.
   'A1' => 1,
   'B1' => 1,
   'A2' => 1,
   'B2' => 1,
   'Continuity' => 1,
   'Continuity::Adapt::HttpDaemon' => 1,
   'Data::Page' => 1,
   'GD' => 1,
   'HTML::Highlight' => 1,
   'Image::Size' => 1,
   'Lucene::QueryParser' => 1,
   'Lucene::Analysis::Analyzer' => 1,
   'Lucene::Analysis::Tokenizer' => 1,
   'mapscript' => 1,
   'Moose' => 1,
   'Parse::RecDescent' => 1,

   ## Some things used in fairly personal scripts.
   'Email::Send' => 1,
   'Email::Simple' => 1,
   'Net::hostent' => 1,
   'Net::FTP' => 1,
   'XML::RSS' => 1,

   ## (I believe) older things that aren't used in day-to-day AmiGO 2.
   'Bio::DB::SwissProt' => 1,
   'Bio::Index::GenBank' => 1,
   'Bio::Index::Swissprot' => 1,
   'Bio::PrimarySeq' => 1,
   'Bio::SeqIO' => 1,
   'Bio::Species' => 1,
   'Data::Stag' => 1,
   'Data::Stag::BaseGenerator' => 1,
   'Data::Stag::BaseHandler' => 1,
   'Data::Stag::SxprWriter' => 1,
   'Data::Stag::Writer' => 1,
   'Data::Stag::XMLWriter' => 1,
   'DBIx::DBStag' => 1,
   'DBIx::DBSchema' => 1,
   'Inline' => 1,
   'Set::Scalar' => 1,
   'Shell' => 1,
   'XML::Checker' => 1,
   'XML::Checker::Parser' => 1,
   'XML::Parser::PerlSAX' => 1,
   'XML::LibXML' => 1,
   'XML::LibXSLT' => 1,

   ## Ancient UI stuff I don't care about.
   'Tk' => 1,
   'Tk::Label' => 1,
   'Tk::Tree' => 1,
   'Tk::ItemStyle' => 1,

   ## Cruft/pragmas/wtf.
   'strict' => 1,
   'lib' => 1,
   'config.pl' => 1,
   'constant' => 1,
   'utf8' => 1,
   'vars' => 1,
   'base' => 1,
   'threads' => 1,
   'the' => 1,
   'rubygems' => 1,
   'rubygems;' => 1,
  );

## Make sure that we're in the right directory--the amigo root. How
## about if we see if there is an amigo directory and the install
## script if present...
unless( -e "install" &&
	-d "perl/lib/AmiGO" &&
	-d "_data" &&
	-d "golr" ){
  die "We don't seem to be in the amigo root directory.";
}

## Get a list of all files in the major directories and act on
## them.
my %lib_hash = ();
#my $upper_base = cwd . '/../';
#find(\&action, $upper_base . 'perl/lib');
find(\&action, 'perl/lib');
sub action {

  my $file = $File::Find::name;
  if( -f $file ){

    open FILE, $file or
      print "couldn't open $file\n" && return;

    ## Scan file for what we want.
    while( <FILE> ){

      ## Find all possible library bits.
      my $catch = undef;
      if( /^\s*require\s+(.*)\;/ ){
	$catch = $1;
      }elsif( /^\s*use\s+base\s+(.*)\;/ ){
	$catch = $1;
      }elsif( /^\s*use\s+(.*)\;/ ){
	$catch = $1;
      }

      ## Clean the bits a bit more and see if they're useful.
      if( defined $catch ){

	$catch =~ s/^\s+//;
	$catch =~ s/qw//;
	$catch =~ s/\(//;
	$catch =~ s/\)//;
	my @foo = split ' ', $catch;
	my $bar = $foo[0];
	$bar =~ s/\"//g; # get rid of double quotes
	$bar =~ s/\'//g; # get rid of single quotes
	$bar =~ s/\//\:\:/g; # change slashes to double colons
	$bar =~ s/\.pm$//g; # goodbye trailing .pm
	## Get rid of trailing and leading generated doubles (from
	## "qw/.*/").
	$bar =~ s/^\.\.//g; # fixing edge case that generates "..::config.pl"
	$bar =~ s/^\:\://g;
	$bar =~ s/\:\:$//g;
	unless(
	       $bar =~ /^AmiGO/ ||
	       $bar =~ /^GO$/ ||
	       $bar =~ /^GO\// ||
	       $bar =~ /^GO\:/ ||
	       $bar =~ /^\$/
	      ){

	  ## Add, but filter out black list.
	  $lib_hash{$bar} = 1 if ! defined $ignore_list{$bar};
	}
      }
    }
    close FILE;

  }else{
    #print "Ignoring $file\n";
  }
}

## Add white list.
foreach my $wkey (keys %must_list){
  $lib_hash{$wkey} = 1;
}

## Check library existance. Caches the lost ones.
my $error_p = 0;
my $lost_libs = [];
foreach my $lib (sort keys %lib_hash){
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



=head1 NAME

version.pl

=head1 SYNOPSIS

version.pl

=head1 DESCRIPTION

This AmiGO 2 script checks the environment's perl libraries by
recursively parsing the files in the go-dev/amigo directory and makes
suggestions about what should still be installed. It should probably
run first if you have never tried to install this version of AmiGO 2
before.

=head1 SEE ALSO

http://wiki.geneontology.org/index.php/AmiGO_2_Manual:_Installation

=cut
