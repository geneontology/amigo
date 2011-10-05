////
////
////

// Thinking about lessons learned from solr ajax.
// Updatable model that connects to the Solr server.
// Makes no attempt to join to a form--entirely held as an internal model.
// {url: 'http://theplace', facets: ['foo', 'bar']}

// This should act as a model--since we start with a completely open
// query (whether we display it or not), we will have all possible
// facets and can build the initial model off of that.
function SolrManager(in_args){

    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // TODO: Block requests from the past from haunting us.
    this.last_sent_packet = 0;
    this.last_received_packet = 0;

    // Handle the registration of call functions to get activated
    // after certain events.
    this.callback_registry ={
	reset: {},
	response : {},
	error: {}
    };
    // Remove the specified function from the registry, with an
    // optional relative priority against other callback functions.
    this.register = function(category, function_id, in_function, in_priority){

	// Only these categories.
	if( typeof(this.callback_registry[category]) == 'undefined'){
	    throw new Error('cannot register, unknown category');
	}

	// The default priority is 0.
	var priority = 0;
	if( in_priority ){ priority = in_priority; }

	this.callback_registry[category][function_id] =
	    {
		runner: in_function,
		priority: priority
	    };
    };
    // Remove the specified function from the registry.
    this.unregister = function(category, function_id){
	if( this.callback_registry[category] &&
	    this.callback_registry[category][function_id] ){
	    delete this.callback_registry[category][function_id];
        }
    };

    // TODO: I don't remember what I was going to do with these...
    this.vanish = function(fun_id){
    };
    this.reveal = function(fun_id){
    };

    // // TODO?
    // These are currently handled at creation.
    // this.add_facet = function(){ };
    // this.remove_facet = function(){ };

    // Check args.
    if( ! in_args ){
	ll('SM: ERROR: no argument');
    }
    // There should be a string url argument.
    if( in_args && ! in_args['url'] ){
	ll('SM: ERROR: no url argument');
	if( typeof in_args['url'] != 'string' ){
	    ll('SM: ERROR: no url string argument');
	}
    }
    // There could be a hash of pinned filters argument.
    if( in_args && in_args['filters'] ){
	if( typeof in_args['facets'] != 'object' ){
	    ll('SM: ERROR: no sane filters argument');	    
	}
    }
    // There should be an array facets argument.
    if( in_args && ! in_args['facets'] ){
	ll('SM: ERROR: no facets argument');
	if( typeof in_args['facets'] != 'object' || 
	    typeof in_args['facets'].length == 'undefined' ||
	    typeof in_args['facets'].length == 0 ){
		ll('SM: ERROR: no facets sanely specified');
	    }
    }
    
    // Our default target url.
    this.solr_url = in_args['url'];
    
    // Our default query args, with facet fields plugged in.
    this.query_invariants =
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
	    facet: 'true',
	    'facet.mincount': 1,
	    // TODO?: 'facet.limit': 20,
	    // TODO?: 'f.???.facet.limit': 50,
	    'facet.field': in_args['facets'],
	    // TODO: 'json.nl': [flat|map|arrarr]
	    'json.nl': 'arrarr',

	    // Static facet filtering.

	    // For restricting ourselves to a certain part if the
	    // index as an initial condition.
	    fq: in_args['filters']

	    // TODO: move these to a more variant section.
	    // Query-type stuff.
	    //q: '*:*', // start by going after everything
	    // Our bookkeeping.
	    //packet: 0
	};
    
    // 
    this._run_reset_callbacks = function(json_data){
	ll('SM: in reset...');

	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('reset');
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(json_data);
	}
    };
    var _run_reset_callbacks = this._run_reset_callbacks;

    // The main callback function called after a successful AJAX call
    // in the update function.
    this._run_response_callbacks = function(json_data){
	ll('SM: in response...');
	
	// // Grab meta information.
	// var total = amigo.golr_response.total_documents(json_data);
	// var first = amigo.golr_response.start_document(json_data);
	// var last = amigo.golr_response.end_document(json_data);
	// var meta_cache = new Array();
	// meta_cache.push('Total: ' + total);
	
	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('response');
	ll('callbacks: ' + callbacks);
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(json_data);
	}
    };
    var _run_response_callbacks = this._run_response_callbacks;

    // 
    this._run_error_callbacks = function(result, status, error) {

	ll('SM: in error...');	
	ll('SM: Failed server request: '+ result +', '+ status +', '+ error);
		
	// // Get the error out if possible.
	// var jreq = result.responseText;
	// var req = jQuery.parseJSON(jreq);
	// if( req && req['errors'] &&
	//     req['errors'].length > 0 ){
	// 	var in_error = req['errors'][0];
	// 	kvetch('SM: ERROR:' + in_error);
					
	// 	// Split on newline if possible to get
	// 	// at the nice part before the perl
	// 	// error.
	// 	var reg = new RegExp("\n+", "g");
	// 	var clean_error_split =
	// 	    in_error.split(reg);
	// 	var clean_error = clean_error_split[0];
	// 	//widgets.error(clean_error);
	//     }
	
	// // Close wait no matter what.
	// //widgets.finish_wait();

	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('reset');
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(result, status, error);
	}
    };
    var _run_error_callbacks = this._run_error_callbacks;

    // ...
    this.update = function(in_arg){

	// Increment packet.
	this.last_sent_packet = this.last_sent_packet + 1;
	
	// Necessary variants.
	var query_variants = {
	    packet: this.last_sent_packet
	};

	// Structure of the necessary invariant parts.	
	var qs_head = this.solr_url + 'select?';
	var invariant_qs = bbop.core.get_assemble(this.query_invariants);
	var qurl = qs_head + invariant_qs;

	// Conditional merging of the remaining variant parts.
	if( in_arg && in_arg == 'reset' ){
	    // Reset and do completely open query.
	    var variant_qs = bbop.core.get_assemble(query_variants);
	    qurl = qurl + '&' + variant_qs + '&state=initial&q=*:*';
	}else{
	    // TODO: standard assemble with filter and state.
	}

	ll('SM: try: ' + qurl);
	//widgets.start_wait('Updating...');

	// TODO/BUG: JSONP for solr looks like?
	var argvars = {
	    type: "GET",
	    url: qurl,
	    dataType: 'json',
	    jsonp: 'json.wrf',
	    success: _run_response_callbacks,
	    error: _run_error_callbacks
	};
	jQuery.ajax(argvars);
    };
}

// Generic getter for callback functions.
SolrManager.prototype._get_prioritized_callbacks = function(category){

    var ptype_anchor = this;
    var cb_id_list =
	bbop.core.get_hash_keys(this.callback_registry[category]);
    // Sort callback list according to priority.
    cb_id_list.sort(function(a, b){  
			var pkg_a = ptype_anchor.callback_registry[category][a];
			var pkg_b = ptype_anchor.callback_registry[category][b];
			return pkg_b['priority'] - pkg_a['priority'];
		    });
    
    // Collect the actual stored functions by priority.
    var cb_fun_list = [];
    for( var cbi = 0; cbi < cb_id_list.length; cbi++ ){
	var cb_id = cb_id_list[cbi];
	cb_fun_list.push(this.callback_registry[category][cb_id]['runner']);
	
	// ll('callback: ' + category + ', ' + cb_id + ', ' +
	//    this.callback_registry[category][cb_id]['priority']);
    }
    
    return cb_fun_list;
};
    
