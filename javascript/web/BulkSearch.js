////
//// Attempt to assemble a workable bulk search/download using new BS3
//// widgets.
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
    //var dlimit = defs.download_limit();
    var dlimit = 1000;

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

	///
	/// Manager setup.
	///

	// The manager that we'll all share with all the consumer widgets.
	var search = new bbop.golr.manager.jquery(solr_server, gconf);
	// // We like highlights; they should be included automatically
	// // through the widget.
	// search.include_highlighting(true);

	// Ready the manager.
	var confc = gconf.get_class(global_bulk_search_personality);
	search.set_personality(global_bulk_search_personality);
	search.add_query_filter('document_category',
				confc.document_category(), ['*']);

	///
	/// Major widget attachements to the manager.
	///

	// Attach filters to manager.
	var hargs = {
	    meta_label: 'Total pool:&nbsp;',
	    // free_text_placeholder:
	    // 'Input text to filter against all remaining documents',
	    'display_free_text_p': false
	};
	var filters = new bbop.widget.live_filters(filter_accordion, search,
						   gconf, hargs);
	filters.establish_display();

	// Attach pager to manager.
	var pager_opts = {
	};
	var pager = new bbop.widget.live_pager('pager', search, pager_opts);
    
	// Attach the results pane and download buttons to manager.
	var btmpl = bbop.widget.display.button_templates;
	var default_fields = confc.field_order_by_weight('result');
	var flex_download_button =
		btmpl.flexible_download_b3('<span class="glyphicon glyphicon-download"></span> Download',// (up to '+dlimit+')',
					   dlimit,
					   default_fields,
					   global_bulk_search_personality,
					   gconf);
	var results_opts = {
	    //'callback_priority': -200,
	    'user_buttons_div_id': pager.button_span_id(),
	    'user_buttons': [
		flex_download_button
	    ]
	};
	var results = new bbop.widget.live_results('results', search, confc,
						   handler, linker,
						   results_opts);

	// Add pre and post run spinner (borrow filter's for now).
	search.register('prerun', 'foo', function(){
	    filters.spin_up();
	});
	search.register('postrun', 'foo', function(){
	    filters.spin_down();
	});

	///
	/// Incorporate the special things for this page: the bulk
	/// searcher and the field selection.
	///

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
		}else if( bulk_list.length > dlimit ){
		    alert('The input limit for this tool is currently: ' +
			  dlimit + '.');
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

	// If we're all done, trigger initial hit.
	search.search();
    }
 
    // Done message.
    ll('BulkSearchInit done.');
    
    // // DEBUGGING: A temporary external hook to help with dev and
    // // debugging.
    // s = search;
}
//var s;
