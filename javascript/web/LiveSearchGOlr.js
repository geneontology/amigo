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
    	'show_pager_p' : true
    };
    var search = new bbop.widget.search_pane(solr_server, gconf, div_id, hargs);
    // Default profile we'll use in gconf.
    search.set_personality('bbop_ann');
    // We like highlights; they should be included automatically
    // through the widget.
    search.include_highlighting(true);
    // We still need this--without it we end up with a lot of
    // stray fields where automatic controls fail.
    search.add_query_filter('document_category', 'annotation', ['*']);
    // // DEBUG: For testing, for now, I want to limit this to 10/11.
    // search.set_default_facet_limit(10 + 1);
    // search.reset_facet_limit();

    // Initialze/establish the display.
    search.establish_display();

    ///
    /// Enable search class switching.
    /// 

    // Process to switch the search into a different type.
    function _on_search_select(){
    	var cid = jQuery(this).attr('id');

    	// Make sure whatever sitcky whas there is gone.
    	search.remove_query_filter('document_category', 'annotation', ['*']);
    	search.remove_query_filter('document_category','ontology_class',['*']);
    	search.remove_query_filter('document_category', 'bioentity',['*']);
    	search.remove_query_filter('document_category',
    				   'annotation_evidence_aggregate', ['*']);

    	search.set_personality(cid);
    	if( cid == 'bbop_ann' ){
    	    search.add_query_filter('document_category', 'annotation', ['*']);
    	}else if( cid == 'bbop_ont' ){
    	    search.add_query_filter('document_category','ontology_class',['*']);
    	}else if( cid == 'bbop_bio' ){
    	    search.add_query_filter('document_category', 'bioentity',['*']);
    	}else if( cid == 'bbop_ann_ev_agg' ){
    	    search.add_query_filter('document_category',
    				    'annotation_evidence_aggregate', ['*']);
    	}
	// Essentially reset the display after every personality
	// switch.
    	search.establish_display();
    }

    // Turn the radio row into a jQuery button set and make them
    // active.
    jQuery("#search_radio").buttonset();
    var loop = bbop.core.each;
    loop(['bbop_ann', 'bbop_ont', 'bbop_bio', 'bbop_ann_ev_agg'],
    	 function(cclass_id){
    	     var c = '#' + cclass_id;
    	     jQuery(c).click(_on_search_select);
    	 });

    // Done message.
    ll('LiveSearchGOlrInit done.');
}
