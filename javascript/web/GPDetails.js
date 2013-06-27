////
//// A lot of the commented out stuff in the other completely gone here.
////

//
function GPDetailsInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('GP: ' + str); }    

    ll('');
    ll('GPDetails.js');
    ll('GPDetailsInit start...');

    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // Tabify the layout if we can (may be in a non-tabby version).
    var dtabs = jQuery("#display-tabs");
    if( dtabs ){
	ll('Apply tabs...');
	jQuery("#display-tabs").tabs();
	jQuery("#display-tabs").tabs('option', 'active', 0);
    }
    
    // Ready the configuration that we'll use.
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var sd = new amigo.data.server();
    var solr_server = sd.golr_base();

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var linker = new amigo.linker();
    var handler = new amigo.handler();
    var gps_args = {
	'linker': linker,
	'handler': handler,
	'spinner_search_source' : sd.image_base() + '/waiting_ajax.gif'
    };
    var gps = new bbop.widget.search_pane(solr_server, gconf,
					  'display-associations',
					  gps_args);
    // Set the manager profile.
    gps.set_personality('bbop_ann'); // profile in gconf
    gps.include_highlighting(true);

    // Two sticky filters.
    gps.add_query_filter('document_category', 'annotation', ['*']);
    gps.add_query_filter('bioentity', global_acc, ['*']);

    // Global download properties.
    var _dl_props = {
	'entity_list': null,
	'rows': 7500
    };
    // Add buttons before we go live.
    var id_download_button =
	{
	    label: 'Download term IDs (up to 7500)',
	    diabled_p: false,
	    text_p: false,
	    icon: 'ui-icon-document',
	    click_function_generator: function(manager){
		return function(event){
		    _dl_props['entity_list'] = gps.get_selected_items();
		    var raw_gdl = gps.get_download_url(['annotation_class'], _dl_props);
		    window.open(raw_gdl, '_blank');
		    // new bbop.widget.dialog('Download: <a href="' + raw_gdl +
		    // 			   '" title="Download ID list."'+
		    // 			   '>ID list</a> ' + 
		    // 			   '(max. 7500 lines).');
		};
	    }
	};
    gps.add_button(id_download_button);

    // Get the interface going.
    gps.establish_display();
    gps.reset();

    //
    ll('GPDetailsInit done.');
}
