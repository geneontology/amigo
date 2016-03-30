////
//// Experiment in D3 JS; no cart like in NMatrix.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global d3 */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
//var gserv = amigo.data.server.golr_base;
var gserv_bulk = amigo.data.server.golr_bulk_base;
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// Create fresh manager.
function _new_manager(){
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv_bulk, gconf, engine, 'async');
    return manager;
}

var filter_manager = null;

// Extract the filters being used in the filter manager.
function _get_filters(filter_manager){

    var lstate = filter_manager.get_filter_query_string();
    var lparams = bbop.url_parameters(decodeURIComponent(lstate));
    var filters_as_strings = [];
    us.each(lparams, function(lparam){
	if( lparam[0] === 'fq' && lparam[1] ){
	    filters_as_strings.push(lparam[1]);
	}
    });
    //console.log('pass filter state: ', filters_as_strings);

    return filters_as_strings;
}

// TODO: Interact with the user, launch stage 01.
function MatrixUIInit(){

    // First things first, let's hide the nasty flying divs...
    jQuery("#info").hide();
    jQuery("#progress-widget").hide();
    jQuery("#order-selector").hide();

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM: ' + str); }
    ll('');
    ll('MatrixUIInit start...');

    //
    filter_manager = _new_manager();
    filter_manager.set_personality('bioentity');
    filter_manager.add_query_filter('document_category', 'bioentity', ['*']);
    filter_manager.set_results_count(0); // don't need any actual rows returned

    // Add the filter widget and hook to manager.
    var hargs = {
	meta_label: 'Total bioentities:&nbsp;',
	// free_text_placeholder:
	// 'Input text to filter against all remaining documents',
	'display_free_text_p': false
    };
    var filters = new widgets.live_filters('accordion',
					   filter_manager, gconf, hargs);
    filters.establish_display();

    // Add pre and post run spinner (borrow filter's for now).
    filter_manager.register('prerun', function(){
	filters.spin_up();
    });
    filter_manager.register('postrun', function(){
	filters.spin_down();
    });

    // Reset the UI; pull in and fix the GO term data.
    filter_manager.register('search', function(resp, manager){
	console.log('filter_manager search callback');

	// Empty matrix results.
	jQuery('#matrix_results').empty();
	jQuery('#progress-text').empty();
	jQuery('#progress-bar').empty();
	jQuery("#order-selector").hide();

	// Reset click.
	jQuery('#button').off();
	jQuery('#button').click(function(e){

	    // Trim.
	    //alert(jQuery('#input-terms').val());
	    var raw_text = jQuery('#input-terms').val();
	    raw_text = raw_text.replace(/^\s+/,'');
	    raw_text = raw_text.replace(/\s+$/,'');
	    var term_accs = raw_text.split(/\s+/); // split on any ws
	    
	    // Unique-ify, take first in order.
	    term_accs = us.uniq(term_accs);
	    
	    if( term_accs &&
	        term_accs.length > 0 &&
	        ! us.contains(term_accs, '') ){

		// Pass on.
		ll('Running: ' + bbop.dump(term_accs));
		jQuery('#matrix_results').empty();
		jQuery('#progress-text').empty();
		jQuery('#progress-bar').empty();
		jQuery("#order-selector").hide();
		
		TermInfoStage(term_accs);

	    }else{
		alert('Your input seems off: "' + term_accs + '"');
	    }
	});
    });

    filter_manager.search();

    // Let's start with this test.
    //GO:0043473 GO:0009987 GO:0022008
    //var term_accs = ['GO:0043473', 'GO:0009987', 'GO:0022008'];
    // Val's half example.
    //var term_accs = ['GO:0006310', 'GO:0006281', 'GO:0006260', 'GO:0030437', 'GO:0005975', 'GO:0007155', 'GO:0006520', 'GO:0070882', 'GO:0016568', 'GO:0051276', 'GO:0007059', 'GO:0051186', 'GO:0000747', 'GO:0000910', 'GO:0002181', 'GO:0007010', 'GO:0007163', 'GO:0006091', 'GO:0006629', 'GO:0016071', 'GO:0007126', 'GO:0007005', 'GO:0071941'];
    // Val's full example.
    //var term_accs = ['GO:0006310', 'GO:0006281', 'GO:0006260', 'GO:0030437', 'GO:0005975', 'GO:0007155', 'GO:0006520', 'GO:0070882', 'GO:0016568', 'GO:0051276', 'GO:0007059', 'GO:0051186', 'GO:0000747', 'GO:0000910', 'GO:0002181', 'GO:0007010', 'GO:0007163', 'GO:0006091', 'GO:0006629', 'GO:0016071', 'GO:0007126', 'GO:0007005', 'GO:0071941', 'GO:0055086', 'GO:0006913', 'GO:0007031', 'GO:0030163', 'GO:0006461', 'GO:0006457', 'GO:0006486', 'GO:0051604', 'GO:0070647', 'GO:0006605', 'GO:0007346', 'GO:0042254', 'GO:0023052', 'GO:0006399', 'GO:0006351', 'GO:0055085', 'GO:0007033', 'GO:0016192', 'GO:0006766'];

    //stage_01(term_accs);

    ll('Completed init!');    
}

// Get the information for the incoming terms, launch stage 02.
function TermInfoStage(term_accs){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM01: ' + str); }
    ll('');
    ll('Stage 01 start...');

    // Prep the progress bar and hide the order selector until we're
    // done.
    jQuery("#progress-text").empty();
    jQuery("#progress-text").append('<b>Loading...</b>');
    //jQuery("#progress-bar").empty();
    jQuery("#progress-widget").show();
    jQuery("#order-selector").hide();

    // Now, cycle though all of the terms to collect info on.
    ll('Gathering batch functions for term info...');
    var run_funs = [];
    var term_user_order = {};
    us.each(term_accs, function(r, r_i){

	// Remember the incoming order.
	term_user_order[r] = r_i;

	// Create runner function.
	run_funs.push(function(){

	    // Manager settings.
	    var go = _new_manager();
	    go.set_personality('ontology');
	    
    	    // Set the next query and go.
    	    go.set_id(r);
    	    return go.search();
	});
    });

    var term_info = {};
    // Fetch the data and grab the number we want.
    var accumulator_fun = function(resp){

	// Who was this?
	var qval = resp.parameter('q');
	var two_part = bbop.first_split(':', qval);
	var acc = bbop.dequote(two_part[1]);
	ll(' Looking at info for: ' + acc);
	term_info[acc] = {
	    id : acc,
	    name: acc,
	    source : 'n/a',
	    index : term_user_order[acc]
	};

	// Dig out names and the like.
	var doc = resp.get_doc(0);
	if( doc ){
	    term_info[acc]['name'] = doc['annotation_class_label'];
	    term_info[acc]['source'] = doc['source'];
	}

    };

    // The final function is the data renderer.
    var final_fun = function(){
	ll('Starting final in TermInfoStage...');
	ll(' term_info: ' + bbop.dump(term_info));
	TermDataStage(term_info, term_accs);
	ll('Completed TermInfoStage!');
    };

    // Create and run coordinating manager.
    var manager = _new_manager();
    manager.run_promise_functions(
	run_funs,
	accumulator_fun,
	final_fun,
	function(err){
	    alert(err.toString());
	});
}

// Get the term data, get it into the specified format, and launch
// stage 03.
function TermDataStage(term_info, term_accs){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM02: ' + str); }
    ll('');
    ll('TermDataStage start...');

    // The number of requests that we will make.
    var request_count = 0;
    var run_funs = [];

    // Now, cycle though all of the posible pairs of terms while setting
    // and unsetting the query filter on the manager.
    ll(' Gathering batch functions for term data...');
    // Different.
    var mixed_pairs = [];
    for(var v_i = 0; v_i < term_accs.length; v_i++){
	for(var h_i = 0; h_i < v_i; h_i++){

	    var v = term_accs[v_i];
	    var h = term_accs[h_i];
	    
	    mixed_pairs.push([v, h]);
	}
    }

    var filter_strs = _get_filters(filter_manager);
    console.log('pass filter state: ', filter_strs);

    us.each(mixed_pairs, function(pair){

	var v = pair[0];
	var h = pair[1];
	ll(' Setup search for: ' + v + ' and ' + h);

	// Code here will be ignored by JSHint, as we are defining
	// functions in a loop, which apparently is usually
	// naughty.
	/* jshint ignore:start */
	run_funs.push(function(){
	    
	    // Manager settings.
	    var go = _new_manager();
	    go.set_personality('bioentity');
	    go.add_query_filter('document_category', 'bioentity');
	    go.set_results_count(0); // we don't need any actual rows returned
	    go.set_facet_limit(0); // don't need any actual facets returned
	    //go.debug(false);
	    
	    // Stack on the filters from the filter box.
	    us.each(filter_strs, function(fas){
		go.add_query_filter_as_string(fas, []);
	    });

	    // Set the next query.
	    go.add_query_filter('isa_partof_closure', v);
	    go.add_query_filter('isa_partof_closure', h);
	    
	    return go.search();
	});
	/* jshint ignore:end */
	
	request_count++;
    });

    // Reflexive.
    us.each(term_accs, function(r){

	ll(' Setup reflexive search for: ' + r);

	// Code here will be ignored by JSHint, as we are defining
	// functions in a loop, which apparently is usually naughty.
	/* jshint ignore:start */
	run_funs.push(function(){

	    // Manager settings.
	    var go = _new_manager();
	    go.set_personality('bioentity');
	    go.add_query_filter('document_category', 'bioentity');
	    go.set_results_count(0); // we don't need any actual rows returned
	    go.set_facet_limit(0); // don't need any actual facets returned
	    //go.debug(false);
	    
	    // Stack on the filters from the filter box.
	    us.each(filter_strs, function(fas){
		go.add_query_filter_as_string(fas, []);
	    });

    	    // Set the next query.
    	    go.add_query_filter('isa_partof_closure', r);
	    
	    return go.search();
	});
	/* jshint ignore:end */
	
	request_count++;
    });

    // Now that we know how many requests we will make, initialize the
    // progress bar.
    jQuery("#progress-text").empty();
    jQuery("#progress-text").append('<b><span id="progress-count">0</span> of '+
				    request_count + '</b>');
    //jQuery("#progress-bar").empty();
    jQuery("#progress-bar").progressbar({ max: request_count });
    jQuery("#progress-widget").show();

    // Actually serially fetch the data.
    var seen_links = {};
    var max_count = 0;
    var requests_done = 0;
    // Fetch the data and grab the number we want.
    var accumulator_fun = function(resp){	

	// Update the bar.
	requests_done++;
	jQuery('#progress-bar').progressbar({ value: requests_done });
	jQuery("#progress-count").empty();
	jQuery("#progress-count").append(requests_done);

	// Count is easy.
	var count = resp.total_documents();
	if( count > max_count ){
	    max_count = count;
	}

	// Now let's try and fiqure out which terms we were looking
	// at...
	var fqs = resp.query_filters();
	console.log(resp);
	var fprops = fqs['isa_partof_closure'];

	var axes = [];
	us.each(fprops, function(fval, fkey){
	    axes.push(fkey);
	});	
	var axis1 = axes[0];
	var axis2 = axes[1] || axis1; // the reflexive case

	ll(' Data from: (' + axis1 + ', ' + axis2 + '); ' + count);

	// Structure for the links we've seen, level 1.
	if( typeof(seen_links[axis1]) === 'undefined' ){
	    seen_links[axis1] = {}; }
	if( typeof(seen_links[axis2]) === 'undefined' ){
	    seen_links[axis2] = {}; }
	// Mark the links we've seen, level 2.
	if( typeof(seen_links[axis2][axis1]) === 'undefined' ){
	    seen_links[axis2][axis1] = count; }
	if( typeof(seen_links[axis1][axis2]) === 'undefined' ){
	    seen_links[axis1][axis2] = count; }
    };

    // The final function is the data renderer.
    var final_fun = function(){
	ll('Starting final in TermDataStage...');

	// We're done, so hide the progress bar again and show the
	// order selector.
	jQuery('#progress-widget').hide();
	jQuery("#order-selector").show();

	// We want this to be fully defined at the end of the accumulator.
	var data = {
    	    graph: seen_links,
    	    nodes: [],
    	    links: []
	};

	// Now we map out term information into the same format as the
	// example.
	us.each(term_accs, function(acc){
	    var node = {
		'id': acc,
		'name': term_info[acc]['name'],
		'source': term_info[acc]['source'],
		'index': term_info[acc]['index']
	    };
	    data.nodes.push(node);
	});

	// Next, we put our link information into the same format as
	// the example.
	var already_done_links = {};
	us.each(seen_links, function(sub_data, sub){
	    us.each(sub_data, function(link_count, obj){

		// Only add links that we haven't yet.
		var li1 = sub + '_' + obj;
		var li2 = obj + '_' + sub;
		if( typeof(already_done_links[li1]) === 'undefined' ){
		    
		    // Add it to our done list. Either way
		    // we'll catch it.
		    already_done_links[li1] = true;
		    already_done_links[li2] = true;
		    
		    // Push the new link data.
		    var link = {
			'source': term_info[sub]['index'],
			'target': term_info[obj]['index'],
			'value': link_count
		    };
		    data.links.push(link);
		}
	    });
	});

	ll(' Seen links: ' + bbop.dump(seen_links));
	ll(' Data: ' + bbop.dump(data));
	ll(' Max count: ' + max_count);
	// //ll(h + ', ' + v + ': ' + count);
	// ll('accumulate: ' + axis1 + ', ' + axis2 + ': ' + count);

	ll('Completed TermDataStage!');
	RenderStage(data, max_count);
    };

    // Create and run coordinating manager.
    var manager = _new_manager();
    manager.run_promise_functions(
	run_funs,
	accumulator_fun,
	final_fun,
	function(err){
	    alert(err.toString());
	});
}

// Final stage: do the graphics and layout.
// Initial D3 code from: http://bost.ocks.org/mike/miserables/
function RenderStage(data, max_count){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM03: ' + str); }
    ll('Start RenderStage...');

    ///
    /// Setup the canvas and margin/header area.
    ///

    /// First the canvas sizing and layout.
    // Margins for writing the column/row header text.
    var margin = { top: 300, right: 0, bottom: 0, left: 300 };
    // Total width.
    var width = 800;
    var height = 800;
    
    var x = d3.scale.ordinal().rangeBands([0, width]);
    // var z = d3.scale.linear().domain([0, 4]).clamp(true);
    //var c = d3.scale.category10().domain(d3.range(10));
    //var c = d3.scale.category10().domain(d3.range(max_count));

    // A value from our values domain in to a color in our range.
    // 0 always maps to a white-ish color.
    var c = d3.scale.linear().domain([0,max_count]).rangeRound([127,255]);
    function value_to_color_dark(val){
	//var retval = '#efefef';
	var retval = '#fafafa';
	if( val !== 0 ){
	    var cval = c(val);
	    var cinv = 255 - cval;
	    var chex = cinv.toString(16);
	    if( cval ){
		if( chex.length === 1 ){ chex = '0' + chex; }
		retval = '#' + chex + chex + chex + '';
	    }
	}
	return retval;
    }
    function value_to_color_step(val){
	//var retval = '#efefef';
	var retval = '#fafafa';
	if( val !== 0 ){
	    // 1-3 = pale green
	    // 4-10 = yellow
	    // 11-100 = orange
	    // 101+ = red 
	    if( val <= 3 ){
		retval = '#79f853'; // green
	    }else if( val <= 10 ){
		//retval = '#f5ff2b'; // yellow
		retval = '#e8f129'; // yellow
	    }else if( val <= 100 ){
		retval = '#fd953b'; // orange		
	    }else{
		retval = '#ff4e53';
	    }
	}
	return retval;
    }
    
    // Decide our coloration live at this point.
    var value_to_color = value_to_color_dark; // default
    var curr_color_selection = jQuery("input:radio[name=color]:checked").val();
    if( curr_color_selection === 'dark' ){
	 value_to_color = value_to_color_dark;
    }else if( curr_color_selection === 'step' ){
	 value_to_color = value_to_color_step;
    }

    var svg = d3.select("#matrix_results").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", -margin.left + "px")
	.append("g")
	.attr("transform", "translate("+ margin.left +","+ margin.top +")");
    
    ///
    /// Final data calculations. 
    /// 

    // 
    var matrix = [];
    var nodes = data.nodes;
    var n = nodes.length;
    
    // Compute index per node.
    nodes.forEach(function(node, i) {
	//node.index = i;
	node.count = 0;
	matrix[i] = d3.range(n).map(
	    function(j) {
		return {x: j, y: i, z: 0};
	    });
    });
    
    // TODO: Is this bit necessary?
    // Convert links to matrix; count character occurrences.
    data.links.forEach(function(link) {
	var s_index = link.source;
	var t_index = link.target;
	var sid = nodes[s_index]['id'];
	var tid = nodes[t_index]['id'];
	// Matrix fill.
    	matrix[link.source][link.target].z = data.graph[sid][tid] || 0;
    	matrix[link.target][link.source].z = data.graph[tid][sid] || 0;
    	matrix[link.source][link.source].z = data.graph[sid][sid] || 0;
    	matrix[link.target][link.target].z = data.graph[tid][tid] || 0;
	// Tally the per-node count.
    	nodes[link.source].count += link.value || 0;
    	nodes[link.target].count += link.value || 0;
    });
    
    ll('Nodes: ' + bbop.dump(nodes));
    ll('Matrix: ' + bbop.dump(matrix));

    ///
    /// The ordering profiles.
    ///
    
    // Precompute the orders.
    var orders = {
	name: d3.range(n).sort(function(a, b) {
	    return d3.ascending(nodes[a].name, nodes[b].name);
	}),
	source: d3.range(n).sort(function(a, b) {
	    return d3.ascending(nodes[a].source, nodes[b].source);
	}),
	id: d3.range(n).sort(function(a, b) {
	    return d3.descending(nodes[a].id, nodes[b].id);
	}),
	count: d3.range(n).sort(function(a, b) {
	    return nodes[b].count - nodes[a].count;
	}),
	index: d3.range(n).sort(function(a, b) {
	    //return nodes[b].index - nodes[a].index;
	    return nodes[a].index - nodes[b].index;
	})
    };
    
    // The default sort order.
    x.domain(orders.index);
    
    // Attach the off-color background.
    svg.append("rect")
	//.attr("class", "background")
	//.attr("style", "fill: #eeeeee;")
	.attr("style", "fill: #ffffff;")
	.attr("width", width)
	.attr("height", height);
    
    // For each of the row headers, translate them by a certain
    // amount, color, etc.
    var row = svg.selectAll(".row")
	.data(matrix)
	.enter().append("g")
	//.attr("style", "fill: #ff0000;")
	.attr("class", "row") // mark with class for later reference
	.attr("transform", function(d, i) {
	    return "translate(0," + x(i) + ")";
	})
	.each(row_fun);
    
    // ???: Unfamiliar properties.
    row.append("line")
	.attr("x2", width);
    
    // Add row header text.
    row.append("text")
	.attr("x", -6)
	.attr("y", x.rangeBand() / 2)
	.attr("dy", ".30em")
	.attr("text-anchor", "end")
	.text(function(d, i) {
	    return nodes[i].name + ' (' + nodes[i].id + ')';
	});
    
    // For each of the column headers, translate them by a certain
    // amount, color, etc.
    var column = svg.selectAll(".column")
	.data(matrix)
	.enter().append("g")
	//.attr("style", "fill: #00ff00;")
	.attr("class", "column") // mark with class for later reference
	.attr("transform", function(d, i) {
	    return "translate(" + x(i) + ")rotate(-90)";
	});
    
    // ???: Unfamiliar properties.
    column.append("line")
    	.attr("x1", -width);
    
    // Add column header text.
    column.append("text")
	.attr("x", 6)
	.attr("y", x.rangeBand() / 2)
	.attr("dy", ".30em")
	.attr("text-anchor", "start")
	.text(function(d, i) {
	    return nodes[i].name + ' (' + nodes[i].id + ')';
	});

    // Make sure the tha info dialog follows the mouse.
    // Using jQuery so we get a continuous event stream (necessary for
    // proper hover following).
    jQuery(document).mousemove(function(event) {
	
	if( jQuery("#info").is(":visible") ){
	    
	    var pre_x = event.pageX;
	    var pre_y = event.pageY;
	    
	    var xpos = pre_x + 10;
	    var ypos = pre_y + 10;
	    
	    jQuery("#info").css('left', xpos);
	    jQuery("#info").css('top', ypos);
	}
    });
    
    function mouseover(p) {

	// Grab the shared bioentity count value.
    	var sac = matrix[p.x][p.y].z;

	// Map order to node object.
	var xn = nodes[p.x];
	var yn = nodes[p.y];

	// Update the hovering info box.
	jQuery("#info").empty();
	jQuery("#info").append("<b>" + yn.name + "</b> (" + yn.id + ")");
	jQuery("#info").append("<br />");
	jQuery("#info").append("<b>" + xn.name + "</b> (" + xn.id + ")");
	jQuery("#info").append("<br />");
	jQuery("#info").append("SBC: <b>" + sac + "</b>");
	jQuery("#info").show();

	var thing = d3.select(this);
	thing.style('fill', "red");

	//ll("mouse over: (" + p.x + ', ' + p.y + '): ' + thing);

	// Old class-based code.
	// //d3.selectAll(".row text").classed("active",
	// d3.selectAll(".row text").classed("light-cell",
	// 				  function(d, i) {
	// 				      return i == p.y;
	// 				  });
	// d3.selectAll(".column text").classed("active",
	// 				     function(d, i) {
	// 					 return i == p.x;
	// 				     });
    }
    
    function mouseout(p) {

	// First, get rid of the old info box.
	jQuery("#info").hide();

	// Now take the color back to where is should be by
	// recalculating it.
	var mval = matrix[p.x][p.y].z;
	var clr = value_to_color(mval);
	var thing = d3.select(this);
	thing.style('fill', clr);

	// Old class-based code.
	//d3.selectAll("text").classed("active", false);
    }

    function clickcell(p) {

	// Grab the shared bioentity count value.
    	var sac = matrix[p.x][p.y].z;

	// Map order to node object.
	var xn = nodes[p.x];
	var yn = nodes[p.y];

	// Add a link to the bioentity search.
	var bio_man = _new_manager();

	// Stack on the filters from the filter box.
	var filter_strs = _get_filters(filter_manager);
	us.each(filter_strs, function(fas){
	    bio_man.add_query_filter_as_string(fas, []);
	});

	// Add the current cell's ids.
	var ids = us.uniq([xn.id, yn.id]);
	us.each(ids, function(v){
	    bio_man.add_query_filter('isa_partof_closure', v);
	});

	// Produce final URL.
	var lstate = bio_man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'bioentity');

	var kick = [
	    '<h4>Cell operations</h4>',
	    '<p>Pair-wise bioentity search <a class="btn btn-primary" href="' + lurl + '" target="_blank"><b>Open</b></a></p>'];

	//alert(kick);
	widgets.display.dialog(kick.join(' '), {width: 400});

    }
    
    // Working:    
    //  function row_fun(in_row) {
    // 	var cell = d3.select(this).selectAll(".cell")
    // 	    // .data(in_row.filter(
    // 	    // 	      function(d) {
    // 	    // 		  return d.z;
    // 	    // 	      }))
    // 	    .data(in_row)
    // 	    .enter().append("rect")
    // 	    //.attr("style", "fill: #ff00ff")
    // 	    .attr("class", "cell") // tag as cell with class for later ref
    // 	    .attr("x",
    // 		  function(d) {
    // 		      return x(d.x);
    // 		  })
    // 	    .attr("width", x.rangeBand())
    // 	    .attr("height", x.rangeBand())
    // 	    // .style("fill-opacity",
    // 	    // 	   function(d) {
    // 	    // 	       return z(d.z);
    // 	    // 	   })
    // 	    .style("fill",
    // 		   function(d) {
    // 		       var mval = matrix[d.x][d.y].z;
    // 		       var retcolor = value_to_color(mval);
    // 		       return retcolor;
    // 		   })
    // 	    // .append("text")
    // 	    // .attr("x",
    // 	    // 	  function(d) {
    // 	    // 	      return x(d.x);
    // 	    // 	  })
    // 	    // .attr("y", x.rangeBand() / 2)
    // 	    // .attr("dy", ".30em")
    // 	    // .attr("text-anchor", "end")
    // 	    // .text(function(d, i) {
    // 	    // 	      return '(' + matrix[d.x][d.y].z + ')';
    // 	    // 	  })
    // 	    .on("mouseover", mouseover)
    // 	    .on("mouseout", mouseout);
    // }
    
    function row_fun(in_row) {

	// Create container cells.
	var rows = d3.select(this).selectAll(".cell")
	    .data(in_row).enter()
	    .append("g")
	    .attr("class", "cell"); // tag as cell with class for later ref
	    // .attr("x",
	    // 	  function(d) {
	    // 	      return x(d.x);
	    // 	  });

	// WARNING: This next bit is so not thread safe it's funny.
	// Get the width of a cell in this case.
	var cw = x.rangeBand(); // essentially a constant
	// Add text.
	d3.select(this).selectAll(".cell")
	    .append("text")
	    .text(function(d, i) {

		      var final_str = '';
		      var val_holder = matrix[d.x][d.y].z;
		      if( val_holder !== 0 ){
			  // Make the string we'll use.
			  final_str = '' + val_holder + '';
		      }

		      // Now also calculate some text scaling.
		      // WARNING: Guessing at 1em =~ 10px.
		      var text_scale = '14';
		      var fs_len = final_str.length;
		      //ll('out: ' + fs_len + ', ' + cw);
		      if( fs_len > 1 && (cw / 10.0) < fs_len ){
			  var tmp_size = (cw / 10.0) / (fs_len * 1.0);
			  text_scale = 
			      Math.floor(text_scale * tmp_size);
			  matrix[d.x][d.y].font_size = text_scale;
		      }

		      ll('fs: ' + final_str +
			 ' (' + text_scale + ' over ' + cw + ')');
	    	      return final_str;
		  })
	    .attr("class", "cell") // tag as cell with class for later ref
	    .attr("x", function(d) {
	    	return x(d.x);
	    })
	    // .attr("y",
	    // 	  function(d) {
	    // 	      return x(d.x);
	    // 	  })
	    .attr("dy", "1em")
	    .attr("font-size", function(d) {
		// WARNING: This works, but saving the value in
		// a higher scope did not--I can't imagine what
		// this all folds out to...
	    	return matrix[d.x][d.y].font_size;
	    })
	    .attr("text-anchor", "beginning"); // middle, end

	// Add colored squares.
	d3.select(this).selectAll(".cell")
	    .append("rect")
	    .attr("class", "cell") // tag as cell with class for later ref
	    .attr("x", function(d) {
	    	return x(d.x);
	    })
	    .attr("width", cw)
	    .attr("height", cw)
	    .style("fill", function(d) {
		var mval = matrix[d.x][d.y].z;
		var retcolor = value_to_color(mval);
		return retcolor;
	    })
    	    .style("fill-opacity", "0.50")
	    .on("mouseover", mouseover)
	    .on("mouseout", mouseout)
	    .on("click", clickcell);

    }
    
    function order(value) {

	ll('Reordering: ' + value);

	x.domain(orders[value]);
	
	var t = svg.transition().duration(2500);
	
	t.selectAll(".row")
	    .delay(function(d, i) { return x(i) * 4; })
	    .attr("transform", function(d, i) {
		return "translate(0," + x(i) + ")";
	    })
	    .selectAll(".cell")
	    .delay(function(d) { return x(d.x) * 4; })
	    .attr("x", function(d) { return x(d.x); });
	
	t.selectAll(".column")
	    .delay(function(d, i) { return x(i) * 4; })
	    .attr("transform", function(d, i) {
		return "translate(" + x(i) + ")rotate(-90)";
	    });
    }
    
    d3.select("#order").on("change", function() {
	//clearTimeout(timeout);
	order(this.value);
    });
    
    // var timeout = setTimeout(
    //     function() {
    // 	order("source");
    // 	d3.select("#order").property("selectedIndex", 2).node().focus();
    //     }, 5000);
    
    ///
    /// End the section from the example.
    ///	
    ll('Completed RenderStage!');
    ll('Done!');
}

///
///
///

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){
	MatrixUIInit();
    });
})();
