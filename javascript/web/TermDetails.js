////
//// A lot of the commented out stuff in the other completely gone here.
////


// Logger.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('TD: ' + str); }    
// AmiGO helper.
var sd = new amigo.data.server();

//
function TermDetailsInit(){

    ll('');
    ll('TermDetails.js');
    ll('TermDetailsInit start...');

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

    // Ready the configuration that we'll use.
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var solr_server = sd.golr_base();

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var gps = new bbop.widget.search_pane(solr_server, gconf,
					  'display-associations',
					  {});
    // Set the manager profile.
    gps.set_personality('bbop_ann'); // profile in gconf
    gps.include_highlighting(true);

    // Two sticky filters.
    gps.add_query_filter('document_category', 'annotation', ['*']);
    gps.add_query_filter('isa_partof_closure', global_acc, ['*']);

    // Get the interface going.
    gps.establish_display();
    gps.reset();

    //
    ll('TermDetailsInit done.');
}
