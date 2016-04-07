////
//// We are going to make our load full of lies.
////
//// Basically, we'll scan through count of out annotation data, add
//// some random geospatial information, then feed it back in.
////
//// Usage:
////  node scripts/golr-enrich-load-with-geospatial.js -c 1000
////

var us = require('underscore');
var bbop = require('bbop-core');
var fs = require('fs');

//var amigo = new (require('amigo2-instance-data'))();
var amigo = new (require('../javascript/npm/amigo2-instance-data'))();

var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;

var node_engine = require('bbop-rest-manager').node;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// Solr.
var solr = require('solr-client');
var url = require('url');
var ustr = require('underscore.string');

///
/// Aliases and helpers.
///

var each = us.each;

function ll(arg1){
    console.log('geospatial+ [' + (new Date()).toJSON() + ']: ', arg1); 
}

function _die(message){
    console.error('GEOSPATIAL+ [' + (new Date()).toJSON() + ']: ' + message);
    process.exit(-1);
}

///
/// CLI handling, environment setup, and initialization of clients.
///

// CLI handling.
var argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

// Number of annotations to add.
var count = argv['c'] || argv['count'];
if( ! count ){
    _die('Option (c|count) is required.');
}else{
    ll('Will add (' + count + ') geospatial dummy entries');
}

///
/// Manager creators.
///

// We'll be using a lot of managers here, use creator macro.
function _new_manager_by_personality(personality){

    var engine = new node_engine(golr_response);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    
    manager.set_personality(personality);
    manager.add_query_filter('document_category', personality);

    return manager;
}

///
/// First pass--collect meta-data that we'll need to get access to
/// data later on.
///

function collect_annotation_identifiers(){

    // First, collect all our assigners.
    var manager = _new_manager_by_personality('annotation');

    // Get the absolute minimum to get all annotation IDs.
    // TODO/WARNING: Actually need score or get a response failure from maxScore.
    //manager.set('fl', '*,score');
    manager.set_results_count(count);
    manager.set_facet_limit(0);

    // Collect and run callback.
    manager.register('error', function(resp){
	console.log(resp.raw());
	_die('ERROR: '+ resp.message());
    });
    manager.register('search', function(resp){
		
	ll('Got ' + resp.total_documents() + ' documents.');

	// Grab out just the IDs.
	var docs_to_enrich = us.map(resp.documents(), function(doc){
	    return doc;
	});
	//console.log(JSON.stringify(ids_to_enrich, true));

	// Pass to the enrichment phase.
	console.log('Going to second pass...');
	enrich_identifiers(docs_to_enrich);
    });	    
    //console.log(manager.get_query_url());
    manager.search();
}

///
/// Second phase: add randomized geospatial information to load.
///

//function enrich_identifiers(ids){
function enrich_identifiers(docs){

    // Set the actual target.
    var u = url.parse(gserv);
    var client_opts = {
	bigint : true,
	solrVersion: '3.6',
	host: u.hostname,
	port: u.port,
	path: ustr(u.path).rtrim('/').value()
    };
    //ll(client_opts);
    var solr_client = solr.createClient(client_opts);
    //var solr_client = solr.createClient(u.hostname, u.port, '', u.path);
    
    // Functions to generate our numbers.
    // https://en.wikipedia.org/wiki/Decimal_degrees
    var _rand_lat = function(){ return Math.random() * (-90 - 90) + 90;};
    var _rand_long = function(){ return Math.random() * (-180 - 180) + 180;};
    var _flatten = function(v){ return Math.round(1000000 * v); };

    // Randomized numbers.
    us.each(docs, function(doc){
	// Remove confusing score.
	delete doc['score'];
	// Add new numbers.
	doc['geospatial_x'] = _flatten(_rand_long());
	doc['geospatial_y'] = _flatten(_rand_lat());
	doc['geospatial_z'] = Math.round(_rand_long());
    });

    // Data run.
    solr_client.add(docs, function(err, obj){
        if(err){
            _die('Could not do updates to server: ' + err);
        }else{
	    
            // 
            solr_client.commit(function(err, obj){
                if(err){
                    _die('Could not commit updates to GOlr server: ' + err);
                }else{
                    ll('All docs added; completed enrichment.');
                    console.log(docs);
                }
            });
        }
    });
}

///
/// Alpha and Omega.
///

// And kick off with the first pass trigger.
collect_annotation_identifiers();
