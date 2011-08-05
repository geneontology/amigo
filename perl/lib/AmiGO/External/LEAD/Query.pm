=head1 AmiGO::External::LEAD::Query

Very low level SQL handling-as-client that tries to be safe for the
server (i.e. the incoming SQL may not be trusted). It also tries to
surrender as little information as possible while prevent death as
much as possible (hopefully preventing schema probes).

=cut

package AmiGO::External::LEAD::Query;

use base 'AmiGO::External::LEAD';
use AmiGO::Sanitize;


=item new

Low level handler constructor. Requires connection hashref info and
optional input size limit

Usage: ...

=cut
sub new {

  ##
  my $class = shift;
  my $dbargs = shift || {};
  my $limit = shift;
  my $max_query_len = shift;
  my $self  = $class->SUPER::new($dbargs);

  ## Zero and undef are different. If nothing is really there, default
  ## to 1000.
  if( ! defined($limit) ){
    $limit = 1000;
    $self->kvetch("using default limit: " . $limit);
  }

  ## Zero and undef are different. If nothing is really there, default
  ## to 5000.
  if( ! defined($max_query_len) ){
    $max_query_len = 5000;
    $self->kvetch("using default query length: " . $max_query_len);
  }

  ## Set up sanitizer.
  $self->{LIMIT} = $limit;
  $self->{SANE} = AmiGO::Sanitize->new({
					UPPER_LIMIT => $max_query_len,
					FULL_QUERY => 1,
				       });

  ## TODO: Look for database configuration file, read it in, enjoy.

  bless $self, $class;
  return $self;
}


=item try

Takes an SQL string (and an optional limit) and returns a 2d arrayref
of results (undef if nothing).  This function will die in innumerable
ways if upset.

After successfully running this, you can call count and headers.

=cut
sub try {

  my $self = shift;
  my $in_sql = shift || '';

  my $retval = undef;

  ##
  if( $in_sql ){

    my $sane = $self->{SANE};
    my $limit = $self->{LIMIT};

    $in_sql = $sane->rationalize($in_sql);
    $sane->check($in_sql);
    $in_sql = $sane->limit_fix($in_sql, $limit) if $limit;

    ## If something went wrong with the sanitation, do a hard bail
    ## while passing the errors out. Keep in mind that sane and amigo
    ## are using separate (but very similar) error passing here.
    if( ! $sane->success() ){
      my $errors = $sane->error_messages;
      if( scalar($errors) ){
	my $error = pop @$errors;
	$self->set_error_message($error);
      }else{
	$self->set_error_message("There was an unknown error...");
      }
    }else{

      ## If it looks like the SQL is sane, run it.
      ## TODO
      ## Scrape out results.
      my $statement = undef;
      eval {
	$statement = $self->{EXT_DB}->prepare($in_sql)
	  or $self->set_error_message("Couldn't prepare query.");
	#or die "Couldn't prepare query";
	$statement->execute()
	  or $self->set_error_message("Couldn't run, possibly bad SQL syntax.");
	#or die "Couldn't run query, possibly bad SQL syntax";
      };
      if( $@ ){
	## Slightly lighter than dying...still not happy about
	## multiple exits...
	#die "There seems to be something wrong in your syntax...: " . $@;
	$self->set_error_message($@);
	return $retval;
      }

      if( $self->ok() ){

	## Cache so we can pull it out later.
	$self->{STMNT_HEADER_STRINGS} = $statement->{NAME};

	## Here we are, statement is probably good.
	$retval = [];
	while( my $row = $statement->fetchrow_arrayref() ){
	  #$self->kvetch("_row_: " . join(" ", @$row));
	  my $buf = [];
	  foreach my $col (@$row){
	    push @$buf, $col;
	  }
	  push @$retval, $buf;
	}
	$statement->finish() if $statement;
      }
    }
  }

  return $retval;
}


=item headers

Get an arrayref of header strings.

=cut
sub headers {
  my $self = shift;
  return $self->{STMNT_HEADER_STRINGS};
}



1;
