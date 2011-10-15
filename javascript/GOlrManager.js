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
function GOlrManager(in_args){

    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // AmiGO helper.
    var amigo = new bbop.amigo();
    var golr = amigo.golr_response;

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
	if( typeof(anchor.callback_registry[category]) == 'undefined'){
	    throw new Error('cannot register, unknown category');
	}

	// The default priority is 0.
	var priority = 0;
	if( in_priority ){ priority = in_priority; }

	anchor.callback_registry[category][function_id] =
	    {
		runner: in_function,
		priority: priority
	    };
    };
    // Remove the specified function from the registry.
    this.unregister = function(category, function_id){
	if( anchor.callback_registry[category] &&
	    anchor.callback_registry[category][function_id] ){
	    delete anchor.callback_registry[category][function_id];
        }
    };

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
    // There should be a string interface_id argument.
    if( in_args && ! in_args['interface_id'] ){
	ll('SM: ERROR: no interface_id argument');
	if( typeof in_args['interface_id'] != 'string' ){
	    ll('SM: ERROR: no interface_id string argument');
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
    
    // The location where we'll build the interface on callback.
    this.interface_id = in_args['interface_id'];
    
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
	    fq: in_args['filters'],

	    // Fixed UI location.
	    interface_id: this.interface_id

	    // Query-type stuff is variant--see update and
	    // query_variants.
	    //q: '*:*', // start by going after everything
	};
    
    // Generic getter for callback functions.
    this._get_prioritized_callbacks = function(category){

	var cb_id_list =
	    bbop.core.get_keys(anchor.callback_registry[category]);
	// Sort callback list according to priority.
	var ptype_anchor = this;
	cb_id_list.sort(function(a, b){  
			    var pkg_a =
				ptype_anchor.callback_registry[category][a];
			    var pkg_b =
				ptype_anchor.callback_registry[category][b];
			    return pkg_b['priority'] - pkg_a['priority'];
			});
	
	// Collect the actual stored functions by priority.
	var cb_fun_list = [];
	for( var cbi = 0; cbi < cb_id_list.length; cbi++ ){
	    var cb_id = cb_id_list[cbi];
	    var to_run = anchor.callback_registry[category][cb_id]['runner'];
	    cb_fun_list.push(to_run);
	    // ll('callback: ' + category + ', ' + cb_id + ', ' +
	    //    this.callback_registry[category][cb_id]['priority']);
	}
	
	return cb_fun_list;
    };

    // The callback function called after a successful AJAX
    // intialization/reset cal. First it runs some template code, then it
    // does all of the callbacks.
    this._run_reset_callbacks = function(json_data){
	ll('SM: in reset...');
    
	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('reset');
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(json_data);
	}
    };

    // The main callback function called after a successful AJAX call in
    // the update function. First it runs some template code, then it does
    // all of the callbacks.
    this._run_response_callbacks = function(json_data){
	ll('SM: in response...');
	
	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('response');
	ll('callbacks: ' + callbacks);
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(json_data);
	}
    };

    // This is the function that runs where there is an AJAX error
    // during an update. First it runs some template code, then it
    // does all of the callbacks.
    this._run_error_callbacks = function(result, status, error) {

	ll('SM: in error...');	
	ll('SM: Failed server request: '+ result +', '+ status +', '+ error);
		
	// Get the error out if possible.
	var jreq = result.responseText;
	var req = jQuery.parseJSON(jreq);
	if( req && req['errors'] && req['errors'].length > 0 ){
	    var in_error = req['errors'][0];
	    ll('SM: ERROR:' + in_error);
	    // Split on newline if possible to get
	    // at the nice part before the perl
	    // error.
	    var reg = new RegExp("\n+", "g");
	    var clean_error_split =
		in_error.split(reg);
	    var clean_error = clean_error_split[0];
	}
	
	// Run all against registered functions.
	var callbacks = anchor._get_prioritized_callbacks('error');
	for( var cbi = 0; cbi < callbacks.length; cbi++ ){
	    var run_fun = callbacks[cbi];
	    run_fun(clean_error);
	}
    };
    var _run_error_callbacks = this._run_error_callbacks;

    // Try and decide between a reset callback and a response
    // callback.
    function _callback_type_decider(json_data){
    	ll('SM: in callback type decider...');

    	// 
    	if( ! golr.success(json_data) ){
    	    throw new Error("Unsuccessful response from golr server!");
    	}else{
    	    var cb_type = golr.callback_type(json_data);
    	    ll('SM: okay response, will probe...: ' + cb_type);
    	    if( cb_type == 'reset' ){
    		anchor._run_reset_callbacks(json_data);
    	    }else if( cb_type == 'response' ){
    		anchor._run_response_callbacks(json_data);
    	    }else{
    		throw new Error("Unknown callback type!");
    	    }
    	}
    };

    // The user code to select the type of update (and thus the type
    // of callbacks to be called on data return).
    this.update = function(update_type){

	// Our bookkeeping--increment packet.
	anchor.last_sent_packet = anchor.last_sent_packet + 1;
	
	// Necessary variants.
	var query_variants = {
	    packet: anchor.last_sent_packet,
	    callback_type: update_type
	};

	// Structure of the necessary invariant parts.	
	var qs_head = anchor.solr_url + 'select?';
	var invariant_qs = bbop.core.get_assemble(anchor.query_invariants);
	var qurl = qs_head + invariant_qs;

	// Conditional merging of the remaining variant parts.
	if( update_type && update_type == 'reset' ){
	    // Reset and do completely open query.
	    var variant_qs = bbop.core.get_assemble(query_variants);
	    ll('SM: varient_qs: ' + variant_qs);
	    qurl = qurl + '&' + variant_qs + '&q=*:*';
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
	    success: _callback_type_decider,
	    error: _run_error_callbacks
	};
	jQuery.ajax(argvars);
    };
}
