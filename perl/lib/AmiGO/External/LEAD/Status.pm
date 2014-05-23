=head1 AmiGO::External::LEAD::Status

...

Usage:
...

=cut

use utf8;
use strict;

package AmiGO::External::LEAD::Status;

use base ("AmiGO::External::LEAD");
use Date::Format;


=item new

...

=cut
sub new {

  ##
  my $class = shift;
  my $args = shift || {};
  my $self = $class->SUPER::new($args);

  ## TODO: 
  $self->{EXT_OKAY_P} = 0;
  $self->{EXT_REL} = undef;
  $self->{EXT_TYPE} = undef;
  if( defined $self->{EXT_DB} ){

    ## Try the risky statments
    my $sql = 'SELECT release_name, release_type FROM instance_data';
    my $statement = undef;
    my $meta_info = undef;
    eval {
      $statement = $self->{EXT_DB}->prepare($sql)
	|| die "preparation failed $DBI::errstr\n";
    };
    eval {
      $statement->execute()
	|| die "execution failed $DBI::errstr\n";
    };
    eval {
      $meta_info = $statement->fetchrow_arrayref()
	|| die "fetch failed $DBI::errstr\n";
      $statement->finish(); # done
    };

    ## Parse out information.
    if( defined $meta_info ){
      $self->{EXT_REL} = $$meta_info[0] if $$meta_info[0];
      $self->{EXT_TYPE} = $$meta_info[1] if $$meta_info[1];
      $self->{EXT_OKAY_P} = 1;
    }
  }

  bless $self, $class;
  return $self;
}


=item alive

...

=cut
sub alive {
  my $self = shift;
  return $self->{EXT_OKAY_P};
}


=item release_name

...

=cut
sub release_name {
  my $self = shift;
  return $self->{EXT_REL} || 'unknown';
}


=item release_type

...

=cut
sub release_type {
  my $self = shift;
  return $self->{EXT_TYPE} || 'unknown';
}


=item try

Unnecessary as this resource is single.

=cut
sub try { 1; }



1;
