/* 
 * The framework to hang the rest of the amigo2 package internals on.
 *
 * @module: amigo2
 */

var us = require('underscore');
var bbop = require('bbop-core');

/**
 * "Constructor" for amigo2.
 * 
 * Parameters:
 *  more_dispatch - addition to or override of default dispatch table
 *
 * @constructor 
 * @returns {Object} amigo2 object
 */
var amigo = function(more_dispatch){
    this._is_a = 'amigo2-instance-data';

    var anchor = this;

    // // The (TODO: now unused?) API lib.
    // this.api = require('./api');

    // // TODO: No longer necessary w/NPM switch.
    // this.version = require('./version');

    // // TODO: Not entirely sure what this was doing anyways.
    //this.data.statistics = require('./data/statistics');

    ///
    /// Dealing with access to the "statically" created instance data.
    ///

    // .data subsection.
    this.data = {};
    // Objects.
    this.data.context = require('./data/context');
    this.data.definitions = require('./data/definitions');
    this.data.golr = require('./data/golr');
    this.data.xrefs = require('./data/xrefs');
    this.data.server = require('./data/server');

    ///
    /// Externalized functions built on our data base.
    ///

    // Does it look like a term?
    var meta_data = this.data.server.meta_data;
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str); // compile upfront

    // Construct a one-time map of aliases to canonical IDs.
    var alias_map = {};
    if( anchor.data && anchor.data.context ){
	us.each(anchor.data.context, function(context_data, context_id){
	    
	    if( context_data.aliases ){
		us.each(context_data.aliases, function(alias){
		    alias_map[alias] = context_id;
		});
	    }
	});
    }
    
    /*
     * Function: term_id_p
     * 
     * True or false on whether or not a string looks like a GO term id.
     * 
     * Parameters:
     *  term_id - the string to test
     * 
     * Returns:
     *  boolean
     */
    this.term_id_p =function(term_id){
	var retval = false;
	if( tre.test(term_id) ){
            retval = true;
	}
	return retval;
    };

    /*
     * Function: get_image_resource
     * 
     * Get a named resource from the meta_data hash if possible.
     * 
     * Parameters:
     *  resource - the string id of the resource
     * 
     * Returns:
     * string (url) of resource
     */
    this.get_image_resource = function(resource){
	
	var retval = null;
	var mangled_res = 'bbop_img_' + resource;
	
	if( meta_data[mangled_res] ){
            retval = meta_data[mangled_res];
	}
	return retval;
    };

    ///
    /// Function/object generators.
    ///

    // Generate the linker from the internal xrefs and server refs.
    var linker_gen = require('./linker');
    this.linker = new linker_gen(this.data.xrefs, this.data.server);
    
    // Need the to feed the linker into the dispatch table generator.
    var dispatch_gen = require('./data/dispatch');
    anchor.data.dispatch = dispatch_gen(anchor.linker);
    // Allow override of dispatch table with arguments into AmiGO at
    // instantiation time.
    if( us.isObject(more_dispatch) ){
	us.each(more_dispatch, function(contexts, field_name){

	    // Make sure we start with a nice something here.
	    if( ! us.isObject(anchor.data.dispatch[field_name]) ){
		anchor.data.dispatch[field_name] = {};
	    }

	    // Add any default functions (if no context is provided).
	    if( us.isFunction(contexts.default) ){
		anchor.data.dispatch[field_name]['default'] = contexts.default;
	    }

	    // Add additional context information.
	    if( contexts.context ){ // double check the jump
		us.each(contexts.context, function(run_fun, context){

		    // Now merge the structure in if it fits.
		    if( us.isFunction(run_fun) &&
			us.isString(context) &&
			us.isString(field_name) ){

			if( ! us.isObject(anchor.data.dispatch[field_name]) ||
			    ! us.isObject(anchor.data.dispatch[field_name]['context']) ){
			    anchor.data.dispatch[field_name]['context'] = {};
			}
			// Write into the final form.
			anchor.data.dispatch[field_name]['context'][context] = run_fun;
		    }
		});
	    }
	});
    }

    // Use this nice dispatch table as the argument to the handler.
    var handler_gen = require('./handler');
    this.handler = new handler_gen(this.data.dispatch);
    
    // .ui subsection.
    //    this.ui = {};

    /*
     * Function: dealias
     * 
     * Attempt to convert an incoming ID into the canonical ID used
     * for the context.
     * 
     * Parameters:
     *  map_id - the string id of the entity
     * 
     * Returns:
     *  string (true id) or null
     */
    this.dealias = function(map_id){
	
	var retval = null;

	if( alias_map[map_id] ){
	    retval = alias_map[map_id];
	}

	return retval;
    };

    /*
     * Function: readable
     * 
     * Get readable label for the entity, if it can be found in the
     * context.
     * 
     * Parameters:
     *  id - the string id of the entity
     * 
     * Returns:
     *  string label, or incoming id if not found
     */
    this.readable = function(id){
	
	if( this.dealias(id) ){
	    id = this.dealias(id);
	}
	var retval = id;

	if( anchor.data && anchor.data.context && anchor.data.context[id] ){
	    var entry =  anchor.data.context[id];
	    if( entry['readable'] ){
		retval = entry['readable'];
	    }
	}
	return retval;
    };

    /*
     * Function: color
     * 
     * Get color string for the entity, if it can be found in the
     * context.
     * 
     * Parameters:
     *  id - the string id of the entity
     * 
     * Returns:
     *  string label, or "#888888" if not found
     */
    this.color = function(id){
	
	if( this.dealias(id) ){
	    id = this.dealias(id);
	}
	var retval = '#888888';

	if( anchor.data && anchor.data.context && anchor.data.context[id] ){
	    var entry =  anchor.data.context[id];
	    if( entry['color'] ){
		retval = entry['color'];
	    }
	}
	return retval;
    };

};

///
/// Exportable body.
///

module.exports = amigo;
