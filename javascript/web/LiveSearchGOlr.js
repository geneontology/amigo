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
// AmiGO helper.
var sd = new amigo.data.server();

//
function LiveSearchGOlrInit(){

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
    var solr_server = sd.golr_base();

    ///
    /// Ready starting manager.
    ///

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var gm_gen = new bbop.golr.manager.jquery(solr_server, gconf);
    gm_gen.set_personality('bbop_ann'); // profile in gconf
    gm_gen.include_highlighting(true); //

    // We still need this, because without, we end up with a lot of
    // stray fields where automatic controls fail.
    gm_gen.add_query_filter('document_category', 'annotation', ['*']);

    ///
    /// Enable search class switching.
    /// 

    // Process to switch the search into a different type.
    function _on_search_select(){
	var cid = jQuery(this).attr('id');

	// Make sure whatever sitcky whas there is gone.
	gm_gen.remove_query_filter('document_category', 'annotation', ['*']);
	gm_gen.remove_query_filter('document_category','ontology_class',['*']);
	gm_gen.remove_query_filter('document_category', 'bioentity',['*']);
	gm_gen.remove_query_filter('document_category',
				   'annotation_evidence_aggregate', ['*']);

	gm_gen.set_personality(cid);
	if( cid == 'bbop_ann' ){
	    gm_gen.add_query_filter('document_category', 'annotation', ['*']);
	}else if( cid == 'bbop_ont' ){
	    gm_gen.add_query_filter('document_category','ontology_class',['*']);
	}else if( cid == 'bbop_bio' ){
	    gm_gen.add_query_filter('document_category', 'bioentity',['*']);
	}else if( cid == 'bbop_ann_ev_agg' ){
	    gm_gen.add_query_filter('document_category',
				    'annotation_evidence_aggregate', ['*']);
	}
	_create_display(cid);
    }

    // Turn them into a jQuery button set and make them active.
    jQuery("#search_radio").buttonset();
    var loop = bbop.core.each;
    loop(['bbop_ann', 'bbop_ont', 'bbop_bio', 'bbop_ann_ev_agg'],
	 function(cclass_id){
	     var c = '#' + cclass_id;
	     jQuery(c).click(_on_search_select);
	 });

    ///
    /// Ready the actuall drawing callbacks.
    ///

    function _create_display(cclass){
	
	var div_id = 'display-general-search';
	jQuery('#' + div_id).empty();

	// Create a two column layout and a lot of hidden switches and
	// variables.
	var ui_gen =
	    new bbop.widget.live_search(div_id, gconf.get_class(cclass));

	///
	/// Setup and bind them together.
	///
	
	// Setup the gross frames for the filters and results.
	ui_gen.setup_query();
	ui_gen.setup_reset_button();
	ui_gen.setup_current_filters();
	ui_gen.setup_accordion();
	ui_gen.setup_results({'meta': true});
	
	// Things to do on every reset event. Essentially re-draw
	// everything.
	gm_gen.register('reset', 'reset_query', ui_gen.reset_query, -1);
	gm_gen.register('reset', 'rereset_button',ui_gen.reset_reset_button,-1);
	gm_gen.register('reset', 'curr_first', ui_gen.draw_current_filters, -1);
	gm_gen.register('reset', 'accordion_first', ui_gen.draw_accordion, -1);
	gm_gen.register('reset', 'meta_first', ui_gen.draw_meta, -1);
	gm_gen.register('reset', 'results_first', ui_gen.draw_results, -1);
	
	// Things to do on every search event.
	gm_gen.register('search','curr_filters_std',
			ui_gen.draw_current_filters);
	gm_gen.register('search', 'accordion_std', ui_gen.draw_accordion);
	gm_gen.register('search', 'meta_usual', ui_gen.draw_meta);
	gm_gen.register('search', 'results_usual', ui_gen.draw_results);
	
	// Things to do on an error.
	gm_gen.register('error', 'results_unusual', ui_gen.draw_error);
	
	// Start the ball with a reset event.
	gm_gen.reset();
    }
    _create_display('bbop_ann');

    //
    ll('LiveSearchGOlrInit done.');
}
