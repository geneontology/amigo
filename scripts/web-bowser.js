////
//// Pretend that you are a user against an golr instance, output
//// easily graphable data.
////
//// Run with:
////  node ./scripts/web-bowser.js --golr http://amigo-dev-golr.berkeleybop.org/ --ui 3
////  node ./scripts/web-bowser.js --golr http://foo.com --download 0 --lines 1000
////

var us = require('underscore');
var opts = require('minimist');

var bbop = require('bbop-core');
var amigo = new (require('../javascript/npm/amigo2-instance-data'))();
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
//var gserv = amigo.data.server.golr_base;

//var impl_engine = require('bbop-rest-manager').jquery;
var impl_engine = require('bbop-rest-manager').node;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');
var dumb_response = require('bbop-rest-response').base;

///
/// Helpers and aliases.
///

var each = us.each;

function _ll(arg1){
    console.log('web-bowser.js [' + (new Date()).toJSON() + ']: ', arg1); 
}

var last = (new Date()).getTime();
function _report(agent_type, agent_number){

    var curr = (new Date()).getTime();
    var num = curr - last;

    console.log([agent_type, agent_number, curr, num].join("\t")); 

    last = curr;
}

function _die(message){
    console.error('web-bowser.js ['+ (new Date()).toJSON() +']: '+ message);
    process.exit(-1);
}

function _random_word(len){

    var ret = '';

    var chars = "abcdefghijklmnopqrstuvwxyz";
    for( var i = 0; i < len; i++ ){
        ret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return ret;
}

function _random_number(len){

    var ret = '';

    var chars = "0123456789";
    for( var i = 0; i < len; i++ ){
        ret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return ret;
}

///
/// CLI handling, environment setup, and initialization of clients.
///

// CLI handling.
var argv = opts(process.argv.slice(2));
//console.dir(argv);

// What directory will we monitor/operate on.
var gserv = argv['g'] || argv['golr'];
if( ! gserv ){
    _die('Option (g|golr) is required.');
}else{
    if( gserv.charAt(gserv.length -1) !== '/' ){
	gserv = gserv + '/';
    }
}

var ui_count = argv['u'] || argv['ui'];
if( ! ui_count ){
    ui_count = 0;
}else{
    ui_count = parseInt(ui_count);
}

var download_count = argv['d'] || argv['download'];
if( ! download_count ){
    download_count = 0;
}else{
    download_count = parseInt(download_count);
}

var lines = argv['l'] || argv['lines'];
if( download_count > 0 && ! lines ){
    _die('Option (l|lines) is required with "download" greater than 0.');
}
lines = parseInt(lines);

///
///
///

// Spin up UI agents.
for( var ui = 0; ui < ui_count; ui++ ){

    (function(){

	var agent_number = ui +1;
	
	var engine = new impl_engine(golr_response);
	//engine.method('GET');
	//engine.use_jsonp(true);
	var manager = new golr_manager(gserv, gconf, engine, 'async');
	
	manager.set_personality('annotation');
	manager.add_query_filter('document_category', 'annotation', ['*']);
	
	// Using callback.
	manager.register('search', function(resp){
	    
	    _report('ui', agent_number);
	    
	    // Reset and new.
	    manager.reset_query();
	    manager.set_comfy_query(_random_word(3));
	    
	    // Regenerate and start again.
	    manager.search();
	});
	
	// Trigger initial.
	manager.set_comfy_query(_random_word(3));
	manager.search();
	
    })();
}

// Spin up download agents.

// The download-y bits.
function _prep_download_url(){

    var engine = new impl_engine(golr_response);
    //engine.method('GET');
    //engine.use_jsonp(true);
    var gman = new golr_manager(gserv, gconf, engine, 'async');
	
    gman.set_personality('annotation');
    gman.add_query_filter('document_category', 'annotation', ['*']);
	
    // gman.set_results_count(download_count);
    var field_list = [ // from GAF
	'source', // c1
	'bioentity_internal_id', // c2; not bioentity
	'bioentity_label', // c3
	'qualifier', // c4
	'annotation_class', // c5
	'reference', // c6
	'evidence_type', // c7
	'evidence_with', // c8
	'aspect', // c9
	'bioentity_name', // c10
	'synonym', // c11
	'type', // c12
	'taxon', // c13
	'date', // c14
	'assigned_by', // c15
	'annotation_extension_class', // c16
	'bioentity_isoform' // c17
    ];
    // gman.set('fl', field_list.join(','));
    // //manager.set('rows', arg_hash['rows']);
    // gman.set('csv.encapsulator', '');
    // gman.set('csv.separator', '%09');
    // gman.set('csv.header', 'false');
    // gman.set('csv.mv.separator', '|');
    // gman.set('start', _random_number(5));

    //gman.set('start', _random_number(5));
    gman.set_extra('&start=' + _random_number(4));
    //console.log(gman.get_download_url(field_list, { 'rows': lines }));
    return gman.get_download_url(field_list, { 'rows': lines });
}

for( var di = 0; di < download_count; di++ ){

    (function(){

	var agent_number = di +1;
	
	var engine = new impl_engine(dumb_response);
	//engine.method('GET');
	//engine.use_jsonp(true);
	
	// Using callback.
	engine.register('success', function(resp){
	    
	    _report('download', agent_number);
	    
	    // Reset and go again.
	    var url = _prep_download_url();
	    engine.start(url);	    
	});
	engine.register('error', function(resp){
	    console.log('ERROR');
	    console.log(resp);
	});

	// Trigger initial.
	var url = _prep_download_url();
	engine.start(url);
    })();
}
