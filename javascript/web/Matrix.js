////
//// Experiment in D3 JS; no cart like in NMatrix.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global d3 */
/* global Plotly */

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
    var personality = 'bioentity_for_browser';
    var confc = gconf.get_class(personality);
    filter_manager = _new_manager();
    filter_manager.set_personality(personality);
    filter_manager.add_query_filter('document_category',
				    confc.document_category(), ['*']);
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
    ll('TermInfoStage start...');

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
	//console.log(resp);
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
	PlotStage(data, max_count);
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


function PlotStage(collected_info, max_count){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSMX: ' + str); }
    ll('PlotStage start...');

    ///
    /// Variables.
    ///

    // Collect a map of node names to node ids.
    var name_to_id = {};
    var id_to_name = {};
    us.each(collected_info.nodes, function(node){
	name_to_id[node.name] = node.id;
	id_to_name[node.id] = node.name;
    });

    // Generate annotations for all non-zero counts.
    var anns = [];
    us.each(collected_info.graph, function(val1, key1){
	us.each(val1, function(val2, key2){

	    var name1 = id_to_name[key1];
	    var name2 = id_to_name[key2];
	    var val = val2;
	    
	    if( val !== 0 ){
		anns.push({
		    x: name2,
		    y: name1,
		    xref: 'x',
		    yref: 'y',
		    text: val,
		    showarrow: false,
		    // arrowhead: 7,
		    ax: 0,
		    ay: 0
		});
	    }
	});
    });
    
    // Invariant layout data.
    var layout = {
	title: 'Pair-wise co-annotation comparison',
	hightlight: true,
	xaxis: {
	    tickfont: {
		// 12, 10 too big; 9 okay right now
		size: 10
	    }
	},
        yaxis: {
	    tickangle: 45,
	    tickfont: {
		// 12, 10 too big; 9 okay right now
		size: 10
	    }
	},
	annotations: anns,
	margin: {
	    //pad:0,
	    //autoexpand:true,
	    //t:100,
	    l:150,
	    //r:80,
	    b:100
	}
    };

    ///
    /// Calculate possible orderings that we'll use.
    ///

    // Precompute the possible orderings.
    var graph = collected_info.graph;
    var nodes = collected_info.nodes;
    var node_count = collected_info.nodes.length;
    var all_orders = {
	name: d3.range(node_count).sort(function(a, b) {
	    return d3.ascending(nodes[a].name, nodes[b].name);
	}),
	source: d3.range(node_count).sort(function(a, b) {
	    return d3.ascending(nodes[a].source, nodes[b].source);
	}),
	// id: d3.range(node_count).sort(function(a, b) {
	//     return d3.descending(nodes[a].id, nodes[b].id);
	// }),
	count: d3.range(node_count).sort(function(a, b) {
	    var aid = nodes[a].id;
	    var bid = nodes[b].id;
	    return graph[bid][bid] - graph[aid][aid];
	}),
	index: d3.range(node_count).sort(function(a, b) {
	    //return nodes[b].index - nodes[a].index;
	    return nodes[a].index - nodes[b].index;
	})
    };

    ///
    /// Colors
    ///

    // Collect all extant color points.
    var values = [];    
    us.each(collected_info.links, function(link){
	values.push(link.value);
    });
    values = us.uniq(values);
    values = values.sort(function(a,b){ return a-b; });
    console.log('color values', values);

    // Create stepped color space, starting at 0.
    var step_colorscale = [];
    var value_to_fold = function(val){
	var ret = 0;
	if( val !== 0 ){
	    ret = val/max_count;
	}
	console.log('v2f: ', val + '->' + ret);
	return ret;
    };
    // Generate absolute colorscale.
    function value_to_color_step(val){
	//var retval = '#fafafa';
	var retval = 'rgb(250,250,250)';
	if( val !== 0 ){
	    // 1-3 = pale green
	    // 4-10 = yellow
	    // 11-100 = orange
	    // 101+ = red 
	    if( val <= 3 ){
		//retval = '#79f853'; // green
		retval = 'rgb(121,248,83)';
	    }else if( val <= 10 ){
		//retval = '#e8f129'; // yellow
		retval = 'rgb(232,241,41)';
	    }else if( val <= 100 ){
		//retval = '#fd953b'; // orange		
		retval = 'rgb(253,149,59)';
	    }else{
		//retval = '#ff4e53';
		retval = 'rgb(255,78,83)';
	    }
	}
	console.log('v2c: ', val + '->' + retval);
	return retval;
    }    
    us.each(values, function(cval, index){
	step_colorscale.push([
	    value_to_fold(cval),
	    value_to_color_step(cval)
	]);
    });

    // Default to a white 0 and slide from red to blue.
    var default_colorscale = [
	[0, 'rgb(250,250,250)'],
	[0.00000000001, 'rgb(0,0,255)'], // from non-0
	// [0.2, 'rgb(254,224,210)'],
	[1, 'rgb(255,0,0)']
    ];
    
    // Decide our coloration live at this point.
    var colorscale_to_use = default_colorscale;
    var curr_color_selection = jQuery("input:radio[name=color]:checked").val();
    if( curr_color_selection === 'heatmap' ){
	// Pass, it is default.
    }else if( curr_color_selection === 'step' ){
	colorscale_to_use = step_colorscale;
    }

    console.log('colorscale', colorscale_to_use);

    ///
    /// Main function to create the appropriate traces and other
    /// information given an ordering (a list of default positions).
    ///

    // ...
    function _generate_traces_with_order(new_order){

	// Axes vars.
	var x_axis_id = [];
	var x_axis_lbl = [];
	var y_axis_id = [];
	var y_axis_lbl = [];
	// Traces and additional embedded hover text vars.
	var rows = [];
	var text_rows = [];

	// Iterate over the mapped index, using the node order in data
	// as the reference.	
	// Axis mapping.
	us.each(new_order, function(mapped_index, true_index){

	    var mapped_node = collected_info.nodes[mapped_index];

	    console.log('mapped_index', mapped_index);
	    console.log('mapped_node', mapped_node);

	    x_axis_id.push(mapped_node.id);
	    x_axis_lbl.push(mapped_node.name);
	    y_axis_id.unshift(mapped_node.id);
	    y_axis_lbl.unshift(mapped_node.name);

	});

	// going over mapped index, gather traces and additional
	// embedded hover text.
	us.each(x_axis_id, function(idx){
	    var frame = [];
	    var text_frame = [];
	    us.each(y_axis_id, function(idy){
		frame.unshift(collected_info.graph[idx][idy]);
		text_frame.unshift('(' + idx + ',' + idy + ')');
	    });
	    rows.unshift(frame);
	    text_rows.unshift(text_frame);
	});

	return {
	    z: rows,
	    // mode: 'lines+markers+text',
	    text: text_rows,
	    x: x_axis_lbl,
	    y: y_axis_lbl,
	    colorscale: colorscale_to_use,
	    type: 'heatmap',
	};
    }

    ///
    /// Initial runner.
    ///

    // Get the default order.
    var order = all_orders.index;

    console.log('all_orders', all_orders);
    console.log('order', order);
    //console.log(collected_info);

    jQuery("#initial_placeholder").hide();

    // Initial call.
    var data_to_render = [_generate_traces_with_order(order)];
    Plotly.newPlot('matrix_plot', data_to_render, layout);

    ///
    /// Additional events.
    ///

    // Capture for use in various events.
    var plot_obj = document.getElementById('matrix_plot');

    // Re-draw on change.
    d3.select("#plot_order").on("change", function() {

	var new_order = all_orders[this.value];
	console.log('selected order value', '"' + this.value + '"');
	console.log('new_order', new_order);

	// Make mods.
	var data_to_re_render = [_generate_traces_with_order(new_order)];
	plot_obj.data = data_to_re_render;

	// Redraw.
	Plotly.redraw(plot_obj);
	//Plotly.plot(plot_obj);

    });

    // On click, display pop-up with all sorts of goodies.
    plot_obj.on('plotly_click', function(click_data){

	// console.log('vvv');
	// console.log(data);
	// console.log('^^^');
	// var infotext = data.points.map(function(d){
	//     return ('x= '+d.x+', y= '+d.y);
	// });
	// alert(infotext);
	var d = click_data.points[0];
	var xid = name_to_id[d.x];
	var yid = name_to_id[d.y];

	// Grab the shared bioentity count value.
    	var sbc = collected_info.graph[xid][yid];

	// Add a link to the bioentity search.
	var bio_man = _new_manager();

	// Stack on the filters from the filter box.
	var filter_strs = _get_filters(filter_manager);
	us.each(filter_strs, function(fas){
	    bio_man.add_query_filter_as_string(fas, []);
	});

	// Add the current cell's ids.
	var ids = us.uniq([xid, yid]);
	us.each(ids, function(v){
	    bio_man.add_query_filter('isa_partof_closure', v);
	});

	// Produce final URL.
	var lstate = bio_man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'bioentity');

	var kick = [
	    '<ul class="list-unstyled">',
	    '<li>',
	    'x: <b>' + d.x + '</b> (' + xid + ')',
	    '</li>',
	    '<li>',
	    'y: <b>' + d.y + '</b> (' + yid + ')',
	    '</li>',
	    '<li>',
	    'SBC: <b>' + sbc + '</b>',
	    '</li>',
	    '<li>',
	    'Pair-wise bioentity search <a class="btn btn-primary" href="' + lurl + '" target="_blank"><b>Open</b></a>',
	    '</li>',
	'</ul>'];
	widgets.display.dialog(kick.join(' '),
			       {title: 'Cell information', width: 500});

    });
	// .on('plotly_hover', function(data){
	//     var infotext = data.points.map(function(d){
	// 	return ('x= '+d.x+', y= '+d.y);
	//     });
	
	//     hover_info.innerHTML = infotext.join('');
	// })
	// .on('plotly_unhover', function(data){
	//     hover_info.innerHTML = '';
	// });

    ll('Completed PlotStage!');
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
