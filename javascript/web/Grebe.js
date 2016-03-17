////
//// For now, a simple hook into Grebe once live. Just three lines, so
//// will probably leave DEBUG in.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global global_grebe_questions */

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

//
function GrebeInit(){

    // Use jQuery UI to tooltip-ify doc.
    // Keep them above.
    var gtt_args = {
	'position': {'my': 'center bottom-5', 'at': 'center top'},
	'tooltipClass': 'amigo-searchbar-tooltip-style'
    };
    jQuery('.amigo-grebe-tooltip').tooltip(gtt_args);

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;

    // Aliases.
    var clone = bbop.clone;
    var is_defined = bbop.is_defined;
    function ll(str){ logger.kvetch(str); }

    //ll('');
    ll('GrebeInit start...');

    // Auto complete argument sets.
    var _do_nothing = function(){};
    var widget_args_templates = {
	bbop_ont: {
	    'label_template':
	    '{{annotation_class_label}} ({{id}})',
	    'value_template': '{{annotation_class}}',
	    'list_select_callback': _do_nothing
	    //'list_select_callback': forward
	},
	bbop_term_ac: {
	    'label_template':
	    '{{annotation_class_label}} ({{id}})',
	    'value_template': '{{annotation_class}}',
	    'list_select_callback': _do_nothing
	    //'list_select_callback': forward
	},
	bbop_family: {
	    'label_template':
	    '{{panther_family_label}} ({{panther_family}})',
	    'value_template': '{{panther_family}}',
	    'list_select_callback': _do_nothing
	    //'list_select_callback': forward
	},
	bioentity: {
	    'label_template':
	    '{{bioentity_label}} ({{id}}/{{taxon_label}})',
	    'value_template': '{{bioentity}}',
	    'list_select_callback': _do_nothing
	    //'list_select_callback': forward
	},
	general: {
	    'label_template':
	    '{{entity_label}} ({{entity}})',
	    'value_template': '{{entity}}',
	    'list_select_callback': _do_nothing
	    //'list_select_callback': forward
	}
    };

    // The multi-level cache for the lists.
    var map = {};

    // Iterate over our structured list and try to apply the
    // information to make a live manager to use. This will also
    // generate a list of independant managers that will listen and
    // act on the autocomplete input actions.
    us.each(global_grebe_questions, function(grebe_item){
		
	// First, let's decompose the grebe list item into
	// sensible parts
	var question_id = grebe_item['question_id'];
	var document_category = grebe_item['document_category'];
	var personality = grebe_item['personality'];
	var field_translations = grebe_item['field_translations'] || [];
	var question_pins = grebe_item['question_pins'] || [];
	
	ll('processing: ' + question_id);
	
	// Ensure map.
	if( ! is_defined(map[question_id]) ){
	    map[question_id] = {
		'question_id': question_id,
		'document_category': document_category,
		'personality': personality,
		'field_translations': [],
		'question_pins': question_pins
	    };
	}
	
	// Now walk through and tie this manager to the
	// proper fields.
	us.each(field_translations, function(field_translation){
	    
	    // Pull out the important fields of this item.
	    var field_id = field_translation['field_id'];
	    var field_filter = field_translation['field_filter'];
	    // var field_personality =
	    // 	  field_translation['field_personality'];
	    var widget_options = field_translation['widget_options'];
	    var widget_personality = field_translation['widget_personality'];
	    var widget_document = field_translation['widget_document'];
	    var widget_filters = field_translation['widget_filters'] || [];
	    
	    ll('ft: ' + field_id + ' ' + field_filter);
	    ll('wt: ' + widget_personality + ' ' + widget_document);
	    ll('wf: ' + widget_filters.join(', '));
	    
	    // Sort out which widget args template we'll use.
	    var widget_args = widget_args_templates[widget_options];

	    // Create and setup manager to use in the autocomplete.
	    var engine = new jquery_engine(golr_response);
	    engine.method('GET');
	    engine.use_jsonp(true);
	    var acmgr = new golr_manager(gserv, gconf, engine, 'async');

	    acmgr.set_personality(widget_personality);
	    // acmgr.set_personality(field_personality);
	    acmgr.add_query_filter('document_category',
				   widget_document);
	    // We don't need much here, just return the minimal set.
	    acmgr.lite(true);
	    // Cycle through the additional widget
	    // restriction filters and add them.
	    us.each(widget_filters, function(widget_filter){
		// First, break it.
		var filter_and_value = bbop.first_split(':', widget_filter);
		var wfilter = filter_and_value[0];
		var wvalue = filter_and_value[1];

		// If tested, add the filter.
		if( is_defined(wfilter) && is_defined(wvalue) ){
		    acmgr.add_query_filter(wfilter, wvalue);
		}
	    });
	    
	    // Generate the autocomplete widget.
	    // var auto = new search_box(sd.golr_base(), gconf,
	    // 			      field_id, widget_args);
	    // Actually initialize the widget.
	    var auto = new widgets.autocomplete_simple(acmgr, gserv, gconf,
						       field_id, widget_args);

	    // Ensure map and store these for processing on click.
	    map[question_id]['field_translations'].push({
		'field_id': field_id,
		'field_filter': field_filter,
		// Store the manager for later.
		'manager': acmgr,
		'widget': auto
	    });
	    
	    //ll('a1: ' + auto);
	    //ll('a2: ' + bbop.what_is(auto));
	});
	
	// Finally, set the icon to open a new window when
	// clicked.
	var grebe_action_class = '.amigo-grebe-action';
	jQuery('#' + question_id).find(grebe_action_class).click(function(){
	    
	    // First, create a new manager for this line item.
	    // We'll build-up its filters as we go.
	    var engine = new jquery_engine(golr_response);
	    engine.method('GET');
	    engine.use_jsonp(true);
	    var mgr = new golr_manager(gserv, gconf, engine, 'async');
	    
	    // Collect the contents of the input boxes and
	    // fold those into the jumping search manager.
	    var smap = map[question_id];
	    var qid = smap['question_id'];
	    var dc = smap['document_category'];
	    var prs = smap['personality'];
	    var fts = smap['field_translations'];
	    var pins = smap['question_pins'];
	    
	    // The primary filters.
	    mgr.set_personality(prs);
	    mgr.add_query_filter('document_category', dc, ['*']);
	    
	    // Add all of the pins that we can.
	    ll('pin count for (' + dc + '): ' + pins.length);
	    us.each(pins, function(pin_def){
		
		var fname = null;
		var fval = null;
		//var fmods = [];
		
		if( typeof(pin_def['field_name']) !== 'undefined'){
		    fname = pin_def['field_name'];
		}
		if( typeof(pin_def['field_value']) !== 'undefined'){
		    fval = pin_def['field_value'];
		}
		// if( typeof(pin_def['field_modifiers']) !== 'undefined'){
		//     fmods = pin_def['field_modifiers'];
		//     if( typeof(fmods) === 'string' ){
		// 	 fmods = [fmods];
		//     }
		// }
		
		// Only add if minimally defined.
		ll('pin field name: ' + fname);
		ll('pin field val: ' + fval);
		if( fname && fval ){
		    mgr.add_query_filter(fname, fval);
		}
	    });
	    
	    // Unwind the map of names to autocompletes.
	    us.each(fts, function(ft){
		//var fid = ft['field_id'];
		var ffield = ft['field_filter'];
		var mgr = ft['manager'];
		var wdg = ft['widget'];
		ll('ffield: ' + ffield);
		ll('manager: ' + mgr);
		ll('iid: ' + wdg._interface_id);
		
		var fc = wdg.content();
		ll('content: ' + fc);
		
		mgr.add_query_filter(ffield, fc);
	    });
	    
	    //alert('clicked: ' + qid);
	    //alert('clicked: ' + mgr.get_query_url());
	    
	    // Jump to that search in AmiGO 2.
	    var state = mgr.get_state_url();
	    var pop = linker.url(encodeURIComponent(state), 'search', prs);
	    window.open(pop, '_blank');
	});
    });
    
    ll('GrebeInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ GrebeInit(); });
})();
