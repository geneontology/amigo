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
 * 
 * Then visit URLs like:
 *  : http://localhost:8910
 *  : http://localhost:8910/GO:0022008
 *  : http://localhost:8910/foo
 * 
 */

// Easier to access in here.
var port = 8910;

// Awkwardly (but correctly?) bring on our prescious AmiGO/BBOP JS
// libs.
var bbop = require('bbop').bbop;
var amigo = require('amigo').amigo;

// Figure out our base and URLs we'll need to aim this locally.
var sd = new amigo.data.server();
var app_base = sd.app_base();
var medial_query = app_base + '/amigo/medial_search?q=';

///
/// Various static documents.
///

// Default top-level route. Just say "hi!"
var indexdoc = [
    '<html>',
    '<head>',// profile="http://a9.com/-/spec/opensearch/1.1/">',
    '<meta charset="utf-8">',
    '<link',
    'rel="search"',
    'type="application/opensearchdescription+xml"',
    'href="http://localhost:' + port + '/osd.xml"',
    'title="GOlr Search" />',
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

// Return the opensearch description doc.
var osddoc = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<OpenSearchDescription',
    'xmlns:moz="http://www.mozilla.org/2006/browser/search/"',
    'xmlns="http://a9.com/-/spec/opensearch/1.1/">',
    '<ShortName>GOlr OpenSearch</ShortName>',
    '<Description>Example BBOP JS GOlr OpenSearch</Description>',
    '<Tags>example golr bbop go gene ontology</Tags>',
    '<Contact>sjcarbon@lbl.gov</Contact>',
    '<Image width="16" height="16">',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAACZygAAmcoB45GkIgAAAAd0SU1FB90JEwECG5RZ/ggAAAdhSURBVEjHjdd9bJ7ldQbw37lfJ4Z8OMR2+CiljNGl0HaUtktXaUhLiTqqbivYpkJFrYBNWseGiG2SlpXhr1CNtmB7ghW12rqtdBqZiN0ETawr0K3Spm0UUcgQHYw2CWgpiR2HxCRO4vc5/eN9ExzmlR3p0SPdep77us8517nOucNb2eXXcdGHi7CC0kb1NlwonEOQ+Sp243+kQ5g183Lln0Z/7rax6Gr3GBN9dI0WERcTG8jLiJVkipjCjEwizpK5BgWHiWfJx6X/NtlX6RlnW+9bAH/iHpbU2NZH9/j5wpW4Ci/LfFHmkyb7dy562K7R94pYJ2Kt9A58h3zCRN8resY5Mc+OTYsA93yZOIOHb6VrdL0SVxOtavFX1i7d6a6bj54G1DnM1CBdo0z2L4jW6FmUtbhBOKGqtpvs/57r7mPuGNs3vQm4a5zJXrrHrsCteMr5S+9z30vHdZy1XrgMr5E/MDX4DFizhf13nvT49AP0jLfJ/H2sw30m+r6/MOzxppyuV+IP8G1Vecg/H3yfEuNYLqKIoKrm8YyIzfbfefAUUPsQB4YaDtTwcO9JjnwS18p8wGT/E7rGmOxb6PHY+SI2kfu8bcndth54O7GdqJEVKomiJi2R+e/EDqFb5kZTAzOL5B2KiM3EedI9Jntf0WQi3eNFiY+Qy2Q+4P5bkrgdK8k6+ZjMW2Xepcr9qIv4kDCKK/HuRQk32c9kfyXiAaFV2KBrtPYGsPxF6WMivmmy/6CVdxR04XWZ/2G+Pmxq4F9MD0zK/D3MI7FL5SGp/n8W7HX3s633kMy/Fq5Syjtdebuie7QIG4S9Mn8Eliw5B8ebHHjFzPDsggrciz3CmfihrP7Y9MC/6RxZHHjrLU3f8r+wR9pg1bm1FiyX3kc+baJvGhwY2mvNltbmr+daPbLMzMCR5g6dxNulFrwg6/NgaoCOoTal/Lr0LuIo1b+aGny6GfYZ3WMvNliey1uINrTJbJTI2i/ywh2wlfg4fk3NXdpHvi7ynaL0o7Vx+qyptfytjpFvCLvxNRkrRKRIMm7UOfKcqrrZgaGjMp9SypWitLXgXDDfBG6AkvlF/KqIZSJ/Q4mrZZknjzQYnk/iEhHvUoxLrSIOSGRWUohYInxAKV/HZ7Qee9bxM+rkBUXELxCzHrntmGuawt45wtTAfpE3U+2S5ojXyCPSMRnfVblL5l9Kz0mzDdBEPorfkT4vcy+RIi7TOfJZD/1RJeIwcVELzhGmwLebyjM10HjvH/ihlQPXam35Q1wvYrmqPmF6cEsz/zPah/uU2NbgSj5jauALp4jVMfyqyG2YE/FLzdV9IlefLKf/3aXahxqeHx45oar+EUdRI3ad9l2JdixFhedORaxzhOnBnWRrM3Vn8OmWRqVEFJn7ic5T0nnSWmoNz9uHVinlU1jROLmbdI7con1oRXPD2eZ6weWnIjY1QMfwOhknGlUZc3xrHmukmRbskrncNfeeaaLvjQ607046h88nHhTRjmz233bpd5WyTsfwnaYH91gzcrDBZpfoHPmGzEdEnINPiZilqqs82zzoSuwq2IuaiPcv0Fc6R1pF+RNRzm2mY1rmS+SMIkRcIeJ6q7cUVW5uDgg1pfyKWu1upWwUsYqK9KQDA9/UNbpOWKrYU3AIB0V5zyl9bdgFzWJHPq7K600N9KjyBpUXiKPCTWp5qenBH8nqBpk/kXn81MOs9Lg8cWtD9OJy6TWVQ4V8XXhWuET32NkLpPHiRpOwX9pqenAfmB7cI/0ZuVxEK3GeswaZGtzp8Fy3Kr+iyq2yelBV9ZoauM30luO6RjtFrMVOmbMtZo7WrV72BLkel2JfM7Q1IpvNIN80MM0TIaXIELjwT9m9sTJn62nftg1zaJCIS2ReiL8wP18vvncHWV4k/h436h7vaP7yEo7gbOEaq4dWNspsuFP4rPC6zLr0UzPD7N64eJM4NEjP2GriJjwq80WPfG7BINA9doGI28iDVCO+//rSJqMvlXlC5k9lHlZKW0NmY6XMB2X9btNDc4uC9oxRL0WpviCskTFqonf3G/24Z5yJvpdV1Q4Z76F2o6tWHFOv366qXkNRynlqtbWntD2rp2T1LdNDczqGTx+NT1o9i1r1GbxflY+Y6N2tZ5yGEuH5f6BnlIn+n7j0qleJTzvh3T644glPH3lYLTqFNsyRBxtMzSHTg6/oGGZ6sAH4/HcaT8OZdqFfxHrc35i3xpnofdOUefU4rcHfbaRrdINSflvmKi3x5zad/QMferqu5YzV5o/OcM98U4u5YiXbF463Y2uaXesmclaVO0z2P+aTX6V+hIlNiwz0V99DS0tjBO0Ze0dznvpNGXuUfF7YaWk84296T8/pJ+49U612uYj3ilwr8yIRj1I9Zlt/I7zzJ9i++S2uMD1jjdvEtWM1lbXER0X+soxV5JyIIzIPiEi0y1xGLMNB8j/xXekFk33zukeZ6P9/3p0W2m99iaVLa40mUdqoLhZxkbRKSByW+WP8GIdkHlav1+3Y/HO3/RkQyTEbNVbXzAAAAABJRU5ErkJggg%3D%3D',
    '</Image>',
    '<Url',
    'type="text/html"',
    'method="GET"',
    'template="' + medial_query + '{searchTerms}" />',
    '<Url',
    'type="application/x-suggestions+json"',
    'template="http://localhost:' + port + '/{searchTerms}" />',
    '<moz:SearchForm>' + app_base + '</moz:SearchForm>',
    '</OpenSearchDescription>'
].join(' ');

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

app.get('/', function(request) { return common_doc(indexdoc); });
	
app.get('/osd.xml',
	function(request) { return common_doc(osddoc, 200, 'application/xml'); });

// Define the GOlr request conf.
// Aaaand a linker.
// Will need Deferred later to make things more "serial"; only req once.
var gconf = new bbop.golr.conf(amigo.data.golr);
var linker = new amigo.linker();
var Deferred = require('ringo/promise').Deferred;

// Dynamic GOlr output.
app.get('/:query', function(request, query) {

	    // Declare a delayed response.
	    var response = new Deferred();
	    //response.wait(5000); // 5s wait for resolution

	    // New agent on every call.
	    var server_loc = 'http://golr.berkeleybop.org/';
	    var go = new bbop.golr.manager.ringo(server_loc, gconf);
	    go.set_personality('general'); // profile in gconf
	    go.add_query_filter('document_category', 'general');

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
				  var id = doc['entity'];
				  var label = doc['entity_label'];
				  var type = doc['category'];

				  ret_terms.push(label);
				  ret_descs.push(id);
				  ret_links.push(linker.url(id, type));
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
	});

// Module juggle.
if (require.main == module) {
    //require('ringo/httpserver').main(module.id);
    var {Server} = require('ringo/httpserver');  
    var server = new Server({app: app, port: port});  
    server.start();  
}
