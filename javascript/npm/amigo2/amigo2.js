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
amigo.version.revision = "2.1.1";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
amigo.version.release = "20140616";
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
   "ontology" : {
      "document_category" : "ontology_class",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ont-config.yaml",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0",
      "_strict" : 0,
      "display_name" : "Ontology",
      "weight" : "40",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ont-config.yaml",
      "fields_hash" : {
         "id" : {
            "property" : [
               "getIdentifier"
            ],
            "id" : "id",
            "cardinality" : "single",
            "description" : "Term identifier.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc"
         },
         "only_in_taxon_closure" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon (IDs)",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure",
            "description" : "Only in taxon closure.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "topology_graph_json" : {
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "cardinality" : "single",
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
            "id" : "topology_graph_json",
            "indexed" : "false",
            "searchable" : "false",
            "display_name" : "Topology graph (JSON)",
            "type" : "string",
            "transform" : []
         },
         "annotation_class_label" : {
            "display_name" : "Term",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "Identifier.",
            "cardinality" : "single",
            "property" : [
               "getLabel"
            ],
            "id" : "annotation_class_label"
         },
         "annotation_class" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Term",
            "searchable" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Term identifier.",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "id" : "annotation_class"
         },
         "only_in_taxon_label" : {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon",
            "cardinality" : "single",
            "description" : "Only in taxon label.",
            "required" : "false",
            "id" : "only_in_taxon_label",
            "property" : [
               "getLabel"
            ],
            "indexed" : "true"
         },
         "regulates_transitivity_graph_json" : {
            "searchable" : "false",
            "display_name" : "Regulates transitivity graph (JSON)",
            "transform" : [],
            "type" : "string",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "single",
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
            "id" : "regulates_transitivity_graph_json",
            "indexed" : "false"
         },
         "source" : {
            "display_name" : "Ontology source",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ],
            "id" : "source",
            "description" : "Term namespace.",
            "required" : "false",
            "cardinality" : "single"
         },
         "comment" : {
            "searchable" : "true",
            "display_name" : "Comment",
            "transform" : [],
            "type" : "string",
            "description" : "Term comment.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [
               "getComment"
            ],
            "id" : "comment",
            "indexed" : "true"
         },
         "only_in_taxon_closure_label" : {
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure_label",
            "required" : "false",
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon"
         },
         "alternate_id" : {
            "display_name" : "Alt ID",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "id" : "alternate_id",
            "description" : "Alternate term identifier.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "consider" : {
            "cardinality" : "multi",
            "description" : "Others terms you might want to look at.",
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "id" : "consider",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Consider",
            "transform" : [],
            "type" : "string"
         },
         "description" : {
            "searchable" : "true",
            "display_name" : "Definition",
            "type" : "string",
            "transform" : [],
            "description" : "Term definition.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "description",
            "property" : [
               "getDef"
            ],
            "indexed" : "true"
         },
         "regulates_closure" : {
            "display_name" : "Ancestor",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ]
         },
         "synonym" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonyms",
            "searchable" : "true",
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "Term synonyms.",
            "required" : "false",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         "subset" : {
            "property" : [
               "getSubsets"
            ],
            "id" : "subset",
            "description" : "Special use collections of terms.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Subset",
            "transform" : [],
            "type" : "string"
         },
         "is_obsolete" : {
            "indexed" : "true",
            "description" : "Is the term obsolete?",
            "required" : "false",
            "cardinality" : "single",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "id" : "is_obsolete",
            "display_name" : "Obsoletion",
            "transform" : [],
            "type" : "boolean",
            "searchable" : "false"
         },
         "replaced_by" : {
            "indexed" : "true",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false",
            "description" : "Term that replaces this term.",
            "cardinality" : "multi",
            "display_name" : "Replaced By",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "isa_partof_closure_label" : {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "indexed" : "true"
         },
         "isa_partof_closure" : {
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "isa_partof_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Is-a/part-of"
         },
         "only_in_taxon" : {
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "id" : "only_in_taxon",
            "description" : "Only in taxon.",
            "cardinality" : "single",
            "required" : "false",
            "display_name" : "Only in taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         "regulates_closure_label" : {
            "indexed" : "true",
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
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ancestor",
            "searchable" : "true"
         },
         "definition_xref" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Def xref",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         },
         "database_xref" : {
            "searchable" : "false",
            "display_name" : "DB xref",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getXref"
            ],
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "indexed" : "true"
         }
      },
      "fields" : [
         {
            "property" : [
               "getIdentifier"
            ],
            "id" : "id",
            "cardinality" : "single",
            "description" : "Term identifier.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Term",
            "searchable" : "false",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Term identifier.",
            "required" : "false",
            "property" : [
               "getIdentifier"
            ],
            "id" : "annotation_class"
         },
         {
            "display_name" : "Term",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "Identifier.",
            "cardinality" : "single",
            "property" : [
               "getLabel"
            ],
            "id" : "annotation_class_label"
         },
         {
            "searchable" : "true",
            "display_name" : "Definition",
            "type" : "string",
            "transform" : [],
            "description" : "Term definition.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "description",
            "property" : [
               "getDef"
            ],
            "indexed" : "true"
         },
         {
            "display_name" : "Ontology source",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getNamespace"
            ],
            "id" : "source",
            "description" : "Term namespace.",
            "required" : "false",
            "cardinality" : "single"
         },
         {
            "indexed" : "true",
            "description" : "Is the term obsolete?",
            "required" : "false",
            "cardinality" : "single",
            "property" : [
               "getIsObsoleteBinaryString"
            ],
            "id" : "is_obsolete",
            "display_name" : "Obsoletion",
            "transform" : [],
            "type" : "boolean",
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "display_name" : "Comment",
            "transform" : [],
            "type" : "string",
            "description" : "Term comment.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [
               "getComment"
            ],
            "id" : "comment",
            "indexed" : "true"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonyms",
            "searchable" : "true",
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "Term synonyms.",
            "required" : "false",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         {
            "display_name" : "Alt ID",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ],
            "id" : "alternate_id",
            "description" : "Alternate term identifier.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ],
            "required" : "false",
            "description" : "Term that replaces this term.",
            "cardinality" : "multi",
            "display_name" : "Replaced By",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "cardinality" : "multi",
            "description" : "Others terms you might want to look at.",
            "required" : "false",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ],
            "id" : "consider",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Consider",
            "transform" : [],
            "type" : "string"
         },
         {
            "property" : [
               "getSubsets"
            ],
            "id" : "subset",
            "description" : "Special use collections of terms.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Subset",
            "transform" : [],
            "type" : "string"
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Def xref",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ],
            "description" : "Definition cross-reference.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "DB xref",
            "type" : "string",
            "transform" : [],
            "property" : [
               "getXref"
            ],
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         {
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "isa_partof_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050"
            ],
            "indexed" : "true",
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Is-a/part-of"
         },
         {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Is-a/part-of",
            "property" : [
               "getRelationLabelClosure",
               "BFO:0000050"
            ],
            "id" : "isa_partof_closure_label",
            "cardinality" : "multi",
            "description" : "Ancestral terms (is_a/part_of).",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "display_name" : "Ancestor",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "property" : [
               "getRelationIDClosure",
               "BFO:0000050",
               "BFO:0000066",
               "RO:0002211",
               "RO:0002212",
               "RO:0002213",
               "RO:0002215",
               "RO:0002216"
            ]
         },
         {
            "indexed" : "true",
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
            "description" : "Ancestral terms (regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ancestor",
            "searchable" : "true"
         },
         {
            "required" : "false",
            "description" : "JSON blob form of the local stepwise topology graph. Uses various relations (including regulates, occurs in, capable_of).",
            "cardinality" : "single",
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
            "id" : "topology_graph_json",
            "indexed" : "false",
            "searchable" : "false",
            "display_name" : "Topology graph (JSON)",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "false",
            "display_name" : "Regulates transitivity graph (JSON)",
            "transform" : [],
            "type" : "string",
            "description" : "JSON blob form of the local relation transitivity graph. Uses various relations (including regulates, occurs in, capable_of).",
            "required" : "false",
            "cardinality" : "single",
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
            "id" : "regulates_transitivity_graph_json",
            "indexed" : "false"
         },
         {
            "indexed" : "true",
            "property" : [
               "getIdentifier"
            ],
            "id" : "only_in_taxon",
            "description" : "Only in taxon.",
            "cardinality" : "single",
            "required" : "false",
            "display_name" : "Only in taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon",
            "cardinality" : "single",
            "description" : "Only in taxon label.",
            "required" : "false",
            "id" : "only_in_taxon_label",
            "property" : [
               "getLabel"
            ],
            "indexed" : "true"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon (IDs)",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure",
            "description" : "Only in taxon closure.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "property" : [
               "getRelationLabelClosure",
               "RO:0002160"
            ],
            "id" : "only_in_taxon_closure_label",
            "required" : "false",
            "description" : "Only in taxon label closure.",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Only in taxon"
         }
      ],
      "searchable_extension" : "_searchable",
      "description" : "Ontology classes for GO.",
      "schema_generating" : "true",
      "id" : "ontology",
      "filter_weights" : "source^4.0 subset^3.0 regulates_closure_label^1.0 is_obsolete^0.0",
      "boost_weights" : "annotation_class^3.0 annotation_class_label^5.5 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0 regulates_closure^1.0 regulates_closure_label^1.0"
   },
   "bbop_term_ac" : {
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//term-autocomplete-config.yaml",
      "document_category" : "ontology_class",
      "result_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "_strict" : 0,
      "display_name" : "Term autocomplete",
      "weight" : "-20",
      "filter_weights" : "annotation_class^8.0 synonym^3.0 alternate_id^2.0",
      "boost_weights" : "annotation_class^5.0 annotation_class_label^5.0 synonym^1.0 alternate_id^1.0",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//term-autocomplete-config.yaml",
      "fields" : [
         {
            "property" : [],
            "id" : "id",
            "description" : "Term acc/ID.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc"
         },
         {
            "description" : "Term acc/ID.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "annotation_class",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string"
         },
         {
            "searchable" : "true",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "description" : "Common term name.",
            "required" : "false",
            "id" : "annotation_class_label",
            "property" : [],
            "indexed" : "true"
         },
         {
            "display_name" : "Synonyms",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "Term synonyms.",
            "cardinality" : "multi",
            "property" : [],
            "id" : "synonym"
         },
         {
            "indexed" : "true",
            "property" : [],
            "id" : "alternate_id",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "required" : "false",
            "display_name" : "Alt ID",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         }
      ],
      "fields_hash" : {
         "annotation_class" : {
            "description" : "Term acc/ID.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "annotation_class",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "display_name" : "Term",
            "transform" : [],
            "type" : "string",
            "cardinality" : "single",
            "description" : "Common term name.",
            "required" : "false",
            "id" : "annotation_class_label",
            "property" : [],
            "indexed" : "true"
         },
         "synonym" : {
            "display_name" : "Synonyms",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "Term synonyms.",
            "cardinality" : "multi",
            "property" : [],
            "id" : "synonym"
         },
         "alternate_id" : {
            "indexed" : "true",
            "property" : [],
            "id" : "alternate_id",
            "cardinality" : "multi",
            "description" : "Alternate term id.",
            "required" : "false",
            "display_name" : "Alt ID",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "id" : {
            "property" : [],
            "id" : "id",
            "description" : "Term acc/ID.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc"
         }
      },
      "schema_generating" : "false",
      "description" : "Easily find ontology classes in GO. For personality only - not a schema configuration.",
      "searchable_extension" : "_searchable",
      "id" : "bbop_term_ac"
   },
   "complex_annotation" : {
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//complex-ann-config.yaml",
      "fields_hash" : {
         "function_class_label" : {
            "property" : [],
            "id" : "function_class_label",
            "description" : "Common function name.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Function",
            "type" : "string",
            "transform" : []
         },
         "process_class_closure" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "process_class_closure",
            "description" : "???",
            "cardinality" : "multi",
            "required" : "false"
         },
         "process_class_label" : {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "property" : [],
            "id" : "process_class_label",
            "cardinality" : "single",
            "description" : "Common process name.",
            "required" : "false",
            "indexed" : "true"
         },
         "function_class_closure" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "property" : [],
            "id" : "function_class_closure",
            "description" : "???",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         "annotation_group_label" : {
            "property" : [],
            "id" : "annotation_group_label",
            "cardinality" : "single",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Annotation group",
            "transform" : [],
            "type" : "string"
         },
         "owl_blob_json" : {
            "cardinality" : "single",
            "description" : "???",
            "required" : "false",
            "property" : [],
            "id" : "owl_blob_json",
            "indexed" : "false",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "???"
         },
         "annotation_group" : {
            "display_name" : "Annotation group",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "annotation_group"
         },
         "enabled_by_label" : {
            "property" : [],
            "id" : "enabled_by_label",
            "cardinality" : "single",
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enabled by"
         },
         "annotation_unit" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "annotation_unit",
            "property" : []
         },
         "function_class" : {
            "indexed" : "true",
            "id" : "function_class",
            "property" : [],
            "description" : "Function acc/ID.",
            "cardinality" : "single",
            "required" : "false",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "taxon" : {
            "searchable" : "false",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "GAF column 13 (taxon).",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "indexed" : "true"
         },
         "process_class_closure_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "???",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "process_class_closure_label",
            "property" : []
         },
         "taxon_closure" : {
            "display_name" : "Taxon (IDs)",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "taxon_closure",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "id" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "ID",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "A unique (and internal) thing.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [],
            "id" : "id"
         },
         "process_class" : {
            "display_name" : "Process",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "required" : "false",
            "description" : "Process acc/ID.",
            "cardinality" : "single",
            "id" : "process_class",
            "property" : []
         },
         "panther_family_label" : {
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "id" : "panther_family_label",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "searchable" : "true"
         },
         "annotation_unit_label" : {
            "indexed" : "true",
            "property" : [],
            "id" : "annotation_unit_label",
            "required" : "false",
            "description" : "???.",
            "cardinality" : "single",
            "display_name" : "Annotation unit",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         "topology_graph_json" : {
            "description" : "JSON blob form of the local stepwise topology graph.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "topology_graph_json",
            "property" : [],
            "indexed" : "false",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Topology graph (JSON)"
         },
         "location_list_label" : {
            "display_name" : "Location",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "location_list_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "property" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "panther_family" : {
            "searchable" : "true",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER family IDs that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "panther_family",
            "property" : [],
            "indexed" : "true"
         },
         "taxon_label" : {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "cardinality" : "single",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "searchable" : "true"
         },
         "location_list_closure" : {
            "property" : [],
            "id" : "location_list_closure",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Location",
            "type" : "string",
            "transform" : []
         },
         "function_class_closure_label" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "???",
            "cardinality" : "multi",
            "id" : "function_class_closure_label",
            "property" : []
         },
         "location_list" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "location_list",
            "property" : []
         },
         "enabled_by" : {
            "indexed" : "true",
            "id" : "enabled_by",
            "property" : [],
            "description" : "???",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enabled by",
            "searchable" : "true"
         },
         "location_list_closure_label" : {
            "property" : [],
            "id" : "location_list_closure_label",
            "required" : "false",
            "description" : "",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Location",
            "transform" : [],
            "type" : "string"
         }
      },
      "fields" : [
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "ID",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "A unique (and internal) thing.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [],
            "id" : "id"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation unit",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "annotation_unit",
            "property" : []
         },
         {
            "indexed" : "true",
            "property" : [],
            "id" : "annotation_unit_label",
            "required" : "false",
            "description" : "???.",
            "cardinality" : "single",
            "display_name" : "Annotation unit",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         {
            "display_name" : "Annotation group",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "???.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "annotation_group"
         },
         {
            "property" : [],
            "id" : "annotation_group_label",
            "cardinality" : "single",
            "description" : "???.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Annotation group",
            "transform" : [],
            "type" : "string"
         },
         {
            "indexed" : "true",
            "id" : "enabled_by",
            "property" : [],
            "description" : "???",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enabled by",
            "searchable" : "true"
         },
         {
            "property" : [],
            "id" : "enabled_by_label",
            "cardinality" : "single",
            "description" : "???",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enabled by"
         },
         {
            "searchable" : "true",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "description" : "PANTHER family IDs that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "panther_family",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "id" : "panther_family_label",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "searchable" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "GAF column 13 (taxon).",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Taxon derived from GAF column 13 and ncbi_taxonomy.obo.",
            "cardinality" : "single",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "searchable" : "true"
         },
         {
            "display_name" : "Taxon (IDs)",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "taxon_closure",
            "description" : "Taxon IDs derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Taxon",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "property" : [],
            "description" : "Taxon label closure derived from GAF column 13 and ncbi_taxonomy.obo.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "id" : "function_class",
            "property" : [],
            "description" : "Function acc/ID.",
            "cardinality" : "single",
            "required" : "false",
            "display_name" : "Function",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "property" : [],
            "id" : "function_class_label",
            "description" : "Common function name.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Function",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "property" : [],
            "id" : "function_class_closure",
            "description" : "???",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Function",
            "searchable" : "true",
            "indexed" : "true",
            "required" : "false",
            "description" : "???",
            "cardinality" : "multi",
            "id" : "function_class_closure_label",
            "property" : []
         },
         {
            "display_name" : "Process",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "required" : "false",
            "description" : "Process acc/ID.",
            "cardinality" : "single",
            "id" : "process_class",
            "property" : []
         },
         {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "property" : [],
            "id" : "process_class_label",
            "cardinality" : "single",
            "description" : "Common process name.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Process",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "process_class_closure",
            "description" : "???",
            "cardinality" : "multi",
            "required" : "false"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Process",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "???",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "process_class_closure_label",
            "property" : []
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Location",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "location_list",
            "property" : []
         },
         {
            "display_name" : "Location",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "location_list_label",
            "property" : []
         },
         {
            "property" : [],
            "id" : "location_list_closure",
            "description" : "",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Location",
            "type" : "string",
            "transform" : []
         },
         {
            "property" : [],
            "id" : "location_list_closure_label",
            "required" : "false",
            "description" : "",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Location",
            "transform" : [],
            "type" : "string"
         },
         {
            "cardinality" : "single",
            "description" : "???",
            "required" : "false",
            "property" : [],
            "id" : "owl_blob_json",
            "indexed" : "false",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "???"
         },
         {
            "description" : "JSON blob form of the local stepwise topology graph.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "topology_graph_json",
            "property" : [],
            "indexed" : "false",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Topology graph (JSON)"
         }
      ],
      "schema_generating" : "true",
      "description" : "An individual unit within LEGO. This is <strong>ALPHA</strong> software.",
      "searchable_extension" : "_searchable",
      "id" : "complex_annotation",
      "filter_weights" : "annotation_group_label^5.0 enabled_by_label^4.5 location_list_closure_label^4.0 process_class_closure_label^3.0 function_class_closure_label^2.0",
      "boost_weights" : "annotation_group_label^1.0 annotation_unit_label^1.0 enabled_by^1.0 enabled_by_label^1.0 location_list_closure^1.0 location_list_closure_label^1.0 process_class_closure_label^1.0 function_class_closure_label^1.0",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//complex-ann-config.yaml",
      "document_category" : "complex_annotation",
      "_strict" : 0,
      "display_name" : "Complex annotations (ALPHA)",
      "result_weights" : "function_class^5.0 enabled_by^4.0 location_list^3.0 process_class^2.0 annotation_group^1.0",
      "weight" : "-5"
   },
   "bioentity" : {
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0 bioentity_name^1.0 bioentity_internal_id^1.0 synonym^1.0 isa_partof_closure_label^1.0 regulates_closure^1.0 regulates_closure_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "filter_weights" : "source^7.0 type^6.0 panther_family_label^5.0 annotation_class_list_label^3.5 taxon_closure_label^4.0 regulates_closure_label^2.0",
      "id" : "bioentity",
      "description" : "Genes and gene products associated with GO terms.",
      "schema_generating" : "true",
      "searchable_extension" : "_searchable",
      "fields_hash" : {
         "taxon_closure_label" : {
            "cardinality" : "multi",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "property" : [],
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         "panther_family" : {
            "indexed" : "true",
            "id" : "panther_family",
            "property" : [],
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "display_name" : "PANTHER family",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         "panther_family_label" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "searchable" : "true"
         },
         "id" : {
            "property" : [],
            "id" : "id",
            "required" : "false",
            "description" : "Gene of gene product ID.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Acc",
            "transform" : [],
            "type" : "string"
         },
         "type" : {
            "property" : [],
            "id" : "type",
            "required" : "false",
            "description" : "Type class.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Type",
            "type" : "string",
            "transform" : []
         },
         "phylo_graph_json" : {
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree.",
            "cardinality" : "single",
            "id" : "phylo_graph_json",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "searchable" : "false"
         },
         "taxon_label" : {
            "property" : [],
            "id" : "taxon_label",
            "description" : "Taxonomic group",
            "required" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         "source" : {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Source",
            "id" : "source",
            "property" : [],
            "required" : "false",
            "description" : "Database source.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         "synonym" : {
            "searchable" : "false",
            "display_name" : "Synonyms",
            "type" : "string",
            "transform" : [],
            "description" : "Gene product synonyms.",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "synonym",
            "property" : [],
            "indexed" : "true"
         },
         "annotation_class_list" : {
            "indexed" : "true",
            "property" : [],
            "id" : "annotation_class_list",
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "required" : "false",
            "display_name" : "Direct annotation",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "regulates_closure" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "cardinality" : "multi",
            "property" : [],
            "id" : "regulates_closure",
            "transform" : [],
            "type" : "string",
            "display_name" : "Inferred annotation",
            "searchable" : "false"
         },
         "bioentity_name" : {
            "display_name" : "Name",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "bioentity_name",
            "description" : "The full name of the gene product.",
            "cardinality" : "single",
            "required" : "false"
         },
         "bioentity_label" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Label",
            "searchable" : "true",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Symbol or name.",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_label"
         },
         "annotation_class_list_label" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Direct annotation",
            "property" : [],
            "id" : "annotation_class_list_label",
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         },
         "database_xref" : {
            "indexed" : "true",
            "property" : [],
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "display_name" : "DB xref",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "regulates_closure_label" : {
            "id" : "regulates_closure_label",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Inferred annotation"
         },
         "taxon" : {
            "indexed" : "true",
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "description" : "Taxonomic group",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "bioentity" : {
            "cardinality" : "single",
            "description" : "Gene or gene product ID.",
            "required" : "false",
            "id" : "bioentity",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : []
         },
         "bioentity_internal_id" : {
            "id" : "bioentity_internal_id",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "false",
            "searchable" : "false",
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : []
         },
         "taxon_closure" : {
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : []
         },
         "isa_partof_closure" : {
            "id" : "isa_partof_closure",
            "property" : [],
            "required" : "false",
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Involved in",
            "transform" : [],
            "type" : "string"
         },
         "isa_partof_closure_label" : {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Involved in",
            "id" : "isa_partof_closure_label",
            "property" : [],
            "description" : "Closure of labels over isa and partof.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         }
      },
      "fields" : [
         {
            "property" : [],
            "id" : "id",
            "required" : "false",
            "description" : "Gene of gene product ID.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Acc",
            "transform" : [],
            "type" : "string"
         },
         {
            "cardinality" : "single",
            "description" : "Gene or gene product ID.",
            "required" : "false",
            "id" : "bioentity",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : []
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Label",
            "searchable" : "true",
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Symbol or name.",
            "required" : "false",
            "property" : [],
            "id" : "bioentity_label"
         },
         {
            "display_name" : "Name",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "bioentity_name",
            "description" : "The full name of the gene product.",
            "cardinality" : "single",
            "required" : "false"
         },
         {
            "id" : "bioentity_internal_id",
            "property" : [],
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "false",
            "searchable" : "false",
            "display_name" : "This should not be displayed",
            "type" : "string",
            "transform" : []
         },
         {
            "property" : [],
            "id" : "type",
            "required" : "false",
            "description" : "Type class.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Type",
            "type" : "string",
            "transform" : []
         },
         {
            "indexed" : "true",
            "id" : "taxon",
            "property" : [],
            "required" : "false",
            "description" : "Taxonomic group",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "property" : [],
            "id" : "taxon_label",
            "description" : "Taxonomic group",
            "required" : "false",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         {
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "cardinality" : "multi",
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "property" : [],
            "id" : "taxon_closure_label",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : []
         },
         {
            "id" : "isa_partof_closure",
            "property" : [],
            "required" : "false",
            "description" : "Closure of ids/accs over isa and partof.",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Involved in",
            "transform" : [],
            "type" : "string"
         },
         {
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Involved in",
            "id" : "isa_partof_closure_label",
            "property" : [],
            "description" : "Closure of labels over isa and partof.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "cardinality" : "multi",
            "property" : [],
            "id" : "regulates_closure",
            "transform" : [],
            "type" : "string",
            "display_name" : "Inferred annotation",
            "searchable" : "false"
         },
         {
            "id" : "regulates_closure_label",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Bioentities associated with this term or its children (over regulates).",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Inferred annotation"
         },
         {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Source",
            "id" : "source",
            "property" : [],
            "required" : "false",
            "description" : "Database source.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "property" : [],
            "id" : "annotation_class_list",
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "required" : "false",
            "display_name" : "Direct annotation",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Direct annotation",
            "property" : [],
            "id" : "annotation_class_list_label",
            "description" : "Direct annotations.",
            "cardinality" : "multi",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Synonyms",
            "type" : "string",
            "transform" : [],
            "description" : "Gene product synonyms.",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "synonym",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "panther_family",
            "property" : [],
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "display_name" : "PANTHER family",
            "transform" : [],
            "type" : "string",
            "searchable" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "PANTHER family",
            "searchable" : "true"
         },
         {
            "indexed" : "false",
            "required" : "false",
            "description" : "JSON blob form of the phylogenic tree.",
            "cardinality" : "single",
            "id" : "phylo_graph_json",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "property" : [],
            "id" : "database_xref",
            "required" : "false",
            "description" : "Database cross-reference.",
            "cardinality" : "multi",
            "display_name" : "DB xref",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         }
      ],
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//bio-config.yaml",
      "weight" : "30",
      "_strict" : 0,
      "result_weights" : "bioentity^8.0 bioentity_name^7.0 taxon^6.0 panther_family^5.0 type^4.0 source^3.0 annotation_class_list^2.0 synonym^1.0",
      "display_name" : "Genes and gene products",
      "document_category" : "bioentity",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//bio-config.yaml"
   },
   "bbop_ann_ev_agg" : {
      "_strict" : 0,
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "display_name" : "Advanced",
      "weight" : "-10",
      "document_category" : "annotation_evidence_aggregate",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann_ev_agg-config.yaml",
      "searchable_extension" : "_searchable",
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "schema_generating" : "true",
      "id" : "bbop_ann_ev_agg",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann_ev_agg-config.yaml",
      "fields" : [
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Gene/product ID.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "id"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product ID",
            "searchable" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "property" : [],
            "required" : "false",
            "description" : "Column 1 + columns 2.",
            "cardinality" : "single"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Column 3.",
            "cardinality" : "single",
            "id" : "bioentity_label",
            "property" : [],
            "display_name" : "Gene/product label",
            "type" : "string",
            "transform" : [],
            "searchable" : "true"
         },
         {
            "indexed" : "true",
            "id" : "annotation_class",
            "property" : [],
            "cardinality" : "single",
            "description" : "Column 5.",
            "required" : "false",
            "display_name" : "Annotation class",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class label",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "annotation_class_label",
            "property" : [],
            "indexed" : "true"
         },
         {
            "description" : "All evidence for this term/gene product pair",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "evidence_type_closure",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence with",
            "description" : "All column 8s for this term/gene product pair",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "evidence_with",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "description" : "Column 13: taxon.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "single",
            "required" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true"
         },
         {
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Taxon (IDs)",
            "type" : "string",
            "transform" : []
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "description" : "Family IDs that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Protein family",
            "type" : "string",
            "transform" : []
         },
         {
            "display_name" : "Family",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "panther_family_label",
            "description" : "Families that are associated with this entity.",
            "cardinality" : "single",
            "required" : "false"
         }
      ],
      "fields_hash" : {
         "taxon" : {
            "indexed" : "true",
            "description" : "Column 13: taxon.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "false"
         },
         "taxon_closure" : {
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Taxon (IDs)",
            "type" : "string",
            "transform" : []
         },
         "bioentity" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Gene/product ID",
            "searchable" : "false",
            "indexed" : "true",
            "id" : "bioentity",
            "property" : [],
            "required" : "false",
            "description" : "Column 1 + columns 2.",
            "cardinality" : "single"
         },
         "evidence_type_closure" : {
            "description" : "All evidence for this term/gene product pair",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "evidence_type_closure",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Evidence type",
            "type" : "string",
            "transform" : []
         },
         "taxon_label" : {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "single",
            "required" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true"
         },
         "annotation_class" : {
            "indexed" : "true",
            "id" : "annotation_class",
            "property" : [],
            "cardinality" : "single",
            "description" : "Column 5.",
            "required" : "false",
            "display_name" : "Annotation class",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         },
         "panther_family" : {
            "description" : "Family IDs that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family",
            "indexed" : "true",
            "searchable" : "true",
            "display_name" : "Protein family",
            "type" : "string",
            "transform" : []
         },
         "taxon_closure_label" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Taxon",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Annotation class label",
            "description" : "Column 5 + ontology.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "annotation_class_label",
            "property" : [],
            "indexed" : "true"
         },
         "evidence_with" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Evidence with",
            "description" : "All column 8s for this term/gene product pair",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "evidence_with",
            "property" : [],
            "indexed" : "true"
         },
         "panther_family_label" : {
            "display_name" : "Family",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "panther_family_label",
            "description" : "Families that are associated with this entity.",
            "cardinality" : "single",
            "required" : "false"
         },
         "id" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Gene/product ID.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "id"
         },
         "bioentity_label" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Column 3.",
            "cardinality" : "single",
            "id" : "bioentity_label",
            "property" : [],
            "display_name" : "Gene/product label",
            "type" : "string",
            "transform" : [],
            "searchable" : "true"
         }
      },
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 panther_family^1.0 panther_family_label^1.0 taxon_closure_label^1.0",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0"
   },
   "annotation" : {
      "document_category" : "annotation",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann-config.yaml",
      "_strict" : 0,
      "display_name" : "Annotations",
      "result_weights" : "bioentity^7.0 bioentity_name^6.0 qualifier^5.0 annotation_class^4.7 annotation_extension_json^4.5 source^4.0 taxon^3.0 evidence_type^2.5 evidence_with^2.0 panther_family^1.5 bioentity_isoform^0.5 reference^0.25",
      "weight" : "20",
      "filter_weights" : "source^7.0 assigned_by^6.5 aspect^6.25 evidence_type_closure^6.0 panther_family_label^5.5 qualifier^5.25 taxon_closure_label^5.0 annotation_class_label^4.5 regulates_closure_label^3.0 annotation_extension_class_closure_label^2.0",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 bioentity_name^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 reference^1.0 panther_family^1.0 panther_family_label^1.0 bioentity_isoform^1.0 regulates_closure^1.0 regulates_closure_label^1.0",
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//ann-config.yaml",
      "fields" : [
         {
            "searchable" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "property" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "required" : "false",
            "description" : "Database source.",
            "cardinality" : "single",
            "id" : "source",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "required" : "false",
            "description" : "Type class.",
            "cardinality" : "single",
            "id" : "type",
            "property" : [],
            "display_name" : "Type class id",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         },
         {
            "description" : "Date of assignment.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "date",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Date",
            "type" : "string",
            "transform" : []
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Assigned by",
            "required" : "false",
            "description" : "Annotations assigned by group.",
            "cardinality" : "single",
            "id" : "assigned_by",
            "property" : [],
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Redundant for",
            "type" : "string",
            "transform" : [],
            "id" : "is_redundant_for",
            "property" : [],
            "cardinality" : "single",
            "description" : "Rational for redundancy of annotation.",
            "required" : "false",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "description" : "Taxonomic group.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "searchable" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : [],
            "indexed" : "true"
         },
         {
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "id" : "secondary_taxon",
            "property" : [],
            "required" : "false",
            "description" : "Secondary taxon.",
            "cardinality" : "single",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         },
         {
            "description" : "Secondary taxon.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "secondary_taxon_label",
            "property" : [],
            "indexed" : "true",
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon"
         },
         {
            "indexed" : "true",
            "description" : "Secondary taxon closure.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "secondary_taxon_closure",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "searchable" : "false"
         },
         {
            "searchable" : "true",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Secondary taxon closure.",
            "required" : "false",
            "cardinality" : "multi",
            "property" : [],
            "id" : "secondary_taxon_closure_label",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "id" : "isa_partof_closure",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Involved in",
            "searchable" : "false"
         },
         {
            "display_name" : "Involved in",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "isa_partof_closure_label",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "cardinality" : "multi"
         },
         {
            "indexed" : "true",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Inferred annotation",
            "searchable" : "false"
         },
         {
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "property" : [],
            "id" : "regulates_closure_label",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Inferred annotation"
         },
         {
            "display_name" : "Has participant (IDs)",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "has_participant_closure",
            "required" : "false",
            "description" : "Closure of ids/accs over has_participant.",
            "cardinality" : "multi"
         },
         {
            "searchable" : "true",
            "display_name" : "Has participant",
            "type" : "string",
            "transform" : [],
            "description" : "Closure of labels over has_participant.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "has_participant_closure_label",
            "property" : [],
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonym",
            "required" : "false",
            "description" : "Gene or gene product synonyms.",
            "cardinality" : "multi",
            "property" : [],
            "id" : "synonym",
            "indexed" : "true"
         },
         {
            "searchable" : "false",
            "display_name" : "Gene/product",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product identifiers.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "bioentity",
            "property" : [],
            "indexed" : "true"
         },
         {
            "property" : [],
            "id" : "bioentity_label",
            "cardinality" : "single",
            "description" : "Gene or gene product identifiers.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/product"
         },
         {
            "searchable" : "true",
            "display_name" : "Gene/product name",
            "type" : "string",
            "transform" : [],
            "id" : "bioentity_name",
            "property" : [],
            "description" : "The full name of the gene or gene product.",
            "required" : "false",
            "cardinality" : "single",
            "indexed" : "true"
         },
         {
            "display_name" : "This should not be displayed",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         {
            "display_name" : "Qualifier",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "qualifier",
            "description" : "Annotation qualifier.",
            "required" : "false",
            "cardinality" : "multi"
         },
         {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "required" : "false",
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "property" : [],
            "id" : "annotation_class",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "annotation_class_label",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Ontology aspect.",
            "required" : "false",
            "property" : [],
            "id" : "aspect",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ontology (aspect)",
            "searchable" : "false"
         },
         {
            "searchable" : "false",
            "display_name" : "Isoform",
            "transform" : [],
            "type" : "string",
            "property" : [],
            "id" : "bioentity_isoform",
            "required" : "false",
            "description" : "Biological isoform.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Evidence type.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "evidence_type",
            "property" : []
         },
         {
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "property" : [],
            "id" : "evidence_type_closure",
            "display_name" : "Evidence type",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "id" : "evidence_with",
            "property" : [],
            "description" : "Evidence with/from.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Evidence with",
            "type" : "string",
            "transform" : []
         },
         {
            "description" : "Database reference.",
            "required" : "false",
            "cardinality" : "multi",
            "property" : [],
            "id" : "reference",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Reference"
         },
         {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "annotation_extension_class",
            "property" : []
         },
         {
            "display_name" : "Annotation extension",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "annotation_extension_class_label",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Extension class for the annotation.",
            "required" : "false"
         },
         {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_class_closure",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         {
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "annotation_extension_class_closure_label",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "searchable" : "true"
         },
         {
            "display_name" : "Annotation extension",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Extension class for the annotation (JSON).",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "id" : "annotation_extension_json"
         },
         {
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "id" : "panther_family",
            "property" : [],
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "panther_family_label",
            "property" : []
         }
      ],
      "fields_hash" : {
         "bioentity_label" : {
            "property" : [],
            "id" : "bioentity_label",
            "cardinality" : "single",
            "description" : "Gene or gene product identifiers.",
            "required" : "false",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/product"
         },
         "bioentity_name" : {
            "searchable" : "true",
            "display_name" : "Gene/product name",
            "type" : "string",
            "transform" : [],
            "id" : "bioentity_name",
            "property" : [],
            "description" : "The full name of the gene or gene product.",
            "required" : "false",
            "cardinality" : "single",
            "indexed" : "true"
         },
         "evidence_type" : {
            "display_name" : "Evidence",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Evidence type.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "evidence_type",
            "property" : []
         },
         "annotation_extension_class_label" : {
            "display_name" : "Annotation extension",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "annotation_extension_class_label",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Extension class for the annotation.",
            "required" : "false"
         },
         "synonym" : {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Synonym",
            "required" : "false",
            "description" : "Gene or gene product synonyms.",
            "cardinality" : "multi",
            "property" : [],
            "id" : "synonym",
            "indexed" : "true"
         },
         "annotation_extension_json" : {
            "display_name" : "Annotation extension",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Extension class for the annotation (JSON).",
            "cardinality" : "multi",
            "required" : "false",
            "property" : [],
            "id" : "annotation_extension_json"
         },
         "date" : {
            "description" : "Date of assignment.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "date",
            "property" : [],
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Date",
            "type" : "string",
            "transform" : []
         },
         "has_participant_closure" : {
            "display_name" : "Has participant (IDs)",
            "type" : "string",
            "transform" : [],
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "has_participant_closure",
            "required" : "false",
            "description" : "Closure of ids/accs over has_participant.",
            "cardinality" : "multi"
         },
         "taxon_closure" : {
            "searchable" : "false",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "taxon_closure",
            "property" : [],
            "indexed" : "true"
         },
         "taxon" : {
            "searchable" : "false",
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "description" : "Taxonomic group.",
            "cardinality" : "single",
            "required" : "false",
            "id" : "taxon",
            "property" : [],
            "indexed" : "true"
         },
         "qualifier" : {
            "display_name" : "Qualifier",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "qualifier",
            "description" : "Annotation qualifier.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "bioentity_internal_id" : {
            "display_name" : "This should not be displayed",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "false",
            "required" : "false",
            "description" : "The bioentity ID used at the database of origin.",
            "cardinality" : "single",
            "id" : "bioentity_internal_id",
            "property" : []
         },
         "has_participant_closure_label" : {
            "searchable" : "true",
            "display_name" : "Has participant",
            "type" : "string",
            "transform" : [],
            "description" : "Closure of labels over has_participant.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "has_participant_closure_label",
            "property" : [],
            "indexed" : "true"
         },
         "panther_family_label" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "searchable" : "true",
            "indexed" : "true",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "panther_family_label",
            "property" : []
         },
         "is_redundant_for" : {
            "searchable" : "false",
            "display_name" : "Redundant for",
            "type" : "string",
            "transform" : [],
            "id" : "is_redundant_for",
            "property" : [],
            "cardinality" : "single",
            "description" : "Rational for redundancy of annotation.",
            "required" : "false",
            "indexed" : "true"
         },
         "secondary_taxon" : {
            "indexed" : "true",
            "id" : "secondary_taxon",
            "property" : [],
            "required" : "false",
            "description" : "Secondary taxon.",
            "cardinality" : "single",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         },
         "evidence_with" : {
            "id" : "evidence_with",
            "property" : [],
            "description" : "Evidence with/from.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true",
            "searchable" : "false",
            "display_name" : "Evidence with",
            "type" : "string",
            "transform" : []
         },
         "secondary_taxon_label" : {
            "description" : "Secondary taxon.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "secondary_taxon_label",
            "property" : [],
            "indexed" : "true",
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Secondary taxon"
         },
         "secondary_taxon_closure_label" : {
            "searchable" : "true",
            "display_name" : "Secondary taxon",
            "type" : "string",
            "transform" : [],
            "description" : "Secondary taxon closure.",
            "required" : "false",
            "cardinality" : "multi",
            "property" : [],
            "id" : "secondary_taxon_closure_label",
            "indexed" : "true"
         },
         "taxon_closure_label" : {
            "display_name" : "Taxon",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "id" : "taxon_closure_label",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "cardinality" : "multi"
         },
         "taxon_label" : {
            "indexed" : "true",
            "id" : "taxon_label",
            "property" : [],
            "description" : "Taxonomic group and ancestral groups.",
            "required" : "false",
            "cardinality" : "single",
            "display_name" : "Taxon",
            "type" : "string",
            "transform" : [],
            "searchable" : "true"
         },
         "evidence_type_closure" : {
            "indexed" : "true",
            "cardinality" : "multi",
            "description" : "All evidence (evidence closure) for this annotation",
            "required" : "false",
            "property" : [],
            "id" : "evidence_type_closure",
            "display_name" : "Evidence type",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         "annotation_extension_class_closure" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "id" : "annotation_extension_class_closure",
            "property" : [],
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "cardinality" : "multi",
            "indexed" : "true"
         },
         "regulates_closure" : {
            "indexed" : "true",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "regulates_closure",
            "property" : [],
            "transform" : [],
            "type" : "string",
            "display_name" : "Inferred annotation",
            "searchable" : "false"
         },
         "isa_partof_closure_label" : {
            "display_name" : "Involved in",
            "transform" : [],
            "type" : "string",
            "searchable" : "true",
            "indexed" : "true",
            "property" : [],
            "id" : "isa_partof_closure_label",
            "required" : "false",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "cardinality" : "multi"
         },
         "annotation_extension_class" : {
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "searchable" : "false",
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "required" : "false",
            "cardinality" : "multi",
            "id" : "annotation_extension_class",
            "property" : []
         },
         "secondary_taxon_closure" : {
            "indexed" : "true",
            "description" : "Secondary taxon closure.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "secondary_taxon_closure",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Secondary taxon",
            "searchable" : "false"
         },
         "bioentity_isoform" : {
            "searchable" : "false",
            "display_name" : "Isoform",
            "transform" : [],
            "type" : "string",
            "property" : [],
            "id" : "bioentity_isoform",
            "required" : "false",
            "description" : "Biological isoform.",
            "cardinality" : "single",
            "indexed" : "true"
         },
         "isa_partof_closure" : {
            "indexed" : "true",
            "id" : "isa_partof_closure",
            "property" : [],
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over is_a/part_of).",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Involved in",
            "searchable" : "false"
         },
         "regulates_closure_label" : {
            "cardinality" : "multi",
            "description" : "Annotations for this term or its children (over regulates).",
            "required" : "false",
            "property" : [],
            "id" : "regulates_closure_label",
            "indexed" : "true",
            "searchable" : "true",
            "type" : "string",
            "transform" : [],
            "display_name" : "Inferred annotation"
         },
         "bioentity" : {
            "searchable" : "false",
            "display_name" : "Gene/product",
            "transform" : [],
            "type" : "string",
            "description" : "Gene or gene product identifiers.",
            "required" : "false",
            "cardinality" : "single",
            "id" : "bioentity",
            "property" : [],
            "indexed" : "true"
         },
         "id" : {
            "searchable" : "false",
            "display_name" : "Acc",
            "type" : "string",
            "transform" : [],
            "id" : "id",
            "property" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "cardinality" : "single",
            "required" : "false",
            "indexed" : "true"
         },
         "annotation_extension_class_closure_label" : {
            "indexed" : "true",
            "description" : "Extension class for the annotation.",
            "cardinality" : "multi",
            "required" : "false",
            "id" : "annotation_extension_class_closure_label",
            "property" : [],
            "type" : "string",
            "transform" : [],
            "display_name" : "Annotation extension",
            "searchable" : "true"
         },
         "assigned_by" : {
            "searchable" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Assigned by",
            "required" : "false",
            "description" : "Annotations assigned by group.",
            "cardinality" : "single",
            "id" : "assigned_by",
            "property" : [],
            "indexed" : "true"
         },
         "reference" : {
            "description" : "Database reference.",
            "required" : "false",
            "cardinality" : "multi",
            "property" : [],
            "id" : "reference",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Reference"
         },
         "panther_family" : {
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "searchable" : "true",
            "indexed" : "true",
            "id" : "panther_family",
            "property" : [],
            "cardinality" : "single",
            "description" : "PANTHER families that are associated with this entity.",
            "required" : "false"
         },
         "aspect" : {
            "indexed" : "true",
            "cardinality" : "single",
            "description" : "Ontology aspect.",
            "required" : "false",
            "property" : [],
            "id" : "aspect",
            "type" : "string",
            "transform" : [],
            "display_name" : "Ontology (aspect)",
            "searchable" : "false"
         },
         "annotation_class_label" : {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "annotation_class_label",
            "indexed" : "true"
         },
         "annotation_class" : {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Direct annotation",
            "required" : "false",
            "description" : "Direct annotations.",
            "cardinality" : "single",
            "property" : [],
            "id" : "annotation_class",
            "indexed" : "true"
         },
         "source" : {
            "searchable" : "false",
            "display_name" : "Source",
            "type" : "string",
            "transform" : [],
            "required" : "false",
            "description" : "Database source.",
            "cardinality" : "single",
            "id" : "source",
            "property" : [],
            "indexed" : "true"
         },
         "type" : {
            "indexed" : "true",
            "required" : "false",
            "description" : "Type class.",
            "cardinality" : "single",
            "id" : "type",
            "property" : [],
            "display_name" : "Type class id",
            "type" : "string",
            "transform" : [],
            "searchable" : "false"
         }
      },
      "schema_generating" : "true",
      "searchable_extension" : "_searchable",
      "description" : "Associations between GO terms and genes or gene products.",
      "id" : "annotation"
   },
   "general" : {
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//general-config.yaml",
      "document_category" : "general",
      "weight" : "0",
      "display_name" : "General",
      "_strict" : 0,
      "result_weights" : "entity^3.0 category^1.0",
      "filter_weights" : "category^4.0",
      "boost_weights" : "entity^3.0 entity_label^3.0 general_blob^3.0",
      "fields_hash" : {
         "id" : {
            "display_name" : "Internal ID",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "id",
            "cardinality" : "single",
            "description" : "The mangled internal ID for this entity.",
            "required" : "false"
         },
         "general_blob" : {
            "searchable" : "true",
            "display_name" : "Generic blob",
            "transform" : [],
            "type" : "string",
            "required" : "false",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "cardinality" : "single",
            "property" : [],
            "id" : "general_blob",
            "indexed" : "true"
         },
         "category" : {
            "property" : [],
            "id" : "category",
            "required" : "false",
            "description" : "The document category that this enitity belongs to.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Document category"
         },
         "entity" : {
            "transform" : [],
            "type" : "string",
            "display_name" : "Entity",
            "searchable" : "false",
            "indexed" : "true",
            "id" : "entity",
            "property" : [],
            "description" : "The ID/label for this entity.",
            "required" : "false",
            "cardinality" : "single"
         },
         "entity_label" : {
            "indexed" : "true",
            "description" : "The label for this entity.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "entity_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enity label",
            "searchable" : "true"
         }
      },
      "fields" : [
         {
            "display_name" : "Internal ID",
            "transform" : [],
            "type" : "string",
            "searchable" : "false",
            "indexed" : "true",
            "property" : [],
            "id" : "id",
            "cardinality" : "single",
            "description" : "The mangled internal ID for this entity.",
            "required" : "false"
         },
         {
            "transform" : [],
            "type" : "string",
            "display_name" : "Entity",
            "searchable" : "false",
            "indexed" : "true",
            "id" : "entity",
            "property" : [],
            "description" : "The ID/label for this entity.",
            "required" : "false",
            "cardinality" : "single"
         },
         {
            "indexed" : "true",
            "description" : "The label for this entity.",
            "cardinality" : "single",
            "required" : "false",
            "property" : [],
            "id" : "entity_label",
            "type" : "string",
            "transform" : [],
            "display_name" : "Enity label",
            "searchable" : "true"
         },
         {
            "property" : [],
            "id" : "category",
            "required" : "false",
            "description" : "The document category that this enitity belongs to.",
            "cardinality" : "single",
            "indexed" : "true",
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Document category"
         },
         {
            "searchable" : "true",
            "display_name" : "Generic blob",
            "transform" : [],
            "type" : "string",
            "required" : "false",
            "description" : "A hidden searchable blob document to access this item. It should contain all the goodies that we want to search for, like species(?), synonyms, etc.",
            "cardinality" : "single",
            "property" : [],
            "id" : "general_blob",
            "indexed" : "true"
         }
      ],
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//general-config.yaml",
      "id" : "general",
      "description" : "A generic search document to get a general overview of everything.",
      "schema_generating" : "true",
      "searchable_extension" : "_searchable"
   },
   "family" : {
      "filter_weights" : "bioentity_list_label^1.0",
      "boost_weights" : "panther_family^2.0 panther_family_label^2.0 bioentity_list^1.0 bioentity_list_label^1.0",
      "fields" : [
         {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "cardinality" : "single",
            "description" : "Family ID.",
            "required" : "false",
            "id" : "id",
            "property" : [],
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family",
            "indexed" : "true"
         },
         {
            "searchable" : "true",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "id" : "panther_family_label",
            "property" : [],
            "indexed" : "true"
         },
         {
            "indexed" : "false",
            "property" : [],
            "id" : "phylo_graph_json",
            "cardinality" : "single",
            "description" : "JSON blob form of the phylogenic tree.",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "property" : [],
            "id" : "bioentity_list",
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "required" : "false",
            "display_name" : "Gene/products",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         },
         {
            "indexed" : "true",
            "id" : "bioentity_list_label",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "required" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/products",
            "searchable" : "false"
         }
      ],
      "fields_hash" : {
         "bioentity_list_label" : {
            "indexed" : "true",
            "id" : "bioentity_list_label",
            "property" : [],
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "required" : "false",
            "type" : "string",
            "transform" : [],
            "display_name" : "Gene/products",
            "searchable" : "false"
         },
         "panther_family" : {
            "searchable" : "true",
            "transform" : [],
            "type" : "string",
            "display_name" : "PANTHER family",
            "required" : "false",
            "description" : "PANTHER family IDs that are associated with this entity.",
            "cardinality" : "single",
            "property" : [],
            "id" : "panther_family",
            "indexed" : "true"
         },
         "phylo_graph_json" : {
            "indexed" : "false",
            "property" : [],
            "id" : "phylo_graph_json",
            "cardinality" : "single",
            "description" : "JSON blob form of the phylogenic tree.",
            "required" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "This should not be displayed",
            "searchable" : "false"
         },
         "id" : {
            "searchable" : "false",
            "transform" : [],
            "type" : "string",
            "display_name" : "Acc",
            "cardinality" : "single",
            "description" : "Family ID.",
            "required" : "false",
            "id" : "id",
            "property" : [],
            "indexed" : "true"
         },
         "panther_family_label" : {
            "searchable" : "true",
            "display_name" : "PANTHER family",
            "type" : "string",
            "transform" : [],
            "required" : "false",
            "description" : "PANTHER families that are associated with this entity.",
            "cardinality" : "single",
            "id" : "panther_family_label",
            "property" : [],
            "indexed" : "true"
         },
         "bioentity_list" : {
            "indexed" : "true",
            "property" : [],
            "id" : "bioentity_list",
            "description" : "Gene/products annotated with this protein family.",
            "cardinality" : "multi",
            "required" : "false",
            "display_name" : "Gene/products",
            "transform" : [],
            "type" : "string",
            "searchable" : "false"
         }
      },
      "_outfile" : "/home/sjcarbon/local/src/git/amigo/metadata//protein-family-config.yaml",
      "id" : "family",
      "searchable_extension" : "_searchable",
      "schema_generating" : "true",
      "description" : "Information about protein (PANTHER) families.",
      "document_category" : "family",
      "_infile" : "/home/sjcarbon/local/src/git/amigo/metadata//protein-family-config.yaml",
      "weight" : "5",
      "display_name" : "Protein families",
      "result_weights" : "panther_family^5.0 bioentity_list^4.0",
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
    var meta_data = {"html_base":"http://localhost/amigo2","image_base":"http://localhost/amigo2/images","species":[],"evidence_codes":{},"term_regexp":"^all$|^GO:[0-9]{7}$","bbop_img_star":"http://localhost/amigo2/images/star.png","ontologies":[],"galaxy_base":"http://galaxy.berkeleybop.org/","species_map":{},"golr_base":"http://localhost:8080/solr/","sources":[],"gp_types":[],"app_base":"http://localhost/cgi-bin/amigo2","beta":"1"};

    ///
    /// Break out the data and various functions to access them...
    ///

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
   "refseq_na" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "uri_prefix" : null,
      "database" : "RefSeq (Nucleic Acid)",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "example_id" : "RefSeq_NA:NC_000913",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "RefSeq_NA",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=NC_000913",
      "is_obsolete" : "true",
      "replaced_by" : "RefSeq"
   },
   "agricola_id" : {
      "url_example" : null,
      "object" : "AGRICOLA call number",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "AGRICOLA_ID",
      "datatype" : null,
      "id" : null,
      "example_id" : "AGRICOLA_NAL:TP248.2 P76 v.14",
      "url_syntax" : null,
      "uri_prefix" : null,
      "database" : "AGRICultural OnLine Access",
      "generic_url" : "http://agricola.nal.usda.gov/"
   },
   "fb" : {
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "FB",
      "example_id" : "FB:FBgn0000024",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "local_id_syntax" : "^FBgn[0-9]{7}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "uri_prefix" : null,
      "database" : "FlyBase",
      "generic_url" : "http://flybase.org/"
   },
   "aspgdid" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "AspGDID",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "object" : "Identifier for AspGD Loci",
      "database" : "Aspergillus Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "example_id" : "AspGD:ASPL0000067538",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "local_id_syntax" : "^ASPL[0-9]{10}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene"
   },
   "biomd" : {
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "object" : "Accession",
      "name" : null,
      "abbreviation" : "BIOMD",
      "fullname" : null,
      "example_id" : "BIOMD:BIOMD0000000045",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "uri_prefix" : null,
      "database" : "BioModels Database"
   },
   "cog_pathway" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "uri_prefix" : null,
      "database" : "NCBI COG pathway",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=[example_id]",
      "example_id" : "COG_Pathway:14",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "COG_Pathway",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=14"
   },
   "psort" : {
      "database" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "uri_prefix" : null,
      "generic_url" : "http://www.psort.org/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PSORT",
      "object" : null,
      "url_example" : null
   },
   "omssa" : {
      "name" : null,
      "abbreviation" : "OMSSA",
      "fullname" : null,
      "url_example" : null,
      "object" : null,
      "database" : "Open Mass Spectrometry Search Algorithm",
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/omssa/",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null
   },
   "agricola_ind" : {
      "object" : "AGRICOLA IND number",
      "url_example" : null,
      "name" : null,
      "abbreviation" : "AGRICOLA_IND",
      "fullname" : null,
      "example_id" : "AGRICOLA_IND:IND23252955",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "AGRICultural OnLine Access",
      "generic_url" : "http://agricola.nal.usda.gov/"
   },
   "casspc" : {
      "fullname" : null,
      "abbreviation" : "CASSPC",
      "name" : null,
      "url_example" : null,
      "object" : "Identifier",
      "database" : "Catalog of Fishes species database",
      "uri_prefix" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "example_id" : null
   },
   "ncbi_gene" : {
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "local_id_syntax" : "^\\d+$",
      "example_id" : "NCBI_Gene:4771",
      "uri_prefix" : null,
      "database" : "NCBI Gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "fullname" : null,
      "abbreviation" : "NCBI_Gene",
      "name" : null
   },
   "agi_locuscode" : {
      "object" : "Locus identifier",
      "!url_example" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=At2g17950",
      "abbreviation" : "AGI_LocusCode",
      "name" : null,
      "id" : null,
      "local_id_syntax" : "^AT[MC0-5]G[0-9]{5}(\\.[0-9]{1})?$",
      "database" : "Arabidopsis Genome Initiative",
      "url_example" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=At2g17950",
      "fullname" : null,
      "!url_syntax" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=[example_id]",
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "description" : "Comprises TAIR, TIGR and MIPS",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=[example_id]",
      "example_id" : "AGI_LocusCode:At2g17950",
      "uri_prefix" : null,
      "generic_url" : "http://www.arabidopsis.org"
   },
   "ecoliwiki" : {
      "example_id" : null,
      "url_syntax" : null,
      "local_id_syntax" : "^[A-Za-z]{3,4}$",
      "description" : "EcoliHub's subsystem for community annotation of E. coli K-12",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "EcoliWiki from EcoliHub",
      "generic_url" : "http://ecoliwiki.net/",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "abbreviation" : "EcoliWiki",
      "fullname" : null
   },
   "vida" : {
      "generic_url" : "http://www.biochem.ucl.ac.uk/bsm/virus_database/VIDA.html",
      "uri_prefix" : null,
      "database" : "Virus Database at University College London",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "name" : null,
      "abbreviation" : "VIDA",
      "fullname" : null,
      "url_example" : null,
      "object" : null
   },
   "tigr_ref" : {
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "object" : "Reference locator",
      "abbreviation" : "TIGR_REF",
      "fullname" : null,
      "name" : null,
      "url_syntax" : null,
      "example_id" : "JCVI_REF:GO_ref",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "J. Craig Venter Institute",
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "gorel" : {
      "fullname" : null,
      "abbreviation" : "GOREL",
      "name" : null,
      "object" : null,
      "url_example" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "uri_prefix" : null,
      "database" : "GO Extensions to OBO Relation Ontology Ontology",
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "description" : "Additional relations pending addition into RO",
      "datatype" : null
   },
   "echobase" : {
      "object" : "Identifier",
      "url_example" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=EB0231",
      "fullname" : null,
      "abbreviation" : "EchoBASE",
      "name" : null,
      "url_syntax" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=[example_id]",
      "local_id_syntax" : "^EB[0-9]{4}$",
      "example_id" : "EchoBASE:EB0231",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "EchoBASE post-genomic database for Escherichia coli",
      "generic_url" : "http://www.ecoli-york.org/"
   },
   "geo" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=[example_id]",
      "example_id" : "GEO:GDS2223",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/geo/",
      "database" : "NCBI Gene Expression Omnibus",
      "object" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=GDS2223",
      "fullname" : null,
      "abbreviation" : "GEO",
      "name" : null
   },
   "bfo" : {
      "example_id" : "BFO:0000066",
      "url_syntax" : "http://purl.obolibrary.org/obo/BFO_[example_id]",
      "datatype" : null,
      "description" : "An upper ontology used by Open Bio Ontologies (OBO) Foundry. BFO contains upper-level classes as well as core relations such as part_of (BFO_0000050)",
      "id" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/bfo",
      "uri_prefix" : null,
      "database" : "Basic Formal Ontology",
      "object" : null,
      "url_example" : "http://purl.obolibrary.org/obo/BFO_0000066",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "BFO"
   },
   "paint_ref" : {
      "object" : "Reference locator",
      "url_example" : "http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PAINT_REF",
      "datatype" : null,
      "id" : null,
      "example_id" : "PAINT_REF:PTHR10046",
      "url_syntax" : "http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt",
      "uri_prefix" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "database" : "Phylogenetic Annotation INference Tool References"
   },
   "reac" : {
      "abbreviation" : "REAC",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "object" : "Identifier",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "generic_url" : "http://www.reactome.org/",
      "uri_prefix" : null,
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "local_id_syntax" : "^REACT_[0-9]+$",
      "example_id" : "Reactome:REACT_604",
      "id" : null,
      "datatype" : null
   },
   "chebi" : {
      "name" : null,
      "abbreviation" : "ChEBI",
      "fullname" : null,
      "object" : "Identifier",
      "url_example" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17234",
      "database" : "Chemical Entities of Biological Interest",
      "generic_url" : "http://www.ebi.ac.uk/chebi/",
      "uri_prefix" : null,
      "datatype" : null,
      "entity_type" : "CHEBI:24431 ! chemical entity ",
      "id" : null,
      "example_id" : "CHEBI:17234",
      "local_id_syntax" : "^[0-9]{1,6}$",
      "url_syntax" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:[example_id]"
   },
   "aracyc" : {
      "url_syntax" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=[example_id]",
      "example_id" : "AraCyc:PWYQT-62",
      "id" : null,
      "datatype" : null,
      "database" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "uri_prefix" : null,
      "generic_url" : "http://www.arabidopsis.org/biocyc/index.jsp",
      "url_example" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=PWYQT-62",
      "object" : "Identifier",
      "fullname" : null,
      "abbreviation" : "AraCyc",
      "name" : null
   },
   "phenoscape" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "database" : "PhenoScape Knowledgebase",
      "generic_url" : "http://phenoscape.org/",
      "object" : null,
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "PhenoScape",
      "name" : null
   },
   "ncbi_gi" : {
      "fullname" : null,
      "abbreviation" : "NCBI_gi",
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=113194944",
      "object" : "Identifier",
      "uri_prefix" : null,
      "database" : "NCBI databases",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "local_id_syntax" : "^[0-9]{6,}$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "example_id" : "NCBI_gi:113194944"
   },
   "jcvi_medtr" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "JCVI_Medtr:Medtr5g024510",
      "url_syntax" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=[example_id]",
      "database" : "Medicago truncatula genome database at the J. Craig Venter Institute ",
      "uri_prefix" : null,
      "generic_url" : "http://medicago.jcvi.org/cgi-bin/medicago/overview.cgi",
      "url_example" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=Medtr5g024510",
      "object" : "Accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "JCVI_Medtr"
   },
   "uniprotkb-subcell" : {
      "generic_url" : "http://www.uniprot.org/locations/",
      "uri_prefix" : null,
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "UniProtKB-SubCell",
      "name" : null,
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "object" : "Identifier"
   },
   "cazy" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.cazy.org/",
      "database" : "Carbohydrate Active EnZYmes",
      "example_id" : "CAZY:PL11",
      "url_syntax" : "http://www.cazy.org/[example_id].html",
      "local_id_syntax" : "^(CE|GH|GT|PL)\\d+$",
      "datatype" : null,
      "description" : "The CAZy database describes the families of structurally-related catalytic and carbohydrate-binding modules (or functional domains) of enzymes that degrade, modify, or create glycosidic bonds.",
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CAZY",
      "url_example" : "http://www.cazy.org/PL11.html",
      "object" : "Identifier"
   },
   "uniprotkb-kw" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "example_id" : "UniProtKB-KW:KW-0812",
      "uri_prefix" : null,
      "database" : "UniProt Knowledgebase keywords",
      "generic_url" : "http://www.uniprot.org/keywords/",
      "object" : "Identifier",
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "fullname" : null,
      "abbreviation" : "UniProtKB-KW",
      "name" : null
   },
   "unipathway" : {
      "url_example" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=UPA00155",
      "object" : "Identifier",
      "fullname" : null,
      "abbreviation" : "UniPathway",
      "name" : null,
      "id" : null,
      "description" : "UniPathway is a a metabolic door to UniProtKB/Swiss-Prot, a curated resource of metabolic pathways for the UniProtKB/Swiss-Prot knowledgebase.",
      "datatype" : null,
      "url_syntax" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=[example_id]",
      "example_id" : "UniPathway:UPA00155",
      "database" : "UniPathway",
      "uri_prefix" : null,
      "generic_url" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway"
   },
   "ensembl_proteinid" : {
      "url_example" : "http://www.ensembl.org/id/ENSP00000361027",
      "object" : "Protein identifier",
      "fullname" : null,
      "abbreviation" : "ENSEMBL_ProteinID",
      "name" : null,
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "local_id_syntax" : "^ENSP[0-9]{9,16}$",
      "example_id" : "ENSEMBL_ProteinID:ENSP00000361027",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://www.ensembl.org/",
      "uri_prefix" : null,
      "database" : "Ensembl database of automatically annotated genomic data"
   },
   "subtilist" : {
      "abbreviation" : "SUBTILIST",
      "fullname" : null,
      "name" : null,
      "object" : "Accession",
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "database" : "Bacillus subtilis Genome Sequence Project",
      "url_syntax" : null,
      "example_id" : "SUBTILISTG:BG11384",
      "id" : null,
      "datatype" : null
   },
   "dictybase_gene_name" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "dictyBase_gene_name:mlcE",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "database" : "dictyBase",
      "uri_prefix" : null,
      "generic_url" : "http://dictybase.org",
      "object" : "Gene name",
      "url_example" : "http://dictybase.org/gene/mlcE",
      "name" : null,
      "abbreviation" : "dictyBase_gene_name",
      "fullname" : null
   },
   "tigr_genprop" : {
      "object" : "Accession",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "TIGR_GenProp",
      "example_id" : "JCVI_GenProp:GenProp0120",
      "local_id_syntax" : "^GenProp[0-9]{4}$",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "generic_url" : "http://cmr.jcvi.org/"
   },
   "isbn" : {
      "uri_prefix" : null,
      "generic_url" : "http://isbntools.com/",
      "database" : "International Standard Book Number",
      "url_syntax" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=[example_id]",
      "example_id" : "ISBN:0781702534",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "ISBN",
      "name" : null,
      "url_example" : "https://en.wikipedia.org/w/index.php?title=Special%3ABookSources&isbn=0123456789",
      "object" : "Identifier"
   },
   "cgdid" : {
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "object" : "Identifier for CGD Loci",
      "abbreviation" : "CGDID",
      "fullname" : null,
      "name" : null,
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "local_id_syntax" : "^(CAL|CAF)[0-9]{7}$",
      "example_id" : "CGD:CAL0005516",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "uri_prefix" : null,
      "database" : "Candida Genome Database"
   },
   "gb" : {
      "id" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "description" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "local_id_syntax" : "^[A-Z]{2}[0-9]{6}$",
      "example_id" : "GB:AA816246",
      "database" : "GenBank",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "uri_prefix" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "object" : "Sequence accession",
      "fullname" : null,
      "abbreviation" : "GB",
      "name" : null
   },
   "geneid" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "GeneID",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "object" : "Identifier",
      "database" : "NCBI Gene",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "NCBI_Gene:4771",
      "local_id_syntax" : "^\\d+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]"
   },
   "kegg_reaction" : {
      "local_id_syntax" : "^R\\d+$",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?rn:[example_id]",
      "example_id" : "KEGG:R02328",
      "id" : null,
      "datatype" : null,
      "database" : "KEGG Reaction Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.genome.jp/kegg/reaction/",
      "object" : "Reaction",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?rn:R02328",
      "abbreviation" : "KEGG_REACTION",
      "fullname" : null,
      "name" : null
   },
   "mgd" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MGD",
      "object" : "Gene symbol",
      "url_example" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.informatics.jax.org/",
      "database" : "Mouse Genome Database",
      "example_id" : "MGD:Adcy9",
      "url_syntax" : null,
      "datatype" : null,
      "! url_syntax" : "http://www.informatics.jax.org/searches/marker.cgi?",
      "id" : null
   },
   "interpro" : {
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "INTERPRO",
      "datatype" : null,
      "id" : null,
      "example_id" : "InterPro:IPR000001",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "local_id_syntax" : "^IPR\\d{6}$",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "database" : "InterPro database of protein domains and motifs",
      "uri_prefix" : null
   },
   "prodom" : {
      "fullname" : null,
      "abbreviation" : "ProDom",
      "name" : null,
      "url_example" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=PD000001",
      "object" : "Accession",
      "uri_prefix" : null,
      "database" : "ProDom protein domain families",
      "generic_url" : "http://prodom.prabi.fr/prodom/current/html/home.php",
      "url_syntax" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=[example_id]",
      "example_id" : "ProDom:PD000001",
      "id" : null,
      "datatype" : null,
      "description" : "ProDom protein domain families automatically generated from UniProtKB"
   },
   "corum" : {
      "fullname" : null,
      "abbreviation" : "CORUM",
      "name" : null,
      "url_example" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=837",
      "object" : "Identifier",
      "database" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "uri_prefix" : null,
      "generic_url" : "http://mips.gsf.de/genre/proj/corum/",
      "url_syntax" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=[example_id]",
      "example_id" : "CORUM:837",
      "id" : null,
      "datatype" : null
   },
   "uniprot" : {
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "local_id_syntax" : "^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z]([0-9][A-Z][A-Z0-9]{2}){1,2}[0-9])((-[0-9]+)|:PRO_[0-9]{10}|:VAR_[0-9]{6}){0,1}$",
      "example_id" : "UniProtKB:P51587",
      "entity_type" : "PR:000000001 ! protein ",
      "id" : null,
      "description" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "datatype" : null,
      "generic_url" : "http://www.uniprot.org",
      "database" : "Universal Protein Knowledgebase",
      "uri_prefix" : null,
      "object" : "Accession",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "fullname" : null,
      "abbreviation" : "UniProt",
      "name" : null
   },
   "pombase" : {
      "database" : "PomBase",
      "uri_prefix" : null,
      "generic_url" : "http://www.pombase.org/",
      "url_syntax" : "http://www.pombase.org/spombe/result/[example_id]",
      "local_id_syntax" : "^S\\w+(\\.)?\\w+(\\.)?$",
      "example_id" : "PomBase:SPBC11B10.09",
      "entity_type" : "SO:0000704 ! gene ",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "PomBase",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.pombase.org/spombe/result/SPBC11B10.09",
      "object" : "Identifier"
   },
   "pamgo_gat" : {
      "object" : "Gene",
      "url_example" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=atu0001",
      "fullname" : null,
      "abbreviation" : "PAMGO_GAT",
      "name" : null,
      "url_syntax" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=[example_id]",
      "example_id" : "PAMGO_GAT:Atu0001",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://agro.vbi.vt.edu/public/",
      "uri_prefix" : null,
      "database" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group"
   },
   "kegg" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "KEGG",
      "object" : "identifier",
      "url_example" : null,
      "uri_prefix" : null,
      "database" : "Kyoto Encyclopedia of Genes and Genomes",
      "generic_url" : "http://www.genome.ad.jp/kegg/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "cog" : {
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "uri_prefix" : null,
      "database" : "NCBI Clusters of Orthologous Groups",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "abbreviation" : "COG",
      "fullname" : null
   },
   "go_ref" : {
      "url_syntax" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:[example_id]",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "GO_REF:0000001",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "Gene Ontology Database references",
      "generic_url" : "http://www.geneontology.org/",
      "url_example" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:0000001",
      "object" : "Accession (for reference)",
      "abbreviation" : "GO_REF",
      "fullname" : null,
      "name" : null
   },
   "trait" : {
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "uri_prefix" : null,
      "database" : "TRAnscript Integrated Table",
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "description" : "an integrated database of transcripts expressed in human skeletal muscle",
      "abbreviation" : "TRAIT",
      "fullname" : null,
      "name" : null,
      "object" : null,
      "url_example" : null
   },
   "jcvi_pfa1" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "JCVI_Pfa1",
      "is_obsolete" : "true",
      "object" : "Accession",
      "url_example" : null,
      "database" : "Plasmodium falciparum database at the J. Craig Venter Institute",
      "uri_prefix" : null,
      "generic_url" : "http://www.tigr.org/tdb/e2k1/pfa1/pfa1.shtml",
      "datatype" : null,
      "id" : null,
      "example_id" : "JCVI_Pfa1:PFB0010w",
      "url_syntax" : null
   },
   "nc-iubmb" : {
      "generic_url" : "http://www.chem.qmw.ac.uk/iubmb/",
      "uri_prefix" : null,
      "database" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "NC-IUBMB",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : null
   },
   "refseq_prot" : {
      "is_obsolete" : "true",
      "replaced_by" : "RefSeq",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=YP_498627",
      "fullname" : null,
      "abbreviation" : "RefSeq_Prot",
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "example_id" : "RefSeq_Prot:YP_498627",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "database" : "RefSeq (Protein)"
   },
   "rnamdb" : {
      "abbreviation" : "RNAMDB",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "database" : "RNA Modification Database",
      "uri_prefix" : null,
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "example_id" : "RNAmods:037",
      "id" : null,
      "datatype" : null
   },
   "genedb_tbrucei" : {
      "fullname" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=tryp&name=Tb927.1.5250",
      "shorthand_name" : "Tbrucei",
      "is_obsolete" : "true",
      "replaced_by" : "GeneDB",
      "generic_url" : "http://www.genedb.org/genedb/tryp/",
      "uri_prefix" : null,
      "example_id" : "GeneDB_Tbrucei:Tb927.1.5250",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=tryp&name=[example_id]",
      "datatype" : null,
      "name" : null,
      "abbreviation" : "GeneDB_Tbrucei",
      "object" : "Gene identifier",
      "database" : "Trypanosoma brucei GeneDB",
      "local_id_syntax" : "^Tb\\d+\\.\\d+\\.\\d+$",
      "id" : null
   },
   "nif_subcellular" : {
      "database" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "uri_prefix" : null,
      "generic_url" : "http://www.neurolex.org/wiki",
      "url_syntax" : "http://www.neurolex.org/wiki/[example_id]",
      "example_id" : "NIF_Subcellular:sao1186862860",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "NIF_Subcellular",
      "fullname" : null,
      "name" : null,
      "object" : "ontology term",
      "url_example" : "http://www.neurolex.org/wiki/sao1770195789"
   },
   "reactome" : {
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "uri_prefix" : null,
      "generic_url" : "http://www.reactome.org/",
      "example_id" : "Reactome:REACT_604",
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "local_id_syntax" : "^REACT_[0-9]+$",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Reactome",
      "object" : "Identifier",
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604"
   },
   "tair" : {
      "example_id" : "TAIR:locus:2146653",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?accession=[example_id]",
      "local_id_syntax" : "^locus:[0-9]{7}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "generic_url" : "http://www.arabidopsis.org/",
      "uri_prefix" : null,
      "database" : "The Arabidopsis Information Resource",
      "object" : "Accession",
      "url_example" : "http://arabidopsis.org/servlets/TairObject?accession=locus:2146653",
      "name" : null,
      "abbreviation" : "TAIR",
      "fullname" : null
   },
   "wormpep" : {
      "is_obsolete" : "true",
      "url_example" : "http://www.wormbase.org/db/get?class=Protein;name=WP:CE15104",
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Wormpep",
      "datatype" : null,
      "id" : null,
      "example_id" : "WP:CE25104",
      "url_syntax" : "http://www.wormbase.org/db/get?class=Protein;name=WP:[example_id]",
      "generic_url" : "http://www.wormbase.org/",
      "uri_prefix" : null,
      "database" : "Wormpep database of proteins of C. elegans"
   },
   "apidb_plasmodb" : {
      "name" : null,
      "abbreviation" : "ApiDB_PlasmoDB",
      "fullname" : null,
      "object" : "PlasmoDB Gene ID",
      "url_example" : "http://www.plasmodb.org/gene/PF11_0344",
      "database" : "PlasmoDB Plasmodium Genome Resource",
      "uri_prefix" : null,
      "generic_url" : "http://plasmodb.org/",
      "example_id" : "ApiDB_PlasmoDB:PF11_0344",
      "url_syntax" : "http://www.plasmodb.org/gene/[example_id]",
      "datatype" : null,
      "id" : null
   },
   "taxon" : {
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "name" : null,
      "abbreviation" : "taxon",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "taxon:7227",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "database" : "NCBI Taxonomy",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/"
   },
   "gonuts" : {
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MOUSE:CD28",
      "object" : "Identifier (for gene or gene product)",
      "fullname" : null,
      "abbreviation" : "GONUTS",
      "name" : null,
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "example_id" : "GONUTS:MOUSE:CD28",
      "id" : null,
      "datatype" : null,
      "description" : "Third party documentation for GO and community annotation system.",
      "uri_prefix" : null,
      "database" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "generic_url" : "http://gowiki.tamu.edu"
   },
   "ntnu_sb" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "generic_url" : "http://www.ntnu.edu/nt/systemsbiology",
      "uri_prefix" : null,
      "database" : "Norwegian University of Science and Technology, Systems Biology team",
      "object" : null,
      "url_example" : null,
      "abbreviation" : "NTNU_SB",
      "fullname" : null,
      "name" : null
   },
   "sp_sl" : {
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "generic_url" : "http://www.uniprot.org/locations/",
      "object" : "Identifier",
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SP_SL"
   },
   "po" : {
      "abbreviation" : "PO",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:0009004",
      "uri_prefix" : null,
      "generic_url" : "http://www.plantontology.org/",
      "database" : "Plant Ontology Consortium Database",
      "local_id_syntax" : "^[0-9]{7}$",
      "url_syntax" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:[example_id]",
      "example_id" : "PO:0009004",
      "id" : null,
      "entity_type" : "PO:0009012 ! plant structure development stage ",
      "datatype" : null
   },
   "wikipedia" : {
      "fullname" : null,
      "abbreviation" : "Wikipedia",
      "name" : null,
      "object" : "Page Reference Identifier",
      "url_example" : "http://en.wikipedia.org/wiki/Endoplasmic_reticulum",
      "generic_url" : "http://en.wikipedia.org/",
      "uri_prefix" : null,
      "database" : "Wikipedia",
      "url_syntax" : "http://en.wikipedia.org/wiki/[example_id]",
      "example_id" : "Wikipedia:Endoplasmic_reticulum",
      "id" : null,
      "datatype" : null
   },
   "pinc" : {
      "description" : "represents GO annotations created in 2001 for NCBI and extracted into UniProtKB-GOA from EntrezGene",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "generic_url" : "http://www.proteome.com/",
      "uri_prefix" : null,
      "database" : "Proteome Inc.",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PINC"
   },
   "alzheimers_university_of_toronto" : {
      "database" : "Alzheimers Project at University of Toronto",
      "uri_prefix" : null,
      "generic_url" : "http://www.ims.utoronto.ca/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "fullname" : null,
      "abbreviation" : "Alzheimers_University_of_Toronto",
      "name" : null,
      "object" : null,
      "url_example" : null
   },
   "ncbi_nm" : {
      "name" : null,
      "abbreviation" : "NCBI_NM",
      "fullname" : null,
      "object" : "mRNA identifier",
      "url_example" : null,
      "replaced_by" : "RefSeq",
      "is_obsolete" : "true",
      "database" : "NCBI RefSeq",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "example_id" : "NCBI_NM:123456",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "zfin" : {
      "fullname" : null,
      "abbreviation" : "ZFIN",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://zfin.org/cgi-bin/ZFIN_jump?record=ZDB-GENE-990415-103",
      "uri_prefix" : null,
      "generic_url" : "http://zfin.org/",
      "database" : "Zebrafish Information Network",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "url_syntax" : "http://zfin.org/cgi-bin/ZFIN_jump?record=[example_id]",
      "local_id_syntax" : "^ZDB-(GENE|GENO|MRPHLNO)-[0-9]{6}-[0-9]+$",
      "example_id" : "ZFIN:ZDB-GENE-990415-103"
   },
   "sgd" : {
      "local_id_syntax" : "^S[0-9]{9}$",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "example_id" : "SGD:S000006169",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "database" : "Saccharomyces Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.yeastgenome.org/",
      "object" : "Identifier for SGD Loci",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=S000006169",
      "abbreviation" : "SGD",
      "fullname" : null,
      "name" : null
   },
   "swiss-prot" : {
      "uri_prefix" : null,
      "database" : "UniProtKB/Swiss-Prot",
      "generic_url" : "http://www.uniprot.org",
      "example_id" : "Swiss-Prot:P51587",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "datatype" : null,
      "description" : "A curated protein sequence database which provides a high level of annotation and a minimal level of redundancy",
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Swiss-Prot",
      "object" : "Accession",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "is_obsolete" : "true",
      "replaced_by" : "UniProtKB"
   },
   "gr_qtl" : {
      "example_id" : "GR_QTL:CQU7",
      "url_syntax" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.gramene.org/",
      "object" : "QTL identifier",
      "url_example" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=CQU7",
      "name" : null,
      "fullname" : null,
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_QTL"
   },
   "gr_gene" : {
      "url_example" : "http://www.gramene.org/db/genes/search_gene?acc=GR:0060198",
      "object" : "Gene identifier",
      "fullname" : null,
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_gene",
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.gramene.org/db/genes/search_gene?acc=[example_id]",
      "example_id" : "GR_GENE:GR:0060198",
      "generic_url" : "http://www.gramene.org/",
      "database" : null,
      "uri_prefix" : null
   },
   "embl" : {
      "url_example" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=AA816246",
      "object" : "Sequence accession",
      "abbreviation" : "EMBL",
      "fullname" : null,
      "name" : null,
      "url_syntax" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=[example_id]",
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "example_id" : "EMBL:AA816246",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "description" : "International nucleotide sequence database collaboration, comprising EMBL-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "database" : "EMBL Nucleotide Sequence Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/embl/"
   },
   "mengo" : {
      "url_example" : null,
      "object" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MENGO",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "generic_url" : "http://mengo.vbi.vt.edu/",
      "uri_prefix" : null,
      "database" : "Microbial ENergy processes Gene Ontology Project"
   },
   "maizegdb" : {
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=[example_id]",
      "example_id" : "MaizeGDB:881225",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "MaizeGDB",
      "generic_url" : "http://www.maizegdb.org",
      "object" : "MaizeGDB Object ID Number",
      "url_example" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=881225",
      "abbreviation" : "MaizeGDB",
      "fullname" : null,
      "name" : null
   },
   "sgdid" : {
      "generic_url" : "http://www.yeastgenome.org/",
      "database" : "Saccharomyces Genome Database",
      "uri_prefix" : null,
      "example_id" : "SGD:S000006169",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "local_id_syntax" : "^S[0-9]{9}$",
      "datatype" : null,
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SGDID",
      "object" : "Identifier for SGD Loci",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=S000006169"
   },
   "panther" : {
      "url_example" : "http://www.pantherdb.org/panther/lookupId.jsp?id=PTHR10000",
      "object" : "Protein family tree identifier",
      "name" : null,
      "abbreviation" : "PANTHER",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "PANTHER:PTHR11455",
      "url_syntax" : "http://www.pantherdb.org/panther/lookupId.jsp?id=[example_id]",
      "uri_prefix" : null,
      "generic_url" : "http://www.pantherdb.org/",
      "database" : "Protein ANalysis THrough Evolutionary Relationships Classification System"
   },
   "ncbi" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "database" : "National Center for Biotechnology Information",
      "! url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=",
      "id" : null,
      "datatype" : null,
      "! url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "url_syntax" : null,
      "example_id" : null,
      "fullname" : null,
      "abbreviation" : "NCBI",
      "name" : null,
      "object" : "Prefix",
      "url_example" : null
   },
   "medline" : {
      "example_id" : "MEDLINE:20572430",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://www.nlm.nih.gov/databases/databases_medline.html",
      "uri_prefix" : null,
      "database" : "Medline literature database",
      "url_example" : null,
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "MEDLINE",
      "fullname" : null
   },
   "fma" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "FMA",
      "object" : "Identifier",
      "url_example" : null,
      "database" : "Foundational Model of Anatomy",
      "uri_prefix" : null,
      "generic_url" : "http://sig.biostr.washington.edu/projects/fm/index.html",
      "datatype" : null,
      "id" : null,
      "example_id" : "FMA:61905",
      "url_syntax" : null
   },
   "ecocyc" : {
      "generic_url" : "http://ecocyc.org/",
      "uri_prefix" : null,
      "database" : "Encyclopedia of E. coli metabolism",
      "example_id" : "EcoCyc:P2-PWY",
      "local_id_syntax" : "^EG[0-9]{5}$",
      "url_syntax" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "abbreviation" : "EcoCyc",
      "fullname" : null,
      "url_example" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=P2-PWY",
      "object" : "Pathway identifier"
   },
   "ddb" : {
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "object" : "Identifier",
      "fullname" : null,
      "abbreviation" : "DDB",
      "name" : null,
      "local_id_syntax" : "^DDB_G[0-9]{7}$",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "example_id" : "dictyBase:DDB_G0277859",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://dictybase.org",
      "database" : "dictyBase",
      "uri_prefix" : null
   },
   "phi" : {
      "object" : null,
      "url_example" : null,
      "name" : null,
      "abbreviation" : "PHI",
      "fullname" : null,
      "example_id" : "PHI:0000055",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "MeGO (Phage and Mobile Element Ontology)",
      "generic_url" : "http://aclame.ulb.ac.be/Classification/mego.html"
   },
   "ddb_ref" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "example_id" : "dictyBase_REF:10157",
      "database" : "dictyBase literature references",
      "generic_url" : "http://dictybase.org",
      "uri_prefix" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "object" : "Literature Reference Identifier",
      "fullname" : null,
      "abbreviation" : "DDB_REF",
      "name" : null
   },
   "uniprotkb/trembl" : {
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "example_id" : "TrEMBL:O31124",
      "id" : null,
      "description" : "UniProtKB-TrEMBL, a computer-annotated protein sequence database supplementing UniProtKB and containing the translations of all coding sequences (CDS) present in the EMBL Nucleotide Sequence Database but not yet integrated in UniProtKB/Swiss-Prot",
      "datatype" : null,
      "database" : "UniProtKB-TrEMBL protein sequence database",
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org",
      "url_example" : "http://www.uniprot.org/uniprot/O31124",
      "object" : "Accession",
      "is_obsolete" : "true",
      "replaced_by" : "UniProtKB",
      "fullname" : null,
      "abbreviation" : "UniProtKB/TrEMBL",
      "name" : null
   },
   "jcvi_egad" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "example_id" : "JCVI_EGAD:74462",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "object" : "Accession",
      "fullname" : null,
      "abbreviation" : "JCVI_EGAD",
      "name" : null
   },
   "metacyc" : {
      "uri_prefix" : null,
      "generic_url" : "http://metacyc.org/",
      "database" : "Metabolic Encyclopedia of metabolic and other pathways",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=[example_id]",
      "example_id" : "MetaCyc:GLUTDEG-PWY",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "MetaCyc",
      "name" : null,
      "object" : "Identifier (pathway or reaction)",
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=GLUTDEG-PWY"
   },
   "pompep" : {
      "url_example" : null,
      "object" : "Gene/protein identifier",
      "name" : null,
      "abbreviation" : "Pompep",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "Pompep:SPAC890.04C",
      "url_syntax" : null,
      "generic_url" : "ftp://ftp.sanger.ac.uk/pub/yeast/pombe/Protein_data/",
      "uri_prefix" : null,
      "database" : "Schizosaccharomyces pombe protein data"
   },
   "um-bbd_ruleid" : {
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=[example_id]",
      "example_id" : "UM-BBD_ruleID:bt0330",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "uri_prefix" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "object" : "Rule identifier",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=bt0330",
      "abbreviation" : "UM-BBD_ruleID",
      "fullname" : null,
      "name" : null
   },
   "omim" : {
      "uri_prefix" : null,
      "database" : "Mendelian Inheritance in Man",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "example_id" : "OMIM:190198",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "OMIM",
      "object" : "Identifier",
      "url_example" : "http://omim.org/entry/190198"
   },
   "broad_neurospora" : {
      "uri_prefix" : null,
      "database" : "Neurospora crassa Database",
      "generic_url" : "http://www.broadinstitute.org/annotation/genome/neurospora/MultiHome.html",
      "id" : null,
      "description" : "Neurospora crassa database at the Broad Institute",
      "datatype" : null,
      "url_syntax" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S[example_id]",
      "example_id" : "BROAD_NEUROSPORA:7000007580576824",
      "abbreviation" : "Broad_NEUROSPORA",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.broadinstitute.org/annotation/genome/neurospora/GeneDetails.html?sp=S7000007580576824",
      "object" : "Identifier for Broad_Ncrassa Loci"
   },
   "agbase" : {
      "name" : null,
      "abbreviation" : "AgBase",
      "fullname" : null,
      "url_example" : null,
      "object" : null,
      "uri_prefix" : null,
      "database" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "generic_url" : "http://www.agbase.msstate.edu/",
      "example_id" : null,
      "url_syntax" : "http://www.agbase.msstate.edu/cgi-bin/getEntry.pl?db_pick=[ChickGO/MaizeGO]&uid=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "tigr_cmr" : {
      "name" : null,
      "abbreviation" : "TIGR_CMR",
      "fullname" : null,
      "object" : "Locus",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "database" : "Comprehensive Microbial Resource at the J. Craig Venter Institute",
      "generic_url" : "http://cmr.jcvi.org/",
      "uri_prefix" : null,
      "example_id" : "JCVI_CMR:VCA0557",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "multifun" : {
      "object" : null,
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MultiFun",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "database" : "MultiFun cell function assignment schema",
      "uri_prefix" : null,
      "generic_url" : "http://genprotec.mbl.edu/files/MultiFun.html"
   },
   "genedb_gmorsitans" : {
      "replaced_by" : "GeneDB",
      "is_obsolete" : "true",
      "shorthand_name" : "Tsetse",
      "url_example" : "http://www.genedb.org/genedb/Search?organism=glossina&name=Gmm-0142",
      "object" : "Gene identifier",
      "fullname" : null,
      "abbreviation" : "GeneDB_Gmorsitans",
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=glossina&name=[example_id]",
      "example_id" : "GeneDB_Gmorsitans:Gmm-0142",
      "uri_prefix" : null,
      "database" : "Glossina morsitans GeneDB",
      "generic_url" : "http://www.genedb.org/genedb/glossina/"
   },
   "trembl" : {
      "fullname" : null,
      "abbreviation" : "TrEMBL",
      "name" : null,
      "replaced_by" : "UniProtKB",
      "is_obsolete" : "true",
      "object" : "Accession",
      "url_example" : "http://www.uniprot.org/uniprot/O31124",
      "generic_url" : "http://www.uniprot.org",
      "uri_prefix" : null,
      "database" : "UniProtKB-TrEMBL protein sequence database",
      "id" : null,
      "datatype" : null,
      "description" : "UniProtKB-TrEMBL, a computer-annotated protein sequence database supplementing UniProtKB and containing the translations of all coding sequences (CDS) present in the EMBL Nucleotide Sequence Database but not yet integrated in UniProtKB/Swiss-Prot",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "example_id" : "TrEMBL:O31124"
   },
   "hgnc_gene" : {
      "object" : "Gene symbol",
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?app_sym=ABCA1",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "HGNC_gene",
      "datatype" : null,
      "id" : null,
      "example_id" : "HGNC_gene:ABCA1",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?app_sym=[example_id]",
      "generic_url" : "http://www.genenames.org/",
      "uri_prefix" : null,
      "database" : "HUGO Gene Nomenclature Committee"
   },
   "pseudocap" : {
      "object" : "Identifier",
      "url_example" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=PA4756",
      "name" : null,
      "abbreviation" : "PseudoCAP",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "PseudoCAP:PA4756",
      "url_syntax" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=[example_id]",
      "database" : "Pseudomonas Genome Project",
      "uri_prefix" : null,
      "generic_url" : "http://v2.pseudomonas.com/"
   },
   "h-invdb_locus" : {
      "object" : "Cluster identifier",
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=HIX0014446",
      "name" : null,
      "abbreviation" : "H-invDB_locus",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "H-invDB_locus:HIX0014446",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=[example_id]",
      "generic_url" : "http://www.h-invitational.jp/",
      "uri_prefix" : null,
      "database" : "H-invitational Database"
   },
   "iuphar_gpcr" : {
      "database" : "International Union of Pharmacology",
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=[example_id]",
      "example_id" : "IUPHAR_GPCR:1279",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "IUPHAR_GPCR",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=13",
      "object" : "G-protein-coupled receptor family identifier"
   },
   "prow" : {
      "object" : null,
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PROW",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "database" : "Protein Reviews on the Web",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/prow/"
   },
   "uniparc" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org/uniparc/",
      "database" : "UniProt Archive",
      "url_syntax" : "http://www.uniprot.org/uniparc/[example_id]",
      "example_id" : "UniParc:UPI000000000A",
      "id" : null,
      "description" : "A non-redundant archive of protein sequences extracted from Swiss-Prot, TrEMBL, PIR-PSD, EMBL, Ensembl, IPI, PDB, RefSeq, FlyBase, WormBase, European Patent Office, United States Patent and Trademark Office, and Japanese Patent Office",
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "UniParc",
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniparc/UPI000000000A",
      "object" : "Accession"
   },
   "rhea" : {
      "description" : "Rhea is a freely available, manually annotated database of chemical reactions created in collaboration with the Swiss Institute of Bioinformatics (SIB).",
      "datatype" : null,
      "id" : null,
      "example_id" : "RHEA:25811",
      "url_syntax" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=[example_id]",
      "database" : "Rhea, the Annotated Reactions Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/rhea/",
      "url_example" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=25811",
      "object" : "Accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "RHEA"
   },
   "jcvi_ref" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "JCVI_REF:GO_ref",
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "J. Craig Venter Institute",
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "object" : "Reference locator",
      "fullname" : null,
      "abbreviation" : "JCVI_REF",
      "name" : null
   },
   "doi" : {
      "url_example" : "http://dx.doi.org/DOI:10.1016/S0963-9969(99)00021-6",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "DOI",
      "fullname" : null,
      "example_id" : "DOI:10.1016/S0963-9969(99)00021-6",
      "local_id_syntax" : "^10\\.[0-9]+\\/.*$",
      "url_syntax" : "http://dx.doi.org/DOI:[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "Digital Object Identifier",
      "generic_url" : "http://dx.doi.org/"
   },
   "uberon" : {
      "object" : "Identifier",
      "url_example" : "http://purl.obolibrary.org/obo/UBERON_0002398",
      "fullname" : null,
      "abbreviation" : "UBERON",
      "name" : null,
      "id" : null,
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "description" : "A multi-species anatomy ontology",
      "datatype" : null,
      "local_id_syntax" : "^[0-9]{7}$",
      "url_syntax" : "http://purl.obolibrary.org/obo/UBERON_[example_id]",
      "example_id" : "URBERON:0002398",
      "uri_prefix" : null,
      "generic_url" : "http://uberon.org",
      "database" : "Uber-anatomy ontology"
   },
   "pr" : {
      "local_id_syntax" : "^[0-9]{9}$",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "example_id" : "PR:000025380",
      "id" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "Protein Ontology",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "object" : "Identifer",
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "abbreviation" : "PR",
      "fullname" : null,
      "name" : null
   },
   "ri" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.roslin.ac.uk/",
      "database" : "Roslin Institute",
      "url_example" : null,
      "object" : null,
      "fullname" : null,
      "abbreviation" : "RI",
      "name" : null
   },
   "rfam" : {
      "uri_prefix" : null,
      "database" : "Rfam database of RNA families",
      "generic_url" : "http://rfam.sanger.ac.uk/",
      "url_syntax" : "http://rfam.sanger.ac.uk/family/[example_id]",
      "example_id" : "Rfam:RF00012",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "Rfam",
      "fullname" : null,
      "name" : null,
      "object" : "accession",
      "url_example" : "http://rfam.sanger.ac.uk/family/RF00012"
   },
   "obo_sf_po" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "OBO_SF_PO",
      "url_example" : "https://sourceforge.net/tracker/index.php?func=detail&aid=3184921&group_id=76834&atid=835555",
      "object" : "Term request",
      "uri_prefix" : null,
      "database" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "generic_url" : "http://sourceforge.net/tracker/?func=browse&group_id=76834&atid=835555",
      "datatype" : null,
      "id" : null,
      "example_id" : "OBO_SF_PO:3184921",
      "url_syntax" : "https://sourceforge.net/tracker/index.php?func=detail&aid=[example_id]&group_id=76834&atid=835555"
   },
   "rnamods" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "RNAmods:037",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "uri_prefix" : null,
      "database" : "RNA Modification Database",
      "object" : "Identifier",
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "RNAmods"
   },
   "gdb" : {
      "object" : "Accession",
      "url_example" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:306600",
      "name" : null,
      "abbreviation" : "GDB",
      "fullname" : null,
      "example_id" : "GDB:306600",
      "url_syntax" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.gdb.org/",
      "database" : "Human Genome Database"
   },
   "mo" : {
      "object" : "ontology term",
      "url_example" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#Action",
      "abbreviation" : "MO",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#[example_id]",
      "example_id" : "MO:Action",
      "generic_url" : "http://mged.sourceforge.net/ontologies/MGEDontology.php",
      "uri_prefix" : null,
      "database" : "MGED Ontology"
   },
   "rgd" : {
      "database" : "Rat Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://rgd.mcw.edu/",
      "example_id" : "RGD:2004",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "local_id_syntax" : "^[0-9]{4,7}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "name" : null,
      "abbreviation" : "RGD",
      "fullname" : null,
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "object" : "Accession"
   },
   "nmpdr" : {
      "uri_prefix" : null,
      "database" : "National Microbial Pathogen Data Resource",
      "generic_url" : "http://www.nmpdr.org",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.nmpdr.org/linkin.cgi?id=[example_id]",
      "example_id" : "NMPDR:fig|306254.1.peg.183",
      "abbreviation" : "NMPDR",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.nmpdr.org/linkin.cgi?id=fig|306254.1.peg.183"
   },
   "dictybase_ref" : {
      "abbreviation" : "dictyBase_REF",
      "fullname" : null,
      "name" : null,
      "object" : "Literature Reference Identifier",
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "uri_prefix" : null,
      "generic_url" : "http://dictybase.org",
      "database" : "dictyBase literature references",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "example_id" : "dictyBase_REF:10157"
   },
   "pmid" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PMID",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "database" : "PubMed",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "datatype" : null,
      "id" : null,
      "example_id" : "PMID:4208797",
      "local_id_syntax" : "^[0-9]+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]"
   },
   "merops_fam" : {
      "abbreviation" : "MEROPS_fam",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=m18",
      "object" : "Peptidase family identifier",
      "uri_prefix" : null,
      "generic_url" : "http://merops.sanger.ac.uk/",
      "database" : "MEROPS peptidase database",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=[example_id]",
      "example_id" : "MEROPS_fam:M18",
      "id" : null,
      "datatype" : null
   },
   "aspgd_locus" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "database" : "Aspergillus Genome Database",
      "datatype" : null,
      "id" : null,
      "example_id" : "AspGD_LOCUS:AN10942",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "AspGD_LOCUS",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=AN10942"
   },
   "casref" : {
      "database" : "Catalog of Fishes publications database",
      "uri_prefix" : null,
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "datatype" : null,
      "id" : null,
      "example_id" : "CASREF:2031",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=[example_id]",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CASREF",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=2031",
      "object" : "Identifier"
   },
   "wbbt" : {
      "fullname" : null,
      "abbreviation" : "WBbt",
      "name" : null,
      "url_example" : null,
      "object" : "Identifier",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "C. elegans gross anatomy",
      "entity_type" : "WBbt:0005766 ! anatomy",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "[0-9]{7}",
      "url_syntax" : null,
      "example_id" : "WBbt:0005733"
   },
   "pmcid" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.pubmedcentral.nih.gov/",
      "database" : "Pubmed Central",
      "example_id" : "PMCID:PMC201377",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=[example_id]",
      "datatype" : null,
      "id" : null,
      "!url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=[example_id]",
      "name" : null,
      "abbreviation" : "PMCID",
      "!url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=PMC201377",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=PMC201377",
      "object" : "Identifier"
   },
   "pfam" : {
      "name" : null,
      "abbreviation" : "Pfam",
      "fullname" : null,
      "url_example" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?PF00046",
      "object" : "Accession",
      "database" : "Pfam database of protein families",
      "uri_prefix" : null,
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "example_id" : "Pfam:PF00046",
      "url_syntax" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?[example_id]",
      "datatype" : null,
      "description" : "Pfam is a collection of protein families represented by sequence alignments and hidden Markov models (HMMs)",
      "entity_type" : "SO:0000110 ! sequence feature",
      "id" : null
   },
   "wb" : {
      "object" : "Gene identifier",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "WB",
      "example_id" : "WB:WBGene00003001",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "local_id_syntax" : "^WB(Gene|Var|RNAi|Transgene)[0-9]{8}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene ",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase database of nematode biology"
   },
   "cl" : {
      "generic_url" : "http://cellontology.org",
      "uri_prefix" : null,
      "database" : "Cell Type Ontology",
      "example_id" : "CL:0000041",
      "url_syntax" : "http://purl.obolibrary.org/obo/CL_[example_id]",
      "local_id_syntax" : "^[0-9]{7}$",
      "datatype" : null,
      "id" : null,
      "entity_type" : "CL:0000000 ! cell ",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CL",
      "url_example" : "http://purl.obolibrary.org/obo/CL_0000041",
      "object" : "Identifier"
   },
   "pubchem_substance" : {
      "example_id" : "PubChem_Substance:4594",
      "local_id_syntax" : "^[0-9]{4,}$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "database" : "NCBI PubChem database of chemical substances",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=4594",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "PubChem_Substance",
      "fullname" : null
   },
   "sgd_ref" : {
      "example_id" : "SGD_REF:S000049602",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "Saccharomyces Genome Database",
      "generic_url" : "http://www.yeastgenome.org/",
      "object" : "Literature Reference Identifier",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=S000049602",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SGD_REF"
   },
   "fypo" : {
      "url_example" : null,
      "object" : "Identifier",
      "abbreviation" : "FYPO",
      "fullname" : null,
      "name" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_syntax" : null,
      "example_id" : "FYPO:0000001",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.pombase.org/",
      "database" : "Fission Yeast Phenotype Ontology"
   },
   "seed" : {
      "abbreviation" : "SEED",
      "fullname" : null,
      "name" : null,
      "object" : "identifier",
      "url_example" : "http://www.theseed.org/linkin.cgi?id=fig|83331.1.peg.1",
      "uri_prefix" : null,
      "generic_url" : "http://www.theseed.org",
      "database" : "The SEED;",
      "id" : null,
      "datatype" : null,
      "description" : "Project to annotate the first 1000 sequenced genomes, develop detailed metabolic reconstructions, and construct the corresponding stoichiometric matrices",
      "url_syntax" : "http://www.theseed.org/linkin.cgi?id=[example_id]",
      "example_id" : "SEED:fig|83331.1.peg.1"
   },
   "obo_rel" : {
      "url_example" : null,
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "OBO_REL",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "OBO_REL:part_of",
      "url_syntax" : null,
      "generic_url" : "http://www.obofoundry.org/ro/",
      "uri_prefix" : null,
      "database" : "OBO relation ontology"
   },
   "ptarget" : {
      "generic_url" : "http://bioinformatics.albany.edu/~ptarget/",
      "uri_prefix" : null,
      "database" : "pTARGET Prediction server for protein subcellular localization",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "name" : null,
      "abbreviation" : "pTARGET",
      "fullname" : null,
      "object" : null,
      "url_example" : null
   },
   "gr_ref" : {
      "url_syntax" : "http://www.gramene.org/db/literature/pub_search?ref_id=[example_id]",
      "example_id" : "GR_REF:659",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.gramene.org/",
      "database" : null,
      "url_example" : "http://www.gramene.org/db/literature/pub_search?ref_id=659",
      "object" : "Reference",
      "fullname" : null,
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR_REF",
      "name" : null
   },
   "unigene" : {
      "object" : "Identifier (for transcript cluster)",
      "url_example" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=Hs&CID=212293",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "UniGene",
      "example_id" : "UniGene:Hs.212293",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=[organism_abbreviation]&CID=[cluster_id]",
      "datatype" : null,
      "description" : "NCBI transcript cluster database, organized by transcriptome. Each UniGene entry is a set of transcript sequences that appear to come from the same transcription locus (gene or expressed pseudogene).",
      "id" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/UniGene",
      "uri_prefix" : null,
      "database" : "UniGene"
   },
   "sgn_ref" : {
      "abbreviation" : "SGN_ref",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=861",
      "object" : "Reference identifier",
      "uri_prefix" : null,
      "generic_url" : "http://www.sgn.cornell.edu/",
      "database" : "Sol Genomics Network",
      "url_syntax" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=[example_id]",
      "example_id" : "SGN_ref:861",
      "id" : null,
      "datatype" : null
   },
   "fbbt" : {
      "url_example" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:00005177",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "FBbt",
      "fullname" : null,
      "example_id" : "FBbt:00005177",
      "url_syntax" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "Drosophila gross anatomy",
      "uri_prefix" : null,
      "generic_url" : "http://flybase.org/"
   },
   "pir" : {
      "uri_prefix" : null,
      "database" : "Protein Information Resource",
      "generic_url" : "http://pir.georgetown.edu/",
      "example_id" : "PIR:I49499",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=[example_id]",
      "local_id_syntax" : "^[A-Z]{1}[0-9]{5}$",
      "datatype" : null,
      "entity_type" : "PR:000000001 ! protein",
      "id" : null,
      "name" : null,
      "abbreviation" : "PIR",
      "fullname" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=I49499",
      "object" : "Accession"
   },
   "modbase" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "ModBase",
      "url_example" : "http://salilab.org/modbase/searchbyid?databaseID=P04848",
      "object" : "Accession",
      "uri_prefix" : null,
      "database" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "generic_url" : "http://modbase.compbio.ucsf.edu/ ",
      "datatype" : null,
      "id" : null,
      "example_id" : "ModBase:P10815",
      "url_syntax" : "http://salilab.org/modbase/searchbyid?databaseID=[example_id]"
   },
   "psi-mod" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "example_id" : "MOD:00219",
      "uri_prefix" : null,
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "object" : "Protein modification identifier",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "abbreviation" : "PSI-MOD",
      "fullname" : null,
      "name" : null
   },
   "jcvi_cmr" : {
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "Comprehensive Microbial Resource at the J. Craig Venter Institute",
      "example_id" : "JCVI_CMR:VCA0557",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "JCVI_CMR",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "object" : "Locus"
   },
   "ro" : {
      "object" : null,
      "url_example" : "http://purl.obolibrary.org/obo/RO_0002211",
      "abbreviation" : "RO",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "description" : "A collection of relations used across OBO ontologies",
      "datatype" : null,
      "url_syntax" : "http://purl.obolibrary.org/obo/RO_[example_id]",
      "example_id" : "RO:0002211",
      "database" : "OBO Relation Ontology Ontology",
      "uri_prefix" : null,
      "generic_url" : "http://purl.obolibrary.org/obo/ro"
   },
   "flybase" : {
      "generic_url" : "http://flybase.org/",
      "database" : "FlyBase",
      "uri_prefix" : null,
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "FB:FBgn0000024",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "local_id_syntax" : "^FBgn[0-9]{7}$",
      "name" : null,
      "abbreviation" : "FLYBASE",
      "fullname" : null,
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "object" : "Identifier"
   },
   "sgd_locus" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "SGD_LOCUS:GAL4",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "database" : "Saccharomyces Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.yeastgenome.org/",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=GAL4",
      "name" : null,
      "abbreviation" : "SGD_LOCUS",
      "fullname" : null
   },
   "pato" : {
      "generic_url" : "http://www.bioontology.org/wiki/index.php/PATO:Main_Page",
      "uri_prefix" : null,
      "database" : "Phenotypic quality ontology",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "PATO:0001420",
      "fullname" : null,
      "abbreviation" : "PATO",
      "name" : null,
      "object" : "Identifier",
      "url_example" : null
   },
   "psi-mi" : {
      "object" : "Interaction identifier",
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "PSI-MI",
      "name" : null,
      "url_syntax" : null,
      "example_id" : "MI:0018",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "uri_prefix" : null,
      "database" : "Proteomic Standard Initiative for Molecular Interaction"
   },
   "genedb_spombe" : {
      "name" : null,
      "abbreviation" : "GeneDB_Spombe",
      "object" : "Gene identifier",
      "database" : "Schizosaccharomyces pombe GeneDB",
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$",
      "id" : null,
      "fullname" : null,
      "url_example" : "http://old.genedb.org/genedb/Search?organism=pombe&name=SPAC890.04C",
      "shorthand_name" : "Spombe",
      "replaced_by" : "PomBase",
      "is_obsolete" : "true",
      "uri_prefix" : null,
      "generic_url" : "http://old.genedb.org/genedb/pombe/index.jsp",
      "example_id" : "GeneDB_Spombe:SPAC890.04C",
      "url_syntax" : "http://old.genedb.org/genedb/Search?organism=pombe&name=[example_id]",
      "datatype" : null,
      "entity_type" : "SO:0000704 ! gene "
   },
   "jcvi" : {
      "database" : "J. Craig Venter Institute",
      "uri_prefix" : null,
      "generic_url" : "http://www.jcvi.org/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "JCVI",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : null
   },
   "h-invdb" : {
      "fullname" : null,
      "abbreviation" : "H-invDB",
      "name" : null,
      "object" : null,
      "url_example" : null,
      "generic_url" : "http://www.h-invitational.jp/",
      "uri_prefix" : null,
      "database" : "H-invitational Database",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null
   },
   "kegg_pathway" : {
      "generic_url" : "http://www.genome.jp/kegg/pathway.html",
      "uri_prefix" : null,
      "database" : "KEGG Pathways Database",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?path:[example_id]",
      "example_id" : "KEGG_PATHWAY:ot00020",
      "abbreviation" : "KEGG_PATHWAY",
      "fullname" : null,
      "name" : null,
      "object" : "Pathway",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?path:ot00020"
   },
   "tigr_egad" : {
      "example_id" : "JCVI_EGAD:74462",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "object" : "Accession",
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "name" : null,
      "abbreviation" : "TIGR_EGAD",
      "fullname" : null
   },
   "muscletrait" : {
      "name" : null,
      "abbreviation" : "MuscleTRAIT",
      "fullname" : null,
      "url_example" : null,
      "object" : null,
      "database" : "TRAnscript Integrated Table",
      "uri_prefix" : null,
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "description" : "an integrated database of transcripts expressed in human skeletal muscle",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null
   },
   "hgnc" : {
      "object" : "Identifier",
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:29",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "HGNC",
      "example_id" : "HGNC:29",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:[example_id]",
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.genenames.org/",
      "database" : "HUGO Gene Nomenclature Committee"
   },
   "ec" : {
      "uri_prefix" : null,
      "database" : "Enzyme Commission",
      "generic_url" : "http://www.chem.qmul.ac.uk/iubmb/enzyme/",
      "! url_example" : "http://www.chem.qmw.ac.uk/iubmb/enzyme/EC1/4/3/6.html",
      "datatype" : null,
      "id" : null,
      "example_id" : "EC:1.4.3.6",
      "url_syntax" : "http://www.expasy.org/enzyme/[example_id]",
      "name" : null,
      "abbreviation" : "EC",
      "fullname" : null,
      "url_example" : "http://www.expasy.org/enzyme/1.4.3.6",
      "object" : null
   },
   "refgenome" : {
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "uri_prefix" : null,
      "database" : "GO Reference Genomes",
      "object" : null,
      "url_example" : null,
      "abbreviation" : "RefGenome",
      "fullname" : null,
      "name" : null
   },
   "pamgo_mgg" : {
      "object" : "Locus",
      "url_example" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=MGG_05132",
      "fullname" : null,
      "abbreviation" : "PAMGO_MGG",
      "name" : null,
      "url_syntax" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=[example_id]",
      "example_id" : "PAMGO_MGG:MGG_05132",
      "id" : null,
      "description" : "Magnaporthe grisea database at North Carolina State University; member of PAMGO Interest Group",
      "datatype" : null,
      "database" : "Magnaporthe grisea database",
      "uri_prefix" : null,
      "generic_url" : "http://scotland.fgl.ncsu.edu/smeng/GoAnnotationMagnaporthegrisea.html"
   },
   "iuphar_receptor" : {
      "url_example" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=56",
      "object" : "Receptor identifier",
      "abbreviation" : "IUPHAR_RECEPTOR",
      "fullname" : null,
      "name" : null,
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=[example_id]",
      "example_id" : "IUPHAR_RECEPTOR:2205",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/",
      "database" : "International Union of Pharmacology"
   },
   "mitre" : {
      "object" : null,
      "url_example" : null,
      "abbreviation" : "MITRE",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.mitre.org/",
      "database" : "The MITRE Corporation"
   },
   "ncbi_np" : {
      "name" : null,
      "abbreviation" : "NCBI_NP",
      "fullname" : null,
      "is_obsolete" : "true",
      "replaced_by" : "RefSeq",
      "url_example" : null,
      "object" : "Protein identifier",
      "database" : "NCBI RefSeq",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "datatype" : null,
      "id" : null,
      "example_id" : "NCBI_NP:123456",
      "url_syntax" : null
   },
   "tc" : {
      "database" : "Transport Protein Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.tcdb.org/",
      "example_id" : "TC:9.A.4.1.1",
      "url_syntax" : "http://www.tcdb.org/tcdb/index.php?tc=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "TC",
      "url_example" : "http://www.tcdb.org/tcdb/index.php?tc=9.A.4.1.1",
      "object" : "Identifier"
   },
   "gene3d" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Gene3D",
      "object" : "Accession",
      "url_example" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=G3DSA%3A3.30.390.30",
      "database" : "Domain Architecture Classification",
      "uri_prefix" : null,
      "generic_url" : "http://gene3d.biochem.ucl.ac.uk/Gene3D/",
      "example_id" : "Gene3D:G3DSA:3.30.390.30",
      "url_syntax" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "nasc_code" : {
      "object" : "NASC code Identifier",
      "url_example" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=N3371",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "NASC_code",
      "datatype" : null,
      "id" : null,
      "example_id" : "NASC_code:N3371",
      "url_syntax" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=[example_id]",
      "database" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "uri_prefix" : null,
      "generic_url" : "http://arabidopsis.info"
   },
   "roslin_institute" : {
      "uri_prefix" : null,
      "database" : "Roslin Institute",
      "generic_url" : "http://www.roslin.ac.uk/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Roslin_Institute",
      "object" : null,
      "url_example" : null
   },
   "tigr_tigrfams" : {
      "name" : null,
      "abbreviation" : "TIGR_TIGRFAMS",
      "fullname" : null,
      "object" : "Accession",
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "generic_url" : "http://search.jcvi.org/",
      "uri_prefix" : null,
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "wb_ref" : {
      "database" : "WormBase database of nematode biology",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "datatype" : null,
      "id" : null,
      "example_id" : "WB_REF:WBPaper00004823",
      "url_syntax" : "http://www.wormbase.org/db/misc/paper?name=[example_id]",
      "name" : null,
      "abbreviation" : "WB_REF",
      "fullname" : null,
      "object" : "Literature Reference Identifier",
      "url_example" : "http://www.wormbase.org/db/misc/paper?name=WBPaper00004823"
   },
   "hugo" : {
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.hugo-international.org/",
      "database" : "Human Genome Organisation",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "abbreviation" : "HUGO",
      "fullname" : null
   },
   "ecocyc_ref" : {
      "abbreviation" : "ECOCYC_REF",
      "fullname" : null,
      "name" : null,
      "object" : "Reference identifier",
      "url_example" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=COLISALII",
      "uri_prefix" : null,
      "database" : "Encyclopedia of E. coli metabolism",
      "generic_url" : "http://ecocyc.org/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=[example_id]",
      "example_id" : "EcoCyc_REF:COLISALII"
   },
   "ecogene_g" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "ECOGENE_G:deoC",
      "uri_prefix" : null,
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "generic_url" : "http://www.ecogene.org/",
      "object" : "EcoGene Primary Gene Name",
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "ECOGENE_G",
      "name" : null
   },
   "aspgd" : {
      "local_id_syntax" : "^ASPL[0-9]{10}$",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "example_id" : "AspGD:ASPL0000067538",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "database" : "Aspergillus Genome Database",
      "object" : "Identifier for AspGD Loci",
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "abbreviation" : "AspGD",
      "fullname" : null,
      "name" : null
   },
   "uniprotkb/swiss-prot" : {
      "fullname" : null,
      "abbreviation" : "UniProtKB/Swiss-Prot",
      "name" : null,
      "replaced_by" : "UniProtKB",
      "is_obsolete" : "true",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "object" : "Accession",
      "generic_url" : "http://www.uniprot.org",
      "database" : "UniProtKB/Swiss-Prot",
      "uri_prefix" : null,
      "id" : null,
      "datatype" : null,
      "description" : "A curated protein sequence database which provides a high level of annotation and a minimal level of redundancy",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "example_id" : "Swiss-Prot:P51587"
   },
   "gocentral" : {
      "url_example" : null,
      "object" : null,
      "abbreviation" : "GOCentral",
      "fullname" : null,
      "name" : null,
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "description" : "Manual annotation from PAINT curators into the UniProt Protein2GO curation tool.",
      "datatype" : null,
      "database" : "GO Central",
      "uri_prefix" : null,
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml"
   },
   "so" : {
      "entity_type" : "SO:0000110 ! sequence feature",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_syntax" : "http://song.sourceforge.net/SOterm_tables.html#SO:[example_id]",
      "example_id" : "SO:0000195",
      "uri_prefix" : null,
      "generic_url" : "http://sequenceontology.org/",
      "database" : "Sequence Ontology",
      "object" : "Identifier",
      "url_example" : "http://song.sourceforge.net/SOterm_tables.html#SO:0000195",
      "abbreviation" : "SO",
      "fullname" : null,
      "name" : null
   },
   "pamgo" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PAMGO",
      "object" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "database" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "generic_url" : "http://pamgo.vbi.vt.edu/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "cgd_locus" : {
      "database" : "Candida Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "example_id" : "CGD_LOCUS:HWP1",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "CGD_LOCUS",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=HWP1",
      "object" : "Gene name (gene symbol in mammalian nomenclature)"
   },
   "uniprotkb" : {
      "example_id" : "UniProtKB:P51587",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "local_id_syntax" : "^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z]([0-9][A-Z][A-Z0-9]{2}){1,2}[0-9])((-[0-9]+)|:PRO_[0-9]{10}|:VAR_[0-9]{6}){0,1}$",
      "description" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "datatype" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "id" : null,
      "database" : "Universal Protein Knowledgebase",
      "uri_prefix" : null,
      "generic_url" : "http://www.uniprot.org",
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "object" : "Accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "UniProtKB"
   },
   "hamap" : {
      "uri_prefix" : null,
      "generic_url" : "http://hamap.expasy.org/",
      "database" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "datatype" : null,
      "id" : null,
      "example_id" : "HAMAP:MF_00031",
      "url_syntax" : "http://hamap.expasy.org/unirule/[example_id]",
      "name" : null,
      "abbreviation" : "HAMAP",
      "fullname" : null,
      "object" : "Identifier",
      "url_example" : "http://hamap.expasy.org/unirule/MF_00131"
   },
   "mim" : {
      "object" : "Identifier",
      "url_example" : "http://omim.org/entry/190198",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MIM",
      "datatype" : null,
      "id" : null,
      "example_id" : "OMIM:190198",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "database" : "Mendelian Inheritance in Man",
      "uri_prefix" : null
   },
   "genbank" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "object" : "Sequence accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "GenBank",
      "example_id" : "GB:AA816246",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "local_id_syntax" : "^[A-Z]{2}[0-9]{6}$",
      "datatype" : null,
      "description" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "id" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "uri_prefix" : null,
      "database" : "GenBank"
   },
   "jcvi_tigrfams" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "uri_prefix" : null,
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "generic_url" : "http://search.jcvi.org/",
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "object" : "Accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "JCVI_TIGRFAMS"
   },
   "um-bbd_pathwayid" : {
      "url_example" : "http://umbbd.msi.umn.edu/acr/acr_map.html",
      "object" : "Pathway identifier",
      "abbreviation" : "UM-BBD_pathwayID",
      "fullname" : null,
      "name" : null,
      "url_syntax" : "http://umbbd.msi.umn.edu/[example_id]/[example_id]_map.html",
      "example_id" : "UM-BBD_pathwayID:acr",
      "id" : null,
      "datatype" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/"
   },
   "dictybase" : {
      "abbreviation" : "DictyBase",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "object" : "Identifier",
      "generic_url" : "http://dictybase.org",
      "database" : "dictyBase",
      "uri_prefix" : null,
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "^DDB_G[0-9]{7}$",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "example_id" : "dictyBase:DDB_G0277859"
   },
   "img" : {
      "uri_prefix" : null,
      "generic_url" : "http://img.jgi.doe.gov",
      "database" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "url_syntax" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=[example_id]",
      "example_id" : "IMG:640008772",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "IMG",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=640008772"
   },
   "cgsc" : {
      "generic_url" : "http://cgsc.biology.yale.edu/",
      "uri_prefix" : null,
      "database" : null,
      "example_id" : "CGSC:rbsK",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CGSC",
      "url_example" : "http://cgsc.biology.yale.edu/Site.php?ID=315",
      "object" : "Gene symbol",
      "database: CGSC" : "E.coli Genetic Stock Center"
   },
   "pamgo_vmd" : {
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=109198",
      "object" : "Gene identifier",
      "abbreviation" : "PAMGO_VMD",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "datatype" : null,
      "description" : "Virginia Bioinformatics Institute Microbial Database; member of PAMGO Interest Group",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=[example_id]",
      "example_id" : "PAMGO_VMD:109198",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "uri_prefix" : null,
      "database" : "Virginia Bioinformatics Institute Microbial Database"
   },
   "genedb_pfalciparum" : {
      "database" : "Plasmodium falciparum GeneDB",
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$",
      "id" : null,
      "abbreviation" : "GeneDB_Pfalciparum",
      "name" : null,
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "generic_url" : "http://www.genedb.org/genedb/malaria/",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=malaria&name=[example_id]",
      "example_id" : "GeneDB_Pfalciparum:PFD0755c",
      "datatype" : null,
      "fullname" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=malaria&name=PFD0755c",
      "shorthand_name" : "Pfalciparum",
      "is_obsolete" : "true",
      "replaced_by" : "GeneDB"
   },
   "um-bbd_enzymeid" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "UM-BBD_enzymeID:e0413",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=[example_id]",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "uri_prefix" : null,
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=e0230",
      "object" : "Enzyme identifier",
      "name" : null,
      "abbreviation" : "UM-BBD_enzymeID",
      "fullname" : null
   },
   "mips_funcat" : {
      "fullname" : null,
      "abbreviation" : "MIPS_funcat",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=11.02",
      "uri_prefix" : null,
      "database" : "MIPS Functional Catalogue",
      "generic_url" : "http://mips.gsf.de/proj/funcatDB/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=[example_id]",
      "example_id" : "MIPS_funcat:11.02"
   },
   "tgd_ref" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "TGD_REF:T000005818",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "uri_prefix" : null,
      "database" : "Tetrahymena Genome Database",
      "generic_url" : "http://www.ciliate.org/",
      "url_example" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=T000005818",
      "object" : "Literature Reference Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "TGD_REF"
   },
   "hpa" : {
      "url_syntax" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=[example_id]",
      "example_id" : "HPA:HPA000237",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "Human Protein Atlas tissue profile information",
      "generic_url" : "http://www.proteinatlas.org/",
      "object" : "Identifier",
      "url_example" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=HPA000237",
      "abbreviation" : "HPA",
      "fullname" : null,
      "name" : null
   },
   "h-invdb_cdna" : {
      "name" : null,
      "abbreviation" : "H-invDB_cDNA",
      "fullname" : null,
      "object" : "Accession",
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=AK093149",
      "database" : "H-invitational Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.h-invitational.jp/",
      "example_id" : "H-invDB_cDNA:AK093148",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "lifedb" : {
      "abbreviation" : "LIFEdb",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=DKFZp564O1716",
      "object" : "cDNA clone identifier",
      "uri_prefix" : null,
      "generic_url" : "http://www.lifedb.de/",
      "database" : "LifeDB",
      "url_syntax" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=[example_id]",
      "example_id" : "LIFEdb:DKFZp564O1716",
      "id" : null,
      "datatype" : null,
      "description" : "LifeDB is a database for information on protein localization, interaction, functional assays and expression."
   },
   "um-bbd" : {
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "uri_prefix" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "url_example" : null,
      "object" : "Prefix",
      "name" : null,
      "abbreviation" : "UM-BBD",
      "fullname" : null
   },
   "jcvi_ath1" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "JCVI_Ath1:At3g01440",
      "database" : "Arabidopsis thaliana database at the J. Craig Venter Institute",
      "uri_prefix" : null,
      "generic_url" : "http://www.tigr.org/tdb/e2k1/ath1/ath1.shtml",
      "is_obsolete" : "true",
      "url_example" : null,
      "object" : "Accession",
      "fullname" : null,
      "abbreviation" : "JCVI_Ath1",
      "name" : null
   },
   "vbrc" : {
      "uri_prefix" : null,
      "generic_url" : "http://vbrc.org",
      "database" : "Viral Bioinformatics Resource Center",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://vbrc.org/query.asp?web_id=VBRC:[example_id]",
      "example_id" : "VBRC:F35742",
      "fullname" : null,
      "abbreviation" : "VBRC",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://vbrc.org/query.asp?web_id=VBRC:F35742"
   },
   "um-bbd_reactionid" : {
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "uri_prefix" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "example_id" : "UM-BBD_reactionID:r0129",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "UM-BBD_reactionID",
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=r0129",
      "object" : "Reaction identifier"
   },
   "pharmgkb" : {
      "name" : null,
      "abbreviation" : "PharmGKB",
      "fullname" : null,
      "url_example" : "http://www.pharmgkb.org/do/serve?objId=PA267",
      "object" : null,
      "database" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "uri_prefix" : null,
      "generic_url" : "http://www.pharmgkb.org",
      "example_id" : "PharmGKB:PA267",
      "url_syntax" : "http://www.pharmgkb.org/do/serve?objId=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "smd" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SMD",
      "object" : null,
      "url_example" : null,
      "database" : "Stanford Microarray Database",
      "uri_prefix" : null,
      "generic_url" : "http://genome-www.stanford.edu/microarray",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "transfac" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "TRANSFAC",
      "object" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "database" : "TRANSFAC database of eukaryotic transcription factors",
      "generic_url" : "http://www.gene-regulation.com/pub/databases.html#transfac",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null
   },
   "wbls" : {
      "entity_type" : "WBls:0000075 ! nematoda Life Stage",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "[0-9]{7}",
      "url_syntax" : null,
      "example_id" : "WBls:0000010",
      "generic_url" : "http://www.wormbase.org/",
      "uri_prefix" : null,
      "database" : "C. elegans development",
      "object" : "Identifier",
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "WBls",
      "name" : null
   },
   "maizegdb_locus" : {
      "example_id" : "MaizeGDB_Locus:ZmPK1",
      "local_id_syntax" : "^[A-Za-z][A-Za-z0-9]*$",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "MaizeGDB",
      "uri_prefix" : null,
      "generic_url" : "http://www.maizegdb.org",
      "object" : "Maize gene name",
      "url_example" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=ZmPK1",
      "name" : null,
      "abbreviation" : "MaizeGDB_Locus",
      "fullname" : null
   },
   "vmd" : {
      "name" : null,
      "abbreviation" : "VMD",
      "fullname" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=109198",
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "example_id" : "VMD:109198",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "cacao" : {
      "object" : "accession",
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MYCS2:A0QNF5",
      "name" : null,
      "abbreviation" : "CACAO",
      "fullname" : null,
      "datatype" : null,
      "description" : "The Community Assessment of Community Annotation with Ontologies (CACAO) is a project to do large-scale manual community annotation of gene function using the Gene Ontology as a multi-institution student competition. ",
      "id" : null,
      "example_id" : "MYCS2:A0QNF5",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "uri_prefix" : null,
      "database" : "Community Assessment of Community Annotation with Ontologies",
      "generic_url" : "http://gowiki.tamu.edu/wiki/index.php/Category:CACAO"
   },
   "yeastfunc" : {
      "database" : "Yeast Function",
      "uri_prefix" : null,
      "generic_url" : "http://func.med.harvard.edu/yeast/",
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "YeastFunc",
      "name" : null,
      "url_example" : null,
      "object" : null
   },
   "cgd_ref" : {
      "database" : "Candida Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.candidagenome.org/",
      "example_id" : "CGD_REF:1490",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CGD_REF",
      "url_example" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=1490",
      "object" : "Literature Reference Identifier"
   },
   "biomdid" : {
      "abbreviation" : "BIOMDID",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "object" : "Accession",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "database" : "BioModels Database",
      "uri_prefix" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "example_id" : "BIOMD:BIOMD0000000045"
   },
   "genedb_lmajor" : {
      "id" : null,
      "local_id_syntax" : "^LmjF\\.\\d+\\.\\d+$",
      "database" : "Leishmania major GeneDB",
      "object" : "Gene identifier",
      "abbreviation" : "GeneDB_Lmajor",
      "name" : null,
      "datatype" : null,
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=leish&name=[example_id]",
      "example_id" : "GeneDB_Lmajor:LM5.32",
      "uri_prefix" : null,
      "generic_url" : "http://www.genedb.org/genedb/leish/",
      "is_obsolete" : "true",
      "replaced_by" : "GeneDB",
      "url_example" : "http://www.genedb.org/genedb/Search?organism=leish&name=LM5.32",
      "shorthand_name" : "Lmajor",
      "fullname" : null
   },
   "iuphar" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.iuphar.org/",
      "database" : "International Union of Pharmacology",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "fullname" : null,
      "abbreviation" : "IUPHAR",
      "name" : null,
      "object" : null,
      "url_example" : null
   },
   "ncbi_gp" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=[example_id]",
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "example_id" : "NCBI_GP:EAL72968",
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "NCBI GenPept",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "object" : "Protein identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=EAL72968",
      "abbreviation" : "NCBI_GP",
      "fullname" : null,
      "name" : null
   },
   "obi" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "OBI:0000038",
      "url_syntax" : null,
      "local_id_syntax" : "^\\d{7}$",
      "uri_prefix" : null,
      "database" : "Ontology for Biomedical Investigations",
      "generic_url" : "http://obi-ontology.org/page/Main_Page",
      "url_example" : null,
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "OBI",
      "fullname" : null
   },
   "vega" : {
      "object" : "Identifier",
      "url_example" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=OTTHUMP00000000661",
      "abbreviation" : "VEGA",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=[example_id]",
      "example_id" : "VEGA:OTTHUMP00000000661",
      "uri_prefix" : null,
      "database" : "Vertebrate Genome Annotation database",
      "generic_url" : "http://vega.sanger.ac.uk/index.html"
   },
   "pubchem_compound" : {
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=2244",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "PubChem_Compound",
      "fullname" : null,
      "example_id" : "PubChem_Compound:2244",
      "local_id_syntax" : "^[0-9]+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=[example_id]",
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "database" : "NCBI PubChem database of chemical structures"
   },
   "ddbj" : {
      "url_example" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=AA816246",
      "object" : "Sequence accession",
      "fullname" : null,
      "abbreviation" : "DDBJ",
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=[example_id]",
      "example_id" : "DDBJ:AA816246",
      "uri_prefix" : null,
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "database" : "DNA Databank of Japan"
   },
   "tigr_ath1" : {
      "is_obsolete" : "true",
      "url_example" : null,
      "object" : "Accession",
      "fullname" : null,
      "abbreviation" : "TIGR_Ath1",
      "name" : null,
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "JCVI_Ath1:At3g01440",
      "uri_prefix" : null,
      "generic_url" : "http://www.tigr.org/tdb/e2k1/ath1/ath1.shtml",
      "database" : "Arabidopsis thaliana database at the J. Craig Venter Institute"
   },
   "cas_gen" : {
      "database" : "Catalog of Fishes genus database",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "example_id" : "CASGEN:1040",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CAS_GEN",
      "object" : "Identifier",
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040"
   },
   "ipi" : {
      "example_id" : "IPI:IPI00000005.1",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/IPI/IPIhelp.html",
      "database" : "International Protein Index",
      "object" : "Identifier",
      "url_example" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "IPI"
   },
   "jcvi_tba1" : {
      "url_example" : null,
      "object" : "Accession",
      "is_obsolete" : "true",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "JCVI_Tba1",
      "example_id" : "JCVI_Tba1:25N14.10",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "uri_prefix" : null,
      "database" : "Trypanosoma brucei database at the J. Craig Venter Institute",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/tba1/"
   },
   "pubchem_bioassay" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "PubChem_BioAssay:177",
      "url_syntax" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=[example_id]",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "database" : "NCBI PubChem database of bioassay records",
      "url_example" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=177",
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PubChem_BioAssay"
   },
   "asap" : {
      "url_syntax" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=[example_id]",
      "example_id" : "ASAP:ABE-0000008",
      "id" : null,
      "datatype" : null,
      "generic_url" : "https://asap.ahabs.wisc.edu/annotation/php/ASAP1.htm",
      "uri_prefix" : null,
      "database" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "object" : "Feature identifier",
      "url_example" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=ABE-0000008",
      "fullname" : null,
      "abbreviation" : "ASAP",
      "name" : null
   },
   "germonline" : {
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://www.germonline.org/",
      "uri_prefix" : null,
      "database" : "GermOnline",
      "object" : null,
      "url_example" : null,
      "abbreviation" : "GermOnline",
      "fullname" : null,
      "name" : null
   },
   "tgd_locus" : {
      "url_syntax" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=[example_id]",
      "example_id" : "TGD_LOCUS:PDD1",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ciliate.org/",
      "database" : "Tetrahymena Genome Database",
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "url_example" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=PDD1",
      "fullname" : null,
      "abbreviation" : "TGD_LOCUS",
      "name" : null
   },
   "tigr_tba1" : {
      "database" : "Trypanosoma brucei database at the J. Craig Venter Institute",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/tba1/",
      "uri_prefix" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "JCVI_Tba1:25N14.10",
      "url_syntax" : null,
      "name" : null,
      "abbreviation" : "TIGR_Tba1",
      "fullname" : null,
      "is_obsolete" : "true",
      "url_example" : null,
      "object" : "Accession"
   },
   "pubmed" : {
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "uri_prefix" : null,
      "database" : "PubMed",
      "example_id" : "PMID:4208797",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "local_id_syntax" : "^[0-9]+$",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PubMed",
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "object" : "Identifier"
   },
   "protein_id" : {
      "example_id" : "protein_id:CAA71991",
      "url_syntax" : null,
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "datatype" : null,
      "description" : "protein identifier shared by DDBJ/EMBL-bank/GenBank nucleotide sequence databases",
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "uri_prefix" : null,
      "database" : "DDBJ / EMBL-Bank / GenBank",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "object" : "Identifier",
      "url_example" : null,
      "name" : null,
      "abbreviation" : "protein_id",
      "fullname" : null
   },
   "coriell" : {
      "object" : "Identifier",
      "url_example" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=GM07892",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CORIELL",
      "description" : "The Coriell Cell Repositories provide essential research reagents to the scientific community by establishing, verifying, maintaining, and distributing cell cultures and DNA derived from cell cultures. These collections, supported by funds from the National Institutes of Health (NIH) and several foundations, are extensively utilized by research scientists around the world. ",
      "datatype" : null,
      "id" : null,
      "example_id" : "GM07892",
      "url_syntax" : "http://ccr.coriell.org/Sections/Search/Sample_Detail.aspx?Ref=[example_id]",
      "generic_url" : "http://ccr.coriell.org/",
      "uri_prefix" : null,
      "database" : "Coriell Institute for Medical Research"
   },
   "sgn" : {
      "uri_prefix" : null,
      "database" : "Sol Genomics Network",
      "generic_url" : "http://www.sgn.cornell.edu/",
      "example_id" : "SGN:4476",
      "url_syntax" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SGN",
      "object" : "Gene identifier",
      "url_example" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=4476"
   },
   "subtilistg" : {
      "name" : null,
      "abbreviation" : "SUBTILISTG",
      "fullname" : null,
      "object" : "Gene symbol",
      "url_example" : null,
      "uri_prefix" : null,
      "database" : "Bacillus subtilis Genome Sequence Project",
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "datatype" : null,
      "id" : null,
      "example_id" : "SUBTILISTG:accC",
      "url_syntax" : null
   },
   "genedb" : {
      "abbreviation" : "GeneDB",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.genedb.org/gene/PF3D7_1467300",
      "database" : "GeneDB",
      "uri_prefix" : null,
      "generic_url" : "http://www.genedb.org/gene/",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "^Tb\\d+\\.[A-Za-z0-9]+\\.\\d+$",
      "url_syntax" : "http://www.genedb.org/gene/[example_id]",
      "example_id" : "PF3D7_1467300"
   },
   "cas" : {
      "url_example" : null,
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CAS",
      "example_id" : "CAS:58-08-2",
      "url_syntax" : null,
      "description" : "CAS REGISTRY is the most authoritative collection of disclosed chemical substance information, containing more than 54 million organic and inorganic substances and 62 million sequences. CAS REGISTRY covers substances identified from the scientific literature from 1957 to the present, with additional substances going back to the early 1900s.",
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://www.cas.org/expertise/cascontent/registry/index.html",
      "uri_prefix" : null,
      "database" : "CAS Chemical Registry"
   },
   "ma" : {
      "uri_prefix" : null,
      "database" : "Adult Mouse Anatomical Dictionary",
      "generic_url" : "http://www.informatics.jax.org/",
      "id" : null,
      "datatype" : null,
      "description" : "Adult Mouse Anatomical Dictionary; part of Gene Expression Database",
      "url_syntax" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:[example_id]",
      "example_id" : "MA:0000003",
      "fullname" : null,
      "abbreviation" : "MA",
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:0000003"
   },
   "imgt_hla" : {
      "name" : null,
      "abbreviation" : "IMGT_HLA",
      "fullname" : null,
      "url_example" : null,
      "object" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ebi.ac.uk/imgt/hla",
      "database" : "IMGT/HLA human major histocompatibility complex sequence database",
      "datatype" : null,
      "id" : null,
      "example_id" : "IMGT_HLA:HLA00031",
      "url_syntax" : null
   },
   "eco" : {
      "abbreviation" : "ECO",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : null,
      "generic_url" : "http://www.geneontology.org/",
      "uri_prefix" : null,
      "database" : "Evidence Code ontology",
      "id" : null,
      "datatype" : null,
      "local_id_syntax" : "^\\d{7}$",
      "url_syntax" : null,
      "example_id" : "ECO:0000002"
   },
   "ensemblplants/gramene" : {
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "id" : null,
      "datatype" : null,
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "uri_prefix" : null,
      "generic_url" : "http://plants.ensembl.org/",
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "object" : "Identifier",
      "abbreviation" : "EnsemblPlants/Gramene",
      "fullname" : null,
      "name" : null
   },
   "locusid" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "LocusID",
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "uri_prefix" : null,
      "database" : "NCBI Gene",
      "example_id" : "NCBI_Gene:4771",
      "local_id_syntax" : "^\\d+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "datatype" : null,
      "entity_type" : "SO:0000704 ! gene",
      "id" : null
   },
   "jstor" : {
      "uri_prefix" : null,
      "database" : "Digital archive of scholarly articles",
      "generic_url" : "http://www.jstor.org/",
      "url_syntax" : "http://www.jstor.org/stable/[example_id]",
      "example_id" : "JSTOR:3093870",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "JSTOR",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://www.jstor.org/stable/3093870",
      "object" : "journal article"
   },
   "ensembl_geneid" : {
      "abbreviation" : "ENSEMBL_GeneID",
      "fullname" : null,
      "name" : null,
      "object" : "Gene identifier",
      "url_example" : "http://www.ensembl.org/id/ENSG00000126016",
      "generic_url" : "http://www.ensembl.org/",
      "uri_prefix" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "local_id_syntax" : "^ENSG[0-9]{9,16}$",
      "example_id" : "ENSEMBL_GeneID:ENSG00000126016"
   },
   "dflat" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "DFLAT",
      "object" : null,
      "url_example" : null,
      "uri_prefix" : null,
      "database" : "Developmental FunctionaL Annotation at Tufts",
      "generic_url" : "http://bcb.cs.tufts.edu/dflat/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "genprotec" : {
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "database" : "GenProtEC E. coli genome and proteome database",
      "uri_prefix" : null,
      "generic_url" : "http://genprotec.mbl.edu/",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "abbreviation" : "GenProtEC",
      "fullname" : null
   },
   "ddanat" : {
      "name" : null,
      "abbreviation" : "DDANAT",
      "fullname" : null,
      "url_example" : null,
      "object" : "Identifier",
      "uri_prefix" : null,
      "database" : "Dictyostelium discoideum anatomy",
      "generic_url" : "http://dictybase.org/Dicty_Info/dicty_anatomy_ontology.html",
      "datatype" : null,
      "id" : null,
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "example_id" : "DDANAT:0000068",
      "url_syntax" : null,
      "local_id_syntax" : "[0-9]{7}"
   },
   "dbsnp" : {
      "local_id_syntax" : "^\\d+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=[example_id]",
      "example_id" : "dbSNP:rs3131969",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/projects/SNP",
      "database" : "NCBI dbSNP",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=rs3131969",
      "abbreviation" : "dbSNP",
      "fullname" : null,
      "name" : null
   },
   "intact" : {
      "fullname" : null,
      "abbreviation" : "IntAct",
      "name" : null,
      "object" : "Accession",
      "url_example" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=EBI-17086",
      "uri_prefix" : null,
      "database" : "IntAct protein interaction database",
      "generic_url" : "http://www.ebi.ac.uk/intact/",
      "id" : null,
      "entity_type" : "MI:0315 ! protein complex ",
      "datatype" : null,
      "local_id_syntax" : "^[0-9]+$",
      "url_syntax" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=[example_id]",
      "example_id" : "IntAct:EBI-17086"
   },
   "tigr" : {
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "generic_url" : "http://www.jcvi.org/",
      "database" : "J. Craig Venter Institute",
      "uri_prefix" : null,
      "url_example" : null,
      "object" : null,
      "name" : null,
      "abbreviation" : "TIGR",
      "fullname" : null
   },
   "mtbbase" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.ark.in-berlin.de/Site/MTBbase.html",
      "database" : "Collection and Refinement of Physiological Data on Mycobacterium tuberculosis",
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "abbreviation" : "MTBBASE",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : null
   },
   "jcvi_genprop" : {
      "uri_prefix" : null,
      "generic_url" : "http://cmr.jcvi.org/",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "local_id_syntax" : "^GenProp[0-9]{4}$",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "example_id" : "JCVI_GenProp:GenProp0120",
      "id" : null,
      "datatype" : null,
      "abbreviation" : "JCVI_GenProp",
      "fullname" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "object" : "Accession"
   },
   "merops" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MEROPS",
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=A08.001",
      "object" : "Identifier",
      "uri_prefix" : null,
      "generic_url" : "http://merops.sanger.ac.uk/",
      "database" : "MEROPS peptidase database",
      "datatype" : null,
      "id" : null,
      "example_id" : "MEROPS:A08.001",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=[example_id]"
   },
   "mod" : {
      "object" : "Protein modification identifier",
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MOD",
      "example_id" : "MOD:00219",
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "uri_prefix" : null
   },
   "cog_function" : {
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=[example_id]",
      "example_id" : "COG_Function:H",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "database" : "NCBI COG function",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=H",
      "abbreviation" : "COG_Function",
      "fullname" : null,
      "name" : null
   },
   "prints" : {
      "generic_url" : "http://www.bioinf.manchester.ac.uk/dbbrowser/PRINTS/",
      "uri_prefix" : null,
      "database" : "PRINTS compendium of protein fingerprints",
      "url_syntax" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=[example_id]",
      "example_id" : "PRINTS:PR00025",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "PRINTS",
      "name" : null,
      "url_example" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=PR00025",
      "object" : "Accession"
   },
   "refseq" : {
      "datatype" : null,
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "example_id" : "RefSeq:XP_001068954",
      "local_id_syntax" : "^(NC|AC|NG|NT|NW|NZ|NM|NR|XM|XR|NP|AP|XP|ZP)_\\d+$",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "database" : "RefSeq",
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=XP_001068954",
      "name" : null,
      "abbreviation" : "RefSeq",
      "fullname" : null
   },
   "vz" : {
      "object" : "Page Reference Identifier",
      "url_example" : "http://viralzone.expasy.org/all_by_protein/957.html",
      "name" : null,
      "abbreviation" : "VZ",
      "fullname" : null,
      "example_id" : "VZ:957",
      "url_syntax" : "http://viralzone.expasy.org/all_by_protein/[example_id].html",
      "datatype" : null,
      "id" : null,
      "database" : "ViralZone",
      "uri_prefix" : null,
      "generic_url" : "http://viralzone.expasy.org/"
   },
   "casgen" : {
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "database" : "Catalog of Fishes genus database",
      "datatype" : null,
      "id" : null,
      "example_id" : "CASGEN:1040",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "name" : null,
      "abbreviation" : "CASGEN",
      "fullname" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "object" : "Identifier"
   },
   "wp" : {
      "uri_prefix" : null,
      "database" : "Wormpep database of proteins of C. elegans",
      "generic_url" : "http://www.wormbase.org/",
      "example_id" : "WP:CE25104",
      "url_syntax" : "http://www.wormbase.org/db/get?class=Protein;name=WP:[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "WP",
      "object" : "Identifier",
      "url_example" : "http://www.wormbase.org/db/get?class=Protein;name=WP:CE15104",
      "is_obsolete" : "true"
   },
   "tgd" : {
      "name" : null,
      "abbreviation" : "TGD",
      "fullname" : null,
      "url_example" : null,
      "object" : null,
      "uri_prefix" : null,
      "database" : "Tetrahymena Genome Database",
      "generic_url" : "http://www.ciliate.org/",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "mi" : {
      "url_example" : null,
      "object" : "Interaction identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "MI",
      "example_id" : "MI:0018",
      "url_syntax" : null,
      "datatype" : null,
      "id" : null,
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "uri_prefix" : null,
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html"
   },
   "rebase" : {
      "url_syntax" : "http://rebase.neb.com/rebase/enz/[example_id].html",
      "example_id" : "REBASE:EcoRI",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://rebase.neb.com/rebase/rebase.html",
      "uri_prefix" : null,
      "database" : "REBASE restriction enzyme database",
      "object" : "Restriction enzyme name",
      "url_example" : "http://rebase.neb.com/rebase/enz/EcoRI.html",
      "fullname" : null,
      "abbreviation" : "REBASE",
      "name" : null
   },
   "cog_cluster" : {
      "name" : null,
      "abbreviation" : "COG_Cluster",
      "fullname" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=COG0001",
      "object" : "Identifier",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "uri_prefix" : null,
      "database" : "NCBI COG cluster",
      "example_id" : "COG_Cluster:COG0001",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=[example_id]",
      "datatype" : null,
      "id" : null
   },
   "wormbase" : {
      "local_id_syntax" : "^WB(Gene|Var|RNAi|Transgene)[0-9]{8}$",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "example_id" : "WB:WBGene00003001",
      "entity_type" : "SO:0000704 ! gene ",
      "id" : null,
      "datatype" : null,
      "database" : "WormBase database of nematode biology",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "object" : "Gene identifier",
      "abbreviation" : "WormBase",
      "fullname" : null,
      "name" : null
   },
   "aspgd_ref" : {
      "database" : "Aspergillus Genome Database",
      "uri_prefix" : null,
      "generic_url" : "http://www.aspergillusgenome.org/",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "example_id" : "AspGD_REF:90",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "AspGD_REF",
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=90",
      "object" : "Literature Reference Identifier"
   },
   "pirsf" : {
      "uri_prefix" : null,
      "database" : "PIR Superfamily Classification System",
      "generic_url" : "http://pir.georgetown.edu/pirsf/",
      "example_id" : "PIRSF:SF002327",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "abbreviation" : "PIRSF",
      "fullname" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=SF002327",
      "object" : "Identifier"
   },
   "poc" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "POC",
      "url_example" : null,
      "object" : null,
      "uri_prefix" : null,
      "database" : "Plant Ontology Consortium",
      "generic_url" : "http://www.plantontology.org/",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null
   },
   "mgi" : {
      "object" : "Accession",
      "url_example" : "http://www.informatics.jax.org/accession/MGI:80863",
      "name" : null,
      "abbreviation" : "MGI",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "example_id" : "MGI:MGI:80863",
      "local_id_syntax" : "^MGI:[0-9]{5,}$",
      "url_syntax" : "http://www.informatics.jax.org/accession/[example_id]",
      "uri_prefix" : null,
      "database" : "Mouse Genome Informatics",
      "generic_url" : "http://www.informatics.jax.org/"
   },
   "tigr_pfa1" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "JCVI_Pfa1:PFB0010w",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/pfa1/pfa1.shtml",
      "database" : "Plasmodium falciparum database at the J. Craig Venter Institute",
      "uri_prefix" : null,
      "is_obsolete" : "true",
      "url_example" : null,
      "object" : "Accession",
      "fullname" : null,
      "abbreviation" : "TIGR_Pfa1",
      "name" : null
   },
   "sanger" : {
      "uri_prefix" : null,
      "generic_url" : "http://www.sanger.ac.uk/",
      "database" : "Wellcome Trust Sanger Institute",
      "datatype" : null,
      "id" : null,
      "example_id" : null,
      "url_syntax" : null,
      "name" : null,
      "abbreviation" : "Sanger",
      "fullname" : null,
      "object" : null,
      "url_example" : null
   },
   "kegg_enzyme" : {
      "fullname" : null,
      "abbreviation" : "KEGG_ENZYME",
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?ec:2.1.1.4",
      "object" : "Enzyme Commission ID, as stored in KEGG",
      "uri_prefix" : null,
      "database" : "KEGG Enzyme Database",
      "generic_url" : "http://www.genome.jp/dbget-bin/www_bfind?enzyme",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?ec:[example_id]",
      "local_id_syntax" : "^\\d(\\.\\d{1,2}){2}\\.\\d{1,3}$",
      "example_id" : "KEGG_ENZYME:2.1.1.4",
      "id" : null,
      "datatype" : null
   },
   "ena" : {
      "uri_prefix" : null,
      "database" : "European Nucleotide Archive",
      "generic_url" : "http://www.ebi.ac.uk/ena/",
      "example_id" : "ENA:AA816246",
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "url_syntax" : "http://www.ebi.ac.uk/ena/data/view/[example_id]",
      "datatype" : null,
      "description" : "ENA is made up of a number of distinct databases that includes EMBL-Bank, the newly established Sequence Read Archive (SRA) and the Trace Archive. International nucleotide sequence database collaboration, comprising ENA-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "id" : null,
      "name" : null,
      "abbreviation" : "ENA",
      "fullname" : null,
      "url_example" : "http://www.ebi.ac.uk/ena/data/view/AA816246",
      "object" : "Sequence accession"
   },
   "brenda" : {
      "url_syntax" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=[example_id]",
      "example_id" : "BRENDA:4.2.1.3",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://www.brenda-enzymes.info",
      "uri_prefix" : null,
      "database" : "BRENDA, The Comprehensive Enzyme Information System",
      "object" : "EC enzyme identifier",
      "url_example" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=4.2.1.3",
      "fullname" : null,
      "abbreviation" : "BRENDA",
      "name" : null
   },
   "pdb" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=[example_id]",
      "local_id_syntax" : "^[A-Za-z0-9]{4}$",
      "example_id" : "PDB:1A4U",
      "generic_url" : "http://www.rcsb.org/pdb/",
      "uri_prefix" : null,
      "database" : "Protein Data Bank",
      "url_example" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=1A4U",
      "object" : "Identifier",
      "abbreviation" : "PDB",
      "fullname" : null,
      "name" : null
   },
   "gr_protein" : {
      "abbreviation" : "GR_protein",
      "fullname" : null,
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "name" : null,
      "object" : "Protein identifier",
      "url_example" : "http://www.gramene.org/db/protein/protein_search?acc=Q6VSV0",
      "generic_url" : "http://www.gramene.org/",
      "database" : null,
      "uri_prefix" : null,
      "entity_type" : "PR:000000001 ! protein",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.gramene.org/db/protein/protein_search?acc=[example_id]",
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]$",
      "example_id" : "GR_PROTEIN:Q6VSV0"
   },
   "issn" : {
      "database" : "International Standard Serial Number",
      "uri_prefix" : null,
      "generic_url" : "http://www.issn.org/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "ISSN:1234-1231",
      "abbreviation" : "ISSN",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : "Identifier"
   },
   "ppi" : {
      "name" : null,
      "abbreviation" : "PPI",
      "fullname" : null,
      "object" : null,
      "url_example" : null,
      "generic_url" : "http://genome.pseudomonas-syringae.org/",
      "uri_prefix" : null,
      "database" : "Pseudomonas syringae community annotation project",
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "id" : null
   },
   "smart" : {
      "uri_prefix" : null,
      "database" : "Simple Modular Architecture Research Tool",
      "generic_url" : "http://smart.embl-heidelberg.de/",
      "example_id" : "SMART:SM00005",
      "url_syntax" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=[example_id]",
      "datatype" : null,
      "id" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SMART",
      "object" : "Accession",
      "url_example" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=SM00005"
   },
   "goc" : {
      "url_example" : null,
      "object" : null,
      "abbreviation" : "GOC",
      "fullname" : null,
      "name" : null,
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "database" : "Gene Ontology Consortium",
      "uri_prefix" : null,
      "generic_url" : "http://www.geneontology.org/"
   },
   "cgd" : {
      "datatype" : null,
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "example_id" : "CGD:CAL0005516",
      "local_id_syntax" : "^(CAL|CAF)[0-9]{7}$",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "uri_prefix" : null,
      "database" : "Candida Genome Database",
      "generic_url" : "http://www.candidagenome.org/",
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "object" : "Identifier for CGD Loci",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CGD"
   },
   "gr" : {
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "abbreviation" : "GR",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier (any)",
      "url_example" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=sd1",
      "uri_prefix" : null,
      "generic_url" : "http://www.gramene.org/",
      "database" : null,
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]$",
      "url_syntax" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=[example_id]",
      "example_id" : "GR:sd1",
      "id" : null,
      "entity_type" : "PR:000000001 ! protein",
      "datatype" : null
   },
   "cdd" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "CDD:34222",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=[example_id]",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=cdd",
      "uri_prefix" : null,
      "database" : "Conserved Domain Database at NCBI",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=34222",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "CDD",
      "fullname" : null
   },
   "ensemblfungi" : {
      "generic_url" : "http://fungi.ensembl.org/",
      "uri_prefix" : null,
      "database" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "example_id" : "EnsemblFungi:YOR197W",
      "id" : null,
      "datatype" : null,
      "fullname" : null,
      "abbreviation" : "EnsemblFungi",
      "name" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/YOR197W",
      "object" : "Identifier"
   },
   "spd" : {
      "name" : null,
      "abbreviation" : "SPD",
      "fullname" : null,
      "object" : "Identifier",
      "url_example" : "http://www.riken.jp/SPD/05/05F01.html",
      "uri_prefix" : null,
      "database" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "generic_url" : "http://www.riken.jp/SPD/",
      "example_id" : "SPD:05/05F01",
      "url_syntax" : "http://www.riken.jp/SPD/[example_id].html",
      "local_id_syntax" : "^[0-9]{2}/[0-9]{2}[A-Z][0-9]{2}$",
      "datatype" : null,
      "id" : null
   },
   "broad_mgg" : {
      "url_syntax" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=S[example_id]",
      "example_id" : "Broad_MGG:MGG_05132.5",
      "id" : null,
      "datatype" : null,
      "description" : "Magnaporthe grisea Database at the Broad Institute",
      "generic_url" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/Home.html",
      "uri_prefix" : null,
      "database" : "Magnaporthe grisea Database",
      "url_example" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=SMGG_05132",
      "object" : "Locus",
      "abbreviation" : "Broad_MGG",
      "fullname" : null,
      "name" : null
   },
   "cgen" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "CGEN",
      "url_example" : null,
      "object" : "Identifier",
      "database" : "Compugen Gene Ontology Gene Association Data",
      "uri_prefix" : null,
      "generic_url" : "http://www.cgen.com/",
      "datatype" : null,
      "id" : null,
      "example_id" : "CGEN:PrID131022",
      "url_syntax" : null
   },
   "imgt_ligm" : {
      "url_syntax" : null,
      "example_id" : "IMGT_LIGM:U03895",
      "id" : null,
      "datatype" : null,
      "description" : "Database of immunoglobulins and T cell receptors from human and other vertebrates, with translation for fully annotated sequences.",
      "uri_prefix" : null,
      "database" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "generic_url" : "http://imgt.cines.fr",
      "object" : null,
      "url_example" : null,
      "abbreviation" : "IMGT_LIGM",
      "fullname" : null,
      "name" : null
   },
   "locsvmpsi" : {
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "description" : "Subcellular localization for eukayotic proteins based on SVM and PSI-BLAST",
      "database" : "LOCSVMPSI",
      "uri_prefix" : null,
      "generic_url" : "http://bioinformatics.ustc.edu.cn/locsvmpsi/locsvmpsi.php",
      "object" : null,
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "LOCSVMpsi",
      "name" : null
   },
   "ncbitaxon" : {
      "abbreviation" : "NCBITaxon",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "database" : "NCBI Taxonomy",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "example_id" : "taxon:7227",
      "id" : null,
      "datatype" : null
   },
   "syscilia_ccnet" : {
      "example_id" : null,
      "url_syntax" : null,
      "datatype" : null,
      "description" : "A systems biology approach to dissect cilia function and its disruption in human genetic disease",
      "id" : null,
      "database" : "Syscilia",
      "uri_prefix" : null,
      "generic_url" : "http://syscilia.org/",
      "url_example" : null,
      "object" : null,
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SYSCILIA_CCNET"
   },
   "parkinsonsuk-ucl" : {
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology",
      "uri_prefix" : null,
      "database" : "Parkinsons Disease Gene Ontology Initiative",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null,
      "abbreviation" : "ParkinsonsUK-UCL",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : null
   },
   "bhf-ucl" : {
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "description" : "The Cardiovascular Gene Ontology Annotation Initiative is supported by the British Heart Foundation (BHF) and located at University College London (UCL).",
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "Cardiovascular Gene Ontology Annotation Initiative",
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology/",
      "object" : null,
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "BHF-UCL",
      "name" : null
   },
   "pro" : {
      "object" : "Identifer",
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "fullname" : null,
      "abbreviation" : "PRO",
      "name" : null,
      "entity_type" : "PR:000000001 ! protein ",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "local_id_syntax" : "^[0-9]{9}$",
      "example_id" : "PR:000025380",
      "uri_prefix" : null,
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "database" : "Protein Ontology"
   },
   "sabio-rk" : {
      "url_syntax" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=[example_id]",
      "example_id" : "SABIO-RK:1858",
      "id" : null,
      "description" : "The SABIO-RK (System for the Analysis of Biochemical Pathways - Reaction Kinetics) is a web-based application based on the SABIO relational database that contains information about biochemical reactions, their kinetic equations with their parameters, and the experimental conditions under which these parameters were measured.",
      "datatype" : null,
      "database" : "SABIO Reaction Kinetics",
      "uri_prefix" : null,
      "generic_url" : "http://sabio.villa-bosch.de/",
      "url_example" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=1858",
      "object" : "reaction",
      "fullname" : null,
      "abbreviation" : "SABIO-RK",
      "name" : null
   },
   "resid" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "RESID:AA0062",
      "uri_prefix" : null,
      "database" : "RESID Database of Protein Modifications",
      "generic_url" : "ftp://ftp.ncifcrf.gov/pub/users/residues/",
      "object" : "Identifier",
      "url_example" : null,
      "abbreviation" : "RESID",
      "fullname" : null,
      "name" : null
   },
   "patric" : {
      "object" : "Feature identifier",
      "url_example" : "http://patric.vbi.vt.edu/gene/overview.php?fid=cds.000002.436951",
      "fullname" : null,
      "abbreviation" : "PATRIC",
      "name" : null,
      "url_syntax" : "http://patric.vbi.vt.edu/gene/overview.php?fid=[example_id]",
      "example_id" : "PATRIC:cds.000002.436951",
      "id" : null,
      "description" : "PathoSystems Resource Integration Center at the Virginia Bioinformatics Institute",
      "datatype" : null,
      "database" : "PathoSystems Resource Integration Center",
      "uri_prefix" : null,
      "generic_url" : "http://patric.vbi.vt.edu"
   },
   "ecogene" : {
      "url_example" : "http://www.ecogene.org/geneInfo.php?eg_id=EG10818",
      "object" : "EcoGene accession",
      "fullname" : null,
      "abbreviation" : "ECOGENE",
      "name" : null,
      "local_id_syntax" : "^EG[0-9]{5}$",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eg_id=[example_id]",
      "example_id" : "ECOGENE:EG10818",
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "generic_url" : "http://www.ecogene.org/"
   },
   "eurofung" : {
      "url_example" : null,
      "object" : null,
      "abbreviation" : "Eurofung",
      "fullname" : null,
      "name" : null,
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "database" : "Eurofungbase community annotation",
      "generic_url" : "http://www.eurofung.net/option=com_content&task=section&id=3&Itemid=4"
   },
   "biopixie_mefit" : {
      "url_syntax" : null,
      "example_id" : null,
      "id" : null,
      "datatype" : null,
      "database" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "uri_prefix" : null,
      "generic_url" : "http://pixie.princeton.edu/pixie/",
      "object" : null,
      "url_example" : null,
      "abbreviation" : "bioPIXIE_MEFIT",
      "fullname" : null,
      "name" : null
   },
   "po_ref" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "PO_REF",
      "object" : "Reference identifier",
      "url_example" : "http://wiki.plantontology.org:8080/index.php/PO_REF:00001",
      "uri_prefix" : null,
      "database" : "Plant Ontology custom references",
      "generic_url" : "http://wiki.plantontology.org:8080/index.php/PO_references",
      "example_id" : "PO_REF:00001",
      "url_syntax" : "http://wiki.plantontology.org:8080/index.php/PO_REF:[example_id]",
      "datatype" : null,
      "id" : null
   },
   "broad" : {
      "fullname" : null,
      "abbreviation" : "Broad",
      "name" : null,
      "url_example" : null,
      "object" : null,
      "database" : "Broad Institute",
      "uri_prefix" : null,
      "generic_url" : "http://www.broad.mit.edu/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : null
   },
   "enzyme" : {
      "uri_prefix" : null,
      "database" : "Swiss Institute of Bioinformatics enzyme database",
      "generic_url" : "http://www.expasy.ch/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?[example_id]",
      "example_id" : "ENZYME:EC 1.1.1.1",
      "abbreviation" : "ENZYME",
      "fullname" : null,
      "name" : null,
      "object" : "Identifier",
      "url_example" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?1.1.1.1"
   },
   "pfamb" : {
      "abbreviation" : "PfamB",
      "fullname" : null,
      "name" : null,
      "url_example" : null,
      "object" : "Accession",
      "database" : "Pfam-B supplement to Pfam",
      "uri_prefix" : null,
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "PfamB:PB014624"
   },
   "rgdid" : {
      "id" : null,
      "entity_type" : "SO:0000704 ! gene",
      "datatype" : null,
      "local_id_syntax" : "^[0-9]{4,7}$",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "example_id" : "RGD:2004",
      "uri_prefix" : null,
      "generic_url" : "http://rgd.mcw.edu/",
      "database" : "Rat Genome Database",
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "object" : "Accession",
      "fullname" : null,
      "abbreviation" : "RGDID",
      "name" : null
   },
   "hpa_antibody" : {
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=[example_id]",
      "example_id" : "HPA_antibody:HPA000237",
      "database" : "Human Protein Atlas antibody information",
      "uri_prefix" : null,
      "generic_url" : "http://www.proteinatlas.org/",
      "object" : "Identifier",
      "url_example" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=HPA000237",
      "fullname" : null,
      "abbreviation" : "HPA_antibody",
      "name" : null
   },
   "superfamily" : {
      "example_id" : "SUPERFAMILY:51905",
      "url_syntax" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF[example_id]",
      "description" : "A database of structural and functional protein annotations for completely sequenced genomes",
      "datatype" : null,
      "id" : null,
      "database" : "SUPERFAMILY protein annotation database",
      "uri_prefix" : null,
      "generic_url" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/index.html",
      "url_example" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF51905",
      "object" : "Accession",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SUPERFAMILY"
   },
   "prosite" : {
      "uri_prefix" : null,
      "database" : "Prosite database of protein families and domains",
      "generic_url" : "http://www.expasy.ch/prosite/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?[example_id]",
      "example_id" : "Prosite:PS00365",
      "fullname" : null,
      "abbreviation" : "Prosite",
      "name" : null,
      "url_example" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?PS00365",
      "object" : "Accession"
   },
   "wbphenotype" : {
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:[example_id]",
      "local_id_syntax" : "^[0-9]{7}$",
      "example_id" : "WBPhenotype:0002117",
      "uri_prefix" : null,
      "generic_url" : "http://www.wormbase.org/",
      "database" : "WormBase phenotype ontology",
      "object" : "Gene identifier",
      "url_example" : "http://www.wormbase.org/species/c_elegans/phenotype/WBPhenotype:0000154",
      "abbreviation" : "WBPhenotype",
      "fullname" : null,
      "name" : null
   },
   "ncbi_locus_tag" : {
      "fullname" : null,
      "abbreviation" : "NCBI_locus_tag",
      "name" : null,
      "object" : "Identifier",
      "url_example" : null,
      "database" : "NCBI locus tag",
      "uri_prefix" : null,
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "id" : null,
      "datatype" : null,
      "url_syntax" : null,
      "example_id" : "NCBI_locus_tag:CTN_0547"
   },
   "kegg_ligand" : {
      "name" : null,
      "fullname" : null,
      "abbreviation" : "KEGG_LIGAND",
      "object" : "Compound",
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?cpd:C00577",
      "generic_url" : "http://www.genome.ad.jp/kegg/docs/upd_ligand.html",
      "uri_prefix" : null,
      "database" : "KEGG LIGAND Database",
      "datatype" : null,
      "id" : null,
      "example_id" : "KEGG_LIGAND:C00577",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?cpd:[example_id]",
      "local_id_syntax" : "^C\\d{5}$"
   },
   "biocyc" : {
      "datatype" : null,
      "id" : null,
      "example_id" : "BioCyc:PWY-5271",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "generic_url" : "http://biocyc.org/",
      "uri_prefix" : null,
      "database" : "BioCyc collection of metabolic pathway databases",
      "object" : "Identifier",
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=PWY-5271",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "BioCyc"
   },
   "ensemblplants" : {
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "object" : "Identifier",
      "name" : null,
      "abbreviation" : "EnsemblPlants",
      "fullname" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "generic_url" : "http://plants.ensembl.org/",
      "uri_prefix" : null
   },
   "go" : {
      "local_id_syntax" : "^\\d{7}$",
      "url_syntax" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:[example_id]",
      "example_id" : "GO:0004352",
      "entity_type" : "GO:0032991 ! macromolecular complex",
      "id" : null,
      "datatype" : null,
      "generic_url" : "http://amigo.geneontology.org/",
      "uri_prefix" : null,
      "database" : "Gene Ontology Database",
      "object" : "Identifier",
      "url_example" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:0004352",
      "abbreviation" : "GO",
      "fullname" : null,
      "name" : null
   },
   "ensembl" : {
      "example_id" : "ENSEMBL:ENSP00000265949",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "local_id_syntax" : "^ENS[A-Z0-9]{10,17}$",
      "datatype" : null,
      "entity_type" : "SO:0000673 ! transcript",
      "id" : null,
      "database" : "Ensembl database of automatically annotated genomic data",
      "generic_url" : "http://www.ensembl.org/",
      "uri_prefix" : null,
      "object" : "Identifier (unspecified)",
      "url_example" : "http://www.ensembl.org/id/ENSP00000265949",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "Ensembl"
   },
   "mesh" : {
      "example_id" : "MeSH:mitosis",
      "url_syntax" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "Medical Subject Headings",
      "uri_prefix" : null,
      "generic_url" : "http://www.nlm.nih.gov/mesh/2005/MBrowser.html",
      "url_example" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=mitosis",
      "object" : "MeSH heading",
      "name" : null,
      "abbreviation" : "MeSH",
      "fullname" : null
   },
   "cas_spc" : {
      "fullname" : null,
      "abbreviation" : "CAS_SPC",
      "name" : null,
      "url_example" : null,
      "object" : "Identifier",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "uri_prefix" : null,
      "database" : "Catalog of Fishes species database",
      "id" : null,
      "datatype" : null,
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "example_id" : null
   },
   "sp_kw" : {
      "example_id" : "UniProtKB-KW:KW-0812",
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "UniProt Knowledgebase keywords",
      "generic_url" : "http://www.uniprot.org/keywords/",
      "uri_prefix" : null,
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "object" : "Identifier",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "SP_KW"
   },
   "biosis" : {
      "object" : "Identifier",
      "url_example" : null,
      "fullname" : null,
      "abbreviation" : "BIOSIS",
      "name" : null,
      "url_syntax" : null,
      "example_id" : "BIOSIS:200200247281",
      "id" : null,
      "datatype" : null,
      "database" : "BIOSIS previews",
      "uri_prefix" : null,
      "generic_url" : "http://www.biosis.org/"
   },
   "ncbi_taxid" : {
      "database" : "NCBI Taxonomy",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "uri_prefix" : null,
      "datatype" : null,
      "id" : null,
      "example_id" : "taxon:7227",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "name" : null,
      "abbreviation" : "ncbi_taxid",
      "fullname" : null,
      "object" : "Identifier",
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702"
   },
   "cbs" : {
      "name" : null,
      "abbreviation" : "CBS",
      "fullname" : null,
      "object" : "prediction tool",
      "url_example" : "http://www.cbs.dtu.dk/services/[example_id]/",
      "uri_prefix" : null,
      "generic_url" : "http://www.cbs.dtu.dk/",
      "database" : "Center for Biological Sequence Analysis",
      "datatype" : null,
      "id" : null,
      "example_id" : "CBS:TMHMM",
      "url_syntax" : null
   },
   "unimod" : {
      "url_example" : "http://www.unimod.org/modifications_view.php?editid1=1287",
      "object" : "Identifier",
      "abbreviation" : "UniMod",
      "fullname" : null,
      "name" : null,
      "id" : null,
      "datatype" : null,
      "description" : "protein modifications for mass spectrometry",
      "url_syntax" : "http://www.unimod.org/modifications_view.php?editid1=[example_id]",
      "example_id" : "UniMod:1287",
      "uri_prefix" : null,
      "generic_url" : "http://www.unimod.org/",
      "database" : "UniMod"
   },
   "eck" : {
      "url_example" : "http://www.ecogene.org/geneInfo.php?eck_id=ECK3746",
      "object" : "ECK accession (E. coli K-12 gene identifier)",
      "abbreviation" : "ECK",
      "fullname" : null,
      "name" : null,
      "local_id_syntax" : "^ECK[0-9]{4}$",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eck_id=[example_id]",
      "example_id" : "ECK:ECK3746",
      "entity_type" : "SO:0000704 ! gene",
      "id" : null,
      "datatype" : null,
      "uri_prefix" : null,
      "generic_url" : "http://www.ecogene.org/",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function"
   },
   "ensembl_transcriptid" : {
      "database" : "Ensembl database of automatically annotated genomic data",
      "uri_prefix" : null,
      "generic_url" : "http://www.ensembl.org/",
      "datatype" : null,
      "id" : null,
      "example_id" : "ENSEMBL_TranscriptID:ENST00000371959",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "local_id_syntax" : "^ENST[0-9]{9,16}$",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "ENSEMBL_TranscriptID",
      "url_example" : "http://www.ensembl.org/id/ENST00000371959",
      "object" : "Transcript identifier"
   },
   "ipr" : {
      "object" : "Identifier",
      "url_example" : "http://www.ebi.ac.uk/interpro/entry/IPR015421",
      "name" : null,
      "fullname" : null,
      "abbreviation" : "IPR",
      "example_id" : "InterPro:IPR000001",
      "local_id_syntax" : "^IPR\\d{6}$",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/entry/[example_id]",
      "datatype" : null,
      "id" : null,
      "database" : "InterPro database of protein domains and motifs",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "uri_prefix" : null
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
    exports.amigo = amigo;
}
