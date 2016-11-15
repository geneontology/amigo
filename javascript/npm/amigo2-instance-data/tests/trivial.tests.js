////
//// Some unit testing for version.js (even though it is generated).
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var amigo = require('..');

///
/// Start unit testing.
///

describe('sooo basic', function(){

    it('instantiated as expected?', function(){

	var a = new amigo();

	assert.isObject(a, 'it is an object');
	assert.equal(bbop.what_is(a), 'amigo2-instance-data', 'amigo is amigo');
    });
});
