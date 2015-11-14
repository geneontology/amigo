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
amigo.version.revision = "2.4.3";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
amigo.version.release = "20151113";
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
if( typeof amigo === "undefined" ){ var amigo = {}; }

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
	'annotation_class_list': true,
	// Noctua model stuff.
	'function_class': true,
	'function_class_closure': true,
	'process_class': true,
	'process_class_closure': true,
	'location_list': true,
	'location_list_closure': true
    };
    this.bio_category = {
        'gp': true,
	'gene_product': true,
	'bioentity': true
    };
    this.model_category = {
        'model': true
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
	'model': '/model',
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
    if( xid && xid !== '' ){

	// First let's do the ones that need an associated id to
	// function--either data urls or searches.
	if( id && id !== '' ){
	    if( this.ont_category[xid] ){
		retval = this.app_base + '/amigo/term/' + id;
		//retval = _add_restmark_modifier(retval, modifier);
            }else if( this.bio_category[xid] ){
		retval = this.app_base + '/amigo/gene_product/' + id;
		//retval = _add_restmark_modifier(retval, modifier);
            }else if( this.model_category[xid] ){
		retval = this.app_base + '/amigo/model/'+ id;
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
		if( xid === 'medial_search' ){
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
    if( ! retval && id && id !== '' ){ // not internal, but still has an id
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
 * Package: qualifiers.js
 * 
 * Namespace: amigo.handlers.qualifiers
 * 
 * 
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers == "undefined" ){ amigo.handlers = {}; }

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
amigo.handlers.qualifiers = function(in_qual){

    var retstr = in_qual;

    // Aliases.
    var is_def = bbop.core.is_defined;
    var what_is = bbop.core.what_is;

    if( is_def(in_qual) ){
	if( what_is(in_qual) == 'string' ){
	    if( in_qual == 'not' || in_qual == 'NOT' ){
		retstr = '<span class="qualifier-not">NOT</span>';
	    }
	}
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
   "ontology" : {
      "schema_generating" : "true",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml",
      "display_name" : "Ontology",
      "weight" : "40",
      "filter_weights" : "source^4.0 subset^3.0 regulates_closure_label^1.0 is_obsolete^0.0",
      "document_category" : "ontology_class",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "fields" : [
         {
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "property" : [
               "getIdentifier"
            ],
            "cardinality" : "single",
            "id" : "id",
            "indexed" : "true",
            "description" : "Term identifier.",
            "required" : "false"
         },
         {
            "property" : [
               "getIdentifier"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Term",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Term identifier.",
            "id" : "annotation_class"
         },
         {
            "id" : "annotation_class_label",
            "required" : "false",
            "description" : "Identifier.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "cardinality" : "single",
            "property" : [
               "getLabel"
            ],
            "searchable" : "true"
         },
         {
            "cardinality" : "single",
            "property" : [
               "getDef"
            ],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Definition",
            "type" : "string",
            "description" : "Term definition.",
            "required" : "false",
            "indexed" : "true",
            "id" : "description"
         },
         {
            "indexed" : "true",
            "description" : "Term namespace.",
            "required" : "false",
            "id" : "source",
            "searchable" : "false",
            "property" : [
               "getNamespace"
            ],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Ontology source",
            "transform" : []
         },
         {
            "required" : "false",
            "description" : "Is the term obsolete?",
            "indexed" : "true",
            "id" : "is_obsolete",
            "cardinality" : "single",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Obsoletion",
            "type" : "boolean"
         },
         {
            "id" : "comment",
            "indexed" : "true",
            "required" : "false",
            "description" : "Term comments.",
            "type" : "string",
            "display_name" : "Comments",
            "transform" : [],
            "searchable" : "true",
            "property" : [
               "getComments"
            ],
            "cardinality" : "multi"
         },
         {
            "searchable" : "true",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Synonyms",
            "transform" : [],
            "indexed" : "true",
            "description" : "Term synonyms.",
            "required" : "false",
            "id" : "synonym"
         },
         {
            "required" : "false",
            "description" : "Alternate term identifier.",
            "indexed" : "true",
            "id" : "alternate_id",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "transform" : [],
            "type" : "string",
            "display_name" : "Alt ID"
         },
         {
            "id" : "replaced_by",
            "indexed" : "true",
            "description" : "Term that replaces this term.",
            "required" : "false",
            "display_name" : "Replaced By",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "description" : "Others terms you might want to look at.",
            "required" : "false",
            "indexed" : "true",
            "id" : "consider",
            "cardinality" : "multi",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Consider",
            "type" : "string"
         },
         {
            "id" : "subset",
            "indexed" : "true",
            "required" : "false",
            "description" : "Special use collections of terms.",
            "display_name" : "Subset",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getSubsets"
            ],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "id" : "definition_xref",
            "required" : "false",
            "description" : "Definition cross-reference.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Def xref",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getDefXref"
            ]
         },
         {
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [
               "getXref"
            ],
            "searchable" : "false",
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "indexed" : "true"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true",
            "id" : "isa_partof_closure"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "type" : "string",
            "display_name" : "Ancestor",
            "transform" : [],
            "searchable" : "false",
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
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of)."
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
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Ancestor",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "id" : "regulates_closure_label"
         },
         {
            "id" : "topology_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "searchable" : "false",
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
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
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
            "transform" : [],
            "type" : "string",
            "display_name" : "Regulates transitivity graph (JSON)",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "required" : "false",
            "indexed" : "false",
            "id" : "regulates_transitivity_graph_json"
         },
         {
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Only in taxon",
            "type" : "string",
            "description" : "Only in taxon.",
            "required" : "false",
            "indexed" : "true",
            "id" : "only_in_taxon"
         },
         {
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Only in taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Only in taxon label.",
            "required" : "false",
            "id" : "only_in_taxon_label"
         },
         {
            "id" : "only_in_taxon_closure",
            "required" : "false",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getDummyStrings"
            ]
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "id" : "only_in_taxon_closure_label",
            "required" : "false",
            "description" : "Only in taxon label closure.",
            "indexed" : "true"
         },
         {
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "searchable" : "false",
            "property" : [
               "getDummyString"
            ],
            "cardinality" : "single",
            "id" : "annotation_extension_owl_json",
            "indexed" : "true",
            "required" : "false",
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON)."
         },
         {
            "property" : [
               "getDummyString"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Annotation relation",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "This is equivalent to the relation field in GPAD.",
            "id" : "annotation_relation"
         },
         {
            "id" : "annotation_relation_label",
            "required" : "false",
            "description" : "This is equivalent to the relation field in GPAD.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Annotation relation",
            "type" : "string",
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true"
         },
         {
            "display_name" : "Eq class expressions",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getDummyString"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "equivalent_class_expressions_json",
            "indexed" : "true",
            "required" : "false",
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....)."
         },
         {
            "id" : "disjoint_class_list",
            "description" : "Disjoint classes.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Disjoint classes",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [
               "getDummyStrings"
            ],
            "searchable" : "false"
         },
         {
            "id" : "disjoint_class_list_label",
            "indexed" : "true",
            "description" : "Disjoint classes.",
            "required" : "false",
            "type" : "string",
            "display_name" : "Disjoint classes",
            "transform" : [],
            "searchable" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "cardinality" : "multi"
         }
      ],
      "id" : "ontology",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0",
      "fields_hash" : {
         "only_in_taxon" : {
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Only in taxon",
            "type" : "string",
            "description" : "Only in taxon.",
            "required" : "false",
            "indexed" : "true",
            "id" : "only_in_taxon"
         },
         "replaced_by" : {
            "id" : "replaced_by",
            "indexed" : "true",
            "description" : "Term that replaces this term.",
            "required" : "false",
            "display_name" : "Replaced By",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "annotation_extension_owl_json" : {
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "searchable" : "false",
            "property" : [
               "getDummyString"
            ],
            "cardinality" : "single",
            "id" : "annotation_extension_owl_json",
            "indexed" : "true",
            "required" : "false",
            "description" : "A non-lossy representation of conjunctions and disjunctions in c16 (JSON)."
         },
         "comment" : {
            "id" : "comment",
            "indexed" : "true",
            "required" : "false",
            "description" : "Term comments.",
            "type" : "string",
            "display_name" : "Comments",
            "transform" : [],
            "searchable" : "true",
            "property" : [
               "getComments"
            ],
            "cardinality" : "multi"
         },
         "annotation_relation" : {
            "property" : [
               "getDummyString"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Annotation relation",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "This is equivalent to the relation field in GPAD.",
            "id" : "annotation_relation"
         },
         "database_xref" : {
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [
               "getXref"
            ],
            "searchable" : "false",
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "indexed" : "true"
         },
         "description" : {
            "cardinality" : "single",
            "property" : [
               "getDef"
            ],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Definition",
            "type" : "string",
            "description" : "Term definition.",
            "required" : "false",
            "indexed" : "true",
            "id" : "description"
         },
         "annotation_class_label" : {
            "id" : "annotation_class_label",
            "required" : "false",
            "description" : "Identifier.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "cardinality" : "single",
            "property" : [
               "getLabel"
            ],
            "searchable" : "true"
         },
         "consider" : {
            "description" : "Others terms you might want to look at.",
            "required" : "false",
            "indexed" : "true",
            "id" : "consider",
            "cardinality" : "multi",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Consider",
            "type" : "string"
         },
         "annotation_class" : {
            "property" : [
               "getIdentifier"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Term",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Term identifier.",
            "id" : "annotation_class"
         },
         "isa_partof_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "required" : "false",
            "description" : "Ancestral terms (is_a/part_of).",
            "indexed" : "true",
            "id" : "isa_partof_closure"
         },
         "equivalent_class_expressions_json" : {
            "display_name" : "Eq class expressions",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getDummyString"
            ],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "equivalent_class_expressions_json",
            "indexed" : "true",
            "required" : "false",
            "description" : "For any class document C, this will contain json(CE) for all axioms of form EquivalentClasses(C ... CE ....)."
         },
         "definition_xref" : {
            "id" : "definition_xref",
            "required" : "false",
            "description" : "Definition cross-reference.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Def xref",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getDefXref"
            ]
         },
         "synonym" : {
            "searchable" : "true",
            "property" : [
               "getOBOSynonymStrings"
            ],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Synonyms",
            "transform" : [],
            "indexed" : "true",
            "description" : "Term synonyms.",
            "required" : "false",
            "id" : "synonym"
         },
         "topology_graph_json" : {
            "id" : "topology_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "searchable" : "false",
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
            "cardinality" : "single"
         },
         "only_in_taxon_closure" : {
            "id" : "only_in_taxon_closure",
            "required" : "false",
            "description" : "Only in taxon closure.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getDummyStrings"
            ]
         },
         "disjoint_class_list" : {
            "id" : "disjoint_class_list",
            "description" : "Disjoint classes.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Disjoint classes",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [
               "getDummyStrings"
            ],
            "searchable" : "false"
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "indexed" : "true"
         },
         "only_in_taxon_label" : {
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Only in taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Only in taxon label.",
            "required" : "false",
            "id" : "only_in_taxon_label"
         },
         "alternate_id" : {
            "required" : "false",
            "description" : "Alternate term identifier.",
            "indexed" : "true",
            "id" : "alternate_id",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "transform" : [],
            "type" : "string",
            "display_name" : "Alt ID"
         },
         "is_obsolete" : {
            "required" : "false",
            "description" : "Is the term obsolete?",
            "indexed" : "true",
            "id" : "is_obsolete",
            "cardinality" : "single",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Obsoletion",
            "type" : "boolean"
         },
         "only_in_taxon_closure_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "id" : "only_in_taxon_closure_label",
            "required" : "false",
            "description" : "Only in taxon label closure.",
            "indexed" : "true"
         },
         "regulates_transitivity_graph_json" : {
            "cardinality" : "single",
            "searchable" : "false",
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
            "transform" : [],
            "type" : "string",
            "display_name" : "Regulates transitivity graph (JSON)",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "required" : "false",
            "indexed" : "false",
            "id" : "regulates_transitivity_graph_json"
         },
         "id" : {
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "property" : [
               "getIdentifier"
            ],
            "cardinality" : "single",
            "id" : "id",
            "indexed" : "true",
            "description" : "Term identifier.",
            "required" : "false"
         },
         "annotation_relation_label" : {
            "id" : "annotation_relation_label",
            "required" : "false",
            "description" : "This is equivalent to the relation field in GPAD.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Annotation relation",
            "type" : "string",
            "cardinality" : "single",
            "property" : [
               "getDummyString"
            ],
            "searchable" : "true"
         },
         "regulates_closure" : {
            "type" : "string",
            "display_name" : "Ancestor",
            "transform" : [],
            "searchable" : "false",
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
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of)."
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
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Ancestor",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "id" : "regulates_closure_label"
         },
         "disjoint_class_list_label" : {
            "id" : "disjoint_class_list_label",
            "indexed" : "true",
            "description" : "Disjoint classes.",
            "required" : "false",
            "type" : "string",
            "display_name" : "Disjoint classes",
            "transform" : [],
            "searchable" : "true",
            "property" : [
               "getDummyStrings"
            ],
            "cardinality" : "multi"
         },
         "subset" : {
            "id" : "subset",
            "indexed" : "true",
            "required" : "false",
            "description" : "Special use collections of terms.",
            "display_name" : "Subset",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getSubsets"
            ],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "source" : {
            "indexed" : "true",
            "description" : "Term namespace.",
            "required" : "false",
            "id" : "source",
            "searchable" : "false",
            "property" : [
               "getNamespace"
            ],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Ontology source",
            "transform" : []
         }
      },
      "description" : "Gene Ontology Term, Synonym, or Definition.",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/ont-config.yaml"
   },
   "general" : {
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "fields" : [
         {
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "description" : "The mangled internal ID for this entity.",
            "display_name" : "Internal ID",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "required" : "false",
            "description" : "The ID/label for this entity.",
            "indexed" : "true",
            "id" : "entity",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Entity"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Enity label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "entity_label",
            "required" : "false",
            "description" : "The label for this entity.",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "The document category that this enitity belongs to.",
            "id" : "category",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Document category",
            "transform" : []
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Generic blob",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "required" : "false",
            "indexed" : "true",
            "id" : "general_blob"
         }
      ],
      "id" : "general",
      "result_weights" : "entity^3.0 category^1.0",
      "description" : "A generic search document to get a general overview of everything.",
      "fields_hash" : {
         "entity_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Enity label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "entity_label",
            "required" : "false",
            "description" : "The label for this entity.",
            "indexed" : "true"
         },
         "general_blob" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Generic blob",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "required" : "false",
            "indexed" : "true",
            "id" : "general_blob"
         },
         "id" : {
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "description" : "The mangled internal ID for this entity.",
            "display_name" : "Internal ID",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         "entity" : {
            "required" : "false",
            "description" : "The ID/label for this entity.",
            "indexed" : "true",
            "id" : "entity",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Entity"
         },
         "category" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "The document category that this enitity belongs to.",
            "id" : "category",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Document category",
            "transform" : []
         }
      },
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/general-config.yaml",
      "schema_generating" : "true",
      "weight" : "0",
      "display_name" : "General",
      "filter_weights" : "category^4.0",
      "document_category" : "general",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0"
   },
   "family" : {
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/protein-family-config.yaml",
      "fields_hash" : {
         "bioentity_list_label" : {
            "indexed" : "true",
            "description" : "Gene/products annotated with this protein family.",
            "required" : "false",
            "id" : "bioentity_list_label",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Gene/products",
            "transform" : []
         },
         "panther_family" : {
            "id" : "panther_family",
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         "panther_family_label" : {
            "id" : "panther_family_label",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : []
         },
         "phylo_graph_json" : {
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "phylo_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree."
         },
         "bioentity_list" : {
            "id" : "bioentity_list",
            "required" : "false",
            "description" : "Gene/products annotated with this protein family.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/products",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         "id" : {
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Acc",
            "type" : "string",
            "description" : "Family ID.",
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         }
      },
      "description" : "Information about protein (PANTHER) families.",
      "result_weights" : "panther_family^5.0 bioentity_list^4.0",
      "id" : "family",
      "fields" : [
         {
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Acc",
            "type" : "string",
            "description" : "Family ID.",
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         },
         {
            "id" : "panther_family",
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         {
            "id" : "panther_family_label",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : []
         },
         {
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "phylo_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree."
         },
         {
            "id" : "bioentity_list",
            "required" : "false",
            "description" : "Gene/products annotated with this protein family.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/products",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         {
            "indexed" : "true",
            "description" : "Gene/products annotated with this protein family.",
            "required" : "false",
            "id" : "bioentity_list_label",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Gene/products",
            "transform" : []
         }
      ],
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "boost_weights" : "panther_family^2.0 panther_family_label^2.0 bioentity_list^1.0 bioentity_list_label^1.0",
      "document_category" : "family",
      "filter_weights" : "bioentity_list_label^1.0",
      "display_name" : "Protein families",
      "weight" : "5",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/protein-family-config.yaml",
      "schema_generating" : "true"
   },
   "bbop_ann_ev_agg" : {
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/ann_ev_agg-config.yaml",
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "fields_hash" : {
         "evidence_type_closure" : {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "required" : "false",
            "description" : "All evidence for this term/gene product pair",
            "indexed" : "true",
            "id" : "evidence_type_closure"
         },
         "taxon_closure" : {
            "id" : "taxon_closure",
            "required" : "false",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         "evidence_with" : {
            "id" : "evidence_with",
            "description" : "All column 8s for this term/gene product pair",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Evidence with",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         "taxon_label" : {
            "id" : "taxon_label",
            "required" : "false",
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : []
         },
         "taxon" : {
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "taxon",
            "indexed" : "true",
            "description" : "Column 13: taxon.",
            "required" : "false"
         },
         "annotation_class" : {
            "id" : "annotation_class",
            "description" : "Column 5.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : []
         },
         "id" : {
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "description" : "Gene/product ID."
         },
         "bioentity" : {
            "indexed" : "true",
            "description" : "Column 1 + columns 2.",
            "required" : "false",
            "id" : "bioentity",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Gene/product ID",
            "transform" : []
         },
         "panther_family_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "panther_family_label",
            "description" : "Families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         "annotation_class_label" : {
            "id" : "annotation_class_label",
            "indexed" : "true",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "display_name" : "Annotation class label",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single"
         },
         "panther_family" : {
            "transform" : [],
            "display_name" : "Protein family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "panther_family",
            "description" : "Family IDs that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         "taxon_closure_label" : {
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "required" : "false",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon"
         },
         "bioentity_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "bioentity_label",
            "description" : "Column 3.",
            "required" : "false",
            "indexed" : "true"
         }
      },
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "searchable_extension" : "_searchable",
      "fields" : [
         {
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "description" : "Gene/product ID."
         },
         {
            "indexed" : "true",
            "description" : "Column 1 + columns 2.",
            "required" : "false",
            "id" : "bioentity",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Gene/product ID",
            "transform" : []
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "bioentity_label",
            "description" : "Column 3.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "annotation_class",
            "description" : "Column 5.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : []
         },
         {
            "id" : "annotation_class_label",
            "indexed" : "true",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "display_name" : "Annotation class label",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "required" : "false",
            "description" : "All evidence for this term/gene product pair",
            "indexed" : "true",
            "id" : "evidence_type_closure"
         },
         {
            "id" : "evidence_with",
            "description" : "All column 8s for this term/gene product pair",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Evidence with",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         {
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "taxon",
            "indexed" : "true",
            "description" : "Column 13: taxon.",
            "required" : "false"
         },
         {
            "id" : "taxon_label",
            "required" : "false",
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : []
         },
         {
            "id" : "taxon_closure",
            "required" : "false",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         {
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "required" : "false",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon"
         },
         {
            "transform" : [],
            "display_name" : "Protein family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "panther_family",
            "description" : "Family IDs that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "panther_family_label",
            "description" : "Families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         }
      ],
      "_strict" : 0,
      "id" : "bbop_ann_ev_agg",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "document_category" : "annotation_evidence_aggregate",
      "display_name" : "Advanced",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0",
      "weight" : "-10",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/ann_ev_agg-config.yaml",
      "schema_generating" : "true"
   },
   "bioentity" : {
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/bio-config.yaml",
      "schema_generating" : "true",
      "display_name" : "Genes and gene products",
      "weight" : "30",
      "filter_weights" : "source^7.0 type^6.0 panther_family_label^5.0 annotation_class_list_label^3.5 taxon_label^4.0 regulates_closure_label^2.0",
      "document_category" : "bioentity",
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0 bioentity_name^1.0 bioentity_internal_id^1.0 synonym^1.0 isa_partof_closure_label^1.0 regulates_closure^1.0 regulates_closure_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "id",
            "description" : "Gene of gene product ID.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Gene or gene product ID.",
            "id" : "bioentity",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Acc",
            "transform" : []
         },
         {
            "id" : "bioentity_label",
            "required" : "false",
            "description" : "Symbol or name.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Label",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Name",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "The full name of the gene product.",
            "required" : "false",
            "id" : "bioentity_name"
         },
         {
            "type" : "string",
            "display_name" : "This should not be displayed",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin."
         },
         {
            "type" : "string",
            "display_name" : "Type",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "type",
            "indexed" : "true",
            "description" : "Type class.",
            "required" : "false"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "taxon",
            "description" : "Taxonomic group",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "description" : "Taxonomic group",
            "required" : "false",
            "id" : "taxon_label",
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         {
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups."
         },
         {
            "indexed" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "id" : "taxon_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : []
         },
         {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon subset",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "required" : "false",
            "id" : "taxon_subset_closure"
         },
         {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Taxon subset",
            "transform" : [],
            "indexed" : "true",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "required" : "false",
            "id" : "taxon_subset_closure_label"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Involved in",
            "description" : "Closure of ids/accs over isa and partof.",
            "required" : "false",
            "indexed" : "true",
            "id" : "isa_partof_closure"
         },
         {
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "id" : "isa_partof_closure_label",
            "required" : "false",
            "description" : "Closure of labels over isa and partof.",
            "indexed" : "true"
         },
         {
            "id" : "regulates_closure",
            "indexed" : "true",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "indexed" : "true",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "id" : "regulates_closure_label"
         },
         {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Database source.",
            "required" : "false",
            "id" : "source"
         },
         {
            "id" : "annotation_class_list",
            "required" : "false",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         {
            "id" : "annotation_class_list_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Direct annotations.",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "id" : "synonym",
            "description" : "Gene product synonyms.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         {
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         {
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family_label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree.",
            "indexed" : "false",
            "id" : "phylo_graph_json"
         },
         {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "required" : "false",
            "description" : "Database cross-reference.",
            "indexed" : "true",
            "id" : "database_xref"
         }
      ],
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "id" : "bioentity",
      "result_weights" : "bioentity^8.0 bioentity_name^7.0 taxon^6.0 panther_family^5.0 type^4.0 source^3.0 synonym^1.0",
      "description" : "Genes and gene products associated with GO terms.",
      "fields_hash" : {
         "bioentity_name" : {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Name",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "The full name of the gene product.",
            "required" : "false",
            "id" : "bioentity_name"
         },
         "id" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "id",
            "description" : "Gene of gene product ID.",
            "required" : "false",
            "indexed" : "true"
         },
         "panther_family" : {
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "id" : "isa_partof_closure_label",
            "required" : "false",
            "description" : "Closure of labels over isa and partof.",
            "indexed" : "true"
         },
         "annotation_class_list" : {
            "id" : "annotation_class_list",
            "required" : "false",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         "source" : {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Database source.",
            "required" : "false",
            "id" : "source"
         },
         "annotation_class_list_label" : {
            "id" : "annotation_class_list_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Direct annotations.",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "regulates_closure" : {
            "id" : "regulates_closure",
            "indexed" : "true",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "taxon_closure" : {
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups."
         },
         "regulates_closure_label" : {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "indexed" : "true",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "id" : "regulates_closure_label"
         },
         "taxon_subset_closure" : {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon subset",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "required" : "false",
            "id" : "taxon_subset_closure"
         },
         "bioentity" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Gene or gene product ID.",
            "id" : "bioentity",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Acc",
            "transform" : []
         },
         "bioentity_internal_id" : {
            "type" : "string",
            "display_name" : "This should not be displayed",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin."
         },
         "panther_family_label" : {
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family_label",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         "phylo_graph_json" : {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree.",
            "indexed" : "false",
            "id" : "phylo_graph_json"
         },
         "taxon_subset_closure_label" : {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Taxon subset",
            "transform" : [],
            "indexed" : "true",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "required" : "false",
            "id" : "taxon_subset_closure_label"
         },
         "database_xref" : {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "required" : "false",
            "description" : "Database cross-reference.",
            "indexed" : "true",
            "id" : "database_xref"
         },
         "taxon_closure_label" : {
            "indexed" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "id" : "taxon_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : []
         },
         "bioentity_label" : {
            "id" : "bioentity_label",
            "required" : "false",
            "description" : "Symbol or name.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Label",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         "type" : {
            "type" : "string",
            "display_name" : "Type",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "type",
            "indexed" : "true",
            "description" : "Type class.",
            "required" : "false"
         },
         "synonym" : {
            "id" : "synonym",
            "description" : "Gene product synonyms.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         "isa_partof_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Involved in",
            "description" : "Closure of ids/accs over isa and partof.",
            "required" : "false",
            "indexed" : "true",
            "id" : "isa_partof_closure"
         },
         "taxon" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "taxon",
            "description" : "Taxonomic group",
            "required" : "false",
            "indexed" : "true"
         },
         "taxon_label" : {
            "indexed" : "true",
            "description" : "Taxonomic group",
            "required" : "false",
            "id" : "taxon_label",
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         }
      },
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/bio-config.yaml"
   },
   "model_annotation" : {
      "document_category" : "model_annotation",
      "boost_weights" : "model_label^1.0 annotation_unit_label^1.0 enabled_by^1.0 enabled_by_label^1.0 location_list_closure^1.0 location_list_closure_label^1.0 process_class_closure_label^1.0 function_class_closure_label^1.0 comment^0.5",
      "schema_generating" : "true",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/model-ann-config.yaml",
      "weight" : "40",
      "display_name" : "GO Models (ALPHA)",
      "filter_weights" : "model_label^5.0 enabled_by_label^4.5 reference^4.3 location_list_closure_label^4.0 process_class_closure_label^3.0 function_class_closure_label^2.0 contributor^1.0 evidence_type^0.5",
      "description" : "An individual unit within LEGO. This is <strong>ALPHA</strong> software.",
      "fields_hash" : {
         "evidence_type" : {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "evidence_type",
            "indexed" : "true",
            "required" : "false",
            "description" : "Evidence type."
         },
         "annotation_unit" : {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "required" : "false",
            "description" : "???.",
            "indexed" : "true",
            "id" : "annotation_unit"
         },
         "evidence_type_closure" : {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Evidence type",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "All evidence (evidence closure) for this annotation",
            "id" : "evidence_type_closure"
         },
         "location_list_label" : {
            "id" : "location_list_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "",
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "enabled_by" : {
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "id" : "enabled_by",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Enabled by",
            "type" : "string"
         },
         "comment" : {
            "transform" : [],
            "display_name" : "Comments",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "comment",
            "required" : "false",
            "description" : "Comments",
            "indexed" : "true"
         },
         "panther_family_label" : {
            "id" : "panther_family_label",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single"
         },
         "evidence_type_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Evidence",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "evidence_type_label",
            "description" : "Evidence type.",
            "required" : "false",
            "indexed" : "true"
         },
         "evidence_type_closure_label" : {
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "id" : "evidence_type_closure_label",
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "indexed" : "true"
         },
         "location_list_closure_label" : {
            "transform" : [],
            "display_name" : "Location",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "id" : "location_list_closure_label",
            "required" : "false",
            "description" : "",
            "indexed" : "true"
         },
         "process_class" : {
            "required" : "false",
            "description" : "Process acc/ID.",
            "indexed" : "true",
            "id" : "process_class",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Process"
         },
         "taxon_label" : {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "id" : "taxon_label"
         },
         "taxon" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "taxon",
            "required" : "false",
            "description" : "GAF column 13 (taxon).",
            "indexed" : "true"
         },
         "annotation_value" : {
            "id" : "annotation_value",
            "indexed" : "true",
            "description" : "set of all literal values of all annotation assertions in model",
            "required" : "false",
            "type" : "string",
            "display_name" : "Text",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         "function_class_closure_label" : {
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "id" : "function_class_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "???"
         },
         "process_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "required" : "false",
            "description" : "Common process name.",
            "indexed" : "true",
            "id" : "process_class_label"
         },
         "location_list_closure" : {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "",
            "id" : "location_list_closure"
         },
         "location_list" : {
            "id" : "location_list",
            "indexed" : "true",
            "description" : "",
            "required" : "false",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         "annotation_unit_label" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "???.",
            "id" : "annotation_unit_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Annotation unit",
            "transform" : []
         },
         "process_class_closure_label" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "???",
            "id" : "process_class_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Process",
            "transform" : []
         },
         "model_url" : {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Model URL",
            "transform" : [],
            "indexed" : "true",
            "description" : "???.",
            "required" : "false",
            "id" : "model_url"
         },
         "enabled_by_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Enabled by",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "enabled_by_label",
            "description" : "???",
            "required" : "false",
            "indexed" : "true"
         },
         "function_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Function",
            "description" : "Common function name.",
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_label"
         },
         "panther_family" : {
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "panther_family",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         "owl_blob_json" : {
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "owl_blob_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "???"
         },
         "id" : {
            "indexed" : "true",
            "description" : "A unique (and internal) thing.",
            "required" : "false",
            "id" : "id",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "ID",
            "transform" : []
         },
         "evidence_with" : {
            "description" : "Evidence with/from.",
            "required" : "false",
            "indexed" : "true",
            "id" : "evidence_with",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Evidence with"
         },
         "contributor" : {
            "id" : "contributor",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Contributor",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : []
         },
         "taxon_closure" : {
            "id" : "taxon_closure",
            "required" : "false",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         "model_label" : {
            "indexed" : "true",
            "description" : "???.",
            "required" : "false",
            "id" : "model_label",
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Model title",
            "type" : "string",
            "transform" : []
         },
         "function_class" : {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Function acc/ID.",
            "id" : "function_class"
         },
         "function_class_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Function",
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_closure"
         },
         "model" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Model title",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "model",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true"
         },
         "taxon_closure_label" : {
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi"
         },
         "process_class_closure" : {
            "transform" : [],
            "display_name" : "Process",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "id" : "process_class_closure",
            "required" : "false",
            "description" : "???",
            "indexed" : "true"
         },
         "model_state" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "???.",
            "id" : "model_state",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "State",
            "transform" : []
         },
         "reference" : {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Reference",
            "type" : "string",
            "required" : "false",
            "description" : "Database reference.",
            "indexed" : "true",
            "id" : "reference"
         },
         "topology_graph_json" : {
            "id" : "topology_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single"
         },
         "model_date" : {
            "id" : "model_date",
            "indexed" : "true",
            "description" : "Last modified",
            "required" : "false",
            "display_name" : "Modified",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single"
         }
      },
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/model-ann-config.yaml",
      "fields" : [
         {
            "indexed" : "true",
            "description" : "A unique (and internal) thing.",
            "required" : "false",
            "id" : "id",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "ID",
            "transform" : []
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "required" : "false",
            "description" : "???.",
            "indexed" : "true",
            "id" : "annotation_unit"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "???.",
            "id" : "annotation_unit_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Annotation unit",
            "transform" : []
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Model title",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "model",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "description" : "???.",
            "required" : "false",
            "id" : "model_label",
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Model title",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Model URL",
            "transform" : [],
            "indexed" : "true",
            "description" : "???.",
            "required" : "false",
            "id" : "model_url"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "???.",
            "id" : "model_state",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "State",
            "transform" : []
         },
         {
            "id" : "annotation_value",
            "indexed" : "true",
            "description" : "set of all literal values of all annotation assertions in model",
            "required" : "false",
            "type" : "string",
            "display_name" : "Text",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         {
            "id" : "contributor",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Contributor",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : []
         },
         {
            "id" : "model_date",
            "indexed" : "true",
            "description" : "Last modified",
            "required" : "false",
            "display_name" : "Modified",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "transform" : [],
            "display_name" : "Comments",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "comment",
            "required" : "false",
            "description" : "Comments",
            "indexed" : "true"
         },
         {
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "id" : "enabled_by",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Enabled by",
            "type" : "string"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Enabled by",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "enabled_by_label",
            "description" : "???",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "panther_family",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "panther_family_label",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "taxon",
            "required" : "false",
            "description" : "GAF column 13 (taxon).",
            "indexed" : "true"
         },
         {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "id" : "taxon_label"
         },
         {
            "id" : "taxon_closure",
            "required" : "false",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : []
         },
         {
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Function acc/ID.",
            "id" : "function_class"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Function",
            "description" : "Common function name.",
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_label"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Function",
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_closure"
         },
         {
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "id" : "function_class_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "???"
         },
         {
            "required" : "false",
            "description" : "Process acc/ID.",
            "indexed" : "true",
            "id" : "process_class",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Process"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "required" : "false",
            "description" : "Common process name.",
            "indexed" : "true",
            "id" : "process_class_label"
         },
         {
            "transform" : [],
            "display_name" : "Process",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "id" : "process_class_closure",
            "required" : "false",
            "description" : "???",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "???",
            "id" : "process_class_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Process",
            "transform" : []
         },
         {
            "id" : "location_list",
            "indexed" : "true",
            "description" : "",
            "required" : "false",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         {
            "id" : "location_list_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "",
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "",
            "id" : "location_list_closure"
         },
         {
            "transform" : [],
            "display_name" : "Location",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false",
            "id" : "location_list_closure_label",
            "required" : "false",
            "description" : "",
            "indexed" : "true"
         },
         {
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "owl_blob_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "???"
         },
         {
            "id" : "topology_graph_json",
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single"
         },
         {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "evidence_type",
            "indexed" : "true",
            "required" : "false",
            "description" : "Evidence type."
         },
         {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Evidence type",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "All evidence (evidence closure) for this annotation",
            "id" : "evidence_type_closure"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Evidence",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "evidence_type_label",
            "description" : "Evidence type.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "id" : "evidence_type_closure_label",
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "description" : "Evidence with/from.",
            "required" : "false",
            "indexed" : "true",
            "id" : "evidence_with",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Evidence with"
         },
         {
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Reference",
            "type" : "string",
            "required" : "false",
            "description" : "Database reference.",
            "indexed" : "true",
            "id" : "reference"
         }
      ],
      "_strict" : 0,
      "searchable_extension" : "_searchable",
      "id" : "model_annotation",
      "result_weights" : "function_class^9.0 enabled_by^8.0 location_list^7.0 process_class^6.0 model^5.0 taxon^4.5 contributor^4.0 model_date^3.0 reference^2.0"
   },
   "noctua_model_meta" : {
      "fields_hash" : {
         "id" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Internal ID",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "id",
            "description" : "The mangled internal ID for this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         "annotation_unit" : {
            "id" : "annotation_unit",
            "description" : "The title(s) associated with the model.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Model identifier",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false"
         },
         "annotation_unit_label" : {
            "transform" : [],
            "display_name" : "Model identifier",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "annotation_unit_label",
            "required" : "false",
            "description" : "The title(s) associated with the model.",
            "indexed" : "true"
         },
         "model_date" : {
            "transform" : [],
            "display_name" : "Last modified",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "model_date",
            "required" : "false",
            "description" : "Model last modification dates.",
            "indexed" : "true"
         },
         "model_state" : {
            "id" : "model_state",
            "indexed" : "true",
            "required" : "false",
            "description" : "The editorial state of the model.",
            "type" : "string",
            "display_name" : "State",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single"
         },
         "comment" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Comment",
            "required" : "false",
            "description" : "The comments associated with a model.",
            "indexed" : "true",
            "id" : "comment"
         },
         "contributor" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Contributor",
            "required" : "false",
            "description" : "Contributor identity.",
            "indexed" : "true",
            "id" : "contributor"
         }
      },
      "description" : "A generic capture of light Noctua metadata in realtime.",
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/noctua-model-meta-config.yaml",
      "_strict" : 0,
      "fields" : [
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Internal ID",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "id",
            "description" : "The mangled internal ID for this entity.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "annotation_unit",
            "description" : "The title(s) associated with the model.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Model identifier",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false"
         },
         {
            "transform" : [],
            "display_name" : "Model identifier",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "annotation_unit_label",
            "required" : "false",
            "description" : "The title(s) associated with the model.",
            "indexed" : "true"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Contributor",
            "required" : "false",
            "description" : "Contributor identity.",
            "indexed" : "true",
            "id" : "contributor"
         },
         {
            "transform" : [],
            "display_name" : "Last modified",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true",
            "id" : "model_date",
            "required" : "false",
            "description" : "Model last modification dates.",
            "indexed" : "true"
         },
         {
            "id" : "model_state",
            "indexed" : "true",
            "required" : "false",
            "description" : "The editorial state of the model.",
            "type" : "string",
            "display_name" : "State",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Comment",
            "required" : "false",
            "description" : "The comments associated with a model.",
            "indexed" : "true",
            "id" : "comment"
         }
      ],
      "id" : "noctua_model_meta",
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_unit^3.0 contributor^2.0 model_state^1.0 model_date^1.0 comment^1.0",
      "document_category" : "noctua_model_meta",
      "boost_weights" : "annotation_unit_label^3.0 contributor^2.0 model_date^1.0 comment^1.0",
      "schema_generating" : "true",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/noctua-model-meta-config.yaml",
      "display_name" : "Noctua meta",
      "filter_weights" : "contributor^3.0 model_state^2.0 model_date^1.0",
      "weight" : "0"
   },
   "annotation" : {
      "display_name" : "Annotations",
      "filter_weights" : "source^7.0 assigned_by^6.5 aspect^6.25 evidence_type_closure^6.0 panther_family_label^5.5 qualifier^5.25 taxon_label^5.0 annotation_class_label^4.5 regulates_closure_label^3.0 annotation_extension_class_closure_label^2.0",
      "weight" : "20",
      "schema_generating" : "true",
      "_outfile" : "/home/sjcarbon//local/src/git/amigo/metadata/ann-config.yaml",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 bioentity_name^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 reference^1.0 panther_family^1.0 panther_family_label^1.0 bioentity_isoform^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "document_category" : "annotation",
      "result_weights" : "bioentity^7.0 bioentity_name^6.0 qualifier^5.0 annotation_class^4.7 annotation_extension_json^4.5 assigned_by^4.0 taxon^3.0 evidence_type^2.5 evidence_with^2.0 panther_family^1.5 bioentity_isoform^0.5 reference^0.25 date^0.10",
      "_strict" : 0,
      "id" : "annotation",
      "searchable_extension" : "_searchable",
      "fields" : [
         {
            "id" : "id",
            "indexed" : "true",
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "required" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "id" : "source",
            "description" : "Database source.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Source",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : []
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Type class id",
            "description" : "Type class.",
            "required" : "false",
            "indexed" : "true",
            "id" : "type"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Date",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "date",
            "required" : "false",
            "description" : "Date of assignment.",
            "indexed" : "true"
         },
         {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Assigned by",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Annotations assigned by group.",
            "required" : "false",
            "id" : "assigned_by"
         },
         {
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Redundant for",
            "type" : "string",
            "description" : "Rational for redundancy of annotation.",
            "required" : "false",
            "indexed" : "true",
            "id" : "is_redundant_for"
         },
         {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxonomic group.",
            "required" : "false",
            "id" : "taxon"
         },
         {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "id" : "taxon_label"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "id" : "taxon_closure",
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         {
            "id" : "taxon_closure_label",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true"
         },
         {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon subset",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "id" : "taxon_subset_closure"
         },
         {
            "id" : "taxon_subset_closure_label",
            "required" : "false",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon subset",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : []
         },
         {
            "type" : "string",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "secondary_taxon",
            "indexed" : "true",
            "required" : "false",
            "description" : "Secondary taxon."
         },
         {
            "id" : "secondary_taxon_label",
            "required" : "false",
            "description" : "Secondary taxon.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         {
            "id" : "secondary_taxon_closure",
            "required" : "false",
            "description" : "Secondary taxon closure.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Secondary taxon closure.",
            "required" : "false",
            "id" : "secondary_taxon_closure_label"
         },
         {
            "id" : "isa_partof_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "display_name" : "Involved in",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "id" : "isa_partof_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "display_name" : "Involved in",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi"
         },
         {
            "id" : "regulates_closure",
            "indexed" : "true",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "required" : "false",
            "description" : "Annotations for this term or its children (over regulates).",
            "indexed" : "true",
            "id" : "regulates_closure_label",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Inferred annotation",
            "type" : "string"
         },
         {
            "type" : "string",
            "display_name" : "Has participant (IDs)",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "id" : "has_participant_closure",
            "indexed" : "true",
            "description" : "Closure of ids/accs over has_participant.",
            "required" : "false"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Closure of labels over has_participant.",
            "id" : "has_participant_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Has participant",
            "transform" : []
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonym",
            "required" : "false",
            "description" : "Gene or gene product synonyms.",
            "indexed" : "true",
            "id" : "synonym"
         },
         {
            "display_name" : "Gene/product",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "bioentity",
            "indexed" : "true",
            "description" : "Gene or gene product identifiers.",
            "required" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product",
            "required" : "false",
            "description" : "Gene or gene product identifiers.",
            "indexed" : "true",
            "id" : "bioentity_label"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product name",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "bioentity_name",
            "description" : "The full name of the gene or gene product.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin."
         },
         {
            "id" : "qualifier",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotation qualifier.",
            "type" : "string",
            "display_name" : "Qualifier",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         {
            "id" : "annotation_class",
            "indexed" : "true",
            "description" : "Direct annotations.",
            "required" : "false",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "required" : "false",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         {
            "description" : "Ontology aspect.",
            "required" : "false",
            "indexed" : "true",
            "id" : "aspect",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Ontology (aspect)",
            "type" : "string"
         },
         {
            "id" : "bioentity_isoform",
            "description" : "Biological isoform.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Isoform",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "description" : "Evidence type.",
            "required" : "false",
            "id" : "evidence_type",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Evidence",
            "transform" : []
         },
         {
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "id" : "evidence_type_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "All evidence (evidence closure) for this annotation"
         },
         {
            "type" : "string",
            "display_name" : "Evidence with",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "id" : "evidence_with",
            "indexed" : "true",
            "required" : "false",
            "description" : "Evidence with/from."
         },
         {
            "display_name" : "Reference",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "id" : "reference",
            "indexed" : "true",
            "description" : "Database reference.",
            "required" : "false"
         },
         {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "id" : "annotation_extension_class"
         },
         {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class_label"
         },
         {
            "id" : "annotation_extension_class_closure",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Annotation extension",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         {
            "id" : "annotation_extension_class_closure_label",
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "description" : "Extension class for the annotation (JSON).",
            "required" : "false",
            "id" : "annotation_extension_json",
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family"
         },
         {
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "id" : "panther_family_label",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false"
         }
      ],
      "_infile" : "/home/sjcarbon//local/src/git/amigo/metadata/ann-config.yaml",
      "description" : "Associations between GO terms and genes or gene products.",
      "fields_hash" : {
         "secondary_taxon_closure" : {
            "id" : "secondary_taxon_closure",
            "required" : "false",
            "description" : "Secondary taxon closure.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         "has_participant_closure_label" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Closure of labels over has_participant.",
            "id" : "has_participant_closure_label",
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "type" : "string",
            "display_name" : "Has participant",
            "transform" : []
         },
         "evidence_type_closure" : {
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "id" : "evidence_type_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "All evidence (evidence closure) for this annotation"
         },
         "annotation_extension_class_label" : {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class_label"
         },
         "regulates_closure" : {
            "id" : "regulates_closure",
            "indexed" : "true",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "qualifier" : {
            "id" : "qualifier",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotation qualifier.",
            "type" : "string",
            "display_name" : "Qualifier",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi"
         },
         "has_participant_closure" : {
            "type" : "string",
            "display_name" : "Has participant (IDs)",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "multi",
            "id" : "has_participant_closure",
            "indexed" : "true",
            "description" : "Closure of ids/accs over has_participant.",
            "required" : "false"
         },
         "bioentity_name" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product name",
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "id" : "bioentity_name",
            "description" : "The full name of the gene or gene product.",
            "required" : "false",
            "indexed" : "true"
         },
         "evidence_type" : {
            "indexed" : "true",
            "description" : "Evidence type.",
            "required" : "false",
            "id" : "evidence_type",
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Evidence",
            "transform" : []
         },
         "type" : {
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Type class id",
            "description" : "Type class.",
            "required" : "false",
            "indexed" : "true",
            "id" : "type"
         },
         "secondary_taxon_label" : {
            "id" : "secondary_taxon_label",
            "required" : "false",
            "description" : "Secondary taxon.",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "true"
         },
         "annotation_extension_json" : {
            "indexed" : "true",
            "description" : "Extension class for the annotation (JSON).",
            "required" : "false",
            "id" : "annotation_extension_json",
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : []
         },
         "annotation_extension_class_closure_label" : {
            "id" : "annotation_extension_class_closure_label",
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi"
         },
         "isa_partof_closure" : {
            "id" : "isa_partof_closure",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "display_name" : "Involved in",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "taxon_label" : {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "id" : "taxon_label"
         },
         "taxon" : {
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "indexed" : "true",
            "description" : "Taxonomic group.",
            "required" : "false",
            "id" : "taxon"
         },
         "annotation_extension_class" : {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Annotation extension",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "id" : "annotation_extension_class"
         },
         "secondary_taxon_closure_label" : {
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Secondary taxon closure.",
            "required" : "false",
            "id" : "secondary_taxon_closure_label"
         },
         "bioentity" : {
            "display_name" : "Gene/product",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "bioentity",
            "indexed" : "true",
            "description" : "Gene or gene product identifiers.",
            "required" : "false"
         },
         "panther_family_label" : {
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "id" : "panther_family_label",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false"
         },
         "taxon_subset_closure" : {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon subset",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "id" : "taxon_subset_closure"
         },
         "bioentity_isoform" : {
            "id" : "bioentity_isoform",
            "description" : "Biological isoform.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Isoform",
            "type" : "string",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false"
         },
         "taxon_subset_closure_label" : {
            "id" : "taxon_subset_closure_label",
            "required" : "false",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon subset",
            "cardinality" : "multi",
            "searchable" : "true",
            "property" : []
         },
         "source" : {
            "id" : "source",
            "description" : "Database source.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Source",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : []
         },
         "date" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Date",
            "cardinality" : "single",
            "searchable" : "false",
            "property" : [],
            "id" : "date",
            "required" : "false",
            "description" : "Date of assignment.",
            "indexed" : "true"
         },
         "taxon_closure" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "id" : "taxon_closure",
            "property" : [],
            "searchable" : "false",
            "cardinality" : "multi",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         "evidence_with" : {
            "type" : "string",
            "display_name" : "Evidence with",
            "transform" : [],
            "searchable" : "true",
            "property" : [],
            "cardinality" : "multi",
            "id" : "evidence_with",
            "indexed" : "true",
            "required" : "false",
            "description" : "Evidence with/from."
         },
         "is_redundant_for" : {
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Redundant for",
            "type" : "string",
            "description" : "Rational for redundancy of annotation.",
            "required" : "false",
            "indexed" : "true",
            "id" : "is_redundant_for"
         },
         "regulates_closure_label" : {
            "required" : "false",
            "description" : "Annotations for this term or its children (over regulates).",
            "indexed" : "true",
            "id" : "regulates_closure_label",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Inferred annotation",
            "type" : "string"
         },
         "aspect" : {
            "description" : "Ontology aspect.",
            "required" : "false",
            "indexed" : "true",
            "id" : "aspect",
            "cardinality" : "single",
            "property" : [],
            "searchable" : "false",
            "transform" : [],
            "display_name" : "Ontology (aspect)",
            "type" : "string"
         },
         "assigned_by" : {
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Assigned by",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "description" : "Annotations assigned by group.",
            "required" : "false",
            "id" : "assigned_by"
         },
         "id" : {
            "id" : "id",
            "indexed" : "true",
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "required" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         "isa_partof_closure_label" : {
            "id" : "isa_partof_closure_label",
            "indexed" : "true",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "display_name" : "Involved in",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi"
         },
         "panther_family" : {
            "searchable" : "true",
            "property" : [],
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family"
         },
         "synonym" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonym",
            "required" : "false",
            "description" : "Gene or gene product synonyms.",
            "indexed" : "true",
            "id" : "synonym"
         },
         "reference" : {
            "display_name" : "Reference",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "true",
            "cardinality" : "multi",
            "id" : "reference",
            "indexed" : "true",
            "description" : "Database reference.",
            "required" : "false"
         },
         "bioentity_internal_id" : {
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin."
         },
         "annotation_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "required" : "false",
            "description" : "Direct annotations.",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         "annotation_class" : {
            "id" : "annotation_class",
            "indexed" : "true",
            "description" : "Direct annotations.",
            "required" : "false",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "property" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         "annotation_extension_class_closure" : {
            "id" : "annotation_extension_class_closure",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Annotation extension",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "false"
         },
         "taxon_closure_label" : {
            "id" : "taxon_closure_label",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "cardinality" : "multi",
            "property" : [],
            "searchable" : "true"
         },
         "bioentity_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product",
            "required" : "false",
            "description" : "Gene or gene product identifiers.",
            "indexed" : "true",
            "id" : "bioentity_label"
         },
         "secondary_taxon" : {
            "type" : "string",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "searchable" : "false",
            "property" : [],
            "cardinality" : "single",
            "id" : "secondary_taxon",
            "indexed" : "true",
            "required" : "false",
            "description" : "Secondary taxon."
         }
      }
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
    var meta_data = {"species_map":{},"evidence_codes":{},"galaxy_base":"http://galaxy.berkeleybop.org/","sources":[],"html_base":"http://localhost:9999/static","noctua_base":"http://noctua.berkeleybop.org/","js_dev_base":"http://localhost:9999/static/staging","bbop_img_star":"http://localhost:9999/static/images/star.png","golr_base":"http://localhost:8080/solr/","term_regexp":"all|GO:[0-9]{7}","css_base":"http://localhost:9999/static/css","beta":"1","ontologies":[],"gp_types":[],"image_base":"http://localhost:9999/static/images","app_base":"http://localhost:9999","js_base":"http://localhost:9999/static/js","species":[]};

    ///
    /// Break out the data and various functions to access them...
    ///

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
     * Function: noctua_base
     * 
     * Access to AmiGO variable noctua_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var noctua_base = meta_data.noctua_base;
    this.noctua_base = function(){ return noctua_base; };

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
 * from the GO.xrf_abbs file at: "https://raw.githubusercontent.com/geneontology/go-site/master/metadata/db-xrefs.yaml".
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
   "pseudocap" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://v2.pseudomonas.com/",
      "abbreviation" : "PseudoCAP",
      "example_id" : "PseudoCAP:PA4756",
      "url_syntax" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=[example_id]",
      "url_example" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=PA4756",
      "object" : "entity",
      "id" : "PseudoCAP",
      "database" : "Pseudomonas Genome Project",
      "name" : "Pseudomonas Genome Project"
   },
   "intact" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein complex",
      "generic_url" : "http://www.ebi.ac.uk/intact/",
      "url_syntax" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=[example_id]",
      "example_id" : "IntAct:EBI-17086",
      "abbreviation" : "IntAct",
      "name" : "IntAct protein interaction database",
      "database" : "IntAct protein interaction database",
      "id" : "IntAct",
      "object" : "protein complex",
      "url_example" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=EBI-17086"
   },
   "h-invdb_locus" : {
      "generic_url" : "http://www.h-invitational.jp/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=HIX0014446",
      "object" : "entity",
      "id" : "H-invDB_locus",
      "database" : "H-invitational Database",
      "name" : "H-invitational Database",
      "abbreviation" : "H-invDB_locus",
      "example_id" : "H-invDB_locus:HIX0014446",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=[example_id]"
   },
   "sp_kw" : {
      "abbreviation" : "SP_KW",
      "example_id" : "UniProtKB-KW:KW-0812",
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "id" : "UniProtKB-KW",
      "object" : "entity",
      "database" : "UniProt Knowledgebase keywords",
      "name" : "UniProt Knowledgebase keywords",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org/keywords/"
   },
   "jcvi_genprop" : {
      "example_id" : "JCVI_GenProp:GenProp0120",
      "abbreviation" : "JCVI_GenProp",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "object" : "biological_process",
      "id" : "JCVI_GenProp",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "name" : "Genome Properties database at the J. Craig Venter Institute",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "datatype" : "biological_process",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "tigr_tigrfams" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "polypeptide region",
      "generic_url" : "http://search.jcvi.org/",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "abbreviation" : "TIGR_TIGRFAMS",
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "name" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "id" : "JCVI_TIGRFAMS",
      "object" : "polypeptide region"
   },
   "gonuts" : {
      "generic_url" : "http://gowiki.tamu.edu",
      "fullname" : "Third party documentation for GO and community annotation system.",
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "database" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "object" : "entity",
      "id" : "GONUTS",
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MOUSE:CD28",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "example_id" : "GONUTS:MOUSE:CD28",
      "abbreviation" : "GONUTS"
   },
   "iuphar_gpcr" : {
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=[example_id]",
      "example_id" : "IUPHAR_GPCR:1279",
      "abbreviation" : "IUPHAR_GPCR",
      "name" : "International Union of Pharmacology",
      "database" : "International Union of Pharmacology",
      "id" : "IUPHAR_GPCR",
      "object" : "entity",
      "url_example" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=13",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.iuphar.org/"
   },
   "enzyme" : {
      "generic_url" : "http://www.expasy.ch/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "Swiss Institute of Bioinformatics enzyme database",
      "database" : "Swiss Institute of Bioinformatics enzyme database",
      "object" : "entity",
      "id" : "ENZYME",
      "url_example" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?1.1.1.1",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?[example_id]",
      "example_id" : "ENZYME:EC 1.1.1.1",
      "abbreviation" : "ENZYME"
   },
   "prints" : {
      "abbreviation" : "PRINTS",
      "example_id" : "PRINTS:PR00025",
      "url_syntax" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=[example_id]",
      "url_example" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=PR00025",
      "object" : "polypeptide region",
      "id" : "PRINTS",
      "database" : "PRINTS compendium of protein fingerprints",
      "name" : "PRINTS compendium of protein fingerprints",
      "datatype" : "polypeptide region",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.bioinf.manchester.ac.uk/dbbrowser/PRINTS/"
   },
   "ma" : {
      "id" : "MA",
      "object" : "entity",
      "url_example" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:0000003",
      "name" : "Adult Mouse Anatomical Dictionary",
      "database" : "Adult Mouse Anatomical Dictionary",
      "example_id" : "MA:0000003",
      "abbreviation" : "MA",
      "url_syntax" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:[example_id]",
      "generic_url" : "http://www.informatics.jax.org/",
      "datatype" : "entity",
      "fullname" : "Adult Mouse Anatomical Dictionary; part of Gene Expression Database",
      "uri_prefix" : null
   },
   "gorel" : {
      "id" : "GOREL",
      "object" : "entity",
      "url_example" : null,
      "name" : "GO Extensions to OBO Relation Ontology Ontology",
      "database" : "GO Extensions to OBO Relation Ontology Ontology",
      "example_id" : null,
      "abbreviation" : "GOREL",
      "url_syntax" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "datatype" : "entity",
      "fullname" : "Additional relations pending addition into RO",
      "uri_prefix" : null
   },
   "mim" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "abbreviation" : "MIM",
      "example_id" : "OMIM:190198",
      "database" : "Mendelian Inheritance in Man",
      "name" : "Mendelian Inheritance in Man",
      "url_example" : "http://omim.org/entry/190198",
      "id" : "OMIM",
      "object" : "entity"
   },
   "go_ref" : {
      "url_syntax" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:[example_id]",
      "abbreviation" : "GO_REF",
      "example_id" : "GO_REF:0000001",
      "database" : "Gene Ontology Database references",
      "name" : "Gene Ontology Database references",
      "url_example" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:0000001",
      "id" : "GO_REF",
      "object" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.geneontology.org/"
   },
   "psort" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.psort.org/",
      "abbreviation" : "PSORT",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "id" : "PSORT",
      "object" : "entity",
      "database" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "name" : "PSORT protein subcellular localization databases and prediction tools for bacteria"
   },
   "gr" : {
      "url_syntax" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=[example_id]",
      "abbreviation" : "GR",
      "example_id" : "GR:sd1",
      "database" : "Gramene",
      "name" : "Gramene",
      "url_example" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=sd1",
      "object" : "protein",
      "id" : "GR",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein",
      "generic_url" : "http://www.gramene.org/"
   },
   "omssa" : {
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "OMSSA",
      "name" : "Open Mass Spectrometry Search Algorithm",
      "database" : "Open Mass Spectrometry Search Algorithm",
      "id" : "OMSSA",
      "object" : "entity",
      "url_example" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/omssa/"
   },
   "mo" : {
      "url_syntax" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#[example_id]",
      "example_id" : "MO:Action",
      "abbreviation" : "MO",
      "name" : "MGED Ontology",
      "database" : "MGED Ontology",
      "object" : "entity",
      "id" : "MO",
      "url_example" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#Action",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://mged.sourceforge.net/ontologies/MGEDontology.php"
   },
   "pmid" : {
      "name" : "PubMed",
      "database" : "PubMed",
      "id" : "PMID",
      "object" : "entity",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "example_id" : "PMID:4208797",
      "abbreviation" : "PMID",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "tgd_ref" : {
      "example_id" : "TGD_REF:T000005818",
      "abbreviation" : "TGD_REF",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "id" : "TGD_REF",
      "object" : "entity",
      "url_example" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=T000005818",
      "name" : "Tetrahymena Genome Database",
      "database" : "Tetrahymena Genome Database",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ciliate.org/"
   },
   "maizegdb_locus" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.maizegdb.org",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=[example_id]",
      "abbreviation" : "MaizeGDB_Locus",
      "example_id" : "MaizeGDB_Locus:ZmPK1",
      "database" : "MaizeGDB",
      "name" : "MaizeGDB",
      "url_example" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=ZmPK1",
      "object" : "gene",
      "id" : "MaizeGDB_Locus"
   },
   "cog_pathway" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : "COG_Pathway",
      "object" : "entity",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=14",
      "name" : "NCBI COG pathway",
      "database" : "NCBI COG pathway",
      "example_id" : "COG_Pathway:14",
      "abbreviation" : "COG_Pathway",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=[example_id]"
   },
   "mod" : {
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "object" : "entity",
      "id" : "PSI-MOD",
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "name" : "Proteomics Standards Initiative protein modification ontology",
      "abbreviation" : "MOD",
      "example_id" : "MOD:00219",
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]"
   },
   "broad_mgg" : {
      "id" : "Broad_MGG",
      "object" : "entity",
      "url_example" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=SMGG_05132",
      "name" : "Magnaporthe grisea Database",
      "database" : "Magnaporthe grisea Database",
      "example_id" : "Broad_MGG:MGG_05132.5",
      "abbreviation" : "Broad_MGG",
      "url_syntax" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=S[example_id]",
      "generic_url" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/Home.html",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : "Magnaporthe grisea Database at the Broad Institute"
   },
   "cazy" : {
      "example_id" : "CAZY:PL11",
      "abbreviation" : "CAZY",
      "url_syntax" : "http://www.cazy.org/[example_id].html",
      "id" : "CAZY",
      "object" : "entity",
      "url_example" : "http://www.cazy.org/PL11.html",
      "name" : "Carbohydrate Active EnZYmes",
      "database" : "Carbohydrate Active EnZYmes",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : "The CAZy database describes the families of structurally-related catalytic and carbohydrate-binding modules (or functional domains) of enzymes that degrade, modify, or create glycosidic bonds.",
      "generic_url" : "http://www.cazy.org/"
   },
   "psi-mi" : {
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "Proteomic Standard Initiative for Molecular Interaction",
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "id" : "PSI-MI",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : "MI:0018",
      "abbreviation" : "PSI-MI"
   },
   "mtbbase" : {
      "generic_url" : "http://www.ark.in-berlin.de/Site/MTBbase.html",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "database" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "object" : "entity",
      "id" : "MTBBASE",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "MTBBASE"
   },
   "wbls" : {
      "generic_url" : "http://www.wormbase.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "nematoda life stage",
      "database" : "C. elegans development",
      "name" : "C. elegans development",
      "url_example" : null,
      "object" : "nematoda life stage",
      "id" : "WBls",
      "url_syntax" : null,
      "abbreviation" : "WBls",
      "example_id" : "WBls:0000010"
   },
   "tgd" : {
      "url_syntax" : null,
      "abbreviation" : "TGD",
      "example_id" : null,
      "database" : "Tetrahymena Genome Database",
      "name" : "Tetrahymena Genome Database",
      "url_example" : null,
      "object" : "entity",
      "id" : "TGD",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.ciliate.org/"
   },
   "paint_ref" : {
      "url_syntax" : "http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt",
      "example_id" : "PAINT_REF:PTHR10046",
      "abbreviation" : "PAINT_REF",
      "name" : "Phylogenetic Annotation INference Tool References",
      "database" : "Phylogenetic Annotation INference Tool References",
      "object" : "entity",
      "id" : "PAINT_REF",
      "url_example" : "http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.pantherdb.org/"
   },
   "jcvi_medtr" : {
      "generic_url" : "http://medicago.jcvi.org/cgi-bin/medicago/overview.cgi",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=Medtr5g024510",
      "object" : "entity",
      "id" : "JCVI_Medtr",
      "database" : "Medicago truncatula genome database at the J. Craig Venter Institute",
      "name" : "Medicago truncatula genome database at the J. Craig Venter Institute",
      "abbreviation" : "JCVI_Medtr",
      "example_id" : "JCVI_Medtr:Medtr5g024510",
      "url_syntax" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=[example_id]"
   },
   "um-bbd" : {
      "abbreviation" : "UM-BBD",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "UM-BBD",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/"
   },
   "wikipedia" : {
      "database" : "Wikipedia",
      "name" : "Wikipedia",
      "url_example" : "http://en.wikipedia.org/wiki/Endoplasmic_reticulum",
      "object" : "entity",
      "id" : "Wikipedia",
      "url_syntax" : "http://en.wikipedia.org/wiki/[example_id]",
      "abbreviation" : "Wikipedia",
      "example_id" : "Wikipedia:Endoplasmic_reticulum",
      "generic_url" : "http://en.wikipedia.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "cbs" : {
      "generic_url" : "http://www.cbs.dtu.dk/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "Center for Biological Sequence Analysis",
      "name" : "Center for Biological Sequence Analysis",
      "url_example" : "http://www.cbs.dtu.dk/services/[example_id]/",
      "object" : "entity",
      "id" : "CBS",
      "url_syntax" : null,
      "abbreviation" : "CBS",
      "example_id" : "CBS:TMHMM"
   },
   "dbsnp" : {
      "database" : "NCBI dbSNP",
      "name" : "NCBI dbSNP",
      "url_example" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=rs3131969",
      "id" : "dbSNP",
      "object" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=[example_id]",
      "abbreviation" : "dbSNP",
      "example_id" : "dbSNP:rs3131969",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/projects/SNP",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "biosis" : {
      "database" : "BIOSIS previews",
      "name" : "BIOSIS previews",
      "url_example" : null,
      "id" : "BIOSIS",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "BIOSIS",
      "example_id" : "BIOSIS:200200247281",
      "generic_url" : "http://www.biosis.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "sgn_ref" : {
      "generic_url" : "http://www.sgn.cornell.edu/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=861",
      "id" : "SGN_ref",
      "object" : "entity",
      "database" : "Sol Genomics Network",
      "name" : "Sol Genomics Network",
      "abbreviation" : "SGN_ref",
      "example_id" : "SGN_ref:861",
      "url_syntax" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=[example_id]"
   },
   "ena" : {
      "generic_url" : "http://www.ebi.ac.uk/ena/",
      "datatype" : "entity",
      "fullname" : "ENA is made up of a number of distinct databases that includes EMBL-Bank, the newly established Sequence Read Archive (SRA) and the Trace Archive. International nucleotide sequence database collaboration, comprising ENA-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "uri_prefix" : null,
      "id" : "ENA",
      "object" : "entity",
      "url_example" : "http://www.ebi.ac.uk/ena/data/view/AA816246",
      "name" : "European Nucleotide Archive",
      "database" : "European Nucleotide Archive",
      "example_id" : "ENA:AA816246",
      "abbreviation" : "ENA",
      "url_syntax" : "http://www.ebi.ac.uk/ena/data/view/[example_id]"
   },
   "parkinsonsuk-ucl" : {
      "generic_url" : "http://www.ucl.ac.uk/functional-gene-annotation/neurological",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "name" : "Parkinsons Disease Gene Ontology Initiative",
      "database" : "Parkinsons Disease Gene Ontology Initiative",
      "id" : "ParkinsonsUK-UCL",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "ParkinsonsUK-UCL"
   },
   "panther" : {
      "generic_url" : "http://www.pantherdb.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein family",
      "database" : "Protein ANalysis THrough Evolutionary Relationships Classification System",
      "name" : "Protein ANalysis THrough Evolutionary Relationships Classification System",
      "url_example" : "http://www.pantherdb.org/panther/lookupId.jsp?id=PTHR10000",
      "object" : "protein family",
      "id" : "PANTHER",
      "url_syntax" : "http://www.pantherdb.org/panther/lookupId.jsp?id=[example_id]",
      "abbreviation" : "PANTHER",
      "example_id" : "PANTHER:PTHR11455"
   },
   "uniprot" : {
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "id" : "UniProtKB",
      "object" : "protein",
      "database" : "Universal Protein Knowledgebase",
      "name" : "Universal Protein Knowledgebase",
      "abbreviation" : "UniProt",
      "example_id" : "UniProtKB:P51587",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "generic_url" : "http://www.uniprot.org",
      "datatype" : "protein",
      "fullname" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "uri_prefix" : null
   },
   "cog_function" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=H",
      "object" : "entity",
      "id" : "COG_Function",
      "database" : "NCBI COG function",
      "name" : "NCBI COG function",
      "abbreviation" : "COG_Function",
      "example_id" : "COG_Function:H",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=[example_id]"
   },
   "reac" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.reactome.org/",
      "abbreviation" : "REAC",
      "example_id" : "Reactome:REACT_604",
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "object" : "entity",
      "id" : "Reactome",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "name" : "Reactome - a curated knowledgebase of biological pathways"
   },
   "agricola_ind" : {
      "url_syntax" : null,
      "example_id" : "AGRICOLA_IND:IND23252955",
      "abbreviation" : "AGRICOLA_IND",
      "name" : "AGRICultural OnLine Access",
      "database" : "AGRICultural OnLine Access",
      "object" : "entity",
      "id" : "AGRICOLA_IND",
      "url_example" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://agricola.nal.usda.gov/"
   },
   "issn" : {
      "generic_url" : "http://www.issn.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "International Standard Serial Number",
      "database" : "International Standard Serial Number",
      "id" : "ISSN",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : "ISSN:1234-1231",
      "abbreviation" : "ISSN"
   },
   "mitre" : {
      "example_id" : null,
      "abbreviation" : "MITRE",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "MITRE",
      "url_example" : null,
      "name" : "The MITRE Corporation",
      "database" : "The MITRE Corporation",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.mitre.org/"
   },
   "ipi" : {
      "abbreviation" : "IPI",
      "example_id" : "IPI:IPI00000005.1",
      "url_syntax" : null,
      "url_example" : null,
      "id" : "IPI",
      "object" : "entity",
      "database" : "International Protein Index",
      "name" : "International Protein Index",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/IPI/IPIhelp.html"
   },
   "ntnu_sb" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ntnu.edu/nt/systemsbiology",
      "example_id" : null,
      "abbreviation" : "NTNU_SB",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "NTNU_SB",
      "url_example" : null,
      "name" : "Norwegian University of Science and Technology, Systems Biology team",
      "database" : "Norwegian University of Science and Technology, Systems Biology team"
   },
   "bhf-ucl" : {
      "name" : "Cardiovascular Gene Ontology Annotation Initiative",
      "database" : "Cardiovascular Gene Ontology Annotation Initiative",
      "object" : "entity",
      "id" : "BHF-UCL",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "BHF-UCL",
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology/",
      "uri_prefix" : null,
      "fullname" : "The Cardiovascular Gene Ontology Annotation Initiative is supported by the British Heart Foundation (BHF) and located at University College London (UCL).",
      "datatype" : "entity"
   },
   "cog_cluster" : {
      "name" : "NCBI COG cluster",
      "database" : "NCBI COG cluster",
      "id" : "COG_Cluster",
      "object" : "entity",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=COG0001",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=[example_id]",
      "example_id" : "COG_Cluster:COG0001",
      "abbreviation" : "COG_Cluster",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "phi" : {
      "example_id" : "PHI:0000055",
      "abbreviation" : "PHI",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "PHI",
      "url_example" : null,
      "name" : "MeGO (Phage and Mobile Element Ontology)",
      "database" : "MeGO (Phage and Mobile Element Ontology)",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://aclame.ulb.ac.be/Classification/mego.html"
   },
   "prow" : {
      "name" : "Protein Reviews on the Web",
      "database" : "Protein Reviews on the Web",
      "id" : "PROW",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "PROW",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/prow/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "gr_gene" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.gramene.org/",
      "abbreviation" : "GR_gene",
      "example_id" : "GR_GENE:GR:0060198",
      "url_syntax" : "http://www.gramene.org/db/genes/search_gene?acc=[example_id]",
      "url_example" : "http://www.gramene.org/db/genes/search_gene?acc=GR:0060198",
      "id" : "GR_GENE",
      "object" : "entity",
      "database" : "Gramene",
      "name" : "Gramene"
   },
   "agi_locuscode" : {
      "generic_url" : "http://www.arabidopsis.org",
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : "Comprises TAIR, TIGR and MIPS",
      "id" : "AGI_LocusCode",
      "object" : "gene",
      "url_example" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=At2g17950",
      "name" : "Arabidopsis Genome Initiative",
      "database" : "Arabidopsis Genome Initiative",
      "example_id" : "AGI_LocusCode:At2g17950",
      "abbreviation" : "AGI_LocusCode",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=[example_id]"
   },
   "vmd" : {
      "name" : "Virginia Bioinformatics Institute Microbial Database",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "id" : "VMD",
      "object" : "entity",
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=109198",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=[example_id]",
      "example_id" : "VMD:109198",
      "abbreviation" : "VMD",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "ptarget" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://bioinformatics.albany.edu/~ptarget/",
      "url_syntax" : null,
      "abbreviation" : "pTARGET",
      "example_id" : null,
      "database" : "pTARGET Prediction server for protein subcellular localization",
      "name" : "pTARGET Prediction server for protein subcellular localization",
      "url_example" : null,
      "id" : "pTARGET",
      "object" : "entity"
   },
   "phenoscape" : {
      "database" : "PhenoScape Knowledgebase",
      "name" : "PhenoScape Knowledgebase",
      "url_example" : null,
      "id" : "PhenoScape",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "PhenoScape",
      "example_id" : null,
      "generic_url" : "http://phenoscape.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "prodom" : {
      "fullname" : "ProDom protein domain families automatically generated from UniProtKB",
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://prodom.prabi.fr/prodom/current/html/home.php",
      "url_syntax" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=[example_id]",
      "abbreviation" : "ProDom",
      "example_id" : "ProDom:PD000001",
      "database" : "ProDom protein domain families",
      "name" : "ProDom protein domain families",
      "url_example" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=PD000001",
      "id" : "ProDom",
      "object" : "entity"
   },
   "nasc_code" : {
      "generic_url" : "http://arabidopsis.info",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "name" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "url_example" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=N3371",
      "id" : "NASC_code",
      "object" : "entity",
      "url_syntax" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=[example_id]",
      "abbreviation" : "NASC_code",
      "example_id" : "NASC_code:N3371"
   },
   "eurofung" : {
      "generic_url" : "http://www.eurofung.net/option=com_content&task=section&id=3&Itemid=4",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "object" : "entity",
      "id" : "Eurofung",
      "url_example" : null,
      "name" : "Eurofungbase community annotation",
      "database" : "Eurofungbase community annotation",
      "example_id" : null,
      "abbreviation" : "Eurofung",
      "url_syntax" : null
   },
   "h-invdb" : {
      "generic_url" : "http://www.h-invitational.jp/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "H-invitational Database",
      "name" : "H-invitational Database",
      "url_example" : null,
      "id" : "H-invDB",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "H-invDB",
      "example_id" : null
   },
   "germonline" : {
      "generic_url" : "http://www.germonline.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "id" : "GermOnline",
      "object" : "entity",
      "database" : "GermOnline",
      "name" : "GermOnline",
      "abbreviation" : "GermOnline",
      "example_id" : null,
      "url_syntax" : null
   },
   "po_ref" : {
      "generic_url" : "http://wiki.plantontology.org:8080/index.php/PO_references",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://wiki.plantontology.org:8080/index.php/PO_REF:00001",
      "id" : "PO_REF",
      "object" : "entity",
      "database" : "Plant Ontology custom references",
      "name" : "Plant Ontology custom references",
      "abbreviation" : "PO_REF",
      "example_id" : "PO_REF:00001",
      "url_syntax" : "http://wiki.plantontology.org:8080/index.php/PO_REF:[example_id]"
   },
   "ncbi" : {
      "example_id" : null,
      "abbreviation" : "NCBI",
      "url_syntax" : null,
      "id" : "NCBI",
      "object" : "entity",
      "url_example" : null,
      "name" : "National Center for Biotechnology Information",
      "database" : "National Center for Biotechnology Information",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "rebase" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://rebase.neb.com/rebase/rebase.html",
      "url_syntax" : "http://rebase.neb.com/rebase/enz/[example_id].html",
      "example_id" : "REBASE:EcoRI",
      "abbreviation" : "REBASE",
      "name" : "REBASE restriction enzyme database",
      "database" : "REBASE restriction enzyme database",
      "object" : "entity",
      "id" : "REBASE",
      "url_example" : "http://rebase.neb.com/rebase/enz/EcoRI.html"
   },
   "pombase" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.pombase.org/",
      "url_syntax" : "http://www.pombase.org/spombe/result/[example_id]",
      "example_id" : "PomBase:SPBC11B10.09",
      "abbreviation" : "PomBase",
      "name" : "PomBase",
      "database" : "PomBase",
      "object" : "gene",
      "id" : "PomBase",
      "url_example" : "http://www.pombase.org/spombe/result/SPBC11B10.09"
   },
   "eck" : {
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ecogene.org/",
      "abbreviation" : "ECK",
      "example_id" : "ECK:ECK3746",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eck_id=[example_id]",
      "url_example" : "http://www.ecogene.org/geneInfo.php?eck_id=ECK3746",
      "object" : "gene",
      "id" : "ECK",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "name" : "EcoGene Database of Escherichia coli Sequence and Function"
   },
   "mips_funcat" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://mips.gsf.de/proj/funcatDB/",
      "url_syntax" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=[example_id]",
      "example_id" : "MIPS_funcat:11.02",
      "abbreviation" : "MIPS_funcat",
      "name" : "MIPS Functional Catalogue",
      "database" : "MIPS Functional Catalogue",
      "id" : "MIPS_funcat",
      "object" : "entity",
      "url_example" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=11.02"
   },
   "iuphar" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.iuphar.org/",
      "example_id" : null,
      "abbreviation" : "IUPHAR",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "IUPHAR",
      "url_example" : null,
      "name" : "International Union of Pharmacology",
      "database" : "International Union of Pharmacology"
   },
   "tigr_cmr" : {
      "datatype" : "protein",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "example_id" : "JCVI_CMR:VCA0557",
      "abbreviation" : "TIGR_CMR",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "id" : "JCVI_CMR",
      "object" : "protein",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "name" : "EGAD database at the J. Craig Venter Institute",
      "database" : "EGAD database at the J. Craig Venter Institute"
   },
   "hgnc_gene" : {
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?app_sym=ABCA1",
      "object" : "entity",
      "id" : "HGNC_gene",
      "database" : "HUGO Gene Nomenclature Committee",
      "name" : "HUGO Gene Nomenclature Committee",
      "abbreviation" : "HGNC_gene",
      "example_id" : "HGNC_gene:ABCA1",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?app_sym=[example_id]",
      "generic_url" : "http://www.genenames.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "cgd" : {
      "generic_url" : "http://www.candidagenome.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "database" : "Candida Genome Database",
      "name" : "Candida Genome Database",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "object" : "gene",
      "id" : "CGD",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "abbreviation" : "CGD",
      "example_id" : "CGD:CAL0005516"
   },
   "echobase" : {
      "name" : "EchoBASE post-genomic database for Escherichia coli",
      "database" : "EchoBASE post-genomic database for Escherichia coli",
      "object" : "gene",
      "id" : "EchoBASE",
      "url_example" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=EB0231",
      "url_syntax" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=[example_id]",
      "example_id" : "EchoBASE:EB0231",
      "abbreviation" : "EchoBASE",
      "generic_url" : "http://www.ecoli-york.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene"
   },
   "ecocyc_ref" : {
      "name" : "Encyclopedia of E. coli metabolism",
      "database" : "Encyclopedia of E. coli metabolism",
      "id" : "EcoCyc_REF",
      "object" : "entity",
      "url_example" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=COLISALII",
      "url_syntax" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=[example_id]",
      "example_id" : "EcoCyc_REF:COLISALII",
      "abbreviation" : "ECOCYC_REF",
      "generic_url" : "http://ecocyc.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "dictybase" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "generic_url" : "http://dictybase.org",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "abbreviation" : "DictyBase",
      "example_id" : "dictyBase:DDB_G0277859",
      "database" : "dictyBase",
      "name" : "dictyBase",
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "object" : "gene",
      "id" : "dictyBase"
   },
   "rnamods" : {
      "abbreviation" : "RNAmods",
      "example_id" : "RNAmods:037",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "object" : "entity",
      "id" : "RNAmods",
      "database" : "RNA Modification Database",
      "name" : "RNA Modification Database",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/"
   },
   "ecocyc" : {
      "database" : "Encyclopedia of E. coli metabolism",
      "name" : "Encyclopedia of E. coli metabolism",
      "url_example" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=P2-PWY",
      "id" : "EcoCyc",
      "object" : "biological_process",
      "url_syntax" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "abbreviation" : "EcoCyc",
      "example_id" : "EcoCyc:P2-PWY",
      "generic_url" : "http://ecocyc.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "biological_process"
   },
   "vz" : {
      "url_example" : "http://viralzone.expasy.org/all_by_protein/957.html",
      "id" : "VZ",
      "object" : "entity",
      "database" : "ViralZone",
      "name" : "ViralZone",
      "abbreviation" : "VZ",
      "example_id" : "VZ:957",
      "url_syntax" : "http://viralzone.expasy.org/all_by_protein/[example_id].html",
      "generic_url" : "http://viralzone.expasy.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "geneid" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "object" : "gene",
      "id" : "NCBI_Gene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "name" : "NCBI Gene",
      "database" : "NCBI Gene",
      "example_id" : "NCBI_Gene:4771",
      "abbreviation" : "GeneID",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]"
   },
   "uniprotkb-subcell" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.uniprot.org/locations/",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "abbreviation" : "UniProtKB-SubCell",
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "name" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "object" : "entity",
      "id" : "UniProtKB-SubCell"
   },
   "pubchem_substance" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "chemical entity",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=[example_id]",
      "abbreviation" : "PubChem_Substance",
      "example_id" : "PubChem_Substance:4594",
      "database" : "NCBI PubChem database of chemical substances",
      "name" : "NCBI PubChem database of chemical substances",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=4594",
      "id" : "PubChem_Substance",
      "object" : "chemical entity"
   },
   "hpa" : {
      "name" : "Human Protein Atlas tissue profile information",
      "database" : "Human Protein Atlas tissue profile information",
      "object" : "entity",
      "id" : "HPA",
      "url_example" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=HPA000237",
      "url_syntax" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=[example_id]",
      "example_id" : "HPA:HPA000237",
      "abbreviation" : "HPA",
      "generic_url" : "http://www.proteinatlas.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "ec" : {
      "datatype" : "catalytic activity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://enzyme.expasy.org/",
      "example_id" : "EC:1.4.3.6",
      "abbreviation" : "EC",
      "url_syntax" : "http://www.expasy.org/enzyme/[example_id]",
      "object" : "catalytic activity",
      "id" : "EC",
      "url_example" : "http://www.expasy.org/enzyme/1.4.3.6",
      "name" : "Enzyme Commission",
      "database" : "Enzyme Commission"
   },
   "flybase" : {
      "id" : "FB",
      "object" : "gene",
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "name" : "FlyBase",
      "database" : "FlyBase",
      "example_id" : "FB:FBgn0000024",
      "abbreviation" : "FLYBASE",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "generic_url" : "http://flybase.org/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null
   },
   "tigr" : {
      "url_syntax" : null,
      "abbreviation" : "TIGR",
      "example_id" : null,
      "database" : "J. Craig Venter Institute",
      "name" : "J. Craig Venter Institute",
      "url_example" : null,
      "id" : "JCVI",
      "object" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.jcvi.org/"
   },
   "biomdid" : {
      "abbreviation" : "BIOMDID",
      "example_id" : "BIOMD:BIOMD0000000045",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "id" : "BIOMD",
      "object" : "entity",
      "database" : "BioModels Database",
      "name" : "BioModels Database",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ebi.ac.uk/biomodels/"
   },
   "superfamily" : {
      "generic_url" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/index.html",
      "uri_prefix" : null,
      "fullname" : "A database of structural and functional protein annotations for completely sequenced genomes",
      "datatype" : "entity",
      "name" : "SUPERFAMILY protein annotation database",
      "database" : "SUPERFAMILY protein annotation database",
      "id" : "SUPERFAMILY",
      "object" : "entity",
      "url_example" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF51905",
      "url_syntax" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF[example_id]",
      "example_id" : "SUPERFAMILY:51905",
      "abbreviation" : "SUPERFAMILY"
   },
   "casref" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "object" : "entity",
      "id" : "CASREF",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=2031",
      "name" : "Catalog of Fishes publications database",
      "database" : "Catalog of Fishes publications database",
      "example_id" : "CASREF:2031",
      "abbreviation" : "CASREF",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=[example_id]"
   },
   "subtilist" : {
      "example_id" : "SUBTILISTG:BG11384",
      "abbreviation" : "SUBTILIST",
      "url_syntax" : null,
      "id" : "SUBTILIST",
      "object" : "protein",
      "url_example" : null,
      "name" : "Bacillus subtilis Genome Sequence Project",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/"
   },
   "kegg_ligand" : {
      "id" : "KEGG_LIGAND",
      "object" : "chemical entity",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?cpd:C00577",
      "name" : "KEGG LIGAND Database",
      "database" : "KEGG LIGAND Database",
      "example_id" : "KEGG_LIGAND:C00577",
      "abbreviation" : "KEGG_LIGAND",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?cpd:[example_id]",
      "generic_url" : "http://www.genome.ad.jp/kegg/docs/upd_ligand.html",
      "datatype" : "chemical entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "doi" : {
      "abbreviation" : "DOI",
      "example_id" : "DOI:10.1016/S0963-9969(99)00021-6",
      "url_syntax" : "http://dx.doi.org/DOI:[example_id]",
      "url_example" : "http://dx.doi.org/DOI:10.1016/S0963-9969(99)00021-6",
      "id" : "DOI",
      "object" : "entity",
      "database" : "Digital Object Identifier",
      "name" : "Digital Object Identifier",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://dx.doi.org/"
   },
   "cas" : {
      "generic_url" : "http://www.cas.org/expertise/cascontent/registry/index.html",
      "uri_prefix" : null,
      "fullname" : "CAS REGISTRY is the most authoritative collection of disclosed chemical substance information, containing more than 54 million organic and inorganic substances and 62 million sequences. CAS REGISTRY covers substances identified from the scientific literature from 1957 to the present, with additional substances going back to the early 1900s.",
      "datatype" : "entity",
      "name" : "CAS Chemical Registry",
      "database" : "CAS Chemical Registry",
      "id" : "CAS",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : "CAS:58-08-2",
      "abbreviation" : "CAS"
   },
   "dflat" : {
      "object" : "entity",
      "id" : "DFLAT",
      "url_example" : null,
      "name" : "Developmental FunctionaL Annotation at Tufts",
      "database" : "Developmental FunctionaL Annotation at Tufts",
      "example_id" : null,
      "abbreviation" : "DFLAT",
      "url_syntax" : null,
      "generic_url" : "http://bcb.cs.tufts.edu/dflat/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "cgsc" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://cgsc.biology.yale.edu/",
      "abbreviation" : "CGSC",
      "example_id" : "CGSC:rbsK",
      "url_syntax" : null,
      "url_example" : "http://cgsc.biology.yale.edu/Site.php?ID=315",
      "object" : "entity",
      "id" : "CGSC",
      "database" : "CGSC",
      "name" : "CGSC"
   },
   "pdb" : {
      "generic_url" : "http://www.rcsb.org/pdb/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "protein",
      "database" : "Protein Data Bank",
      "name" : "Protein Data Bank",
      "url_example" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=1A4U",
      "id" : "PDB",
      "object" : "protein",
      "url_syntax" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=[example_id]",
      "abbreviation" : "PDB",
      "example_id" : "PDB:1A4U"
   },
   "wbphenotype" : {
      "name" : "WormBase phenotype ontology",
      "database" : "WormBase phenotype ontology",
      "object" : "quality",
      "id" : "WBPhenotype",
      "url_example" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:0000154",
      "url_syntax" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:[example_id]",
      "example_id" : "WBPhenotype:0002117",
      "abbreviation" : "WBPhenotype",
      "generic_url" : "http://www.wormbase.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "quality"
   },
   "kegg_enzyme" : {
      "generic_url" : "http://www.genome.jp/dbget-bin/www_bfind?enzyme",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "KEGG Enzyme Database",
      "database" : "KEGG Enzyme Database",
      "id" : "KEGG_ENZYME",
      "object" : "entity",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?ec:2.1.1.4",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?ec:[example_id]",
      "example_id" : "KEGG_ENZYME:2.1.1.4",
      "abbreviation" : "KEGG_ENZYME"
   },
   "ensembl_geneid" : {
      "url_example" : "http://www.ensembl.org/id/ENSG00000126016",
      "object" : "gene",
      "id" : "ENSEMBL_GeneID",
      "database" : "Ensembl database of automatically annotated genomic data",
      "name" : "Ensembl database of automatically annotated genomic data",
      "abbreviation" : "ENSEMBL_GeneID",
      "example_id" : "ENSEMBL_GeneID:ENSG00000126016",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "generic_url" : "http://www.ensembl.org/",
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : null
   },
   "ddbj" : {
      "name" : "DNA Databank of Japan",
      "database" : "DNA Databank of Japan",
      "id" : "DDBJ",
      "object" : "entity",
      "url_example" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=AA816246",
      "url_syntax" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=[example_id]",
      "example_id" : "DDBJ:AA816246",
      "abbreviation" : "DDBJ",
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "psi-mod" : {
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "example_id" : "MOD:00219",
      "abbreviation" : "PSI-MOD",
      "name" : "Proteomics Standards Initiative protein modification ontology",
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "object" : "entity",
      "id" : "PSI-MOD",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://psidev.sourceforge.net/mod/"
   },
   "mi" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "abbreviation" : "MI",
      "example_id" : "MI:0018",
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "PSI-MI",
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "name" : "Proteomic Standard Initiative for Molecular Interaction"
   },
   "imgt_ligm" : {
      "datatype" : "entity",
      "fullname" : "Database of immunoglobulins and T cell receptors from human and other vertebrates, with translation for fully annotated sequences.",
      "uri_prefix" : null,
      "generic_url" : "http://imgt.cines.fr",
      "abbreviation" : "IMGT_LIGM",
      "example_id" : "IMGT_LIGM:U03895",
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "IMGT_LIGM",
      "database" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "name" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors"
   },
   "ncbi_gi" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "example_id" : "NCBI_gi:113194944",
      "abbreviation" : "NCBI_gi",
      "name" : "NCBI databases",
      "database" : "NCBI databases",
      "id" : "NCBI_gi",
      "object" : "gene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=113194944",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "unimod" : {
      "generic_url" : "http://www.unimod.org/",
      "fullname" : "protein modifications for mass spectrometry",
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "UniMod",
      "name" : "UniMod",
      "url_example" : "http://www.unimod.org/modifications_view.php?editid1=1287",
      "id" : "UniMod",
      "object" : "entity",
      "url_syntax" : "http://www.unimod.org/modifications_view.php?editid1=[example_id]",
      "abbreviation" : "UniMod",
      "example_id" : "UniMod:1287"
   },
   "biocyc" : {
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=PWY-5271",
      "id" : "BioCyc",
      "object" : "entity",
      "database" : "BioCyc collection of metabolic pathway databases",
      "name" : "BioCyc collection of metabolic pathway databases",
      "abbreviation" : "BioCyc",
      "example_id" : "BioCyc:PWY-5271",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "generic_url" : "http://biocyc.org/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "ecogene_g" : {
      "id" : "ECOGENE_G",
      "object" : "entity",
      "url_example" : null,
      "name" : "EcoGene Database of Escherichia coli Sequence and Function",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "example_id" : "ECOGENE_G:deoC",
      "abbreviation" : "ECOGENE_G",
      "url_syntax" : null,
      "generic_url" : "http://www.ecogene.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "hamap" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://hamap.expasy.org/",
      "url_syntax" : "http://hamap.expasy.org/unirule/[example_id]",
      "abbreviation" : "HAMAP",
      "example_id" : "HAMAP:MF_00031",
      "database" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "name" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "url_example" : "http://hamap.expasy.org/unirule/MF_00131",
      "object" : "entity",
      "id" : "HAMAP"
   },
   "pfam" : {
      "id" : "Pfam",
      "object" : "polypeptide region",
      "url_example" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?PF00046",
      "name" : "Pfam database of protein families",
      "database" : "Pfam database of protein families",
      "example_id" : "Pfam:PF00046",
      "abbreviation" : "Pfam",
      "url_syntax" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?[example_id]",
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "datatype" : "polypeptide region",
      "uri_prefix" : null,
      "fullname" : "Pfam is a collection of protein families represented by sequence alignments and hidden Markov models (HMMs)"
   },
   "mesh" : {
      "url_syntax" : "http://www.nlm.nih.gov/cgi/mesh/2015/MB_cgi?view=expanded&field=uid&term=[example_id]",
      "example_id" : "MeSH:D017209",
      "abbreviation" : "MeSH",
      "name" : "Medical Subject Headings",
      "database" : "Medical Subject Headings",
      "object" : "entity",
      "id" : "MeSH",
      "url_example" : "http://www.nlm.nih.gov/cgi/mesh/2015/MB_cgi?view=expanded&field=uid&term=D017209",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "https://www.nlm.nih.gov/mesh/MBrowser.html"
   },
   "corum" : {
      "example_id" : "CORUM:837",
      "abbreviation" : "CORUM",
      "url_syntax" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=[example_id]",
      "object" : "entity",
      "id" : "CORUM",
      "url_example" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=837",
      "name" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "database" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://mips.gsf.de/genre/proj/corum/"
   },
   "locusid" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "example_id" : "NCBI_Gene:4771",
      "abbreviation" : "LocusID",
      "name" : "NCBI Gene",
      "database" : "NCBI Gene",
      "object" : "gene",
      "id" : "NCBI_Gene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771"
   },
   "tigr_genprop" : {
      "example_id" : "JCVI_GenProp:GenProp0120",
      "abbreviation" : "TIGR_GenProp",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "id" : "JCVI_GenProp",
      "object" : "biological_process",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "name" : "Genome Properties database at the J. Craig Venter Institute",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "datatype" : "biological_process",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "aspgd_locus" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "example_id" : "AspGD_LOCUS:AN10942",
      "abbreviation" : "AspGD_LOCUS",
      "name" : "Aspergillus Genome Database",
      "database" : "Aspergillus Genome Database",
      "object" : "entity",
      "id" : "AspGD_LOCUS",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=AN10942"
   },
   "go_central" : {
      "url_syntax" : null,
      "abbreviation" : "GO_Central",
      "example_id" : null,
      "database" : "GO Central",
      "name" : "GO Central",
      "url_example" : null,
      "object" : "entity",
      "id" : "GO_Central",
      "uri_prefix" : null,
      "fullname" : "Manual annotation from PAINT curators into the UniProt Protein2GO curation tool.",
      "datatype" : "entity",
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml"
   },
   "um-bbd_reactionid" : {
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=[example_id]",
      "example_id" : "UM-BBD_reactionID:r0129",
      "abbreviation" : "UM-BBD_reactionID",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "object" : "entity",
      "id" : "UM-BBD_reactionID",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=r0129",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://umbbd.msi.umn.edu/"
   },
   "rgdid" : {
      "generic_url" : "http://rgd.mcw.edu/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "id" : "RGD",
      "object" : "gene",
      "database" : "Rat Genome Database",
      "name" : "Rat Genome Database",
      "abbreviation" : "RGDID",
      "example_id" : "RGD:2004",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]"
   },
   "mengo" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://mengo.vbi.vt.edu/",
      "abbreviation" : "MENGO",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "MENGO",
      "database" : "Microbial ENergy processes Gene Ontology Project",
      "name" : "Microbial ENergy processes Gene Ontology Project"
   },
   "imgt_hla" : {
      "example_id" : "IMGT_HLA:HLA00031",
      "abbreviation" : "IMGT_HLA",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "IMGT_HLA",
      "url_example" : null,
      "name" : "IMGT/HLA human major histocompatibility complex sequence database",
      "database" : "IMGT/HLA human major histocompatibility complex sequence database",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ebi.ac.uk/imgt/hla"
   },
   "so" : {
      "generic_url" : "http://sequenceontology.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "sequence feature",
      "database" : "Sequence Ontology",
      "name" : "Sequence Ontology",
      "url_example" : "http://song.sourceforge.net/SOterm_tables.html#SO:0000195",
      "object" : "sequence feature",
      "id" : "SO",
      "url_syntax" : "http://song.sourceforge.net/SOterm_tables.html#SO:[example_id]",
      "abbreviation" : "SO",
      "example_id" : "SO:0000195"
   },
   "apidb_plasmodb" : {
      "name" : "PlasmoDB Plasmodium Genome Resource",
      "database" : "PlasmoDB Plasmodium Genome Resource",
      "object" : "entity",
      "id" : "ApiDB_PlasmoDB",
      "url_example" : "http://www.plasmodb.org/gene/PF11_0344",
      "url_syntax" : "http://www.plasmodb.org/gene/[example_id]",
      "example_id" : "ApiDB_PlasmoDB:PF11_0344",
      "abbreviation" : "ApiDB_PlasmoDB",
      "generic_url" : "http://plasmodb.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "wbbt" : {
      "example_id" : "WBbt:0005733",
      "abbreviation" : "WBbt",
      "url_syntax" : null,
      "object" : "metazoan anatomical entity",
      "id" : "WBbt",
      "url_example" : null,
      "name" : "C. elegans gross anatomy",
      "database" : "C. elegans gross anatomy",
      "datatype" : "metazoan anatomical entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/"
   },
   "unipathway" : {
      "datatype" : "biological_process",
      "uri_prefix" : null,
      "fullname" : "UniPathway is a a metabolic door to UniProtKB/Swiss-Prot, a curated resource of metabolic pathways for the UniProtKB/Swiss-Prot knowledgebase.",
      "generic_url" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway",
      "example_id" : "UniPathway:UPA00155",
      "abbreviation" : "UniPathway",
      "url_syntax" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=[example_id]",
      "id" : "UniPathway",
      "object" : "biological_process",
      "url_example" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=UPA00155",
      "name" : "UniPathway",
      "database" : "UniPathway"
   },
   "dictybase_gene_name" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://dictybase.org",
      "abbreviation" : "dictyBase_gene_name",
      "example_id" : "dictyBase_gene_name:mlcE",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "url_example" : "http://dictybase.org/gene/mlcE",
      "object" : "entity",
      "id" : "dictyBase_gene_name",
      "database" : "dictyBase",
      "name" : "dictyBase"
   },
   "syscilia_ccnet" : {
      "generic_url" : "http://syscilia.org/",
      "fullname" : "A systems biology approach to dissect cilia function and its disruption in human genetic disease",
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "Syscilia",
      "name" : "Syscilia",
      "url_example" : null,
      "object" : "entity",
      "id" : "SYSCILIA_CCNET",
      "url_syntax" : null,
      "abbreviation" : "SYSCILIA_CCNET",
      "example_id" : null
   },
   "protein_id" : {
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "uri_prefix" : null,
      "fullname" : "protein identifier shared by DDBJ/EMBL-bank/GenBank nucleotide sequence databases",
      "datatype" : "protein",
      "name" : "DDBJ / ENA / GenBank",
      "database" : "DDBJ / ENA / GenBank",
      "id" : "protein_id",
      "object" : "protein",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : "protein_id:CAA71991",
      "abbreviation" : "protein_id"
   },
   "medline" : {
      "example_id" : "MEDLINE:20572430",
      "abbreviation" : "MEDLINE",
      "url_syntax" : null,
      "id" : "MEDLINE",
      "object" : "entity",
      "url_example" : null,
      "name" : "Medline literature database",
      "database" : "Medline literature database",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.nlm.nih.gov/databases/databases_medline.html"
   },
   "um-bbd_pathwayid" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "url_syntax" : "http://umbbd.msi.umn.edu/[example_id]/[example_id]_map.html",
      "example_id" : "UM-BBD_pathwayID:acr",
      "abbreviation" : "UM-BBD_pathwayID",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "id" : "UM-BBD_pathwayID",
      "object" : "entity",
      "url_example" : "http://umbbd.msi.umn.edu/acr/acr_map.html"
   },
   "poc" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.plantontology.org/",
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "POC",
      "name" : "Plant Ontology Consortium",
      "database" : "Plant Ontology Consortium",
      "id" : "POC",
      "object" : "entity",
      "url_example" : null
   },
   "reactome" : {
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "abbreviation" : "Reactome",
      "example_id" : "Reactome:REACT_604",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "name" : "Reactome - a curated knowledgebase of biological pathways",
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "id" : "Reactome",
      "object" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.reactome.org/"
   },
   "tigr_egad" : {
      "generic_url" : "http://cmr.jcvi.org/",
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : null,
      "object" : "protein",
      "id" : "JCVI_CMR",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "name" : "EGAD database at the J. Craig Venter Institute",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "example_id" : "JCVI_CMR:VCA0557",
      "abbreviation" : "TIGR_EGAD",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]"
   },
   "pubchem_bioassay" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "url_syntax" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=[example_id]",
      "example_id" : "PubChem_BioAssay:177",
      "abbreviation" : "PubChem_BioAssay",
      "name" : "NCBI PubChem database of bioassay records",
      "database" : "NCBI PubChem database of bioassay records",
      "id" : "PubChem_BioAssay",
      "object" : "entity",
      "url_example" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=177"
   },
   "obo_rel" : {
      "url_syntax" : null,
      "abbreviation" : "OBO_REL",
      "example_id" : "OBO_REL:part_of",
      "database" : "OBO relation ontology",
      "name" : "OBO relation ontology",
      "url_example" : null,
      "object" : "entity",
      "id" : "OBO_REL",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.obofoundry.org/ro/"
   },
   "alzheimers_university_of_toronto" : {
      "generic_url" : "http://www.ims.utoronto.ca/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "id" : "Alzheimers_University_of_Toronto",
      "object" : "entity",
      "url_example" : null,
      "name" : "Alzheimers Project at University of Toronto",
      "database" : "Alzheimers Project at University of Toronto",
      "example_id" : null,
      "abbreviation" : "Alzheimers_University_of_Toronto",
      "url_syntax" : null
   },
   "sgdid" : {
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.yeastgenome.org/",
      "abbreviation" : "SGDID",
      "example_id" : "SGD:S000006169",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview",
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "object" : "gene",
      "id" : "SGD",
      "database" : "Saccharomyces Genome Database",
      "name" : "Saccharomyces Genome Database"
   },
   "agbase" : {
      "url_example" : null,
      "id" : "AgBase",
      "object" : "entity",
      "database" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "name" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "abbreviation" : "AgBase",
      "example_id" : null,
      "url_syntax" : "http://www.agbase.msstate.edu/cgi-bin/getEntry.pl?db_pick=[ChickGO/MaizeGO]&uid=[example_id]",
      "generic_url" : "http://www.agbase.msstate.edu/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "biomd" : {
      "database" : "BioModels Database",
      "name" : "BioModels Database",
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "object" : "entity",
      "id" : "BIOMD",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "abbreviation" : "BIOMD",
      "example_id" : "BIOMD:BIOMD0000000045",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "smd" : {
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "SMD",
      "name" : "Stanford Microarray Database",
      "database" : "Stanford Microarray Database",
      "object" : "entity",
      "id" : "SMD",
      "url_example" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://genome-www.stanford.edu/microarray"
   },
   "pubmed" : {
      "object" : "entity",
      "id" : "PMID",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "name" : "PubMed",
      "database" : "PubMed",
      "example_id" : "PMID:4208797",
      "abbreviation" : "PubMed",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "fb" : {
      "object" : "gene",
      "id" : "FB",
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "name" : "FlyBase",
      "database" : "FlyBase",
      "example_id" : "FB:FBgn0000024",
      "abbreviation" : "FB",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "generic_url" : "http://flybase.org/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null
   },
   "broad_neurospora" : {
      "url_syntax" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S[example_id]",
      "example_id" : "BROAD_NEUROSPORA:7000007580576824",
      "abbreviation" : "Broad_NEUROSPORA",
      "name" : "Neurospora crassa Database",
      "database" : "Neurospora crassa Database",
      "id" : "Broad_NEUROSPORA",
      "object" : "entity",
      "url_example" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S7000007580576824",
      "fullname" : "Neurospora crassa database at the Broad Institute",
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.broadinstitute.org/annotation/genome/neurospora/MultiHome.html"
   },
   "sgd" : {
      "generic_url" : "http://www.yeastgenome.org/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : "SGD",
      "object" : "gene",
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "name" : "Saccharomyces Genome Database",
      "database" : "Saccharomyces Genome Database",
      "example_id" : "SGD:S000006169",
      "abbreviation" : "SGD",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview"
   },
   "rfam" : {
      "generic_url" : "http://rfam.sanger.ac.uk/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "object" : "entity",
      "id" : "Rfam",
      "url_example" : "http://rfam.sanger.ac.uk/family/RF00012",
      "name" : "Rfam database of RNA families",
      "database" : "Rfam database of RNA families",
      "example_id" : "Rfam:RF00012",
      "abbreviation" : "Rfam",
      "url_syntax" : "http://rfam.sanger.ac.uk/family/[example_id]"
   },
   "spd" : {
      "object" : "entity",
      "id" : "SPD",
      "url_example" : "http://www.riken.jp/SPD/05/05F01.html",
      "name" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "database" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "example_id" : "SPD:05/05F01",
      "abbreviation" : "SPD",
      "url_syntax" : "http://www.riken.jp/SPD/[example_id].html",
      "generic_url" : "http://www.riken.jp/SPD/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "pir" : {
      "datatype" : "protein",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pir.georgetown.edu/",
      "abbreviation" : "PIR",
      "example_id" : "PIR:I49499",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=[example_id]",
      "url_example" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=I49499",
      "id" : "PIR",
      "object" : "protein",
      "database" : "Protein Information Resource",
      "name" : "Protein Information Resource"
   },
   "ppi" : {
      "example_id" : null,
      "abbreviation" : "PPI",
      "url_syntax" : null,
      "id" : "PPI",
      "object" : "entity",
      "url_example" : null,
      "name" : "Pseudomonas syringae community annotation project",
      "database" : "Pseudomonas syringae community annotation project",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://genome.pseudomonas-syringae.org/"
   },
   "pamgo_gat" : {
      "database" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group",
      "name" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group",
      "url_example" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=atu0001",
      "id" : "PAMGO_GAT",
      "object" : "entity",
      "url_syntax" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=[example_id]",
      "abbreviation" : "PAMGO_GAT",
      "example_id" : "PAMGO_GAT:Atu0001",
      "generic_url" : "http://agro.vbi.vt.edu/public/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "pamgo" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pamgo.vbi.vt.edu/",
      "abbreviation" : "PAMGO",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "PAMGO",
      "database" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "name" : "Plant-Associated Microbe Gene Ontology Interest Group"
   },
   "ncbi_gene" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "abbreviation" : "NCBI_Gene",
      "example_id" : "NCBI_Gene:4771",
      "database" : "NCBI Gene",
      "name" : "NCBI Gene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "id" : "NCBI_Gene",
      "object" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "sabio-rk" : {
      "url_syntax" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=[example_id]",
      "example_id" : "SABIO-RK:1858",
      "abbreviation" : "SABIO-RK",
      "name" : "SABIO Reaction Kinetics",
      "database" : "SABIO Reaction Kinetics",
      "id" : "SABIO-RK",
      "object" : "entity",
      "url_example" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=1858",
      "fullname" : "The SABIO-RK (System for the Analysis of Biochemical Pathways - Reaction Kinetics) is a web-based application based on the SABIO relational database that contains information about biochemical reactions, their kinetic equations with their parameters, and the experimental conditions under which these parameters were measured.",
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://sabio.villa-bosch.de/"
   },
   "gr_protein" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein",
      "generic_url" : "http://www.gramene.org/",
      "url_syntax" : "http://www.gramene.org/db/protein/protein_search?acc=[example_id]",
      "abbreviation" : "GR_protein",
      "example_id" : "GR_PROTEIN:Q6VSV0",
      "database" : "Gramene",
      "name" : "Gramene",
      "url_example" : "http://www.gramene.org/db/protein/protein_search?acc=Q6VSV0",
      "id" : "GR_PROTEIN",
      "object" : "protein"
   },
   "pamgo_mgg" : {
      "generic_url" : "http://scotland.fgl.ncsu.edu/smeng/GoAnnotationMagnaporthegrisea.html",
      "fullname" : "Magnaporthe grisea database at North Carolina State University; member of PAMGO Interest Group",
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "Magnaporthe grisea database",
      "name" : "Magnaporthe grisea database",
      "url_example" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=MGG_05132",
      "object" : "entity",
      "id" : "PAMGO_MGG",
      "url_syntax" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=[example_id]",
      "abbreviation" : "PAMGO_MGG",
      "example_id" : "PAMGO_MGG:MGG_05132"
   },
   "patric" : {
      "example_id" : "PATRIC:cds.000002.436951",
      "abbreviation" : "PATRIC",
      "url_syntax" : "http://patric.vbi.vt.edu/gene/overview.php?fid=[example_id]",
      "object" : "entity",
      "id" : "PATRIC",
      "url_example" : "http://patric.vbi.vt.edu/gene/overview.php?fid=cds.000002.436951",
      "name" : "PathoSystems Resource Integration Center",
      "database" : "PathoSystems Resource Integration Center",
      "datatype" : "entity",
      "fullname" : "PathoSystems Resource Integration Center at the Virginia Bioinformatics Institute",
      "uri_prefix" : null,
      "generic_url" : "http://patric.vbi.vt.edu"
   },
   "ncbi_gp" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : null,
      "id" : "NCBI_GP",
      "object" : "protein",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=EAL72968",
      "name" : "NCBI GenPept",
      "database" : "NCBI GenPept",
      "example_id" : "NCBI_GP:EAL72968",
      "abbreviation" : "NCBI_GP",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=[example_id]"
   },
   "rgd" : {
      "example_id" : "RGD:2004",
      "abbreviation" : "RGD",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "object" : "gene",
      "id" : "RGD",
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "name" : "Rat Genome Database",
      "database" : "Rat Genome Database",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://rgd.mcw.edu/"
   },
   "sanger" : {
      "object" : "entity",
      "id" : "Sanger",
      "url_example" : null,
      "name" : "Wellcome Trust Sanger Institute",
      "database" : "Wellcome Trust Sanger Institute",
      "example_id" : null,
      "abbreviation" : "Sanger",
      "url_syntax" : null,
      "generic_url" : "http://www.sanger.ac.uk/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "pubchem_compound" : {
      "abbreviation" : "PubChem_Compound",
      "example_id" : "PubChem_Compound:2244",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=[example_id]",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=2244",
      "object" : "chemical entity",
      "id" : "PubChem_Compound",
      "database" : "NCBI PubChem database of chemical structures",
      "name" : "NCBI PubChem database of chemical structures",
      "datatype" : "chemical entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/"
   },
   "pompep" : {
      "abbreviation" : "Pompep",
      "example_id" : "Pompep:SPAC890.04C",
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "Pompep",
      "database" : "Schizosaccharomyces pombe protein data",
      "name" : "Schizosaccharomyces pombe protein data",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "ftp://ftp.sanger.ac.uk/pub/yeast/pombe/Protein_data/"
   },
   "ddanat" : {
      "generic_url" : "http://dictybase.org/Dicty_Info/dicty_anatomy_ontology.html",
      "datatype" : "anatomical entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "object" : "anatomical entity",
      "id" : "DDANAT",
      "database" : "Dictyostelium discoideum anatomy",
      "name" : "Dictyostelium discoideum anatomy",
      "abbreviation" : "DDANAT",
      "example_id" : "DDANAT:0000068",
      "url_syntax" : null
   },
   "vega" : {
      "generic_url" : "http://vega.sanger.ac.uk/index.html",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Vertebrate Genome Annotation database",
      "name" : "Vertebrate Genome Annotation database",
      "url_example" : "http://vega.sanger.ac.uk/id/OTTHUMP00000000661",
      "id" : "VEGA",
      "object" : "entity",
      "url_syntax" : "http://vega.sanger.ac.uk/id/[example_id]",
      "abbreviation" : "VEGA",
      "example_id" : "VEGA:OTTHUMP00000000661"
   },
   "pr" : {
      "object" : "protein",
      "id" : "PR",
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "name" : "Protein Ontology",
      "database" : "Protein Ontology",
      "example_id" : "PR:000025380",
      "abbreviation" : "PR",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : null
   },
   "pharmgkb" : {
      "abbreviation" : "PharmGKB",
      "example_id" : "PharmGKB:PA267",
      "url_syntax" : "http://www.pharmgkb.org/do/serve?objId=[example_id]",
      "url_example" : "http://www.pharmgkb.org/do/serve?objId=PA267",
      "id" : "PharmGKB",
      "object" : "entity",
      "database" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "name" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.pharmgkb.org"
   },
   "ncbi_locus_tag" : {
      "url_syntax" : null,
      "example_id" : "NCBI_locus_tag:CTN_0547",
      "abbreviation" : "NCBI_locus_tag",
      "name" : "NCBI locus tag",
      "database" : "NCBI locus tag",
      "object" : "entity",
      "id" : "NCBI_locus_tag",
      "url_example" : null,
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/"
   },
   "kegg" : {
      "database" : "Kyoto Encyclopedia of Genes and Genomes",
      "name" : "Kyoto Encyclopedia of Genes and Genomes",
      "url_example" : null,
      "id" : "KEGG",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "KEGG",
      "example_id" : null,
      "generic_url" : "http://www.genome.ad.jp/kegg/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "prosite" : {
      "object" : "polypeptide region",
      "id" : "Prosite",
      "url_example" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?PS00365",
      "name" : "Prosite database of protein families and domains",
      "database" : "Prosite database of protein families and domains",
      "example_id" : "Prosite:PS00365",
      "abbreviation" : "Prosite",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?[example_id]",
      "generic_url" : "http://www.expasy.ch/prosite/",
      "datatype" : "polypeptide region",
      "fullname" : null,
      "uri_prefix" : null
   },
   "ensembl_transcriptid" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "transcript",
      "generic_url" : "http://www.ensembl.org/",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "example_id" : "ENSEMBL_TranscriptID:ENST00000371959",
      "abbreviation" : "ENSEMBL_TranscriptID",
      "name" : "Ensembl database of automatically annotated genomic data",
      "database" : "Ensembl database of automatically annotated genomic data",
      "object" : "transcript",
      "id" : "ENSEMBL_TranscriptID",
      "url_example" : "http://www.ensembl.org/id/ENST00000371959"
   },
   "jcvi_ref" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "example_id" : "JCVI_REF:GO_ref",
      "abbreviation" : "JCVI_REF",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "JCVI_REF",
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "name" : "J. Craig Venter Institute",
      "database" : "J. Craig Venter Institute"
   },
   "taxon" : {
      "database" : "NCBI Taxonomy",
      "name" : "NCBI Taxonomy",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "id" : "taxon",
      "object" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "abbreviation" : "taxon",
      "example_id" : "taxon:7227",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "aspgd" : {
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "id" : "AspGD",
      "object" : "gene",
      "database" : "Aspergillus Genome Database",
      "name" : "Aspergillus Genome Database",
      "abbreviation" : "AspGD",
      "example_id" : "AspGD:ASPL0000067538",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : null
   },
   "uberon" : {
      "datatype" : "anatomical entity",
      "uri_prefix" : null,
      "fullname" : "A multi-species anatomy ontology",
      "generic_url" : "http://uberon.org",
      "example_id" : "URBERON:0002398",
      "abbreviation" : "UBERON",
      "url_syntax" : "http://purl.obolibrary.org/obo/UBERON_[example_id]",
      "object" : "anatomical entity",
      "id" : "UBERON",
      "url_example" : "http://purl.obolibrary.org/obo/UBERON_0002398",
      "name" : "Uber-anatomy ontology",
      "database" : "Uber-anatomy ontology"
   },
   "brenda" : {
      "url_syntax" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=[example_id]",
      "example_id" : "BRENDA:4.2.1.3",
      "abbreviation" : "BRENDA",
      "name" : "BRENDA, The Comprehensive Enzyme Information System",
      "database" : "BRENDA, The Comprehensive Enzyme Information System",
      "id" : "BRENDA",
      "object" : "catalytic activity",
      "url_example" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=4.2.1.3",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "catalytic activity",
      "generic_url" : "http://www.brenda-enzymes.info"
   },
   "nif_subcellular" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.neurolex.org/wiki",
      "example_id" : "NIF_Subcellular:sao1186862860",
      "abbreviation" : "NIF_Subcellular",
      "url_syntax" : "http://www.neurolex.org/wiki/[example_id]",
      "object" : "entity",
      "id" : "NIF_Subcellular",
      "url_example" : "http://www.neurolex.org/wiki/sao1770195789",
      "name" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "database" : "Neuroscience Information Framework standard ontology, subcellular hierarchy"
   },
   "ensemblplants" : {
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "name" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "object" : "gene",
      "id" : "EnsemblPlants/Gramene",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "abbreviation" : "EnsemblPlants",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "generic_url" : "http://plants.ensembl.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene"
   },
   "cas_gen" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Catalog of Fishes genus database",
      "name" : "Catalog of Fishes genus database",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "object" : "entity",
      "id" : "CASGEN",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "abbreviation" : "CAS_GEN",
      "example_id" : "CASGEN:1040"
   },
   "cas_spc" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : "CASSPC",
      "object" : "entity",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "name" : "Catalog of Fishes species database",
      "database" : "Catalog of Fishes species database",
      "example_id" : null,
      "abbreviation" : "CAS_SPC",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]"
   },
   "jstor" : {
      "generic_url" : "http://www.jstor.org/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "object" : "entity",
      "id" : "JSTOR",
      "url_example" : "http://www.jstor.org/stable/3093870",
      "name" : "Digital archive of scholarly articles",
      "database" : "Digital archive of scholarly articles",
      "example_id" : "JSTOR:3093870",
      "abbreviation" : "JSTOR",
      "url_syntax" : "http://www.jstor.org/stable/[example_id]"
   },
   "dictybase_ref" : {
      "name" : "dictyBase literature references",
      "database" : "dictyBase literature references",
      "id" : "dictyBase_REF",
      "object" : "entity",
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "example_id" : "dictyBase_REF:10157",
      "abbreviation" : "dictyBase_REF",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "vbrc" : {
      "abbreviation" : "VBRC",
      "example_id" : "VBRC:F35742",
      "url_syntax" : "http://vbrc.org/query.asp?web_id=VBRC:[example_id]",
      "url_example" : "http://vbrc.org/query.asp?web_id=VBRC:F35742",
      "object" : "entity",
      "id" : "VBRC",
      "database" : "Viral Bioinformatics Resource Center",
      "name" : "Viral Bioinformatics Resource Center",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://vbrc.org"
   },
   "casgen" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "abbreviation" : "CASGEN",
      "example_id" : "CASGEN:1040",
      "database" : "Catalog of Fishes genus database",
      "name" : "Catalog of Fishes genus database",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "id" : "CASGEN",
      "object" : "entity"
   },
   "hugo" : {
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "HUGO",
      "name" : "Human Genome Organisation",
      "database" : "Human Genome Organisation",
      "object" : "entity",
      "id" : "HUGO",
      "url_example" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.hugo-international.org/"
   },
   "wb" : {
      "abbreviation" : "WB",
      "example_id" : "WB:WBGene00003001",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "id" : "WB",
      "object" : "protein",
      "database" : "WormBase database of nematode biology",
      "name" : "WormBase database of nematode biology",
      "datatype" : "protein",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/"
   },
   "interpro" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "polypeptide region",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "example_id" : "InterPro:IPR000001",
      "abbreviation" : "INTERPRO",
      "name" : "InterPro database of protein domains and motifs",
      "database" : "InterPro database of protein domains and motifs",
      "object" : "polypeptide region",
      "id" : "InterPro",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421"
   },
   "isbn" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://isbntools.com/",
      "abbreviation" : "ISBN",
      "example_id" : "ISBN:0781702534",
      "url_syntax" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=[example_id]",
      "url_example" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=0123456789",
      "id" : "ISBN",
      "object" : "entity",
      "database" : "International Standard Book Number",
      "name" : "International Standard Book Number"
   },
   "tgd_locus" : {
      "example_id" : "TGD_LOCUS:PDD1",
      "abbreviation" : "TGD_LOCUS",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=[example_id]",
      "id" : "TGD_LOCUS",
      "object" : "entity",
      "url_example" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=PDD1",
      "name" : "Tetrahymena Genome Database",
      "database" : "Tetrahymena Genome Database",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ciliate.org/"
   },
   "tc" : {
      "object" : "protein",
      "id" : "TC",
      "url_example" : "http://www.tcdb.org/tcdb/index.php?tc=9.A.4.1.1",
      "name" : "Transport Protein Database",
      "database" : "Transport Protein Database",
      "example_id" : "TC:9.A.4.1.1",
      "abbreviation" : "TC",
      "url_syntax" : "http://www.tcdb.org/tcdb/index.php?tc=[example_id]",
      "generic_url" : "http://www.tcdb.org/",
      "datatype" : "protein",
      "fullname" : null,
      "uri_prefix" : null
   },
   "jcvi_tigrfams" : {
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "name" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "object" : "polypeptide region",
      "id" : "JCVI_TIGRFAMS",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "abbreviation" : "JCVI_TIGRFAMS",
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "generic_url" : "http://search.jcvi.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "polypeptide region"
   },
   "chebi" : {
      "datatype" : "chemical entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/chebi/",
      "example_id" : "CHEBI:17234",
      "abbreviation" : "ChEBI",
      "url_syntax" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:[example_id]",
      "id" : "CHEBI",
      "object" : "chemical entity",
      "url_example" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17234",
      "name" : "Chemical Entities of Biological Interest",
      "database" : "Chemical Entities of Biological Interest"
   },
   "ipr" : {
      "database" : "InterPro database of protein domains and motifs",
      "name" : "InterPro database of protein domains and motifs",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "object" : "polypeptide region",
      "id" : "InterPro",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "abbreviation" : "IPR",
      "example_id" : "InterPro:IPR000001",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "polypeptide region"
   },
   "yeastfunc" : {
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "YeastFunc",
      "name" : "Yeast Function",
      "database" : "Yeast Function",
      "object" : "entity",
      "id" : "YeastFunc",
      "url_example" : null,
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://func.med.harvard.edu/yeast/"
   },
   "wormbase" : {
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "example_id" : "WB:WBGene00003001",
      "abbreviation" : "WormBase",
      "name" : "WormBase database of nematode biology",
      "database" : "WormBase database of nematode biology",
      "id" : "WB",
      "object" : "protein",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "protein",
      "generic_url" : "http://www.wormbase.org/"
   },
   "pinc" : {
      "abbreviation" : "PINC",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "id" : "PINC",
      "object" : "entity",
      "database" : "Proteome Inc.",
      "name" : "Proteome Inc.",
      "datatype" : "entity",
      "fullname" : "represents GO annotations created in 2001 for NCBI and extracted into UniProtKB-GOA from EntrezGene",
      "uri_prefix" : null,
      "generic_url" : "http://www.proteome.com/"
   },
   "fbbt" : {
      "url_syntax" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:[example_id]",
      "example_id" : "FBbt:00005177",
      "abbreviation" : "FBbt",
      "name" : "Drosophila gross anatomy",
      "database" : "Drosophila gross anatomy",
      "id" : "FBbt",
      "object" : "entity",
      "url_example" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:00005177",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://flybase.org/"
   },
   "tair" : {
      "database" : "The Arabidopsis Information Resource",
      "name" : "The Arabidopsis Information Resource",
      "url_example" : "http://arabidopsis.org/servlets/TairObject?accession=locus:2146653",
      "object" : "primary transcript",
      "id" : "TAIR",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?accession=[example_id]",
      "abbreviation" : "TAIR",
      "example_id" : "TAIR:locus:2146653",
      "generic_url" : "http://www.arabidopsis.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "primary transcript"
   },
   "modbase" : {
      "object" : "entity",
      "id" : "ModBase",
      "url_example" : "http://salilab.org/modbase/searchbyid?databaseID=P04848",
      "name" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "database" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "example_id" : "ModBase:P10815",
      "abbreviation" : "ModBase",
      "url_syntax" : "http://salilab.org/modbase/searchbyid?databaseID=[example_id]",
      "generic_url" : "http://modbase.compbio.ucsf.edu/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "broad" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.broad.mit.edu/",
      "example_id" : null,
      "abbreviation" : "Broad",
      "url_syntax" : null,
      "id" : "Broad",
      "object" : "entity",
      "url_example" : null,
      "name" : "Broad Institute",
      "database" : "Broad Institute"
   },
   "locsvmpsi" : {
      "generic_url" : "http://bioinformatics.ustc.edu.cn/locsvmpsi/locsvmpsi.php",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : "Subcellular localization for eukayotic proteins based on SVM and PSI-BLAST",
      "id" : "LOCSVMpsi",
      "object" : "entity",
      "url_example" : null,
      "name" : "LOCSVMPSI",
      "database" : "LOCSVMPSI",
      "example_id" : null,
      "abbreviation" : "LOCSVMpsi",
      "url_syntax" : null
   },
   "ncbitaxon" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "abbreviation" : "NCBITaxon",
      "example_id" : "taxon:7227",
      "database" : "NCBI Taxonomy",
      "name" : "NCBI Taxonomy",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "object" : "entity",
      "id" : "taxon"
   },
   "sgd_locus" : {
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "id" : "SGD_LOCUS",
      "object" : "entity",
      "database" : "Saccharomyces Genome Database",
      "name" : "Saccharomyces Genome Database",
      "abbreviation" : "SGD_LOCUS",
      "example_id" : "SGD_LOCUS:GAL4",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview",
      "generic_url" : "http://www.yeastgenome.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "biopixie_mefit" : {
      "id" : "bioPIXIE_MEFIT",
      "object" : "entity",
      "url_example" : null,
      "name" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "database" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "example_id" : null,
      "abbreviation" : "bioPIXIE_MEFIT",
      "url_syntax" : null,
      "generic_url" : "http://avis.princeton.edu/mefit/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "nmpdr" : {
      "url_syntax" : "http://www.nmpdr.org/linkin.cgi?id=[example_id]",
      "abbreviation" : "NMPDR",
      "example_id" : "NMPDR:fig|306254.1.peg.183",
      "database" : "National Microbial Pathogen Data Resource",
      "name" : "National Microbial Pathogen Data Resource",
      "url_example" : "http://www.nmpdr.org/linkin.cgi?id=fig|306254.1.peg.183",
      "id" : "NMPDR",
      "object" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.nmpdr.org"
   },
   "gene3d" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://gene3d.biochem.ucl.ac.uk/Gene3D/",
      "example_id" : "Gene3D:G3DSA:3.30.390.30",
      "abbreviation" : "Gene3D",
      "url_syntax" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=[example_id]",
      "object" : "entity",
      "id" : "Gene3D",
      "url_example" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=G3DSA%3A3.30.390.30",
      "name" : "Domain Architecture Classification",
      "database" : "Domain Architecture Classification"
   },
   "asap" : {
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "https://asap.ahabs.wisc.edu/annotation/php/ASAP1.htm",
      "example_id" : "ASAP:ABE-0000008",
      "abbreviation" : "ASAP",
      "url_syntax" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=[example_id]",
      "object" : "gene",
      "id" : "ASAP",
      "url_example" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=ABE-0000008",
      "name" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "database" : "A Systematic Annotation Package for Community Analysis of Genomes"
   },
   "seed" : {
      "url_example" : "http://www.theseed.org/linkin.cgi?id=fig|83331.1.peg.1",
      "id" : "SEED",
      "object" : "entity",
      "database" : "The SEED;",
      "name" : "The SEED;",
      "abbreviation" : "SEED",
      "example_id" : "SEED:fig|83331.1.peg.1",
      "url_syntax" : "http://www.theseed.org/linkin.cgi?id=[example_id]",
      "generic_url" : "http://www.theseed.org",
      "datatype" : "entity",
      "fullname" : "Project to annotate the first 1000 sequenced genomes, develop detailed metabolic reconstructions, and construct the corresponding stoichiometric matrices",
      "uri_prefix" : null
   },
   "um-bbd_ruleid" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=[example_id]",
      "example_id" : "UM-BBD_ruleID:bt0330",
      "abbreviation" : "UM-BBD_ruleID",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "id" : "UM-BBD_ruleID",
      "object" : "entity",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=bt0330"
   },
   "um-bbd_enzymeid" : {
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=e0230",
      "object" : "entity",
      "id" : "UM-BBD_enzymeID",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=[example_id]",
      "abbreviation" : "UM-BBD_enzymeID",
      "example_id" : "UM-BBD_enzymeID:e0413",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "hgnc" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "generic_url" : "http://www.genenames.org/",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:[example_id]",
      "abbreviation" : "HGNC",
      "example_id" : "HGNC:29",
      "database" : "HUGO Gene Nomenclature Committee",
      "name" : "HUGO Gene Nomenclature Committee",
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:29",
      "id" : "HGNC",
      "object" : "gene"
   },
   "merops_fam" : {
      "generic_url" : "http://merops.sanger.ac.uk/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "name" : "MEROPS peptidase database",
      "database" : "MEROPS peptidase database",
      "object" : "entity",
      "id" : "MEROPS_fam",
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=m18",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=[example_id]",
      "example_id" : "MEROPS_fam:M18",
      "abbreviation" : "MEROPS_fam"
   },
   "genedb" : {
      "generic_url" : "http://www.genedb.org/gene/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "name" : "GeneDB",
      "database" : "GeneDB",
      "id" : "GeneDB",
      "object" : "gene",
      "url_example" : "http://www.genedb.org/gene/PF3D7_1467300",
      "url_syntax" : "http://www.genedb.org/gene/[example_id]",
      "example_id" : "PF3D7_1467300",
      "abbreviation" : "GeneDB"
   },
   "multifun" : {
      "database" : "MultiFun cell function assignment schema",
      "name" : "MultiFun cell function assignment schema",
      "url_example" : null,
      "id" : "MultiFun",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "MultiFun",
      "example_id" : null,
      "generic_url" : "http://genprotec.mbl.edu/files/MultiFun.html",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "wb_ref" : {
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "example_id" : "WB_REF:WBPaper00004823",
      "abbreviation" : "WB_REF",
      "url_syntax" : "http://www.wormbase.org/db/misc/paper?name=[example_id]",
      "id" : "WB_REF",
      "object" : "entity",
      "url_example" : "http://www.wormbase.org/db/misc/paper?name=WBPaper00004823",
      "name" : "WormBase database of nematode biology",
      "database" : "WormBase database of nematode biology"
   },
   "pmcid" : {
      "database" : "Pubmed Central",
      "name" : "Pubmed Central",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=PMC201377",
      "object" : "entity",
      "id" : "PMCID",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=[example_id]",
      "abbreviation" : "PMCID",
      "example_id" : "PMCID:PMC201377",
      "generic_url" : "http://www.pubmedcentral.nih.gov/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "eco" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.geneontology.org/",
      "example_id" : "ECO:0000002",
      "abbreviation" : "ECO",
      "url_syntax" : null,
      "id" : "ECO",
      "object" : "entity",
      "url_example" : null,
      "name" : "Evidence Code ontology",
      "database" : "Evidence Code ontology"
   },
   "ncbigene" : {
      "id" : "NCBI_Gene",
      "object" : "gene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "name" : "NCBI Gene",
      "database" : "NCBI Gene",
      "example_id" : "NCBI_Gene:4771",
      "abbreviation" : "NCBIGene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : null
   },
   "lifedb" : {
      "datatype" : "entity",
      "fullname" : "LifeDB is a database for information on protein localization, interaction, functional assays and expression.",
      "uri_prefix" : null,
      "generic_url" : "http://www.lifedb.de/",
      "abbreviation" : "LIFEdb",
      "example_id" : "LIFEdb:DKFZp564O1716",
      "url_syntax" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=[example_id]",
      "url_example" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=DKFZp564O1716",
      "object" : "entity",
      "id" : "LIFEdb",
      "database" : "LifeDB",
      "name" : "LifeDB"
   },
   "gb" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "object" : "protein",
      "id" : "GenBank",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "name" : "GenBank",
      "database" : "GenBank",
      "example_id" : "GB:AA816246",
      "abbreviation" : "GB",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]"
   },
   "cgd_locus" : {
      "id" : "CGD_LOCUS",
      "object" : "entity",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=HWP1",
      "name" : "Candida Genome Database",
      "database" : "Candida Genome Database",
      "example_id" : "CGD_LOCUS:HWP1",
      "abbreviation" : "CGD_LOCUS",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "generic_url" : "http://www.candidagenome.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "fypo" : {
      "generic_url" : "http://www.pombase.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "id" : "FYPO",
      "object" : "entity",
      "url_example" : null,
      "name" : "Fission Yeast Phenotype Ontology",
      "database" : "Fission Yeast Phenotype Ontology",
      "example_id" : "FYPO:0000001",
      "abbreviation" : "FYPO",
      "url_syntax" : null
   },
   "hpa_antibody" : {
      "abbreviation" : "HPA_antibody",
      "example_id" : "HPA_antibody:HPA000237",
      "url_syntax" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=[example_id]",
      "url_example" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=HPA000237",
      "id" : "HPA_antibody",
      "object" : "entity",
      "database" : "Human Protein Atlas antibody information",
      "name" : "Human Protein Atlas antibody information",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.proteinatlas.org/"
   },
   "ri" : {
      "database" : "Roslin Institute",
      "name" : "Roslin Institute",
      "url_example" : null,
      "id" : "Roslin_Institute",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "RI",
      "example_id" : null,
      "generic_url" : "http://www.roslin.ac.uk/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "vida" : {
      "generic_url" : "http://www.biochem.ucl.ac.uk/bsm/virus_database/VIDA.html",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Virus Database at University College London",
      "name" : "Virus Database at University College London",
      "url_example" : null,
      "object" : "entity",
      "id" : "VIDA",
      "url_syntax" : null,
      "abbreviation" : "VIDA",
      "example_id" : null
   },
   "uniprotkb-kw" : {
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "abbreviation" : "UniProtKB-KW",
      "example_id" : "UniProtKB-KW:KW-0812",
      "database" : "UniProt Knowledgebase keywords",
      "name" : "UniProt Knowledgebase keywords",
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "id" : "UniProtKB-KW",
      "object" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.uniprot.org/keywords/"
   },
   "tigr_ref" : {
      "abbreviation" : "TIGR_REF",
      "example_id" : "JCVI_REF:GO_ref",
      "url_syntax" : null,
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "id" : "JCVI_REF",
      "object" : "entity",
      "database" : "J. Craig Venter Institute",
      "name" : "J. Craig Venter Institute",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "maizegdb" : {
      "generic_url" : "http://www.maizegdb.org",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "MaizeGDB",
      "database" : "MaizeGDB",
      "id" : "MaizeGDB",
      "object" : "entity",
      "url_example" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=881225",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=[example_id]",
      "example_id" : "MaizeGDB:881225",
      "abbreviation" : "MaizeGDB"
   },
   "pro" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "protein",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "abbreviation" : "PRO",
      "example_id" : "PR:000025380",
      "database" : "Protein Ontology",
      "name" : "Protein Ontology",
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "id" : "PR",
      "object" : "protein"
   },
   "cog" : {
      "example_id" : null,
      "abbreviation" : "COG",
      "url_syntax" : null,
      "id" : "COG",
      "object" : "entity",
      "url_example" : null,
      "name" : "NCBI Clusters of Orthologous Groups",
      "database" : "NCBI Clusters of Orthologous Groups",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/"
   },
   "uniparc" : {
      "name" : "UniProt Archive",
      "database" : "UniProt Archive",
      "id" : "UniParc",
      "object" : "entity",
      "url_example" : "http://www.uniprot.org/uniparc/UPI000000000A",
      "url_syntax" : "http://www.uniprot.org/uniparc/[example_id]",
      "example_id" : "UniParc:UPI000000000A",
      "abbreviation" : "UniParc",
      "generic_url" : "http://www.uniprot.org/uniparc/",
      "fullname" : "A non-redundant archive of protein sequences extracted from Swiss-Prot, TrEMBL, PIR-PSD, EMBL, Ensembl, IPI, PDB, RefSeq, FlyBase, WormBase, European Patent Office, United States Patent and Trademark Office, and Japanese Patent Office",
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "trait" : {
      "datatype" : "entity",
      "fullname" : "an integrated database of transcripts expressed in human skeletal muscle",
      "uri_prefix" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "abbreviation" : "TRAIT",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "TRAIT",
      "database" : "TRAnscript Integrated Table",
      "name" : "TRAnscript Integrated Table"
   },
   "po" : {
      "generic_url" : "http://www.plantontology.org/",
      "datatype" : "plant structure development stage",
      "fullname" : null,
      "uri_prefix" : null,
      "object" : "plant structure development stage",
      "id" : "PO",
      "url_example" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:0009004",
      "name" : "Plant Ontology Consortium Database",
      "database" : "Plant Ontology Consortium Database",
      "example_id" : "PO:0009004",
      "abbreviation" : "PO",
      "url_syntax" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:[example_id]"
   },
   "coriell" : {
      "fullname" : "The Coriell Cell Repositories provide essential research reagents to the scientific community by establishing, verifying, maintaining, and distributing cell cultures and DNA derived from cell cultures. These collections, supported by funds from the National Institutes of Health (NIH) and several foundations, are extensively utilized by research scientists around the world.",
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://ccr.coriell.org/",
      "url_syntax" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=[example_id]",
      "example_id" : "GM07892",
      "abbreviation" : "CORIELL",
      "name" : "Coriell Institute for Medical Research",
      "database" : "Coriell Institute for Medical Research",
      "object" : "entity",
      "id" : "CORIELL",
      "url_example" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=GM07892"
   },
   "kegg_reaction" : {
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?rn:[example_id]",
      "example_id" : "KEGG:R02328",
      "abbreviation" : "KEGG_REACTION",
      "name" : "KEGG Reaction Database",
      "database" : "KEGG Reaction Database",
      "object" : "entity",
      "id" : "KEGG_REACTION",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?rn:R02328",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.genome.jp/kegg/reaction/"
   },
   "ddb_ref" : {
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "id" : "dictyBase_REF",
      "object" : "entity",
      "database" : "dictyBase literature references",
      "name" : "dictyBase literature references",
      "abbreviation" : "DDB_REF",
      "example_id" : "dictyBase_REF:10157",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "generic_url" : "http://dictybase.org",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "pato" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.bioontology.org/wiki/index.php/PATO:Main_Page",
      "url_syntax" : null,
      "abbreviation" : "PATO",
      "example_id" : "PATO:0001420",
      "database" : "Phenotypic quality ontology",
      "name" : "Phenotypic quality ontology",
      "url_example" : null,
      "object" : "entity",
      "id" : "PATO"
   },
   "kegg_pathway" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.genome.jp/kegg/pathway.html",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?path:[example_id]",
      "abbreviation" : "KEGG_PATHWAY",
      "example_id" : "KEGG_PATHWAY:ot00020",
      "database" : "KEGG Pathways Database",
      "name" : "KEGG Pathways Database",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?path:ot00020",
      "id" : "KEGG_PATHWAY",
      "object" : "entity"
   },
   "refgenome" : {
      "example_id" : null,
      "abbreviation" : "RefGenome",
      "url_syntax" : null,
      "id" : "RefGenome",
      "object" : "entity",
      "url_example" : null,
      "name" : "GO Reference Genomes",
      "database" : "GO Reference Genomes",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml"
   },
   "subtilistg" : {
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "name" : "Bacillus subtilis Genome Sequence Project",
      "url_example" : null,
      "id" : "SUBTILISTG",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "SUBTILISTG",
      "example_id" : "SUBTILISTG:accC"
   },
   "embl" : {
      "example_id" : "EMBL:AA816246",
      "abbreviation" : "EMBL",
      "url_syntax" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=[example_id]",
      "object" : "gene",
      "id" : "EMBL",
      "url_example" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=AA816246",
      "name" : "EMBL Nucleotide Sequence Database",
      "database" : "EMBL Nucleotide Sequence Database",
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : "International nucleotide sequence database collaboration, comprising EMBL-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "generic_url" : "http://www.ebi.ac.uk/embl/"
   },
   "aspgd_ref" : {
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=90",
      "object" : "entity",
      "id" : "AspGD_REF",
      "database" : "Aspergillus Genome Database",
      "name" : "Aspergillus Genome Database",
      "abbreviation" : "AspGD_REF",
      "example_id" : "AspGD_REF:90",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "cgdid" : {
      "example_id" : "CGD:CAL0005516",
      "abbreviation" : "CGDID",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "id" : "CGD",
      "object" : "gene",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "name" : "Candida Genome Database",
      "database" : "Candida Genome Database",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.candidagenome.org/"
   },
   "ensemblplants/gramene" : {
      "generic_url" : "http://plants.ensembl.org/",
      "datatype" : "gene",
      "fullname" : null,
      "uri_prefix" : null,
      "object" : "gene",
      "id" : "EnsemblPlants/Gramene",
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "name" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "abbreviation" : "EnsemblPlants/Gramene",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]"
   },
   "obi" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://obi-ontology.org/page/Main_Page",
      "example_id" : "OBI:0000038",
      "abbreviation" : "OBI",
      "url_syntax" : null,
      "object" : "entity",
      "id" : "OBI",
      "url_example" : null,
      "name" : "Ontology for Biomedical Investigations",
      "database" : "Ontology for Biomedical Investigations"
   },
   "agricola_id" : {
      "generic_url" : "http://agricola.nal.usda.gov/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "id" : "AGRICOLA_ID",
      "object" : "entity",
      "database" : "AGRICultural OnLine Access",
      "name" : "AGRICultural OnLine Access",
      "abbreviation" : "AGRICOLA_ID",
      "example_id" : "AGRICOLA_NAL:TP248.2 P76 v.14",
      "url_syntax" : null
   },
   "rhea" : {
      "url_syntax" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=[example_id]",
      "abbreviation" : "RHEA",
      "example_id" : "RHEA:25811",
      "database" : "Rhea, the Annotated Reactions Database",
      "name" : "Rhea, the Annotated Reactions Database",
      "url_example" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=25811",
      "id" : "RHEA",
      "object" : "entity",
      "uri_prefix" : null,
      "fullname" : "Rhea is a freely available, manually annotated database of chemical reactions created in collaboration with the Swiss Institute of Bioinformatics (SIB).",
      "datatype" : "entity",
      "generic_url" : "http://www.ebi.ac.uk/rhea/"
   },
   "omim" : {
      "url_example" : "http://omim.org/entry/190198",
      "id" : "OMIM",
      "object" : "entity",
      "database" : "Mendelian Inheritance in Man",
      "name" : "Mendelian Inheritance in Man",
      "abbreviation" : "OMIM",
      "example_id" : "OMIM:190198",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "pirsf" : {
      "generic_url" : "http://pir.georgetown.edu/pirsf/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "object" : "entity",
      "id" : "PIRSF",
      "url_example" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=SF002327",
      "name" : "PIR Superfamily Classification System",
      "database" : "PIR Superfamily Classification System",
      "example_id" : "PIRSF:SF002327",
      "abbreviation" : "PIRSF",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=[example_id]"
   },
   "casspc" : {
      "example_id" : null,
      "abbreviation" : "CASSPC",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]",
      "object" : "entity",
      "id" : "CASSPC",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "name" : "Catalog of Fishes species database",
      "database" : "Catalog of Fishes species database",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html"
   },
   "ro" : {
      "url_syntax" : "http://purl.obolibrary.org/obo/RO_[example_id]",
      "abbreviation" : "RO",
      "example_id" : "RO:0002211",
      "database" : "OBO Relation Ontology Ontology",
      "name" : "OBO Relation Ontology Ontology",
      "url_example" : "http://purl.obolibrary.org/obo/RO_0002211",
      "id" : "RO",
      "object" : "entity",
      "uri_prefix" : null,
      "fullname" : "A collection of relations used across OBO ontologies",
      "datatype" : "entity",
      "generic_url" : "http://purl.obolibrary.org/obo/ro"
   },
   "muscletrait" : {
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "fullname" : "an integrated database of transcripts expressed in human skeletal muscle",
      "uri_prefix" : null,
      "datatype" : "entity",
      "name" : "TRAnscript Integrated Table",
      "database" : "TRAnscript Integrated Table",
      "id" : "TRAIT",
      "object" : "entity",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "MuscleTRAIT"
   },
   "jcvi_egad" : {
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "abbreviation" : "JCVI_EGAD",
      "example_id" : "JCVI_EGAD:74462",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "id" : "JCVI_EGAD",
      "object" : "entity",
      "database" : "JCVI CMR Egad",
      "name" : "JCVI CMR Egad"
   },
   "genbank" : {
      "datatype" : "protein",
      "uri_prefix" : null,
      "fullname" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "example_id" : "GB:AA816246",
      "abbreviation" : "GenBank",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "object" : "protein",
      "id" : "GenBank",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "name" : "GenBank",
      "database" : "GenBank"
   },
   "sgd_ref" : {
      "generic_url" : "http://www.yeastgenome.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "name" : "Saccharomyces Genome Database",
      "database" : "Saccharomyces Genome Database",
      "object" : "entity",
      "id" : "SGD_REF",
      "url_example" : "http://www.yeastgenome.org/reference/S000049602/overview",
      "url_syntax" : "http://www.yeastgenome.org/reference/[example_id]/overview",
      "example_id" : "SGD_REF:S000049602",
      "abbreviation" : "SGD_REF"
   },
   "mgi" : {
      "url_syntax" : "http://www.informatics.jax.org/accession/[example_id]",
      "example_id" : "MGI:MGI:80863",
      "abbreviation" : "MGI",
      "name" : "Mouse Genome Informatics",
      "database" : "Mouse Genome Informatics",
      "id" : "MGI",
      "object" : "variation",
      "url_example" : "http://www.informatics.jax.org/accession/MGI:80863",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "variation",
      "generic_url" : "http://www.informatics.jax.org/"
   },
   "img" : {
      "generic_url" : "http://img.jgi.doe.gov",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "database" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "name" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "url_example" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=640008772",
      "id" : "IMG",
      "object" : "entity",
      "url_syntax" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=[example_id]",
      "abbreviation" : "IMG",
      "example_id" : "IMG:640008772"
   },
   "cgd_ref" : {
      "generic_url" : "http://www.candidagenome.org/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=1490",
      "id" : "CGD_REF",
      "object" : "entity",
      "database" : "Candida Genome Database",
      "name" : "Candida Genome Database",
      "abbreviation" : "CGD_REF",
      "example_id" : "CGD_REF:1490",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]"
   },
   "unirule" : {
      "object" : "entity",
      "id" : "UniRule",
      "url_example" : "http://www.uniprot.org/unirule/UR000107224",
      "name" : "Manually curated rules for automatic annotation of UniProtKB unreviewed entries",
      "database" : "Manually curated rules for automatic annotation of UniProtKB unreviewed entries",
      "example_id" : "UniRule:UR000107224",
      "abbreviation" : "UniRule",
      "url_syntax" : "http://www.uniprot.org/unirule/[example_id]",
      "generic_url" : "http://www.uniprot.org/unirule",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "go" : {
      "database" : "Gene Ontology Database",
      "name" : "Gene Ontology Database",
      "url_example" : "http://amigo.geneontology.org/amigo/term/GO:0004352",
      "id" : "GO",
      "object" : "macromolecular complex",
      "url_syntax" : "http://amigo.geneontology.org/amigo/term/GO:[example_id]",
      "abbreviation" : "GO",
      "example_id" : "GO:0004352",
      "generic_url" : "http://amigo.geneontology.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "macromolecular complex"
   },
   "sp_sl" : {
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "abbreviation" : "SP_SL",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "object" : "entity",
      "id" : "UniProtKB-SubCell",
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "name" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.uniprot.org/locations/"
   },
   "resid" : {
      "abbreviation" : "RESID",
      "example_id" : "RESID:AA0062",
      "url_syntax" : null,
      "url_example" : null,
      "id" : "RESID",
      "object" : "entity",
      "database" : "RESID Database of Protein Modifications",
      "name" : "RESID Database of Protein Modifications",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "ftp://ftp.ncifcrf.gov/pub/users/residues/"
   },
   "nc-iubmb" : {
      "url_example" : null,
      "id" : "NC-IUBMB",
      "object" : "entity",
      "database" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "name" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "abbreviation" : "NC-IUBMB",
      "example_id" : null,
      "url_syntax" : null,
      "generic_url" : "http://www.chem.qmw.ac.uk/iubmb/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "aspgdid" : {
      "generic_url" : "http://www.aspergillusgenome.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene",
      "database" : "Aspergillus Genome Database",
      "name" : "Aspergillus Genome Database",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "id" : "AspGD",
      "object" : "gene",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "abbreviation" : "AspGDID",
      "example_id" : "AspGD:ASPL0000067538"
   },
   "h-invdb_cdna" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.h-invitational.jp/",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=[example_id]",
      "abbreviation" : "H-invDB_cDNA",
      "example_id" : "H-invDB_cDNA:AK093148",
      "database" : "H-invitational Database",
      "name" : "H-invitational Database",
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=AK093149",
      "object" : "entity",
      "id" : "H-invDB_cDNA"
   },
   "cl" : {
      "generic_url" : "http://cellontology.org",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "cell",
      "name" : "Cell Type Ontology",
      "database" : "Cell Type Ontology",
      "id" : "CL",
      "object" : "cell",
      "url_example" : "http://purl.obolibrary.org/obo/CL_0000041",
      "url_syntax" : "http://purl.obolibrary.org/obo/CL_[example_id]",
      "example_id" : "CL:0000041",
      "abbreviation" : "CL"
   },
   "unigene" : {
      "database" : "UniGene",
      "name" : "UniGene",
      "url_example" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=Hs&CID=212293",
      "id" : "UniGene",
      "object" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=[organism_abbreviation]&CID=[cluster_id]",
      "abbreviation" : "UniGene",
      "example_id" : "UniGene:Hs.212293",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/UniGene",
      "uri_prefix" : null,
      "fullname" : "NCBI transcript cluster database, organized by transcriptome. Each UniGene entry is a set of transcript sequences that appear to come from the same transcription locus (gene or expressed pseudogene).",
      "datatype" : "entity"
   },
   "ecoliwiki" : {
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : "EcoliHub\\'s subsystem for community annotation of E. coli K-12",
      "generic_url" : "http://ecoliwiki.net/",
      "abbreviation" : "EcoliWiki",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "id" : "EcoliWiki",
      "object" : "gene",
      "database" : "EcoliWiki from EcoliHub",
      "name" : "EcoliWiki from EcoliHub"
   },
   "rnamdb" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "abbreviation" : "RNAMDB",
      "example_id" : "RNAmods:037",
      "database" : "RNA Modification Database",
      "name" : "RNA Modification Database",
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "object" : "entity",
      "id" : "RNAmods"
   },
   "cgen" : {
      "generic_url" : "http://www.cgen.com/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "url_example" : null,
      "object" : "entity",
      "id" : "CGEN",
      "database" : "Compugen Gene Ontology Gene Association Data",
      "name" : "Compugen Gene Ontology Gene Association Data",
      "abbreviation" : "CGEN",
      "example_id" : "CGEN:PrID131022",
      "url_syntax" : null
   },
   "jcvi" : {
      "generic_url" : "http://www.jcvi.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "J. Craig Venter Institute",
      "name" : "J. Craig Venter Institute",
      "url_example" : null,
      "id" : "JCVI",
      "object" : "entity",
      "url_syntax" : null,
      "abbreviation" : "JCVI",
      "example_id" : null
   },
   "uniprotkb" : {
      "uri_prefix" : null,
      "fullname" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "datatype" : "protein",
      "generic_url" : "http://www.uniprot.org",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "abbreviation" : "UniProtKB",
      "example_id" : "UniProtKB:P51587",
      "database" : "Universal Protein Knowledgebase",
      "name" : "Universal Protein Knowledgebase",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "id" : "UniProtKB",
      "object" : "protein"
   },
   "roslin_institute" : {
      "generic_url" : "http://www.roslin.ac.uk/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "id" : "Roslin_Institute",
      "object" : "entity",
      "database" : "Roslin Institute",
      "name" : "Roslin Institute",
      "abbreviation" : "Roslin_Institute",
      "example_id" : null,
      "url_syntax" : null
   },
   "smart" : {
      "generic_url" : "http://smart.embl-heidelberg.de/",
      "datatype" : "polypeptide region",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=SM00005",
      "id" : "SMART",
      "object" : "polypeptide region",
      "database" : "Simple Modular Architecture Research Tool",
      "name" : "Simple Modular Architecture Research Tool",
      "abbreviation" : "SMART",
      "example_id" : "SMART:SM00005",
      "url_syntax" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=[example_id]"
   },
   "merops" : {
      "generic_url" : "http://merops.sanger.ac.uk/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein",
      "name" : "MEROPS peptidase database",
      "database" : "MEROPS peptidase database",
      "object" : "protein",
      "id" : "MEROPS",
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=A08.001",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=[example_id]",
      "example_id" : "MEROPS:A08.001",
      "abbreviation" : "MEROPS"
   },
   "gr_ref" : {
      "generic_url" : "http://www.gramene.org/",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "url_example" : "http://www.gramene.org/db/literature/pub_search?ref_id=659",
      "id" : "GR_REF",
      "object" : "entity",
      "database" : "Gramene",
      "name" : "Gramene",
      "abbreviation" : "GR_REF",
      "example_id" : "GR_REF:659",
      "url_syntax" : "http://www.gramene.org/db/literature/pub_search?ref_id=[example_id]"
   },
   "aracyc" : {
      "url_example" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=PWYQT-62",
      "id" : "AraCyc",
      "object" : "entity",
      "database" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "name" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "abbreviation" : "AraCyc",
      "example_id" : "AraCyc:PWYQT-62",
      "url_syntax" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=[example_id]",
      "generic_url" : "http://www.arabidopsis.org/biocyc/index.jsp",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null
   },
   "bfo" : {
      "generic_url" : "http://purl.obolibrary.org/obo/bfo",
      "datatype" : "entity",
      "fullname" : "An upper ontology used by Open Bio Ontologies (OBO) Foundry. BFO contains upper-level classes as well as core relations such as part_of (BFO_0000050)",
      "uri_prefix" : null,
      "url_example" : "http://purl.obolibrary.org/obo/BFO_0000066",
      "object" : "entity",
      "id" : "BFO",
      "database" : "Basic Formal Ontology",
      "name" : "Basic Formal Ontology",
      "abbreviation" : "BFO",
      "example_id" : "BFO:0000066",
      "url_syntax" : "http://purl.obolibrary.org/obo/BFO_[example_id]"
   },
   "mgd" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.informatics.jax.org/",
      "url_syntax" : null,
      "abbreviation" : "MGD",
      "example_id" : "MGD:Adcy9",
      "database" : "Mouse Genome Database",
      "name" : "Mouse Genome Database",
      "url_example" : null,
      "id" : "MGD",
      "object" : "entity"
   },
   "cacao" : {
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MYCS2:A0QNF5",
      "object" : "entity",
      "id" : "CACAO",
      "database" : "Community Assessment of Community Annotation with Ontologies",
      "name" : "Community Assessment of Community Annotation with Ontologies",
      "abbreviation" : "CACAO",
      "example_id" : "MYCS2:A0QNF5",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "generic_url" : "http://gowiki.tamu.edu/wiki/index.php/Category:CACAO",
      "datatype" : "entity",
      "fullname" : "The Community Assessment of Community Annotation with Ontologies (CACAO) is a project to do large-scale manual community annotation of gene function using the Gene Ontology as a multi-institution student competition.",
      "uri_prefix" : null
   },
   "gdb" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.gdb.org/",
      "url_syntax" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:[example_id]",
      "abbreviation" : "GDB",
      "example_id" : "GDB:306600",
      "database" : "Human Genome Database",
      "name" : "Human Genome Database",
      "url_example" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:306600",
      "id" : "GDB",
      "object" : "entity"
   },
   "jcvi_cmr" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "protein",
      "generic_url" : "http://cmr.jcvi.org/",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "example_id" : "JCVI_CMR:VCA0557",
      "abbreviation" : "JCVI_CMR",
      "name" : "EGAD database at the J. Craig Venter Institute",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "object" : "protein",
      "id" : "JCVI_CMR",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557"
   },
   "zfin" : {
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "variation",
      "generic_url" : "http://zfin.org/",
      "url_syntax" : "http://zfin.org/cgi-bin/ZFIN_jump?record=[example_id]",
      "abbreviation" : "ZFIN",
      "example_id" : "ZFIN:ZDB-GENE-990415-103",
      "database" : "Zebrafish Information Network",
      "name" : "Zebrafish Information Network",
      "url_example" : "http://zfin.org/cgi-bin/ZFIN_jump?record=ZDB-GENE-990415-103",
      "id" : "ZFIN",
      "object" : "variation"
   },
   "rnacentral" : {
      "uri_prefix" : null,
      "fullname" : "An international database of ncRNA sequences",
      "datatype" : "ribonucleic acid",
      "generic_url" : "http://rnacentral.org",
      "url_syntax" : "http://rnacentral.org/rna/[example_id]",
      "example_id" : "RNAcentral:URS000047C79B_9606",
      "abbreviation" : "RNAcentral",
      "name" : "RNAcentral",
      "database" : "RNAcentral",
      "object" : "ribonucleic acid",
      "id" : "RNAcentral",
      "url_example" : "http://rnacentral.org/rna/URS000047C79B_9606"
   },
   "metacyc" : {
      "name" : "Metabolic Encyclopedia of metabolic and other pathways",
      "database" : "Metabolic Encyclopedia of metabolic and other pathways",
      "object" : "entity",
      "id" : "MetaCyc",
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=GLUTDEG-PWY",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=[example_id]",
      "example_id" : "MetaCyc:GLUTDEG-PWY",
      "abbreviation" : "MetaCyc",
      "generic_url" : "http://metacyc.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "ensembl" : {
      "example_id" : "ENSEMBL:ENSP00000265949",
      "abbreviation" : "Ensembl",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "object" : "transcript",
      "id" : "ENSEMBL",
      "url_example" : "http://www.ensembl.org/id/ENSP00000265949",
      "name" : "Ensembl database of automatically annotated genomic data",
      "database" : "Ensembl database of automatically annotated genomic data",
      "datatype" : "transcript",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.ensembl.org/"
   },
   "ensemblfungi" : {
      "generic_url" : "http://fungi.ensembl.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "gene",
      "name" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "database" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "object" : "gene",
      "id" : "EnsemblFungi",
      "url_example" : "http://www.ensemblgenomes.org/id/YOR197W",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "example_id" : "EnsemblFungi:YOR197W",
      "abbreviation" : "EnsemblFungi"
   },
   "fma" : {
      "object" : "entity",
      "id" : "FMA",
      "url_example" : null,
      "name" : "Foundational Model of Anatomy",
      "database" : "Foundational Model of Anatomy",
      "example_id" : "FMA:61905",
      "abbreviation" : "FMA",
      "url_syntax" : null,
      "generic_url" : "http://sig.biostr.washington.edu/projects/fm/index.html",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null
   },
   "pfamb" : {
      "name" : "Pfam-B supplement to Pfam",
      "database" : "Pfam-B supplement to Pfam",
      "object" : "entity",
      "id" : "PfamB",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : "PfamB:PB014624",
      "abbreviation" : "PfamB",
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "genprotec" : {
      "name" : "GenProtEC E. coli genome and proteome database",
      "database" : "GenProtEC E. coli genome and proteome database",
      "object" : "entity",
      "id" : "GenProtEC",
      "url_example" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "GenProtEC",
      "generic_url" : "http://genprotec.mbl.edu/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity"
   },
   "ensembl_proteinid" : {
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "protein",
      "generic_url" : "http://www.ensembl.org/",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "abbreviation" : "ENSEMBL_ProteinID",
      "example_id" : "ENSEMBL_ProteinID:ENSP00000361027",
      "database" : "Ensembl database of automatically annotated genomic data",
      "name" : "Ensembl database of automatically annotated genomic data",
      "url_example" : "http://www.ensembl.org/id/ENSP00000361027",
      "id" : "ENSEMBL_ProteinID",
      "object" : "protein"
   },
   "ddb" : {
      "datatype" : "gene",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://dictybase.org",
      "example_id" : "dictyBase:DDB_G0277859",
      "abbreviation" : "DDB",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "object" : "gene",
      "id" : "dictyBase",
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "name" : "dictyBase",
      "database" : "dictyBase"
   },
   "pamgo_vmd" : {
      "object" : "entity",
      "id" : "PAMGO_VMD",
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=109198",
      "name" : "Virginia Bioinformatics Institute Microbial Database",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "example_id" : "PAMGO_VMD:109198",
      "abbreviation" : "PAMGO_VMD",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=[example_id]",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "datatype" : "entity",
      "fullname" : "Virginia Bioinformatics Institute Microbial Database; member of PAMGO Interest Group",
      "uri_prefix" : null
   },
   "goc" : {
      "url_syntax" : null,
      "abbreviation" : "GOC",
      "example_id" : null,
      "database" : "Gene Ontology Consortium",
      "name" : "Gene Ontology Consortium",
      "url_example" : null,
      "object" : "entity",
      "id" : "GOC",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.geneontology.org/"
   },
   "refseq" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "datatype" : "protein",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=XP_001068954",
      "id" : "RefSeq",
      "object" : "protein",
      "database" : "RefSeq",
      "name" : "RefSeq",
      "abbreviation" : "RefSeq",
      "example_id" : "RefSeq:XP_001068954",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]"
   },
   "cdd" : {
      "database" : "Conserved Domain Database at NCBI",
      "name" : "Conserved Domain Database at NCBI",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=34222",
      "id" : "CDD",
      "object" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=[example_id]",
      "abbreviation" : "CDD",
      "example_id" : "CDD:34222",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=cdd",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "sgn" : {
      "name" : "Sol Genomics Network",
      "database" : "Sol Genomics Network",
      "object" : "gene",
      "id" : "SGN",
      "url_example" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=4476",
      "url_syntax" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=[example_id]",
      "example_id" : "SGN:4476",
      "abbreviation" : "SGN",
      "generic_url" : "http://www.sgn.cornell.edu/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene"
   },
   "ncbi_taxid" : {
      "name" : "NCBI Taxonomy",
      "database" : "NCBI Taxonomy",
      "id" : "taxon",
      "object" : "entity",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "example_id" : "taxon:7227",
      "abbreviation" : "ncbi_taxid",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "entity"
   },
   "obo_sf_po" : {
      "generic_url" : "http://sourceforge.net/tracker/?func=browse&group_id=76834&atid=835555",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "url_example" : "https://sourceforge.net/tracker/index.php?func=detail&aid=3184921&group_id=76834&atid=835555",
      "id" : "OBO_SF_PO",
      "object" : "entity",
      "database" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "name" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "abbreviation" : "OBO_SF_PO",
      "example_id" : "OBO_SF_PO:3184921",
      "url_syntax" : "https://sourceforge.net/tracker/index.php?func=detail&aid=[example_id]&group_id=76834&atid=835555"
   },
   "transfac" : {
      "abbreviation" : "TRANSFAC",
      "example_id" : null,
      "url_syntax" : null,
      "url_example" : null,
      "id" : "TRANSFAC",
      "object" : "entity",
      "database" : "TRANSFAC database of eukaryotic transcription factors",
      "name" : "TRANSFAC database of eukaryotic transcription factors",
      "datatype" : "entity",
      "uri_prefix" : null,
      "fullname" : null,
      "generic_url" : "http://www.gene-regulation.com/pub/databases.html#transfac"
   },
   "gr_qtl" : {
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "uri_prefix" : null,
      "datatype" : "entity",
      "database" : "Gramene",
      "name" : "Gramene",
      "url_example" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=CQU7",
      "object" : "entity",
      "id" : "GR_QTL",
      "url_syntax" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=[example_id]",
      "abbreviation" : "GR_QTL",
      "example_id" : "GR_QTL:CQU7"
   },
   "iuphar_receptor" : {
      "example_id" : "IUPHAR_RECEPTOR:2205",
      "abbreviation" : "IUPHAR_RECEPTOR",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=[example_id]",
      "object" : "entity",
      "id" : "IUPHAR_RECEPTOR",
      "url_example" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=56",
      "name" : "International Union of Pharmacology",
      "database" : "International Union of Pharmacology",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/"
   },
   "ecogene" : {
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "name" : "EcoGene Database of Escherichia coli Sequence and Function",
      "url_example" : "http://www.ecogene.org/geneInfo.php?eg_id=EG10818",
      "id" : "ECOGENE",
      "object" : "gene",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eg_id=[example_id]",
      "abbreviation" : "ECOGENE",
      "example_id" : "ECOGENE:EG10818",
      "generic_url" : "http://www.ecogene.org/",
      "uri_prefix" : null,
      "fullname" : null,
      "datatype" : "gene"
   },
   "geo" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/geo/",
      "datatype" : "entity",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=GDS2223",
      "id" : "GEO",
      "object" : "entity",
      "database" : "NCBI Gene Expression Omnibus",
      "name" : "NCBI Gene Expression Omnibus",
      "abbreviation" : "GEO",
      "example_id" : "GEO:GDS2223",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=[example_id]"
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
   "qualifier" : {
      "context" : {
         "bbop.widgets.search_pane" : "amigo.handlers.qualifiers"
      }
   },
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
