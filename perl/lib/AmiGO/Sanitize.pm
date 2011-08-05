=head1 AmiGO::Sanitize

The idea is to have the GOOSE sanitizer built into AmiGO, hopefully to
have GOOSE move completely move in. Also, this will be useful for
things like completion tools.

BUG/TODO: The error stuff is naive--needs to be folded into something
better.

=cut

package AmiGO::Sanitize;
use base ("AmiGO");

use SQL::Tokenizer;

=item new

Constructor.

=cut
sub new {

  ##
  my $class = shift;
  my $self  = $class->SUPER::new();

  my $args = shift || {};

  ## Defaults.
  $self->{UPPER_LIMIT} = 5000;
  $self->{FULL_QUERY} = 1;

  ## Grab incoming.
  $self->{UPPER_LIMIT} = $args->{UPPER_LIMIT}
    if defined($args->{UPPER_LIMIT});
  $self->{FULL_QUERY} = $args->{FULL_QUERY}
    if defined($args->{FULL_QUERY});

  #$self->verbose(1);

  ##
  $self->{ALREADY_HAS_LIMIT} = 0;

  bless $self, $class;
  return $self;
}


## Does some fixes depending on the input.
sub rationalize {

  my $self = shift;
  my $str = shift || '';

  ## Remove leading and trailing whitespace.
  $str =~ s/^\s+//;
  $str =~ s/\s+$//;

  ## Remove extra inner whitespace.
  $str =~ s/\s+/ /;

  return $str;
}


=item limit_fix

Does some fixes depending on the input--if we're going to use a limit,
let's change the query a little to add the ability to count rows as
well.

NOTE: MYSQL ONLY!

=cut
sub limit_fix {

  my $self = shift;
  my $str = shift || '';
  my $limit = shift || 0;

  ## If we haven't already added the calc, add it.
  if ( $str !~ /\s+SQL_CALC_FOUND_ROWS\s+/i ){
    $str =~ s/SELECT/SELECT SQL_CALC_FOUND_ROWS/i;
  }

  ## Semicolon check and add limit.
  if ( ! $self->{ALREADY_HAS_LIMIT} ) {
    $str =~ tr/\;//d;
    $str = $str . ' LIMIT ' . $limit . ';';
  }

  return $str;
}

=item add_limit

Does some fixes depending on the input.
If we're going to use a limit, let's change the query a little:

NOTE: Should work for all SQL.

=cut
sub add_limit {

  my $self = shift;
  my $str = shift || '';
  my $limit = shift || 0;

  ## Semicolon check and add limit.
  if ( ! $self->{ALREADY_HAS_LIMIT} ) {
    $str =~ tr/\;//d;
    $str = $str . ' LIMIT ' . $limit . ';';
  }

  return $str;
}

## Is the incoming string fishy?
sub check {

  my $self = shift;
  my $str = shift || '';

  ## Length check (sorry about the early return)...
  if( length($str) > $self->{UPPER_LIMIT} ){
    $self->set_error_message("illegal query value");
    return;
  }

  my @tokens = SQL::Tokenizer->tokenize($str);

  ## Better start with select.
  #$self->whine("__$tokens[0]__\n");

  if( $self->{FULL_QUERY} ){
    $self->set_error_message("There was something odd in your query (a).")
      if $tokens[0] !~ /^SELECT$/i;
  }

  ## Check for other odd things.
  my $unbalanced_paren = 0;
  my $single_quotes = 0;
  my $double_quotes = 0;
  my $number_of_selects = 0;
  foreach my $token (@tokens){

    $unbalanced_paren++ if $token =~ /^\($/;
    $unbalanced_paren-- if $token =~ /^\)$/;
    $double_quotes++ if $token =~ /^\"$/;
    $single_quotes++ if $token =~ /^\'$/;

    $self->{ALREADY_HAS_LIMIT}++ if $token =~ /^LIMIT$/i;

    ## Better start with select.
    $self->whine("token: $token");

    if( $token =~ /^ADD$/i ||
	$token =~ /^ALTER$/i ||
	$token =~ /^BACKUP$/i ||
	$token =~ /^CACHE$/i ||
	$token =~ /^CALL$/i ||
	$token =~ /^CHANGE$/i ||
	$token =~ /^CREATE$/i ||
	$token =~ /^DEALLOCATE$/i ||
	$token =~ /^DELETE$/i ||
	$token =~ /^DO$/i ||
	$token =~ /^DROP$/i ||
	$token =~ /^EXECUTE$/i ||
	$token =~ /^FETCH$/i ||
	$token =~ /^GRANT$/i ||
	$token =~ /^HANDLER$/i ||
	$token =~ /^INSERT$/i ||
	$token =~ /^KILL$/i ||
	$token =~ /^LOAD$/i ||
	$token =~ /^LOCK$/i ||
	$token =~ /^OPEN$/i ||
	$token =~ /^PASSWORD$/i ||
	$token =~ /^PREPARE$/i ||
	$token =~ /^PURGE$/i ||
	$token =~ /^RENAME$/i ||
	$token =~ /^REPAIR$/i||
	$token =~ /^REPLACE$/i ||
	$token =~ /^RESET$/i ||
	$token =~ /^RESTORE$/i ||
	$token =~ /^RETURN$/i ||
	$token =~ /^REVOKE$/i ||
	$token =~ /^SET$/i ||
	$token =~ /^SHOW$/i ||
	$token =~ /^TABLE$/i ){

      ## Things that may be questionable.
      $self->set_error_message("There was something odd in your query (b).");

    }elsif( $token =~ /^SELECT$/i ){

      ## I don't want to see a lot of selects. Now limited to main
      ## select and three sub selects. TODO: is this catch even useful
      ## anymore? I've upped this twice now...
      $number_of_selects++;
      if( $number_of_selects > 4 ){
	$self->set_error_message("There was something odd in your query (c).");
      }

    }elsif( $token =~ /^[\"].*[^\"]$/ ||
	    $token =~ /^[\'].*[^\']$/ ||
	    $token =~ /^[^\"].*[\"]$/ ||
	    $token =~ /^[^\'].*[\']$/ ||
	    $token =~ /^[\'\"]$/ ){

      ## I don't want to see oddly matched or single quotes in a
      ## token.
      $self->set_error_message("There was something odd in your query (d).");

    }elsif( $token =~ /^[\"](.*)[\"]$/ ||
	    $token =~ /^[\'](.*)[\']$/  ){

      ## I don't want to see quotes inside quotes.
      if( $1 =~ /[\"\']/ ){
	$self->set_error_message("There was something odd in your query (e).");
      }

      ## I don't want to see comments inside quotes.
      if( $1 =~ /--/ ){
	$self->set_error_message("There was something odd in your query (f).");
      }

      ## I don't want to see escapes inside quotes.
      if( $1 =~ /\\/ ){
	$self->set_error_message("There was something odd in your query (g).");
      }

    }elsif( $token =~ /\\/ ){

      ## You can do funny things with escapes.
      $self->set_error_message("There was something odd in your query (h).");

    }elsif( $token =~ /--/ ){

      ## You can do funny things with comments.
      $self->set_error_message("Please remove your comments before trying the query.");

    }else{
      ## Clear token.
    }
  }

  ## TODO: check quotes and balance? It seems that the token parser
  ## drops a lot of the weirdness before we even get here...
  $self->set_error_message("Your query is unbalanced (a).")
    if $unbalanced_paren != 0;
  $self->set_error_message("Your query is unbalanced (b).")
    if ($double_quotes % 2) != 0;
  $self->set_error_message("Your query is unbalanced (c).")
    if ($single_quotes % 2) != 0;

  #return join ' ', @tokens;
}


##
sub success {
  my $self = shift;
  return $self->{TRIVIAL_ERROR}->success;
}


##
sub error_messages {
  my $self = shift;
  return $self->{TRIVIAL_ERROR}->error_messages;
}



1;
