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
    var splode = bbop.core.splode;
    var chomp = bbop.core.chomp;

    ///
    /// Ready the configuration that we'll use.
    ///

    var gconf = new bbop.golr.conf(amigo.data.golr);
    var sd = new amigo.data.server();
    var defs = new amigo.data.definitions();
    var handler = new amigo.handler();
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
    var bulk_input = 'bulk_input';
    var bulk_input_elt = '#' + bulk_input;
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
	meta_label: 'Total pool:&nbsp;',
	free_text_placeholder:
	'Input text to filter against all remaining documents',
	'display_free_text_p': false
    };
    var search = new bbop.widget.live_filters(solr_server, gconf,
					      filter_accordion, hargs);
    // // We like highlights; they should be included automatically
    // // through the widget.
    // search.include_highlighting(true);

    // Add the pager to the search callback.
    var pager = bbop.widget.live_pager('pager', search, {});
    
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

	var confc = gconf.get_class(global_bulk_search_personality);

	// // _on_search_select(global_live_search_personality);
	// search.set_personality(global_live_search_personality);
	// search.lite(true);
	search.set_personality(global_bulk_search_personality);
	search.add_query_filter('document_category',
				confc.document_category(), ['*']);
	search.establish_display();

	// Add search fields to input form.
	jQuery(input_fields_elt).empty();
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


	// Now that we're setup, activate the display button, and make
	// it so that it will only work on "good" input.
	//var max_bulk_input = 10000;
	var max_bulk_input = 1000;
	function _response_callback(resp, man){
	    jQuery('#' + 'results').empty();
	    if( resp.success() && resp.total_documents() > 0 ){
		// Display results.
		var rt = bbop.widget.display.results_table_by_class(confc,
								    resp,
								    linker,
								    handler,
								    'results',
								    false);
	    }else{
		jQuery('#' + 'results').append('<em>No results given your input and search fields. Please refine and try again.</em>');
	    }
	}
	search.register('search', 'foo', _response_callback);
	function _trigger_bulk_search(identifiers, search_fields){

	    ll('run search');
	    search.set_targets(identifiers, search_fields);

	    // 
	    search.search();

	    // Scroll to results.
	    jQuery('html, body').animate({
		scrollTop: jQuery('#' + 'results-area').offset().top
	    }, 500);
	}	
	jQuery(submit_button_elt).removeClass('disabled');
	jQuery(submit_button_elt).click(function(e){
	    e.preventDefault();

	    var bulk_raw = jQuery(bulk_input_elt).val();
	    if( ! bulk_raw || bulk_raw == '' ){
		alert('You must input the identifiers for the items you are searching for to use this tool.');
	    }else{
		// Attempt to process input.
		var bulk_trim = chomp(bulk_raw) || '';
		var bulk_list = splode(bulk_trim) || [];
		if( ! bulk_list || bulk_list.length == 0 ||
		    (bulk_list.length == 1 && bulk_list[0] == '' )){
		    alert('You must input the identifiers for the items you are searching for to use this tool.');
		}else if( bulk_list.length > max_bulk_input ){
		    alert('The input limit for this tool is currently: ' +
			  max_bulk_input + '.');
		}else{
		    // console.log(bulk_list)
		    // Okay, the input text looks good, now we need to
		    // make sure that there is at least some field
		    // checked for the bulk search fields.
		    var simp = 'input[type="checkbox"][name="ifq"]:checked';
		    var bulk_search_fields =
			jQuery(simp).map(function(){ return this.value; }).get();
		    //console.log(bulk_search_fields)
		    if( ! bulk_search_fields || bulk_search_fields.length == 0 ){
			alert('You must select at least one search field from the list to make use of the bulk search.');
		    }else{
			_trigger_bulk_search(bulk_list, bulk_search_fields);
		    }
		}
	    }
	});
    }
 
    // Done message.
    ll('BulkSearchInit done.');
    
    // // DEBUGGING: A temporary external hook to help with dev and
    // // debugging.
    // s = search;
}
//var s;
