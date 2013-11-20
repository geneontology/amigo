/*
 * Package: node-opensearch.js
 * 
 * This is a Node JS script.
 * 
 * Start an http service and return opensearch-style responses.
 * 
 * Usage like:
 *  : ???
 * 
 * Then visit URLs like:
 *  : http://localhost:8910
 *  : http://localhost:8910/term/GO:0022008
 *  : http://localhost:8910/gene_product/foo
 * 
 */

// Easier to access in here.
var host = 'localhost';
var port = 8910;

// Awkwardly (but correctly?) bring on our prescious AmiGO/BBOP JS
// libs.
var bbop = require('bbop').bbop;
var amigo = require('amigo').amigo;
//var bbop = require('bbop').bbop;
//var amigo = require('amigo').amigo;

// Figure out our base and URLs we'll need to aim this locally.
var linker = new amigo.linker();
var sd = new amigo.data.server();
var app_base = sd.app_base();
var medial_query = linker.url('', 'medial_search');

///
/// Various static documents.
///

// GO logo.
var logo_png_data = 'base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAACZygAAmcoB45GkIgAAAAd0SU1FB90JEwECG5RZ/ggAAAdhSURBVEjHjdd9bJ7ldQbw37lfJ4Z8OMR2+CiljNGl0HaUtktXaUhLiTqqbivYpkJFrYBNWseGiG2SlpXhr1CNtmB7ghW12rqtdBqZiN0ETawr0K3Spm0UUcgQHYw2CWgpiR2HxCRO4vc5/eN9ExzmlR3p0SPdep77us8517nOucNb2eXXcdGHi7CC0kb1NlwonEOQ+Sp243+kQ5g183Lln0Z/7rax6Gr3GBN9dI0WERcTG8jLiJVkipjCjEwizpK5BgWHiWfJx6X/NtlX6RlnW+9bAH/iHpbU2NZH9/j5wpW4Ci/LfFHmkyb7dy562K7R94pYJ2Kt9A58h3zCRN8resY5Mc+OTYsA93yZOIOHb6VrdL0SVxOtavFX1i7d6a6bj54G1DnM1CBdo0z2L4jW6FmUtbhBOKGqtpvs/57r7mPuGNs3vQm4a5zJXrrHrsCteMr5S+9z30vHdZy1XrgMr5E/MDX4DFizhf13nvT49AP0jLfJ/H2sw30m+r6/MOzxppyuV+IP8G1Vecg/H3yfEuNYLqKIoKrm8YyIzfbfefAUUPsQB4YaDtTwcO9JjnwS18p8wGT/E7rGmOxb6PHY+SI2kfu8bcndth54O7GdqJEVKomiJi2R+e/EDqFb5kZTAzOL5B2KiM3EedI9Jntf0WQi3eNFiY+Qy2Q+4P5bkrgdK8k6+ZjMW2Xepcr9qIv4kDCKK/HuRQk32c9kfyXiAaFV2KBrtPYGsPxF6WMivmmy/6CVdxR04XWZ/2G+Pmxq4F9MD0zK/D3MI7FL5SGp/n8W7HX3s633kMy/Fq5Syjtdebuie7QIG4S9Mn8Eliw5B8ebHHjFzPDsggrciz3CmfihrP7Y9MC/6RxZHHjrLU3f8r+wR9pg1bm1FiyX3kc+baJvGhwY2mvNltbmr+daPbLMzMCR5g6dxNulFrwg6/NgaoCOoTal/Lr0LuIo1b+aGny6GfYZ3WMvNliey1uINrTJbJTI2i/ywh2wlfg4fk3NXdpHvi7ynaL0o7Vx+qyptfytjpFvCLvxNRkrRKRIMm7UOfKcqrrZgaGjMp9SypWitLXgXDDfBG6AkvlF/KqIZSJ/Q4mrZZknjzQYnk/iEhHvUoxLrSIOSGRWUohYInxAKV/HZ7Qee9bxM+rkBUXELxCzHrntmGuawt45wtTAfpE3U+2S5ojXyCPSMRnfVblL5l9Kz0mzDdBEPorfkT4vcy+RIi7TOfJZD/1RJeIwcVELzhGmwLebyjM10HjvH/ihlQPXam35Q1wvYrmqPmF6cEsz/zPah/uU2NbgSj5jauALp4jVMfyqyG2YE/FLzdV9IlefLKf/3aXahxqeHx45oar+EUdRI3ad9l2JdixFhedORaxzhOnBnWRrM3Vn8OmWRqVEFJn7ic5T0nnSWmoNz9uHVinlU1jROLmbdI7con1oRXPD2eZ6weWnIjY1QMfwOhknGlUZc3xrHmukmRbskrncNfeeaaLvjQ607046h88nHhTRjmz233bpd5WyTsfwnaYH91gzcrDBZpfoHPmGzEdEnINPiZilqqs82zzoSuwq2IuaiPcv0Fc6R1pF+RNRzm2mY1rmS+SMIkRcIeJ6q7cUVW5uDgg1pfyKWu1upWwUsYqK9KQDA9/UNbpOWKrYU3AIB0V5zyl9bdgFzWJHPq7K600N9KjyBpUXiKPCTWp5qenBH8nqBpk/kXn81MOs9Lg8cWtD9OJy6TWVQ4V8XXhWuET32NkLpPHiRpOwX9pqenAfmB7cI/0ZuVxEK3GeswaZGtzp8Fy3Kr+iyq2yelBV9ZoauM30luO6RjtFrMVOmbMtZo7WrV72BLkel2JfM7Q1IpvNIN80MM0TIaXIELjwT9m9sTJn62nftg1zaJCIS2ReiL8wP18vvncHWV4k/h436h7vaP7yEo7gbOEaq4dWNspsuFP4rPC6zLr0UzPD7N64eJM4NEjP2GriJjwq80WPfG7BINA9doGI28iDVCO+//rSJqMvlXlC5k9lHlZKW0NmY6XMB2X9btNDc4uC9oxRL0WpviCskTFqonf3G/24Z5yJvpdV1Q4Z76F2o6tWHFOv366qXkNRynlqtbWntD2rp2T1LdNDczqGTx+NT1o9i1r1GbxflY+Y6N2tZ5yGEuH5f6BnlIn+n7j0qleJTzvh3T644glPH3lYLTqFNsyRBxtMzSHTg6/oGGZ6sAH4/HcaT8OZdqFfxHrc35i3xpnofdOUefU4rcHfbaRrdINSflvmKi3x5zad/QMferqu5YzV5o/OcM98U4u5YiXbF463Y2uaXesmclaVO0z2P+aTX6V+hIlNiwz0V99DS0tjBO0Ze0dznvpNGXuUfF7YaWk84296T8/pJ+49U612uYj3ilwr8yIRj1I9Zlt/I7zzJ9i++S2uMD1jjdvEtWM1lbXER0X+soxV5JyIIzIPiEi0y1xGLMNB8j/xXekFk33zukeZ6P9/3p0W2m99iaVLa40mUdqoLhZxkbRKSByW+WP8GIdkHlav1+3Y/HO3/RkQyTEbNVbXzAAAAABJRU5ErkJggg%3D%3D';
var logo_png_b64 = 'data:image/png;' + logo_png_data;

// Default top-level route. Just say "hi!"
var indexdoc = [
    '<html>',
    '<head>',// profile="http://a9.com/-/spec/opensearch/1.1/">',
    '<meta charset="utf-8">',
    '<link rel="icon" href="' + logo_png_b64 + '" />',
    '<link',
    'rel="search"',
    'type="application/opensearchdescription+xml"',
    'href="http://' + host + ':' + port + '/osd_term.xml"',
    'title="GO Search (term)" />',
    '<link',
    'rel="search"',
    'type="application/opensearchdescription+xml"',
    'href="http://' + host + ':' + port + '/osd_gp.xml"',
    'title="GO Search (gene product)" />',
    '</head>',
    '<body>',
    '<p>',
    'Hello, World!',
    '</p>',
    '<p>',
    'If you know how to find it in your browser,',
    'an OpenSearch plug-in should now be available.',
    '</p>',
    '</body>',
    '</html>'
].join(' ');


// Use mustache for XML generation.
var mustache = require('ringo/mustache');
var osddoc_tmpl = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<OpenSearchDescription',
    'xmlns:moz="http://www.mozilla.org/2006/browser/search/"',
    'xmlns="http://a9.com/-/spec/opensearch/1.1/">',
    '<ShortName>GO OpenSearch ({{readable_type}})</ShortName>',
    '<Description>GO OpenSearch for {{readable_type}}s.</Description>',
    '<Tags>example golr bbop go gene ontology {{readable_type}}</Tags>',
    '<Contact>sjcarbon@lbl.gov</Contact>',
    '<Image width="16" height="16" type="image/png">'+ logo_png_b64 +'</Image>',
    '<Url',
    'type="text/html"',
    'method="GET"',
    'template="' + medial_query + '{searchTerms}" />',
    '<Url',
    'type="application/x-suggestions+json"',
    'template="http://' + host + ':' + port + '/{{type}}/{searchTerms}" />',
    '<moz:SearchForm>' + app_base + '</moz:SearchForm>',
    '</OpenSearchDescription>'
].join(' ');

var term_tmpl_args = {
    'type': 'term',
    'readable_type': 'term'
};
var osddoc_term = mustache.to_html(osddoc_tmpl, term_tmpl_args);

var gp_tmpl_args = {
    'type': 'gene_product',
    'readable_type': 'gene product'
};
var osddoc_gp = mustache.to_html(osddoc_tmpl, gp_tmpl_args);
		 
///
/// Helper functions.
///

// Wrapper for the common returns.
function common_doc(string, status, type){
    if( ! string ){ string = ''; }
    if( ! status ){ status = 200; }
    if( ! type ){ type = 'text/html'; }
    return {
	body: [string],
	headers: {'Content-Type': type},
	status: status
    };
}

///
/// Configure the app and routes.
///

// Ready the actual webapp bit using stick.
// https://github.com/ringo/stick.git
var Application = require('stick').Application;
//var {Application} = require('stick');
exports.app = new Application();
var app = exports.app;
app.configure('route');

app.get('/', function(request){ return common_doc(indexdoc); });
	
app.get('/osd_term.xml',
	function(request){ return common_doc(osddoc_term, 200,
					     'application/xml'); });
app.get('/osd_gp.xml',
	function(request){ return common_doc(osddoc_gp, 200,
				     'application/xml'); });
// TODO: This obviously does not do anything than supress some types
// of error messages.
app.get('/favicon.ico',
	function(request){ return common_doc('', 200,
					     'image/x-icon'); });

// Define the GOlr request conf.
// Aaaand a linker.
// Will need Deferred later to make things more "serial"; only req once.
var server_loc = 'http://golr.berkeleybop.org/';
var gconf = new bbop.golr.conf(amigo.data.golr);
var Deferred = require('ringo/promise').Deferred;

// The request functions I use are very similar.
function create_request_function(personality, doc_type,
				 id_field, label_field, link_type){

    return function(request, query) {

	// Declare a delayed response.
	var response = new Deferred();
	//response.wait(5000); // 5s wait for resolution

	// New agent on every call.
	var go = new bbop.golr.manager.ringo(server_loc, gconf);
	go.set_personality(personality); // profile in gconf
	go.add_query_filter('document_category', doc_type);
	
	// Define what we do when our GOlr (async) information
	// comes back within the scope of the deferred response
	// variable.
	function golr_callback_action(resp){

	    // Return caches for the values we'll collect.
	    var ret_terms = [];
	    var ret_descs = [];
	    var ret_links = [];

	    // Gather document info if available.
	    //var found_docs = resp.documents();		
	    bbop.core.each(resp.documents(),
			   function(doc){
			       var id = doc[id_field];
			       var label = doc[label_field];

			       ret_terms.push(label);
			       ret_descs.push(id);
			       ret_links.push(linker.url(id, link_type));
			   });

	    // Assemble final answer into the OpenSearch JSON
	    // form.
	    var ret_body = [query];
	    ret_body.push(ret_terms);
	    ret_body.push(ret_descs);
	    ret_body.push(ret_links);
	    var ans = {
		status: 200,
		headers: {'Content-Type': 'application/json'},
		body: [bbop.core.to_string(ret_body)]
	    };
	    response.resolve(ans);
	}

	// Run the agent action.
	//go.set_query(query);
	go.set_comfy_query(query);
	go.register('search', 'do', golr_callback_action);
	go.update('search');

	return response.promise;
    };
}

// Dynamic GOlr output.
app.get('/term/:query',
	create_request_function('ontology', 'ontology_class',
				'annotation_class', 'annotation_class_label',
				'term'));
app.get('/gene_product/:query',
	create_request_function('bioentity', 'bioentity',
				'bioentity', 'bioentity_label',
				'gene_product'));

///
/// Runner.
///

// Module juggle.
if (require.main == module) {
    //require('ringo/httpserver').main(module.id);
    //var {Server} = require('ringo/httpserver');
    var Server = require('ringo/httpserver').Server;
    //var server = new Server({app: app, port: port});  
    var server = new Server({app: app, host: host, port: port});  
    server.start();  
}
