/*
 * Package: opensearch.js
 * 
 * This is a RingoJS script.
 * 
 * Start an http service and return opensearch-style responses.
 * 
 * NOTE: However, I'm still working in it, so it's just a label lookup
 * for GO IDs right now while I work out the mechanisms.
 * 
 * Usage like:
 *  : RINGO_MODULE_PATH="../stick/lib:_data:javascript/staging" $(RINGO_JS) javascript/bin/opensearch.js --port 8910
 */

// Awkwardly (but correctly?) bring on our prescious AmiGO/BBOP JS
// libs.
var bbop = require('bbop').bbop;
var amigo = require('amigo').amigo;

// Defined the GOlr request conf.
var gconf = new bbop.golr.conf(amigo.data.golr);

// Configure the actual webapp bit using stick.
// https://github.com/ringo/stick.git
//var {Application} = require('stick');
var Deferred = require('ringo/promise').Deferred; // we'll need later
var Application = require('stick').Application;
exports.app = new Application();
var app = exports.app;
app.configure('route');
app.get('/', function(request) {
	    return {
		body: ['Hello, World!'],
		headers: {'Content-Type': 'text/html'},
		status: 200
	    };
	});
app.get('/:query', function(request, query) {
   // return {
   //    body: ['Hello, World!, +' + query],
   //    headers: {'Content-Type': 'text/html'},
   //    status: 200
   // };

	    // Declare a delayed response.
	    var response = new Deferred();
	    //response.wait(5000); // 5s wait for resolution

	    // New agent on every call.
	    var server_loc = 'http://golr.berkeleybop.org/';
	    var go = new bbop.golr.manager.rhino(server_loc, gconf);
	    //var go = new bbop.golr.manager.ringojs(server_loc, gconf);

	    // Define what we do when our GOlr (async) information
	    // comes back within the scope of the deferred response
	    // variable.
	    function golr_callback_action(resp){

		// Gather out info graph info from the first doc since
		// we called by ID.
		var doc = resp.get_doc(0) || {};
		var label = doc['annotation_class_label'] || '???';
		var ans = {
		    status: 200,
		    headers: {},
		    body: ["Delayed + " + label]		    
		};
		response.resolve(ans);
	    }

	    // Run the agent action.
	    go.set_id(query);
	    go.register('search', 'do', golr_callback_action);
	    go.update('search');

	    return response.promise;
	});

// Module juggle.
if (require.main == module) {
   require('ringo/httpserver').main(module.id);
}
