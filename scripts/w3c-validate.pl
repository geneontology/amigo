#!/usr/bin/perl -w
####
#### WARNING: This is currently hard-wired to the BETA instance in
#### /some/ cases. See the NOTE below.
####
#### NOTE: I wanted to do this with WWW::Mechanize and grabbing files
#### locally to process locally but:
####
####  1) the CSS agent uses GET if you try and push a file, so that is
####  a no-go for most of my stuff and
####
####  2) I couldn't find an easy package for a local W3C CSS
####  validator, so I need to use their web version anyways.
####
#### I still have the option for the local file generation and sending
#### for HTML since I actually regularly get errors there and I need
#### to have a fast turnaround for development. Since the CSS changes
#### slowly and is relatively error free, I haven't bothered to find a
#### way to send out my local development files.
####

BEGIN {
  ## Try and find our env config file if we can't get it out of the
  ## environment.
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

## Bring in generic necessaries.
use utf8;
use strict;
use Data::Dumper;
use Getopt::Long;

##
use WWW::Mechanize;
use File::Temp;
use WebService::Validator::HTML::W3C;
use WebService::Validator::CSS::W3C;

## Argument definitions.
my $verbose = '';
my $help = '';
my $html = '';
my $css = '';
GetOptions ('verbose' => \$verbose,
	    'help' => \$help,
	    'html' => \$html,
	    'css' => \$css);

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

## The alpha and omega.
my $error_count = 0;

## A generic validation function!
sub _validate {
  my $type = shift || die "needs type";
  my $validator = shift || die "needs validator";
  my $validator_url = shift || die "needs validator url";
  my $target_url = shift || die "needs target url";
  my $as_file_p = shift || 0; #die "needs to know if to do as a file";

  ## Either directly pass the URL or get it with WWW:Mechanize first
  ## and pass as a file directly.
  my $success_p = undef;
  if( ! $as_file_p ){

    ## Direct URL access--easy.
    $success_p = $validator->validate(uri=>$target_url);

  }else{

    ## Proxy through local files (useful for getting http://localhost/
    ## out).

    ## Get a temp file ready.
    my $filehandle = File::Temp->new(SUFFIX=>'.html');
    my $filename = $filehandle->filename();

    ## Create a mechanize agent
    my $mech = WWW::Mechanize->new();
    #$mech->redirect_ok();
    $mech->get($target_url);
    my $mech_success_p = $mech->success(); # first success

    ## 
    if( ! $mech_success_p ){
      ll($type . ' error with proxy mech: ' . $mech->status());
    }else{
      ## Okay, now run the validator.
      #ll($type . ' run thru file with proxy mech: ' . $filename);
      $mech->save_content($filename,
			  binmode=>':raw',
			  decoded_by_headers=>1);
      # open(FILE, $filename) || die 'could not open proxy file';
      # while(<FILE>){ ll($_); }
      $success_p = $validator->validate(file=>$filename);
    }
  }

  ## Look at success and errors.
  if( ! defined $success_p ){
    ## This can only happen if we failed in Mech.
    ll($type . ' local bad connection/URL...see previous error messages.');
    $error_count++; # trigger fail error later on
  }elsif( ! $success_p ){
    ll($type . ' bad connection/URL (' .
       $validator_url . ') for: ' .
       $target_url . ' because "' .
       $validator->validator_error() . '"');
    $error_count++; # trigger fail error later on
  }else{
    if( $validator->is_valid() ){
      ll($type . ' okay: ' . $target_url);
    }else{
      ll($type . ' bad: ' . $target_url);

      ## Specific error messages.
      foreach my $err (@{$validator->errors()}){
	$error_count++; # trigger an error later.

	## Scrape out the line number from one of two spots (HTML vs
	## CSS agents).
	my $err_line = undef;
	if( defined $err->{line} ){
	  $err_line = $err->{line};
	}else{
	  $err_line = $err->line();
	}

	## Scrape out the error message from one of two spots (HTML vs
	## CSS agents).
	my $err_msg = undef;
	if( defined $err->{message} ){
	  $err_msg = $err->{message};
	}else{
	  $err_msg = $err->msg();
	}

	##
	ll($type . ' error (' . $err_line . '): ' . $err_msg);
      }
    }
  }
}

## Process our HTML links.
if( $html ){

  ## Local currently unusable:
  ## https://bugs.launchpad.net/ubuntu/+source/w3c-markup-validator/+bug/996117
  #my $html_vurl = 'http://localhost/w3c-validator/check';
  my $html_vurl = 'http://validator.w3.org/check';
  my $html_urls =
    [
     #'/amigo/landing',
     #'/amigo/term/GO:0022008',
     #'/amigo/gene_product/MGI:MGI:1915747',
     #'/amigo/search/annotation',
     #'/amigo/software_list',
     #'/grebe',
     #'/amigo/visualize',
     #'/amigo/medial_search?q=pigment',
     #'/goose',
     #'/goose?query=SELECT+count%28*%29%0D%0AFROM+++gene_product%3B%0D%0A&mirror=ebi&limit=1000',
     #'/amigo/schema_details',
     #'/amigo/load_details',
     #'/amigo/simple_search',
     #'/amigo/simple_search?mode=simple_search&page=1&query=pigment&golr_class=ontology',
     #'/amigo/browse',
     #'/gannet',
     #'/repl',
     #'/amigo/visualize_freeform',
    ];

  my $html_validator =
    WebService::Validator::HTML::W3C->new(
					  validator_uri => $html_vurl,
					  detailed => 1,
					 );
  foreach my $html_url (@$html_urls){
    _validate('HTML', $html_validator, $html_vurl,
	      $ENV{AMIGO_CGI_URL} . $html_url, 1);
  }
}

## Process our css.
if( $css ){

  my $css_vurl = 'http://jigsaw.w3.org/css-validator/validator';
  my $sheet_urls =
    [
     'http://amigo2.berkeleybop.org/amigo2/css/amigo.css',
     'http://amigo2.berkeleybop.org/amigo2/css/bbop.css',
    ];

  my $css_validator = WebService::Validator::CSS::W3C->new(undef, $css_vurl);
  foreach my $sheet_url (@$sheet_urls){
    _validate('CSS', $css_validator, $css_vurl, $sheet_url, 0);
  }
}

## Exit with error or not.
if( ! $error_count ){
  ll("Done with no errors.");
  exit 0;
}else{
  ll("Done with $error_count errors.");
  exit 1;
}

###
### Help.
###

=head1 NAME

w3c-validate.pl

=head1 SYNOPSIS

w3c-validate.pl [-h/--help] [-v/--verbose] [--html] [--css]

=head1 DESCRIPTION

Validate AmiGO 2's files against a W3C HTML/CSS validator.

WARNING: This is currently hard-wired to the BETA instance.

=head1 OPTIONS

=over

=item -v/--verbose

Turn on verbose messages--make this script chatty.

=item -h/--help

This help message.

=item -f/--file FILE

File argument.

=item --html

Validate internally defined HTML pages.

=item --css

Validate our CSS from local files.

=back

=head1 SEE ALSO

http://localhost/

=cut
