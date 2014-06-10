=head1 AmiGO::External::XMLFast

Specialize onto XML resources. Add XPATH for EXT_DATA and such.

=cut

use utf8;
use strict;
use XML::LibXML;
use Carp;

package AmiGO::External::XMLFast;

use base ("AmiGO::External");


=item new

#

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  #my $arg = shift || {};

  ## A little XML readying.
  $self->{EXT_DATA} = undef;

  ##
  $self->{RTE_DOM} = undef;
  $self->{RTE_XPATH} = undef;

  bless $self, $class;
  return $self;
}


=item get_local_data

Bring in a local file in for testing...or whatever.

my $te = AmiGO::External::XMLFast->new();
my $xmlout = $te->get_local_data(...);

## Print out XML to STDERR.
print STDERR $xmlout . "\n";

=cut
sub get_local_data {

  my $self = shift;
  my $string  = shift || die 'need a string to make a local fetch';

  ## If we got the URL together properly, go get it.
  my $ret = $string;
  $self->{EXT_DATA} = XML::LibXML->load_xml(string => $string);

  ## Setup the methods we'll use.
  $self->{RTE_DOM} = $self->{EXT_DATA};
  $self->{RTE_XPATH} = XML::LibXML::XPathContext->new($self->{EXT_DATA});

  return $ret;
}

=item get_external_data

Sets up internal data structures.
Returns the XML string if you really want to play with it.

=cut
sub get_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->get($url);
  };
  if( $@ ){
    $self->kvetch("Error in GETing the document from: '$url': $@");
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
    }else{

      ## Chew the document.
      $doc = $mech->content();
      eval {
	my $dom = XML::LibXML->load_xml(string => $doc);
	$self->{EXT_DATA} = $dom;

	## Setup the methods we'll use.
	$self->{RTE_DOM} = $self->{EXT_DATA};
	$self->{RTE_XPATH} = XML::LibXML::XPathContext->new($self->{EXT_DATA});
      };

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("Error in document from: '$url': $@");
      }else{
	## Looks like it's well-formed--yay!
      }
    }
  }

  return $doc;
}


=item post_external_data

Sets up internal data structures.
Returns the XML string if you really want to play with it.

=cut
sub post_external_data {

  ##
  my $self = shift;
  my $url = shift || '';
  my $form = shift || {};
  my $mech = $self->{MECH};

  ## Go and try and get the external document.
  my $doc = '';
  eval {
    $mech->post($url, $form);
  };
  if( $@ ){
    $self->kvetch("error in POSTing to: '$url': $@");
  }else{

    if ( ! $mech->success() ){
      $self->kvetch("failed to contact data source at: $url");
    }else{

      ## Chew the document.
      $doc = $mech->content();
      eval {
	my $dom = XML::LibXML->load_xml(string => $doc);
	$self->{EXT_DATA} = $dom;

	## Setup the methods we'll use.
	$self->{RTE_DOM} = $self->{EXT_DATA};
	$self->{RTE_XPATH} = XML::LibXML::XPathContext->new($self->{EXT_DATA});
      };

      ## Check for errors.
      if( $@ ){
	$@ =~ s/at \/.*?$//s;
	$self->kvetch("error in document from: '$url': $@");
      }else{
	## Looks like it's well-formed--yay!
      }
    }
  }

  return $doc;
}


=item try

Tries to extract a path from a document. May take an optional second
argument for what to return in the case of failure.

This is meant for getting single-value results from the path, not
lists, etc.

=cut
sub try {

  my $self = shift;
  my $path = shift || '';
  my $retval = shift || 0;

  ## Make a safe attempt at a path.
  my $try = undef;
  eval {
    $try = $self->{EXT_DATA}->findvalue($path);
  };
  if($@){
    $self->kvetch("error in path from: '$path': $@");
  }else{
    $retval = $try;
  }

  return $retval;
}

=item get_value_list

try to recover a value list, needs default value, rets empty list by defult

=cut
sub get_value_list {
  my $self= shift;
  my $xpath = shift || die "need path";
  my $defval = shift || die "need default value";

  my $ret = [];

  my $results = $self->{RTE_XPATH}->findnodes($xpath) || [];
  foreach my $rnode (@$results){
      my $lbl = $rnode->findvalue('.') || $defval;
      push @$ret, $lbl;
  }

  return $ret;
}



1;
