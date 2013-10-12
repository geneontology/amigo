////
//// A full take on a production live search for GOlr.
//// It ends up being a light wrapping around the search_pane widget.
//// 

//
function LiveSearchGOlrInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('LS: ' + str); }    

    // Start messages.
    ll('');
    ll('LiveSearchGOlr.js');
    ll('LiveSearchGOlrInit start...');

    // Aliases.
    var loop = bbop.core.each;

    ///
    /// A description of the active buttons and what to do when they
    /// are clicked. Very likely the only thing that you'd have to
    /// change on this page.
    ///

    function _establish_buttons(personality, manager){
	ll('Using _establish_buttons');
	if( personality == 'annotation' ){
	    manager.clear_buttons();
	    manager.add_button(facet_matrix_button);
	    manager.add_button(gaf_download_button);
	    //manager.add_button(gaf_galaxy_button);
	    manager.add_button(bookmark_button);
	}else if( personality == 'ontology' ){
	    manager.clear_buttons();
	    manager.add_button(id_label_download_button);
	    manager.add_button(ont_flex_download_button);
	    //manager.add_button(id_term_label_galaxy_button);
	    manager.add_button(bookmark_button);
	}else if( personality == 'bioentity' ){
	    manager.clear_buttons();
	    manager.add_button(id_download_button);
	    //manager.add_button(id_symbol_galaxy_button);
	    manager.add_button(bookmark_button);
	}else if( personality == 'complex_annotation' ){
	    manager.clear_buttons();
	//}else if( personality == 'bbop_ann_ev_agg' ){
	}else{
	    manager.clear_buttons();
	}
    }

    var active_classes = {
    	'annotation': function(manager){
    	    manager.add_query_filter('document_category',
    				     'annotation', ['*']);
    	    _establish_buttons('annotation', manager);
    	},
    	'ontology': function(manager){
    	    manager.add_query_filter('document_category',
    				     'ontology_class', ['*']);
    	    _establish_buttons('ontology', manager);
    	},
    	'bioentity': function(manager){
    	    manager.add_query_filter('document_category',
    				     'bioentity', ['*']);
    	    _establish_buttons('bioentity', manager);
    	},
    	'complex_annotation': function(manager){
    	    manager.add_query_filter('document_category',
    				     'complex_annotation', ['*']);
    	    //_establish_buttons('annotation', manager);
    	},
    	'family': function(manager){
    	    manager.add_query_filter('document_category',
    				     'family', ['*']);
    	    _establish_buttons('family', manager);
    	},
    	'general': function(manager){
    	    manager.add_query_filter('document_category',
    				     'general', ['*']);
    	    _establish_buttons('general', manager);
	},
    	'bbop_term_ac': function(manager){
    	    manager.add_query_filter('document_category',
    				     'ontology_class', ['*']);
    	    _establish_buttons('bbop_term_ac', manager);
    	// },
    	// 'bbop_ann_ev_agg': function(manager){
    	//     manager.add_query_filter('document_category',
    	// 			     'annotation_evidence_aggregate',['*']);
    	//     _establish_buttons('bbop_ann_ev_agg', manager);
    	}
    };

    ///
    /// Ready the configuration that we'll use.
    ///

    var gconf = new bbop.golr.conf(amigo.data.golr);
    var sd = new amigo.data.server();
    var linker = new amigo.linker();
    var solr_server = sd.golr_base();
    var div_id = 'display-general-search';

    ///
    /// Defined some useful buttons.
    ///

    // Download limit.    
    //var dlimit = 7500;
    var dlimit = 100000;

    // Global download properties.
    var _dl_props = {
	'entity_list': null,
	'rows': dlimit
    };

    // Define the rows that we'll use to create a psuedo-GAF.
    var _gaf_fl = [
	'source', // c1
	'bioentity_internal_id', // c2; not bioentity
	'bioentity_label', // c3
	'qualifier', // c4
	'annotation_class', // c5
	'reference', // c6
	'evidence_type', // c7
	'evidence_with', // c8
	'aspect', // c9
	'bioentity_name', // c10
	'synonym', // c11
	'type', // c12
	'taxon', // c13
	'date', // c14
	'assigned_by', // c15
	'annotation_extension_class', // c16
	'bioentity_isoform' // c17
    ];

    // Create button templates to use from our library.
    var btmpl = bbop.widget.display.button_templates;

    var id_download_button =
	btmpl.field_download('Download IDs (up to ' +
			     dlimit + ')',
			     dlimit, ['id']);
    var id_label_download_button =
	btmpl.field_download('Download IDs and labels (up to ' +
			     dlimit + ')',
			     dlimit, ['annotation_class',
				      'annotation_class_label']);
    var gaf_download_button =
	btmpl.field_download('GAF chunk download (up to ' +
			     dlimit + ')',
			     dlimit, _gaf_fl);
    var ont_flex_download_button =
	btmpl.flexible_download('Flex download test (up to ' + dlimit + ')',
				dlimit,
				['annotation_class', 'annotation_class_label'],
				'ontology',
				gconf);
    var bookmark_button = btmpl.bookmark(linker);
    var facet_matrix_button = btmpl.open_facet_matrix(gconf, sd);
    var gaf_galaxy_button =
	btmpl.send_fields_to_galaxy('Send GAF chunk to Galaxy (up to ' +
				    dlimit + ')',
				    dlimit, _gaf_fl, global_galaxy_url);
    var id_term_label_galaxy_button =
	btmpl.send_fields_to_galaxy('Send IDs and names to Galaxy (up to ' +
				    dlimit + ')',
				    dlimit, ['annotation_class',
					   'annotation_class_label'],
				    global_galaxy_url);
    var id_symbol_galaxy_button =
	btmpl.send_fields_to_galaxy('Send IDs and symbols to Galaxy ' +
				    '(up to ' + dlimit + ')',
				    dlimit,['bioentity', 'bioentity_label'],
				    global_galaxy_url);

    ///
    /// Ready widget.
    ///

    var handler = new amigo.handler();
    var hargs = {
	'linker': linker,
	'handler': handler,
	'base_icon_url' : null,
    	'image_type' : 'gif',
    	'layout_type' : 'two-column',
    	'show_global_reset_p' : true,
    	'show_searchbox_p' : true,
    	'show_filterbox_p' : true,
    	'show_pager_p' : true,
    	'show_checkboxes_p' : true,
    	//'show_checkboxes_p' : false,
    	//'spinner_search_source' : '',
    	'spinner_search_source' : sd.image_base() + '/waiting_ajax.gif',
    	//'spinner_shield_source' : sd.image_base() + '/waiting_poll.gif'
    	'spinner_shield_source' : sd.image_base() + '/waiting_ajax.gif'
	//
    	//'icon_clear_label' : _button_wrapper('X', 'Clear text from query'),
    	//'icon_clear_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	//'icon_reset_label' : '&nbsp;<b>[reset all user filters]</b>',
    	//'icon_remove_label' : _button_wrapper('X', 'Remove filter from query'),
    	//'icon_remove_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	//'icon_positive_label' : _button_wrapper('+', 'Add positive filter'),
    	//'icon_positive_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	//'icon_negative_label' : _button_wrapper('-', 'Add negative filter')
    	//'icon_negative_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png'
    };
    var search = new bbop.widget.search_pane(solr_server, gconf, div_id, hargs);
    // We like highlights; they should be included automatically
    // through the widget.
    search.include_highlighting(true);
    
    ///
    /// Handle setup:
    ///  1) We /need/ to have a personality defined. If not, it is an error--
    ///     we no longer do the (confusing) tabbed-switch approach.
    ///  2) Process incoming queries (into manager).
    ///  3) Process incoming bookmarks (into manager).
    ///  4) Render manager state to display.
    ///
 
    // 1) Check for incoming personality.
    // A little handling if we came in on a personality dispatch.
    if( ! global_live_search_personality ||
	global_live_search_personality == ''){
	ll('ERROR: No personality defined, cannot continue.');
	alert('ERROR: No personality defined, cannot continue.');
    }else{
	ll("Detected dispatch argument: " + global_live_search_personality);

	// _on_search_select(global_live_search_personality);
	search.set_personality(global_live_search_personality);
	search.lite(true);

	// 2) Process incoming queries (into manager).
	// Check to see if we have an incoming query (likely the landing page).
	if( global_live_search_query ){ // has incoming query
    	    ll("Try and use incoming query (set default): " +
	       global_live_search_query);
    	    search.set_comfy_query(global_live_search_query);
	    //var def_comfy = search.set_comfy_query(global_live_search_query);
    	    //search.set_default_query(def_comfy);	    
    	    //search.set_query(def_comfy);	    
	}

	// 3) Process incoming bookmarks (into manager).
	// Check to see if we have a bookmark or not. If we have one, run
	// it.
	if( global_live_search_bookmark ){ // has bookmark
	    ll("Try and use bookmark in establishment.");
	    
	    // Load it and see what happens.
	    var parm_list = 
		bbop.core.url_parameters(global_live_search_bookmark);
	    //alert(bbop.core.dump(parm_list));
	    var bookmark_probe = bbop.core.hashify(parm_list);
	    //alert(bbop.core.dump(bookmark_probe));
	    
	    // Sanity check.
	    if( ! bookmark_probe['personality'] || // bookmark is bad
		bookmark_probe['json.nl'] != 'arrarr' ||
		bookmark_probe['wt'] != 'json' ){ //||
			//! bookmark_probe['document_category'] ){
			
		    ll("Bookmark lacks sanity.");
		    alert('ERROR: Bookmark did not include a personality, ' +
			  'and sanity. ' +
			  'Please remove the bookmark parameter from the URL.');
	    }else{ // probably good bookmark
		ll("Bookmark has a personality: "+search.get_personality());
		
		// Load bookmark.
		ll("Pre bookmark: " + search.get_query_url());
		ll(global_live_search_bookmark);
		ll("Pre-bookmark personality: "+search.get_personality());
		search.load_url(global_live_search_bookmark);
		ll("Post-bookmark personality: "+search.get_personality());
		ll("Post bookmark: " + search.get_query_url());
	    }
	}else{ // no bookmark
	    ll("No bookmark in establishment.");
	} 

	// 4) Render manager state to display.
	// Run through our pre-defined activation functions
	var activation_fun = active_classes[search.get_personality()];
	activation_fun(search);
	// Establish the display with what we have.
    	search.establish_display();
	search.search();
	//ll("Post establish: " + search.get_query_url());
		    
	// Make sure the text query is there and proper.
	// Remember, we don't refresh it off of search like the others
	// because it needs persistance for the UI.
	ll("Post query: " + search.get_query());
	ll("Post default query: " + search.get_default_query());
	if( search.get_query() == search.get_default_query() ){
	    // The default is the same as nothing at all since it is
	    // default.
	    search.set_query_field_text('');
	}else{
	    // Wild cards are set after the fact in comfy, so just
	    // remove the wildcard if it is sitting there at the end.
	    var gq = search.get_query();
	    if( '*' == gq.charAt(gq.length - 1) ){
		gq = gq.substring(0, gq.length - 1);		
	    }
	    search.set_query_field_text(gq);
	}
		    
	// Destroy the bookmark so we don't keep hitting it.
	global_live_search_bookmark = null;

    }
 
    // Done message.
    ll('LiveSearchGOlrInit done.');
    
    // DEBUGGING: A temporary external hook to help with dev and
    // debugging.
    s = search;
}
var s;
