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
    var defs = new amigo.data.definitions();
    var solr_server = sd.golr_base();

    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var linker = new amigo.linker();
    var handler = new amigo.handler();
    var gps_args = {
	'linker': linker,
	'handler': handler,
    	'spinner_shield_message' : 'Loading and using this widget may take a long time on some large filter sets. If it takes too long, please close it and further narrow your results using other facets or the text search.<br />Waiting...',
	'spinner_search_source' : sd.image_base() + '/waiting_ajax.gif'
    };
    var gps = new bbop.widget.search_pane(solr_server, gconf,
					  'display-associations',
					  gps_args);
    // Set the manager profile.
    gps.set_personality('annotation'); // profile in gconf
    gps.include_highlighting(true);

    // Two sticky filters.
    gps.add_query_filter('document_category', 'annotation', ['*']);
    gps.add_query_filter('bioentity', global_acc, ['*']);

    // Download limit.
    var dlimit = defs.download_limit();

    // Add a term id download button.
    var btmpl = bbop.widget.display.button_templates;
    // var id_download_button =
    // 	btmpl.field_download('Download term IDs (up to ' + dlimit + ')',
    // 			     dlimit, ['annotation_class']);
    // gps.add_button(id_download_button);
     var bio_flex_download_button =
	btmpl.flexible_download('Flex download (up to ' + dlimit + ')',
				dlimit,
				['bioentity', 'bioentity_label'],
				'bioentity',
				gconf);   
    gps.add_button(bio_flex_download_button);

    // Experiment.
    // Process incoming queries, pins, and filters (into
    // manager)--the RESTy bookmarking API.
    if( global_live_search_query ){ //has incoming query
    	ll("Try and use incoming query (set default): " +
	   global_live_search_query);
    	gps.set_comfy_query(global_live_search_query);
    }
    if( bbop.core.is_array(global_live_search_filters) ){ //has incoming filters
	bbop.core.each(global_live_search_filters,
		       function(filter){
			   gps.add_query_filter_as_string(filter, ['$']);
		       });
    }
    if( bbop.core.is_array(global_live_search_pins) ){ //has incoming pins
	bbop.core.each(global_live_search_pins,
		       function(pin){
			   gps.add_query_filter_as_string(pin, ['*']);
		       });
    }

    // Get the interface going.
    gps.establish_display();
    //gps.reset();
    gps.search();

     ///
    /// Create a bookmark for searching annotations and
    /// bioentities with this term. Generate links and activate
    /// hidden stubs in the doc.
    ///

    jQuery('#prob_related').removeClass('hidden');

    // Get bookmark for annotations.
    (function(){
	 // Ready bookmark.
	 var man = new bbop.golr.manager.jquery(solr_server, gconf);
	 man.set_personality('annotation');
	 man.add_query_filter('document_category', 'annotation', ['*']);
	 man.add_query_filter('bioentity', global_acc);
	 var lstate = man.get_filter_query_string();
	 var lurl = linker.url(lstate, 'search', 'annotation');
	 // Add it to the DOM.
	 jQuery('#prob_ann_href').attr('href', lurl);
	 jQuery('#prob_ann').removeClass('hidden');
     })();
    
    // Get bookmark for annotation download.
    (function(){
	 // Ready bookmark.
	 var man = new bbop.golr.manager.jquery(solr_server, gconf);
	 man.set_personality('annotation');
	 man.add_query_filter('document_category', 'annotation', ['*']);
	 man.add_query_filter('bioentity', global_acc);
	 var dstate = man.get_download_url(defs.gaf_from_golr_fields(),
					   {
					       'rows': dlimit,
					       'encapsulator': ''
					   });
	 jQuery('#prob_ann_dl_href').attr('href', dstate);
	 jQuery('#prob_ann_dl').removeClass('hidden');
     })();

    //
    ll('GPDetailsInit done.');
}
