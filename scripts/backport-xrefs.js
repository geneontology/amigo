/*  
 * Package: backport-xrefs.js
 * 
 * This is a NodeJS script, using no special environment.
 * 
 * This turns an XRefs JSON file into an old-style GO.xrf_abbs file.
 * 
 * Usage like:
 *  : node backport-xrefs.js go-xrefs.json
 * 
 */

///
/// Helpers.
///

// Array iterator.
function iter(list, func){
    for( var i = 0; i < list.length; i++ ){
	func(list[i], i);
    }
}

function ll(str){ console.log(str); }
function die(str){ console.log('ERROR: ' + str); process.kill(); }

///
/// Main.
///

// Get our input as a string. If there is no file, gather the blob
// from STDIN.
var input_str = null;
var in_file = process.argv[2] || null;
if( in_file ){
    //ll('data from file: ' + in_file);
    var fs = require('fs');
    input_str = fs.readFileSync(in_file, 'utf8');
}
// Double check that we got something.
if( input_str === null ){ die('could find no input'); }

// Parse the input.
var json = JSON.parse(input_str);

// Cycle through the input and output.
var cache = [];
iter(json, 
     function(item, i){

	 var subcache = [];
	 Object.keys(item).forEach(function(key) {
				       var val = item[key];
				       if( val && val != '' ){
					   subcache.push(key + ': ' + val);
				       }
				   });
	 cache.push(subcache.join("\n"));
     });

ll(cache.join("\n\n"));
