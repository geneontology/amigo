////////////
////
//// bbop.amigo
////
//// Purpose: Provide methods for accessing AmiGO/GO-related web
////          resources from the host server. A loose analog to
////          the perl AmiGO.pm top-level.
////
//// This module should contain nothing to do with the DOM, but
//// rather methods to access and make sense of resources provided by
//// AmiGO and its related services on the host.
////
//// Taken name spaces:
////    bbop.amigo.DEBUG // variable
////    bbop.amigo
////                     + .response
////                     + .link
////    bbop.amigo.json
////
//////////

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('bbop', 'amigo');

// Links to useful things back on AmiGO.
bbop.amigo = function(){

    // ///
    // /// Generalized complaining.
    // /// 

    // // We'll start with print because we're doing stuff from the
    // // command line in smjs, but we'll work our way out and see if we
    // // have a browser environment.
    // var sayer = function(){};
    // var ender = '';

    // // Check for: Opera, FF, Safari, etc.
    // if( typeof(opera) != 'undefined' &&
    // 	typeof(opera.postError) != 'undefined' ){
    // 	sayer = opera.postError;
    // 	ender = "\n";
    // }else if( typeof(window) != 'undefined' &&
    // 	      typeof(window.dump) != 'undefined' ){
    // 	// From developer.mozilla.org: To see the dump output you have
    // 	// to enable it by setting the preference
    // 	// browser.dom.window.dump.enabled to true. You can set the
    // 	// preference in about:config or in a user.js file. Note: this
    // 	// preference is not listed in about:config by default, you
    // 	// may need to create it (right-click the content area -> New
    // 	// -> Boolean).
    // 	sayer = dump;
    // 	ender = "\n";
    // }else if( typeof(window) != 'undefined' &&
    // 	      typeof(window.console) != 'undefined' &&
    // 	      typeof(window.console.log) != 'undefined' ){
    // 	// From developer.apple.com: Safari's "Debug" menu allows you to
    // 	// turn on the logging of JavaScript errors. To display the
    // 	// debug menu in Mac OS X, open a Terminal window and type:
    // 	// "defaults write com.apple.Safari IncludeDebugMenu 1"
    // 	// Need the wrapper function because safari has personality
    // 	// problems.
    // 	sayer = function(msg){ window.console.log(msg); };
    // 	ender = "\n";
    // }else if( typeof(console) != 'undefined' &&
    // 	      typeof(console.log) != 'undefined' ){
    // 	// This may be okay for Chrome...
    // 	sayer = console.log;
    // 	ender = "\n";
    // }else if( typeof(build) == 'function' &&
    // 	      typeof(getpda) == 'function' &&
    // 	      typeof(pc2line) == 'function' &&
    // 	      typeof(print) == 'function' ){
    // 	// This may detect SpiderMonkey on the comand line.
    // 	sayer = print;
    // 	ender = "";
    // }

    // this.kvetch = function(string){
    // 	if( bbop.amigo.DEBUG == true ){
    // 	    sayer(string + ender);
    // 	}
    // };

    ///
    /// GOlr response checking (after parsing).
    ///

    this.golr_response = {};

    // Simple return verification.
    this.golr_response.success = function(robj){
	var retval = false;
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
		retval = true;
	    }
	return retval;
    };

    // Get the parameter chunk--variable stuff we put in.
    this.golr_response.parameters = function(robj){
	return robj.responseHeader.params;
    };

    // ...
    this.golr_response.row_step = function(robj){	
	return parseInt(robj.responseHeader.params.rows);
    };

    // ...
    function _golr_response_total_documents(robj){
	return parseInt(robj.response.numFound);
    }
    this.golr_response.total_documents = _golr_response_total_documents;

    // ...
    function _golr_response_start_document(robj){
	//return parseInt(robj.response.start) + 1;
	return parseInt(robj.response.start);
    }
    this.golr_response.start_document = _golr_response_start_document;

    // ...
    this.golr_response.end_document = function(robj){
	return _golr_response_start_document(robj) +
	    parseInt(robj.response.docs.length);
    };

    // ...
    this.golr_response.documents = function(robj){
	return robj.response.docs;
    };

    // // ...
    // this.golr_response.facet_fields = function(robj){
    // 	return _get_hash_keys(robj.facet_counts.facet_fields);
    // };

    this.golr_response.facet_counts = function(robj, in_field){

	var ret_hash = {};

	var facet_list = _get_hash_keys(robj.facet_counts.facet_fields);
	for( var fli = 0; fli < facet_list.length; fli++ ){
	    
	    var facet_name = facet_list[fli];
	    if( ! ret_hash[facet_name] ){
		ret_hash[facet_name] = {};		
	    }

	    var facet_counts = robj.facet_counts.facet_fields[facet_name];
	    for( var tc = 0; tc < facet_counts.length; tc = tc + 2 ){
		var faspect = facet_counts[tc];
		var fcount = facet_counts[tc + 1];
		ret_hash[facet_name][faspect] = fcount;
	    }
	}

	return ret_hash;
    };

    // TODO: fq can be irritating single value or irritating array
    this.golr_response.query_filters = function(robj){

	//sayer('fq 1a: ' + robj + "\n");
	//sayer('fq 1b: ' + typeof(robj) + "\n");
	//sayer('fq 2a: ' + robj.responseHeader + "\n");
	//sayer('fq 2b: ' + typeof(robj.responseHeader) + "\n");

	var ret_hash = {};
	if( robj.responseHeader.params &&
	    robj.responseHeader.params.fq ){

		//sayer('fq in' + "\n");

		var process_list = [];

		// Check to see if it's not an array and copy it to be
		// one. Otherwise, copy over the array contents.
		if( typeof robj.responseHeader.params.fq == 'string'){
		    process_list.push(robj.responseHeader.params.fq);
		    //sayer('fq adjust for single' + "\n");
		}else{
		    for( var fqi = 0;
			 fqi < robj.responseHeader.params.fq.length;
			 fqi++ ){
			     var new_bit = robj.responseHeader.params.fq[fqi];
			     process_list.push(new_bit);
			 }
		}
		    
		//sayer('fq go through adjusted incoming' + "\n");

		// Make the return fq more tolerable.
		for( var pli = 0; pli < process_list.length; pli++ ){
		    var list_item = process_list[pli];

		    //sayer('fq process ' + list_item + "\n");

		    // Split on the colon.
		    var splits = list_item.split(":");
		    var type = splits.shift();
		    var value = splits.join(":");

		    if( ! ret_hash[type] ){
			ret_hash[type] = {};
		    }

		    // Remove internal quotes.
		    // Actually, I want just the first quote and the
		    // final quote.
		    if( value.charAt(0) == '"' &&
			value.charAt(value.length -1) == '"' ){
			    //sayer('fq needs cropping: ' + value + "\n");
			    value = value.substring(1, value.length -1);
			    //sayer('fq cropped to: ' + value + "\n");
			}


		    ret_hash[type][value] = true;

		    //sayer('fq done: ' + type + ':' + value + ":true\n");
		}
	    }else{
		//ll('fq out');
	    }

    	return ret_hash;
    };

    ///
    /// General AmiGO AJAX response checking (after parsing).
    ///

    this.response = {};

    // Check to see if the server thinks we were successful.
    this.response.success = function(robj){
	var retval = false;
	if( robj && robj.success && robj.success == 1 ){
	    retval = true;
	}
	return retval;
    };

    // Check to see what the server thinks about its own condition.
    this.response.type = function(robj){
	var retval = 'unknown';
	if( robj && robj.type ){
	    retval = robj.type;
	}
	return retval;
    };

    // Check to see if the server thinks the data was successful.
    this.response.errors = function(robj){
	var retval = new Array();
	if( robj && robj.errors ){
	    retval = robj.errors;
	}
	return retval;
    };

    // Check to see if the server thinks the data was correct.
    this.response.warnings = function(robj){
	var retval = new Array();
	if( robj && robj.warnings ){
	    retval = robj.warnings;
	}
	return retval;
    };

    // Get the results chunk.
    this.response.results = function(robj){
	var retval = {};
	if( robj && robj.results ){
	    retval = robj.results;
	}
	return retval;
    };

    // Get the arguments chunk.
    this.response.arguments = function(robj){
	var retval = {};
	if( robj && robj.arguments ){
	    retval = robj.arguments;
	}
	return retval;
    };

    ///
    /// Workspaces' linking.
    ///

    function _abstract_head_template(head){
	return head + '?';
    }

    // Convert a hash (with possible arrays as arguments) into a link
    // string.
    // NOTE: Non-recursive--there are some interesting ways to create
    // cyclic graph hashes in SpiderMonkey, and I'd rather not think
    // about it right now.
    function _abstract_segment_template(segments){
	
	var maxibuf = new Array();
	for( var segkey in segments ){

	    var segval = segments[segkey];

	    // If the value looks like an array, iterate over it and
	    // collect.
	    if( segval &&
		segval != null &&
		typeof segval == 'object' &&
		segval.length ){

		for( var i = 0; i < segval.length; i++ ){
		    var minibuf = new Array();
		    minibuf.push(segkey);
		    minibuf.push('=');
		    minibuf.push(segval[i]);
		    maxibuf.push(minibuf.join(''));
		}

	    }else{
		var minibuf = new Array();
		minibuf.push(segkey);
		minibuf.push('=');
		minibuf.push(segval);
		maxibuf.push(minibuf.join(''));
	    }
	}
	return maxibuf.join('&');
    }

    // Similar to the above, but creating a solr filter set.
    function _abstract_solr_filter_template(filters){
	
	var allbuf = new Array();
	for( var filter_key in filters ){

	    var filter_val = filters[filter_key];

	    // If the value looks like an array, iterate over it and
	    // collect.
	    if( filter_val &&
		filter_val != null &&
		typeof filter_val == 'object' &&
		filter_val.length ){

		    for( var i = 0; i < filter_val.length; i++ ){
			var minibuf = new Array();
			var try_val = filter_val[i];
			if( typeof(try_val) != 'undefined' &&
			try_val != '' ){
			    minibuf.push('fq=');
			    minibuf.push(filter_key);
			    minibuf.push(':');
			    minibuf.push('"');
			    minibuf.push(filter_val[i]);
			    minibuf.push('"');
			    allbuf.push(minibuf.join(''));
			}
		    }		    
		}else{
		    var minibuf = new Array();
		    if( typeof(filter_val) != 'undefined' &&
			filter_val != '' ){
			    minibuf.push('fq=');
			    minibuf.push(filter_key);
			    minibuf.push(':');
			    minibuf.push('"');
			    minibuf.push(filter_val);
			    minibuf.push('"');
			    allbuf.push(minibuf.join(''));
			}
		}
	}
	return allbuf.join('&');
    }

    // Construct the templates using head and segments.
    function _abstract_link_template(head, segments){	
	return _abstract_head_template(head) +
	    _abstract_segment_template(segments);
    }

    // // Construct the templates using the segments.
    // function _navi_client_template(segments){
    // 	segments['mode'] = 'layers_graph';
    // 	return _abstract_link_template('amigo_exp', segments);
    // }

    // // Construct the templates using the segments.
    // function _navi_data_template(segments){
    // 	segments['mode'] = 'navi_js_data';
    // 	return _abstract_link_template('aserve_exp', segments);
    // }

    // Construct the templates using the segments.
    function _ws_template(segments){
	segments['mode'] = 'workspace';
	return _abstract_link_template('amigo_exp', segments);
    }

    // // Construct the templates using the segments.
    // function _ls_assoc_template(segments){
    // 	segments['mode'] = 'live_search_association';
    // 	return _abstract_link_template('aserve', segments);
    // }
    // function _ls_gp_template(segments){
    // 	segments['mode'] = 'live_search_gene_product';
    // 	return _abstract_link_template('aserve', segments);
    // }
    // function _ls_term_template(segments){
    // 	segments['mode'] = 'live_search_term';
    // 	return _abstract_link_template('aserve', segments);
    // }

    // // Construct the templates using the segments.
    // function _completion_template(segments){
    // 	return _abstract_link_template('completion', segments);
    // }

    // // Construct the templates using the segments.
    // function _nmatrix_template(segments){
    // 	segments['mode'] = 'nmatrix';
    // 	return _abstract_link_template('amigo_exp', segments);
    // }

    this.util = {};
    this.api = {};
    this.link = {};
    this.html = {};

    // Crop a string to a certain limit and add ellipses.
    this.util.crop = function(str, lim){
	var ret = str;
	var limit = 10;
	if( lim ){ limit = lim; }
	if( str.length > limit ){
	    ret = str.substring(0, (limit - 3)) + '...';
	}
	return ret;
    };

    // Merge a pair of hashes, using the first as default and template.
    function _merge(default_hash, arg_hash){

	if( ! default_hash ){ default_hash = {}; }
	if( ! arg_hash ){ arg_hash = {}; }

	var ret_hash = {};
	for( var key in default_hash ){
	    if( arg_hash[key] ){
		ret_hash[key] = arg_hash[key];
	    }else{
		ret_hash[key] = default_hash[key];
	    }
	}
	return ret_hash;
    };
    this.util.merge = _merge;

    // Get the hash keys from a hash.
    function _get_hash_keys (arg_hash){

	if( ! arg_hash ){ arg_hash = {}; }
	var out_keys = [];
	for (var out_key in arg_hash) {
	    if (arg_hash.hasOwnProperty(out_key)) {
		out_keys.push(out_key);
	    }
	}

	return out_keys;
    };
    this.util.get_hash_keys = _get_hash_keys;

    // Clone a thing down to its atoms.
    function _clone_object(thing){

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
		    clone[h] = _clone_object(thing[h]);
		}
	    }else{
		// Looks like an array!
		//print("looks like an array");
		clone = [];
		for(var i = 0; i < thing.length; i++){
		    clone[i] = _clone_object(thing[i]);
		}
	    }
	}else{
	    // Then I don't know what it is--might be platform dep.
	    //print("no idea what it is");
	}
	return clone;
    };
    this.util.clone = _clone_object;

    // Random number generator of fixed length.
    // Return a randome number string of length len.
    var random_base =
	['1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
	 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    function _randomness(len){
	var length = 10;
	if( len ){
	    length = len;
	}
	var cache = new Array();
	for( var ii = 0; ii < length; ii++ ){
	    var rbase_index = Math.floor(Math.random() * random_base.length);
	    cache.push(random_base[rbase_index]);
	}
	return cache.join('');
    };
    this.util.randomness = _randomness;

    // Functions to encode and decode data that we'll be hiding
    // in the element ids. This is a 
    this.util.coder = function(args){

	var mangle_base_string = "org_bbop_amigo_coder_mangle_";
	var mangle_base_space_size = 10;

	var defs = {string: mangle_base_string, size: mangle_base_space_size};
	var final_args = _merge(defs, args);
	var mangle_str = final_args['string'];
	var space_size = final_args['size'];

	// TODO/BUG: apparently, html ids can only be of a limited
	// character set.
	//var en_re = new RegExp("/:/", "gi");
	//var de_re = new RegExp("/-_-/", "gi");
	this.encode = function(str){
	    // Mangle and encode.
	    var new_str = mangle_str + _randomness(space_size) +'_'+ str;
	    // TODO:
	    // str.replace(en_re, "-_-");
	    return new_str;
	};
	this.decode = function(str){	    
	    // Decode and demangle.
	    var new_str = str.substring(mangle_str.length + space_size + 1);
	    // TODO:
	    // str.replace(de_re, ":");
	    return new_str;
	};
    };

    //     // Some handling for a workspace object once we get one.
    //     this.util.workspace = {};
    //     this.util.workspace.get_terms = function(ws){
    // 	var all_terms = new Array();
    // 	for( var t = 0; t < ws.length; t++ ){
    // 	    var item = ws[t];
    // 	    if( item.type == 'term' ){
    // 		all_terms.push(item.key);
    // 	    }
    // 	}
    // 	return all_terms;
    //     };

    ///
    /// JSON? JS? API functions for workspaces.
    ///

    this.api.workspace = {};

    this.api.workspace.remove = function(ws_name){
	return _ws_template({
	    action: 'remove_workspace',
	    workspace: ws_name
	});
    };
    this.api.workspace.add = function(ws_name){
	return _ws_template({
	    action: 'add_workspace',
	    workspace: ws_name
	});
    };
    this.api.workspace.copy = function(ws_from_name, ws_to_name){
	return _ws_template({
	    action: 'copy_workspace',
	    workspace: ws_from_name,
	    copy_to_workspace: ws_to_name
	});
    };
    this.api.workspace.clear = function(ws_name){
	return _ws_template({
	    action: 'clear_workspace',
	    workspace: ws_name
	});
    };
    this.api.workspace.list = function(ws_name){
	return _ws_template({
	    action: 'list_workspaces',
	    workspace: ws_name
	});
    };

    // API functions for workspace items.
    //     this.api.workspace.add_item = function(ws_name, key, type, name){
    this.api.workspace.add_item = function(ws_name, key, name){
	return _ws_template({
	    action: 'add_item',
	    workspace: ws_name,
	    key: key,
            // type: type,
	    name: name
	});
    };
    this.api.workspace.remove_item = function(ws_name, key){
	return _ws_template({
	    action: 'remove_item',
	    workspace: ws_name,
	    key: key
	});
    };
    this.api.workspace.list_items = function(ws_name){
	return _ws_template({
	    action: 'list_items',
	    workspace: ws_name
	});
    };

    // Just the workspace and item status. Essentially do nothing and
    // link to the current session status.
    this.api.workspace.status = function(){
	return _ws_template({ action: '' });
    };

    ///
    /// API function for completion/search information.
    ///

    this.api.completion = function(args){

	var format = 'amigo';
	var type = 'general';
	var ontology = null;
	var narrow = 'false';
	var query = '';
	if( args ){
	    if( args['format'] ){ format = args['format']; }
	    if( args['type'] ){ type = args['type']; }
	    if( args['ontology'] ){ontology = args['ontology']; }
	    if( args['narrow'] ){narrow = args['narrow']; }
	    if( args['query'] ){query = args['query']; }
	}

	return _completion_template({format: format,
				     type: type,
				     ontology: ontology,
				     narrow: narrow,
				     query: encodeURIComponent(query)});
    };

    ///
    /// API functions for live search.
    ///
    this.api.live_search = {};

    // General search:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=
    // Facet on date:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=&facet=true&facet.field=date    
    this.api.live_search.golr = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_query_args =
	    {
		// TODO/BUG? need jsonp things here?
		qt: 'standard',
		indent: 'on',
		wt: 'json',
		version: '2.2',
		rows: 10,
		//start: 1,
		start: 0, // Solr is offset indexing
		fl: '*%2Cscore',

		// Control of facets.
		facet: '',
		'facet.field': [],

		// Facet filtering.
		fq: [],

		// Query-type stuff.
		q: '',

		// Our bookkeeping.
		packet: 0
	    };
	var final_query_args = _merge(default_query_args, in_args);
		
	var default_filter_args =
	    {
		// Filter stuff.
		document_category: [],
		type: [],
		source: [],
		taxon: [],
		evidence_type: [],
		evidence_closure: [],
		isa_partof_label_closure: [],
		annotation_extension_class_label: [],
		annotation_extension_class_label_closure: []
	    };
	var final_filter_args = _merge(default_filter_args, in_args);

	// ...
	//return _abstract_link_template('select', segments);	
	var complete_query = _abstract_head_template('select') +
	    _abstract_segment_template(final_query_args);
	var addable_filters = _abstract_solr_filter_template(final_filter_args);
	if( addable_filters.length > 0 ){
	    complete_query = complete_query + '&' + addable_filters;
	}
	return complete_query;
    };

    ///
    /// API functions for the ontology.
    ///
    this.api.ontology = {};
    this.api.ontology.roots = function(){
	return _abstract_link_template('aserve_exp', {'mode': 'ontology'});
    };

    ///
    /// API functions for navi js data.
    ///

    this.api.navi_js_data = function(args){

	if( ! args ){ args = {}; }

	var final_args = {};

	// Transfer the name/value pairs in opt_args into final args
	// if extant.
	var opt_args = ['focus', 'zoom', 'lon', 'lat'];
	//var opt_args_str = '';
	for( var oa = 0; oa < opt_args.length; oa++ ){
	    var arg_name = opt_args[oa];
	    if( args[arg_name] ){
		// opt_args_str =
		// opt_args_str + '&' + arg_name + '=' + args[arg_name];
		final_args[arg_name] = args[arg_name];
	    }
	}

	//
	var terms_buf = new Array();
	if( args.terms &&
	    args.terms.length &&
	    args.terms.length > 0 ){

	    //
	    for( var at = 0; at < args.terms.length; at++ ){
		terms_buf.push(args.terms[at]);
	    } 
	}
	final_args['terms'] = terms_buf.join(' '); 

	return _navi_data_template(final_args);
    };

    ///
    /// Links for terms and gene products.
    ///

    function _term_link(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = _merge(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'term_details?term=' + acc;
	return 'amigo?mode=golr_term_details&term=' + acc;
    };
    this.link.term = _term_link;

    // BUG/TODO: should this actually be in widgets? How core is this
    // convenience?
    this.html.term_link = function(acc, label){
	if( ! label ){ label = acc; }
	return '<a title="Go to term details page for ' + label +
	    '." href="' + _term_link({acc: acc}) + '">' + label +'</a>';
    };

    function _gene_product_link(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = _merge(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'gp-details.cgi?gp=' + acc;
	return 'amigo?mode=golr_gene_product_details&gp=' + acc;
    };
    this.link.gene_product = _gene_product_link;

    // BUG/TODO: should this actually be in widgets? How core is this
    // convenience?
    this.html.gene_product_link = function(acc, label){
	if( ! label ){ label = acc; }
	return '<a title="Go to gene product details page for ' + label +
	    '." href="' + _gene_product_link({acc: acc}) + '">' + label +'</a>';
    };

    ///
    /// Links for term product associations.
    ///

    this.link.term_assoc = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: '',
		speciesdb: [],
		taxid: []
	    };
	var final_args = _merge(default_args, in_args);
	var acc = final_args['acc'];
	var speciesdbs = final_args['speciesdb'];
	var taxids = final_args['taxid'];

	//
	var spc_fstr = speciesdbs.join('&speciesdb');
	var tax_fstr = taxids.join('&taxid=');
	//core.kvetch('LINK SRCS: ' + spc_fstr);
	//core.kvetch('LINK TIDS: ' + tax_fstr);

	return 'term-assoc.cgi?term=' + acc +
	    '&speciesdb=' + spc_fstr +
	    '&taxid=' + tax_fstr;
    };

    ///
    /// Link function for blast.
    ///

    this.link.single_blast = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = _merge(default_args, in_args);
	
	var acc = final_args['acc'];
	return 'blast.cgi?action=blast&seq_id=' + acc;
    };

    ///
    /// Link function for term enrichment.
    ///

    this.link.term_enrichment = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		gp_list: [] 
	    };
	var final_args = _merge(default_args, in_args);
	
	var acc = final_args['acc'];
	return 'term_enrichment?' +
	    'gp_list=' + final_args['gp_list'].join(' ');
    };

    ///
    /// Link function for slimmer.
    ///

    this.link.slimmer = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		gp_list: [], 
		slim_list: []
	    };
	var final_args = _merge(default_args, in_args);
	
	return 'slimmer?' +
	    'gp_list=' + final_args['gp_list'].join(' ') +
	    '&slim_list=' + final_args['slim_list'].join(' ');
    };

    ///
    /// Link function for N-Matrix.
    ///

    this.link.nmatrix = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		term_set_1: '',
		term_set_2: ''
	    };
	var final_args = _merge(default_args, in_args);

	//
	var terms_buf = new Array();
	if( in_args.terms &&
	    in_args.terms.length &&
	    in_args.terms.length > 0 ){

		//
	    for( var at = 0; at < in_args.terms.length; at++ ){
		terms_buf.push(in_args.terms[at]);
	    } 
	}
	final_args['term_set_1'] = terms_buf.join(' '); 
	final_args['term_set_2'] = terms_buf.join(' '); 

	return _nmatrix_template(final_args);
    };

    ///
    /// Link functions for navi client (bookmark).
    ///

    this.link.layers_graph = function(args){

	//
	var final_args = {};
	if( args['lon'] &&
	    args['lat'] &&
	    args['zoom'] &&
	    args['focus'] ){

	    //
	    final_args['lon'] = args['lon'];
	    final_args['lat'] = args['lat'];
	    final_args['zoom'] = args['zoom'];
	    final_args['focus'] = args['focus'];
	}

	if( args['terms'] &&
	    args['terms'].length &&
	    args['terms'].length > 0 ){

	    //
	    var aterms = args['terms'];
	    var terms_buf = new Array();
	    for( var at = 0; at < aterms.length; at++ ){
		terms_buf.push(aterms[at]);
	    }
	    final_args['terms'] = terms_buf.join(' '); 
	}
	
	return _navi_client_template(final_args);
    };

    // TODO:
};
