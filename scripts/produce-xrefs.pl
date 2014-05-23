#!/usr/bin/perl -w
####
#### Produce a JSON blob from the online version of the GO.xrf_abbs
#### file.
####
#### Initially lifted from AmiGO 2's install script. Should eventually
#### replace it.
####

## Bring in generic necessaries.
use utf8;
use strict;
use Data::Dumper;
use Getopt::Long;
use WWW::Mechanize;
use Carp;
use JSON::XS;

## Argument definitions.
my $verbose = '';
my $help = '';
GetOptions ('verbose' => \$verbose,
	    'help' => \$help);

## Embedded help through perldoc.
if( $help ){
  system('perldoc', __FILE__);
  exit 0;
}

## Just a little printin' when feeling verbose.
sub ll {
  my $str = shift || '';
  print $str . "\n" if $verbose;
}
ll("Verbose ON.");

###
### Main.
###

## Setup agent.
my $url = 'http://www.geneontology.org/doc/GO.xrf_abbs';
my $mech = WWW::Mechanize->new(agent => 'produce-xrefs.pl');
$mech->timeout(2);

## Make attempt on doc.
my $doc = '';
eval {
  $mech->get($url);
};
if( $@ ){
  ll("error in GETing the document from: '$url': $@");
}else{
  if ( ! $mech->success() ){
    ll("failed to contact data source at: $url");
  }else{
    ## Check for errors.
    if( $@ ){
      $@ =~ s/at \/.*?$//s;
      ll("error in document from: '$url': $@");
    }else{
      ## We got it!
      $doc = $mech->content();
    }
  }
}
## Check that something was there.
die "Found no way to get a GO.xref_abbs file: $!" if ! $doc;

## Parse remote file.
#my $database_info = {};
my $database_info = [];

## Split on two or more newlines--the entry sections.
my @top_chunks = split /\n{2,}/s, $doc;

## Split on newline for each line in a section.
foreach my $middle_chunk_str (@top_chunks){
  my @middle_chunks = split /\n/s, $middle_chunk_str;

  ## Create an empty template for the kinds of things we might find
  ## and try add fill them in.
  my $tmp_data =
    {
     id => undef,
     abbreviation => undef,
     name => undef,
     fullname => undef,
     datatype => undef,
     database => undef,
     object => undef,
     example_id => undef,
     generic_url => undef,
     url_syntax => undef,
     url_example => undef,
     uri_prefix => undef,
     synonym => [],
    };
  ## Split on ':' and trim; add it to the above template.
  foreach my $line (@middle_chunks){
    $line =~ /(.*)\:\s+(.*)/;
    my $tag = $1;
    my $val = $2;
    if( $tag ){
      if( $tag =~ /^\!/ || $tag =~ /^\#/ ){ # skip comments
	## Skip.
      }elsif( ref($tmp_data->{$tag}) eq 'ARRAY' ){ # see if aref in template
	## If it is a synonym, etc., push on.
	push @{$tmp_data->{$tag}}, $val;
      }else{
	## Otherwise add tag to set.
	$tmp_data->{$tag} = $val;
      }
    }
  }

  # ## If it looks like it has a key add it to the hash.
  # if( $tmp_data->{abbreviation} ){
  #   my $key = lc($tmp_data->{abbreviation});
  #   $database_info->{$key} = $tmp_data;
  #   #ll("Added: $key");

  #   ## Now let's take a look and see if this needs to be cloned onto
  #   ## additional synonym entries.
  #   foreach my $clone_abbr (@$local_clone_list){
  #     my $clone_key = lc($clone_abbr);
  #     my $clone_data = Clone::clone($tmp_data);
  #     $clone_data->{abbreviation} = $clone_abbr;
  #     $database_info->{$clone_key} = $clone_data;
  #     #ll("Added clone: $clone_key");
  #   }
  # }

  ## Note, since there are random notes, comments, etc. in the input
  ## file, we'll just skip anything that is not defined with an
  ## abbreviation.
  if( $tmp_data->{'abbreviation'} ){
    push @$database_info, $tmp_data;
  }
}

## Convert internal object to JSON.
my $json = JSON::XS->new()->pretty(1);
#$js->allow_bignum(1); # if needed, go back to ::PP
my $json_str = $json->encode($database_info);
chomp $json_str;
print STDOUT $json_str;

###
### Help.
###

=head1 NAME

produce-xrefs.pl

Produce a JSON blob from the online version of the GO.xrf_abbs
file.

Initially lifted from AmiGO 2's install script. Should eventually
replace it.

=head1 SYNOPSIS

produce-xrefs.pl [-h/--help] [-v/--verbose]

=head1 DESCRIPTION

A generic template/example script.

=head1 OPTIONS

=over

=item -v/--verbose

Turn on verbose messages--make this script chatty.

=item -h/--help

This help message.

=back

=head1 SEE ALSO

https://github.com/kltm/amigo/blob/master/install

=cut
