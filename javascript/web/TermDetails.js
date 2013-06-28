////
//// A lot of the commented out stuff in the other completely gone here.
////

//
function TermDetailsInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('TD: ' + str); }    

    ll('');
    ll('TermDetails.js');
    ll('TermDetailsInit start...');

    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // Go ahead and drop in the table sorter. Easy!
    jQuery("#all-table-above").tablesorter(); 
    jQuery("#all-table-below").tablesorter(); 

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
    gps.add_query_filter('regulates_closure', global_acc, ['*']);
    //gps.add_query_filter('annotation_class', global_acc, ['*']);
    // TODO: And or this in as well.
    //gps.add_query_filter('annotation_class', global_acc, ['*']);

    // Add a bioentity download button.
    var btmpl = bbop.widget.display.button_templates;
    var id_download_button =
	btmpl.field_download('Download bioentity IDs (up to 7500)',
			     7500, ['bioentity']);
    gps.add_button(id_download_button);

    // Get the interface going.
    gps.establish_display();
    gps.reset();

    ///
    /// TODO: Create a bookmark for searching bioentities with this
    /// term and the default, and add it to the DOM at
    /// "related-terms-span".
    ///
    
    // Get bookmark.
    var relman = new bbop.golr.manager.jquery(solr_server, gconf);
    relman.set_personality('bbop_bio');
    relman.add_query_filter('document_category', 'bioentity', ['*']);
    relman.add_query_filter('regulates_closure', global_acc);
    //ll('qurl: ' + relman.get_query_url());
    var relstate = encodeURIComponent(relman.get_state_url());

    // Generate the link.
    var al = new amigo.linker();
    var hot_anchor = al.anchor({id:relstate, label:'Search'}, 'search');

    // Add it to the DOM.
    var rtid = "#related-terms-span";
    jQuery(rtid).empty();
    jQuery(rtid).append(hot_anchor + ' for <i>bioentities</i> ' +
			'that have been annotated with this term.');

    //
    ll('TermDetailsInit done.');
}
