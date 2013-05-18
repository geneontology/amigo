////
//// Experiment in D3 JS; no cart like in NMatrix.
////

// TODO: Interact with the user, launch stage 01.
function MatrixInit(){

    // First things first, let's hide the nasty flying divs...
    jQuery("#info").hide();
    jQuery("#progress-widget").hide();
    jQuery("#order-selector").hide();

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM: ' + str); }
    ll('');
    ll('MatrixInit start...');

    // Pull in and fix the GO term data.
    jQuery('#button').click(
	function(e){
	    //alert(jQuery('#input-terms').val());
	    var raw_text = jQuery('#input-terms').val();
	    raw_text = raw_text.replace(/^\s+/,'');
	    raw_text = raw_text.replace(/\s+$/,'');
	    var term_accs = raw_text.split(/\s+/); // split on any ws
	    ll('Running: ' + bbop.core.dump(term_accs));
	    jQuery('#matrix_results').empty();
	    stage_01(term_accs);
	});

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
function stage_01(term_accs){

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
    jQuery("#order-selector").hide();

    // Next, setup the manager environment.
    ll('Setting up manager.');
    var server_meta = new amigo.data.server();
    var gloc = server_meta.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(gloc, gconf);
    go.set_personality('bbop_ont');
    //go.debug(false);

    // Now, cycle though all of the terms to collect info on.
    ll('Gathering batch URLs for term data...');
    var term_user_order = {};
    for(var r_i = 0; r_i < term_accs.length; r_i++){
    	var r = term_accs[r_i];	
    	// Set the next query.
    	go.reset_query_filters(); // reset from the last iteration
    	go.set_id(r);
    	go.add_to_batch();
	term_user_order[r] = r_i;
    }

    var term_info = {};
    // Fetch the data and grab the number we want.
    var accumulator_fun = function(resp){	
	// Who was this?
	var qval = resp.parameter('q');
	var two_part = bbop.core.first_split(':', qval);
	var acc = bbop.core.dequote(two_part[1]);
	ll('Looking at info for: ' + acc);
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
	ll('Starting final in stage 01...');

	ll('term_info: ' + dump(term_info));
	stage_02(term_info, term_accs);

	ll('Completed stage 01!');
    };
    go.run_batch(accumulator_fun, final_fun);

}

// Get the joint data, get it into the specified format, and launch
// stage 03.
function stage_02(term_info, term_accs){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM02: ' + str); }
    ll('');
    ll('Stage 02 start...');

    // Helpers.
    var each = bbop.core.each;
    var dump = bbop.core.dump;

    // Get the data that we want.
    // A variation on BBOP JS's shared_annotation_count.js.

    // Before we start, decide our taxon.
    var taxon_filter = null; // default to no filter
    var curr_taxon_selection = jQuery("input:radio[name=taxon]:checked").val();
    if( curr_taxon_selection == 'pombe' ){
        // "taxon":"NCBITaxon:4896",
        // "taxon_label":"Schizosaccharomyces pombe",
	 taxon_filter = "NCBITaxon:4896";
    }

    // Next, setup the manager environment.
    ll('Setting up manager.');
    var server_meta = new amigo.data.server();
    var gloc = server_meta.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(gloc, gconf);
    //go.add_query_filter('document_category', 'annotation', ['*']);
    go.add_query_filter('document_category', 'bioentity', ['*']);
    if( taxon_filter ){	go.add_query_filter('taxon', taxon_filter, ['*']); }
    go.set_personality('bbop_ann');
    go.set('rows', 1); // we don't need any actual rows returned
    go.set_facet_limit(0); // we don't need any actual facets returned
    //go.debug(false);

    // The number of requests that we will make.
    var request_count = 0;

    // Now, cycle though all of the posible pairs of terms while setting
    // and unsetting the query filter on the manager.
    ll('Gathering batch URLs and simple term data...');
    // Different.
    for(var v_i = 0; v_i < term_accs.length; v_i++){
	for(var h_i = 0; h_i < v_i; h_i++){

	    var v = term_accs[v_i];
	    var h = term_accs[h_i];
	    
	    // Set the next query.
	    go.reset_query_filters(); // reset from the last iteration
	    go.add_query_filter('isa_partof_closure', v);
	    go.add_query_filter('isa_partof_closure', h);
	    go.add_to_batch();

	    request_count++;
	}
    }
    // Reflexive.
    for(var r_i = 0; r_i < term_accs.length; r_i++){
    	var r = term_accs[r_i];
	
    	// Set the next query.
    	go.reset_query_filters(); // reset from the last iteration
    	go.add_query_filter('isa_partof_closure', r);
    	go.add_to_batch();

	request_count++;
    }

    // Now that we know how many requests we will make, initialize the
    // progress bar.
    jQuery("#progress-text").empty();
    jQuery("#progress-text").append('<b><span id="progress-count">0</span> of '
				    + request_count + '</b>');
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
	var fprops = fqs['isa_partof_closure'];

	var axes = [];
	each(fprops,
	     function(fkey, fval){
		 axes.push(fkey);
	     });	
	var axis1 = axes[0];
	var axis2 = axes[1] || axis1; // the reflexive case

	// Structure for the links we've seen, level 1.
	if( ! bbop.core.is_defined(seen_links[axis1]) ){
	    seen_links[axis1] = {}; }
	if( ! bbop.core.is_defined(seen_links[axis2]) ){
	    seen_links[axis2] = {}; }
	// Mark the links we've seen, level 2.
	if( ! bbop.core.is_defined(seen_links[axis2][axis1]) ){
	    seen_links[axis2][axis1] = count; }
	if( ! bbop.core.is_defined(seen_links[axis1][axis2]) ){
	    seen_links[axis1][axis2] = count; }
    };

    // The final function is the data renderer.
    var final_fun = function(){
	ll('Starting final in stage 02...');

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
	each(term_accs,
	     function(acc){
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
	each(seen_links,
	     function(sub, sub_data){
		 each(sub_data,
		      function(obj, link_count){

			  // Only add links that we haven't yet.
			  var li1 = sub + '_' + obj;
			  var li2 = obj + '_' + sub;
			  if( ! bbop.core.is_defined(already_done_links[li1]) ){

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

	ll('Seen links: ' + dump(seen_links));
	ll('Data: ' + dump(data));
	ll('Max count: ' + max_count);
	// //ll(h + ', ' + v + ': ' + count);
	// ll('accumulate: ' + axis1 + ', ' + axis2 + ': ' + count);

	ll('Completed stage 02!');
	stage_03(data, max_count);
    };
    go.run_batch(accumulator_fun, final_fun);

}

// Final stage: do the graphics and layout.
// Initial D3 code from: http://bost.ocks.org/mike/miserables/
function stage_03 (data, max_count){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM03: ' + str); }
    ll('');
    ll('Stage 03 start...');

    // Helpers.
    var each = bbop.core.each;
    var dump = bbop.core.dump;

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
	if( val != 0 ){
	    var cval = c(val);
	    var cinv = 255 - cval;
	    var chex = cinv.toString(16);
	    if( cval ){
		if( chex.length == 1 ){ chex = '0' + chex; }
		retval = '#' + chex + chex + chex + '';
	    }
	}
	return retval;
    }
    function value_to_color_step(val){
	//var retval = '#efefef';
	var retval = '#fafafa';
	if( val != 0 ){
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
    if( curr_color_selection == 'dark' ){
	 value_to_color = value_to_color_dark;
    }else if( curr_color_selection == 'step' ){
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
    nodes.forEach(
	function(node, i) {
	    //node.index = i;
	    node.count = 0;
	    matrix[i] = d3.range(n).map(
		function(j) {
		    return {x: j, y: i, z: 0};
		});
	});
    
    // TODO: Is this bit necessary?
    // Convert links to matrix; count character occurrences.
    data.links.forEach(
    	function(link) {
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
    
    ll('Nodes: ' + dump(nodes));
    ll('Matrix: ' + dump(matrix));

    ///
    /// The ordering profiles.
    ///
    
    // Precompute the orders.
    var orders = {
	name: d3.range(n).sort(
	    function(a, b) {
		return d3.ascending(nodes[a].name, nodes[b].name);
	    }),
	source: d3.range(n).sort(
	    function(a, b) {
		return d3.ascending(nodes[a].source, nodes[b].source);
	    }),
	id: d3.range(n).sort(
	    function(a, b) {
		return d3.descending(nodes[a].id, nodes[b].id);
	    }),
	count: d3.range(n).sort(
	    function(a, b) {
		return nodes[b].count - nodes[a].count;
	    }),
	index: d3.range(n).sort(
	    function(a, b) {
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
	.attr("transform",
	      function(d, i) {
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
	.attr("transform",
	      function(d, i) {
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
    jQuery(document).mousemove(
	function(event) {
	    
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

	// Grab the shared annotation value.
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
	jQuery("#info").append("SAC: <b>" + sac + "</b>");
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
		      if( val_holder != 0 ){
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
	    .attr("x",
	    	  function(d) {
	    	      return x(d.x);
	    	  })
	    // .attr("y",
	    // 	  function(d) {
	    // 	      return x(d.x);
	    // 	  })
	    .attr("dy", "1em")
	    .attr("font-size",
	    	  function(d) {
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
	    .attr("x",
	    	  function(d) {
	    	      return x(d.x);
	    	  })
	    .attr("width", cw)
	    .attr("height", cw)
	    .style("fill",
		   function(d) {
		       var mval = matrix[d.x][d.y].z;
		       var retcolor = value_to_color(mval);
		       return retcolor;
		   })
    	    .style("fill-opacity", "0.50")
	    .on("mouseover", mouseover)
	    .on("mouseout", mouseout);

    }
    
    function order(value) {

	ll('Reordering: ' + value);

	x.domain(orders[value]);
	
	var t = svg.transition().duration(2500);
	
	t.selectAll(".row")
	    .delay(function(d, i) { return x(i) * 4; })
	    .attr("transform",
		  function(d, i) {
		      return "translate(0," + x(i) + ")";
		  })
	    .selectAll(".cell")
	    .delay(function(d) { return x(d.x) * 4; })
	    .attr("x", function(d) { return x(d.x); });
	
	t.selectAll(".column")
	    .delay(function(d, i) { return x(i) * 4; })
	    .attr("transform",
		  function(d, i) {
		      return "translate(" + x(i) + ")rotate(-90)";
		  });
    }
    
    d3.select("#order").on("change",
			   function() {
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
    ll('Completed stage 03!');
    ll('Done!');
}
