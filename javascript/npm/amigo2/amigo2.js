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
amigo.version.revision = "2.4.0";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
amigo.version.release = "20150826";
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
   "general" : {
      "schema_generating" : "true",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0",
      "searchable_extension" : "_searchable",
      "result_weights" : "entity^3.0 category^1.0",
      "weight" : "0",
      "_strict" : 0,
      "filter_weights" : "category^4.0",
      "display_name" : "General",
      "document_category" : "general",
      "description" : "A generic search document to get a general overview of everything.",
      "fields" : [
         {
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Internal ID",
            "transform" : [],
            "type" : "string",
            "description" : "The mangled internal ID for this entity.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "The ID/label for this entity.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Entity",
            "id" : "entity",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Enity label",
            "type" : "string",
            "transform" : [],
            "description" : "The label for this entity.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "entity_label"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "category",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "The document category that this enitity belongs to.",
            "transform" : [],
            "display_name" : "Document category",
            "type" : "string"
         },
         {
            "id" : "general_blob",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Generic blob",
            "cardinality" : "single",
            "searchable" : "true"
         }
      ],
      "fields_hash" : {
         "category" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "category",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "The document category that this enitity belongs to.",
            "transform" : [],
            "display_name" : "Document category",
            "type" : "string"
         },
         "entity_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Enity label",
            "type" : "string",
            "transform" : [],
            "description" : "The label for this entity.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "entity_label"
         },
         "entity" : {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "The ID/label for this entity.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Entity",
            "id" : "entity",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "general_blob" : {
            "id" : "general_blob",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Generic blob",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "id" : {
            "searchable" : "false",
            "cardinality" : "single",
            "display_name" : "Internal ID",
            "transform" : [],
            "type" : "string",
            "description" : "The mangled internal ID for this entity.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         }
      },
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/general-config.yaml",
      "id" : "general",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/general-config.yaml"
   },
   "bioentity" : {
      "description" : "Genes and gene products associated with GO terms.",
      "display_name" : "Genes and gene products",
      "document_category" : "bioentity",
      "fields" : [
         {
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Acc",
            "description" : "Gene of gene product ID.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "display_name" : "Acc",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product ID."
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Symbol or name.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "bioentity_label"
         },
         {
            "id" : "bioentity_name",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Name",
            "transform" : [],
            "type" : "string",
            "description" : "The full name of the gene product.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "This should not be displayed",
            "transform" : [],
            "type" : "string",
            "description" : "The bioentity ID used at the database of origin.",
            "id" : "bioentity_internal_id",
            "required" : "false",
            "property" : [],
            "indexed" : "false"
         },
         {
            "type" : "string",
            "display_name" : "Type",
            "transform" : [],
            "description" : "Type class.",
            "id" : "type",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "id" : "taxon",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "Taxonomic group",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_label"
         },
         {
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure_label",
            "description" : "Taxonomic group and ancestral groups.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         {
            "id" : "isa_partof_closure",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "description" : "Closure of labels over isa and partof.",
            "type" : "string",
            "display_name" : "Involved in",
            "transform" : [],
            "id" : "isa_partof_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "regulates_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "regulates_closure_label"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "source",
            "description" : "Database source.",
            "display_name" : "Source",
            "transform" : [],
            "type" : "string"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Direct annotations.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "id" : "annotation_class_list",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "description" : "Direct annotations.",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_class_list_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "id" : "synonym",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Gene product synonyms.",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "description" : "JSON blob form of the phylogenic tree.",
            "property" : [],
            "required" : "false",
            "indexed" : "false",
            "id" : "phylo_graph_json",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "DB xref",
            "description" : "Database cross-reference.",
            "id" : "database_xref",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         }
      ],
      "fields_hash" : {
         "phylo_graph_json" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "description" : "JSON blob form of the phylogenic tree.",
            "property" : [],
            "required" : "false",
            "indexed" : "false",
            "id" : "phylo_graph_json",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "bioentity" : {
            "searchable" : "false",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "display_name" : "Acc",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product ID."
         },
         "database_xref" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "DB xref",
            "description" : "Database cross-reference.",
            "id" : "database_xref",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "bioentity_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Symbol or name.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "bioentity_label"
         },
         "taxon" : {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Taxonomic group",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "id" : "taxon",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "bioentity_name" : {
            "id" : "bioentity_name",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Name",
            "transform" : [],
            "type" : "string",
            "description" : "The full name of the gene product.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "taxon_closure_label" : {
            "searchable" : "true",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure_label",
            "description" : "Taxonomic group and ancestral groups.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         "annotation_class_list" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Direct annotations.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "id" : "annotation_class_list",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         "isa_partof_closure_label" : {
            "description" : "Closure of labels over isa and partof.",
            "type" : "string",
            "display_name" : "Involved in",
            "transform" : [],
            "id" : "isa_partof_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "synonym" : {
            "id" : "synonym",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Gene product synonyms.",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "source" : {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "source",
            "description" : "Database source.",
            "display_name" : "Source",
            "transform" : [],
            "type" : "string"
         },
         "annotation_class_list_label" : {
            "description" : "Direct annotations.",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_class_list_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "isa_partof_closure" : {
            "id" : "isa_partof_closure",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "bioentity_internal_id" : {
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "This should not be displayed",
            "transform" : [],
            "type" : "string",
            "description" : "The bioentity ID used at the database of origin.",
            "id" : "bioentity_internal_id",
            "required" : "false",
            "property" : [],
            "indexed" : "false"
         },
         "panther_family_label" : {
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "type" : {
            "type" : "string",
            "display_name" : "Type",
            "transform" : [],
            "description" : "Type class.",
            "id" : "type",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "Taxonomic group",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_label"
         },
         "taxon_closure" : {
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "panther_family" : {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "regulates_closure_label" : {
            "searchable" : "true",
            "cardinality" : "multi",
            "display_name" : "Inferred annotation",
            "type" : "string",
            "transform" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "regulates_closure_label"
         },
         "id" : {
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Acc",
            "description" : "Gene of gene product ID.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "id"
         },
         "regulates_closure" : {
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "regulates_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         }
      },
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/bio-config.yaml",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/bio-config.yaml",
      "id" : "bioentity",
      "schema_generating" : "true",
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0 bioentity_name^1.0 bioentity_internal_id^1.0 synonym^1.0 isa_partof_closure_label^1.0 regulates_closure^1.0 regulates_closure_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "_strict" : 0,
      "weight" : "30",
      "filter_weights" : "source^7.0 type^6.0 panther_family_label^5.0 annotation_class_list_label^3.5 taxon_closure_label^4.0 regulates_closure_label^2.0",
      "searchable_extension" : "_searchable",
      "result_weights" : "bioentity^8.0 bioentity_name^7.0 taxon^6.0 panther_family^5.0 type^4.0 source^3.0 annotation_class_list^2.0 synonym^1.0"
   },
   "family" : {
      "result_weights" : "panther_family^5.0 bioentity_list^4.0",
      "searchable_extension" : "_searchable",
      "weight" : "5",
      "_strict" : 0,
      "filter_weights" : "bioentity_list_label^1.0",
      "boost_weights" : "panther_family^2.0 panther_family_label^2.0 bioentity_list^1.0 bioentity_list_label^1.0",
      "schema_generating" : "true",
      "id" : "family",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/protein-family-config.yaml",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/protein-family-config.yaml",
      "fields" : [
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Family ID.",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : []
         },
         {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "description" : "PANTHER families that are associated with this entity.",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "id" : "phylo_graph_json",
            "description" : "JSON blob form of the phylogenic tree.",
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed"
         },
         {
            "description" : "Gene/products annotated with this protein family.",
            "display_name" : "Gene/products",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_list",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_list_label",
            "description" : "Gene/products annotated with this protein family.",
            "display_name" : "Gene/products",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         }
      ],
      "fields_hash" : {
         "bioentity_list_label" : {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_list_label",
            "description" : "Gene/products annotated with this protein family.",
            "display_name" : "Gene/products",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "panther_family" : {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "phylo_graph_json" : {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "id" : "phylo_graph_json",
            "description" : "JSON blob form of the phylogenic tree.",
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed"
         },
         "id" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Family ID.",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : []
         },
         "panther_family_label" : {
            "description" : "PANTHER families that are associated with this entity.",
            "type" : "string",
            "display_name" : "PANTHER family",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "bioentity_list" : {
            "description" : "Gene/products annotated with this protein family.",
            "display_name" : "Gene/products",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_list",
            "searchable" : "false",
            "cardinality" : "multi"
         }
      },
      "document_category" : "family",
      "display_name" : "Protein families",
      "description" : "Information about protein (PANTHER) families."
   },
   "annotation" : {
      "fields_hash" : {
         "annotation_extension_class_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Extension class for the annotation.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_class_closure",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "taxon_closure_subset_label" : {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "taxon_closure_subset_label",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         "assigned_by" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Annotations assigned by group.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Assigned by",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "assigned_by"
         },
         "evidence_type" : {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "evidence_type",
            "description" : "Evidence type.",
            "type" : "string",
            "display_name" : "Evidence",
            "transform" : []
         },
         "bioentity_isoform" : {
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "bioentity_isoform",
            "transform" : [],
            "display_name" : "Isoform",
            "type" : "string",
            "description" : "Biological isoform.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "evidence_with" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "evidence_with",
            "description" : "Evidence with/from.",
            "type" : "string",
            "display_name" : "Evidence with",
            "transform" : []
         },
         "secondary_taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "secondary_taxon_label"
         },
         "synonym" : {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "synonym",
            "display_name" : "Synonym",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product synonyms.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "isa_partof_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "isa_partof_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "description" : "Annotations for this term or its children (over is_a/part_of)."
         },
         "annotation_extension_json" : {
            "id" : "annotation_extension_json",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Extension class for the annotation (JSON).",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "isa_partof_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "isa_partof_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string"
         },
         "regulates_closure_label" : {
            "description" : "Annotations for this term or its children (over regulates).",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "type" : "string",
            "id" : "regulates_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "description" : "Direct annotations.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         "panther_family" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "taxon_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         "type" : {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Type class.",
            "type" : "string",
            "display_name" : "Type class id",
            "transform" : [],
            "id" : "type",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "annotation_extension_class_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "aspect" : {
            "display_name" : "Ontology (aspect)",
            "transform" : [],
            "type" : "string",
            "description" : "Ontology aspect.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "aspect",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "annotation_extension_class" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "evidence_type_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "description" : "All evidence (evidence closure) for this annotation",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "evidence_type_closure"
         },
         "secondary_taxon" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "secondary_taxon"
         },
         "bioentity_label" : {
            "description" : "Gene or gene product identifiers.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/product",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "bioentity_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "bioentity" : {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity",
            "description" : "Gene or gene product identifiers.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product"
         },
         "taxon_closure_subset" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_closure_subset",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "bioentity_name" : {
            "description" : "The full name of the gene or gene product.",
            "display_name" : "Gene/product name",
            "transform" : [],
            "type" : "string",
            "id" : "bioentity_name",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "taxon" : {
            "id" : "taxon",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "description" : "Taxonomic group.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "taxon_closure_label" : {
            "id" : "taxon_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "secondary_taxon_closure" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon",
            "description" : "Secondary taxon closure.",
            "id" : "secondary_taxon_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "annotation_extension_class_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "annotation_extension_class_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Extension class for the annotation.",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : []
         },
         "annotation_class" : {
            "id" : "annotation_class",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Direct annotations.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Direct annotation",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "has_participant_closure" : {
            "description" : "Closure of ids/accs over has_participant.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Has participant (IDs)",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "has_participant_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "qualifier" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "qualifier",
            "description" : "Annotation qualifier.",
            "display_name" : "Qualifier",
            "transform" : [],
            "type" : "string"
         },
         "source" : {
            "id" : "source",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Database source.",
            "display_name" : "Source",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "secondary_taxon_closure_label" : {
            "description" : "Secondary taxon closure.",
            "type" : "string",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "secondary_taxon_closure_label",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         "reference" : {
            "type" : "string",
            "display_name" : "Reference",
            "transform" : [],
            "description" : "Database reference.",
            "id" : "reference",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "bioentity_internal_id" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "transform" : [],
            "display_name" : "This should not be displayed",
            "type" : "string"
         },
         "panther_family_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "description" : "PANTHER families that are associated with this entity."
         },
         "taxon_label" : {
            "id" : "taxon_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "regulates_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "regulates_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "description" : "Annotations for this term or its children (over regulates)."
         },
         "is_redundant_for" : {
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Redundant for",
            "type" : "string",
            "transform" : [],
            "description" : "Rational for redundancy of annotation.",
            "id" : "is_redundant_for",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         "has_participant_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "has_participant_closure_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Closure of labels over has_participant.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Has participant"
         },
         "id" : {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "id",
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         "date" : {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Date",
            "transform" : [],
            "description" : "Date of assignment.",
            "id" : "date",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         }
      },
      "fields" : [
         {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "id",
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "type" : "string",
            "display_name" : "Acc",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "id" : "source",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Database source.",
            "display_name" : "Source",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "description" : "Type class.",
            "type" : "string",
            "display_name" : "Type class id",
            "transform" : [],
            "id" : "type",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Date",
            "transform" : [],
            "description" : "Date of assignment.",
            "id" : "date",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Annotations assigned by group.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Assigned by",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "assigned_by"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "display_name" : "Redundant for",
            "type" : "string",
            "transform" : [],
            "description" : "Rational for redundancy of annotation.",
            "id" : "is_redundant_for",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         {
            "id" : "taxon",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Taxon",
            "type" : "string",
            "description" : "Taxonomic group.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "id" : "taxon_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Taxonomic group and ancestral groups.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "id" : "taxon_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "id" : "taxon_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "description" : "Taxonomic group (direct) and ancestral groups that are within the specified subset (e.g mammalia, eukaryota).",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_closure_subset",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "taxon_closure_subset_label",
            "description" : "Labels for taxonomic group (direct) and ancestral groups that are within the specified subset.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "secondary_taxon"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Secondary taxon.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "secondary_taxon_label"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon",
            "description" : "Secondary taxon closure.",
            "id" : "secondary_taxon_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "description" : "Secondary taxon closure.",
            "type" : "string",
            "display_name" : "Secondary taxon",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "secondary_taxon_closure_label",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "isa_partof_closure",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "isa_partof_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Involved in",
            "type" : "string",
            "description" : "Annotations for this term or its children (over is_a/part_of)."
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "regulates_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "description" : "Annotations for this term or its children (over regulates)."
         },
         {
            "description" : "Annotations for this term or its children (over regulates).",
            "display_name" : "Inferred annotation",
            "transform" : [],
            "type" : "string",
            "id" : "regulates_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "description" : "Closure of ids/accs over has_participant.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Has participant (IDs)",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "has_participant_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "has_participant_closure_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Closure of labels over has_participant.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Has participant"
         },
         {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "synonym",
            "display_name" : "Synonym",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product synonyms.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "bioentity",
            "description" : "Gene or gene product identifiers.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product"
         },
         {
            "description" : "Gene or gene product identifiers.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/product",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "bioentity_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "description" : "The full name of the gene or gene product.",
            "display_name" : "Gene/product name",
            "transform" : [],
            "type" : "string",
            "id" : "bioentity_name",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "bioentity_internal_id",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "transform" : [],
            "display_name" : "This should not be displayed",
            "type" : "string"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "qualifier",
            "description" : "Annotation qualifier.",
            "display_name" : "Qualifier",
            "transform" : [],
            "type" : "string"
         },
         {
            "id" : "annotation_class",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "Direct annotations.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Direct annotation",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "display_name" : "Direct annotation",
            "type" : "string",
            "transform" : [],
            "description" : "Direct annotations.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         {
            "display_name" : "Ontology (aspect)",
            "transform" : [],
            "type" : "string",
            "description" : "Ontology aspect.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "aspect",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "bioentity_isoform",
            "transform" : [],
            "display_name" : "Isoform",
            "type" : "string",
            "description" : "Biological isoform.",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "evidence_type",
            "description" : "Evidence type.",
            "type" : "string",
            "display_name" : "Evidence",
            "transform" : []
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "Evidence type",
            "type" : "string",
            "description" : "All evidence (evidence closure) for this annotation",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "evidence_type_closure"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "evidence_with",
            "description" : "Evidence with/from.",
            "type" : "string",
            "display_name" : "Evidence with",
            "transform" : []
         },
         {
            "type" : "string",
            "display_name" : "Reference",
            "transform" : [],
            "description" : "Database reference.",
            "id" : "reference",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "annotation_extension_class_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Extension class for the annotation.",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : []
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "description" : "Extension class for the annotation.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_class_closure",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "description" : "Extension class for the annotation.",
            "id" : "annotation_extension_class_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "annotation_extension_json",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Extension class for the annotation (JSON).",
            "type" : "string",
            "display_name" : "Annotation extension",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "description" : "PANTHER families that are associated with this entity.",
            "id" : "panther_family",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "description" : "PANTHER families that are associated with this entity."
         }
      ],
      "description" : "Associations between GO terms and genes or gene products.",
      "document_category" : "annotation",
      "display_name" : "Annotations",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/ann-config.yaml",
      "id" : "annotation",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/ann-config.yaml",
      "schema_generating" : "true",
      "_strict" : 0,
      "weight" : "20",
      "filter_weights" : "source^7.0 assigned_by^6.5 aspect^6.25 evidence_type_closure^6.0 panther_family_label^5.5 qualifier^5.25 taxon_label^5.0 annotation_class_label^4.5 regulates_closure_label^3.0 annotation_extension_class_closure_label^2.0",
      "result_weights" : "bioentity^7.0 bioentity_name^6.0 qualifier^5.0 annotation_class^4.7 annotation_extension_json^4.5 assigned_by^4.0 taxon^3.0 evidence_type^2.5 evidence_with^2.0 panther_family^1.5 bioentity_isoform^0.5 reference^0.25 date^0.10",
      "searchable_extension" : "_searchable",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 bioentity_name^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 reference^1.0 panther_family^1.0 panther_family_label^1.0 bioentity_isoform^1.0 regulates_closure^1.0 regulates_closure_label^1.0"
   },
   "model_annotation" : {
      "schema_generating" : "true",
      "filter_weights" : "model_label^5.0 enabled_by_label^4.5 location_list_closure_label^4.0 process_class_closure_label^3.0 function_class_closure_label^2.0 contributor^1.0 evidence^0.5",
      "_strict" : 0,
      "weight" : "-5",
      "searchable_extension" : "_searchable",
      "result_weights" : "function_class^9.0 enabled_by^8.0 location_list^7.0 process_class^6.0 taxon^4.0 model^5.0 contributor^4.0 date^3.0 reference^2.0",
      "boost_weights" : "model_label^1.0 annotation_unit_label^1.0 enabled_by^1.0 enabled_by_label^1.0 location_list_closure^1.0 location_list_closure_label^1.0 process_class_closure_label^1.0 function_class_closure_label^1.0 comments^0.5",
      "fields" : [
         {
            "id" : "id",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "ID",
            "transform" : [],
            "type" : "string",
            "description" : "A unique (and internal) thing.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "???.",
            "transform" : [],
            "display_name" : "Annotation unit",
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_unit"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation unit",
            "description" : "???.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_unit_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "model",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "model"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "model_label",
            "description" : "???.",
            "display_name" : "model",
            "transform" : [],
            "type" : "string"
         },
         {
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "model URL",
            "id" : "model_url",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "description" : "???.",
            "type" : "string",
            "display_name" : "state",
            "transform" : [],
            "id" : "model_state",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "display_name" : "texts",
            "transform" : [],
            "type" : "string",
            "description" : "set of all literal values of all annotation assertions in model",
            "id" : "annotation_values",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "id" : "contributor",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "???.",
            "display_name" : "contributor",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "description" : "Last modified",
            "transform" : [],
            "display_name" : "modified",
            "type" : "string",
            "id" : "model_date",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "id" : "comments",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Comments",
            "display_name" : "comment",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "enabled_by",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "???",
            "display_name" : "Enabled by",
            "transform" : [],
            "type" : "string"
         },
         {
            "id" : "enabled_by_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Enabled by",
            "type" : "string",
            "transform" : [],
            "description" : "???",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "panther_family",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family_label",
            "description" : "PANTHER families that are associated with this entity.",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "GAF column 13 (taxon).",
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_label"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "transform" : []
         },
         {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "function_class",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Function acc/ID.",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string"
         },
         {
            "description" : "Common function name.",
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "id" : "function_class_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "description" : "???",
            "id" : "function_class_closure",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "???",
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "id" : "function_class_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "description" : "Process acc/ID.",
            "id" : "process_class",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "process_class_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "description" : "Common process name.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "process_class_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Process",
            "type" : "string",
            "description" : "???"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "process_class_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Process",
            "transform" : [],
            "description" : "???"
         },
         {
            "transform" : [],
            "display_name" : "Location",
            "type" : "string",
            "description" : "",
            "id" : "location_list",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "location_list_label",
            "display_name" : "Location",
            "transform" : [],
            "type" : "string",
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "multi",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "description" : "",
            "id" : "location_list_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         {
            "description" : "",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "location_list_closure_label",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "id" : "owl_blob_json",
            "description" : "???",
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Topology graph (JSON)",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "required" : "false",
            "property" : [],
            "indexed" : "false",
            "id" : "topology_graph_json"
         },
         {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "description" : "Evidence type.",
            "id" : "evidence_type",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "evidence_type_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "evidence_with",
            "description" : "Evidence with/from.",
            "display_name" : "Evidence with",
            "transform" : [],
            "type" : "string"
         },
         {
            "id" : "reference",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Reference",
            "type" : "string",
            "description" : "Database reference.",
            "cardinality" : "multi",
            "searchable" : "false"
         }
      ],
      "fields_hash" : {
         "annotation_unit_label" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation unit",
            "description" : "???.",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_unit_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "enabled_by" : {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "enabled_by",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "???",
            "display_name" : "Enabled by",
            "transform" : [],
            "type" : "string"
         },
         "function_class_closure" : {
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "description" : "???",
            "id" : "function_class_closure",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "function_class_label" : {
            "description" : "Common function name.",
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "id" : "function_class_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "taxon_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "transform" : []
         },
         "panther_family" : {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "panther_family",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family"
         },
         "enabled_by_label" : {
            "id" : "enabled_by_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Enabled by",
            "type" : "string",
            "transform" : [],
            "description" : "???",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "owl_blob_json" : {
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "id" : "owl_blob_json",
            "description" : "???",
            "display_name" : "???",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "cardinality" : "single"
         },
         "location_list_closure_label" : {
            "description" : "",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "location_list_closure_label",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "process_class_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "id" : "process_class_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Process",
            "type" : "string",
            "description" : "???"
         },
         "process_class_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "process_class_closure_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Process",
            "transform" : [],
            "description" : "???"
         },
         "model_date" : {
            "description" : "Last modified",
            "transform" : [],
            "display_name" : "modified",
            "type" : "string",
            "id" : "model_date",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "evidence_type" : {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "description" : "Evidence type.",
            "id" : "evidence_type",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "comments" : {
            "id" : "comments",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Comments",
            "display_name" : "comment",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "model_url" : {
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "model URL",
            "id" : "model_url",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "location_list_closure" : {
            "cardinality" : "multi",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "description" : "",
            "id" : "location_list_closure",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         "evidence_with" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "evidence_with",
            "description" : "Evidence with/from.",
            "display_name" : "Evidence with",
            "transform" : [],
            "type" : "string"
         },
         "process_class_label" : {
            "id" : "process_class_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "description" : "Common process name.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "annotation_values" : {
            "display_name" : "texts",
            "transform" : [],
            "type" : "string",
            "description" : "set of all literal values of all annotation assertions in model",
            "id" : "annotation_values",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "contributor" : {
            "id" : "contributor",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "???.",
            "display_name" : "contributor",
            "type" : "string",
            "transform" : [],
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "annotation_unit" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "???.",
            "transform" : [],
            "display_name" : "Annotation unit",
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_unit"
         },
         "topology_graph_json" : {
            "searchable" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Topology graph (JSON)",
            "description" : "JSON blob form of the local stepwise topology graph.",
            "required" : "false",
            "property" : [],
            "indexed" : "false",
            "id" : "topology_graph_json"
         },
         "reference" : {
            "id" : "reference",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Reference",
            "type" : "string",
            "description" : "Database reference.",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "function_class_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "???",
            "display_name" : "Function",
            "type" : "string",
            "transform" : [],
            "id" : "function_class_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "panther_family_label" : {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "panther_family_label",
            "description" : "PANTHER families that are associated with this entity.",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "location_list" : {
            "transform" : [],
            "display_name" : "Location",
            "type" : "string",
            "description" : "",
            "id" : "location_list",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "taxon_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_label"
         },
         "id" : {
            "id" : "id",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "ID",
            "transform" : [],
            "type" : "string",
            "description" : "A unique (and internal) thing.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "model" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "model",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "model"
         },
         "evidence_type_closure" : {
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "evidence_type_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "process_class" : {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "description" : "Process acc/ID.",
            "id" : "process_class",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "taxon" : {
            "cardinality" : "single",
            "searchable" : "false",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "GAF column 13 (taxon).",
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "taxon_closure_label" : {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "searchable" : "true",
            "cardinality" : "multi"
         },
         "function_class" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "function_class",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "Function acc/ID.",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string"
         },
         "model_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "model_label",
            "description" : "???.",
            "display_name" : "model",
            "transform" : [],
            "type" : "string"
         },
         "model_state" : {
            "description" : "???.",
            "type" : "string",
            "display_name" : "state",
            "transform" : [],
            "id" : "model_state",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "location_list_label" : {
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "location_list_label",
            "display_name" : "Location",
            "transform" : [],
            "type" : "string",
            "description" : "",
            "searchable" : "false",
            "cardinality" : "multi"
         }
      },
      "description" : "An individual unit within LEGO. This is <strong>ALPHA</strong> software.",
      "display_name" : "GO Models (ALPHA)",
      "document_category" : "model_annotation",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/model-ann-config.yaml",
      "id" : "model_annotation",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/model-ann-config.yaml"
   },
   "bbop_term_ac" : {
      "schema_generating" : "false",
      "result_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "searchable_extension" : "_searchable",
      "weight" : "-20",
      "_strict" : 0,
      "filter_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "boost_weights" : "annotation_class^5.0 annotation_class_label^5.0 synonym^1.0 alternate_id^1.0",
      "fields" : [
         {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "id",
            "description" : "Term acc/ID.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class",
            "type" : "string",
            "transform" : [],
            "display_name" : "Term",
            "description" : "Term acc/ID."
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "description" : "Common term name.",
            "id" : "annotation_class_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "id" : "synonym",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "description" : "Term synonyms.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "type" : "string",
            "display_name" : "Alt ID",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "alternate_id"
         }
      ],
      "fields_hash" : {
         "annotation_class_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "description" : "Common term name.",
            "id" : "annotation_class_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "synonym" : {
            "id" : "synonym",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "description" : "Term synonyms.",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "id" : {
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "id",
            "description" : "Term acc/ID.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "annotation_class" : {
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class",
            "type" : "string",
            "transform" : [],
            "display_name" : "Term",
            "description" : "Term acc/ID."
         },
         "alternate_id" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "type" : "string",
            "display_name" : "Alt ID",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "alternate_id"
         }
      },
      "display_name" : "Term autocomplete",
      "document_category" : "ontology_class",
      "description" : "Easily find ontology classes in GO. For personality only - not a schema configuration.",
      "id" : "bbop_term_ac",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/term-autocomplete-config.yaml",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/term-autocomplete-config.yaml"
   },
   "complex_annotation" : {
      "fields_hash" : {
         "annotation_group_url" : {
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_group_url",
            "type" : "string",
            "display_name" : "Annotation group URL",
            "transform" : [],
            "description" : "???."
         },
         "annotation_unit_label" : {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_unit_label",
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "enabled_by" : {
            "description" : "???",
            "transform" : [],
            "display_name" : "Enabled by",
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "enabled_by",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "function_class_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_closure",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string",
            "description" : "???"
         },
         "function_class_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "description" : "???",
            "id" : "function_class_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         "panther_family_label" : {
            "id" : "panther_family_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "annotation_group_label" : {
            "description" : "???.",
            "display_name" : "Annotation group",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_group_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "true"
         },
         "function_class_label" : {
            "description" : "Common function name.",
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "function_class_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "annotation_group" : {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_group",
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation group"
         },
         "location_list" : {
            "description" : "",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "id" : "location_list",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "taxon_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "taxon_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo."
         },
         "taxon_closure" : {
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "panther_family" : {
            "searchable" : "true",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER family IDs that are associated with this entity."
         },
         "enabled_by_label" : {
            "cardinality" : "single",
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Enabled by",
            "transform" : [],
            "description" : "???",
            "id" : "enabled_by_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         "id" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "ID",
            "transform" : [],
            "type" : "string",
            "description" : "A unique (and internal) thing."
         },
         "owl_blob_json" : {
            "description" : "???",
            "display_name" : "???",
            "transform" : [],
            "type" : "string",
            "id" : "owl_blob_json",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "false"
         },
         "location_list_closure_label" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "location_list_closure_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "description" : ""
         },
         "process_class" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Process acc/ID.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "process_class"
         },
         "process_class_closure_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "description" : "???",
            "id" : "process_class_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         "taxon" : {
            "description" : "GAF column 13 (taxon).",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "id" : "taxon",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "process_class_closure" : {
            "type" : "string",
            "display_name" : "Process",
            "transform" : [],
            "description" : "???",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "process_class_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "location_list_closure" : {
            "description" : "",
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "location_list_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "taxon_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "taxon_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo."
         },
         "function_class" : {
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "description" : "Function acc/ID.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "function_class",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "process_class_label" : {
            "description" : "Common process name.",
            "display_name" : "Process",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "process_class_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "location_list_label" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "location_list_label",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "description" : ""
         },
         "topology_graph_json" : {
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "required" : "false",
            "property" : [],
            "indexed" : "false",
            "id" : "topology_graph_json",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "annotation_unit" : {
            "description" : "???.",
            "display_name" : "Annotation unit",
            "transform" : [],
            "type" : "string",
            "id" : "annotation_unit",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "false"
         }
      },
      "fields" : [
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "id",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "ID",
            "transform" : [],
            "type" : "string",
            "description" : "A unique (and internal) thing."
         },
         {
            "description" : "???.",
            "display_name" : "Annotation unit",
            "transform" : [],
            "type" : "string",
            "id" : "annotation_unit",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_unit_label",
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "annotation_group",
            "description" : "???.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation group"
         },
         {
            "description" : "???.",
            "display_name" : "Annotation group",
            "type" : "string",
            "transform" : [],
            "id" : "annotation_group_label",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_group_url",
            "type" : "string",
            "display_name" : "Annotation group URL",
            "transform" : [],
            "description" : "???."
         },
         {
            "description" : "???",
            "transform" : [],
            "display_name" : "Enabled by",
            "type" : "string",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "enabled_by",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "type" : "string",
            "display_name" : "Enabled by",
            "transform" : [],
            "description" : "???",
            "id" : "enabled_by_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "panther_family",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER family IDs that are associated with this entity."
         },
         {
            "id" : "panther_family_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "transform" : [],
            "display_name" : "PANTHER family",
            "type" : "string",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "description" : "GAF column 13 (taxon).",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "id" : "taxon",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "id" : "taxon_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo."
         },
         {
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "taxon_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "id" : "taxon_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "type" : "string",
            "display_name" : "Taxon",
            "transform" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo."
         },
         {
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "description" : "Function acc/ID.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "function_class",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "description" : "Common function name.",
            "type" : "string",
            "display_name" : "Function",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "function_class_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "function_class_closure",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string",
            "description" : "???"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "description" : "???",
            "id" : "function_class_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Process acc/ID.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "process_class"
         },
         {
            "description" : "Common process name.",
            "display_name" : "Process",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "process_class_label",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "type" : "string",
            "display_name" : "Process",
            "transform" : [],
            "description" : "???",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "process_class_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "description" : "???",
            "id" : "process_class_closure_label",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "cardinality" : "multi",
            "searchable" : "true"
         },
         {
            "description" : "",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "id" : "location_list",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "location_list_label",
            "type" : "string",
            "display_name" : "Location",
            "transform" : [],
            "description" : ""
         },
         {
            "description" : "",
            "display_name" : "Location",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "location_list_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "location_list_closure_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "description" : ""
         },
         {
            "description" : "???",
            "display_name" : "???",
            "transform" : [],
            "type" : "string",
            "id" : "owl_blob_json",
            "indexed" : "false",
            "required" : "false",
            "property" : [],
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "type" : "string",
            "display_name" : "Topology graph (JSON)",
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "required" : "false",
            "property" : [],
            "indexed" : "false",
            "id" : "topology_graph_json",
            "searchable" : "false",
            "cardinality" : "single"
         }
      ],
      "description" : "An individual unit within LEGO. This is <strong>ALPHA</strong> software.",
      "document_category" : "complex_annotation",
      "display_name" : "Complex annotations (ALPHA)",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/complex-ann-config.yaml",
      "id" : "complex_annotation",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/complex-ann-config.yaml",
      "schema_generating" : "true",
      "filter_weights" : "annotation_group_label^5.0 enabled_by_label^4.5 location_list_closure_label^4.0 process_class_closure_label^3.0 function_class_closure_label^2.0",
      "_strict" : 0,
      "weight" : "-5",
      "searchable_extension" : "_searchable",
      "result_weights" : "function_class^5.0 enabled_by^4.0 location_list^3.0 process_class^2.0 annotation_group^1.0",
      "boost_weights" : "annotation_group_label^1.0 annotation_unit_label^1.0 enabled_by^1.0 enabled_by_label^1.0 location_list_closure^1.0 location_list_closure_label^1.0 process_class_closure_label^1.0 function_class_closure_label^1.0"
   },
   "ontology" : {
      "schema_generating" : "true",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "_strict" : 0,
      "filter_weights" : "source^4.0 subset^3.0 regulates_closure_label^1.0 is_obsolete^0.0",
      "weight" : "40",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0",
      "searchable_extension" : "_searchable",
      "description" : "Gene Ontology Term, Synonym, or Definition.",
      "document_category" : "ontology_class",
      "display_name" : "Ontology",
      "fields" : [
         {
            "description" : "Term identifier.",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "id" : "id",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "annotation_class",
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "description" : "Term identifier.",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getDef"
            ],
            "id" : "description",
            "description" : "Term definition.",
            "display_name" : "Definition",
            "type" : "string",
            "transform" : []
         },
         {
            "id" : "source",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ],
            "required" : "false",
            "description" : "Term namespace.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ontology source",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "is_obsolete",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "transform" : [],
            "display_name" : "Obsoletion",
            "type" : "boolean"
         },
         {
            "indexed" : "true",
            "property" : [
               "getComment"
            ],
            "required" : "false",
            "id" : "comment",
            "description" : "Term comment.",
            "transform" : [],
            "display_name" : "Comment",
            "type" : "string",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Term synonyms.",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "id" : "synonym",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "alternate_id",
            "type" : "string",
            "display_name" : "Alt ID",
            "transform" : [],
            "description" : "Alternate term identifier."
         },
         {
            "description" : "Term that replaces this term.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Replaced By",
            "id" : "replaced_by",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "indexed" : "true",
            "id" : "consider",
            "transform" : [],
            "display_name" : "Consider",
            "type" : "string",
            "description" : "Others terms you might want to look at.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Subset",
            "description" : "Special use collections of terms.",
            "property" : [
               "getSubsets"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "subset",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "property" : [
               "getDefXref"
            ],
            "required" : "false",
            "id" : "definition_xref",
            "description" : "Definition cross-reference.",
            "transform" : [],
            "display_name" : "Def xref",
            "type" : "string",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "description" : "Database cross-reference.",
            "required" : "false",
            "property" : [
               "getXref"
            ],
            "indexed" : "true",
            "id" : "database_xref"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "isa_partof_closure",
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "transform" : [],
            "description" : "Ancestral terms (is_a/part_of)."
         },
         {
            "searchable" : "true",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         {
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ancestor",
            "indexed" : "true",
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
            "id" : "regulates_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "display_name" : "Ancestor",
            "transform" : [],
            "type" : "string",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "id" : "regulates_closure_label",
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
            "indexed" : "true"
         },
         {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "topology_graph_json",
            "indexed" : "false",
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
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "type" : "string",
            "transform" : [],
            "display_name" : "Topology graph (JSON)"
         },
         {
            "id" : "regulates_transitivity_graph_json",
            "required" : "false",
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
            "indexed" : "false",
            "type" : "string",
            "display_name" : "Regulates transitivity graph (JSON)",
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "description" : "Only in taxon.",
            "display_name" : "Only in taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "id" : "only_in_taxon",
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getLabel"
            ],
            "id" : "only_in_taxon_label",
            "description" : "Only in taxon label.",
            "type" : "string",
            "display_name" : "Only in taxon",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single"
         },
         {
            "id" : "only_in_taxon_closure",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "required" : "false",
            "description" : "Only in taxon closure.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure_label",
            "description" : "Only in taxon label closure.",
            "type" : "string",
            "display_name" : "Only in taxon",
            "transform" : []
         }
      ],
      "fields_hash" : {
         "subset" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Subset",
            "description" : "Special use collections of terms.",
            "property" : [
               "getSubsets"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "subset",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "consider" : {
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "indexed" : "true",
            "id" : "consider",
            "transform" : [],
            "display_name" : "Consider",
            "type" : "string",
            "description" : "Others terms you might want to look at.",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "id" : {
            "description" : "Term identifier.",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "id" : "id",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "regulates_closure" : {
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ancestor",
            "indexed" : "true",
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
            "id" : "regulates_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "description" : {
            "searchable" : "true",
            "cardinality" : "single",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getDef"
            ],
            "id" : "description",
            "description" : "Term definition.",
            "display_name" : "Definition",
            "type" : "string",
            "transform" : []
         },
         "only_in_taxon_label" : {
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getLabel"
            ],
            "id" : "only_in_taxon_label",
            "description" : "Only in taxon label.",
            "type" : "string",
            "display_name" : "Only in taxon",
            "transform" : [],
            "searchable" : "true",
            "cardinality" : "single"
         },
         "regulates_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "display_name" : "Ancestor",
            "transform" : [],
            "type" : "string",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "id" : "regulates_closure_label",
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
            "indexed" : "true"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "transform" : [],
            "display_name" : "Term",
            "type" : "string",
            "description" : "Identifier.",
            "property" : [
               "getLabel"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         "isa_partof_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "isa_partof_closure",
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "transform" : [],
            "description" : "Ancestral terms (is_a/part_of)."
         },
         "definition_xref" : {
            "indexed" : "true",
            "property" : [
               "getDefXref"
            ],
            "required" : "false",
            "id" : "definition_xref",
            "description" : "Definition cross-reference.",
            "transform" : [],
            "display_name" : "Def xref",
            "type" : "string",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         "replaced_by" : {
            "description" : "Term that replaces this term.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Replaced By",
            "id" : "replaced_by",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "source" : {
            "id" : "source",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ],
            "required" : "false",
            "description" : "Term namespace.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ontology source",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "isa_partof_closure_label" : {
            "searchable" : "true",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "id" : "isa_partof_closure_label",
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "description" : "Ancestral terms (is_a/part_of)."
         },
         "alternate_id" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "required" : "false",
            "indexed" : "true",
            "id" : "alternate_id",
            "type" : "string",
            "display_name" : "Alt ID",
            "transform" : [],
            "description" : "Alternate term identifier."
         },
         "topology_graph_json" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "topology_graph_json",
            "indexed" : "false",
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
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "type" : "string",
            "transform" : [],
            "display_name" : "Topology graph (JSON)"
         },
         "is_obsolete" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "is_obsolete",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "description" : "Is the term obsolete?",
            "transform" : [],
            "display_name" : "Obsoletion",
            "type" : "boolean"
         },
         "synonym" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Term synonyms.",
            "transform" : [],
            "display_name" : "Synonyms",
            "type" : "string",
            "id" : "synonym",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         "annotation_class" : {
            "cardinality" : "single",
            "searchable" : "false",
            "id" : "annotation_class",
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "required" : "false",
            "description" : "Term identifier.",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string"
         },
         "only_in_taxon" : {
            "description" : "Only in taxon.",
            "display_name" : "Only in taxon",
            "type" : "string",
            "transform" : [],
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "id" : "only_in_taxon",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "only_in_taxon_closure" : {
            "id" : "only_in_taxon_closure",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "required" : "false",
            "description" : "Only in taxon closure.",
            "transform" : [],
            "type" : "string",
            "display_name" : "Only in taxon (IDs)",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "database_xref" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "transform" : [],
            "display_name" : "DB xref",
            "type" : "string",
            "description" : "Database cross-reference.",
            "required" : "false",
            "property" : [
               "getXref"
            ],
            "indexed" : "true",
            "id" : "database_xref"
         },
         "only_in_taxon_closure_label" : {
            "searchable" : "true",
            "cardinality" : "multi",
            "indexed" : "true",
            "required" : "false",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure_label",
            "description" : "Only in taxon label closure.",
            "type" : "string",
            "display_name" : "Only in taxon",
            "transform" : []
         },
         "comment" : {
            "indexed" : "true",
            "property" : [
               "getComment"
            ],
            "required" : "false",
            "id" : "comment",
            "description" : "Term comment.",
            "transform" : [],
            "display_name" : "Comment",
            "type" : "string",
            "searchable" : "true",
            "cardinality" : "single"
         },
         "regulates_transitivity_graph_json" : {
            "id" : "regulates_transitivity_graph_json",
            "required" : "false",
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
            "indexed" : "false",
            "type" : "string",
            "display_name" : "Regulates transitivity graph (JSON)",
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "cardinality" : "single",
            "searchable" : "false"
         }
      },
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/ont-config.yaml",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/ont-config.yaml",
      "id" : "ontology"
   },
   "bbop_ann_ev_agg" : {
      "fields_hash" : {
         "annotation_class" : {
            "transform" : [],
            "display_name" : "Annotation class",
            "type" : "string",
            "description" : "Column 5.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class",
            "searchable" : "false",
            "cardinality" : "single"
         },
         "id" : {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Gene/product ID.",
            "transform" : [],
            "display_name" : "Acc",
            "type" : "string",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "id"
         },
         "taxon_closure" : {
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo."
         },
         "taxon_label" : {
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "id" : "taxon_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "taxon_closure_label" : {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         "evidence_with" : {
            "id" : "evidence_with",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "All column 8s for this term/gene product pair",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence with",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation class label",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         "panther_family" : {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "type" : "string",
            "transform" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         "taxon" : {
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "description" : "Column 13: taxon.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         "panther_family_label" : {
            "id" : "panther_family_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Family",
            "transform" : [],
            "type" : "string",
            "description" : "Families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "bioentity" : {
            "searchable" : "false",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "display_name" : "Gene/product ID",
            "type" : "string",
            "transform" : [],
            "description" : "Column 1 + columns 2."
         },
         "bioentity_label" : {
            "description" : "Column 3.",
            "display_name" : "Gene/product label",
            "transform" : [],
            "type" : "string",
            "id" : "bioentity_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         "evidence_type_closure" : {
            "description" : "All evidence for this term/gene product pair",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence type",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "evidence_type_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         }
      },
      "fields" : [
         {
            "searchable" : "false",
            "cardinality" : "single",
            "description" : "Gene/product ID.",
            "transform" : [],
            "display_name" : "Acc",
            "type" : "string",
            "indexed" : "true",
            "required" : "false",
            "property" : [],
            "id" : "id"
         },
         {
            "searchable" : "false",
            "cardinality" : "single",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "display_name" : "Gene/product ID",
            "type" : "string",
            "transform" : [],
            "description" : "Column 1 + columns 2."
         },
         {
            "description" : "Column 3.",
            "display_name" : "Gene/product label",
            "transform" : [],
            "type" : "string",
            "id" : "bioentity_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "transform" : [],
            "display_name" : "Annotation class",
            "type" : "string",
            "description" : "Column 5.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class",
            "searchable" : "false",
            "cardinality" : "single"
         },
         {
            "searchable" : "true",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation class label",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "annotation_class_label"
         },
         {
            "description" : "All evidence for this term/gene product pair",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence type",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "id" : "evidence_type_closure",
            "searchable" : "false",
            "cardinality" : "multi"
         },
         {
            "id" : "evidence_with",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "description" : "All column 8s for this term/gene product pair",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence with",
            "cardinality" : "multi",
            "searchable" : "false"
         },
         {
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "description" : "Column 13: taxon.",
            "cardinality" : "single",
            "searchable" : "false"
         },
         {
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "id" : "taxon_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false",
            "cardinality" : "single",
            "searchable" : "true"
         },
         {
            "searchable" : "false",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "indexed" : "true",
            "id" : "taxon_closure",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon (IDs)",
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo."
         },
         {
            "cardinality" : "multi",
            "searchable" : "true",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "property" : [],
            "required" : "false"
         },
         {
            "cardinality" : "single",
            "searchable" : "true",
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Protein family",
            "type" : "string",
            "transform" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "required" : "false",
            "property" : []
         },
         {
            "id" : "panther_family_label",
            "property" : [],
            "required" : "false",
            "indexed" : "true",
            "display_name" : "Family",
            "transform" : [],
            "type" : "string",
            "description" : "Families that are associated with this entity.",
            "cardinality" : "single",
            "searchable" : "true"
         }
      ],
      "display_name" : "Advanced",
      "document_category" : "annotation_evidence_aggregate",
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "id" : "bbop_ann_ev_agg",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata/ann_ev_agg-config.yaml",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata/ann_ev_agg-config.yaml",
      "schema_generating" : "true",
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "searchable_extension" : "_searchable",
      "_strict" : 0,
      "weight" : "-10",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0"
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
    var meta_data = {"sources":[],"golr_base":"http://localhost:8080/solr/","term_regexp":"all|GO:[0-9]{7}","js_base":"http://localhost:9999/static/js","html_base":"http://localhost:9999/static","galaxy_base":"http://galaxy.berkeleybop.org/","ontologies":[],"image_base":"http://localhost:9999/static/images","species_map":{},"species":[],"evidence_codes":{},"gp_types":[],"bbop_img_star":"http://localhost:9999/static/images/star.png","css_base":"http://localhost:9999/static/css","app_base":"http://localhost:9999","js_dev_base":"http://localhost:9999/static/staging","beta":"1"};

    ///
    /// Break out the data and various functions to access them...
    ///

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
   "uniprot" : {
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org",
      "database" : "Universal Protein Knowledgebase",
      "fullname" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "name" : "Universal Protein Knowledgebase",
      "datatype" : "protein",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "example_id" : "UniProtKB:P51587",
      "abbreviation" : "UniProt",
      "object" : "protein",
      "id" : "UniProtKB"
   },
   "gr_gene" : {
      "example_id" : "GR_GENE:GR:0060198",
      "abbreviation" : "GR_gene",
      "object" : "entity",
      "id" : "GR_GENE",
      "uri_prefix" : null,
      "generic_url" : "http://www.gramene.org/",
      "url_example" : "http://www.gramene.org/db/genes/search_gene?acc=GR:0060198",
      "database" : "Gramene",
      "fullname" : null,
      "name" : "Gramene",
      "datatype" : "entity",
      "url_syntax" : "http://www.gramene.org/db/genes/search_gene?acc=[example_id]"
   },
   "sgdid" : {
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "uri_prefix" : null,
      "generic_url" : "http://www.yeastgenome.org/",
      "database" : "Saccharomyces Genome Database",
      "fullname" : null,
      "name" : "Saccharomyces Genome Database",
      "datatype" : "gene",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview",
      "example_id" : "SGD:S000006169",
      "abbreviation" : "SGDID",
      "object" : "gene",
      "id" : "SGD"
   },
   "cog_cluster" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=[example_id]",
      "name" : "NCBI COG cluster",
      "database" : "NCBI COG cluster",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=COG0001",
      "id" : "COG_Cluster",
      "object" : "entity",
      "abbreviation" : "COG_Cluster",
      "example_id" : "COG_Cluster:COG0001"
   },
   "patric" : {
      "id" : "PATRIC",
      "object" : "entity",
      "abbreviation" : "PATRIC",
      "example_id" : "PATRIC:cds.000002.436951",
      "url_syntax" : "http://patric.vbi.vt.edu/gene/overview.php?fid=[example_id]",
      "datatype" : "entity",
      "name" : "PathoSystems Resource Integration Center",
      "database" : "PathoSystems Resource Integration Center",
      "fullname" : "PathoSystems Resource Integration Center at the Virginia Bioinformatics Institute",
      "url_example" : "http://patric.vbi.vt.edu/gene/overview.php?fid=cds.000002.436951",
      "uri_prefix" : null,
      "generic_url" : "http://patric.vbi.vt.edu"
   },
   "mim" : {
      "object" : "entity",
      "id" : "OMIM",
      "example_id" : "OMIM:190198",
      "abbreviation" : "MIM",
      "name" : "Mendelian Inheritance in Man",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "datatype" : "entity",
      "url_example" : "http://omim.org/entry/190198",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "database" : "Mendelian Inheritance in Man",
      "fullname" : null
   },
   "sp_sl" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org/locations/",
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "fullname" : null,
      "name" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "datatype" : "entity",
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "abbreviation" : "SP_SL",
      "object" : "entity",
      "id" : "UniProtKB-SubCell"
   },
   "ecogene_g" : {
      "object" : "entity",
      "id" : "ECOGENE_G",
      "example_id" : "ECOGENE_G:deoC",
      "abbreviation" : "ECOGENE_G",
      "name" : "EcoGene Database of Escherichia coli Sequence and Function",
      "datatype" : "entity",
      "url_syntax" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ecogene.org/",
      "fullname" : null,
      "database" : "EcoGene Database of Escherichia coli Sequence and Function"
   },
   "smd" : {
      "fullname" : null,
      "database" : "Stanford Microarray Database",
      "uri_prefix" : null,
      "generic_url" : "http://genome-www.stanford.edu/microarray",
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Stanford Microarray Database",
      "abbreviation" : "SMD",
      "example_id" : null,
      "id" : "SMD",
      "object" : "entity"
   },
   "jcvi_egad" : {
      "database" : "JCVI CMR Egad",
      "fullname" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "uri_prefix" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "datatype" : "entity",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "name" : "JCVI CMR Egad",
      "abbreviation" : "JCVI_EGAD",
      "example_id" : "JCVI_EGAD:74462",
      "id" : "JCVI_EGAD",
      "object" : "entity"
   },
   "gr" : {
      "url_syntax" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=[example_id]",
      "datatype" : "protein",
      "name" : "Gramene",
      "database" : "Gramene",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=sd1",
      "generic_url" : "http://www.gramene.org/",
      "id" : "GR",
      "object" : "protein",
      "abbreviation" : "GR",
      "example_id" : "GR:sd1"
   },
   "wormbase" : {
      "object" : "protein",
      "id" : "WB",
      "example_id" : "WB:WBGene00003001",
      "abbreviation" : "WormBase",
      "name" : "WormBase database of nematode biology",
      "datatype" : "protein",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase database of nematode biology",
      "fullname" : null
   },
   "img" : {
      "example_id" : "IMG:640008772",
      "abbreviation" : "IMG",
      "object" : "entity",
      "id" : "IMG",
      "url_example" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=640008772",
      "uri_prefix" : null,
      "generic_url" : "http://img.jgi.doe.gov",
      "database" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "fullname" : null,
      "name" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "url_syntax" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=[example_id]",
      "datatype" : "entity"
   },
   "pubmed" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "name" : "PubMed",
      "database" : "PubMed",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "id" : "PMID",
      "object" : "entity",
      "abbreviation" : "PubMed",
      "example_id" : "PMID:4208797"
   },
   "sp_kw" : {
      "database" : "UniProt Knowledgebase keywords",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "generic_url" : "http://www.uniprot.org/keywords/",
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "datatype" : "entity",
      "name" : "UniProt Knowledgebase keywords",
      "abbreviation" : "SP_KW",
      "example_id" : "UniProtKB-KW:KW-0812",
      "id" : "UniProtKB-KW",
      "object" : "entity"
   },
   "cog" : {
      "abbreviation" : "COG",
      "example_id" : null,
      "id" : "COG",
      "object" : "entity",
      "fullname" : null,
      "database" : "NCBI Clusters of Orthologous Groups",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "uri_prefix" : null,
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "NCBI Clusters of Orthologous Groups"
   },
   "kegg_enzyme" : {
      "generic_url" : "http://www.genome.jp/dbget-bin/www_bfind?enzyme",
      "uri_prefix" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?ec:2.1.1.4",
      "database" : "KEGG Enzyme Database",
      "fullname" : null,
      "name" : "KEGG Enzyme Database",
      "datatype" : "entity",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?ec:[example_id]",
      "example_id" : "KEGG_ENZYME:2.1.1.4",
      "abbreviation" : "KEGG_ENZYME",
      "object" : "entity",
      "id" : "KEGG_ENZYME"
   },
   "um-bbd_ruleid" : {
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=[example_id]",
      "datatype" : "entity",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=bt0330",
      "id" : "UM-BBD_ruleID",
      "object" : "entity",
      "abbreviation" : "UM-BBD_ruleID",
      "example_id" : "UM-BBD_ruleID:bt0330"
   },
   "reac" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "name" : "Reactome - a curated knowledgebase of biological pathways",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "fullname" : null,
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "uri_prefix" : null,
      "generic_url" : "http://www.reactome.org/",
      "id" : "Reactome",
      "object" : "entity",
      "abbreviation" : "REAC",
      "example_id" : "Reactome:REACT_604"
   },
   "uberon" : {
      "datatype" : "anatomical entity",
      "url_syntax" : "http://purl.obolibrary.org/obo/UBERON_[example_id]",
      "name" : "Uber-anatomy ontology",
      "database" : "Uber-anatomy ontology",
      "fullname" : "A multi-species anatomy ontology",
      "uri_prefix" : null,
      "url_example" : "http://purl.obolibrary.org/obo/UBERON_0002398",
      "generic_url" : "http://uberon.org",
      "id" : "UBERON",
      "object" : "anatomical entity",
      "abbreviation" : "UBERON",
      "example_id" : "URBERON:0002398"
   },
   "pdb" : {
      "id" : "PDB",
      "object" : "protein",
      "abbreviation" : "PDB",
      "example_id" : "PDB:1A4U",
      "datatype" : "protein",
      "url_syntax" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=[example_id]",
      "name" : "Protein Data Bank",
      "database" : "Protein Data Bank",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=1A4U",
      "generic_url" : "http://www.rcsb.org/pdb/"
   },
   "sgn" : {
      "generic_url" : "http://www.sgn.cornell.edu/",
      "uri_prefix" : null,
      "url_example" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=4476",
      "database" : "Sol Genomics Network",
      "fullname" : null,
      "name" : "Sol Genomics Network",
      "url_syntax" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=[example_id]",
      "datatype" : "gene",
      "example_id" : "SGN:4476",
      "abbreviation" : "SGN",
      "object" : "gene",
      "id" : "SGN"
   },
   "h-invdb_locus" : {
      "abbreviation" : "H-invDB_locus",
      "example_id" : "H-invDB_locus:HIX0014446",
      "id" : "H-invDB_locus",
      "object" : "entity",
      "database" : "H-invitational Database",
      "fullname" : null,
      "generic_url" : "http://www.h-invitational.jp/",
      "uri_prefix" : null,
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=HIX0014446",
      "datatype" : "entity",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=[example_id]",
      "name" : "H-invitational Database"
   },
   "pfam" : {
      "datatype" : "polypeptide region",
      "url_syntax" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?[example_id]",
      "name" : "Pfam database of protein families",
      "fullname" : "Pfam is a collection of protein families represented by sequence alignments and hidden Markov models (HMMs)",
      "database" : "Pfam database of protein families",
      "uri_prefix" : null,
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "url_example" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?PF00046",
      "id" : "Pfam",
      "object" : "polypeptide region",
      "abbreviation" : "Pfam",
      "example_id" : "Pfam:PF00046"
   },
   "vbrc" : {
      "id" : "VBRC",
      "object" : "entity",
      "abbreviation" : "VBRC",
      "example_id" : "VBRC:F35742",
      "datatype" : "entity",
      "url_syntax" : "http://vbrc.org/query.asp?web_id=VBRC:[example_id]",
      "name" : "Viral Bioinformatics Resource Center",
      "fullname" : null,
      "database" : "Viral Bioinformatics Resource Center",
      "generic_url" : "http://vbrc.org",
      "uri_prefix" : null,
      "url_example" : "http://vbrc.org/query.asp?web_id=VBRC:F35742"
   },
   "sgd_ref" : {
      "name" : "Saccharomyces Genome Database",
      "datatype" : "entity",
      "url_syntax" : "http://www.yeastgenome.org/reference/[example_is]/overview",
      "uri_prefix" : null,
      "url_example" : "http://www.yeastgenome.org/reference/S000049602/overview",
      "generic_url" : "http://www.yeastgenome.org/",
      "database" : "Saccharomyces Genome Database",
      "fullname" : null,
      "object" : "entity",
      "id" : "SGD_REF",
      "example_id" : "SGD_REF:S000049602",
      "abbreviation" : "SGD_REF"
   },
   "mgd" : {
      "name" : "Mouse Genome Database",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.informatics.jax.org/",
      "database" : "Mouse Genome Database",
      "fullname" : null,
      "object" : "entity",
      "id" : "MGD",
      "example_id" : "MGD:Adcy9",
      "abbreviation" : "MGD"
   },
   "genedb" : {
      "abbreviation" : "GeneDB",
      "example_id" : "PF3D7_1467300",
      "id" : "GeneDB",
      "object" : "gene",
      "database" : "GeneDB",
      "fullname" : null,
      "url_example" : "http://www.genedb.org/gene/PF3D7_1467300",
      "uri_prefix" : null,
      "generic_url" : "http://www.genedb.org/gene/",
      "datatype" : "gene",
      "url_syntax" : "http://www.genedb.org/gene/[example_id]",
      "name" : "GeneDB"
   },
   "spd" : {
      "abbreviation" : "SPD",
      "example_id" : "SPD:05/05F01",
      "id" : "SPD",
      "object" : "entity",
      "database" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.riken.jp/SPD/",
      "url_example" : "http://www.riken.jp/SPD/05/05F01.html",
      "url_syntax" : "http://www.riken.jp/SPD/[example_id].html",
      "datatype" : "entity",
      "name" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data"
   },
   "pfamb" : {
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Pfam-B supplement to Pfam",
      "database" : "Pfam-B supplement to Pfam",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "id" : "PfamB",
      "object" : "entity",
      "abbreviation" : "PfamB",
      "example_id" : "PfamB:PB014624"
   },
   "prow" : {
      "object" : "entity",
      "id" : "PROW",
      "example_id" : null,
      "abbreviation" : "PROW",
      "name" : "Protein Reviews on the Web",
      "url_syntax" : null,
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/prow/",
      "url_example" : null,
      "database" : "Protein Reviews on the Web",
      "fullname" : null
   },
   "biomdid" : {
      "id" : "BIOMD",
      "object" : "entity",
      "abbreviation" : "BIOMDID",
      "example_id" : "BIOMD:BIOMD0000000045",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "datatype" : "entity",
      "name" : "BioModels Database",
      "database" : "BioModels Database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/"
   },
   "po" : {
      "datatype" : "plant structure development stage",
      "url_syntax" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:[example_id]",
      "name" : "Plant Ontology Consortium Database",
      "fullname" : null,
      "database" : "Plant Ontology Consortium Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.plantontology.org/",
      "url_example" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:0009004",
      "id" : "PO",
      "object" : "plant structure development stage",
      "abbreviation" : "PO",
      "example_id" : "PO:0009004"
   },
   "multifun" : {
      "generic_url" : "http://genprotec.mbl.edu/files/MultiFun.html",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "MultiFun cell function assignment schema",
      "fullname" : null,
      "name" : "MultiFun cell function assignment schema",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "MultiFun",
      "object" : "entity",
      "id" : "MultiFun"
   },
   "mitre" : {
      "database" : "The MITRE Corporation",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.mitre.org/",
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "The MITRE Corporation",
      "abbreviation" : "MITRE",
      "example_id" : null,
      "id" : "MITRE",
      "object" : "entity"
   },
   "cog_pathway" : {
      "database" : "NCBI COG pathway",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=14",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=[example_id]",
      "datatype" : "entity",
      "name" : "NCBI COG pathway",
      "abbreviation" : "COG_Pathway",
      "example_id" : "COG_Pathway:14",
      "id" : "COG_Pathway",
      "object" : "entity"
   },
   "bfo" : {
      "id" : "BFO",
      "object" : "entity",
      "abbreviation" : "BFO",
      "example_id" : "BFO:0000066",
      "url_syntax" : "http://purl.obolibrary.org/obo/BFO_[example_id]",
      "datatype" : "entity",
      "name" : "Basic Formal Ontology",
      "database" : "Basic Formal Ontology",
      "fullname" : "An upper ontology used by Open Bio Ontologies (OBO) Foundry. BFO contains upper-level classes as well as core relations such as part_of (BFO_0000050)",
      "generic_url" : "http://purl.obolibrary.org/obo/bfo",
      "uri_prefix" : null,
      "url_example" : "http://purl.obolibrary.org/obo/BFO_0000066"
   },
   "pombase" : {
      "id" : "PomBase",
      "object" : "gene",
      "abbreviation" : "PomBase",
      "example_id" : "PomBase:SPBC11B10.09",
      "datatype" : "gene",
      "url_syntax" : "http://www.pombase.org/spombe/result/[example_id]",
      "name" : "PomBase",
      "database" : "PomBase",
      "fullname" : null,
      "generic_url" : "http://www.pombase.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.pombase.org/spombe/result/SPBC11B10.09"
   },
   "genbank" : {
      "example_id" : "GB:AA816246",
      "abbreviation" : "GenBank",
      "object" : "protein",
      "id" : "GenBank",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "database" : "GenBank",
      "fullname" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "name" : "GenBank",
      "datatype" : "protein",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]"
   },
   "unigene" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=[organism_abbreviation]&CID=[cluster_id]",
      "name" : "UniGene",
      "database" : "UniGene",
      "fullname" : "NCBI transcript cluster database, organized by transcriptome. Each UniGene entry is a set of transcript sequences that appear to come from the same transcription locus (gene or expressed pseudogene).",
      "url_example" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=Hs&CID=212293",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/UniGene",
      "id" : "UniGene",
      "object" : "entity",
      "abbreviation" : "UniGene",
      "example_id" : "UniGene:Hs.212293"
   },
   "goc" : {
      "name" : "Gene Ontology Consortium",
      "url_syntax" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.geneontology.org/",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "Gene Ontology Consortium",
      "fullname" : null,
      "object" : "entity",
      "id" : "GOC",
      "example_id" : null,
      "abbreviation" : "GOC"
   },
   "biosis" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.biosis.org/",
      "fullname" : null,
      "database" : "BIOSIS previews",
      "name" : "BIOSIS previews",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : "BIOSIS:200200247281",
      "abbreviation" : "BIOSIS",
      "object" : "entity",
      "id" : "BIOSIS"
   },
   "jcvi" : {
      "id" : "JCVI",
      "object" : "entity",
      "abbreviation" : "JCVI",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "J. Craig Venter Institute",
      "fullname" : null,
      "database" : "J. Craig Venter Institute",
      "generic_url" : "http://www.jcvi.org/",
      "uri_prefix" : null,
      "url_example" : null
   },
   "unipathway" : {
      "object" : "biological_process",
      "id" : "UniPathway",
      "example_id" : "UniPathway:UPA00155",
      "abbreviation" : "UniPathway",
      "name" : "UniPathway",
      "datatype" : "biological_process",
      "url_syntax" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=[example_id]",
      "generic_url" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway",
      "uri_prefix" : null,
      "url_example" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=UPA00155",
      "fullname" : "UniPathway is a a metabolic door to UniProtKB/Swiss-Prot, a curated resource of metabolic pathways for the UniProtKB/Swiss-Prot knowledgebase.",
      "database" : "UniPathway"
   },
   "ro" : {
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "uri_prefix" : null,
      "url_example" : "http://purl.obolibrary.org/obo/RO_0002211",
      "database" : "OBO Relation Ontology Ontology",
      "fullname" : "A collection of relations used across OBO ontologies",
      "name" : "OBO Relation Ontology Ontology",
      "datatype" : "entity",
      "url_syntax" : "http://purl.obolibrary.org/obo/RO_[example_id]",
      "example_id" : "RO:0002211",
      "abbreviation" : "RO",
      "object" : "entity",
      "id" : "RO"
   },
   "go_central" : {
      "database" : "GO Central",
      "fullname" : "Manual annotation from PAINT curators into the UniProt Protein2GO curation tool.",
      "uri_prefix" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "GO Central",
      "abbreviation" : "GO_Central",
      "example_id" : null,
      "id" : "GO_Central",
      "object" : "entity"
   },
   "tair" : {
      "database" : "The Arabidopsis Information Resource",
      "fullname" : null,
      "generic_url" : "http://www.arabidopsis.org/",
      "uri_prefix" : null,
      "url_example" : "http://arabidopsis.org/servlets/TairObject?accession=locus:2146653",
      "datatype" : "primary transcript",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?accession=[example_id]",
      "name" : "The Arabidopsis Information Resource",
      "abbreviation" : "TAIR",
      "example_id" : "TAIR:locus:2146653",
      "id" : "TAIR",
      "object" : "primary transcript"
   },
   "jcvi_medtr" : {
      "uri_prefix" : null,
      "url_example" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=Medtr5g024510",
      "generic_url" : "http://medicago.jcvi.org/cgi-bin/medicago/overview.cgi",
      "database" : "Medicago truncatula genome database at the J. Craig Venter Institute",
      "fullname" : null,
      "name" : "Medicago truncatula genome database at the J. Craig Venter Institute",
      "datatype" : "entity",
      "url_syntax" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=[example_id]",
      "example_id" : "JCVI_Medtr:Medtr5g024510",
      "abbreviation" : "JCVI_Medtr",
      "object" : "entity",
      "id" : "JCVI_Medtr"
   },
   "tigr_tigrfams" : {
      "id" : "JCVI_TIGRFAMS",
      "object" : "polypeptide region",
      "abbreviation" : "TIGR_TIGRFAMS",
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "datatype" : "polypeptide region",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "name" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "generic_url" : "http://search.jcvi.org/"
   },
   "ipr" : {
      "abbreviation" : "IPR",
      "example_id" : "InterPro:IPR000001",
      "id" : "InterPro",
      "object" : "polypeptide region",
      "database" : "InterPro database of protein domains and motifs",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "datatype" : "polypeptide region",
      "name" : "InterPro database of protein domains and motifs"
   },
   "mesh" : {
      "url_syntax" : "http://www.nlm.nih.gov/cgi/mesh/2015/MB_cgi?view=expanded&field=uid&term=[example_id]",
      "datatype" : "entity",
      "name" : "Medical Subject Headings",
      "database" : "Medical Subject Headings",
      "fullname" : null,
      "url_example" : "http://www.nlm.nih.gov/cgi/mesh/2015/MB_cgi?view=expanded&field=uid&term=D017209",
      "uri_prefix" : null,
      "generic_url" : "https://www.nlm.nih.gov/mesh/MBrowser.html",
      "id" : "MeSH",
      "object" : "entity",
      "abbreviation" : "MeSH",
      "example_id" : "MeSH:D017209"
   },
   "ecogene" : {
      "object" : "gene",
      "id" : "ECOGENE",
      "example_id" : "ECOGENE:EG10818",
      "abbreviation" : "ECOGENE",
      "name" : "EcoGene Database of Escherichia coli Sequence and Function",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eg_id=[example_id]",
      "datatype" : "gene",
      "uri_prefix" : null,
      "generic_url" : "http://www.ecogene.org/",
      "url_example" : "http://www.ecogene.org/geneInfo.php?eg_id=EG10818",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "fullname" : null
   },
   "go_ref" : {
      "abbreviation" : "GO_REF",
      "example_id" : "GO_REF:0000001",
      "id" : "GO_REF",
      "object" : "entity",
      "database" : "Gene Ontology Database references",
      "fullname" : null,
      "generic_url" : "http://www.geneontology.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:0000001",
      "datatype" : "entity",
      "url_syntax" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:[example_id]",
      "name" : "Gene Ontology Database references"
   },
   "agi_locuscode" : {
      "example_id" : "AGI_LocusCode:At2g17950",
      "abbreviation" : "AGI_LocusCode",
      "object" : "gene",
      "id" : "AGI_LocusCode",
      "url_example" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=At2g17950",
      "uri_prefix" : null,
      "generic_url" : "http://www.arabidopsis.org",
      "database" : "Arabidopsis Genome Initiative",
      "fullname" : "Comprises TAIR, TIGR and MIPS",
      "name" : "Arabidopsis Genome Initiative",
      "datatype" : "gene",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=[example_id]"
   },
   "locusid" : {
      "name" : "NCBI Gene",
      "datatype" : "gene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "fullname" : null,
      "database" : "NCBI Gene",
      "object" : "gene",
      "id" : "NCBI_Gene",
      "example_id" : "NCBI_Gene:4771",
      "abbreviation" : "LocusID"
   },
   "aracyc" : {
      "name" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "datatype" : "entity",
      "url_syntax" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=[example_id]",
      "uri_prefix" : null,
      "generic_url" : "http://www.arabidopsis.org/biocyc/index.jsp",
      "url_example" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=PWYQT-62",
      "fullname" : null,
      "database" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "object" : "entity",
      "id" : "AraCyc",
      "example_id" : "AraCyc:PWYQT-62",
      "abbreviation" : "AraCyc"
   },
   "obi" : {
      "object" : "entity",
      "id" : "OBI",
      "example_id" : "OBI:0000038",
      "abbreviation" : "OBI",
      "name" : "Ontology for Biomedical Investigations",
      "url_syntax" : null,
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://obi-ontology.org/page/Main_Page",
      "url_example" : null,
      "database" : "Ontology for Biomedical Investigations",
      "fullname" : null
   },
   "vmd" : {
      "object" : "entity",
      "id" : "VMD",
      "example_id" : "VMD:109198",
      "abbreviation" : "VMD",
      "name" : "Virginia Bioinformatics Institute Microbial Database",
      "datatype" : "entity",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=[example_id]",
      "uri_prefix" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=109198",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "fullname" : null
   },
   "resid" : {
      "name" : "RESID Database of Protein Modifications",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "ftp://ftp.ncifcrf.gov/pub/users/residues/",
      "database" : "RESID Database of Protein Modifications",
      "fullname" : null,
      "object" : "entity",
      "id" : "RESID",
      "example_id" : "RESID:AA0062",
      "abbreviation" : "RESID"
   },
   "jstor" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.jstor.org/stable/[example_id]",
      "name" : "Digital archive of scholarly articles",
      "database" : "Digital archive of scholarly articles",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.jstor.org/",
      "url_example" : "http://www.jstor.org/stable/3093870",
      "id" : "JSTOR",
      "object" : "entity",
      "abbreviation" : "JSTOR",
      "example_id" : "JSTOR:3093870"
   },
   "cog_function" : {
      "id" : "COG_Function",
      "object" : "entity",
      "abbreviation" : "COG_Function",
      "example_id" : "COG_Function:H",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=[example_id]",
      "name" : "NCBI COG function",
      "database" : "NCBI COG function",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=H"
   },
   "cl" : {
      "abbreviation" : "CL",
      "example_id" : "CL:0000041",
      "id" : "CL",
      "object" : "cell",
      "database" : "Cell Type Ontology",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://purl.obolibrary.org/obo/CL_0000041",
      "generic_url" : "http://cellontology.org",
      "datatype" : "cell",
      "url_syntax" : "http://purl.obolibrary.org/obo/CL_[example_id]",
      "name" : "Cell Type Ontology"
   },
   "metacyc" : {
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=[example_id]",
      "datatype" : "entity",
      "name" : "Metabolic Encyclopedia of metabolic and other pathways",
      "database" : "Metabolic Encyclopedia of metabolic and other pathways",
      "fullname" : null,
      "generic_url" : "http://metacyc.org/",
      "uri_prefix" : null,
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=GLUTDEG-PWY",
      "id" : "MetaCyc",
      "object" : "entity",
      "abbreviation" : "MetaCyc",
      "example_id" : "MetaCyc:GLUTDEG-PWY"
   },
   "pmid" : {
      "name" : "PubMed",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "database" : "PubMed",
      "fullname" : null,
      "object" : "entity",
      "id" : "PMID",
      "example_id" : "PMID:4208797",
      "abbreviation" : "PMID"
   },
   "embl" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/embl/",
      "url_example" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=AA816246",
      "database" : "EMBL Nucleotide Sequence Database",
      "fullname" : "International nucleotide sequence database collaboration, comprising EMBL-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "name" : "EMBL Nucleotide Sequence Database",
      "datatype" : "gene",
      "url_syntax" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=[example_id]",
      "example_id" : "EMBL:AA816246",
      "abbreviation" : "EMBL",
      "object" : "gene",
      "id" : "EMBL"
   },
   "iuphar_receptor" : {
      "example_id" : "IUPHAR_RECEPTOR:2205",
      "abbreviation" : "IUPHAR_RECEPTOR",
      "object" : "entity",
      "id" : "IUPHAR_RECEPTOR",
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/",
      "url_example" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=56",
      "database" : "International Union of Pharmacology",
      "fullname" : null,
      "name" : "International Union of Pharmacology",
      "datatype" : "entity",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=[example_id]"
   },
   "uniprotkb" : {
      "object" : "protein",
      "id" : "UniProtKB",
      "example_id" : "UniProtKB:P51587",
      "abbreviation" : "UniProtKB",
      "name" : "Universal Protein Knowledgebase",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "datatype" : "protein",
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "generic_url" : "http://www.uniprot.org",
      "database" : "Universal Protein Knowledgebase",
      "fullname" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database"
   },
   "cbs" : {
      "generic_url" : "http://www.cbs.dtu.dk/",
      "uri_prefix" : null,
      "url_example" : "http://www.cbs.dtu.dk/services/[example_id]/",
      "database" : "Center for Biological Sequence Analysis",
      "fullname" : null,
      "name" : "Center for Biological Sequence Analysis",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : "CBS:TMHMM",
      "abbreviation" : "CBS",
      "object" : "entity",
      "id" : "CBS"
   },
   "maizegdb" : {
      "uri_prefix" : null,
      "url_example" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=881225",
      "generic_url" : "http://www.maizegdb.org",
      "fullname" : null,
      "database" : "MaizeGDB",
      "name" : "MaizeGDB",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=[example_id]",
      "datatype" : "entity",
      "example_id" : "MaizeGDB:881225",
      "abbreviation" : "MaizeGDB",
      "object" : "entity",
      "id" : "MaizeGDB"
   },
   "uniprotkb-kw" : {
      "database" : "UniProt Knowledgebase keywords",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org/keywords/",
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "datatype" : "entity",
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "name" : "UniProt Knowledgebase keywords",
      "abbreviation" : "UniProtKB-KW",
      "example_id" : "UniProtKB-KW:KW-0812",
      "id" : "UniProtKB-KW",
      "object" : "entity"
   },
   "rgd" : {
      "datatype" : "gene",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "name" : "Rat Genome Database",
      "database" : "Rat Genome Database",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://rgd.mcw.edu/",
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "id" : "RGD",
      "object" : "gene",
      "abbreviation" : "RGD",
      "example_id" : "RGD:2004"
   },
   "wbphenotype" : {
      "name" : "WormBase phenotype ontology",
      "datatype" : "quality",
      "url_syntax" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:[example_id]",
      "uri_prefix" : null,
      "url_example" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:0000154",
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase phenotype ontology",
      "fullname" : null,
      "object" : "quality",
      "id" : "WBPhenotype",
      "example_id" : "WBPhenotype:0002117",
      "abbreviation" : "WBPhenotype"
   },
   "vega" : {
      "datatype" : "entity",
      "url_syntax" : "http://vega.sanger.ac.uk/id/[example_id]",
      "name" : "Vertebrate Genome Annotation database",
      "database" : "Vertebrate Genome Annotation database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://vega.sanger.ac.uk/id/OTTHUMP00000000661",
      "generic_url" : "http://vega.sanger.ac.uk/index.html",
      "id" : "VEGA",
      "object" : "entity",
      "abbreviation" : "VEGA",
      "example_id" : "VEGA:OTTHUMP00000000661"
   },
   "coriell" : {
      "object" : "entity",
      "id" : "CORIELL",
      "example_id" : "GM07892",
      "abbreviation" : "CORIELL",
      "name" : "Coriell Institute for Medical Research",
      "url_syntax" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://ccr.coriell.org/",
      "url_example" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=GM07892",
      "database" : "Coriell Institute for Medical Research",
      "fullname" : "The Coriell Cell Repositories provide essential research reagents to the scientific community by establishing, verifying, maintaining, and distributing cell cultures and DNA derived from cell cultures. These collections, supported by funds from the National Institutes of Health (NIH) and several foundations, are extensively utilized by research scientists around the world."
   },
   "cgd" : {
      "example_id" : "CGD:CAL0005516",
      "abbreviation" : "CGD",
      "object" : "gene",
      "id" : "CGD",
      "uri_prefix" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "generic_url" : "http://www.candidagenome.org/",
      "database" : "Candida Genome Database",
      "fullname" : null,
      "name" : "Candida Genome Database",
      "datatype" : "gene",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]"
   },
   "pro" : {
      "database" : "Protein Ontology",
      "fullname" : null,
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "uri_prefix" : null,
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "datatype" : "protein",
      "name" : "Protein Ontology",
      "abbreviation" : "PRO",
      "example_id" : "PR:000025380",
      "id" : "PR",
      "object" : "protein"
   },
   "syscilia_ccnet" : {
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Syscilia",
      "database" : "Syscilia",
      "fullname" : "A systems biology approach to dissect cilia function and its disruption in human genetic disease",
      "uri_prefix" : null,
      "generic_url" : "http://syscilia.org/",
      "url_example" : null,
      "id" : "SYSCILIA_CCNET",
      "object" : "entity",
      "abbreviation" : "SYSCILIA_CCNET",
      "example_id" : null
   },
   "apidb_plasmodb" : {
      "database" : "PlasmoDB Plasmodium Genome Resource",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://plasmodb.org/",
      "url_example" : "http://www.plasmodb.org/gene/PF11_0344",
      "datatype" : "entity",
      "url_syntax" : "http://www.plasmodb.org/gene/[example_id]",
      "name" : "PlasmoDB Plasmodium Genome Resource",
      "abbreviation" : "ApiDB_PlasmoDB",
      "example_id" : "ApiDB_PlasmoDB:PF11_0344",
      "id" : "ApiDB_PlasmoDB",
      "object" : "entity"
   },
   "um-bbd_enzymeid" : {
      "object" : "entity",
      "id" : "UM-BBD_enzymeID",
      "example_id" : "UM-BBD_enzymeID:e0413",
      "abbreviation" : "UM-BBD_enzymeID",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=[example_id]",
      "datatype" : "entity",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "uri_prefix" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=e0230",
      "fullname" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database"
   },
   "ddb_ref" : {
      "uri_prefix" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "database" : "dictyBase literature references",
      "name" : "dictyBase literature references",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "datatype" : "entity",
      "example_id" : "dictyBase_REF:10157",
      "abbreviation" : "DDB_REF",
      "object" : "entity",
      "id" : "dictyBase_REF"
   },
   "gdb" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.gdb.org/",
      "url_example" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:306600",
      "database" : "Human Genome Database",
      "fullname" : null,
      "name" : "Human Genome Database",
      "datatype" : "entity",
      "url_syntax" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:[example_id]",
      "example_id" : "GDB:306600",
      "abbreviation" : "GDB",
      "object" : "entity",
      "id" : "GDB"
   },
   "prodom" : {
      "name" : "ProDom protein domain families",
      "url_syntax" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "url_example" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=PD000001",
      "generic_url" : "http://prodom.prabi.fr/prodom/current/html/home.php",
      "database" : "ProDom protein domain families",
      "fullname" : "ProDom protein domain families automatically generated from UniProtKB",
      "object" : "entity",
      "id" : "ProDom",
      "example_id" : "ProDom:PD000001",
      "abbreviation" : "ProDom"
   },
   "ncbitaxon" : {
      "database" : "NCBI Taxonomy",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "datatype" : "entity",
      "name" : "NCBI Taxonomy",
      "abbreviation" : "NCBITaxon",
      "example_id" : "taxon:7227",
      "id" : "taxon",
      "object" : "entity"
   },
   "pamgo_mgg" : {
      "name" : "Magnaporthe grisea database",
      "datatype" : "entity",
      "url_syntax" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=[example_id]",
      "url_example" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=MGG_05132",
      "uri_prefix" : null,
      "generic_url" : "http://scotland.fgl.ncsu.edu/smeng/GoAnnotationMagnaporthegrisea.html",
      "fullname" : "Magnaporthe grisea database at North Carolina State University; member of PAMGO Interest Group",
      "database" : "Magnaporthe grisea database",
      "object" : "entity",
      "id" : "PAMGO_MGG",
      "example_id" : "PAMGO_MGG:MGG_05132",
      "abbreviation" : "PAMGO_MGG"
   },
   "nc-iubmb" : {
      "abbreviation" : "NC-IUBMB",
      "example_id" : null,
      "id" : "NC-IUBMB",
      "object" : "entity",
      "database" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.chem.qmw.ac.uk/iubmb/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology"
   },
   "reactome" : {
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "datatype" : "entity",
      "name" : "Reactome - a curated knowledgebase of biological pathways",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "fullname" : null,
      "generic_url" : "http://www.reactome.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "id" : "Reactome",
      "object" : "entity",
      "abbreviation" : "Reactome",
      "example_id" : "Reactome:REACT_604"
   },
   "so" : {
      "example_id" : "SO:0000195",
      "abbreviation" : "SO",
      "object" : "sequence feature",
      "id" : "SO",
      "url_example" : "http://song.sourceforge.net/SOterm_tables.html#SO:0000195",
      "uri_prefix" : null,
      "generic_url" : "http://sequenceontology.org/",
      "database" : "Sequence Ontology",
      "fullname" : null,
      "name" : "Sequence Ontology",
      "url_syntax" : "http://song.sourceforge.net/SOterm_tables.html#SO:[example_id]",
      "datatype" : "sequence feature"
   },
   "yeastfunc" : {
      "database" : "Yeast Function",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://func.med.harvard.edu/yeast/",
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Yeast Function",
      "abbreviation" : "YeastFunc",
      "example_id" : null,
      "id" : "YeastFunc",
      "object" : "entity"
   },
   "ensembl" : {
      "uri_prefix" : null,
      "url_example" : "http://www.ensembl.org/id/ENSP00000265949",
      "generic_url" : "http://www.ensembl.org/",
      "fullname" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "name" : "Ensembl database of automatically annotated genomic data",
      "datatype" : "transcript",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "example_id" : "ENSEMBL:ENSP00000265949",
      "abbreviation" : "Ensembl",
      "object" : "transcript",
      "id" : "ENSEMBL"
   },
   "superfamily" : {
      "name" : "SUPERFAMILY protein annotation database",
      "datatype" : "entity",
      "url_syntax" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF[example_id]",
      "generic_url" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/index.html",
      "uri_prefix" : null,
      "url_example" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF51905",
      "database" : "SUPERFAMILY protein annotation database",
      "fullname" : "A database of structural and functional protein annotations for completely sequenced genomes",
      "object" : "entity",
      "id" : "SUPERFAMILY",
      "example_id" : "SUPERFAMILY:51905",
      "abbreviation" : "SUPERFAMILY"
   },
   "mo" : {
      "example_id" : "MO:Action",
      "abbreviation" : "MO",
      "object" : "entity",
      "id" : "MO",
      "uri_prefix" : null,
      "generic_url" : "http://mged.sourceforge.net/ontologies/MGEDontology.php",
      "url_example" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#Action",
      "fullname" : null,
      "database" : "MGED Ontology",
      "name" : "MGED Ontology",
      "url_syntax" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#[example_id]",
      "datatype" : "entity"
   },
   "tigr" : {
      "fullname" : null,
      "database" : "J. Craig Venter Institute",
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.jcvi.org/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "J. Craig Venter Institute",
      "abbreviation" : "TIGR",
      "example_id" : null,
      "id" : "JCVI",
      "object" : "entity"
   },
   "merops" : {
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=[example_id]",
      "datatype" : "protein",
      "name" : "MEROPS peptidase database",
      "database" : "MEROPS peptidase database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=A08.001",
      "generic_url" : "http://merops.sanger.ac.uk/",
      "id" : "MEROPS",
      "object" : "protein",
      "abbreviation" : "MEROPS",
      "example_id" : "MEROPS:A08.001"
   },
   "medline" : {
      "object" : "entity",
      "id" : "MEDLINE",
      "example_id" : "MEDLINE:20572430",
      "abbreviation" : "MEDLINE",
      "name" : "Medline literature database",
      "datatype" : "entity",
      "url_syntax" : null,
      "generic_url" : "http://www.nlm.nih.gov/databases/databases_medline.html",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "Medline literature database",
      "fullname" : null
   },
   "cgen" : {
      "name" : "Compugen Gene Ontology Gene Association Data",
      "url_syntax" : null,
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://www.cgen.com/",
      "url_example" : null,
      "fullname" : null,
      "database" : "Compugen Gene Ontology Gene Association Data",
      "object" : "entity",
      "id" : "CGEN",
      "example_id" : "CGEN:PrID131022",
      "abbreviation" : "CGEN"
   },
   "tigr_cmr" : {
      "uri_prefix" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "fullname" : null,
      "name" : "EGAD database at the J. Craig Venter Institute",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : "protein",
      "example_id" : "JCVI_CMR:VCA0557",
      "abbreviation" : "TIGR_CMR",
      "object" : "protein",
      "id" : "JCVI_CMR"
   },
   "refgenome" : {
      "object" : "entity",
      "id" : "RefGenome",
      "example_id" : null,
      "abbreviation" : "RefGenome",
      "name" : "GO Reference Genomes",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "url_example" : null,
      "database" : "GO Reference Genomes",
      "fullname" : null
   },
   "biopixie_mefit" : {
      "id" : "bioPIXIE_MEFIT",
      "object" : "entity",
      "abbreviation" : "bioPIXIE_MEFIT",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "database" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://avis.princeton.edu/mefit/"
   },
   "taxon" : {
      "id" : "taxon",
      "object" : "entity",
      "abbreviation" : "taxon",
      "example_id" : "taxon:7227",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "name" : "NCBI Taxonomy",
      "database" : "NCBI Taxonomy",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702"
   },
   "biocyc" : {
      "fullname" : null,
      "database" : "BioCyc collection of metabolic pathway databases",
      "uri_prefix" : null,
      "generic_url" : "http://biocyc.org/",
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=PWY-5271",
      "datatype" : "entity",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "name" : "BioCyc collection of metabolic pathway databases",
      "abbreviation" : "BioCyc",
      "example_id" : "BioCyc:PWY-5271",
      "id" : "BioCyc",
      "object" : "entity"
   },
   "sgn_ref" : {
      "object" : "entity",
      "id" : "SGN_ref",
      "example_id" : "SGN_ref:861",
      "abbreviation" : "SGN_ref",
      "name" : "Sol Genomics Network",
      "url_syntax" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://www.sgn.cornell.edu/",
      "url_example" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=861",
      "database" : "Sol Genomics Network",
      "fullname" : null
   },
   "prosite" : {
      "object" : "polypeptide region",
      "id" : "Prosite",
      "example_id" : "Prosite:PS00365",
      "abbreviation" : "Prosite",
      "name" : "Prosite database of protein families and domains",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?[example_id]",
      "datatype" : "polypeptide region",
      "uri_prefix" : null,
      "generic_url" : "http://www.expasy.ch/prosite/",
      "url_example" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?PS00365",
      "database" : "Prosite database of protein families and domains",
      "fullname" : null
   },
   "pharmgkb" : {
      "name" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "url_syntax" : "http://www.pharmgkb.org/do/serve?objId=[example_id]",
      "datatype" : "entity",
      "generic_url" : "http://www.pharmgkb.org",
      "uri_prefix" : null,
      "url_example" : "http://www.pharmgkb.org/do/serve?objId=PA267",
      "database" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "fullname" : null,
      "object" : "entity",
      "id" : "PharmGKB",
      "example_id" : "PharmGKB:PA267",
      "abbreviation" : "PharmGKB"
   },
   "germonline" : {
      "name" : "GermOnline",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.germonline.org/",
      "url_example" : null,
      "database" : "GermOnline",
      "fullname" : null,
      "object" : "entity",
      "id" : "GermOnline",
      "example_id" : null,
      "abbreviation" : "GermOnline"
   },
   "broad" : {
      "object" : "entity",
      "id" : "Broad",
      "example_id" : null,
      "abbreviation" : "Broad",
      "name" : "Broad Institute",
      "url_syntax" : null,
      "datatype" : "entity",
      "uri_prefix" : null,
      "generic_url" : "http://www.broad.mit.edu/",
      "url_example" : null,
      "database" : "Broad Institute",
      "fullname" : null
   },
   "ncbi_gi" : {
      "object" : "gene",
      "id" : "NCBI_gi",
      "example_id" : "NCBI_gi:113194944",
      "abbreviation" : "NCBI_gi",
      "name" : "NCBI databases",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : "gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=113194944",
      "database" : "NCBI databases",
      "fullname" : null
   },
   "pr" : {
      "datatype" : "protein",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "name" : "Protein Ontology",
      "fullname" : null,
      "database" : "Protein Ontology",
      "uri_prefix" : null,
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "id" : "PR",
      "object" : "protein",
      "abbreviation" : "PR",
      "example_id" : "PR:000025380"
   },
   "vz" : {
      "url_syntax" : "http://viralzone.expasy.org/all_by_protein/[example_id].html",
      "datatype" : "entity",
      "name" : "ViralZone",
      "database" : "ViralZone",
      "fullname" : null,
      "generic_url" : "http://viralzone.expasy.org/",
      "uri_prefix" : null,
      "url_example" : "http://viralzone.expasy.org/all_by_protein/957.html",
      "id" : "VZ",
      "object" : "entity",
      "abbreviation" : "VZ",
      "example_id" : "VZ:957"
   },
   "issn" : {
      "example_id" : "ISSN:1234-1231",
      "abbreviation" : "ISSN",
      "object" : "entity",
      "id" : "ISSN",
      "uri_prefix" : null,
      "generic_url" : "http://www.issn.org/",
      "url_example" : null,
      "database" : "International Standard Serial Number",
      "fullname" : null,
      "name" : "International Standard Serial Number",
      "datatype" : "entity",
      "url_syntax" : null
   },
   "kegg_reaction" : {
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?rn:R02328",
      "uri_prefix" : null,
      "generic_url" : "http://www.genome.jp/kegg/reaction/",
      "database" : "KEGG Reaction Database",
      "fullname" : null,
      "name" : "KEGG Reaction Database",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?rn:[example_id]",
      "datatype" : "entity",
      "example_id" : "KEGG:R02328",
      "abbreviation" : "KEGG_REACTION",
      "object" : "entity",
      "id" : "KEGG_REACTION"
   },
   "cazy" : {
      "url_example" : "http://www.cazy.org/PL11.html",
      "uri_prefix" : null,
      "generic_url" : "http://www.cazy.org/",
      "database" : "Carbohydrate Active EnZYmes",
      "fullname" : "The CAZy database describes the families of structurally-related catalytic and carbohydrate-binding modules (or functional domains) of enzymes that degrade, modify, or create glycosidic bonds.",
      "name" : "Carbohydrate Active EnZYmes",
      "url_syntax" : "http://www.cazy.org/[example_id].html",
      "datatype" : "entity",
      "example_id" : "CAZY:PL11",
      "abbreviation" : "CAZY",
      "object" : "entity",
      "id" : "CAZY"
   },
   "nmpdr" : {
      "uri_prefix" : null,
      "url_example" : "http://www.nmpdr.org/linkin.cgi?id=fig|306254.1.peg.183",
      "generic_url" : "http://www.nmpdr.org",
      "fullname" : null,
      "database" : "National Microbial Pathogen Data Resource",
      "name" : "National Microbial Pathogen Data Resource",
      "url_syntax" : "http://www.nmpdr.org/linkin.cgi?id=[example_id]",
      "datatype" : "entity",
      "example_id" : "NMPDR:fig|306254.1.peg.183",
      "abbreviation" : "NMPDR",
      "object" : "entity",
      "id" : "NMPDR"
   },
   "chebi" : {
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17234",
      "generic_url" : "http://www.ebi.ac.uk/chebi/",
      "database" : "Chemical Entities of Biological Interest",
      "fullname" : null,
      "name" : "Chemical Entities of Biological Interest",
      "url_syntax" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:[example_id]",
      "datatype" : "chemical entity",
      "example_id" : "CHEBI:17234",
      "abbreviation" : "ChEBI",
      "object" : "chemical entity",
      "id" : "CHEBI"
   },
   "ptarget" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://bioinformatics.albany.edu/~ptarget/",
      "fullname" : null,
      "database" : "pTARGET Prediction server for protein subcellular localization",
      "name" : "pTARGET Prediction server for protein subcellular localization",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "pTARGET",
      "object" : "entity",
      "id" : "pTARGET"
   },
   "cacao" : {
      "abbreviation" : "CACAO",
      "example_id" : "MYCS2:A0QNF5",
      "id" : "CACAO",
      "object" : "entity",
      "database" : "Community Assessment of Community Annotation with Ontologies",
      "fullname" : "The Community Assessment of Community Annotation with Ontologies (CACAO) is a project to do large-scale manual community annotation of gene function using the Gene Ontology as a multi-institution student competition.",
      "uri_prefix" : null,
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MYCS2:A0QNF5",
      "generic_url" : "http://gowiki.tamu.edu/wiki/index.php/Category:CACAO",
      "datatype" : "entity",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "name" : "Community Assessment of Community Annotation with Ontologies"
   },
   "tigr_egad" : {
      "name" : "EGAD database at the J. Craig Venter Institute",
      "datatype" : "protein",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "generic_url" : "http://cmr.jcvi.org/",
      "uri_prefix" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "fullname" : null,
      "database" : "EGAD database at the J. Craig Venter Institute",
      "object" : "protein",
      "id" : "JCVI_CMR",
      "example_id" : "JCVI_CMR:VCA0557",
      "abbreviation" : "TIGR_EGAD"
   },
   "alzheimers_university_of_toronto" : {
      "example_id" : null,
      "abbreviation" : "Alzheimers_University_of_Toronto",
      "object" : "entity",
      "id" : "Alzheimers_University_of_Toronto",
      "uri_prefix" : null,
      "generic_url" : "http://www.ims.utoronto.ca/",
      "url_example" : null,
      "database" : "Alzheimers Project at University of Toronto",
      "fullname" : null,
      "name" : "Alzheimers Project at University of Toronto",
      "datatype" : "entity",
      "url_syntax" : null
   },
   "hugo" : {
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Human Genome Organisation",
      "database" : "Human Genome Organisation",
      "fullname" : null,
      "generic_url" : "http://www.hugo-international.org/",
      "uri_prefix" : null,
      "url_example" : null,
      "id" : "HUGO",
      "object" : "entity",
      "abbreviation" : "HUGO",
      "example_id" : null
   },
   "locsvmpsi" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://bioinformatics.ustc.edu.cn/locsvmpsi/locsvmpsi.php",
      "database" : "LOCSVMPSI",
      "fullname" : "Subcellular localization for eukayotic proteins based on SVM and PSI-BLAST",
      "name" : "LOCSVMPSI",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : null,
      "abbreviation" : "LOCSVMpsi",
      "object" : "entity",
      "id" : "LOCSVMpsi"
   },
   "pirsf" : {
      "id" : "PIRSF",
      "object" : "entity",
      "abbreviation" : "PIRSF",
      "example_id" : "PIRSF:SF002327",
      "datatype" : "entity",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=[example_id]",
      "name" : "PIR Superfamily Classification System",
      "database" : "PIR Superfamily Classification System",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pir.georgetown.edu/pirsf/",
      "url_example" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=SF002327"
   },
   "ec" : {
      "example_id" : "EC:1.4.3.6",
      "abbreviation" : "EC",
      "object" : "catalytic activity",
      "id" : "EC",
      "uri_prefix" : null,
      "generic_url" : "http://enzyme.expasy.org/",
      "url_example" : "http://www.expasy.org/enzyme/1.4.3.6",
      "database" : "Enzyme Commission",
      "fullname" : null,
      "name" : "Enzyme Commission",
      "datatype" : "catalytic activity",
      "url_syntax" : "http://www.expasy.org/enzyme/[example_id]"
   },
   "wbbt" : {
      "abbreviation" : "WBbt",
      "example_id" : "WBbt:0005733",
      "id" : "WBbt",
      "object" : "metazoan anatomical entity",
      "database" : "C. elegans gross anatomy",
      "fullname" : null,
      "generic_url" : "http://www.wormbase.org/",
      "uri_prefix" : null,
      "url_example" : null,
      "datatype" : "metazoan anatomical entity",
      "url_syntax" : null,
      "name" : "C. elegans gross anatomy"
   },
   "omim" : {
      "abbreviation" : "OMIM",
      "example_id" : "OMIM:190198",
      "id" : "OMIM",
      "object" : "entity",
      "database" : "Mendelian Inheritance in Man",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://omim.org/entry/190198",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "datatype" : "entity",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "name" : "Mendelian Inheritance in Man"
   },
   "obo_rel" : {
      "abbreviation" : "OBO_REL",
      "example_id" : "OBO_REL:part_of",
      "id" : "OBO_REL",
      "object" : "entity",
      "database" : "OBO relation ontology",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.obofoundry.org/ro/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "OBO relation ontology"
   },
   "um-bbd_reactionid" : {
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=r0129",
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "fullname" : null,
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "datatype" : "entity",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=[example_id]",
      "example_id" : "UM-BBD_reactionID:r0129",
      "abbreviation" : "UM-BBD_reactionID",
      "object" : "entity",
      "id" : "UM-BBD_reactionID"
   },
   "cas_gen" : {
      "abbreviation" : "CAS_GEN",
      "example_id" : "CASGEN:1040",
      "id" : "CASGEN",
      "object" : "entity",
      "fullname" : null,
      "database" : "Catalog of Fishes genus database",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "uri_prefix" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "datatype" : "entity",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "name" : "Catalog of Fishes genus database"
   },
   "ecocyc" : {
      "abbreviation" : "EcoCyc",
      "example_id" : "EcoCyc:P2-PWY",
      "id" : "EcoCyc",
      "object" : "biological_process",
      "fullname" : null,
      "database" : "Encyclopedia of E. coli metabolism",
      "generic_url" : "http://ecocyc.org/",
      "uri_prefix" : null,
      "url_example" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=P2-PWY",
      "datatype" : "biological_process",
      "url_syntax" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "name" : "Encyclopedia of E. coli metabolism"
   },
   "pinc" : {
      "abbreviation" : "PINC",
      "example_id" : null,
      "id" : "PINC",
      "object" : "entity",
      "fullname" : "represents GO annotations created in 2001 for NCBI and extracted into UniProtKB-GOA from EntrezGene",
      "database" : "Proteome Inc.",
      "generic_url" : "http://www.proteome.com/",
      "uri_prefix" : null,
      "url_example" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Proteome Inc."
   },
   "mi" : {
      "example_id" : "MI:0018",
      "abbreviation" : "MI",
      "object" : "entity",
      "id" : "PSI-MI",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "fullname" : null,
      "name" : "Proteomic Standard Initiative for Molecular Interaction",
      "url_syntax" : null,
      "datatype" : "entity"
   },
   "pir" : {
      "object" : "protein",
      "id" : "PIR",
      "example_id" : "PIR:I49499",
      "abbreviation" : "PIR",
      "name" : "Protein Information Resource",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=[example_id]",
      "datatype" : "protein",
      "uri_prefix" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=I49499",
      "generic_url" : "http://pir.georgetown.edu/",
      "database" : "Protein Information Resource",
      "fullname" : null
   },
   "modbase" : {
      "object" : "entity",
      "id" : "ModBase",
      "example_id" : "ModBase:P10815",
      "abbreviation" : "ModBase",
      "name" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "url_syntax" : "http://salilab.org/modbase/searchbyid?databaseID=[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "url_example" : "http://salilab.org/modbase/searchbyid?databaseID=P04848",
      "generic_url" : "http://modbase.compbio.ucsf.edu/",
      "fullname" : null,
      "database" : "ModBase comprehensive Database of Comparative Protein Structure Models"
   },
   "ena" : {
      "url_example" : "http://www.ebi.ac.uk/ena/data/view/AA816246",
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/ena/",
      "database" : "European Nucleotide Archive",
      "fullname" : "ENA is made up of a number of distinct databases that includes EMBL-Bank, the newly established Sequence Read Archive (SRA) and the Trace Archive. International nucleotide sequence database collaboration, comprising ENA-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "name" : "European Nucleotide Archive",
      "datatype" : "entity",
      "url_syntax" : "http://www.ebi.ac.uk/ena/data/view/[example_id]",
      "example_id" : "ENA:AA816246",
      "abbreviation" : "ENA",
      "object" : "entity",
      "id" : "ENA"
   },
   "mgi" : {
      "datatype" : "variation",
      "url_syntax" : "http://www.informatics.jax.org/accession/[example_id]",
      "name" : "Mouse Genome Informatics",
      "database" : "Mouse Genome Informatics",
      "fullname" : null,
      "url_example" : "http://www.informatics.jax.org/accession/MGI:80863",
      "uri_prefix" : null,
      "generic_url" : "http://www.informatics.jax.org/",
      "id" : "MGI",
      "object" : "variation",
      "abbreviation" : "MGI",
      "example_id" : "MGI:MGI:80863"
   },
   "eurofung" : {
      "name" : "Eurofungbase community annotation",
      "datatype" : "entity",
      "url_syntax" : null,
      "generic_url" : "http://www.eurofung.net/option=com_content&task=section&id=3&Itemid=4",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "Eurofungbase community annotation",
      "fullname" : null,
      "object" : "entity",
      "id" : "Eurofung",
      "example_id" : null,
      "abbreviation" : "Eurofung"
   },
   "po_ref" : {
      "generic_url" : "http://wiki.plantontology.org:8080/index.php/PO_references",
      "uri_prefix" : null,
      "url_example" : "http://wiki.plantontology.org:8080/index.php/PO_REF:00001",
      "database" : "Plant Ontology custom references",
      "fullname" : null,
      "name" : "Plant Ontology custom references",
      "url_syntax" : "http://wiki.plantontology.org:8080/index.php/PO_REF:[example_id]",
      "datatype" : "entity",
      "example_id" : "PO_REF:00001",
      "abbreviation" : "PO_REF",
      "object" : "entity",
      "id" : "PO_REF"
   },
   "wikipedia" : {
      "example_id" : "Wikipedia:Endoplasmic_reticulum",
      "abbreviation" : "Wikipedia",
      "object" : "entity",
      "id" : "Wikipedia",
      "uri_prefix" : null,
      "generic_url" : "http://en.wikipedia.org/",
      "url_example" : "http://en.wikipedia.org/wiki/Endoplasmic_reticulum",
      "fullname" : null,
      "database" : "Wikipedia",
      "name" : "Wikipedia",
      "datatype" : "entity",
      "url_syntax" : "http://en.wikipedia.org/wiki/[example_id]"
   },
   "ncbi_locus_tag" : {
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "NCBI locus tag",
      "database" : "NCBI locus tag",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "id" : "NCBI_locus_tag",
      "object" : "entity",
      "abbreviation" : "NCBI_locus_tag",
      "example_id" : "NCBI_locus_tag:CTN_0547"
   },
   "agricola_ind" : {
      "name" : "AGRICultural OnLine Access",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://agricola.nal.usda.gov/",
      "database" : "AGRICultural OnLine Access",
      "fullname" : null,
      "object" : "entity",
      "id" : "AGRICOLA_IND",
      "example_id" : "AGRICOLA_IND:IND23252955",
      "abbreviation" : "AGRICOLA_IND"
   },
   "ncbi" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "National Center for Biotechnology Information",
      "fullname" : null,
      "name" : "National Center for Biotechnology Information",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : null,
      "abbreviation" : "NCBI",
      "object" : "entity",
      "id" : "NCBI"
   },
   "ncbi_taxid" : {
      "example_id" : "taxon:7227",
      "abbreviation" : "ncbi_taxid",
      "object" : "entity",
      "id" : "taxon",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "database" : "NCBI Taxonomy",
      "fullname" : null,
      "name" : "NCBI Taxonomy",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "datatype" : "entity"
   },
   "geneid" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "database" : "NCBI Gene",
      "fullname" : null,
      "name" : "NCBI Gene",
      "datatype" : "gene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "example_id" : "NCBI_Gene:4771",
      "abbreviation" : "GeneID",
      "object" : "gene",
      "id" : "NCBI_Gene"
   },
   "hamap" : {
      "generic_url" : "http://hamap.expasy.org/",
      "uri_prefix" : null,
      "url_example" : "http://hamap.expasy.org/unirule/MF_00131",
      "fullname" : null,
      "database" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "name" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "datatype" : "entity",
      "url_syntax" : "http://hamap.expasy.org/unirule/[example_id]",
      "example_id" : "HAMAP:MF_00031",
      "abbreviation" : "HAMAP",
      "object" : "entity",
      "id" : "HAMAP"
   },
   "gr_ref" : {
      "example_id" : "GR_REF:659",
      "abbreviation" : "GR_REF",
      "object" : "entity",
      "id" : "GR_REF",
      "generic_url" : "http://www.gramene.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.gramene.org/db/literature/pub_search?ref_id=659",
      "fullname" : null,
      "database" : "Gramene",
      "name" : "Gramene",
      "datatype" : "entity",
      "url_syntax" : "http://www.gramene.org/db/literature/pub_search?ref_id=[example_id]"
   },
   "rgdid" : {
      "id" : "RGD",
      "object" : "gene",
      "abbreviation" : "RGDID",
      "example_id" : "RGD:2004",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "datatype" : "gene",
      "name" : "Rat Genome Database",
      "database" : "Rat Genome Database",
      "fullname" : null,
      "generic_url" : "http://rgd.mcw.edu/",
      "uri_prefix" : null,
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004"
   },
   "rnamods" : {
      "database" : "RNA Modification Database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "datatype" : "entity",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "name" : "RNA Modification Database",
      "abbreviation" : "RNAmods",
      "example_id" : "RNAmods:037",
      "id" : "RNAmods",
      "object" : "entity"
   },
   "um-bbd" : {
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "fullname" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "uri_prefix" : null,
      "url_example" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "abbreviation" : "UM-BBD",
      "example_id" : null,
      "id" : "UM-BBD",
      "object" : "entity"
   },
   "ensembl_transcriptid" : {
      "abbreviation" : "ENSEMBL_TranscriptID",
      "example_id" : "ENSEMBL_TranscriptID:ENST00000371959",
      "id" : "ENSEMBL_TranscriptID",
      "object" : "transcript",
      "database" : "Ensembl database of automatically annotated genomic data",
      "fullname" : null,
      "url_example" : "http://www.ensembl.org/id/ENST00000371959",
      "uri_prefix" : null,
      "generic_url" : "http://www.ensembl.org/",
      "datatype" : "transcript",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "name" : "Ensembl database of automatically annotated genomic data"
   },
   "h-invdb" : {
      "example_id" : null,
      "abbreviation" : "H-invDB",
      "object" : "entity",
      "id" : "H-invDB",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.h-invitational.jp/",
      "database" : "H-invitational Database",
      "fullname" : null,
      "name" : "H-invitational Database",
      "url_syntax" : null,
      "datatype" : "entity"
   },
   "mtbbase" : {
      "example_id" : null,
      "abbreviation" : "MTBBASE",
      "object" : "entity",
      "id" : "MTBBASE",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.ark.in-berlin.de/Site/MTBbase.html",
      "database" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "fullname" : null,
      "name" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "url_syntax" : null,
      "datatype" : "entity"
   },
   "cgd_ref" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "name" : "Candida Genome Database",
      "database" : "Candida Genome Database",
      "fullname" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=1490",
      "id" : "CGD_REF",
      "object" : "entity",
      "abbreviation" : "CGD_REF",
      "example_id" : "CGD_REF:1490"
   },
   "transfac" : {
      "database" : "TRANSFAC database of eukaryotic transcription factors",
      "fullname" : null,
      "generic_url" : "http://www.gene-regulation.com/pub/databases.html#transfac",
      "uri_prefix" : null,
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "TRANSFAC database of eukaryotic transcription factors",
      "abbreviation" : "TRANSFAC",
      "example_id" : null,
      "id" : "TRANSFAC",
      "object" : "entity"
   },
   "gr_protein" : {
      "abbreviation" : "GR_protein",
      "example_id" : "GR_PROTEIN:Q6VSV0",
      "id" : "GR_PROTEIN",
      "object" : "protein",
      "database" : "Gramene",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.gramene.org/db/protein/protein_search?acc=Q6VSV0",
      "generic_url" : "http://www.gramene.org/",
      "url_syntax" : "http://www.gramene.org/db/protein/protein_search?acc=[example_id]",
      "datatype" : "protein",
      "name" : "Gramene"
   },
   "omssa" : {
      "abbreviation" : "OMSSA",
      "example_id" : null,
      "id" : "OMSSA",
      "object" : "entity",
      "database" : "Open Mass Spectrometry Search Algorithm",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/omssa/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Open Mass Spectrometry Search Algorithm"
   },
   "eck" : {
      "abbreviation" : "ECK",
      "example_id" : "ECK:ECK3746",
      "id" : "ECK",
      "object" : "gene",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "fullname" : null,
      "url_example" : "http://www.ecogene.org/geneInfo.php?eck_id=ECK3746",
      "uri_prefix" : null,
      "generic_url" : "http://www.ecogene.org/",
      "datatype" : "gene",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eck_id=[example_id]",
      "name" : "EcoGene Database of Escherichia coli Sequence and Function"
   },
   "iuphar" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.iuphar.org/",
      "database" : "International Union of Pharmacology",
      "fullname" : null,
      "name" : "International Union of Pharmacology",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "IUPHAR",
      "object" : "entity",
      "id" : "IUPHAR"
   },
   "aspgd_locus" : {
      "datatype" : "entity",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "name" : "Aspergillus Genome Database",
      "database" : "Aspergillus Genome Database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=AN10942",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "id" : "AspGD_LOCUS",
      "object" : "entity",
      "abbreviation" : "AspGD_LOCUS",
      "example_id" : "AspGD_LOCUS:AN10942"
   },
   "pmcid" : {
      "database" : "Pubmed Central",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.pubmedcentral.nih.gov/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=PMC201377",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=[example_id]",
      "name" : "Pubmed Central",
      "abbreviation" : "PMCID",
      "example_id" : "PMCID:PMC201377",
      "id" : "PMCID",
      "object" : "entity"
   },
   "unimod" : {
      "example_id" : "UniMod:1287",
      "abbreviation" : "UniMod",
      "object" : "entity",
      "id" : "UniMod",
      "url_example" : "http://www.unimod.org/modifications_view.php?editid1=1287",
      "uri_prefix" : null,
      "generic_url" : "http://www.unimod.org/",
      "database" : "UniMod",
      "fullname" : "protein modifications for mass spectrometry",
      "name" : "UniMod",
      "datatype" : "entity",
      "url_syntax" : "http://www.unimod.org/modifications_view.php?editid1=[example_id]"
   },
   "intact" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/intact/",
      "url_example" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=EBI-17086",
      "fullname" : null,
      "database" : "IntAct protein interaction database",
      "name" : "IntAct protein interaction database",
      "datatype" : "protein complex",
      "url_syntax" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=[example_id]",
      "example_id" : "IntAct:EBI-17086",
      "abbreviation" : "IntAct",
      "object" : "protein complex",
      "id" : "IntAct"
   },
   "ensembl_geneid" : {
      "abbreviation" : "ENSEMBL_GeneID",
      "example_id" : "ENSEMBL_GeneID:ENSG00000126016",
      "id" : "ENSEMBL_GeneID",
      "object" : "gene",
      "fullname" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "generic_url" : "http://www.ensembl.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.ensembl.org/id/ENSG00000126016",
      "datatype" : "gene",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "name" : "Ensembl database of automatically annotated genomic data"
   },
   "broad_mgg" : {
      "id" : "Broad_MGG",
      "object" : "entity",
      "abbreviation" : "Broad_MGG",
      "example_id" : "Broad_MGG:MGG_05132.5",
      "url_syntax" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=S[example_id]",
      "datatype" : "entity",
      "name" : "Magnaporthe grisea Database",
      "database" : "Magnaporthe grisea Database",
      "fullname" : "Magnaporthe grisea Database at the Broad Institute",
      "uri_prefix" : null,
      "url_example" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=SMGG_05132",
      "generic_url" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/Home.html"
   },
   "kegg" : {
      "id" : "KEGG",
      "object" : "entity",
      "abbreviation" : "KEGG",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Kyoto Encyclopedia of Genes and Genomes",
      "database" : "Kyoto Encyclopedia of Genes and Genomes",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.genome.ad.jp/kegg/",
      "url_example" : null
   },
   "uniprotkb-subcell" : {
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "generic_url" : "http://www.uniprot.org/locations/",
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "fullname" : null,
      "name" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "datatype" : "entity",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "abbreviation" : "UniProtKB-SubCell",
      "object" : "entity",
      "id" : "UniProtKB-SubCell"
   },
   "sabio-rk" : {
      "database" : "SABIO Reaction Kinetics",
      "fullname" : "The SABIO-RK (System for the Analysis of Biochemical Pathways - Reaction Kinetics) is a web-based application based on the SABIO relational database that contains information about biochemical reactions, their kinetic equations with their parameters, and the experimental conditions under which these parameters were measured.",
      "uri_prefix" : null,
      "generic_url" : "http://sabio.villa-bosch.de/",
      "url_example" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=1858",
      "datatype" : "entity",
      "url_syntax" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=[example_id]",
      "name" : "SABIO Reaction Kinetics",
      "abbreviation" : "SABIO-RK",
      "example_id" : "SABIO-RK:1858",
      "id" : "SABIO-RK",
      "object" : "entity"
   },
   "rhea" : {
      "database" : "Rhea, the Annotated Reactions Database",
      "fullname" : "Rhea is a freely available, manually annotated database of chemical reactions created in collaboration with the Swiss Institute of Bioinformatics (SIB).",
      "url_example" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=25811",
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/rhea/",
      "datatype" : "entity",
      "url_syntax" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=[example_id]",
      "name" : "Rhea, the Annotated Reactions Database",
      "abbreviation" : "RHEA",
      "example_id" : "RHEA:25811",
      "id" : "RHEA",
      "object" : "entity"
   },
   "sgd_locus" : {
      "name" : "Saccharomyces Genome Database",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview",
      "datatype" : "entity",
      "generic_url" : "http://www.yeastgenome.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "database" : "Saccharomyces Genome Database",
      "fullname" : null,
      "object" : "entity",
      "id" : "SGD_LOCUS",
      "example_id" : "SGD_LOCUS:GAL4",
      "abbreviation" : "SGD_LOCUS"
   },
   "gb" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "datatype" : "protein",
      "name" : "GenBank",
      "database" : "GenBank",
      "fullname" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "id" : "GenBank",
      "object" : "protein",
      "abbreviation" : "GB",
      "example_id" : "GB:AA816246"
   },
   "muscletrait" : {
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "TRAnscript Integrated Table",
      "fullname" : "an integrated database of transcripts expressed in human skeletal muscle",
      "database" : "TRAnscript Integrated Table",
      "uri_prefix" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "url_example" : null,
      "id" : "TRAIT",
      "object" : "entity",
      "abbreviation" : "MuscleTRAIT",
      "example_id" : null
   },
   "tgd_locus" : {
      "example_id" : "TGD_LOCUS:PDD1",
      "abbreviation" : "TGD_LOCUS",
      "object" : "entity",
      "id" : "TGD_LOCUS",
      "uri_prefix" : null,
      "generic_url" : "http://www.ciliate.org/",
      "url_example" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=PDD1",
      "database" : "Tetrahymena Genome Database",
      "fullname" : null,
      "name" : "Tetrahymena Genome Database",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=[example_id]",
      "datatype" : "entity"
   },
   "ncbi_gene" : {
      "abbreviation" : "NCBI_Gene",
      "example_id" : "NCBI_Gene:4771",
      "id" : "NCBI_Gene",
      "object" : "gene",
      "database" : "NCBI Gene",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "datatype" : "gene",
      "name" : "NCBI Gene"
   },
   "casgen" : {
      "example_id" : "CASGEN:1040",
      "abbreviation" : "CASGEN",
      "object" : "entity",
      "id" : "CASGEN",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "database" : "Catalog of Fishes genus database",
      "fullname" : null,
      "name" : "Catalog of Fishes genus database",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "datatype" : "entity"
   },
   "subtilistg" : {
      "object" : "entity",
      "id" : "SUBTILISTG",
      "example_id" : "SUBTILISTG:accC",
      "abbreviation" : "SUBTILISTG",
      "name" : "Bacillus subtilis Genome Sequence Project",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "fullname" : null
   },
   "tgd" : {
      "object" : "entity",
      "id" : "TGD",
      "example_id" : null,
      "abbreviation" : "TGD",
      "name" : "Tetrahymena Genome Database",
      "url_syntax" : null,
      "datatype" : "entity",
      "generic_url" : "http://www.ciliate.org/",
      "uri_prefix" : null,
      "url_example" : null,
      "fullname" : null,
      "database" : "Tetrahymena Genome Database"
   },
   "genprotec" : {
      "object" : "entity",
      "id" : "GenProtEC",
      "example_id" : null,
      "abbreviation" : "GenProtEC",
      "name" : "GenProtEC E. coli genome and proteome database",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://genprotec.mbl.edu/",
      "fullname" : null,
      "database" : "GenProtEC E. coli genome and proteome database"
   },
   "pseudocap" : {
      "url_syntax" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=[example_id]",
      "datatype" : "entity",
      "name" : "Pseudomonas Genome Project",
      "database" : "Pseudomonas Genome Project",
      "fullname" : null,
      "url_example" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=PA4756",
      "uri_prefix" : null,
      "generic_url" : "http://v2.pseudomonas.com/",
      "id" : "PseudoCAP",
      "object" : "entity",
      "abbreviation" : "PseudoCAP",
      "example_id" : "PseudoCAP:PA4756"
   },
   "ensemblplants/gramene" : {
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "generic_url" : "http://plants.ensembl.org/",
      "datatype" : "gene",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "name" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "abbreviation" : "EnsemblPlants/Gramene",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "id" : "EnsemblPlants/Gramene",
      "object" : "gene"
   },
   "go" : {
      "generic_url" : "http://amigo.geneontology.org/",
      "uri_prefix" : null,
      "url_example" : "http://amigo.geneontology.org/amigo/term/GO:0004352",
      "database" : "Gene Ontology Database",
      "fullname" : null,
      "name" : "Gene Ontology Database",
      "datatype" : "macromolecular complex",
      "url_syntax" : "http://amigo.geneontology.org/amigo/term/GO:[example_id]",
      "example_id" : "GO:0004352",
      "abbreviation" : "GO",
      "object" : "macromolecular complex",
      "id" : "GO"
   },
   "phi" : {
      "database" : "MeGO (Phage and Mobile Element Ontology)",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://aclame.ulb.ac.be/Classification/mego.html",
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "MeGO (Phage and Mobile Element Ontology)",
      "abbreviation" : "PHI",
      "example_id" : "PHI:0000055",
      "id" : "PHI",
      "object" : "entity"
   },
   "maizegdb_locus" : {
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=[example_id]",
      "datatype" : "gene",
      "name" : "MaizeGDB",
      "database" : "MaizeGDB",
      "fullname" : null,
      "generic_url" : "http://www.maizegdb.org",
      "uri_prefix" : null,
      "url_example" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=ZmPK1",
      "id" : "MaizeGDB_Locus",
      "object" : "gene",
      "abbreviation" : "MaizeGDB_Locus",
      "example_id" : "MaizeGDB_Locus:ZmPK1"
   },
   "echobase" : {
      "example_id" : "EchoBASE:EB0231",
      "abbreviation" : "EchoBASE",
      "object" : "gene",
      "id" : "EchoBASE",
      "url_example" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=EB0231",
      "uri_prefix" : null,
      "generic_url" : "http://www.ecoli-york.org/",
      "database" : "EchoBASE post-genomic database for Escherichia coli",
      "fullname" : null,
      "name" : "EchoBASE post-genomic database for Escherichia coli",
      "datatype" : "gene",
      "url_syntax" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=[example_id]"
   },
   "jcvi_cmr" : {
      "database" : "EGAD database at the J. Craig Venter Institute",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : "protein",
      "name" : "EGAD database at the J. Craig Venter Institute",
      "abbreviation" : "JCVI_CMR",
      "example_id" : "JCVI_CMR:VCA0557",
      "id" : "JCVI_CMR",
      "object" : "protein"
   },
   "isbn" : {
      "abbreviation" : "ISBN",
      "example_id" : "ISBN:0781702534",
      "id" : "ISBN",
      "object" : "entity",
      "database" : "International Standard Book Number",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://isbntools.com/",
      "url_example" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=0123456789",
      "datatype" : "entity",
      "url_syntax" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=[example_id]",
      "name" : "International Standard Book Number"
   },
   "brenda" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.brenda-enzymes.info",
      "url_example" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=4.2.1.3",
      "database" : "BRENDA, The Comprehensive Enzyme Information System",
      "fullname" : null,
      "name" : "BRENDA, The Comprehensive Enzyme Information System",
      "datatype" : "catalytic activity",
      "url_syntax" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=[example_id]",
      "example_id" : "BRENDA:4.2.1.3",
      "abbreviation" : "BRENDA",
      "object" : "catalytic activity",
      "id" : "BRENDA"
   },
   "kegg_pathway" : {
      "example_id" : "KEGG_PATHWAY:ot00020",
      "abbreviation" : "KEGG_PATHWAY",
      "object" : "entity",
      "id" : "KEGG_PATHWAY",
      "uri_prefix" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?path:ot00020",
      "generic_url" : "http://www.genome.jp/kegg/pathway.html",
      "database" : "KEGG Pathways Database",
      "fullname" : null,
      "name" : "KEGG Pathways Database",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?path:[example_id]",
      "datatype" : "entity"
   },
   "nasc_code" : {
      "generic_url" : "http://arabidopsis.info",
      "uri_prefix" : null,
      "url_example" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=N3371",
      "database" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "fullname" : null,
      "name" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "datatype" : "entity",
      "url_syntax" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=[example_id]",
      "example_id" : "NASC_code:N3371",
      "abbreviation" : "NASC_code",
      "object" : "entity",
      "id" : "NASC_code"
   },
   "paint_ref" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "url_example" : "http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt",
      "database" : "Phylogenetic Annotation INference Tool References",
      "fullname" : null,
      "name" : "Phylogenetic Annotation INference Tool References",
      "datatype" : "entity",
      "url_syntax" : "http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt",
      "example_id" : "PAINT_REF:PTHR10046",
      "abbreviation" : "PAINT_REF",
      "object" : "entity",
      "id" : "PAINT_REF"
   },
   "ddanat" : {
      "id" : "DDANAT",
      "object" : "anatomical entity",
      "abbreviation" : "DDANAT",
      "example_id" : "DDANAT:0000068",
      "datatype" : "anatomical entity",
      "url_syntax" : null,
      "name" : "Dictyostelium discoideum anatomy",
      "fullname" : null,
      "database" : "Dictyostelium discoideum anatomy",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://dictybase.org/Dicty_Info/dicty_anatomy_ontology.html"
   },
   "cgd_locus" : {
      "id" : "CGD_LOCUS",
      "object" : "entity",
      "abbreviation" : "CGD_LOCUS",
      "example_id" : "CGD_LOCUS:HWP1",
      "datatype" : "entity",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "name" : "Candida Genome Database",
      "database" : "Candida Genome Database",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=HWP1",
      "generic_url" : "http://www.candidagenome.org/"
   },
   "subtilist" : {
      "name" : "Bacillus subtilis Genome Sequence Project",
      "datatype" : "protein",
      "url_syntax" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "fullname" : null,
      "object" : "protein",
      "id" : "SUBTILIST",
      "example_id" : "SUBTILISTG:BG11384",
      "abbreviation" : "SUBTILIST"
   },
   "cas_spc" : {
      "name" : "Catalog of Fishes species database",
      "datatype" : "entity",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "fullname" : null,
      "database" : "Catalog of Fishes species database",
      "object" : "entity",
      "id" : "CASSPC",
      "example_id" : null,
      "abbreviation" : "CAS_SPC"
   },
   "ecoliwiki" : {
      "object" : "gene",
      "id" : "EcoliWiki",
      "example_id" : null,
      "abbreviation" : "EcoliWiki",
      "name" : "EcoliWiki from EcoliHub",
      "datatype" : "gene",
      "url_syntax" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://ecoliwiki.net/",
      "fullname" : "EcoliHub\\'s subsystem for community annotation of E. coli K-12",
      "database" : "EcoliWiki from EcoliHub"
   },
   "casref" : {
      "example_id" : "CASREF:2031",
      "abbreviation" : "CASREF",
      "object" : "entity",
      "id" : "CASREF",
      "uri_prefix" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=2031",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "database" : "Catalog of Fishes publications database",
      "fullname" : null,
      "name" : "Catalog of Fishes publications database",
      "datatype" : "entity",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=[example_id]"
   },
   "broad_neurospora" : {
      "example_id" : "BROAD_NEUROSPORA:7000007580576824",
      "abbreviation" : "Broad_NEUROSPORA",
      "object" : "entity",
      "id" : "Broad_NEUROSPORA",
      "uri_prefix" : null,
      "generic_url" : "http://www.broadinstitute.org/annotation/genome/neurospora/MultiHome.html",
      "url_example" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S7000007580576824",
      "database" : "Neurospora crassa Database",
      "fullname" : "Neurospora crassa database at the Broad Institute",
      "name" : "Neurospora crassa Database",
      "url_syntax" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S[example_id]",
      "datatype" : "entity"
   },
   "imgt_ligm" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://imgt.cines.fr",
      "database" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "fullname" : "Database of immunoglobulins and T cell receptors from human and other vertebrates, with translation for fully annotated sequences.",
      "name" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : "IMGT_LIGM:U03895",
      "abbreviation" : "IMGT_LIGM",
      "object" : "entity",
      "id" : "IMGT_LIGM"
   },
   "nif_subcellular" : {
      "name" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "url_syntax" : "http://www.neurolex.org/wiki/[example_id]",
      "datatype" : "entity",
      "url_example" : "http://www.neurolex.org/wiki/sao1770195789",
      "uri_prefix" : null,
      "generic_url" : "http://www.neurolex.org/wiki",
      "database" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "fullname" : null,
      "object" : "entity",
      "id" : "NIF_Subcellular",
      "example_id" : "NIF_Subcellular:sao1186862860",
      "abbreviation" : "NIF_Subcellular"
   },
   "rnamdb" : {
      "datatype" : "entity",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "name" : "RNA Modification Database",
      "database" : "RNA Modification Database",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "id" : "RNAmods",
      "object" : "entity",
      "abbreviation" : "RNAMDB",
      "example_id" : "RNAmods:037"
   },
   "fypo" : {
      "id" : "FYPO",
      "object" : "entity",
      "abbreviation" : "FYPO",
      "example_id" : "FYPO:0000001",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Fission Yeast Phenotype Ontology",
      "database" : "Fission Yeast Phenotype Ontology",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.pombase.org/"
   },
   "casspc" : {
      "example_id" : null,
      "abbreviation" : "CASSPC",
      "object" : "entity",
      "id" : "CASSPC",
      "uri_prefix" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "database" : "Catalog of Fishes species database",
      "fullname" : null,
      "name" : "Catalog of Fishes species database",
      "datatype" : "entity",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=[example_id]"
   },
   "dictybase_ref" : {
      "database" : "dictyBase literature references",
      "fullname" : null,
      "generic_url" : "http://dictybase.org",
      "uri_prefix" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "datatype" : "entity",
      "name" : "dictyBase literature references",
      "abbreviation" : "dictyBase_REF",
      "example_id" : "dictyBase_REF:10157",
      "id" : "dictyBase_REF",
      "object" : "entity"
   },
   "ntnu_sb" : {
      "fullname" : null,
      "database" : "Norwegian University of Science and Technology, Systems Biology team",
      "generic_url" : "http://www.ntnu.edu/nt/systemsbiology",
      "uri_prefix" : null,
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Norwegian University of Science and Technology, Systems Biology team",
      "abbreviation" : "NTNU_SB",
      "example_id" : null,
      "id" : "NTNU_SB",
      "object" : "entity"
   },
   "ipi" : {
      "abbreviation" : "IPI",
      "example_id" : "IPI:IPI00000005.1",
      "id" : "IPI",
      "object" : "entity",
      "database" : "International Protein Index",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/IPI/IPIhelp.html",
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "International Protein Index"
   },
   "ma" : {
      "example_id" : "MA:0000003",
      "abbreviation" : "MA",
      "object" : "entity",
      "id" : "MA",
      "generic_url" : "http://www.informatics.jax.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:0000003",
      "database" : "Adult Mouse Anatomical Dictionary",
      "fullname" : "Adult Mouse Anatomical Dictionary; part of Gene Expression Database",
      "name" : "Adult Mouse Anatomical Dictionary",
      "url_syntax" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:[example_id]",
      "datatype" : "entity"
   },
   "rebase" : {
      "name" : "REBASE restriction enzyme database",
      "datatype" : "entity",
      "url_syntax" : "http://rebase.neb.com/rebase/enz/[example_id].html",
      "generic_url" : "http://rebase.neb.com/rebase/rebase.html",
      "uri_prefix" : null,
      "url_example" : "http://rebase.neb.com/rebase/enz/EcoRI.html",
      "database" : "REBASE restriction enzyme database",
      "fullname" : null,
      "object" : "entity",
      "id" : "REBASE",
      "example_id" : "REBASE:EcoRI",
      "abbreviation" : "REBASE"
   },
   "seed" : {
      "object" : "entity",
      "id" : "SEED",
      "example_id" : "SEED:fig|83331.1.peg.1",
      "abbreviation" : "SEED",
      "name" : "The SEED;",
      "url_syntax" : "http://www.theseed.org/linkin.cgi?id=[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "url_example" : "http://www.theseed.org/linkin.cgi?id=fig|83331.1.peg.1",
      "generic_url" : "http://www.theseed.org",
      "database" : "The SEED;",
      "fullname" : "Project to annotate the first 1000 sequenced genomes, develop detailed metabolic reconstructions, and construct the corresponding stoichiometric matrices"
   },
   "ppi" : {
      "abbreviation" : "PPI",
      "example_id" : null,
      "id" : "PPI",
      "object" : "entity",
      "database" : "Pseudomonas syringae community annotation project",
      "fullname" : null,
      "generic_url" : "http://genome.pseudomonas-syringae.org/",
      "uri_prefix" : null,
      "url_example" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Pseudomonas syringae community annotation project"
   },
   "protein_id" : {
      "abbreviation" : "protein_id",
      "example_id" : "protein_id:CAA71991",
      "id" : "protein_id",
      "object" : "protein",
      "fullname" : "protein identifier shared by DDBJ/EMBL-bank/GenBank nucleotide sequence databases",
      "database" : "DDBJ / ENA / GenBank",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "datatype" : "protein",
      "url_syntax" : null,
      "name" : "DDBJ / ENA / GenBank"
   },
   "pubchem_substance" : {
      "database" : "NCBI PubChem database of chemical substances",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=4594",
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=[example_id]",
      "datatype" : "chemical entity",
      "name" : "NCBI PubChem database of chemical substances",
      "abbreviation" : "PubChem_Substance",
      "example_id" : "PubChem_Substance:4594",
      "id" : "PubChem_Substance",
      "object" : "chemical entity"
   },
   "phenoscape" : {
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://phenoscape.org/",
      "database" : "PhenoScape Knowledgebase",
      "fullname" : null,
      "name" : "PhenoScape Knowledgebase",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : null,
      "abbreviation" : "PhenoScape",
      "object" : "entity",
      "id" : "PhenoScape"
   },
   "lifedb" : {
      "object" : "entity",
      "id" : "LIFEdb",
      "example_id" : "LIFEdb:DKFZp564O1716",
      "abbreviation" : "LIFEdb",
      "name" : "LifeDB",
      "url_syntax" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=[example_id]",
      "datatype" : "entity",
      "url_example" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=DKFZp564O1716",
      "uri_prefix" : null,
      "generic_url" : "http://www.lifedb.de/",
      "database" : "LifeDB",
      "fullname" : "LifeDB is a database for information on protein localization, interaction, functional assays and expression."
   },
   "aspgd" : {
      "example_id" : "AspGD:ASPL0000067538",
      "abbreviation" : "AspGD",
      "object" : "gene",
      "id" : "AspGD",
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "fullname" : null,
      "database" : "Aspergillus Genome Database",
      "name" : "Aspergillus Genome Database",
      "datatype" : "gene",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]"
   },
   "fbbt" : {
      "database" : "Drosophila gross anatomy",
      "fullname" : null,
      "url_example" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:00005177",
      "uri_prefix" : null,
      "generic_url" : "http://flybase.org/",
      "url_syntax" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:[example_id]",
      "datatype" : "entity",
      "name" : "Drosophila gross anatomy",
      "abbreviation" : "FBbt",
      "example_id" : "FBbt:00005177",
      "id" : "FBbt",
      "object" : "entity"
   },
   "parkinsonsuk-ucl" : {
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Parkinsons Disease Gene Ontology Initiative",
      "fullname" : null,
      "database" : "Parkinsons Disease Gene Ontology Initiative",
      "uri_prefix" : null,
      "generic_url" : "http://www.ucl.ac.uk/functional-gene-annotation/neurological",
      "url_example" : null,
      "id" : "ParkinsonsUK-UCL",
      "object" : "entity",
      "abbreviation" : "ParkinsonsUK-UCL",
      "example_id" : null
   },
   "poc" : {
      "abbreviation" : "POC",
      "example_id" : null,
      "id" : "POC",
      "object" : "entity",
      "database" : "Plant Ontology Consortium",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.plantontology.org/",
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Plant Ontology Consortium"
   },
   "flybase" : {
      "fullname" : null,
      "database" : "FlyBase",
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "uri_prefix" : null,
      "generic_url" : "http://flybase.org/",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "datatype" : "gene",
      "name" : "FlyBase",
      "abbreviation" : "FLYBASE",
      "example_id" : "FB:FBgn0000024",
      "id" : "FB",
      "object" : "gene"
   },
   "biomd" : {
      "name" : "BioModels Database",
      "datatype" : "entity",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "database" : "BioModels Database",
      "fullname" : null,
      "object" : "entity",
      "id" : "BIOMD",
      "example_id" : "BIOMD:BIOMD0000000045",
      "abbreviation" : "BIOMD"
   },
   "refseq" : {
      "datatype" : "protein",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "name" : "RefSeq",
      "fullname" : null,
      "database" : "RefSeq",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=XP_001068954",
      "id" : "RefSeq",
      "object" : "protein",
      "abbreviation" : "RefSeq",
      "example_id" : "RefSeq:XP_001068954"
   },
   "roslin_institute" : {
      "id" : "Roslin_Institute",
      "object" : "entity",
      "abbreviation" : "Roslin_Institute",
      "example_id" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Roslin Institute",
      "database" : "Roslin Institute",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.roslin.ac.uk/"
   },
   "mips_funcat" : {
      "object" : "entity",
      "id" : "MIPS_funcat",
      "example_id" : "MIPS_funcat:11.02",
      "abbreviation" : "MIPS_funcat",
      "name" : "MIPS Functional Catalogue",
      "datatype" : "entity",
      "url_syntax" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=[example_id]",
      "generic_url" : "http://mips.gsf.de/proj/funcatDB/",
      "uri_prefix" : null,
      "url_example" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=11.02",
      "database" : "MIPS Functional Catalogue",
      "fullname" : null
   },
   "gorel" : {
      "id" : "GOREL",
      "object" : "entity",
      "abbreviation" : "GOREL",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "GO Extensions to OBO Relation Ontology Ontology",
      "fullname" : "Additional relations pending addition into RO",
      "database" : "GO Extensions to OBO Relation Ontology Ontology",
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "uri_prefix" : null,
      "url_example" : null
   },
   "dflat" : {
      "database" : "Developmental FunctionaL Annotation at Tufts",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://bcb.cs.tufts.edu/dflat/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Developmental FunctionaL Annotation at Tufts",
      "abbreviation" : "DFLAT",
      "example_id" : null,
      "id" : "DFLAT",
      "object" : "entity"
   },
   "psi-mod" : {
      "uri_prefix" : null,
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "fullname" : null,
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "name" : "Proteomics Standards Initiative protein modification ontology",
      "datatype" : "entity",
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "example_id" : "MOD:00219",
      "abbreviation" : "PSI-MOD",
      "object" : "entity",
      "id" : "PSI-MOD"
   },
   "merops_fam" : {
      "abbreviation" : "MEROPS_fam",
      "example_id" : "MEROPS_fam:M18",
      "id" : "MEROPS_fam",
      "object" : "entity",
      "database" : "MEROPS peptidase database",
      "fullname" : null,
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=m18",
      "uri_prefix" : null,
      "generic_url" : "http://merops.sanger.ac.uk/",
      "datatype" : "entity",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=[example_id]",
      "name" : "MEROPS peptidase database"
   },
   "iuphar_gpcr" : {
      "database" : "International Union of Pharmacology",
      "fullname" : null,
      "url_example" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=13",
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/",
      "datatype" : "entity",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=[example_id]",
      "name" : "International Union of Pharmacology",
      "abbreviation" : "IUPHAR_GPCR",
      "example_id" : "IUPHAR_GPCR:1279",
      "id" : "IUPHAR_GPCR",
      "object" : "entity"
   },
   "hgnc_gene" : {
      "database" : "HUGO Gene Nomenclature Committee",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?app_sym=ABCA1",
      "generic_url" : "http://www.genenames.org/",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?app_sym=[example_id]",
      "datatype" : "entity",
      "name" : "HUGO Gene Nomenclature Committee",
      "abbreviation" : "HGNC_gene",
      "example_id" : "HGNC_gene:ABCA1",
      "id" : "HGNC_gene",
      "object" : "entity"
   },
   "dbsnp" : {
      "name" : "NCBI dbSNP",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=[example_id]",
      "url_example" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=rs3131969",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/projects/SNP",
      "fullname" : null,
      "database" : "NCBI dbSNP",
      "object" : "entity",
      "id" : "dbSNP",
      "example_id" : "dbSNP:rs3131969",
      "abbreviation" : "dbSNP"
   },
   "asap" : {
      "name" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "url_syntax" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=[example_id]",
      "datatype" : "gene",
      "uri_prefix" : null,
      "generic_url" : "https://asap.ahabs.wisc.edu/annotation/php/ASAP1.htm",
      "url_example" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=ABE-0000008",
      "database" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "fullname" : null,
      "object" : "gene",
      "id" : "ASAP",
      "example_id" : "ASAP:ABE-0000008",
      "abbreviation" : "ASAP"
   },
   "mengo" : {
      "generic_url" : "http://mengo.vbi.vt.edu/",
      "uri_prefix" : null,
      "url_example" : null,
      "database" : "Microbial ENergy processes Gene Ontology Project",
      "fullname" : null,
      "name" : "Microbial ENergy processes Gene Ontology Project",
      "url_syntax" : null,
      "datatype" : "entity",
      "example_id" : null,
      "abbreviation" : "MENGO",
      "object" : "entity",
      "id" : "MENGO"
   },
   "jcvi_genprop" : {
      "id" : "JCVI_GenProp",
      "object" : "biological_process",
      "abbreviation" : "JCVI_GenProp",
      "example_id" : "JCVI_GenProp:GenProp0120",
      "datatype" : "biological_process",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "name" : "Genome Properties database at the J. Craig Venter Institute",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120"
   },
   "interpro" : {
      "name" : "InterPro database of protein domains and motifs",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "datatype" : "polypeptide region",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "database" : "InterPro database of protein domains and motifs",
      "fullname" : null,
      "object" : "polypeptide region",
      "id" : "InterPro",
      "example_id" : "InterPro:IPR000001",
      "abbreviation" : "INTERPRO"
   },
   "ncbigene" : {
      "datatype" : "gene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "name" : "NCBI Gene",
      "database" : "NCBI Gene",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "id" : "NCBI_Gene",
      "object" : "gene",
      "abbreviation" : "NCBIGene",
      "example_id" : "NCBI_Gene:4771"
   },
   "ddb" : {
      "name" : "dictyBase",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "datatype" : "gene",
      "uri_prefix" : null,
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "generic_url" : "http://dictybase.org",
      "database" : "dictyBase",
      "fullname" : null,
      "object" : "gene",
      "id" : "dictyBase",
      "example_id" : "dictyBase:DDB_G0277859",
      "abbreviation" : "DDB"
   },
   "gene3d" : {
      "abbreviation" : "Gene3D",
      "example_id" : "Gene3D:G3DSA:3.30.390.30",
      "id" : "Gene3D",
      "object" : "entity",
      "database" : "Domain Architecture Classification",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://gene3d.biochem.ucl.ac.uk/Gene3D/",
      "url_example" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=G3DSA%3A3.30.390.30",
      "datatype" : "entity",
      "url_syntax" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=[example_id]",
      "name" : "Domain Architecture Classification"
   },
   "tigr_ref" : {
      "abbreviation" : "TIGR_REF",
      "example_id" : "JCVI_REF:GO_ref",
      "id" : "JCVI_REF",
      "object" : "entity",
      "database" : "J. Craig Venter Institute",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "generic_url" : "http://cmr.jcvi.org/",
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "J. Craig Venter Institute"
   },
   "tgd_ref" : {
      "generic_url" : "http://www.ciliate.org/",
      "uri_prefix" : null,
      "url_example" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=T000005818",
      "database" : "Tetrahymena Genome Database",
      "fullname" : null,
      "name" : "Tetrahymena Genome Database",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : "entity",
      "example_id" : "TGD_REF:T000005818",
      "abbreviation" : "TGD_REF",
      "object" : "entity",
      "id" : "TGD_REF"
   },
   "ri" : {
      "id" : "Roslin_Institute",
      "object" : "entity",
      "abbreviation" : "RI",
      "example_id" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Roslin Institute",
      "database" : "Roslin Institute",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.roslin.ac.uk/"
   },
   "sgd" : {
      "generic_url" : "http://www.yeastgenome.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.yeastgenome.org/locus/S000006169/overview",
      "fullname" : null,
      "database" : "Saccharomyces Genome Database",
      "name" : "Saccharomyces Genome Database",
      "url_syntax" : "http://www.yeastgenome.org/locus/[example_id]/overview",
      "datatype" : "gene",
      "example_id" : "SGD:S000006169",
      "abbreviation" : "SGD",
      "object" : "gene",
      "id" : "SGD"
   },
   "obo_sf_po" : {
      "example_id" : "OBO_SF_PO:3184921",
      "abbreviation" : "OBO_SF_PO",
      "object" : "entity",
      "id" : "OBO_SF_PO",
      "uri_prefix" : null,
      "generic_url" : "http://sourceforge.net/tracker/?func=browse&group_id=76834&atid=835555",
      "url_example" : "https://sourceforge.net/tracker/index.php?func=detail&aid=3184921&group_id=76834&atid=835555",
      "database" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "fullname" : null,
      "name" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "url_syntax" : "https://sourceforge.net/tracker/index.php?func=detail&aid=[example_id]&group_id=76834&atid=835555",
      "datatype" : "entity"
   },
   "gonuts" : {
      "database" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "fullname" : "Third party documentation for GO and community annotation system.",
      "uri_prefix" : null,
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MOUSE:CD28",
      "generic_url" : "http://gowiki.tamu.edu",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "datatype" : "entity",
      "name" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "abbreviation" : "GONUTS",
      "example_id" : "GONUTS:MOUSE:CD28",
      "id" : "GONUTS",
      "object" : "entity"
   },
   "cgsc" : {
      "abbreviation" : "CGSC",
      "example_id" : "CGSC:rbsK",
      "id" : "CGSC",
      "object" : "entity",
      "database" : "CGSC",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cgsc.biology.yale.edu/",
      "url_example" : "http://cgsc.biology.yale.edu/Site.php?ID=315",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "CGSC"
   },
   "cas" : {
      "example_id" : "CAS:58-08-2",
      "abbreviation" : "CAS",
      "object" : "entity",
      "id" : "CAS",
      "uri_prefix" : null,
      "generic_url" : "http://www.cas.org/expertise/cascontent/registry/index.html",
      "url_example" : null,
      "database" : "CAS Chemical Registry",
      "fullname" : "CAS REGISTRY is the most authoritative collection of disclosed chemical substance information, containing more than 54 million organic and inorganic substances and 62 million sequences. CAS REGISTRY covers substances identified from the scientific literature from 1957 to the present, with additional substances going back to the early 1900s.",
      "name" : "CAS Chemical Registry",
      "datatype" : "entity",
      "url_syntax" : null
   },
   "jcvi_ref" : {
      "name" : "J. Craig Venter Institute",
      "datatype" : "entity",
      "url_syntax" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "database" : "J. Craig Venter Institute",
      "fullname" : null,
      "object" : "entity",
      "id" : "JCVI_REF",
      "example_id" : "JCVI_REF:GO_ref",
      "abbreviation" : "JCVI_REF"
   },
   "geo" : {
      "name" : "NCBI Gene Expression Omnibus",
      "datatype" : "entity",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/geo/",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=GDS2223",
      "database" : "NCBI Gene Expression Omnibus",
      "fullname" : null,
      "object" : "entity",
      "id" : "GEO",
      "example_id" : "GEO:GDS2223",
      "abbreviation" : "GEO"
   },
   "ensemblfungi" : {
      "id" : "EnsemblFungi",
      "object" : "gene",
      "abbreviation" : "EnsemblFungi",
      "example_id" : "EnsemblFungi:YOR197W",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "datatype" : "gene",
      "name" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "database" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/YOR197W",
      "generic_url" : "http://fungi.ensembl.org/"
   },
   "corum" : {
      "example_id" : "CORUM:837",
      "abbreviation" : "CORUM",
      "object" : "entity",
      "id" : "CORUM",
      "generic_url" : "http://mips.gsf.de/genre/proj/corum/",
      "uri_prefix" : null,
      "url_example" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=837",
      "database" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "fullname" : null,
      "name" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "datatype" : "entity",
      "url_syntax" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=[example_id]"
   },
   "tigr_genprop" : {
      "example_id" : "JCVI_GenProp:GenProp0120",
      "abbreviation" : "TIGR_GenProp",
      "object" : "biological_process",
      "id" : "JCVI_GenProp",
      "uri_prefix" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "fullname" : null,
      "name" : "Genome Properties database at the J. Craig Venter Institute",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "datatype" : "biological_process"
   },
   "ensembl_proteinid" : {
      "name" : "Ensembl database of automatically annotated genomic data",
      "datatype" : "protein",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "url_example" : "http://www.ensembl.org/id/ENSP00000361027",
      "uri_prefix" : null,
      "generic_url" : "http://www.ensembl.org/",
      "fullname" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "object" : "protein",
      "id" : "ENSEMBL_ProteinID",
      "example_id" : "ENSEMBL_ProteinID:ENSP00000361027",
      "abbreviation" : "ENSEMBL_ProteinID"
   },
   "pubchem_compound" : {
      "object" : "chemical entity",
      "id" : "PubChem_Compound",
      "example_id" : "PubChem_Compound:2244",
      "abbreviation" : "PubChem_Compound",
      "name" : "NCBI PubChem database of chemical structures",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=[example_id]",
      "datatype" : "chemical entity",
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=2244",
      "database" : "NCBI PubChem database of chemical structures",
      "fullname" : null
   },
   "smart" : {
      "id" : "SMART",
      "object" : "polypeptide region",
      "abbreviation" : "SMART",
      "example_id" : "SMART:SM00005",
      "url_syntax" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=[example_id]",
      "datatype" : "polypeptide region",
      "name" : "Simple Modular Architecture Research Tool",
      "database" : "Simple Modular Architecture Research Tool",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://smart.embl-heidelberg.de/",
      "url_example" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=SM00005"
   },
   "wbls" : {
      "object" : "nematoda life stage",
      "id" : "WBls",
      "example_id" : "WBls:0000010",
      "abbreviation" : "WBls",
      "name" : "C. elegans development",
      "datatype" : "nematoda life stage",
      "url_syntax" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "C. elegans development",
      "fullname" : null
   },
   "wb_ref" : {
      "id" : "WB_REF",
      "object" : "entity",
      "abbreviation" : "WB_REF",
      "example_id" : "WB_REF:WBPaper00004823",
      "datatype" : "entity",
      "url_syntax" : "http://www.wormbase.org/db/misc/paper?name=[example_id]",
      "name" : "WormBase database of nematode biology",
      "database" : "WormBase database of nematode biology",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "url_example" : "http://www.wormbase.org/db/misc/paper?name=WBPaper00004823"
   },
   "enzyme" : {
      "id" : "ENZYME",
      "object" : "entity",
      "abbreviation" : "ENZYME",
      "example_id" : "ENZYME:EC 1.1.1.1",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?[example_id]",
      "datatype" : "entity",
      "name" : "Swiss Institute of Bioinformatics enzyme database",
      "database" : "Swiss Institute of Bioinformatics enzyme database",
      "fullname" : null,
      "url_example" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?1.1.1.1",
      "uri_prefix" : null,
      "generic_url" : "http://www.expasy.ch/"
   },
   "imgt_hla" : {
      "abbreviation" : "IMGT_HLA",
      "example_id" : "IMGT_HLA:HLA00031",
      "id" : "IMGT_HLA",
      "object" : "entity",
      "database" : "IMGT/HLA human major histocompatibility complex sequence database",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/imgt/hla",
      "url_example" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "IMGT/HLA human major histocompatibility complex sequence database"
   },
   "h-invdb_cdna" : {
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=[example_id]",
      "datatype" : "entity",
      "name" : "H-invitational Database",
      "fullname" : null,
      "database" : "H-invitational Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.h-invitational.jp/",
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=AK093149",
      "id" : "H-invDB_cDNA",
      "object" : "entity",
      "abbreviation" : "H-invDB_cDNA",
      "example_id" : "H-invDB_cDNA:AK093148"
   },
   "psi-mi" : {
      "abbreviation" : "PSI-MI",
      "example_id" : "MI:0018",
      "id" : "PSI-MI",
      "object" : "entity",
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "url_example" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Proteomic Standard Initiative for Molecular Interaction"
   },
   "pato" : {
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.bioontology.org/wiki/index.php/PATO:Main_Page",
      "database" : "Phenotypic quality ontology",
      "fullname" : null,
      "name" : "Phenotypic quality ontology",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : "PATO:0001420",
      "abbreviation" : "PATO",
      "object" : "entity",
      "id" : "PATO"
   },
   "wb" : {
      "object" : "protein",
      "id" : "WB",
      "example_id" : "WB:WBGene00003001",
      "abbreviation" : "WB",
      "name" : "WormBase database of nematode biology",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "datatype" : "protein",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase database of nematode biology",
      "fullname" : null
   },
   "hpa_antibody" : {
      "url_example" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=HPA000237",
      "uri_prefix" : null,
      "generic_url" : "http://www.proteinatlas.org/",
      "database" : "Human Protein Atlas antibody information",
      "fullname" : null,
      "name" : "Human Protein Atlas antibody information",
      "url_syntax" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=[example_id]",
      "datatype" : "entity",
      "example_id" : "HPA_antibody:HPA000237",
      "abbreviation" : "HPA_antibody",
      "object" : "entity",
      "id" : "HPA_antibody"
   },
   "panther" : {
      "fullname" : null,
      "database" : "Protein ANalysis THrough Evolutionary Relationships Classification System",
      "uri_prefix" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "url_example" : "http://www.pantherdb.org/panther/lookupId.jsp?id=PTHR10000",
      "datatype" : "protein family",
      "url_syntax" : "http://www.pantherdb.org/panther/lookupId.jsp?id=[example_id]",
      "name" : "Protein ANalysis THrough Evolutionary Relationships Classification System",
      "abbreviation" : "PANTHER",
      "example_id" : "PANTHER:PTHR11455",
      "id" : "PANTHER",
      "object" : "protein family"
   },
   "uniparc" : {
      "object" : "entity",
      "id" : "UniParc",
      "example_id" : "UniParc:UPI000000000A",
      "abbreviation" : "UniParc",
      "name" : "UniProt Archive",
      "datatype" : "entity",
      "url_syntax" : "http://www.uniprot.org/uniparc/[example_id]",
      "url_example" : "http://www.uniprot.org/uniparc/UPI000000000A",
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org/uniparc/",
      "database" : "UniProt Archive",
      "fullname" : "A non-redundant archive of protein sequences extracted from Swiss-Prot, TrEMBL, PIR-PSD, EMBL, Ensembl, IPI, PDB, RefSeq, FlyBase, WormBase, European Patent Office, United States Patent and Trademark Office, and Japanese Patent Office"
   },
   "jcvi_tigrfams" : {
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "uri_prefix" : null,
      "generic_url" : "http://search.jcvi.org/",
      "fullname" : null,
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "name" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "datatype" : "polypeptide region",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "abbreviation" : "JCVI_TIGRFAMS",
      "object" : "polypeptide region",
      "id" : "JCVI_TIGRFAMS"
   },
   "um-bbd_pathwayid" : {
      "fullname" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "url_example" : "http://umbbd.msi.umn.edu/acr/acr_map.html",
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "datatype" : "entity",
      "url_syntax" : "http://umbbd.msi.umn.edu/[example_id]/[example_id]_map.html",
      "name" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "abbreviation" : "UM-BBD_pathwayID",
      "example_id" : "UM-BBD_pathwayID:acr",
      "id" : "UM-BBD_pathwayID",
      "object" : "entity"
   },
   "rnacentral" : {
      "name" : "RNAcentral",
      "url_syntax" : "http://rnacentral.org/rna/[example_id]",
      "datatype" : "ribonucleic acid",
      "url_example" : "http://rnacentral.org/rna/URS000047C79B_9606",
      "uri_prefix" : null,
      "generic_url" : "http://rnacentral.org",
      "database" : "RNAcentral",
      "fullname" : "An international database of ncRNA sequences",
      "object" : "ribonucleic acid",
      "id" : "RNAcentral",
      "example_id" : "RNAcentral:URS000047C79B_9606",
      "abbreviation" : "RNAcentral"
   },
   "aspgd_ref" : {
      "name" : "Aspergillus Genome Database",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : "entity",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=90",
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "database" : "Aspergillus Genome Database",
      "fullname" : null,
      "object" : "entity",
      "id" : "AspGD_REF",
      "example_id" : "AspGD_REF:90",
      "abbreviation" : "AspGD_REF"
   },
   "zfin" : {
      "object" : "variation",
      "id" : "ZFIN",
      "example_id" : "ZFIN:ZDB-GENE-990415-103",
      "abbreviation" : "ZFIN",
      "name" : "Zebrafish Information Network",
      "url_syntax" : "http://zfin.org/cgi-bin/ZFIN_jump?record=[example_id]",
      "datatype" : "variation",
      "uri_prefix" : null,
      "generic_url" : "http://zfin.org/",
      "url_example" : "http://zfin.org/cgi-bin/ZFIN_jump?record=ZDB-GENE-990415-103",
      "database" : "Zebrafish Information Network",
      "fullname" : null
   },
   "hgnc" : {
      "database" : "HUGO Gene Nomenclature Committee",
      "fullname" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:29",
      "uri_prefix" : null,
      "generic_url" : "http://www.genenames.org/",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:[example_id]",
      "datatype" : "gene",
      "name" : "HUGO Gene Nomenclature Committee",
      "abbreviation" : "HGNC",
      "example_id" : "HGNC:29",
      "id" : "HGNC",
      "object" : "gene"
   },
   "mod" : {
      "example_id" : "MOD:00219",
      "abbreviation" : "MOD",
      "object" : "entity",
      "id" : "PSI-MOD",
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "uri_prefix" : null,
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "fullname" : null,
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "name" : "Proteomics Standards Initiative protein modification ontology",
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "datatype" : "entity"
   },
   "ddbj" : {
      "database" : "DNA Databank of Japan",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "url_example" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=AA816246",
      "url_syntax" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=[example_id]",
      "datatype" : "entity",
      "name" : "DNA Databank of Japan",
      "abbreviation" : "DDBJ",
      "example_id" : "DDBJ:AA816246",
      "id" : "DDBJ",
      "object" : "entity"
   },
   "agbase" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.agbase.msstate.edu/",
      "url_example" : null,
      "database" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "fullname" : null,
      "name" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "url_syntax" : "http://www.agbase.msstate.edu/cgi-bin/getEntry.pl?db_pick=[ChickGO/MaizeGO]&uid=[example_id]",
      "datatype" : "entity",
      "example_id" : null,
      "abbreviation" : "AgBase",
      "object" : "entity",
      "id" : "AgBase"
   },
   "ecocyc_ref" : {
      "example_id" : "EcoCyc_REF:COLISALII",
      "abbreviation" : "ECOCYC_REF",
      "object" : "entity",
      "id" : "EcoCyc_REF",
      "uri_prefix" : null,
      "url_example" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=COLISALII",
      "generic_url" : "http://ecocyc.org/",
      "database" : "Encyclopedia of E. coli metabolism",
      "fullname" : null,
      "name" : "Encyclopedia of E. coli metabolism",
      "url_syntax" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=[example_id]",
      "datatype" : "entity"
   },
   "psort" : {
      "database" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.psort.org/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "abbreviation" : "PSORT",
      "example_id" : null,
      "id" : "PSORT",
      "object" : "entity"
   },
   "cdd" : {
      "id" : "CDD",
      "object" : "entity",
      "abbreviation" : "CDD",
      "example_id" : "CDD:34222",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=[example_id]",
      "datatype" : "entity",
      "name" : "Conserved Domain Database at NCBI",
      "database" : "Conserved Domain Database at NCBI",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=cdd",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=34222"
   },
   "vida" : {
      "id" : "VIDA",
      "object" : "entity",
      "abbreviation" : "VIDA",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Virus Database at University College London",
      "database" : "Virus Database at University College London",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.biochem.ucl.ac.uk/bsm/virus_database/VIDA.html"
   },
   "pamgo" : {
      "example_id" : null,
      "abbreviation" : "PAMGO",
      "object" : "entity",
      "id" : "PAMGO",
      "uri_prefix" : null,
      "generic_url" : "http://pamgo.vbi.vt.edu/",
      "url_example" : null,
      "database" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "fullname" : null,
      "name" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "datatype" : "entity",
      "url_syntax" : null
   },
   "dictybase_gene_name" : {
      "object" : "entity",
      "id" : "dictyBase_gene_name",
      "example_id" : "dictyBase_gene_name:mlcE",
      "abbreviation" : "dictyBase_gene_name",
      "name" : "dictyBase",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "url_example" : "http://dictybase.org/gene/mlcE",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "database" : "dictyBase"
   },
   "pubchem_bioassay" : {
      "datatype" : "entity",
      "url_syntax" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=[example_id]",
      "name" : "NCBI PubChem database of bioassay records",
      "database" : "NCBI PubChem database of bioassay records",
      "fullname" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "url_example" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=177",
      "id" : "PubChem_BioAssay",
      "object" : "entity",
      "abbreviation" : "PubChem_BioAssay",
      "example_id" : "PubChem_BioAssay:177"
   },
   "pompep" : {
      "example_id" : "Pompep:SPAC890.04C",
      "abbreviation" : "Pompep",
      "object" : "entity",
      "id" : "Pompep",
      "uri_prefix" : null,
      "generic_url" : "ftp://ftp.sanger.ac.uk/pub/yeast/pombe/Protein_data/",
      "url_example" : null,
      "database" : "Schizosaccharomyces pombe protein data",
      "fullname" : null,
      "name" : "Schizosaccharomyces pombe protein data",
      "datatype" : "entity",
      "url_syntax" : null
   },
   "bhf-ucl" : {
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology/",
      "fullname" : "The Cardiovascular Gene Ontology Annotation Initiative is supported by the British Heart Foundation (BHF) and located at University College London (UCL).",
      "database" : "Cardiovascular Gene Ontology Annotation Initiative",
      "name" : "Cardiovascular Gene Ontology Annotation Initiative",
      "datatype" : "entity",
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "BHF-UCL",
      "object" : "entity",
      "id" : "BHF-UCL"
   },
   "cgdid" : {
      "name" : "Candida Genome Database",
      "datatype" : "gene",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "uri_prefix" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "database" : "Candida Genome Database",
      "fullname" : null,
      "object" : "gene",
      "id" : "CGD",
      "example_id" : "CGD:CAL0005516",
      "abbreviation" : "CGDID"
   },
   "trait" : {
      "example_id" : null,
      "abbreviation" : "TRAIT",
      "object" : "entity",
      "id" : "TRAIT",
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "database" : "TRAnscript Integrated Table",
      "fullname" : "an integrated database of transcripts expressed in human skeletal muscle",
      "name" : "TRAnscript Integrated Table",
      "url_syntax" : null,
      "datatype" : "entity"
   },
   "aspgdid" : {
      "object" : "gene",
      "id" : "AspGD",
      "example_id" : "AspGD:ASPL0000067538",
      "abbreviation" : "AspGDID",
      "name" : "Aspergillus Genome Database",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "datatype" : "gene",
      "uri_prefix" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "database" : "Aspergillus Genome Database",
      "fullname" : null
   },
   "gr_qtl" : {
      "id" : "GR_QTL",
      "object" : "entity",
      "abbreviation" : "GR_QTL",
      "example_id" : "GR_QTL:CQU7",
      "datatype" : "entity",
      "url_syntax" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=[example_id]",
      "name" : "Gramene",
      "fullname" : null,
      "database" : "Gramene",
      "generic_url" : "http://www.gramene.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=CQU7"
   },
   "doi" : {
      "object" : "entity",
      "id" : "DOI",
      "example_id" : "DOI:10.1016/S0963-9969(99)00021-6",
      "abbreviation" : "DOI",
      "name" : "Digital Object Identifier",
      "url_syntax" : "http://dx.doi.org/DOI:[example_id]",
      "datatype" : "entity",
      "uri_prefix" : null,
      "url_example" : "http://dx.doi.org/DOI:10.1016/S0963-9969(99)00021-6",
      "generic_url" : "http://dx.doi.org/",
      "fullname" : null,
      "database" : "Digital Object Identifier"
   },
   "fb" : {
      "name" : "FlyBase",
      "datatype" : "gene",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "generic_url" : "http://flybase.org/",
      "uri_prefix" : null,
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "database" : "FlyBase",
      "fullname" : null,
      "object" : "gene",
      "id" : "FB",
      "example_id" : "FB:FBgn0000024",
      "abbreviation" : "FB"
   },
   "ensemblplants" : {
      "generic_url" : "http://plants.ensembl.org/",
      "uri_prefix" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "fullname" : null,
      "name" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "datatype" : "gene",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "abbreviation" : "EnsemblPlants",
      "object" : "gene",
      "id" : "EnsemblPlants/Gramene"
   },
   "tc" : {
      "name" : "Transport Protein Database",
      "datatype" : "protein",
      "url_syntax" : "http://www.tcdb.org/tcdb/index.php?tc=[example_id]",
      "url_example" : "http://www.tcdb.org/tcdb/index.php?tc=9.A.4.1.1",
      "uri_prefix" : null,
      "generic_url" : "http://www.tcdb.org/",
      "fullname" : null,
      "database" : "Transport Protein Database",
      "object" : "protein",
      "id" : "TC",
      "example_id" : "TC:9.A.4.1.1",
      "abbreviation" : "TC"
   },
   "sanger" : {
      "abbreviation" : "Sanger",
      "example_id" : null,
      "id" : "Sanger",
      "object" : "entity",
      "database" : "Wellcome Trust Sanger Institute",
      "fullname" : null,
      "generic_url" : "http://www.sanger.ac.uk/",
      "uri_prefix" : null,
      "url_example" : null,
      "datatype" : "entity",
      "url_syntax" : null,
      "name" : "Wellcome Trust Sanger Institute"
   },
   "hpa" : {
      "example_id" : "HPA:HPA000237",
      "abbreviation" : "HPA",
      "object" : "entity",
      "id" : "HPA",
      "uri_prefix" : null,
      "url_example" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=HPA000237",
      "generic_url" : "http://www.proteinatlas.org/",
      "database" : "Human Protein Atlas tissue profile information",
      "fullname" : null,
      "name" : "Human Protein Atlas tissue profile information",
      "url_syntax" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=[example_id]",
      "datatype" : "entity"
   },
   "pamgo_gat" : {
      "abbreviation" : "PAMGO_GAT",
      "example_id" : "PAMGO_GAT:Atu0001",
      "id" : "PAMGO_GAT",
      "object" : "entity",
      "database" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=atu0001",
      "generic_url" : "http://agro.vbi.vt.edu/public/",
      "datatype" : "entity",
      "url_syntax" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=[example_id]",
      "name" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group"
   },
   "agricola_id" : {
      "database" : "AGRICultural OnLine Access",
      "fullname" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://agricola.nal.usda.gov/",
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "AGRICultural OnLine Access",
      "abbreviation" : "AGRICOLA_ID",
      "example_id" : "AGRICOLA_NAL:TP248.2 P76 v.14",
      "id" : "AGRICOLA_ID",
      "object" : "entity"
   },
   "rfam" : {
      "example_id" : "Rfam:RF00012",
      "abbreviation" : "Rfam",
      "object" : "entity",
      "id" : "Rfam",
      "uri_prefix" : null,
      "generic_url" : "http://rfam.sanger.ac.uk/",
      "url_example" : "http://rfam.sanger.ac.uk/family/RF00012",
      "fullname" : null,
      "database" : "Rfam database of RNA families",
      "name" : "Rfam database of RNA families",
      "url_syntax" : "http://rfam.sanger.ac.uk/family/[example_id]",
      "datatype" : "entity"
   },
   "prints" : {
      "id" : "PRINTS",
      "object" : "polypeptide region",
      "abbreviation" : "PRINTS",
      "example_id" : "PRINTS:PR00025",
      "url_syntax" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=[example_id]",
      "datatype" : "polypeptide region",
      "name" : "PRINTS compendium of protein fingerprints",
      "database" : "PRINTS compendium of protein fingerprints",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=PR00025",
      "generic_url" : "http://www.bioinf.manchester.ac.uk/dbbrowser/PRINTS/"
   },
   "dictybase" : {
      "example_id" : "dictyBase:DDB_G0277859",
      "abbreviation" : "DictyBase",
      "object" : "gene",
      "id" : "dictyBase",
      "uri_prefix" : null,
      "generic_url" : "http://dictybase.org",
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "database" : "dictyBase",
      "fullname" : null,
      "name" : "dictyBase",
      "datatype" : "gene",
      "url_syntax" : "http://dictybase.org/gene/[example_id]"
   },
   "kegg_ligand" : {
      "name" : "KEGG LIGAND Database",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?cpd:[example_id]",
      "datatype" : "chemical entity",
      "generic_url" : "http://www.genome.ad.jp/kegg/docs/upd_ligand.html",
      "uri_prefix" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?cpd:C00577",
      "fullname" : null,
      "database" : "KEGG LIGAND Database",
      "object" : "chemical entity",
      "id" : "KEGG_LIGAND",
      "example_id" : "KEGG_LIGAND:C00577",
      "abbreviation" : "KEGG_LIGAND"
   },
   "pamgo_vmd" : {
      "abbreviation" : "PAMGO_VMD",
      "example_id" : "PAMGO_VMD:109198",
      "id" : "PAMGO_VMD",
      "object" : "entity",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "fullname" : "Virginia Bioinformatics Institute Microbial Database; member of PAMGO Interest Group",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "uri_prefix" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=109198",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=[example_id]",
      "datatype" : "entity",
      "name" : "Virginia Bioinformatics Institute Microbial Database"
   },
   "fma" : {
      "example_id" : "FMA:61905",
      "abbreviation" : "FMA",
      "object" : "entity",
      "id" : "FMA",
      "generic_url" : "http://sig.biostr.washington.edu/projects/fm/index.html",
      "uri_prefix" : null,
      "url_example" : null,
      "fullname" : null,
      "database" : "Foundational Model of Anatomy",
      "name" : "Foundational Model of Anatomy",
      "url_syntax" : null,
      "datatype" : "entity"
   },
   "eco" : {
      "url_syntax" : null,
      "datatype" : "entity",
      "name" : "Evidence Code ontology",
      "database" : "Evidence Code ontology",
      "fullname" : null,
      "uri_prefix" : null,
      "url_example" : null,
      "generic_url" : "http://www.geneontology.org/",
      "id" : "ECO",
      "object" : "entity",
      "abbreviation" : "ECO",
      "example_id" : "ECO:0000002"
   },
   "ncbi_gp" : {
      "id" : "NCBI_GP",
      "object" : "protein",
      "abbreviation" : "NCBI_GP",
      "example_id" : "NCBI_GP:EAL72968",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=[example_id]",
      "datatype" : "protein",
      "name" : "NCBI GenPept",
      "fullname" : null,
      "database" : "NCBI GenPept",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=EAL72968"
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
   },
   "qualifier" : {
      "context" : {
         "bbop.widgets.search_pane" : "amigo.handlers.qualifiers"
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
