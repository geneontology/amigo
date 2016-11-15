////
//// Simplest thing you can do.
////
//// Run with:
////  node ./scripts/amigo-data-demo.js
////

var us = require('underscore');
var bbop = require('bbop-core');

var amigo = new (require('amigo2-instance-data'))();

var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var gserv = amigo.data.server.golr_base;

//var impl_engine = require('bbop-rest-manager').jquery;
var impl_engine = require('bbop-rest-manager').node;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

///
///
///

var engine = new impl_engine(golr_response);
//engine.method('GET');
//engine.use_jsonp(true);
var manager = new golr_manager(gserv, gconf, engine, 'async');

manager.set_personality('annotation');
manager.add_query_filter('document_category', 'annotation', ['*']);

// Using callback.
manager.register('search', function(resp){
    if( resp.raw() ){ console.log('method 1: ' + resp.total_documents()); }
});

// Trigger manager system.
var promise = manager.search();

// Using promises.
promise.then(function(resp){
    if( resp.raw() ){ console.log('method 2: ' + resp.total_documents()); }
});
