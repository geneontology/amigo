////
//// Experiment in Term enrichement number collection.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global amigo */
/* global bbop */
/* global d3 */
/* global global_acc */
/* global global_live_search_query */
/* global global_live_search_filters */
/* global global_live_search_pins */

// TODO: Interact with the user, launch stage 01.
function TEBaseInit(){

    // First things first, let's hide the nasty flying divs...
    jQuery("#info").hide();
    jQuery("#progress-widget").hide();

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM: ' + str); }
    ll('');
    ll('TEBaseInit start...');

    // Pull in and fix the gp data.
    jQuery('#button').click(
	function(e){
	    //alert(jQuery('#input-terms').val());
	    var raw_text = jQuery('#input-ids').val();
	    raw_text = raw_text.replace(/^\s+/,'');
	    raw_text = raw_text.replace(/\s+$/,'');
	    var gp_accs = raw_text.split(/\s+/); // split on any ws
	    ll('Running: ' + bbop.core.dump(gp_accs));
	    jQuery('#tebase_results').empty();
	    stage_01(gp_accs);
	});

    // DEBUG: To test:
    // gp_accs = [];
    //stage_01(gp_accs);

    ll('Completed init!');    
}

// Get the information for the incoming accs, launch stage 02.
function stage_01(gp_accs){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM01: ' + str); }
    ll('');
    ll('Stage 01 start...');

    // Helpers.
    var each = bbop.core.each;
    var dump = bbop.core.dump;

    // Prep the progress bar and hide the order selector until we're
    // done.
    jQuery("#progress-text").empty();
    jQuery("#progress-text").append('<b>Loading...</b>');
    //jQuery("#progress-bar").empty();
    jQuery("#progress-widget").show();

    // Next, setup the manager environment.
    ll('Setting up manager.');
    var server_meta = new amigo.data.server();
    //var gloc = server_meta.golr_base();
    var gloc = 'http://golr.berkeleybop.org/solr/';
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(gloc, gconf);
    go.set_personality('annotation'); // always this
    //go.debug(false);

    // Now, cycle though all of the gps to collect info on.
    ll('Gathering batch URLs for annotation data...');
    var gp_user_order = {};
    each(gp_accs, function(acc, index){

    	// Set/reset for the next query.
    	go.reset_query_filters(); // reset from the last iteration

	// 
	go.add_query_filter('document_category', 'annotation', ['*']);
	go.add_query_filter('bioentity', acc);
	//go.add_query_filter('taxon', taxon_filter, ['*']); }
	go.set('rows', 0); // we don't need any actual rows returned
	go.set_facet_limit(-1); // we are only interested in facet counts
	go.facets(['regulates_closure']);
    	go.add_to_batch();

	gp_user_order[acc] = index;
    });

    var gp_info = {};
    // Fetch the data and grab the number we want.
    var accumulator_fun = function(resp){	

	// Who was this?
	var acc = null;
	var fqs = resp.parameter('fq');
	//console.log(fqs);
	//console.log(resp);
	each(fqs, function(fq){
	    //console.log(fq);
	    //console.log(fq.substr(0, 9));
	    if( fq.substr(0, 9) === 'bioentity' ){
		acc = fq.substr(10, fq.length-1);
		ll('Looking at info for: ' + acc);
	    }
	});

	if( acc ){
	    //ll('Looking at info for: ' + acc);
	    console.log(resp);
	    
	    var ffs = resp.facet_field('regulates_closure');
	    each(ffs, function(pair){

		console.log(pair);

		// Ensure existance.
		if( ! gp_info[acc] ){ 
		    gp_info[acc] = {};
		}

		//
		gp_info[acc][pair[0]] = pair[1];
	    });
	}

    };

    // The final function is the data renderer.
    var final_fun = function(){
	ll('Starting final in stage 01...');

	ll('gp_info: ' + dump(gp_info));
	stage_02(gp_info, gp_accs);

	ll('Completed stage 01!');
    };
    go.run_batch(accumulator_fun, final_fun);

}

// 
function stage_02(gp_info, gp_accs){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM02: ' + str); }
    ll('');
    ll('Stage 02 start...');

    // Clear out.
    jQuery("#progress-text").empty();
    jQuery("#progress-widget").hide();

    // Helpers.
    var each = bbop.core.each;
    var dump = bbop.core.dump;

    jQuery('#tebase_results').append('<div class="panel panel-default">');
    jQuery('#tebase_results').append(dump(gp_info));
    jQuery('#tebase_results').append('</div>');
    

    ll('Completed stage 02!');
    ll('Done!');
}
