////
//// An all-encompassing UI object.
////

// // NOTE: the first item in the hash is the default op.
// // TODO: need a special object for adding and translations
// //       would be easy for testing!
// // TODO: Callbacks.

// An experimental dynamic UI builder.
function GOlrUIBeta(in_args){
    bbop.registry.call(this, ['action']);

    var anchor = this;
    var each = bbop.core.each;
    
    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('UI: ' + str); }

    // There should be a string interface_id argument.
    if( in_args && ! in_args['interface_id'] ){
	ll('ERROR: no interface_id argument');
	if( typeof in_args['interface_id'] != 'string' ){
	    ll('ERROR: no interface_id string argument');
	}
    }
    // The location where we'll build and manage the interface.
    this.interface_id = in_args['interface_id'];
    if( ! this.interface_id ){
	throw new Error("interface id not defined");
    }

    // The class configuration we'll be using to hint and build.
    this.class_conf = in_args['class_conf'];
    if( ! this.class_conf ){
	throw new Error("class configuration not defined");
    }
   
    // AmiGO helper.
    var amigo = new bbop.amigo();
    var golr_resp = amigo.golr_response;

    // Get the user interface hook and remove anything that was there.
    var ui_div_id = this.interface_id;
    jQuery('#' + ui_div_id).empty();

    // Mangle everything around this unique id so we don't collide
    // with other instances on the same page.
    var mangle = ui_div_id + '_ui_element_';

    // Render a control section into HTML. This includes the accordion
    // and current filter sections.
    var ui_controls_section_id = mangle + 'ui-controls-wrapper';
    var controls_div = new bbop.html.tag('div', {'id': ui_controls_section_id});
    //jQuery('#' + ui_div_id).append(controls_div.to_string());

    // Render a results section into HTML. The includes the results
    // table and the results meta-info sections.
    var ui_results_section_id = mangle + 'ui-results-wrapper';
    var results_div = new bbop.html.tag('div', {'id': ui_results_section_id});
    //jQuery('#' + ui_div_id).append(results_div.to_string());

    // Add the sections to a two column layout and add that into the
    // main ui div.
    var two_col_div =
	new GOlrTemplate.two_column_layout(controls_div, results_div);
    jQuery('#' + ui_div_id).append(two_col_div.to_string());

    // Main div id hooks to the easily changable areas of the two
    // column display.
    var ui_meta_div_id = mangle + 'meta-id';
    var ui_results_table_div_id = mangle + 'results-table-id';
    var ui_current_filters_div_id = mangle + 'current_filters-id';

    // Additional id hooks for easy callbacks. While these are not as
    // easily changable as the above, we use them often enough and
    // across functions to have a hook.
    var accordion_div_id = mangle + 'filter-accordion-id';
    var q_input_id = mangle + 'q-id';
    
    // These pointers are used in multiple functions (e.g. both
    // *_setup and *_draw).
    var filter_accordion_widget = null;
    //var current_filters_div = null;

    /*
     * Function: setup_current_filters
     *
     * Setup current filters display under contructed tags for later
     * population. The seeding information is coming in through the
     * GOlr conf class.
     * Add in the filter state up here.
     * 
     * Parameters: None
     *
     * Returns: Nothing
     */
    this.setup_current_filters = function(){
    
	ll('Build current filter UI for class configuration: ' +
	   this.class_conf.id());

	var current_filters_div =
	    new bbop.html.tag('div', {'id': ui_current_filters_div_id},
			      "No applied filters.");

	// Add the output to the page.
	var curr_filters_str = current_filters_div.to_string();
	jQuery('#' + ui_controls_section_id).append(curr_filters_str);
    };

    /*
     * Function: setup_accordion
     *
     * Setup the accordion skeleton under contructed tags for later
     * population. The seeding information is coming in through the
     * GOlr conf class.
     * Start building the accordion here. Not an updatable part.
     * 
     * Parameters: None
     *
     * Returns: Nothing
     */
    this.setup_accordion = function(){
    
	ll('Build accordion UI for class configuration: ' +
	   this.class_conf.id());

	var filter_accordion_attrs = {
	    id: accordion_div_id,
	    style: 'width: 25em;'
	};
	filter_accordion_widget =
	    new bbop.html.accordion([], filter_accordion_attrs, true);

	// Add the sections with no contents as a skeleton to be
	// filled by draw filters.
	var field_list = this.class_conf.field_order_by_weight('filter');
	each(field_list,
	     function (in_field){
		 ll('saw field: ' + in_field);
		 var ifield = anchor.class_conf.get_field(in_field);
		 var in_attrs = {
		     id: in_field,
		     label: ifield.display_name(),
		     description: ifield.description()
		 };
		 filter_accordion_widget.add_to(in_attrs, '', true);
	     });
	
	// Add the output from the accordion to the page.
	var accordion_str = filter_accordion_widget.to_string();
	jQuery('#' + ui_controls_section_id).append(accordion_str);

	// Add the jQuery accordioning.
	jQuery("#" + accordion_div_id).accordion({ clearStyle: true,
						     collapsible: true,
						     active: false });
    };

    /*
     * Function: setup_results
     *
     * Setup basic results table using the class conf. For actual
     * results rendering, see .draw_results. While there is a meta
     * block supplied, its use is optional.
     * 
     * Parameters: hash; the only option is {'meta': true}.
     *
     * Returns: Nothing
     */
    this.setup_results = function(args){

	ll('Build results UI for class configuration: ' + this.class_conf.id());
	
	// Decide whether or not to add the meta div.
	var add_meta_p = false;
	if( args && args['meta'] && args['meta'] == true ){
	    add_meta_p = true;
	}

	// <div id="results_block" class="block">
	// <h2>Found entities</h2>
	// <div id="load_float"></div>
	// <div id="meta_results">
	// <div id="results_div">
	var block = new bbop.html.tag('div', {'class': 'block'});

	// Add header section.
	var header = new bbop.html.tag('h2', {}, 'Found entities');
	block.add_to(header);

	// If wanted, add meta to display queue.
	if( add_meta_p ){	    
	    var meta = new bbop.html.tag('div', {'id': ui_meta_div_id});
	    block.add_to(meta);
	}

	// Add results section.
	var results = new bbop.html.tag('div', {'id': ui_results_table_div_id});
	block.add_to(results);

	jQuery('#' + ui_results_section_id).append(block.to_string());

	// If wanted, add initial render of meta.
	if( add_meta_p ){	    
	    ll('Add meta UI div');
	    jQuery('#' + ui_meta_div_id).empty();
	    jQuery('#' + ui_meta_div_id).append('No search yet performed...');
	}
    };

    // // Initialize with reseting data.
    // // Also see make_filter_controls_frame.
    // this.make_search_controls_frame = function(json_data){
    
    // 	ll('Initial build of UI from reset response: ' + ui_div_id);

    // 	///
    // 	/// Start building free text input here.
    // 	///

    // 	var free_input_label =
    // 	    new bbop.html.tag('label', {'for': 'q'}, 'Search: ');
    // 	jQuery('#' + ui_controls_section_id).append(free_input_label.to_string());
    // 	var free_input_attrs = {
    // 	    'id': q_input_id,
    // 	    'name': 'q',
    // 	    'class': "golr-q textBox textBoxLighten",
    // 	    'value': "",
    // 	    'size': "30",
    // 	    'type': 'text'
    // 	};
    // 	var free_input = new bbop.html.input(free_input_attrs);	
    // 	jQuery('#' + ui_controls_section_id).append(free_input.to_string());

    // 	// Add event for q input.
    // 	jQuery('#' + q_input_id).keyup(anchor._run_action_callbacks);
	
    // 	// Continue with the rest of the display (filter, results,
    // 	// etc.) controls.
    // 	anchor.make_filter_controls_frame(json_data);
    // };

    // // Initialize with reseting data.
    // this.make_filter_controls_frame = function(json_data){
    
    // 	///
    // 	/// Create a frame to hang the query and filters on.
    // 	///
    // 	var filter_frame = new bbop.html.tag('div', {'id': ui_filters_frame_div_id});
    // 	jQuery('#' + ui_controls_section_id).append(filter_frame.to_string());

    // 	///
    // 	/// Start building the accordion here. Not updatable parts.
    // 	///

    // 	var filter_accordion_attrs = {
    // 	    id: accordion_div_id,
    // 	    style: 'width: 25em;'
    // 	};
    // 	filter_accordion_widget =
    // 	    new bbop.html.accordion([], filter_accordion_attrs, true);

    // 	// Add the sections with no contents as a skeleton to be
    // 	// filled by draw filters.
    // 	var field_list = golr_resp.facet_field_list(json_data);
    // 	function _process_in_fields_as_sections(in_field){
    // 	    ll('saw field: ' + in_field);
    // 	    filter_accordion_widget.add_to(in_field, '', true);
    // 	}
    // 	each(field_list, _process_in_fields_as_sections);

    // 	// Add the output from the accordion to the page.
    // 	//jQuery('#' + ui_div_id).html(filter_accordion_widget.to_string());
    // 	jQuery('#' + ui_filters_frame_div_id).append(filter_accordion_widget.to_string());

    // 	// Add the jQuery accordioning.
    // 	jQuery("#" + accordion_div_id).accordion({ clearStyle: true,
    // 						     collapsible: true,
    // 						     active: false });
    // };

    // // BUG/TODO: the accordion search is highly wasteful and brittle.
    // // Color the filters according to what we find in the results that
    // // are coming back; similarly, fill the q.
    // this.color_controls = function(json_data){

    // 	var q = golr_resp.query(json_data);
    // 	var r = /.*annotation_class_label\:(.*)$/;
    // 	var matches = r.exec(q);
    // 	if( matches && matches[1] && matches[1] != '*:*' ){
    // 	    var m = matches[1];
    // 	    ll('for color, m: ' + m);
    // 	}

    // 	// var qf = golr.query_filters(json_data);

    // 	// // // TODO
    // 	// // // Find all of the fields we look at, get out all of the fq
    // 	// // // info we have on them.
    // 	// // var field_list = golr_resp.facet_field_list(json_data);
    // 	// // function _process_in_fields(in_field){
    // 	// //     ll('for color, field: ' + in_field);
    // 	// //     //filter_accordion_widget.add_to(in_field, '', true);
    // 	// //     var filtered_fields_hash = qf[in_field];
    // 	// //     if( filtered_fields_hash ){
    // 	// // 	var filtered_fields = bbop.core.get_keys(filtered_fields_hash);
    // 	// // 	ll('for field, current_filters_div: ' + filtered_fields);
    // 	// // 	// TODO: find in DOM
    // 	// // 	// TODO: color in DOM
    // 	// //     }
    // 	// // }
    // 	// // each(field_list, _process_in_fields);

    // 	// jQuery('#' + accordion_div_id + ' > * > * > .ui-selectee').each(
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
    // 	// 	    ll('for current_filters_div, found ' + filter_set + ' ' + filter_item);
    // 	// 	    jQuery(this).addClass('ui-selected');
    // 	// 	}
    // 	//     });
    // };

    // Get the current state of the HTML GUI layer.
    // Returns hash of logic objects keyed by solr filter type
    // (e.g. q, fq, etc.).
    this.state = function(){
    
	ll('find current status of user display: ' + ui_controls_section_id);
	
	///
	/// Get the logic contained in the free query string.
	///

	ll('Scanning for q input: ' + q_input_id);

	var q_logic = new bbop.logic();
	var q_val = "";
	if( jQuery('#' + q_input_id) &&
	    jQuery('#' + q_input_id)[0] &&
	    jQuery('#' + q_input_id)[0].value ){
		q_val = jQuery('#' + q_input_id)[0].value;		
	    }
	ll('squirrel away q: ' + q_val);
	//q_logic.add('q:' + q_val);
	q_logic.add(q_val);

	///
	/// Get the logic contained in the accordion filters (a little
	/// trickier).
	///

	var fq_logic = new bbop.logic();

	// Figure out where our filters are and what they contain.
	ll('Scanning filter accordion: ' + accordion_div_id);
	//jQuery(".golr-filter-selectable .ui-selected").each(
	jQuery('#' + accordion_div_id + ' > * > * > .ui-selected').each(
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
	ll('in action callbacks with state argument...');

	var current_state = anchor.state();

	anchor.apply_callbacks('action', [current_state]);
    };

    /*
     * Function: set_static_filters
     *
     * TODO: Takes a JSON payload and notes the "fq" settings; the
     * current_filters_div seen will be ignored in the future. This is
     * essentially for pages where you want some filters locked-in and
     * not available to the user.
     * 
     * Parameters: json_data
     *
     * Returns: Nothing
     */
    this.set_static_filters = function(json_data){
	// TODO:
    };

    /*
     * Function: draw_meta
     *
     * Draw meta results.
     * TODO: paging, etc.
     * 
     * Parameters: json_data
     *
     * Returns: Nothing
     */
    this.draw_meta = function(json_data){
	
	// TODO: Get back the type of callback.

	// TODO: Draw meta--the same for every type of return.
	ll('Draw meta div...');
	var total_c = golr_resp.total_documents(json_data);
	var first_d = golr_resp.start_document(json_data);
	var last_d = golr_resp.end_document(json_data);
	var dmeta = new GOlrTemplate.meta_results(total_c, first_d, last_d);
	jQuery('#' + ui_meta_div_id).empty();
	jQuery('#' + ui_meta_div_id).append(dmeta.to_string());
    };

    /*
     * Function: draw_current_filters
     *
     * (Re)draw the information in the current filter set.
     * This function makes them active as well.
     * 
     * Parameters: json_data
     *
     * Returns: Nothing
     */
    this.draw_current_filters = function(json_data){
    
	ll('Draw current filters for: ' + ui_div_id);

	// TODO: Work on the filter breadcrumbs.
	var qfilters = golr_resp.query_filters(json_data);
	ll('filters: ' + bbop.core.dump(qfilters));
	var fq_list_ul = new bbop.html.list([]);
	var has_fq_p = false;
	each(qfilters,
	     function(field, field_vals){
		 each(field_vals,
		      function(field_val, polarity){
			  ll(field + ':' + field_val + ':' + polarity);
			  has_fq_p = true;
			  if( polarity ){
			      fq_list_ul.add_to('+' + field + ':'
						+ field_val + ' [X]');
			  }else{
			      fq_list_ul.add_to('-' + field + ':'
						+ field_val + ' [X]');
			  }
		      });
	     });

	// Either add to the display, or display the "empty" message.
	var cfid = '#' + ui_current_filters_div_id;
	jQuery(cfid).empty();
	if( has_fq_p ){
	    jQuery(cfid).append(fq_list_ul.to_string());
	}else{
	    jQuery(cfid).append("No current filters.");
	}
    };

    /*
     * Function: draw_accordion
     *
     * (Re)draw the information in the accordion controls/filters.
     * This function makes them active as well.
     * 
     * Parameters: json_data
     *
     * Returns: Nothing
     */
    this.draw_accordion = function(json_data){
    
	ll('Draw current accordion for: ' + ui_div_id);

	// Make sure that accordion has already been inited.
	if( typeof(filter_accordion_widget) == 'undefined'){
	    throw new Error('Need to init accordion ().');
	}

	//var field_attr_hash = {};
	var field_list = golr_resp.facet_field_list(json_data);
	function _process_in_fields(in_field, in_i){
	    //ll('saw field: ' + in_field);

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
	    var facet_contents_list = golr_resp.facet_field(json_data,in_field);
	    each(facet_contents_list,
		 function(item){
		     var name = item[0];
		     //var count = item[1];
		     //ll('saw facet item: ' + name);
		     facet_list_ul.add_to(name);
		 });

	    // Add the ul list to the accordion.
	    var sect_id = filter_accordion_widget.get_section_id(in_field);
	    // ll('add to accordion: ' + sect_id + ' ' +
	    //    facet_list_ul.to_string());
	    jQuery('#' + sect_id).empty();
	    var final_ul_str = facet_list_ul.to_string();
	    jQuery('#' + sect_id).append(final_ul_str);
	}
	each(field_list, _process_in_fields);

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
			       anchor._run_action_callbacks();
			   }};
		       ll('examining for callback: ' + item);
		       jQuery("#" + mangle +
			      "filter-list-" + item).selectable(_select_arg);
		   }
		   each(field_list, _init_lambda);
	       });
    };

    /*
     * Function: draw_results
     *
     * Draw results using hints from the golr class configuration.
     * 
     * Parameters: json_data
     *
     * Returns: Nothing
     */
    this.draw_results = function(json_data){
	
	ll('Draw results div...');

	var docs = golr_resp.documents(json_data);

	var final_table =
	    new GOlrTemplate.results_table_by_class(anchor.class_conf, docs,
						    bbop.amigo.linker);

	//ll('final_table a: ' + final_table._is_a);
	//ll('final_table b: ' + final_table.to_string);
	//ll('final_table c: ' + final_table.to_string());

	// Display product.
	var urtdi = ui_results_table_div_id;
	jQuery('#' + urtdi).empty();
	jQuery('#' + urtdi).append(bbop.core.to_string(final_table));
    };

}
GOlrUIBeta.prototype = new bbop.registry;
