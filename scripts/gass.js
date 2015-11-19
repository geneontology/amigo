////
//// Gene annotation summary service.
////

//var bbop_legacy = require('bbop').bbop;
// Correct environment, ready testing.
var bbop = require('bbop-core');
var amigo = require('amigo2');

var golr_conf = require('golr-conf');
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// A couple of possible engines for use.
var sync_engine = require('bbop-rest-manager').sync_request;
var node_engine = require('bbop-rest-manager').node;

// Std utils.
var us = require('underscore');
var fs = require('fs');
var path = require('path');
var us = require('underscore');
var yaml = require('yamljs');

// Templating.
var md = require('markdown');


///
/// Helpers and aliases.
///

var each = us.each;

function ll(arg1){
    console.log('gass [' + (new Date()).toJSON() + ']: ', arg1); 
}

function _die(message){
    console.error('GASS [' + (new Date()).toJSON() + ']: ' + message);
    process.exit(-1);
}

///
/// CLI handling, environment setup, and initialization of clients.
///

// CLI handling.
var argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

// What directory will we monitor/operate on.
var golr_url = argv['g'] || argv['golr'];
if( ! golr_url ){
    _die('Option (g|golr) is required.');
}else{
    ll('Will operate on GOlr instance at: ' + golr_url);
}

// What test port to listen on.
var port = argv['p'] || argv['port'];
if( ! port ){
    _die('Option (p|port) is required.');
}else{
    ll('Will listen on port: ' + port);
}

///
/// Startup.
///

// Initial server setup.	
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({'extended': true}));

// Homepage!
app.get('/', function (req, res){

    // Grab markdown renderable file.
    var landing_raw = fs.readFileSync('./scripts/gass.md').toString();
    var landing_md = md.markdown.toHTML(landing_raw);
    res.send(landing_md);
});

// 
app.get('/gene-to-term', function (req, res){

    var ret = {
	service: 'gene-to-term',
	status: 'fail'
    };

    // req.stringify(req.query); GET
    // JSON.stringify(req.body) POST
    // Get our query terms.
    if( req.query && req.query['q'] && req.query['q'].length !== 0 ){
	
	// Input as list, remove dupes.
	var gp_accs = req.query['q'];
	if( ! us.isArray(gp_accs) ){
	    gp_accs = [gp_accs];
	}
	gp_accs = us.uniq(gp_accs);

	// Next, setup the manager environment.
	ll('Setting up manager.');
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new sync_engine(golr_response);
	var go = new golr_manager(golr_url, gconf, engine, 'sync');
	go.set_personality('annotation'); // always this
	//go.debug(false);

	// Now, cycle though all of the gps to collect info on.
	ll('Gathering batch URLs for annotation data...');
	each(gp_accs, function(acc, index){
	    
    	    // Set/reset for the next query.
    	    go.reset_query_filters(); // reset from the last iteration
	    
	    // 
	    go.add_query_filter('document_category', 'annotation', ['*']);
	    go.add_query_filter('bioentity', acc);
	    //go.add_query_filter('taxon', taxon_filter, ['*']); }
	    go.set('rows', 0); // we don't need any actual rows returned
	    go.set_facet_limit(-1); // we are only interested in facet counts
	    go.facets(['regulates_closure']);

	    // Remember for the batching.
    	    go.add_to_batch();
	});
	
	// Fetch the data and grab the number we want.
	var gp_info = {};
	var term_info = {};
	var accumulator_fun = function(resp){	
	    
	    // Who was this?
	    var acc = null;
	    var fqs = resp.parameter('fq');
	    //console.log(fqs);
	    //console.log(resp);
	    each(fqs, function(fq){
		//console.log(fq);
		//console.log(fq.substr(0, 9));
		if( fq.substr(0, 9) === 'bioentity' ){
		    acc = fq.substr(10, fq.length-1);
		    acc = bbop.dequote(acc);
		    //ll('Looking at info for: ' + acc);
		}
	    });
	    
	    if( acc ){
		//ll('Looking at info for: ' + acc);
		//console.log(resp);
		
		var ffs = resp.facet_field('regulates_closure');
		each(ffs, function(pair){
		    
		    //console.log(pair);
		    
		    var tid = pair[0];
		    var acnt = pair[1];

		    // Ensure existance.
		    if( ! gp_info[acc] ){ 
			gp_info[acc] = {};
		    }
		    if( ! term_info[tid] ){ 
			term_info[tid] = 0;
		    }
		    
		    // Add gp info
		    gp_info[acc][tid] = acnt;
		    
		    // Add term info
		    term_info[tid] = term_info[tid] +1;
		});
	    }
	    
	};

	// The final function is the data renderer.
	var final_fun = function(){
	    ll('Starting final in stage 01...');
	    
	    console.log('gp_info: ', gp_info);
	    
	    ret['status'] = 'success';
	    ret['q'] = gp_accs;
	    ret['summary'] = {
		'gene-to-term-summary-count': term_info//,
		//'gene-to-term-annotation-count': gp_info
	    };
	    res.json(ret);

	    ll('Completed stage 01!');
	};

	ll('Start "batch" run.');
	//go.run_batch(accumulator_fun, final_fun);
	var done_p = false;
	while( ! done_p ){
	    var next_url = go.next_batch_url();
	    if( ! next_url ){
		done_p = true;
	    }else{

		// BUG/TODO: Hack.
		console.log(next_url);
		var resp = go._runner(next_url + '&callback_type=search');
		accumulator_fun(resp);
	    }
	}

	final_fun();
    }
});

// 
app.get('/term-to-gene', function (req, res){

    var ret = {
	service: 'term-to-gene',
	status: 'fail'
    };

    // req.stringify(req.query); GET
    // JSON.stringify(req.body) POST
    // Get our query terms.
    if( req.query && req.query['q'] && req.query['q'].length !== 0 ){
	
	// Input as list, remove dupes.
	var term_accs = req.query['q'];
	if( ! us.isArray(term_accs) ){
	    term_accs = [term_accs];
	}
	term_accs = us.uniq(term_accs);

	// Next, setup the manager environment.
	ll('Setting up manager.');
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new sync_engine(golr_response);
	var go = new golr_manager(golr_url, gconf, engine, 'sync');
	go.set_personality('bioentity'); // always this
	//go.debug(false);

	// Now, cycle though all of the gps to collect info on.
	ll('Gathering batch URLs for bioentity/term data...');
	each(term_accs, function(acc, index){
	    
    	    // Set/reset for the next query.
    	    go.reset_query_filters(); // reset from the last iteration
	    
	    // 
	    go.add_query_filter('document_category', 'bioentity', ['*']);
	    go.add_query_filter('regulates_closure', acc);
	    //go.add_query_filter('taxon', taxon_filter, ['*']); }
	    go.set('rows', 0); // care not about rows
	    go.set_facet_limit(0); // care not about facets

	    // Remember for the batching.
    	    go.add_to_batch();
	});
	
	// Fetch the data and grab the number we want.
	var term_info = {};
	var accumulator_fun = function(resp){	
	    
	    // Who was this?
	    var acc = null;
	    var fqs = resp.parameter('fq');
	    //console.log(fqs);
	    //console.log(resp);
	    each(fqs, function(fq){
		//console.log(fq);
		//console.log(fq.substr(0, 17));
		if( fq.substr(0, 17) === 'regulates_closure' ){
		    acc = fq.substr(18, fq.length-1);
		    acc = bbop.dequote(acc);
		    ll('Looking at info for: ' + acc);
		}
	    });
	    
	    if( acc ){
		var total = resp.total_documents();
		term_info[acc] = total;
	    }
	    
	};

	// The final function is the data renderer.
	var final_fun = function(){
	    ll('Starting final in stage 01...');
	    
	    console.log('term_info: ', term_info);
	    
	    ret['status'] = 'success';
	    ret['q'] = term_accs;
	    ret['summary'] = {
		'term-to-gene-summary-count': term_info
	    };
	    res.json(ret);

	    ll('Completed stage 01!');
	};

	ll('Start "batch" run.');
	//go.run_batch(accumulator_fun, final_fun);
	var done_p = false;
	while( ! done_p ){
	    var next_url = go.next_batch_url();
	    if( ! next_url ){
		done_p = true;
	    }else{

		// BUG/TODO: Hack.
		console.log(next_url);
		var resp = go._runner(next_url + '&callback_type=search');
		accumulator_fun(resp);
	    }
	}

	final_fun();
    }
});

app.get('/overview', function (req, res){

    var ret = {
	service: 'overview',
	status: 'fail'
    };

    // Setup the manager environment.
    ll('Setting up manager.');
    var gconf = new golr_conf.conf(amigo.data.golr);
    var engine = new sync_engine(golr_response);
    var go = new golr_manager(golr_url, gconf, engine, 'sync');
    go.set_personality('bioentity'); // always this
    //go.debug(false);

    // Set/reset for the next query.
    go.reset_query_filters(); // reset from the last iteration	    
    go.add_query_filter('document_category', 'bioentity');
    go.set('rows', 0); // care not about rows
    go.set_facet_limit(0); // care not about facets
    var b_resp = go.search();
    var total_gps = b_resp.total_documents();

    // Set/reset for the next query.
    go.reset_query_filters(); // reset from the last iteration	    
    go.add_query_filter('document_category', 'ontology_class');
    go.set('rows', 0); // care not about rows
    go.set_facet_limit(0); // care not about facets
    var t_resp = go.search();
    var total_terms = t_resp.total_documents();
	
    // Set/reset for the next query.
    go.reset_query_filters(); // reset from the last iteration	    
    go.add_query_filter('document_category', 'annotation');
    go.set('rows', 0); // care not about rows
    go.set_facet_limit(0); // care not about facets
    var a_resp = go.search();
    var total_anns = a_resp.total_documents();
	
    // Reponse
    ret['status'] = 'success';
    ret['summary'] = {
	'term-count': total_terms,
	'gene-product-count': total_gps,
	'annotation-count': total_anns
    };
    res.json(ret);    
});


// Spin up.
app.listen(port);
