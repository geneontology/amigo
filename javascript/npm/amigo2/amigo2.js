// If it looks like we're in an environment that supports CommonJS
// Modules 1.0, bbop-js might not be extant in this namespace. Try and
// get at it. Otherwise, if we're in browser-land, it should be
// included in the global and we can proceed.
if( typeof(exports) != 'undefined' ){
    var bbop = require('bbop').bbop;
}
/* 
 * Package: version.js
 * 
 * Namespace: amigo.version
 * 
 * This package was automatically generated during the build process
 * and contains its version information--this is the release of the
 * API that you have.
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.version == "undefined" ){ amigo.version = {}; }

/*
 * Variable: revision
 *
 * Partial version for this library; revision (major/minor version numbers)
 * information.
 */
amigo.version.revision = "2.2.0";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
amigo.version.release = "20140730";
/*
 * Package: api.js
 * 
 * Namespace: amigo.api
 * 
 * Core for AmiGO 2 remote functionality.
 * 
 * Provide methods for accessing AmiGO/GO-related web resources from
 * the host server. A loose analog to the perl AmiGO.pm top-level.
 * 
 * This module should contain nothing to do with the DOM, but rather
 * methods to access and make sense of resources provided by AmiGO and
 * its related services on the host.
 * 
 * WARNING: This changes very quickly as parts get spun-out into more
 * stable packages.
 */

// Module and namespace checking.
if( typeof amigo == "undefined" ){ var amigo = {}; }

/*
 * Constructor: api
 * 
 * Contructor for the AmiGO API object.
 * Hooks to useful things back on AmiGO.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  AmiGO object
 */
amigo.api = function(){

    ///
    /// General AmiGO (perl server) AJAX response checking (after
    /// parsing).
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
		    var minibuffer = new Array();
		    minibuffer.push(segkey);
		    minibuffer.push('=');
		    minibuffer.push(segval[i]);
		    maxibuf.push(minibuffer.join(''));
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
			var minibuffer = new Array();
			var try_val = filter_val[i];
			if( typeof(try_val) != 'undefined' &&
			try_val != '' ){
			    minibuffer.push('fq=');
			    minibuffer.push(filter_key);
			    minibuffer.push(':');
			    minibuffer.push('"');
			    minibuffer.push(filter_val[i]);
			    minibuffer.push('"');
			    allbuf.push(minibuffer.join(''));
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

    // Construct the templates using the segments.
    function _completion_template(segments){
    	return _abstract_link_template('completion', segments);
    }

    // // Construct the templates using the segments.
    // function _nmatrix_template(segments){
    // 	segments['mode'] = 'nmatrix';
    // 	return _abstract_link_template('amigo_exp', segments);
    // }

    this.api = {};
    this.link = {};
    this.html = {};

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

    this.workspace = {};

    this.workspace.remove = function(ws_name){
	return _ws_template({
	    action: 'remove_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.add = function(ws_name){
	return _ws_template({
	    action: 'add_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.copy = function(ws_from_name, ws_to_name){
	return _ws_template({
	    action: 'copy_workspace',
	    workspace: ws_from_name,
	    copy_to_workspace: ws_to_name
	});
    };
    this.workspace.clear = function(ws_name){
	return _ws_template({
	    action: 'clear_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.list = function(ws_name){
	return _ws_template({
	    action: 'list_workspaces',
	    workspace: ws_name
	});
    };

    // API functions for workspace items.
    //     this.workspace.add_item = function(ws_name, key, type, name){
    this.workspace.add_item = function(ws_name, key, name){
	return _ws_template({
	    action: 'add_item',
	    workspace: ws_name,
	    key: key,
            // _t_y_p_e_: _t_y_p_e_, // prevent naturaldocs from finding this
	    name: name
	});
    };
    this.workspace.remove_item = function(ws_name, key){
	return _ws_template({
	    action: 'remove_item',
	    workspace: ws_name,
	    key: key
	});
    };
    this.workspace.list_items = function(ws_name){
	return _ws_template({
	    action: 'list_items',
	    workspace: ws_name
	});
    };

    // Just the workspace and item status. Essentially do nothing and
    // link to the current session status.
    this.workspace.status = function(){
	return _ws_template({ action: '' });
    };

    ///
    /// API function for completion/search information.
    ///

    this.completion = function(args){

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
    this.live_search = {};

    // General search:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=
    // Facet on date:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=&facet=true&facet.field=date    
    this.live_search.golr = function(in_args){

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
	var final_query_args = bbop.core.fold(default_query_args, in_args);
		
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
	var final_filter_args = bbop.core.fold(default_filter_args, in_args);

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
    this.ontology = {};
    this.ontology.roots = function(){
	return _abstract_link_template('aserve_exp', {'mode': 'ontology'});
    };

    ///
    /// API functions for navi js data.
    ///

    this.navi_js_data = function(args){

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
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'term_details?term=' + acc;
	return 'amigo?mode=golr_term_details&term=' + acc;
    }
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
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'gp-details.cgi?gp=' + acc;
	return 'amigo?mode=golr_gene_product_details&gp=' + acc;
    }
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
	var final_args = bbop.core.fold(default_args, in_args);
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
	var final_args = bbop.core.fold(default_args, in_args);
	
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
	var final_args = bbop.core.fold(default_args, in_args);
	
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
	var final_args = bbop.core.fold(default_args, in_args);
	
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
	var final_args = bbop.core.fold(default_args, in_args);

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
/* 
 * Package: linker.js
 * 
 * Namespace: amigo.linker
 * 
 * Generic AmiGO link generator, fed by <amigo.data.server> for local
 * links and <amigo.data.xrefs> for non-local links.
 * 
 * NOTE: A lot of this is lifted from the (defunct) amigo2.js
 * package. However, the future should be here.
 */

// Module and namespace checking.
if( typeof amigo == "undefined" ){ var amigo = {}; }

/*
 * Constructor: linker
 * 
 * Create an object that can make URLs and/or anchors.
 * 
 * These functions have a well defined interface so that other
 * packages can use it.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  self
 */
amigo.linker = function (){
    this._is_a = 'amigo.linker';

    // With the new dispatcher, relative URLs no longer work, so we
    // have to bring in server data--first let's ensure it.
    if( ! amigo.data.server ){
	throw new Error('we are missing access to amigo.data.server!');
    }
    // Easy app base.
    var sd = new amigo.data.server();
    this.app_base = sd.app_base();
    // Internal term matcher.
    this.term_regexp = null;
    var internal_regexp_str = sd.term_regexp();    
    if( internal_regexp_str ){
	this.term_regexp = new RegExp(internal_regexp_str);
    }

    // Categories for different special cases (internal links).
    this.ont_category = {
	'term': true,
	'ontology_class': true,
	'annotation_class': true,
	'annotation_class_closure': true,
	'annotation_class_list': true
    };
    this.bio_category = {
        'gp': true,
	'gene_product': true,
	'bioentity': true
    };
    this.complex_annotation_category = {
        //'complex_annotation': true,
        'annotation_group': true
        //'annotation_unit': true
    };
    this.search_category = { // not including the trivial medial_search below
        'search': true,
	'live_search': true
    };
    this.search_modifier = {
	// Possibly "dynamic".
	'gene_product': '/bioentity',
	'bioentity': '/bioentity',
	'ontology': '/ontology',
	'annotation': '/annotation',
	'complex_annotation': '/complex_annotation',
	'family': '/family',
	'lego_unit': '/lego_unit',
	'general': '/general'
    };
    this.other_interlinks = {
	'medial_search': '/amigo/medial_search',
	'landing': '/amigo/landing',
	'tools': '/amigo/software_list',
	'schema_details': '/amigo/schema_details',
	'load_details': '/amigo/load_details',
	'browse': '/amigo/browse',
	'goose': '/goose',
	'grebe': '/grebe',
	'gannet': '/gannet',
	'repl': '/repl'	
    };
};

/*
 * Function: url
 * 
 * Return a url string.
 * 
 * Arguments:
 *  args - id
 *  xid - *[optional]* an internal transformation id
 *  modifier - *[optional]* modify xid; only used with xid
 * 
 * Returns:
 *  string (url); null if it couldn't create anything
 */
amigo.linker.prototype.url = function (id, xid, modifier){
    
    var retval = null;

    ///
    /// AmiGO hard-coded internal link types.
    ///

    // For us, having an xid means that we will be doing some more
    // complicated routing.
    if( xid && xid != '' ){

	// First let's do the ones that need an associated id to
	// function--either data urls or searches.
	if( id && id != '' ){
	    if( this.ont_category[xid] ){
		retval = this.app_base + '/amigo/term/' + id;
		//retval = _add_restmark_modifier(retval, modifier);
            }else if( this.bio_category[xid] ){
		retval = this.app_base + '/amigo/gene_product/' + id;
		//retval = _add_restmark_modifier(retval, modifier);
            }else if( this.complex_annotation_category[xid] ){
		retval = this.app_base + '/amigo/complex_annotation/'+ id;
            }else if( this.search_category[xid] ){

		// First, try and get the proper path out. Will
		// hardcode for now since some paths don't map
		// directly to the personality.
		var search_path = '';
		if( this.search_modifier[modifier] ){
		    search_path = this.search_modifier[modifier];
		}
		
		retval = this.app_base + '/amigo/search' + search_path;
		if( id ){
		    // Ugh...decide if the ID indicated a restmark or
		    // a full http action bookmark.
		    var http_re = new RegExp("^http");
		    if( http_re.test(id) ){
			// HTTP bookmark.
			retval = retval + '?bookmark='+ id;
		    }else{
			// minimalist RESTy restmark.
			retval = retval + '?' + id;
		    }
		}
	    }
	}

	// Things that do not need an id to function--like just
	// popping somebody over to Grebe or the medial search.
	if( ! retval ){
	    if( this.other_interlinks[xid] ){
		var extension = this.other_interlinks[xid];
		retval = this.app_base + extension;

		// Well, for medial search really, but it might be
		// general?
		if( xid == 'medial_search' ){
		    // The possibility of just tossing back an empty
		    // search for somebody downstream to fill in.
		    if( bbop.core.is_defined(id) && id != null ){
			retval = retval + '?q=' + id;
		    }
		}
	    }
	}
    }

    ///
    /// External resources. For us, if we haven't found something
    /// so far, try the data xrefs.
    ///
    
    // Since we couldn't find anything with our explicit local
    // transformation set, drop into the great abyss of the xref data.
    if( ! retval && id && id != '' ){ // not internal, but still has an id
	if( ! amigo.data.xrefs ){
	    throw new Error('amigo.data.xrefs is missing!');
	}
	
	// First, extract the probable source and break it into parts.
	var full_id_parts = bbop.core.first_split(':', id);
	if( full_id_parts && full_id_parts[0] && full_id_parts[1] ){
	    var src = full_id_parts[0];
	    var sid = full_id_parts[1];
	    
	    // Now, check to see if it is indeed in our store.
	    var lc_src = src.toLowerCase();
	    var xref = amigo.data.xrefs[lc_src];
	    if( xref && xref['url_syntax'] ){
		retval =
		    xref['url_syntax'].replace('[example_id]', sid, 'g');
	    }
	}
    }
    
    return retval;
};

/*
 * Function: anchor
 * 
 * Return a link as a chunk of HTML, all ready to consume in a
 * display.
 * 
 * Arguments:
 *  args - hash--'id' required; 'label' and 'hilite' are inferred if not extant
 *  xid - *[optional]* an internal transformation id
 *  rest - *[optional]* modify xid; only used with xid
 * 
 * Returns:
 *  string (link); null if it couldn't create anything
 */
amigo.linker.prototype.anchor = function(args, xid, modifier){
    
    var anchor = this;
    var retval = null;

    // Don't even start if there is nothing.
    if( args ){

	// Get what fundamental arguments we can.
	var id = args['id'];
	if( id ){
	
	    // Infer label from id if not present.
	    var label = args['label'];
	    if( ! label ){ label = id; }
	
	    // Infer hilite from label if not present.
	    var hilite = args['hilite'];
	    if( ! hilite ){ hilite = label; }
	
	    // See if the URL is legit. If it is, make something for it.
	    var url = this.url(id, xid, modifier);
	    if( url ){
		
		// First, see if it is one of the internal ones we know about
		// and make something special for it.
		if( xid ){
		    if( this.ont_category[xid] ){
		    
			// Possible internal/external detection here.
			// var class_str = ' class="amigo-ui-term-internal" ';
			var class_str = '';
			var title_str = 'title="' + // internal default
			id + ' (go to the term details page for ' +
			    label + ')"';
			if( this.term_regexp ){
			    if( this.term_regexp.test(id) ){
			    }else{
				class_str = ' class="amigo-ui-term-external" ';
				title_str = ' title="' +
				    id + ' (is an external term; click ' +
				    'to view our internal information for ' +
				    label + ')" ';
			    }
			}
			
			//retval = '<a title="Go to the term details page for '+
 			retval = '<a ' + class_str + title_str +
			    ' href="' + url + '">' + hilite + '</a>';
		    }else if( this.bio_category[xid] ){
 			retval = '<a title="' + id +
			    ' (go to the details page for ' + label +
			    ')" href="' + url + '">' + hilite + '</a>';
		    }else if( this.search_category[xid] ){
			retval = '<a title="Reinstate bookmark for ' + label +
			    '." href="' + url + '">' + hilite + '</a>';
		    }
		}
		
		// If it wasn't in the special transformations, just make
		// something generic.
		if( ! retval ){
		    retval = '<a title="' + id +
			' (go to the page for ' + label +
			')" href="' + url + '">' + hilite + '</a>';
		}
	    }
	}
    }

    return retval;
};
/* 
 * Package: handler.js
 * 
 * Namespace: amigo.handler
 * 
 * Generic AmiGO handler (conforming to what /should/ be described in
 * the BBOP JS documentation), fed by <amigo.data.dispatch>.
 */

// Module and namespace checking.
if( typeof amigo == "undefined" ){ var amigo = {}; }

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
amigo.handler = function (){
    this._is_a = 'amigo.handler';

    var is_def = bbop.core.is_defined;

    // Let's ensure we're sane.
    if( ! is_def(amigo) ||
	! is_def(amigo.data) ||
	! is_def(amigo.data.dispatch) ){
	throw new Error('we are missing access to amigo.data.dispatch!');
    }

    // Okay, since trying functions into existance is slow, we'll
    // create a cache of strings to functions.
    this.mangle = bbop.core.uuid();
    this.string_to_function_map = {};
    this.entries = 0; // a little extra for debugging and testing
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
 *  data - the incoming thing to be handled
 *  name - the field name to be processed
 *  context - *[optional]* a string to add extra context to the call
 *  fallback - *[optional]* a fallback function to call in case nothing is found
 * 
 * Returns:
 *  string; null if it couldn't create anything
 */
amigo.handler.prototype.dispatch = function(data, name, context, fallback){
    
    // Aliases.
    var is_def = bbop.core.is_defined;

    // First, get the specific id for this combination.
    var did = name || '';
    did += '_' + this.mangle;
    if( context ){
	did += '_' + context;
    }

    // If the combination is not already in the map, fill it in as
    // best we can.
    if( ! is_def(this.string_to_function_map[did]) ){
	
	this.entries += 1;

	// First, try and get the most specific.
	if( is_def(amigo.data.dispatch[name]) ){

	    var field_hash = amigo.data.dispatch[name];
	    var function_string = null;

	    if( is_def(field_hash['context']) &&
		is_def(field_hash['context'][context]) ){
		// The most specific.
		function_string = field_hash['context'][context];
	    }else{
		// If the most specific cannot be found, try and get
		// the more general one.
		if( is_def(field_hash['default']) ){
		    function_string = field_hash['default'];
		}
	    }

	    // At the end of this section, if we don't have a string
	    // to resolve into a function, the data format we're
	    // working from is damaged.
	    if( function_string == null ){
		throw new Error('amigo.data.dispatch appears to be damaged!');
	    }
	    
	    // We have a string. Pop it into existance with eval.
	    var evalled_thing = eval(function_string);

	    // Final test, make sure it is a function.
	    if( ! is_def(evalled_thing) ||
		evalled_thing == null ||
		bbop.core.what_is(evalled_thing) != 'function' ){
		throw new Error('"' + function_string + '" did not resolve!');
	    }else{
		this.string_to_function_map[did] = evalled_thing;		
	    }

	}else if( is_def(fallback) ){
	    // Nothing could be found, so add the fallback if it is
	    // there.
	    this.string_to_function_map[did] = fallback;
	}else{
	    // Whelp, nothing there, so stick an indicator in.
	    this.string_to_function_map[did] = null;
	}
    }

    // We are now ensured that either we have a callable function or
    // null, so let's finish it--either the return value of the called
    // function or null.
    var retval = null;
    if( this.string_to_function_map[did] != null ){
	var cfunc = this.string_to_function_map[did];
	retval = cfunc(data, name, context);
    }
    return retval;
};
/* 
 * Package: echo.js
 * 
 * Namespace: amigo.handlers.echo
 * 
 * Static function handler for echoing inputs--really used for
 * teaching and testing.
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers == "undefined" ){ amigo.handlers = {}; }

/*
 * Function: echo
 * 
 * Applies bbop.core.dump to whatever comes in.
 * 
 * Parameters:
 *  thing
 * 
 * Returns:
 *  a string; it /will/ be a string
 * 
 * Also See: <bbop.handler>
 */
amigo.handlers.echo = function(thing, name, context){

    // Force a return string into existence.
    var retstr = null;
    try {
	retstr = bbop.core.dump(thing);
    } catch (x) {
	retstr = '';
    }

    // // Appaend any optional stuff.
    // var is_def = bbop.core.is_defined;
    // var what = bbop.core.what_is;
    // if( is_def(name) && what(name) == 'string' ){
    // 	retstr += ' (' + name + ')';
    // }
    // if( is_def(context) && what(context) == 'string' ){
    // 	retstr += ' (' + context + ')';
    // }

    return retstr;
};
/* 
 * Package: owl_class_expression.js
 * 
 * Namespace: amigo.handlers.owl_class_expression
 * 
 * Static function handler for displaying OWL class expression
 * results. To be used for GAF column 16 stuff.
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers == "undefined" ){ amigo.handlers = {}; }

/*
 * Function: owl_class_expression
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
amigo.handlers.owl_class_expression = function(in_owlo){

    var retstr = "";

    // // Add logging.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // //logger.DEBUG = false;
    // function ll(str){ logger.kvetch(str); }

    // Aliases.
    var is_def = bbop.core.is_defined;
    var what_is = bbop.core.what_is;
    var loop = bbop.core.each;

    var owlo = in_owlo;
    if( what_is(owlo) == 'string' ){
	// This should be an unnecessary robustness check as
	// everything /should/ be a legit JSON string...but things
	// happen in testing. We'll check to make sure that it looks
	// like what it should be as well.
	if( in_owlo.charAt(0) == '{' &&
	    in_owlo.charAt(in_owlo.length-1) == '}' ){
	    owlo = bbop.json.parse(in_owlo) || {};
	}else{
	    // Looks like a normal string string.
	    // Do nothing for now, but catch in the next section.
	}
    }

    // Check to make sure that it looks right.
    if( what_is(owlo) == 'string' ){
	// Still a string means bad happened--we want to see that.
	retstr = owlo + '?';
    }else if( ! is_def(owlo) ||
	      ! is_def(owlo['relationship']) ||
	      ! what_is(owlo['relationship']) == 'object' ||
	      ! what_is(owlo['relationship']['relation']) == 'array' ||
	      ! is_def(owlo['relationship']['id']) ||
	      ! is_def(owlo['relationship']['label']) ){
	// 'Twas an error--ignore.
	//throw new Error('sproing!');
    }else{
	
	//throw new Error('sproing!');
	var link = new amigo.linker();

	// Okay, right structure--first assemble the relationships,
	// then tag onto end.
	var rel_buff = [];
	bbop.core.each(owlo['relationship']['relation'],
		       function(rel){
			   // Check to make sure that these are
			   // structured correctly as well.
			   var rel_id = rel['id'];
			   var rel_lbl = rel['label'];
			   if( is_def(rel_id) && is_def(rel_lbl) ){
			       var an =
				   link.anchor({id: rel_id, label: rel_lbl});
			       // Final check: if we didn't get
			       // anything reasonable, just a label.
			       if( ! an ){ an = rel_lbl; }
			       rel_buff.push(an);
			       // ll('in ' + rel_id + ' + ' + rel_lbl + ': ' + an);
			   }
		       });
	var ranc = link.anchor({id: owlo['relationship']['id'],
				label: owlo['relationship']['label']});
	// Again, a final check
	if( ! ranc ){ ranc = owlo['relationship']['label']; }
	retstr = rel_buff.join(' &rarr; ') + ' ' + ranc;
    }
    
    return retstr;
};
/* 
 * Package: golr.js
 * 
 * Namespace: amigo.data.golr
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the YAML configuration files that AmiGO pulls in.
 *
 * Useful information about GOlr. See the package <golr_conf.js>
 * for the API to interact with this data file.
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 *
 * NOTE: This file has a slightly different latout from the YAML
 * configurations files--in addition instead of the fields
 * being in lists (fields), they are in hashes keyed by the
 * field id (fields_hash).
 */

// All of the server/instance-specific meta-data.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Variable: golr
 * 
 * The configuration for the data.
 * Essentially a JSONification of the OWLTools YAML files.
 * This should be consumed directly by <bbop.golr.conf>.
 */
amigo.data.golr = {
   "bbop_term_ac" : {
      "_outfile" : "./metadata/term-autocomplete-config.yaml",
      "searchable_extension" : "_searchable",
      "_infile" : "./metadata/term-autocomplete-config.yaml",
      "description" : "Easily find ontology classes in GO. For personality only - not a schema configuration.",
      "fields" : [
         {
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "description" : "Term acc/ID.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "description" : "Term acc/ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : [],
            "display_name" : "Term",
            "id" : "annotation_class",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Common term name.",
            "property" : [],
            "required" : "false",
            "display_name" : "Term",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_label",
            "transform" : []
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Term synonyms.",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Synonyms"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "property" : [],
            "required" : "false",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "type" : "string",
            "id" : "alternate_id",
            "transform" : []
         }
      ],
      "schema_generating" : "false",
      "_strict" : 0,
      "fields_hash" : {
         "alternate_id" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "property" : [],
            "required" : "false",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "type" : "string",
            "id" : "alternate_id",
            "transform" : []
         },
         "synonym" : {
            "required" : "false",
            "property" : [],
            "description" : "Term synonyms.",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Synonyms"
         },
         "id" : {
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "description" : "Term acc/ID.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "annotation_class" : {
            "description" : "Term acc/ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : [],
            "display_name" : "Term",
            "id" : "annotation_class",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Common term name.",
            "property" : [],
            "required" : "false",
            "display_name" : "Term",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_label",
            "transform" : []
         }
      },
      "document_category" : "ontology_class",
      "result_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "boost_weights" : "annotation_class^5.0 annotation_class_label^5.0 synonym^1.0 alternate_id^1.0",
      "weight" : "-20",
      "display_name" : "Term autocomplete",
      "filter_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "id" : "bbop_term_ac"
   },
   "general" : {
      "_outfile" : "./metadata/general-config.yaml",
      "searchable_extension" : "_searchable",
      "_infile" : "./metadata/general-config.yaml",
      "description" : "A generic search document to get a general overview of everything.",
      "fields" : [
         {
            "display_name" : "Internal ID",
            "type" : "string",
            "id" : "id",
            "transform" : [],
            "indexed" : "true",
            "description" : "The mangled internal ID for this entity.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "The ID/label for this entity.",
            "property" : [],
            "required" : "false",
            "display_name" : "Entity",
            "indexed" : "true",
            "type" : "string",
            "id" : "entity",
            "transform" : []
         },
         {
            "id" : "entity_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Enity label",
            "required" : "false",
            "property" : [],
            "description" : "The label for this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "display_name" : "Document category",
            "indexed" : "true",
            "id" : "category",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "The document category that this enitity belongs to.",
            "property" : [],
            "required" : "false"
         },
         {
            "display_name" : "Generic blob",
            "indexed" : "true",
            "type" : "string",
            "id" : "general_blob",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "property" : [],
            "required" : "false"
         }
      ],
      "schema_generating" : "true",
      "document_category" : "general",
      "fields_hash" : {
         "entity_label" : {
            "id" : "entity_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Enity label",
            "required" : "false",
            "property" : [],
            "description" : "The label for this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "general_blob" : {
            "display_name" : "Generic blob",
            "indexed" : "true",
            "type" : "string",
            "id" : "general_blob",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "property" : [],
            "required" : "false"
         },
         "entity" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "The ID/label for this entity.",
            "property" : [],
            "required" : "false",
            "display_name" : "Entity",
            "indexed" : "true",
            "type" : "string",
            "id" : "entity",
            "transform" : []
         },
         "category" : {
            "display_name" : "Document category",
            "indexed" : "true",
            "id" : "category",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "The document category that this enitity belongs to.",
            "property" : [],
            "required" : "false"
         },
         "id" : {
            "display_name" : "Internal ID",
            "type" : "string",
            "id" : "id",
            "transform" : [],
            "indexed" : "true",
            "description" : "The mangled internal ID for this entity.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         }
      },
      "_strict" : 0,
      "result_weights" : "entity^3.0 category^1.0",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0",
      "display_name" : "General",
      "weight" : "0",
      "filter_weights" : "category^4.0",
      "id" : "general"
   },
   "complex_annotation" : {
      "searchable_extension" : "_searchable",
      "_infile" : "./metadata/complex-ann-config.yaml",
      "fields" : [
         {
            "required" : "false",
            "property" : [],
            "description" : "A unique (and internal) thing.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "ID"
         },
         {
            "display_name" : "Annotation unit",
            "transform" : [],
            "id" : "annotation_unit",
            "type" : "string",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : []
         },
         {
            "display_name" : "Annotation unit",
            "indexed" : "true",
            "id" : "annotation_unit_label",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "???.",
            "property" : [],
            "required" : "false"
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "???.",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_group",
            "display_name" : "Annotation group"
         },
         {
            "description" : "???.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Annotation group",
            "transform" : [],
            "id" : "annotation_group_label",
            "type" : "string",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Enabled by",
            "indexed" : "true",
            "type" : "string",
            "id" : "enabled_by",
            "transform" : []
         },
         {
            "description" : "???",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Enabled by",
            "type" : "string",
            "id" : "enabled_by_label",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "display_name" : "PANTHER family",
            "id" : "panther_family",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family_label",
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "GAF column 13 (taxon).",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Taxon"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "transform" : [],
            "id" : "taxon_closure",
            "type" : "string"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Taxon"
         },
         {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Function acc/ID.",
            "indexed" : "true",
            "id" : "function_class",
            "transform" : [],
            "type" : "string",
            "display_name" : "Function"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Common function name.",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "transform" : [],
            "id" : "function_class_label",
            "type" : "string"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "id" : "function_class_closure",
            "transform" : [],
            "type" : "string"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "transform" : [],
            "id" : "function_class_closure_label",
            "type" : "string"
         },
         {
            "display_name" : "Process",
            "indexed" : "true",
            "type" : "string",
            "id" : "process_class",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Process acc/ID.",
            "property" : [],
            "required" : "false"
         },
         {
            "type" : "string",
            "id" : "process_class_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Process",
            "required" : "false",
            "property" : [],
            "description" : "Common process name.",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Process",
            "indexed" : "true",
            "type" : "string",
            "id" : "process_class_closure",
            "transform" : []
         },
         {
            "description" : "???",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Process",
            "id" : "process_class_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "location_list",
            "transform" : [],
            "type" : "string",
            "display_name" : "Location",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : ""
         },
         {
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "id" : "location_list_label",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "location_list_closure",
            "display_name" : "Location",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : ""
         },
         {
            "type" : "string",
            "id" : "location_list_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Location",
            "required" : "false",
            "property" : [],
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "id" : "owl_blob_json",
            "indexed" : "false",
            "description" : "???",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "display_name" : "Topology graph (JSON)",
            "indexed" : "false",
            "id" : "topology_graph_json",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "property" : [],
            "required" : "false"
         }
      ],
      "description" : "An individual unit within LEGO. This is <strong>ALPHA</strong> software.",
      "_outfile" : "./metadata/complex-ann-config.yaml",
      "_strict" : 0,
      "fields_hash" : {
         "panther_family_label" : {
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family_label",
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         "taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         "process_class" : {
            "display_name" : "Process",
            "indexed" : "true",
            "type" : "string",
            "id" : "process_class",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Process acc/ID.",
            "property" : [],
            "required" : "false"
         },
         "location_list_closure" : {
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "location_list_closure",
            "display_name" : "Location",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : ""
         },
         "location_list_label" : {
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "id" : "location_list_label",
            "indexed" : "true"
         },
         "enabled_by" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Enabled by",
            "indexed" : "true",
            "type" : "string",
            "id" : "enabled_by",
            "transform" : []
         },
         "taxon" : {
            "required" : "false",
            "property" : [],
            "description" : "GAF column 13 (taxon).",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Taxon"
         },
         "panther_family" : {
            "display_name" : "PANTHER family",
            "id" : "panther_family",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         "function_class_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "id" : "function_class_closure",
            "transform" : [],
            "type" : "string"
         },
         "annotation_group_label" : {
            "description" : "???.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Annotation group",
            "transform" : [],
            "id" : "annotation_group_label",
            "type" : "string",
            "indexed" : "true"
         },
         "process_class_label" : {
            "type" : "string",
            "id" : "process_class_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Process",
            "required" : "false",
            "property" : [],
            "description" : "Common process name.",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "annotation_unit_label" : {
            "display_name" : "Annotation unit",
            "indexed" : "true",
            "id" : "annotation_unit_label",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "???.",
            "property" : [],
            "required" : "false"
         },
         "process_class_closure_label" : {
            "description" : "???",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Process",
            "id" : "process_class_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "function_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Common function name.",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "transform" : [],
            "id" : "function_class_label",
            "type" : "string"
         },
         "function_class" : {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Function acc/ID.",
            "indexed" : "true",
            "id" : "function_class",
            "transform" : [],
            "type" : "string",
            "display_name" : "Function"
         },
         "owl_blob_json" : {
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "id" : "owl_blob_json",
            "indexed" : "false",
            "description" : "???",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "location_list_closure_label" : {
            "type" : "string",
            "id" : "location_list_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Location",
            "required" : "false",
            "property" : [],
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "annotation_unit" : {
            "display_name" : "Annotation unit",
            "transform" : [],
            "id" : "annotation_unit",
            "type" : "string",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : []
         },
         "topology_graph_json" : {
            "display_name" : "Topology graph (JSON)",
            "indexed" : "false",
            "id" : "topology_graph_json",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "property" : [],
            "required" : "false"
         },
         "process_class_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Process",
            "indexed" : "true",
            "type" : "string",
            "id" : "process_class_closure",
            "transform" : []
         },
         "annotation_group" : {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "???.",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_group",
            "display_name" : "Annotation group"
         },
         "taxon_closure_label" : {
            "required" : "false",
            "property" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Taxon"
         },
         "location_list" : {
            "indexed" : "true",
            "id" : "location_list",
            "transform" : [],
            "type" : "string",
            "display_name" : "Location",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : ""
         },
         "id" : {
            "required" : "false",
            "property" : [],
            "description" : "A unique (and internal) thing.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "ID"
         },
         "enabled_by_label" : {
            "description" : "???",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Enabled by",
            "type" : "string",
            "id" : "enabled_by_label",
            "transform" : [],
            "indexed" : "true"
         },
         "taxon_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "transform" : [],
            "id" : "taxon_closure",
            "type" : "string"
         },
         "function_class_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "???",
            "property" : [],
            "required" : "false",
            "display_name" : "Function",
            "indexed" : "true",
            "transform" : [],
            "id" : "function_class_closure_label",
            "type" : "string"
         }
      },
      "document_category" : "complex_annotation",
      "result_weights" : "function_class^5.0 enabled_by^4.0 location_list^3.0 process_class^2.0 annotation_group^1.0",
      "schema_generating" : "true",
      "display_name" : "Complex annotations (ALPHA)",
      "weight" : "-5",
      "boost_weights" : "annotation_group_label^1.0 annotation_unit_label^1.0 enabled_by^1.0 enabled_by_label^1.0 location_list_closure^1.0 location_list_closure_label^1.0 process_class_closure_label^1.0 function_class_closure_label^1.0",
      "filter_weights" : "annotation_group_label^5.0 enabled_by_label^4.5 location_list_closure_label^4.0 process_class_closure_label^3.0 function_class_closure_label^2.0",
      "id" : "complex_annotation"
   },
   "bioentity" : {
      "filter_weights" : "source^7.0 type^6.0 panther_family_label^5.0 annotation_class_list_label^3.5 taxon_closure_label^4.0 regulates_closure_label^2.0",
      "id" : "bioentity",
      "display_name" : "Genes and gene products",
      "weight" : "30",
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0 bioentity_name^1.0 bioentity_internal_id^1.0 synonym^1.0 isa_partof_closure_label^1.0 regulates_closure^1.0 regulates_closure_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "fields_hash" : {
         "source" : {
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "id" : "source",
            "indexed" : "true",
            "description" : "Database source.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "annotation_class_list_label" : {
            "id" : "annotation_class_list_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Direct annotation",
            "required" : "false",
            "property" : [],
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "isa_partof_closure_label" : {
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Closure of labels over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "annotation_class_list" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Direct annotations.",
            "property" : [],
            "required" : "false",
            "display_name" : "Direct annotation",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_list",
            "transform" : []
         },
         "regulates_closure_label" : {
            "required" : "false",
            "property" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Inferred annotation"
         },
         "taxon_closure_label" : {
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon"
         },
         "bioentity_internal_id" : {
            "required" : "false",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "bioentity_internal_id",
            "transform" : [],
            "type" : "string",
            "indexed" : "false",
            "display_name" : "This should not be displayed"
         },
         "taxon_closure" : {
            "description" : "Taxonomic group and ancestral groups.",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "id" : "taxon_closure",
            "transform" : [],
            "indexed" : "true"
         },
         "isa_partof_closure" : {
            "id" : "isa_partof_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "synonym" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Gene product synonyms.",
            "property" : [],
            "required" : "false",
            "display_name" : "Synonyms",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "synonym"
         },
         "bioentity_label" : {
            "description" : "Symbol or name.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Label",
            "type" : "string",
            "id" : "bioentity_label",
            "transform" : [],
            "indexed" : "true"
         },
         "id" : {
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "display_name" : "Acc",
            "required" : "false",
            "property" : [],
            "description" : "Gene of gene product ID.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "bioentity" : {
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "bioentity",
            "display_name" : "Acc",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Gene or gene product ID."
         },
         "taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxonomic group",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         "bioentity_name" : {
            "display_name" : "Name",
            "type" : "string",
            "id" : "bioentity_name",
            "transform" : [],
            "indexed" : "true",
            "description" : "The full name of the gene product.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "panther_family_label" : {
            "display_name" : "PANTHER family",
            "id" : "panther_family_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         "phylo_graph_json" : {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the phylogenic tree.",
            "indexed" : "false",
            "type" : "string",
            "id" : "phylo_graph_json",
            "transform" : [],
            "display_name" : "This should not be displayed"
         },
         "database_xref" : {
            "display_name" : "DB xref",
            "indexed" : "true",
            "id" : "database_xref",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Database cross-reference.",
            "property" : [],
            "required" : "false"
         },
         "taxon" : {
            "display_name" : "Taxon",
            "indexed" : "true",
            "id" : "taxon",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group",
            "property" : [],
            "required" : "false"
         },
         "regulates_closure" : {
            "type" : "string",
            "transform" : [],
            "id" : "regulates_closure",
            "indexed" : "true",
            "display_name" : "Inferred annotation",
            "required" : "false",
            "property" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "panther_family" : {
            "description" : "PANTHER families that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "id" : "panther_family",
            "transform" : [],
            "indexed" : "true"
         },
         "type" : {
            "id" : "type",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Type",
            "required" : "false",
            "property" : [],
            "description" : "Type class.",
            "cardinality" : "single",
            "searchable" : "false"
         }
      },
      "_strict" : 0,
      "document_category" : "bioentity",
      "result_weights" : "bioentity^8.0 bioentity_name^7.0 taxon^6.0 panther_family^5.0 type^4.0 source^3.0 annotation_class_list^2.0 synonym^1.0",
      "schema_generating" : "true",
      "_infile" : "./metadata/bio-config.yaml",
      "searchable_extension" : "_searchable",
      "description" : "Genes and gene products associated with GO terms.",
      "fields" : [
         {
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "display_name" : "Acc",
            "required" : "false",
            "property" : [],
            "description" : "Gene of gene product ID.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "bioentity",
            "display_name" : "Acc",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Gene or gene product ID."
         },
         {
            "description" : "Symbol or name.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Label",
            "type" : "string",
            "id" : "bioentity_label",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "display_name" : "Name",
            "type" : "string",
            "id" : "bioentity_name",
            "transform" : [],
            "indexed" : "true",
            "description" : "The full name of the gene product.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "bioentity_internal_id",
            "transform" : [],
            "type" : "string",
            "indexed" : "false",
            "display_name" : "This should not be displayed"
         },
         {
            "id" : "type",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Type",
            "required" : "false",
            "property" : [],
            "description" : "Type class.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "display_name" : "Taxon",
            "indexed" : "true",
            "id" : "taxon",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group",
            "property" : [],
            "required" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxonomic group",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         {
            "description" : "Taxonomic group and ancestral groups.",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "id" : "taxon_closure",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon"
         },
         {
            "id" : "isa_partof_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Closure of labels over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "type" : "string",
            "transform" : [],
            "id" : "regulates_closure",
            "indexed" : "true",
            "display_name" : "Inferred annotation",
            "required" : "false",
            "property" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "searchable" : "true",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "regulates_closure_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Inferred annotation"
         },
         {
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "id" : "source",
            "indexed" : "true",
            "description" : "Database source.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Direct annotations.",
            "property" : [],
            "required" : "false",
            "display_name" : "Direct annotation",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_list",
            "transform" : []
         },
         {
            "id" : "annotation_class_list_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Direct annotation",
            "required" : "false",
            "property" : [],
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Gene product synonyms.",
            "property" : [],
            "required" : "false",
            "display_name" : "Synonyms",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "synonym"
         },
         {
            "description" : "PANTHER families that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "id" : "panther_family",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "display_name" : "PANTHER family",
            "id" : "panther_family_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the phylogenic tree.",
            "indexed" : "false",
            "type" : "string",
            "id" : "phylo_graph_json",
            "transform" : [],
            "display_name" : "This should not be displayed"
         },
         {
            "display_name" : "DB xref",
            "indexed" : "true",
            "id" : "database_xref",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Database cross-reference.",
            "property" : [],
            "required" : "false"
         }
      ],
      "_outfile" : "./metadata/bio-config.yaml"
   },
   "family" : {
      "display_name" : "Protein families",
      "weight" : "5",
      "boost_weights" : "panther_family^2.0 panther_family_label^2.0 bioentity_list^1.0 bioentity_list_label^1.0",
      "filter_weights" : "bioentity_list_label^1.0",
      "id" : "family",
      "_infile" : "./metadata/protein-family-config.yaml",
      "searchable_extension" : "_searchable",
      "fields" : [
         {
            "required" : "false",
            "property" : [],
            "description" : "Family ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Acc"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "PANTHER family IDs that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "id" : "panther_family",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "PANTHER family"
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "panther_family_label",
            "display_name" : "PANTHER family"
         },
         {
            "id" : "phylo_graph_json",
            "transform" : [],
            "type" : "string",
            "indexed" : "false",
            "display_name" : "This should not be displayed",
            "required" : "false",
            "property" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "id" : "bioentity_list",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Gene/products",
            "required" : "false",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "bioentity_list_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Gene/products"
         }
      ],
      "description" : "Information about protein (PANTHER) families.",
      "_outfile" : "./metadata/protein-family-config.yaml",
      "fields_hash" : {
         "bioentity_list_label" : {
            "required" : "false",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "bioentity_list_label",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Gene/products"
         },
         "bioentity_list" : {
            "id" : "bioentity_list",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Gene/products",
            "required" : "false",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "panther_family" : {
            "required" : "false",
            "property" : [],
            "description" : "PANTHER family IDs that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "id" : "panther_family",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "PANTHER family"
         },
         "panther_family_label" : {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "indexed" : "true",
            "type" : "string",
            "transform" : [],
            "id" : "panther_family_label",
            "display_name" : "PANTHER family"
         },
         "phylo_graph_json" : {
            "id" : "phylo_graph_json",
            "transform" : [],
            "type" : "string",
            "indexed" : "false",
            "display_name" : "This should not be displayed",
            "required" : "false",
            "property" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "id" : {
            "required" : "false",
            "property" : [],
            "description" : "Family ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Acc"
         }
      },
      "_strict" : 0,
      "document_category" : "family",
      "result_weights" : "panther_family^5.0 bioentity_list^4.0",
      "schema_generating" : "true"
   },
   "ontology" : {
      "schema_generating" : "true",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0",
      "_strict" : 0,
      "fields_hash" : {
         "regulates_closure" : {
            "required" : "false",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "regulates_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Ancestor"
         },
         "alternate_id" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "alternate_id",
            "transform" : [],
            "display_name" : "Alt ID",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term identifier."
         },
         "only_in_taxon_closure_label" : {
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "description" : {
            "transform" : [],
            "id" : "description",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Definition",
            "required" : "false",
            "property" : [
               "getDef"
            ],
            "description" : "Term definition.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "subset" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "subset",
            "transform" : [],
            "display_name" : "Subset",
            "property" : [
               "getSubsets"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Special use collections of terms."
         },
         "database_xref" : {
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "searchable" : "false",
            "required" : "false",
            "property" : [
               "getXref"
            ],
            "display_name" : "DB xref",
            "id" : "database_xref",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "comment" : {
            "description" : "Term comment.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getComment"
            ],
            "display_name" : "Comment",
            "id" : "comment",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "is_obsolete" : {
            "transform" : [],
            "id" : "is_obsolete",
            "type" : "boolean",
            "indexed" : "true",
            "display_name" : "Obsoletion",
            "required" : "false",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "annotation_class" : {
            "description" : "Term identifier.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "display_name" : "Term",
            "type" : "string",
            "id" : "annotation_class",
            "transform" : [],
            "indexed" : "true"
         },
         "synonym" : {
            "indexed" : "true",
            "id" : "synonym",
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonyms",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Term synonyms."
         },
         "id" : {
            "indexed" : "true",
            "transform" : [],
            "id" : "id",
            "type" : "string",
            "display_name" : "Acc",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Term identifier."
         },
         "definition_xref" : {
            "id" : "definition_xref",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Def xref",
            "required" : "false",
            "property" : [
               "getDefXref"
            ],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "isa_partof_closure" : {
            "indexed" : "true",
            "transform" : [],
            "id" : "isa_partof_closure",
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         "regulates_closure_label" : {
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "indexed" : "true",
            "id" : "regulates_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Ancestor"
         },
         "isa_partof_closure_label" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         "source" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "source",
            "transform" : [],
            "display_name" : "Ontology source",
            "property" : [
               "getNamespace"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Term namespace."
         },
         "annotation_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "display_name" : "Term",
            "indexed" : "true",
            "id" : "annotation_class_label",
            "transform" : [],
            "type" : "string"
         },
         "topology_graph_json" : {
            "display_name" : "Topology graph (JSON)",
            "indexed" : "false",
            "id" : "topology_graph_json",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "property" : [
               "getSegmentShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false"
         },
         "only_in_taxon" : {
            "description" : "Only in taxon.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "regulates_transitivity_graph_json" : {
            "property" : [
               "getLineageShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "indexed" : "false",
            "type" : "string",
            "id" : "regulates_transitivity_graph_json",
            "transform" : [],
            "display_name" : "Regulates transitivity graph (JSON)"
         },
         "replaced_by" : {
            "display_name" : "Replaced By",
            "indexed" : "true",
            "transform" : [],
            "id" : "replaced_by",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Term that replaces this term.",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false"
         },
         "only_in_taxon_closure" : {
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "type" : "string",
            "id" : "only_in_taxon_closure",
            "transform" : [],
            "display_name" : "Only in taxon (IDs)"
         },
         "consider" : {
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Others terms you might want to look at.",
            "indexed" : "true",
            "transform" : [],
            "id" : "consider",
            "type" : "string",
            "display_name" : "Consider"
         },
         "only_in_taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Only in taxon label.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "display_name" : "Only in taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "only_in_taxon_label",
            "transform" : []
         }
      },
      "document_category" : "ontology_class",
      "_outfile" : "./metadata/ont-config.yaml",
      "fields" : [
         {
            "indexed" : "true",
            "transform" : [],
            "id" : "id",
            "type" : "string",
            "display_name" : "Acc",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Term identifier."
         },
         {
            "description" : "Term identifier.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "display_name" : "Term",
            "type" : "string",
            "id" : "annotation_class",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "display_name" : "Term",
            "indexed" : "true",
            "id" : "annotation_class_label",
            "transform" : [],
            "type" : "string"
         },
         {
            "transform" : [],
            "id" : "description",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Definition",
            "required" : "false",
            "property" : [
               "getDef"
            ],
            "description" : "Term definition.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "source",
            "transform" : [],
            "display_name" : "Ontology source",
            "property" : [
               "getNamespace"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Term namespace."
         },
         {
            "transform" : [],
            "id" : "is_obsolete",
            "type" : "boolean",
            "indexed" : "true",
            "display_name" : "Obsoletion",
            "required" : "false",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "description" : "Term comment.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getComment"
            ],
            "display_name" : "Comment",
            "id" : "comment",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "synonym",
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonyms",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Term synonyms."
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "alternate_id",
            "transform" : [],
            "display_name" : "Alt ID",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term identifier."
         },
         {
            "display_name" : "Replaced By",
            "indexed" : "true",
            "transform" : [],
            "id" : "replaced_by",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Term that replaces this term.",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false"
         },
         {
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Others terms you might want to look at.",
            "indexed" : "true",
            "transform" : [],
            "id" : "consider",
            "type" : "string",
            "display_name" : "Consider"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "subset",
            "transform" : [],
            "display_name" : "Subset",
            "property" : [
               "getSubsets"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Special use collections of terms."
         },
         {
            "id" : "definition_xref",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Def xref",
            "required" : "false",
            "property" : [
               "getDefXref"
            ],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "searchable" : "false",
            "required" : "false",
            "property" : [
               "getXref"
            ],
            "display_name" : "DB xref",
            "id" : "database_xref",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "transform" : [],
            "id" : "isa_partof_closure",
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         {
            "required" : "false",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "regulates_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Ancestor"
         },
         {
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "indexed" : "true",
            "id" : "regulates_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Ancestor"
         },
         {
            "display_name" : "Topology graph (JSON)",
            "indexed" : "false",
            "id" : "topology_graph_json",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "property" : [
               "getSegmentShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false"
         },
         {
            "property" : [
               "getLineageShuntGraphJSON",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "indexed" : "false",
            "type" : "string",
            "id" : "regulates_transitivity_graph_json",
            "transform" : [],
            "display_name" : "Regulates transitivity graph (JSON)"
         },
         {
            "description" : "Only in taxon.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Only in taxon label.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "display_name" : "Only in taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "only_in_taxon_label",
            "transform" : []
         },
         {
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "type" : "string",
            "id" : "only_in_taxon_closure",
            "transform" : [],
            "display_name" : "Only in taxon (IDs)"
         },
         {
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "display_name" : "Only in taxon",
            "id" : "only_in_taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         }
      ],
      "description" : "Ontology classes for GO.",
      "searchable_extension" : "_searchable",
      "_infile" : "./metadata/ont-config.yaml",
      "id" : "ontology",
      "filter_weights" : "source^4.0 subset^3.0 regulates_closure_label^1.0 is_obsolete^0.0",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "display_name" : "Ontology",
      "weight" : "40"
   },
   "annotation" : {
      "schema_generating" : "true",
      "result_weights" : "bioentity^7.0 bioentity_name^6.0 qualifier^5.0 annotation_class^4.7 annotation_extension_json^4.5 source^4.0 taxon^3.0 evidence_type^2.5 evidence_with^2.0 panther_family^1.5 bioentity_isoform^0.5 reference^0.25",
      "document_category" : "annotation",
      "fields_hash" : {
         "secondary_taxon_closure_label" : {
            "description" : "Secondary taxon closure.",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Secondary taxon",
            "id" : "secondary_taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         "taxon" : {
            "indexed" : "true",
            "transform" : [],
            "id" : "taxon",
            "type" : "string",
            "display_name" : "Taxon",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group."
         },
         "panther_family" : {
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family",
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         "is_redundant_for" : {
            "transform" : [],
            "id" : "is_redundant_for",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Redundant for",
            "required" : "false",
            "property" : [],
            "description" : "Rational for redundancy of annotation.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "has_participant_closure_label" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "has_participant_closure_label",
            "transform" : [],
            "display_name" : "Has participant",
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Closure of labels over has_participant."
         },
         "type" : {
            "required" : "false",
            "property" : [],
            "description" : "Type class.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "type",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Type class id"
         },
         "taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxonomic group and ancestral groups.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         "evidence_with" : {
            "type" : "string",
            "id" : "evidence_with",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Evidence with",
            "required" : "false",
            "property" : [],
            "description" : "Evidence with/from.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "date" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "date",
            "transform" : [],
            "display_name" : "Date",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Date of assignment."
         },
         "qualifier" : {
            "id" : "qualifier",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Qualifier",
            "required" : "false",
            "property" : [],
            "description" : "Annotation qualifier.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "taxon_closure" : {
            "display_name" : "Taxon",
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "property" : [],
            "required" : "false"
         },
         "bioentity_label" : {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Gene or gene product identifiers.",
            "indexed" : "true",
            "transform" : [],
            "id" : "bioentity_label",
            "type" : "string",
            "display_name" : "Gene/product"
         },
         "synonym" : {
            "display_name" : "Synonym",
            "indexed" : "true",
            "type" : "string",
            "id" : "synonym",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Gene or gene product synonyms.",
            "property" : [],
            "required" : "false"
         },
         "regulates_closure_label" : {
            "description" : "Annotations for this term or its children (over regulates).",
            "searchable" : "true",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Inferred annotation",
            "type" : "string",
            "id" : "regulates_closure_label",
            "transform" : [],
            "indexed" : "true"
         },
         "regulates_closure" : {
            "indexed" : "true",
            "type" : "string",
            "id" : "regulates_closure",
            "transform" : [],
            "display_name" : "Inferred annotation",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over regulates)."
         },
         "secondary_taxon_label" : {
            "description" : "Secondary taxon.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "id" : "secondary_taxon_label",
            "indexed" : "true"
         },
         "annotation_extension_class_label" : {
            "transform" : [],
            "id" : "annotation_extension_class_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Annotation extension",
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "has_participant_closure" : {
            "required" : "false",
            "property" : [],
            "description" : "Closure of ids/accs over has_participant.",
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "has_participant_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Has participant (IDs)"
         },
         "reference" : {
            "type" : "string",
            "id" : "reference",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Reference",
            "required" : "false",
            "property" : [],
            "description" : "Database reference.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "bioentity" : {
            "description" : "Gene or gene product identifiers.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Gene/product",
            "type" : "string",
            "id" : "bioentity",
            "transform" : [],
            "indexed" : "true"
         },
         "annotation_extension_class" : {
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_extension_class",
            "indexed" : "true",
            "display_name" : "Annotation extension"
         },
         "panther_family_label" : {
            "display_name" : "PANTHER family",
            "type" : "string",
            "id" : "panther_family_label",
            "transform" : [],
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "bioentity_name" : {
            "display_name" : "Gene/product name",
            "indexed" : "true",
            "type" : "string",
            "id" : "bioentity_name",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "The full name of the gene or gene product.",
            "property" : [],
            "required" : "false"
         },
         "assigned_by" : {
            "type" : "string",
            "transform" : [],
            "id" : "assigned_by",
            "indexed" : "true",
            "display_name" : "Assigned by",
            "required" : "false",
            "property" : [],
            "description" : "Annotations assigned by group.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "secondary_taxon" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "property" : [],
            "required" : "false",
            "display_name" : "Secondary taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "secondary_taxon",
            "transform" : []
         },
         "annotation_extension_class_closure_label" : {
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "searchable" : "true",
            "transform" : [],
            "id" : "annotation_extension_class_closure_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Annotation extension"
         },
         "annotation_extension_json" : {
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "transform" : [],
            "id" : "annotation_extension_json",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Extension class for the annotation (JSON).",
            "property" : [],
            "required" : "false"
         },
         "secondary_taxon_closure" : {
            "required" : "false",
            "property" : [],
            "description" : "Secondary taxon closure.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "id" : "secondary_taxon_closure",
            "indexed" : "true",
            "display_name" : "Secondary taxon"
         },
         "bioentity_internal_id" : {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "The bioentity ID used at the database of origin.",
            "indexed" : "false",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "transform" : [],
            "display_name" : "This should not be displayed"
         },
         "taxon_closure_label" : {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Taxonomic group and ancestral groups.",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "display_name" : "Taxon"
         },
         "evidence_type" : {
            "description" : "Evidence type.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "id" : "evidence_type",
            "indexed" : "true"
         },
         "annotation_extension_class_closure" : {
            "display_name" : "Annotation extension",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "transform" : [],
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : []
         },
         "annotation_class" : {
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : [],
            "display_name" : "Direct annotation",
            "transform" : [],
            "id" : "annotation_class",
            "type" : "string",
            "indexed" : "true"
         },
         "aspect" : {
            "description" : "Ontology aspect.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Ontology (aspect)",
            "type" : "string",
            "transform" : [],
            "id" : "aspect",
            "indexed" : "true"
         },
         "isa_partof_closure" : {
            "display_name" : "Involved in",
            "indexed" : "true",
            "type" : "string",
            "id" : "isa_partof_closure",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "property" : [],
            "required" : "false"
         },
         "id" : {
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "display_name" : "Acc",
            "required" : "false",
            "property" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "annotation_class_label" : {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "id" : "annotation_class_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation"
         },
         "source" : {
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "id" : "source",
            "indexed" : "true",
            "description" : "Database source.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "bioentity_isoform" : {
            "display_name" : "Isoform",
            "id" : "bioentity_isoform",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "Biological isoform.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : []
         },
         "evidence_type_closure" : {
            "display_name" : "Evidence type",
            "indexed" : "true",
            "id" : "evidence_type_closure",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "All evidence (evidence closure) for this annotation",
            "property" : [],
            "required" : "false"
         },
         "isa_partof_closure_label" : {
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "cardinality" : "multi",
            "searchable" : "true"
         }
      },
      "_strict" : 0,
      "_outfile" : "./metadata/ann-config.yaml",
      "fields" : [
         {
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "indexed" : "true",
            "display_name" : "Acc",
            "required" : "false",
            "property" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "id" : "source",
            "indexed" : "true",
            "description" : "Database source.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Type class.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "type",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Type class id"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "date",
            "transform" : [],
            "display_name" : "Date",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Date of assignment."
         },
         {
            "type" : "string",
            "transform" : [],
            "id" : "assigned_by",
            "indexed" : "true",
            "display_name" : "Assigned by",
            "required" : "false",
            "property" : [],
            "description" : "Annotations assigned by group.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "transform" : [],
            "id" : "is_redundant_for",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Redundant for",
            "required" : "false",
            "property" : [],
            "description" : "Rational for redundancy of annotation.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "transform" : [],
            "id" : "taxon",
            "type" : "string",
            "display_name" : "Taxon",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group."
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxonomic group and ancestral groups.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : []
         },
         {
            "display_name" : "Taxon",
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "property" : [],
            "required" : "false"
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Taxonomic group and ancestral groups.",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "display_name" : "Taxon"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "property" : [],
            "required" : "false",
            "display_name" : "Secondary taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "secondary_taxon",
            "transform" : []
         },
         {
            "description" : "Secondary taxon.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "id" : "secondary_taxon_label",
            "indexed" : "true"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Secondary taxon closure.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "id" : "secondary_taxon_closure",
            "indexed" : "true",
            "display_name" : "Secondary taxon"
         },
         {
            "description" : "Secondary taxon closure.",
            "cardinality" : "multi",
            "searchable" : "true",
            "required" : "false",
            "property" : [],
            "display_name" : "Secondary taxon",
            "id" : "secondary_taxon_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true"
         },
         {
            "display_name" : "Involved in",
            "indexed" : "true",
            "type" : "string",
            "id" : "isa_partof_closure",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "property" : [],
            "required" : "false"
         },
         {
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Involved in",
            "required" : "false",
            "property" : [],
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "regulates_closure",
            "transform" : [],
            "display_name" : "Inferred annotation",
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over regulates)."
         },
         {
            "description" : "Annotations for this term or its children (over regulates).",
            "searchable" : "true",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Inferred annotation",
            "type" : "string",
            "id" : "regulates_closure_label",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Closure of ids/accs over has_participant.",
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "has_participant_closure",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Has participant (IDs)"
         },
         {
            "indexed" : "true",
            "type" : "string",
            "id" : "has_participant_closure_label",
            "transform" : [],
            "display_name" : "Has participant",
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Closure of labels over has_participant."
         },
         {
            "display_name" : "Synonym",
            "indexed" : "true",
            "type" : "string",
            "id" : "synonym",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Gene or gene product synonyms.",
            "property" : [],
            "required" : "false"
         },
         {
            "description" : "Gene or gene product identifiers.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Gene/product",
            "type" : "string",
            "id" : "bioentity",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Gene or gene product identifiers.",
            "indexed" : "true",
            "transform" : [],
            "id" : "bioentity_label",
            "type" : "string",
            "display_name" : "Gene/product"
         },
         {
            "display_name" : "Gene/product name",
            "indexed" : "true",
            "type" : "string",
            "id" : "bioentity_name",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "The full name of the gene or gene product.",
            "property" : [],
            "required" : "false"
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "The bioentity ID used at the database of origin.",
            "indexed" : "false",
            "type" : "string",
            "id" : "bioentity_internal_id",
            "transform" : [],
            "display_name" : "This should not be displayed"
         },
         {
            "id" : "qualifier",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Qualifier",
            "required" : "false",
            "property" : [],
            "description" : "Annotation qualifier.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : [],
            "display_name" : "Direct annotation",
            "transform" : [],
            "id" : "annotation_class",
            "type" : "string",
            "indexed" : "true"
         },
         {
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "id" : "annotation_class_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation"
         },
         {
            "description" : "Ontology aspect.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Ontology (aspect)",
            "type" : "string",
            "transform" : [],
            "id" : "aspect",
            "indexed" : "true"
         },
         {
            "display_name" : "Isoform",
            "id" : "bioentity_isoform",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "description" : "Biological isoform.",
            "cardinality" : "single",
            "searchable" : "false",
            "required" : "false",
            "property" : []
         },
         {
            "description" : "Evidence type.",
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "id" : "evidence_type",
            "indexed" : "true"
         },
         {
            "display_name" : "Evidence type",
            "indexed" : "true",
            "id" : "evidence_type_closure",
            "transform" : [],
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "All evidence (evidence closure) for this annotation",
            "property" : [],
            "required" : "false"
         },
         {
            "type" : "string",
            "id" : "evidence_with",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Evidence with",
            "required" : "false",
            "property" : [],
            "description" : "Evidence with/from.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "type" : "string",
            "id" : "reference",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Reference",
            "required" : "false",
            "property" : [],
            "description" : "Database reference.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "searchable" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_extension_class",
            "indexed" : "true",
            "display_name" : "Annotation extension"
         },
         {
            "transform" : [],
            "id" : "annotation_extension_class_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Annotation extension",
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "display_name" : "Annotation extension",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "transform" : [],
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : []
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "searchable" : "true",
            "transform" : [],
            "id" : "annotation_extension_class_closure_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Annotation extension"
         },
         {
            "display_name" : "Annotation extension",
            "indexed" : "true",
            "transform" : [],
            "id" : "annotation_extension_json",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Extension class for the annotation (JSON).",
            "property" : [],
            "required" : "false"
         },
         {
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family",
            "type" : "string",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "display_name" : "PANTHER family",
            "type" : "string",
            "id" : "panther_family_label",
            "transform" : [],
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         }
      ],
      "description" : "Associations between GO terms and genes or gene products.",
      "_infile" : "./metadata/ann-config.yaml",
      "searchable_extension" : "_searchable",
      "id" : "annotation",
      "filter_weights" : "source^7.0 assigned_by^6.5 aspect^6.25 evidence_type_closure^6.0 panther_family_label^5.5 qualifier^5.25 taxon_closure_label^5.0 annotation_class_label^4.5 regulates_closure_label^3.0 annotation_extension_class_closure_label^2.0",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 bioentity_name^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 reference^1.0 panther_family^1.0 panther_family_label^1.0 bioentity_isoform^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "display_name" : "Annotations",
      "weight" : "20"
   },
   "bbop_ann_ev_agg" : {
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "weight" : "-10",
      "display_name" : "Advanced",
      "id" : "bbop_ann_ev_agg",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0",
      "_outfile" : "./metadata/ann_ev_agg-config.yaml",
      "fields" : [
         {
            "required" : "false",
            "property" : [],
            "description" : "Gene/product ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Acc"
         },
         {
            "required" : "false",
            "property" : [],
            "description" : "Column 1 + columns 2.",
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Gene/product ID"
         },
         {
            "transform" : [],
            "id" : "bioentity_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Gene/product label",
            "required" : "false",
            "property" : [],
            "description" : "Column 3.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "indexed" : "true",
            "id" : "annotation_class",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Column 5."
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Column 5 + ontology.",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_label",
            "transform" : [],
            "display_name" : "Annotation class label"
         },
         {
            "description" : "All evidence for this term/gene product pair",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "id" : "evidence_type_closure",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "description" : "All column 8s for this term/gene product pair",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence with",
            "type" : "string",
            "id" : "evidence_with",
            "transform" : [],
            "indexed" : "true"
         },
         {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Column 13: taxon.",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon",
            "transform" : [],
            "display_name" : "Taxon"
         },
         {
            "display_name" : "Taxon",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : [],
            "indexed" : "true",
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string"
         },
         {
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false"
         },
         {
            "id" : "panther_family",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Protein family",
            "required" : "false",
            "property" : [],
            "description" : "Family IDs that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "display_name" : "Family",
            "indexed" : "true",
            "type" : "string",
            "id" : "panther_family_label",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Families that are associated with this entity.",
            "property" : [],
            "required" : "false"
         }
      ],
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "_infile" : "./metadata/ann_ev_agg-config.yaml",
      "searchable_extension" : "_searchable",
      "schema_generating" : "true",
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "fields_hash" : {
         "evidence_with" : {
            "description" : "All column 8s for this term/gene product pair",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence with",
            "type" : "string",
            "id" : "evidence_with",
            "transform" : [],
            "indexed" : "true"
         },
         "taxon_label" : {
            "display_name" : "Taxon",
            "type" : "string",
            "id" : "taxon_label",
            "transform" : [],
            "indexed" : "true",
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "single",
            "required" : "false",
            "property" : []
         },
         "evidence_type_closure" : {
            "description" : "All evidence for this term/gene product pair",
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "id" : "evidence_type_closure",
            "transform" : [],
            "indexed" : "true"
         },
         "panther_family_label" : {
            "display_name" : "Family",
            "indexed" : "true",
            "type" : "string",
            "id" : "panther_family_label",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Families that are associated with this entity.",
            "property" : [],
            "required" : "false"
         },
         "annotation_class_label" : {
            "property" : [],
            "required" : "false",
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Column 5 + ontology.",
            "indexed" : "true",
            "type" : "string",
            "id" : "annotation_class_label",
            "transform" : [],
            "display_name" : "Annotation class label"
         },
         "bioentity" : {
            "required" : "false",
            "property" : [],
            "description" : "Column 1 + columns 2.",
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "transform" : [],
            "indexed" : "true",
            "display_name" : "Gene/product ID"
         },
         "taxon_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false",
            "display_name" : "Taxon (IDs)",
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string"
         },
         "id" : {
            "required" : "false",
            "property" : [],
            "description" : "Gene/product ID.",
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Acc"
         },
         "bioentity_label" : {
            "transform" : [],
            "id" : "bioentity_label",
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Gene/product label",
            "required" : "false",
            "property" : [],
            "description" : "Column 3.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "panther_family" : {
            "id" : "panther_family",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "display_name" : "Protein family",
            "required" : "false",
            "property" : [],
            "description" : "Family IDs that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "annotation_class" : {
            "indexed" : "true",
            "id" : "annotation_class",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Column 5."
         },
         "taxon_closure_label" : {
            "display_name" : "Taxon",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon_closure_label",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "property" : [],
            "required" : "false"
         },
         "taxon" : {
            "property" : [],
            "required" : "false",
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Column 13: taxon.",
            "indexed" : "true",
            "type" : "string",
            "id" : "taxon",
            "transform" : [],
            "display_name" : "Taxon"
         }
      },
      "document_category" : "annotation_evidence_aggregate",
      "_strict" : 0
   }
};
/*
 * Package: server.js
 * 
 * Namespace: amigo.data.server
 * 
 * This package was automatically created during AmiGO 2 installation.
 * 
 * Purpose: Useful information about GO and the AmiGO installation.
 *          Also serves as a repository and getter for web
 *          resources such as images.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Constructor: server
 * 
 * The configuration for the server settings.
 * Essentially a JSONification of the config.pl AmiGO 2 file.
 * 
 * Arguments:
 *  n/a
 */
amigo.data.server = function(){

    // All of the server/instance-specific meta-data.
    var meta_data = {"css_base":"http://localhost:9999/static/css","golr_base":"http://localhost:8080/solr/","ontologies":[],"galaxy_base":null,"js_dev_base":"http://localhost:9999/static/staging","html_base":"http://localhost:9999/static","beta":"1","evidence_codes":{},"term_regexp":"all|GO:[0-9]{7}","sources":[],"app_base":"http://localhost:9999","species_map":{},"gp_types":[],"bbop_img_star":"http://localhost:9999/static/images/star.png","js_base":"http://localhost:9999/static/js","image_base":"http://localhost:9999/static/images","species":[]};

    ///
    /// Break out the data and various functions to access them...
    ///

    /*
     * Function: css_base
     * 
     * Access to AmiGO variable css_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var css_base = meta_data.css_base;
    this.css_base = function(){ return css_base; };

    /*
     * Function: golr_base
     * 
     * Access to AmiGO variable golr_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var golr_base = meta_data.golr_base;
    this.golr_base = function(){ return golr_base; };

    /*
     * Function: ontologies
     * 
     * Access to AmiGO variable ontologies.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };

    /*
     * Function: galaxy_base
     * 
     * Access to AmiGO variable galaxy_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var galaxy_base = meta_data.galaxy_base;
    this.galaxy_base = function(){ return galaxy_base; };

    /*
     * Function: js_dev_base
     * 
     * Access to AmiGO variable js_dev_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var js_dev_base = meta_data.js_dev_base;
    this.js_dev_base = function(){ return js_dev_base; };

    /*
     * Function: html_base
     * 
     * Access to AmiGO variable html_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };

    /*
     * Function: beta
     * 
     * Access to AmiGO variable beta.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var beta = meta_data.beta;
    this.beta = function(){ return beta; };

    /*
     * Function: evidence_codes
     * 
     * Access to AmiGO variable evidence_codes.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };

    /*
     * Function: term_regexp
     * 
     * Access to AmiGO variable term_regexp.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };

    /*
     * Function: sources
     * 
     * Access to AmiGO variable sources.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var sources = meta_data.sources;
    this.sources = function(){ return sources; };

    /*
     * Function: app_base
     * 
     * Access to AmiGO variable app_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };

    /*
     * Function: species_map
     * 
     * Access to AmiGO variable species_map.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };

    /*
     * Function: gp_types
     * 
     * Access to AmiGO variable gp_types.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };

    /*
     * Function: bbop_img_star
     * 
     * Access to AmiGO variable bbop_img_star.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var bbop_img_star = meta_data.bbop_img_star;
    this.bbop_img_star = function(){ return bbop_img_star; };

    /*
     * Function: js_base
     * 
     * Access to AmiGO variable js_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var js_base = meta_data.js_base;
    this.js_base = function(){ return js_base; };

    /*
     * Function: image_base
     * 
     * Access to AmiGO variable image_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };

    /*
     * Function: species
     * 
     * Access to AmiGO variable species.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var species = meta_data.species;
    this.species = function(){ return species; };


    // Does it look like a term?
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str);

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
    this.term_id_p = function(term_id){
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
};
/*
 * Package: definitions.js
 * 
 * Namespace: amigo.data.definitions
 * 
 * Purpose: Useful information about common GO datatypes and
 * structures, as well as some constants.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Constructor: definitions
 * 
 * Encapsulate common structures and constants.
 * 
 * Arguments:
 *  n/a
 */
amigo.data.definitions = function(){

    /*
     * Function: gaf_from_golr_fields
     * 
     * A list of fields to generate a GAF from using golr fields.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  list of strings
     */
    this.gaf_from_golr_fields = function(){
	return [
	    'source', // c1
	    'bioentity_internal_id', // c2; not bioentity
	    'bioentity_label', // c3
	    'qualifier', // c4
	    'annotation_class', // c5
	    'reference', // c6
	    'evidence_type', // c7
	    'evidence_with', // c8
	    'aspect', // c9
	    'bioentity_name', // c10
	    'synonym', // c11
	    'type', // c12
	    'taxon', // c13
	    'date', // c14
	    'assigned_by', // c15
	    'annotation_extension_class', // c16
	    'bioentity_isoform' // c17
	];
    };

    /*
     * Function: download_limit
     * 
     * The maximum allowed number of items to download for out server.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  integer
     */
    this.download_limit = function(){
	//return 7500;
	return 10000;
    };

};
/* 
 * Package: xrefs.js
 * 
 * Namespace: amigo.data.xrefs
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the GO.xrf_abbs file at: "http://www.geneontology.org/doc/GO.xrf_abbs".
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 */

// All of the server/instance-specific meta-data.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Variable: xrefs
 * 
 * All the external references that we know about.
 */
amigo.data.xrefs = {
   "um-bbd_reactionid" : {
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=r0129",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "UM-BBD_reactionID:r0129",
      "fullname" : null,
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=[example_id]",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "datatype" : null,
      "abbreviation" : "UM-BBD_reactionID",
      "object" : "Reaction identifier",
      "generic_url" : "http://umbbd.msi.umn.edu/"
   },
   "jcvi_egad" : {
      "generic_url" : "http://cmr.jcvi.org/",
      "object" : "Accession",
      "abbreviation" : "JCVI_EGAD",
      "datatype" : null,
      "database" : "EGAD database at the J. Craig Venter Institute",
      "fullname" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "JCVI_EGAD:74462",
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462"
   },
   "merops_fam" : {
      "database" : "MEROPS peptidase database",
      "datatype" : null,
      "abbreviation" : "MEROPS_fam",
      "object" : "Peptidase family identifier",
      "generic_url" : "http://merops.sanger.ac.uk/",
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=m18",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "MEROPS_fam:M18",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=[example_id]",
      "fullname" : null
   },
   "cog_function" : {
      "database" : "NCBI COG function",
      "datatype" : null,
      "abbreviation" : "COG_Function",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=H",
      "name" : null,
      "example_id" : "COG_Function:H",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=[example_id]"
   },
   "ntnu_sb" : {
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null,
      "url_example" : null,
      "name" : null,
      "generic_url" : "http://www.ntnu.edu/nt/systemsbiology",
      "object" : null,
      "abbreviation" : "NTNU_SB",
      "database" : "Norwegian University of Science and Technology, Systems Biology team",
      "datatype" : null
   },
   "biomd" : {
      "datatype" : null,
      "database" : "BioModels Database",
      "abbreviation" : "BIOMD",
      "object" : "Accession",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "BIOMD:BIOMD0000000045",
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]"
   },
   "gonuts" : {
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MOUSE:CD28",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "uri_prefix" : null,
      "example_id" : "GONUTS:MOUSE:CD28",
      "id" : null,
      "abbreviation" : "GONUTS",
      "description" : "Third party documentation for GO and community annotation system.",
      "database" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "datatype" : null,
      "generic_url" : "http://gowiki.tamu.edu",
      "object" : "Identifier (for gene or gene product)"
   },
   "biomdid" : {
      "object" : "Accession",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "datatype" : null,
      "database" : "BioModels Database",
      "abbreviation" : "BIOMDID",
      "example_id" : "BIOMD:BIOMD0000000045",
      "id" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "name" : null
   },
   "agbase" : {
      "url_syntax" : "http://www.agbase.msstate.edu/cgi-bin/getEntry.pl?db_pick=[ChickGO/MaizeGO]&uid=[example_id]",
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_example" : null,
      "name" : null,
      "generic_url" : "http://www.agbase.msstate.edu/",
      "object" : null,
      "abbreviation" : "AgBase",
      "database" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "datatype" : null
   },
   "pmcid" : {
      "abbreviation" : "PMCID",
      "database" : "Pubmed Central",
      "datatype" : null,
      "generic_url" : "http://www.pubmedcentral.nih.gov/",
      "object" : "Identifier",
      "!url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=[example_id]",
      "!url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=PMC201377",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=PMC201377",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "PMCID:PMC201377"
   },
   "mi" : {
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "MI:0018",
      "fullname" : null,
      "url_syntax" : null,
      "datatype" : null,
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "abbreviation" : "MI",
      "object" : "Interaction identifier",
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html"
   },
   "tgd" : {
      "name" : null,
      "url_example" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "abbreviation" : "TGD",
      "datatype" : null,
      "database" : "Tetrahymena Genome Database",
      "generic_url" : "http://www.ciliate.org/",
      "object" : null
   },
   "obi" : {
      "uri_prefix" : null,
      "example_id" : "OBI:0000038",
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_example" : null,
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://obi-ontology.org/page/Main_Page",
      "database" : "Ontology for Biomedical Investigations",
      "datatype" : null,
      "abbreviation" : "OBI"
   },
   "sgdid" : {
      "datatype" : null,
      "database" : "Saccharomyces Genome Database",
      "abbreviation" : "SGDID",
      "object" : "Identifier for SGD Loci",
      "generic_url" : "http://www.yeastgenome.org/",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=S000006169",
      "local_id_syntax" : "^S[0-9]{9}$",
      "name" : null,
      "example_id" : "SGD:S000006169",
      "id" : null,
      "uri_prefix" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=[example_id]"
   },
   "tigr_genprop" : {
      "entity_type" : "GO:0008150 ! biological process",
      "example_id" : "JCVI_GenProp:GenProp0120",
      "id" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "name" : null,
      "local_id_syntax" : "^GenProp[0-9]{4}$",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "object" : "Accession",
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "datatype" : null,
      "abbreviation" : "TIGR_GenProp"
   },
   "ncbi_gene" : {
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "NCBI_Gene:4771",
      "name" : null,
      "local_id_syntax" : "^\\d+$",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Identifier",
      "abbreviation" : "NCBI_Gene",
      "database" : "NCBI Gene",
      "datatype" : null
   },
   "tigr_egad" : {
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "fullname" : null,
      "example_id" : "JCVI_EGAD:74462",
      "uri_prefix" : null,
      "id" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "name" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "object" : "Accession",
      "abbreviation" : "TIGR_EGAD",
      "datatype" : null,
      "database" : "EGAD database at the J. Craig Venter Institute"
   },
   "resid" : {
      "database" : "RESID Database of Protein Modifications",
      "datatype" : null,
      "abbreviation" : "RESID",
      "object" : "Identifier",
      "generic_url" : "ftp://ftp.ncifcrf.gov/pub/users/residues/",
      "url_example" : null,
      "name" : null,
      "example_id" : "RESID:AA0062",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "asap" : {
      "fullname" : null,
      "url_syntax" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=[example_id]",
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "example_id" : "ASAP:ABE-0000008",
      "id" : null,
      "name" : null,
      "url_example" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=ABE-0000008",
      "generic_url" : "https://asap.ahabs.wisc.edu/annotation/php/ASAP1.htm",
      "object" : "Feature identifier",
      "abbreviation" : "ASAP",
      "database" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "datatype" : null
   },
   "mim" : {
      "fullname" : null,
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "id" : null,
      "example_id" : "OMIM:190198",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://omim.org/entry/190198",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "object" : "Identifier",
      "abbreviation" : "MIM",
      "database" : "Mendelian Inheritance in Man",
      "datatype" : null
   },
   "mod" : {
      "example_id" : "MOD:00219",
      "id" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "name" : null,
      "object" : "Protein modification identifier",
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "datatype" : null,
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "abbreviation" : "MOD"
   },
   "uniprotkb-subcell" : {
      "object" : "Identifier",
      "generic_url" : "http://www.uniprot.org/locations/",
      "datatype" : null,
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "abbreviation" : "UniProtKB-SubCell",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "name" : null,
      "url_example" : "http://www.uniprot.org/locations/SL-0012"
   },
   "ddanat" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "DDANAT:0000068",
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "local_id_syntax" : "[0-9]{7}",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://dictybase.org/Dicty_Info/dicty_anatomy_ontology.html",
      "database" : "Dictyostelium discoideum anatomy",
      "datatype" : null,
      "abbreviation" : "DDANAT"
   },
   "uniprotkb/trembl" : {
      "is_obsolete" : "true",
      "generic_url" : "http://www.uniprot.org",
      "object" : "Accession",
      "replaced_by" : "UniProtKB",
      "abbreviation" : "UniProtKB/TrEMBL",
      "description" : "UniProtKB-TrEMBL, a computer-annotated protein sequence database supplementing UniProtKB and containing the translations of all coding sequences (CDS) present in the EMBL Nucleotide Sequence Database but not yet integrated in UniProtKB/Swiss-Prot",
      "datatype" : null,
      "database" : "UniProtKB-TrEMBL protein sequence database",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "fullname" : null,
      "example_id" : "TrEMBL:O31124",
      "id" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/uniprot/O31124",
      "name" : null
   },
   "po_ref" : {
      "database" : "Plant Ontology custom references",
      "datatype" : null,
      "abbreviation" : "PO_REF",
      "object" : "Reference identifier",
      "generic_url" : "http://wiki.plantontology.org:8080/index.php/PO_references",
      "url_example" : "http://wiki.plantontology.org:8080/index.php/PO_REF:00001",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "PO_REF:00001",
      "id" : null,
      "url_syntax" : "http://wiki.plantontology.org:8080/index.php/PO_REF:[example_id]",
      "fullname" : null
   },
   "aracyc" : {
      "generic_url" : "http://www.arabidopsis.org/biocyc/index.jsp",
      "object" : "Identifier",
      "abbreviation" : "AraCyc",
      "database" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=[example_id]",
      "example_id" : "AraCyc:PWYQT-62",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=PWYQT-62"
   },
   "maizegdb" : {
      "example_id" : "MaizeGDB:881225",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=[example_id]",
      "name" : null,
      "url_example" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=881225",
      "object" : "MaizeGDB Object ID Number",
      "generic_url" : "http://www.maizegdb.org",
      "datatype" : null,
      "database" : "MaizeGDB",
      "abbreviation" : "MaizeGDB"
   },
   "cas_spc" : {
      "abbreviation" : "CAS_SPC",
      "database" : "Catalog of Fishes species database",
      "datatype" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "object" : "Identifier",
      "name" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "fullname" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : null
   },
   "wbbt" : {
      "entity_type" : "WBbt:0005766 ! anatomy",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "WBbt:0005733",
      "url_syntax" : null,
      "fullname" : null,
      "name" : null,
      "local_id_syntax" : "[0-9]{7}",
      "url_example" : null,
      "object" : "Identifier",
      "generic_url" : "http://www.wormbase.org/",
      "datatype" : null,
      "database" : "C. elegans gross anatomy",
      "abbreviation" : "WBbt"
   },
   "ec" : {
      "abbreviation" : "EC",
      "datatype" : null,
      "database" : "Enzyme Commission",
      "generic_url" : "http://www.chem.qmul.ac.uk/iubmb/enzyme/",
      "! url_example" : "http://www.chem.qmw.ac.uk/iubmb/enzyme/EC1/4/3/6.html",
      "object" : null,
      "url_example" : "http://www.expasy.org/enzyme/1.4.3.6",
      "name" : null,
      "url_syntax" : "http://www.expasy.org/enzyme/[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "EC:1.4.3.6",
      "id" : null,
      "entity_type" : "GO:0003824 ! catalytic activity"
   },
   "modbase" : {
      "generic_url" : "http://modbase.compbio.ucsf.edu/ ",
      "object" : "Accession",
      "abbreviation" : "ModBase",
      "datatype" : null,
      "database" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "fullname" : null,
      "url_syntax" : "http://salilab.org/modbase/searchbyid?databaseID=[example_id]",
      "example_id" : "ModBase:P10815",
      "uri_prefix" : null,
      "id" : null,
      "url_example" : "http://salilab.org/modbase/searchbyid?databaseID=P04848",
      "name" : null
   },
   "smd" : {
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "url_example" : null,
      "name" : null,
      "generic_url" : "http://genome-www.stanford.edu/microarray",
      "object" : null,
      "abbreviation" : "SMD",
      "database" : "Stanford Microarray Database",
      "datatype" : null
   },
   "dictybase" : {
      "fullname" : null,
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "dictyBase:DDB_G0277859",
      "name" : null,
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "local_id_syntax" : "^DDB_G[0-9]{7}$",
      "generic_url" : "http://dictybase.org",
      "object" : "Identifier",
      "abbreviation" : "DictyBase",
      "datatype" : null,
      "database" : "dictyBase"
   },
   "pfamb" : {
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "object" : "Accession",
      "abbreviation" : "PfamB",
      "database" : "Pfam-B supplement to Pfam",
      "datatype" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "PfamB:PB014624",
      "id" : null,
      "url_example" : null,
      "name" : null
   },
   "gr_protein" : {
      "url_syntax" : "http://www.gramene.org/db/protein/protein_search?acc=[example_id]",
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein",
      "uri_prefix" : null,
      "example_id" : "GR_PROTEIN:Q6VSV0",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/protein/protein_search?acc=Q6VSV0",
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]$",
      "generic_url" : "http://www.gramene.org/",
      "object" : "Protein identifier",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_protein",
      "database" : null,
      "datatype" : null
   },
   "tgd_locus" : {
      "url_example" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=PDD1",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=[example_id]",
      "uri_prefix" : null,
      "example_id" : "TGD_LOCUS:PDD1",
      "id" : null,
      "abbreviation" : "TGD_LOCUS",
      "database" : "Tetrahymena Genome Database",
      "datatype" : null,
      "generic_url" : "http://www.ciliate.org/",
      "object" : "Gene name (gene symbol in mammalian nomenclature)"
   },
   "psort" : {
      "database" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "datatype" : null,
      "abbreviation" : "PSORT",
      "object" : null,
      "generic_url" : "http://www.psort.org/",
      "url_example" : null,
      "name" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "bfo" : {
      "abbreviation" : "BFO",
      "description" : "An upper ontology used by Open Bio Ontologies (OBO) Foundry. BFO contains upper-level classes as well as core relations such as part_of (BFO_0000050)",
      "database" : "Basic Formal Ontology",
      "datatype" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/bfo",
      "object" : null,
      "url_example" : "http://purl.obolibrary.org/obo/BFO_0000066",
      "name" : null,
      "url_syntax" : "http://purl.obolibrary.org/obo/BFO_[example_id]",
      "fullname" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "BFO:0000066"
   },
   "yeastfunc" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://func.med.harvard.edu/yeast/",
      "database" : "Yeast Function",
      "datatype" : null,
      "abbreviation" : "YeastFunc"
   },
   "maizegdb_locus" : {
      "local_id_syntax" : "^[A-Za-z][A-Za-z0-9]*$",
      "url_example" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=ZmPK1",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "MaizeGDB_Locus:ZmPK1",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=[example_id]",
      "database" : "MaizeGDB",
      "datatype" : null,
      "abbreviation" : "MaizeGDB_Locus",
      "object" : "Maize gene name",
      "generic_url" : "http://www.maizegdb.org"
   },
   "phenoscape" : {
      "url_example" : null,
      "name" : null,
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "PhenoScape",
      "database" : "PhenoScape Knowledgebase",
      "datatype" : null,
      "generic_url" : "http://phenoscape.org/",
      "object" : null
   },
   "casref" : {
      "example_id" : "CASREF:2031",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=[example_id]",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=2031",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "datatype" : null,
      "database" : "Catalog of Fishes publications database",
      "abbreviation" : "CASREF"
   },
   "ipr" : {
      "abbreviation" : "IPR",
      "database" : "InterPro database of protein domains and motifs",
      "datatype" : null,
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "object" : "Identifier",
      "local_id_syntax" : "^IPR\\d{6}$",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "id" : null,
      "example_id" : "InterPro:IPR000001",
      "uri_prefix" : null,
      "entity_type" : "SO:0000839 ! polypeptide region"
   },
   "interpro" : {
      "database" : "InterPro database of protein domains and motifs",
      "datatype" : null,
      "abbreviation" : "INTERPRO",
      "object" : "Identifier",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "local_id_syntax" : "^IPR\\d{6}$",
      "name" : null,
      "id" : null,
      "example_id" : "InterPro:IPR000001",
      "uri_prefix" : null,
      "entity_type" : "SO:0000839 ! polypeptide region",
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]"
   },
   "tigr_ath1" : {
      "database" : "Arabidopsis thaliana database at the J. Craig Venter Institute",
      "datatype" : null,
      "abbreviation" : "TIGR_Ath1",
      "object" : "Accession",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/ath1/ath1.shtml",
      "is_obsolete" : "true",
      "url_example" : null,
      "name" : null,
      "example_id" : "JCVI_Ath1:At3g01440",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "rfam" : {
      "url_example" : "http://rfam.sanger.ac.uk/family/RF00012",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "Rfam:RF00012",
      "url_syntax" : "http://rfam.sanger.ac.uk/family/[example_id]",
      "fullname" : null,
      "datatype" : null,
      "database" : "Rfam database of RNA families",
      "abbreviation" : "Rfam",
      "object" : "accession",
      "generic_url" : "http://rfam.sanger.ac.uk/"
   },
   "mgd" : {
      "! url_syntax" : "http://www.informatics.jax.org/searches/marker.cgi?",
      "object" : "Gene symbol",
      "generic_url" : "http://www.informatics.jax.org/",
      "database" : "Mouse Genome Database",
      "datatype" : null,
      "abbreviation" : "MGD",
      "example_id" : "MGD:Adcy9",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "name" : null,
      "url_example" : null
   },
   "fma" : {
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "FMA:61905",
      "id" : null,
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://sig.biostr.washington.edu/projects/fm/index.html",
      "object" : "Identifier",
      "abbreviation" : "FMA",
      "database" : "Foundational Model of Anatomy",
      "datatype" : null
   },
   "go" : {
      "object" : "Identifier",
      "generic_url" : "http://amigo.geneontology.org/",
      "database" : "Gene Ontology Database",
      "datatype" : null,
      "abbreviation" : "GO",
      "uri_prefix" : null,
      "example_id" : "GO:0004352",
      "id" : null,
      "entity_type" : "GO:0032991 ! macromolecular complex",
      "fullname" : null,
      "url_syntax" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:[example_id]",
      "url_example" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:0004352",
      "local_id_syntax" : "^\\d{7}$",
      "name" : null
   },
   "protein_id" : {
      "url_syntax" : null,
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein",
      "uri_prefix" : null,
      "example_id" : "protein_id:CAA71991",
      "id" : null,
      "name" : null,
      "url_example" : null,
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "object" : "Identifier",
      "abbreviation" : "protein_id",
      "database" : "DDBJ / ENA / GenBank",
      "datatype" : null,
      "description" : "protein identifier shared by DDBJ/EMBL-bank/GenBank nucleotide sequence databases"
   },
   "ptarget" : {
      "url_example" : null,
      "name" : null,
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "pTARGET",
      "database" : "pTARGET Prediction server for protein subcellular localization",
      "datatype" : null,
      "generic_url" : "http://bioinformatics.albany.edu/~ptarget/",
      "object" : null
   },
   "genedb_gmorsitans" : {
      "fullname" : null,
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=glossina&name=[example_id]",
      "uri_prefix" : null,
      "example_id" : "GeneDB_Gmorsitans:Gmm-0142",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=glossina&name=Gmm-0142",
      "shorthand_name" : "Tsetse",
      "is_obsolete" : "true",
      "generic_url" : "http://www.genedb.org/genedb/glossina/",
      "replaced_by" : "GeneDB",
      "object" : "Gene identifier",
      "abbreviation" : "GeneDB_Gmorsitans",
      "database" : "Glossina morsitans GeneDB",
      "datatype" : null
   },
   "parkinsonsuk-ucl" : {
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology",
      "object" : null,
      "abbreviation" : "ParkinsonsUK-UCL",
      "datatype" : null,
      "database" : "Parkinsons Disease Gene Ontology Initiative"
   },
   "jcvi_genprop" : {
      "fullname" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "entity_type" : "GO:0008150 ! biological process",
      "uri_prefix" : null,
      "example_id" : "JCVI_GenProp:GenProp0120",
      "id" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "local_id_syntax" : "^GenProp[0-9]{4}$",
      "generic_url" : "http://cmr.jcvi.org/",
      "object" : "Accession",
      "abbreviation" : "JCVI_GenProp",
      "datatype" : null,
      "database" : "Genome Properties database at the J. Craig Venter Institute"
   },
   "embl" : {
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "url_example" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=AA816246",
      "name" : null,
      "url_syntax" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "EMBL:AA816246",
      "entity_type" : "SO:0000704 ! gene",
      "abbreviation" : "EMBL",
      "description" : "International nucleotide sequence database collaboration, comprising EMBL-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "database" : "EMBL Nucleotide Sequence Database",
      "datatype" : null,
      "generic_url" : "http://www.ebi.ac.uk/embl/",
      "object" : "Sequence accession"
   },
   "genbank" : {
      "local_id_syntax" : "^[A-Z]{2}[0-9]{6}$",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "name" : null,
      "example_id" : "GB:AA816246",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "description" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "datatype" : null,
      "database" : "GenBank",
      "abbreviation" : "GenBank",
      "object" : "Sequence accession",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/"
   },
   "vz" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "VZ:957",
      "fullname" : null,
      "url_syntax" : "http://viralzone.expasy.org/all_by_protein/[example_id].html",
      "url_example" : "http://viralzone.expasy.org/all_by_protein/957.html",
      "name" : null,
      "object" : "Page Reference Identifier",
      "generic_url" : "http://viralzone.expasy.org/",
      "database" : "ViralZone",
      "datatype" : null,
      "abbreviation" : "VZ"
   },
   "cgd_locus" : {
      "uri_prefix" : null,
      "example_id" : "CGD_LOCUS:HWP1",
      "id" : null,
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=HWP1",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "generic_url" : "http://www.candidagenome.org/",
      "datatype" : null,
      "database" : "Candida Genome Database",
      "abbreviation" : "CGD_LOCUS"
   },
   "wb_ref" : {
      "datatype" : null,
      "database" : "WormBase database of nematode biology",
      "abbreviation" : "WB_REF",
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://www.wormbase.org/",
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/misc/paper?name=WBPaper00004823",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "WB_REF:WBPaper00004823",
      "url_syntax" : "http://www.wormbase.org/db/misc/paper?name=[example_id]",
      "fullname" : null
   },
   "pseudocap" : {
      "fullname" : null,
      "url_syntax" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=[example_id]",
      "uri_prefix" : null,
      "example_id" : "PseudoCAP:PA4756",
      "id" : null,
      "name" : null,
      "url_example" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=PA4756",
      "generic_url" : "http://v2.pseudomonas.com/",
      "object" : "Identifier",
      "abbreviation" : "PseudoCAP",
      "database" : "Pseudomonas Genome Project",
      "datatype" : null
   },
   "roslin_institute" : {
      "abbreviation" : "Roslin_Institute",
      "datatype" : null,
      "database" : "Roslin Institute",
      "generic_url" : "http://www.roslin.ac.uk/",
      "object" : null,
      "name" : null,
      "url_example" : null,
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null
   },
   "apidb_plasmodb" : {
      "object" : "PlasmoDB Gene ID",
      "generic_url" : "http://plasmodb.org/",
      "datatype" : null,
      "database" : "PlasmoDB Plasmodium Genome Resource",
      "abbreviation" : "ApiDB_PlasmoDB",
      "uri_prefix" : null,
      "example_id" : "ApiDB_PlasmoDB:PF11_0344",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.plasmodb.org/gene/[example_id]",
      "name" : null,
      "url_example" : "http://www.plasmodb.org/gene/PF11_0344"
   },
   "gr" : {
      "fullname" : null,
      "url_syntax" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=[example_id]",
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "GR:sd1",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]$",
      "url_example" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=sd1",
      "generic_url" : "http://www.gramene.org/",
      "object" : "Identifier (any)",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR",
      "datatype" : null,
      "database" : null
   },
   "ncbitaxon" : {
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "taxon:7227",
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "database" : "NCBI Taxonomy",
      "datatype" : null,
      "abbreviation" : "NCBITaxon"
   },
   "cas_gen" : {
      "id" : null,
      "example_id" : "CASGEN:1040",
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "database" : "Catalog of Fishes genus database",
      "datatype" : null,
      "abbreviation" : "CAS_GEN"
   },
   "cog" : {
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null,
      "abbreviation" : "COG",
      "datatype" : null,
      "database" : "NCBI Clusters of Orthologous Groups",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "object" : null
   },
   "cdd" : {
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=cdd",
      "datatype" : null,
      "database" : "Conserved Domain Database at NCBI",
      "abbreviation" : "CDD",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "CDD:34222",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=[example_id]",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=34222",
      "name" : null
   },
   "gr_ref" : {
      "generic_url" : "http://www.gramene.org/",
      "object" : "Reference",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_REF",
      "datatype" : null,
      "database" : null,
      "fullname" : null,
      "url_syntax" : "http://www.gramene.org/db/literature/pub_search?ref_id=[example_id]",
      "example_id" : "GR_REF:659",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/literature/pub_search?ref_id=659"
   },
   "agricola_ind" : {
      "abbreviation" : "AGRICOLA_IND",
      "database" : "AGRICultural OnLine Access",
      "datatype" : null,
      "generic_url" : "http://agricola.nal.usda.gov/",
      "object" : "AGRICOLA IND number",
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "example_id" : "AGRICOLA_IND:IND23252955",
      "id" : null
   },
   "ensemblfungi" : {
      "name" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/YOR197W",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "example_id" : "EnsemblFungi:YOR197W",
      "id" : null,
      "abbreviation" : "EnsemblFungi",
      "database" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "datatype" : null,
      "generic_url" : "http://fungi.ensembl.org/",
      "object" : "Identifier"
   },
   "mips_funcat" : {
      "url_example" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=11.02",
      "name" : null,
      "url_syntax" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=[example_id]",
      "fullname" : null,
      "example_id" : "MIPS_funcat:11.02",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "MIPS_funcat",
      "database" : "MIPS Functional Catalogue",
      "datatype" : null,
      "generic_url" : "http://mips.gsf.de/proj/funcatDB/",
      "object" : "Identifier"
   },
   "trembl" : {
      "object" : "Accession",
      "replaced_by" : "UniProtKB",
      "is_obsolete" : "true",
      "generic_url" : "http://www.uniprot.org",
      "description" : "UniProtKB-TrEMBL, a computer-annotated protein sequence database supplementing UniProtKB and containing the translations of all coding sequences (CDS) present in the EMBL Nucleotide Sequence Database but not yet integrated in UniProtKB/Swiss-Prot",
      "database" : "UniProtKB-TrEMBL protein sequence database",
      "datatype" : null,
      "abbreviation" : "TrEMBL",
      "uri_prefix" : null,
      "example_id" : "TrEMBL:O31124",
      "id" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "fullname" : null,
      "url_example" : "http://www.uniprot.org/uniprot/O31124",
      "name" : null
   },
   "aspgd" : {
      "generic_url" : "http://www.aspergillusgenome.org/",
      "object" : "Identifier for AspGD Loci",
      "abbreviation" : "AspGD",
      "database" : "Aspergillus Genome Database",
      "datatype" : null,
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "fullname" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "AspGD:ASPL0000067538",
      "entity_type" : "SO:0000704 ! gene",
      "local_id_syntax" : "^ASPL[0-9]{10}$",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "name" : null
   },
   "uniprotkb/swiss-prot" : {
      "is_obsolete" : "true",
      "generic_url" : "http://www.uniprot.org",
      "replaced_by" : "UniProtKB",
      "object" : "Accession",
      "abbreviation" : "UniProtKB/Swiss-Prot",
      "datatype" : null,
      "database" : "UniProtKB/Swiss-Prot",
      "description" : "A curated protein sequence database which provides a high level of annotation and a minimal level of redundancy",
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "example_id" : "Swiss-Prot:P51587",
      "id" : null,
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniprot/P51587"
   },
   "ecocyc_ref" : {
      "url_example" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=COLISALII",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=[example_id]",
      "uri_prefix" : null,
      "example_id" : "EcoCyc_REF:COLISALII",
      "id" : null,
      "abbreviation" : "ECOCYC_REF",
      "datatype" : null,
      "database" : "Encyclopedia of E. coli metabolism",
      "generic_url" : "http://ecocyc.org/",
      "object" : "Reference identifier"
   },
   "ena" : {
      "object" : "Sequence accession",
      "generic_url" : "http://www.ebi.ac.uk/ena/",
      "datatype" : null,
      "database" : "European Nucleotide Archive",
      "description" : "ENA is made up of a number of distinct databases that includes EMBL-Bank, the newly established Sequence Read Archive (SRA) and the Trace Archive. International nucleotide sequence database collaboration, comprising ENA-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "abbreviation" : "ENA",
      "example_id" : "ENA:AA816246",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/ena/data/view/[example_id]",
      "name" : null,
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "url_example" : "http://www.ebi.ac.uk/ena/data/view/AA816246"
   },
   "ddb" : {
      "abbreviation" : "DDB",
      "database" : "dictyBase",
      "datatype" : null,
      "generic_url" : "http://dictybase.org",
      "object" : "Identifier",
      "name" : null,
      "local_id_syntax" : "^DDB_G[0-9]{7}$",
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "dictyBase:DDB_G0277859"
   },
   "jcvi_pfa1" : {
      "name" : null,
      "url_example" : null,
      "example_id" : "JCVI_Pfa1:PFB0010w",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "datatype" : null,
      "database" : "Plasmodium falciparum database at the J. Craig Venter Institute",
      "abbreviation" : "JCVI_Pfa1",
      "object" : "Accession",
      "is_obsolete" : "true",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/pfa1/pfa1.shtml"
   },
   "eurofung" : {
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "name" : null,
      "url_example" : null,
      "object" : null,
      "generic_url" : "http://www.eurofung.net/option=com_content&task=section&id=3&Itemid=4",
      "database" : "Eurofungbase community annotation",
      "datatype" : null,
      "abbreviation" : "Eurofung"
   },
   "tgd_ref" : {
      "name" : null,
      "url_example" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=T000005818",
      "uri_prefix" : null,
      "example_id" : "TGD_REF:T000005818",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "database" : "Tetrahymena Genome Database",
      "datatype" : null,
      "abbreviation" : "TGD_REF",
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://www.ciliate.org/"
   },
   "uniprot" : {
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "id" : null,
      "example_id" : "UniProtKB:P51587",
      "uri_prefix" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "local_id_syntax" : "^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z]([0-9][A-Z][A-Z0-9]{2}){1,2}[0-9])((-[0-9]+)|:PRO_[0-9]{10}|:VAR_[0-9]{6}){0,1}$",
      "name" : null,
      "generic_url" : "http://www.uniprot.org",
      "object" : "Accession",
      "abbreviation" : "UniProt",
      "description" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "database" : "Universal Protein Knowledgebase",
      "datatype" : null
   },
   "um-bbd_enzymeid" : {
      "datatype" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "abbreviation" : "UM-BBD_enzymeID",
      "object" : "Enzyme identifier",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=e0230",
      "uri_prefix" : null,
      "example_id" : "UM-BBD_enzymeID:e0413",
      "id" : null,
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=[example_id]",
      "fullname" : null
   },
   "tigr" : {
      "example_id" : null,
      "id" : null,
      "uri_prefix" : null,
      "url_syntax" : null,
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : null,
      "generic_url" : "http://www.jcvi.org/",
      "database" : "J. Craig Venter Institute",
      "datatype" : null,
      "abbreviation" : "TIGR"
   },
   "iuphar_gpcr" : {
      "example_id" : "IUPHAR_GPCR:1279",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=[example_id]",
      "url_example" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=13",
      "name" : null,
      "object" : "G-protein-coupled receptor family identifier",
      "generic_url" : "http://www.iuphar.org/",
      "database" : "International Union of Pharmacology",
      "datatype" : null,
      "abbreviation" : "IUPHAR_GPCR"
   },
   "ensembl_geneid" : {
      "url_example" : "http://www.ensembl.org/id/ENSG00000126016",
      "local_id_syntax" : "^ENSG[0-9]{9,16}$",
      "name" : null,
      "example_id" : "ENSEMBL_GeneID:ENSG00000126016",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "database" : "Ensembl database of automatically annotated genomic data",
      "datatype" : null,
      "abbreviation" : "ENSEMBL_GeneID",
      "object" : "Gene identifier",
      "generic_url" : "http://www.ensembl.org/"
   },
   "jstor" : {
      "generic_url" : "http://www.jstor.org/",
      "object" : "journal article",
      "abbreviation" : "JSTOR",
      "datatype" : null,
      "database" : "Digital archive of scholarly articles",
      "url_syntax" : "http://www.jstor.org/stable/[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "JSTOR:3093870",
      "id" : null,
      "url_example" : "http://www.jstor.org/stable/3093870",
      "name" : null
   },
   "imgt_ligm" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "IMGT_LIGM:U03895",
      "fullname" : null,
      "url_syntax" : null,
      "name" : null,
      "url_example" : null,
      "object" : null,
      "generic_url" : "http://imgt.cines.fr",
      "database" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "datatype" : null,
      "description" : "Database of immunoglobulins and T cell receptors from human and other vertebrates, with translation for fully annotated sequences.",
      "abbreviation" : "IMGT_LIGM"
   },
   "paint_ref" : {
      "abbreviation" : "PAINT_REF",
      "database" : "Phylogenetic Annotation INference Tool References",
      "datatype" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "object" : "Reference locator",
      "name" : null,
      "url_example" : "http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt",
      "fullname" : null,
      "url_syntax" : "http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt",
      "example_id" : "PAINT_REF:PTHR10046",
      "uri_prefix" : null,
      "id" : null
   },
   "sgd" : {
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "SGD:S000006169",
      "fullname" : null,
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "name" : null,
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=S000006169",
      "local_id_syntax" : "^S[0-9]{9}$",
      "object" : "Identifier for SGD Loci",
      "generic_url" : "http://www.yeastgenome.org/",
      "datatype" : null,
      "database" : "Saccharomyces Genome Database",
      "abbreviation" : "SGD"
   },
   "kegg" : {
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "database" : "Kyoto Encyclopedia of Genes and Genomes",
      "datatype" : null,
      "abbreviation" : "KEGG",
      "object" : "identifier",
      "generic_url" : "http://www.genome.ad.jp/kegg/"
   },
   "ensemblplants" : {
      "name" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "fullname" : null,
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "abbreviation" : "EnsemblPlants",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "datatype" : null,
      "generic_url" : "http://plants.ensembl.org/",
      "object" : "Identifier"
   },
   "geneid" : {
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "database" : "NCBI Gene",
      "datatype" : null,
      "abbreviation" : "GeneID",
      "example_id" : "NCBI_Gene:4771",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "local_id_syntax" : "^\\d+$",
      "name" : null
   },
   "gr_qtl" : {
      "name" : null,
      "url_example" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=CQU7",
      "uri_prefix" : null,
      "example_id" : "GR_QTL:CQU7",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=[example_id]",
      "database" : null,
      "datatype" : null,
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_QTL",
      "object" : "QTL identifier",
      "generic_url" : "http://www.gramene.org/"
   },
   "mgi" : {
      "generic_url" : "http://www.informatics.jax.org/",
      "object" : "Accession",
      "abbreviation" : "MGI",
      "datatype" : null,
      "database" : "Mouse Genome Informatics",
      "fullname" : null,
      "url_syntax" : "http://www.informatics.jax.org/accession/[example_id]",
      "entity_type" : "VariO:0001 ! variation",
      "uri_prefix" : null,
      "example_id" : "MGI:MGI:80863",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.informatics.jax.org/accession/MGI:80863",
      "local_id_syntax" : "^MGI:[0-9]{5,}$"
   },
   "sgn" : {
      "url_example" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=4476",
      "name" : null,
      "example_id" : "SGN:4476",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "url_syntax" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=[example_id]",
      "fullname" : null,
      "database" : "Sol Genomics Network",
      "datatype" : null,
      "abbreviation" : "SGN",
      "object" : "Gene identifier",
      "generic_url" : "http://www.sgn.cornell.edu/"
   },
   "dictybase_ref" : {
      "name" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "dictyBase_REF:10157",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "fullname" : null,
      "datatype" : null,
      "database" : "dictyBase literature references",
      "abbreviation" : "dictyBase_REF",
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://dictybase.org"
   },
   "vida" : {
      "datatype" : null,
      "database" : "Virus Database at University College London",
      "abbreviation" : "VIDA",
      "object" : null,
      "generic_url" : "http://www.biochem.ucl.ac.uk/bsm/virus_database/VIDA.html",
      "url_example" : null,
      "name" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "wp" : {
      "abbreviation" : "WP",
      "datatype" : null,
      "database" : "Wormpep database of proteins of C. elegans",
      "generic_url" : "http://www.wormbase.org/",
      "is_obsolete" : "true",
      "object" : "Identifier",
      "url_example" : "http://www.wormbase.org/db/get?class=Protein;name=WP:CE15104",
      "name" : null,
      "url_syntax" : "http://www.wormbase.org/db/get?class=Protein;name=WP:[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "WP:CE25104",
      "id" : null
   },
   "genedb" : {
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "PF3D7_1467300",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://www.genedb.org/gene/[example_id]",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/gene/PF3D7_1467300",
      "local_id_syntax" : "^Tb\\d+\\.[A-Za-z0-9]+\\.\\d+$",
      "object" : "Identifier",
      "generic_url" : "http://www.genedb.org/gene/",
      "datatype" : null,
      "database" : "GeneDB",
      "abbreviation" : "GeneDB"
   },
   "agi_locuscode" : {
      "generic_url" : "http://www.arabidopsis.org",
      "description" : "Comprises TAIR, TIGR and MIPS",
      "datatype" : null,
      "database" : "Arabidopsis Genome Initiative",
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_example" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=At2g17950",
      "!url_example" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=At2g17950",
      "name" : null,
      "object" : "Locus identifier",
      "abbreviation" : "AGI_LocusCode",
      "id" : null,
      "example_id" : "AGI_LocusCode:At2g17950",
      "uri_prefix" : null,
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=[example_id]",
      "!url_syntax" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=[example_id]",
      "local_id_syntax" : "^AT[MC0-5]G[0-9]{5}(\\.[0-9]{1})?$"
   },
   "pamgo_vmd" : {
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=109198",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "PAMGO_VMD:109198",
      "id" : null,
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=[example_id]",
      "fullname" : null,
      "description" : "Virginia Bioinformatics Institute Microbial Database; member of PAMGO Interest Group",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "datatype" : null,
      "abbreviation" : "PAMGO_VMD",
      "object" : "Gene identifier",
      "generic_url" : "http://phytophthora.vbi.vt.edu"
   },
   "po" : {
      "local_id_syntax" : "^[0-9]{7}$",
      "url_example" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:0009004",
      "name" : null,
      "url_syntax" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:[example_id]",
      "fullname" : null,
      "example_id" : "PO:0009004",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "PO:0009012 ! plant structure development stage ",
      "abbreviation" : "PO",
      "database" : "Plant Ontology Consortium Database",
      "datatype" : null,
      "generic_url" : "http://www.plantontology.org/",
      "object" : "Identifier"
   },
   "refgenome" : {
      "database" : "GO Reference Genomes",
      "datatype" : null,
      "abbreviation" : "RefGenome",
      "object" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "ensembl_transcriptid" : {
      "datatype" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "abbreviation" : "ENSEMBL_TranscriptID",
      "object" : "Transcript identifier",
      "generic_url" : "http://www.ensembl.org/",
      "local_id_syntax" : "^ENST[0-9]{9,16}$",
      "url_example" : "http://www.ensembl.org/id/ENST00000371959",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "ENSEMBL_TranscriptID:ENST00000371959",
      "id" : null,
      "entity_type" : "SO:0000673 ! transcript",
      "fullname" : null,
      "url_syntax" : "http://www.ensembl.org/id/[example_id]"
   },
   "syscilia_ccnet" : {
      "name" : null,
      "url_example" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "datatype" : null,
      "database" : "Syscilia",
      "description" : "A systems biology approach to dissect cilia function and its disruption in human genetic disease",
      "abbreviation" : "SYSCILIA_CCNET",
      "object" : null,
      "generic_url" : "http://syscilia.org/"
   },
   "patric" : {
      "name" : null,
      "url_example" : "http://patric.vbi.vt.edu/gene/overview.php?fid=cds.000002.436951",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "PATRIC:cds.000002.436951",
      "url_syntax" : "http://patric.vbi.vt.edu/gene/overview.php?fid=[example_id]",
      "fullname" : null,
      "datatype" : null,
      "database" : "PathoSystems Resource Integration Center",
      "description" : "PathoSystems Resource Integration Center at the Virginia Bioinformatics Institute",
      "abbreviation" : "PATRIC",
      "object" : "Feature identifier",
      "generic_url" : "http://patric.vbi.vt.edu"
   },
   "iuphar" : {
      "object" : null,
      "generic_url" : "http://www.iuphar.org/",
      "datatype" : null,
      "database" : "International Union of Pharmacology",
      "abbreviation" : "IUPHAR",
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "url_example" : null,
      "name" : null
   },
   "jcvi" : {
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://www.jcvi.org/",
      "object" : null,
      "abbreviation" : "JCVI",
      "database" : "J. Craig Venter Institute",
      "datatype" : null
   },
   "pamgo_mgg" : {
      "url_example" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=MGG_05132",
      "name" : null,
      "example_id" : "PAMGO_MGG:MGG_05132",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=[example_id]",
      "description" : "Magnaporthe grisea database at North Carolina State University; member of PAMGO Interest Group",
      "datatype" : null,
      "database" : "Magnaporthe grisea database",
      "abbreviation" : "PAMGO_MGG",
      "object" : "Locus",
      "generic_url" : "http://scotland.fgl.ncsu.edu/smeng/GoAnnotationMagnaporthegrisea.html"
   },
   "nmpdr" : {
      "url_example" : "http://www.nmpdr.org/linkin.cgi?id=fig|306254.1.peg.183",
      "name" : null,
      "url_syntax" : "http://www.nmpdr.org/linkin.cgi?id=[example_id]",
      "fullname" : null,
      "example_id" : "NMPDR:fig|306254.1.peg.183",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "NMPDR",
      "datatype" : null,
      "database" : "National Microbial Pathogen Data Resource",
      "generic_url" : "http://www.nmpdr.org",
      "object" : "Identifier"
   },
   "nasc_code" : {
      "object" : "NASC code Identifier",
      "generic_url" : "http://arabidopsis.info",
      "database" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "datatype" : null,
      "abbreviation" : "NASC_code",
      "uri_prefix" : null,
      "example_id" : "NASC_code:N3371",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=[example_id]",
      "name" : null,
      "url_example" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=N3371"
   },
   "jcvi_ath1" : {
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "JCVI_Ath1:At3g01440",
      "url_syntax" : null,
      "fullname" : null,
      "database" : "Arabidopsis thaliana database at the J. Craig Venter Institute",
      "datatype" : null,
      "abbreviation" : "JCVI_Ath1",
      "object" : "Accession",
      "is_obsolete" : "true",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/ath1/ath1.shtml"
   },
   "psi-mod" : {
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "object" : "Protein modification identifier",
      "abbreviation" : "PSI-MOD",
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "MOD:00219",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "name" : null
   },
   "fb" : {
      "name" : null,
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "local_id_syntax" : "^FBgn[0-9]{7}$",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "example_id" : "FB:FBgn0000024",
      "id" : null,
      "abbreviation" : "FB",
      "datatype" : null,
      "database" : "FlyBase",
      "generic_url" : "http://flybase.org/",
      "object" : "Identifier"
   },
   "tigr_tigrfams" : {
      "object" : "Accession",
      "generic_url" : "http://search.jcvi.org/",
      "datatype" : null,
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "abbreviation" : "TIGR_TIGRFAMS",
      "id" : null,
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "uri_prefix" : null,
      "entity_type" : "SO:0000839 ! polypeptide region",
      "fullname" : null,
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "name" : null
   },
   "ncbi_gi" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=113194944",
      "local_id_syntax" : "^[0-9]{6,}$",
      "name" : null,
      "example_id" : "NCBI_gi:113194944",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : null,
      "database" : "NCBI databases",
      "abbreviation" : "NCBI_gi",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "refseq" : {
      "datatype" : null,
      "database" : "RefSeq",
      "abbreviation" : "RefSeq",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=XP_001068954",
      "local_id_syntax" : "^(NC|AC|NG|NT|NW|NZ|NM|NR|XM|XR|NP|AP|XP|ZP)_\\d+$",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "RefSeq:XP_001068954",
      "entity_type" : "PR:000000001 ! protein",
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]"
   },
   "pamgo" : {
      "name" : null,
      "url_example" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "database" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "datatype" : null,
      "abbreviation" : "PAMGO",
      "object" : null,
      "generic_url" : "http://pamgo.vbi.vt.edu/"
   },
   "wb" : {
      "object" : "Gene identifier",
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase database of nematode biology",
      "datatype" : null,
      "abbreviation" : "WB",
      "entity_type" : "PR:000000001 ! protein",
      "uri_prefix" : null,
      "example_id" : "WB:WBGene00003001",
      "id" : null,
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "local_id_syntax" : "^WB(Gene|Var|RNAi|Transgene)[0-9]{8}$"
   },
   "unigene" : {
      "abbreviation" : "UniGene",
      "description" : "NCBI transcript cluster database, organized by transcriptome. Each UniGene entry is a set of transcript sequences that appear to come from the same transcription locus (gene or expressed pseudogene).",
      "database" : "UniGene",
      "datatype" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/UniGene",
      "object" : "Identifier (for transcript cluster)",
      "url_example" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=Hs&CID=212293",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=[organism_abbreviation]&CID=[cluster_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "UniGene:Hs.212293"
   },
   "fbbt" : {
      "url_example" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:00005177",
      "name" : null,
      "url_syntax" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "FBbt:00005177",
      "id" : null,
      "abbreviation" : "FBbt",
      "database" : "Drosophila gross anatomy",
      "datatype" : null,
      "generic_url" : "http://flybase.org/",
      "object" : "Identifier"
   },
   "h-invdb_locus" : {
      "datatype" : null,
      "database" : "H-invitational Database",
      "abbreviation" : "H-invDB_locus",
      "object" : "Cluster identifier",
      "generic_url" : "http://www.h-invitational.jp/",
      "name" : null,
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=HIX0014446",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "H-invDB_locus:HIX0014446",
      "fullname" : null,
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=[example_id]"
   },
   "mitre" : {
      "object" : null,
      "generic_url" : "http://www.mitre.org/",
      "datatype" : null,
      "database" : "The MITRE Corporation",
      "abbreviation" : "MITRE",
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "name" : null,
      "url_example" : null
   },
   "mengo" : {
      "object" : null,
      "generic_url" : "http://mengo.vbi.vt.edu/",
      "datatype" : null,
      "database" : "Microbial ENergy processes Gene Ontology Project",
      "abbreviation" : "MENGO",
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "name" : null,
      "url_example" : null
   },
   "h-invdb" : {
      "abbreviation" : "H-invDB",
      "datatype" : null,
      "database" : "H-invitational Database",
      "generic_url" : "http://www.h-invitational.jp/",
      "object" : null,
      "name" : null,
      "url_example" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null
   },
   "poc" : {
      "url_example" : null,
      "name" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "datatype" : null,
      "database" : "Plant Ontology Consortium",
      "abbreviation" : "POC",
      "object" : null,
      "generic_url" : "http://www.plantontology.org/"
   },
   "ddb_ref" : {
      "id" : null,
      "example_id" : "dictyBase_REF:10157",
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "name" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://dictybase.org",
      "datatype" : null,
      "database" : "dictyBase literature references",
      "abbreviation" : "DDB_REF"
   },
   "subtilistg" : {
      "name" : null,
      "url_example" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "SUBTILISTG:accC",
      "url_syntax" : null,
      "fullname" : null,
      "datatype" : null,
      "database" : "Bacillus subtilis Genome Sequence Project",
      "abbreviation" : "SUBTILISTG",
      "object" : "Gene symbol",
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/"
   },
   "medline" : {
      "generic_url" : "http://www.nlm.nih.gov/databases/databases_medline.html",
      "object" : "Identifier",
      "abbreviation" : "MEDLINE",
      "datatype" : null,
      "database" : "Medline literature database",
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "example_id" : "MEDLINE:20572430",
      "id" : null,
      "name" : null,
      "url_example" : null
   },
   "img" : {
      "url_example" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=640008772",
      "name" : null,
      "example_id" : "IMG:640008772",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=[example_id]",
      "database" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "datatype" : null,
      "abbreviation" : "IMG",
      "object" : "Identifier",
      "generic_url" : "http://img.jgi.doe.gov"
   },
   "uniprotkb-kw" : {
      "generic_url" : "http://www.uniprot.org/keywords/",
      "object" : "Identifier",
      "abbreviation" : "UniProtKB-KW",
      "datatype" : null,
      "database" : "UniProt Knowledgebase keywords",
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "example_id" : "UniProtKB-KW:KW-0812",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/keywords/KW-0812"
   },
   "cazy" : {
      "abbreviation" : "CAZY",
      "description" : "The CAZy database describes the families of structurally-related catalytic and carbohydrate-binding modules (or functional domains) of enzymes that degrade, modify, or create glycosidic bonds.",
      "database" : "Carbohydrate Active EnZYmes",
      "datatype" : null,
      "generic_url" : "http://www.cazy.org/",
      "object" : "Identifier",
      "local_id_syntax" : "^(CE|GH|GT|PL)\\d+$",
      "url_example" : "http://www.cazy.org/PL11.html",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.cazy.org/[example_id].html",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "CAZY:PL11"
   },
   "pmid" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "object" : "Identifier",
      "abbreviation" : "PMID",
      "database" : "PubMed",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "PMID:4208797",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "local_id_syntax" : "^[0-9]+$",
      "name" : null
   },
   "superfamily" : {
      "url_example" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF51905",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "SUPERFAMILY:51905",
      "abbreviation" : "SUPERFAMILY",
      "description" : "A database of structural and functional protein annotations for completely sequenced genomes",
      "datatype" : null,
      "database" : "SUPERFAMILY protein annotation database",
      "generic_url" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/index.html",
      "object" : "Accession"
   },
   "locsvmpsi" : {
      "url_example" : null,
      "name" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "description" : "Subcellular localization for eukayotic proteins based on SVM and PSI-BLAST",
      "database" : "LOCSVMPSI",
      "datatype" : null,
      "abbreviation" : "LOCSVMpsi",
      "object" : null,
      "generic_url" : "http://bioinformatics.ustc.edu.cn/locsvmpsi/locsvmpsi.php"
   },
   "taxon" : {
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "example_id" : "taxon:7227",
      "uri_prefix" : null,
      "id" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "name" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "object" : "Identifier",
      "abbreviation" : "taxon",
      "database" : "NCBI Taxonomy",
      "datatype" : null
   },
   "tc" : {
      "url_syntax" : "http://www.tcdb.org/tcdb/index.php?tc=[example_id]",
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "TC:9.A.4.1.1",
      "name" : null,
      "url_example" : "http://www.tcdb.org/tcdb/index.php?tc=9.A.4.1.1",
      "generic_url" : "http://www.tcdb.org/",
      "object" : "Identifier",
      "abbreviation" : "TC",
      "database" : "Transport Protein Database",
      "datatype" : null
   },
   "ecogene_g" : {
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "datatype" : null,
      "abbreviation" : "ECOGENE_G",
      "object" : "EcoGene Primary Gene Name",
      "generic_url" : "http://www.ecogene.org/",
      "name" : null,
      "url_example" : null,
      "example_id" : "ECOGENE_G:deoC",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "gdb" : {
      "name" : null,
      "url_example" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:306600",
      "uri_prefix" : null,
      "example_id" : "GDB:306600",
      "id" : null,
      "url_syntax" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:[example_id]",
      "fullname" : null,
      "database" : "Human Genome Database",
      "datatype" : null,
      "abbreviation" : "GDB",
      "object" : "Accession",
      "generic_url" : "http://www.gdb.org/"
   },
   "pir" : {
      "object" : "Accession",
      "generic_url" : "http://pir.georgetown.edu/",
      "database" : "Protein Information Resource",
      "datatype" : null,
      "abbreviation" : "PIR",
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "PIR:I49499",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=[example_id]",
      "fullname" : null,
      "name" : null,
      "local_id_syntax" : "^[A-Z]{1}[0-9]{5}$",
      "url_example" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=I49499"
   },
   "vmd" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "VMD:109198",
      "fullname" : null,
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=[example_id]",
      "name" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=109198",
      "object" : "Gene identifier",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "datatype" : null,
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "abbreviation" : "VMD"
   },
   "aspgdid" : {
      "local_id_syntax" : "^ASPL[0-9]{10}$",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "name" : null,
      "id" : null,
      "example_id" : "AspGD:ASPL0000067538",
      "uri_prefix" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "datatype" : null,
      "database" : "Aspergillus Genome Database",
      "abbreviation" : "AspGDID",
      "object" : "Identifier for AspGD Loci",
      "generic_url" : "http://www.aspergillusgenome.org/"
   },
   "kegg_enzyme" : {
      "datatype" : null,
      "database" : "KEGG Enzyme Database",
      "abbreviation" : "KEGG_ENZYME",
      "object" : "Enzyme Commission ID, as stored in KEGG",
      "generic_url" : "http://www.genome.jp/dbget-bin/www_bfind?enzyme",
      "local_id_syntax" : "^\\d(\\.\\d{1,2}){2}\\.\\d{1,3}$",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?ec:2.1.1.4",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "KEGG_ENZYME:2.1.1.4",
      "fullname" : null,
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?ec:[example_id]"
   },
   "wormbase" : {
      "entity_type" : "PR:000000001 ! protein",
      "id" : null,
      "example_id" : "WB:WBGene00003001",
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "local_id_syntax" : "^WB(Gene|Var|RNAi|Transgene)[0-9]{8}$",
      "object" : "Gene identifier",
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase database of nematode biology",
      "datatype" : null,
      "abbreviation" : "WormBase"
   },
   "vbrc" : {
      "abbreviation" : "VBRC",
      "database" : "Viral Bioinformatics Resource Center",
      "datatype" : null,
      "generic_url" : "http://vbrc.org",
      "object" : "Identifier",
      "url_example" : "http://vbrc.org/query.asp?web_id=VBRC:F35742",
      "name" : null,
      "url_syntax" : "http://vbrc.org/query.asp?web_id=VBRC:[example_id]",
      "fullname" : null,
      "example_id" : "VBRC:F35742",
      "uri_prefix" : null,
      "id" : null
   },
   "tigr_tba1" : {
      "is_obsolete" : "true",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/tba1/",
      "object" : "Accession",
      "abbreviation" : "TIGR_Tba1",
      "datatype" : null,
      "database" : "Trypanosoma brucei database at the J. Craig Venter Institute",
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "JCVI_Tba1:25N14.10",
      "url_example" : null,
      "name" : null
   },
   "dbsnp" : {
      "abbreviation" : "dbSNP",
      "database" : "NCBI dbSNP",
      "datatype" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/projects/SNP",
      "object" : "Identifier",
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=rs3131969",
      "local_id_syntax" : "^\\d+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "dbSNP:rs3131969",
      "id" : null
   },
   "prints" : {
      "database" : "PRINTS compendium of protein fingerprints",
      "datatype" : null,
      "abbreviation" : "PRINTS",
      "object" : "Accession",
      "generic_url" : "http://www.bioinf.manchester.ac.uk/dbbrowser/PRINTS/",
      "name" : null,
      "url_example" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=PR00025",
      "entity_type" : "SO:0000839 ! polypeptide region",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "PRINTS:PR00025",
      "fullname" : null,
      "url_syntax" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=[example_id]"
   },
   "nif_subcellular" : {
      "object" : "ontology term",
      "generic_url" : "http://www.neurolex.org/wiki",
      "datatype" : null,
      "database" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "abbreviation" : "NIF_Subcellular",
      "example_id" : "NIF_Subcellular:sao1186862860",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.neurolex.org/wiki/[example_id]",
      "name" : null,
      "url_example" : "http://www.neurolex.org/wiki/sao1770195789"
   },
   "go_ref" : {
      "name" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_example" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:0000001",
      "url_syntax" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:[example_id]",
      "fullname" : null,
      "example_id" : "GO_REF:0000001",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "GO_REF",
      "database" : "Gene Ontology Database references",
      "datatype" : null,
      "generic_url" : "http://www.geneontology.org/",
      "object" : "Accession (for reference)"
   },
   "cgdid" : {
      "abbreviation" : "CGDID",
      "database" : "Candida Genome Database",
      "datatype" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "object" : "Identifier for CGD Loci",
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "local_id_syntax" : "^(CAL|CAF)[0-9]{7}$",
      "fullname" : null,
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "CGD:CAL0005516",
      "id" : null,
      "uri_prefix" : null
   },
   "isbn" : {
      "abbreviation" : "ISBN",
      "datatype" : null,
      "database" : "International Standard Book Number",
      "generic_url" : "http://isbntools.com/",
      "object" : "Identifier",
      "url_example" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=0123456789",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=[example_id]",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "ISBN:0781702534"
   },
   "cog_cluster" : {
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "database" : "NCBI COG cluster",
      "datatype" : null,
      "abbreviation" : "COG_Cluster",
      "example_id" : "COG_Cluster:COG0001",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=[example_id]",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=COG0001",
      "name" : null
   },
   "ecoliwiki" : {
      "abbreviation" : "EcoliWiki",
      "database" : "EcoliWiki from EcoliHub",
      "datatype" : null,
      "description" : "EcoliHub's subsystem for community annotation of E. coli K-12",
      "generic_url" : "http://ecoliwiki.net/",
      "object" : null,
      "name" : null,
      "url_example" : null,
      "local_id_syntax" : "^[A-Za-z]{3,4}$",
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null
   },
   "jcvi_cmr" : {
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "JCVI_CMR:VCA0557",
      "entity_type" : "PR:000000001 ! protein",
      "fullname" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : null,
      "database" : "Comprehensive Microbial Resource at the J. Craig Venter Institute",
      "abbreviation" : "JCVI_CMR",
      "object" : "Locus",
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "cgd" : {
      "generic_url" : "http://www.candidagenome.org/",
      "object" : "Identifier for CGD Loci",
      "abbreviation" : "CGD",
      "database" : "Candida Genome Database",
      "datatype" : null,
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "fullname" : null,
      "example_id" : "CGD:CAL0005516",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "local_id_syntax" : "^(CAL|CAF)[0-9]{7}$",
      "name" : null
   },
   "cog_pathway" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=14",
      "name" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "COG_Pathway:14",
      "id" : null,
      "abbreviation" : "COG_Pathway",
      "database" : "NCBI COG pathway",
      "datatype" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "object" : "Identifier"
   },
   "mesh" : {
      "datatype" : null,
      "database" : "Medical Subject Headings",
      "abbreviation" : "MeSH",
      "object" : "MeSH heading",
      "generic_url" : "http://www.nlm.nih.gov/mesh/2005/MBrowser.html",
      "name" : null,
      "url_example" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=mitosis",
      "uri_prefix" : null,
      "example_id" : "MeSH:mitosis",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=[example_id]"
   },
   "kegg_ligand" : {
      "name" : null,
      "local_id_syntax" : "^C\\d{5}$",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?cpd:C00577",
      "fullname" : null,
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?cpd:[example_id]",
      "entity_type" : "CHEBI:24431 ! chemical entity",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "KEGG_LIGAND:C00577",
      "abbreviation" : "KEGG_LIGAND",
      "datatype" : null,
      "database" : "KEGG LIGAND Database",
      "generic_url" : "http://www.genome.ad.jp/kegg/docs/upd_ligand.html",
      "object" : "Compound"
   },
   "tigr_cmr" : {
      "datatype" : null,
      "database" : "Comprehensive Microbial Resource at the J. Craig Venter Institute",
      "abbreviation" : "TIGR_CMR",
      "object" : "Locus",
      "generic_url" : "http://cmr.jcvi.org/",
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "JCVI_CMR:VCA0557",
      "id" : null,
      "uri_prefix" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "fullname" : null
   },
   "fypo" : {
      "abbreviation" : "FYPO",
      "datatype" : null,
      "database" : "Fission Yeast Phenotype Ontology",
      "generic_url" : "http://www.pombase.org/",
      "object" : "Identifier",
      "name" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_example" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "FYPO:0000001"
   },
   "ncbi_nm" : {
      "abbreviation" : "NCBI_NM",
      "database" : "NCBI RefSeq",
      "datatype" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "is_obsolete" : "true",
      "object" : "mRNA identifier",
      "replaced_by" : "RefSeq",
      "url_example" : null,
      "name" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "NCBI_NM:123456",
      "id" : null
   },
   "pombase" : {
      "fullname" : null,
      "url_syntax" : "http://www.pombase.org/spombe/result/[example_id]",
      "entity_type" : "SO:0000704 ! gene ",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "PomBase:SPBC11B10.09",
      "name" : null,
      "local_id_syntax" : "^S\\w+(\\.)?\\w+(\\.)?$",
      "url_example" : "http://www.pombase.org/spombe/result/SPBC11B10.09",
      "generic_url" : "http://www.pombase.org/",
      "object" : "Identifier",
      "abbreviation" : "PomBase",
      "database" : "PomBase",
      "datatype" : null
   },
   "genedb_lmajor" : {
      "local_id_syntax" : "^LmjF\\.\\d+\\.\\d+$",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "GeneDB_Lmajor:LM5.32",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=leish&name=[example_id]",
      "abbreviation" : "GeneDB_Lmajor",
      "replaced_by" : "GeneDB",
      "object" : "Gene identifier",
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=leish&name=LM5.32",
      "fullname" : null,
      "database" : "Leishmania major GeneDB",
      "datatype" : null,
      "shorthand_name" : "Lmajor",
      "is_obsolete" : "true",
      "generic_url" : "http://www.genedb.org/genedb/leish/"
   },
   "jcvi_medtr" : {
      "uri_prefix" : null,
      "example_id" : "JCVI_Medtr:Medtr5g024510",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=[example_id]",
      "name" : null,
      "url_example" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=Medtr5g024510",
      "object" : "Accession",
      "generic_url" : "http://medicago.jcvi.org/cgi-bin/medicago/overview.cgi",
      "database" : "Medicago truncatula genome database at the J. Craig Venter Institute ",
      "datatype" : null,
      "abbreviation" : "JCVI_Medtr"
   },
   "corum" : {
      "object" : "Identifier",
      "generic_url" : "http://mips.gsf.de/genre/proj/corum/",
      "database" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "datatype" : null,
      "abbreviation" : "CORUM",
      "example_id" : "CORUM:837",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=[example_id]",
      "name" : null,
      "url_example" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=837"
   },
   "mtbbase" : {
      "fullname" : null,
      "url_syntax" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://www.ark.in-berlin.de/Site/MTBbase.html",
      "object" : null,
      "abbreviation" : "MTBBASE",
      "database" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "datatype" : null
   },
   "intact" : {
      "object" : "Accession",
      "generic_url" : "http://www.ebi.ac.uk/intact/",
      "database" : "IntAct protein interaction database",
      "datatype" : null,
      "abbreviation" : "IntAct",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "IntAct:EBI-17086",
      "entity_type" : "MI:0315 ! protein complex ",
      "url_syntax" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=[example_id]",
      "fullname" : null,
      "local_id_syntax" : "^[0-9]+$",
      "url_example" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=EBI-17086",
      "name" : null
   },
   "doi" : {
      "abbreviation" : "DOI",
      "datatype" : null,
      "database" : "Digital Object Identifier",
      "generic_url" : "http://dx.doi.org/",
      "object" : "Identifier",
      "name" : null,
      "url_example" : "http://dx.doi.org/DOI:10.1016/S0963-9969(99)00021-6",
      "local_id_syntax" : "^10\\.[0-9]+\\/.*$",
      "url_syntax" : "http://dx.doi.org/DOI:[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "DOI:10.1016/S0963-9969(99)00021-6",
      "id" : null
   },
   "eco" : {
      "abbreviation" : "ECO",
      "datatype" : null,
      "database" : "Evidence Code ontology",
      "generic_url" : "http://www.geneontology.org/",
      "object" : "Identifier",
      "name" : null,
      "url_example" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "ECO:0000002",
      "id" : null
   },
   "cgsc" : {
      "generic_url" : "http://cgsc.biology.yale.edu/",
      "object" : "Gene symbol",
      "abbreviation" : "CGSC",
      "datatype" : null,
      "database" : null,
      "fullname" : null,
      "url_syntax" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "CGSC:rbsK",
      "name" : null,
      "url_example" : "http://cgsc.biology.yale.edu/Site.php?ID=315",
      "database: CGSC" : "E.coli Genetic Stock Center"
   },
   "pubchem_compound" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=2244",
      "local_id_syntax" : "^[0-9]+$",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=[example_id]",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "PubChem_Compound:2244",
      "entity_type" : "CHEBI:24431 ! chemical entity",
      "abbreviation" : "PubChem_Compound",
      "datatype" : null,
      "database" : "NCBI PubChem database of chemical structures",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "object" : "Identifier"
   },
   "enzyme" : {
      "database" : "Swiss Institute of Bioinformatics enzyme database",
      "datatype" : null,
      "abbreviation" : "ENZYME",
      "object" : "Identifier",
      "generic_url" : "http://www.expasy.ch/",
      "url_example" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?1.1.1.1",
      "name" : null,
      "example_id" : "ENZYME:EC 1.1.1.1",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?[example_id]",
      "fullname" : null
   },
   "cbs" : {
      "uri_prefix" : null,
      "example_id" : "CBS:TMHMM",
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : "http://www.cbs.dtu.dk/services/[example_id]/",
      "name" : null,
      "object" : "prediction tool",
      "generic_url" : "http://www.cbs.dtu.dk/",
      "database" : "Center for Biological Sequence Analysis",
      "datatype" : null,
      "abbreviation" : "CBS"
   },
   "coriell" : {
      "description" : "The Coriell Cell Repositories provide essential research reagents to the scientific community by establishing, verifying, maintaining, and distributing cell cultures and DNA derived from cell cultures. These collections, supported by funds from the National Institutes of Health (NIH) and several foundations, are extensively utilized by research scientists around the world. ",
      "datatype" : null,
      "database" : "Coriell Institute for Medical Research",
      "abbreviation" : "CORIELL",
      "object" : "Identifier",
      "generic_url" : "http://ccr.coriell.org/",
      "url_example" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=GM07892",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "GM07892",
      "id" : null,
      "url_syntax" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=[example_id]",
      "fullname" : null
   },
   "pamgo_gat" : {
      "name" : null,
      "url_example" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=atu0001",
      "uri_prefix" : null,
      "example_id" : "PAMGO_GAT:Atu0001",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=[example_id]",
      "datatype" : null,
      "database" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group",
      "abbreviation" : "PAMGO_GAT",
      "object" : "Gene",
      "generic_url" : "http://agro.vbi.vt.edu/public/"
   },
   "zfin" : {
      "object" : "Identifier",
      "generic_url" : "http://zfin.org/",
      "datatype" : null,
      "database" : "Zebrafish Information Network",
      "abbreviation" : "ZFIN",
      "uri_prefix" : null,
      "example_id" : "ZFIN:ZDB-GENE-990415-103",
      "id" : null,
      "entity_type" : "VariO:0001 ! variation",
      "fullname" : null,
      "url_syntax" : "http://zfin.org/cgi-bin/ZFIN_jump?record=[example_id]",
      "local_id_syntax" : "^ZDB-(GENE|GENO|MRPHLNO)-[0-9]{6}-[0-9]+$",
      "url_example" : "http://zfin.org/cgi-bin/ZFIN_jump?record=ZDB-GENE-990415-103",
      "name" : null
   },
   "ri" : {
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "database" : "Roslin Institute",
      "datatype" : null,
      "abbreviation" : "RI",
      "object" : null,
      "generic_url" : "http://www.roslin.ac.uk/"
   },
   "nc-iubmb" : {
      "generic_url" : "http://www.chem.qmw.ac.uk/iubmb/",
      "object" : null,
      "abbreviation" : "NC-IUBMB",
      "datatype" : null,
      "database" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_example" : null,
      "name" : null
   },
   "jcvi_ref" : {
      "generic_url" : "http://cmr.jcvi.org/",
      "object" : "Reference locator",
      "abbreviation" : "JCVI_REF",
      "datatype" : null,
      "database" : "J. Craig Venter Institute",
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "JCVI_REF:GO_ref",
      "id" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml"
   },
   "rnamdb" : {
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "object" : "Identifier",
      "abbreviation" : "RNAMDB",
      "database" : "RNA Modification Database",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "uri_prefix" : null,
      "example_id" : "RNAmods:037",
      "id" : null,
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "name" : null
   },
   "genedb_pfalciparum" : {
      "shorthand_name" : "Pfalciparum",
      "is_obsolete" : "true",
      "generic_url" : "http://www.genedb.org/genedb/malaria/",
      "database" : "Plasmodium falciparum GeneDB",
      "datatype" : null,
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=malaria&name=PFD0755c",
      "replaced_by" : "GeneDB",
      "object" : "Gene identifier",
      "abbreviation" : "GeneDB_Pfalciparum",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=malaria&name=[example_id]",
      "id" : null,
      "example_id" : "GeneDB_Pfalciparum:PFD0755c",
      "uri_prefix" : null,
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$"
   },
   "obo_rel" : {
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "OBO_REL:part_of",
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://www.obofoundry.org/ro/",
      "object" : "Identifier",
      "abbreviation" : "OBO_REL",
      "database" : "OBO relation ontology",
      "datatype" : null
   },
   "hugo" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://www.hugo-international.org/",
      "database" : "Human Genome Organisation",
      "datatype" : null,
      "abbreviation" : "HUGO"
   },
   "sp_sl" : {
      "uri_prefix" : null,
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://www.uniprot.org/locations/",
      "datatype" : null,
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "abbreviation" : "SP_SL"
   },
   "broad_neurospora" : {
      "abbreviation" : "Broad_NEUROSPORA",
      "description" : "Neurospora crassa database at the Broad Institute",
      "database" : "Neurospora crassa Database",
      "datatype" : null,
      "generic_url" : "http://www.broadinstitute.org/annotation/genome/neurospora/MultiHome.html",
      "object" : "Identifier for Broad_Ncrassa Loci",
      "url_example" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S7000007580576824",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S[example_id]",
      "example_id" : "BROAD_NEUROSPORA:7000007580576824",
      "uri_prefix" : null,
      "id" : null
   },
   "hamap" : {
      "name" : null,
      "url_example" : "http://hamap.expasy.org/unirule/MF_00131",
      "url_syntax" : "http://hamap.expasy.org/unirule/[example_id]",
      "fullname" : null,
      "example_id" : "HAMAP:MF_00031",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "HAMAP",
      "database" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "datatype" : null,
      "generic_url" : "http://hamap.expasy.org/",
      "object" : "Identifier"
   },
   "rhea" : {
      "generic_url" : "http://www.ebi.ac.uk/rhea/",
      "object" : "Accession",
      "abbreviation" : "RHEA",
      "database" : "Rhea, the Annotated Reactions Database",
      "datatype" : null,
      "description" : "Rhea is a freely available, manually annotated database of chemical reactions created in collaboration with the Swiss Institute of Bioinformatics (SIB).",
      "url_syntax" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "RHEA:25811",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=25811"
   },
   "rgd" : {
      "generic_url" : "http://rgd.mcw.edu/",
      "object" : "Accession",
      "abbreviation" : "RGD",
      "datatype" : null,
      "database" : "Rat Genome Database",
      "fullname" : null,
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "uri_prefix" : null,
      "example_id" : "RGD:2004",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "local_id_syntax" : "^[0-9]{4,7}$",
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "name" : null
   },
   "ppi" : {
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_example" : null,
      "name" : null,
      "generic_url" : "http://genome.pseudomonas-syringae.org/",
      "object" : null,
      "abbreviation" : "PPI",
      "database" : "Pseudomonas syringae community annotation project",
      "datatype" : null
   },
   "smart" : {
      "abbreviation" : "SMART",
      "database" : "Simple Modular Architecture Research Tool",
      "datatype" : null,
      "generic_url" : "http://smart.embl-heidelberg.de/",
      "object" : "Accession",
      "name" : null,
      "url_example" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=SM00005",
      "fullname" : null,
      "url_syntax" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=[example_id]",
      "entity_type" : "SO:0000839 ! polypeptide region",
      "uri_prefix" : null,
      "example_id" : "SMART:SM00005",
      "id" : null
   },
   "jcvi_tba1" : {
      "generic_url" : "http://www.tigr.org/tdb/e2k1/tba1/",
      "is_obsolete" : "true",
      "object" : "Accession",
      "abbreviation" : "JCVI_Tba1",
      "datatype" : null,
      "database" : "Trypanosoma brucei database at the J. Craig Venter Institute",
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "JCVI_Tba1:25N14.10",
      "id" : null,
      "name" : null,
      "url_example" : null
   },
   "unipathway" : {
      "url_example" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=UPA00155",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "UniPathway:UPA00155",
      "id" : null,
      "entity_type" : "GO:0008150 ! biological process",
      "url_syntax" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=[example_id]",
      "fullname" : null,
      "description" : "UniPathway is a a metabolic door to UniProtKB/Swiss-Prot, a curated resource of metabolic pathways for the UniProtKB/Swiss-Prot knowledgebase.",
      "datatype" : null,
      "database" : "UniPathway",
      "abbreviation" : "UniPathway",
      "object" : "Identifier",
      "generic_url" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway"
   },
   "prodom" : {
      "object" : "Accession",
      "generic_url" : "http://prodom.prabi.fr/prodom/current/html/home.php",
      "datatype" : null,
      "database" : "ProDom protein domain families",
      "description" : "ProDom protein domain families automatically generated from UniProtKB",
      "abbreviation" : "ProDom",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "ProDom:PD000001",
      "fullname" : null,
      "url_syntax" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=[example_id]",
      "name" : null,
      "url_example" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=PD000001"
   },
   "uniparc" : {
      "abbreviation" : "UniParc",
      "description" : "A non-redundant archive of protein sequences extracted from Swiss-Prot, TrEMBL, PIR-PSD, EMBL, Ensembl, IPI, PDB, RefSeq, FlyBase, WormBase, European Patent Office, United States Patent and Trademark Office, and Japanese Patent Office",
      "datatype" : null,
      "database" : "UniProt Archive",
      "generic_url" : "http://www.uniprot.org/uniparc/",
      "object" : "Accession",
      "url_example" : "http://www.uniprot.org/uniparc/UPI000000000A",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/uniparc/[example_id]",
      "uri_prefix" : null,
      "example_id" : "UniParc:UPI000000000A",
      "id" : null
   },
   "hpa_antibody" : {
      "object" : "Identifier",
      "generic_url" : "http://www.proteinatlas.org/",
      "database" : "Human Protein Atlas antibody information",
      "datatype" : null,
      "abbreviation" : "HPA_antibody",
      "uri_prefix" : null,
      "example_id" : "HPA_antibody:HPA000237",
      "id" : null,
      "url_syntax" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=[example_id]",
      "fullname" : null,
      "url_example" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=HPA000237",
      "name" : null
   },
   "ncbi" : {
      "database" : "National Center for Biotechnology Information",
      "datatype" : null,
      "abbreviation" : "NCBI",
      "! url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "object" : "Prefix",
      "! url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "kegg_reaction" : {
      "fullname" : null,
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?rn:[example_id]",
      "example_id" : "KEGG:R02328",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "local_id_syntax" : "^R\\d+$",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?rn:R02328",
      "generic_url" : "http://www.genome.jp/kegg/reaction/",
      "object" : "Reaction",
      "abbreviation" : "KEGG_REACTION",
      "datatype" : null,
      "database" : "KEGG Reaction Database"
   },
   "pubmed" : {
      "id" : null,
      "example_id" : "PMID:4208797",
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "local_id_syntax" : "^[0-9]+$",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "database" : "PubMed",
      "datatype" : null,
      "abbreviation" : "PubMed"
   },
   "metacyc" : {
      "generic_url" : "http://metacyc.org/",
      "object" : "Identifier (pathway or reaction)",
      "abbreviation" : "MetaCyc",
      "database" : "Metabolic Encyclopedia of metabolic and other pathways",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=[example_id]",
      "example_id" : "MetaCyc:GLUTDEG-PWY",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=GLUTDEG-PWY"
   },
   "germonline" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://www.germonline.org/",
      "datatype" : null,
      "database" : "GermOnline",
      "abbreviation" : "GermOnline"
   },
   "gorel" : {
      "url_example" : null,
      "name" : null,
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "GOREL",
      "description" : "Additional relations pending addition into RO",
      "database" : "GO Extensions to OBO Relation Ontology Ontology",
      "datatype" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "object" : null
   },
   "hgnc" : {
      "generic_url" : "http://www.genenames.org/",
      "object" : "Identifier",
      "abbreviation" : "HGNC",
      "database" : "HUGO Gene Nomenclature Committee",
      "datatype" : null,
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:[example_id]",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "HGNC:29",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:29"
   },
   "cl" : {
      "url_example" : "http://purl.obolibrary.org/obo/CL_0000041",
      "local_id_syntax" : "^[0-9]{7}$",
      "name" : null,
      "example_id" : "CL:0000041",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "CL:0000000 ! cell ",
      "url_syntax" : "http://purl.obolibrary.org/obo/CL_[example_id]",
      "fullname" : null,
      "database" : "Cell Type Ontology",
      "datatype" : null,
      "abbreviation" : "CL",
      "object" : "Identifier",
      "generic_url" : "http://cellontology.org"
   },
   "aspgd_locus" : {
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=AN10942",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "AspGD_LOCUS:AN10942",
      "fullname" : null,
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "database" : "Aspergillus Genome Database",
      "datatype" : null,
      "abbreviation" : "AspGD_LOCUS",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "generic_url" : "http://www.aspergillusgenome.org/"
   },
   "ecogene" : {
      "example_id" : "ECOGENE:EG10818",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eg_id=[example_id]",
      "url_example" : "http://www.ecogene.org/geneInfo.php?eg_id=EG10818",
      "local_id_syntax" : "^EG[0-9]{5}$",
      "name" : null,
      "object" : "EcoGene accession",
      "generic_url" : "http://www.ecogene.org/",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "datatype" : null,
      "abbreviation" : "ECOGENE"
   },
   "chebi" : {
      "url_syntax" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:[example_id]",
      "fullname" : null,
      "id" : null,
      "example_id" : "CHEBI:17234",
      "uri_prefix" : null,
      "entity_type" : "CHEBI:24431 ! chemical entity ",
      "local_id_syntax" : "^[0-9]{1,6}$",
      "url_example" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17234",
      "name" : null,
      "generic_url" : "http://www.ebi.ac.uk/chebi/",
      "object" : "Identifier",
      "abbreviation" : "ChEBI",
      "datatype" : null,
      "database" : "Chemical Entities of Biological Interest"
   },
   "gb" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "object" : "Sequence accession",
      "abbreviation" : "GB",
      "description" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "database" : "GenBank",
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "GB:AA816246",
      "entity_type" : "PR:000000001 ! protein ",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "local_id_syntax" : "^[A-Z]{2}[0-9]{6}$",
      "name" : null
   },
   "go_central" : {
      "datatype" : null,
      "database" : "GO Central",
      "description" : "Manual annotation from PAINT curators into the UniProt Protein2GO curation tool.",
      "abbreviation" : "GO_Central",
      "object" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "wbphenotype" : {
      "database" : "WormBase phenotype ontology",
      "datatype" : null,
      "abbreviation" : "WBPhenotype",
      "object" : "Gene identifier",
      "generic_url" : "http://www.wormbase.org/",
      "name" : null,
      "local_id_syntax" : "^[0-9]{7}$",
      "url_example" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:0000154",
      "entity_type" : "PATO:0000001 ! Quality",
      "example_id" : "WBPhenotype:0002117",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:[example_id]",
      "fullname" : null
   },
   "pompep" : {
      "generic_url" : "ftp://ftp.sanger.ac.uk/pub/yeast/pombe/Protein_data/",
      "object" : "Gene/protein identifier",
      "abbreviation" : "Pompep",
      "database" : "Schizosaccharomyces pombe protein data",
      "datatype" : null,
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : "Pompep:SPAC890.04C",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null
   },
   "sp_kw" : {
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "example_id" : "UniProtKB-KW:KW-0812",
      "id" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "name" : null,
      "generic_url" : "http://www.uniprot.org/keywords/",
      "object" : "Identifier",
      "abbreviation" : "SP_KW",
      "database" : "UniProt Knowledgebase keywords",
      "datatype" : null
   },
   "sgd_locus" : {
      "database" : "Saccharomyces Genome Database",
      "datatype" : null,
      "abbreviation" : "SGD_LOCUS",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "generic_url" : "http://www.yeastgenome.org/",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=GAL4",
      "name" : null,
      "example_id" : "SGD_LOCUS:GAL4",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=[example_id]"
   },
   "lifedb" : {
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "LIFEdb:DKFZp564O1716",
      "fullname" : null,
      "url_syntax" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=[example_id]",
      "name" : null,
      "url_example" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=DKFZp564O1716",
      "object" : "cDNA clone identifier",
      "generic_url" : "http://www.lifedb.de/",
      "datatype" : null,
      "database" : "LifeDB",
      "description" : "LifeDB is a database for information on protein localization, interaction, functional assays and expression.",
      "abbreviation" : "LIFEdb"
   },
   "tigr_pfa1" : {
      "database" : "Plasmodium falciparum database at the J. Craig Venter Institute",
      "datatype" : null,
      "abbreviation" : "TIGR_Pfa1",
      "object" : "Accession",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/pfa1/pfa1.shtml",
      "is_obsolete" : "true",
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "JCVI_Pfa1:PFB0010w",
      "fullname" : null,
      "url_syntax" : null
   },
   "rgdid" : {
      "name" : null,
      "local_id_syntax" : "^[0-9]{4,7}$",
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "example_id" : "RGD:2004",
      "uri_prefix" : null,
      "abbreviation" : "RGDID",
      "database" : "Rat Genome Database",
      "datatype" : null,
      "generic_url" : "http://rgd.mcw.edu/",
      "object" : "Accession"
   },
   "sgd_ref" : {
      "datatype" : null,
      "database" : "Saccharomyces Genome Database",
      "abbreviation" : "SGD_REF",
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://www.yeastgenome.org/",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=S000049602",
      "name" : null,
      "example_id" : "SGD_REF:S000049602",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "fullname" : null
   },
   "muscletrait" : {
      "datatype" : null,
      "database" : "TRAnscript Integrated Table",
      "description" : "an integrated database of transcripts expressed in human skeletal muscle",
      "abbreviation" : "MuscleTRAIT",
      "object" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "name" : null,
      "url_example" : null,
      "id" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "pro" : {
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "uri_prefix" : null,
      "example_id" : "PR:000025380",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "local_id_syntax" : "^[0-9]{9}$",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "object" : "Identifer",
      "abbreviation" : "PRO",
      "database" : "Protein Ontology",
      "datatype" : null
   },
   "ncbi_locus_tag" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Identifier",
      "abbreviation" : "NCBI_locus_tag",
      "database" : "NCBI locus tag",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "NCBI_locus_tag:CTN_0547",
      "url_example" : null,
      "name" : null
   },
   "psi-mi" : {
      "name" : null,
      "url_example" : null,
      "fullname" : null,
      "url_syntax" : null,
      "example_id" : "MI:0018",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "PSI-MI",
      "datatype" : null,
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "object" : "Interaction identifier"
   },
   "um-bbd" : {
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "datatype" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "abbreviation" : "UM-BBD",
      "object" : "Prefix",
      "generic_url" : "http://umbbd.msi.umn.edu/"
   },
   "alzheimers_university_of_toronto" : {
      "object" : null,
      "generic_url" : "http://www.ims.utoronto.ca/",
      "datatype" : null,
      "database" : "Alzheimers Project at University of Toronto",
      "abbreviation" : "Alzheimers_University_of_Toronto",
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "name" : null
   },
   "rnamods" : {
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "RNAmods:037",
      "abbreviation" : "RNAmods",
      "datatype" : null,
      "database" : "RNA Modification Database",
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "object" : "Identifier"
   },
   "gene3d" : {
      "url_syntax" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=[example_id]",
      "fullname" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "Gene3D:G3DSA:3.30.390.30",
      "name" : null,
      "url_example" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=G3DSA%3A3.30.390.30",
      "generic_url" : "http://gene3d.biochem.ucl.ac.uk/Gene3D/",
      "object" : "Accession",
      "abbreviation" : "Gene3D",
      "database" : "Domain Architecture Classification",
      "datatype" : null
   },
   "ipi" : {
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "IPI:IPI00000005.1",
      "url_syntax" : null,
      "fullname" : null,
      "database" : "International Protein Index",
      "datatype" : null,
      "abbreviation" : "IPI",
      "object" : "Identifier",
      "generic_url" : "http://www.ebi.ac.uk/IPI/IPIhelp.html"
   },
   "vega" : {
      "object" : "Identifier",
      "generic_url" : "http://vega.sanger.ac.uk/index.html",
      "database" : "Vertebrate Genome Annotation database",
      "datatype" : null,
      "abbreviation" : "VEGA",
      "example_id" : "VEGA:OTTHUMP00000000661",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=[example_id]",
      "url_example" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=OTTHUMP00000000661",
      "name" : null
   },
   "pinc" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://www.proteome.com/",
      "description" : "represents GO annotations created in 2001 for NCBI and extracted into UniProtKB-GOA from EntrezGene",
      "database" : "Proteome Inc.",
      "datatype" : null,
      "abbreviation" : "PINC"
   },
   "aspgd_ref" : {
      "object" : "Literature Reference Identifier",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "database" : "Aspergillus Genome Database",
      "datatype" : null,
      "abbreviation" : "AspGD_REF",
      "example_id" : "AspGD_REF:90",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=90"
   },
   "unimod" : {
      "generic_url" : "http://www.unimod.org/",
      "object" : "Identifier",
      "abbreviation" : "UniMod",
      "database" : "UniMod",
      "datatype" : null,
      "description" : "protein modifications for mass spectrometry",
      "url_syntax" : "http://www.unimod.org/modifications_view.php?editid1=[example_id]",
      "fullname" : null,
      "example_id" : "UniMod:1287",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.unimod.org/modifications_view.php?editid1=1287"
   },
   "ncbi_gp" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=[example_id]",
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "NCBI_GP:EAL72968",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=EAL72968",
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Protein identifier",
      "abbreviation" : "NCBI_GP",
      "database" : "NCBI GenPept",
      "datatype" : null
   },
   "seed" : {
      "object" : "identifier",
      "generic_url" : "http://www.theseed.org",
      "database" : "The SEED;",
      "datatype" : null,
      "description" : "Project to annotate the first 1000 sequenced genomes, develop detailed metabolic reconstructions, and construct the corresponding stoichiometric matrices",
      "abbreviation" : "SEED",
      "uri_prefix" : null,
      "example_id" : "SEED:fig|83331.1.peg.1",
      "id" : null,
      "url_syntax" : "http://www.theseed.org/linkin.cgi?id=[example_id]",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.theseed.org/linkin.cgi?id=fig|83331.1.peg.1"
   },
   "ensembl" : {
      "url_example" : "http://www.ensembl.org/id/ENSP00000265949",
      "local_id_syntax" : "^ENS[A-Z0-9]{10,17}$",
      "name" : null,
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "fullname" : null,
      "example_id" : "ENSEMBL:ENSP00000265949",
      "id" : null,
      "uri_prefix" : null,
      "entity_type" : "SO:0000673 ! transcript",
      "abbreviation" : "Ensembl",
      "database" : "Ensembl database of automatically annotated genomic data",
      "datatype" : null,
      "generic_url" : "http://www.ensembl.org/",
      "object" : "Identifier (unspecified)"
   },
   "broad_mgg" : {
      "name" : null,
      "url_example" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=SMGG_05132",
      "fullname" : null,
      "url_syntax" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=S[example_id]",
      "uri_prefix" : null,
      "example_id" : "Broad_MGG:MGG_05132.5",
      "id" : null,
      "abbreviation" : "Broad_MGG",
      "datatype" : null,
      "database" : "Magnaporthe grisea Database",
      "description" : "Magnaporthe grisea Database at the Broad Institute",
      "generic_url" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/Home.html",
      "object" : "Locus"
   },
   "reactome" : {
      "object" : "Identifier",
      "generic_url" : "http://www.reactome.org/",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "datatype" : null,
      "abbreviation" : "Reactome",
      "uri_prefix" : null,
      "example_id" : "Reactome:REACT_604",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "local_id_syntax" : "^REACT_[0-9]+$",
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "name" : null
   },
   "refseq_na" : {
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=NC_000913",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "fullname" : null,
      "example_id" : "RefSeq_NA:NC_000913",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "RefSeq_NA",
      "datatype" : null,
      "database" : "RefSeq (Nucleic Acid)",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "is_obsolete" : "true",
      "replaced_by" : "RefSeq",
      "object" : "Identifier"
   },
   "hgnc_gene" : {
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?app_sym=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "HGNC_gene:ABCA1",
      "id" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?app_sym=ABCA1",
      "name" : null,
      "generic_url" : "http://www.genenames.org/",
      "object" : "Gene symbol",
      "abbreviation" : "HGNC_gene",
      "database" : "HUGO Gene Nomenclature Committee",
      "datatype" : null
   },
   "hpa" : {
      "name" : null,
      "url_example" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=HPA000237",
      "fullname" : null,
      "url_syntax" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=[example_id]",
      "uri_prefix" : null,
      "example_id" : "HPA:HPA000237",
      "id" : null,
      "abbreviation" : "HPA",
      "datatype" : null,
      "database" : "Human Protein Atlas tissue profile information",
      "generic_url" : "http://www.proteinatlas.org/",
      "object" : "Identifier"
   },
   "bhf-ucl" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology/",
      "description" : "The Cardiovascular Gene Ontology Annotation Initiative is supported by the British Heart Foundation (BHF) and located at University College London (UCL).",
      "datatype" : null,
      "database" : "Cardiovascular Gene Ontology Annotation Initiative",
      "abbreviation" : "BHF-UCL"
   },
   "subtilist" : {
      "abbreviation" : "SUBTILIST",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "datatype" : null,
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "object" : "Accession",
      "name" : null,
      "url_example" : null,
      "url_syntax" : null,
      "fullname" : null,
      "entity_type" : "PR:000000001 ! protein",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "SUBTILISTG:BG11384"
   },
   "imgt_hla" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "IMGT_HLA:HLA00031",
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "name" : null,
      "object" : null,
      "generic_url" : "http://www.ebi.ac.uk/imgt/hla",
      "database" : "IMGT/HLA human major histocompatibility complex sequence database",
      "datatype" : null,
      "abbreviation" : "IMGT_HLA"
   },
   "issn" : {
      "generic_url" : "http://www.issn.org/",
      "object" : "Identifier",
      "abbreviation" : "ISSN",
      "database" : "International Standard Serial Number",
      "datatype" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "ISSN:1234-1231",
      "name" : null,
      "url_example" : null
   },
   "cgen" : {
      "uri_prefix" : null,
      "example_id" : "CGEN:PrID131022",
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "url_example" : null,
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://www.cgen.com/",
      "database" : "Compugen Gene Ontology Gene Association Data",
      "datatype" : null,
      "abbreviation" : "CGEN"
   },
   "genedb_tbrucei" : {
      "abbreviation" : "GeneDB_Tbrucei",
      "object" : "Gene identifier",
      "replaced_by" : "GeneDB",
      "local_id_syntax" : "^Tb\\d+\\.\\d+\\.\\d+$",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=tryp&name=[example_id]",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "GeneDB_Tbrucei:Tb927.1.5250",
      "database" : "Trypanosoma brucei GeneDB",
      "datatype" : null,
      "is_obsolete" : "true",
      "generic_url" : "http://www.genedb.org/genedb/tryp/",
      "shorthand_name" : "Tbrucei",
      "url_example" : "http://www.genedb.org/genedb/Search?organism=tryp&name=Tb927.1.5250",
      "name" : null,
      "fullname" : null
   },
   "ensembl_proteinid" : {
      "database" : "Ensembl database of automatically annotated genomic data",
      "datatype" : null,
      "abbreviation" : "ENSEMBL_ProteinID",
      "object" : "Protein identifier",
      "generic_url" : "http://www.ensembl.org/",
      "url_example" : "http://www.ensembl.org/id/ENSP00000361027",
      "local_id_syntax" : "^ENSP[0-9]{9,16}$",
      "name" : null,
      "example_id" : "ENSEMBL_ProteinID:ENSP00000361027",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "fullname" : null
   },
   "ncbi_np" : {
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "NCBI_NP:123456",
      "url_example" : null,
      "name" : null,
      "is_obsolete" : "true",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Protein identifier",
      "replaced_by" : "RefSeq",
      "abbreviation" : "NCBI_NP",
      "database" : "NCBI RefSeq",
      "datatype" : null
   },
   "multifun" : {
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "database" : "MultiFun cell function assignment schema",
      "datatype" : null,
      "abbreviation" : "MultiFun",
      "object" : null,
      "generic_url" : "http://genprotec.mbl.edu/files/MultiFun.html"
   },
   "transfac" : {
      "database" : "TRANSFAC database of eukaryotic transcription factors",
      "datatype" : null,
      "abbreviation" : "TRANSFAC",
      "object" : null,
      "generic_url" : "http://www.gene-regulation.com/pub/databases.html#transfac",
      "name" : null,
      "url_example" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "dflat" : {
      "generic_url" : "http://bcb.cs.tufts.edu/dflat/",
      "object" : null,
      "abbreviation" : "DFLAT",
      "database" : "Developmental FunctionaL Annotation at Tufts",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "url_example" : null,
      "name" : null
   },
   "cgd_ref" : {
      "generic_url" : "http://www.candidagenome.org/",
      "object" : "Literature Reference Identifier",
      "abbreviation" : "CGD_REF",
      "datatype" : null,
      "database" : "Candida Genome Database",
      "fullname" : null,
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "CGD_REF:1490",
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=1490"
   },
   "pharmgkb" : {
      "database" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "datatype" : null,
      "abbreviation" : "PharmGKB",
      "object" : null,
      "generic_url" : "http://www.pharmgkb.org",
      "name" : null,
      "url_example" : "http://www.pharmgkb.org/do/serve?objId=PA267",
      "uri_prefix" : null,
      "example_id" : "PharmGKB:PA267",
      "id" : null,
      "url_syntax" : "http://www.pharmgkb.org/do/serve?objId=[example_id]",
      "fullname" : null
   },
   "casspc" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "object" : "Identifier",
      "abbreviation" : "CASSPC",
      "datatype" : null,
      "database" : "Catalog of Fishes species database",
      "fullname" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]",
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979"
   },
   "tigr_ref" : {
      "datatype" : null,
      "database" : "J. Craig Venter Institute",
      "abbreviation" : "TIGR_REF",
      "object" : "Reference locator",
      "generic_url" : "http://cmr.jcvi.org/",
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "example_id" : "JCVI_REF:GO_ref",
      "id" : null,
      "uri_prefix" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "iuphar_receptor" : {
      "url_example" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=56",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=[example_id]",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "IUPHAR_RECEPTOR:2205",
      "abbreviation" : "IUPHAR_RECEPTOR",
      "datatype" : null,
      "database" : "International Union of Pharmacology",
      "generic_url" : "http://www.iuphar.org/",
      "object" : "Receptor identifier"
   },
   "ensemblplants/gramene" : {
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "datatype" : null,
      "abbreviation" : "EnsemblPlants/Gramene",
      "object" : "Identifier",
      "generic_url" : "http://plants.ensembl.org/"
   },
   "pato" : {
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "PATO:0001420",
      "abbreviation" : "PATO",
      "database" : "Phenotypic quality ontology",
      "datatype" : null,
      "generic_url" : "http://www.bioontology.org/wiki/index.php/PATO:Main_Page",
      "object" : "Identifier"
   },
   "flybase" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "FB:FBgn0000024",
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "local_id_syntax" : "^FBgn[0-9]{7}$",
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "name" : null,
      "object" : "Identifier",
      "generic_url" : "http://flybase.org/",
      "datatype" : null,
      "database" : "FlyBase",
      "abbreviation" : "FLYBASE"
   },
   "tair" : {
      "generic_url" : "http://www.arabidopsis.org/",
      "object" : "Accession",
      "abbreviation" : "TAIR",
      "database" : "The Arabidopsis Information Resource",
      "datatype" : null,
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?accession=[example_id]",
      "fullname" : null,
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "TAIR:locus:2146653",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : "http://arabidopsis.org/servlets/TairObject?accession=locus:2146653",
      "local_id_syntax" : "^locus:[0-9]{7}$"
   },
   "sabio-rk" : {
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "SABIO-RK:1858",
      "fullname" : null,
      "url_syntax" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=[example_id]",
      "url_example" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=1858",
      "name" : null,
      "object" : "reaction",
      "generic_url" : "http://sabio.villa-bosch.de/",
      "description" : "The SABIO-RK (System for the Analysis of Biochemical Pathways - Reaction Kinetics) is a web-based application based on the SABIO relational database that contains information about biochemical reactions, their kinetic equations with their parameters, and the experimental conditions under which these parameters were measured.",
      "datatype" : null,
      "database" : "SABIO Reaction Kinetics",
      "abbreviation" : "SABIO-RK"
   },
   "merops" : {
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=A08.001",
      "name" : null,
      "example_id" : "MEROPS:A08.001",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "fullname" : null,
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=[example_id]",
      "datatype" : null,
      "database" : "MEROPS peptidase database",
      "abbreviation" : "MEROPS",
      "object" : "Identifier",
      "generic_url" : "http://merops.sanger.ac.uk/"
   },
   "uberon" : {
      "generic_url" : "http://uberon.org",
      "object" : "Identifier",
      "abbreviation" : "UBERON",
      "description" : "A multi-species anatomy ontology",
      "database" : "Uber-anatomy ontology",
      "datatype" : null,
      "url_syntax" : "http://purl.obolibrary.org/obo/UBERON_[example_id]",
      "fullname" : null,
      "example_id" : "URBERON:0002398",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "url_example" : "http://purl.obolibrary.org/obo/UBERON_0002398",
      "local_id_syntax" : "^[0-9]{7}$",
      "name" : null
   },
   "biosis" : {
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "url_syntax" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "BIOSIS:200200247281",
      "abbreviation" : "BIOSIS",
      "datatype" : null,
      "database" : "BIOSIS previews",
      "generic_url" : "http://www.biosis.org/",
      "object" : "Identifier"
   },
   "prow" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/prow/",
      "object" : null,
      "abbreviation" : "PROW",
      "datatype" : null,
      "database" : "Protein Reviews on the Web",
      "url_syntax" : null,
      "fullname" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "url_example" : null,
      "name" : null
   },
   "genprotec" : {
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "name" : null,
      "url_example" : null,
      "object" : null,
      "generic_url" : "http://genprotec.mbl.edu/",
      "database" : "GenProtEC E. coli genome and proteome database",
      "datatype" : null,
      "abbreviation" : "GenProtEC"
   },
   "sanger" : {
      "generic_url" : "http://www.sanger.ac.uk/",
      "object" : null,
      "abbreviation" : "Sanger",
      "datatype" : null,
      "database" : "Wellcome Trust Sanger Institute",
      "url_syntax" : null,
      "fullname" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null
   },
   "trait" : {
      "abbreviation" : "TRAIT",
      "description" : "an integrated database of transcripts expressed in human skeletal muscle",
      "database" : "TRAnscript Integrated Table",
      "datatype" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "object" : null,
      "url_example" : null,
      "name" : null,
      "url_syntax" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null
   },
   "pubchem_substance" : {
      "name" : null,
      "local_id_syntax" : "^[0-9]{4,}$",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=4594",
      "fullname" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=[example_id]",
      "entity_type" : "CHEBI:24431 ! chemical entity",
      "uri_prefix" : null,
      "example_id" : "PubChem_Substance:4594",
      "id" : null,
      "abbreviation" : "PubChem_Substance",
      "database" : "NCBI PubChem database of chemical substances",
      "datatype" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "object" : "Identifier"
   },
   "casgen" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "object" : "Identifier",
      "abbreviation" : "CASGEN",
      "datatype" : null,
      "database" : "Catalog of Fishes genus database",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "CASGEN:1040",
      "id" : null,
      "name" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040"
   },
   "ma" : {
      "abbreviation" : "MA",
      "datatype" : null,
      "database" : "Adult Mouse Anatomical Dictionary",
      "description" : "Adult Mouse Anatomical Dictionary; part of Gene Expression Database",
      "generic_url" : "http://www.informatics.jax.org/",
      "object" : "Identifier",
      "name" : null,
      "url_example" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:0000003",
      "fullname" : null,
      "url_syntax" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:[example_id]",
      "example_id" : "MA:0000003",
      "uri_prefix" : null,
      "id" : null
   },
   "jcvi_tigrfams" : {
      "name" : null,
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "fullname" : null,
      "entity_type" : "SO:0000839 ! polypeptide region",
      "uri_prefix" : null,
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "id" : null,
      "abbreviation" : "JCVI_TIGRFAMS",
      "datatype" : null,
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "generic_url" : "http://search.jcvi.org/",
      "object" : "Accession"
   },
   "wikipedia" : {
      "object" : "Page Reference Identifier",
      "generic_url" : "http://en.wikipedia.org/",
      "datatype" : null,
      "database" : "Wikipedia",
      "abbreviation" : "Wikipedia",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "Wikipedia:Endoplasmic_reticulum",
      "fullname" : null,
      "url_syntax" : "http://en.wikipedia.org/wiki/[example_id]",
      "name" : null,
      "url_example" : "http://en.wikipedia.org/wiki/Endoplasmic_reticulum"
   },
   "locusid" : {
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "local_id_syntax" : "^\\d+$",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "example_id" : "NCBI_Gene:4771",
      "uri_prefix" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "fullname" : null,
      "database" : "NCBI Gene",
      "datatype" : null,
      "abbreviation" : "LocusID",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "sgn_ref" : {
      "url_syntax" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "SGN_ref:861",
      "id" : null,
      "name" : null,
      "url_example" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=861",
      "generic_url" : "http://www.sgn.cornell.edu/",
      "object" : "Reference identifier",
      "abbreviation" : "SGN_ref",
      "datatype" : null,
      "database" : "Sol Genomics Network"
   },
   "uniprotkb" : {
      "example_id" : "UniProtKB:P51587",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "fullname" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "local_id_syntax" : "^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z]([0-9][A-Z][A-Z0-9]{2}){1,2}[0-9])((-[0-9]+)|:PRO_[0-9]{10}|:VAR_[0-9]{6}){0,1}$",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "name" : null,
      "object" : "Accession",
      "generic_url" : "http://www.uniprot.org",
      "description" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "database" : "Universal Protein Knowledgebase",
      "datatype" : null,
      "abbreviation" : "UniProtKB"
   },
   "omim" : {
      "url_example" : "http://omim.org/entry/190198",
      "name" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "OMIM:190198",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "fullname" : null,
      "datatype" : null,
      "database" : "Mendelian Inheritance in Man",
      "abbreviation" : "OMIM",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM"
   },
   "wormpep" : {
      "database" : "Wormpep database of proteins of C. elegans",
      "datatype" : null,
      "abbreviation" : "Wormpep",
      "object" : "Identifier",
      "generic_url" : "http://www.wormbase.org/",
      "is_obsolete" : "true",
      "url_example" : "http://www.wormbase.org/db/get?class=Protein;name=WP:CE15104",
      "name" : null,
      "example_id" : "WP:CE25104",
      "id" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "url_syntax" : "http://www.wormbase.org/db/get?class=Protein;name=WP:[example_id]"
   },
   "um-bbd_pathwayid" : {
      "url_syntax" : "http://umbbd.msi.umn.edu/[example_id]/[example_id]_map.html",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "UM-BBD_pathwayID:acr",
      "id" : null,
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/acr/acr_map.html",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "object" : "Pathway identifier",
      "abbreviation" : "UM-BBD_pathwayID",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "datatype" : null
   },
   "spd" : {
      "name" : null,
      "url_example" : "http://www.riken.jp/SPD/05/05F01.html",
      "local_id_syntax" : "^[0-9]{2}/[0-9]{2}[A-Z][0-9]{2}$",
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "SPD:05/05F01",
      "url_syntax" : "http://www.riken.jp/SPD/[example_id].html",
      "fullname" : null,
      "datatype" : null,
      "database" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "abbreviation" : "SPD",
      "object" : "Identifier",
      "generic_url" : "http://www.riken.jp/SPD/"
   },
   "prosite" : {
      "generic_url" : "http://www.expasy.ch/prosite/",
      "object" : "Accession",
      "abbreviation" : "Prosite",
      "database" : "Prosite database of protein families and domains",
      "datatype" : null,
      "url_syntax" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "Prosite:PS00365",
      "entity_type" : "SO:0000839 ! polypeptide region",
      "url_example" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?PS00365",
      "name" : null
   },
   "ncbi_taxid" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "object" : "Identifier",
      "abbreviation" : "ncbi_taxid",
      "datatype" : null,
      "database" : "NCBI Taxonomy",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "taxon:7227",
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702"
   },
   "so" : {
      "fullname" : null,
      "url_syntax" : "http://song.sourceforge.net/SOterm_tables.html#SO:[example_id]",
      "entity_type" : "SO:0000110 ! sequence feature",
      "example_id" : "SO:0000195",
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_example" : "http://song.sourceforge.net/SOterm_tables.html#SO:0000195",
      "generic_url" : "http://sequenceontology.org/",
      "object" : "Identifier",
      "abbreviation" : "SO",
      "datatype" : null,
      "database" : "Sequence Ontology"
   },
   "wbls" : {
      "database" : "C. elegans development",
      "datatype" : null,
      "abbreviation" : "WBls",
      "object" : "Identifier",
      "generic_url" : "http://www.wormbase.org/",
      "name" : null,
      "local_id_syntax" : "[0-9]{7}",
      "url_example" : null,
      "entity_type" : "WBls:0000075 ! nematoda Life Stage",
      "uri_prefix" : null,
      "example_id" : "WBls:0000010",
      "id" : null,
      "url_syntax" : null,
      "fullname" : null
   },
   "refseq_prot" : {
      "database" : "RefSeq (Protein)",
      "datatype" : null,
      "abbreviation" : "RefSeq_Prot",
      "object" : "Identifier",
      "replaced_by" : "RefSeq",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "is_obsolete" : "true",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=YP_498627",
      "name" : null,
      "example_id" : "RefSeq_Prot:YP_498627",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "fullname" : null
   },
   "swiss-prot" : {
      "generic_url" : "http://www.uniprot.org",
      "is_obsolete" : "true",
      "object" : "Accession",
      "replaced_by" : "UniProtKB",
      "abbreviation" : "Swiss-Prot",
      "description" : "A curated protein sequence database which provides a high level of annotation and a minimal level of redundancy",
      "database" : "UniProtKB/Swiss-Prot",
      "datatype" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "Swiss-Prot:P51587",
      "id" : null,
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "name" : null
   },
   "cas" : {
      "object" : "Identifier",
      "generic_url" : "http://www.cas.org/expertise/cascontent/registry/index.html",
      "datatype" : null,
      "database" : "CAS Chemical Registry",
      "description" : "CAS REGISTRY is the most authoritative collection of disclosed chemical substance information, containing more than 54 million organic and inorganic substances and 62 million sequences. CAS REGISTRY covers substances identified from the scientific literature from 1957 to the present, with additional substances going back to the early 1900s.",
      "abbreviation" : "CAS",
      "uri_prefix" : null,
      "example_id" : "CAS:58-08-2",
      "id" : null,
      "url_syntax" : null,
      "fullname" : null,
      "name" : null,
      "url_example" : null
   },
   "ddbj" : {
      "name" : null,
      "url_example" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=AA816246",
      "url_syntax" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "DDBJ:AA816246",
      "id" : null,
      "abbreviation" : "DDBJ",
      "datatype" : null,
      "database" : "DNA Databank of Japan",
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "object" : "Sequence accession"
   },
   "eck" : {
      "datatype" : null,
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "abbreviation" : "ECK",
      "object" : "ECK accession (E. coli K-12 gene identifier)",
      "generic_url" : "http://www.ecogene.org/",
      "local_id_syntax" : "^ECK[0-9]{4}$",
      "url_example" : "http://www.ecogene.org/geneInfo.php?eck_id=ECK3746",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "ECK:ECK3746",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "fullname" : null,
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eck_id=[example_id]"
   },
   "phi" : {
      "url_example" : null,
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "PHI:0000055",
      "fullname" : null,
      "url_syntax" : null,
      "database" : "MeGO (Phage and Mobile Element Ontology)",
      "datatype" : null,
      "abbreviation" : "PHI",
      "object" : null,
      "generic_url" : "http://aclame.ulb.ac.be/Classification/mego.html"
   },
   "brenda" : {
      "abbreviation" : "BRENDA",
      "datatype" : null,
      "database" : "BRENDA, The Comprehensive Enzyme Information System",
      "generic_url" : "http://www.brenda-enzymes.info",
      "object" : "EC enzyme identifier",
      "name" : null,
      "url_example" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=4.2.1.3",
      "url_syntax" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=[example_id]",
      "fullname" : null,
      "entity_type" : "GO:0003824 ! catalytic activity",
      "example_id" : "BRENDA:4.2.1.3",
      "uri_prefix" : null,
      "id" : null
   },
   "pfam" : {
      "object" : "Accession",
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "description" : "Pfam is a collection of protein families represented by sequence alignments and hidden Markov models (HMMs)",
      "database" : "Pfam database of protein families",
      "datatype" : null,
      "abbreviation" : "Pfam",
      "uri_prefix" : null,
      "example_id" : "Pfam:PF00046",
      "id" : null,
      "entity_type" : "SO:0000839 ! polypeptide region",
      "url_syntax" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?[example_id]",
      "fullname" : null,
      "url_example" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?PF00046",
      "name" : null
   },
   "biopixie_mefit" : {
      "datatype" : null,
      "database" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "abbreviation" : "bioPIXIE_MEFIT",
      "object" : null,
      "generic_url" : "http://pixie.princeton.edu/pixie/",
      "name" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null
   },
   "kegg_pathway" : {
      "abbreviation" : "KEGG_PATHWAY",
      "database" : "KEGG Pathways Database",
      "datatype" : null,
      "generic_url" : "http://www.genome.jp/kegg/pathway.html",
      "object" : "Pathway",
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?path:ot00020",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?path:[example_id]",
      "fullname" : null,
      "example_id" : "KEGG_PATHWAY:ot00020",
      "uri_prefix" : null,
      "id" : null
   },
   "gr_gene" : {
      "url_syntax" : "http://www.gramene.org/db/genes/search_gene?acc=[example_id]",
      "fullname" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "GR_GENE:GR:0060198",
      "url_example" : "http://www.gramene.org/db/genes/search_gene?acc=GR:0060198",
      "name" : null,
      "generic_url" : "http://www.gramene.org/",
      "object" : "Gene identifier",
      "abbreviation" : "GR_gene",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "database" : null,
      "datatype" : null
   },
   "ro" : {
      "url_example" : "http://purl.obolibrary.org/obo/RO_0002211",
      "name" : null,
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "RO:0002211",
      "url_syntax" : "http://purl.obolibrary.org/obo/RO_[example_id]",
      "fullname" : null,
      "description" : "A collection of relations used across OBO ontologies",
      "database" : "OBO Relation Ontology Ontology",
      "datatype" : null,
      "abbreviation" : "RO",
      "object" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/ro"
   },
   "pirsf" : {
      "name" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=SF002327",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "PIRSF:SF002327",
      "fullname" : null,
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=[example_id]",
      "database" : "PIR Superfamily Classification System",
      "datatype" : null,
      "abbreviation" : "PIRSF",
      "object" : "Identifier",
      "generic_url" : "http://pir.georgetown.edu/pirsf/"
   },
   "rebase" : {
      "object" : "Restriction enzyme name",
      "generic_url" : "http://rebase.neb.com/rebase/rebase.html",
      "datatype" : null,
      "database" : "REBASE restriction enzyme database",
      "abbreviation" : "REBASE",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "REBASE:EcoRI",
      "fullname" : null,
      "url_syntax" : "http://rebase.neb.com/rebase/enz/[example_id].html",
      "name" : null,
      "url_example" : "http://rebase.neb.com/rebase/enz/EcoRI.html"
   },
   "cacao" : {
      "object" : "accession",
      "generic_url" : "http://gowiki.tamu.edu/wiki/index.php/Category:CACAO",
      "description" : "The Community Assessment of Community Annotation with Ontologies (CACAO) is a project to do large-scale manual community annotation of gene function using the Gene Ontology as a multi-institution student competition. ",
      "datatype" : null,
      "database" : "Community Assessment of Community Annotation with Ontologies",
      "abbreviation" : "CACAO",
      "example_id" : "MYCS2:A0QNF5",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MYCS2:A0QNF5",
      "name" : null
   },
   "pubchem_bioassay" : {
      "url_syntax" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "PubChem_BioAssay:177",
      "id" : null,
      "url_example" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=177",
      "name" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "object" : "Identifier",
      "abbreviation" : "PubChem_BioAssay",
      "datatype" : null,
      "database" : "NCBI PubChem database of bioassay records"
   },
   "h-invdb_cdna" : {
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=AK093149",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "H-invDB_cDNA:AK093148",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=[example_id]",
      "datatype" : null,
      "database" : "H-invitational Database",
      "abbreviation" : "H-invDB_cDNA",
      "object" : "Accession",
      "generic_url" : "http://www.h-invitational.jp/"
   },
   "ecocyc" : {
      "name" : null,
      "url_example" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=P2-PWY",
      "local_id_syntax" : "^EG[0-9]{5}$",
      "url_syntax" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "fullname" : null,
      "entity_type" : "GO:0008150 ! biological process",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "EcoCyc:P2-PWY",
      "abbreviation" : "EcoCyc",
      "datatype" : null,
      "database" : "Encyclopedia of E. coli metabolism",
      "generic_url" : "http://ecocyc.org/",
      "object" : "Pathway identifier"
   },
   "obo_sf_po" : {
      "url_syntax" : "https://sourceforge.net/tracker/index.php?func=detail&aid=[example_id]&group_id=76834&atid=835555",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : "OBO_SF_PO:3184921",
      "url_example" : "https://sourceforge.net/tracker/index.php?func=detail&aid=3184921&group_id=76834&atid=835555",
      "name" : null,
      "generic_url" : "http://sourceforge.net/tracker/?func=browse&group_id=76834&atid=835555",
      "object" : "Term request",
      "abbreviation" : "OBO_SF_PO",
      "datatype" : null,
      "database" : "Source Forge OBO Plant Ontology (PO) term request tracker"
   },
   "agricola_id" : {
      "object" : "AGRICOLA call number",
      "generic_url" : "http://agricola.nal.usda.gov/",
      "datatype" : null,
      "database" : "AGRICultural OnLine Access",
      "abbreviation" : "AGRICOLA_ID",
      "example_id" : "AGRICOLA_NAL:TP248.2 P76 v.14",
      "uri_prefix" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "url_example" : null,
      "name" : null
   },
   "pr" : {
      "name" : null,
      "local_id_syntax" : "^[0-9]{9}$",
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "entity_type" : "PR:000000001 ! protein ",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "PR:000025380",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "fullname" : null,
      "database" : "Protein Ontology",
      "datatype" : null,
      "abbreviation" : "PR",
      "object" : "Identifer",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml"
   },
   "echobase" : {
      "local_id_syntax" : "^EB[0-9]{4}$",
      "url_example" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=EB0231",
      "name" : null,
      "example_id" : "EchoBASE:EB0231",
      "uri_prefix" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "url_syntax" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=[example_id]",
      "fullname" : null,
      "database" : "EchoBASE post-genomic database for Escherichia coli",
      "datatype" : null,
      "abbreviation" : "EchoBASE",
      "object" : "Identifier",
      "generic_url" : "http://www.ecoli-york.org/"
   },
   "omssa" : {
      "fullname" : null,
      "url_syntax" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "id" : null,
      "name" : null,
      "url_example" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/omssa/",
      "object" : null,
      "abbreviation" : "OMSSA",
      "database" : "Open Mass Spectrometry Search Algorithm",
      "datatype" : null
   },
   "reac" : {
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "local_id_syntax" : "^REACT_[0-9]+$",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "id" : null,
      "example_id" : "Reactome:REACT_604",
      "uri_prefix" : null,
      "abbreviation" : "REAC",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "datatype" : null,
      "generic_url" : "http://www.reactome.org/",
      "object" : "Identifier"
   },
   "broad" : {
      "url_example" : null,
      "name" : null,
      "uri_prefix" : null,
      "example_id" : null,
      "id" : null,
      "fullname" : null,
      "url_syntax" : null,
      "database" : "Broad Institute",
      "datatype" : null,
      "abbreviation" : "Broad",
      "object" : null,
      "generic_url" : "http://www.broad.mit.edu/"
   },
   "um-bbd_ruleid" : {
      "example_id" : "UM-BBD_ruleID:bt0330",
      "uri_prefix" : null,
      "id" : null,
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=[example_id]",
      "fullname" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=bt0330",
      "name" : null,
      "object" : "Rule identifier",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "datatype" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "abbreviation" : "UM-BBD_ruleID"
   },
   "dictybase_gene_name" : {
      "name" : null,
      "url_example" : "http://dictybase.org/gene/mlcE",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "fullname" : null,
      "example_id" : "dictyBase_gene_name:mlcE",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "dictyBase_gene_name",
      "database" : "dictyBase",
      "datatype" : null,
      "generic_url" : "http://dictybase.org",
      "object" : "Gene name"
   },
   "genedb_spombe" : {
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$",
      "example_id" : "GeneDB_Spombe:SPAC890.04C",
      "id" : null,
      "uri_prefix" : null,
      "url_syntax" : "http://old.genedb.org/genedb/Search?organism=pombe&name=[example_id]",
      "abbreviation" : "GeneDB_Spombe",
      "replaced_by" : "PomBase",
      "object" : "Gene identifier",
      "name" : null,
      "url_example" : "http://old.genedb.org/genedb/Search?organism=pombe&name=SPAC890.04C",
      "entity_type" : "SO:0000704 ! gene ",
      "fullname" : null,
      "database" : "Schizosaccharomyces pombe GeneDB",
      "datatype" : null,
      "shorthand_name" : "Spombe",
      "is_obsolete" : "true",
      "generic_url" : "http://old.genedb.org/genedb/pombe/index.jsp"
   },
   "pdb" : {
      "name" : null,
      "local_id_syntax" : "^[A-Za-z0-9]{4}$",
      "url_example" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=1A4U",
      "fullname" : null,
      "url_syntax" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=[example_id]",
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "PDB:1A4U",
      "uri_prefix" : null,
      "id" : null,
      "abbreviation" : "PDB",
      "datatype" : null,
      "database" : "Protein Data Bank",
      "generic_url" : "http://www.rcsb.org/pdb/",
      "object" : "Identifier"
   },
   "panther" : {
      "abbreviation" : "PANTHER",
      "database" : "Protein ANalysis THrough Evolutionary Relationships Classification System",
      "datatype" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "object" : "Protein family tree identifier",
      "url_example" : "http://www.pantherdb.org/panther/lookupId.jsp?id=PTHR10000",
      "name" : null,
      "fullname" : null,
      "url_syntax" : "http://www.pantherdb.org/panther/lookupId.jsp?id=[example_id]",
      "example_id" : "PANTHER:PTHR11455",
      "uri_prefix" : null,
      "id" : null
   },
   "mo" : {
      "abbreviation" : "MO",
      "database" : "MGED Ontology",
      "datatype" : null,
      "generic_url" : "http://mged.sourceforge.net/ontologies/MGEDontology.php",
      "object" : "ontology term",
      "name" : null,
      "url_example" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#Action",
      "fullname" : null,
      "url_syntax" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#[example_id]",
      "id" : null,
      "uri_prefix" : null,
      "example_id" : "MO:Action"
   },
   "goc" : {
      "generic_url" : "http://www.geneontology.org/",
      "object" : null,
      "abbreviation" : "GOC",
      "database" : "Gene Ontology Consortium",
      "datatype" : null,
      "fullname" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "id" : null,
      "example_id" : null,
      "name" : null,
      "url_example" : null
   },
   "biocyc" : {
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=PWY-5271",
      "name" : null,
      "uri_prefix" : null,
      "example_id" : "BioCyc:PWY-5271",
      "id" : null,
      "fullname" : null,
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "datatype" : null,
      "database" : "BioCyc collection of metabolic pathway databases",
      "abbreviation" : "BioCyc",
      "object" : "Identifier",
      "generic_url" : "http://biocyc.org/"
   },
   "geo" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/geo/",
      "object" : null,
      "abbreviation" : "GEO",
      "database" : "NCBI Gene Expression Omnibus",
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=[example_id]",
      "fullname" : null,
      "uri_prefix" : null,
      "example_id" : "GEO:GDS2223",
      "id" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=GDS2223",
      "name" : null
   }
};
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

// All of the server/instance-specific meta-data.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Variable: dispatch
 * 
 * The configuration for the data.
 * Essentially a JSONification of the YAML file.
 * This should be consumed directly by <amigo.handler>.
 */
amigo.data.dispatch = {
   "annotation_extension_json" : {
      "context" : {
         "bbop.widgets.search_pane" : "amigo.handlers.owl_class_expression"
      }
   }
};
/*
 * Package: context.js
 * 
 * Namespace: amigo.data.context
 * 
 * Another context.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Variable: context
 * 
 * Colors are X11: http://cng.seas.rochester.edu/CNG/docs/x11color.html
 */
amigo.data.context = {
    'instance_of':
    {
	readable: 'activity',
	priority: 8,
	aliases: [
	    'activity'
	],
	color: '#FFFAFA' // snow
    },
    'BFO:0000050':
    {
	readable: 'part of',
	priority: 15,
	aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000050',
		//'http://purl.obolibrary.org/obo/part_of',
	    'BFO_0000050',
	    'part:of',
	    'part of',
	    'part_of'
	],
	color: '#add8e6' // light blue
    },
    'BFO:0000051':
    {
	readable: 'has part',
	priority: 4,
	aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000051',
	    'has:part',
	    'has part',
	    'has_part'
	],
	color: '#6495ED' // cornflower blue
    },
    'BFO:0000066':
    {
	readable: 'occurs in',
	priority: 12,
	aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000066',
		//'BFO_0000066',
	    'occurs:in',
	    'occurs in',
	    'occurs_in'
	],
	color: '#66CDAA' // medium aquamarine
    },
    'RO:0002202':
    {
	readable: 'develops from',
	priority: 0,
	aliases: [
	    'develops:from',
	    'develops from',
	    'develops_from'
	],
	color: '#A52A2A' // brown
    },
    'RO:0002211':
    {
	readable: 'regulates',
	priority: 16,
	aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002211'
	    'regulates'
	],
	color: '#2F4F4F' // dark slate grey
    },
    'RO:0002212':
    {
	readable: 'negatively regulates',
	priority: 17,
	aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002212'
	    'negatively:regulates',
	    'negatively regulates',
	    'negatively_regulates'
	],
	glyph: 'bar',
	color: '#FF0000' // red
    },
    'RO:0002213':
    {
	readable: 'positively regulates',
	priority: 18,
	aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002213'
	    'positively:regulates',
	    'positively regulates',
	    'positively_regulates'
	],
	glyph: 'arrow',
	color: '#008000' //green
    },
    'RO:0002233':
    {
	readable: 'has input',
	priority: 14,
	aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000051',
	    'has:input',
	    'has input',
	    'has_input'
	],
	color: '#6495ED' // cornflower blue
    },
    'RO:0002234':
    {
	readable: 'has output',
	priority: 0,
	aliases: [
	    'has:output',
	    'has output',
	    'has_output'
	],
	color: '#ED6495' // ??? - random
    },
    'RO:0002330':
    {
	readable: 'genomically related to',
	priority: 0,
	aliases: [
	    'genomically related to',
	    'genomically_related_to'
	],
	color: '#9932CC' // darkorchid
    },
    'RO:0002331':
    {
	readable: 'involved in',
	priority: 3,
	aliases: [
	    'involved:in',
	    'involved in',
	    'involved_in'
	],
	color: '#E9967A' // darksalmon
    },
    'RO:0002332':
    {
	readable: 'regulates level of',
	priority: 0,
	aliases: [
	    'regulates level of',
	    'regulates_level_of'
	],
	color: '#556B2F' // darkolivegreen
    },
    'RO:0002333':
    {
	readable: 'enabled by',
	priority: 13,
	aliases: [
	    'RO_0002333',
	    'enabled:by',
	    'enabled by',
	    'enabled_by'
	],
	color: '#B8860B' // darkgoldenrod
    },
    'RO:0002334':
    {
	readable: 'regulated by',
	priority: 0,
	aliases: [
	    'RO_0002334',
	    'regulated by',
	    'regulated_by'
	],
	color: '#86B80B' // ??? - random
    },
    'RO:0002335':
    {
	readable: 'negatively regulated by',
	priority: 0,
	aliases: [
	    'RO_0002335',
	    'negatively regulated by',
	    'negatively_regulated_by'
	],
	color: '#0B86BB' // ??? - random
    },
    'RO:0002336':
    {
	readable: 'positively regulated by',
	priority: 0,
	aliases: [
	    'RO_0002336',
	    'positively regulated by',
	    'positively_regulated_by'
	],
	color: '#BB0B86' // ??? - random
    },
    'activates':
    {
	readable: 'activates',
	priority: 0,
	aliases: [
	    'http://purl.obolibrary.org/obo/activates'
	],
	//glyph: 'arrow',
	//glyph: 'diamond',
	//glyph: 'wedge',
	//glyph: 'bar',
	color: '#8FBC8F' // darkseagreen
    },
    'RO:0002404':
    {
	readable: 'causally downstream of',
	priority: 2,
	aliases: [
	    'causally_downstream_of'
	],
	color: '#FF1493' // deeppink
    },
    'RO:0002406':
    {
	readable: 'directly activates',
	priority: 20,
	aliases: [
		//'http://purl.obolibrary.org/obo/directly_activates',
	    'directly:activates',
	    'directly activates',
	    'directly_activates'
	],
	glyph: 'arrow',
	color: '#2F4F4F' // darkslategray
    },
    'upstream_of':
    {
	readable: 'upstream of',
	priority: 2,
	aliases: [
		//'http://purl.obolibrary.org/obo/upstream_of'
	    'upstream:of',
	    'upstream of',
	    'upstream_of'
	],
	color: '#FF1493' // deeppink
    },
    'RO:0002408':
    {
	readable: 'directly inhibits',
	priority: 19,
	aliases: [
		//'http://purl.obolibrary.org/obo/directly_inhibits'
	    'directly:inhibits',
	    'directly inhibits',
	    'directly_inhibits'
	],
	glyph: 'bar',
	color: '#7FFF00' // chartreuse
    },
    'RO:0002411':
    {
	readable: 'causally upstream of',
	priority: 2,
	aliases: [
	    'causally_upstream_of'
	],
	color: '#483D8B' // darkslateblue
    },
    'indirectly_disables_action_of':
    {
	readable: 'indirectly disables action of',
	priority: 0,
	aliases: [
		//'http://purl.obolibrary.org/obo/indirectly_disables_action_of'
	    'indirectly disables action of',
	    'indirectly_disables_action_of'
	],
	color: '#483D8B' // darkslateblue
    },
    'provides_input_for':
    {
	readable: 'provides input for',
	priority: 0,
	aliases: [
	    'GOREL_provides_input_for',
	    'http://purl.obolibrary.org/obo/GOREL_provides_input_for'
	],
	color: '#483D8B' // darkslateblue
    },
    'RO:0002413':
    {
	readable: 'directly provides input for',
	priority: 1,
	aliases: [
	    'directly_provides_input_for',
	    'GOREL_directly_provides_input_for',
	    'http://purl.obolibrary.org/obo/GOREL_directly_provides_input_for'
	],
	glyph: 'diamond',
	color: '#483D8B' // darkslateblue
    },
    // New ones for monarch.
    'subclass_of':
    {
	readable: 'subclass of',
	priority: 100,
	aliases: [
	    'SUBCLASS_OF'
	],
	glyph: 'diamond',
	color: '#E9967A' // darksalmon
    },
    'superclass_of':
    {
	readable: 'superclass of',
	priority: 100,
	aliases: [
	    'SUPERCLASS_OF'
	],
	glyph: 'diamond',
	color: '#556B2F' // darkolivegreen
    },
    'annotation':
    {
	readable: 'annotation',
	priority: 100,
	aliases: [
	    'ANNOTATION'
	],
	glyph: 'diamond',
	color: '#483D8B' // darkslateblue
    }
};
/*
 * Package: statistics.js
 * 
 * Namespace: amigo.data.statistics
 * 
 * This package was automatically created during an AmiGO 2 installation.
 * 
 * Purpose: Useful numbers about the current data in the store.
 * 
 * Requirements: amigo2.js for bbop.amigo namespace.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }
if ( typeof amigo.data.statistics == "undefined" ){ amigo.data.statistics = {}; }

/*
 * Variable: annotation_evidence
 * 
 * TBD
 */
amigo.data.statistics.annotation_source = [["MGI", 143898], ["UniProtKB", 131680], ["ZFIN", 88093], ["WB", 68439], ["TAIR", 68319], ["SGD", 44070], ["PomBase", 38714], ["RGD", 23674], ["dictyBase", 20561], ["InterPro", 12251], ["TIGR", 11229], ["RefGenome", 7252], ["GOC", 6282], ["BHF-UCL", 4758], ["IntAct", 2036], ["HGNC", 532], ["UniPathway", 499], ["DFLAT", 311], ["PINC", 18], ["Roslin_Institute", 10], ["ENSEMBL", 5], ["Reactome", 3]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["experimental evidence", 192016], ["similarity evidence", 132787], ["curator inference", 68788], ["combinatorial evidence", 15414], ["author statement", 11503]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["dictyBase", 9289, 4311, 6478, 483, 0, 0, 0, 0], ["EcoCyc", 0, 0, 0, 0, 0, 0, 0, 0], ["FlyBase", 0, 0, 0, 0, 0, 0, 0, 0], ["MGI", 53520, 55284, 32957, 2002, 135, 0, 0, 0], ["PomBase", 10204, 16257, 3661, 2286, 511, 0, 0, 0], ["RGD", 23674, 0, 0, 0, 0, 0, 0, 0], ["SGD", 3396, 33774, 4578, 2321, 1, 0, 0, 0], ["TAIR", 11078, 16661, 6626, 1663, 14752, 0, 0, 0], ["WB", 861, 33166, 60, 144, 1, 0, 0, 0], ["ZFIN", 507, 10672, 10946, 127, 0, 0, 0, 0]];
/*
 * Package: rollup.js
 * 
 * Namespace: amigo.ui.rollup
 * 
 * BBOP method to roll an information are up to save real estate.
 * This requires jQuery and an HTML format like:
 * 
 * : <div id="ID_TEXT" class="SOME_CLASS_FOR_YOUR_STYLING">
 * :  <span class="ANOTHERONE">ANCHOR_TEXT<a href="#"><img src="?" /></span></a>
 * :  <div>
 * :   ABC
 * :  </div>
 * : </div>
 * 
 * Usage would then simply be:
 * 
 * : amigo.ui.rollup(['ID_TEXT']);
 * 
 * As a note, for AmiGO 2, his is handled by the common templates
 * info_rollup_start.tmpl and info_rollup_end.tmpl in the amigo git
 * repo. Usage would be like:
 * 
 * : [% rollup_id = "ID_TEXT" %]
 * : [% rollup_anchor = "ANCHOR_TEXT" %]
 * : [% INCLUDE "common/info_rollup_start.tmpl" %]
 * : ABC
 * : [% INCLUDE "common/info_rollup_end.tmpl" %]
 * 
 * Again, this is a method, not an object constructor.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.ui == "undefined" ){ amigo.ui = {}; }

/*
 * Method: rollup
 * 
 * See top-level for details.
 * 
 * Arguments:
 *  elt_ids - a list if element ids of the areas to roll up
 * 
 * Returns:
 *  n/a
 */
amigo.ui.rollup = function(elt_ids){

    var each = bbop.core.each;
    each(elt_ids,
    	 function(eltid){
	     var eheader = '#' + eltid + ' > div';
	     var earea = '#' + eltid + ' > span > a';
	     jQuery(eheader).hide();
    	     var click_elt =
		 jQuery(earea).click(function(){
					 jQuery(eheader).toggle("blind",{},250);
					 return false;
				     });
	 });
};

// If it looks like we're in an environment that supports CommonJS
// Modules 1.0, take the amigo namespace whole and export it. Otherwise
// (browser environment, etc.), take no action and depend on the
// global namespace.
if( typeof(exports) != 'undefined' ){

    // Old style--exporting separate namespace.
    exports.amigo = amigo;

    // New, better, style--assemble; these should not collide.
    bbop.core.each(amigo, function(k, v){
	exports[k] = v;
    });
}
