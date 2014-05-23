#!/usr/bin/perl -w

## Uses a custom subclass of Module::Build called Bio::Root::Build
use Module::Build;
use strict;

## Set up the Bio::Root::Build object
my $build =
  Module::Build->new(module_name => 'AmiGO2',
		     dist_name => 'AmiGO',
		     dist_version => '2.0',
		     requires =>
		     {
		      # probably justified in bumping this up, but
		      # leaving it for now:
		      'perl' => '5.6.1',
		      'Config::YAML' => 0,
		      'File::Type' => 0,
		      'WWW::Mechanize' => 0,
		      'CGI::Application' => 0,
		      'Data::FormValidator' => 0,
		      'CGI::Application::Plugin::Session' => 0,
		      'CGI::Application::Plugin::TT' => 0,
		      'CGI::Application::Plugin::Redirect' => 0,
		      'CGI::Application::Plugin::Forward' => 0,
		      'Clone' => 0,
		      'Graph::Directed' => 0,
		      'CGI::Application::Dispatch' => 0,
		      'JSON::XS' => 0,
		      'Data::UUID' => 0,
		      'FreezeThaw' => 0,
		      'DBI' => 0,
		      'DBD::SQLite' => 0,
		      'XML::XPath' => 0,  # for GONUTS
		     },
		     recommends =>
		     {
		      # your ad here
		      #
		      # please add in your dependencies here,
		      # if you intend your modules to be user-tested,
		      # as:
		      #'[dependency]' => '[version reqd]/[informative phrase]/[requirer]'
		      # ex)
		      #'Array::Compare' => '0/Phylogenetic Networks/Bio::PhyloNetwork'
		     },
		     #pm_files => {} # modules in Bio are treated as if they were in lib and auto-installed
		     #script_files => [] # scripts in scripts directory are installed on-demand
		    );

$build->dispatch('build');
$build->dispatch('test', verbose => 1);
$build->dispatch('install');
$build->create_build_script;
exit;
