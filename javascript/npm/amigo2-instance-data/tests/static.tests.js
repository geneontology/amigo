////
//// Some unit testing for the more "static" data sections of the
//// blob.
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var amigo = require('..');

///
/// Start unit testing.
///

describe('check that the major data structures exist', function(){

    var a = new amigo();

    it('data.golr', function(){
	assert.isObject(a.data.golr, 'golr is an object');
    });

    it('data.xrefs', function(){
	assert.isObject(a.data.xrefs, 'xrefs is an object');
    });

    it('data.context', function(){
	assert.isObject(a.data.context, 'context is an object');
    });

    it('data.definitions', function(){
	assert.isObject(a.data.definitions, 'definitions is an object');
    });
});

describe('explore the structure of context', function(){

    var a = new amigo();

    it('data.definitions', function(){
	assert.equal(a.data.context['BFO:0000050'].readable, 'part of',
		     'has part_of');
    });
});

describe('explore the structure of definitions', function(){

    var a = new amigo();

    it('data.definitions', function(){
	// Well...
	assert.isNumber(a.data.definitions.download_limit, 
			'is a number: ' + a.data.definitions.download_limit);
	// Sanity range.
	assert.isAbove(a.data.definitions.download_limit, 100,
		       'is a > number ');
	assert.isBelow(a.data.definitions.download_limit, 1000000,
		       'is a < number');
    });
});

describe('explore the structure of golr', function(){

    var a = new amigo();

    // it('data.definitions', function(){
    // 	assert.equal(a.data.golr.ontology.document_category,
    // 		     'ontology_class',
    // 		     'public GO instance info');
    // });

    it('data.definitions', function(){
	assert.equal(a.data.golr.ontology.document_category,
		     'ontology_class',
		     'public GO instance info');
    });
});

describe('explore the structure of xrefs', function(){

    var a = new amigo();

    it('data.xrefs', function(){
	assert.equal(a.data.xrefs.go.id, "GO", 'has GO in xrefs');
    });
});

describe('explore the structure of server', function(){

    var a = new amigo();

    it('data.server', function(){
	assert.isDefined(a.data.server.beta, 'has something in server data');
	assert.isNotNull(a.data.server.beta, 'has legit info in server data');
    });
});

describe('explore the structure of default dispatch', function(){

    var a = new amigo();

    it('data.dispatch', function(){
	assert.isTrue(us.isFunction(a.data.dispatch.example_field.context['example_context']), 'has default dispatch A');
	assert.isTrue(us.isFunction(a.data.dispatch.annotation_extension_json.context['bbop-widget-set.live_results']), 'has default dispatch B');
    });

});

describe('explore the structure of created dispatch', function(){

    var a = new amigo({
	"foo_field": {
	    "context": {
		"bar_context": function(){ return true; },
		"bib_context": function(){ return true; }
	    }
	},
	"bar_field": {
	    "context": {
		"foo_context": function(){ return true; },
		"feh_context": function(){ return true; }
	    }
	}
    });

    it('data.dispatch', function(){
	assert.isTrue(us.isFunction(a.data.dispatch.foo_field.context['bar_context']), 'has created dispatch A');
	assert.isTrue(us.isFunction(a.data.dispatch.foo_field.context['bib_context']), 'has created dispatch B');
	assert.isTrue(us.isFunction(a.data.dispatch.bar_field.context['feh_context']), 'has created dispatch C');
    });

});
