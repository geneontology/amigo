/* 
 * Package: generate_statistics_for_plotly.js
 * 
 * This is a Node.js script.
 * 
 * Generate a whole huge chunk of data for Plotly.js to work
 * with. Hard-wired to our public server.
 * 
 * Usage like:
 *  : generate_statistics_for_plotly.js --ann-source
 *  : generate_statistics_for_plotly.js --ann-evidence
 *  : generate_statistics_for_plotly.js --ann-assigned-by
 *  : generate_statistics_for_plotly.js --ann-overview-source
 *  : generate_statistics_for_plotly.js --ann-overview-assigned-by
 */

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */

// Correct environment, ready testing.
var us = require('underscore');
var bbop_legacy = require('bbop').bbop;
var bbop = require('bbop-core');
var amigo = require('amigo2');
var golr_conf = require('golr-conf');
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// A couple of possible engines for use.
var sync_engine = require('bbop-rest-manager').sync_request;
var node_engine = require('bbop-rest-manager').node;

///
/// Aliases and helpers.
///

var each = us.each;

var golr_url = 'http://golr.geneontology.org/solr/';

function ll(arg1){
    console.log('stats [' + (new Date()).toJSON() + ']: ', arg1); 
}

function _die(message){
    console.error('STATS [' + (new Date()).toJSON() + ']: ' + message);
    process.exit(-1);
}

///
/// CLI handling, environment setup, and initialization of clients.
///

// CLI handling.
var argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

// // What directory will we monitor/operate on.
// var golr_url = argv['g'] || argv['golr'];
// if( ! golr_url ){
//     _die('Option (g|golr) is required.');
// }else{
//     ll('Will operate on GOlr instance at: ' + golr_url);
// }

// Whatever shall we look for?
var run_type = argv['r'] || argv['run-type'];
if( ! golr_url ){
    _die('Option (r|run-type) is required.');
}else{
    if( run_type !== 'ann-source' &&
	run_type !== 'ann-assigned-by' &&
	run_type !== 'ann-evidence' &&
	run_type === 'ann-overview-source' &&
	run_type === 'ann-overview-assigned-by' ){
        _die('Unknown run-type.');
    }else{
	ll('Will produce: ' + run_type);
    }
}

///
/// Manager setup.
///

ll('Setting up manager.');
var gconf = new golr_conf.conf(amigo.data.golr);
var engine = new sync_engine(golr_response);
var gm_ann = new golr_manager(golr_url, gconf, engine, 'sync');

// Set ourselves to annotations.
if( ! gm_ann.set_personality('annotation') ){ // profile in gconf
    _die('There seems to have been an ERROR in the YAML loader...');
}
gm_ann.add_query_filter('document_category', 'annotation', ['*']);

// Get all the facets--everything.
gm_ann.set_facet_limit(-1);

// We will want to filter ECO a bit.
// The is for the ann-overview-* modes.
var our_ev_of_interest = [
    'similarity evidence', // okay
    'experimental evidence', // okay
    'curator inference', // okay
    'author statement',
    'combinatorial evidence',
    'genomic context evidence'
    //'biological system reconstruction',
    //'imported information'
];
	    
///
/// These two are for our "pie" chart class stuff: annotation
/// source and annotation evidence break-downs.
///

// General annotation data setup for both categories.
var resp = gm_ann.search();
var count = resp.total_documents();
var facet_list = resp.facet_field_list();
var raw_data = null;
	
// Annotation source is easy, but we want to slim evidence
// down to the slim defined above.
if( run_type === 'ann-source' ||
    run_type === 'ann-assigned-by' ||
    run_type === 'ann-evidence' ){

    if( run_type === 'ann-source' ){
	raw_data = resp.facet_field('source');
    }else if( run_type === 'ann-assigned-by' ){
	raw_data = resp.facet_field('assigned_by');
    }else if( run_type === 'ann-evidence' ){
	
	var raw_data_pre = resp.facet_field('evidence_type_closure');
	var our_ev_hash = bbop.hashify(our_ev_of_interest);
	raw_data = bbop_legacy.pare(raw_data_pre, function(item, index){
	    var ret = true;
	    if( our_ev_hash[item[0]] ){
		ret = false;
	    }
	    return ret;
	});
    }
    
    // Sort and print out whatever we got above
    if( raw_data ){	    
	raw_data.sort(function(a, b){
	    var val_a = a[1];
	    var val_b = b[1];
	    return val_b - val_a;
	});
    }
    // Print a header row, then the rest.
    ll("AXES\tCount");
    
    each(raw_data, function(line){
	ll(line[0] + "\t" + line[1]);
    });
    
}else if( run_type === 'ann-overview-source' || run_type === 'ann-overview-assigned-by' ){
    
    var ffacet = null;
    if( run_type === 'ann-overview-source' ){
	ffacet = 'source';
    }else if( run_type === 'ann-overview-assigned-by' ){
	ffacet = 'assigned_by';	    
    }else{
	_die('borked!');
    }
    
    ///
    /// This is a more complicated collection that requires
    /// multiple passes to get.
    ///
    
    // First, get all of our possible sources.
    var resp = gm_ann.search();
    //var count = resp.total_documents();
    var facet_list = resp.facet_field_list();
    var source_data = resp.facet_field(ffacet);	
    var our_sources_of_interest = [];
    each(source_data, function(src_facet){
	our_sources_of_interest.push(src_facet[0]);
    });
    
    // Now setup what data we will want and a variable to catch it
    // in a table-like form for graphing later.
    var our_ev_of_interest_copy = bbop.clone(our_ev_of_interest);
    
    // Cycle over the sources we want to look at while collecting
    // data.
    ll('AXES' + "\t" + our_ev_of_interest.join("\t") + "\t" + 'TOTAL');
    // each([our_sources_of_interest[0],
    //       our_sources_of_interest[1]],
    each(our_sources_of_interest,
	 function(isrc){
    	     gm_ann.reset_query_filters();
    	     gm_ann.add_query_filter(ffacet, isrc);
	     
	     // ll('isrc: ' + isrc);
	     
	     var resp = gm_ann.search();
	     
	     // The evidence facet.
	     var facet_list = resp.facet_field_list();
	     var ev_fasc_hash = resp.facet_counts()['evidence_type_closure'];
	     
	     // ll('ev_fasc_hash: ' + bbop.dump(ev_fasc_hash));
	     
	     // Data row assembly.
	     var row_cache = [isrc];
	     each(our_ev_of_interest, function(e){
		 var ev_cnt = ev_fasc_hash[e] || 0;
		 //ll(isrc + "\t" + e + "\t" + ev_cnt);
		 //ll("\n");
		 row_cache.push(ev_cnt);
	     });
	     var total_count = resp.total_documents();
	     row_cache.push(total_count);
	     ll(row_cache.join("\t"));
	 });
    
    //ll(bbop.dump(agg_data_03));
}
