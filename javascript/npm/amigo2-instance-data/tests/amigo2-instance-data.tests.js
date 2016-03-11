////
//// Some unit testing for amigo2 instance data core.
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var amigo = require('..');

///
/// Start unit testing.
///

describe('basic public GO tests', function(){

    it('assume GO data', function(){

	var a = new amigo();

	assert.isTrue(a.term_id_p('GO:0022008'), 'is a GO term id');
	assert.isFalse(a.term_id_p('SO:0022008'), 'is /not/ a GO term id');

	// assert.equal(a.get_image_resource('star'),
	// 	     'http://amigo.geneontology.org/static/images/star.png',
	// 	     'got some image url');

    });
});
