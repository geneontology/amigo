////
//// Gene annotation summary service.
////

//var bbop_legacy = require('bbop').bbop;
// Correct environment, ready testing.
var bbop = require('bbop-core');
var amigo = new (require('../javascript/npm/amigo2-instance-data'))();

var golr_conf = require('golr-conf');
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// A couple of possible engines for use.
var node_engine = require('bbop-rest-manager').node;

// Std utils.
var us = require('underscore');
var fs = require('fs');
var path = require('path');
var us = require('underscore');
//var yaml = require('yamljs');

// Special for dealing with disambiguation cache. Let the cache live
// for a day, and do a check to flush every hour.
var NodeCache = require("node-cache");
var discache = new NodeCache({
    // If use clones, the cache becomes incredibly unusably slow.
    "useClones": false,
    // With these two values, I can guarentee a purge at least at 24hrs.
    "stdTTL": 82800, // (* 60 60 23) === seconds per 23hrs
    "checkperiod": 3600 // (* 60 60) === seconds per hour
});

// TODO: Parameterize the search fields that we want to work
// with. The *first* is considered to be the primary unique 
// proxy identifier, which will also be used to lookup docs later.
var bioentity_search_fields = [
    "bioentity",
    "bioentity_label",
    "bioentity_name",
    "bioentity_internal_id",
    "synonym"
];
var bioentity_proxy_id_field = bioentity_search_fields[0];
	

// Templating.
//var md = require('markdown');
var marked = require('marked');

///
/// Envelope.
///

function second_count(){
    return Math.floor((Date.now()) / 1000);
}

// ISO8601-ish (no timezone offset).
function timestamp(){

    var date = new Date();

    // Munge.
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = (m < 10 ? "0" : "") + m;
    var d = date.getDate();
    d = (d < 10 ? "0" : "") + d;
    var h = date.getHours();
    h = (h < 10 ? "0" : "") + h;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + m;
    var s = date.getSeconds();
    s = (s < 10 ? "0" : "") + s;

    // Assemble.
    return y +"-"+ m +"-"+ d + "T" + h + ":" + min + ":" + s;
}

// Envelopes are default good.
function envelope(service_name){

    var anchor = this;

    anchor._is_a = 'bbop-service-envelope';

    // Start the timer.
    anchor._start_time = second_count();

    // Theoretical good result frame.
    anchor._envelope = {
	service: 'n/a',
	status: 'success',
	arguments: {},
	comments: [],
	data: {}
    };

    // 
    if( service_name && typeof(service_name) === 'string' ){
	anchor._envelope['service'] = service_name;
    }
}

envelope.prototype.service = function(arg){
    var anchor = this;

    // Optional set.
    if( arg && typeof(arg) === 'string' ){
	anchor._envelope['service'] = arg;
    }
    
    // Required get.
    return anchor._envelope['service'];
};

envelope.prototype.arguments = function(arg){
    var anchor = this;

    // Optional set.
    if( arg && typeof(arg) === 'object' ){
	anchor._envelope['arguments'] = arg;
    }
    
    // Required get.
    return anchor._envelope['arguments'];
};

envelope.prototype.status = function(arg){
    var anchor = this;

    // Optional set.
    if( arg === 'success' || arg === 'failure' ){
	anchor._envelope['status'] = arg;
    }
    
    // Required get.
    return anchor._envelope['status'];
};

envelope.prototype.comments = function(arg){
    var anchor = this;

    // Optional set, first ensure list.
    if( arg && typeof(arg) === 'string' ){
	arg = [arg];
    }
    if( us.isArray(arg) ){
	anchor._envelope['comments'] = arg;
    }

    // Required get.
    return anchor._envelope['comments'];
};

envelope.prototype.add_comment = function(arg){
    var anchor = this;

    // Optional set, first ensure list.
    if( arg && typeof(arg) === 'string' ){
	anchor._envelope['comments'].push(arg);
    }

    // Required get.
    return anchor._envelope['comments'];
};

envelope.prototype.data = function(arg){
    var anchor = this;

    // Optional set, first ensure list.
    if( arg && typeof(arg) === 'object' ){
	anchor._envelope['data'] = arg;
    }

    // Required get.
    return anchor._envelope['data'];
};

envelope.prototype.structure = function(){

    // Calculate time to structure.
    var start_time = this._start_time;
    var end_time = second_count();
    var delta_time = end_time - start_time;
    this._envelope['time'] = delta_time;

    // Stamp with finalizing date.
    this._envelope['date'] = timestamp();
    
    // Final.
    return this._envelope;
};

///
/// Manager extension.
///

// Coordinate an arbitary number of promises serially.
// TODO: With testing, this may be best folded back into the manager
// code proper, where we could also get the benefits of callbacks.
function run_promises(promise_runner_stack, 
		      accumulator_function, final_function, error_function){
    if( ! us.isEmpty(promise_runner_stack) ){
	var promise_runner = promise_runner_stack.shift();
	promise_runner().then(function(resp){
	    accumulator_function(resp);
	    run_promises(promise_runner_stack,
			 accumulator_function, final_function, error_function);
	}).fail(function(err){
	    if(err){
		error_function(err);
	    }
	}).done();
    }else{
	final_function();
    }
}

// This was a previous attempt at the above code. The necessary
// coordination and accumulation functions were caught in the closure;
// unnecessary if the lexical closing works as expected in the above.
// // 
// var recwalk = function(promise_runner_stack, final_function){
//     if( ! us.isEmpty(promise_runner_stack) ){
// 	var promise_runner = promise_runner_stack.shift();
// 	promise_runner().then(function(resp){
// 	    accumulator_fun(resp);
// 	    recwalk(promise_runner_stack, final_function);
// 	}).fail(function(err){
// 	    if(err){
// 	    	return _response_json_fail(res, envl,
// 					   'Error processing set');
// 	    }
// 	}).done();
//     }else{
// 	final_function();
//     }
// };
// recwalk(promise_runners, final_fun);

///
/// Helpers and aliases.
///

var each = us.each;

function ll(arg1){
    console.log('amigo [' + (new Date()).toJSON() + ']: ', arg1); 
}

function _die(message){
    console.error('AMIGO [' + (new Date()).toJSON() + ']: ' + message);
    process.exit(-1);
}

// Failure with a JSON response.
function _response_json_fail(res, envl, message){
    envl.status('failure');
    envl.comments(message);
    return res.json(envl.structure());
}

// Extract singular arguments; will take first if multiple.
function _param(req, param, pdefault){

    var ret = null;

    // Try the route parameter space.
    if( req && req.params && typeof(req.params[param]) !== 'undefined' ){
	ret = req.params[param];
    }

    // Try the get space.
    if( ! ret ){

	if( req && req.query && req.query[param] && typeof(req.query[param]) !== 'undefined' ){
	    ret = req.query[param];
	}    
    }

    // Otherwise, try the body space.
    if( ! ret ){

	var decoded_body = req.body || {};
	if( decoded_body && ! us.isEmpty(decoded_body) && decoded_body[param] ){
	    ret = decoded_body[param];
	}
    }

    // Reduce to first if array.
    if( us.isArray(ret) ){
	if( ret.length === 0 ){
	    ret = pdefault;
	}else{
	    ret = ret[0];
	}
    }

    // Finally, default.
    if( ! ret ){
	ret = pdefault;
    }

    return ret;
}

// Extract list arguments.
function _extract(req, param){

    var ret = [];

    // Note: no route parameter possible with lists(?).

    // Try the get space.
    if( req && req.query && typeof(req.query[param]) !== 'undefined' ){
	//console.log('as query');
	
	// Input as list, remove dupes.
	var paccs = req.query[param];
	if( paccs && ! us.isArray(paccs) ){
	    paccs = [paccs];
	}
	ret = us.uniq(paccs);
    }

    // Otherwise, try the body space.
    if( us.isEmpty(ret) ){
	
	var decoded_body = req.body || {};
	if( decoded_body && ! us.isEmpty(decoded_body) && decoded_body[param] ){
	    //console.log('as body');
	    
	    // Input as list, remove dupes.
	    var baccs = decoded_body[param];
	    //console.log('decoded_body', decoded_body);
	    //console.log('baccs', baccs);
	    if( baccs && ! us.isArray(baccs) ){
		baccs = [baccs];
	    }
	    ret = us.uniq(baccs);
	}
    }

    return ret;
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
/// Environment startup.
///

// Initial server setup.	
var express = require('express');
var cors = require('cors');
var body_parser = require('body-parser');
var app = express();
app.use(cors());
// Add POST via JSON.
app.use(body_parser.json());
app.use(body_parser.urlencoded({'extended': true, parameterLimit: 100000, limit: '50mb' }));

///
/// User pages.
///

// Homepage!
app.all('/', function (req, res){

    // Grab markdown renderable file.
    var landing_raw = fs.readFileSync('./bin/README.md').toString();
    var landing_md = marked(landing_raw);
    res.send(landing_md);
});

///
/// Debugging.
///

// A parameter echo endpoint for debugging.
// BUG/TODO: Get this out into unit tests.
// Using httpie:
//  http http://localhost:6455/api/echo
//  http http://localhost:6455/api/echo/foo
//  http http://localhost:6455/api/echo?foo=bar
//  http http://localhost:6455/api/echo/blah?foo=bar&foo=bib
//  ## Query over body:
//  http http "http://localhost:6455/api/echo/blah?foo=bar&foo=bob" foo=fail
//  ## With body; application/x-www-form-urlencoded
//  http --form "http://localhost:6455/api/echo/blah?foo=bar&foo=bob" sail=fail sail=rail
//  ## With body; application/json
//  http --json "http://localhost:6455/api/echo/blah?foo=bar&foo=bob" sail:='["fail", "rail"]'
//  ## Real:
//  http --form "http://localhost:6455/api/statistics/term-to-gene" term=GO:0008150 term=GO:0009987 term=GO:0022414 term=GO:0044699
app.all('/api/echo/:echo?', function (req, res){

    // Theoretical good result envelope to start.
    var envl = new envelope('/api/echo');

    // Good response.
    //envl.comments('type: ' + req.method);

    // Deal with probing route params.
    var single_route = {};
    us.each(req.params, function(val, key){
	if( key ){
	    single_route[key] = _param(req, key, null);
	}
    });

    // Deal with probing get.
    var single_query = {};
    var list_query = {};
    us.each(req.query, function(val, key){
	if( key ){
	    //console.log('rp:', key);
	    single_query[key] = _param(req, key, null);
	    list_query[key] = _extract(req, key);
	}
    });

    // Deal with probing body.
    var decoded_body = req.body || {};
    var single_body = {};
    var list_body = {};
    us.each(decoded_body, function(val, key){
	if( key ){
	    single_body[key] = _param(req, key, null);
	    list_body[key] = _extract(req, key);
	}
    });

    // Echo report.
    envl.data({
	'method': req.method,
	'route_parameter': {
	    single: single_route,
	},
	'query': {
	    'single': single_query,
	    'list': list_query
	},
	'body': {
	    'single': single_body,
	    'list': list_body
	}
    });
    
    res.json(envl.structure());
});

///
/// Info API.
///

// Return all term information.
app.all('/api/entity/term/:term_id', function (req, res){

    // Get request parameters.
    var term_id = _param(req, 'term_id', null);
	
    // Theoretical good result envelope to start.
    var envl = new envelope('/api/entity/term/' + term_id);

    // Setup manager and basic.
    ll('Setting up manager to search for: ' + term_id);
    var gconf = new golr_conf.conf(amigo.data.golr);
    var engine = new node_engine(golr_response);
    var manager = new golr_manager(golr_url, gconf, engine, 'async');
    manager.set_personality('ontology');
    manager.set_facet_limit(0); // care not about facets
    manager.add_query_filter('document_category', 'ontology_class');

    // Let's get information by target.
    var max_result_count = 100;
    manager.set_results_count(max_result_count);
    manager.set_targets([term_id], ['annotation_class']);

    // Failure callbacks.
    manager.register('error', function(resp, man){
	envl.status('failure');
	envl.comments('Unable to process ' + term_id);
	res.json(envl.structure());
    });

    // Success callback.
    manager.register('search', function(resp, man){
	
	// See what we got.
	if( resp.documents().length === 0 ){
	    envl.status('failure');
	    envl.comments('Unknown ID: ' + term_id);
	}else if( resp.documents().length > 1 ){
	    envl.status('failure');
	    envl.comments('Ambiguous ID: ' + term_id);
	}else{ 
	    // Good response.
	    envl.comments('Found information for: ' + term_id);
	    envl.data(resp.get_doc(0));
	}

	res.json(envl.structure());
    });

    // Trigger async try.
    manager.search();
});

// Return all information on terms.
app.all('/api/entity/terms', function (req, res){
    
    // Get parameters as lists.
    var entities = _extract(req, 'entity');
    console.log('entities', entities);

    if( us.isEmpty(entities) ){
	return _response_json_fail(res, envl, 'Death by lack of entities.');
    }else{

	// Theoretical good result envelope to start.
	var envl = new envelope('/api/entity/terms');
	envl.arguments({'entity': entities});

	// Setup manager and basic.
	ll('Setting up manager to search for ' + entities.length + ' terms.');
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new node_engine(golr_response);
	var manager = new golr_manager(golr_url, gconf, engine, 'async');
	manager.set_personality('ontology');
	manager.set_facet_limit(0); // care not about facets
	manager.add_query_filter('document_category', 'ontology_class');
	
	// Let's get information by target.
	var max_result_count = 100000;
	manager.set_results_count(max_result_count);
	manager.set_targets(entities, ['ontology_class']);
	
	// Failure callbacks.
	manager.register('error', function(resp, man){
	    envl.status('failure');
	    envl.comments('Unable to process ' + entities.length + ' terms');
	    res.json(envl.structure());
	});
	
	// Success callback.
	manager.register('search', function(resp, man){
	    
	    // See what we got.
	    if( resp.documents().length === 0 ){
		envl.status('failure');
		envl.comments('All IDs unknown: ' + entities.length);
	    }else if( resp.documents().length > entities.length ){
		envl.status('failure');
		envl.comments('Some IDs not found: ' + entities.length);
	    }else{ 
		// Good response.
		envl.comments('Found information for all ' +
			      entities.length + ' terms.');
		envl.data(resp.documents());
	    }
	    
	    res.json(envl.structure());
	});
	
	// Trigger async try.
	manager.search();
    }	
});

// Return all bioentity information.
app.all('/api/entity/bioentity/:bioentity_id', function (req, res){

    // Get request parameters.
    var bioentity_id = _param(req, 'bioentity_id', null);
	
    // Theoretical good result envelope to start.
    var envl = new envelope('/api/entity/bioentity/' + bioentity_id);

    // Setup manager and basic.
    ll('Setting up manager to search for: ' + bioentity_id);
    var gconf = new golr_conf.conf(amigo.data.golr);
    var engine = new node_engine(golr_response);
    var manager = new golr_manager(golr_url, gconf, engine, 'async');
    manager.set_personality('bioentity');
    manager.set_facet_limit(0); // care not about facets
    manager.add_query_filter('document_category', 'bioentity');

    // Let's get information by target.
    var max_result_count = 100;
    manager.set_results_count(max_result_count);
    manager.set_targets([bioentity_id], ['bioentity']);

    // Failure callbacks.
    manager.register('error', function(resp, man){
	envl.status('failure');
	envl.comments('Unable to process ' + bioentity_id);
	res.json(envl.structure());
    });

    // Success callback.
    manager.register('search', function(resp, man){
	
	// See what we got.
	if( resp.documents().length === 0 ){
	    envl.status('failure');
	    envl.comments('Unknown ID: ' + bioentity_id);
	}else if( resp.documents().length > 1 ){
	    envl.status('failure');
	    envl.comments('Ambiguous ID: ' + bioentity_id);
	}else{ 
	    // Good response.
	    envl.comments('Found information for: ' + bioentity_id);
	    envl.data(resp.get_doc(0));
	}

	res.json(envl.structure());
    });
    // Trigger async try.
    manager.search();

});

///
/// Search API.
///

// This is an API for "personality" based searches. Very similar in
// functionality to the LiveSearch system in the perl/JS client. TODO:
// These code bases eventually need to be merged.
function abstract_search(req, res, personality, queries, filters, lite_p){

    // Theoretical good result envelope to start.
    var envl = null;
    if( lite_p ){ 
	envl = new envelope('/api/autocomplete/' + personality);
    }else{
	envl = new envelope('/api/search/' + personality);
    }

    // Note arguments.
    var args = {};
    if( ! us.isEmpty(queries) ){ args['q'] = queries; }
    if( ! us.isEmpty(filters) ){ args['fq'] = filters; }
    envl.arguments(args);

    // Setup manager and basic.
    var srch_report = personality + '; queries: ' + queries.join(', ') + 
	    '; filters: ' +  filters.join(', ');
    ll('Setting up manager to search for: ' + srch_report);
    var gconf = new golr_conf.conf(amigo.data.golr);
    var engine = new node_engine(golr_response);
    var manager = new golr_manager(golr_url, gconf, engine, 'async');
    var found_personality = manager.set_personality(personality);
    manager.set_facet_limit(0); // care not about facets
    var doc_cat = gconf.get_class(personality).document_category();

    // Basic sanity checks before main.
    if( ! found_personality ){
	return _response_json_fail(res, envl,
				   'Death by lack of known personality.');
    }else{

	// Let's get term information by search, start by making sure
	// we're in the right category given our personality.
	manager.add_query_filter('document_category', doc_cat);

	// We're allowing at most one query right now.
	if( ! us.isEmpty(queries) && queries.length === 1 ){
	    manager.set_comfy_query(queries[0]);
	}

	// As many filters as we'd like though.
	each( filters, function(filter){
	    // Parse out our query filter.
	    manager.add_query_filter_as_string(filter, ['$']);
	});

	// Use the light-weight payload for autocomplete.
	if( lite_p === 'lite' || lite_p === true ){
	    manager.lite(true);
	}

	// Failure callbacks.
	manager.register('error', function(resp, man){
	    envl.status('failure');
	    envl.comments('Unable to process search: ' + srch_report);
	    res.json(envl.structure());
	});

	// Success callback.
	manager.register('search', function(resp, man){
	    
	    // See what we got.
	    // Good response.
	    if( resp.documents().length === 0 ){
		envl.comments('Nothing found for: ' + srch_report);
	    }else{ 
		envl.comments('Results found for: ' + srch_report);
	    }
	    envl.data(resp.documents());
	    
	    res.json(envl.structure());
	});
	// Trigger async try.
	manager.search();
    }
}

// Heavy/full search.
app.all('/api/search/:personality', function (req, res){

    // Get request parameters.
    var personality = _param(req, 'personality', null);
    // Get query parameters as lists.
    var queries = _extract(req, 'q');
    var filters = _extract(req, 'fq');

    //console.log('personality', personality);
    //console.log('queries', queries);
    //console.log('filters', filters);

    // Feed into the search abstraction.
    abstract_search(req, res, personality, queries, filters, false);
});

// Lite/autocomplete search.
app.all('/api/autocomplete/:personality', function (req, res){

    // Get request parameters.
    var personality = _param(req, 'personality', null);
    // Get query parameters as lists.
    var queries = _extract(req, 'q');
    var filters = _extract(req, 'fq');

    // Feed into the search abstraction.
    abstract_search(req, res, personality, queries, filters, true);
});

///
/// Numbers API.
///

// 
app.all('/api/statistics/gene-to-term', function (req, res){

    // Theoretical good result envelope to start.
    var envl = new envelope('/api/statistics/gene-to-term');

    // Get parameters as lists.
    var gp_accs = _extract(req, 'bioentity');
    var species = _extract(req, 'species');
    envl.arguments({'bioentity': gp_accs, 'species': species});

    // Get our query terms.
    if( us.isEmpty(gp_accs) ){
	return _response_json_fail(res, envl, 'Death by lack of gp accs.');
    }else{

	// Setup promises to accumulate--dynamically create the set of
	// functions that we want to run serially.
	var promise_runners = [];
	each(gp_accs, function(gp_acc){
	    promise_runners.push(
		function(){
		    // Next, setup the manager environment.
		    var srch_report = 'b: '+gp_acc+'; s: '+species.join(', ');
		    ll('Setting up manager: ' + srch_report);
		    var gconf = new golr_conf.conf(amigo.data.golr);
		    var engine = new node_engine(golr_response);
		    var go = new golr_manager(golr_url, gconf, engine, 'async');
		    go.set_personality('annotation');

		    // 
		    go.add_query_filter('document_category', 'annotation');
		    go.add_query_filter('bioentity', gp_acc);
		    // Pin species if possible.
		    each(species, function(spc){
			go.add_query_filter('taxon_closure', spc);
		    });
		    go.set('rows', 0); // we don't need any actual rows returned
		    go.set_facet_limit(-1); // we only want facet counts
		    go.facets(['regulates_closure']);

		    // Return promise.
		    var prom = go.search();
		    return prom;
		}
	    );
	});
	
	// Fetch the data and grab the numbers we want.
	var gp_info = {};
	var term_info = {};
	var accumulator_fun = function(resp){	
	    
	    // Who was this?
	    var acc = null;
	    var fqs = resp.parameter('fq');
	    each(fqs, function(fq){
		if( fq.substr(0, 9) === 'bioentity' ){
		    acc = fq.substr(10, fq.length-1);
		    acc = bbop.dequote(acc);
		    //ll('Looking at info for: ' + acc);
		}
	    });
	    
	    if( acc ){
		
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

	// When all done, assemble and send.
	var final_fun = function(){
	    envl.data({
		'gene-to-term-summary-count': term_info//,
		//'gene-to-term-annotation-count': gp_info
	    });
	    res.json(envl.structure());
	};

	// In case of error.
	var error_fun = function(err){
	    if(err){
		return _response_json_fail(res, envl, 'Error processing set');
	    }
	};

	run_promises(promise_runners, accumulator_fun, final_fun, error_fun);

	ll('End of accumulation starter.');
    }
});

// 
app.all('/api/statistics/term-to-gene', function (req, res){

    // Theoretical good result envelope to start.
    var envl = new envelope('/api/statistics/term-to-gene');

    // Get parameters as lists.
    var term_accs = _extract(req, 'term');
    var species = _extract(req, 'species');
    envl.arguments({'term': term_accs, 'species': species});

    // Get our query terms.
    if( us.isEmpty(term_accs) ){
	return _response_json_fail(res, envl, 'Death by lack of term accs.');
    }else{
	
	// Setup promises to accumulate--dynamically create the set of
	// functions that we want to run serially.
	var promise_runners = [];
	each(term_accs, function(term_acc){
	    promise_runners.push(
		function(){

		    // Next, setup the manager environment.
		    var srch_report = 'q: '+term_acc+'; s: '+species.join(', ');
		    ll('Setting up manager: ' + srch_report);
		    var gconf = new golr_conf.conf(amigo.data.golr);
		    var engine = new node_engine(golr_response);
		    var go = new golr_manager(golr_url, gconf, engine, 'async');
		    go.set_personality('bioentity');

		    // 
		    go.add_query_filter('document_category', 'bioentity');
		    go.add_query_filter('regulates_closure', term_acc);
		    each(species, function(spc){
			go.add_query_filter('taxon_closure', spc);
		    });
		    go.set('rows', 0); // care not about rows
		    go.set_facet_limit(0); // care not about facets

		    // Return promise.
		    var prom = go.search();
		    return prom;
		}
	    );
	});

	// Fetch the data and grab the number we want.
	var term_info = {};
	var accumulator_fun = function(resp){	
	    
	    // Who was this?
	    var acc = null;
	    var fqs = resp.parameter('fq');
	    each(fqs, function(fq){
		if( fq.substr(0, 17) === 'regulates_closure' ){
		    acc = fq.substr(18, fq.length-1);
		    acc = bbop.dequote(acc);
		}
	    });
	    
	    if( acc ){
		var total = resp.total_documents();
		term_info[acc] = total;
	    }
	    
	};

	// The final function is the data renderer.
	var final_fun = function(){
	    envl.data({
		'term-to-gene-summary-count': term_info
	    });
	    res.json(envl.structure());
	};

	// In case of error.
	var error_fun = function(err){
	    if(err){
		return _response_json_fail(res, envl, 'Error processing set');
	    }
	};

	run_promises(promise_runners, accumulator_fun, final_fun, error_fun);

	ll('End of accumulation starter.');
    }
});

app.all('/api/statistics/overview', function (req, res){
 
    // Theoretical good result envelope to start.
    var envl = new envelope('/api/statistics/overview');

    // Get parameters as lists.
    var species = _extract(req, 'species');
    //ll('Species filter: ' + species);
    envl.arguments({'species': species});

    // 
    var total_terms = null;
    var total_gps = null;
    var total_anns = null;
    (function(){
	
	// Setup the manager environment.
	var srch_report = 's: '+species.join(', ');
	ll('Setting up manager (gps): ' + srch_report);
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new node_engine(golr_response);
	var go = new golr_manager(golr_url, gconf, engine, 'async');
	go.set_personality('bioentity');
	
	// 
	go.add_query_filter('document_category', 'bioentity');
	each(species, function(spc){
	    go.add_query_filter('taxon_closure', spc);
	});
	go.set('rows', 0); // care not about rows
	go.set_facet_limit(0); // care not about facets
	
	// Return promise.
	var prom = go.search();
	return prom;
    })().then(function(resp){

	// Collect the previous results...
	total_gps = resp.total_documents();

	// ...and move on to the next number.
	var srch_report = 's: '+species.join(', ');
	ll('Setting up manager (terms): ' + srch_report);
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new node_engine(golr_response);
	var go = new golr_manager(golr_url, gconf, engine, 'async');

	// Set/reset for ontology term count.
	go.add_query_filter('document_category', 'ontology_class');
	go.set('rows', 0); // care not about rows
	go.set_facet_limit(0); // care not about facets

	// Return promise.
	var prom = go.search();
	return prom;

    }).then(function(resp){

	// Collect the previous results...
	total_terms = resp.total_documents();
	
	// ...and move on to the next number.
	var srch_report = 's: '+species.join(', ');
	ll('Setting up manager (anns): ' + srch_report);
	var gconf = new golr_conf.conf(amigo.data.golr);
	var engine = new node_engine(golr_response);
	var go = new golr_manager(golr_url, gconf, engine, 'async');

	go.add_query_filter('document_category', 'annotation');
	go.set('rows', 0); // care not about rows
	go.set_facet_limit(0); // care not about facets
	each(species, function(spc){
	    go.add_query_filter('taxon_closure', spc);
	});

	// Return promise.
	var prom = go.search();
	return prom;

    }).then(function(resp){

	// Collect the previous results...
	var total_anns = resp.total_documents();
	
	// ...and finally deliver the reponse.
	envl.data({
	    'term-count': total_terms,
	    'gene-product-count': total_gps,
	    'annotation-count': total_anns
	});

	res.json(envl.structure());
    });
});

// 
app.all('/api/disambiguation/bioentity', function (req, res){

    // Theoretical good result envelope to start.
    var envl = new envelope('/api/disambiguation/bioentity');

    // Get parameters as lists.
    var entities = _extract(req, 'entity');
    var species = _extract(req, 'species');
    envl.arguments({'entity': entities, 'species': species});

    // Get our query terms.
    if( us.isEmpty(species) ){
	return _response_json_fail(res, envl, 'Death by lack of species.');
    }else if( us.isEmpty(entities) ){
	return _response_json_fail(res, envl, 'Death by lack of entities.');
    }else if( species.length !== 1 ){
	return _response_json_fail(res, envl,
				   'Currently only support single species.');
    }else{

	// Our single species for discussion (for now).
	var spc = species[0];

	// First, let's try against the cache, and talk a little bit
	// about what is in it. Per species, the cache looks like:
	// SPECIES: {
	//   documents: {ALL_SOLR_RETURN_DOCUMENTS_IN_HASH_BY_PROXY_ID},
	//   references: {
	//     entity_str_1: [
	//       PROXY_ID_1,
	//       PROXY_ID_2,
	//       ...
	//     ],
	//   ...
	// }
	// 
	// For example:
	// TODO
	// 
	//ll('Disambiguation/bioentity try cache...');
	var cache = discache.get(spc);

	// First, let us discuss what will happen when we have a
	// populated cache to work with, one way or another.
	// The cache is
	var collect_results = function(cache){

	    // Frame to hang our results on.
	    var results = {
		"good": [],
		"bad": [],
		"ugly": []
	    };

	    // Break out the two parts of the species cache.
	    var doc_lookup = cache['documents'];
	    var str_refs = cache['references'];
	    
	    // Comb through the cache, carefully, and get the results
	    // that we can. First, for each of the entities try and
	    // pull out the right fields.
	    us.each(entities, function(entity){

		var entity_hits = [];

		// Check to see if we can find any document references
		// for our given string.
		if( str_refs && us.isArray(str_refs[entity]) ){

		    // For each of the matched IDs, lookup the
		    // document in question and try and figure out
		    // which field or fields matched.
		    var match_proxy_ids = str_refs[entity];
		    us.each(match_proxy_ids, function(match_proxy_id){

			// Retrieve the document by proxy ID.
			var doc = doc_lookup[match_proxy_id];
			if( doc ){

			    // Look in all the possibly multi-valued
			    // fields in the doc for the match.
			    us.each(bioentity_search_fields, function(search_field){

				//console.log("search_field: ", search_field);
				
				var vals = doc[search_field];
				// Array-ify the field if not already.
				if( vals && ! us.isArray(vals) ){
				    vals = [vals];
				}
				us.each(vals, function(val){

				    // Record that we found the exact
				    // match we want.
				    if( entity === val ){
					entity_hits.push({
					    "id": match_proxy_id,
					    "matched": search_field
					});
				    }				    
				});
			    });
			}
		    });
		}

		// The results are good, bad, or ugly, depending on the
		// number.
		var rtype = null;
		if( entity_hits.length === 1 ){
		    rtype = "good";
		}else if( entity_hits.length === 0 ){
		    rtype = "bad";
		}else{
		    rtype = "ugly";
		}

		//console.log("results: ", results);
		
		// Push the found results into the right section.
		results[rtype].push({
		    "input": entity,
		    "results": entity_hits
		});

	    });

	    return results;
	};
	
	// Well, if we have the cache, great! Nice and easy.
	if ( cache ){

	    ll('Disambiguation/bioentity cache direct hit for: ' + spc);

	    var collected_results = collect_results(cache);
	    //ll('Disambiguation/bioentity create data envelope.');
	    envl.data(collected_results);
	    //ll('Disambiguation/bioentity send direct hit results.');
	    res.json(envl.structure());

	}else{

	    ll('Disambiguation/bioentity cache miss for: ' + spc);
	    
	    // If we have a cache miss, populate the cache for our
	    // species and then immediately use it. Need to start by
	    // getting all bioentities for our species and storing it
	    // locally.	    
	    var gconf = new golr_conf.conf(amigo.data.golr);
	    var engine = new node_engine(golr_response);
	    var go = new golr_manager(golr_url, gconf, engine, 'async');
	    go.set_personality('bioentity');

	    // 
	    go.add_query_filter('document_category', 'bioentity');
	    each(species, function(sp){
		go.add_query_filter('taxon_closure', sp);
	    });
	    go.set_facet_limit(0); // care not about facets
	    go.lite(true);
	    // Hopefully 100,000,000 is enough for now.
	    go.set_results_count(100000000);
	    
	    // Process promise.
	    var prom = go.search();
	    prom.then(function(resp){

		//console.log("resp: ", resp);
		ll('Disambiguation/bioentity populating cache for: ' + spc);
		
		// Okay, we have the results, now we need to use them
		// to populate the cache.
		// Cycle through and get the cache together. We essentially
		// want to melt is down by every possible string and value
		// for our input search fields.
		var species_cache = {
		    "documents": {},
		    "references": {}
		};
		var docs = resp.documents();
		ll('Disambiguation/bioentity have item count: ' + docs.length);
		us.each(docs, function(doc){

		    //console.log("doc: ", doc);

		    // Extract the proxy ID from the doc, hard fail if
		    // we cannot.
		    var proxy_id = doc[bioentity_proxy_id_field];
		    if( ! proxy_id ){
			var estr = 'Could not find proxy ID in cache create: ' +
				bioentity_proxy_id_field;
			return _response_json_fail(res, envl, estr);
		    }

		    // Index this doc for later use by the proxy id.
		    species_cache["documents"][proxy_id] = doc;
		    
		    // Now cycle through the doc and melf it down to its
		    // indexed components.
		    us.each(bioentity_search_fields, function(search_field){

			var vals = doc[search_field];
			// Array-ify the field if not already.
			if( vals && ! us.isArray(vals) ){
			    vals = [vals];
			}
			us.each(vals, function(val){
			    
			    // We've gotten here, so prepare the cache
			    // at this location. Each value is
			    // essentially a top-level string.
			    if( ! species_cache["references"][val] ){
				species_cache["references"][val] = [];
			    }

			    species_cache["references"][val].push(proxy_id);
			});
			
		    });
		    
		});
		
		//ll('Disambiguation/bioentity species cache created');
		//console.log("species_cache: ", species_cache);

		// Simply add to the cache.
		discache.set(spc, species_cache);
		//ll('Disambiguation/bioentity cache set');

		// Well, we have the species cache, so use it.
		var collected_results = collect_results(species_cache);
		//console.log("collected_results: ", collected_results);
		envl.data(collected_results);

		res.json(envl.structure());
		
	    }).fail(function(err){ // a little fail mode
 		if(err){
 	    	    return _response_json_fail(res, envl,
					       'Error processing set');
 		}
 	    }).done();
	
	}

	ll('Disambiguation/bioentity end of starter.');
    }
});

///
/// Main.
///

// Spin up.
app.listen(port);
if( process && process.send ){
    process.send('Server started.'); // For gulp-develop-server, if listening
}
ll('Server started.');

