////
//// This is just a test to test the testing environment.
////

var assert = require('chai').assert;

describe('our testing environment is sane', function(){
    
    // Can I pull in things as expected from node_modules, etc.?
    it('I can see bbop-widget-set from my porch', function(){
	var bbop_widgets = require('..');

	var set_info = new bbop_widgets.set();
	assert.typeOf(set_info, 'object');
	assert.equal(set_info._is_a, 'bbop-widget-set', 'is_a');
    });
    
});
