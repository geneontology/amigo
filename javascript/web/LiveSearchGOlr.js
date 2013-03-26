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
		manager.clear_buttons();
		manager.add_button(gaf_download_button);
		manager.add_button(gaf_galaxy_button);
		manager.add_button(bookmark_button);
	    }
	},
	{
	    id: 'bbop_ont',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
					 'ontology_class', ['*']);
		manager.clear_buttons();
		manager.add_button(id_download_button);
		manager.add_button(bookmark_button);
	    }
	},
	{
	    id: 'bbop_bio',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
					 'bioentity',['*']);
		manager.clear_buttons();
		manager.add_button(id_download_button);
		manager.add_button(bookmark_button);
	    }
	},
	{
	    id: 'bbop_ann_ev_agg',
	    on_click: function(manager){
    		manager.add_query_filter('document_category',
    					 'annotation_evidence_aggregate',['*']);
		manager.clear_buttons();
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

    // var dtabs = jQuery("#display-tabs");
    // if( dtabs ){
    // 	ll('Apply tabs...');
    // 	jQuery("#display-tabs").tabs();
    // 	//dtabs.tabs();
    // 	jQuery("#display-tabs").tabs('select', 0);
    // }

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

    var _gaf_fl = [
	'source', // c1
	//'bioentity', // c2
	'bioentity_internal_id', // c2
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

    var id_download_button =
	{
	    label: 'Download IDs (up to 5000)',
	    diabled_p: false,
	    text_p: false,
	    icon: 'ui-icon-document',
	    click_function_generator: function(manager){
		return function(event){
		    var raw_gdl =
			search.get_download_url(['id'], {'rows': 5000});
		    // Aaand encodeURI is a little overzealous on
		    // our case, so we turn our %09, which it
		    // turned into %2509, back into %09.
		    var gdl = encodeURI(raw_gdl).replace(/\%2509/g, '%09');
		    new bbop.widget.dialog('Download: <a href="' + gdl +
					   '" title="Download ID list."'+
					   '>ID list</a> ' + 
					   '(max. 5000 lines).');
		};
	    }
	};
    var gaf_download_button =
	{
	    label: 'GAF chunk download (up to 5000)',
	    diabled_p: false,
	    text_p: false,
	    icon: 'ui-icon-document',
	    click_function_generator: function(manager){
		return function(event){
		    var raw_gdl =
			search.get_download_url(_gaf_fl, {'rows': 5000});
		    // Aaand encodeURI is a little overzealous on
		    // our case, so we turn our %09, which it
		    // turned into %2509, back into %09.
		    var gdl = encodeURI(raw_gdl).replace(/\%2509/g, '%09');
		    new bbop.widget.dialog('Download: <a href="' + gdl +
					   '" title="Download GAF chunk."'+
					   '>GAF chunk</a> ' + 
					   '(max. 5000 lines).');
		};
	    }
	};
    var gaf_galaxy_button =
	{
	    label: 'Send GAF chunk to Galaxy (up to 5000)',
	    diabled_p: false,
	    text_p: false,
	    icon: 'ui-icon-mail-closed',
	    click_function_generator: function(manager){
		return function(event){

		    // The global_galaxy_url variable should already be
		    // defined for us and ready to rock (thanks perl
		    // AmiGO!).

		    // // Try and find a Galaxy--remote gets preference.
		    // var use_galaxy = null;
		    // if( global_galaxy_url && global_galaxy_url != "" ){
		    // 	use_galaxy = global_galaxy_url;
		    // }else{
		    // 	var amigo_galaxy = sd.galaxy_base();
		    // 	if( amigo_galaxy_url && amigo_galaxy_url != "" ){
		    // 	    use_galaxy = amigo_galaxy_url;
		    // 	}
		    // }

		    // If we have something, construct a form
		    if( ! global_galaxy_url || global_galaxy_url == "" ){
			alert('Sorry: could not find a usable Galaxy.');
		    }else{
			// We have a galaxy, so let's try and kick out
			// to it. Cribbing from Gannet.
			var input_su =
			    new bbop.html.input({name: 'submit',
						 type: 'submit',
						 value: 'all fields'});
			var input_um =
			    new bbop.html.input({name: 'URL_method',
						 type: 'hidden',
						 value: 'get'});

			// See GAF download button for more info.
			var raw_gdl =
			    search.get_download_url(_gaf_fl, {'rows': 5000});
			var gdl = encodeURI(raw_gdl).replace(/\%2509/g, '%09');

			var input_url =
			    new bbop.html.input({name: 'URL',
						 type: 'hidden',
						 //value: raw_gdl});
						 value: gdl});

			var form =
			    new bbop.html.tag('form',
					      {
						  id: 'galaxyform',
						  name: 'galaxyform',
						  method: 'POST',
						  target: '_blank',
						  action: global_galaxy_url
					      },
					      [input_su, input_um, input_url]
					     );
			
			// Finally, bang out what we've constructed in
			// a form.
			new bbop.widget.dialog('Export to Galaxy: ' +
					       form.to_string());
		    }
		};
	    }
	};
    var bookmark_button =
	{
	    label: 'Show URL/bookmark',
	    diabled_p: false,
	    text_p: false,
	    icon: 'ui-icon-link',
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
	};

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
    	'icon_clear_label' : '&nbsp;<b>[clear search]</b>',
    	//'icon_clear_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	'icon_reset_label' : '&nbsp;<b>[reset all user filters]</b>',
    	'icon_remove_label' : '<b>[&nbsp;X&nbsp;]</b>',
    	//'icon_remove_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	'icon_positive_label' : '<b>[&nbsp;+&nbsp;]</b>',
    	//'icon_positive_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png',
    	'icon_negative_label' : '<b>[&nbsp;-&nbsp;]</b>'
    	//'icon_negative_source' : 'http://amigo2.berkeleybop.org/amigo2/images/warning.png'
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
	    ll("Post bookmark: " + search.get_query_url());

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
