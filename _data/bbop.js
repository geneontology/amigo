/* 
 * Package: core.js
 * 
 * Namespace: bbop.core
 * 
 * BBOP language extensions to JavaScript.
 * 
 * Purpose: Helpful basic utilities and operations to fix common needs in JS.
 */

// Module and namespace checking.
if ( typeof bbop == "undefined" ){ var bbop = {}; }
if ( typeof bbop.core == "undefined" ){ bbop.core = {}; }
if ( typeof amigo == "undefined" ){ var amigo = {}; }

/*
 * Variable: global
 * 
 * Capture the global object for later reference.
 * 
 * Used by namespace and require.
 * 
 * TODO: There is a temporary workaround for NodeJS here
 * TODO: Creates loop; problem?
 * 
 * Also see:
 *  <namespace>
 *  <requires>
 */
bbop.core.global = this;
if( typeof GLOBAL !== 'undefined' ){ // TODO: Better probe of NodeJS-ness.
    (function(){
	 var global_context = {};
	 global_context['bbop'] = GLOBAL['bbop'];
	 global_context['amigo'] = GLOBAL['amigo'];
	 bbop.core.global = global_context;
	 //bbop.core.global = GLOBAL;
     })();
}

///
/// Utility functions can hang as prototypes.
///

/*
 * Function: namespace
 * 
 * Create a namespace (chained object) in the global environment.
 * 
 * Parameters: An arbitrary number of strings.
 * 
 * Returns: Nothing. Side-effects: this function extends the global
 * object for easy namespace creation.
 * 
 * Also See: <require>
 */
bbop.core.namespace = function(){

    // Go through the arguments and add them to the namespace,
    // starting at global.
    var current_object = bbop.core.global;
    for ( var i = 0; i < arguments.length; i++ ) {
	var ns = arguments[i];
	if( ! current_object[ns] ){
	    current_object[ns] = {};
	}
	current_object = current_object[ns];
    }
    return current_object;
};

/*
 * Function: require
 * 
 * Throw an error unless a specified namespace is defined.
 * 
 * Parameters: An arbitrary number of strings.
 * 
 * Returns: Nothing. Side-effects: throws an error if the namespace
 * defined by the strings is not currently found.
 * 
 * Also See: <namespace>
 */
bbop.core.require = function(){

    // Walk through from global namespace, checking.
    var current_object = bbop.core.global;
    for ( var i = 0; i < arguments.length; i++ ) {
	var ns = arguments[i];
	if( ! current_object[ns] ){
	    throw new Error("Could not find required NS: " + ns);
	}
	current_object = current_object[ns];
    }
    return current_object;
};

/*
 * Function: crop
 *
 * Crop a string nicely.
 * 
 * Parameters:
 *  str - the string to crop
 *  lim - the final length to crop to (optional, defaults to 10)
 *  suff - the string to add to the end (optional, defaults to '')
 * 
 * Returns: Nothing. Side-effects: throws an error if the namespace
 * defined by the strings is not currently found.
 */
bbop.core.crop = function(str, lim, suff){
    var ret = str;

    var limit = 10;
    if( lim ){ limit = lim; }

    var suffix = '';
    if( suff ){ suffix = suff; }
    
    if( str.length > limit ){
	ret = str.substring(0, (limit - suffix.length)) + suffix;
    }
    return ret;
};

/*
 * Function: fold
 *
 * Fold a pair of hashes together, using the first one as an initial
 * template--only the keys in the default hash will be defined in the
 * final hash--and the second hash getting precedence.
 * 
 * The can be quite useful when defining functions--essentially
 * allowing a limited default value system for arguments.
 * 
 * Parameters:
 *  default_hash - Template hash.
 *  arg_hash - Argument hash to match.
 * 
 * Returns: A new hash.
 * 
 * Also see: <merge>
 */
bbop.core.fold = function(default_hash, arg_hash){

    if( ! default_hash ){ default_hash = {}; }
    if( ! arg_hash ){ arg_hash = {}; }

    var ret_hash = {};
    for( var key in default_hash ){
	if( bbop.core.is_defined(arg_hash[key]) ){
	    ret_hash[key] = arg_hash[key];
	}else{
	    ret_hash[key] = default_hash[key];
	}
    }
    return ret_hash;
};

/*
 * Function: merge
 *
 * Merge a pair of hashes together, the second hash getting
 * precedence. This is a superset of the keys both hashes.
 * 
 * Parameters:
 *  older_hash - first pass
 *  newer_hash - second pass
 * 
 * Returns: A new hash.
 * 
 * Also see: <fold>
 */
bbop.core.merge = function(older_hash, newer_hash){

    if( ! older_hash ){ older_hash = {}; }
    if( ! newer_hash ){ newer_hash = {}; }

    var ret_hash = {};
    function _add (key, val){
	ret_hash[key] = val;
    }
    bbop.core.each(older_hash, _add);
    bbop.core.each(newer_hash, _add);
    return ret_hash;
};

/*
 * Function: get_keys
 *
 * Get the hash keys from a hash/object, return as an array.
 *
 * Parameters:
 *  arg_hash - the hash in question
 *
 * Returns: an array of keys
 */
bbop.core.get_keys = function (arg_hash){

    if( ! arg_hash ){ arg_hash = {}; }
    var out_keys = [];
    for (var out_key in arg_hash) {
	if (arg_hash.hasOwnProperty(out_key)) {
	    out_keys.push(out_key);
	}
    }
    
    return out_keys;
};

/*
 * Function: hashify
 *
 * Returns a hash form of the argument array/list. For example ['a',
 * 'b'] would become {'a': true, 'b': true} or [['a', '12'], ['b',
 * '21']] would become {'a': '12', 'b': '21'}. Using mixed sub-lists
 * is undefined.
 *
 * Parameters:
 *  list - the list to convert
 *
 * Returns: a hash
 */
bbop.core.hashify = function (list){
    var rethash = {};

    if( list && list[0] ){
	if( bbop.core.is_array(list[0]) ){
	    bbop.core.each(list,
			   function(item){
			       var key = item[0];
			       var val = item[1];
			       if( bbop.core.is_defined(key) ){
				   rethash[key] = val;
			       }
			   });
	}else{
	    bbop.core.each(list,
			   function(item){
			       rethash[item] = true;
			   });
	}
    }

    return rethash;
};

/*
 * Function: is_same
 *
 * Returns true if it things the two incoming arguments are value-wise
 * the same.
 * 
 * Currently only usable for simple (atomic single layer) hashes,
 * atomic lists, boolean, null, number, and string values. Will return
 * false otherwise.
 * 
 * Parameters:
 *  thing1 - thing one
 *  thing2 - thing two
 *
 * Returns: boolean
 */
bbop.core.is_same = function (thing1, thing2){

    var retval = false;

    // If is hash...steal the code from test.js.
    if( bbop.core.is_hash(thing1) && bbop.core.is_hash(thing2) ){
	
	var same_p = true;
	
	// See if the all of the keys in hash1 are defined in hash2
	// and that they have the same ==.
	for( var k1 in thing1 ){
	    if( typeof thing2[k1] === 'undefined' ||
		thing1[k1] !== thing2[k1] ){
		    same_p = false;
		    break;
		}
	}

	// If there is still no problem...
	if( same_p ){
	    
	    // Reverse of above.
	    for( var k2 in thing2 ){
		if( typeof thing1[k2] === 'undefined' ||
		    thing2[k2] !== thing1[k2] ){
			same_p = false;
			break;
		    }
	    }
	}

	retval = same_p;

    }else if( bbop.core.is_array(thing1) && bbop.core.is_array(thing2) ){
	// If it's an array convert and pass it off to the hash function.
	retval = bbop.core.is_same(bbop.core.hashify(thing1),
				   bbop.core.hashify(thing2));
    }else{
	
	// So, we're hopefully dealing with an atomic type. If they
	// are the same, let's go ahead and try.
	var t1_is = bbop.core.what_is(thing1);
	var t2_is = bbop.core.what_is(thing2);
	if( t1_is == t2_is ){
	    if( t1_is == 'null' ||
		t1_is == 'boolean' ||
		t1_is == 'null' ||
		t1_is == 'number' ||
		t1_is == 'string' ){
		    if( thing1 == thing2 ){
			retval = true;
		    }
		}
	}
    }

    return retval;
};

/*
 * Function: what_is
 *
 * Return the string best guess for what the input is, null if it
 * can't be identified. In addition to the _is_a property convention,
 * current core output strings are: 'null', 'array', 'boolean',
 * 'number', 'string', 'function', and 'object'.
 * 
 * Parameters: 
 *  in_thing - the thing in question
 *
 * Returns: a string
 */
bbop.core.what_is = function(in_thing){
    var retval = null;
    if( typeof(in_thing) != 'undefined' ){

	// If it's an object, try and guess the 'type', otherwise, let
	// typeof.
	if( in_thing == null ){
	    retval = 'null';
	}else if( typeof(in_thing) == 'object' ){
	    
	    // Look for the 'is_a' property that I should be using.
	    if( typeof(in_thing._is_a) != 'undefined' ){
		retval = in_thing._is_a;
	    }else{
		if( bbop.core.is_array(in_thing) ){
		    retval = 'array';
		}else{
		    retval = 'object';
		}		
	    }
	}else{
	    retval = typeof(in_thing);
	}
    }
    return retval;
};

/*
 * Function: is_array
 *
 * Return the best guess (true/false) for whether or not a given
 * object is being used as an array.
 *
 * Parameters: 
 *  in_thing - the thing in question
 *
 * Returns: boolean
 */
bbop.core.is_array = function(in_thing){
    var retval = false;
    if( in_thing &&
	typeof(in_thing) == 'object' &&
	typeof(in_thing.push) == 'function' &&
	typeof(in_thing.length) == 'number' ){
	retval = true;
    }
    return retval;
};

/*
 * Function: is_hash
 *
 * Return the best guess (true/false) for whether or not a given
 * object is being used as a hash.
 *
 * Parameters: 
 *  in_thing - the thing in question
 *
 * Returns: boolean
 */
bbop.core.is_hash = function(in_thing){
    var retval = false;
    if( in_thing &&
	typeof(in_thing) == 'object' &&
	(! bbop.core.is_array(in_thing)) ){
	retval = true;
    }
    return retval;
};

/*
 * Function: is_empty
 *
 * Return true/false on whether or not the object in question has any
 * items of interest (iterable?).
 *
 * Parameters: 
 *  in_thing - the thing in question
 *
 * Returns: boolean
 */
bbop.core.is_empty = function(in_thing){
    var retval = false;
    if( bbop.core.is_array(in_thing) ){
	if( in_thing.length == 0 ){
	    retval = true;
	}
    }else if( bbop.core.is_hash(in_thing) ){
	var in_hash_keys = bbop.core.get_keys(in_thing);
	if( in_hash_keys.length == 0 ){
	    retval = true;
	}
    }else{
	// TODO: don't know about this case yet...
	//throw new Error('unsupported type in is_empty');	
	retval = false;
    }
    return retval;
};

/*
 * Function: is_defined
 *
 * Return true/false on whether or not the passed object is defined.
 *
 * Parameters: 
 *  in_thing - the thing in question
 *
 * Returns: boolean
 */
bbop.core.is_defined = function(in_thing){
    var retval = true;
    if( typeof(in_thing) === 'undefined' ){
	retval = false;
    }
    return retval;
};

/*
 * Function: each
 *
 * Implement a simple iterator so I don't go mad.
 *  array - function(item, index)
 *  object - function(key, value)
 *
 *  TODO/BUG/WARNING?: This does not seem to work with the local
 *  function variable "arguments".
 * 
 * Parameters: 
 *  in_thing - hash or array
 *  in_function - function to apply to elements
 *
 * Returns:
 *  n/a
 */
bbop.core.each = function(in_thing, in_function){

    // Probably an not array then.
    if( typeof(in_thing) == 'undefined' ){
	// this is a nothing, to nothing....
    }else if( typeof(in_thing) != 'object' ){
	throw new Error('Unsupported type in bbop.core.each: ' +
			typeof(in_thing) );
    }else if( bbop.core.is_hash(in_thing) ){
	// Probably a hash...
	var hkeys = bbop.core.get_keys(in_thing);
	for( var ihk = 0; ihk < hkeys.length; ihk++ ){
	    var ikey = hkeys[ihk];
	    var ival = in_thing[ikey];
	    in_function(ikey, ival);
	}
    }else{
	// Otherwise likely an array.
	for( var iai = 0; iai < in_thing.length; iai++ ){
	    in_function(in_thing[iai], iai);
	}
    }
};

/*
 * Function: pare
 *
 * Take an array or hash and pare it down using a couple of functions
 * to what we want.
 * 
 * Both parameters are optional in the sense that you can set them to
 * null and they will have no function; i.e. a null filter will let
 * everything through and a null sort will let things go in whatever
 * order.
 *
 * Parameters: 
 *  in_thing - hash or array
 *  filter_function - hash (function(key, val)) or array (function(item, i)).
 *   This function must return boolean true or false.
 *  sort_function - function to apply to elements: function(a, b)
 *   This function must return an integer as the usual sort functions do.
 *
 * Returns: An array.
 */
bbop.core.pare = function(in_thing, filter_function, sort_function){

    var ret = [];
    
    // Probably an not array then.
    if( typeof(in_thing) == 'undefined' ){
	// this is a nothing, to nothing....
    }else if( typeof(in_thing) != 'object' ){
	throw new Error('Unsupported type in bbop.core.pare: ' +
			typeof(in_thing) );
    }else if( bbop.core.is_hash(in_thing) ){
	// Probably a hash; filter it if filter_function is defined.
	if( filter_function ){	
	    bbop.core.each(in_thing,
			   function(key, val){
			       if( filter_function(key, val) ){
				   // Remove matches to the filter.
			       }else{
				   ret.push(val);
			       }
			   });
	}else{
	    bbop.core.each(in_thing, function(key, val){ ret.push(val); });
	}
    }else{
	// Otherwise, probably an array; filter it if filter_function
	// is defined.
	if( filter_function ){	
	    bbop.core.each(in_thing,
			   function(item, index){
			       if( filter_function(item, index) ){
				   // filter out item if true
			       }else{
				   ret.push(item);
			       }
			   });
	}else{
	    bbop.core.each(in_thing, function(item, index){ ret.push(item); });
	}
    }

    // For both: sort if there is anything.
    if( ret.length > 0 && sort_function ){
	ret.sort(sort_function);	    
    }

    return ret;
};

/*
 * Function: clone
 *
 * Clone an object down to its atoms.
 *
 * Parameters: 
 *  thing - whatever
 *
 * Returns: a new whatever
 */
bbop.core.clone = function(thing){

    var clone = null;

    if( typeof(thing) == 'undefined' ){
	// Nothin' doin'.
	//print("looks undefined");
    }else if( typeof(thing) == 'function' ){
	// Dunno about this case...
	//print("looks like a function");
	clone = thing;
    }else if( typeof(thing) == 'boolean' ||
	      typeof(thing) == 'number' ||
	      typeof(thing) == 'string' ){
	// Atomic types can be returned as-is (i.e. assignment in
	// JS is the same as copy for atomic types).
	//print("cloning atom: " + thing);
	clone = thing;
    }else if( typeof(thing) == 'object' ){
	// Is it a hash or an array?
	if( typeof(thing.length) == 'undefined' ){
	    // Looks like a hash!
	    //print("looks like a hash");
	    clone = {};
	    for(var h in thing){
		clone[h] = bbop.core.clone(thing[h]);
	    }
	}else{
	    // Looks like an array!
	    //print("looks like an array");
	    clone = [];
	    for(var i = 0; i < thing.length; i++){
		clone[i] = bbop.core.clone(thing[i]);
	    }
	}
    }else{
	// Then I don't know what it is--might be platform dep.
	//print("no idea what it is");
    }
    return clone;
};

/*
 * Function: to_string
 *
 * Essentially add standard 'to string' interface to the string class
 * and as a stringifier interface to other classes. More meant for
 * output. Only atoms, arrays, and objects with a to_string function
 * are handled.
 *
 * Parameters: 
 *  in_thing - something
 *
 * Returns: string
 * 
 * Also See: <dump>
 */
bbop.core.to_string = function(in_thing){

    var what = bbop.core.what_is(in_thing);
    if( what == 'number' ){
	return in_thing.toString();
    }else if( what == 'string' ){
	return in_thing;
    }else if( what == 'array' ){
	return bbop.core.dump(in_thing);
    }else if( in_thing.to_string && typeof(in_thing.to_string) == 'function' ){
	return in_thing.to_string();
    }else{
	throw new Error('to_string interface not defined for this object');
    }
};

/*
 * Function: dump
 *
 * Dump an object to a string form as best as possible. More meant for
 * debugging. For a slightly different take, see to_string.
 *
 * Parameters: 
 *  in_thing - something
 *
 * Returns: string
 * 
 * Also See: <to_string>
 */
bbop.core.dump = function(thing){

    var retval = '';

    var what = bbop.core.what_is(thing);
    if( what == null ){
	retval = 'null';
    }else if( what == 'null' ){
	retval = 'null';
    }else if( what == 'string' ){
	retval = '"' + thing + '"';
    }else if( what == 'boolean' ){
	if( thing ){
	    retval = "true";
	}else{
	    retval = "false";
	}
    }else if( what == 'array' ){

	var astack = [];
	bbop.core.each(thing, function(item, i){
			   astack.push(bbop.core.dump(item));
		       });
	retval = '[' + astack.join(', ') + ']';

    }else if( what == 'object' ){

	var hstack = [];
	bbop.core.each(thing, function(key, val){
			   hstack.push('"'+ key + '": ' +
				       bbop.core.dump(val));
		       });
	retval = '{' + hstack.join(', ') + '}';

    }else{
	retval = thing;
    }

    return retval;
};

/*
 * Function: has_interface
 *
 * Check to see if all top-level objects in a namespace supply an
 * "interface".
 * 
 * Mostly intended for use during unit testing.
 *
 * Parameters: 
 *  iobj - the object/constructor in question
 *  interface_list - the list of interfaces (as a strings) we're looking for
 *
 * Returns: boolean
 *
 * TODO: Unit test this to make sure it catches both prototype (okay I
 * think) and uninstantiated objects (harder/impossible?).
 */
bbop.core.has_interface = function(iobj, interface_list){
    var retval = true;
    bbop.core.each(interface_list,
		   function(iface){
		       //print('|' + typeof(in_key) + ' || ' + typeof(in_val));
		       //print('|' + in_key + ' || ' + in_val);
		       if( typeof(iobj[iface]) == 'undefined' &&
			   typeof(iobj.prototype[iface]) == 'undefined' ){
			   retval = false;
			   throw new Error(bbop.core.what_is(iobj) +
					   ' breaks interface ' + 
					   iface);
                       }
		   });
    return retval;
};

/*
 * Function: get_assemble
 *
 * Assemble an object into a GET-like query. You probably want to see
 * the tests to get an idea of what this is doing.
 * 
 * The last argument of double hashes gets quoted (Solr-esque),
 * otherwise not.
 *
 * This does nothing to make the produced "URL" in any way safe.
 * 
 * WARNING: Not a hugely clean function--there are a lot of special
 * cases and it could use a good (and safe) clean-up.
 * 
 * Parameters: 
 *  qargs - hash/object
 *
 * Returns: string
 */
bbop.core.get_assemble = function(qargs){

    var mbuff = [];
    for( var qname in qargs ){
	var qval = qargs[qname];

	if( typeof qval == 'string' || typeof qval == 'number' ){
	    // Is standard name/value pair.
	    var nano_buffer = [];
	    nano_buffer.push(qname);
	    nano_buffer.push('=');
	    nano_buffer.push(qval);
	    mbuff.push(nano_buffer.join(''));
	}else if( typeof qval == 'object' ){
	    if( typeof qval.length != 'undefined' ){
		// Is array (probably).
		// Iterate through and double on.
		for(var qval_i = 0; qval_i < qval.length ; qval_i++){
		    var nano_buff = [];
		    nano_buff.push(qname);
		    nano_buff.push('=');
		    nano_buff.push(qval[qval_i]);
		    mbuff.push(nano_buff.join(''));
		}
	    }else{
		// // TODO: The "and" case is pretty much like
		// // the array, the "or" case needs to be
		// // handled carefully. In both cases, care will
		// // be needed to show which filters are marked.
		// Is object (probably).
		// Special "Solr-esque" handling.
		for( var sub_name in qval ){
		    var sub_vals = qval[sub_name];

		    // Since there might be an array down there,
		    // ensure that there is an iterate over it.
		    if( bbop.core.what_is(sub_vals) != 'array' ){
			sub_vals = [sub_vals];
		    }

		    var loop = bbop.core.each;
		    loop(sub_vals,
			 function(sub_val){
			     var nano_buff = [];
			     nano_buff.push(qname);
			     nano_buff.push('=');
			     nano_buff.push(sub_name);
			     nano_buff.push(':');
			     if( typeof sub_val !== 'undefined' && sub_val ){
				 nano_buff.push('"' + sub_val + '"');
			     }else{
				 nano_buff.push('""');
			     }
			     mbuff.push(nano_buff.join(''));
			 });
		}
	    }
	}else if( typeof qval == 'undefined' ){
	    // This happens in some cases where a key is tried, but no
	    // value is found--likely equivalent to q="", but we'll
	    // let it drop.
	    // var nano_buff = [];
	    // nano_buff.push(qname);
	    // nano_buff.push('=');
	    // mbuff.push(nano_buff.join(''));	    
	}else{
	    throw new Error("bbop.core.get_assemble: unknown type: " + 
			    typeof(qval));
	}
    }
    
    return mbuff.join('&');
};

/*
 * Function: 
 *
 * Random number generator of fixed length. Return a random number
 * string of length len.
 *
 * Parameters: 
 *  len - the number of random character to return.
 *
 * Returns: string
 */
bbop.core.randomness = function(len){

    var random_base =
	['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
	 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var length = len || 10;
    var cache = new Array();
    for( var ii = 0; ii < length; ii++ ){
	var rbase_index = Math.floor(Math.random() * random_base.length);
	cache.push(random_base[rbase_index]);
    }
    return cache.join('');
};

/*
 * Function: first_split
 *
 * Attempt to return a two part split on the first occurrence of a
 * character.
 *
 * Returns '' for parts not found.
 * 
 * Unit tests make the edge cases clear.
 * 
 * Parameters:
 *  character - the character to split on
 *  string - the string to split
 *
 * Returns:
 *  list of first and second parts
 */
bbop.core.first_split = function(character, string){

    var retlist = null;

    var eq_loc = string.indexOf(character);
    if( eq_loc == 0 ){
	retlist = ['', string.substr(eq_loc +1, string.length)];
    }else if( eq_loc > 0 ){
	var before = string.substr(0, eq_loc);
	var after = string.substr(eq_loc +1, string.length);
	retlist = [before, after];
    }else{
	retlist = ['', ''];
    }

    return retlist;
};

/*
 * Function: url_parameters
 *
 * Return the parameters part of a URL.
 *
 * Unit tests make the edge cases clear.
 * 
 * Parameters:
 *  url - url (or similar string)
 *
 * Returns:
 *  list of part lists
 */
bbop.core.url_parameters = function(url){

    var retlist = [];

    // Pull parameters.
    var tmp = url.split('?');
    var path = '';
    var parms = [];
    if( ! tmp[1] ){ // catch bad url--nothing before '?'
	parms = tmp[0].split('&');
    }else{ // normal structure
	path = tmp[0];
	parms = tmp[1].split('&');
    }

    // Decompose parameters.
    bbop.core.each(parms,
		  function(p){
		      var c = bbop.core.first_split('=', p);
		      if( ! c[0] && ! c[1] ){
			  retlist.push([p]);
		      }else{
			  retlist.push(c);		  
		      }
		  });
    
    return retlist;
};

/*
 * Function: resourcify
 *
 * Convert a string into something consistent for urls (getting icons,
 * etc.). Return a munged/hashed-down version of the resource.
 * Assembles, converts spaces to underscores, and all lowercases.
 * 
 * Parameters:
 *  base - base url for the resource(s)
 *  resource - the filename or whatever to be transformed
 *  extension - *[optional]* the extension of the resource
 *
 * Returns:
 *  string
 */
bbop.core.resourcify = function(base, resource, extension){

    var retval = base + '/' + resource;

    // Add the extension if it is there.
    if( extension ){
	retval += '.' + extension;	
    }

    // Spaces to underscores and all lowercase.
    return retval.replace(" ", "_", "g").toLowerCase();
};

/*
 * Function: uuid
 *
 * RFC 4122 v4 compliant UUID generator.
 * From: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
 *
 * Parameters:
 *  n/a
 *
 * Returns:
 *  string
 */
bbop.core.uuid = function(){

    // Replace x (and y) in string.
    function replacer(c) {
	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	return v.toString(16);
    }
    var target_str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return target_str.replace(/[xy]/g, replacer);
};

/*
 * Function: numeric_sort_ascending
 *
 * A sort function to put numbers in ascending order.
 * 
 * Useful as the argument to .sort().
 * 
 * See: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort
 * 
 * Parameters:
 *  a - the first number
 *  b - the second number
 *
 * Returns:
 *  number of their relative worth
 */
bbop.core.numeric_sort_ascending = function(a, b){
    return a - b;
};

/*
 * Function: numeric_sort_descending
 *
 * A sort function to put numbers in descending order.
 * 
 * Useful as the argument to .sort().
 * 
 * See: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort
 * 
 * Parameters:
 *  a - the first number
 *  b - the second number
 *
 * Returns:
 *  number of their relative worth
 */
bbop.core.numeric_sort_descending = function(a, b){
    return b - a;
};

/*
 * Function: extend
 * 
 * What seems to be a typical idiom for subclassing in JavaScript.
 * 
 * This attempt has been scraped together from bits here and there and
 * lucid explanations from Mozilla:
 * 
 * https://developer.mozilla.org/en-US/docs/JavaScript/Introduction_to_Object-Oriented_JavaScript
 * https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Details_of_the_Object_Model
 * https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Inheritance_Revisited
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/new
 * 
 * Parameters:
 *  subclass - the subclass object
 *  superclass - the superclass object
 * 
 * Returns:
 *  n/a
 */
bbop.core.extend = function(subclass, baseclass){

    // Create a temporary nothing so that we don't fiddle the
    // baseclass's(?) with what we do to subclass later on.
    function tmp_object(){}

    // This nothings prototype gets the base class's.
    tmp_object.prototype = baseclass.prototype;

    // We instantiate the tmp_object, whose prototype is the
    // baseclass's; we make subclass's prototype this object, giving
    // us something that is very much like baseclass.
    subclass.prototype = new tmp_object; // same as: "new tmp_object();"

    // Now we go back and make the constructor of subclass actually
    // subclass again--we blew it away in the last step. Now we have a
    // subclass constructor with the protoype of baseclass.
    subclass.prototype.constructor = subclass;

    // // Create a property to allow access to the constructor of
    // // baseclass. This is useful when subclass needs access to
    // // baseclass's constructor for property setting.
    // subclass.base_constructor = baseclass;

    // // Create a property to
    // subclass.parent_class = baseclass.prototype;
};

// /*
//  * Function: coder
//  *
//  * An object that functions to encode and decode data that we might be
//  * hiding in element ids.
//  * 
//  * This constructor takes hash parameters.
//  *
//  * Parameters: 
//  *  string - the base "namespace" string to use; has a default
//  *  size - 
//  *
//  * Returns: 
//  *  bbop.core.coder object
//  */
// bbop.core.coder = function(args){

//     var mangle_base_string = "bbop_core_coder_mangle_";
//     var mangle_base_space_size = 10;

//     var defs = {string: mangle_base_string, size: mangle_base_space_size};
//     var final_args = bbop.core.fold(defs, args);
//     var mangle_str = final_args['string'];
//     var space_size = final_args['size'];

//     // TODO/BUG: apparently, html ids can only be of a limited
//     // character set.
//     //var en_re = new RegExp("/:/", "gi");
//     //var de_re = new RegExp("/-_-/", "gi");
//     this.encode = function(str){
// 	// Mangle and encode.
// 	var new_str = mangle_str + bbop.core.randomness(space_size) +'_'+ str;
// 	// TODO:
// 	// str.replace(en_re, "-_-");
// 	return new_str;
//     };
//     this.decode = function(str){	    
// 	// Decode and demangle.
// 	var new_str = str.substring(mangle_str.length + space_size + 1);
// 	// TODO:
// 	// str.replace(de_re, ":");
// 	return new_str;
//     };
// };
/* 
 * Package: version.js
 * 
 * Namespace: bbop.version
 * 
 * This package was automatically created during the release process
 * and contains its version information--this is the release of the 
 * API that you have.
 */

bbop.core.namespace('bbop', 'version');
bbop.version = {};

/*
 * Variable: revision
 *
 * Partial version for this library; revision (major/minor version numbers)
 * information.
 */
bbop.version.revision = "0.9";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
bbop.version.release = "20121210";
/*
 * Package: logger.js
 * 
 * Namespace: bbop.logger
 * 
 * BBOP JS logger object.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'logger');

/*
 * Constructor: logger
 * 
 * Arguments: (optional) initial context.
 */
bbop.logger = function(initial_context){

    /*
     * Variable: DEBUG 
     * 
     * Different debugging available per object. Externally toggle
     * between true and false to switch on and off the logging.
     */
    this.DEBUG = false;

    var anchor = this;

    // Define an optional context to tag onto the front of messages.
    this._context = [];
    if( initial_context ){
	this._context = [initial_context];
    }

    /*
     * Function: reset_context
     * 
     * Define the ability to reset the contex.
     * 
     * Arguments:
     *  new_initial_context - (optional) New context to start with.
     */
    this.reset_context = function(new_initial_context){
	if( new_initial_context ){
	    this._context = [new_initial_context];
	}else{
	    this._context = [];	    
	}
    };

    /*
     * Function: push_context
     * 
     * Add an additional logging context to the stack.
     * 
     * Arguments:
     *  new_context - New context to add to the context stack.
     */
    this.push_context = function(new_context){
	this._context.push(new_context);
    };

    /*
     * Function: pop_context
     * 
     * Remove the last context if it's there.
     */
    this.pop_context = function(){
	var popped_context = null;
	if( this._context.length > 0 ){
	    popped_context = this._context.pop();
	}
	return popped_context;
    };

    // Generalizer console (or whatever) printing.
    this._console_sayer = function(){};

    // Check for: Opera, FF, Safari, Chrome, console, etc.
    if( typeof(opera) != 'undefined' &&
	typeof(opera.postError) == 'function' ){
	// If opera is in there, probably opera.
	this._console_sayer = function(msg){ opera.postError(msg + "\n"); };
    }else if( typeof(window) != 'undefined' &&
	      typeof(window.dump) == 'function' ){
	// From developer.mozilla.org: To see the dump output you have
	// to enable it by setting the preference
	// browser.dom.window.dump.enabled to true. You can set the
	// preference in about:config or in a user.js file. Note: this
	// preference is not listed in about:config by default, you
	// may need to create it (right-click the content area -> New
	// -> Boolean).
	this._console_sayer = function(msg){ dump( msg + "\n"); };
    }else if( typeof(window) != 'undefined' &&
	      typeof(window.console) != 'undefined' &&
	      typeof(window.console.log) == 'function' ){
	// From developer.apple.com: Safari's "Debug" menu allows you
	// to turn on the logging of JavaScript errors. To display the
	// debug menu in Mac OS X, open a Terminal window and type:
	// "defaults write com.apple.Safari IncludeDebugMenu 1" Need
	// the wrapper function because safari has personality
	// problems.
	this._console_sayer = function(msg){ window.console.log(msg + "\n"); };
    }else if( typeof(console) != 'undefined' &&
	      typeof(console.log) == 'function' ){
	// This may be okay for Chrome and a subset of various console
	// loggers.
	this._console_sayer = function(msg){ console.log(msg + "\n"); };
    }else if( typeof(build) == 'function' &&
	      typeof(getpda) == 'function' &&
	      typeof(pc2line) == 'function' &&
	      typeof(print) == 'function' ){
	// This may detect SpiderMonkey on the comand line.
	this._console_sayer = function(msg){ print(msg); };
    }else if( typeof(org) != 'undefined' &&
	      typeof(org.rhino) != 'undefined' &&
	      typeof(print) == 'function' ){
	// This may detect Rhino on the comand line.
	this._console_sayer = function(msg){ print(msg); };
    }
    
    /*
     * Function: kvetch
     * 
     * Log a string to somewhere. Also return a string to (mostly for
     * the unit tests).
     * 
     * Arguments:
     *  string - The string to print out to wherever we found.
     */
    this.kvetch = function(string){
	var ret_str = null;
	if( anchor.DEBUG == true ){

	    // Make sure there is something there no matter what.
	    if( typeof(string) == 'undefined' ){ string = ''; }

	    // Redefined the string a little if we have contexts.
	    if( anchor._context.length > 0 ){
		var cstr = anchor._context.join(':');
		string = cstr + ': '+ string;
	    }

	    // Actually log to the console.
	    anchor._console_sayer(string);

	    // Bind for output.
	    ret_str = string;
	}
	return ret_str;
    };
};
/*
 * Package: template.js
 * 
 * Namespace: bbop.template
 * 
 * BBOP JS template object/enginette.
 * 
 * Some (nonsensical) usage is like:
 * 
 * : var tt = new bbop.template("{{foo}} {{bar}} {{foo}}");
 * : 'A B A' == tt.fill({'foo': 'A', 'bar': 'B'});
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'template');

/*
 * Constructor: template
 * 
 * Arguments:
 *  template_string - the string template to use for future fill calls
 * 
 * Returns:
 *  self
 */
bbop.template = function(template_string){
    this.is_a = 'bbop.template';

    var anchor = this;

    anchor._template_string = template_string;

    // First break the template string into ordered sections which we
    // will interleve later.
    var split_re = /\{\{[A-Za-z0-9_-]+\}\}/;
    anchor._template_split_strings =
	template_string.split(split_re);

    // Now map out which variables are at which locations.
    var var_id_re = /\{\{[A-Za-z0-9_-]+\}\}/g;
    anchor._var_id_matches =
	template_string.match(var_id_re);
    // Trim off the '{{' and '}}' from the matches.
    bbop.core.each(anchor._var_id_matches,
		  function(item, index){
		      var new_item = item.substring(2, item.length -2);
		      anchor._var_id_matches[index] = new_item;
		  });

    /*
     * Function: fill
     * 
     * Fill the template with the corresponding hash items. Undefined
     * variables are replaces with ''.
     * 
     * Arguments:
     *  fill_hash - the template with the hashed values
     * 
     * Returns:
     *  string
     */
    this.fill = function(fill_hash){
	var ret_str = '';

	bbop.core.each(anchor._template_split_strings,
		       function(str, index){

			   // Add the next bit.
			   ret_str += str;

			   // Add the replacement value if we can make
			   // sense of it.
			   if( index < anchor._var_id_matches.length ){
			       var use_str = '';
			       var varname = anchor._var_id_matches[index];
			       if( varname &&
				   bbop.core.is_defined(fill_hash[varname]) ){
				   use_str = fill_hash[varname];
			       }
			       ret_str += use_str;
			   }
		       });

	return ret_str;
    };

    /*
     * Function: variables
     * 
     * Return a hash of the variables used in the template.
     * 
     * Arguments:
     *  n/a
     * 
     * Returns:
     *  a hash like: {'foo': true, 'bar': true, ...}
     */
    this.variables = function(){
	return bbop.core.hashify(anchor._var_id_matches);
    };

};
/* 
 * Package: test.js
 * 
 * Namespace: bbop.test
 * 
 * A trivial testing framework for JS. See test.tests.js for usage.
 * 
 *  Note: this cannot depend on core.js (it tests that), so some stuff
 *  may be duped. On the other hand, we can test ourselves--see
 *  test.js.tests.
 */

// Module and namespace checking.
if ( typeof bbop == "undefined" ){ var bbop = {}; }

/*
 * Constructor: test
 * 
 * Contructor for the BBOP JS unit test system.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  BBOP test suite object
 */
bbop.test = function(){

    ///
    /// Accounting and reporting.
    ///

    var test_number = 1;
    var tests_passed = 0;
    var tests_failed = 0;
    function _incr_tests(){ test_number = test_number + 1; }
    function _incr_passed(){ tests_passed = tests_passed + 1; }
    function _incr_failed(){ tests_failed = tests_failed + 1; }
    function _incr_failed(){ tests_failed = tests_failed + 1; }
    function _complete(bool, msg){
	if( bool ){
	    if( msg ){
		print('Test ' + test_number + ' passed: ' + msg + '.');
	    }else{
		print('Test ' + test_number + ' passed.');
	    }
	    _incr_passed();
	}else{
	    if( msg ){
		print('FAIL: Test ' + test_number + ' failed: ' + msg + '.');
	    }else{
		print('FAIL: Test ' + test_number + ' failed.');
	    }
	    _incr_failed();
	}
	test_number++;	
    }

    /*
     * Function: report
     *
     * Print a report about what happened during the tests.
     *
     * Parameters: 
     *  n/a
     *
     * Returns: 
     *  n/a; but prints the report as a side-effect
     */
    this.report = function(){
	if( tests_passed + 1 == test_number ){
	    print('* All tests passed.');
	}else{
	    print('* Tests passed: ' + tests_passed);
	    print('* Tests failed: ' + tests_failed);
	}
    };

    ///
    /// Internal helper functions--different kinds of comparisions.
    ///

    //
    function _same_array(one, two){
	var retval = true;
	if( one.length != two.length ){
	    retval = false;
	}else{
	    for( var i = 0; i < one.length; i++ ){
		if( one[i] != two[i] ){
		    retval = false;
		    break;
		}
	    }
	}
	return retval;
    }

    // Looking at array as sets of...something.
    function _same_set(set1, set2){
	var h1 = {};
	var h2 = {};
	for( var h1i = 0; h1i < set1.length; h1i++ ){ h1[set1[h1i]] = 1; }
	for( var h2i = 0; h2i < set2.length; h2i++ ){ h2[set2[h2i]] = 1; }
	return _same_hash(h1, h2);
    }

    // NOTE/WARNING: This is a very shallow comparison function.
    function _same_hash(hash1, hash2){

	var same_p = true;
	
	// See if the all of the keys in hash1 are defined in hash2
	// and that they have the same ==.
	for( var k1 in hash1 ){
	    if( typeof hash2[k1] === 'undefined' ||
		hash1[k1] !== hash2[k1] ){
		same_p = false;
		break;
	    }
	}

	// If there is still no problem...
	if( same_p ){

	    // Reverse of above.
	    for( var k2 in hash2 ){
		if( typeof hash1[k2] === 'undefined' ||
		    hash2[k2] !== hash1[k2] ){
		    same_p = false;
		    break;
		}
	    }
	}
	
	return same_p;
    }

    // TODO: This could probably be done better.
    function _link_comp(str1, str2){

	// Decompose links and arguments.
	var tmp1 = str1.split('?');
	var head1 = '';
	var args1 = [];
	if( ! tmp1[1] ){ // nothing before '?'
	    args1 = tmp1[0].split('&');
	}else{ // normal structure
	    head1 = tmp1[0];
	    args1 = tmp1[1].split('&');
	}
	var sorted_args1 = args1.sort();

	var tmp2 = str2.split('?');
	var head2 = '';
	var args2 = [];
	if( ! tmp2[1] ){ // nothing before '?'
	    args2 = tmp2[0].split('&');
	}else{ // normal structure
	    head2 = tmp2[0];
	    args2 = tmp2[1].split('&');
	}
	var sorted_args2 = args2.sort();

	// var tmp2 = str2.split('?');
	// var head2 = tmp2[0];
	// var args2 = tmp2[1].split('&');
	// var sorted_args2 = args2.sort();

	// Compare heads and arguments.
	var retval = false;
	if( head1 == head2 &&
	    _same_array(sorted_args1, sorted_args2) ){
	    retval = true;
	}
	return retval;
    }

    // Walk through the list and see if it's there.
    // If compareator is not defined, just to atom comparison.
    function _in_list(in_item, list, comparator){

	var retval = false;
	for(var li = 0; li < list.length; li++ ){
	    var list_item = list[li];

	    if( comparator ){
		var comp_op = comparator(in_item, list_item);
		if( comp_op && comp_op == true ){
		    retval = true;
		}
	    }else{
		if( in_item == list_item ){
		    retval = true;
		}
	    }
	}

	return retval;
    }

    // Basically asking if you can make the target string from the
    // base string with the add_str added into it somewhere. Strange,
    // but another way of looking at URL creation in some cases.
    function _is_string_embedded(target_str, base_str, add_str){

	// Walk through all of ways of splitting base_str and add
	// add_str in there to see if we get the target_str.
	var retval = false;
	for(var si = 0; si <= base_str.length; si++ ){
	    
	    var car = base_str.substr(0, si);
	    var cdr = base_str.substr(si, base_str.length);
	    //print(car + "|" + add_str + "|" + cdr);
	    if( car + add_str + cdr == target_str){
		retval = true;
		break;
	    }
	}
	return retval;
    }

    ///
    /// End-user comparisions and assertions.
    ///

    /*
     * Function: is_same_atom
     *
     * Test whether two atoms are the same.
     *
     * Parameters: 
     *  question - the atom to test
     *  answer - the expected atom
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    function _is_simple_same(question, answer, msg){
	_complete(question == answer, msg);
    }
    this.is_same_atom = _is_simple_same;

    /*
     * Function: is_different_atom
     *
     * A negative version of <is_same_atom>.
     *
     * Parameters: 
     *  question - the atom to test
     *  answer - the unexpected atom
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_different_atom = function(question, answer, msg){
	_complete(question != answer, msg);
    };

    /*
     * Function: is_defined
     *
     * Test whether a value is defined.
     *
     * Parameters: 
     *  thing - the value to test for being defined
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_defined = function(thing, msg){
	if( thing ){
	    _complete(true, msg);
	}else{
	    _complete(false, msg);
	}
    };

    /*
     * Function: is_not_defined
     *
     * A negative version of <is_defined>.
     *
     * Parameters: 
     *  thing - the value to test for being undefined
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_not_defined = function(thing, msg){
	if( thing ){
	    _complete(false, msg);
	}else{
	    _complete(true, msg);
	}
    };

    /*
     * Function: is_true
     *
     * Test whether a value is true.
     *
     * Parameters: 
     *  bool - the variable to test
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_true = function(bool, msg){
	if( bool == true ){
	    _complete(true, msg);
	}else{
	    _complete(false, msg);
	}
    };

    /*
     * Function: is_false
     *
     * A negative version of <is_true>.
     *
     * Parameters: 
     *  bool - the variable to test
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_false = function(bool, msg){
	if( bool == false ){
	    _complete(true, msg);
	}else{
	    _complete(false, msg);
	}
    };

    /*
     * Function: is_x_greater_than_y
     *
     * Test whether one value is greate than another. Uses the
     * standard ">" operator.
     *
     * Parameters: 
     *  x_thing - the expected greater value
     *  y_thing - the expected lesser value
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_x_greater_than_y = function(x_thing, y_thing, msg){
	if( x_thing > y_thing ){
	    _complete(true, msg);
	}else{
	    _complete(false, msg);
	}
    };

    /*
     * Function: is_same_url
     *
     * Test whether two links are functionally equivalent.
     *
     * Parameters: 
     *  link1 - url
     *  link2 - url
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_same_url = function(link1, link2, msg){
	_complete(_link_comp(link1, link2), msg);
    };    

    /*
     * Function: is_different_url
     *
     * A negative version of <is_same_url>.
     *
     * Parameters: 
     *  link1 - url
     *  link2 - url
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_different_url = function(link1, link2, msg){
	_complete(! _link_comp(link1, link2), msg);
    };    

    // /*
    //  * Function: is_same_url_by_assembly
    //  *
    //  * Test whether two URLs are functionally equivalent.
    //  *
    //  * Parameters: 
    //  *  link - url
    //  *  base - string
    //  *  psuedo_assembly - hash 
    //  *  msg - *[optional]* informational message about test
    //  *
    //  * Returns: 
    //  *  n/a
    //  */
    // function _psuedo_assmble(assembly){
    // 	var retval = '';
    // 	for( var k2 in hash2 ){
    // 	return retval;
    // }
    // this.is_same_url_by_assembly = function(link, base,
    // 					    psuedo_assembly, msg){
    // 	_complete(_link_comp(link,
    // 			     base + bbop.core.get_assemble(assembly)),
    // 		  msg);
    // };    

    /*
     * Function: is_same_set
     *
     * Test whether two sets (as atomic arrays) are the same.
     *
     * Parameters: 
     *  set1 - set (as array)
     *  set2 - set (as array)
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_same_set = function(set1, set2, msg){
	_complete(_same_set(set1, set2), msg);
    };

    /*
     * Function: is_different_set
     *
     * A negative version of <is_same_set>.
     *
     * Parameters: 
     *  set1 - set (as array)
     *  set2 - set (as array)
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_different_set = function(set1, set2, msg){
	_complete(! _same_set(set1, set2), msg);
    };

    /*
     * Function: is_same_hash
     *
     * Test whether two simple atomic hashes are the same.
     *
     * Parameters: 
     *  hash1 - hash
     *  hash2 - hash
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_same_hash = function(hash1, hash2, msg){
	_complete(_same_hash(hash1, hash2), msg);
    };

    /*
     * Function: is_different_hash
     *
     * A negative version of <is_same_hash>.
     *
     * Parameters: 
     *  hash1 - hash
     *  hash2 - hash
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_different_hash = function(hash1, hash2, msg){
	_complete(! _same_hash(hash1, hash2), msg);
    };

    /*
     * Function: is_in_list
     *
     * Test whether an item is in a list (array).
     *
     * Parameters: 
     *  item - the value to test
     *  list - the array to test in
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_in_list = function(item, list, msg){
	_complete(_in_list(item, list), msg);
    };

    /*
     * Function: is_not_in_list
     *
     * A negative version of <is_in_list>.
     *
     * Parameters: 
     *  item - the value to test
     *  list - the array to test in
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_not_in_list = function(item, list, msg){
	_complete(! _in_list(item, list), msg);
    };

    /*
     * Function: is_in_list_diy
     *
     * A DIY version of is_in_list. In this case, you can pass your
     * own comparison function to check the item against the list.
     *
     * Parameters: 
     *  item - the value to test
     *  list - the array to test in
     *  comp - the comparison function; like: function(in_item, list_item){...}
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_in_list_diy = function(item, list, comp, msg){
	_complete(_in_list(item, list, comp), msg);
    };

    /*
     * Function: is_not_in_list_diy
     *
     * A negative version of <is_in_list_diy>.
     *
     * Parameters: 
     *  item - the value to test
     *  list - the array to test in
     *  comp - the comparison function; like: function(in_item, list_item){...}
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_not_in_list_diy = function(item, list, comp, msg){
	_complete(! _in_list(item, list, comp), msg);
    };

    /*
     * Function: is_string_embedded
     *
     * Test whether a target string (target_str) can be made by
     * embedding a string (added_str) into a base string (base_str).
     * 
     * Useful in certain cases when checking URLs.
     *
     * Parameters: 
     *  target_str - the value to test
     *  base_str - the expected value
     *  added_str - the expected value
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_string_embedded = function(target_str, base_str, added_str, msg){
	_complete(_is_string_embedded(target_str, base_str, added_str), msg);
    };

    /*
     * Function: is_string_not_embedded
     *
     * A negative version of <is_string_embedded>.
     *
     * Parameters: 
     *  target_str - the value to test
     *  base_str - the expected value
     *  added_str - the expected value
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.is_string_not_embedded =
	function(target_str, base_str, added_str, msg){
	    _complete(! _is_string_embedded(target_str, base_str, added_str),
		      msg);
	};

    /*
     * Function: pass
     *
     * Always return test as true--useful when testing using control
     * structures and the like.
     *
     * Parameters: 
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.pass = function(msg){
	_complete(true, msg);
    };

    /*
     * Function: fail
     *
     * Always return test as false--useful when testing using control
     * structures and the like.
     *
     * Parameters: 
     *  msg - *[optional]* informational message about test
     *
     * Returns: 
     *  n/a
     */
    this.fail = function(msg){
	_complete(false, msg);
    };
};
/* 
 * Package: registry.js
 * 
 * Namespace: bbop.registry
 * 
 * BBOP generic lightweight listener/callback registry system.
 */

bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'registry');

/*
 * Constructor: registry
 * 
 * Contructor for BBOP registry. Takes a list of event categories as
 * strings.
 * 
 * Arguments:
 *  evt_list - a list of strings that identify the events to be used
 * 
 * Returns:
 *  bbop registry object
 */
bbop.registry = function(evt_list){
    this._is_a = 'bbop.registry';

    var registry_anchor = this;

    // Handle the registration of call functions to get activated
    // after certain events.
    this.callback_registry = {};
    bbop.core.each(evt_list, function(item, i){
		       registry_anchor.callback_registry[item] = {};
		   });
    
    /*
     * Function: register
     *
     * Add the specified function from the registry, with an optional
     * relative priority against other callback functions.
     *
     * The in_priority value is relative to others in the category,
     * with a higher priority...getting priority.
     * 
     * Parameters: 
     *  category - string; ont of the pre-defined categories
     *  function_id - string; a unique string to identify a function
     *  in_function - function
     *  in_priority - *[optional]* number
     *
     * Returns: 
     *  n/a
     * 
     * See also:
     *  <apply>
     */
    this.register = function(category, function_id, in_function, in_priority){

	// Only these categories.
	if( typeof(registry_anchor.callback_registry[category]) == 'undefined'){
	    throw new Error('cannot register, unknown category');
	}

	// The default priority is 0.
	var priority = 0;
	if( in_priority ){ priority = in_priority; }

	registry_anchor.callback_registry[category][function_id] =
	    {
		runner: in_function,
		priority: priority
	    };
    };

    /*
     * Function: unregister
     *
     * Remove the specified function from the registry. Must specify a
     * legitimate category and the function id of the function in it.
     *
     * Parameters: 
     *  category - string
     *  function_id - string
     *
     * Returns: 
     *  n/a
     */
    this.unregister = function(category, function_id){
	if( registry_anchor.callback_registry[category] &&
	    registry_anchor.callback_registry[category][function_id] ){
		delete registry_anchor.callback_registry[category][function_id];
            }
    };
    
    /*
     * Function: get_callbacks
     *
     * Generic getter for callback functions, returns by priority.
     *
     * Parameters: 
     *  category - string
     *
     * Returns: 
     *  an ordered (by priority) list of function_id strings
     */
    this.get_callbacks = function(category){

	var cb_id_list =
	    bbop.core.get_keys(registry_anchor.callback_registry[category]);
	// Sort callback list according to priority.
	var ptype_registry_anchor = this;
	cb_id_list.sort(
	    function(a, b){  
		var pkg_a =
		    ptype_registry_anchor.callback_registry[category][a];
		var pkg_b =
		    ptype_registry_anchor.callback_registry[category][b];
		return pkg_b['priority'] - pkg_a['priority'];
	    });
	
	// Collect the actual stored functions by priority.
	var cb_fun_list = [];
	for( var cbi = 0; cbi < cb_id_list.length; cbi++ ){
	    var cb_id = cb_id_list[cbi];
	    var to_run =
		registry_anchor.callback_registry[category][cb_id]['runner'];
	    cb_fun_list.push(to_run);
	    // ll('callback: ' + category + ', ' + cb_id + ', ' +
	    //    this.callback_registry[category][cb_id]['priority']);
	}
	
	return cb_fun_list;
    };

    /*
     * Function: apply_callbacks
     *
     * Generic runner for prioritized callbacks with various arguments
     * and an optional change in context..
     *
     * Parameters: 
     *  category - string
     *  arg_list - a list of arguments to pass to the function in the category
     *  context - *[optional]* the context to apply the arguments in
     *
     * Returns: 
     *  n/a
     */
    this.apply_callbacks = function(category, arg_list, context){

	// Run all against registered functions.
	var callbacks = registry_anchor.get_callbacks(category);
	for( var ci = 0; ci < callbacks.length; ci++ ){
	    var run_fun = callbacks[ci];
	    //run_fun(arg_list);
	    run_fun.apply(context, arg_list);
	}
    };
};
/* 
 * Package: html.js
 * 
 * Namespace: bbop.html
 * 
 * Right now contains bbop.html.tag, but all html producing functions
 * should go in here somewhere.
 * 
 * All bbop.html implement the interface:
 *  .to_string(): returns a string of you and below
 *  .add_to(): add things between the tags
 *  .empty(): empties all things between the tags
 *  .get_id(): return the id or null if not defined
 * These are enforced during the tests.
 * 
 * For functions that take attribute hashes, there is a special
 * attribute {'generate_id': true} that will generate a somewhat
 * random id if an incoming id was not already specified. This id can
 * be retrieved using get_id().
 * 
 * This package takes all of the bbop.html.* namespace.
 */

bbop.core.require('bbop', 'core');
//bbop.core.require('bbop', 'logger');
//bbop.core.require('bbop', 'amigo');
bbop.core.namespace('bbop', 'html');
bbop.core.namespace('bbop', 'html', 'tag');
bbop.core.namespace('bbop', 'html', 'accordion');
bbop.core.namespace('bbop', 'html', 'list');
bbop.core.namespace('bbop', 'html', 'input');
bbop.core.namespace('bbop', 'html', 'img');

/*
 * Namespace: bbop.html.tag
 * 
 * Constructor: tag
 * 
 * Create the fundamental tag object to work with and extend.
 * 
 * Parameters:
 *  tag - the tag name to be created
 *  attrs - *[serially optional]* the typical attributes to add
 *  below - *[optional]* a list/array of other html objects that exists "between" the tags
 * 
 * Returns:
 *  bbop.html.tag object
 */
bbop.html.tag = function(tag, attrs, below){
    this._is_a = 'bbop.html.tag';

    // Arg check--attrs should be defined as something.
    if( ! attrs ){ attrs = {}; }

    // Generate (or not) id if it was requested.
    if( ! bbop.core.is_defined(attrs['id']) &&
	bbop.core.is_defined(attrs['generate_id']) &&
	bbop.core.is_defined(attrs['generate_id']) == true ){
	    // Add a real id.
	    attrs['id'] = 'gen_id-bbop-html-'+ bbop.core.randomness(20);
	    // Remove the 'generated_id' property.
	    delete attrs['generate_id'];
	}
    this._attrs = attrs;
    
    // Arg check--below should be some kind of an array.
    if( ! below ){
	below = [];
    }else if( bbop.core.is_array(below) ){
	// do nothing
    }else{
	// hopefully a bbop.html.tag then
	below = [below];
    }

    // Accumulate the incoming attributes if there are any.
    var additional_attrs = '';
    bbop.core.each(this._attrs, function(in_key, in_val){
		       additional_attrs = additional_attrs + ' ' +
			   in_key + '="' + in_val + '"';
		   });

    this._car = '<' + tag + additional_attrs + '>';
    this._cdr = '</' + tag + '>';
    this._contents = below;
    this._singleton = '<' + tag + additional_attrs + ' />';
};

/*
 * Function: to_string
 * 
 * Convert a tag object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.tag.prototype.to_string = function(){
    var acc = '';
    bbop.core.each(this._contents,
		   function(item, i){
		       // if( typeof(item) == 'string' ){
		       // 	   acc = acc + item;
		       // }else if( typeof(item['to_string']) == 'function' ){
		       // 	   acc = acc + item.to_string();
		       // }else{
		       // 	   throw new Error('No to_string for (' +
		       // 			   bbop.core.what_is(item) +
		       // 			   ') ' + item);
		       // }
		       acc = acc + bbop.core.to_string(item);
		   });
    
    // Special return case if there are no children (to prevent
    // weirdness for things like br and input).
    var output = this._singleton;
    if( acc != '' ){ output = this._car + acc + this._cdr; }

    return output;
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  bbop_html_tag_or_string - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.tag.prototype.add_to = function(bbop_html_tag_or_string){
    this._contents.push(bbop_html_tag_or_string);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.tag.prototype.empty = function(){
    this._contents = [];
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.tag.prototype.get_id = function(){
    var retval = null;
    if( bbop.core.is_defined(this._attrs['id']) ){
	retval = this._attrs['id'];
    }
    return retval;
};

/*
 * Namespace: bbop.html.accordion
 * 
 * Constructor: accordion
 * 
 * Create the a frame for the functional part of a jQuery accordion
 * structure.
 * 
 * :Input:
 * : [[title, string/*.to_string()], ...]
 * :
 * :Output:
 * : <div id="accordion">
 * :  <h3><a href="#">Section 1</a></h3>
 * :  <div>
 * :   <p>
 * :    foo
 * :   </p>
 * :  </div>
 * :  ...
 * : </div>
 * 
 * Parameters:
 *  in_list - accordion frame headers: [[title, string/*.to_string()], ...]
 *  attrs - *[serially optional]* attributes to apply to the new top-level div
 *  add_id_p - *[optional]* true or false; add a random id to each section
 * 
 * Returns:
 *  bbop.html.accordion object
 * 
 * Also see: <tag>
 */
bbop.html.accordion = function(in_list, attrs, add_id_p){
    this._is_a = 'bbop.html.accordion';

    //
    if( typeof(add_id_p) == 'undefined' ){ add_id_p = false; }

    // Arg check--attrs should be defined as something.
    this._attrs = attrs || {};

    // Internal stack always starts with a div.
    this._div_stack = new bbop.html.tag('div', this._attrs);

    this._section_id_to_content_id = {};

    // Iterate over the incoming argument list.
    var accordion_this = this;
    bbop.core.each(in_list, function(item){
		       var sect_title = item[0];
		       var content = item[1];
		       accordion_this.add_to(sect_title, content, add_id_p);
		   });
};

/*
 * Function: to_string
 * 
 * Convert the accordion object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.accordion.prototype.to_string = function(){
    return this._div_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add a contect section to the accordion.
 * 
 * Parameters:
 *  section_info - a string or a hash with 'id', 'label', and 'description'
 *  content_blob - string or bbop.html object to put in a section
 *  add_id_p - *[optional]* true or false; add a random id to the section
 * 
 * Returns: n/a
 */
bbop.html.accordion.prototype.add_to =
    function(section_info, content_blob, add_id_p){

    // If section_info isn't an object, assume it is a string and use
    // it for everything.
    var section_id = null;
    var section_label = null;
    var section_desc = null;
    if(typeof section_info != 'object' ){
	section_id = section_info;
	section_label = section_info;
    }else{
	if( section_info['id'] ){ section_id = section_info['id']; }
	if( section_info['label'] ){ section_label = section_info['label']; }
	if( section_info['description'] ){
	    section_desc = section_info['description'];
	}
    }

    // Add header section.
    var h3 = new bbop.html.tag('h3');
    var anc = null;
    if( section_desc ){
	anc = new bbop.html.tag('a', {href: '#', title: section_desc},
				section_label);
    }else{
	anc = new bbop.html.tag('a', {href: '#'}, section_label);
    }
    h3.add_to(anc);
    this._div_stack.add_to(h3);

    var div = null;

    // Generate random id for the div.
    if( typeof(add_id_p) == 'undefined' ){ add_id_p = false; }
    if( add_id_p ){
	var rid = 'accordion-' + section_id + '-' + bbop.core.randomness(20);
	this._section_id_to_content_id[section_id] = rid;    
	div = new bbop.html.tag('div', {'id': rid});	
    }else{
	div = new bbop.html.tag('div');	
    }

    // Add add content stub to section.
   var p = new bbop.html.tag('p', {}, bbop.core.to_string(content_blob));
    div.add_to(p);
    this._div_stack.add_to(div);
};

// // Add a section to the accordion.
// bbop.html.accordion.prototype.add_to_section = function(sect_id, content){
//     var cdiv = this._section_id_to_content_div[sect_id];
//     if( ! cdiv ){
// 	throw new Error('Cannot add to undefined section.');
//     }
// };

/*
 * Function: empty
 * 
 * Empty all sections from the accordion.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.accordion.prototype.empty = function(){
    this._div_stack = new bbop.html.tag('div', this._attrs);
    this._section_id_to_content_id = {};
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.accordion.prototype.get_id = function(){
    return this._div_stack.get_id();
};

/*
 * Function: get_section_id
 * 
 * Get the "real" section id by way of the "convenience" section id?
 * 
 * Parameters:
 *  sect_id - TODO ???
 * 
 * Returns: TODO ???
 */
bbop.html.accordion.prototype.get_section_id = function(sect_id){
	return this._section_id_to_content_id[sect_id];    
};


// // TODO: just empty the contents from an ided section.
// bbop.html.accordion.prototype.empty_section = function(sect_id){
//     var div = this._section_id_to_content_div[sect_id];
//     div.empty();
// };

/*
 * Namespace: bbop.html.list
 * 
 * Constructor: list
 * 
 * Create the a frame for an unordered list object.
 * 
 * :Input:
 * : [string/*.to_string(), ...]
 * :
 * :Output:
 * : <ul id="list">
 * :  <li>foo</li>
 * :   ...
 * : </ul>
 * 
 * Parameters:
 *  in_list - list of strings/bbop.html objects to be li separated
 *  attrs - *[optional]* attributes to apply to the new top-level ul
 * 
 * Returns:
 *  bbop.html.list object
 * 
 * Also see: <tag>
 */
bbop.html.list = function(in_list, attrs){
    this._is_a = 'bbop.html.list';
    
    // Arg check--attrs should be defined as something.
    if( ! attrs ){ attrs = {}; }
    this._attrs = attrs;

    // Internal stack always starts with a ul.
    this._ul_stack = new bbop.html.tag('ul', this._attrs);

    var list_this = this;
    bbop.core.each(in_list, function(item){ list_this.add_to(item); });
};

/*
 * Function: to_string
 * 
 * Convert a list object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.list.prototype.to_string = function(){
    return this._ul_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add a new li section to a list.
 * 
 * Optionally, it can take multiple arguments and will add each of
 * them to the new li tag in turn.
 * 
 * Parameters:
 *  item1 - another tag object or a string (html or otherwise)
 *  item2 - *[optional]* ...on forever
 * 
 * Returns: n/a
 */
bbop.html.list.prototype.add_to = function(){

    // Convert anonymous arguments into an Array.
    var args = Array.prototype.slice.call(arguments); 

    // Cycle through and add them to the accumulator for the new li.
    var li_acc = [];
    bbop.core.each(args,
		   function(arg){
		       li_acc.push(bbop.core.to_string(arg));
		   });

    // Join them and add them to the stack of the encompassing ul.
    var li = new bbop.html.tag('li', {}, li_acc.join(" "));
    this._ul_stack.add_to(li);
};

/*
 * Function: empty
 * 
 * Remove all content (li's) from the list.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.list.prototype.empty = function(){
    this._ul_stack = new bbop.html.tag('ul', this._attrs);
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.list.prototype.get_id = function(){
    return this._ul_stack.get_id();
};

/*
 * Namespace: bbop.html.input
 * 
 * Constructor: input
 * 
 * Create a form input.
 * 
 * Parameters:
 *  attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  bbop.html.input object
 */
bbop.html.input = function(attrs){
    this._is_a = 'bbop.html.input';
    
    // Arg check--attrs should be defined as something.
    if( ! attrs ){ attrs = {}; }
    this._attrs = attrs;

    // Internal stack always starts with a ul.
    this._input_stack = new bbop.html.tag('input', this._attrs);
};

/*
 * Function: to_string
 * 
 * Convert an input into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.input.prototype.to_string = function(){
    return this._input_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the input tags.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.input.prototype.add_to = function(item){
    this._input_stack.add_to(bbop.core.to_string(item));
};

/*
 * Function: empty
 * 
 * Reset/remove all children.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.input.prototype.empty = function(){
    this._input_stack = new bbop.html.tag('input', this._attrs);
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.input.prototype.get_id = function(){
    return this._input_stack.get_id();
};

/*
 * Namespace: bbop.html.anchor
 * 
 * Constructor: anchor
 * 
 * Create an anchor object. Note: href, title, etc. go through
 * in_attrs.
 * 
 * Parameters:
 *  in_cont - the contents between the "a" tags
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  bbop.html.anchor object
 */
bbop.html.anchor = function(in_cont, in_attrs){
    this._is_a = 'bbop.html.anchor';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack always starts with a ul.
    this._anchor_stack = new bbop.html.tag('a', this._attrs, in_cont);
};

/*
 * Function: to_string
 * 
 * Convert an anchor object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.anchor.prototype.to_string = function(){
    return this._anchor_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.anchor.prototype.add_to = function(item){
    this._anchor_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.anchor.prototype.empty = function(){
    this._anchor_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.anchor.prototype.get_id = function(){
    return this._anchor_stack.get_id();
};

/*
 * Namespace: bbop.html.image
 * 
 * Constructor: image
 * 
 * Create an image (img) object. Note: alt, title, etc. go through
 * in_attrs.
 * 
 * Parameters:
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  bbop.html.image object
 */
bbop.html.image = function(in_attrs){
    this._is_a = 'bbop.html.image';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack always starts with a ul.
    this._image_stack = new bbop.html.tag('img', this._attrs);
};

/*
 * Function: to_string
 * 
 * Convert an image object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.image.prototype.to_string = function(){
    return this._image_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.image.prototype.add_to = function(item){
    this._image_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.image.prototype.empty = function(){
    this._image_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.image.prototype.get_id = function(){
    return this._image_stack.get_id();
};

/*
 * Namespace: bbop.html.table
 * 
 * Constructor: table
 * 
 * Create a simple table structure.
 * in_headers is necessary, but can be empty.
 * in_entries is necessary, but can be empty.
 * 
 * Parameters:
 *  in_headers - ordered list of headers
 *  in_entries - lists of lists of entry items
 *  in_attrs - *[optional]* the typical attributes to add to the table
 * 
 * Returns:
 *  bbop.html.table object
 */
bbop.html.table = function(in_headers, in_entries, in_attrs){
    this._is_a = 'bbop.html.table';
    
    // Arg check--attrs should be defined as something.
    var headers = in_headers || [];
    var entries = in_entries || [];
    this._attrs = in_attrs || {};

    // Row class count.
    this._count = 0;

    // Internal stack always starts with a table.
    this._table_stack = new bbop.html.tag('table', this._attrs);

    // Only add headers if they exist.
    if( ! bbop.core.is_empty(headers) ){
	var head_row = new bbop.html.tag('tr');
	bbop.core.each(headers,
		       function(header){
			   var th = new bbop.html.tag('th');
			   th.add_to(header);
			   head_row.add_to(th);
		       });
	var head_stack = new bbop.html.tag('thead');
	head_stack.add_to(head_row);
	this._table_stack.add_to(head_stack);
    }

    // Add incoming rows to the body. Keep the body stack around for
    // bookkeeping.
    this._body_stack = new bbop.html.tag('tbody');
    this._table_stack.add_to(this._body_stack);

    var this_table = this;
    bbop.core.each(entries, function(item){ this_table.add_to(item); });
};

/*
 * Function: to_string
 * 
 * Convert a table object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.table.prototype.to_string = function(){
    return this._table_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add data row. The entries argument is coerced into an array of tds.
 * 
 * Parameters:
 *  entries - lists of lists of entry items
 * 
 * Returns: n/a
 */
bbop.html.table.prototype.add_to = function(entries){
    
    //this._body_stack = new bbop.html.tag('tbody');

    // Get the class for the row.
    var row_class = 'odd_row';
    if( this._count % 2 == 0 ){ row_class = 'even_row'; }
    this._count = this._count + 1;

    var tr = new bbop.html.tag('tr', {'class': row_class});

    // Array or not, add everything as tds.
    if( ! bbop.core.is_array(entries) ){ entries = [entries]; }
    bbop.core.each(entries,
		   function(entry){
		       var td = new bbop.html.tag('td');
		       td.add_to(entry);
		       tr.add_to(td);
		   });
    this._body_stack.add_to(tr);
};

/*
 * Function: empty
 * 
 * Headers do not get wiped, just the data rows in the tbody.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.table.prototype.empty = function(){
    this._count = 0;
    this._body_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.table.prototype.get_id = function(){
    return this._table_stack.get_id();
};

/*
 * Namespace: bbop.html.button
 * 
 * Constructor: button
 * 
 * Create a button object.
 * For after-the-fact decoration, take a look at:
 * <https://jquery-ui.googlecode.com/svn/tags/1.6rc5/tests/static/icons.html>
 * 
 * Parameters:
 *  in_label - label
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  bbop.html.button object
 */
bbop.html.button = function(in_label, in_attrs){
    this._is_a = 'bbop.html.button';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack is just the top-level button.
    this._button_stack = new bbop.html.tag('button', this._attrs, in_label);
};

/*
 * Function: to_string
 * 
 * Convert a button object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.button.prototype.to_string = function(){
    return this._button_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * Not really worth much as it just equates to changing the label.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.button.prototype.add_to = function(item){
    this._button_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags. This equates to removing the
 * label.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.button.prototype.empty = function(){
    this._button_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.button.prototype.get_id = function(){
    return this._button_stack.get_id();
};

/*
 * Namespace: bbop.html.span
 * 
 * Constructor: span
 * 
 * Create a span object.
 * Fun for calling live bits after the fact.
 * 
 * Parameters:
 *  in_label - label
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  bbop.html.span object
 */
bbop.html.span = function(in_label, in_attrs){
    this._is_a = 'bbop.html.span';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack is just the top-level span.
    this._span_stack = new bbop.html.tag('span', this._attrs, in_label);
};

/*
 * Function: to_string
 * 
 * Convert a span object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
bbop.html.span.prototype.to_string = function(){
    return this._span_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * Not really worth much as it just equates to changing the label.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
bbop.html.span.prototype.add_to = function(item){
    this._span_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags. This equates to removing the
 * label.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
bbop.html.span.prototype.empty = function(){
    this._span_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
bbop.html.span.prototype.get_id = function(){
    return this._span_stack.get_id();
};
/* 
 * Package: model.js
 * 
 * Namespace: bbop.model
 * 
 * Purpose: Basic edged graph and operations.
 * 
 * NOTE: A model instance may not be the whole graph, just a
 * subgraph--this is the difference between nodes and
 * named_nodes. nodes are real things, while named_nodes are things
 * referenced by edges.
 * 
 * Check TODOs, we would like everything as linear as possible.
 * 
 * TODO: memoize everything but add_*. Functional enough that it
 * should work if we just empty the caches after every add_* op.
 * 
 * Required: bbop.core (<core.js>)
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core'); // not needed, but want the habit
bbop.core.require('bbop', 'logger');
bbop.core.namespace('bbop', 'model');


/*
 * Variable: default_predicate
 * 
 * The predicate we'll use when none other is defined. You can
 * probably safely ignore this if all of the edges in your graph are
 * the same.
 */
bbop.model.default_predicate = 'points_at';

///
///  Node sub-object.
///

/*
 * Namespace: bbop.model.node
 * 
 * Constructor: node
 * 
 * Contructor for a BBOP graph model node.
 * 
 * Arguments:
 *  new_id - a unique id for the node
 *  new_label - *[optional]* a user-friendly description of the node
 * 
 * Returns:
 *  bbop model node
 */
bbop.model.node = function(new_id, new_label){
    this._is_a = 'bbop.model.node';
    this._id = new_id || undefined;
    this._label = new_label || undefined;

    // Only have a real type if the constructor went properly.
    this._type = 'node';
    if( ! new_id ){
	this._type = undefined;	
    }

    this._metadata = undefined;
};

/*
 * Function: id
 *
 * Getter/setter for node id.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.node.prototype.id = function(value){
    if(value) this._id = value; return this._id; };

/*
 * Function: type
 *
 * Getter/setter for node type.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.node.prototype.type = function(value){
    if(value) this._type = value; return this._type; };

/*
 * Function: label
 *
 * Getter/setter for node label.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.node.prototype.label = function(value){
    if(value) this._label = value; return this._label; };

/*
 * Function: metadata
 *
 * Getter/setter for node metadata.
 * 
 * The metadata value does not necessarily have to be an atomic type.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.node.prototype.metadata = function(value){
    if(value) this._metadata = value; return this._metadata; };

/*
 * Function: clone
 *
 * Get a fresh new copy of the current node (using bbop.core.clone for
 * metadata object).
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  string
 */
bbop.model.node.prototype.clone = function(){
    var tmp_clone = new bbop.model.node(this.id());
    tmp_clone.type(this.type());
    tmp_clone.label(this.label());
    tmp_clone.metadata(bbop.core.clone(this.metadata()));
    return tmp_clone;
};


///
///  Edge sub-object.
///

/*
 * Namespace: bbop.model.edge
 * 
 * Constructor: edge
 * 
 * Contructor for a BBOP graph model edge.
 * 
 * If no predicate is given, <default_predicate> is used.
 * Predicates are currently treated as raw strings.
 * 
 * Arguments:
 *  subject - node id string or node
 *  object - node id string or node
 *  predicate - *[optional]* a user-friendly description of the node
 * 
 * Returns:
 *  bbop model edge
 */
bbop.model.edge = function(subject, object, predicate){
    this._is_a = 'bbop.model.edge';

    // Either a string or a node.
    if( ! subject ){
	this._subject_id = undefined;
    }else if( typeof subject == 'string' ){
	this._subject_id = subject;	
    }else{
	this._subject_id = subject.id();
    }
    // Either a string or a node.
    if( ! object ){
	this._object_id = undefined;
    }else if( typeof object == 'string' ){
	this._object_id = object;	
    }else{
	this._object_id = object.id();
    }
    // Predicate default or incoming.
    this._predicate_id = bbop.model.default_predicate;
    if( predicate ){
	this._predicate_id = predicate;
    }

    // Only have a real type if the constructor went properly.
    this._type = 'edge';
    if( ! subject || ! object ){
	this._type = undefined;	
    }

    //
    this._metadata = undefined;
};

/*
 * Function: subject_id
 *
 * Getter/setter for edge subject id.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.subject_id = function(){
    return this._subject_id; };

/*
 * Function: object_id
 *
 * Getter/setter for edge object id.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.object_id = function(){
    return this._object_id; };

/*
 * Function: predicate_id
 *
 * Getter/setter for edge predicate id.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.predicate_id = function(){
    return this._predicate_id; };

/*
 * Function: type
 *
 * Getter/setter for edge type.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.type = function(value){
    if(value) this._type = value; return this._type; };

/*
 * Function: metadata
 *
 * Getter/setter for edge metadata.
 *
 * The metadata value does not necessarily have to be an atomic type.
 * 
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.metadata = function(value){
    if(value) this._metadata = value; return this._metadata; };

/*
 * Function: clone
 *
 * Get a fresh new copy of the current edge (using bbop.core.clone for
 * metadata object).
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  string
 */
bbop.model.edge.prototype.clone = function(){
    var tmp_clone = new bbop.model.edge(this.subject_id(),
					this.object_id(),
					this.predicate_id());
    tmp_clone.metadata(bbop.core.clone(this.metadata()));
    return tmp_clone;
};

///
///  Graph sub-object.
///

/*
 * Namespace: bbop.model.graph
 * 
 * Constructor: graph
 * 
 * Contructor for a BBOP graph model graph.
 * 
 * TODO: make compilation piecewise with every added node and edge.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  bbop model node
 */
//
bbop.model.graph = function(){
    this._is_a = 'bbop.model.graph';

    this._id = undefined;

    // A per-graph logger.
    this._logger = new bbop.logger(this._is_a);
    this._logger.DEBUG = true;
    //this._logger.DEBUG = false;
    //function ll(str){ anchor._logger.kvetch(str); }

    // For bbop.model.node and bbop.model.edge (hash not possible for
    // edges--only relation, not "real").
    this._nodes = { array: new Array, hash: {} };
    this._edges = { array: new Array };
    this._predicates = { array: new Array, hash: {} };

    // All things that are referenced by edges (which may not include
    // actual node ids--dangling links).
    this._named_nodes = { array: new Array, hash: {} };

    // Useful forthings like leaves, roots, and singletons.
    this._subjects = { array: new Array, hash: {} };
    this._objects = { array: new Array, hash: {} };     

    // Table structures for quick lookups of relations.
    //this._predicate_subject_table = {};    // [pred][sub] -> bbop.model.edge.
    //this._subject_predicate_table = {};    // [sub][pred] -> bbop.model.edge.
    //this._predicate_object_table = {};     // [pred][obj] -> sub data struct.
    //this._object_predicate_table = {};     // [obj][pred] -> sub data struct.

    // New parallel structures to for our simplified graph.
    this._so_table = {}; // true/undef
    this._os_table = {}; // true/undef
    this._sop_table = {}; // {'rel1': true, 'rel2': true}

    // Table structures for quick lookups of node properties.
    this._is_a_singleton_lookup = {}; // [nid] -> bbop.model.node.    
};


/*
 * Function: id
 *
 * Getter/setter for the graph id.
 *
 * Parameters: 
 *  value - *[optional]* new value for this property to take
 *
 * Returns: 
 *  string
 */
bbop.model.graph.prototype.id = function(value){
    if( value ) this._id = value; return this._id;
};

/*
 * Function: add_node
 *
 * Add a node to the graph.
 *
 * Parameters: 
 *  node - <node> to add to the graph
 *
 * Returns: 
 *  n/a
 */
bbop.model.graph.prototype.add_node = function(node){

    // Check for for anything funny.
    if( ! node.id() ||
	this._nodes.hash[ node.id() ] ||
	this._nodes.hash[ node.id() ] ){
	    //alert("tried to add same node: " + node.id());
	    //throw new Error("tried to add same node: " + node.id());
	}else{

	    var nid = node.id();
	    
	    // Add it to all the concerned recall data structures.
	    this._nodes.hash[ nid ] = node;
	    this._nodes.array.push(node);
	    this._named_nodes.hash[ nid ] = node;
	    this._named_nodes.array.push(node);

	    // If this does not belong to any relation so far, then it is a
	    // singleton.
	    if( ! this._subjects.hash[ nid ] && ! this._objects.hash[ nid ] ){
		this._is_a_singleton_lookup[ nid ] = true;
	    }
	}
};


/*
 * Function: add_edge
 *
 * Add an edge to the graph.
 *
 * Parameters: 
 *  edge - <edge> to add to the graph
 *
 * Returns: 
 *  n/a
 */
bbop.model.graph.prototype.add_edge = function(edge){

    //
    var sub_id = edge.subject_id();
    var obj_id = edge.object_id();
    var pred_id = edge.predicate_id();

    // Subject -> object.
    if( ! this._so_table[ sub_id ] ){ this._so_table[ sub_id ] = {}; }
    this._so_table[ sub_id ][ obj_id ] = true;
    // Object -> subject.
    if( ! this._os_table[ obj_id ] ){ this._os_table[ obj_id ] = {}; }
    this._os_table[ obj_id ][ sub_id ] = true;
    // Their relationships (defined by SOP).
    if( ! this._sop_table[ sub_id ] ){
	this._sop_table[ sub_id ] = {}; }
    if( ! this._sop_table[ sub_id ][ obj_id ] ){
	this._sop_table[ sub_id ][obj_id] = {}; }
    //this._sop_table[ sub_id ][ obj_id ][ pred_id ] = true;
    this._sop_table[ sub_id ][ obj_id ][ pred_id ] = edge;

    // If this is a new predicate add it to all of the necessary data
    // structures.
    if( ! this._predicates.hash[ pred_id ] ){
	this._predicates.hash[ pred_id ] = true; 
	this._predicates.array.push(pred_id); 
    }

    // 
    if( ! this._subjects.hash[ sub_id ] ){
	this._subjects.hash[ sub_id ] = true; 
	this._subjects.array.push(sub_id); 
	//this._subject_predicate_table[ sub_id ] = {};
    }
    if( ! this._objects.hash[ obj_id ] ){
	this._objects.hash[ obj_id ] = true; 
	this._objects.array.push(obj_id); 
	//this._object_predicate_table[ obj_id ] = {};
    }

    // Remove the edge's subject and object from the singleton table.
    if( this._is_a_singleton_lookup[ sub_id ] ){
	delete this._is_a_singleton_lookup[ sub_id ]; }
    if( this._is_a_singleton_lookup[ obj_id ] ){
	delete this._is_a_singleton_lookup[ obj_id ]; }

    // Onto the array and subject and object into named bodies.
    this._edges.array.push(edge);
    if( ! this._named_nodes.hash[ sub_id ] ){
	this._named_nodes.array.push(sub_id); }
    this._named_nodes.hash[ sub_id ] = edge;
    if( ! this._named_nodes.hash[ obj_id ] ){
	this._named_nodes.array.push(obj_id); }
    this._named_nodes.hash[ obj_id ] = edge;
};

/*
 * Function: all_nodes
 *
 * Returns an /original/ list of all added nodes.
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  array of nodes
 */
bbop.model.graph.prototype.all_nodes = function(){
    return this._nodes.array;
};

/*
 * Function: all_edges
 *
 * Returns an /original/ list of all added edges.
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  array of edges
 */
bbop.model.graph.prototype.all_edges = function(){
    return this._edges.array;
};

/*
 * Function: all_predicates
 *
 * Returns an /original/ list of all added predicates.
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  array of predicates (strings)
 */
bbop.model.graph.prototype.all_predicates = function(){
    return this._predicates.array;
};

/*
 * Function: all_dangling
 *
 * List all external nodes by referenced id.
 *
 * Parameters:
 *  n/a
 *
 * Returns: 
 *  array of extrnal nodes by id
 */
bbop.model.graph.prototype.all_dangling = function(){
    // Disjoint of named and extant.
    var unnamed = new Array();
    for( var named_id in this._named_nodes.hash ){
	if( ! this._nodes.hash[named_id] ){
	    unnamed.push(named_id);
	}
    }
    return unnamed;
};

/*
 * Function: is_complete
 *
 * Any bad parts in graph? Essentially, make sure that there are no
 * weird references and nothing is dangling.
 *
 * Parameters:
 * n/a
 *
 * Returns: 
 *  boolean
 */
bbop.model.graph.prototype.is_complete = function(){
    var retval = true;
    if( this.all_dangling().length > 0 ){
	retval = false;
    }
    return retval;
};

/*
 * Function: get_node
 *
 * Return a /copy/ of a node by id (not the original) if extant.
 *
 * Parameters:
 *  nid - the id of the node we're looking for
 *
 * Returns: 
 *  <bbop.model.node>
 */
bbop.model.graph.prototype.get_node = function(nid){
    var retnode = null;
    if( this._nodes.hash[ nid ] ){
	var tmp_node = this._nodes.hash[ nid ];
	retnode = tmp_node.clone();
    }
    return retnode;
};

/*
 * Function: get_edge
 *
 * Return a /copy/ of an edge by ids (not the original) if extant.
 *
 * Parameters:
 *  sub_id - the subject_id of the edge we're looking for
 *  obj_id - the object_id of the edge we're looking for
 *  pred - *[optional]* the predicate of the edge we're looking for
 *
 * Returns: 
 *  <bbop.model.edge>
 */
bbop.model.graph.prototype.get_edge = function(sub_id, obj_id, pred){	

    if( ! pred ){ pred = bbop.model.default_predicate; }

    var ret_edge = null;
    if( this._sop_table[sub_id] &&
	this._sop_table[sub_id][obj_id] &&
	this._sop_table[sub_id][obj_id][pred] ){
	    // retval = new bbop.model.edge(sub_id, obj_id, pred);
	    var tmp_edge = this._sop_table[sub_id][obj_id][pred];
	    ret_edge = tmp_edge.clone();
	}
    return ret_edge; 
};

/*
 * Function: get_edges
 *
 * Return all edges (copies) of given subject and object ids. Returns
 * entirely new edges.
 *
 * Parameters:
 *  sub_id - the subject_id of the edge we're looking for
 *  obj_id - the object_id of the edge we're looking for
 *
 * Returns: 
 *  list of <bbop.model.edge>
 */
bbop.model.graph.prototype.get_edges = function(sub_id, obj_id){
    var retlist = new Array();
    if( this._sop_table[sub_id] &&
	this._sop_table[sub_id][obj_id] ){
	    for( var pred in this._sop_table[sub_id][obj_id] ){
		retlist.push(new bbop.model.edge(sub_id, obj_id, pred));
	    }
	}		
    return retlist;
};


/*
 * Function: get_predicates
 *
 * Return all predicates of given subject and object ids.
 *
 * Parameters:
 *  sub_id - the subject_id of the edge we're looking for
 *  obj_id - the object_id of the edge we're looking for
 *
 * Returns: 
 *  list of predicate ids (as strings)
 */
bbop.model.graph.prototype.get_predicates = function(sub_id, obj_id){
    var retlist = [];
    if( this._sop_table[sub_id] &&
	this._sop_table[sub_id][obj_id] ){
	    for( var pred in this._sop_table[sub_id][obj_id] ){
		retlist.push(pred);
	    }
	}
    return retlist;
};


/*
 * Function: edges_to_nodes
 *
 * Translate an edge array into extant (node) bodies, switching on
 * either 'subject' or 'object'.
 * 
 * This will return the /original/ nodes.
 *
 * This will throw an error on any world issues that crop up.
 * 
 * Parameters: 
 *  in_edges - the edges we want the subjects or objects of
 *  target - 'subject' or 'object'
 *
 * Returns: 
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.edges_to_nodes = function(in_edges, target){
    
    // Double check.
    if( target != 'subject' && target != 'object'){
	throw new Error('Bad target for edges to bodies.');
    }

    // 
    var results = new Array();
    for( var i = 0; i < in_edges.length; i++ ){ 
	var in_e = in_edges[i];

	// Switch between subject and object.
	var target_id = null;
	if( target == 'subject' ){
	    target_id = in_e.subject_id();
	}else{
	    target_id = in_e.object_id();
	}
	
	//
	if( target_id && this._nodes.hash[ target_id ] ){
	    results.push(this._nodes.hash[ target_id ]);
	}else{
	    throw new Error(target + ' world issue');
	}
    }
    return results;
};

/*
 * Function: is_root_node
 *
 * Roots are defined as nodes who are the subject of nothing,
 * independent of predicate.
 *
 * Parameters: 
 *  nb_id - id of the node to check
 *
 * Returns: 
 *  boolean
 */
bbop.model.graph.prototype.is_root_node = function(nb_id){
    var result = false;	
    if( this._nodes.hash[ nb_id ] &&
	! this._subjects.hash[ nb_id ] ){	    
	    result = true;
	}
    return result;
};


/*
 * Function: get_root_nodes
 *
 * Return a list of /copies/ of the root nodes.
 * 
 * BUG/TODO: Could I speed this up by my moving some of the
 * calculation into the add_node and add_edge methods? O(|#nodes|)
 * 
 * Parameters:
 *  n/a 
 *
 * Returns:
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.get_root_nodes = function(){
    var results = new Array();
    for( var nb_id in this._nodes.hash ){
	if( this.is_root_node(nb_id) ){
	    results.push( this.get_node(nb_id).clone() );
	}
    }
    return results;
};


/*
 * Function: is_leaf_node
 *
 * Leaves are defined as nodes who are the object of nothing,
 * independent of predicate.
 * 
 * Parameters: 
 *  nb_id - id of the node to check
 *
 * Returns: 
 *  boolean
 */
bbop.model.graph.prototype.is_leaf_node = function(nb_id){

    var result = false;
    if( this._nodes.hash[ nb_id ] &&
	! this._objects.hash[ nb_id ] ){	    
	    result = true;
	}
    return result;
};

/*
 * Function: get_leaf_nodes
 *
 * Return a list of /copies/ of the leaf nodes.
 * 
 * BUG/TODO: Could I speed this up by my moving some of the
 * calculation into the add_node and add_edge methods? O(|#nodes|)
 * 
 * Parameters:
 *  n/a 
 *
 * Returns:
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.get_leaf_nodes = function(){
    var results = new Array();
    for( var nb_id in this._nodes.hash ){
	if( this.is_leaf_node(nb_id) ){
	    results.push( this.get_node(nb_id).clone() );
	}
    }
    return results;
};

/*
 * Function: get_singleton_nodes
 *
 * Find nodes that are roots and leaves over all relations. This
 * returns the /original/ node.
 * 
 * Throws an error if there is a world issue.
 *
 * Parameters:
 *  n/a 
 *
 * Returns: 
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.get_singleton_nodes = function(){
    // Translate array into array extant bodies.
    var singleton_array = new Array();
    for( var singleton_id in this._is_a_singleton_lookup ){
	if( this._nodes.hash[ singleton_id ] ){
	    singleton_array.push( this._nodes.hash[ singleton_id ] );
	}else{
	    throw new Error("world issue in get_singletons: "+singleton_id);
	}
    }
    return singleton_array;
};

/*
 * Function: get_parent_edges
 *
 * Return all parent edges; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * TODO: it might be nice to memoize this since others depend on it.
 *
 * Parameters: 
 *  nb_id - the node to consider
 *  in_pred - *[optional]* over this predicate
 *
 * Returns: 
 *  array of <bbop.model.edge>
 */
bbop.model.graph.prototype.get_parent_edges = function(nb_id, in_pred){

    var results = new Array();

    // Get all parents, or just parents from a specific relation.
    var preds_to_use = new Array();
    if( in_pred ){
	preds_to_use.push(in_pred);
    }else{
	preds_to_use = this._predicates.array;
    }

    // Try all of our desired predicates.
    for( var j = 0; j < preds_to_use.length; j++ ){
	var pred = preds_to_use[j];

	// Scan the table for goodies; there really shouldn't be a
	// lot here.
	if( this._so_table[ nb_id ] ){		
	    for( var obj_id in this._so_table[nb_id] ){
		// If it looks like something is there, try to see
		// if there is an edge for our current pred.
		var tmp_edge = this.get_edge(nb_id, obj_id, pred);
		if( tmp_edge ){
		    results.push( tmp_edge );
		}
	    }
	}
    }
    return results;
};

/*
 * Function: get_parent_nodes
 *
 * Return all parent nodes; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * Parameters: 
 *  nb_id - the node to consider
 *  in_pred - *[optional]* over this predicate
 *
 * Returns: 
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.get_parent_nodes = function(nb_id, in_pred){

    var results = new Array();
    var edges = this.get_parent_edges(nb_id, in_pred);
    for( var i = 0; i < edges.length; i++ ){
	// Make sure that any found edges are in our
	// world.
	var obj_id = edges[i].object_id();
	var tmp_node = this.get_node(obj_id);
	if( tmp_node ){
	    results.push( this.get_node(obj_id) );
	}
    }
    return results;
};

/*
 * Function: get_child_nodes
 *
 * Return all child nodes; the /originals/. If no predicate is given,
 * use the default one.
 * 
 * Parameters: 
 *  nb_id - the node to consider
 *  in_pred - *[optional]* over this predicate
 *
 * Returns: 
 *  array of <bbop.model.node>
 */
bbop.model.graph.prototype.get_child_nodes = function(nb_id, in_pred){

    var results = new Array();

    // Get all children, or just children from a specific relation.
    var preds_to_use = new Array();
    if( in_pred ){
	preds_to_use.push(in_pred);
    }else{
	preds_to_use = this._predicates.array;
    }

    // Try all of our desired predicates.
    for( var j = 0; j < preds_to_use.length; j++ ){
	var pred = preds_to_use[j];

	// Scan the table for goodies; there really shouldn't be a
	// lot here.
	if( this._os_table[ nb_id ] ){		
	    for( var sub_id in this._os_table[nb_id] ){
		// If it looks like something is there, try to see
		// if there is an edge for our current pred.
		if( this.get_edge(sub_id, nb_id, pred) ){
		    // Make sure that any found edges are in our
		    // world.
		    var tmp_node = this.get_node(sub_id);
		    if( tmp_node ){
			results.push( this.get_node(sub_id) );
		    }
		}
	    }
	}
    }
    return results;
};

/*
 * Function: get_ancestor_subgraph
 *
 * Return new ancestors subgraph. Single id or id list as first
 * argument. Predicate string/id as optional second.
 *
 * Parameters: 
 *  nb_id_or_list - the node id(s) to consider
 *  pid - *[optional]* over this predicate
 *
 * Returns: 
 *  <bbop.model.graph>
 */
bbop.model.graph.prototype.get_ancestor_subgraph = function(nb_id_or_list, pid){

    // Shared data structure to trim multiple paths.
    // Nodes: color to get through the graph quickly and w/o cycles.
    var seen_node_hash = {};
    // Edges: just listed--hashing would be essentially the same
    // as a call to graph.add_edge (I think--benchmark?).
    var seen_edge_list = [];
    var anchor = this;

    // Define recursive ascent.
    function rec_up(nid){

	//print('rec_up on: ' + nid);

    	var results = new Array();
    	var new_parent_edges = anchor.get_parent_edges(nid, pid);

	// Capture edge list for later adding.
	for( var e = 0; e < new_parent_edges.length; e++ ){
	    seen_edge_list.push(new_parent_edges[e]);
	}

	// Pull extant nodes from edges. NOTE: This is a retread
	// of what happens in get_parent_nodes to avoid another
	// call to get_parent_edges (as all this is now
	// implemented).
	var new_parents = new Array();
	for( var n = 0; n < new_parent_edges.length; n++ ){
	    // Make sure that any found edges are in our
	    // world.
	    var obj_id = new_parent_edges[n].object_id();
	    var temp_node = anchor.get_node(obj_id);
	    if( temp_node ){
		new_parents.push( temp_node );
	    }
	}

	// Make sure we're in there too.
	var tmp_node = anchor.get_node(nid);
	if( tmp_node ){
	    new_parents.push( tmp_node );
	}

	// Recur on unseen things and mark the current as seen.
    	if( new_parents.length != 0 ){
    	    for( var i = 0; i < new_parents.length; i++ ){
    		// Only do things we haven't ever seen before.
    		var new_anc = new_parents[i];
    		var new_anc_id = new_anc.id();
    		if( ! seen_node_hash[ new_anc_id ] ){
    		    seen_node_hash[ new_anc_id ] = new_anc;
    		    rec_up(new_anc_id);	
    		}
    	    }
    	}
    	return results;
    }
    
    // Recursive call and collect data from search. Make multiple
    // ids possible.
    //if( nb_id_or_list.length && nb_id_or_list.index ){
    if( bbop.core.is_array(nb_id_or_list) ){ // verify listy-ness
	for( var l = 0; l < nb_id_or_list.length; l++ ){	    
	    rec_up(nb_id_or_list[l]);
	}
    }else{
    	rec_up(nb_id_or_list);
    }
    
    // Build new graph using data.
    var new_graph = new bbop.model.graph();
    for( var k in seen_node_hash ){
	new_graph.add_node(seen_node_hash[k]);
    }
    for( var x = 0; x < seen_edge_list.length; x++ ){	    
	new_graph.add_edge(seen_edge_list[x]);
    }

    return new_graph;
};

/*
 * Function: load_json
 * 
 * Load the graph from the specified JSON object (not string).
 * 
 * TODO: a work in progress
 * 
 * Parameters:
 *  JSON object
 * 
 * Returns:
 *  true; side-effects: creates the graph internally
 */
bbop.model.graph.prototype.load_json = function(json_object){

    var anchor = this;

    // First, load nodes; scrape out what we can.
    if( json_object.nodes ){
	bbop.core.each(json_object.nodes,
		       function(node_raw){
			  var nid = node_raw.id;
			  var nlabel = node_raw.lbl;
			  var n = new bbop.model.node(nid, nlabel);
			  anchor.add_node(n);
		      });
    }

    // Now try to load edges; scrape out what we can.
    if( json_object.edges ){
	bbop.core.each(json_object.edges,
		       function(edge_raw){
			   var e = new bbop.model.edge(edge_raw.sub,
						       edge_raw.obj,
						       edge_raw.pred);
			   anchor.add_edge(e);
		      });
    }

    return true;
};
/* 
 * Package: bracket.js
 * 
 * Namespace: bbop.model.bracket.graph
 * 
 * Purpose: An extension of <bbop.model.graph> to produce a bracketed
 * layout (like the neighborhood view in AmiGO 1.8).
 * 
 * TODO: A work in progress...
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core'); // not needed, but want the habit
bbop.core.require('bbop', 'model');
bbop.core.namespace('bbop', 'model', 'bracket', 'graph');

/*
 * Namespace: bbop.model.bracket.graph
 * 
 * Constructor: bracket
 * 
 * Extension of <bbop.model.graph>
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  this
 */
bbop.model.bracket.graph = function(){
    bbop.model.graph.call(this);
    this._is_a = 'bbop.model.bracket.graph';

    var anchor = this;
    var loop = bbop.core.each;
    anchor._logger.DEBUG = true;
    function ll(str){ anchor._logger.kvetch(str); }

    /*
     * Function: bracket_layout
     *
     * Largely borrowed from ChewableGraph.pm from the perl section on
     * AmiGO 2.
     * 
     * Produces a simple bracketed layout based on the maximum
     * distance from the node-of-interest to all other nodes. It also
     * includes direct children as the last row. Useful in some layout
     * contexts.
     *
     * Any node in a properly made graph should be fine, but for the
     * usual end case, see <rich_bracket_layout>.
     * 
     * Parameters: 
     *  term_acc - node of interest
     *
     * Returns: 
     *  list of lists or id strings [[id1, id2], ...]
     */
    this.bracket_layout = function(term_acc){
	
	// This is the actual path climbing agent.
	function max_info_climber(in_curr_term, in_curr_term_dist,
				  in_max_hist, in_enc_hist){

	    // We either bootstrap (first run) or pull them in.
	    var curr_term = in_curr_term || term_acc;
	    var curr_term_distance = in_curr_term_dist || 0;
	    var max_hist = in_max_hist || {};
	    var encounter_hist = in_enc_hist || {};

	    // ll('looking at: ' + curr_term + ' at ' + curr_term_distance);

	    // Only recur if our encounter history sez that either
	    // this node is new or if we have a higher distance count
	    // (in which case we add it and continue on our merry
	    // way).
	    if( ! bbop.core.is_defined(encounter_hist[curr_term]) ){
		// ll(curr_term + ' is a new encounter at distance ' +
		//    curr_term_distance);

		// Note that we have encountered this node before.
		encounter_hist[curr_term] = 1;

		// Our first distance is the current one!
		max_hist[curr_term] = curr_term_distance;

		// Increment our distance.
		curr_term_distance++;

		// Take a look at all the parents of our current term.
		loop(anchor.get_parent_nodes(curr_term),
		     function(p){
			 // Since this is a new node encounter, let's
			 // see what else is out there to discover.
			 max_info_climber(p.id(), curr_term_distance,
					  max_hist, encounter_hist);
		     });

	    }else if( encounter_hist[curr_term] ){
		// ll(curr_term + ' has been seen before');

		// If we're seeing this node again, but with a
		// separate history, we'll add the length or our
		// history to the current, but will not recur in any
		// case (we've been here before).
		if( max_hist[curr_term] < curr_term_distance ){
		    // ll(curr_term +' has a new max of '+ curr_term_distance);
		    max_hist[curr_term] = curr_term_distance;
		}
	    }

	    // Return the collected histories.
	    return max_hist;
	}
	// A hash of the maximum distance from the node-in-question to
	// the roots.
	var max_node_dist_from_root = max_info_climber();
	// ll('max_node_dist_from_root: ' +
	//    bbop.core.dump(max_node_dist_from_root));

	///
	/// Convert this into something like brackets.
	///

	// First, invert hash.
	// E.g. from {x: 1, y: 1, z: 2} to {1: [x, y], 2: [z]} 
	var lvl_lists = {};
	loop(max_node_dist_from_root,
	    function(node_id, lvl){
		// Make sure that level is defined before we push.
		if( ! bbop.core.is_defined(lvl_lists[lvl]) ){
		    lvl_lists[lvl] = [];
		}

		lvl_lists[lvl].push(node_id);
	    });
	// ll('lvl_lists: ' + bbop.core.dump(lvl_lists));

	// Now convert the level-keyed hash into an array of arrays.
	// E.g. from {1: [x, y], 2: [z]} to [[x, y], [z]]
	var bracket_list = [];
	var levels = bbop.core.get_keys(lvl_lists);
	levels.sort(bbop.core.numeric_sort_ascending);
	// ll('levels: ' + bbop.core.dump(levels));
	loop(levels,
	    function(level){
		var bracket = [];
		loop(lvl_lists[level],
		     function(item){
			 bracket.push(item);
		     });
		bracket_list.push(bracket);
	    });
	bracket_list.reverse(); // ...but I want the opposite
	// ll('bracket_list: ' + bbop.core.dump(bracket_list));

	// Well, that takes care of the parents, now lets do the
	// trivial task of adding all of the kids (if any).
	var c_nodes = anchor.get_child_nodes(term_acc);
	// Only add another level when there are actually kids.
	if( c_nodes && ! bbop.core.is_empty(c_nodes) ){ 
	    var kid_bracket = [];
	    loop(c_nodes,
		 function(c){
		     kid_bracket.push(c.id());
		 });
	    bracket_list.push(kid_bracket);
	}

	return bracket_list;
    };

    /*
     * Function: relation_weight
     *
     * A GO-specific take on the relative importance of relations in a
     * graph.
     * 
     * Parameters: 
     *  predicate_acc - as string
     *  default_weight - *[optional]* as numbrt
     *
     * Returns: 
     *  relative weight of predicate as number; defaults to 0
     */
    this.relation_weight = function(predicate_acc, default_weight){

	var rel = predicate_acc || '';
	var dflt = default_weight || 0;
	var order =
	    {
		is_a: 1,
		has_part: 2,
		part_of: 3,
		regulates: 4,
		negatively_regulates: 5,
		positively_regulates: 6
	    };

	var ret_weight = dflt;
	if( bbop.core.is_defined(rel) &&
	    rel &&
	    bbop.core.is_defined(order[rel]) ){
	    ret_weight = order[rel];
	}

	return ret_weight;
    };

    /*
     * Function: dominant_relationship
     *
     * Given a bunch of relationships, return the one that is more
     * "dominant".
     * 
     * A GO-specific take on the relative importance of relations in a
     * graph.
     * 
     * Parameters: 
     *  whatever - predicate acc, or lists of lists them...whatever
     *
     * Returns: 
     *  string acc of the dominant relationship or null
     * 
     * See also:
     *  <relationship_weight>
     */
    this.dominant_relationship = function(){

	// Collect all of the relations, recursively unwinding as
	// necessary to get to the end of the arguments/lists of
	// predicate accs.
	// WARNING: Do /not/ try to refactor this for loop--see the
	// documentation for each for the reason.
	var all_rels = [];
	for( var dri = 0; dri < arguments.length; dri++ ){
	    var arg = arguments[dri];
	    //ll('ARG: ' + arg);
	    if( bbop.core.what_is(arg) === 'array' ){
		// This funny thing is actually "dereferencing" the
		// array one step for the recursion.
		all_rels.push(this.dominant_relationship.apply(this, arg));
	    }else{
		all_rels.push(arg);
	    }
	}
	
	// Sort all of the remaining predicate accs according to
	// relation_weight.
	all_rels.sort(function(a, b){
			  return anchor.relation_weight(b) -
			      anchor.relation_weight(a);
		      });

	// Choose the top if it's there, null otherwise.
	var retval = null;
	if( all_rels.length ){
	    retval = all_rels[0];
	}

	return retval;
    };

    /*
     * Function: rich_bracket_layout
     *
     * Very similar to <bracket_layout>, except that instead of the
     * node id, there is a list of [node_id, node_label, predicate].
     * 
     * This is only reliably producable if the following two condition
     * is met: the transitivity graph is the one made for the node of
     * interest by the GOlr loading engine. This is easy to meet if
     * using GOlr, but probably better to roll your own if you're not.
     * 
     * Also, the relative weight of the relations used is very
     * GO-specific--see <relation_weight>.
     * 
     * Again, heavy borrowing from ChewableGraph.pm from the perl
     * section in AmiGO 2.
     * 
     * Parameters: 
     *  term_acc - node of interest
     *  transitivity_graph - the <bbop.model.graph> for the relations
     *
     * Returns: 
     *  list of lists of lists: [[[id, label, predicate], ...], ...]
     */
    this.rich_bracket_layout = function(term_acc, transitivity_graph){
	
	// First, lets just get our base bracket layout.
	var layout = anchor.bracket_layout(term_acc);

	// So, let's go through all the rows, looking on the
	// transitivity graph to see if we can find the predicates.
	var bracket_list = [];
	loop(layout,
	    function(layout_level){
		var bracket = [];
		loop(layout_level,
		     function(layout_item){

			 // The defaults for what we'll pass back out.
			 var curr_acc = layout_item;
			 var pred_id = 'is_a';			 
			 var curr_node = anchor.get_node(curr_acc);
			 var label = curr_node.label() || layout_item;

			 // 

			 // Now we just have to determine
			 // predicates. If we're the one, we'll just
			 // use the defaults.
			 if( curr_acc == term_acc ){
			     // Default.
			 }else{
			     // Since the transitivity graph only
			     // stores ancestors, we can also use it
			     // to passively test if these are
			     // children we should be looking for.
			     var trels =
				 transitivity_graph.get_predicates(term_acc,
								   curr_acc);
			     if( ! bbop.core.is_empty(trels) ){
				 // Not children, so decide which of
				 // the returned edges is the best.
				 pred_id = anchor.dominant_relationship(trels);
			     }else{
				 // Probably children, so go ahead and
				 // try and pull the direct
				 // parent/child relation.
				 var drels = anchor.get_predicates(curr_acc,
								   term_acc);
				 pred_id = anchor.dominant_relationship(drels);
			     }
			 }

			 // Turn our old layout item into a new-info
			 // rich list.
			 bracket.push([curr_acc, label, pred_id]);
		     });
		// Sort alphanum and then re-add to list.
		bracket.sort(
		    function(a, b){
			if( a[1] < b[1] ){
			    return -1;
			}else if( a[1] > b[1] ){
			    return 1;
			}else{
			    return 0;
			}
		    });
		bracket_list.push(bracket);
	    });

	return bracket_list;
    };
};
bbop.core.extend(bbop.model.bracket.graph, bbop.model.graph);
/* 
 * Package: conf.js
 * 
 * Generic BBOP manager for dealing with gross GOlr configuration
 * and management.
 * 
 * Contains <bbop.golr.conf_field>, <bbop.golr.conf_class>, and
 * <bbop.golr.conf>.
 * 
 * TODO: better document all of this. Essentially, this is all for
 * getting data out of a JSONized version of the YAML files used to
 * drive the OWLTools-Solr parts of GOlr.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'golr');

/*
 * Namespace: bbop.golr.conf_field
 * 
 * Constructor: conf_field
 * 
 * Contructor for a GOlr search field.
 * 
 * Arguments:
 *  field_conf_struct - JSONized config
 * 
 * Returns:
 *  conf_field object
 */
bbop.golr.conf_field = function (field_conf_struct){
    this._is_a = 'bbop.golr.conf_field';

    // Get a good self-reference point.
    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Capture search fields.
    this._field = field_conf_struct;

    /*
     * Function: display_name
     * 
     * The user-facing display name. Suitable for label or title
     * somewhere.
     * 
     * Returns:
     *  Display name string.
     */
    this.display_name = function(){
	return this._field['display_name'];
    };

    /*
     * Function: description
     * 
     * A longer description. Suitable for tooltips.
     * 
     * Returns:
     *  Description string.
     */
    this.description = function(){
	return this._field['description'];
    };

    /*
     * Function: id
     * 
     * The unique ID of this profile.
     * 
     * Returns:
     *  String.
     */
    this.id = function(){
	return this._field['id'];
    };

    /*
     * Function: searchable
     * 
     * Returns whether or not a string field has a shadow
     * "*_searchable" field defined that is suitable for dismax
     * searches. Defaults to false.
     * 
     * Returns:
     *  boolean
     */
    this.searchable = function(){
	var retval = false;
	if( this._field['searchable'] == 'true' ||
	    this._field['searchable'] == true ){
		retval = true;	
	    }
	return retval;
    };

    /*
     * Function: required
     * 
     * Returns whether or not this field is required. Defaults to
     * false.
     * 
     * Not of particular use.
     * 
     * Returns:
     *  Boolean.
     */
    this.required = function(){
	var retval = false;
	if( this._field['required'] == 'true' ||
	    this._field['required'] == true ){
		retval = true;	
	    }
	return retval;
    };

    /*
     * Function: is_multi
     * 
     * Using the "cardinality" entry, returns whether or not this
     * field is "single" (false) or "multi" (true). Defaults to false.
     * 
     * Returns:
     *  Boolean.
     */
    this.is_multi = function(){
	var retval = false;
	if( this._field['cardinality'] == 'multi' ){
	    retval = true;	
	}
	return retval;
    };

    /*
     * Function: is_fixed
     * 
     * Using the "property_type" entry, returns whether or not this
     * field is "dynamic" (false) or "fixed" (true). Defaults to false.
     * 
     * Not of particular use.
     * 
     * Returns:
     *  Boolean.
     */
    this.is_fixed = function(){
	var retval = false;
	if( this._field['property_type'] == 'fixed' ){
	    retval = true;	
	}
	return retval;
    };

    /*
     * Function: property
     * 
     * Returns the method of this field's generation in the loader.
     * 
     * Not of particular use.
     * 
     * Returns:
     *  String.
     */
    this.property = function(){
	var retval = '???';
	if( this._field['property'] ){
	    retval = this._field['property'];
	}
	return retval;
    };

    // TODO: ...
};

/*
 * Namespace: bbop.golr.conf_class
 *
 * Constructor: conf_class
 * 
 * Contructor for a GOlr search class.
 * 
 * Arguments:
 *  class_conf_struct - JSONized config
 * 
 * Returns:
 *  conf_class object
 */
bbop.golr.conf_class = function (class_conf_struct){
    this._is_a = 'bbop.golr.conf_class';

    // Get a good self-reference point.
    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Capture class and the component fields into variables.
    this._class = class_conf_struct;
    // this._fields = {};
    // bbop.core.each(this._class['fields'],
    // 		   function(item, index){
    // 		       var sf = new bbop.golr.conf_field(item);
    // 		       anchor._fields[sf.id()] = sf;
    // 		  });

    /*
     * Function: display_name
     * 
     * The user-facing display name. Suitable for label or title
     * somewhere.
     * 
     * Returns:
     *  Display name string.
     */
    this.display_name = function(){
	return this._class['display_name'];
    };

    /*
     * Function: description
     * 
     * A longer description. Suitable for tooltips.
     * 
     * Returns:
     *  Description string.
     */
    this.description = function(){
	return this._class['description'];
    };

    /*
     * Function: weight
     * 
     * The relative weight of this search class.
     * 
     * Returns:
     *  Integer.
     */
    this.weight = function(){
    	return parseInt(this._class['weight']) || 0;
    };

    /*
     * Function: id
     * 
     * The unique ID of this profile.
     * 
     * Returns:
     *  String.
     */
    this.id = function(){
	return this._class['id'];
    };

    /*
     * Function: searchable_extension
     * 
     * This returns the searchable extension used for this
     * class. There is a typical default, but it might be change in
     * namespace collisions, so it's better to just use this.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    this.searchable_extension = function(){
	return this._class['searchable_extension'] || '_searchable';
    };

    /*
     * Function: get_field
     * 
     * Returns a search field by id string. Null otherwise.
     * 
     * Returns:
     *  <bbop.conf_field>
     */
    this.get_field = function(fid){
	var retval = null;
	if( this._class.fields_hash &&
	    this._class.fields_hash[fid] ){
		retval = new bbop.golr.conf_field(this._class.fields_hash[fid]);
	    }
	return retval;
    };

    // Internal function to determine if the weight category that's
    // used by several functions is okay.
    this._munge_weight_category = function(weight_category){

	// Not defined or only the defined few.
	if( ! weight_category ){
	    throw new Error("Missing weight category");	
	}else if( weight_category != 'boost' &&
	    weight_category != 'result' &&
	    weight_category != 'filter' ){
	    throw new Error("Unknown weight category: " + weight_category);
	}

	return weight_category + '_weights';
    };

    /*
     * Function: get_weights
     * 
     * Get the various weights we need to run.
     * 
     * The weight category can be 'boost', 'result', or 'filter'.
     * 
     * Arguments:
     *  weight_category - string identifying the legal weight category
     * 
     * Returns:
     *  object of {field => weight, ...}
     */
    this.get_weights = function(weight_category){
	
	var rethash = {};

	// Only the defined few.
	weight_category = this._munge_weight_category(weight_category);

	// Collect the good bits.
	if( ! bbop.core.is_defined(this._class[weight_category]) ){
	    throw new Error("Missing weight category: " + weight_category);
	}else{
	    // Only work it if there is something there more than "".
	    if( this._class[weight_category] ){
		var dfab = this._class[weight_category];
		var fields = dfab.split(/\s+/);
		bbop.core.each(fields,
			       function(item, i){
				   var field_val = item.split(/\^/);
				   rethash[field_val[0]] =
				       parseFloat(field_val[1]);
			       });
	    }
	}

	return rethash;
    };

    /*
     * Function: field_order_by_weight
     * 
     * Returns an array of field ids ordered by weight.
     * 
     * The weight category can be 'boost', 'result', or 'filter'.
     * 
     * Arguments:
     * weight_category - string identifying the legal weight category
     * cutoff - *[optional]* if not defined, all listed fields in set returned
     * 
     * Returns:
     *  array like [field5, field4, ...]
     */
    this.field_order_by_weight = function(weight_category, cutoff){

    	var retset = [];

	var weights = this.get_weights(weight_category);

	// Add the ones that meet threshold (if there is one) to the
	// set.
	bbop.core.each(weights,
		       function(key, val){
			   if( cutoff ){
			       if( val >= cutoff ){
				   retset.push(key);			       
			       }
			   }else{
			       retset.push(key);			       
			   }
		      });

	// Order the set.
	retset.sort(function(a, b){
			return weights[b] - weights[a];
		    });

    	return retset;
    };
};

/*
 * Namespace: bbop.golr.conf
 *
 * Constructor: conf
 * 
 * Contructor for the GOlr query manager.
 * Why don't we just take bbop.golr.golr_meta as read? We want to
 * leave the door open to having multiple GOlrs running in the same area.
 * 
 * Arguments:
 *  golr_conf_var - JSized GOlr config
 * 
 * Returns:
 *  golr conf object
 * 
 */
bbop.golr.conf = function (golr_conf_var){
    this._is_a = 'bbop.golr.conf';

    // Get a good self-reference point.
    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Lightly check incoming arguments.
    // There could be a hash of pinned filters argument.
    if( ! golr_conf_var || typeof golr_conf_var != 'object' ){
	ll('ERROR: no proper golr conf var argument');
    }
    
    // Settle in the conf.
    this._golr_conf = golr_conf_var;

    // Process the conf classes into one spot.
    this._classes = {};
    bbop.core.each(anchor._golr_conf,
		  function(key, val){
		      var new_asp = new bbop.golr.conf_class(val);
		      anchor._classes[new_asp.id()] = new_asp;
		  });

    /*
     * Function: get_class
     * 
     * Returns a class info object by id string. Null otherwise.
     * 
     * Arguments:
     *  fid - TODO
     * 
     * Returns:
     *  bbop.conf_class.
     */
    this.get_class = function(fid){
	var retval = null;
	if( this._classes &&
	    this._classes[fid] ){
		retval = this._classes[fid];
	    }
	return retval;
    };

    /*
     * Function: get_classes
     * 
     * Returns an array of all search classes.
     * 
     * Returns:
     *  Array of <bbop.golr.conf_class> (unordered).
     */
    this.get_classes = function(){
	var ret = [];
	bbop.core.each(anchor._classes,
		       function(key, val){
			   ret.push(val);
		       });
	return ret;
    };
};
/* 
 * Package: response.js
 * 
 * Namespace: bbop.golr.response
 * 
 * Generic BBOP handler for dealing with the gross parsing of
 * responses from a GOlr server (whereas <golr_conf> deals with the
 * reported configuration). This is not intended to do anything like
 * modeling the data in the store (<golr_manager>), but rather to deal
 * with things like checking for success, what paging would look like,
 * what parameters were passed, etc.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'golr', 'response');

/*
 * Constructor: response
 * 
 * Contructor for a GOlr query response object.
 * 
 * The constructor argument is an object, not a string.
 * 
 * Arguments:
 *  json_data - the JSON data (as object) returned from a request
 * 
 * Returns:
 *  golr response object
 */
bbop.golr.response = function(json_data){
    this._is_a = 'bbop.golr.response';

    // The raw incoming document.
    this._raw = json_data;

    // Cache for repeated calls to success().
    this._success = null;

    // Cache for repeated calls to get_doc* functions.
    this._doc_id2index = null;
    this._doc_index2_id = null;
};

/*
 * Function: raw
 * 
 * returns a pointer to the initial response object
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  object
 */
bbop.golr.response.prototype.raw = function(){
    return this._raw;
};

/*
 * Function: success
 * 
 * Simple return verification of sane response from server.
 * 
 * Success caches its return value.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
bbop.golr.response.prototype.success = function(){

    if( this._success == null ){

	var robj = this._raw;
	if( robj &&
	    robj.responseHeader &&
	    typeof robj.responseHeader.status != 'undefined' &&
	    robj.responseHeader.status == 0 &&
	    robj.responseHeader.params &&
	    robj.response &&
	    typeof robj.response.numFound != 'undefined' &&
	    typeof robj.response.start != 'undefined' &&
	    typeof robj.response.maxScore != 'undefined' &&
	    robj.response.docs &&
	    robj.facet_counts &&
	    robj.facet_counts.facet_fields ){
		this._success = true;
	    }else{
		this._success = false;
	    }
    }

    return this._success;
};

/*
 * Function: callback_type
 * 
 * Return the callback type if it was specified in the query,
 * otherwise return null. For example "reset" and "response".
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  string (or null)
 */
bbop.golr.response.prototype.callback_type = function(){
    var robj = this._raw;
    var retval = null;
    if( robj.responseHeader.params.callback_type &&
	typeof robj.responseHeader.params.callback_type != 'undefined' ){
	    retval = robj.responseHeader.params.callback_type;
	}
    return retval;
};

/*
 * Function: parameters
 * 
 * Get the parameter chunk--variable stuff we put in.
 * 
 * Pretty general, specialized functions are better.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash
 */
bbop.golr.response.prototype.parameters = function(){
    var robj = this._raw;
    return robj.responseHeader.params;
};

/*
 * Function: parameter
 * 
 * Get the parameter chunk--variable stuff we put in.
 * 
 * Pretty general, specialized functions are better.
 * 
 * Arguments:
 *  n/a
 *  key - string id for the wanted parameter
 * 
 * Returns:
 *  hash, string, whatever is there at that key (otherwise null)
 */
bbop.golr.response.prototype.parameter = function(key){
    var robj = this._raw;
    var retval = null;
    if( robj.responseHeader.params[key] && robj.responseHeader.params[key] ){
	retval = robj.responseHeader.params[key];
    }
    return retval;
};

/*
 * Function: row_step
 * 
 * Returns the number of rows requested (integer).
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
bbop.golr.response.prototype.row_step = function(){	
    var robj = this._raw;
    return parseInt(robj.responseHeader.params.rows);
};

/*
 * Function: total_documents
 * 
 * Return the total number of documents found.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
bbop.golr.response.prototype.total_documents = function(){
    var robj = this._raw;
    return parseInt(robj.response.numFound);
};

/*
 * Function: start_document
 * 
 * Returns the start document for this response as an integer.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
bbop.golr.response.prototype.start_document = function(){
    var robj = this._raw;
    return parseInt(robj.response.start) + 1;
};

/*
 * Function: end_document
 * 
 * Returns the end document for this response as an integer.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
bbop.golr.response.prototype.end_document = function(){
    var robj = this._raw;
    return this.start_document() +
	parseInt(robj.response.docs.length) - 1;
};

/*
 * Function: packet
 * 
 * Return the packet number of the current response.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer or null (no packet defined)
 */
bbop.golr.response.prototype.packet = function(){
    var robj = this._raw;
    var retval = null;
    var pval = robj.responseHeader.params.packet;
    if( pval ){
	retval = parseInt(pval);
    }
    return retval;
};

/*
 * Function: paging_p
 * 
 * Whether or not paging is necessary with the given results set.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
bbop.golr.response.prototype.paging_p = function(){
    var robj = this._raw;
    var retval = false;
    if( this.total_documents() > this.row_step() ){
	retval = true;
    }
    return retval;
};

/*
 * Function: paging_previous_p
 * 
 * Whether or paging backwards is an option right now.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
bbop.golr.response.prototype.paging_previous_p = function(){
    // We'll take this as a proxy that a step was taken.
    // Remember: we offset the start_document by one for readability.
    var robj = this._raw;
    var retval = false;
    if( this.start_document() > 1 ){
	retval = true;
    }
    return retval;
};

/*
 * Function: paging_next_p
 * 
 * Whether or paging forwards is an option right now.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
bbop.golr.response.prototype.paging_next_p = function(){
    // We'll take this as a proxy that a step was taken.
    var robj = this._raw;
    var retval = false;
    if( this.total_documents() > this.end_document() ){
	retval = true;	
    }
    return retval;
};

/*
 * Function: documents
 * 
 * Returns an array of raw and unprocessed document hashes.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash
 */
bbop.golr.response.prototype.documents = function(){
    var robj = this._raw;
    return robj.response.docs;
};

/*
 * Function: get_doc
 * 
 * Returns a specified document.
 * 
 * Arguments:
 *  doc_id - document identifier either an id (first) or place in the array
 * 
 * Returns:
 *  document hash or null
 */
bbop.golr.response.prototype.get_doc = function(doc_id){

    var doc = null;
    var robj = this._raw;

    // First check if the document is available by position.
    var docs = robj.response.docs;
    if( docs && docs[doc_id] ){
	doc = docs[doc_id];
    }else{ // Not available by position, so lets see if we can get it by id.
	
	//print('in: ' + doc_id + ' _' + this._doc_id2index);

	// Build the doc index if it isn't there.
	var local_anchor = this;
	if( ! this._doc_id2index ){
	    //print('BUILD triggered on: ' + doc_id);
	    this._doc_id2index = {};
	    this._doc_index2id = {};
	    bbop.core.each(docs,
			   function(doc_item, doc_index){
			       var did = doc_item['id'];
			       //print('BUILD: ' + did + ' => ' + doc_index);
			       local_anchor._doc_id2index[did] = doc_index;
			       local_anchor._doc_index2id[doc_index] = did;
			   });
	}
	
	//print('pre-probe: ' + doc_id + ' _' + this._doc_id2index);

	// Try and probe it out.
	if( this._doc_id2index &&
	    bbop.core.is_defined(this._doc_id2index[doc_id]) ){
	    //print('PROBE: ' + doc_id);
	    var doc_i = this._doc_id2index[doc_id];
	    doc = docs[doc_i];
	}
    }

    return doc;
};

/*
 * Function: get_doc_field
 * 
 * Returns the value(s) of the requested fields.
 * 
 * Arguments:
 *  doc_id - document identifier either an id (first) or place in the array
 *  field_id - the identifier of the field we're trying to pull
 * 
 * Returns:
 *  value or list of values
 */
bbop.golr.response.prototype.get_doc_field = function(doc_id, field_id){

    var ret = null;

    // If we found our doc, go ahead and start looking for the field.
    var doc = this.get_doc(doc_id);
    if( doc && bbop.core.is_defined(doc[field_id]) ){
	
	// We have an answer with this.
	ret = doc[field_id];
    }

    return ret;
};

/*
 * Function: get_doc_field_hl
 * 
 * Returns the highlighted value(s) of the requested fields.
 * 
 * WARNING: This function is a work in progress and may not return
 * multi-valued fields properly. If you find an issues, please let the
 * developers know. This is currently returning 
 * 
 * Arguments:
 *  doc_id - document id
 *  field_id - the identifier of the field we're trying to pull
 * 
 * Returns:
 *  string or list of highlight, or null if nothing was found
 */
bbop.golr.response.prototype.get_doc_field_hl = function(doc_id, field_id){

    var ret = null;
    var robj = this._raw;

    // See if we can find a highlighted version. First, see if the
    // document is in the hilight section; otherwise try and pull the
    // id out first, then head for the highlight section.
    var hilite_obj = null;
    if( robj.highlighting && robj.highlighting[doc_id] ){
	hilite_obj = robj.highlighting[doc_id];
    }else{
	var iid = this._doc_index2id[doc_id];
	if( iid ){
	    var new_doc = this.get_doc(iid);
	    var new_doc_id = new_doc['id'];
	    if( robj.highlighting && robj.highlighting[new_doc_id] ){
		hilite_obj = robj.highlighting[new_doc_id];
	    }
	}
    }

    // Now see if the highlighted field is there.
    if( hilite_obj && hilite_obj[field_id] ){
	
	// BUG/TODO: Detect whether we want a list or
	// single-valued return.
	ret = hilite_obj[field_id][0];
    }

    return ret;
};

// /*
//  * Function: facet_fields
//  * 
//  * Return a count sorted array of the response's facet fields and counts.
//  * 
//  * Arguments:
//  *  n/a
//  * 
//  * Returns:
//  *  list of string/integer doublets
//  */
// bbop.golr.response.prototype.facet_fields = function(){
//     var robj = this._raw;
//     return robj.facet_counts.facet_fields;
// };

/*
 * Function: facet_field_list
 * 
 * Return a count sorted array of the response's facet fields.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  list of strings
 */
bbop.golr.response.prototype.facet_field_list = function(){
    var robj = this._raw;
    return bbop.core.get_keys(robj.facet_counts.facet_fields).sort();
};

/*
 * Function: facet_field
 * 
 * Return a count-sorted array of a facet field's response.
 * 
 * : [["foo", 60], ...]
 * 
 * Arguments:
 *  n/a
 *  facet_name - name of the facet to examine
 * 
 * Returns:
 *  list of nested lists
 */
bbop.golr.response.prototype.facet_field = function(facet_name){
    var robj = this._raw;
    return robj.facet_counts.facet_fields[facet_name];
};

/*
 * Function: facet_counts
 * 
 * For a given facet field, return a hash of that field's items and
 * their counts.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash of facets to their integer counts
 */
bbop.golr.response.prototype.facet_counts = function(){

    var robj = this._raw;
    var ret_hash = {};

    var anchor = this;
    
    var each = bbop.core.each;
    var facet_field_list = this.facet_field_list();
    each(facet_field_list,
	 function(ffield){
	     
	     // Make sure the top field is present,
	     if( ! ret_hash[ffield] ){
		 ret_hash[ffield] = {};		
	     }

	     var facet_field_items = anchor.facet_field(ffield);
	     each(facet_field_items,
		  function(item, index){
		      var name = item[0];
		      var count = item[1];
		      ret_hash[ffield][name] = count;
		  });
	 });
    
    return ret_hash;
};

/*
 * Function: query
 * 
 * Return the raw query parameter "q".
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  string or null
 */
bbop.golr.response.prototype.query = function(){
    var robj = this._raw;    
    var retval = null;
    
    if( robj.responseHeader.params && robj.responseHeader.params.q ){
	retval = robj.responseHeader.params.q;
    }
    
    return retval;
};

/*
 * Function: query_filters
 *
 * A sensible handling of the not-so-great format of "fq" returned by
 * Solr (fq can be irritating single value or irritating array, along
 * with things like "-" in front of values). Since plus and minus
 * filters are mutually exclusive, we have a return format like:
 * 
 * : {field1: {filter1: (true|false), ...}, ...}
 * 
 * Where the true|false value represents a positive (true) or negative
 * (false) filter.
 * 
 * Parameters:
 *  n/a
 *
 * Returns:
 *  a hash of keyed hashes
 */
bbop.golr.response.prototype.query_filters = function(){
    var robj = this._raw;    
    var ret_hash = {};
    var fq_list = this.parameter('fq');
    if( fq_list ){
	
	// Ensure that it's a list and not just a naked string (as can
	// sometimes happen).
	if( bbop.core.what_is(fq_list) == 'string'){
	    fq_list = [fq_list];
	}
	
	// Make the return fq more tolerable.
	var each = bbop.core.each;
	each(fq_list,
	     function(fq_item){
		 
		 // Split everything on colons. Field is the first
		 // one, and everything else joined back together is
		 // the value of the filter. Best if you think about
		 // the GO id and non-GO id cases.
		 var splits = fq_item.split(":");
		 var field = splits.shift();
		 var value = splits.join(":"); // GO 0022008 -> GO:0022008

		 // First let's just assume that we have a positive
		 // filter.
		 var polarity = true;
		 
		 // Check and see if the first value in our
		 // field is '-' or '+'. If so, edit it out, but
		 // change the polarity in the '-' case.
		 if( field.charAt(0) == '-' ){
		     polarity = false;
		     field = field.substring(1, field.length);
		 }else if( field.charAt(0) == '+' ){
		     field = field.substring(1, field.length);
		 }

		 // Ensure that there is a place in the return hash
		 // for us.
		 if( ! ret_hash[field] ){
		     ret_hash[field] = {};
		 }
		 
		 // I want just the first quote and the final quote
		 // gone from the value if they are matching quotes.
		 if( value.charAt(0) == '"' &&
		     value.charAt(value.length -1) == '"' ){
			 value = value.substring(1, value.length -1);
		     }
		 
		 // The final filter note.
		 ret_hash[field][value] = polarity;
		 
	     });
    }
    
    return ret_hash;
};
/* 
 * Package: manager.js
 * 
 * Namespace: bbop.golr.manager
 * 
 * Generic BBOP manager for dealing with gross GOlr configuration and
 * management. Remember, this is actually a "subclass" of
 * <bbop.registry>. The defined events for this registry are: "reset",
 * "search", and "error".
 * 
 *  reset - functions for initializing and resetting
 *  search - functions for receiving standard search results
 *  error - functions to call when something goes very wrong
 * 
 * Both json_data (or clean error data) and the manager itself (this
 * as anchor) should be passed to the callbacks.
 * 
 * TODO/BUG: <set_query> and <set_default_query> should both take
 * strings or <bbop.logic> as arguments. Those, as well as <get_query>
 * and <get_query> should only return <bbop.logic>.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'registry');
bbop.core.require('bbop', 'golr', 'conf');
bbop.core.namespace('bbop', 'golr', 'manager');

/*
 * Constructor: manager
 * 
 * Contructor for the GOlr query manager
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server;
 *  golr_conf_obj - a <bbop.golr.conf> object
 * 
 * Returns:
 *  golr manager object
 * 
 * See also:
 *  <bbop.registry>
 */
bbop.golr.manager = function (golr_loc, golr_conf_obj){
    //bbop.registry.call(this, ['reset', 'search', 'error']);
    bbop.registry.call(this, ['reset', 'search', 'error']);
    this._is_a = 'bbop.golr.manager';

    // Get a good self-reference point.
    var anchor = this;

    // Per-manager logger.
    this._logger = new bbop.logger(this._is_a);
    //this._logger.DEBUG = true;
    this._logger.DEBUG = false;
    function ll(str){ anchor._logger.kvetch(str); }

    // To help keep requests from the past haunting us. Actually doing
    // something with this number is up to the UI.
    this.last_sent_packet = 0;
    //this.last_received_packet = 0;

    // Lightly check incoming arguments.
    // There should be a string url argument.
    // There could be a hash of pinned filters argument.
    if( ! golr_loc || ! golr_conf_obj ){
	ll('ERROR: no proper arguments');
    }
    if( typeof golr_loc != 'string' ){
	ll('ERROR: no proper golr url string argument');
    }
    if(	! golr_conf_obj._is_a || ! golr_conf_obj._is_a == 'bbop.golr.conf' ){
	    ll('ERROR: no proper bbop.golr.conf object argument');
	    throw new Error('boink! ' + bbop.core.what_is(golr_conf_obj) );
	}
    
    // Whether or not to prevent ajax events from going.
    // This may not be usable, or applicable, to all backends.
    this._safety = false;

    // Our default target url.
    this._solr_url = golr_loc;

    // Settle in the configurations.
    // this._golr_conf = new bbop.golr.conf(golr_conf_var);
    this._golr_conf = golr_conf_obj;

    // The current data batches that we are storing.
    this._batch_urls = [];
    this._batch_accumulator_func = function(){};
    this._batch_final_func = function(){};

    // The current class/personality that we're using. It may be none.
    this._current_class = null;

    // Our (default) query and the real deal.
    this.fundamental_query = '*:*'; // cannot be changed
    this.default_query = '*:*'; // changable
    this.query = this.default_query; //current

    // Our (default) fl and whatever we have now.
    this.default_fl = '*%2Cscore';
    this.current_fl = this.default_fl;

    // We remember defaults in the case of rows and start since they
    // are the core to any paging mechanisms and may change often.
    this.default_rows = 10;
    this.default_start = 0;

    // There is a reason for this...TODO: later (25+)
    this.default_facet_limit = 25;
    this.current_facet_limit = 25;
    // {facet_field_name: value, ...}
    this.current_facet_field_limits = {};
    // TODO: paging for facets;
    this.current_facet_offset = 25;
    this.current_facet_field_offsets = {};

    // Our default query args, with facet fields plugged in.
    this.query_variants =
	{
	    // Our default standard search type. This means we don't
	    // have to explicitly add fields to the search (although
	    // the query fields ('qf') are still necessary to make
	    // anything real happen).
	    defType: 'edismax',

	    // Things unlikely to be touched.
	    // There are unlikely to be messed with too much.
	    qt: 'standard',
	    indent: 'on',
	    wt: 'json',
	    //version: '2.2',
	    rows: anchor.default_rows,
	    start: anchor.default_start, // Solr is offset indexing
	    //fl: '*%2Cscore',
	    fl: anchor.default_fl,
    
	    // Deprecated: see query_filters
	    //fq: {},
	    
	    // Deprecated: see query_fields
	    //qf: {},
	    
	    // Deprecated: see query
	    //q: '*:*'

	    // Control of facets.
	    facet: 'true',
	    'facet.mincount': 1,
	    'facet.sort': 'count',
	    'json.nl': 'arrarr', // only in facets right now
	    'facet.limit': anchor.default_facet_limit,
	    //'facet.limit': 25,
	    // TODO?: 'f.???.facet.limit': 50,
	    // TODO: 'json.nl': [flat|map|arrarr]
	    // They are unlikely to be messed with too much.
	    'facet.field': []
	};

    // This is the 'qf' parameter. Althoug we keep it, it only needs
    // to be exposed when the query ('q') field is set. These have a
    // different format, so assemble can't really be used.:
    // [qf=field01^value01]
    this.query_fields = [];

    // A richer way to handle the 'fq' query variant.
    // It should look like:
    // {<filter>: {<value>:{'sticky_p':(t|f), 'negative_p':(t|f)}, ...}}
    this.query_filters = {};

    /*
     * Function: debug
     * 
     * Turn on or off the verbose messages. Uses <bbop.logger>, so
     * they should come out everywhere.
     * 
     * Parameters: 
     *  p - *[optional]* true or false for debugging
     *
     * Returns: 
     *  boolean; the current state of debugging
     */
    this.debug = function(p){
	if( p == true || p == false ){
	    this._logger.DEBUG = p;
	    // TODO: add debug parameter a la include_highlighting
	}
	return this._logger.DEBUG;
    };

    /*
     * Function: lite
     * 
     * Limit the returns fields (the parameter "fl") to the ones
     * defined in the set of fields defined in results, boost, and
     * filter, plus score.
     * 
     * The default is "true".
     * 
     * Parameters: 
     *  use_lite_p - *[optional]* true or false, none just returns current
     *
     * Returns: 
     *  boolean; the current state of lite-ness
     */
    this.lite = function(use_lite_p){

	// Adjust the current state accordingly.
	if( use_lite_p == true || use_lite_p == false ){
	    if( use_lite_p == true ){
		
		// The actual collections and adjustment.
		// First, this only works if we have a personality, so
		// check to see if we have one.
		var per = anchor.get_personality();
		if( per ){
		    // Since we have a personality, collect all of the
		    // mentioned fields.
		    var field_collection = {};
		    var loop = bbop.core.each;
		    var union = bbop.core.merge;
		    loop(['boost', 'result', 'filter'],
			 function(cat){
			     field_collection = 
				 union(field_collection,
				       anchor._current_class.get_weights(cat));
			 });
		    
		    // Finally, set these fields (plus score) as the
		    // new return fields.
		    var flist = bbop.core.get_keys(field_collection);
		    flist.push('score');
		    anchor.current_fl = flist.join('%2C');
		    anchor.set('fl', anchor.current_fl);
		}

	    }else{ // else false
		// Reset.
		anchor.current_fl = anchor.default_fl;
		anchor.set('fl', anchor.current_fl);
	    }
	}

	// Return the current state.
	var retval = false;
	if( anchor.default_fl != anchor.current_fl ){
	    retval = true;
	}
	return retval;
    };

    // An internal helper function to munge the name of a field into
    // the name of its corresponding facet field.
    function _field_to_facet_field(field){
	return 'f.' + field + '.facet.limit';
    }
    
    /*
     * Function: get_facet_limit
     * 
     * Get the limit for a specified facet or the global limit.
     * 
     * Parameters: 
     *  field - *[optional]* limit for a specific field; otherwise global value
     *
     * Returns: 
     *  integer or null
     */
    this.get_facet_limit = function(field){
	var retval = null;

	if( ! field ){
	    retval = anchor.current_facet_limit;
	}else{
	    var f = _field_to_facet_field(field);
	    var try_val = anchor.current_facet_field_limits[f];
	    if( bbop.core.is_defined(try_val) ){
		retval = try_val;
	    }
	}

	return retval;
    };

    /*
     * Function: set_facet_limit
     * 
     * Change the number of facet values returned per call.
     * The default is likely 25.
     * 
     * Just as in Solr, a -1 argument is how to indicate unlimted
     * facet returns.
     * 
     * This setting does not survive things like <resets_facet_limit>.
     * 
     * Parameters: 
     *  arg1 - (integer) set the global limit
     *
     * Parameters: 
     *  arg1 - (string) the name of the field to check
     *  arg2 - (integer) set the limit for this field
     *
     * Returns: 
     *  boolean on whether something was set
     */
    this.set_facet_limit = function(arg1, arg2){
	var retval = false;

	// Decide which form of the function we're using.
	if( ! bbop.core.is_defined(arg2) && 
	    bbop.core.what_is(arg1) == 'number' ){ // form one
		
		// Set
		var nlimit = arg1;
		anchor.current_facet_limit = nlimit;
		anchor.set('facet.limit', anchor.current_facet_limit);
		
		retval = true;
	
	}else if( bbop.core.is_defined(arg1) && 
		  bbop.core.is_defined(arg2) &&
		  bbop.core.what_is(arg1) == 'string' &&
		  bbop.core.what_is(arg2) == 'number' ){
		      
		      var field = _field_to_facet_field(arg1);
		      var limit = arg2;
		      anchor.current_facet_field_limits[field] = limit;
		      
		      retval = true;
	}

	return retval;
    };

    /*
     * Function: set_default_facet_limit
     * 
     * Permanently change the default number of facet values returned
     * per call. The default's default is likely 25.
     * 
     * Just as in Solr, a -1 argument is how to indicate unlimted
     * facet returns.
     * 
     * Parameters: 
     *  lim - (integer) set the global default limit
     *
     * Returns: 
     *  old default
     */
    this.set_default_facet_limit = function(lim){

	// Capture ret.
	var retval = anchor.default_facet_limit;

	// Set
	anchor.default_facet_limit = lim;
	//anchor.set('facet.limit', anchor.default_facet_limit);
		
	return retval;
    };

    /*
     * Function: reset_facet_limit
     * 
     * Either reset the global limit to the original (likely 25)
     * and/or remove the specified filter. Sets everything back to the
     * original values or whatever was set by
     * <set_default_facet_limit>.
     * 
     * Parameters: 
     *  field - *[optional]* remove limit for a field; otherwise all and global
     *
     * Returns: 
     *  boolean on whether something was reset
     */
    this.reset_facet_limit = function(field){
	var retval = false;

	if( ! bbop.core.is_defined(field) ){
	    // Eliminate all fields by blowing them away.
	    anchor.current_facet_limit = anchor.default_facet_limit;
	    anchor.set('facet.limit', anchor.current_facet_limit);
	    anchor.current_facet_field_limits = {};
	    retval = true;
	}else{ // eliminate just the one field
	    var f = _field_to_facet_field(field);
	    if( bbop.core.is_defined(anchor.current_facet_field_limits[f]) ){
		delete anchor.current_facet_field_limits[f];
		retval = true;
	    }
	}

	return retval;
    };

    /*
     * Function: plist_to_property_hash
     *
     * Turn a plist to a hash containing the different properties that
     * can be defined for a query filter. Possible values are: '+'
     * (positive filter), '-' (negative filter), '*' (sticky filter),
     * '$' (transient). If mutually exclusive properties are defined
     * (e.g. both '+' and '-'), the last one will be used. Or, since
     * that is a call to silliness, let's say the behavior is
     * undefined.
     *
     * Parameters: 
     *  plist - *[optional]* a list of properties to apply to the filter
     *
     * Returns: 
     *  A hash version of the plist; otherwise, the default property hash
     */
    this.plist_to_property_hash = function(plist){

	// Let's start with the default values.
	var phash = {
	    //'positive_p': true,
	    'negative_p': false,
	    //'transient_p': true
	    'sticky_p': false
	};

	// If not defined, just return the default list.
	if( plist ){	    
	    bbop.core.each(plist,
			   function(item){
			       if( item == '+' ){
				   phash['negative_p'] = false;
				   //phash['positive_p'] = true;
			       }else if( item == '-' ){
				   phash['negative_p'] = true;
				   //phash['positive_p'] = false;
			       }else if( item == '*' ){
				   phash['sticky_p'] = true;
				   //phash['transient_p'] = false;
			       }else if( item == '$' ){
				   phash['sticky_p'] = false;
				   //phash['transient_p'] = true;
			       }
			   });
	}

	return phash;
    };

    /*
     * Function: add_query_filter
     *
     * Setter for query filters ('fq').
     *
     * Parameters: 
     *  filter - filter (type) string
     *  value - filter value string (or TODO: defined logic hash)
     *  plist - *[optional]* list of properties of the filter
     *
     * Returns: 
     *  (TODO) The current query filter hash.
     * 
     * See also:
     *  <plist_to_property_hash>
     */
    this.add_query_filter = function(filter, value, plist){
	
	// Make sure we've defined the group.
	if( ! bbop.core.is_defined(this.query_filters[filter]) ){
	    this.query_filters[filter] = {};
	}

	this.query_filters[filter][value] = this.plist_to_property_hash(plist);
	
	//ll("Current state: " + bbop.core.dump(this.query_filters));

	return {}; // TODO
   };

    /*
     * Function: remove_query_filter
     *
     * Remover for query filters ('fq'), is a plist is specified, it
     * will only remove if all of the listed criteria are met.
     *
     * Parameters: 
     *  filter - filter (type) string
     *  value - filter value string (TODO: or defined logic hash)
     *  plist - *[optional]* list of properties of the filter
     *
     * Returns: 
     *  boolean (on success)
     */
    this.remove_query_filter = function(filter, value, plist){

	// Default return value.
	var retval = false;

	// Internal helper to delete a low level key, and then if the
	// top-level is empty, get that one too.
	function _full_delete(hash, key1, key2){
	    if( key1 && key2 && hash &&
		hash[key1] && hash[key1][key2] ){
		    delete hash[key1][key2];
		}
	    if( bbop.core.is_empty(hash[key1]) ){
		delete hash[key1];
	    }
	}

	// If we have a filter, a value, and it's there...
	if( filter && value &&
	    anchor.query_filters[filter] &&
	    anchor.query_filters[filter][value] ){

		// If no real plist hash been defined, just go ahead
		// and get rid of that. Otherwise, make sure that the
		// defined plist and the stored properties are the
		// same before deleting.
		if( ! plist || bbop.core.is_empty(plist) ){
		    _full_delete(anchor.query_filters, filter, value);
		    retval = true;
		}else{
		    
		    var filter_phash = anchor.query_filters[filter][value];
		    var in_phash = anchor.plist_to_property_hash(plist);
		    
		    if( bbop.core.is_same(filter_phash, in_phash) ){		
			_full_delete(anchor.query_filters, filter, value);
			retval = true;
		    }
		}
	    }

	return retval;
    };

    /*
     * Function: reset_query_filters
     *
     * Reset the query filters ('fq'); but leave sticky filters alone.
     *
     * Parameters: 
     *  n/a
     * 
     * Returns: 
     *  (TODO) The current query filter hash.
     */
    this.reset_query_filters = function(){

	// Drill down and delete all non-stickies.
	var loop = bbop.core.each;
	loop(anchor.query_filters,
	     function(filter, values){
		 //ll('filter: ' + filter);
		 loop(values,
		      function(value, props){
			  //ll('  value: ' + value);
			  var sticky_p = props['sticky_p'];
			  if( ! sticky_p ){
			      //ll('hit: ' + filter + ', ' + value);
			      anchor.remove_query_filter(filter, value);
			  }
		      });
	     });

	return {}; // TODO
    };

    /*
     * Function: get_query_filter_properties
     *
     * Get a hash representing a query filter ('fq').
     *
     * Parameters: 
     *  key - filter string (TODO: or defined logic hash)
     *
     * Returns: 
     *  The current query filter hash for key.
     */
    this.get_query_filter_properties = function(filter, value){

	// Default return value.
	var retobj = null;
	
	// If we have a key and it's there...
	var aqf = anchor.query_filters;
	if( filter && value && aqf[filter] && aqf[filter][value] ){
	    retobj =
		{
		    'filter' : filter,
		    'value' : value,
		    //'polarity': aqf[filter][value]['negative_p'],
		    'negative_p': aqf[filter][value]['negative_p'],
		    'sticky_p': aqf[filter][value]['sticky_p']
		};
	}

	return retobj;
    };

    /*
     * Function: get_query_filters
     *
     * Get a list of hashes representing the query filters ('fq'). The
     * return lists look like:
     *
     * : [{'filter': A, 'value': B, 'negative_p': C, 'sticky_p': D}, ...]
     *
     * Where A and B are strings and C and D are booleans.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns: 
     *  A list of the current query filter hashs.
     */
    this.get_query_filters = function(){

	var retlist = [];	
	var loop = bbop.core.each;
	loop(anchor.query_filters,
	     function(f, values){
		 loop(values,
		      function(v, props){
			  retlist.push(anchor.get_query_filter_properties(f,v));
		      });
	     });

	return retlist;
    };

    /*
     * Function: get_sticky_query_filters
     *
     * Get a list of hashes representing the current stucky query
     * filters ('fq'). See <get_query_filters> for a specification of
     * what the return type looks like.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns: 
     *  A list of the current sticky query filter hashs.
     * 
     * See also:
     *  <get_query_filters>
     */
    this.get_sticky_query_filters = function(){

	var retlist = [];	
	var loop = bbop.core.each;
	loop(anchor.query_filters,
	     function(f, values){
		 loop(values,
		      function(v, props){
			  var qfp = anchor.get_query_filter_properties(f,v);
			  if( qfp['sticky_p'] == true ){
			      retlist.push(qfp);			      
			  }
		      });
	     });

	return retlist;
    };

    // A little extra thing that we might need sometimes.
    this.query_extra = null;

    // The callback function called after a successful AJAX
    // intialization/reset call. First it runs some template code,
    // then it does all of the callbacks.
    this._run_reset_callbacks = function(json_data){
	ll('run reset callbacks...');
	anchor.apply_callbacks('reset', [json_data, anchor]);
    };

    // The main callback function called after a successful AJAX call in
    // the update function.
    this._run_search_callbacks = function(json_data){
	ll('run search callbacks...');
	anchor.apply_callbacks('search', [json_data, anchor]);
    };

    // This set is called when we run into a problem.
    this._run_error_callbacks = function(json_data){
	ll('run error callbacks...');
	anchor.apply_callbacks('error', [json_data, anchor]);
    };

    /*
     * Function: sensible_query_p
     * 
     * Simply ask the manager if a free text query ('q') makes sense
     * at this point.
     * 
     * This currently means that the query text ('q') is three (3) or
     * longer and that query fields ('qf') are defined.
     * 
     * This is an overridable opinion of the manager.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  boolean
     */
    this.sensible_query_p = function(qfs){
	var retval = false;
	var q = anchor.get_query();
	var qf = anchor.query_field_set();
	if( q && q.length >= 3 && qf && ! bbop.core.is_empty(qf) ){
	    retval = true;
	}
	return retval;
    };

    /*
     * Function: last_packet_sent
     *
     * It is up to the UI to do something interesting with this number.
     * 
     * Also remember that this number only rises through calls to
     * <update> or one of its wrappers. Calls to <get_query_url> and
     * the like will not affect this number.
     * 
     * Parameters:
     *  n/a 
     *
     * Returns:
     *  integer
     * 
     * See also:
     *  <update>
     */
    this.last_packet_sent = function(){
    	return anchor.last_sent_packet;
    };

    /*
     * Function: clear
     *
     * Clear all non-sticky query parameters to get back to a more
     * "original" state.
     * 
     * Not to be confused with <reset>.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.clear = function(){

	// Reset 'q'.
	anchor.query = anchor.default_query;

	// Reset 'fq', all but sticky.
	anchor.reset_query_filters();
    };

    /*
     * Function: reset
     *
     * Manually trigger the "reset" chain of events.
     *
     * This is a curried wrapper for <update> and should be preferred
     * over a direct call to update.
     *
     * Note to be confused with <clear>.
     *
     * Returns:
     *  the query url (with the jQuery callback specific parameters)
     * 
     * See also:
     *  <update>
     */
    this.reset = function(){
	return anchor.update('reset');
    };

    /*
     * Function: search
     *
     * Trigger the "search" chain of events.
     * Takes a field-keyed hash of bbop.logics as an argument.
     * 
     * This is a curried wrapper for <update> and should be preferred
     * over a direct call to update.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  the query url (with the jQuery callback specific parameters)
     * 
     * See also:
     *  <update>
     */
    this.search = function(){
	return anchor.update('search');
    };

    /*
     * Function: page
     *
     * Re-trigger the "search" chain of events, but with the variables
     * set for a different section of the results.
     * 
     * Note that this operates independently of any impossibilites in
     * the results--just how such paging would look and
     * triggering. Ths UI should handle impossibilities and the like.
     * 
     * This is a wrapper for <update> and should be preferred over a
     * direct call to update.
     * 
     * Parameters: 
     *  rows - the number of rows to return
     *  start - the offset of the rows to return
     *
     * Returns:
     *  the query url (with the jQuery callback specific parameters)
     * 
     * See also:
     *  <update>
     */
    this.page = function(rows, start){
	anchor.set('rows', rows);
	anchor.set('start', start);
	return anchor.update('search', rows, start);
    };

    /*
     * Function: page_first
     *
     * Currently a convenience alias for <search>. Think about it--it
     * makes sense.
     * 
     * This is a wrapper for <page> and should be preferred over a
     * direct call to page.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  n/a
     * 
     * See also:
     *  <page>
     */
    this.page_first = anchor.search;
    
    /*
     * Function: page_previous
     * 
     * This is a wrapper for <page> and should be preferred over a
     * direct call to page.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  the query url (with the jQuery callback specific parameters)
     * 
     * See also:
     *  <page>
     */
    this.page_previous = function(){
	var do_rows = anchor.get_page_rows();
	var do_offset = anchor.get_page_start() - do_rows;
	return anchor.page(do_rows, do_offset);
    };
    
    /*
     * Function: page_next
     * 
     * This is a wrapper for <page> and should be preferred over a
     * direct call to page.
     * 
     * Parameters: 
     *  the query url (with the jQuery callback specific parameters)
     *
     * Returns:
     *  n/a
     * 
     * See also:
     *  <page>
     */
    this.page_next = function(){
	var do_rows = anchor.get_page_rows();
	var do_offset = anchor.get_page_start() + do_rows;
	return anchor.page(do_rows, do_offset);
    };
    
    /*
     * Function: page_last
     * 
     * Trigger search on last page parameters.
     * 
     * Since the manager has no idea about what is actually being
     * returned, the real world number of total documents needs to be
     * added as an argument.
     * 
     * This is a wrapper for <page> and should be preferred over a
     * direct call to page.
     * 
     * Parameters: 
     *  total_document_count - integer for the total number of docs found
     *
     * Returns:
     *  the query url (with the jQuery callback specific parameters)
     * 
     * See also:
     *  <page>
     */
    this.page_last = function(total_document_count){
	var do_rows = anchor.get_page_rows();
	var mod = total_document_count % do_rows;
	var do_offset = total_document_count - mod;
	// ll("page_last: " + total_document_count + " " +
	//    do_rows + " " + mod + " " + do_offset);
	var ret = null;
	if( mod == 0 ){
	    ret = anchor.page(do_rows, do_offset - do_rows);
	}else{
	    ret = anchor.page(do_rows, do_offset);
	}
	return ret;
    };

    /*
     * Function: get_page_rows
     *
     * Return the number of rows the manager is currently set
     * to. Useful as an argument to <page>.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  integer; the number of rows the manager is currently set to
     * 
     * See also:
     *  <page>
     */
    this.get_page_rows = function(){
	return anchor.get('rows');
    };

    /*
     * Function: get_page_start
     *
     * Return the rows offset the manager is currently set to. Useful
     * as an argument to <page>.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  integer; the offset the manager is currently set to
     * 
     * See also:
     *  <page>
     */
    this.get_page_start = function(){
	return anchor.get('start');
    };

    /*
     * Function: query_field_set
     *
     * Getter/setter for the query fields--the fields that are search
     * (and by what weight) when using a query ('q').
     * 
     * This will always use searchable fields if possible,
     * automatically replacing the non-searchable versions (I can't
     * think of any reason to use non-searchable versions unless you
     * want your searches to not work) if a personality is set. If no
     * personality is set, it will just use the arguments as-is.
     * 
     * The argument replaces the current set.
     *
     * The qfs argument should be a hash like:
     * 
     *  {'field01': value01, ...}
     * 
     * Parameters: 
     *  qfs - *[optional]* query fields to set
     *
     * Returns:
     *  the current query_fields array (e.g. ["field01^value01", ...])
     */
    this.query_field_set = function(qfs){

	// Only do something if we have a query field set.
	if( qfs ){
	    
	    // Only do the probing if a personality has been set.
	    var loop = bbop.core.each;
	    var cclass = anchor._current_class;
	    if( cclass ){

		// Get the current searchable extension string from
		// the personality class.
		var s_ext = cclass.searchable_extension();

		// Probe the input to see if there are any searchable
		// alternatives to try, use those instead.
		var searchable_qfs = {};
		loop(qfs,
	    	     function(filter, value){
			 // If the probe fails, just put in
			 // whatever is there.
			 var cfield = cclass.get_field(filter);
			 if( cfield && cfield.searchable() ){
			     //ll('filter/value:');
			     var new_f = filter + s_ext;
			     searchable_qfs[new_f] = value;
			 }else{
			     searchable_qfs[filter] = value;
			 }
	    	     });
		qfs = searchable_qfs;
	    }
	    
	    // Using either the original or the converted information,
	    // convert them to the proper internal format.
	    var actual_format = [];
	    loop(qfs,
		 function(filter, value){
		     actual_format.push(filter + '^' + value);
		 });
	    anchor.query_fields = actual_format;
	}
	
	return anchor.query_fields;
    };

    /*
     * Function: facets
     *
     * Getter/setter for facets (technically 'facet.field').
     *
     * Parameters: 
     *  key - *[optional]* facet to add to the facet list
     *
     * Parameters: 
     *  list - *[optional]* list to replace the current list with
     *
     * Returns:
     *  the current facets hash.
     */
    this.facets = function(list_or_key){
	if( list_or_key ){
	    if( bbop.core.what_is(list_or_key) == 'array' ){ // replace as list
		anchor.query_variants['facet.field'] = list_or_key;
	    }else{ // add as key
		anchor.query_variants['facet.field'].push(list_or_key);
	    }
	}
	return anchor.get('facet.field');
    };

    /*
     * Function: set_default_query
     *
     * Setter for the default query for the query variable ('q').
     * 
     * Call <reset_query> if you want to affect query immediately.
     * 
     * Parameters: 
     *  new_default_query - new default query string (or TODO: <bbop.logic>)
     *
     * Returns:
     *  the current setting of default query for ('q')
     */
    this.set_default_query = function(new_default_query){
	anchor.default_query = new_default_query;
	return anchor.default_query;
    };

    /*
     * Function: reset_default_query
     *
     * Reset the default query back to "*:*".
     * 
     * Call <reset_query> if you want to affect query immediately.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  the current setting of default query ('q')
     */
    this.reset_default_query = function(){
	anchor.default_query = anchor.fundamental_query;
	return anchor.default_query;
    };

    /*
     * Function: set_query
     *
     * Setter for the query variable ('q').
     * 
     * Parameters: 
     *  new_query - new value for the query string (or TODO: <bbop.logic>)
     *
     * Returns:
     *  the current setting of query ('q')
     * 
     * Also see:
     *  <set_comfy_query>
     */
    this.set_query = function(new_query){
	anchor.query = new_query;
	return anchor.query;
    };

    /*
     * Function: set_comfy_query
     *
     * A specialized setter for the query variable ('q'), as follows:
     *
     * If the input is all alphanum or space, the input is
     * tokenized. The last token, if it is at least three characters,
     * gets a wildcard '*'.
     * 
     * This might be a more comfortable way to search for most naive
     * (non-power user) interfaces.
     * 
     * Parameters: 
     *  new_query - new value for the query string (or TODO: <bbop.logic>)
     *
     * Returns:
     *  the current setting of query ('q')
     * 
     * Also see:
     *  <set_query>
     */
    this.set_comfy_query = function(new_query){

	var comfy_query = new_query;

	// Check that there is something there.
	if( new_query && new_query.length && new_query.length > 0 ){

	    // That it is alphanum+space-ish
	    var alphanum = new RegExp(/^[a-zA-Z0-9 ]+$/);
	    if( alphanum.test(new_query) ){
	    
		// Break it into tokens and get the last.
		var tokens = new_query.split(new RegExp('\\s+'));
		var last_token = tokens[tokens.length -1];
		//ll('last: ' + last_token);
		
		// If it is three or more, add the wildcard.
		if( last_token.length >= 3 ){
		    tokens[tokens.length -1] = last_token + '*';

		    // And join it all back into our comfy query.
		    comfy_query = tokens.join(' ');
		}
	    }
	}

	// Kick it back to the normal set_query.
	return anchor.set_query(comfy_query);
    };

    /*
     * Function: set_id
     *
     * A limited setter, removing whatever else is on query. This is
     * for when you want to lock into one (unique) document by id
     * (essentially 'q=id:"foo"'). All other query operations behave
     * as they should around it.
     * 
     * Parameters: 
     *  new_id - string id
     *
     * Returns:
     *  the current setting of query ('q')
     */
    this.set_id = function(new_id){
	var nid = new_id;
	// Quote it if it doesn't already have them.
	if( new_id.charAt(0) != '"' && new_id.charAt(new_id.length -1) != '"' ){
	    nid = '"' + new_id + '"';	    
	}
	anchor.query = 'id:' + new_id;
	return anchor.query;
    };

    /*
     * Function: get_query
     *
     * Getter for the query variable ('q').
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  the current setting of extra
     */
    this.get_query = function(){
	return anchor.query;
    };

    /*
     * Function: reset_query
     *
     * Remove/reset the query variable ('q'); this set it back to the
     * default query.
     *
     * Parameters:
     *  none
     *
     * Returns:
     *  ""
     * 
     * Also see:
     *  <set_default_query>
     *  <reset_default_query>
     */
    this.reset_query = function(){
	anchor.query = anchor.default_query;
	return anchor.query;
    };

    /*
     * Function: set_extra
     *
     * Setter for the internal string variable to be appended to the
     * end of a query. For special use cases only (e.g. extend
     * functionality of the API safely).
     * 
     * Parameters: 
     *  new_extra - *[optional]* new value for the extras string
     *
     * Returns:
     *  the current setting of extra
     */
    this.set_extra = function(new_extra){
	anchor.query_extra = new_extra;
	return anchor.query_extra;
    };

    /*
     * Function: get_extra
     *
     * Getter for the internal string variable to be appended
     * to the end of a query.
     *
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  the current setting of extra
     */
    this.get_extra = anchor.set_extra;

    /*
     * Function: remove_extra
     *
     * Remove/reset the extra bit.
     *
     * Parameters:
     *  none
     *
     * Returns:
     *  ""
     */
    this.remove_extra = function(){
	anchor.query_extra = "";
	return anchor.query_extra;
    };

    /*
     * Function: set
     *
     * Set an internal variable for the query. The internal variables
     * are typically things like 'qt', 'indent', etc.--things that you
     * might set and forget a while. It does /not/ include highly
     * dynamic variables (like callback and packet) or querying
     * variables like 'q' and 'fq'; for those you need to use the API.
     *
     * Parameters: 
     *  key - the name of the parameter to change
     *  new_val - what you want the new value to be
     *
     * Returns:
     *  n/a
     */
    this.set = function(key, new_val){
	anchor.query_variants[key] = new_val;
    };

    /*
     * Function: get
     *
     * Get an internal variable for the query.
     *
     * See <set> for the kinds of parameters that can be read.
     * 
     * Parameters: 
     *  key - the name of the parameter to get
     *
     * Returns:
     *  The found value of the key.
     */
    this.get = function(key){
	return anchor.query_variants[key];
    };

    /*
     * Function: unset
     *
     * Unset (remove) an internal variable for the query. Only usable on certain types of 
     * 
     * Only use is you really know what you're doing.
     *
     * Parameters: 
     *  key - the name of the parameter to unset/remove
     *
     * Returns:
     *  boolean; true false on whether the key was found
     */
    this.unset = function(key){
	var retval = false;

	if( bbop.core.is_defined(anchor.query_variants[key]) ){
	    retval = true;
	    delete anchor.query_variants[key];
	}

	return retval;
    };

    /*
     * Function: include_highlighting
     *
     * Turn hilighting on or off (with true or false).
     * 
     * This essentially adds the parameters to the query string to
     * make sure that basic highlighting on the search is returned.
     * 
     * It starts off as false. The optional html_elt_str argument
     * defaults to:
     *  : <em class="hilite">
     *
     * Parameters: 
     *  hilite_p - *[optional]* boolean
     *  html_elt_str - *[serially optional]* the HTML element string to use
     *
     * Returns:
     *  either false or the current string being used for the return element
     */
    this.include_highlighting = function(hilite_p, html_elt_str){
	var retval = false;

	if( bbop.core.is_defined(hilite_p) &&
	    (hilite_p == true || hilite_p == false) ){
	    if( hilite_p == true ){

		// Set the default string if necessary.
		if( ! html_elt_str ){ html_elt_str = '<em class="hilite">'; }

		// Set the parameters.
		anchor.set('hl', 'true');
		anchor.set('hl.simple.pre', html_elt_str);

		// And the retval is not longer false.
		retval = html_elt_str;

	    }else{
		
		// Unset the parameters.
		anchor.unset('hl');
		anchor.unset('hl.simple.pre');
	    }

	}else{
	    // Otherwise, just discover the current state and return
	    // it.
	    var cl_tmp = anchor.get('hl.simple.pre');
	    if( bbop.core.is_defined(cl_tmp) ){
		retval = cl_tmp;
	    }
	}

	return retval;
    };

    /*
     * Function: set_personality
     *
     * While we are always contacting the same Solr instance, we
     * sometimes want to have different weights, facets, etc. This
     * function allows us to use the pre-set ones defined in the
     * constructor configuration argument.
     * 
     * Currently, this only sets the 'facet.field' internal variable.
     *
     * Parameters: 
     *  personality_id - string
     *
     * Returns:
     *  Will return false if personality doesn't exist
     */
    this.set_personality = function(personality_id){
	var retval = false;

	// This sets the facet.field internal variable.
	var cclass = anchor._golr_conf.get_class(personality_id);
	if( cclass ){

	    // Remember what our personality is.
	    // WARNING: this line must go before the query_field_set
	    // line below, or else we won't get the "smart" search.
	    this._current_class = cclass;

	    // Set the facets for our class.
	    anchor.facets(cclass.field_order_by_weight('filter'));

	    // Set the query field weights ('qf') necessary to make
	    // queries run properly.
	    anchor.query_field_set(cclass.get_weights('boost'));
	    
	    // Show that we did indeed set a personality.
	    retval = true;
	}

	return retval;
    };

    /*
     * Function: get_personality
     *
     * Returns the current personality, null if none.
     * 
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  Returns the current personality as a string, null if none is set
     */
    this.get_personality = function(){
	var retval = null;

	if( bbop.core.is_defined(anchor._current_class) &&
	    bbop.core.what_is(anchor._current_class) == 'bbop.golr.conf_class'){
	    retval = anchor._current_class.id();
	}

	return retval;
    };

    /*
     * Function: get_query_url
     *
     * Get the current invariant state of the manager returned as a
     * URL string.
     * 
     * This means the URL for the current query to the GOlr store, but
     * without extra information about packets, callbacks, and the
     * like.
     * 
     * This is generally appropriate for getting data, but maybe not
     * for things like high-speed autocomplete where races can
     * occur. For those, you might want to consider <update> or
     * <search>.
     *
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  URL string
     * 
     * Also see:
     *  <update>, <search>
     */
    this.get_query_url = function(){

	// Structure of the necessary invariant parts.	
	var qurl = anchor._solr_url + 'select?';

	// Get all of our query filter variables and try and
	// make something of them that get_assemble can
	// understand. Sticky doesn't matter here, but negativity
	// does. However, we can be pretty naive since the hashing
	// should have already taken out mutually exclusive dupes.
	var fq = {};
	var loop = bbop.core.each;
	loop(anchor.get_query_filters(),
	     function(filter_property){

		 // Grab only the properties that affect the
		 // URL.
		 var filter = filter_property['filter'];
		 var value = filter_property['value'];
		 var negative_p = filter_property['negative_p'];

		 // We need to alter at the filter level.
		 if( negative_p ){
		     filter = '-' + filter;
		 }

		 // Make sure it is defined.
		 if( ! bbop.core.is_defined(fq[filter]) ){
		     fq[filter] = [];
		 }
		 fq[filter].push(value);
		 //fq[filter] = value;
	     });

	// Add all of our different specialized hashes.
	var things_to_add = [
	    //bbop.core.get_assemble(anchor.query_invariants),
	    //bbop.core.get_assemble(anchor.query_facets),
	    bbop.core.get_assemble(anchor.query_variants),
	    bbop.core.get_assemble(anchor.current_facet_field_limits),
	    //bbop.core.get_assemble({'fq': anchor.query_sticky_filters}),
	    //bbop.core.get_assemble({'qf': anchor.query_fields}),
	    bbop.core.get_assemble({'fq': fq}),
	    bbop.core.get_assemble({'q': anchor.query}),
	    anchor.query_extra
	];
	// Add query_fields ('qf') iff query ('q') is set and it is
	// not length 0.
	if( anchor.query &&
	    anchor.query.length &&
	    anchor.query.length != 0 &&
	    anchor.query != anchor.fundamental_query ){
		var in_qf = bbop.core.get_assemble({'qf': anchor.query_fields});
		things_to_add.push(in_qf);
	    }
	
	// Assemble the assemblies into a single URL, throw out
	// everything that seems like it isn't real to keep the URL as
	// clean a possible.
	var filtered_things = 
	    bbop.core.pare(things_to_add,
			   function(item, index){
			       var retval = true;
			       if( item && item != '' ){
				   retval = false;
			       }
			       return retval;
			   });

	var final_qurl = qurl + filtered_things.join('&');
	ll('qurl: ' + final_qurl);
    	return final_qurl;
    };

    /*
     * Function: load_url
     *
     * TODO - light psuedo-code approach done
     * 
     * Makes a a best attempt to recover the state of a manager from
     * the clues left in a data url. This can also (and probably
     * should) be thought of as a "bookmark" function. Theoretically,
     * you should even be able to use "bookmarks" from alien
     * installations.
     * 
     * Note that while this recovers enough to get the same data,
     * certain "session"/"preference" type things are encoded in the
     * url, such as filter stickiness, the contents of batch queues,
     * non-default base queries, etc.
     * 
     * Warning: this currently only replays a small subset of possible
     * parameters. Currently: personality, q, ???
     * 
     * This returns true if the parameter portions of the new and
     * bookmark urls match.
     * 
     * Parameters:
     *  url - A URL string generated by a GOlr manager
     * 
     * Returns:
     *  boolean
     */
    this.load_url = function(url){

	var loop = bbop.core.each;

	// Break down url.
	var in_params = bbop.core.url_parameters(url);

	// First, look for the personality setting and invoke it if
	// it's there--it will dominate.
	loop(in_params,
	     function(ip){
		 var key = ip[0];
		 var val = ip[1];
		 if( key == 'personality' && val && val != '' ){
		     anchor.set_personality(val);
		 }
	     });
	
	// Now cycle through the the parameters again and invoke the
	// appropriate functions to bring them in line.
	loop(in_params,
	     function(ip){
		 var key = ip[0];
		 var val = ip[1];
		 if( val && val != '' ){
		     if( key == 'q' ){
			 anchor.set_query(val);
		     // }else if( key == 'qf' ){
		     // 	 // TODO: ???
		     }else if( key == 'fq' ){
			 // Split the fq parameter.
			 var fnv = bbop.core.first_split(':', val);
			 var fname = fnv[0];
			 var fval = fnv[1];
			 print('fname: ' + fname);
			 print('fval: ' + fval);
			 if( fname && fval){
			     anchor.add_query_filter(fname, fval);
			 }
		     }
		 }
	     });

	// Produce our own url from what we've done. If the parameters
	// match with the incoming argument's return true.
	var curr_url = anchor.get_query_url();
	var curr_params = bbop.core.url_parameters(curr_url);
	var differences = 0;
	if( in_params.length == curr_params.length ){
	    loop(in_params,
		 function(in_p, i){
		     var curr_p = curr_params[i];
		     if( in_p.length == curr_p.length ){
			 if( in_p.length == 1 ){
			     if( in_p[0] == curr_p[0] ){
				 // match!
			     }else{
				 differences++;
			     }
			 }else if( in_p.length == 2 ){
			     if( in_p[0] == curr_p[0] && in_p[1] == curr_p[1] ){
				 // match!
			     }else{
				 differences++;
			     }
			 }
		     }else{
			 differences++;
		     }
		 });
	}else{
	    differences++;
	}

	// Tally the differences and decides if they're the same.
	var retval = false;
	if( differences == 0 ){
	    retval = true;
	}
    	return retval;
    };

    /*
     * Function: add_to_batch
     *
     * "Save" the current manager state to run later in serial batch
     * mode.
     * 
     * The actual job of running these batches is left to the
     * implementation of the sub-managers; probably in "run_batch".
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  state url
     */
    this.add_to_batch = function(){
	var qurl = anchor.get_query_url();
	anchor._batch_urls.push(qurl);
    	return qurl;
    };

    /*
     * Function: batch_urls
     *
     * Return a pointer to the current batch urls.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  array
     */
    this.batch_urls = function(){
    	return anchor._batch_urls;
    };

    /*
     * Function: next_batch_url
     *
     * Return the next data to be processed, removing it from the
     * batch queue in the process.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  state url or null
     */
    this.next_batch_url = function(){
    	return anchor._batch_urls.shift() || null;
    };

    /*
     * Function: reset_batch
     *
     * Clear the currently queued data batch.
     * 
     * The actual job of running these batches is left to the
     * implementation of the sub-managers; probably in "run_batch".
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  the number of items cleared
     */
    this.reset_batch = function(){
	var num = anchor._batch_urls.length;
	anchor._batch_urls = [];
    	return num;
    };
};
bbop.core.extend(bbop.golr.manager, bbop.registry);

/*
 * Function: update
 *
 * The user code to select the type of update (and thus the type
 * of callbacks to be called on data return).
 * 
 * This mechanism adds a couple of variables over other methods
 * for bookkeeping: packet (incremented every time) and callback_type.
 * 
 * The currently recognized callback types are "reset" (for when you
 * are starting or starting over) and "search" (what you typically
 * want when you get new data) and "error" for when something went
 * wrong. But only "search" and "reset" manipulate the system.
 * 
 * If rows or start are not set, they will both be reset to their
 * initial values--this is to allow for paging on "current"
 * results and then getting back to the business of searching with
 * as little fuss as possible. Because of things like this, one
 * should avoid calling this directly whenever possible and prefer
 * simpler functionality of the wrapper methods: <search>,
 * <reset>, and <page>.
 * 
 * Parameters: 
 *  callback_type - callback type string; 'search', 'reset' and 'error'
 *  rows - *[optional]* integer; the number of rows to return
 *  start - *[serially optional]* integer; the offset of the returned rows
 *
 * Returns:
 *  the query url (with the jQuery callback specific parameters)
 * 
 * Also see:
 *  <get_query_url>
 */
bbop.golr.manager.prototype.update = function(callback_type, rows, start){

    //function ll(s){ this._logger.kvetch(s); }

    // Handle paging in this main section by resetting to
    // the defaults if rows and offset are not explicitly
    // defined.
    if( ! bbop.core.is_defined(rows) || ! bbop.core.is_defined(start) ){
    	this.set('rows', this.default_rows);
    	this.set('start', this.default_start);
    }
    
    // Our bookkeeping--increment packet.
    this.last_sent_packet = this.last_sent_packet + 1;
    
    // Necessary updated query variants.
    var update_query_variants = {
    	packet: this.last_sent_packet,
    	callback_type: callback_type
    };
    var update_qv = bbop.core.get_assemble(update_query_variants);
    
    // Structure of the necessary invariant parts.	
    //var qurl = this.get_query_url();
    var qurl = null;
    
    // Conditional merging of the remaining variant parts.
    if( callback_type == 'reset' ){
	
    	// Take everything back to the initial state--this means
    	// resetting the query and removing all non-sticky
    	// filters.
	
    	// Reset and do completely open query.
    	//ll('reset assembly');
	
    	// Save the q vals, do a fundamental get, then reset to
    	// what we had.
    	//var tmp_save = this.get_query();
    	//this.reset_default_query();
    	this.reset_query();
    	this.reset_query_filters();
    	qurl = this.get_query_url();
    	qurl = qurl + '&' + update_qv;
    	//this.set_query(tmp_save);
	
    }else if( callback_type == 'search' ){
	
    	//ll('search assembly');
    	qurl = this.get_query_url();
    	qurl = qurl + '&' + update_qv;
	
    }else{
    	throw new Error("Unknown callback_type: " + callback_type);
    }
    
    //ll('qurl: ' + qurl);
    return qurl;
};
/* 
 * Package: preload.js
 * 
 * Namespace: bbop.golr.manager.preload
 * 
 * Preload BBOP manager for dealing with remote calls. Remember,
 * this is actually a "subclass" of <bbop.golr.manager>.
 * 
 * This is synchronous.
 * 
 * This is mostly for testing purposes.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'registry');
bbop.core.require('bbop', 'golr', 'conf');
bbop.core.require('bbop', 'golr', 'response');
bbop.core.require('bbop', 'golr', 'manager');
bbop.core.namespace('bbop', 'golr', 'manager', 'preload');

/*
 * Constructor: preload
 * 
 * Contructor for the GOlr query manager.
 * 
 * Allows preloading of the returned document.
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server
 *  golr_conf_obj - a <bbop.golr.conf> object
 * 
 * Returns:
 *  golr manager object
 * 
 * See also:
 *  <bbop.golr.manager>
 */
bbop.golr.manager.preload = function (golr_loc, golr_conf_obj){
    bbop.golr.manager.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.golr.manager.preload';

    // The only property to add.
    this._bgm_load = null;
};
bbop.core.extend(bbop.golr.manager.preload, bbop.golr.manager);

/*
 * Function: load
 *
 * Parameters: 
 *  thing - what to send to the callbacks
 *
 * Returns:
 *  n/a
 */
bbop.golr.manager.preload.prototype.load = function(thing){
    this._bgm_load = thing;    
};

/*
 * Function: update
 *
 *  See the documentation in <golr_manager.js> on update to get more
 *  of the story. This override function adds a trigger that can be
 *  preloaded with results. Really only for testing.
 *
 * Parameters: 
 *  callback_type - callback type string
 *  rows - *[serially optional]* integer; the number of rows to return
 *  start - *[serially optional]* integer; the offset of the returned rows
 *
 * Returns:
 *  the query url
 * 
 * Also see:
 *  <get_query_url>
 */
bbop.golr.manager.preload.prototype.update = function(callback_type,
						      rows, start){
    // Get "parents" url first.
    var parent_update = bbop.golr.manager.prototype.update;
    var qurl = parent_update.call(this, callback_type, rows, start);

    // 
    var logger = new bbop.logger(this._is_a);
    //this._logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Grab the data from the server and pick the right callback group
    // accordingly.
    var data = this._bgm_load;
    if( bbop.core.is_defined(data) ){
	this.apply_callbacks(callback_type, [data, this]);
    }else{
	this.apply_callbacks('error', ['unparsable data', this]);
    }

    return qurl;
};
/* 
 * Package: nodejs.js
 * 
 * Namespace: bbop.golr.manager.nodejs
 * 
 * NodeJS BBOP manager for dealing with remote calls. Remember,
 * this is actually a "subclass" of <bbop.golr.manager>.
 * 
 * This may be madness.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'registry');
bbop.core.require('bbop', 'golr', 'conf');
bbop.core.require('bbop', 'golr', 'response');
bbop.core.require('bbop', 'golr', 'manager');
bbop.core.namespace('bbop', 'golr', 'manager', 'nodejs');

/*
 * Constructor: nodejs
 * 
 * Contructor for the GOlr query manager; NodeJS flavor. YMMV.
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server;
 *  golr_conf_obj - a <bbop.golr.conf> object
 * 
 * Returns:
 *  golr manager object
 * 
 * See also:
 *  <bbop.golr.manager>
 */
bbop.golr.manager.nodejs = function (golr_loc, golr_conf_obj){
//function GOlrManager(in_args){
    // We are a registry like this:
    bbop.golr.manager.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.golr.manager.nodejs';

    // Get a good self-reference point.
    //var anchor = this;

    // Per-manager logger.
    //this._ll = ll;

    // //
    // ll('Alive.');

};
bbop.core.extend(bbop.golr.manager.nodejs, bbop.golr.manager);

/*
 * Function: update
 *
 *  See the documentation in <golr_manager.js> on update to get more
 *  of the story. This override function adds functionality to NodeJS.
 *
 * Parameters: 
 *  callback_type - callback type string
 *  rows - *[serially optional]* integer; the number of rows to return
 *  start - *[serially optional]* integer; the offset of the returned rows
 *
 * Returns:
 *  the query url (with any NodeJS specific paramteters)
 * 
 * Also see:
 *  <get_query_url>
 */
bbop.golr.manager.nodejs.prototype.update = function(callback_type,
						     rows, start){
    // Get "parents" url first.
    var parent_update = bbop.golr.manager.prototype.update;
    var qurl = parent_update.call(this, callback_type, rows, start);

    // 
    var logger = new bbop.logger(this._is_a);
    //this._logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    var anchor = this;
    this.last = null;
    
    //
    function on_error(e) {
	console.log('problem with request: ' + e.message);
    }
    function on_connect(res){
	//console.log('STATUS: ' + res.statusCode);
	//console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	var raw_data = '';
	res.on('data', function (chunk) {
		   //console.log('BODY: ' + chunk);
		   raw_data = raw_data + chunk;
	       });
	// Parse JS and call callback_type callbacks.
	res.on('end', function () {
		   var json_data = JSON.parse(raw_data);
		   anchor.last = json_data;
		   anchor.apply_callbacks(callback_type, [json_data, anchor]);
	       });
    }
    var http = require('http');
    var req = http.request(qurl, on_connect);
    req.on('error', on_error);
    
    // write data to request body
    //req.write('data\n');
    //req.write('data\n');
    req.end();
    
    return qurl;
};
/* 
 * Package: rhino.js
 * 
 * Namespace: bbop.golr.manager.rhino
 * 
 * Rhino BBOP manager for dealing with remote calls. Remember,
 * this is actually a "subclass" of <bbop.golr.manager>.
 * 
 * This may be madness.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'registry');
bbop.core.require('bbop', 'golr', 'conf');
bbop.core.require('bbop', 'golr', 'response');
bbop.core.require('bbop', 'golr', 'manager');
bbop.core.namespace('bbop', 'golr', 'manager', 'rhino');

/*
 * Constructor: rhino
 * 
 * Contructor for the GOlr query manager; Rhino-style.
 * 
 * Beware that this version is a synchronous call.
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server
 *  golr_conf_obj - a <bbop.golr.conf> object
 * 
 * Returns:
 *  golr manager object
 * 
 * See also:
 *  <bbop.golr.manager>
 */
bbop.golr.manager.rhino = function (golr_loc, golr_conf_obj){
    bbop.golr.manager.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.golr.manager.rhino';
};
bbop.core.extend(bbop.golr.manager.rhino, bbop.golr.manager);

/*
 * Function: update
 *
 *  See the documentation in <golr_manager.js> on update to get more
 *  of the story. This override function adds functionality to Rhino.
 *
 * Parameters: 
 *  callback_type - callback type string
 *  rows - *[serially optional]* integer; the number of rows to return
 *  start - *[serially optional]* integer; the offset of the returned rows
 *
 * Returns:
 *  the query url (with any Rhino specific paramteters)
 * 
 * Also see:
 *  <get_query_url>
 */
bbop.golr.manager.rhino.prototype.update = function(callback_type,
						    rows, start){
    // Get "parents" url first.
    var parent_update = bbop.golr.manager.prototype.update;
    var qurl = parent_update.call(this, callback_type, rows, start);

    // 
    var logger = new bbop.logger(this._is_a);
    //this._logger = new bbop.logger(this._is_a);
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // Grab the data from the server and pick the right callback group
    // accordingly.
    var raw = readUrl(qurl); // in Rhino
    var json_data = null;
    if( raw && raw != '' ){
	json_data = JSON.parse(raw);
	if( json_data ){
	    this.apply_callbacks(callback_type, [json_data, this]);
	}else{
	    this.apply_callbacks('error', ['unparsable data', this]);
	}
    }else{
	this.apply_callbacks('error', ['no data', this]);
    }

    return qurl;
};

/*
 * Function: fetch
 *
 * This is the synchronous data getter for Rhino--probably your best
 * bet right now for scripting.
 * 
 * Parameters:
 *  n/a 
 *
 * Returns:
 *  the JSON response as an object or null
 * 
 * Also see:
 *  <update>
 */
bbop.golr.manager.rhino.prototype.fetch = function(){
    
    var qurl = this.get_query_url();

    // Grab the data from the server and pick the right callback group
    // accordingly.
    var raw = readUrl(qurl); // in Rhino
    var json_data = null;
    var retval = null;
    if( raw && raw != '' ){
	json_data = JSON.parse(raw);
	if( json_data ){
	    retval = json_data;
	}
    }

    return retval;
};

/* 
 * Package: jquery.js
 * 
 * Namespace: bbop.golr.manager.jquery
 * 
 * jQuery BBOP manager for dealing with actual ajax calls. Remember,
 * this is actually a "subclass" of <bbop.golr.manager>.
 * 
 * This should still be able to limp along (no ajax and no error
 * parsing) even outside of a jQuery environment.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'registry');
bbop.core.require('bbop', 'golr', 'conf');
bbop.core.require('bbop', 'golr', 'response');
bbop.core.require('bbop', 'golr', 'manager');
bbop.core.namespace('bbop', 'golr', 'manager', 'jquery');

/*
 * Constructor: jquery
 * 
 * Contructor for the GOlr query manager
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server;
 *  golr_conf_obj - a <bbop.golr.conf> object
 * 
 * Returns:
 *  golr manager object
 * 
 * See also:
 *  <bbop.golr.manager>
 */
bbop.golr.manager.jquery = function (golr_loc, golr_conf_obj){
    bbop.golr.manager.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.golr.manager.jquery';
    
    // Get a good self-reference point.
    var anchor = this;

    // Per-manager logger helper.
    function ll(str){ anchor._logger.kvetch(str); }

    // Before anything else, if we cannot find a viable jQuery library
    // for use, we're going to create a fake one so we can still test
    // and work in a non-browser/networked environment.
    anchor.JQ = new bbop.golr.faux_ajax();
    try{ // some interpreters might not like this kind of probing
    	if( typeof(jQuery) !== 'undefined' ){
    	    //JQ = jQuery;
    	    anchor.JQ = jQuery.noConflict();
    	}
    }catch (x){
    }finally{
    	var got = bbop.core.what_is(anchor.JQ);
    	if( got && got == 'bbop.golr.faux_ajax'){
    	}else{
    	    got = 'jQuery';
    	}
    	ll('Using ' + got + ' for Ajax calls.');
    }

    // The base jQuery Ajax args we need with the setup we have.
    anchor.jq_vars = {
	//url: qurl,
	type: "GET",
	dataType: 'jsonp',
	jsonp: 'json.wrf'
    };

    // We'll override the original with something that actually speaks
    // jQuery. This is the function that runs where there is an AJAX
    // error during an update. First it has to run some template code,
    // then it does all of the callbacks.
    this._run_error_callbacks = function(result, status, error) {

    	ll('Failed server request: '+ result +', '+ status +', '+ error);
    	//ll('Failed (a): '+ bbop.core.what_is(status));
    	//ll('Failed (b): '+ bbop.core.dump(status));
		
    	var clean_error = "unknown error";

    	// Get the error out (clean it) if possible.
    	var jreq = result.responseText;
    	var req = anchor.JQ.parseJSON(jreq); // TODO/BUG: this must be removed
    	if( req && req['errors'] && req['errors'].length > 0 ){
    	    var in_error = req['errors'][0];
    	    ll('ERROR:' + in_error);
    	    // Split on newline if possible to get
    	    // at the nice part before the perl
    	    // error.
    	    var reg = new RegExp("\n+", "g");
    	    var clean_error_split =
    		in_error.split(reg);
    	    clean_error = clean_error_split[0];
    	}else if( bbop.core.what_is(error) == 'string' &&
    		  error.length > 0){
    	    clean_error = error;
    	}else if( bbop.core.what_is(status) == 'string' &&
    		  status.length > 0){
    	    clean_error = status;
    	}
	
    	// Run all against registered functions.
    	ll('run error callbacks...');
    	anchor.apply_callbacks('error', [clean_error, anchor]);
    };

    // Try and decide between a reset callback and a search callback.
    // This is useful since jQuery doesn't have a natural way to do
    // that within the callbacks.
    this._callback_type_decider = function(json_data){
    	ll('in callback type decider...');

	var resp = new bbop.golr.response(json_data);

    	// 
    	if( ! resp.success() ){
    	    throw new Error("Unsuccessful response from golr server!");
    	}else{
    	    var cb_type = resp.callback_type();
    	    ll('okay response from server, will probe type...: ' + cb_type);
    	    if( cb_type == 'reset' ){
    		anchor._run_reset_callbacks(json_data);
    	    }else if( cb_type == 'search' ){
    		anchor._run_search_callbacks(json_data);
    	    }else{
    		throw new Error("Unknown callback type!");
    	    }
    	}
    };

    /*
     * Function: safety
     *
     * Getter/setter for the trigger safety.
     * 
     * If the safety is on, ajax events controlled by the manager will
     * not occur. The default if off (false).
     * 
     * Parameters: 
     *  safety_on_p - boolean
     *
     * Returns:
     *  boolean
     */
    this.safety = function(safety_on_p){
	if( bbop.core.is_defined(safety_on_p) ){
	    anchor._safety = safety_on_p;
	}
	return anchor._safety;
    };
};
bbop.core.extend(bbop.golr.manager.jquery, bbop.golr.manager);

/*
 * Function: update
 *
 *  See the documentation in <golr_manager.js> on update to get more
 *  of the story. This override function adds functionality for
 *  jQuery.
 * 
 * You can prevent the triggering of ajax with the <safety>
 * method.
 *
 * Parameters: 
 *  callback_type - callback type string
 *  rows - *[serially optional]* integer; the number of rows to return
 *  start - *[serially optional]* integer; the offset of the returned rows
 *
 * Returns:
 *  the query url (with the jQuery callback specific parameters)
 * 
 * Also see:
 *  <get_query_url>
 */
bbop.golr.manager.jquery.prototype.update = function(callback_type,
						     rows, start){
    
    // Get "parents" url first.
    var parent_update = bbop.golr.manager.prototype.update;
    var qurl = parent_update.call(this, callback_type, rows, start);
    
    // Only actually trigger if the safety is off (default).
    if( ! this.safety() ){
	
	//ll('try: ' + qurl);
	//widgets.start_wait('Updating...');
	
	// Setup JSONP for Solr and jQuery ajax-specific parameters.
	this.jq_vars['success'] = this._callback_type_decider; // decide & run
	this.jq_vars['error'] = this._run_error_callbacks; // run error cbs
	//done: _callback_type_decider, // decide & run search or reset
	//fail: _run_error_callbacks, // run error callbacks
	//always: function(){} // do I need this?
	this.JQ.ajax(qurl, this.jq_vars);
    }
    
    return qurl;
};

/*
 * Function: run_batch
 *
 * A distant cousin of <update>.
 * Designed to "serially" get data from a server for
 * certain types of data crunching routines.
 * 
 * Why would you want this? Lets say there are ten distinct things
 * that you want from the server. Coordinating and collating them all
 * without annoying the server or going insane is hard in an
 * asynchronous environment.
 *
 * Parameters: 
 *  accumulator_func - the function that collects
 *  final_func - the function to run on completion
 *
 * Returns:
 *  the number of batch items run
 */
bbop.golr.manager.jquery.prototype.run_batch = function(accumulator_func,
							final_func){

    var anchor = this;

    // Set the various callbacks internally so we can get back at them
    // when we lose our stack during the ajax.
    if( accumulator_func ){ this._batch_accumulator_func = accumulator_func; }
    if( final_func ){ this._batch_final_func = final_func; }

    // Look at how many states are left.
    var qurl = anchor.next_batch_url();
    if( qurl ){
	    
	// Generate a custom callback function that will start
	// this process (next_generator) again--continue the cycle.
	var next_cycle = function(json_data){
	    anchor._batch_accumulator_func.apply(anchor, [json_data, anchor]);
	    anchor.run_batch();
	};
	
	// Put this custom callback on success.
	anchor.jq_vars['success'] = next_cycle;
	anchor.jq_vars['error'] = anchor._run_error_callbacks;
	anchor.JQ.ajax(qurl, anchor.jq_vars);
    }else{
	anchor._batch_final_func.apply(anchor);
    }
};

/*
 * Function: fetch
 *
 * A cousin of <update>, but is made to avoid all of the usual
 * callback functions (except error) and just run the single function
 * from the argument.
 * 
 * Why would you want this? Sometimes you need just a little data
 * without updating the whole interface or whatever.
 *
 * Parameters: 
 *  run_func - the function to run on completion
 *
 * Returns:
 *  n/a
 */
bbop.golr.manager.jquery.prototype.fetch = function(run_func){

    // ...
    var anchor = this;
    var qurl = anchor.get_query_url();
    anchor._run_func = run_func;
    anchor.jq_vars['success'] = anchor._run_func;
    anchor.jq_vars['error'] = anchor._run_error_callbacks;
    anchor.JQ.ajax(qurl, anchor.jq_vars);
};

/*
 * Namespace: bbop.golr.faux_ajax
 *
 * Constructor: faux_ajax
 * 
 * Contructor for a fake and inactive Ajax. Used by bbop.golr.manager.jquery
 * in (testing) environments where jQuery is not available.
 * 
 * Returns:
 *  faux_ajax object
 */
bbop.golr.faux_ajax = function (){
    this._is_a = 'bbop.golr.faux_ajax';

    /*
     * Function: ajax
     *
     * Fake call to jQuery's ajax.
     *
     * Parameters: 
     *  args - whatever
     *
     * Returns:
     *  null
     */
    this.ajax = function(args){
	return null;
    };
    /*
     * Function: parseJSON
     *
     * Fake call to jQuery's parseJSON.
     *
     * Parameters: 
     *  args - whatever--they are ignored
     *
     * Returns:
     *  ""
     */
    this.parseJSON = function(args){
	return "";
    };
};
/*
 * Package: meta_results.js
 * 
 * Namespace: bbop.widget.display.meta_results
 * 
 * Reusable HTML drop of Solr meta results.
 * 
 * Subclass of <bbop.html.tag>.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'html');
bbop.core.namespace('bbop', 'widget', 'display', 'meta_results');

/*
 * Constructor: meta_results
 *
 * Draw a typical meta results section for the response data.
 * 
 * Parameters:
 *  total - integer
 *  first - integer
 *  last - integer
 * 
 * Returns:
 *  <bbop.html.tag> subclass
 */
bbop.widget.display.meta_results = function (total, first, last){
    bbop.html.tag.call(this, 'div');

    // Add number slots.
    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
    this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
    this.add_to('Last: ' + last + '<br />');

    // // Add button slots.
    // this.add_to('<button />');
    ////<a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
};
bbop.widget.display.meta_results.prototype = new bbop.html.tag;
/*
 * Package: results_table_by_class_conf.js
 * 
 * Namespace: bbop.widget.display.results_table_by_class_conf
 * 
 * Reusable HTML drop of Solr meta results.
 * 
 * Subclass of <bbop.html.tag>.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'html');
bbop.core.namespace('bbop', 'widget', 'display', 'results_table_by_class_conf');

/*
 * Function: results_table_by_class_conf
 *
 * Using a conf class and a set of data, automatically populate and
 * return a results table.
 *  
 * Parameters:
 *  class_conf - a <bbop.golr.conf_class>
 *  golr_resp - a <bbop.golr.response>
 *  linker - a linker object; see <amigo.linker> for more details
 *  elt_id - the element id to attach it to
 *
 * Returns:
 *  <bbop.html.table> filled with results
 */
bbop.widget.display.results_table_by_class = function(cclass,
						      golr_resp,
						      linker,
						      elt_id){
    //bbop.html.tag.call(this, 'div');
    //var amigo = new bbop.amigo();

    // // Temp logger.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch('TT: ' + str); }

    var each = bbop.core.each; // conveience

    var ea_regexp = new RegExp("\<\/a\>", "i"); // only want to compile once
    // Now take what we have, and wrap around some expansion code
    // if it looks like it is too long.
    var trim_hash = {};
    var trimit = 100;
    function _trim_and_store( in_str ){

	var retval = in_str;

	// Skip if it has a link or is too short.
	if( ! ea_regexp.test(retval) && retval.length > (trimit + 50) ){

	    // Setup the text for tease and full versions.
	    var tease = new bbop.html.span(bbop.core.crop(retval, trimit, ''),
					   {'generate_id': true});
	    var more_b = new bbop.html.span('<b>[more...]</b>',
					    {'generate_id': true});
	    var full = new bbop.html.span(retval,
					  {'generate_id': true});
	    var less_b = new bbop.html.span('<b>[less]</b>',
					    {'generate_id': true});
	    
	    // Store the different parts for later activation.
	    var tease_id = tease.get_id();
	    var more_b_id = more_b.get_id();
	    var full_id = full.get_id();
	    var less_b_id = less_b.get_id();
	    trim_hash[tease_id] = [tease_id, more_b_id, full_id, less_b_id];
	    
	    // New final string.
	    retval = tease.to_string() + " " +
		more_b.to_string() + " " +
		full.to_string() + " " +
		less_b.to_string();
	    
	}
	return retval;
    }

    // Start with score, and add the others by order of the class
    // results_weights field.
    var headers = ['score'];
    var headers_display = ['Score'];
    var results_order = cclass.field_order_by_weight('result');
    each(results_order,
	 function(fid){
	     // Store the raw headers/fid for future use.
	     headers.push(fid);
	     // Get the headers into a presentable state.
	     var field = cclass.get_field(fid);
	     if( ! field ){ throw new Error('conf error: not found:' + fid); }
	     headers_display.push(field.display_name());
	 });

    // Some of what we'll do for each field in each doc (see below).
    var ext = cclass.searchable_extension();
    function _process_entry(fid, iid, doc){

	var retval = '';
	var did = doc['id'];

	// Get a label instead if we can.
	var ilabel = golr_resp.get_doc_field(did, fid + '_label');
	if( ! ilabel ){
	    ilabel = golr_resp.get_doc_field(did, fid);
	}

	// Extract highlighting if we can.
	var hl = golr_resp.get_doc_field_hl(did, fid + '_label' + ext);
	if( ! hl ){
	    hl = golr_resp.get_doc_field_hl(did, fid + ext);
	}
	if( ! hl ){
	    hl = golr_resp.get_doc_field_hl(did, fid);
	}

	// See what we can create from what we got.
	var ilink = linker.anchor({id: iid, label: ilabel, hilite: hl}, fid);
	
	// See what we got, in order of how much we'd like to have it.
	if( ilink ){
	    retval = ilink;
	}else if( ilabel ){
	    retval = ilabel;
	}else{
	    retval = iid;
	}

	return retval;
    }

    // Cycle through and render each document.
    // For each doc, deal with it as best we can using a little
    // probing. Score is a special case as it is not an explicit
    // field.
    var table_buff = [];
    var docs = golr_resp.documents();
    each(docs,
	 function(doc){
	     
	     // Well, they had better be in here, so we're
	     // just gunna cycle through all the headers/fids.
	     var entry_buff = [];
	     each(headers,
		  function(fid){
		      // Remember: score is a special--non-explicit--case.
		      if( fid == 'score' ){
			  var score = doc['score'] || 0.0;
			  score = bbop.core.to_string(100.0 * score);
			  entry_buff.push(bbop.core.crop(score, 4) + '%');
		      }else{
			  // Not "score", so let's figure out what we
			  // can automatically.
			  var field = cclass.get_field(fid);

			  // Make sure that comething is there and
			  // that we can iterate over whatever it
			  // is.
			  var bits = [];
			  if( doc[fid] ){
			      if( field.is_multi() ){
				  bits = doc[fid];
			      }else{
				  bits = [doc[fid]];
			      }
			  }

			  // Render each of the bits.
			  var tmp_buff = [];
			  each(bits,
			       function(bit){
				   var out = _process_entry(fid, bit, doc);
				   //ll('out: ' + out);
				   tmp_buff.push(out);
			       });
			  // Join it, trim/store it, push to to output.
			  var joined = tmp_buff.join('<br />');
			  entry_buff.push(_trim_and_store(joined));
		      }
		  });
	     table_buff.push(entry_buff);
	 });
	
	// Add the table to the DOM.
	var final_table = new bbop.html.table(headers_display, table_buff);
	jQuery('#' + elt_id).append(bbop.core.to_string(final_table));

	// Add the roll-up/down events to the doc.
	each(trim_hash,
	    function(key, val){
		var tease_id = val[0];
		var more_b_id = val[1];
		var full_id = val[2];
		var less_b_id = val[3];

		// Initial state.
		jQuery('#' + full_id ).hide();
		jQuery('#' + less_b_id ).hide();

		// Click actions to go back and forth.
		jQuery('#' + more_b_id ).click(
		    function(){
			jQuery('#' + tease_id ).hide();
			jQuery('#' + more_b_id ).hide();
			jQuery('#' + full_id ).show('fast');
			jQuery('#' + less_b_id ).show('fast');
		    });
		jQuery('#' + less_b_id ).click(
		    function(){
			jQuery('#' + full_id ).hide();
			jQuery('#' + less_b_id ).hide();
			jQuery('#' + tease_id ).show('fast');
			jQuery('#' + more_b_id ).show('fast');
		    });
	    });

	return final_table;
};
bbop.widget.display.results_table_by_class.prototype = new bbop.html.tag;
/*
 * Package: two_column_layout.js
 * 
 * Namespace: bbop.widget.display.two_column_layout
 * 
 * Reusable object to create a two-column layout.
 * 
 * Subclass of <bbop.html.tag>.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'html');
bbop.core.namespace('bbop', 'widget', 'display', 'two_column_layout');

/*
 * Constructor: two_column_layout
 *
 * Produce a div containing a CSS hardwired two-column layout.
 * These are currently hardwired to:
 * 
 * : 'class': 'twocol-leftcolumn', 'style': 'margin-top: -15px;'
 * : 'class': 'twocol-content', 'style': 'margin-left: 26em; margin-top: -15px;'
 * 
 * Parameters:
 *  col1 - the string or <bbop.html> object for the left column
 *  col2 - the string or <bbop.html> object for the right column
 *
 * Returns:
 *  <bbop.html.tag> subclass
 */
bbop.widget.display.two_column_layout = function (col1, col2){
    bbop.html.tag.call(this, 'div', {'class': 'twocol-wrapper'});

    // Left (control) side.
    this._two_column_stack_left =
	new bbop.html.tag('div',
			  {'class': 'twocol-leftcolumn',
			   'style': 'margin-top: -15px;'},
			  col1);
    this.add_to(this._two_column_stack_left);

    // Right (display) side.
    this._two_column_stack_right =
	new bbop.html.tag('div',
			  {'class': 'twocol-content',
			   'style': 'margin-left: 26em; margin-top: -15px;'},
			  col2);
    this.add_to(this._two_column_stack_right);
};
bbop.widget.display.two_column_layout.prototype = new bbop.html.tag;

/*
 * Package: filter_shield.js
 * 
 * Namespace: bbop.widget.display.filter_shield
 * 
 * BBOP object to produce a self-constructing/self-destructing shield
 * to support very large filter selection in the live search/search
 * pane genre.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
//bbop.core.require('bbop', 'model');
//bbop.core.require('bbop', 'model', 'graph', 'bracket');
bbop.core.require('bbop', 'html');
bbop.core.require('bbop', 'golr', 'manager', 'jquery');
bbop.core.namespace('bbop', 'widget', 'display', 'filter_shield');

/*
 * Constructor: filter_shield
 * 
 * Contructor for the bbop.widget.display.filter_shield object.
 * 
 * Support for <bbop.widget.search_pane> by way of
 * <bbop.widget.display.live_search>
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  self
 */
bbop.widget.display.filter_shield = function(){

    this._is_a = 'bbop.widget.display.filter_shield';

    var anchor = this;

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('W (filter_shield): ' + str); }

    // Variables that we'll need to keep.
    var is_open_p = false;
    var parea = new bbop.html.tag('div', {'generate_id': true});
    var pmsg = new bbop.html.tag('div', {'generate_id': true}, "Waiting...");
    var pbar = new bbop.html.tag('div', {'generate_id': true});
    parea.add_to(pmsg);
    parea.add_to(pbar);
    var div = new bbop.html.tag('div', {'generate_id': true}, parea);
    var pmsg_id = pmsg.get_id();
    var pbar_id = pbar.get_id();
    var div_id = div.get_id();
    var diargs = {
	modal: true,
	draggable: false,
	width: 800,
	height: 600,
	close:
	function(){
	    // TODO: Could maybe use .dialog('destroy') instead?
	    jQuery('#' + div_id).remove();
	}	    
    };

    /*
     * Function: start_wait
     * 
     * Render an unpopulated modal shield with some kind of waiting
     * element. This is to act as a block for the IO if
     * desired--calling this before .draw() is not required (as
     * .draw() will call it anyways if you haven't).
     * 
     * Arguments:
     *  n/a
     * 
     * Returns:
     *  n/a
     */
    this.start_wait = function(){

	// Mark that we've finally opened it.
	is_open_p = true;

	// Append div to body.
	jQuery('body').append(div.to_string());	

	// Pop open the dialog.
	var dia = jQuery('#' + div_id).dialog(diargs);

	// Start the progress bar in the dialog
	//var progress_val = 10;
	jQuery('#' + pbar_id).empty();
	jQuery('#' + pbar_id).progressbar({value: 10});
	// var progression_id = null;
	// function progression(){
	//     var success_p = false;
	//     if( jQuery('#' + pbar_id) ){
	// 	if( progress_val < 100 ){
	// 	    progress_val += 10;
	// 	    jQuery('#' + pbar_id).progressbar("value", progress_val);
	// 	    success_p = true;
	// 	}
	//     }
	//     if( ! success_p && progression_id ){
	// 	window.clearInterval(progression_id);
	// 	ll("waiting spinner interrupt");
	//     }
	// }
	// progression_id = window.setInterval(progression, 100);
    };

    /*
     * Function: draw
     * 
     * Render a temporary modal filter shield.
     * 
     * Arguments:
     *  field_name - the name (id) of the filter field to display
     *  filter_list - a list of [[filter_id, filter_count], ...]
     *  manager - the manager that we'll use for the callbacks
     * 
     * Returns:
     *  n/a
     */
    this.draw = function(field_name, filter_list, manager){
	//ll(doc['id']);

	// Open the shield if it is not already open.
	if( ! is_open_p ){
	    anchor.open();
	}

	var txt = 'No filters...';
	var tbl = new bbop.html.table();
	var button_hash = {};
	var each = bbop.core.each; // conveience
	each(filter_list,
 	     function(field){
		 var fname = field[0];
		 var fcount = field[1];
		 
		 var b_plus_txt = '<b>[&nbsp;+&nbsp;]</b>';
		 var b_plus =
		     new bbop.html.span(b_plus_txt,
					{'generate_id': true});
		 var b_minus_txt = '<b>[&nbsp;-&nbsp;]</b>';
		 var b_minus =
		     new bbop.html.span(b_minus_txt,
					{'generate_id': true});
		 button_hash[b_plus.get_id()] =
		     [field_name, fname, fcount, '+'];
		 button_hash[b_minus.get_id()] =
		     [field_name, fname, fcount, '-'];

		 tbl.add_to([fname, '(' + fcount + ')',
			     b_plus.to_string(),
			     b_minus.to_string()]);
	     });
	txt = tbl.to_string();
	
	// Add text to div.
	jQuery('#' + div_id).empty();
	jQuery('#' + div_id).append(txt);
	
	// Okay, now introducing a function that we'll be using a
	// couple of times in our callbacks. Given a button id (from
	// a button hash) and the [field, filter, count, polarity]
	// values from the props, make a button-y thing an active
	// filter.
	function filter_select_live(button_id, create_time_button_props){
	    var in_polarity = create_time_button_props[3];

	    // Decide on the button graphical elements.
	    var b_ui_icon = 'ui-icon-plus';
	    if( in_polarity == '-' ){
		b_ui_icon = 'ui-icon-minus';
	    }
	    var b_ui_props = {
		icons: { primary: b_ui_icon},
		text: false
	    };

	    // Create the button and immediately add the event.
	    jQuery('#' + button_id).click(
		function(){
		    var tid = jQuery(this).attr('id');
		    var call_time_button_props = button_hash[tid];
		    var call_field = call_time_button_props[0];	 
		    var call_filter = call_time_button_props[1];
		    //var in_count = button_props[2];
		    var call_polarity = call_time_button_props[3];
		    
		    // Change manager, fire, and close the dialog.
		    manager.add_query_filter(call_field, call_filter,
			  		     [call_polarity]);
		    manager.search();
		    jQuery('#' + div_id).remove();
		});
	}

	// Now let's go back and add the buttons, styles,
	// events, etc. in the main accordion section.
	each(button_hash, filter_select_live);

    };

};
/*
 * Package: live_search.js
 * 
 * Namespace: bbop.widget.display.live_search
 * 
 * AmiGO object to draw various UI elements that have to do with things
 * dealing with a fully faceted searcher/browser.
 * 
 * It is probably not particularly useful directly, but rather used as
 * the framework for more specialized interfaces.
 * 
 * See Also:
 *  <search_pane.js>
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
bbop.core.require('bbop', 'widget', 'display', 'meta_results');
bbop.core.require('bbop', 'widget', 'display', 'results_table_by_class_conf');
bbop.core.require('bbop', 'widget', 'display', 'two_column_layout');
bbop.core.namespace('bbop', 'widget', 'live_search');

/*
 * Constructor: live_search
 * 
 * Contructor for the bbop.widget.display.live_search object.
 * 
 * Arguments:
 *  interface_id - string id of the div to build on
 *  conf_class - <bbop.golr.conf_class> for hints and other settings
 * 
 * Returns:
 *  BBOP GOlr UI object
 */
bbop.widget.display.live_search = function (interface_id, conf_class){

    var anchor = this;
    var each = bbop.core.each;
    
    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('UI (search): ' + str); }

    // There should be a string interface_id argument.
    // The class configuration we'll be using to hint and build.
    this.interface_id = interface_id;
    this.class_conf = conf_class;
   
    // Get the user interface hook and remove anything that was there.
    var ui_div_id = this.interface_id;
    jQuery('#' + ui_div_id).empty();

    // Mangle everything around this unique id so we don't collide
    // with other instances on the same page.
    var mangle = ui_div_id + '_ui_element_';

    // Render a control section into HTML. This includes the accordion
    // and current filter sections.
    var ui_controls_section_id = mangle + 'ui-controls-wrapper';
    var controls_div = new bbop.html.tag('div', {'id': ui_controls_section_id});
    //jQuery('#' + ui_div_id).append(controls_div.to_string());

    // Render a results section into HTML. The includes the results
    // table and the results meta-info sections.
    var ui_results_section_id = mangle + 'ui-results-wrapper';
    var results_div = new bbop.html.tag('div', {'id': ui_results_section_id});
    //jQuery('#' + ui_div_id).append(results_div.to_string());

    // Add the sections to a two column layout and add that into the
    // main ui div.
    var two_col_div =
	new bbop.widget.display.two_column_layout(controls_div, results_div);
    jQuery('#' + ui_div_id).append(two_col_div.to_string());

    // Main div id hooks to the easily changable areas of the two
    // column display.
    var ui_meta_div_id = mangle + 'meta-id';
    var ui_results_table_div_id = mangle + 'results-table-id';
    var ui_current_filters_div_id = mangle + 'current_filters-id';
    var ui_query_input_id = mangle + 'query-id';
    var ui_clear_query_span_id = mangle + 'clear-query-id';
    var ui_global_reset_span_id = mangle + 'global-reset-id';

    // Additional id hooks for easy callbacks. While these are not as
    // easily changable as the above, we use them often enough and
    // across functions to have a hook.
    var accordion_div_id = mangle + 'filter-accordion-id';
    
    // These pointers are used in multiple functions (e.g. both
    // *_setup and *_draw).
    var filter_accordion_widget = null;
    //var current_filters_div = null;

    /*
     * Function: setup_query
     *
     * Setup the free text query display under contructed tags for
     * later population.
     * 
     * Parameters:
     *  label_str - *[optional]* string or bbop.html for input label
     *
     * Returns:
     *  n/a
     */
    this.setup_query = function(label_str){
    
	ll('Build query UI for: ' + ui_query_input_id);

	// Tags and output to the page.
	if( ! label_str ){ label_str = 'Search:&nbsp;'; }
	var query_label = new bbop.html.tag('label', {'for': ui_query_input_id},
					    label_str);
	var query_div = new bbop.html.input({'id': ui_query_input_id,
					     'class': 'golr-ui-input'});	
	var clear_query_span =new bbop.html.span('&nbsp;<b>[clear]</b>',
						 {'id':ui_clear_query_span_id});
	jQuery('#' + ui_controls_section_id).append(query_label.to_string());
	jQuery('#' + ui_controls_section_id).append(query_div.to_string());
	jQuery('#'+ui_controls_section_id).append(clear_query_span.to_string());
    };

    /*
     * Function: setup_global_reset_button
     *
     * Add a bit of a place for the global reset button.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.setup_global_reset_button = function(){    
    	// Tags and output to the page.
    	var global_reset_span =
	    new bbop.html.span('&nbsp;<b>[reset all]</b>',
			       {'id': ui_global_reset_span_id});
	var gstr = global_reset_span.to_string();
    	jQuery('#' + ui_controls_section_id).append(gstr);
    };

    /*
     * Function: setup_current_filters
     *
     * Setup current filters display under contructed tags for later
     * population. The seeding information is coming in through the
     * GOlr conf class.
     * 
     * Add in the filter state up here.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.setup_current_filters = function(){
    
	ll('Build current filter UI for class configuration: ' +
	   this.class_conf.id());

	var current_filters_div =
	    new bbop.html.tag('div', {'id': ui_current_filters_div_id},
			      "No applied filters.");

	// Add the output to the page.
	var curr_filters_str = current_filters_div.to_string();
	jQuery('#' + ui_controls_section_id).append(curr_filters_str);
    };

    /*
     * Function: setup_accordion
     *
     * Setup the accordion skeleton under contructed tags for later
     * population. The seeding information is coming in through the
     * GOlr conf class.
     * Start building the accordion here. Not an updatable part.
     * 
     * Parameters:
     *  n/a 
     *
     * Returns: 
     *  n/a
     */
    this.setup_accordion = function(){
    
	ll('Build accordion UI for class configuration: ' +
	   this.class_conf.id());

	var filter_accordion_attrs = {
	    id: accordion_div_id,
	    style: 'width: 25em;'
	};
	filter_accordion_widget = // heavy lifting by special widget
	    new bbop.html.accordion([], filter_accordion_attrs, true);

	// Add the sections with no contents as a skeleton to be
	// filled by draw_accordion.
	var field_list = this.class_conf.field_order_by_weight('filter');
	each(field_list,
	     function (in_field){
		 ll('saw field: ' + in_field);
		 var ifield = anchor.class_conf.get_field(in_field);
		 var in_attrs = {
		     id: in_field,
		     label: ifield.display_name(),
		     description: ifield.description()
		 };
		 filter_accordion_widget.add_to(in_attrs, '', true);
	     });
	
	// Add the output from the accordion to the page.
	var accordion_str = filter_accordion_widget.to_string();
	jQuery('#' + ui_controls_section_id).append(accordion_str);

	// Add the jQuery accordioning.
	jQuery("#" + accordion_div_id).accordion({ clearStyle: true,
						   collapsible: true,
						   active: false });
    };

    /*
     * Function: setup_results
     *
     * Setup basic results table using the class conf. For actual
     * results rendering, see .draw_results. While there is a meta
     * block supplied, its use is optional.
     * 
     * Parameters:
     *  hash; the only option is {'meta': true}.
     *
     * Returns:
     *  n/a
     */
    this.setup_results = function(args){

	ll('Build results UI for class configuration: ' + this.class_conf.id());
	
	// Decide whether or not to add the meta div.
	var add_meta_p = false;
	if( args && args['meta'] && args['meta'] == true ){
	    add_meta_p = true;
	}

	// <div id="results_block" class="block">
	// <h2>Found entities</h2>
	// <div id="load_float"></div>
	// <div id="meta_results">
	// <div id="results_div">
	var block = new bbop.html.tag('div', {'class': 'block'});

	// Add header section.
	var header = new bbop.html.tag('h2', {}, 'Found entities');
	block.add_to(header);

	// If wanted, add meta to display queue.
	if( add_meta_p ){	    
	    var meta = new bbop.html.tag('div', {'id': ui_meta_div_id});
	    block.add_to(meta);
	}

	// Add results section.
	var results = new bbop.html.tag('div', {'id': ui_results_table_div_id});
	block.add_to(results);

	jQuery('#' + ui_results_section_id).append(block.to_string());

	// If wanted, add initial render of meta.
	if( add_meta_p ){	    
	    ll('Add meta UI div');
	    jQuery('#' + ui_meta_div_id).empty();
	    jQuery('#' + ui_meta_div_id).append('No search yet performed...');
	}
    };

    /*
     * Function: draw_meta
     *
     * Draw meta results.
     * TODO: paging, etc.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_meta = function(json_data, manager){
	
	ll('Draw meta div...');
	var golr_resp = new bbop.golr.response(json_data);

	///
	/// Section 1: the numbers display.
	///

	// Collect numbers for display.
	var total_c = golr_resp.total_documents();
	var first_d = golr_resp.start_document();
	var last_d = golr_resp.end_document();

	// Draw meta; the current numbers and page--the same for
	// every type of return.
	var dmeta = null;
	if( total_c == 0 ){
	    //// Adjust since we're off by one.
	    //dmeta = new bbop.widget.display.meta_results(0, 0, 0);
	    jQuery('#' + ui_meta_div_id).empty();
	    jQuery('#' + ui_meta_div_id).append('No results found.');
	}else{
	    dmeta =
		new bbop.widget.display.meta_results(total_c, first_d, last_d);

	    jQuery('#' + ui_meta_div_id).empty();
	    jQuery('#' + ui_meta_div_id).append(dmeta.to_string());

	    ///
	    /// Section 2: the paging buttons.
	    ///
	    
	    // Now add the raw buttons to the interface, and after this,
	    // activation and adding events.
	    var b_first = new bbop.html.button('First', {'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append(b_first.to_string());
	    var b_back = new bbop.html.button('Prev', {'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append(b_back.to_string());
	    var b_forward = new bbop.html.button('Next', {'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append(b_forward.to_string());
	    var b_last = new bbop.html.button('Last', {'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append(b_last.to_string());

	    // Do the math about what buttons to activate.
	    var b_first_disabled_p = false;
	    var b_back_disabled_p = false;
	    var b_forward_disabled_p = false;
	    var b_last_disabled_p = false;
	    
	    // Only activate paging if it is necessary to the returns.
	    if( ! golr_resp.paging_p() ){
		b_first_disabled_p = true;
		b_back_disabled_p = true;
		b_forward_disabled_p = true;
		b_last_disabled_p = true;
	    }
	    
	    // Don't activate back on the first page.
	    if( ! golr_resp.paging_previous_p() ){
		b_first_disabled_p = true;
		b_back_disabled_p = true;
	    }
	    
	    // Don't activate next on the last page.
	    if( ! golr_resp.paging_next_p() ){
		b_forward_disabled_p = true;
		b_last_disabled_p = true;
	    }
	    
	    // First page button.
	    var b_first_props = {
		icons: { primary: "ui-icon-seek-first"},
		disabled: b_first_disabled_p,
		text: false
	    };
	    jQuery('#' + b_first.get_id()).button(b_first_props).click(
		function(){
		    // Cheat and trust reset by proxy to work.
		    manager.page_first(); 
		});
	    
	    // Previous page button.
	    var b_back_props = {
		icons: { primary: "ui-icon-seek-prev"},
		disabled: b_back_disabled_p,
		text: false
	    };
	    jQuery('#' + b_back.get_id()).button(b_back_props).click(
		function(){
		    manager.page_previous();
		});
	    
	    // Next page button.
	    var b_forward_props = {
		icons: { primary: "ui-icon-seek-next"},
		disabled: b_forward_disabled_p,
		text: false
	    };
	    jQuery('#' + b_forward.get_id()).button(b_forward_props).click(
		function(){
		    manager.page_next();
		});
	    
	    // Last page button.
	    var b_last_props = {
		icons: { primary: "ui-icon-seek-end"},
		disabled: b_last_disabled_p,
		text: false
	    };
	    jQuery('#' + b_last.get_id()).button(b_last_props).click(
		function(){
		    // A little trickier.
		    manager.page_last(total_c);
		});
	    
	    ///
	    /// Section 3: the export-to-wherever buttons.
	    ///
	    
	    // Cart.
	    var b_export = new bbop.html.button('Cart',
						{'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append('&nbsp;&nbsp;&nbsp;' +
						'&nbsp;&nbsp;&nbsp;');
	    jQuery('#' + ui_meta_div_id).append(b_export.to_string());
	    var b_export_props = {
		icons: { primary: "ui-icon-circle-zoomin"},
		disabled: false,
		text: false
	    };
	    jQuery('#' + b_export.get_id()).button(b_export_props).click(
		function(){
		    alert('TODO: Export to Galaxy: ' + manager.get_query_url());
		});

	    // Cart.
	    var b_cart = new bbop.html.button('Cart',
						{'generate_id': true});
	    jQuery('#' + ui_meta_div_id).append(b_cart.to_string());
	    var b_cart_props = {
		icons: { primary: "ui-icon-cart"},
		disabled: false,
		text: false
	    };
	    jQuery('#' + b_cart.get_id()).button(b_cart_props).click(
		function(){
		    alert('TODO: Cart function: ' + manager.get_query_url());
		});
	}
    };

    /*
     * Function: reset_query
     *
     * Setup and draw the query widget. This function makes it active
     * as well.
     * 
     * Due to the nature of this, it is only reset when called.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.reset_query = function(json_data, manager){

    	ll('Reset query for: ' + ui_query_input_id);
	//var golr_resp = new bbop.golr.response(json_data);

	// Reset manager and ui.
	jQuery('#' + ui_query_input_id).val('');
	manager.reset_query();

	// Add a smartish listener.
	jQuery('#' + ui_query_input_id).keyup(
	    function(event){

		// First, extract the exact event, we might want to
		// filter it...
		var ignorable_event_p = false;
		if( event ){
		    var kc = event.keyCode;
		    if( kc ){
			if( kc == 39 || // right
                            kc == 37 || // left
                            kc == 32 || // space
                            kc == 20 || // ctl?
                            kc == 17 || // ctl?
                            kc == 16 || // shift
                            //kc ==  8 || // delete
                            kc ==  0 ){ // super
				ll('ignorable key event: ' + kc);
				ignorable_event_p = true;
			    }
                    }
		}

		// If we're left with a legitimate event, handle it.
		if( ! ignorable_event_p ){

		    // Can't ignore it anymore, so it goes into the
		    // manager for testing.
		    var tmp_q = manager.get_query();
		    var input_text = jQuery(this).val();
		    manager.set_query(input_text);

		    // If the manager feels like it's right, trigger.
		    if( manager.sensible_query_p() ){
			ll('keeping set query: ' + input_text);
			// Set the query to be more "usable" just
			// before triggering (so the tests can't be
			// confused by our switch).
			manager.set_comfy_query(input_text);
			manager.search();
		    }else{
			ll('rolling back query: ' + tmp_q);		    
			manager.set_query(tmp_q);
		    }
		}
	    });

	// Now reset the clear button and immediately set the event.
	jQuery('#' + ui_clear_query_span_id).click(
	    function(){
		jQuery('#' + ui_query_input_id).val('');
		manager.reset_query();
		manager.search();
	    });
    };

    /*
     * Function: reset_global_reset_button
     *
     * Add events and redraw to the global reset button section.
     * 
     * Parameters:
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.reset_global_reset_button = function(json_data, manager){
    
    	ll('Reset global reset button');
    	//jQuery('#' + ui_reset_span_id).empty();
    	// Immediately set the event.
    	jQuery('#' + ui_global_reset_span_id).click(
    	    function(){
    		manager.reset();
    	    });
    };

    /*
     * Function: draw_current_filters
     *
     * (Re)draw the information in the current filter set.
     * This function makes them active as well.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_current_filters = function(json_data, manager){
    
	ll('Draw current filters for: ' + ui_div_id);
	var golr_resp = new bbop.golr.response(json_data);

	// Add in the actual HTML for the filters and buttons. While
	// doing so, tie a unique id to the filter--we'll use that
	// later on to add buttons and events to them.
	var in_query_filters = golr_resp.query_filters();
	var sticky_query_filters = manager.get_sticky_query_filters();
	ll('filters: ' + bbop.core.dump(in_query_filters));
	var fq_list_tbl = new bbop.html.table(['', 'Filters', ''], []);
	var has_fq_p = false; // assume there are no filters to begin with
	var button_hash = {};
	each(in_query_filters,
	     function(field, field_vals){
		 each(field_vals,
		      function(field_val, polarity){

			  // Make note of stickiness, skip adding if sticky.
			  var qfp =
			      manager.get_query_filter_properties(field,
								  field_val);
			  if( ! qfp || qfp['sticky_p'] == false ){
			  
			      // Note the fact that we actually have a
			      // query filter to work with and display.
			      has_fq_p = true;

			      // Boolean value to a character.
			      var polstr = '-';
			      if( polarity ){ polstr = '+'; }

			      // Generate a button with a unique id.
			      var label_str = polstr+' '+ field +':'+field_val;
			      // var b =
			      // 	  new bbop.html.button('remove filter',
			      // 			       {'generate_id': true});
			      var b =
				  new bbop.html.span('<b>[&nbsp;X&nbsp;]</b>',
						     {'generate_id': true});
			      
			      // Tie the button it to the filter for
			      // jQuery and events attachment later on.
			      var bid = b.get_id();
			      button_hash[bid] = [polstr, field, field_val];
			  
			      //ll(label_str +' '+ bid);
			      //fq_list_tbl.add_to(label_str +' '+ b.to_string());
			      fq_list_tbl.add_to(['<b>'+ polstr +'</b>',
						  field + ': ' + field_val,
						  b.to_string()]);
			      //label_str +' '+ b.to_string());
			  }
		      });
	     });

	// Either add to the display, or display the "empty" message.
	var cfid = '#' + ui_current_filters_div_id;
	jQuery(cfid).empty();
	if( ! has_fq_p ){
	    jQuery(cfid).append("No current filters.");
	}else{

	    // With this, the buttons will be attached to the
	    // DOM...
	    jQuery(cfid).append(fq_list_tbl.to_string());

	    // Now let's go back and add the buttons, styles,
	    // events, etc.
	    each(button_hash,
		 function(button_id){
		     var bid = button_id;

		     // // Get the button.
		     // var bprops = {
		     // 	 icons: { primary: "ui-icon-close"},
		     // 	 text: false
		     // };
		     // Create the button and immediately add the event.
		     //jQuery('#' + bid).button(bprops).click(
		     jQuery('#' + bid).click(
			 function(){
			     var tid = jQuery(this).attr('id');
			     var button_props = button_hash[tid];
			     var polstr = button_props[0];
			     var field = button_props[1];
			     var value = button_props[2];

			     // Change manager and fire.
			     // var lstr = polstr +' '+ field +' '+ value;
			     // alert(lstr);
			     // manager.remove_query_filter(field,value,
			     // 				 [polstr, '*']);
			     manager.remove_query_filter(field, value);
			     manager.search();
			 });
		 });
	}
    };

    /*
     * Function: draw_accordion
     *
     * (Re)draw the information in the accordion controls/filters.
     * This function makes them active as well.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_accordion = function(json_data, manager){
    
	ll('Draw current accordion for: ' + ui_div_id);
	var golr_resp = new bbop.golr.response(json_data);

	// Make sure that accordion has already been inited.
	if( typeof(filter_accordion_widget) == 'undefined' ){
	    throw new Error('Need to init accordion to use it.');
	}

	// We'll need this in a little bit for calculating when to
	// display the "more" option for the field filters.
	var curr_facet_limit = manager.get_facet_limit();

	// Hash where we collect our button information.
	// button_id -> [source, filter, count, polarity];
	var button_hash = {};

	// And a hash to store information to be able to generate the
	// complete filter shields.
	// span_id -> filter_id
	var overflow_hash = {};

	// Cycle through each facet field; all the items in each,
	// create the lists and buttons (while collectong data useful
	// in creating the callbacks) and put them into the accordion.
	each(golr_resp.facet_field_list(),
	     function(in_field){

		 var facet_bd = golr_resp.facet_field(in_field);
		 if( bbop.core.is_empty(facet_bd) ){
		     
		     // No filters means nothing in the box.
		     var section_id =
			 filter_accordion_widget.get_section_id(in_field);
		     jQuery('#' + section_id).empty();
		     jQuery('#' + section_id).append('Nothing to filter.');

		 }else{
		     
		     // Create ul lists of the facet contents.
		     var tbl_id = mangle + 'filter-list-' + in_field;
		     var facet_list_tbl_attrs = {
			 id: tbl_id
			 //style: 'height: 30em;'
		     };
		     //var facet_list_ul=new bbop.html.list([],facet_list_ul_attrs);
		     var facet_list_tbl =
			 new bbop.html.table([], [], facet_list_tbl_attrs);
		     
		     // Now go through and get filters and counts.
		     each(golr_resp.facet_field(in_field),
			  function(ff_field, ff_index){

			      // Only go for it if we have still below
			      // the limit by one; otherwise, we'll
			      // want to display the larger selection
			      // shield.
			      if( ff_index < curr_facet_limit -1 ){ // offset
				  
				  // Pull out info.
				  var f_name = ff_field[0];
				  var f_count = ff_field[1];
				  //var fstr = f_name +" ("+ f_count +")";
				  //ll("COLLECT: " + fstr);
				  
				  // Create buttons and store them for later
				  // activation with callbacks to the manager.
				  // var b_plus =
				  //     new bbop.html.button('+filter',
				  // 		   {'generate_id': true});
				  // var b_minus =
				  //     new bbop.html.button('-filter',
				  // 		   {'generate_id': true});
				  var b_plus_txt = '<b>[&nbsp;+&nbsp;]</b>';
				  var b_plus =
				      new bbop.html.span(b_plus_txt,
							 {'generate_id': true});
				  var b_minus_txt = '<b>[&nbsp;-&nbsp;]</b>';
				  var b_minus =
				      new bbop.html.span(b_minus_txt,
							 {'generate_id': true});
				  button_hash[b_plus.get_id()] =
				      [in_field, f_name, f_count, '+'];
				  button_hash[b_minus.get_id()] =
				      [in_field, f_name, f_count, '-'];
				  
				  // // Add the label and buttons to the
				  // // appropriate ul list.
				  //facet_list_ul.add_to(
				  // fstr,b_plus.to_string(),
				  // 		       b_minus.to_string());
				  // Add the label and buttons to the table.
				  facet_list_tbl.add_to([f_name,'('+f_count+')',
							 b_plus.to_string(),
							 b_minus.to_string()]);
			      }else{

				  // Since this is the overflow item,
				  // add a span that can be clicked on
				  // to get the full filter list.
				  //ll("Overflow for " + in_field);
				  var b_over_txt = '<b>[more...]</b>';
				  var b_over =
				      new bbop.html.span(b_over_txt,
							 {'generate_id': true});
				  facet_list_tbl.add_to([b_over.to_string(),
				  			 '', '']);
				  overflow_hash[b_over.get_id()] = in_field;
			      }
			  });

		     // Now add the ul to the appropriate section of the
		     // accordion in the DOM.
		     var sect_id =
			 filter_accordion_widget.get_section_id(in_field);
		     jQuery('#' + sect_id).empty();
		     var final_tbl_str = facet_list_tbl.to_string();
		     jQuery('#' + sect_id).append(final_tbl_str);
		 }
	     });

	// Okay, now introducing a function that we'll be using a
	// couple of times in our callbacks. Given a button id (from
	// a button hash) and the [field, filter, count, polarity]
	// values from the props, make a button-y thing an active
	// filter.
	function filter_select_live(button_id, create_time_button_props){
	    //var bid = button_id;
	    //var in_field = create_time_button_props[0];	 
	    //var in_filter = create_time_button_props[1];
	    //var in_count = create_time_button_props[2];
	    var in_polarity = create_time_button_props[3];

	    // Decide on the button graphical elements.
	    var b_ui_icon = 'ui-icon-plus';
	    if( in_polarity == '-' ){
		b_ui_icon = 'ui-icon-minus';
	    }
	    var b_ui_props = {
		icons: { primary: b_ui_icon},
		text: false
	    };

	    // Create the button and immediately add the event.
	    //jQuery('#' + button_id).button(b_ui_props).click(
	    jQuery('#' + button_id).click(
		function(){
		    var tid = jQuery(this).attr('id');
		    var call_time_button_props = button_hash[tid];
		    var call_field = call_time_button_props[0];	 
		    var call_filter = call_time_button_props[1];
		    //var in_count = button_props[2];
		    var call_polarity = call_time_button_props[3];
		    
		    // Change manager and fire.
		    // var bstr =call_field+' '+call_filter+' '+call_polarity;
		    // alert(bstr);
		    manager.add_query_filter(call_field, call_filter,
			  		     [call_polarity]);
		    manager.search();
		});
	}

	// Now let's go back and add the buttons, styles,
	// events, etc. in the main accordion section.
	each(button_hash, filter_select_live);

	// Next, tie the events to the "more" spans.
	each(overflow_hash,
	     function(button_id, filter_name){
		 jQuery('#' + button_id).click(

		     // On click, set that one field to limitless in
		     // the manager, setup a shield, and wait for the
		     // callback.
		     function(){

			 // Recover the field name.
			 var tid = jQuery(this).attr('id');
			 var call_time_field_name = overflow_hash[tid];
			 //alert(call_time_field_name);

			 // Set the manager to no limit on that field and
			 // only rturn the information that we want.
			 manager.set_facet_limit(0);
			 manager.set_facet_limit(call_time_field_name, -1);
			 var curr_row = manager.get('rows');
			 manager.set('rows', 0);

			 // Create the shield and pop-up the
			 // placeholder.
			 var filter_shield =
			     new bbop.widget.display.filter_shield();
			 filter_shield.start_wait();

			 // Open the populated shield.
			 function draw_shield(json_data){

			     // First, extract the fields from the
			     // minimal response.
			     var resp = new bbop.golr.response(json_data);
			     var fina = call_time_field_name;
			     var flist = resp.facet_field(call_time_field_name);

			     // Draw the proper contents of the shield.
			     filter_shield.draw(fina, flist, manager);
			 }
			 manager.fetch(draw_shield);

			 // Reset the manager to more sane settings.
			 manager.reset_facet_limit();
			 manager.set('rows', curr_row);
		     });
	     });

	ll('Done current accordion for: ' + ui_div_id);
    };

    /*
     * Function: draw_results
     *
     * Draw results using hints from the golr class configuration.
     * 
     * Parameters:
     *  json_data - the raw returned JSON response from the server
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_results = function(json_data, manager){
	
	var linker = new amigo.linker();

	ll('Draw results div...');
	var golr_resp = new bbop.golr.response(json_data);

	//ll('final_table a: ' + final_table._is_a);
	//ll('final_table b: ' + final_table.to_string);
	//ll('final_table c: ' + final_table.to_string());

	// Clear whatever is there.
	var urtdi = ui_results_table_div_id;
	jQuery('#' + urtdi).empty();

	// Display product when not empty.
	var docs = golr_resp.documents();
	if( ! bbop.core.is_empty(docs) ){
	    var final_table =
		new bbop.widget.display.results_table_by_class(anchor.class_conf,
							       golr_resp,
							       linker,
							       urtdi);
	    //jQuery('#' + urtdi).append(bbop.core.to_string(final_table));
	}
    };

    /*
     * Function: draw_error
     *
     * Somehow report an error to the user.
     * 
     * Parameters:
     *  error_message - a string(?) describing the error
     *  manager - <bbop.golr.manager> that we initially registered with
     *
     * Returns:
     *  n/a
     */
    this.draw_error = function(error_message, manager){
	ll("Runtime error: " + error_message);
	alert("Runtime error: " + error_message);
    };

};
/*
 * Package: browse.js
 * 
 * Namespace: bbop.widget.browse
 * 
 * BBOP object to draw various UI elements that have to do with
 * autocompletion.
 * 
 * This is a completely self-contained UI and manager.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
bbop.core.require('bbop', 'model');
bbop.core.require('bbop', 'model', 'bracket', 'graph');
bbop.core.require('bbop', 'html');
bbop.core.require('bbop', 'golr', 'manager', 'jquery');
bbop.core.namespace('bbop', 'widget', 'browse');

/*
 * Constructor: browse
 * 
 * Contructor for the bbop.widget.browse object.
 * 
 * This is a specialized (and widgetized) subclass of
 * <bbop.golr.manager.jquery>.
 * 
 * While everything in the argument hash is technically optional,
 * there are probably some fields that you'll want to fill out to make
 * things work decently. The options for the argument hash are:
 * 
 *  topology_graph_field -  the field for the topology graph
 *  transitivity_graph_field - the field for the transitivity graph
 *  info_button_callback - functio to call when info clicked, gets doc
 *  base_icon_url - the url base that the fragments will be added to
 *  image_type - 'gif', 'png', etc.
 *  current_icon - the icon fragment for the current term
 *  info_icon - the icon fragment for the information icon
 *  info_alt - the alt text and title for the information icon
 * 
 * The basic formula for the icons is: base_icon_url + '/' + icon +
 * '.' + image_type; then all spaces are turned to underscores and all
 * uppercase letters are converted into lowercase letters.
 * 
 * The functions for the callbacks look like function(<term acc>,
 * <json data for the specific document>){}. If no function is given,
 * an empty function is used.
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server;
 *  golr_conf_obj - a <bbop.golr.conf> object
 *  interface_id - string id of the element to build on
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  this object
 */
bbop.widget.browse = function(golr_loc, golr_conf_obj, interface_id,
			      in_argument_hash){

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('B (widget): ' + str); }

    bbop.golr.manager.jquery.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.widget.browse';
    // ll("what_is (post: this.update): " + bbop.core.what_is(this.update));

    // 
    var anchor = this;
    var loop = bbop.core.each;
    
    // Our argument default hash.
    var default_hash =
	{
	    'topology_graph_field' : 'topology_graph',
	    'transitivity_graph_field' : 'transitivity_graph',
	    'info_button_callback' : function(){},
	    'base_icon_url' : null,
	    'image_type' : 'gif',
	    'current_icon' : 'this',
	    'info_icon' : 'info',
	    'info_alt' : 'Click for more information.'
	};
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.core.fold(default_hash, folding_hash);

    // There should be a string interface_id argument.
    this._interface_id = interface_id;
    this._info_button_callback = arg_hash['info_button_callback'];
    var topo_graph_field = arg_hash['topology_graph_field'];
    var trans_graph_field = arg_hash['transitivity_graph_field'];
    var base_icon_url = arg_hash['base_icon_url'];
    var image_type = arg_hash['image_type'];
    var current_icon = arg_hash['current_icon'];
    var info_icon = arg_hash['info_icon'];
    var info_alt = arg_hash['info_alt'];
   
    // The current acc that we are interested in.
    this._current_acc = null;

    // Successful callbacks call draw_rich_layout.
    anchor.register('search', 'do', draw_rich_layout);

    // Recursively draw a rich layout using nested uls.
    function draw_rich_layout(json_data){
	
	///
	/// Get the rich layout from the returned document if
	/// possible.
	///
	var resp = new bbop.golr.response(json_data);
	var doc = resp.documents(json_data)[0];

	var topo_graph = new bbop.model.bracket.graph();
	topo_graph.load_json(JSON.parse(doc[topo_graph_field]));

	var trans_graph = new bbop.model.graph();
	trans_graph.load_json(JSON.parse(doc[trans_graph_field]));

	//ll('to: ' + doc['topology_graph']);
	//ll('tr: ' + doc['transitivity_graph']);
	//ll('ro: ' + anchor._current_acc);
	//ll('g: ' + topo_graph.get_parent_nodes(anchor._current_acc));
	var rich_layout = topo_graph.rich_bracket_layout(anchor._current_acc,
							 trans_graph);
	//ll("rl: " + bbop.core.dump(rich_layout));

	///
	/// Next, produce the raw HTML skeleton.
	/// TODO: Keep a cache of the interesting ids for adding
	/// events later.
	///

	// I guess we'll just start by making the list.
	var top_level = new bbop.html.list();

	// Store the navigation anf info buttons.
	var nav_button_hash = {};
	var info_button_hash = {};

	// Cycle down through the brackets, adding spaces every time
	// we go down another level.
	var spacing = '&nbsp;&nbsp;&nbsp;&nbsp;';
	var spaces = spacing;
	loop(rich_layout, // for every level
	     function(layout_level){
		 loop(layout_level, // for every item at this level
		      function(level_item){			  

			  var nid = level_item[0];
			  var lbl = level_item[1];
			  var rel = level_item[2];
			  
			  // For various sections, decide to run image
			  // (img) or text code depending on whether
			  // or not it looks like we have a real URL.
			  var use_img_p = true;
			  if( base_icon_url == null || base_icon_url == '' ){
			      use_img_p = false;
			  }

			  // Clickable acc span.
			  // No images, so the same either way. Ignore
			  // it if we're current.
			  var nav_b = null;
			  if(anchor._current_acc == nid){
			      nav_b = new bbop.html.span('[' + nid + ']');
			  }else{
			      nav_b = new bbop.html.span('<a>[' + nid + ']</a>',
							 {'generate_id': true});
			      nav_button_hash[nav_b.get_id()] = nid;
			  }

			  // Clickable info span. A little difference
			  // if we have images.
			  var info_b = null;
			  if( use_img_p ){
			      // Do the icon version.
			      var imgsrc = bbop.core.resourcify(base_icon_url,
								info_icon,
								image_type);
			      info_b =
				  new bbop.html.image({'alt': info_alt,
						       'title': info_alt,
				  		       'src': imgsrc,
				  		       'generate_id': true});
			  }else{
			      // Do a text-only version.
			      info_b =
				  new bbop.html.span('<b>[i]</b>',
						     {'generate_id': true});
			  }
			  info_button_hash[info_b.get_id()] = nid;

			  // "Icon". If base_icon_url is defined as
			  // something try for images, otherwise fall
			  // back to this text ick.
			  var icon = null;
			  if( use_img_p ){
			      // Do the icon version.
			      var ialt = '[' + rel + ']';
			      var isrc = null;
			      if(anchor._current_acc == nid){
				  isrc = bbop.core.resourcify(base_icon_url,
			      				      current_icon,
							      image_type);
			      }else{
				  isrc = bbop.core.resourcify(base_icon_url,
			      				      rel, image_type);
			      }
			      icon =
				  new bbop.html.image({'alt': ialt,
						       'title': rel,
				  		       'src': isrc,
				  		       'generate_id': true});
			  }else{
			      // Do a text-only version.
			      if(anchor._current_acc == nid){
				  icon = '[[->]]';
			      }else if( rel && rel.length && rel.length > 0 ){
				  icon = '[' + rel + ']';
			      }else{
				  icon = '[???]';
			      }
			  }

			  // Stack the info, with the additional
			  // spaces, into the div.
			  top_level.add_to(spaces,
					   icon,
					   nav_b.to_string(),
					   lbl,
					   info_b.to_string());
		      }); 
		 spaces = spaces + spacing;
	     }); 

	// Add the skeleton to the doc.
	jQuery('#' + anchor._interface_id).empty();
	jQuery('#' + anchor._interface_id).append(top_level.to_string());

	///
	/// Finally, attach any events to the browser HTML doc.
	///

	// Navigation.
	loop(nav_button_hash,
	     function(button_id, node_id){

		 jQuery('#' + button_id).click(
		     function(){
			 var tid = jQuery(this).attr('id');
			 var call_time_node_id = nav_button_hash[tid];
			 //alert(call_time_node_id);
			 anchor.draw_browser(call_time_node_id);
		     });
	     });

	// Information.
	loop(info_button_hash,
	     function(button_id, node_id){

		 jQuery('#' + button_id).click(
		     function(){
			 var tid = jQuery(this).attr('id');
			 var call_time_node_id = info_button_hash[tid];
			 var call_time_doc = resp.get_doc(call_time_node_id);
			 anchor._info_button_callback(call_time_node_id,
						      call_time_doc);
		     });
	     });
    }
	
    /*
     * Function: draw_browser
     * 
     * Bootstraps the process.
     * 
     * Parameters:
     *  term_acc - acc of term we want to have as the term of interest
     * 
     * Returns
     *  n/a
     */
    //bbop.widget.browse.prototype.draw_browser = function(term_acc){
    // this._current_acc = term_acc;
    // this.set_id(term_acc);
    // this.update('search');
    this.draw_browser = function(term_acc){
	anchor._current_acc = term_acc;
	anchor.set_id(term_acc);
	anchor.update('search');
    };
    
};
bbop.core.extend(bbop.widget.browse, bbop.golr.manager.jquery);
/*
 * Package: search_box.js
 * 
 * Namespace: bbop.widget.search_box
 * 
 * BBOP object to draw various UI elements that have to do with
 * autocompletion.
 * 
 * This is a completely self-contained UI and manager.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
bbop.core.require('bbop', 'template');
bbop.core.require('bbop', 'golr', 'manager', 'jquery');
bbop.core.namespace('bbop', 'widget', 'search_box');

/*
 * Constructor: search_box
 * 
 * Contructor for the bbop.widget.search_box object.
 * 
 * This is a specialized (and widgetized) subclass of
 * <bbop.golr.manager.jquery>.
 * 
 * The function for the callback argument should either accept a
 * JSONized solr document representing the selected item or null
 * (nothing found).
 * 
 * While everything in the argument hash is technically optional,
 * there are probably some fields that you'll want to fill out to make
 * things work decently. The options for the argument hash are:
 * 
 *  label_template - string template for dropdown, can use any document field
 *  value_template - string template for selected, can use any document field
 *  minimum_length - wait for this many characters to start (default 3)
 *  list_select_callback - function takes a json solr doc on dropdown selection
 * 
 * To get a better idea on how to use the templates, see the demo page
 * at http://cdn.berkeleybop.org/jsapi/bbop-js/demo/index.html and
 * read the documentation for <bbop.template>.
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server;
 *  golr_conf_obj - a <bbop.golr.conf> object
 *  interface_id - string id of the element to build on
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  this object
 */
bbop.widget.search_box = function(golr_loc,
				  golr_conf_obj,
				  interface_id,
				  in_argument_hash){
    bbop.golr.manager.jquery.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.widget.search_box';

    // Aliases.
    var anchor = this;
    var loop = bbop.core.each;
    
    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('W (auto): ' + str); }

    // Our argument default hash.
    var default_hash =
	{
	    'label_template': '{{id}}',
	    'value_template': '{{id}}',
	    'minimum_length': 3, // wait for three characters or more
	    'list_select_callback': function(){}
	};
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.core.fold(default_hash, folding_hash);

    // There should be a string interface_id argument.
    this._interface_id = interface_id;
    this._list_select_callback = arg_hash['list_select_callback'];
    var label_tt = new bbop.template(arg_hash['label_template']);
    var value_tt = new bbop.template(arg_hash['value_template']);
    var minlen = arg_hash['minimum_length'];

    // The all-important argument hash. See:
    // http://jqueryui.com/demos/autocomplete/#method-widget
    var auto_args = {
	minLength: minlen,
	// Function for a successful data hit.
	// The data getter, which is making it all more complicated
	// than it needs to be...we need to close around those
	// callback hooks so we have to do it inplace here.
	source: function(request_data, response_hook) {
	    anchor.jq_vars['success'] = function(json_data){
		var retlist = [];
		var resp = new bbop.golr.response(json_data);
		if( resp.success() ){
		    loop(resp.documents(),
			 function(doc){

			     // First, try and pull what we can out of our
			     var lbl = label_tt.fill(doc);

			     // Now the same thing for the return/value.
			     var val = value_tt.fill(doc);

			     // Add the discovered items to the return
			     // save.
			     var item = {
				 'label': lbl,
				 'value': val,
				 'document': doc
			     };
			     retlist.push(item);
			 });
		}
		response_hook(retlist);
	    };

	    // Get the selected term into the manager and fire.
	    //anchor.set_query(request_data.term);
	    anchor.set_comfy_query(request_data.term);
	    anchor.JQ.ajax(anchor.get_query_url(), anchor.jq_vars);
	},
	// What to do when an element is selected.
	select: function(event, ui){
	    var doc_to_apply = null;
	    if( ui.item ){
		doc_to_apply = ui.item.document;
	    }

	    // Only do the callback if it is defined.
	    if( bbop.core.is_defined(anchor._list_select_callback) ){
		anchor._list_select_callback(doc_to_apply);
	    }
	}
    };

    // Set the ball rolling (attach jQuery autocomplete to doc).
    jQuery('#' + anchor._interface_id).autocomplete(auto_args);


    /*
     * Function: destroy
     * 
     * Remore the autocomplete and functionality from the DOM.
     * 
     * Arguments:
     *  n/a
     * 
     * Returns:
     *  n/a
     */
    this.destroy = function(){
	jQuery('#' + anchor._interface_id).autocomplete('destroy');
    };

};
bbop.core.extend(bbop.widget.search_box, bbop.golr.manager.jquery);
/*
 * Package: term_shield.js
 * 
 * Namespace: bbop.widget.term_shield
 * 
 * BBOP object to produce a self-constructing/self-destructing term
 * information shield.
 * 
 * This is a completely self-contained UI and manager.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
//bbop.core.require('bbop', 'model');
//bbop.core.require('bbop', 'model', 'graph', 'bracket');
bbop.core.require('bbop', 'html');
bbop.core.require('bbop', 'golr', 'manager', 'jquery');
bbop.core.namespace('bbop', 'widget', 'term_shield');

/*
 * Constructor: term_shield
 * 
 * Contructor for the bbop.widget.term_shield object.
 * 
 * This is (sometimes) a specialized (and widgetized) subclass of
 * <bbop.golr.manager.jquery>.
 * 
 * To actually do much useful, you should set the personality of the
 * widget.
 * 
 * The optional hash arguments look like:
 * 
 *  linker - a "linker" object
 *  width - defaults to 700
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server; not needed if local
 *  golr_conf_obj - a <bbop.golr.conf> object
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  self
 */
bbop.widget.term_shield = function(golr_loc, golr_conf_obj, in_argument_hash){
    
    bbop.golr.manager.jquery.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.widget.term_shield';

    var anchor = this;

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('W (term_shield): ' + str); }

    // Our argument default hash.
    var default_hash = {
	'linker_function': function(){},
	'width': 700
    };
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.core.fold(default_hash, folding_hash);
    var width = arg_hash['width'];
    var linker = arg_hash['linker_function'];

    // Draw a locally help Solr response doc.
    function _draw_local_doc(doc){
	
	//ll(doc['id']);

	var personality = anchor.get_personality();
	var cclass = golr_conf_obj.get_class(personality);

	var txt = 'Nothing here...';
	if( doc && cclass ){

	    var tbl = new bbop.html.table();
	    var results_order = cclass.field_order_by_weight('result');
	    var each = bbop.core.each; // conveience
	    each(results_order,
		 function(fid){
		     // 
		     var field = cclass.get_field(fid);
		     var val = doc[fid];
		     //var link = linker.anchor({id: val}, 'term');
		     var link = null;
		     if( val ){
			 link = linker.anchor({id: val});
			 if( link ){ val = link; }
		     }else{
			 val = 'n/a';
		     }
		     tbl.add_to([field.display_name(), val]);
		     //tbl.add_to(['link', linker.anchor({id: doc['id']})]);
		 });
	    txt = tbl.to_string();
	}

	// Create div.
	var div = new bbop.html.tag('div', {'generate_id': true});
	var div_id = div.get_id();

	// Append div to body.
	jQuery('body').append(div.to_string());

	// Add text to div.
	jQuery('#' + div_id).append(txt);

	// Modal dialogify div; include self-destruct.
	var diargs = {
	    modal: true,
	    draggable: false,
	    width: width,
	    close:
	    function(){
		// TODO: Could maybe use .dialog('destroy') instead?
		jQuery('#' + div_id).remove();
	    }	    
	};
	var dia = jQuery('#' + div_id).dialog(diargs);
    }

    // Get a doc by id from a remote server then display it when it
    // gets local.
    // TODO: spinner?
    function _draw_remote_id(id_string){
	function _process_resp(json_data){
	    var resp = new bbop.golr.response(json_data);
	    var doc = resp.get_doc(0);
	    _draw_local_doc(doc);
	}
	anchor.register('search', 'do', _process_resp);
	anchor.set_id(id_string);
	//ll('FOO: ' + id_string);
	anchor.search();
    }

    /*
     * Function: draw
     * 
     * Render a temporary modal information shield. 
     * 
     * Arguments:
     *  item - either a document id or a Solr-returned document
     * 
     * Returns:
     *  n/a
     */
    this.draw = function(item){
    // Call the render directly if we already have a document,
    // otherwise, if it seems like a string (potential id), do a
    // callback on it and pull the doc out.
	if( bbop.core.what_is(item) == 'string' ){
	    _draw_remote_id(item);
	}else{
	    _draw_local_doc(item);
	}
    };
    
};
bbop.core.extend(bbop.widget.term_shield, bbop.golr.manager.jquery);
/*
 * Package: search_pane.js
 * 
 * Namespace: bbop.widget.search_pane
 * 
 * BBOP object to produce a self-constructing/self-destructing term
 * general filtering search tool for an index. This is a completely
 * self-contained UI and manager.
 * 
 * The function ".establish_display()" must be run *after* an initial
 * personality is set. Also, in many use cases, you'll want to have an line like the following befire running ".establish_display()".
 * : sp_widget.add_query_filter('document_category', 'annotation', ['*']);
 * 
 * The search pane will display one less filter row than is set with
 * .set_facet_limit(), it will use this runover to decide whether or
 * not to display the "more" option for the filters.
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
//bbop.core.require('bbop', 'model');
//bbop.core.require('bbop', 'model', 'graph', 'bracket');
bbop.core.require('bbop', 'html');
bbop.core.require('bbop', 'golr', 'manager', 'jquery');
bbop.core.namespace('bbop', 'widget', 'search_pane');

/*
 * Constructor: search_pane
 * 
 * Contructor for the bbop.widget.search_pane object.
 * 
 * This is a specialized (and widgetized) subclass of
 * <bbop.golr.manager.jquery>.
 * 
 * Sticky filters (see manager documentation) are "hidden" from the
 * user in all displays.
 * 
 * The optional hash arguments look like:
 * 
 *  base_icon_url - base path to icons, see above (default null, use text)
 *  image_type - icon image type (default 'gif')
 *  layout_type - choose the layout type to use (default 'two-column')
 *  show_global_reset_p - show the global reset button (default true)
 *  show_searchbox_p - show the search query box (default true)
 *  show_filterbox_p - show currents filters and accordion (default true)
 *  show_pager_p - show the results pager (default true)
 * 
 * Arguments:
 *  golr_loc - string url to GOlr server; not needed if local
 *  golr_conf_obj - a <bbop.golr.conf> object
 *  interface_id - string id of the element to build on
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  self
 */
bbop.widget.search_pane = function(golr_loc, golr_conf_obj, interface_id,
				   in_argument_hash){

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('SP (widget): ' + str); }    

    bbop.golr.manager.jquery.call(this, golr_loc, golr_conf_obj);
    this._is_a = 'bbop.widget.search_pane';
    // ll("what_is (post: this.update): " + bbop.core.what_is(this.update));

    // ...
    var loop = bbop.core.loop;
    var anchor = this;

    // Our argument default hash.
    var default_hash =
    	{
    	    'base_icon_url' : null,
    	    'image_type' : 'gif',
    	    'layout_type' : 'two-column',
    	    'show_global_reset_p' : true,
    	    'show_searchbox_p' : true,
    	    'show_filterbox_p' : true,
    	    'show_pager_p' : true
    	};
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.core.fold(default_hash, folding_hash);

    // Pull args into variables.
    var base_icon_url = arg_hash['base_icon_url'];
    var image_type = arg_hash['image_type'];
    var layout_type = arg_hash['layout_type'];
    var show_global_reset_p = arg_hash['show_global_reset_p'];
    var show_searchbox_p = arg_hash['show_searchbox_p'];
    var show_filterbox_p = arg_hash['show_filterbox_p'];
    var show_pager_p = arg_hash['show_pager_p'];

    /*
     * Function: establish_display
     * 
     * Completely redraw the display.
     * 
     * Required to display after setting up the manager.
     * 
     * Also may be useful after a major change to the manager.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns
     *  n/a
     */
    this.establish_display = function(){
	
    	// Blow away whatever was there completely.
    	jQuery('#' + interface_id).empty();

    	// Can only make a display if there is a set
    	// personality--there is no general default and it is an
    	// error.
    	var personality = anchor.get_personality();
    	var cclass = golr_conf_obj.get_class(personality);
    	if( ! personality || ! cclass ){
    	    ll('ERROR: no personality set');
    	    throw new Error('ERROR: no personality set');
    	}

    	///
    	/// Setup UI and bind it to events.
    	///
	
    	// Create a new two column layout and a lot of hidden switches
    	// and variables.
    	var ui = null;
	if( layout_type == 'two-column' ){
	    ui = new bbop.widget.display.live_search(interface_id, cclass);
	}else{
    	    throw new Error('ERROR: unsupported layout type: ' + layout_type);
	}
	
    	// Things to do on every reset event. Essentially re-draw
    	// everything.
    	if( show_searchbox_p ){ // conditionally display search box stuff
    	    anchor.register('reset', 'reset_query', ui.reset_query, -1);
	}
    	if( show_global_reset_p ){ // conditionally show global reset button
    	    anchor.register('reset', 'global_reset_button',
    	    		    ui.reset_global_reset_button,-1);
    	}
    	if( show_filterbox_p ){ // conditionally display filter stuff
    	    anchor.register('reset', 'curr_first',
    			    ui.draw_current_filters, -1);
    	    anchor.register('reset', 'accordion_first',
    			    ui.draw_accordion, -1);
    	}
    	// We're always showing meta and results.
    	anchor.register('reset', 'meta_first', ui.draw_meta, -1);
    	anchor.register('reset', 'results_first', ui.draw_results, -1);
	
    	// Things to do on every search event.
    	if( show_filterbox_p ){ // conditionally display filter stuff
    	    anchor.register('search','curr_filters_std',
    			    ui.draw_current_filters);
    	    anchor.register('search', 'accordion_std', ui.draw_accordion);
    	}
    	// These will always be updated after a search.
    	anchor.register('search', 'meta_usual', ui.draw_meta);
    	anchor.register('search', 'results_usual', ui.draw_results);
	
    	// Things to do on an error.
    	anchor.register('error', 'results_unusual', ui.draw_error);	
	
    	// Setup the gross frames for the filters and results.
    	//ui.setup_reset_button();
    	if( show_searchbox_p ){ // conditionally display search box stuff
    	    ui.setup_query();
	}
    	if( show_global_reset_p ){ // conditionally show global reset button
	    ui.setup_global_reset_button();
	}
    	if( show_filterbox_p ){ // conditionally display filter stuff
    	    ui.setup_current_filters();
    	    ui.setup_accordion();
	}
    	ui.setup_results({'meta': show_pager_p});
	
    	// Start the ball with a reset event.
    	anchor.reset();
    };

    // Now let's run the above function as the initializer.
    // anchor.establish_display();
};
bbop.core.extend(bbop.widget.search_pane, bbop.golr.manager.jquery);
