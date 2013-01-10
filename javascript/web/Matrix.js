////
//// Experiment in D3 JS; no cart like in NMatrix.
////

// TODO: Interact with the user, launch stage 01.
function MatrixInit(){

    // Ready logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('JSM: ' + str); }
    ll('');
    ll('MatrixInit start...');

    // Let's start with this test.
    var term_accs = ['GO:0043473', 'GO:0009987', 'GO:0022008'];
    // Val's half example.
    //var term_accs = ['GO:0006310', 'GO:0006281', 'GO:0006260', 'GO:0030437', 'GO:0005975', 'GO:0007155', 'GO:0006520', 'GO:0070882', 'GO:0016568', 'GO:0051276', 'GO:0007059', 'GO:0051186', 'GO:0000747', 'GO:0000910', 'GO:0002181', 'GO:0007010', 'GO:0007163', 'GO:0006091', 'GO:0006629', 'GO:0016071', 'GO:0007126', 'GO:0007005', 'GO:0071941'];
    // Val's full example.
    //var term_accs = ['GO:0006310', 'GO:0006281', 'GO:0006260', 'GO:0030437', 'GO:0005975', 'GO:0007155', 'GO:0006520', 'GO:0070882', 'GO:0016568', 'GO:0051276', 'GO:0007059', 'GO:0051186', 'GO:0000747', 'GO:0000910', 'GO:0002181', 'GO:0007010', 'GO:0007163', 'GO:0006091', 'GO:0006629', 'GO:0016071', 'GO:0007126', 'GO:0007005', 'GO:0071941', 'GO:0055086', 'GO:0006913', 'GO:0007031', 'GO:0030163', 'GO:0006461', 'GO:0006457', 'GO:0006486', 'GO:0051604', 'GO:0070647', 'GO:0006605', 'GO:0007346', 'GO:0042254', 'GO:0023052', 'GO:0006399', 'GO:0006351', 'GO:0055085', 'GO:0007033', 'GO:0016192', 'GO:0006766'];

    stage_01(term_accs);

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
    var accumulator_fun = function(json_resp){	
	// Fetch the data and grab the number we want.
	var resp = new bbop.golr.response(json_resp);

	// Who was this?
	var qval = resp.parameter('q');
	var two_part = bbop.core.first_split(':', qval);
	var acc = two_part[1];
	ll('Lookings at info for: ' + acc);
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

    // Next, setup the manager environment.
    ll('Setting up manager.');
    var server_meta = new amigo.data.server();
    var gloc = server_meta.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(gloc, gconf);
    go.add_query_filter('document_category', 'annotation', ['*']);
    go.set_personality('bbop_ann');
    go.set('rows', 0); // we don't need any actual rows returned
    go.set_facet_limit(0); // we don't need any actual facets returned
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
    var seen_links = {};
    var max_count = 0;
    var accumulator_fun = function(json_resp){	
	// Fetch the data and grab the number we want.
	var resp = new bbop.golr.response(json_resp);

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

	// We want this to be fully defined at the end of the accumulator.
	var data = {
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
    var margin = { top: 250, right: 0, bottom: 0, left: 250 };
    // Total width.
    var width = 800;
    var height = 800;
    
    var x = d3.scale.ordinal().rangeBands([0, width]);
    var z = d3.scale.linear().domain([0, 4]).clamp(true);
    //var c = d3.scale.category10().domain(d3.range(10));
    var c = d3.scale.category10().domain(d3.range(max_count));
    
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
	    node.index = i;
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
	    matrix[link.source][link.target].z += link.value;
	    matrix[link.target][link.source].z += link.value;
	    matrix[link.source][link.source].z += link.value;
	    matrix[link.target][link.target].z += link.value;
	    nodes[link.source].count += link.value;
	    nodes[link.target].count += link.value;
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
		//return nodes[b].count - nodes[a].count;
		return nodes[a].count - nodes[b].count;
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
	.attr("style", "fill: #eeeeee;")
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

    function mouseover(p) {
	ll("mouse over: (" + p.x + ', ' + p.y + ')');
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
    
    function row_fun(in_row) {
	var cell = d3.select(this).selectAll(".cell")
	    .data(in_row.filter(
		      function(d) {
			  return d.z;
		      }))
	    .enter().append("rect")
	    //.attr("style", "fill: #ff00ff")
	    .attr("class", "cell") // tag as cell with class for later ref
	    .attr("x",
		  function(d) {
		      return x(d.x);
		  })
	    .attr("width", x.rangeBand())
	    .attr("height", x.rangeBand())
	    .style("fill-opacity",
		   function(d) {
		       return z(d.z);
		   })
	    .style("fill",
		   function(d) {
		       var retval = null;
		       if( nodes[d.x].source == nodes[d.y].source ){
			   retval = c(nodes[d.x].source);
		       }
		       return retval;
		   })
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
