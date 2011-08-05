=head1 Utility::TrivialError

Some minimal modular error handling.

=cut


## Bring in necessaries.
use utf8;
use strict;

package Utility::TrivialError;

use base ("Utility");


=item new

Constr.

=cut
sub new {

  ##
  my $class = shift;
  my $self = {};

  ## Internal error detection.
  $self->{SUCCESS} = 1;
  $self->{ERROR_COUNT} = 0;
  $self->{ERROR_MESSAGES} = [];

  bless $self, $class;
  return $self;
}


=item success

Success getter.

=cut
sub success {
  my $self = shift;
  return $self->{SUCCESS};
}


=item _success

One-way setter

=cut
sub _success {
  my $self = shift;
  $self->{SUCCESS} = 1;
}


=item _failure

One-way setter

=cut
sub _failure {
  my $self = shift;
  if (@_) {
    push @{$self->{ERROR_MESSAGES}}, shift;
  }

  $self->{ERROR_COUNT}++;
  $self->{SUCCESS} = 0;
}


=item error_messages

Getter.

Returns the reason(s) for the above error. This function returns an
array ref of strings.

=cut
sub error_messages {
  my $self = shift;
  if (@_) {
    push @{$self->{ERROR_MESSAGES}}, shift;
  }
  return $self->{ERROR_MESSAGES};
}


=item _set_error_message

Setter.
TODO: Add current package to the front of the error message.

=cut
sub _set_error_message {
  my $self = shift;
  if (@_) {
    push @{$self->{ERROR_MESSAGES}}, shift;
  }
  return $self->{ERROR_MESSAGES};
}


=item error_count

Getter.
Returns the number of errors.

=cut
sub error_count {
  my $self = shift;
  return $self->{ERROR_COUNT};
}



1;
