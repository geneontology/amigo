////
//// Gene annotation summary service.
////

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
    console.log('test-server [' + (new Date()).toJSON() + ']: ', arg1); 
}

function _die(message){
    console.error('TEST_SERVER [' + (new Date()).toJSON() + ']: ' + message);
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
    if( req.query ){

	var terms = req.query['q'];
	ret = {
	    'status': 'success',
	    'q': terms
	};
    }

    res.json(ret);
});

// Spin up.
app.listen(port);
