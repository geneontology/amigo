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

require('@geneontology/wc-gocam-viz/dist/custom-elements').defineCustomElements();

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
var rest_response = require('bbop-rest-response').json;

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
    if (dtabs) {
        ll('Apply tabs...');
        var fragname = window?.location?.hash
        if (fragname && fragname !== "#") {
            jQuery('#display-tabs a[href="' + fragname + '"]').tab('show');
        } else {
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

    // Begin Models tab setup
    var gocam_select = jQuery('#gomodel-select');
    var gocam_select_group = jQuery('#gomodel-select-group');
    var gocam_viz_container = jQuery('#gp-gocam-viz-container');
    var gocam_viz = null;
    var gocam_no_data_message = jQuery('#gocam-no-data-message');
    var gocam_fetch_error_message = jQuery('#gocam-fetch-error-message');

    // When the model select box changes, inform the go-cam widget of the new
    // model ID.
    gocam_select.on('change', function () {
        var model_id = jQuery(this).val();
        gocam_viz.setAttribute('gocam-id', model_id);
    });

    dtabs.on('shown.bs.tab', function (event) {
        // The user has clicked on the Models tab and the wc-gocam-viz widget has
        // not been set up yet (probably because this is the first time they've
        // viewed the tab). Initializing the widget is deferred until this point
        // because initializing it in a hidden element leads to a funky first render.
        if ($(event.target).attr('href') === '#display-models-tab' && !gocam_viz) {
            var model_id = gocam_select.val();
            gocam_viz = document.createElement('wc-gocam-viz');
            gocam_viz.setAttribute('gocam-id', model_id);
            gocam_viz.setAttribute('show-go-cam-selector', 'false');
            gocam_viz.setAttribute('show-has-input', 'false');
            gocam_viz.setAttribute('show-has-output', 'false');
            gocam_viz.setAttribute('show-gene-product', 'true');
            gocam_viz.setAttribute('show-activity', 'false');
            gocam_viz.setAttribute('show-legend', 'false');
            gocam_viz_container.append(gocam_viz);
        }
    });
    var barista_engine = new jquery_engine(rest_response);

    // If the request to get models for this GP fails, show an error message
    // and ensure the model selector, go-cam widget, and "no data" message are
    // all hidden.
    barista_engine.register('error', function () {
        gocam_fetch_error_message.removeClass('hidden');
        gocam_no_data_message.addClass('hidden');
        gocam_select_group.addClass('hidden');
        gocam_viz_container.addClass('hidden');
    });

    // When we successfully retrieve a list of models ensure the error message
    // is hidden. Then if there are models in the response, populate the select
    // box with those models as options. If there were no models in the response
    // show the "no data" message instead of the select box.
    barista_engine.register('success', function (resp) {
        gocam_fetch_error_message.addClass('hidden');
        gocam_select.empty();
        var body = resp.raw();
        if (body.models && body.models.length > 0) {
            gocam_no_data_message.addClass('hidden');
            gocam_select_group.removeClass('hidden');
            gocam_viz_container.removeClass('hidden');
            body.models.forEach(function (model) {
                gocam_select.append(`<option value=${model.id}>${model.title}</option>`);
            });
        } else {
            gocam_no_data_message.removeClass('hidden');
            gocam_select_group.addClass('hidden');
            gocam_viz_container.addClass('hidden');
        }
    });

    // Initiate the request to get list of models for the GP
    var base = 'http://barista.berkeleybop.org';
    var endpoint = '/search/models';
    // TODO: handle case where reponse returns more than 100 models
    var query = {
        offset: 0,
        limit: 100,
        gp: global_acc,
        expand: true
    };
    barista_engine.start(base + endpoint, query, 'GET');

    //
    ll('GPDetailsInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ GPDetailsInit(); });
})();
