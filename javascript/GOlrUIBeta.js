////
//// An all-encompassing UI object.
////

// An experimental dynamic UI builder.
// TODO: will also probably need to take go_meta at some point.
function GOlrUIBeta(in_args){

    var gui_anchor = this;
    
    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // There should be a string interface_id argument.
    if( in_args && ! in_args['interface_id'] ){
	ll('GUI: ERROR: no interface_id argument');
	if( typeof in_args['interface_id'] != 'string' ){
	    ll('GUI: ERROR: no interface_id string argument');
	}
    }
    // The location where we'll build and manage the interface.
    this.interface_id = in_args['interface_id'];
   

    // AmiGO helper.
    var amigo = new bbop.amigo();
    var golr = amigo.golr_response;

    // Get the user interface hook.
    //var ui_div_hook = golr.parameter(json_data, 'interface_id');
    var ui_div_hook = this.interface_id;
    // Mangle everything around this unique id so we don't collide
    // with other instances on the same page.
    var mangle = ui_div_hook + '_ui_element_';
    // ...
    var accordion_div_hook = mangle + 'filter-accordion';

    // Initialze with reseting data.
    this.init = function(json_data){
    
	ll('UIB: Build UI from reset response: ' + ui_div_hook);
	
	// First, remove anything that was there.
	jQuery('#' + ui_div_hook).empty();
	
	// Start building the accordion here.
	var filter_accordion_attrs = {
	    id: accordion_div_hook,
	    style: 'width: 25em;'
	};
	var filter_accordion =
	    new bbop.html.accordion([], filter_accordion_attrs);
    
	//var field_attr_hash = {};
	var field_list = golr.facet_field_list(json_data);
	function _look_at_fields(in_field, in_i){
	    //ll('GUI: saw field: ' + in_field);

	    // Create ul lists of the facet contents.
	    var facet_list_ul_attrs = {
		id: mangle + 'filter-list-' + in_field,
		'class': 'golr-filter-selectable',
		style: 'height: 30em;'
	    };
	    var facet_list_ul = new bbop.html.list([], facet_list_ul_attrs);
	    var facet_contents_list = golr.facet_field(json_data, in_field);
	    bbop.core.each(facet_contents_list,
			   function(item, i){
			       var name = item[0];
			       var count = item[1];
			       //ll('GUI: saw facet item: ' + name);
			       facet_list_ul.add_child(name);
			   });
	
	    // Add the ul list to the accordion.
	    //ll('GUI: out');
	    //ll('GUI: add to accordion: ' + facet_list_ul.output());
	    //ll('GUI: passed');
	    filter_accordion.add_child(in_field, facet_list_ul);
	}
	bbop.core.each(field_list, _look_at_fields);

	// TODO: Add the output from the accordion to the page.
	jQuery('#' + ui_div_hook).html(filter_accordion.output());

	// // TODO
	// var query_text =
	// 	widgets.form.text_input('q', 'q', 25, 
	// 				'Search for<br />');

	jQuery(function() {
		   // Add the jQuery accordioning.
		   jQuery("#" + mangle +
			  "filter-accordion").accordion({ clearStyle: true,
							  collapsible: true,
							  active: false });

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
			       gui_anchor.check_status();
			   }};
		       ll('GUI examining: ' + item);
		       jQuery("#" + mangle +
			      "filter-list-" + item).selectable(_select_arg);
		   }
		   bbop.core.each(field_list, _init_lambda);
	       });
    };


    // Return a query object?
    // TODO: Eventually call anything that registered for GUI events.
    this.check_status = function(){
    
	ll('UIB: Build UI from reset response: ' + ui_div_hook);
	
	// DEBUG: First, remove anything that was there.
	var result = jQuery("#DEBUG").empty();

	// Figure out where our filters are and what they are.
	ll('UIB: Scanning filter accordion: ' + accordion_div_hook);
	jQuery(".golr-filter-selectable .ui-selected").each(
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
		result.append(" " + filter_set + " " + filter_item);
	    });
	
	// NOTE: the first item in the hash is the default op.
	// TODO: need a special object for adding and translations
	//       would be easy for testing!

	// TODO: Callbacks.
    };
}
