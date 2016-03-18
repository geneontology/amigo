////
//// A full take on a production live search for GOlr.
//// It ends up being a light wrapping around the search_pane widget.
//// 

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_live_search_pins */
/* global global_live_search_query */
/* global global_live_search_personality */
/* global global_live_search_filters */
/* global global_live_search_bookmark */
/* global global_live_search_filter_idspace */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');

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

// Download limit.    
var dlimit = defs.download_limit;

//
function LiveSearchGOlrInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('LS: ' + str); }    

    // Start messages.
    ll('');
    ll('LiveSearchGOlr.js');
    ll('LiveSearchGOlrInit start...');

    ///
    /// Ready the configuration that we'll use.
    ///

    // Manager setup.
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    
    // Allow for smaller queries.
    // manager.minimal_query(0);

    ///
    /// Defined some useful buttons.
    ///

    // Global download properties.
    var _dl_props = {
	'entity_list': null,
	'rows': dlimit
    };

    // Define the rows that we'll use to create a psuedo-GAF.
    var _gaf_fl = defs.gaf_from_golr_fields;

    // Create button templates to use from our library.
    var btmpl = widgets.display.button_templates;

    var id_download_button =
	    btmpl.field_download('Download IDs (up to ' + dlimit + ')',
				 dlimit, ['id']);
    var id_label_download_button =
	    btmpl.field_download('Download IDs and labels (up to ' + dlimit + ')',
				 dlimit, ['annotation_class',
					  'annotation_class_label']);
    var gaf_download_button =
	    btmpl.field_download('GAF chunk download (up to ' + dlimit + ')',
				 dlimit, _gaf_fl);
    // Flexible download buttons.
    var ont_flex_download_button =
	    btmpl.flexible_download_b3('Flex download (up to ' + dlimit + ')',
				       dlimit,
				       ['annotation_class', 'annotation_class_label'],
				       'ontology',
				       gconf);
    var bio_flex_download_button =
	    btmpl.flexible_download_b3('Flex download (up to ' + dlimit + ')',
				       dlimit,
				       ['bioentity', 'bioentity_label'],
				       'bioentity',
				       gconf);
    var ann_flex_download_button =
	    btmpl.flexible_download_b3('Flex download (up to ' + dlimit + ')',
				       dlimit,
				       defs.gaf_from_golr_fields,
				       'annotation',
				       gconf);
    //var bookmark_button = btmpl.bookmark(linker);
    var bookmark_button = btmpl.restmark(linker);
    var facet_matrix_button = btmpl.open_facet_matrix(gconf, sd);

    ///
    /// Ready widget.
    ///

    // var hargs = {
    // 	'linker': linker,
    // 	'handler': handler,
    // 	'base_icon_url' : null,
    // 	'image_type' : 'gif',
    // 	'layout_type' : 'two-column',
    // 	'show_global_reset_p' : true,
    // 	'show_searchbox_p' : true,
    // 	'show_filterbox_p' : true,
    // 	'show_pager_p' : true,
    // 	'show_checkboxes_p' : true,
    // 	//'show_checkboxes_p' : false,
    // 	//'spinner_search_source' : '',
    // 	'spinner_search_source' : sd.image_base + '/waiting_ajax.gif',
    // 	//'spinner_shield_source' : sd.image_base() + '/waiting_poll.gif'
    // 	'spinner_shield_message' : 'Loading and using this widget may take a long time on some large filter sets. If it takes too long, please close it and further narrow your results using other facets or the text search.<br />Waiting...',
    // 	'spinner_shield_source' : sd.image_base + '/waiting_ajax.gif'
    // 	//
    // 	//'icon_clear_label' : _button_wrapper('X', 'Clear text from query'),
    // 	//'icon_clear_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    // 	//'icon_reset_label' : '&nbsp;<b>[reset all user filters]</b>',
    // 	//'icon_remove_label' : _button_wrapper('X', 'Remove filter from query'),
    // 	//'icon_remove_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    // 	//'icon_positive_label' : _button_wrapper('+', 'Add positive filter'),
    // 	//'icon_positive_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    // 	//'icon_negative_label' : _button_wrapper('-', 'Add negative filter')
    // 	//'icon_negative_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png'
    // };
    // var search = new bbop.widget.search_pane(gserv, gconf, div_id, hargs);
    // // We like highlights; they should be included automatically
    // // through the widget.
    
    ///
    /// Handle setup:
    ///  1) We /need/ to have a personality defined. If not, it is an error--
    ///     we no longer do the (confusing) tabbed-switch approach.
    ///  2) Process incoming queries/filters (into manager).
    ///  3) Process incoming bookmarks (into manager).
    ///  4) Render manager state to display.
    ///
    
    // 1) Check for incoming personality.
    // A little handling if we came in on a personality dispatch.
    if( ! global_live_search_personality ||
	global_live_search_personality === ''){
	ll('ERROR: No personality defined, cannot continue.');
	alert('ERROR: No personality defined, cannot continue.');
    }else{
	ll("Detected dispatch argument (can progress): " +
	   global_live_search_personality);

	///
	/// 
	///

	var personality = global_live_search_personality;

	// _on_search_select(global_live_search_personality);
	manager.include_highlighting(true);
	manager.set_personality(global_live_search_personality);
	manager.lite(true);

	// 2) Process incoming queries, pins, and filters (into
	// manager)--the RESTy bookmarking API.
	// Check to see if we have an incoming query (likely the landing page).
	if( global_live_search_query ){ // has incoming query
    	    ll("Try and use incoming query (set default): " +
	       global_live_search_query);
    	    manager.set_comfy_query(global_live_search_query);
	    //var def_comfy = search.set_comfy_query(global_live_search_query);
    	    //search.set_default_query(def_comfy);	    
    	    //search.set_query(def_comfy);	    
	}
	if( us.isArray(global_live_search_filters) ){ // has incoming filters
	    us.each(global_live_search_filters, function(filter){
		manager.add_query_filter_as_string(filter, ['$']);
	    });
	}
	if( us.isArray(global_live_search_pins) ){ // has incoming pins
	    us.each(global_live_search_pins, function(pin){
		manager.add_query_filter_as_string(pin, ['*']);
	    });
	}
	
	// 3) Process incoming bookmarks (into manager).
	// Check to see if we have a bookmark or not. If we have one, run
	// it.
	if( global_live_search_bookmark ){ // has bookmark
	    ll("Try and use bookmark in establishment.");
	    
	    // Load it and see what happens.
	    var parm_list = bbop.url_parameters(global_live_search_bookmark);
	    //alert(bbop.dump(parm_list));
	    var bookmark_probe = bbop.hashify(parm_list);
	    //alert(bbop.dump(bookmark_probe));
	    
	    // Sanity check.
	    if( ! bookmark_probe['personality'] || // bookmark is bad
		bookmark_probe['json.nl'] !== 'arrarr' ||
		bookmark_probe['wt'] !== 'json' ){ //||
		    //! bookmark_probe['document_category'] ){
		    
		    ll("Bookmark lacks sanity.");
		    alert('ERROR: Bookmark did not include a personality, ' +
			  'and sanity. ' +
			  'Please remove the bookmark parameter from the URL.');
		}else{ // probably good bookmark
		    ll("Bookmark has a personality: "+manager.get_personality());
		    
		    // Load bookmark.
		    ll("Pre bookmark: " + manager.get_query_url());
		    ll(global_live_search_bookmark);
		    ll("Pre-bookmark personality: " + manager.get_personality());
		    manager.load_url(global_live_search_bookmark);
		    ll("Post-bookmark personality: "+ manager.get_personality());
		    ll("Post bookmark: " + manager.get_query_url());
		}
	}else{ // no bookmark
	    ll("No bookmark in establishment.");
	} 

	// 4) Render manager state to display.
	// Run through our pre-defined activation functions
	// Add the appropriate filters, and gather the appropriate buttons
	// (that we'll add later.)
	var buttons_to_use = [];
	ll('Using _personality_buttons');
	if( personality === 'annotation' ){
	    
    	    manager.add_query_filter('document_category',
    				     'annotation', ['*']);
	    
	    // Only add matrix button for labs for now.
	    if( sd.beta && sd.beta === '1' ){
		buttons_to_use.push(facet_matrix_button);		
	    }
	    buttons_to_use.push(gaf_download_button);
	    buttons_to_use.push(ann_flex_download_button);
	    //buttons_to_use.push(gaf_galaxy_button);
	    buttons_to_use.push(bookmark_button);

	}else if( personality === 'ontology' ){

    	    manager.add_query_filter('document_category',
				     'ontology_class', ['*']);
	    if( typeof(global_live_search_filter_idspace) !== 'undefined' &&
		global_live_search_filter_idspace ){
    		    manager.add_query_filter('idspace',
					     global_live_search_filter_idspace);
		}
    	    manager.add_query_filter('is_obsolete', 'false');

	    //buttons_to_use.push(id_label_download_button);
	    buttons_to_use.push(ont_flex_download_button);
	    //buttons_to_use.push(id_term_label_galaxy_button);
	    buttons_to_use.push(bookmark_button);

	}else if( personality === 'bioentity' ){

    	    manager.add_query_filter('document_category', 
				     'bioentity', ['*']);

	    //buttons_to_use.push(id_download_button);
	    buttons_to_use.push(bio_flex_download_button);
	    //buttons_to_use.push(id_symbol_galaxy_button);
	    buttons_to_use.push(bookmark_button);

	}else if( personality === 'model_annotation' ){

    	    manager.add_query_filter('document_category',
    				     'model_annotation', ['*']);

	}else if( personality === 'noctua_model_meta' ){

    	    manager.add_query_filter('document_category',
    				     'noctua_model_meta', ['*']);

	}else if( personality === 'family' ){

    	    manager.add_query_filter('document_category',
    				     'family', ['*']);
	    
	}else if( personality === 'general' ){
	    
    	    manager.add_query_filter('document_category',
    				     'general', ['*']);
	    
	}else if( personality === 'bbop_term_ac' ){
	    
    	    manager.add_query_filter('document_category',
    				     'ontology_class', ['*']);

	}else{
	    alert('cannot establish unknown personality: ' + personality);
	}

	///
	/// Setup widgets around manager.
	///

	// Attach filters to manager.
	var hargs = {
	    meta_label: 'Total pool:&nbsp;',
	    // free_text_placeholder:
	    // 'Input text to filter against all remaining documents',
	    //'display_free_text_p': false
	    'display_free_text_p': true
	};
	var filters = new widgets.live_filters('accordion', manager,
					       gconf, hargs);
	filters.establish_display();

	// Attach pager to manager.
	var pager_opts = {
	};
	var pager = new widgets.live_pager('pager', manager, pager_opts);

	// Attach the results pane and download buttons to manager.
	var results_opts = {
	    //'callback_priority': -200,
	    'user_buttons_div_id': pager.button_span_id(),
	    'user_buttons': buttons_to_use
	};
	var confc = gconf.get_class(personality);
	var results = new widgets.live_results('results', manager, confc,
					       handler, linker, results_opts);

	// Establish the display with what we have.
	manager.search();
	//ll("Post establish: " + search.get_query_url());
	
	// Make sure the text query is there and proper.
	// Remember, we don't refresh it off of search like the others
	// because it needs persistance for the UI.
	ll("Post query: " + manager.get_query());
	ll("Post default query: " + manager.get_default_query());
	if( manager.get_query() === manager.get_default_query() ){
	    // The default is the same as nothing at all since it is
	    // default.
	    filters.query_field_text('');
	}else{
	    // Wild cards are set after the fact in comfy, so just
	    // remove the wildcard if it is sitting there at the end.
	    var gq = manager.get_query();
	    if( '*' === gq.charAt(gq.length - 1) ){
		gq = gq.substring(0, gq.length - 1);		
	    }
	    filters.query_field_text(gq);
	}
	
	// Destroy the bookmark so we don't keep hitting it.
	// NOTE: jshint does not like the redefinition of the global,
	// not sure if it's actually disallowed in the browser context
	// though...
	/* jshint ignore:start */
	global_live_search_bookmark = null;
	/* jshint ignore:end */
    }
    
    // Done message.
    ll('LiveSearchGOlrInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ LiveSearchGOlrInit(); });
})();
