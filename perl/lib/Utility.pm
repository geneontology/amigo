=head1 Utility

This is the core Utility class. Right now, it is just responsible for
simple whining to STDOUT.

=cut

package Utility;

## Bring in necessaries.
use utf8;
use strict;

=item new

Constr.

=cut
sub new {

  ##
  my $class = shift;
  my $self = {};

  ## Logging verbosity.
  $self->{VERBOSE} = 0;

  bless $self, $class;
  return $self;
}


=item verbose

Arguments: int

=cut
sub verbose {

  my $self = shift;
  $self->{VERBOSE} = shift || $self->{VERBOSE};
  return  $self->{VERBOSE};
}


=item whine

Prints a message to STDERR if verbose is set.

Arguments: message string, bool (for 1 second pause, useful for
console debugging)
Returns: t if message written, nil otherwise.

=cut
sub whine {
  my $self = shift;
  my $message = shift || '';
  my $pause = shift || 0;
  #my $log = shift || '/srv/www/cgi-bin/amigo_1_5_MAINTENANCE/cgi.log';
  my $retval = 0;

  if( $self->{VERBOSE} ){
    print STDERR "$message\n";
    sleep 1 if $pause;
    $retval = 1;
  }

  return $retval;
}



1;
