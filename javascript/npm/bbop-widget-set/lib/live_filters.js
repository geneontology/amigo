/*
 * Package: live_filters.js
 * 
 * Namespace: bbop-widget-set.live_filters
 * 
 * BBOP JS object to allow the live probing of a GOlr personality.
 * 
 * Very much like a separated accordion and filter from the search
 * pane.
 * 
 * This is a Bootstrap 3 widget.
 * 
 * See Also:
 *  <search_pane.js>
 *  <live_search.js>
 */

var us = require('underscore');
var bbop = require('bbop-core');

var html = require('./html');
var display = require('./display');
var generators = require('./generators');
//var clickable_object_generator = require('./display/clickable_object_generator');

// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
var jQuery = require('jquery');
//require('jquery-ui');
/* jshint ignore:end */

/*
 * Constructor: live_filters
 * 
 * Contructor for the bbop-widget-set.live_filters object.
 * 
 * Widget interface to interactively explore a search personality with
 * no direct side effects.
 *
 * Arguments:
 *  interface_id - string id of the element to build on
 *  manager - the shared GOlr manager to use
 *  golr_conf_obj - the profile of the specific 
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  this object
 */
var live_filters = function(interface_id, manager, golr_conf_obj,
			    in_argument_hash){
    this._is_a = 'bbop-widget-set.live_filters';

    var anchor = this;
    var each = us.each;
    
    // TODO/BUG: Remove the need for these.
    var ui_icon_positive_label = '&plus;';
    var ui_icon_positive_source = null;
    var ui_icon_negative_label = '&minus;';
    var ui_icon_negative_source = null;
    var ui_icon_remove_label = '&minus;';
    var ui_icon_remove_source = null;
    var ui_spinner_shield_source = null;
    var ui_spinner_shield_message = '';

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = false;
    //logger.DEBUG = true;
    function ll(str){ logger.kvetch('LF: ' + str); }

    ///
    /// Deal with incoming arguments.
    ///

    // this._class_conf = golr_conf_obj;

    // Our argument default hash.
    var default_hash = {
	'meta_label': 'Documents:&nbsp;',
	'display_meta_p': true,
	'display_free_text_p': true,
	'free_text_placeholder': 'Free-text filter',
	'display_accordion_p': true,
	'on_update_callback': function(){}
    };
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.fold(default_hash, folding_hash);
    // 
    this._interface_id = interface_id;
    this._display_meta_p = arg_hash['display_meta_p'];
    this._meta_label = arg_hash['meta_label'];
    this._display_free_text_p = arg_hash['display_free_text_p'];
    this._free_text_placeholder = arg_hash['free_text_placeholder'];
    this._display_accordion_p = arg_hash['display_accordion_p'];
    this._on_update_callback = arg_hash['on_update_callback'];

    ///
    /// Prepare the interface and setup the div hooks.
    ///

    anchor._established_p = false;

    // Mangle everything around this unique id so we don't collide
    // with other instances on the same page.
    var ui_div_id = this._interface_id;
    var mangle = ui_div_id + '_ui_element_' + bbop.uuid() + '_';

    // Main div id hooks to the easily changable areas of the display.
    var container_div_id = mangle + 'container-id';
    // Meta hooks.
    var meta_div_id = mangle + 'meta-id';
    var meta_count_id = mangle + 'meta-count-id';
    var meta_wait_id = mangle + 'meta-wait-id';
    // Query hooks
    var query_input_div_id = mangle + 'query-id';
    // Sticky hooks.
    var sticky_filters_div_id = mangle + 'sticky_filters-id';
    var sticky_title_id = mangle + 'sticky_filters-title-id';
    var sticky_content_id = mangle + 'sticky_filters-content-id';
    // Current hooks.
    var current_filters_div_id = mangle + 'current_filters-id';
    var current_title_id = mangle + 'current_filters-title-id';
    var current_content_id = mangle + 'current_filters-content-id';
    var clear_user_filter_span_id = mangle + 'clear-user-filter-id';
    // Accordion hooks.
    var filters_div_id = mangle + 'ui-filters-wrapper';
    var clear_query_span_id = mangle + 'clear-query-id';
    // var ui_user_button_div_id = mangle + 'user-button-id';
    // var ui_results_table_div_id = mangle + 'results-table-id';
    // var ui_count_control_div_id = mangle + 'count_control-id';

    // Blow away whatever was there completely.
    // Render a control section into HTML. This includes the accordion
    // and current filter sections.
    // Get the user interface hook and remove anything that was there.
    var container_div = new html.tag('div', {'id': container_div_id});
    jQuery('#' + ui_div_id).empty();
    jQuery('#' + ui_div_id).append(container_div.to_string());

    // // Globally declared (or not) icons.
    // var ui_spinner_search_source = '';
    // var ui_spinner_shield_source = '';
    // var ui_spinner_shield_message = null;
    // var ui_icon_positive_label = '';
    // var ui_icon_positive_source = '';
    // var ui_icon_negative_label = '';
    // var ui_icon_negative_source = '';
    // var ui_icon_remove_label = '';
    // var ui_icon_remove_source = '';

    // // The spinner, if it exists, needs to be accessible by everybody
    // // and safe to use.
    // var spinner = null;
    // function _spinner_gen(elt_id){
    // 	var spinner_args = {
    // 	    //timeout: 5,
    // 	    //timeout: 500,
    // 	    timeout: 10,
    // 	    //classes: 'bbop-widget-search_pane-spinner',
    // 	    visible_p: false
    // 	};
    // 	spinner = new widget.spinner(elt_id,
    // 					  ui_spinner_search_source,
    // 					  spinner_args);
    // }

    // // Additional id hooks for easy callbacks. While these are not as
    // // easily changable as the above, we use them often enough and
    // // across functions to have a hook.
    // var accordion_div_id = mangle + 'filter-accordion-id';
    
    // // These pointers are used in multiple functions (e.g. both
    // // *_setup and *_draw).
    var filter_accordion_widget = null;
    var spinner_div = null;
    // //var current_filters_div = null;

    function _spin_up(){
    	if( spinner_div ){
	    jQuery('#' + spinner_div.get_id()).removeClass('hidden');
	    jQuery('#' + spinner_div.get_id()).addClass('active');
    	}
    }
    function _spin_down(){
    	if( spinner_div ){
	    jQuery('#' + spinner_div.get_id()).addClass('hidden');
	    jQuery('#' + spinner_div.get_id()).removeClass('active');
    	}
    }

    /*
     * Function: spin_up
     * 
     * Turn on the spinner.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.spin_up = function(){
	_spin_up();
    };
    
    /*
     * Function: spin_down
     * 
     * Turn off the spinner.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.spin_down = function(){
	_spin_down();
    };
    
    /*
     * Function: established_p
     * 
     * Return whether or not the display has actually been
     * established.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  boolean
     */
    this.established_p = function(){
	return anchor._established_p;
    };
    
    /*
     * Function: establish_display
     * 
     * Completely redraw the display.
     * 
     * Required to display after setting up the manager.
     * 
     * Also may be useful after a major change to the manager to reset
     * it.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.establish_display = function(){
	
    	// Can only make a display if there is a set
    	// personality--there is no general default and it is an
    	// error.
    	var personality = manager.get_personality();
    	var cclass = golr_conf_obj.get_class(personality);
    	if( ! personality || ! cclass ){
    	    ll('ERROR: no usable personality set: ' + personality);
    	    throw new Error('ERROR: no useable personality set: ' + personality);
    	}

    	///
    	/// Setup the UI base.
    	///
	
	// Holder for things like spinner and current number of
	// results.
	this.setup_meta = function(){
	    ll('setup_meta for: ' + meta_div_id);
	    
	    // Count area.
	    var ms_attrs = {
		id: meta_count_id,
		//'class': 'label label-default pull-right'
		//'class': 'label label-default'
		'class': 'badge'
	    };
	    var ms = new html.tag('span', ms_attrs, 'n/a');

	    // Get a progress bar assembled.
	    var inspan = new html.tag('span', {'class': 'sr-only'}, '...');
	    var indiv = new html.tag('div', {'class': 'progress-bar',
					     'role': 'progressbar',
					     'aria-valuenow': '100',
					     'aria-valuemin': '0',
					     'aria-valuemax': '100',
					     'style': 'width: 100%;'},
				     inspan);
	    spinner_div =
		new html.tag('div',
			     {'generate_id': true,
			      'class':
			      'progress progress-striped active pull-right',
			      'style': 'width: 3em;'},
			     indiv);

	    // The container area; add in the label and count.
	    var mdiv_args = {
		'class': 'well well-sm',
		'id': meta_div_id
	    };
	    var mdiv = new html.tag('div', mdiv_args,
				    [this._meta_label, ms, spinner_div]);
	    
	    jQuery('#' + container_div.get_id()).append(mdiv.to_string());
	};
	if( this._display_meta_p ){
	    this.setup_meta();
	}

	// Setup the free text query display under contructed tags for
	// later population.
	// 
	// If no icon_clear_source is defined, icon_clear_label will be
	// used as the defining text.
	this.setup_query = function(){
	    ll('setup_query for: ' + query_input_div_id);
	    
	    // // Some defaults.
	    // if( ! label_str ){ label_str = ''; }
	    // // if( ! icon_clear_label ){ icon_clear_label = ''; }
	    // // if( ! icon_clear_source ){ icon_clear_source = ''; }
	    
	    // The incoming label.
	    var query_label_attrs = {
		//'class': 'bbop-js-search-pane-query-label'
	    };
	    var query_label_div = new html.tag('div', query_label_attrs);
	    
	    // The text area.
	    var ta_args = {
		//'class': 'bbop-js-search-pane-textarea',
		'placeholder': this._free_text_placeholder,
		'class': 'form-control bbop-js-live-filters-textarea',
		//'style': 'height: 1em;',
		'rows': '1',
		'id': query_input_div_id
	    };
	    var query_area = new html.tag('textarea', ta_args);
	    
	    // Figure out an icon or a label.
	    var clear_query_obj = generators.clickable_object(null);
	    
	    // And a div to put it in.
	    var clear_div_attrs = {
		//'class': 'bbop-js-search-pane-clear-button',
		'generate_id': true
	    };
	    var clear_div = new html.tag('div', clear_div_attrs,clear_query_obj);	
	    
	    // General container div.
	    // NOTE/TODO: this is just a half panel--just wanted spacing.
	    var gen_div_attrs = {
		'class': 'panel panel-default',
		'generate_id': true
	    };
	    var gen_div = new html.tag('div', gen_div_attrs);
	    
	    // Add to display.
	    query_label_div.add_to(clear_div.to_string());
	    gen_div.add_to(query_label_div.to_string());
	    gen_div.add_to(query_area.to_string());
	    
	    jQuery('#' + container_div.get_id()).append(gen_div.to_string());
	};
	if( this._display_free_text_p ){
	    this.setup_query();
	}

	// Setup sticky filters display under contructed tags for later
	// population. The seeding information is coming in through the
	// GOlr conf class.
	this.setup_sticky_filters = function(){    
    	    ll('setup_sticky_filters UI for class configuration: ' +
	       cclass.id());
	    
    	    // var stitle_attrs = {
    	    // 	'class': 'panel panel-heading',
    	    // 	'id': sticky_title_id
    	    // };
    	    // var stitle =
    	    // 	new html.tag('div', stitle_attrs,
	    // 			  'No applied sticky filters');

    	    var scont_attrs = {
    		'class': 'panel-body',
    		'id': sticky_content_id
    	    };
    	    var scont =
    		    new html.tag('div', scont_attrs,
				 'No applied sticky filters');

    	    var sticky_filters_attrs = {
    		'class': 'panel panel-default',
    		'id': sticky_filters_div_id
    	    };
    	    var sticky_filters_div =
    		    //new html.tag('div', sticky_filters_attrs, [stitle, scont]);
    		    new html.tag('div', sticky_filters_attrs, scont);
	    
    	    // Add the output to the page.
    	    var sticky_filters_str = sticky_filters_div.to_string();
	    jQuery('#' + container_div.get_id()).append(sticky_filters_str);
	};	
	// Setup current filters display under contructed tags for later
	// population. The seeding information is coming in through the
	// GOlr conf class.
	// 
	// Add in the filter state up here.
	// 
	// If no icon_reset_source is defined, icon_reset_label will be
	// used as the defining text.
	this.setup_current_filters = function(){
    	    ll('setup_current_filters UI for class configuration: ' +
	       cclass.id());
	    
    	    var ccont_attrs = {
    		'class': 'panel-body',
    		'id': current_content_id
    	    };
    	    var ccont =
    		    new html.tag('div', ccont_attrs,
				 'No applied user filters');

    	    var current_filters_attrs = {
    		'class': 'panel panel-default',
    		'id': current_filters_div_id
    	    };
    	    var current_filters_div =
    		    //new html.tag('div', current_filters_attrs, [stitle, scont]);
    		    new html.tag('div', current_filters_attrs, ccont);
	    
    	    // Add the output to the page.
    	    var current_filters_str = current_filters_div.to_string();
	    jQuery('#' + container_div.get_id()).append(current_filters_str);
	};
	// Setup the accordion skeleton under contructed tags for later
	// population. The seeding information is coming in through the
	// GOlr conf class.
	// Start building the accordion here. Not an updatable part.
	// 
	// If no icon_*_source is defined, icon_*_label will be
	// used as the defining text.
	this.setup_accordion = function(){
    	    ll('setup_accordion UI for class configuration: ' +
    	       cclass.id());
	    
    	    var filter_accordion_attrs = {
    		id: filters_div_id
    	    };
    	    filter_accordion_widget = // heavy lifting by special widget
    		new html.collapsible([], filter_accordion_attrs);
	    
    	    // Add the sections with no contents as a skeleton to be
    	    // filled by draw_accordion.
    	    var field_list = cclass.field_order_by_weight('filter');
    	    each(field_list, function(in_field){
    		ll('saw field: ' + in_field);
    		var ifield = cclass.get_field(in_field);
    		var in_attrs = {
    		    id: in_field,
    		    label: ifield.display_name(),
    		    description: ifield.description()
    		};
    		filter_accordion_widget.add_to(in_attrs, '', true);
    	    });
	    
    	    // Add the output from the accordion to the page.
    	    var accordion_str = filter_accordion_widget.to_string();
    	    jQuery('#' + container_div_id).append(accordion_str);
	};
	if( this._display_accordion_p ){
	    this.setup_current_filters();
	    this.setup_sticky_filters();
	    this.setup_accordion();
	}

    	///
    	/// Define the drawing callbacks, as well as the action hooks.
    	///
	
	/*
	 * Function: draw_meta
	 *
	 * Draw meta results. Includes selector for drop down.
	 * 
	 * (Re)draw the count control with the current information in the
	 * manager. This also tries to set the selector to the response
	 * number (to keep things in sync), unbinds any current "change"
	 * event, and adds a new change event.
	 * 
	 * Parameters:
	 *  response - the <bbop.golr.response> returned from the server
	 *  manager - <bbop.golr.manager> that we initially registered with
	 *
	 * Returns:
	 *  n/a
	 */
	this.draw_meta = function(response, manager){
	    
    	    ll('draw_meta for: ' + meta_div_id);

    	    // Collect numbers for display.
    	    var total_c = response.total_documents();

    	    // Draw meta; the current numbers and page--the same for
    	    // every type of return.
	    // var ms_attrs = {
	    // 	//'class': 'label label-default pull-right'
	    // 	'class': 'label label-default'
	    // };
	    // var ms = new html.tag('div', ms_attrs, total_c);
    	    jQuery('#' + meta_count_id).empty();
    	    jQuery('#' + meta_count_id).append(total_c);
    	    // if( total_c === 0 ){
    	    // 	jQuery('#' + meta_div_id).append('No results found.');
    	    // }else{
	    // }
    	    // jQuery('#' + meta_div_id).append(ms.to_string());
	};
	if( this._display_meta_p ){
    	    manager.register('search', this.draw_meta, -1, 'meta_first');
	}

	// Detect whether or not a keyboard event is ignorable.
	function _ignorable_event(event){

    	    var retval = false;

    	    if( event ){
    		var kc = event.keyCode;
    		if( kc ){
    		    if( kc === 39 || // right
			kc === 37 || // left
			kc === 32 || // space
			kc === 20 || // ctl?
			kc === 17 || // ctl?
			kc === 16 || // shift
			kc ===  0 ){ // super
    			    ll('ignorable key event: ' + kc);
    			    retval = true;
    			// }else if( kc ===  8 ){ // delete; special handling
			//     if( anchor.query_field_text().length < 3 ){
			// 	retval = false;
			//     }
			}
		}
    	    }
    	    return retval;
	}

	/*
	 * Function: draw_query
	 *
	 * Draw the query widget. This function makes it active
	 * as well.
	 * 
	 * Clicking the reset button will reset the query to ''.
	 * 
	 * NOTE: Since this is part of the "persistant" interface (i.e. it
	 * does not get wiped after every call), we make sure to clear the
	 * event listeners when we redraw the function to prevent them from
	 * building up.
	 * 
	 * Parameters:
	 *  response - the <bbop.golr.response> returned from the server
	 *  manager - <bbop.golr.manager> that we initially registered with
	 *
	 * Returns:
	 *  n/a
	 */
	this.draw_query = function(response, manager){
    	    ll('draw_query for: ' + query_input_div_id);

    	    // Add a smartish listener.
    	    jQuery('#' + query_input_div_id).unbind('keyup');
    	    jQuery('#' + query_input_div_id).keyup(function(event){

    		// If we're left with a legitimate event, handle it.
    		if( ! _ignorable_event(event) ){
		    
    		    // Can't ignore it anymore, so it goes into the
    		    // manager for testing.
    		    var tmp_q = manager.get_query();
    		    var input_text = jQuery(this).val();
    		    manager.set_query(input_text);

    		    // If the manager feels like it's right, trigger.
    		    if( manager.sensible_query_p() ){
    			ll('keeping set query: ' + input_text);
    			// Set the query to be more "usable" just
    			// before triggering (so the tests can't be
    			// confused by our switch).
			if( input_text === '' ){
    			    manager.set_comfy_query(manager.get_fundamental_query());
			}else{
    			    manager.set_comfy_query(input_text);
			}
    			manager.search();
			
    			// We are now searching--show it.
    			_spin_up();
    		    }else{
    			ll('rolling back query: ' + tmp_q);		    
    			manager.set_query(tmp_q);
    		    }
    		}
    	    });
	    
    	    // Now reset the clear button and immediately set the event.
    	    jQuery('#' + clear_query_span_id).unbind('click');
    	    jQuery('#' + clear_query_span_id).click(function(){
    		manager.reset_query();
    		//anchor.set_query_field(manager.get_query());
    		manager.set_query_field('');
    		manager.search();
    		// We are now searching--show it.
    		_spin_up();
    	    });
	};
	if( this._display_free_text_p ){
    	    manager.register('search', this.draw_query, 0, 'query_first');
	}
	
	/*
	 * Function: draw_accordion
	 *
	 * (Re)draw the information in the accordion controls/filters.
	 * This function makes them active as well.
	 * 
	 * Parameters:
	 *  response - the <bbop.golr.response> returned from the server
	 *  manager - <bbop.golr.manager> that we initially registered with
	 *
	 * Returns:
	 *  n/a
	 */
	this.draw_accordion = function(response, manager){	    
    	    ll('draw_accordion for: ' + filters_div_id);

	    //
    	    // Make sure that accordion has already been inited.
    	    if( typeof(filter_accordion_widget) === 'undefined' ){
    		throw new Error('Need to init accordion widget to use it.');
    	    }

    	    // We'll need this in a little bit for calculating when to
    	    // display the "more" option for the field filters.
    	    var real_facet_limit = manager.get_facet_limit();
    	    var curr_facet_limit = real_facet_limit -1; // the facets we'll show

    	    // We want this so we can filter out any facets that have the
    	    // same count as the current response total--these facets are
    	    // pretty much information free.
    	    var total_docs = response.total_documents();

    	    // A helper function for when no filters are
    	    // displayed.
    	    function _nothing_to_see_here(in_field){
    		var section_id =filter_accordion_widget.get_section_id(in_field);
    		jQuery('#' + section_id).empty();
    		jQuery('#' + section_id).append('Nothing to filter.');
    	    }

    	    // Hash where we collect our button information.
    	    // button_id -> [source, filter, count, polarity];
    	    var button_hash = {};

    	    // And a hash to store information to be able to generate the
    	    // complete filter shields.
    	    // span_id -> filter_id
    	    var overflow_hash = {};

    	    // Cycle through each facet field; all the items in each,
    	    // create the lists and buttons (while collectong data useful
    	    // in creating the callbacks) and put them into the accordion.
    	    each(response.facet_field_list(), function(in_field){

    		var facet_bd = response.facet_field(in_field);
    		if( us.isEmpty(facet_bd) ){
		    
    		    // No filters means nothing in the box.
    		    _nothing_to_see_here(in_field);

    		}else{
		    
    		    // Create ul lists of the facet contents.
    		    var tbl_id = mangle + 'filter-list-' + in_field;
    		    var facet_list_tbl_attrs = {
			'class': 'table table-hover table-striped table-condensed',
    			'id': tbl_id
    		    };

    		    var facet_list_tbl =
    			    new html.table([], [], facet_list_tbl_attrs);
		    
    		    ll("consider:" + in_field + ": " +
    		       response.facet_field(in_field).length);

    		    // BUG/TODO:
    		    // Count the number of redundant (not shown)
    		    // facets so we can at least give a face to this
    		    // bug/problem.
    		    // Also filter out "empty filters".
    		    var redundant_count = 0;
    		    // Now go through and get filters and counts.
    		    var good_count = 0; // only count when good
    		    var overflow_p = false; // true when at 24 -> 25
    		    each(response.facet_field(in_field), function(ff_field, ff_index){

    			// Pull out info early so we can test it
    			// for information content.
    			var f_name = ff_field[0];
    			var f_count = ff_field[1];
			
    			// ll(in_field + ": " + f_name + ": " +
    			// 	 [f_count,
    			// 	  total_docs,
    			// 	  ff_index,
    			// 	  good_count,
    			// 	  redundant_count,
    			// 	  real_facet_limit].join(', '));
			
    			// TODO: The field is likely redundant
    			// (BUG: not always true in closures),
    			// so eliminate it.
    			if( f_count === total_docs ){
    			    //ll("\tnothing here");
    			    redundant_count++;
    			}else if( ! f_name || f_name === "" ){
    			    // Straight out skip if it is an
    			    // "empty" facet field.
    			}else if( ff_index < real_facet_limit -1 ){
    			    //ll("\tgood row");
    			    good_count++;

    			    // Create buttons and store them for later
    			    // activation with callbacks to
    			    // the manager.
    			    var b_plus = new html.button(
    				ui_icon_positive_label,
				{
				    'generate_id': true,
				    'type': 'button',
				    'class':
				    'btn btn-success btn-xs'
				});
    			    var b_minus =
    				    new html.button(
    					ui_icon_negative_label,
					{
					    'generate_id': true,
					    'type': 'button',
					    'class':
					    'btn btn-danger btn-xs'
					});
			    
    			    // Store in hash for later keying to
    			    // event.
    			    button_hash[b_plus.get_id()] =
    				[in_field, f_name, f_count, '+'];
    			    button_hash[b_minus.get_id()] =
    				[in_field, f_name, f_count, '-'];
			    
    			    // // Add the label and buttons to the
    			    // // appropriate ul list.
    			    //facet_list_ul.add_to(
    			    // fstr,b_plus.to_string(),
    			    //   b_minus.to_string());
    			    // Add the label and buttons to the table.
    			    facet_list_tbl.add_to(
				[
    				    b_plus.to_string(),
    				    b_minus.to_string(),
    				    '('+ f_count+ ')',
				    f_name
    				]);
    			}
			
    			// This must be logically separated from
    			// the above since we still want to show
    			// more even if all of the top 25 are
    			// redundant.
    			if( ff_index === real_facet_limit -1 ){
    			    // Add the more button if we get up to
    			    // this many facet rows. This should
    			    // only happen on the last possible
    			    // iteration.
			    
    			    overflow_p = true;
    			    //ll( "\tadd [more]");
			    
    			    // Since this is the overflow item,
    			    // add a span that can be clicked on
    			    // to get the full filter list.
    			    //ll("Overflow for " + in_field);
    			    var b_over = new html.button(
    				'more...',
				{
				    'generate_id': true,
				    'type': 'button',
				    'title':
				    'Display the complete list',
				    'class':
				    'btn btn-primary btn-xs'
				});
    			    facet_list_tbl.add_to([b_over.to_string(),
    				  		   '', '']);
    			    overflow_hash[b_over.get_id()] = in_field;
    			}
    		    });

    		    // There is a case when we have filtered out all
    		    // avilable filters (think db source).
    		    if( good_count === 0 && ! overflow_p ){
    			_nothing_to_see_here(in_field);
    		    }else{
    			// Otherwise, now add the ul to the
    			// appropriate section of the accordion in
    			// the DOM.
    			var sect_id =
    				filter_accordion_widget.get_section_id(in_field);
    			jQuery('#' + sect_id).empty();

    			// TODO/BUG:
    			// Give warning to the redundant facets.
    			var warn_txt = null;
    			if( redundant_count === 1 ){
    			    warn_txt = "field is";
    			}else if( redundant_count > 1 ){
    			    warn_txt = "fields are";
    			}
    			if( warn_txt ){
    			    jQuery('#' + sect_id).append(
    				"<small> The top (" + redundant_count +
    				    ") redundant " + warn_txt + " not shown" +
    				    "</small>");
			    
    			}

    			// Add facet table.
    			var final_tbl_str = facet_list_tbl.to_string();
    			jQuery('#' + sect_id).append(final_tbl_str);
    		    }
    		}
    	    });

    	    // Okay, now introducing a function that we'll be using a
    	    // couple of times in our callbacks. Given a button id (from
    	    // a button hash) and the [field, filter, count, polarity]
    	    // values from the props, make a button-y thing an active
    	    // filter.
    	    function filter_select_live(create_time_button_props, button_id){
    		//var bid = button_id;
    		//var in_field = create_time_button_props[0];	 
    		//var in_filter = create_time_button_props[1];
    		//var in_count = create_time_button_props[2];
    		var in_polarity = create_time_button_props[3];

    		// Decide on the button graphical elements.
    		var b_ui_icon = 'ui-icon-plus';
    		if( in_polarity === '-' ){
    		    b_ui_icon = 'ui-icon-minus';
    		}
    		var b_ui_props = {
    		    icons: { primary: b_ui_icon},
    		    text: false
    		};

    		// Create the button and immediately add the event.
    		//jQuery('#' + button_id).button(b_ui_props).click(
    		jQuery('#' + button_id).click(function(){
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
    		    // We are now searching--show it.
    		    _spin_up();
    		});
    	    }

    	    // Now let's go back and add the buttons, styles,
    	    // events, etc. in the main accordion section.
    	    each(button_hash, filter_select_live);

    	    // Next, tie the events to the "more" spans.
    	    each(overflow_hash, function(filter_name, button_id){
    		jQuery('#' + button_id).click(function(){

    		    // On click, set that one field to limitless in
    		    // the manager, setup a shield, and wait for the
    		    // callback.
		    
    		    // Recover the field name.
    		    var tid = jQuery(this).attr('id');
    		    var call_time_field_name = overflow_hash[tid];
    		    //alert(call_time_field_name);
		    
    		    // Set the manager to no limit on that field and
    		    // only rturn the information that we want.
    		    manager.set_facet_limit(0);
    		    manager.set_facet_limit(call_time_field_name, -1);
    		    var curr_row = manager.get('rows');
    		    manager.set('rows', 0);
		    
    		    // Create the shield and pop-up the
    		    // placeholder.
    		    var filter_shield = new display.filter_shield(
			ui_spinner_shield_source,
    			ui_spinner_shield_message); 
    		    filter_shield.start_wait();
		    
    		    // Open the populated shield.
    		    function draw_shield(resp){
			
    			// ll("shield what: " + bbop.what_is(resp));
    			// ll("shield resp: " + bbop.dump(resp));
			
    			// First, extract the fields from the minimal
    			// response.
    			var fina = call_time_field_name;
    			var flist = resp.facet_field(call_time_field_name);
			
    			// Draw the proper contents of the shield.
    			filter_shield.draw(fina, flist, manager);
    		    }
    		    manager.fetch(draw_shield);
		    
    		    // Reset the manager to more sane settings.
    		    manager.reset_facet_limit();
    		    manager.set('rows', curr_row);
    		});
    	    });
	    
    	    ll('Done current accordion for: ' + filters_div_id);
	};
	
	/*
	 * Function: draw_current_filters
	 *
	 * (Re)draw the information on the current filter set.
	 * This function makes them active as well.
	 * 
	 * Parameters:
	 *  response - the <bbop.golr.response> returned from the server
	 *  manager - <bbop.golr.manager> that we initially registered with
	 *
	 * Returns:
	 *  n/a
	 */
	this.draw_current_filters = function(response, manager){	
	    ll('draw_current_filters for: ' + current_filters_div_id);

	    ///
	    /// Add in the actual HTML for the filters and buttons. While
	    /// doing so, tie a unique id to the filter--we'll use that
	    /// later on to add buttons and events to them.
	    ///

	    // First, we need to make the filter clear button for the top
	    // of the table.
	    var b_cf = new html.button('&times;', {
		'type': 'button',
		'id':
		clear_user_filter_span_id,
		'class':
		'btn btn-danger btn-xs',
		'title':
		'Clear all user filters'
	    });
	    
	    var in_query_filters = response.query_filters();
	    //var sticky_query_filters = manager.get_sticky_query_filters();
	    ll('filters: ' + bbop.dump(in_query_filters));
	    var fq_list_tbl = new html.table(
		['', 'User filters', b_cf.to_string()],
		[],
		// {'class': 'bbop-js-search-pane-filter-table'});
		{'class': 'table table-hover table-striped table-condensed'});
	    var has_fq_p = false; // assume there are no filters to begin with
	    var button_hash = {};
	    each(in_query_filters, function(field_vals, field){
		each(field_vals, function(polarity, field_val){

		    // Make note of stickiness, skip adding if sticky.
		    var qfp = manager.get_query_filter_properties(field,
								  field_val);
		    if( ! qfp || qfp['sticky_p'] === false ){
			
			// Note the fact that we actually have a
			// query filter to work with and display.
			has_fq_p = true;

			// Boolean value to a character.
			var polstr = '&minus;';
			if( polarity ){ polstr = '&plus;'; }


			// Argh! Real jQuery buttons are way too slow!
			// var b = new html.button('remove filter',
			// 		  {'generate_id': true});

			// Generate a button with a unique id.
			var b = new html.button( ui_icon_remove_label, {
			    'generate_id': true,
			    'type': 'button',
			    'title': 'Remove filter',
			    'class':
			    'btn btn-danger btn-xs'
			});

			// Tie the button it to the filter for
			// jQuery and events attachment later on.
			var bid = b.get_id();
			button_hash[bid] = [polstr, field, field_val];
			
			//ll(label_str +' '+ bid);
			//fq_list_tbl.add_to(label_str +' '+ b.to_string());
			fq_list_tbl.add_to(['<strong>'+ polstr +'</strong>',
					    field + ': ' + field_val,
					    b.to_string()]);
			//label_str +' '+ b.to_string());
		    }
		});
	    });

	    // Either add to the display, or display the "empty" message.
	    var cfid = '#' + current_content_id;
	    jQuery(cfid).empty();
	    if( ! has_fq_p ){
		jQuery(cfid).append("No current user filters.");
	    }else{

		// With this, the buttons will be attached to the
		// DOM...
		jQuery(cfid).append(fq_list_tbl.to_string());
		
		// First, lets add the reset for all of the filters.
		jQuery('#' + b_cf.get_id()).click(function(){
	   	    manager.reset_query_filters();
	   	    manager.search();
		    // We are now searching--show it.
		    _spin_up();
		});
		
		// Now let's go back and add the buttons, styles,
		// events, etc. to the filters.
		each(button_hash, function(pass, button_id){
		    var bid = button_id;

		    // // Get the button.
		    // var bprops = {
		    // 	 icons: { primary: "ui-icon-close"},
		    // 	 text: false
		    // };
		    // Create the button and immediately add the event.
		    //jQuery('#' + bid).button(bprops).click(
		    jQuery('#' + bid).click(function(){
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
			// We are now searching--show it.
			_spin_up();
		    });
		});
	    }
	};

	/*
	 * Function: draw_sticky_filters
	 *
	 * (Re)draw the information on the sticky filter set.
	 * 
	 * Parameters:
	 *  response - the <bbop.golr.response> returned from the server
	 *  manager - <bbop.golr.manager> that we initially registered with
	 *
	 * Returns:
	 *  n/a
	 */
	this.draw_sticky_filters = function(response, manager){	    
    	    ll('draw_sticky_filters for: ' + sticky_filters_div_id);

    	    // Add in the actual HTML for the pinned filters and buttons.
    	    var sticky_query_filters = manager.get_sticky_query_filters();
    	    ll('sticky filters: ' + bbop.dump(sticky_query_filters));
    	    var fq_list_tbl = new html.table(
		['', 'Your search is pinned to these filters'],
    		[],
    		{'class': 'table table-hover table-striped table-condensed'});
    	    // [{'filter': A, 'value': B, 'negative_p': C, 'sticky_p': D}, ...]
    	    each(sticky_query_filters, function(fset){

    		//
    		var sfield = fset['filter'];
    		var sfield_val = fset['value'];

    		// Boolean value to a character.
    		var polarity = fset['negative_p'];
    		var polstr = '&minus;';
    		if( polarity ){ polstr = '&plus;'; }

    		// Generate a button with a unique id.
    		var label_str = polstr + ' ' + sfield + ':' + sfield_val;
    		fq_list_tbl.add_to(['<b>'+ polstr +'</b>',
    				    sfield + ': ' + sfield_val]);
    	    });
	    
    	    // Either add to the display, or display the "empty" message.
    	    //var sfid = '#' + sticky_filters_div_id;
    	    var sfid = '#' + sticky_content_id;
    	    jQuery(sfid).empty();
    	    if( sticky_query_filters.length === 0 ){
    		jQuery(sfid).append("No sticky filters.");
    	    }else{
    		// Attach to the DOM...
    		jQuery(sfid).append(fq_list_tbl.to_string());
    	    }
	};

	/*
	 * Function: query_field_text
	 * 
	 * Push text into the search box. Does not affect the state of the
	 * manager in any way.
	 * 
	 * NOTE: Does not function until the display is established.
	 * 
	 * Parameters:
	 *  query - the text to put into the search box
	 *
	 * Returns
	 *  string
	 */
	this.query_field_text = function(query){
            var retval = '';
            if( anchor.established_p() && us.isString(query) ){
		var input_text = jQuery('#' + query_input_div_id).val(query);
		if( input_text ){
		    retval = input_text;
		}
            }
            return retval;
	};

	///
	/// 
	///

	if( this._display_accordion_p ){
    	    manager.register('search', this.draw_accordion, 1,
			     'accordion_first');
    	    manager.register('search', this.draw_current_filters, 2,
			     'current_first');
    	    manager.register('search', this.draw_sticky_filters, 3,
			     'sticky_first');
	}

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
    	    ll("draw_error: " + error_message);
    	    alert("Runtime error: " + error_message);
    	    _spin_down();
	};
    	manager.register('error', this.draw_error, 0, 'error_first');

	// 
	function spin_down_wait(){
	    _spin_down();
	}
    	manager.register('search', spin_down_wait, -100, 'donedonedone');

    	// Start the ball with a reset event.
    	//manager.search();

	// The display has been established.
	anchor._established_p = true;
    };
};

///
/// Exportable body.
///

module.exports = live_filters;
