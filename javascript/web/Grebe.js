////
//// For now, a simple hook into Grebe once live. Just three lines, so
//// will probably leave DEBUG in.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global bbop */
/* global amigo */
/* global global_grebe_questions */

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
    var each = bbop.core.each;
    var clone = bbop.core.clone;
    var is_defined = bbop.core.is_defined;
    var search_box = bbop.widget.search_box;
    function ll(str){ logger.kvetch(str); }

    //ll('');
    ll('GrebeInit start...');

    // Manager generation prep.
    var sd = new amigo.data.server(); // resource locations
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var linker = new amigo.linker();

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
    each(global_grebe_questions,
	 function(grebe_item){
	    
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
	     each(field_translations,
		  function(field_translation){

		      // Pull out the important fields of this item.
		      var field_id = field_translation['field_id'];
		      var field_filter = field_translation['field_filter'];
		      // var field_personality =
		      // 	  field_translation['field_personality'];
		      var widget_options =
			  field_translation['widget_options'];
		      var widget_personality =
			  field_translation['widget_personality'];
		      var widget_document =
			  field_translation['widget_document'];
		      var widget_filters =
			  field_translation['widget_filters'] || [];

		      ll('ft: ' + field_id + ' ' + field_filter);
		      ll('wt: ' + widget_personality + ' ' + widget_document);
		      ll('wf: ' + widget_filters.join(', '));

		      // Sort out which widget args template we'll use.
		      var widget_args =
			  widget_args_templates[widget_options];

		      // Generate the autocomplete widget.
		      var auto = new search_box(sd.golr_base(), gconf,
						field_id, widget_args);
		      auto.set_personality(widget_personality);
		      // auto.set_personality(field_personality);
		      auto.add_query_filter('document_category',
					    widget_document);
		      // We don't need much here, just return the
		      // minimal set.
		      auto.lite(true);
		      // Cycle through the additional widget
		      // restriction filters and add them.
		      each(widget_filters,
			   function(widget_filter){
			       // First, break it.
			       var filter_and_value = 
				   bbop.core.first_split(':', widget_filter);
			       var wfilter = filter_and_value[0];
			       var wvalue = filter_and_value[1];

			       // If tested, add the filter.
			       if( is_defined(wfilter) && is_defined(wvalue) ){
				   auto.add_query_filter(wfilter, wvalue);
			       }
			   });

		      // Ensure map and store these for processing on
		      // click.
		      map[question_id]['field_translations'].push(
			  {
			      'field_id': field_id,
			      'field_filter': field_filter,
			      // Store the manager for later.
			      'manager': auto
			  });

		      //ll('a1: ' + auto);
		      //ll('a2: ' + bbop.core.what_is(auto));
		  });
	     
	     // Finally, set the icon to open a new window when
	     // clicked.
	     var grebe_action_class = '.amigo-grebe-action';
	     jQuery('#' + question_id).find(grebe_action_class).click(function(){

		 // First, create a new manager for this line item.
		 // We'll build-up its filters as we go.
		 var mgr = new bbop.golr.manager.jquery(sd.golr_base(), gconf);

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
		 each(pins, function(pin_def){
		     
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
		 
		 // Unwind the map of names to autocompletes
		 each(fts, function(ft){
		     //var fid = ft['field_id'];
		     var ffield = ft['field_filter'];
		     var ac = ft['manager'];
		     ll('ffield: ' + ffield);
		     ll('manager: ' + ac);
		     ll('iid: ' + ac._interface_id);
		     
		     var fc = ac.content();
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
