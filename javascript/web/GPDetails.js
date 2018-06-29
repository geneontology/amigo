////
//// A lot of the commented out stuff in the other completely gone here.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_acc */
/* global global_live_search_query */
/* global global_live_search_filters */
/* global global_live_search_pins */

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

// Aliases.
var dlimit = defs.download_limit;

//
function GPDetailsInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('GP: ' + str); }    

    ll('');
    ll('GPDetails.js');
    ll('GPDetailsInit start...');

    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // Tabify the layout if we can (may be in a non-tabby version).
    var dtabs = jQuery("#display-tabs");
    if( dtabs ){
	ll('Apply tabs...');
	jQuery("#display-tabs").tabs();
	jQuery("#display-tabs").tabs('option', 'active', 0);
    }
    
    ///
    /// Manager setup.
    ///
    
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var gps = new golr_manager(gserv, gconf, engine, 'async');
    
    var confc = gconf.get_class('annotation');

    // // Setup the annotation profile and make the annotation document
    // // category and the current acc sticky in the filters.
    // var gps_args = {
    // 	'linker': linker,
    // 	'handler': handler,
    // 	'spinner_shield_message' : 'Loading and using this widget may take a long time on some large filter sets. If it takes too long, please close it and further narrow your results using other facets or the text search.<br />Waiting...',
    // 	'spinner_search_source' : sd.image_base + '/waiting_ajax.gif'
    // };
    // var gps = new widget.search_pane(gserv, gconf,
    // 					  'display-associations',
    // 					  gps_args);

    // Set the manager profile.
    gps.set_personality('annotation'); // profile in gconf
    gps.include_highlighting(true);

    // Two sticky filters.
    gps.add_query_filter('document_category', 'annotation', ['*']);
    gps.add_query_filter('bioentity', global_acc, ['*']);

    // Experiment.
    // Process incoming queries, pins, and filters (into
    // manager)--the RESTy bookmarking API.
    if( global_live_search_query ){ //has incoming query
    	ll("Try and use incoming query (set default): " +
	   global_live_search_query);
    	gps.set_comfy_query(global_live_search_query);
    }
    if( us.isArray(global_live_search_filters) ){ //has incoming filters
	us.each(global_live_search_filters, function(filter){
	    gps.add_query_filter_as_string(filter, ['$']);
	});
    }
    if( us.isArray(global_live_search_pins) ){ //has incoming pins
	us.each(global_live_search_pins, function(pin){
	    gps.add_query_filter_as_string(pin, ['*']);
	});
    }

    ///
    /// Major widget attachements to the manager.
    ///

    // Attach filters to manager.
    var hargs = {
	meta_label: 'Total annotations:&nbsp;',
	// free_text_placeholder:
	// 'Input text to filter against all remaining documents',
	'display_free_text_p': false
    };
    var filters = new widgets.live_filters('accordion', gps, gconf, hargs);
    filters.establish_display();

    // Attach pager to manager.
    var pager_opts = {
	results_title: 'Total annotations:&nbsp;',
    };
    var pager = new widgets.live_pager('pager', gps, pager_opts);
    
    // Attach the results pane and download buttons to manager.
    var default_fields = confc.field_order_by_weight('result');
    var btmpl = widgets.display.button_templates;    
    var flex_download_button = btmpl.flexible_download_b3(
	'Download <small>(up to ' + dlimit + ')</small>',
	dlimit,
	default_fields,
	'annotation',
	gconf,
	gserv_download);
    var results_opts = {
	//'callback_priority': -200,
	'user_buttons_div_id': pager.button_span_id(),
	'user_buttons': [
	    flex_download_button
	]
    };
    var results = new widgets.live_results('results', gps, confc,
					   handler, linker, results_opts);

    // Add pre and post run spinner (borrow filter's for now).
    gps.register('prerun', function(){
	filters.spin_up();
    });
    gps.register('postrun', function(){
	filters.spin_down();
    });

    gps.search();

     ///
    /// Create a bookmark for searching annotations and
    /// bioentities with this term. Generate links and activate
    /// hidden stubs in the doc.
    ///

    jQuery('#prob_related').removeClass('hidden');

    // Get bookmark for annotations.
    (function(){
	 // Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');

	man.set_personality('annotation');
	man.add_query_filter('document_category', 'annotation', ['*']);
	man.add_query_filter('bioentity', global_acc);
	var lstate = man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'annotation');
	 // Add it to the DOM.
	jQuery('#prob_ann_href').attr('href', lurl);
	jQuery('#prob_ann').removeClass('hidden');
    })();
    
    // Get bookmark for annotation download.
    (function(){
	// Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');
	
	man.set_personality('annotation');
	man.add_query_filter('document_category', 'annotation', ['*']);
	man.add_query_filter('bioentity', global_acc);
	var dstate = man.get_download_url(defs.gaf_from_golr_fields, {
	    'rows': dlimit,
	    'encapsulator': '',
	    'golr_download_url': gserv_download
	});
	jQuery('#prob_ann_dl_href').attr('href', dstate);
	jQuery('#prob_ann_dl').removeClass('hidden');
    })();

    //
    ll('GPDetailsInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ GPDetailsInit(); });
})();
