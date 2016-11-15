////
//// Some unit testing for handler.js (even though its data is generated).
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var amigo = require('..');

///
/// Start unit testing.
///

describe('extant tests for new system', function(){

    it('Try it with the real stuff', function(){

	var a = new amigo();
	var h = a.handler;

	// ...
	var aej = '{"relationship": {"relation": [{"id": "RO:0002315", "label": "results_in_acquisition_of_features_of"}], "id": "CL:0000136", "label": "fat cell"}}';
	//bbop.core.dump(h.string_to_function_map)
	var correct = '<a title="RO:0002315 (go to the page for results_in_acquisition_of_features_of)" href="http://purl.obolibrary.org/obo/RO_0002315">results_in_acquisition_of_features_of</a> <a title="CL:0000136 (go to the page for fat cell)" href="http://purl.obolibrary.org/obo/CL_0000136">fat cell</a>';
	assert.equal(h.dispatch(aej,
				'annotation_extension_json',
				'bbop-widget-set.live_results'),
		     correct,
		     "got complicated rendering");
	
    });

    it('Try it trivially with play data', function(){

    	var bonus_dispatch = {
    	    'echo_test_field_01': {
    		'default': function(a){ return 'default_01'; },
    		'context': {
    		    'echo_test_context_01': function(a){ return 'context_01'; }
    		}
	    },
    	    'echo_test_field_02': {
		// No default
    		'context': {
    		    'echo_test_context_02': function(a){ return 'context_02'; }
    		}
    	    },
    	    'echo_test_field_03': {
	    }
    	};
    	var a = new amigo(bonus_dispatch);
    	var h = a.handler;

    	assert.equal(h.dispatch('', 'echo_test_field_01'), 'default_01',
    		     'default w/no context');
    	assert.equal(h.dispatch('', 'echo_test_field_01',
				'echo_test_context_01'), "context_01",
    		     'correct context');

	// Bad things.
    	assert.isNull(h.dispatch('', 'echo_test_field_03',
				 'echo_test_context_01'),
    		      'null in empty structure/bad field');
    	assert.equal(h.dispatch('', 'echo_test_field_01',
				'echo_test_context_03'),
		     'default_01',
    		     'good field but bad context sends to default');
    	assert.equal(h.dispatch('', 'echo_test_field_01',
				'echo_test_context_03',
				function(a){ return 'bleh'; }),
		     'default_01',
		     'prefer default context to fallback in bad structure');
	// Prefers default to fallback.
    	assert.equal(h.dispatch('', 'echo_test_field_02',
				'echo_test_context_03',
				function(a){ return 'bleg'; }),
		     "bleg",
    		     'good field, bad context, no default, goes to fallback');
    	assert.isNull(h.dispatch(null, 'echo_test_field_02'),
    		      'null in null out');
    });
});
