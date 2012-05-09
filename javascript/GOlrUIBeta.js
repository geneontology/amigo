////
//// An all-encompassing UI object.
////

// // NOTE: the first item in the hash is the default op.
// // TODO: need a special object for adding and translations
// //       would be easy for testing!
// // TODO: Callbacks.

// An experimental dynamic UI builder.
// TODO: will also probably need to take go_meta at some point.
function GOlrUIBeta(in_args){
    bbop.registry.call(this, ['action']);

    var gui_anchor = this;
    
    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // There should be a string interface_id argument.
    if( in_args && ! in_args['interface_id'] ){
	ll('UIB: ERROR: no interface_id argument');
	if( typeof in_args['interface_id'] != 'string' ){
	    ll('UIB: ERROR: no interface_id string argument');
	}
    }
    // The location where we'll build and manage the interface.
    this.interface_id = in_args['interface_id'];
   
    // AmiGO helper.
    var amigo = new bbop.amigo();
    var golr = amigo.golr_response;

    // Get the user interface hook and remove anything that was there.
    var ui_div_hook = this.interface_id;
    jQuery('#' + ui_div_hook).empty();

    // Mangle everything around this unique id so we don't collide
    // with other instances on the same page.
    var mangle = ui_div_hook + '_ui_element_';

    // Render a control section into HTML.
    var ui_controls_div_hook = mangle + 'ui-controls-wrapper';
    var controls_div = new bbop.html.tag('div', {'id': ui_controls_div_hook});
    //jQuery('#' + ui_div_hook).append(controls_div.to_string());

    // Render a results section into HTML.
    var ui_results_div_hook = mangle + 'ui-results-wrapper';
    var results_div = new bbop.html.tag('div', {'id': ui_results_div_hook});
    //jQuery('#' + ui_div_hook).append(results_div.to_string());

    // Main hooks to the changable areas of the display.
    var hook_meta_div = mangle + 'meta';
    var hook_results_div = mangle + 'results';
    var hook_filters_div = mangle + 'filters';

    // Add the sections to a two column layout and add that into the
    // main ui div.
    var two_col = new GOlrTemplate.two_column_layout(controls_div, results_div);
    jQuery('#' + ui_div_hook).append(two_col.to_string());

    // Additional id hooks for easy callbacks.
    var accordion_div_hook = mangle + 'filter-accordion';
    var q_input_hook = mangle + 'q';
    
    // This structure is used in multiple functions
    var filter_accordion = null;

    // Initialize with reseting data.
    this.make_search_controls_frame = function(json_data){
    
	ll('UIB: Initial build of UI from reset response: ' + ui_div_hook);

	///
	/// Start building free text input here.
	///

	var free_input_label =
	    new bbop.html.tag('label', {'for': 'q'}, 'Search: ');
	jQuery('#' + ui_controls_div_hook).append(free_input_label.to_string());
	var free_input_attrs = {
	    'id': q_input_hook,
	    'name': 'q',
	    'class': "golr-q textBox textBoxLighten",
	    'value': "",
	    'size': "30",
	    'type': 'text'
	};
	var free_input = new bbop.html.input(free_input_attrs);	
	jQuery('#' + ui_controls_div_hook).append(free_input.to_string());

	// Add event for q input.
	jQuery('#' + q_input_hook).keyup(gui_anchor._run_action_callbacks);
	
	// Continue with the rest of the display (filter, results,
	// etc.) controls.
	gui_anchor.make_filter_controls_frame(json_data);
    };

    // Initialize with reseting data.
    this.make_filter_controls_frame = function(json_data){
    
	///
	/// Create a frame to hang the query and filters on.
	///
	var filter_input = new bbop.html.tag('div', {'id': hook_filters_div});
	jQuery('#' + ui_controls_div_hook).append(filter_input.to_string());

	///
	/// Start building the accordion here. Not updatable parts.
	///

	var filter_accordion_attrs = {
	    id: accordion_div_hook,
	    style: 'width: 25em;'
	};
	filter_accordion =
	    new bbop.html.accordion([], filter_accordion_attrs, true);

	// Add the sections with no contents as a skeleton to be
	// filled by draw filters.
	var field_list = golr.facet_field_list(json_data);
	function _process_in_fields_as_sections(in_field){
	    ll('UIB: saw field: ' + in_field);
	    filter_accordion.add_to(in_field, '', true);
	}
	bbop.core.each(field_list, _process_in_fields_as_sections);

	// Add the output from the accordion to the page.
	//jQuery('#' + ui_div_hook).html(filter_accordion.to_string());
	jQuery('#' + hook_filters_div).append(filter_accordion.to_string());

	// Add the jQuery accordioning.
	jQuery("#" + accordion_div_hook).accordion({ clearStyle: true,
						     collapsible: true,
						     active: false });
    };

    // ...
    this.draw_filters = function(json_data){
    
	ll('UIB: Draw current filters: ' + ui_div_hook);

	// Make sure that accordion has already been inited.
	if( typeof(filter_accordion) == 'undefined'){
	    throw new Error('Need to init accordion ().');
	}

	//var field_attr_hash = {};
	var field_list = golr.facet_field_list(json_data);
	function _process_in_fields(in_field, in_i){
	    //ll('UIB: saw field: ' + in_field);

	    // // If a list was already there, clear it out.
	    // // if( jQuery("#" + ul_id) ){ jQuery("#" + ul_id).remove(); }

	    // Create ul lists of the facet contents.
	    var ul_id = mangle + 'filter-list-' + in_field;
	    var facet_list_ul_attrs = {
		id: ul_id,
		'class': 'golr-filter-selectable',
		style: 'height: 30em;'
	    };
	    var facet_list_ul = new bbop.html.list([], facet_list_ul_attrs);
	    var facet_contents_list = golr.facet_field(json_data, in_field);
	    bbop.core.each(facet_contents_list,
			   function(item){
			       var name = item[0];
			       //var count = item[1];
			       //ll('UIB: saw facet item: ' + name);
			       facet_list_ul.add_to(name);
			   });

	    // Add the ul list to the accordion.
	    var sect_id = filter_accordion.get_section_id(in_field);
	    // ll('UIB: add to accordion: ' + sect_id + ' ' +
	    //    facet_list_ul.to_string());
	    jQuery('#' + sect_id).empty();
	    var final_ul_str = facet_list_ul.to_string();
	    jQuery('#' + sect_id).append(final_ul_str);
	}
	bbop.core.each(field_list, _process_in_fields);

	// Make the accordion controls live.
	jQuery(function() {
		   // Add the jQuery selectableing. When any selecting
		   // activity is stopped, grab all items from the
		   // entire interface and create a filtering object.
		   function _init_lambda(item, i){
		       var _select_arg = {
			   stop: function(){
			       // var result = jQuery("#DEBUG").empty();
			       // result.append("result");
			       // jQuery(".ui-selected", this).each(
			       // 	   function(){
			       //    var liid = mangle +"filter-list-"+ item;
			       // 	       var index =
			       //   jQuery("#"+ liid +" li").index(this);
			       // 	       result.append(" " + item + " " +
			       // 			     ( index + 1));
			       // 	   });
			       gui_anchor._run_action_callbacks();
			   }};
		       ll('UIB: examining for callback: ' + item);
		       jQuery("#" + mangle +
			      "filter-list-" + item).selectable(_select_arg);
		   }
		   bbop.core.each(field_list, _init_lambda);
	       });
    };

    // // BUG/TODO: the accordion search is highly wasteful and brittle.
    // // Color the filters according to what we find in the results that
    // // are coming back; similarly, fill the q.
    // this.color_controls = function(json_data){

    // 	var q = golr.query(json_data);
    // 	var r = /.*annotation_class_label\:(.*)$/;
    // 	var matches = r.exec(q);
    // 	if( matches && matches[1] && matches[1] != '*:*' ){
    // 	    var m = matches[1];
    // 	    ll('UIB: for color, m: ' + m);
    // 	}

    // 	// var qf = golr.query_filters(json_data);

    // 	// // // TODO
    // 	// // // Find all of the fields we look at, get out all of the fq
    // 	// // // info we have on them.
    // 	// // var field_list = golr.facet_field_list(json_data);
    // 	// // function _process_in_fields(in_field){
    // 	// //     ll('UIB: for color, field: ' + in_field);
    // 	// //     //filter_accordion.add_to(in_field, '', true);
    // 	// //     var filtered_fields_hash = qf[in_field];
    // 	// //     if( filtered_fields_hash ){
    // 	// // 	var filtered_fields = bbop.core.get_keys(filtered_fields_hash);
    // 	// // 	ll('UIB: for field, fqs: ' + filtered_fields);
    // 	// // 	// TODO: find in DOM
    // 	// // 	// TODO: color in DOM
    // 	// //     }
    // 	// // }
    // 	// // bbop.core.each(field_list, _process_in_fields);

    // 	// jQuery('#' + accordion_div_hook + ' > * > * > .ui-selectee').each(
    // 	//     function(){
    // 	// 	// Filter set in question. Subtract the head from the
    // 	// 	// id to get the original mangled filter set.
    // 	// 	var filter_set_id_head = mangle + "filter-list-";
    // 	// 	var filter_set_id = jQuery(this).parent().attr('id');
    // 	// 	var filter_set =
    // 	// 	    filter_set_id.substring(filter_set_id_head.length,
    // 	// 				    filter_set_id.length);
		
    // 	// 	// Actual item.
    // 	// 	var filter_item = jQuery(this).html();

    // 	// 	// Compare
    // 	// 	if( qf[filter_set] && qf[filter_set][filter_item] ){
    // 	// 	    ll('UIB: for fqs, found ' + filter_set + ' ' + filter_item);
    // 	// 	    jQuery(this).addClass('ui-selected');
    // 	// 	}
    // 	//     });
    // };

    // Get the current state of the HTML GUI layer.
    // Returns hash of logic objects keyed by solr filter type
    // (e.g. q, fq, etc.).
    this.state = function(){
    
	ll('UIB: find current status of user display: ' + ui_controls_div_hook);
	
	///
	/// Get the logic contained in the free query string.
	///

	ll('UIB: Scanning for q input: ' + q_input_hook);

	var q_logic = new bbop.logic();
	var q_val = "";
	if( jQuery('#' + q_input_hook) &&
	    jQuery('#' + q_input_hook)[0] &&
	    jQuery('#' + q_input_hook)[0].value ){
		q_val = jQuery('#' + q_input_hook)[0].value;		
	    }
	ll('UIB: squirrel away q: ' + q_val);
	//q_logic.add('q:' + q_val);
	q_logic.add(q_val);

	///
	/// Get the logic contained in the accordion filters (a little
	/// trickier).
	///

	var fq_logic = new bbop.logic();

	// Figure out where our filters are and what they contain.
	ll('UIB: Scanning filter accordion: ' + accordion_div_hook);
	//jQuery(".golr-filter-selectable .ui-selected").each(
	jQuery('#' + accordion_div_hook + ' > * > * > .ui-selected').each(
	    function(){
		// Filter set in question. Subtract the head from the
		// id to get the original mangled filter set.
		var filter_set_id_head = mangle + "filter-list-";
		var filter_set_id = jQuery(this).parent().attr('id');
		var filter_set =
		    filter_set_id.substring(filter_set_id_head.length,
					    filter_set_id.length);
		
		// Actual item.
		var filter_item = jQuery(this).html();
		
		// Debug.
		//fq_logic.add(filter_set + ':' + filter_item);
		fq_logic.add(filter_set + ':"' + filter_item + '"');
	    });
	
	// DEBUG
	var result = jQuery("#DEBUG").empty();
	result.append("str: "+ q_logic.to_string() +" "+ fq_logic.to_string());

	return {
	    'q' : q_logic,
	    'fq' : fq_logic
	};
    };

    // Run registered action callbacks against.
    this._run_action_callbacks = function(json_data){
	ll('UIB: in action callbacks with state argument...');

	var current_state = gui_anchor.state();

	gui_anchor.apply_callbacks('action', [current_state]);
    };

    //  No arguments necessary as this is just a scaffold.. For
    //  actual initial results rendering, see .draw_results.
    this.make_results_frame = function(){
	ll('UIB: Initialize results div...');
	
	// <div id="results_block" class="block">
	// <h2>Found entities</h2>
	// <div id="load_float"></div>
	// <div id="meta_results">
	// <div id="results_div">
	var results = new bbop.html.tag('div', {'id': hook_results_div});
	var meta = new bbop.html.tag('div', {'id': hook_meta_div});
	var header = new bbop.html.tag('h2', {}, 'Found entities');
	var block = new bbop.html.tag('div', {'class': 'block'});
	block.add_to(header);
	block.add_to(meta);
	block.add_to(results);

	jQuery('#' + ui_results_div_hook).append(block.to_string());

    };

    // TODO: Draw results from template depending on the return type
    // picked up from the results ball.
    this.draw_results = function(json_data){
	
	// TODO: Get back the type of callback.

	// TODO: Draw meta--the same for every type of return.
	ll('UIB: Draw meta div...');
	var total_c = golr.total_documents(json_data);
	var first_d = golr.start_document(json_data);
	var last_d = golr.end_document(json_data);
	var dmeta = new GOlrTemplate.meta_results(total_c, first_d, last_d);
	jQuery('#' + hook_meta_div).empty();
	jQuery('#' + hook_meta_div).append(dmeta.to_string());

	// TODO: Draw returns, different for every type.
	ll('UIB: Draw results div...');

	// Scrape out what type of template we should use.
	var qfilters = golr.query_filters(json_data);
	var found_doc_cat = 'unreadable or ambiguous';
	if( qfilters && qfilters['document_category'] ){
	    var doc_cats = bbop.core.get_keys(qfilters['document_category']);
	    if( doc_cats.length == 1 ){
		found_doc_cat = doc_cats[0];
		// }else{
		// 	found_doc_cat = 'ambiguous';
	    }
	}

	// TODO: scrape the docs into headers and data.
	var docs = golr.documents(json_data);

	// Select and run template.
	var final_table = "Unknown document category type!";
	if( found_doc_cat == 'ontology_class' ){
	    final_table = new GOlrTemplate.results_term_table(docs);
	}else if( found_doc_cat == 'bioentity' ){	    
	    final_table = new GOlrTemplate.results_gp_table(docs);
	}else if( found_doc_cat == 'annotation' ){
	    final_table = new GOlrTemplate.results_annotation_table(docs);
	}else if( found_doc_cat == 'annotation_aggregate' ){
	    final_table =
		new GOlrTemplate.results_annotation_aggregate_table(docs);
	}

	// Display product.
	jQuery('#' + hook_results_div).empty();
	jQuery('#' + hook_results_div).append(bbop.core.to_string(final_table));
    };

}
GOlrUIBeta.prototype = new bbop.registry;
