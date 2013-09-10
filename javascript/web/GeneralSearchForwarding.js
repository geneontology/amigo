////
//// A general set to get the search box at the top of most pages
//// going.
////

function GeneralSearchForwardingInit(){
    
    // For debugging.
    var logger = new bbop.logger('GSF: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {
	'position': {'my': 'left+5 top', 'at': 'right top'},
	'tooltipClass': 'amigo-searchbar-tooltip-style'
    };
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // // Activate hint/tooltop via Bootstrap.
    // // var jquitt = jQuery.fn.tooltip.noConflict();
    // jQuery("#gsf-query").tooltip({'container': 'body',
    // 				  'placement': 'left',
    // 				  'title': 'foo'});
    // //jQuery("#foofoo").tooltip();
    // // jQuery.fn.tooltip = jquitt;

    // // Make unnecessary things roll up, need custom code since the
    // // header search is a strange space.
    // var eltid = 'gsf01';
    // //var einfo = '#' + eltid + ' > div';
    // var einfo = '#' + eltid + '-info';
    // var earea = '#' + eltid + ' > span > a';
    // if( jQuery(einfo) && jQuery(einfo).length && jQuery(einfo).length > 0 ){
    // 	jQuery(einfo).hide();
    // 	var click_elt =
    // 	    jQuery(earea).click(function(){
    // 				    jQuery(einfo).toggle("blind",{},250);
    // 				    return false;
    // 				});
    // }
    
    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var sd = new amigo.data.server(); // resource locations
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var a_widget = bbop.widget.search_box; // nick
    var linker = new amigo.linker();

    ///
    /// This next section is dedicated getting the autocomplete (and
    /// associated toggle) working.
    ///

    //
    jQuery('input:submit').prop('disabled', false);

    // Widget, default personality and filter.
    function forward(doc){
	if( doc && doc['entity'] && doc['category'] ){
	    if( doc['category'] == 'ontology_class' ){
		window.location.href =
		    linker.url(doc['entity'], 'term');
	    }else if( doc['category'] == 'bioentity' ){
		window.location.href =
		    linker.url(doc['entity'], 'gp');
	    }
	}
    }

    // Set for the initial search box autocompleter.
    var general_args = {
	'label_template':
	'{{entity_label}} ({{entity}})',
	'value_template': '{{entity}}',
	'list_select_callback': forward
    };
    var auto = new a_widget(sd.golr_base(), gconf, 'gsf-query', general_args);
    auto.set_personality('general'); // profile in gconf
    auto.add_query_filter('document_category', 'general');
    auto.add_query_filter('category', 'family', ['-']);
}
