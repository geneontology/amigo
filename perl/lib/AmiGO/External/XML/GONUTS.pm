=head1 AmiGO::External::XML::GONUTS

Defines a specific interface to contact the GONUTS website.

=cut

use utf8;
use strict;

package AmiGO::External::XML::GONUTS;

use base ("AmiGO::External::XML");
use Date::Format;


=item $URL_FOR_GONUTS

This is the URL that points to the GONUTS data source.

=cut
my $URL_FOR_GONUTS = 'http://gowiki.tamu.edu/rest/is_edited.php';


=item new

# Currently marks a year as the cutoff.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  my $args = shift || {};
  my $cutoff_time = 0;
  $cutoff_time = $args->{cutoff_time} if defined $args->{cutoff_time};

  $self->{DATE_STRING} = '';
  $self->{PRETTY_DATE_STRING} = '';

  my @rlt = localtime(time - $cutoff_time);
  if( $cutoff_time ){
    $self->{DATE_STRING} = strftime("%Y%m%d", @rlt);
    $self->{PRETTY_DATE_STRING} = strftime("%m/%d/%Y", @rlt);
  }else{
    $self->{DATE_STRING} = undef;
    $self->{PRETTY_DATE_STRING} = 'today';
  }

  bless $self, $class;
  return $self;
}

=item query_term

# Get comments from GONuts.
my $gn = AmiGO::External::GONuts->new({cutoff_time => 31536000});
my $t = $gn->query_term('GO:0008150');

## Print out XML to STDERR.
print STDERR $t . "\n";

=cut
sub query_term {

  my $self = shift;
  my $gid = shift || undef;
  my $date_str = $self->{DATE_STRING};

  ## Assemble URL if we can.
  my $url = '';
  if( defined($gid) && $gid =~ /GO\:\d{7}/ ){
    $url = $URL_FOR_GONUTS . '?id=' . $gid;
    if( defined($date_str) && $date_str =~ /\d{8}/ ){
      $url .= '&date=' . $date_str;
    }else{
      my $bad_date = '';
      $bad_date = $date_str if defined($date_str);
      $self->kvetch("GONUTS: ill-formed date/no date: $bad_date");
    }
  }else{
      my $bad_gid = '';
      $bad_gid = $gid if defined($gid);
      $self->kvetch("GONUTS: ill-formed GO id/no GO id: $bad_gid");
  }

  ## If we got the URL together properly, go get it.
  my $ret = undef;
  if( length($url) > 0 ){
    $ret = $self->get_external_data($url);
  }

  return $ret;
}


=item get_page_url

Return the URL string.

=cut
sub get_page_url {
  my $self = shift;
  return $self->try('/message/revision_data/url', '');
}


=item get_date_string

Return a pretty string for the cuttoff.

=cut
sub get_date_string {
  my $self = shift;
  return $self->{PRETTY_DATE_STRING};
}


=item get_page_title

Return the title string.

=cut
sub get_page_title {
  my $self = shift;
  return $self->try('/message/revision_data/page_title', '');
}


=item get_total_count

Return total count of wiki comments.

=cut
sub get_total_count {
  my $self = shift;
  my $path_str = '/message/revision_data/revisions/total';
  return $self->atoi($self->try($path_str, '0')) || 0;
}


=item get_recent_count

Return count of wiki comments since date (if given).

=cut
sub get_recent_count {
  my $self = shift;
  my $path_str = '/message/revision_data/revisions/after/count';
  return $self->atoi($self->try($path_str, '0')) || 0;
}



1;
