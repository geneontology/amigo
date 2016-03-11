/* 
 * Package: handler.js
 * 
 * Namespace: amigo.handler
 * 
 * Generic AmiGO handler (conforming to what /should/ be described in
 * the BBOP JS documentation), fed by <amigo.data.dispatch>.
 */

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

/*
 * Constructor: handler
 * 
 * Create an object that will run functions in the namespace with a
 * specific profile.
 * 
 * These functions have a well defined interface so that other
 * packages can use them (for example, the results display in
 * LiveSearch.js).
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  self
 */
var handler = function (dispatch_table){
    this._is_a = 'amigo2.handler';

    // Okay, since trying functions into existance is slow, we'll
    // create a cache of strings to functions.
    //this.mangle = bbop.uuid();
    //    this.string_to_function_map = {};
    //this.entries = 0; // a little extra for debugging and testing
    this.dispatch_table = dispatch_table;
};

/*
 * Function: dispatch
 * 
 * Return a string.
 * 
 * The fallback function is called if no match could be found in the
 * amigo.data.dispatch. It is called with the name and context
 * arguments in the same order.
 * 
 * Arguments:
 *  data - the incoming string thing to be handled
 *  field_name - the field name to be processed
 *  context - *[optional]* a string to add extra context to the call
 *  fallback - *[optional]* a fallback function to call in case nothing is found
 * 
 * Returns:
 *  string; null if it couldn't create anything
 */
handler.prototype.dispatch = function(data, field_name, context, fallback){
    
    var run_fun = null;
    var retval = null;

    // First, try and get the most specific.
    if( us.isObject(this.dispatch_table[field_name]) ){

	var field_hash = this.dispatch_table[field_name];
	
	// console.log('data', data);
	// console.log('field_name', field_name);
	// console.log('context', context);
	// console.log('fallback', fallback);
	// console.log('field_hash', field_hash);

	// Get the most specific function to run.
	if( us.isObject(field_hash['context']) &&
	    us.isString(context) &&
	    us.isFunction(field_hash['context'][context]) ){
	    //console.log('context function');
	    run_fun = field_hash['context'][context];
	}else if( us.isFunction(field_hash['default']) ){
	    // Generic default as second place.
	    //console.log('default function');
	    run_fun = field_hash['default'];
	}else if( us.isFunction(fallback) ){
	    //console.log('fallback function');
	    run_fun = fallback;	    
	}
    }

    // We are now ensured that either we have a callable function or
    // null, so let's finish it--either the return value of the called
    // function or null.
    if( us.isFunction(run_fun) ){
	retval = run_fun(data, field_name, context);
    }
    return retval;
};

///
/// Exportable body.
///

module.exports = handler;
