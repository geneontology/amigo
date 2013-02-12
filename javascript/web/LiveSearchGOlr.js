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

    ///
    /// A description of the active buttons and what to do when they
    /// are clicked. Very likely the only thing that you'd have to
    /// change on this page.
    ///

    var active_classes = [
	{
	    id: 'bbop_ann', 
	    on_click: function(manager){
		manager.add_query_filter('document_category',
					 'annotation', ['*']);
	    }
	},
	{
	    id: 'bbop_ont',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
					 'ontology_class', ['*']);
	    }
	},
	{
	    id: 'bbop_bio',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
					 'bioentity',['*']);
	    }
	},
	{
	    id: 'bbop_ann_ev_agg',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
    					 'annotation_evidence_aggregate',['*']);

	    }
	}
    ];

    // Helper function to pull out class by id.
    function _get_active_class(cid){
	var retcls = null;
	loop(active_classes,
	     function(acls, index){
		 //ll("index: " + index);		 
		 //ll("acls['id']: " + acls['id']);		 
		 if( acls['id'] == cid ){
		     retcls = acls;
		 }
	     });
	return retcls;
    }

    ///
    /// Tabify the layout if we can (may be in a non-tabby version).
    ///

    var dtabs = jQuery("#display-tabs");
    if( dtabs ){
    	ll('Apply tabs...');
    	jQuery("#display-tabs").tabs();
    	//dtabs.tabs();
    	jQuery("#display-tabs").tabs('select', 0);
    }

    ///
    /// Ready the configuration that we'll use.
    ///

    var gconf = new bbop.golr.conf(amigo.data.golr);
    var sd = new amigo.data.server();
    var linker = new amigo.linker();
    var solr_server = sd.golr_base();
    var div_id = 'display-general-search';

    ///
    /// Ready widget.
    ///

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    //var search = new bbop.golr.manager.jquery(solr_server, gconf);
    var hargs = {
	'base_icon_url' : null,
    	'image_type' : 'gif',
    	'layout_type' : 'two-column',
    	'show_global_reset_p' : true,
    	'show_searchbox_p' : true,
    	'show_filterbox_p' : true,
    	'show_pager_p' : true,
    	'buttons' : [
	    {
		label: 'GAF download',
		diabled_p: false,
		text_p: false,
		icon: 'ui-icon-circle-arrow-s',
		click_function_generator: function(manager){
		    return function(event){
			var fl = [
			    'source', // c1
			    'bioentity', // c2
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
			var raw_gdl = search.get_download_url(fl);
			// Aaand encodeURI is a little overzealous on
			// our case, so we turn our %09, which it
			// turned into %2509, back into %09.
			var gdl = encodeURI(raw_gdl).replace(/\%2509/g, '%09');
			new bbop.widget.dialog('Download: <a href="' + gdl +
					       '" title="Download psuedo-GAF."'+
					       '>psuedo-GAF</a> ' + 
					       '(max. 1000 lines).');
		    };
		}
	    },
	    {
		label: 'Show URL',
		diabled_p: false,
		text_p: false,
		icon: 'ui-icon-help',
		click_function_generator: function(manager){
		    return function(event){
			//alert('GAF download: ' + manager.get_query_url());
			//alert('URL: ' + search.get_query_url());
			var raw_bookmark =
			    encodeURIComponent(search.get_state_url());
			var a_args = {
			    id: raw_bookmark,
			    label: 'this search'
			};
			new bbop.widget.dialog('Bookmark for: ' +
					       linker.anchor(a_args, 'search'));
		    };
		}
	    }
	]
    };
    var search = new bbop.widget.search_pane(solr_server, gconf, div_id, hargs);
    // We like highlights; they should be included automatically
    // through the widget.
    search.include_highlighting(true);
    
    // NOTE: We leave the rest of the configuration to the triggered
    // button click below.

    ///
    /// Enable search class switching.
    /// 

    // Process to switch the search into a different type.
    function _on_search_select(string_or_event){

	// Recover the 'id' of the clicked element if we didn't
	// already define it as a string argument. If it's not a
	// string argument, it's probably an event.
	var cid = string_or_event; // string
	if( bbop.core.what_is(string_or_event) != 'string' ){ // event
    	    cid = jQuery(this).attr('id');	    
    	    //cid = jQuery(this).val();
	}

    	// Make sure whatever sticky filters we had are completely
    	// gone.
	// TODO/BUG: make this more generic.
    	search.remove_query_filter('document_category', 'annotation',['*']);
    	search.remove_query_filter('document_category','ontology_class',['*']);
    	search.remove_query_filter('document_category', 'bioentity',['*']);
    	search.remove_query_filter('document_category',
    				   'annotation_evidence_aggregate',['*']);

	// Find the click class in the set of active classes.
	var active_class = _get_active_class(cid);

	// If we found it, set personality, run the stored function,
	// and then establish/reset display.
	if( ! active_class ){
	    alert('ERROR: Could not find class: ' + cid);
	}else{
    	    search.set_personality(cid);
	    var run_fun = active_class['on_click'];
	    run_fun(search);
    	    search.establish_display();
	    search.reset();
	}
    }

    // Turn the radio row into a jQuery button set and make them
    // active to clicks.
    jQuery("#search_radio").buttonset();
    var loop = bbop.core.each;
    loop(active_classes,
    	 function(active_class){
	     var cclass_id = active_class['id'];
    	     var c = '#' + cclass_id;
    	     jQuery(c).click(_on_search_select);
    	 });


    // First, define a helper function to try and probe various things
    // to establish what should be established--find the checked radio
    // button (from the layout) and click it, or, failing that, the
    // first one and click it.
    function _establish_default_interface(){
	    
	var checked_radio_vals = [];
	var checked_elt = null;
	jQuery("[name='" + 'search_radio' + "']:checked").each(
	    function(){
		checked_elt = jQuery(this);
		checked_radio_vals.push(checked_elt.val());
	    });
	
	if( checked_radio_vals && checked_radio_vals.length == 1 ){
	    // Find the checked radio value and click on it.
	    var clid = checked_radio_vals[0];
	    var cls = _get_active_class(clid);
	    ll("Select the checked radio value: " + cls['id']);
	    //jQuery(checked_elt).click();
	    //jQuery('#' + cls['id']).click();
	    _on_search_select(cls['id']);
	}else{
	    // Click the first defined class.
	    ll("Just select the first: " + active_classes[0]['id']);
	    //jQuery('#' + active_classes[0]['id']).click();
	    _on_search_select(active_classes[0]['id']);
	}
    }

    // Check to see if we have a bookmark or not. If we have one, run
    // it, otherwise use the default.
    if( global_live_search_bookmark ){ // has bookmark
	ll("Try and use bookmark.");

	// Load it and see what happens.
	var parm_list = 
	    bbop.core.url_parameters(global_live_search_bookmark);
	//alert(bbop.core.dump(parm_list));
	var bookmark_probe = bbop.core.hashify(parm_list);
	//alert(bbop.core.dump(bookmark_probe));

	if( ! bookmark_probe['personality'] || // book mark is bad
	    bookmark_probe['json.nl'] != 'arrarr' ||
	    bookmark_probe['wt'] != 'json' ){ //||
	    //! bookmark_probe['document_category'] ){

            ll("Bookmark lacks sanity.");
	    alert('ERROR: Bookmark did not include a personality, and sanity. '+
		  'Please remove the bookmark parameter from the URL.');
	    // Fall back onto the defaults.
	    _establish_default_interface();
	}else{ // probably good bookmark
	    //ll("Bookmark has a personality: " + search.get_personality());

	    // Load bookmark.
	    //ll("Pre bookmark: " + search.get_query_url());
	    //ll(global_live_search_bookmark);
	    //ll("Pre-bookmark personality: " + search.get_personality());
	    search.load_url(global_live_search_bookmark);
	    ll("Post-bookmark personality: " + search.get_personality());
	    ll("Post bookmark:: " + search.get_query_url());

	    // BUG/TODO: Make likely sticky things sticky.
	    //var dc = bookmark_probe['document_category'];
	    //search.add_query_filter('document_category', 'annotation', ['*']);
	    
	    // Establish the display with what we have.
    	    search.establish_display();
	    search.search();
	    //ll("Post establish: " + search.get_query_url());
	}
    }else{ // no bookmark
	ll("No bookmark");
	_establish_default_interface();
    }

    // Done message.
    ll('LiveSearchGOlrInit done.');
}
