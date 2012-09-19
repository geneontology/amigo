////
//// An all-encompassing UI object.
////

// // NOTE: the first item in the hash is the default op.
// // TODO: need a special object for adding and translations
// //       would be easy for testing!
// // TODO: Callbacks.

// An experimental dynamic UI builder.
function GOlrUIBeta(in_args){
    //bbop.registry.call(this, ['action']);

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
    //var golr_resp = amigo.golr_response;

    // BBOP helper.
    var golr_resp = bbop.golr.response;

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
     * Parameters:
     *  n/a
     *
     * Returns:
     *  n/a
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
     * Parameters:
     *  n/a 
     *
     * Returns: 
     *  n/a
     */
    this.setup_accordion = function(){
    
	ll('Build accordion UI for class configuration: ' +
	   this.class_conf.id());

	var filter_accordion_attrs = {
	    id: accordion_div_id,
	    style: 'width: 25em;'
	};
	filter_accordion_widget = // heavy lifting by special widget
	    new bbop.html.accordion([], filter_accordion_attrs, true);

	// Add the sections with no contents as a skeleton to be
	// filled by draw_accordion.
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
     * Parameters:
     *  hash; the only option is {'meta': true}.
     *
     * Returns:
     *  n/a
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

    // // Get the current state of the HTML GUI layer.
    // // Returns hash of logic objects keyed by solr filter type
    // // (e.g. q, fq, etc.).
    // this.state = function(){
    
    // 	ll('find current status of user display: ' + ui_controls_section_id);
	
    // 	///
    // 	/// Get the logic contained in the free query string.
    // 	///

    // 	ll('Scanning for q input: ' + q_input_id);

    // 	var q_logic = new bbop.logic();
    // 	var q_val = "";
    // 	if( jQuery('#' + q_input_id) &&
    // 	    jQuery('#' + q_input_id)[0] &&
    // 	    jQuery('#' + q_input_id)[0].value ){
    // 		q_val = jQuery('#' + q_input_id)[0].value;		
    // 	    }
    // 	ll('squirrel away q: ' + q_val);
    // 	//q_logic.add('q:' + q_val);
    // 	q_logic.add(q_val);

    // 	///
    // 	/// Get the logic contained in the accordion filters (a little
    // 	/// trickier).
    // 	///

    // 	var fq_logic = new bbop.logic();

    // 	// Figure out where our filters are and what they contain.
    // 	ll('Scanning filter accordion: ' + accordion_div_id);
    // 	//jQuery(".golr-filter-selectable .ui-selected").each(
    // 	jQuery('#' + accordion_div_id + ' > * > * > .ui-selected').each(
    // 	    function(){
    // 		// Filter set in question. Subtract the head from the
    // 		// id to get the original mangled filter set.
    // 		var filter_set_id_head = mangle + "filter-list-";
    // 		var filter_set_id = jQuery(this).parent().attr('id');
    // 		var filter_set =
    // 		    filter_set_id.substring(filter_set_id_head.length,
    // 					    filter_set_id.length);
		
    // 		// Actual item.
    // 		var filter_item = jQuery(this).html();
		
    // 		// Debug.
    // 		//fq_logic.add(filter_set + ':' + filter_item);
    // 		fq_logic.add(filter_set + ':"' + filter_item + '"');
    // 	    });
	
    // 	// DEBUG
    // 	var result = jQuery("#DEBUG").empty();
    // 	result.append("str: "+ q_logic.to_string() +" "+ fq_logic.to_string());

    // 	return {
    // 	    'q' : q_logic,
    // 	    'fq' : fq_logic
    // 	};
    // };

    // // Run registered action callbacks against.
    // this._run_action_callbacks = function(json_data){
    // 	ll('in action callbacks with state argument...');

    // 	// var current_state = anchor.state();

    // 	anchor.apply_callbacks('action', [current_state]);
    // };

    // /*
    //  * Function: set_static_filters
    //  *
    //  * TODO: Takes a JSON payload and notes the "fq" settings; the
    //  * current_filters_div seen will be ignored in the future. This is
    //  * essentially for pages where you want some filters locked-in and
    //  * not available to the user.
    //  * 
    //  * Parameters: json_data
    //  *
    //  * Returns: Nothing
    //  */
    // this.set_static_filters = function(json_data, manager){
    // 	// TODO:
    // };

    /*
     * Function: draw_meta
     *
     * Draw meta results.
     * TODO: paging, etc.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_meta = function(json_data, manager){
	
	ll('Draw meta div...');

	// Collect numbers for display.
	var total_c = golr_resp.total_documents(json_data);
	var first_d = golr_resp.start_document(json_data);
	var last_d = golr_resp.end_document(json_data);

	// Draw meta; the current numbers and page--the same for
	// every type of return.
	var dmeta = new GOlrTemplate.meta_results(total_c, first_d, last_d);
	jQuery('#' + ui_meta_div_id).empty();
	jQuery('#' + ui_meta_div_id).append(dmeta.to_string());

	// Now add the raw buttons to the interface, and after this,
	// activation and adding events.
	var b_first = new bbop.html.button('First', {'generate_id': true});
	jQuery('#' + ui_meta_div_id).append(b_first.to_string());
	var b_back = new bbop.html.button('Prev', {'generate_id': true});
	jQuery('#' + ui_meta_div_id).append(b_back.to_string());
	var b_forward = new bbop.html.button('Next', {'generate_id': true});
	jQuery('#' + ui_meta_div_id).append(b_forward.to_string());
	var b_last = new bbop.html.button('Last', {'generate_id': true});
	jQuery('#' + ui_meta_div_id).append(b_last.to_string());

	// Do the math about what buttons to activate.
	var b_first_disabled_p = false;
	var b_back_disabled_p = false;
	var b_forward_disabled_p = false;
	var b_last_disabled_p = false;

	// Only activate paging if it is necessary to the returns.
	if( ! golr_resp.paging_p(json_data) ){
	    b_first_disabled_p = true;
	    b_back_disabled_p = true;
	    b_forward_disabled_p = true;
	    b_last_disabled_p = true;
	}
	    
	// Don't activate back on the first page.
	if( ! golr_resp.paging_previous_p(json_data) ){
	    b_first_disabled_p = true;
	    b_back_disabled_p = true;
	}
	    
	// Don't activate next on the last page.
	if( ! golr_resp.paging_next_p(json_data) ){
	    b_forward_disabled_p = true;
	    b_last_disabled_p = true;
	}
	
	// First page button.
	var b_first_props = {
	    icons: { primary: "ui-icon-seek-first"},
	    disabled: b_first_disabled_p,
	    text: false
	};
	jQuery('#' + b_first.get_id()).button(b_first_props).click(
	    function(){
		// Cheat and trust reset by proxy to work.
		manager.page_first(); 
	    });
	
	// Previous page button.
	var b_back_props = {
	    icons: { primary: "ui-icon-seek-prev"},
	    disabled: b_back_disabled_p,
	    text: false
	};
	jQuery('#' + b_back.get_id()).button(b_back_props).click(
	    function(){
		manager.page_previous();
	    });
	
	// Next page button.
	var b_forward_props = {
	    icons: { primary: "ui-icon-seek-next"},
	    disabled: b_forward_disabled_p,
	    text: false
	};
	jQuery('#' + b_forward.get_id()).button(b_forward_props).click(
	    function(){
		manager.page_next();
	    });
	
	// Last page button.
	var b_last_props = {
	    icons: { primary: "ui-icon-seek-end"},
	    disabled: b_last_disabled_p,
	    text: false
	};
	jQuery('#' + b_last.get_id()).button(b_last_props).click(
	    function(){
		// A little trickier.
		manager.page_last(total_c);
	    });
    };

    /*
     * Function: draw_current_filters
     *
     * (Re)draw the information in the current filter set.
     * This function makes them active as well.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_current_filters = function(json_data, manager){
    
	ll('Draw current filters for: ' + ui_div_id);

	// Add in the actual HTML for the filters and buttons. While
	// doing so, tie a unique id to the filter--we'll use that
	// later on to add buttons and events to them.
	var in_query_filters = golr_resp.query_filters(json_data);
	var sticky_query_filters = manager.get_sticky_query_filters();
	ll('filters: ' + bbop.core.dump(in_query_filters));
	var fq_list_ul = new bbop.html.list([]);
	var has_fq_p = false; // assume there are no filters to begin with
	var button_hash = {};
	each(in_query_filters,
	     function(field, field_vals){
		 each(field_vals,
		      function(field_val, polarity){

			  // Make note of stickiness, skip adding if sticky.
			  var qfp =
			      manager.get_query_filter_properties(field,
								  field_val);
			  if( ! qfp || qfp['sticky_p'] == false ){
			  
			      // Note the fact that we actually have a
			      // query filter to work with and display.
			      has_fq_p = true;

			      // Boolean value to a character.
			      var polstr = '-';
			      if( polarity ){ polstr = '+'; }

			      // Generate a button with a unique id.
			      var label_str = polstr+' '+ field +':'+field_val;
			      var b =
				  new bbop.html.button('remove filter',
						       {'generate_id': true});
			      
			      // Tie the button it to the filter for
			      // jQuery and events attachment later on.
			      var bid = b.get_id();
			      button_hash[bid] = [polstr, field, field_val];
			  
			      ll(label_str +' '+ bid);
			      fq_list_ul.add_to(label_str +' '+ b.to_string());
			  }
		      });
	     });

	// Either add to the display, or display the "empty" message.
	var cfid = '#' + ui_current_filters_div_id;
	jQuery(cfid).empty();
	if( ! has_fq_p ){
	    jQuery(cfid).append("No current filters.");
	}else{

	    // The buttons have now been attached to the DOM...
	    jQuery(cfid).append(fq_list_ul.to_string());

	    // Now let's go back and add the buttons, styles,
	    // events, etc.
	    each(button_hash,
		 function(button_id){
		     var bid = button_id;

		     // Get the button.
		     var bprops = {
			 icons: { primary: "ui-icon-close"},
			 text: false
		     };
		     // Create the button and immediately add the event.
		     jQuery('#' + bid).button(bprops).click(
			 function(){
			     var tid = jQuery(this).attr('id');
			     var button_props = button_hash[tid];
			     var polstr = button_props[0];
			     var field = button_props[1];
			     var value = button_props[2];

			     // Change manager and fire.
			     // var lstr = polstr +' '+ field +' '+ value;
			     // alert(lstr);
			     // manager.remove_query_filter(field,value,
			     // 				 [polstr, '*']);
			     manager.remove_query_filter(field, value);
			     manager.search();
			 });
		 });
	}
    };

    /*
     * Function: draw_accordion
     *
     * (Re)draw the information in the accordion controls/filters.
     * This function makes them active as well.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_accordion = function(json_data, manager){
    
	ll('Draw current accordion for: ' + ui_div_id);

	// Make sure that accordion has already been inited.
	if( typeof(filter_accordion_widget) == 'undefined' ){
	    throw new Error('Need to init accordion to use it.');
	}

	// Hash where we collect our button information.
	// button_id -> [source, filter, count, polarity];
	var button_hash = {};

	// Cycle through each facet field; all the items in each,
	// create the lists and buttons (while collectong data useful
	// in creating the callbacks) and put them into the accordion.
	each(golr_resp.facet_field_list(json_data),
	     function(in_field){

		 // Create ul lists of the facet contents.
		 var ul_id = mangle + 'filter-list-' + in_field;
		 var facet_list_ul_attrs = {
		     id: ul_id,
		     //'class': 'golr-filter-selectable',
		     style: 'height: 30em;'
		 };
		 var facet_list_ul = new bbop.html.list([],facet_list_ul_attrs);
		 
		 // Now go through and get filters and counts.
		 each(golr_resp.facet_field(json_data, in_field),
		      function(ff_field, ff_item){

			  // Pull out info.
			  var f_name = ff_field[0];
			  var f_count = ff_field[1];
			  var fstr = f_name +" ("+ f_count +")";
			  //ll("COLLECT: " + fstr);
			  //ll("COLLECTb: " + bbop.core.dump(ff_item));

			  // Create buttons and store them for later
			  // activation with callbacks to the manager.
			  var b_plus =
			      new bbop.html.button('+filter',
						   {'generate_id': true});
			  var b_minus =
			      new bbop.html.button('-filter',
						   {'generate_id': true});
			  button_hash[b_plus.get_id()] =
			      [in_field, f_name, f_count, '+'];
			  button_hash[b_minus.get_id()] =
			      [in_field, f_name, f_count, '-'];

			  // Add the label and buttons to the
			  // appropriate ul list.
			  facet_list_ul.add_to(fstr, b_plus.to_string(),
					       b_minus.to_string());
		      });

		 // Now add the ul to the appropriate section of the
		 // accordion in the DOM.
		 var sect_id = filter_accordion_widget.get_section_id(in_field);
		 jQuery('#' + sect_id).empty();
		 var final_ul_str = facet_list_ul.to_string();
		 jQuery('#' + sect_id).append(final_ul_str);
	     });

	// Now let's go back and add the buttons, styles,
	// events, etc.
	each(button_hash,
	     function(button_id, create_time_button_props){
		 //var bid = button_id;
		 //var in_field = create_time_button_props[0];	 
		 //var in_filter = create_time_button_props[1];
		 //var in_count = create_time_button_props[2];
		 var in_polarity = create_time_button_props[3];

		 // Decide on the button graphical elements.
		 var b_ui_icon = 'ui-icon-plus';
		 if( in_polarity == '-' ){
		     b_ui_icon = 'ui-icon-minus';
		 }
		 var b_ui_props = {
		     icons: { primary: b_ui_icon},
		     text: false
		 };

		 // Create the button and immediately add the event.
		 jQuery('#' + button_id).button(b_ui_props).click(
		     function(){
			 var tid = jQuery(this).attr('id');
			 var call_time_button_props = button_hash[tid];
			 var call_field = call_time_button_props[0];	 
			 var call_filter = call_time_button_props[1];
			 //var in_count = button_props[2];
			 var call_polarity = call_time_button_props[3];

			 // Change manager and fire.
			 // var bstr =call_field+' '+call_filter+' '+call_polarity;
			 // alert(bstr);
			 manager.add_query_filter(call_field, call_filter,
			  			  [call_polarity]);
			 manager.search();
		     });
	     });
    };

    /*
     * Function: draw_results
     *
     * Draw results using hints from the golr class configuration.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_results = function(json_data, manager){
	
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

    /*
     * Function: draw_error
     *
     * Somehow report an error to the user.
     * 
     * Parameters:
     *  error_message - a string(?) describing the error
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_error = function(error_message, manager){
	ll("ERROR: " + error_message);
	alert("ERROR: " + error_message);
    };

}
GOlrUIBeta.prototype = new bbop.registry;
