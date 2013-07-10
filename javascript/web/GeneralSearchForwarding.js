////
//// A twiddle to see if I can get Google Charts and BBOP playing
//// nicely. They seem to want to fight over the initialization.
////
//// Trying to let Google win--when it doesn't it seems to throw a fit
//// and redirect to nothingness. WTF, Google?
////

function GeneralSearchForwardingInit(){
    
    // For debugging.
    var logger = new bbop.logger('GSF: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    // Make unnecessary things roll up, need custom code since the
    // header search is a strange space.
    var eltid = 'gsf01';
    //var einfo = '#' + eltid + ' > div';
    var einfo = '#' + eltid + '-info';
    var earea = '#' + eltid + ' > span > a';
    if( jQuery(einfo) && jQuery(einfo).length && jQuery(einfo).length > 0 ){
	jQuery(einfo).hide();
	var click_elt =
	    jQuery(earea).click(function(){
				    jQuery(einfo).toggle("blind",{},250);
				    return false;
				});
    }
    
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
    auto.set_personality('bbop_general'); // profile in gconf
    auto.add_query_filter('document_category', 'general');
    auto.add_query_filter('category', 'family', ['-']);
}
