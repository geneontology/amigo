////
//// Render pretty numbers!
////

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;
var gserv_download = amigo.data.server.golr_download_base;
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

function BaseStatisticsInit(){
    
    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    // Manager creation wrapper (we use it a couple of times).
    function _create_manager(){

	// Create manager.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var manager = new golr_manager(gserv, gconf, engine, 'async');

	// Manager settings.
	var personality = 'ontology';
	var confc = gconf.get_class(personality);
	manager.set_personality(personality);
	manager.add_query_filter('document_category',
				 confc.document_category(), ['*']);

	return manager;	
    }

    // TODO: 
}

///
///
///

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ BaseStatisticsInit(); });
})();
