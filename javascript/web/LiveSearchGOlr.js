////
//// A full take on a production live search for GOlr--try and make it
//// work directly off of the server for giggles/testing.
//// 
//// TODO/BUG: Right now, it's just working off of a filterless
//// annotation personality, but we need to add a general search
//// personality (with document_category free) at some point.
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
    /// Manager and callbacks.
    ///

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var gm_gen = new bbop.golr.manager.jquery(solr_server, gconf);
    gm_gen.set_personality('bbop_ann'); // profile in gconf
    gm_gen.include_highlighting(true); //

    // We still need this, because without, we end up with a lot of
    // stray fields where automatic controls fail.
    gm_gen.add_query_filter('document_category', 'annotation', ['*']);

    // Create a two column layout and a lot of hidden switches and
    // variables.
    var ui_gen = new amigo.ui.livesearch('display-general-search',
					 gconf.get_class('bbop_ann'));

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
    gm_gen.register('reset', 'rereset_button', ui_gen.reset_reset_button, -1);
    gm_gen.register('reset', 'curr_first', ui_gen.draw_current_filters, -1);
    gm_gen.register('reset', 'accordion_first', ui_gen.draw_accordion, -1);
    gm_gen.register('reset', 'meta_first', ui_gen.draw_meta, -1);
    gm_gen.register('reset', 'results_first', ui_gen.draw_results, -1);

    // Things to do on every search event.
    gm_gen.register('search', 'curr_filters_std', ui_gen.draw_current_filters);
    gm_gen.register('search', 'accordion_std', ui_gen.draw_accordion);
    gm_gen.register('search', 'meta_usual', ui_gen.draw_meta);
    gm_gen.register('search', 'results_usual', ui_gen.draw_results);

    // Things to do on an error.
    gm_gen.register('error', 'results_unusual', ui_gen.draw_error);

    // Start the ball with a reset event.
    gm_gen.reset();

    //
    ll('LiveSearchGOlrInit done.');
}
