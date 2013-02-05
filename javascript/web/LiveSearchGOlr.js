////
//// A full take on a production live search for GOlr.
//// It ends up being a light wrapping around the search_pane widget.
//// 

// Logger.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('LS: ' + str); }    

//
function LiveSearchGOlrInit(){

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
			    'source',
			    // 'bioentity_internal_id',
			    'bioentity_label',
			    //'qualifier',
			    'annotation_class',
			    'reference',
			    'evidence_type',
			    'evidence_with',
			    // 'aspect',
			    // 'bioentity_name',
			    // 'bioentity_synonym',
			    // 'type',
			    'taxon',
			    'date',
			    // 'assigned_by',
			    'annotation_extension_class',
			    'bioentity'
			];
			//alert('GAF download: ' + manager.get_query_url());
			alert('GAF download (1000 lines): ' +
			      search.get_download_url(fl));
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
			alert('URL: ' +
			      search.get_query_url());
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
    function _on_search_select(){
	// Recover the 'id' of the clicked element.
    	var cid = jQuery(this).attr('id');

    	// Make sure whatever sticky filters we had are completely
    	// gone.
	// TODO/BUG: make this more generic.
    	search.remove_query_filter('document_category', 'annotation',['*']);
    	search.remove_query_filter('document_category','ontology_class',['*']);
    	search.remove_query_filter('document_category', 'bioentity',['*']);
    	search.remove_query_filter('document_category',
    				   'annotation_evidence_aggregate',['*']);

	// Find the click class in the set of active classes.
	var active_class = null;
	loop(active_classes,
	     function(acls, index){
		 if( acls['id'] == cid ){
		     active_class = acls[index];
		 }
	     });

	// If we found it, set personality, run the stored function,
	// and then establish/reset display.
	if( ! active_class ){
	    alert('ERROR: Could not find class: ' + cid);
	}else{
    	    search.set_personality(cid);
	    var run_fun = active_class['on_click'];
	    run_fun(search);
    	    search.establish_display();
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

    // Click the first one in the radio row to start. This will
    // hopefully add the necessary personality and trigger the
    // establishment of the interface.
    jQuery('#' + active_classes[0]['id']).click();

    // Done message.
    ll('LiveSearchGOlrInit done.');
}
