=head1 AmiGO

This is the core AmiGO class. It is responsible for simple error
handling, environment (including config.pl variables), and getting in
all of the install-time DB meta data. Most other tasks should be left
to subclasses.

TODO: Perhaps simple error should be taken out and the Messaging stuff
should be core in here. Then again, maybe it should just be left as
the internal fault checker...maybe an array instead of just the last
error message?

TODO: This should all be made ENV safe. Should this core file should
still behave well in a non-installed AmiGO environment; all core
functions having non-env overrides?

=cut

package AmiGO;

## Try to get the local environment sane. This is necessary for *any*
## operation, so we're really going to die.
BEGIN {
  require "config.pl" if -f "config.pl" ;
}


## Bring in necessaries.
use utf8;
use strict;
use POSIX qw(strftime floor);
use Data::Dumper;

use URI::Escape;
#use JSON;
#use JSON::PP;
use JSON::XS;
use Data::UUID;
use List::Util 'shuffle';

## Trying to work with YAML.
use Config::YAML;

## File type guessing games.
#use File::MMagic;
use File::Type;
use FileHandle;

use FreezeThaw qw(freeze thaw);


## TODO: Make sure that the variables that must be defined for a sane
## environment are defined.


=item new

Constr.

=cut
sub new {

  ##
  my $class = shift;
  my $self = {};

  ## Internal JSON libraries; choose between the XS and pure perl.
  if( 0 == 1 ){
    # $self->{JSON} = JSON->new();
    # $self->{JSON_TRUE} = JSON::true;
    # $self->{JSON_FALSE} = JSON::false;
  }else{
    #$self->{JSON_PP} = JSON::PP->new();
    # $self->{JSON_TRUE} = JSON::PP::true;
    # $self->{JSON_FALSE} = JSON::PP::false;
    # $self->{JSON}->allow_bignum(1);
    $self->{JSON} = JSON::XS->new();
    $self->{JSON_TRUE} = JSON::XS::true;
    $self->{JSON_FALSE} = JSON::XS::false;
    #$self->{JSON}->allow_bignum(1); # if needed, go back to ::PP
  }

  $self->{UUID_SOURCE} = Data::UUID->new();

  ## Internal caching.
  $self->{MISC_KEYS} = undef;
  $self->{SPECIES} = undef;
  $self->{SOURCE} = undef;
  $self->{GPTYPE} = undef;
  $self->{ONTOLOGY} = undef;
  $self->{SUBSET} = undef;
  $self->{DB_INFO} = undef;
  $self->{EVCODES} = undef;
  $self->{RELATIONS} = undef;
  $self->{RELEASE_NAME} = undef;
  $self->{RELEASE_TYPE} = undef;
  $self->{GOOGLE_ANALYTICS_ID} = undef;

  ## Standard internal error checking.
  $self->{ERROR_MESSAGE} = undef;

  ## Logging verbosity.
  $self->{VERBOSE} = int(amigo_env($self, 'AMIGO_VERBOSE') || '0');
  #print STDERR "___" . $self->{VERBOSE} . "\n";

  bless $self, $class;
  return $self;
}


###
### Resource reader.
###

# =item read_config_resource

# Returns a hash object with the correct defaults from the GOlr config files.

# =cut
# sub read_config_resource {

#   my $self = shift;
# }


###
### GO database connection.
###


=item db_connector

Returns an array for connecting to the database described in the GO_*
environment.

NOTE: MySQL only.

DEPRECATED?

=cut
sub db_connector {

  my $self = shift;

  my $check = sub {
    my $str = shift || '';
    my $retval = 0;
    if( $ENV{$str} && defined($ENV{$str}) &&  length($ENV{$str}) ){
      $retval = 1;
    }
    return $retval;
  };

  my @mbuf = ();
  if( &$check('GO_DBSOCKET') ){
    push @mbuf, 'mysql_socket=' . $ENV{GO_DBSOCKET};
  }
  if( &$check('GO_DBNAME') ){
    push @mbuf, 'database=' . $ENV{GO_DBNAME};
  }
  if( &$check('GO_DBHOST') ){
    push @mbuf, 'host=' . $ENV{GO_DBHOST};
  }
  if( &$check('GO_DBPORT') ){
    push @mbuf, 'port=' . $ENV{GO_DBPORT};
  }
  my $dsn = join ';', @mbuf;
  $dsn = 'dbi:mysql:' . $dsn;

  $self->kvetch("dsn " . $dsn);

  ##
  my $retref = [];
  push @$retref, $dsn;

  ## Credentials and add them to the return.
  # $ENV{GO_DBPASS};
  push @$retref, $ENV{GO_DBUSER};
  push @$retref, $ENV{GO_DBAUTH};

  return @$retref;
}


###
### General convenience.
###


=item html_safe

Arguments: string
Returns: HTML-safe escaped string

Stolen from CGI.pm with some modification. It is disappointingly small.

TODO: This can be more extensive. Much more extensive.

=cut
sub html_safe {

  my $self = shift;
  my $string = shift || '';

  $string =~ s{&}{&amp;}gso;
  $string =~ s{<}{&lt;}gso;
  $string =~ s{>}{&gt;}gso;
  $string =~ s{"}{&quot;}gso;
  #%23 is a # (hash)
  #$string =~ s{\ }{%20}gso;
  #$string =~ s{\n}{\ }gso;
  #   my $latin = uc $self->{'.charset'} eq 'ISO-8859-1' ||
  #     uc $self->{'.charset'} eq 'WINDOWS-1252';
  #   if ($latin) {  # bug in some browsers
  #     $string =~ s{'}{&#39;}gso;
  #     $string =~ s{\x8b}{&#8249;}gso;
  #     $string =~ s{\x9b}{&#8250;}gso;
  #     if (defined $newlinestoo && $newlinestoo) {
  #       $string =~ s{\012}{&#10;}gso;
  #       $string =~ s{\015}{&#13;}gso;
  #     }
  #   }
  return $string;
}


=item html_break_safe

Arguments: string
Returns: HTML string with spaces converted to "&nbsp;"

=cut
sub html_break_safe {

  my $self = shift;
  my $string = shift || '';

  $string =~ s/\s/\&nbsp\;/g;

  return $string;
}


=item unique_id

Arguments: n/a
Returns: A universally unique id (a string) for any use.

=cut
sub unique_id {

  my $self = shift;
  return $self->{UUID_SOURCE}->to_string( $self->{UUID_SOURCE}->create() );
}


=item uri_safe

Arguments: string
Returns: uri-safe escaped string

=cut
sub uri_safe {

  my $self = shift;
  my $string = shift || '';
  return uri_escape($string);
}


=item term_regexp

Return: a term-matching regexp.

=cut
sub term_regexp {

  my $self = shift;
  my $rstr = $self->amigo_env('AMIGO_TERM_REGEXP');
  return qr/$rstr/;
}


=item is_term_acc_p

Return: 0 or 1 on string input

=cut
sub is_term_acc_p {

  my $self = shift;
  my $str = shift || "";
  my $regexp = $self->amigo_env('AMIGO_TERM_REGEXP');
  return $str =~ /$regexp/;
}


=item term_regexp_string

Return: a string that can be used to compile a term-matching regexp.

=cut
sub term_regexp_string {

  my $self = shift;
  return $self->amigo_env('AMIGO_TERM_REGEXP');
}


=item dbxref_db_regexp_string

Return: a string that can be used to compile a regexp that matches a
dbxref database name.

=cut
sub dbxref_db_regexp_string {
  my $self = shift;
  return '[\w\d\-\_\.\/]+';
}


=item dbxref_key_regexp_string

Return: a string that can be used to compile a regexp that matches a
dbxref database key.

=cut
sub dbxref_key_regexp_string {
  my $self = shift;
  return '[\w\d\:\-\_\.\/\(\)\+\,\'\\\[\]\|\?]+';
}


=item clean_term_list

Arg: a string with or without whitespace defining one or more go ids
Return: a clean aref of go term ids.

=cut
sub clean_term_list {

  my $self = shift;

  my $in_str = shift || '';
  my @ret_list = ();

  ## Fish out all of the good terms in the string.
  my $regexp = $self->term_regexp_string();
  @ret_list = $in_str =~ /($regexp)/g;

  $self->kvetch("" . scalar(@ret_list));

  return \@ret_list;
}


=item clean_list

Arg: a string with or without whitespace defining one or more ids
Return: a clean aref of ids.

=cut
sub clean_list {

  my $self = shift;

  my $in_str = shift || '';
  my @ret_list = ();

  ## TODO: is there a more robust detection possible like in the case
  ## (above) of terms?
  #@ret_list = split(' ', $in_str);
  $in_str =~ s/^[\r\s]+//;
  $in_str =~ s/[\r\s]+$//;
  $in_str =~ s/[\r\s]+/\n/g;
  @ret_list = split /\s+/, $in_str;

  $self->kvetch("" . scalar(@ret_list));

  return \@ret_list;
}


=item split_gene_product_acc

Arg: a gene product string
Return: an array with dbname first and key second

=cut
sub split_gene_product_acc {

  my $self = shift;

  my $in_str = shift || '';
  #my @ret_list = ();

  ## Assemble regexp from variables.
  my $db = $self->dbxref_db_regexp_string();
  my $key = $self->dbxref_key_regexp_string();

  ##
  $in_str =~ /^($db)\:($key)$/;
  # $self->kvetch("$1:$2");
  return ($1, $2);
}


=item atoi

Anything to integer
from perliac

=cut
sub atoi {

  my $self = shift;
  my $t = 0;
  foreach my $d (split(//, shift())) {
    $t = $t * 10 + $d;
  }
  return $t;
}


###
### Environment.
###

=item google_analytics_id

Arguments: /
Returns: empty string, or the google analytics id string

Searches for the existance of a google analytics file (.analytics.json) in the cgi directory. if found, read in the file and extract the id.

=cut
sub google_analytics_id {

  my $self = shift;

  my $retval = '';

  ## Use the cache if it is there. And keep trying (if somebody
  ## changes it after install).
  if( ! defined $self->{GOOGLE_ANALYTICS_ID} ||
      defined $self->{GOOGLE_ANALYTICS_ID} eq '' ){
    $self->{GOOGLE_ANALYTICS_ID} =
      $self->amigo_env('google_analytics_id') || '';
  }

  return $self->{GOOGLE_ANALYTICS_ID};
}


=item amigo_env

Gets an environmental variable, including (and specically for)
variables designated in config.pl.

Arguments: name string/<>
Returns: value string/hash pointer

=cut
sub amigo_env {
  my $self = shift;
  my $var = shift;

  my $retval = undef;
  if ( $var && defined($ENV{uc('AMIGO_' . $var)})) {
    $retval = $ENV{uc('AMIGO_' . $var)};
  }elsif ( $var && defined($ENV{uc('GO_' . $var)})) {
    $retval = $ENV{uc('GO_' . $var)};
  }elsif ( $var && defined($ENV{uc($var)})) {
    ## A "nice" fallback.
    $retval = $ENV{uc($var)};
  }elsif ( ! defined($var) ){
    ## Fallback and try and find old "GO_"-style variables.
    $retval = {};
    foreach my $k (%ENV){
      if( $k =~ /^GO_(.+)/ ){
	$retval->{$1} = $ENV{$k};
      }
    }
  }

  return $retval;
}


###
### Messages and verbosity.
###


=item verbose_p

Whether or not the AMIGO_VERBOSE variable has been set.

Return 1 or 0;

=cut
sub verbose_p {

  my $self = shift;
  my $retval = 0;
  $retval = 1 if defined($self->{VERBOSE}) && $self->{VERBOSE};
  return $retval;
}


=item kvetch

Prints a message to STDERR if AMIGO_VERBOSE is set.
If the log/kvetch.log files exists, it writes to that instead.

Arguments: message string, bool (for 1 second pause, useful for
console debugging)
Returns: t if message written, nil otherwise.

=cut
sub kvetch {
  my $self = shift;
  my $message = shift || '';
  my $pause = shift || 0;

  ## Only do stuff on verbose.
  my $retval = 1;
  if( $self->verbose_p() ){


    my $now = POSIX::strftime("%H:%M:%S", localtime);

    ## Add paerent caller package to top of message if
    ## possible. Otherwise, as much as we can...
    my $final_str = "";
    #my $caller = (caller(1))[0];
    my $subroutine = (caller(1))[3];
    #if( defined $caller || defined $subroutine ){
    if( defined $subroutine
	&& $subroutine ne ''
	&& $subroutine ne '::' ){
      #$caller = '?' if ! defined $caller;
      #$subroutine = '?' if ! defined $subroutine;
      #$final_str = "[$now] $caller" . '::' . "$subroutine: $message\n";
      $final_str = "[$now] $subroutine: $message\n";
    }else{
      $final_str = "[$now] $message\n";
    }

    ## File logging handling.
    my $ald = $self->amigo_env('AMIGO_LOG_DIR') || '';
    my $log = $ald . '/kvetch.log';
    if( -f $log && -w $log ){
      eval{
	my $fh = FileHandle->new(">>$log");
	$fh->autoflush(1);
	$fh->print($final_str);
	undef $fh;
      };
      if( $@ ){
	$retval = 0;
	# print STDERR "AmiGO: kvetch: $@";
      }
    }else{
      ## Log to console/STDERR.
      print STDERR $final_str;
    }

    ## Pause if we want.
    sleep 1 if $pause;
  }

  return $retval;
}


# ###
# ### Pre-rendering.
# ###


# =item url_pre_render

# Args: string of filename
# Decides whether or not a file a page has been pre-rendered.
# Returns undef or url.

# =cut
# sub url_pre_render {

#   my $self = shift;
#   my $fname = shift;
#   my $ret_url = undef;

#   my $file_back_half = '/' . $fname;
#   my $complete_file_pr_url =
#     $self->amigo_env('AMIGO_PRE_RENDER_URL') . $file_back_half;
#   my $complete_file_pr_file =
#     $self->amigo_env('AMIGO_PRE_RENDER_DIR') . $file_back_half;

#   if( -f $complete_file_pr_file ){
#     $ret_url = $complete_file_pr_url;
#   }

#   return $ret_url;
# }


# =item file_pre_render

# Args: string of filename
# Decides whether or not a file a page has been pre-rendered.
# Returns undef or page contents.

# =cut
# sub file_pre_render {

#   my $self = shift;
#   my $fname = shift;
#   my $ret_file = undef;

#   my $file_back_half = '/' . $fname;
#   my $complete_file_pr_file =
#     $self->amigo_env('AMIGO_PRE_RENDER_DIR') . $file_back_half;

#   if( -f $complete_file_pr_file ){

#     open(FILE, $complete_file_pr_file)
#       or die "Cannot open $complete_file_pr_file: $!";

#     my @buf = ();
#     while (<FILE>) {
#       push @buf, $_;
#     }
#     $ret_file = join '', @buf;
#   }

#   return $ret_file;
# }


###
### HTTP
###


sub status_error_client{ print "Status: 400 Bad Request\n"; }
sub status_error_server{ print "Status: 500 Internal Server Error\n"; }
sub html_header{ print "content-type:text/html\n\n"; }
sub tab_header{ print "content-type:text/plain\n\n"; }
sub xml_header{ print "content-type:text/xml\n\n"; }
sub unknown_header{ print "content-type:unknown\n\n"; }


###
### Instance data.
###


# =item release_name

# return a release name string

# =cut
# sub release_name {

#   my $self = shift;
#   if( ! defined($self->{MISC_KEYS}) ){
#     ($self->{MISC_KEYS}) = _read_frozen_file($self, '/misc_keys.pl');
#   }
#   return $self->{MISC_KEYS}{instance_data}{release_name};
# }


# =item release_type

# return a release type string

# =cut
# sub release_type {

#   my $self = shift;
#   if( ! defined($self->{MISC_KEYS}) ){
#     ($self->{MISC_KEYS}) = _read_frozen_file($self, '/misc_keys.pl');
#   }
#   return $self->{MISC_KEYS}{instance_data}{release_type};
# }


###
### Evidence codes.
###


# =item evidence_codes

# return an array ref of the evidence codes

# =cut
# sub evidence_codes {

#   my $self = shift;
#   if( ! defined($self->{MISC_KEYS}) ){
#     ($self->{MISC_KEYS}) = _read_frozen_file($self, '/misc_keys.pl');
#   }
#   return $self->{MISC_KEYS}{evcode};
# }


# =item evidence_codes_sans

# Arg: an array ref of evcode strings
# Return: an array ref of the evidence codes without the ones listed in the arg

# =cut
# sub evidence_codes_sans {

#   my $self = shift;
#   my $sans_codes = shift || [];

#   my $new_list = [];
#   my %skip_cache = ();

#   foreach my $ev (@$sans_codes){
#     $skip_cache{$ev} = 1;
#   }

#   foreach my $ev ( @{$self->evidence_codes()} ){
#     push @$new_list, $ev if ! defined( $skip_cache{$ev} );
#   }

#   return $new_list;
# }


# =item experimental_evidence_codes

# The list of experimental evidence codes.

# =cut
# sub experimental_evidence_codes {

#   my $self = shift;
#   return $EXP_EVCODES;
# }


# =item iss_evidence_codes

# The list of ISS evidence codes.

# =cut
# sub iss_evidence_codes {

#   my $self = shift;
#   return $ISS_EVCODES;
# }


# =item experimental_evidence_hash

# The hash of experimental evidence codes.

# =cut
# sub experimental_evidence_hash {

#   my $self = shift;
#   my %experimental_evcodes = ();
#   foreach ( @{$EXP_EVCODES} ){
#     $experimental_evcodes{$_} = 1;
#   }

#   return \%experimental_evcodes;
# }


# =item iss_evidence_hash

# The hash of iss evidence codes.

# =cut
# sub iss_evidence_hash {

#   my $self = shift;
#   my %iss_evcodes = ();
#   foreach ( @{$ISS_EVCODES} ){
#     $iss_evcodes{$_} = 1;
#   }

#   return \%iss_evcodes;
# }

###
### Species, source, gptype, ontology.
###

# =item species

# Return href of species_strings => species_id

# =cut
# sub species {

#   my $self = shift;

#   if( ! defined($self->{SPECIES}) ){

#     my ($ret_hash) = _read_frozen_file($self, '/spec_keys.pl');

#     ## Full names versus contractions (lift from Amelia's original).
#     #if ($self->get_saved_param('use_full_spp_names') eq 'no'){
#     if ( 1 == 1 ){
#       # truncate the genus to a single letter
#       foreach my $h (values %$ret_hash){
# 	if ($h->[1]){
# 	  $h = substr($h->[0], 0, 1).". ".$h->[1];
# 	}else{
# 	  $h = $h->[0];
# 	}
#       }
#     }else{
#       $_ = join(" ", @$_) foreach values %$ret_hash;
#     }

#     $self->{SPECIES} = $ret_hash;
#   }

#   ## BUG?: check caching, does ecoli not make the cut?
#   if( ! defined $self->{SPECIES}{83333} ){
#     $self->{SPECIES}{83333} = 'E. coli';
#   }

#   return $self->{SPECIES};
# }


# =item source

# # TODO:

# =cut
# sub source {

#   my $self = shift;

#   if( ! defined($self->{SOURCE}) ){

#     my($ret_hash) = _read_frozen_file($self, '/misc_keys.pl');

#     ## Populate our hash.
#     $self->{SOURCE} = {};
#     if( defined $ret_hash->{speciesdb} ){
#       my $sdb = $ret_hash->{speciesdb};
#       foreach my $n (@$sdb){
# 	$self->{SOURCE}{$n} = $n;
# 	#$self->kvetch('source: ' . $n);
#       }
#     }
#   }
#   return $self->{SOURCE};
# }


# =item gptype

# # TODO:

# =cut
# sub gptype {

#   my $self = shift;

#   if( ! defined($self->{GPTYPE}) ){

#     my($ret_hash) = _read_frozen_file($self, '/misc_keys.pl');

#     ## Populate our hash.
#     $self->{GPTYPE} = {};
#     if( defined $ret_hash->{gptype} ){
#       my $gpt = $ret_hash->{gptype};
#       foreach my $n (@$gpt){
# 	$self->{GPTYPE}{$n} = $n;
# 	#$self->kvetch('gptype: ' . $n);
#       }
#     }
#   }
#   return $self->{GPTYPE};
# }


# =item database_link

# Args: database id, entity id
# Returns: URL string

# =cut
# sub database_link {

#   my $self = shift;
#   my $db = shift || '';
#   my $id = shift || '';

#   #print STDERR "_db_" . $db . "\n";
#   #print STDERR "_id_" . $id . "\n";

#   ## WARNING
#   ## TODO: Temporary Reactome special case. This should be removeable
#   ## in a couple of months when Reactome has entirely switched over to
#   ## satable ids...
#   ## Stable id:
#   ## http://www.reactome.org/cgi-bin/link?SOURCE=Reactome&ID=REACT_604
#   ## DB id:
#   ## http://www.reactome.org/cgi-bin/eventbrowser?DB=gk_current&ID=10046
#   # $self->kvetch("Reactome test: $db $id");
#   if( $db =~ /^reactome$/i && $id =~ /^[0-9]+$/i ){
#     $self->kvetch("looks like a Reactome db id--special case!");
#     return 'http://www.reactome.org/cgi-bin/eventbrowser?DB=gk_current&ID='.$id;
#   }

#   ## Revive the cache if we don't have it.
#   if( ! defined($self->{DB_INFO}) ){
#     ## Populate our hash.
#     my($ret_hash) = _read_frozen_file($self, '/db_info.pl');
#     $self->{DB_INFO} = $ret_hash || {};
#     #print STDERR "_init_...\n";
#     #print STDERR "_keys: " . scalar(keys %$ret_hash) . "\n";
#   }

#   #$self->kvetch("DB_INFO: " . Dumper($self->{DB_INFO}));

#   ## Get the link string through the cache.
#   $db = lc($db);
#   my $retval = undef;
#   if( defined $self->{DB_INFO}{$db} ){

#     my $link_string = $self->{DB_INFO}{$db}{url_syntax};

#     #print STDERR "_Ls_ $link_string\n";

#     ## Insert the id through the link string if one was available.
#     if( $link_string ){
#       # ## Special case for UniGene?
#       # if( $db eq lc('UniGene') ){
#       # 	## Split id on '.'. First part goes to
#       # 	## [organism_abbreviation], second part goes to [cluster_id].
#       # 	my($first, $second) = split(/\./, $id);
#       # 	$link_string =~ s/\[organism\_abbreviation\]/$first/g;
#       # 	$link_string =~ s/\[cluster\_id\]/$second/g;
#       # }else{
#       $link_string =~ s/\[example\_id\]/$id/g;
#       # }
#       $retval = $link_string;
#     }
#   }

#   return $retval;
# }


# =item ontology

# # TODO:

# =cut
# sub ontology {

#   my $self = shift;

#   if( ! defined($self->{ONTOLOGY}) ){

#     my($ret_hash) = _read_frozen_file($self, '/misc_keys.pl');

#     ## Populate our hash.
#     $self->{ONTOLOGY} = {};
#     if( defined $ret_hash->{ontology} ){
#       my $ont = $ret_hash->{ontology};
#       foreach my $o (@$ont){
# 	$self->{ONTOLOGY}{$o} = $o;
# 	#$self->kvetch('ontology: ' . $o);
#       }
#     }
#   }
#   return $self->{ONTOLOGY};
# }


# =item subset

# # TODO:

# =cut
# sub subset {

#   my $self = shift;

#   if( ! defined($self->{SUBSET}) ){

#     my($ret_hash) = _read_frozen_file($self, '/misc_keys.pl');

#     ## Populate our hash.
#     $self->{SUBSET} = {};
#     if( defined $ret_hash->{subset} ){
#       my $subs = $ret_hash->{subset};
#       foreach my $s (@$subs){
# 	$self->{SUBSET}{$s} = $s;
# 	#$self->kvetch('subset: ' . $s);
#       }
#     }
#   }
#   return $self->{SUBSET};
# }


# =item species_to_ncbi_map

# Return href of species.id => species.ncbi_taxa_id
# WARNING: This is experimental and may be removed/replaced.

# =cut
# sub species_to_ncbi_map {

#   my $self = shift;

#   if( ! defined($self->{SPECIES_TO_NCBI_MAP}) ){
#     my ($ret_hash) = _read_frozen_file($self, '/spec_ncbi_map.pl');
#     $self->{SPECIES_TO_NCBI_MAP} = $ret_hash;
#   }

#   return $self->{SPECIES_TO_NCBI_MAP};
# }


###
### Linking within AmiGO.
###


## Fuse a hash into a URL.
sub _fuse_hash {

  my $self = shift;
  my $in_hash = shift || {};
  my $retstr = '';

  if( defined $in_hash->{action} &&
      defined $in_hash->{arguments} ){

    ##
    my $hash = $in_hash->{arguments};
    my @buf = ();
    foreach my $i (keys %$hash){

      ##
      if( ref($hash->{$i}) eq 'ARRAY' ){
	foreach my $a (@{$hash->{$i}}){
	  push @buf, $i . '=' . $a;
	}
      }else{
	push @buf, $i . '=' . $hash->{$i};
      }
    }

    ##
    #$retstr = $in_hash->{action} . '?' . join('&', @buf);
    # $self->uri_safe(join('&', @buf));
    my $tstr = join('&', @buf);
    #$tstr =~ s{\ }{%20}gso;
    $retstr = $in_hash->{action} . '?' . $tstr;
  }

  return $retstr;
  #   my 
  #    $Ilink = 'visualize?mode=basic&inline=false&format=' . $format .
  # # 	 '&term_data_type=' .  $data_type .
  # # 	   '&term_data=' .  $self->uri_safe($data);
}


=item get_interlink

TODO: how would this play properly with a templating system?
Gets an environmental variable, including (and specically for)
variables designated in config.pl.

Arguments: ex: {mode=>'homolset_graph', arg=>{set=>1, format=>'png'}}
Returns: string for an href

Other args: public=>(0|1) # use the public url instead of local installation
            full=>(0|1) # return the complete url instead of the local one
            hash=>(0|1) # returns a hash of all args instead of string
     Both of the above default to 0.
            html_safe
            frag # optional fragment identifier

NOTE: Not all interlinks sanely support the hash argument yet.

=cut
## You'll want to take a look at the code--the main set is separated
## from the "exp" set.
sub get_interlink {

  my $self = shift;
  my $arg_hash = shift || {};
  my $ilink = '';
  my $ihash = {};

  ## Mode extant?
  my $mode = undef;
  if( defined $arg_hash->{mode} ) {
    $mode = $arg_hash->{mode};
  }
  die "interlink requires a 'mode' argument" if ! defined $mode;

  ## Optional extant? Override the defaults if they are defined.
  my $optional_public_p = 0; # Give the public URL.
  my $optional_full_p = 0; # Give the full URL instead of just the partial.
  # my $optional_url_safe_p = 0; # Return a URL safe string.
  my $optional_html_safe_p = 1; # Return an HTML safe string (defaults to 1).
  my $optional_hash_p = 0; # Are we more interested in the args (for
                           # form generation)?
  my $optional_frag = ''; # Do we want a fragment at the end?
  if( defined $arg_hash->{optional} ) {
    $optional_public_p = $arg_hash->{optional}{public}
      if defined $arg_hash->{optional}{public};
    $optional_full_p = $arg_hash->{optional}{full}
      if defined $arg_hash->{optional}{full};
    #$optional_uri_safe_p = $arg_hash->{optional}{url_safe}
    #  if defined $arg_hash->{optional}{url_safe};
    $optional_html_safe_p = $arg_hash->{optional}{html_safe}
      if defined $arg_hash->{optional}{html_safe};
    $optional_hash_p = $arg_hash->{optional}{hash}
      if defined $arg_hash->{optional}{hash};
    $optional_frag = $arg_hash->{optional}{frag}
      if defined $arg_hash->{optional}{frag};
  }

  ## A hash may be more clear than a switch at this point...
  my $args = $arg_hash->{arg};
  my %fun_hash =
    (

     ## First, things that are in the main app set...
     'gp_details' =>
     sub {
       die "interlink mode 'gp_details' requires args" if ! defined $args;
       my $gp = $args->{gp} || '';
       my $acc = $args->{acc} || undef;
       my $db = $args->{db} || undef;
       if( defined($acc) && defined($db) ){
	 $gp = $db . ':' . $acc;
       }
       $ilink = 'amigo?mode=golr_gene_product_details&gp=' . $gp;
     },

     'term_subset' =>
     sub {
       die "interlink mode 'term-subset' requires args" if ! defined $args;
       my $acc = $args->{acc} || '';
       my $sid = $args->{session_id} || '';
       $ilink = 'term_details?term=' .
	 #$self->html_safe($acc) . '&session_id=' . $sid;
	 $acc . '&session_id=' . $sid;
     },

     ## NOTE: Should now be the same as term-details.
     'term_details' =>
     sub {
       die "interlink mode 'term_details' requires args" if ! defined $args;
       my $acc = $args->{acc} || '';
       #$ilink = 'term_details?term=' . $acc;
       $ilink = 'amigo?mode=golr_term_details&term=' . $acc;
     },

     ## Slightly different than the others.
     'gaffer' =>
     sub {
       my $gmode = $args->{mode} || die 'need mode';
       my $gurl = $args->{url} || die 'need url';
       $ilink = 'gaffer?mode=' . $gmode . '&data_url=' . $self->uri_safe($gurl);
     },

     'visualize' =>
     sub {
       #print STDERR Dumper($arg_hash);
       my $data = $args->{data} || '';
       my $data_type = $args->{data_type} || 'string';
       my $format = $args->{format} || 'png';

       my $final_data = $data;
       if( ! $optional_hash_p ){
	 $final_data = $self->uri_safe($data);
       }
       $ihash = {
		 action => 'visualize',
		 arguments =>
		 {
		  mode => 'basic',
		  inline => 'false',
		  format => $format,
		  term_data_type => $data_type,
		  term_data => $final_data,
		  #term_data => $self->uri_safe($data),
		  #term_data => $data, # going through hash, not uri
		 },
		};

       $ilink = $self->_fuse_hash($ihash);
       #$ilink = $self->uri_safe( _fuse_hash($ihash));
     },

     ## Takes an array ref of term ids.
     'visualize_term_list' =>
     sub {
       my $in_terms = $args->{terms} || [];

       my $final_data = $self->uri_safe(join(' ', @$in_terms));
       $ihash = {
		 action => 'visualize',
		 arguments =>
		 {
		  mode => 'basic',
		  inline => 'false',
		  format => 'png',
		  term_data_type => 'string',
		  term_data => $final_data,
		 },
		};

       $ilink = $self->_fuse_hash($ihash);
     },

     'visualize_simple' =>
     sub {
       my $engine = $args->{engine} || '';
       my $term = $args->{term} || '';
       my $inline = $args->{inline} || 'false';
       my $beta = $args->{beta} || '0';
       $ihash = {
		 action => 'visualize',
		 arguments =>
		 {
		  mode => $engine,
		  inline => $inline,
		  term => $term,
		  beta => $beta,
		 },
		};

       $ilink = $self->_fuse_hash($ihash);
     },

     'visualize_subset' =>
     sub {
       my $subset = $args->{subset} || '';
       my $inline = $args->{inline} || 'false';
       $ihash = {
		 action => 'visualize',
		 arguments =>
		 {
		  mode => 'subset',
		  inline => $inline,
		  subset => $subset,
		 },
		};

       $ilink = $self->_fuse_hash($ihash);
     },

     'simple_search' =>
     sub {
       if( ! $self->empty_hash_p($args) ){
	 # $args->{query}
	 # $args->{document_category}
	 # $args->{page}
     	 $ilink = 'amigo?mode=simple_search&'.
     	   $self->hash_to_query_string($args);
       }else{
     	 $ilink = 'amigo?mode=simple_search';
       }
     },

     'id_request' =>
     sub {
       my $data = $args->{data} || '';
       $ilink = 'aserve_exp?mode=id_request&data=' . $data;
     },

     ## TODO/BUG: redo later when can see how this (Phylotree stuff)
     ## will all hang together.
     'display_tree' =>
     sub {
       my $id = $args->{id} || '';
       $ilink = 'amigo_exp?mode=ptree&id=' . $id;
     },

     'style' =>
     sub {
       my $sheet = $args->{sheet} || '';
       #$ilink = 'amigo?mode=css' . $sheet . '.css';
       $ilink = 'amigo?mode=css';
     },

     'olsvis_go' =>
     sub {
       die "interlink mode 'gp_details' requires args" if ! defined $args;
       my $tacc = $args->{term} || '';
       $ilink = 'http://ols.wordvis.com/q=' . $tacc;
     },

     ## I don't *think* this would be Seth approved. -Sven
     ## Seth thinks it's fine, but jiggered it to see. -Seth
     phylotree =>
     sub {
       $ilink = 'phylotree';
       if (keys %$args) {
	 $ilink .= '?' .
	   join('&',
		map {
		  $_ . '=' . $args->{$_};
		} keys %$args);
       }
     }
    );

  ## Check hash for our link function and run it if found.
  if( defined $fun_hash{$mode} ){
    $fun_hash{$mode}->();
  }

  ## Do we return the link or the hash?
  my $final_ret = undef;
  if( $optional_hash_p ){

    $final_ret = $ihash;

  }else{

    ## Use full URL?
    if( $ilink ){
      if( $optional_public_p ){
	#$self->kvetch('PUBLIC LINK');
	$ilink = $self->amigo_env('AMIGO_PUBLIC_CGI_URL') . '/' . $ilink;
      }elsif( $optional_full_p ){
	#$self->kvetch('FULL LINK');
	$ilink = $self->amigo_env('AMIGO_CGI_URL') . '/' . $ilink;
      }else{
	#$self->kvetch('LOCAL LINK');
      }
    }

    ## Add optional fragment identifier to URL?
    if( $optional_frag ){
      $ilink = $ilink . '#' . $optional_frag;
    }

    ## Safety last.
    if( $ilink ){
      if( $optional_html_safe_p ){
	$ilink = $self->html_safe($ilink);
	# }elsif( $optional_url_safe_p ){
	# $ilink = $self->url_safe($ilink);
      }else{
	# die "both kinds of safety cannot be used at the same time :$!"
      }
    }

    $final_ret = $ilink;
  }

  return $final_ret;
}


## Parse a JSON string to perl object.
sub _read_json_string {

  my $self = shift;
  my $json_str = shift || die 'yes, but what string do you want read?';

  #$self->kvetch("JSON contents: " . $json_str);

  ## Read in data.
  # $self->kvetch("json: " . $self->{JSON});
  # $self->kvetch("json max depth: " . $self->{JSON}->get_max_depth());
  # $self->kvetch("json max size: " . $self->{JSON}->get_max_size());

  my $rethash = undef;
  # eval {
  $rethash = $self->{JSON}->decode($json_str);
  # };
  # if( $@ ){
  # die "nope: $@: $!";
  # }
  # $self->kvetch("passed: " . Dumper($rethash));

  return $rethash;
}


## Parse a JSON file to perl object.
sub _read_json_file {

  my $self = shift;
  my $file = shift || die 'yes, but what file do you want read?';

  ## Try and get it.
  die "No hash file found ($file): $!" if ! -f $file;
  open(FILE, '<', $file) or die "Cannot open $file: $!";
  my $json_str = <FILE>;
  close FILE;

  ## Punt to string reader.
  return $self->_read_json_string($json_str);
}


=item golr_configuration

Return href of the GOlr configuration from the installation.

=cut
sub golr_configuration {

  my $self = shift;
  my $json_file = $self->amigo_env('AMIGO_HTDOCS_ROOT_DIR') .
    '/javascript/bbop/golr_meta.json';

  #$self->kvetch("looking up conf: " . $json_file);

  return $self->_read_json_file($json_file);
}


=item golr_class_info_list_by_weight

Arguments: golr class id
Return href of info.

TODO

=cut
sub golr_class_info {

  my $self = shift;
  my $gcid = shift || "need a golr class id";

  ## Gather golr info.
  my $ret = undef;
  my $gconf = $self->golr_configuration();
  if( defined $gconf->{$gcid} ){
    $ret = $gconf->{$gcid};
  }
  return $ret;
}


=item golr_class_info_list_by_weight

Return aref of necessary info for conduction simple searches.
Default cutoff is 0.

TODO

=cut
sub golr_class_info_list_by_weight {

  my $self = shift;
  my $cutoff = shift || 0;

  ## Gather golr info.
  my $gconf = $self->golr_configuration();

  ## Collect the good bits.
  my $rets = [];
  foreach my $id (keys(%{$gconf})){
    if( defined $gconf->{$id}{weight} &&
    	$gconf->{$id}{weight} >= $cutoff ){
      push @$rets, $gconf->{$id};
    }
  }

  ## Sort by weight.
  my @sorted_rets = sort { $b->{weight} <=> $a->{weight} } @$rets;

  #$self->kvetch('sorted rets: ' . Dumper(\@sorted_rets));

  return \@sorted_rets;
}


=item golr_class_searchable_extension

Arguments: string identifying the golr class
Return: the searchable extension string

=cut
sub golr_class_searchable_extension {

  my $self = shift;
  my $id = shift || die "which golr class?";

  ## Gather golr info.
  my $gconf = $self->golr_configuration();

  ##
  my $ret = undef;
  if( defined $gconf->{$id} &&
      defined $gconf->{$id}{searchable_extension} ){
    $ret = $gconf->{$id}{searchable_extension};
  }

  return $ret || die "we seem to be trying to work with a damaged conf";
}


=item golr_class_document_category

Arguments: string identifying the golr class
Return: the document_category string

=cut
sub golr_class_document_category {

  my $self = shift;
  my $id = shift || die "which golr class?";

  ## Gather golr info.
  my $gconf = $self->golr_configuration();

  ##
  my $ret = undef;
  if( defined $gconf->{$id} &&
      defined $gconf->{$id}{document_category} ){
    $ret = $gconf->{$id}{document_category};
  }

  return $ret || die "we seem to be trying to work with a damaged conf";
}


=item golr_class_field_searchable_p

Arguments: string identifying the golr class and a string identifying a field
Return: 0 or 1 on whether the field in question is searchable.

=cut
sub golr_class_field_searchable_p {

  my $self = shift;
  my $class_id = shift || die "which golr class?";
  my $field_id = shift || die "which field?";

  ## Gather golr info.
  my $gconf = $self->golr_configuration();

  ##
  my $ret = undef;
  if( defined $gconf->{$class_id} &&
      defined $gconf->{$class_id}{fields_hash} &&
      defined $gconf->{$class_id}{fields_hash}{$field_id} &&
      defined $gconf->{$class_id}{fields_hash}{$field_id}{searchable} ){
    $ret = 0;
    if( $gconf->{$class_id}{fields_hash}{$field_id}{searchable} eq 'true' ){
      $ret = 1;
    }
  }

  die "we seem to be trying to work with a damaged conf"
    if !defined $ret;

  return $ret;
}


=item golr_class_weights

Arguments: string identifying the golr class and the weights desired
('boost', 'result', or 'filter').

Return: href of {field => weight, ...}

=cut
sub golr_class_weights {

  my $self = shift;
  my $gc_id = shift || die "which golr class?";
  my $weights_id = shift || die "which golr class weights category?";

  ## Only the defined few.
  if( $weights_id ne 'boost' &&
      $weights_id ne 'result' &&
      $weights_id ne 'filter' ){
    die "not a known weights_id: $weights_id";
  }else{
    $weights_id = $weights_id . '_weights';
  }

  ## Gather golr info.
  my $gconf = $self->golr_configuration();

  ## Collect the good bits.
  my $rethash = {};
  if( !defined $gconf->{$gc_id} ||
      ! defined $gconf->{$gc_id}{$weights_id} ){
    $self->kvetch('failed to find: ' . $gc_id . ', '. $weights_id);
  }else{
    my $dfab = $gconf->{$gc_id}{$weights_id};
    my @fields = split /\s+/, $dfab;
    foreach my $p (@fields){
      my($field, $value) = split /\^/, $p;
      $rethash->{$field} = $value + 0.0; # convert?
    }
  }

  #$self->kvetch(Dumper($rethash));
  return $rethash;
}


# ## Read misc_keys.pl (unless otherwise specified) and return the
# ## thawed hash. BUG/TODO: we should be moving away from perl-specific
# ## things (i.e. freeze/thaw) to more generic things (JSON & sqlite3).
# sub _read_frozen_file {

#   my $self = shift;
#   my $frozen_file = shift || '/misc_keys.pl';

#   ## Try and get it from the spec_keys.pl file.
#   my $file = $self->amigo_env('cgi_root_dir') . $frozen_file;
#   die "No hash file ($frozen_file) found ($file): $!" if ! -f $file;
#   open(FILE, $file) or die "Cannot open $file: $!";

#   ## Read in hash and thaw.
#   my $misc_hash = '';
#   while (<FILE>) {
#     $misc_hash .= $_;
#   }
#   return thaw $misc_hash;
# }


=item query_string_to_hash

Turn a query string into a single-level hash. Multiple values for a
single key will turn a hash entry into an aref.

Accepts strings.

=cut
sub query_string_to_hash {

  my $self = shift;
  my $in_str = shift || '';
  my $rethash = {};

  if( $in_str ){
    my @pairs = split /\&/, $in_str;
    foreach my $pair (@pairs){
      my($key, $new_val) = split /=/, $pair;
      chomp $new_val;

      # $self->kvetch('$key: ' . $key);
      # $self->kvetch('$new_val: ' . $new_val);

      ## If it's already there, push it on an aref (which itself might
      ## need to be created). Threee cases.
      if( ! defined $rethash->{$key} ){
	$rethash->{$key} = $new_val;
      }elsif( defined $rethash->{$key} && ref($rethash->{$key}) eq 'ARRAY' ){
	push @{$rethash->{$key}}, $new_val;
      }else{
	## Value there, but no aref yet...
	my $curr_val = $rethash->{$key};
	$rethash->{$key} = [];
	push @{$rethash->{$key}}, $curr_val;
	push @{$rethash->{$key}}, $new_val;
      }
    }
  }

  # $self->kvetch('$rethash: ' . Dumper($rethash));
  return $rethash;
}


=item hash_to_query_string

Turn a single-level hash ref into a remarkably URL-like string using
the keys as the...keys...

Accepts array refs as values.

=cut
sub hash_to_query_string {

  my $self = shift;
  my $hash = shift || {};

  my $mega_buf = [];
  foreach my $key (keys %{$hash}){

    ## Array ref or not...
    if( ref($hash->{$key}) eq 'ARRAY' ){

      my $mini_buf = [];
      foreach my $elt (@{$hash->{$key}}){
	push @$mini_buf,  $key . '=' . $elt;
      }
      push @$mega_buf, join('&', @$mini_buf);

    }else{
      push @$mega_buf,  $key . '=' . $hash->{$key};
    }
  }
  return join('&', @$mega_buf);
}


=item hash_to_golr_query

Turn a single-level hash ref into a GOlr URL.

Accepts array refs as values.

=cut
sub hash_to_golr_query {

  my $self = shift;
  my $hash = shift || {};

  my $qstr = $self->hash_to_query_string($hash);
  my $url = $self->amigo_env('AMIGO_PUBLIC_GOLR_URL') . '/select?' . $qstr;

  return $url;
}


=item to_hash

Turn an array ref (or scalar) into a single level hash ref.

Accepts array refs or scalar, with optional fill value.
Returns hashrefs.

=cut
sub to_hash {

  my $self = shift;
  my $iarray = shift || [];
  my $fill = shift;
  my $ohash = {};

  ## Use any given fill value.
  if( ! defined $fill ){
    $fill = 1;
  }

  ## Roll in array.
  if( ref($iarray) ne 'ARRAY' ){
    $ohash->{$iarray} = $fill;
  }else{
    foreach my $item (@$iarray){
      $ohash->{$item} = $fill;
    }
  }

  return $ohash;
}


=item merge

Merges two hashes (as hashrefs) together, using the first one as a template.
Using shallow copying.

=cut
sub merge {

  my $self = shift;
  my $default_hash = shift || {};
  my $in_hash = shift || {};

  ##
  my $ret_hash = {};

  ## For defined in default, incoming over default.
  foreach my $key (keys %$default_hash){
    if( defined $in_hash->{$key} ){
      $ret_hash->{$key} = $in_hash->{$key};
    }else{
      $ret_hash->{$key} = $default_hash->{$key};
    }
  }

  ## For undefined in default, just use incoming.
  foreach my $key (keys %$in_hash){
    if( ! defined $default_hash->{$key} ){
      $ret_hash->{$key} = $in_hash->{$key};
    }
  }

  return $ret_hash;
}


=item random_hash_key

Returns a random hash key from a hashref.

=cut
sub random_hash_key {
  my $self = shift;
  my $hash = shift || {};
  return (keys %$hash)[rand(keys %$hash)];
}


=item random_hash_keys

Returns a random aref of hash keys from a hashref.

=cut
sub random_hash_keys {
  my $self = shift;
  my $hash = shift || {};
  my @shuffled_keys = shuffle(keys %$hash);
  return \@shuffled_keys;
}


=item randomness

Returns a random string.

Most uses of this would be better done by uuid.

First argument is the length if the randomness returned (default 10).
Second argument is an array ref of characters to be used (defaults to
[0-9a-z])

=cut
sub randomness {

  my $self = shift;
  my $len = shift || 10;
  my $random_base =
    shift || ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
	      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  my $cache = [];
  for( my $i = 0; $i < $len; $i++ ){
    my $rbase_index = floor(rand() * scalar(@$random_base));
    push @$cache, $$random_base[$rbase_index];
  }

  return join '', @$cache;
}


=item empty_hash_p

Returns bool on whether or not a hash ref is empty.

=cut
sub empty_hash_p {
  my $self = shift;
  my $hash = shift || {};

  my $num_keys = scalar(keys %$hash);
  if( $num_keys == 0 ){
    return 1;
  }else{
    return 0;
  }
}


###
### Resource and images.
###

=item get_image_resource

Get a named resource as a url string from the meta_data hash if
possible.

=cut
sub get_image_resource {

  my $self = shift;
  my $res = shift || '';
  my $mod = shift || undef;

  my $lower = lc($res);
  my $mangled_res = 'bbop_img_' . $lower;
  my $ibase = $self->amigo_env('AMIGO_IMAGE_URL');
  my $img_data =
    {
     bbop_img_star => $ibase . '/star.png',
     bbop_img_ptree => $ibase . '/ptree.png',
     bbop_img_forward => $ibase . '/media_forward.png',
     bbop_img_jump_forward => $ibase . '/media_jump_forward.png',
     bbop_img_back => $ibase . '/media_back.png',
     bbop_img_jump_back => $ibase . '/media_jump_back.png',
    };

  ##
  my $retval = undef;
  if( defined $img_data->{$mangled_res} ){
    $retval = $img_data->{$mangled_res};
  }else{
    ## TODO: sensible fall-through?
    $retval = $ibase . '/' . $lower;
  }

  ## Add optional size.
  if( defined $mod && $mod ){
    $retval =~ s/(.*)\.png$/$1_$mod\.png/;
  }

  return $retval;
}


=item vanilla_filehandle_p

WARNING: using this runs the file forward a little, which caused
problems in the past. We now run back to zero before leaving, but who
knows what other dumb things perl might do...

Return 1 or 0

=cut
sub vanilla_filehandle_p {

  my $self = shift;
  my $fh = shift || undef;
  my $retval = 0;
  my $cdata = undef;

  if( $fh ){

    ## Other tests--the above is remarkably unreliable...
    if( -T $fh ){
      $self->kvetch('is text');
      $retval = 1;
    }else{
      $self->kvetch('is binary?');

      ## File::MMagic permonks hack.
      push @Fh::ISA, 'IO::Seekable' unless Fh->isa('IO::Seekable');
      push @Fh::ISA, 'IO::Handle' unless Fh->isa('IO::Handle');

      ## Try again.
      my $ft = File::Type->new();
      $fh->read($cdata, 0x8564);
      my $tfd = $ft->checktype_contents($cdata);
      seek $fh, 0, 0; # rewind for future use.
      $self->kvetch('contents type: ' . $tfd);

      ## Decide.
      #if( $mt =~ /text\/plain/ ){
      if( $tfd =~ /text/ ){
	$retval = 1;
      }
    }
  }

  return $retval;
}


###
### Error message passing and internal errors.
###


=item ok

Return 1 or 0 for all operations.

=cut
sub ok {
  my $self = shift;
  my $retval = 1;
  $retval = 0 if defined $self->{ERROR_MESSAGE};
  return $retval;
}


=item error_p

Getter.
Return 1 or 0 for all operations.

=cut
sub error_p {
  my $self = shift;
  my $retval = 0;
  $self->kvetch("in: " . $retval . " " . $self->{ERROR_MESSAGE});
  $retval = 1 if defined $self->{ERROR_MESSAGE};
  return $retval;
}


=item error_message

Getter.
Returns the reason for the above error.

=cut
sub error_message {
  my $self = shift;
  return $self->{ERROR_MESSAGE};
}


=item set_error_message

Setter.
TODO: Add current package to the front of the error message.

=cut
sub set_error_message {
  my $self = shift;
  my $arg = shift || undef;
  $self->{ERROR_MESSAGE} = $arg;
  return $self->{ERROR_MESSAGE};
}



1;
