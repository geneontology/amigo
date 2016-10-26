////
//// Get all PMIDs for experimental human annotations to "neuron
//// development".
////
//// Get necessary libs with:
////  npm install amigo2-instance-data underscore golr-conf bbop-rest-manager bbop-manager-golr bbop-response-golr
////
//// Run with:
////  node ./amigo-data-demo-02.js
////

// Helper.
var us = require('underscore');

// Get AmiGO 2 public instance data.
var amigo = new (require('amigo2-instance-data'))();
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var gserv = amigo.data.server.golr_base;

// Get the engine and manager ready.
var impl_engine = require('bbop-rest-manager').node;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');
var engine = new impl_engine(golr_response);
//engine.method('GET');
//engine.use_jsonp(true);
var manager = new golr_manager(gserv, gconf, engine, 'async');

// Set personality (boost selection) and document that we want.
manager.set_personality('annotation');
manager.add_query_filter('document_category', 'annotation', ['*']);

// Let's make sure we get all the results we want.
manager.set_results_count(999999999);

// Set what we want our filters to be.
manager.add_query_filter('regulates_closure', 'GO:0048666');
manager.add_query_filter('taxon_subset_closure', 'NCBITaxon:9606');
manager.add_query_filter('evidence_subset_closure', 'ECO:0000006');

// Trigger promise manager system and wait for success to get at our
// response.
console.log('Start lookup.')
var promise = manager.search();
promise.then(function(resp){

    // Process our response instance using bbop-response-golr.
    if( resp.success() ){
	console.log('Heard back from the GOlr server!')

	// Look at all the docs we got back.
	us.each(resp.documents(), function(doc){

	    // Slightly contrived use if resp.get_doc_field().
	    var id = doc['id'];
	    var refs = resp.get_doc_field(id, 'reference');
	    console.log(refs.join("\n"));
	});
    }

    console.log('All done.')
});

console.log('Wait to hear back from the server.')
