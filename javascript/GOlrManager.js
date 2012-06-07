////
//// Keep in mind that this is a "subclass" of bbop.registry.
////

bbop.core.require('bbop', 'registry');

// Thinking about lessons learned from solr ajax.
// Updatable model that connects to the Solr server.
// Makes no attempt to join to a form--entirely held as an internal model.
// {url: 'http://theplace', facets: ['foo', 'bar']}

// This should act as a model--since we start with a completely open
// query (whether we display it or not), we will have all possible
// facets and can build the initial model off of that.
function GOlrManager(in_args){
    // We are a registry like this:
    bbop.registry.call(this, ['reset', 'search', 'error']);

    var anchor = this;

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('GM: ' + str); }

    // AmiGO helper.
    var amigo = new bbop.amigo();
    var golr = amigo.golr_response;

    // TODO: Block requests from the past from haunting us.
    this.last_sent_packet = 0;
    this.last_received_packet = 0;

    // Check incoming arguments.
    if( ! in_args ){
	ll('ERROR: no argument');
    }
    // There should be a string url argument.
    if( in_args && ! in_args['url'] ){
	ll('ERROR: no url argument');
	if( typeof in_args['url'] != 'string' ){
	    ll('ERROR: no url string argument');
	}
    }
    // There could be a hash of pinned filters argument.
    if( in_args && in_args['filters'] ){
	if( typeof in_args['facets'] != 'object' ){
	    ll('ERROR: no sane filters argument');	    
	}
    }
    // There should be an array facets argument.
    if( in_args && ! in_args['facets'] ){
	ll('ERROR: no facets argument');
	if( typeof in_args['facets'] != 'object' || 
	    typeof in_args['facets'].length == 'undefined' ||
	    typeof in_args['facets'].length == 0 ){
		ll('ERROR: no facets sanely specified');
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
	    //version: '2.2',
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

	    // // Fixed UI location.
	    // NOTE: punted to UI object.
	    // interface_id: this.interface_id

	    // Query-type stuff is variant--see update and
	    // update_variants.
	    q: '*:*' // start by going after everything
	};
    
    // A little extra thing that we might need sometimes.
    this.query_extra = null;

    // The callback function called after a successful AJAX
    // intialization/reset cal. First it runs some template code, then it
    // does all of the callbacks.
    this._run_reset_callbacks = function(json_data){
	ll('run reset callbacks...');
	anchor.apply_callbacks('reset', [json_data]);
    };

    // The main callback function called after a successful AJAX call in
    // the update function. First it runs some template code, then it does
    // all of the callbacks.
    this._run_search_callbacks = function(json_data){
	ll('run search callbacks...');
	anchor.apply_callbacks('search', [json_data]);
    };

    // This is the function that runs where there is an AJAX error
    // during an update. First it runs some template code, then it
    // does all of the callbacks.
    this._run_error_callbacks = function(result, status, error) {

	ll('Failed server request: '+ result +', '+ status +', '+ error);
		
	// Get the error out if possible.
	var jreq = result.responseText;
	var req = jQuery.parseJSON(jreq);
	if( req && req['errors'] && req['errors'].length > 0 ){
	    var in_error = req['errors'][0];
	    ll('ERROR:' + in_error);
	    // Split on newline if possible to get
	    // at the nice part before the perl
	    // error.
	    var reg = new RegExp("\n+", "g");
	    var clean_error_split =
		in_error.split(reg);
	    var clean_error = clean_error_split[0];
	}
	
	// Run all against registered functions.
	ll('run error callbacks...');
	anchor.apply_callbacks('error', [clean_error]);
    };
    var _run_error_callbacks = this._run_error_callbacks;

    // Try and decide between a reset callback and a search callback.
    function _callback_type_decider(json_data){
    	ll('in callback type decider...');

    	// 
    	if( ! golr.success(json_data) ){
    	    throw new Error("Unsuccessful response from golr server!");
    	}else{
    	    var cb_type = golr.callback_type(json_data);
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

    // The user code to select the type of update (and thus the type
    // of callbacks to be called on data return).
    this.update = function(update_type, logic_hash){

	// Structure of the necessary invariant parts.	
	var qurl = anchor.get_query_url();

	// Our bookkeeping--increment packet.
	anchor.last_sent_packet = anchor.last_sent_packet + 1;
	
	// Necessary variants.
	var update_variants = {
	    packet: anchor.last_sent_packet,
	    callback_type: update_type
	};

	// Conditional merging of the remaining variant parts.
	if( update_type == 'reset' ){

	    // Reset and do completely open query.
	    ll('reset variant assembly');
	    var update_qs = bbop.core.get_assemble(update_variants);
	    ll('varient_qs: ' + update_qs);
	    //qurl = qurl + '&' + update_qs + '&q=*:*';
	    qurl = qurl + '&' + update_qs;

	}else if( update_type == 'search' ){

	    // NOTE/TODO: a lot of previous wacky q handling was done
	    // in perl on the server, some of that will probably have
	    // to be ported over to JS around here.
	    var query_string = '*:*';
	    if( logic_hash && logic_hash['q'] ){
		var q_logic = logic_hash['q'];
		var str_rep = q_logic.to_string();
		if( str_rep.length > 0 ){
		    // query_string = 'label:' + str_rep +
		    // 	' OR annotation_class_label:' + str_rep;
		    query_string = str_rep;
		}
	    }

	    // NOTE/TODO: Assemble filters from logic. Make clean for
	    // URLs.
	    var filter_qs = '';
	    if( logic_hash && logic_hash['fq'] ){
		var fq_logic = logic_hash['fq'];
		var str_rep = fq_logic.to_string();	    

		if( str_rep.length > 0 ){
		    filter_qs = '&fq=' + str_rep;
		}
	    }

	    // Finalize it.
	    ll('final variant assembly');
	    var update_qs = bbop.core.get_assemble(update_variants);
	    //ll('varient_qs: ' + update_qs);
	    qurl = qurl + '&' + update_qs + filter_qs + '&q=' + query_string;

	}else{
	    throw new Error("Unknown update_type: " + update_type);
	}

	ll('try: ' + qurl);
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

    // Trigger the "reset" chain of events.
    this.reset = function(){
	anchor.update('reset', null);
    };

    // Trigger the "search" chain of events.
    // Takes a field-keyed hash of bbop.logics as an argument.
    this.search = function(logic_hash){
	anchor.update('search', logic_hash);
    };

    /*
     * Function: set_filters
     *
     * Set the internal fq hash from what it currently is.
     *
     * Parameters: 
     *  new_fq_hash - ""
     *
     * Returns: n/a
     */
    this.set_filters = function(new_fq_hash){
	anchor.query_invariants['fq'] = new_fq_hash;
    };

    /*
     * Function: set_extra
     *
     * Set the internal string variable to be appended to the end.
     * For special use cases only.
     *
     * Parameters: 
     *  new_extra - ""
     *
     * Returns: n/a
     */
    this.set_extra = function(new_extra){
	anchor.query_extra = new_extra;
    };

    /*
     * Function: set
     *
     * Set an internal variable for the query.
     *
     * Parameters: 
     *  key - the name of the parameter to change
     *  new_val - what you want the new value to be
     *
     * Returns: n/a
     */
    this.set = function(key, new_val){
	anchor.query_invariants[key] = new_val;
    };

    /*
     * Function: get
     *
     * Get an internal variable for the query.
     *
     * Parameters: 
     *  key - the name of the parameter to get
     *
     * Returns: n/a
     */
    this.get = function(key){
	return anchor.query_invariants[key];
    };

    /*
     * Function: get_query_url
     *
     * Get the current invariant state of the manager returned as a
     * URL string.
     *
     * Returns: string
     */
    this.get_query_url = function(){

	// Structure of the necessary invariant parts.	
	var qs_head = anchor.solr_url + 'select?';
	var invariant_qs = bbop.core.get_assemble(anchor.query_invariants);
	var qurl = qs_head + invariant_qs;

	// Add anything extra at the end.
	if( anchor.query_extra && anchor.query_extra != "" ){
	    qurl = qurl + anchor.query_extra;
	}

    	return qurl;
    };
}
GOlrManager.prototype = new bbop.registry;
