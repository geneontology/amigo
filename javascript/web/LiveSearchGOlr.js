////
//// A full take on a production live search for GOlr--try and make it
//// work directly off of the server for giggles/testing.
//// 
//// TODO/BUG: Right now, all of the searches are hard coded with a
//// shared agreement with the server. This needs to be changed to an
//// automatically generated jQuery search selector with no server
//// secret--it should be fairly easy to do, but later when I get a
//// chance...
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
    var search = new bbop.widget.search_pane(solr_server, gconf, div_id);
    search.set_personality('bbop_ann'); // profile in gconf
    search.include_highlighting(true); // like highlights; automatic in widget
    // We still need this, because without, we end up with a lot of
    // stray fields where automatic controls fail.
    search.add_query_filter('document_category', 'annotation', ['*']);

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

    // Turn them into a jQuery button set and make them active.
    jQuery("#search_radio").buttonset();
    var loop = bbop.core.each;
    loop(['bbop_ann', 'bbop_ont', 'bbop_bio', 'bbop_ann_ev_agg'],
    	 function(cclass_id){
    	     var c = '#' + cclass_id;
    	     jQuery(c).click(_on_search_select);
    	 });

    // Initialze/establish the display.
    search.establish_display();

    // Done message.
    ll('LiveSearchGOlrInit done.');
}
