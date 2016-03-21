////
//// Some testing for the clickable thingy.
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var bbop_widgets = require('..');
var generators = bbop_widgets.generators;

///
/// Start testing.
///

describe('generators', function(){

    it('part 1', function(){
	
     var i = new generators.clickable_object('foo', 'bar', 'bib');
	assert.equal(i.to_string(),
		     '<img id="bib" src="bar" title="foo" />',
		     "same image");
	
	var s = new generators.clickable_object('foo', '', 'bib');
	assert.equal(s.to_string(),
		     '<span id="bib">foo</span>',
		     "same span");
	
    });
});
