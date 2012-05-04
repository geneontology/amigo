=head1 AmiGO::External::JSON::Solr::GOlr::Search

...

=cut

package AmiGO::External::JSON::Solr::GOlr::Search;
use base ("AmiGO::External::JSON::Solr::GOlr");

use utf8;
use strict;
use Data::Dumper;


=item new

#

=cut
sub new {

  ## Pass the buck back for getting a sensible default.
  my $class = shift;
  my $target = shift || undef;
  my $self = $class->SUPER::new($target);

  bless $self, $class;
  return $self;
}


=item smart_query

Arguments: simple query string, a golr class id str, and (optional) page num.
Return: true or false on minimal success

edismax built through our config hash

mostly runs off of Solr::query

=cut
sub smart_query {

  my $self = shift;
  my $qstr = shift || die "smart_query requires a q";
  my $gc_id = shift || die "smart_query requires a golr conf class id";
  my $page = shift || 1;

  # ## Paging will be part of our world, so get ready.
  # $self->_ready_paging();

  ## TODO: Manipulate the config to get the hash.
  $self->kvetch("query with: " . $qstr);
  $self->kvetch("looking in: " . $gc_id);
  my $gconf = $self->golr_configuration();
  #$self->kvetch("conf: " . Dumper($gconf));

  ## 
  my $retval = 0;
  if( ! defined $gconf->{$gc_id} ){
    $self->kvetch("rotten document conf id: " . $gc_id);
  }else{

    ## Grab the main nutrients. Let's assumed that nobody screwed up
    ## the format. Now we need to break it down, see if there are any
    ## searchable fields to use, transfer to them, and reassemble.
    my $dfab = $gconf->{$gc_id}{default_fields_and_boosts};
    my @fields = split /\s+/, $dfab;
    my $fixed_boosts = [];
    #my $fields_to_search = [];
    my $search_ext = $self->golr_class_searchable_extension($gc_id);
    foreach my $f (@fields){
      my($field, $boost) = split /\^/, $f;

      ## TODO: Check to see if the field is searchable, and if it is,
      ## add the extension.
      if( $self->golr_class_field_searchable_p($gc_id, $field) ){
	$field = $field . $search_ext;
      }

      ## 
      #push @$fields_to_search, $field;
      push @$fixed_boosts, $field . '^' . $boost;
    }
    my $final_dfab = join ' ', @$fixed_boosts;

    ## TODO: Fold the hash into what we have.
    $self->{AEJS_BASE_HASH}{qf} = $final_dfab;
    $self->{AEJS_BASE_HASH}{defType} = 'edismax';
    $self->{AEJS_BASE_HASH}{fq} =
      'document_category:"' . $self->golr_class_document_category($gc_id) . '"';
    $self->{AEJS_BASE_HASH}{hl} = 'true';
    $self->{AEJS_BASE_HASH}{'hl.simple.pre'} = '<em class="hilite">';
    #$self->{AEJS_BASE_HASH}{'hl.simple.post'} = '</em>';
    #$self->{AEJS_BASE_HASH}{hl.fl} = '*';
    $self->{AEJS_BASE_HASH}{q} = $qstr;

    ## Calculate any necessary paging.
    my $nrows = $self->get_variable('rows') || 10;
    $self->{AEJS_BASE_HASH}{start} = ($nrows * $page) - $nrows;

    ## Call the main engine.
    $retval = $self->query();
  }

  return $retval;
}


=item more_p

Return: 0 or 1

Returns whether or not an additional "paging" would return more
results with the current start/rows settings.

=cut
sub more_p {

  my $self = shift;
  my $retval = 1;

  ## Make sure we got something.
  my $num_rows = $self->get_variable('rows') || 10;
  my $current_returned = $self->count() || 10;
  if( $num_rows > $current_returned ){
    $retval = 0;
  }

  return $retval;
}



1;
