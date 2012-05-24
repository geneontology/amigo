////
//// A forward-looking branch of TermDetails.js
//// A lot of the commented out stuff in the other completely gone here.
//// Will dev on this one until I replace the other.
////


// Logger.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('TD: ' + str); }    
// AmiGO helper.
var amigo = new bbop.amigo();
var gm = new bbop.amigo.go_meta();

//
function TermDetailsInit(){

    ll('');
    ll('TermDetailsBeta.js');
    ll('TermDetailsInit start...');

    // var prev_source_count = 0;
    // var prev_species_count = 0;

    // Bring in meta information.
    var species_data = gm.species();
    var source_data = gm.sources();

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

    var gconf = new bbop.golr.conf(bbop.golr.golr_meta);
    var cclass = gconf.get_class('bbop_ann');    
    var filter_order = cclass.field_order_by_weight('filter');

    ///
    /// Manager and callbacks.
    ///

    var solr_server = gm.golr_base();
    var gm_ann = new GOlrManager({url: solr_server,
    				  filters: {'document_category':
					    'annotation', 
					    'isa_partof_closure' :
					    global_acc},
    				  facets: ['type', 'taxon', 'source',
    					   'evidence_type',
					   'annotation_extension_class',
					   'isa_partof_label_closure']});
    var ui_ann = new GOlrUIBeta({'interface_id': 'display-associations',
				 'class_conf': cclass});

    // // ...
    // function _peg_q(){
    // 	jQuery("#" + "display-associations_ui_element_q").val("\"" +
    // 							      global_label +
    // 							      "\"");
    // 	jQuery("#" + "display-associations_ui_element_q").keyup();
    // }

    ///
    /// Setup and bind them together.
    ///

    // Class/term init.
    // gm_ann.register('reset', 'control_init_q',
    // 		    ui_ann.make_filter_controls_frame, 0);
    // Setup the gross frames for the filters and results.
    ui_ann.setup_filters();
    ui_ann.setup_results();
    ui_ann.setup_meta(); // meta is nested inside something created
			 // for results, so it comes after.

    // Things to do on every reset event.
    //gm_ann.register('reset', 'results_init', ui_ann.make_results_frame, -2);
    gm_ann.register('reset', 'filters_first', ui_ann.draw_filters);
    gm_ann.register('reset', 'meta_first', ui_ann.draw_meta);
    gm_ann.register('reset', 'results_first', ui_ann.draw_results);
    // gm_ann.register('reset', 'results_init_after', _peg_q, -4);

    // Things to do on every search event.
    gm_ann.register('search', 'controls_usual', ui_ann.draw_filters);
    gm_ann.register('search', 'meta_usual', ui_ann.draw_meta);
    gm_ann.register('search', 'results_usual', ui_ann.draw_results);

    // Whenever there is a user interface actions, trigger a model
    // search.
    ui_ann.register('action', 'ui_action', gm_ann.search);

    // Start the ball with a reset.
    gm_ann.reset();

    //
    ll('TermDetailsInit done.');
}
