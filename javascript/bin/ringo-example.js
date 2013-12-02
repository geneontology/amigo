/*
 * Package: ringo-example.js
 * 
 * This is a RingoJS example server/script.
 * 
 * Start an http service and return trivial responses from GOlr about
 * term IDs. It also trivially uses mustache.
 * 
 * Usage like:
 *  : RINGO_MODULE_PATH="../stick/lib:_data:javascript/staging" $(RINGO_JS) javascript/bin/ringo-example.js --port 8910
 * 
 * Then visit URLs like:
 *  : http://localhost:8910
 *  : http://localhost:8910/GO:0022008
 *  : http://localhost:8910/foo
 * 
 */

// Awkwardly (but correctly?) bring on our prescious AmiGO/BBOP JS
// libs.
var bbop = require('bbop').bbop;
var amigo = require('amigo2').amigo;

// Defined the GOlr request conf.
var gconf = new bbop.golr.conf(amigo.data.golr);

// Configure the actual webapp bit using stick.
// https://github.com/ringo/stick.git
var Application = require('stick').Application;
//var {Application} = require('stick');
exports.app = new Application();
var app = exports.app;
app.configure('route');

// Wrapper for the common return.
function common_doc(string){
    if( ! string ){ string = '???'; }
    return {
	body: [string],
	headers: {'Content-Type': 'text/html'},
	status: 200
    };
}

// Default top-level route. Just say "hi!"
app.get('/', function(request) { return common_doc('Hello, World!'); });

// Use mustache for html generation.
var mustache = require('ringo/mustache');
var tmpl = 'Your document:<br />id: {{annotation_class}}\nlabel: {{annotation_class_label}}';

// ...
var Deferred = require('ringo/promise').Deferred; // need later, only req once
app.get('/:query', function(request, query) {

	    // Declare a delayed response.
	    var response = new Deferred();
	    //response.wait(5000); // 5s wait for resolution

	    // New agent on every call.
	    var server_loc = 'http://golr.berkeleybop.org/';
	    var go = new bbop.golr.manager.ringo(server_loc, gconf);

	    // Define what we do when our GOlr (async) information
	    // comes back within the scope of the deferred response
	    // variable.
	    function golr_callback_action(resp){

		// Gather out info from the first doc since we called
		// by ID.
		var doc = resp.get_doc(0) || {};
		var ans = common_doc(mustache.to_html(tmpl, doc));
		response.resolve(ans);
	    }

	    // Run the agent action with the callback from above.
	    go.set_id(query);
	    go.register('search', 'do', golr_callback_action);
	    go.update('search');

	    return response.promise;
	});

// Module juggle.
if (require.main == module) {
   require('ringo/httpserver').main(module.id);
}
