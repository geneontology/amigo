////
//// Attempt at an interactive web REPL for BBOP JS over GO data.
////
//// TODO: Callback makes fields and button unavailable until
//// return. TODO: Have panic timeout in the case that something
//// goes very wrong.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;
var gserv_download = amigo.data.server.golr_bulk_base;
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// Go and get the initial results for building our tree.
function REPLInit(){

    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('REPL: ' + str); }
    ll('');
    ll('REPL.js');
    ll('REPLInit start...');

    // If we're running this script, cycle the local variables into
    // the browser global window namespace.
    if( typeof(window) && window ){
	window.repl = {};
	window.repl.amigo = amigo;
	window.repl.us = us;
	window.repl.bbop = bbop;
	window.repl.widgets = widgets;
	window.repl.html = html;
	window.repl.amigo = amigo;
	window.repl.golr_conf = golr_conf;
	window.repl.gconf = gconf;
	window.repl.sd = sd;
	window.repl.gserv = gserv;
	window.repl.gserv_download = gserv_download;
	window.repl.defs = defs;
	window.repl.linker = linker;
	window.repl.handler = handler;
	window.repl.jquery_engine = jquery_engine;
	window.repl.golr_manager = golr_manager;
	window.repl.golr_response = golr_response;
    }

    // var cmnd_buff_id = 'command_buffer';

    // // Make unnecessary things roll up.
    // amigo.ui.rollup(["inf01"]);

    ///
    /// Set the repl widget.
    ///

    // Pull in how we want to start.
    var initial_repl_commands = [
	//"bbop.contrib.go.overlay('jquery');"

	///
	/// Now cycle the globally defined variables back into the REPL
	/// environment.

	// Top.
	'var amigo = window.repl.amigo;',
	'var us = window.repl.us;',
	'var bbop = window.repl.bbop;',
	'var widgets = window.repl.widgets;',
	'var html = window.repl.html;',
	'var amigo = window.repl.amigo;',
	'var golr_conf = window.repl.golr_conf;',
	'var gconf = window.repl.gconf;',
	'var sd = window.repl.sd;',
	'var gserv = window.repl.gserv;',
	'var gserv_download = window.repl.gserv_download;',
	'var defs = window.repl.defs;',
	'var linker = window.repl.linker;',
	'var handler = window.repl.handler;',
	'var jquery_engine = window.repl.jquery_engine;',
	'var golr_manager = window.repl.golr_manager;',
	'var golr_response = window.repl.golr_response;',

	// Aliases.
	'var loop = bbop.each;',
	'var dump = bbop.dump;',
	'var what_is = bbop.what_is;',

	// Define a global logger.
	'var logger = new bbop.logger();',
	'logger.DEBUG = true;',
	'function ll(str){ return logger.kvetch(str); }',

	// Support a callback to data for the manager.
	'var data = null;',
	"function callback(response){ data = response; ll('// Returned value placed in [data].'); }",

	// Get a global manager.
	'var engine = new jquery_engine(golr_response);',
	"engine.method('GET');",
	'engine.use_jsonp(true);',
	"var go = new golr_manager(gserv_download, gconf, engine, 'async');",
	"go.register('search', callback);",

	// Add GO-specific methods to our manager.
	"golr_manager.prototype.gaf_url = function(){ return this.get_download_url(['source', 'bioentity_internal_id', 'bioentity_label', 'qualifier', 'annotation_class', 'reference', 'evidence_type', 'evidence_with', 'aspect', 'bioentity_name', 'synonym', 'type', 'taxon', 'date', 'assigned_by', 'annotation_extension_class', 'bioentity_isoform']); };",
	"golr_manager.prototype.doc_type = function(t){ return this.add_query_filter('document_type', t); };",

	// jQuery helpers.
	"var empty = function(did){ jQuery('#' + did).empty(); };",
	"var append = function(did, str){ jQuery('#' + did).append(str); };"
    ];
    var repl = new widgets.repl('repl-div', initial_repl_commands,
				{
				    // 'buffer_id': cmnd_buff_id,
				    //display_initial_commands_p: true
				    display_initial_commands_p: false
				});
    // // Redefine ll to call advance log as well.
    // function ll(str){
    // 	logger.kvetch(str);
    // 	repl.advance_log_to_bottom();
    // 	return str;
    // }

    ///
    /// Make the pull-down active.
    ///

    // Get things from pulldown into textarea on change.
    jQuery("#" + "golr_session_example_selection").change(
	function(event){
	    var sess_golr = jQuery(this).val();
	    //ll('// sess_golr: ' + sess_golr);
	    //alert('foo!');
	    //jQuery('#' + cmnd_buff_id).val(sess_golr);
	    repl.replace_buffer_text(sess_golr);
	    //repl.advance_log_to_bottom();
	});

    // Roll up the function/object dictionary.
    jQuery("#" + "env-entities").hide();
    jQuery("#" + "show-entities").click(
	function(){
	    jQuery("#" + "env-entities").slideToggle();
	});

    ll('REPLInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ REPLInit(); });
})();
