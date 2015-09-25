////
//// A script to make sure that the schemas have matching properties.
////
//// node ./scripts/schema-match.js --check ./metadata
////

var fs = require('fs');
var us = require('underscore');
var yaml = require('yamljs');

// CLI handling.
var argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

///
/// Helpers and aliases.
///

var each = us.each;

function ll(arg1){
    console.log('schema-match.js: ', arg1); 
}

function _die(message){
    console.error('schema-match.js: ' + message);
    process.exit(-1);
}

// Filename checker.
var file_regexp = /\-config\.yaml$/;
function _filename_okay_p(fname){
    var ret = false;

    if( file_regexp.test(fname) ){
	ret = true;
    }

    return ret;
}

///
/// CLI handling, environment setup, and initialization of clients.
///

// What directory will we monitor/operate on.
var check_dir = argv['c'] || argv['check'];
if( ! check_dir ){
    _die('Option (c|check) is required.');

    // Make sure extant, etc.
    var dstats = fs.statSync(check_dir);
    if( ! dstats.isDirectory() ){
	_die('Option (c|check) is not a directory: ' + check_dir);
    }
}else{
    ll('Will check files in: ' + check_dir);
}

///
///
///

var mega_hash = {};

var all_files = fs.readdirSync(check_dir);
each(all_files, function(filename){

    if( ! _filename_okay_p(filename) ){
	ll('Skipping: ' + filename);
    }else{
	ll('Will check: ' + filename);

	// 
	var finalf = check_dir + '/' + filename;
	var file_hash = yaml.load(finalf);

	var fields = file_hash['fields'];
	
	each(fields, function(field){

	    var fid = field['id'];
	    var ftype = field['type'] || '???';
	    var fcard = field['cardinality'] || 'single';
	    //var fsearch = field['searchable'] || '???';

	    // Ensure structure if this is the first time we've seen
	    // this.
	    if( ! mega_hash[fid] ){
		mega_hash[fid] = {
		    id: fid,
		    type: ftype,
		    cardinality: fcard,
		    _first: filename
		};
	    }else{

		var incase = mega_hash[fid]['_first'] + ' vs. ' + filename;

		if( mega_hash[fid]['id'] !== fid ){
		    _die('ERROR: mismatch id: ' + incase);
		}
		if( mega_hash[fid]['type'] !== ftype ){
		    _die('ERROR: mismatch type: ' + incase);
		}
		if( mega_hash[fid]['cardinality'] !== fcard ){
		    _die('ERROR: mismatch cardinality: ' + incase);
		}

	    }
	});
    }

});
