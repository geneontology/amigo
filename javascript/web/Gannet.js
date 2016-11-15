////
//// For now, a simple hook into Gannet once live. Just three lines, so
//// will probably leave DEBUG in.
////

var bbop = require('bbop-core');

// // Config.
// var amigo = new (require('amigo2-instance-data'))(); // no overload
// var golr_conf = require('golr-conf');
// var gconf = new golr_conf.conf(amigo.data.golr);
// var sd = amigo.data.server;
// var gserv = amigo.data.server.golr_base;
// var defs = amigo.data.definitions;
// // Linker.
// var linker = amigo.linker;
// // Handler.
// var handler = amigo.handler;
// // Management.
// var jquery_engine = require('bbop-rest-manager').jquery;
// var golr_manager = require('bbop-manager-golr');
// var golr_response = require('bbop-response-golr');

//
function GannetInit(){

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Aliases.
    var hashify = bbop.hashify;
    var get_keys = bbop.get_keys;

    // Helper: dedupe a list.
    function dedupe(list){
	var retlist = [];
	if( list && list.length > 1 ){
	    retlist = get_keys(hashify(list));
	}
	return retlist;
    }

    //ll('');
    ll('GannetInit start...');

    // // Make unnecessary things roll up.
    // amigo.ui.rollup(["inf01", "inf02", "inf03"]);

    // GOlr: Enter things from pulldown into textarea on change.
    jQuery("#" + "gannet_golr_example_selection").change(
	function(){
	    var semi_solr = jQuery(this).val();
	    //ll('semi_solr: ' + semi_solr);
	    jQuery("#" + "query").val(semi_solr);
	});

    // TODO: scan and add things to the page.
    // Check to see if a results-only id shows up.
    var results_ping = jQuery("#" + "results_generated");
    if( results_ping && results_ping.attr('id') ){
	ll('Looks like a results page.');
    }else{
	ll('Looks like a starting page.');
    }

    ll('GannetInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ GannetInit(); });
})();
