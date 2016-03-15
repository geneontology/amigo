////
//// A general set to get the search box at the top of most pages
//// going.
////

var bbop = require('bbop-core');
var bbop_widget_set = require("bbop-widget-set");

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var gserv = amigo.data.server.golr_base;
// Linker.
var linker = amigo.linker;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');


function GeneralSearchForwardingInit(){
    
    // For debugging.
    var logger = new bbop.logger('GSF: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    var wired_name = 'gsf-query';

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
    
    ///
    /// This next section is dedicated getting the autocomplete (and
    /// associated toggle) working.
    ///

    //
    jQuery('input:submit').prop('disabled', false);

    // Widget, default personality and filter.
    function forward(doc){

	if( doc && doc['entity'] && doc['category'] ){

	    // Erase any val, change the placeholder (to try and
	    // prevent races where the user selects and then hits
	    // "search" before the forwarding finishes).
	    jQuery('#' + wired_name).val('');
	    jQuery('#' + wired_name).attr('placeholder', 'Forwarding to ' +
					  doc['entity'] + '...');

	    // Forward to the new doc.
	    if( doc['category'] === 'ontology_class' ){
		window.location.href =
		    linker.url(doc['entity'], 'term');
	    }else if( doc['category'] === 'bioentity' ){
		window.location.href = linker.url(doc['entity'], 'gp');
	    }
	}
    }

    // Set for the initial search box autocompleter.
    var general_args = {
	'fill_p': false,
	'label_template':
	'{{entity_label}} ({{entity}})',
	'value_template': '{{entity}}',
	'list_select_callback': forward
    };

    // Manager setup.
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    //var confc = gconf.get_class('noctua_model_meta');
    manager.set_personality('general'); // profile in gconf
    manager.add_query_filter('document_category', 'general');
    manager.add_query_filter('category', 'family', ['-']);
    // manager.set_personality('noctua_model_meta');
    // manager.add_query_filter('document_category',
    // 			     confc.document_category(), ['*']);    
    // manager.set_results_count(1000);

    // Actually initialize the widget.
    var auto = new bbop_widget_set.autocomplete_simple(manager, gserv, gconf,
						       wired_name, general_args);

}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ GeneralSearchForwardingInit(); });
})();

