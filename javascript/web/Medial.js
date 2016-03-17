////
//// Add extra data/links to searches dealing with single terms.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_acc */

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
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

//
function MedialInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('M: ' + str); }    

    ll('');
    ll('Medial.js');
    ll('MedialInit start...');

    // Only trigger when we've been passed the candidate.
    if( ! global_acc ){
	ll('No candidate--skipping');
    }else{
	
	///
	/// Create a bookmark for searching annotations and
	/// bioentities with this term. Generate links and activate
	/// hidden stubs in the doc.
	///
    
	// Get bookmark for annotations.
	(function(){

	    // Manager setup.
	    var engine = new jquery_engine(golr_response);
	    engine.method('GET');
	    engine.use_jsonp(true);
	    var man = new golr_manager(gserv, gconf, engine, 'async');

	    man.set_personality('annotation');
	    man.add_query_filter('document_category', 'annotation', ['*']);
	    man.add_query_filter('regulates_closure', global_acc);
	    //ll('qurl: ' + man.get_query_url());
	    //var lstate = encodeURIComponent(man.get_state_url());
	    var lstate = man.get_filter_query_string();
	    var lurl = linker.url(lstate, 'search', 'annotation');
	    
	    // Add it to the DOM.
	    jQuery('#prob_ann_href').attr('href', lurl);
	    jQuery('#prob_ann').removeClass('hidden');
	})();
    }
    
    // Get bookmark for bioentities.
    (function(){

	// Manager setup.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');
	
	man.set_personality('annotation');
	man.add_query_filter('document_category', 'bioentity', ['*']);
	man.add_query_filter('regulates_closure', global_acc);
	//ll('qurl: ' + man.get_query_url());
	//var lstate = encodeURIComponent(man.get_state_url());
	var lstate = man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'bioentity');
	
	// Add it to the DOM.
	jQuery('#prob_bio_href').attr('href', lurl);
	jQuery('#prob_bio').removeClass('hidden');
    })();
    
    //
    ll('MedialInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ MedialInit(); });
})();
