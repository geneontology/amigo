////
//// Gene annotation summary service.
////

var bbop_legacy = require('bbop').bbop;

bbop_legacy.golr.manager.nodejs.prototype.run_batch = function(accumulator_func,
                                                               final_func){

    var anchor = this;

    // Set the various callbacks internally so we can get back at them
    // when we lose our stack during the ajax.
    if( accumulator_func ){ this._batch_accumulator_func = accumulator_func; }
    if( final_func ){ this._batch_final_func = final_func; }
    
    // Look at how many states are left.
    var qurl = anchor.next_batch_url();
    if( qurl ){
        
        // Generate a custom callback function that will start
        // this process (next_generator) again--continue the cycle.
        var next_cycle = function(json_data){
            var response = new bbop_legacy.golr.response(json_data);
            anchor._batch_accumulator_func.apply(anchor, [response, anchor]);
            anchor.run_batch();
        };
        
        // Put this custom callback on success.
        anchor.jq_vars['success'] = next_cycle;
        anchor.jq_vars['error'] = anchor._run_error_callbacks;
        anchor.JQ.ajax(qurl, anchor.jq_vars);
    }else{
        anchor._batch_final_func.apply(anchor);
    }
};


var amigo = require('amigo2');

var us = require('underscore');
//var bbop = require('bbop-core');

// Std utils.
var fs = require('fs');
var path = require('path');
var us = require('underscore');
var yaml = require('yamljs');

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
app.get('/', function (req, res) {
    res.send('Are you feeling GASSy?');
});

// Initial service.
app.get('/gene-to-term', function (req, res) {

    var ret = {status: 'fail'};

    // req.stringify(req.query); GET
    // JSON.stringify(req.body) POST
    // Get our query terms.
    if( req.query && req.query['q'] && req.query['q'].length !== 0 ){
	
	var gp_accs = req.query['q'];

	// Next, setup the manager environment.
	ll('Setting up manager.');
	var gconf = new bbop_legacy.golr.conf(amigo.data.golr);
	var go = new bbop_legacy.golr.manager.nodejs(golr_url, gconf);
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
		    ll('Looking at info for: ' + acc);
		}
	    });
	    
	    if( acc ){
		//ll('Looking at info for: ' + acc);
		console.log(resp);
		
		var ffs = resp.facet_field('regulates_closure');
		each(ffs, function(pair){
		    
		    console.log(pair);
		    
		    // Ensure existance.
		    if( ! gp_info[acc] ){ 
			gp_info[acc] = {};
		    }
		    
		    //
		    gp_info[acc][pair[0]] = pair[1];
		});
	    }
	    
	};

	// The final function is the data renderer.
	var final_fun = function(){
	    ll('Starting final in stage 01...');
	    
	    console.log('gp_info: ', gp_info);
	    
	    ret = {
		'status': 'success',
		'q': gp_accs,
		'summary': gp_info
	    };
	    res.json(ret);

	    ll('Completed stage 01!');
	};

	ll('Start batch run.');
	go.run_batch(accumulator_fun, final_fun);	
    }
});

// Spin up.
app.listen(port);
