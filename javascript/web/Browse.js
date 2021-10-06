////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

/* global global_in_term */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Configuration.
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

// Default closure relation. Starting setup to deal with future of
// #620.
//var default_closure_relation_set = 'regulates';
var default_closure_relation_set = 'isa_partof';

// // Graphs.
// var model = require('bbop-graph');

// //
// var global_root_docs = [];

///
/// General setup--resource locations.
/// Solr server, GOlr config, etc.
///

// Manager creation wrapper (we use it a couple of times).
function _create_manager(personality){

    // Create manager.
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');

    // Manager settings.
    var confc = gconf.get_class(personality);
    manager.set_personality(personality);
    manager.add_query_filter('document_category',
			     confc.document_category(), ['*']);

    return manager;
}

///
///
///

function BrowseInit(){

    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    ///
    /// The info shield.
    ///

    ///
    /// Setup the browsers for all of our roots.
    ///

    var terms = [];
    if( global_in_term ){
	terms = [global_in_term];
    }else{
	terms = us.map(sd.root_terms,function(root_termlet){
	    return root_termlet.id;
	});
    }
    console.log('terms', terms);

    us.each(terms, function(term){

	///
	/// The tree browsers.
	///

	// Add a new place for it in the DOM.
	var uid = bbop.uuid();
	jQuery('#browser_id').append('<div id='+uid+'></div>');

	// Setup the widget with the server info.
	// Launch at a root with a boring callback.
	var manager = _create_manager('ontology');
	var b = new widgets.browse(
	    manager,
	    uid,
	    {
		'transitivity_graph_field':
		default_closure_relation_set + '_transitivity_graph_json',
		'base_icon_url': sd.image_base,
		'info_icon': 'info',
		'current_icon': 'current_term',
		'image_type': 'gif',
		'info_button_callback':
		function(term_acc){

		    console.log('term_acc', term_acc);

		    var term_manager = _create_manager('ontology');
		    var confc = gconf.get_class('ontology');
		    term_manager.set_id(term_acc);
		    term_manager.register('search', function(resp, tman){
			widgets.display.term_shield(resp.get_doc(0), confc,
						    linker, {}, {});
		    });
		    term_manager.search();
		}
	    });
	b.draw_browser(term);

    });
}

///
///
///

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){

	// Use jQuery UI to tooltip-ify doc.
	var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
	jQuery('.bbop-js-tooltip').tooltip(tt_args);

	BrowseInit();
    });
})();
