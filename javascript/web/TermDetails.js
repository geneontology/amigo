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

// Take and element, look at it's contents, if it's above a certain
// threshold, shrink with "more..." button, otherwise leave alone.
function _shrink_wrap(elt_id){

    // Now take what we have, and wrap around some expansion code if
    // it looks like it is too long.
    var _trim_hash = {};
    var _trimit = 100;
    // Only want to compile once.
    var ea_regexp = new RegExp("\<\/a\>", "i"); // detect an <a>
    var br_regexp = new RegExp("\<br\ \/\>", "i"); // detect a <br />

    function _trim_and_store( in_str ){
	
	var retval = in_str;

	// Let there be tests.
	var list_p = br_regexp.test(retval);
	var anchors_p = ea_regexp.test(retval);
	
	// Try and break without breaking anchors, etc.
	var tease = null;
	if( ! anchors_p && ! list_p ){
	    // A normal string then...trim it!
	    //ll("\tT&S: easy normal text, go nuts!");
	    tease = new html.span(bbop.crop(retval, _trimit, '...'),
				  {'generate_id': true});
	}else if( anchors_p && ! list_p ){
	    // It looks like it is a link without a break, so not
	    // a list. We cannot trim this safely.
	    //ll("\tT&S: single link so cannot work on!");
	}else{
	    //ll("\tT&S: we have a list to deal with");
	    
	    var new_str_list = retval.split(br_regexp);
	    if( new_str_list.length <= 3 ){
		// Let's just ignore lists that are only three
		// items.
		//ll("\tT&S: pass thru list length <= 3");
	    }else{
		//ll("\tT&S: contruct into 2 plus tag");
		var new_str = '';
		new_str = new_str + new_str_list.shift();
		new_str = new_str + '<br />';
		new_str = new_str + new_str_list.shift();
		tease = new html.span(new_str, {'generate_id': true});
	    }
	}
	
	// If we have a tease (able to break down incoming string),
	// assemble the rest of the packet to create the UI.
	if( tease ){
	    // Setup the text for tease and full versions.
	    var bgen = function(lbl, dsc){
		var b = new html.button(lbl, {
		    'generate_id': true,
		    'type': 'button',
		    'title': dsc || lbl,
		    //'class': 'btn btn-default btn-xs'
		    'class': 'btn btn-primary btn-xs'
		});
		return b;
	    };
	    var more_b = new bgen('more', 'Display the complete list');
	    var full = new html.span(retval, {'generate_id': true});
	    var less_b = new bgen('less', 'Display the truncated list');
	    
	    // Store the different parts for later activation.
	    var tease_id = tease.get_id();
	    var more_b_id = more_b.get_id();
	    var full_id = full.get_id();
	    var less_b_id = less_b.get_id();
	    _trim_hash[tease_id] = [tease_id, more_b_id, full_id, less_b_id];
	    
	    // New final string.
	    retval = tease.to_string() + " " +
		more_b.to_string() + " " +
		full.to_string() + " " +
		less_b.to_string();
	}
	
	return retval;
    }

    var pre_html = jQuery('#' + elt_id).html();
    if( pre_html && pre_html.length && (pre_html.length > _trimit * 2) ){

	// Get the new value into the wild.
	var new_str = _trim_and_store(pre_html);
	if( new_str !== pre_html ){
	    jQuery('#' + elt_id).html(new_str);  

	    // Bind the jQuery events to it.
	    // Add the roll-up/down events to the doc.
	    us.each(_trim_hash, function(val, key){
    		var tease_id = val[0];
    		var more_b_id = val[1];
    		var full_id = val[2];
    		var less_b_id = val[3];
		
    		// Initial state.
    		jQuery('#' + full_id ).hide();
    		jQuery('#' + less_b_id ).hide();
		
    		// Click actions to go back and forth.
    		jQuery('#' + more_b_id ).click(function(){
    		    jQuery('#' + tease_id ).hide();
    		    jQuery('#' + more_b_id ).hide();
    		    jQuery('#' + full_id ).show('fast');
    		    jQuery('#' + less_b_id ).show('fast');
    		});
    		jQuery('#' + less_b_id ).click(function(){
    		    jQuery('#' + full_id ).hide();
    		    jQuery('#' + less_b_id ).hide();
    		    jQuery('#' + tease_id ).show('fast');
    		    jQuery('#' + more_b_id ).show('fast');
    		});
	    });    
	}
    }
}

//
function TermDetailsInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('TD: ' + str); }    

    ll('');
    ll('TermDetails.js');
    ll('TermDetailsInit start...');

    // // Use jQuery UI to tooltip-ify doc.
    // var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    // jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // Rollup long synonym lists.
    //var spans = jQuery('.syn-collapsible');
    _shrink_wrap('syn-collapse-alt');
    _shrink_wrap('syn-collapse-syn');

    // Go ahead and drop in the table sorter. Easy!
    jQuery("#all-table-above").tablesorter(); 
    jQuery("#all-table-below").tablesorter(); 

    // Tabify the layout if we can (may be in a non-tabby version).
    var dtabs = jQuery("#display-tabs");
    if( dtabs ){
    	ll('Apply tabs...');
    	// jQuery("#display-tabs").tabs();
    	// jQuery("#display-tabs").tabs('option', 'active', 0);

	// Since we're a tabby version, we're going to try and open
	// any tabs defined by fragments.
	if( window && window.location && window.location.hash &&
	    window.location.hash !== "" && window.location.hash !== "#" ){
		var fragname = window.location.hash;
		jQuery('#display-tabs a[href="' + fragname + '"]').tab('show');
	    }else{
    		jQuery("#display-tabs a:first").tab('show');
	    }
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
    // 				     'display-associations', gps_args);
    // Set the manager profile.
    gps.set_personality('annotation'); // profile in gconf
    gps.include_highlighting(true);

    // Two sticky filters.
    gps.add_query_filter('document_category', 'annotation', ['*']);
    gps.add_query_filter('regulates_closure', global_acc, ['*']);
    //gps.add_query_filter('annotation_class', global_acc, ['*']);
    // TODO: And or this in as well.
    //gps.add_query_filter('annotation_class', global_acc, ['*']);

    // Add a bioentity download button.
    var btmpl = widgets.display.button_templates;
    var ont_flex_download_button =
	    btmpl.flexible_download('Flex download (up to ' + dlimit + ')',
				    dlimit,
				    defs.gaf_from_golr_fields,
				    'annotation',
				    gconf);

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
    var flex_download_button = btmpl.flexible_download_b3(
	'<span class="glyphicon glyphicon-download"></span> Download',
	dlimit,
	default_fields,
	'annotation',
	gconf);
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

    // Get bookmark for bioentities.
    (function(){
	// Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');

	man.set_personality('annotation');
	man.add_query_filter('document_category', 'bioentity', ['*']);
	man.add_query_filter('regulates_closure', global_acc);
	var lstate = man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'bioentity');
	// Add it to the DOM.
	jQuery('#prob_bio_href').attr('href', lurl);
	jQuery('#prob_bio').removeClass('hidden');
    })();
    
    // Get bookmark for annotations.
    (function(){
	// Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');
	
	man.set_personality('annotation');
	man.add_query_filter('document_category', 'annotation', ['*']);
	man.add_query_filter('regulates_closure', global_acc);
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
	man.add_query_filter('regulates_closure', global_acc);
	var dstate = man.get_download_url(defs.gaf_from_golr_fields, {
	    'rows': dlimit,
	    'encapsulator': ''
	});
	jQuery('#prob_ann_dl_href').attr('href', dstate);
	jQuery('#prob_ann_dl').removeClass('hidden');
    })();
    
    //
    ll('TermDetailsInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ TermDetailsInit(); });
})();
