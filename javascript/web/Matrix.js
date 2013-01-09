////
//// Experiment in D3 JS; no cart like in NMatrix.
////

// Get the layout done and request ws info.
function MatrixInit(){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM: ' + str); }
    ll('');
    ll('MatrixInit start...');

    // Helpers.
    var each = bbop.core.each;
    var dump = bbop.core.dump;

    // Get the data that we want.
    // A variation on BBOP JS's shared_annotation_count.js.

    // Let's start with this test.
    var term_accs = ['GO:0043473', 'GO:0009987', 'GO:0022008'];

    // Next, setup the manager environment.
    ll('Setting up manager.');
    var server_meta = new amigo.data.server();
    var gloc = server_meta.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(gloc, gconf);
    go.add_query_filter('document_category', 'annotation', ['*']);
    go.set_personality('bbop_ann');
    //go.debug(false);

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
	}
    }
    // // Reflexive.
    // for(var r_i = 0; r_i < term_accs.length; r_i++){
    // 	var r = term_accs[r_i];
	
    // 	// Set the next query.
    // 	go.reset_query_filters(); // reset from the last iteration
    // 	go.add_query_filter('isa_partof_closure', r);
    // 	go.add_to_batch();
    // }

    // Actually serially fetch the data.
    var seen_nodes = {};
    var seen_links = {};
    var accumulator_fun = function(json_resp){	
	// Fetch the data and grab the number we want.
	var resp = new bbop.golr.response(json_resp);

	// Count is easy.
	var count = resp.total_documents();

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

	// Mark the nodes we've seen.
	if( ! bbop.core.is_defined(seen_nodes[axis1]) ){
	    seen_nodes[axis1] = true; }
	if( ! bbop.core.is_defined(seen_nodes[axis2]) ){
	    seen_nodes[axis2] = true; }

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
	ll('Starting final...');

	// We want this to be fully defined at the end of the accumulator.
	var data = {
    	    nodes: [],
    	    links: []
	};

	// Now we put our node information into the same format as the
	// example.
	var starting_node_index_lookup = {};
	var starting_node_index = 0;
	each(seen_nodes,
	     function(acc){
		 // Get some node info.
		 var node = {
		     'id': acc,
		     'name': acc,
		     'group': 0,
		     'index': starting_node_index
		 };
		 data.nodes.push(node);
		 starting_node_index_lookup[acc] = starting_node_index;
		 starting_node_index++;
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
				  'source': starting_node_index_lookup[sub],
				  'target': starting_node_index_lookup[obj],
				  'value': link_count
			      };
			      data.links.push(link);
			  }
		      });
	     });


	ll('Seen nodes: ' + dump(seen_nodes));
	ll('Seen links: ' + dump(seen_links));
	ll('Data: ' + dump(data));
	// //ll(h + ', ' + v + ': ' + count);
	// ll('accumulate: ' + axis1 + ', ' + axis2 + ': ' + count);

	///
	/// D3 code from: http://bost.ocks.org/mike/miserables/
	///

	/// First the canvas sizing and layout.
	var margin = {top: 80, right: 0, bottom: 10, left: 80};
	var width = 720;
	var height = 720;

	var x = d3.scale.ordinal().rangeBands([0, width]);
	var z = d3.scale.linear().domain([0, 4]).clamp(true);
	var c = d3.scale.category10().domain(d3.range(10));

	var svg = d3.select("#matrix_results").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .style("margin-left", -margin.left + "px")
	    .append("g")
	    .attr("transform", "translate("+ margin.left +","+ margin.top +")");

	// 
	var matrix = [];
	var nodes = data.nodes;
	var n = nodes.length;

	// Compute index per node.
	nodes.forEach(
	    function(node, i) {
		node.index = i;
		node.count = 0;
		matrix[i] = d3.range(n).map(
		    function(j) {
			return {x: j, y: i, z: 0};
		    });
	    });
	
	// Convert links to matrix; count character occurrences.
	data.links.forEach(
	    function(link) {
		matrix[link.source][link.target].z += link.value;
		matrix[link.target][link.source].z += link.value;
		matrix[link.source][link.source].z += link.value;
		matrix[link.target][link.target].z += link.value;
		nodes[link.source].count += link.value;
		nodes[link.target].count += link.value;
	    });

	ll('Nodes: ' + dump(nodes));
	ll('Matrix: ' + dump(matrix));

	// Precompute the orders.
	var orders = {
	    name: d3.range(n).sort(
		function(a, b) {
		    return d3.ascending(nodes[a].name, nodes[b].name);
		}),
	    count: d3.range(n).sort(
		function(a, b) {
		    return nodes[b].count - nodes[a].count;
		}),
	    group: d3.range(n).sort(
		function(a, b) {
		    return nodes[b].group - nodes[a].group; })
	};

	// The default sort order.
	x.domain(orders.name);

	svg.append("rect")
	    .attr("class", "background")
	    .attr("width", width)
	    .attr("height", height);

	var row = svg.selectAll(".row")
	    .data(matrix)
	    .enter().append("g")
	    .attr("class", "row")
	    .attr("transform",
		  function(d, i) {
		      return "translate(0," + x(i) + ")";
		  })
	    .each(row);

	row.append("line")
	    .attr("x2", width);

	row.append("text")
	    .attr("x", -6)
	    .attr("y", x.rangeBand() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "end")
	    .text(function(d, i) { return nodes[i].name; });
	
	var column = svg.selectAll(".column")
	    .data(matrix)
	    .enter().append("g")
	    .attr("class", "column")
	    .attr("transform",
		  function(d, i) {
		      return "translate(" + x(i) + ")rotate(-90)";
		  });
	
	column.append("line")
	    .attr("x1", -width);
	
	column.append("text")
	    .attr("x", 6)
	    .attr("y", x.rangeBand() / 2)
	    .attr("dy", ".32em")
	    .attr("text-anchor", "start")
	    .text(function(d, i) { return nodes[i].name; });
	
	function row(row) {
	    var cell = d3.select(this).selectAll(".cell")
		.data(row.filter(function(d) { return d.z; }))
		.enter().append("rect")
		.attr("class", "cell")
		.attr("x", function(d) { return x(d.x); })
		.attr("width", x.rangeBand())
		.attr("height", x.rangeBand())
		.style("fill-opacity", function(d) { return z(d.z); })
		.style("fill",
		       function(d) {
			   return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);
	}
	
	function mouseover(p) {
	    d3.selectAll(".row text").classed("active",
					      function(d, i) {
						  return i == p.y;
					      });
	    d3.selectAll(".column text").classed("active",
						 function(d, i) {
						     return i == p.x;
						 });
	}

	function mouseout() {
	    d3.selectAll("text").classed("active", false);
	}
	
	d3.select("#order").on("change",
			       function() {
				   clearTimeout(timeout);
				   order(this.value);
			       });
	
	function order(value) {
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
	
	var timeout = setTimeout(
	    function() {
		order("group");
		d3.select("#order").property("selectedIndex", 2).node().focus();
	    }, 5000);

	///
	/// End the section from the example.
	///	
	
	ll('Complete!');
    };
    go.run_batch(accumulator_fun, final_fun);
}
