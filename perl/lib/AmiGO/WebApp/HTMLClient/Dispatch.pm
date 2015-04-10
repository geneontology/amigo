#!/usr/bin/perl -w
####
#### TODO: ...
####

package AmiGO::WebApp::HTMLClient::Dispatch;
use base 'CGI::Application::Dispatch';

use AmiGO;

my $dispatch_table = AmiGO::dynamic_dispatch_table_amigo();
sub dispatch_args {
    return { 'table' => $dispatch_table}
};


1;
