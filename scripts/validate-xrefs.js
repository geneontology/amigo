/*  
 * Package: validate-xrefs.js
 * 
 * This is a NodeJS script, using no special environment.
 * 
 * Validate an XRefs JSON blob for correctness.
 * 
 * Usage like:
 *  : node validate-xrefs.js go-xrefs.json
 *  : TODO: produce-xrefs.pl | node validate-xrefs.js
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
}else{
    // // Otherwise, we'll try and get it from STDIN.
    // ll('data from stdin');
    // process.stdin.setEncoding('utf8');
    // process.stdin.on('readable',
    // 		     function(chunk) {
    // 			 //var chunk = process.stdin.read();
    // 			 var c = process.stdin.read();
    // 			 //if (chunk !== null) {
    // 			 input_str += chunk + c;
    // 			 //}
    // 		     });
    // process.stdin.on('end', function() {
    // 			 ll("data: \n" + input_str);
    // 			 // Add continuation here?
    // 		     });
    die('STDIN input not yet implemented!');
}
// Double check that we got something.
if( input_str === null ){ die('could find no input'); }

// Parse the input.
var json = JSON.parse(input_str);

// Cycle through the input and check to make sure it's what we want.
iter(json, 
     function(item, i){

	 // Required single-valued.
	 var rsv = [
	     'abbreviation'
	 ];
	 iter(rsv,
	      function(req, ri){
		  if( ! item[req] ){
		      die('Item ' + i + ' did not have ' + req);
		  }
	      });	 
	 
	 // Required list+.
	 // TODO:	 

	 // Optional single-valued.
	 // TODO:

	 // Optional list.
	 var ol = [
	     'synonym'
	 ];
	 iter(ol,
	      function(req, ri){
		  if( typeof(item[req]) != 'object' ||
		      typeof(item[req].length) != 'number' ){
		      die('Item ' + i + ' did not have ' + req + ' as list');
		  }
	      });	 
	 
	 //ll(item.abbreviation);
     });
