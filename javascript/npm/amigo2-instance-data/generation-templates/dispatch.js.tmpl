/* 
 * Package: dispatch.js
 * 
 * Namespace: amigo.data.dispatch
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the YAML configuration files that AmiGO pulls in.
 *
 * The mapping file for data fields and contexts to functions, often
 * used for displays. See the package <handler.js> for the API to interact
 * with this data file.
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 *
 * NOTE: This file has a slightly different latout from the YAML
 * configuration file.
 */

var us = require('underscore');
var bbop = require('bbop-core');

var linker = null;

/*
 * Function: echo
 * 
 * Applies bbop.dump to whatever comes in.
 * Static function handler for echoing inputs--really used for
 * teaching and testing.
 *
 * Parameters:
 *  thing
 * 
 * Returns:
 *  a string; it /will/ be a string
 * 
 * Also See: <bbop.handler>
 */
var echo = function(thing, name, context){

    // Force a return string into existence.
    var retstr = null;
    try {
	retstr = bbop.dump(thing);
    } catch (x) {
	retstr = '';
    }

    // // Append any optional stuff.
    // if( is_def(name) && what_is(name) === 'string' ){
    // 	retstr += ' (' + name + ')';
    // }
    // if( is_def(context) && what_is(context) === 'string' ){
    // 	retstr += ' (' + context + ')';
    // }

    return retstr;
};

/*
 * Function: owl_class_expression
 *
 * Static function handler for displaying OWL class expression
 * results. To be used for GAF column 16 stuff.
 *
 * Example incoming data (as a string or object):
 * 
 * : { relationship: {
 * :     relation: [{id: "RO:001234", label: "regulates"},
 * :                {id:"BFO:0003456", label: "hp"}], 
 * :     id: "MGI:MGI:185963",
 * :     label: "kidney"
 * :   }
 * : }
 * 
 * Parameters:
 *  JSON object as *[string or object]*; see above
 * 
 * Returns:
 *  HTML string
 * 
 * Also See: <bbop.handler>
 */
var owl_class_expression = function(in_owlo){

    var retstr = "";

    // // Add logging.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // //logger.DEBUG = false;
    // function ll(str){ logger.kvetch(str); }

    var owlo = in_owlo;
    if( bbop.what_is(owlo) === 'string' ){
	// This should be an unnecessary robustness check as
	// everything /should/ be a legit JSON string...but things
	// happen in testing. We'll check to make sure that it looks
	// like what it should be as well.
	if( in_owlo.charAt(0) === '{' &&
	    in_owlo.charAt(in_owlo.length-1) === '}' ){
	    owlo = JSON.parse(in_owlo) || {};
	}else{
	    // Looks like a normal string string.
	    // Do nothing for now, but catch in the next section.
	}
    }

    // Check to make sure that it looks right.
    if( bbop.what_is(owlo) === 'string' ){
	// Still a string means bad happened--we want to see that.
	retstr = owlo + '?';
    }else if( typeof(owlo) === 'undefined' ||
	      typeof(owlo['relationship']) === 'undefined' ||
	      bbop.what_is(owlo['relationship']) !== 'object' ||
	      bbop.what_is(owlo['relationship']['relation']) !== 'array' ||
	      typeof(owlo['relationship']['id']) === 'undefined' ||
	      typeof(owlo['relationship']['label']) === 'undefined' ){
	// 'Twas an error--ignore.
	//throw new Error('sproing!');
    }else{
	
	// Okay, right structure--first assemble the relationships,
	// then tag onto end.
	var rel_buff = [];
	us.each(owlo['relationship']['relation'], function(rel){
	    // Check to make sure that these are
	    // structured correctly as well.
	    var rel_id = rel['id'];
	    var rel_lbl = rel['label'];
	    if( typeof(rel_id) !== 'undefined' && typeof(rel_lbl) !== 'undefined' ){
		var an = linker.anchor({id: rel_id, label: rel_lbl});
		// Final check: if we didn't get
		// anything reasonable, just a label.
		if( ! an ){ an = rel_lbl; }
		rel_buff.push(an);
		// ll('in ' + rel_id + ' + ' + rel_lbl + ': ' + an);
	    }
	});
	var ranc = linker.anchor({id: owlo['relationship']['id'],
				  label: owlo['relationship']['label']});
	// Again, a final check
	if( ! ranc ){ ranc = owlo['relationship']['label']; }
	retstr = rel_buff.join(' &rarr; ') + ' ' + ranc;
    }
    
    return retstr;
};

/*
 * Function: qualifiers
 * 
 * Essentially catch certain strings and hightlight them.
 * 
 * Example incoming data as string:
 * 
 * : "not"
 * 
 * Parameters:
 *  string or null
 * 
 * Returns:
 *  HTML string
 * 
 * Also See: <bbop.handler>
 */
var qualifiers = function(in_qual){

    var retstr = in_qual;

    if( typeof(in_qual) !== 'undefined' ){
	if( bbop.what_is(in_qual) === 'string' ){
	    if( in_qual === 'not' || in_qual === 'NOT' ){
		retstr = '<span class="qualifier-not">NOT</span>';
	    }
	}
    }

    return retstr;
};

/*
 * Function: alternate_id
 * 
 * Essentially do /nothing/ to alternate ids--ignore them.
 * 
 * Parameters:
 *  string or null
 * 
 * Returns:
 *  same
 * 
 * Also See: <bbop.handler>
 */
var alternate_id = function(id){

    var retstr = id;
    return retstr;
};

/*
 * Variable: dispatch
 * 
 * The configuration for the data.
 * Essentially a JSONification of the YAML file.
 * This should be consumed directly by <amigo.handler>.
 */
var dispatch_table = {
    "example_field" : {
	"context" : {
            "example_context": echo
	}
    },
    "annotation_extension_json" : {
	"context" : {
            "bbop-widget-set.live_results": owl_class_expression
	}
    },
    "qualifier" : {
	"context" : {
            "bbop-widget-set.live_results": qualifiers
	}
    },
    "alternate_id" : {
	"context" : {
            "bbop-widget-set.live_results": alternate_id
	}
    }
};

var dispatch_table_generator = function(required_linker){
    linker = required_linker;
    return dispatch_table;
};

///
/// Exportable body.
///

module.exports = dispatch_table_generator;
