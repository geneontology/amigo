=head1 AmiGO::JSON

Wrapper for the standard AmiGO JSON return object.

success : success/errors in the server handling
errors : errors in the data returned
warnings: warnings in the data returned

=cut

package AmiGO::JSON;

use base 'AmiGO';
use utf8;
use strict;
use Data::Dumper;


=item new



=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();
  my $type  = shift || die "must declare type: $!";

  #$self->{JSON_success} = 1;
  $self->{JSON_type} = $type;
  $self->{JSON_errors} = [];
  $self->{JSON_warnings} = [];
  $self->{JSON_info} = [];
  $self->{JSON_results} = {};
  $self->{JSON_arguments} = {};

  bless $self, $class;
  return $self;
}


=item add_error

Arg: string

=cut
sub add_error {

  my $self = shift;
  my $error = shift || '';

  ##
  push @{$self->{JSON_errors}}, $error;
}


=item add_warning

Arg: string

=cut
sub add_warning {

  my $self = shift;
  my $warn = shift || '';

  ##
  push @{$self->{JSON_warnings}}, $warn;
}


=item add_info

Arg: string

=cut
sub add_info {

  my $self = shift;
  my $info = shift || '';

  ##
  push @{$self->{JSON_info}}, $info;
}


# =item failed

# Arg: bool

# =cut
# sub failed {

#   my $self = shift;
#   my $bool = shift;

#   ##
#   if( defined $bool && $bool == 1 ){
#     $self->{JSON_success} = 0;
#   }
# }


=item set_results

Arg: string

=cut
sub set_results {

  my $self = shift;
  my $res = shift || {};

  ##
  $self->{JSON_results} = $res;
}


=item set_arguments

Arg: string

=cut
sub set_arguments {

  my $self = shift;
  my $args = shift || {};

  ##
  $self->{JSON_arguments} = $args;
}


=item render

Args: a perl data scalar and name.
Returns: a JSONified string.

TODO: Switch to more complete JSON backend once packages reach Ubuntu.

=cut
sub render {
  my $self = shift;

  ## Assemble.
  my $perl_var =
    {
     #success => $self->{JSON_success},
     type => $self->{JSON_type},
     errors => $self->{JSON_errors},
     warnings => $self->{JSON_warnings},
     results => $self->{JSON_results},
     arguments => $self->{JSON_arguments},
    };

  #$perl_var = {};
  #$self->kvetch('JSON output perl_var: ' . Dumper($perl_var));
  my $retval = $self->render_json($perl_var);
  return $retval;
}



1;
