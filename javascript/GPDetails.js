////
//// A lot of the commented out stuff in the other completely gone here.
////


// Logger.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('TD: ' + str); }    
// AmiGO helper.
var amigo = new bbop.amigo();
var gm = new bbop.amigo.amigo_meta();

//
function GPDetailsInit(){

    ll('');
    ll('GPDetails.js');
    ll('GPDetailsInit start...');

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

    var gconf = new bbop.golr.conf(bbop.amigo.golr_meta);
    var solr_server = gm.golr_base();

    ///
    /// Manager and callbacks.
    ///

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var gm_ann = new bbop.golr.manager(solr_server, gconf);
    gm_ann.set_personality('bbop_ann'); // profile in gconf
    gm_ann.add_query_filter('document_category', 'annotation', ['*']);
    gm_ann.add_query_filter('bioentity', global_acc, ['*']);

    // Create a two column layout and a lot of hidden switches and
    // variables.
    var ui_ann = new bbop.amigo.golr_ui('display-associations',
					gconf.get_class('bbop_ann'));
    
    ///
    /// Setup and bind them together.
    ///

    // Setup the gross frames for the filters and results.
    ui_ann.setup_current_filters();
    ui_ann.setup_accordion();
    ui_ann.setup_results({'meta': true});

    // Things to do on every reset event. Essentially re-draw
    // everything.
    gm_ann.register('reset', 'curr_first', ui_ann.draw_current_filters, -1);
    gm_ann.register('reset', 'accordion_first', ui_ann.draw_accordion, -1);
    gm_ann.register('reset', 'meta_first', ui_ann.draw_meta, -1);
    gm_ann.register('reset', 'results_first', ui_ann.draw_results, -1);

    // Things to do on every search event.
    gm_ann.register('search', 'curr_filters_std', ui_ann.draw_current_filters);
    gm_ann.register('search', 'accordion_std', ui_ann.draw_accordion);
    gm_ann.register('search', 'meta_usual', ui_ann.draw_meta);
    gm_ann.register('search', 'results_usual', ui_ann.draw_results);

    // Things to do on an error.
    gm_ann.register('error', 'results_unusual', ui_ann.draw_error);

    // Start the ball with a reset event.
    gm_ann.reset();

    //
    ll('GPDetailsInit done.');
}
