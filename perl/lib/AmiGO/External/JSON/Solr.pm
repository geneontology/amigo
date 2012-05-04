=head1 AmiGO::External::JSON::Solr

Specialize onto external Solr document store resource.
For specifically handling GOlr, see the subclass.

=cut

package AmiGO::External::JSON::Solr;
use base ("AmiGO::External::JSON");

use utf8;
use strict;
use Carp;
use Clone;
use Data::Dumper;
use POSIX qw(ceil);

=item new

Arguments: (optional) full URL as string including the final slash.
e.g.: http://skewer.lbl.gov:8080/solr/
No argument will use AmiGO's internal GOlr url.

=cut
sub new {

  ##
  my $class = shift;
  my $self = $class->SUPER::new();

  my $target = shift ||
    $self->amigo_env('AMIGO_PUBLIC_GOLR_URL') ||
      'http://localhost:8080/solr/';

  ## http://skewer.lbl.gov:8080/solr/select?qt=standard&indent=on&wt=json&version=2.2&rows=10&start=0&fl=*%2Cscore&q=id:%22GO:0022008%22
  $self->{AEJS_BASE_HASH} =
    {
     #'qt' => 'standard',
     'indent' => 'on',
     'wt' => 'json',
     #'version' => 2.2,
     'rows' => 10,
     'start' => 0,
     'fl' => '*%2Cscore',
    };

  $self->{AEJS_BASE_URL} = $target . 'select?';
  $self->{AEJS_LAST_URL} = undef;
  $self->{AEJS_RESPONSE} = undef;

  bless $self, $class;
  return $self;
}


=item _query_url

Arguments: Post "select?" query string or internal hash manipulation.
Return: query string

Helper function (not meant to be called directly) to get the url of
the current state of the object.

Does not change object state.

=cut
sub _query_url {

  my $self = shift;
  my $qstr = shift || undef;

  $self->kvetch("base hash: " . Dumper($self->{AEJS_BASE_HASH}));

  ## Create URL.
  my $url = $self->{AEJS_BASE_URL} .
    $self->hash_to_query_string($self->{AEJS_BASE_HASH});

  ## Add more if it is defined as an argument.
  $url = $url . '&' . $qstr if $qstr;

  ## Make query against resource and try to perlify it.
  $self->kvetch("url: " . $url);

  return $url;
};


=item query

Arguments: Post "select?" query string or internal hash manipulation.
Return: true or false on minimal success

This is the most raw of the searches. Hope you know what you're doing.

Basically, the main way subclasses should be handling Solr queries.
Also updates last URL tried, count, etc. Any specified string
parameters will there in addition to the ones in the hash. If you want
to override hash parameters, use the *_variable functions or update.

=cut
sub query {

  my $self = shift;
  my $qstr = shift || undef;
  my $retval = 0;

  ## Create URL.
  my $url = $self->_query_url($qstr);

  ## Update last query url.
  $self->{AEJS_LAST_URL} = $url;

  ## Make query against resource and try to perlify it.
  $self->get_external_data($url);
  my $doc_blob = $self->try();

  #$self->kvetch("doc_blob: " . Dumper($doc_blob));

  ## Make sure we got something.
  if( ! $self->empty_hash_p($doc_blob) &&
      $doc_blob->{response} ){
    $self->{AEJS_RESPONSE} = $doc_blob;
    $retval = 1;
  }

  return $retval;
}


=item update

Arguments: Post "select?" query string and an aref list of clobberable values.
Return: 1 if a change was made, 0 otherwise

The point is to update the internal hash with a query string in a
sensible way. Items that are not in the clobber list will have
multiple values in the final query.

=cut
sub update {

  my $self = shift;
  my $qstr = shift || '';
  my $clobber_list = shift || [];
  my $retval = 0;

  ## Convert clobber array into easy to use hash.
  my $clobberables = $self->to_hash($clobber_list);

  ## Run through all of thekeys and merge them into out main data. If
  ## they are clobberable, do so; otherwise just add them to what's
  ## already there.
  my $q_hash = $self->query_string_to_hash($qstr);
  foreach my $q_key (keys %$q_hash){
    if( defined $clobberables->{$q_key} ){
      $self->set_variable($q_key, $q_hash->{$q_key});
    }else{
      $self->add_variable($q_key, $q_hash->{$q_key});
    }
    $retval = 1;
  }

  return $retval;
}


=item variables

Arguments: n/a
Returns: aref of current variable keys

=cut
sub variables {

  my $self = shift;
  my $retref;

  foreach my $k (keys %{$self->{AEJS_BASE_HASH}} ){
    push @$retref, $k;
  }

  return $retref;
}


=item get_variable

Arguments: string name of solr variable.
Returns: variable or undef

=cut
sub get_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $retval = undef;

  if( defined $qkey && defined $self->{AEJS_BASE_HASH}{$qkey} ){
    $retval = $self->{AEJS_BASE_HASH}{$qkey};
  }

  return $retval;
}


=item set_variable

Arguments: string name of solr variable, value
Returns: the value of the set variable

=cut
sub set_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $qval = shift || undef;
  my $retval = $qval;

  if( defined $qkey ){
    $self->{AEJS_BASE_HASH}{$qkey} = $qval;
  }

  return $qval;
}


=item add_variable

Arguments: string name of solr variable, value to be added to key
Returns: the value of the added variable

=cut
sub add_variable {

  my $self = shift;
  my $qkey = shift || undef;
  my $qval = shift || undef;
  my $retval = $qval;

  if( defined $qkey ){
    if( ! defined $self->{AEJS_BASE_HASH}{$qkey} ){
      $self->{AEJS_BASE_HASH}{$qkey} = $qval;
    }elsif( defined $self->{AEJS_BASE_HASH}{$qkey} &&
	    ref($self->{AEJS_BASE_HASH}{$qkey}) eq 'ARRAY' ){
      push @{$self->{AEJS_BASE_HASH}{$qkey}}, $qval;
    }else{
      my $tmp_val = $self->{AEJS_BASE_HASH}{$qkey};
      $self->{AEJS_BASE_HASH}{$qkey} = [];
      push @{$self->{AEJS_BASE_HASH}{$qkey}}, $tmp_val;
      push @{$self->{AEJS_BASE_HASH}{$qkey}}, $qval;
    }
  }

  return $qval;
}


=item url

Return: the last url used as a string.

=cut
sub url {
  my $self = shift;
  return $self->{AEJS_LAST_URL};
}


=item total

Return: int or undef

Total number of possible docs found during last query.

=cut
sub total {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{numFound} ){
    $retval = $self->{AEJS_RESPONSE}{response}{numFound};
  }

  return $retval;
}


=item rows_requested

Return: int or undef

Count of docs we wanted returned during the last query.

=cut
sub rows_requested {
  my $self = shift;
  return $self->get_variable('rows');
}


=item count

Return: int or undef

Count of returned docs found during last query.

=cut
sub count {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} ){
    $retval = scalar(@{$self->{AEJS_RESPONSE}{response}{docs}});
  }

  return $retval;
}


=item last_page

Return: int or undef

The page of the...last page.

=cut
sub last_page {

  my $self = shift;
  my $retval = undef;

  my $total = $self->total();
  my $rows = $self->rows_requested();
  if( $total && $rows ){
    $retval = ceil( $total / $rows );
  }

  return $retval;
}


=item docs

Return: docs as aref or undef

The docs found during last query.

=cut
sub docs {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} ){
    $retval = $self->{AEJS_RESPONSE}{response}{docs};
  }

  return $retval;
}


=item first_doc

Return: doc or undef

The first doc found during last query.

=cut
sub first_doc {

  my $self = shift;
  my $retval = undef;

  ## Make sure we got something.
  if( $self->{AEJS_RESPONSE}{response} &&
      $self->{AEJS_RESPONSE}{response}{docs} &&
      $self->{AEJS_RESPONSE}{response}{docs}[0] ){
    $retval = $self->{AEJS_RESPONSE}{response}{docs}[0];
  }

  return $retval;
}


=item _ready_paging

Args: n/a
Return: n/a

A helper function to make sure paging stays sane. Called in first part
of functions that deal with paging.

Changes object state permanently by making sure that index is defined.

=cut
sub _ready_paging {

  my $self = shift;

  ## Our index is either correct or set to 1;
  if( ! defined $self->{AEJS_BASE_HASH}{index} ){
    # $curr_index = $self->{AEJS_BASE_HASH}{index};
    # }else{
    $self->{AEJS_BASE_HASH}{index} = 1;
    #   $curr_index = 1;
  }
}


=item next_page_url

Args: n/a
Return: url for the _next_ "page" on the service.

=cut
sub next_page_url {

  my $self = shift;
  my $returl = undef;

  $self->_ready_paging();

  ## Our current is either correct or set to 1;
  my $curr_index = $self->{AEJS_BASE_HASH}{index};
  $self->{AEJS_BASE_HASH}{index}++;
  $returl = $self->_query_url();
  $self->{AEJS_BASE_HASH}{index} = $curr_index;

  return $returl;
}


=item full_results_url

Args: optional field (as solr fl argument) to be collected
Return: url for the _full_ results of the current query

=cut
sub full_results_url {

  my $self = shift;
  my $fl = shift || undef;

  ## Save our little trip--we're going to need to make some changes.
  my $save = Clone::clone($self->{AEJS_BASE_HASH});

  ## Settings to get everything.
  $self->{AEJS_BASE_HASH}{start} = 0;
  $self->{AEJS_BASE_HASH}{rows} = $self->total();
  if( defined $fl ){
    $self->{AEJS_BASE_HASH}{fl} = $fl;
  }
  my $returl = $self->_query_url();

  ## Restore back to where we began.
  $self->{AEJS_BASE_HASH} = $save;

  return $returl;
}


## No longer have to worry about open connections.
sub DESTROY {
  my $self = shift;
  #if( defined $self->{EXT_DB} ){
  #$self->{EXT_DB}->disconnect();
  #$self->{EXT_DB} = undef;
  #}
}



1;
