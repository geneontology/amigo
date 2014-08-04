#!/usr/bin/perl -w
####
#### TODO: ...
####

package AmiGO::WebApp::Static::Dispatch;
use base 'CGI::Application::Dispatch';

use AmiGO;

my $dispatch_table = AmiGO::static_dispatch_table();
sub dispatch_args {
    return {
	#debug => 1,
	debug => 0,
	default => '',
	'table' => $dispatch_table
    };
};


1;
