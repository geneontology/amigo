////
//// A full take on a production live search for GOlr.
//// It ends up being a light wrapping around the search_pane widget.
//// 

//
function BulkSearchInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('BS: ' + str); }

    // Start messages.
    ll('');
    ll('BulkSearch.js');
    ll('BulkSearchInit start...');

    // Aliases.
    var each = bbop.core.each;
    var is_array = bbop.core.is_array;
    var first_split = bbop.core.first_split;

    ///
    /// Ready the configuration that we'll use.
    ///

    var gconf = new bbop.golr.conf(amigo.data.golr);
    var sd = new amigo.data.server();
    var defs = new amigo.data.definitions();
    var linker = new amigo.linker();
    var solr_server = sd.golr_base();

    ///
    /// DOM hooks.
    ///

    var input_fields = 'input-query-fields';
    var input_fields_elt = '#' + input_fields;
    var ifchk_name = 'ifq';
    // var ifchk_name_elt = '#' + ifchk_name;
    var filter_accordion = 'input-filter-accordion';
    var filter_accordion_elt = '#' + filter_accordion;
    var submit_button = 'submit-button';
    var submit_button_elt = '#' + submit_button;

    // ///
    // /// Ready widget.
    // ///

    // var handler = new amigo.handler();
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
    // 	'spinner_search_source' : sd.image_base() + '/waiting_ajax.gif',
    // 	//'spinner_shield_source' : sd.image_base() + '/waiting_poll.gif'
    // 	'spinner_shield_message' : 'Loading and using this widget may take a long time on some large filter sets. If it takes too long, please close it and further narrow your results using other facets or the text search.<br />Waiting...',
    // 	'spinner_shield_source' : sd.image_base() + '/waiting_ajax.gif'
    // };
    var hargs = {
	meta_label: 'Remaining:&nbsp;',
	free_text_placeholder:
	'Input text to filter against all remaining documents'
    };
    var search = new bbop.widget.live_filters(solr_server, gconf,
					      filter_accordion, hargs);
    // // We like highlights; they should be included automatically
    // // through the widget.
    // search.include_highlighting(true);
    
    ///
    /// Handle setup:
    ///  1) We /need/ to have a personality defined. If not, it is an error--
    ///     we no longer do the (confusing) tabbed-switch approach.
    ///
 
    // Check for incoming personality.
    // A little handling if we came in on a personality dispatch.
    if( ! global_bulk_search_personality ||
	global_bulk_search_personality == ''){
	ll('ERROR: No personality defined, cannot continue.');
	alert('ERROR: No personality defined, cannot continue.');
    }else{
	ll("Detected dispatch argument (can progress): " +
	   global_bulk_search_personality);

	// // _on_search_select(global_live_search_personality);
	// search.set_personality(global_live_search_personality);
	// search.lite(true);
	search.set_personality(global_bulk_search_personality);
	search.establish_display();

	// Add search fields to input form.
	jQuery(input_fields_elt).empty();	
	var confc = gconf.get_class(global_bulk_search_personality);
	var cfields = confc.field_order_by_weight('boost');
	//var cfields = confc.field_order_by_weight('result');
	each(cfields,
	     function(cfield){
		 var f = confc.get_field(cfield);
		 var fdesc = f.description();

		 // Assemble.
		 var chkinp_opts = {
		     'type': 'checkbox',
		     'name': ifchk_name,
		     'alt': fdesc,
		     'title': fdesc,
		     'value': f.id()
		 };
		 var chkinp = new bbop.html.input(chkinp_opts);

		 // Assemble.
		 var flbl_opts = {
		     'alt': fdesc,
		     'title': fdesc
		 };
		 var flbl = new bbop.html.tag('label', flbl_opts,
					      [chkinp,
					       f.display_name() +
					       ' (' + f.id() + ')']);
		 
		 var fcont_opts = {
		     'class': 'checkbox'
		 };
		 var fcont = new bbop.html.tag('div', fcont_opts, flbl);

		 // Add to DOM.
		 jQuery(input_fields_elt).append(fcont.to_string());
	     });

	// TODO: Add filter accordion to input form.

	// TODO: Wire the actions of the accordion to update the
	// display.

	// TODO: Now that we're setup, activate the display.
	jQuery(submit_button_elt).removeClass('disabled');
    }
 
    // Done message.
    ll('BulkSearchInit done.');
    
    // // DEBUGGING: A temporary external hook to help with dev and
    // // debugging.
    // s = search;
}
//var s;
