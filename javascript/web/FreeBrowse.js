////
//// Trying an ontology browser using cytoscapejs.
//// Fun places: GO:0002296 GO:0014811
////

function FreeBrowseInit(){
    
    var logger = new bbop.logger('fb');
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    var context = new bbop.context(amigo.data.context);

    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    var sd = new amigo.data.server();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    // Alias.
    var each = bbop.core.each;

    function jumper(doc){
	var term_to_draw = doc['annotation_class'];
	var graph_json = doc['topology_graph_json'];
	var new_graph = new bbop.model.graph();
	new_graph.load_json(JSON.parse(graph_json));
	add_to_graph(new_graph, term_to_draw);
	draw_graph();
    }

    function on_list_select(doc){
	var term_to_draw = doc['annotation_class'];
	jQuery('#jumper').val(term_to_draw);
    }

    //    
    var spin =
	new bbop.widget.spinner("spn", sd.image_base() + '/waiting_ajax.gif');
    spin.hide();
   
    //
    var man = new bbop.golr.manager.jquery(sd.golr_base(), gconf);
    man.add_query_filter('document_category', 'ontology_class');
    man.set_personality('ontology');
    man.register('search', 'foo',
		 function(response, manager){
		     var doc = response.get_doc(0);
		     jumper(doc);
		 });
    
    ///
    /// ...
    ///

    // The global graph object which is always rendered.
    var graph = new bbop.model.graph();
    var focus_nodes = {};
   
    // Destroy cytoscape graph as well as the resetting the global
    // graph object.
    function empty_graph(){
	graph = new bbop.model.graph();
	focus_nodes = {};
	jQuery('#grcon').empty();
    }

    //
    function add_to_graph(new_graph, focus_id){

	// Add another focus.
	focus_nodes[focus_id] = true;

	// Merge new graph into global graph.
	graph.merge_in(new_graph);
    }

    function draw_graph(){

	ll('in');

	// First, figure out what layout to use.
	var lchoice = jQuery('#layout_input').val();

	// Get the layout information into the position object
	// required by cytoscape.js for sugiyama in grid, if required.
	var position_object = {};
	if( lchoice == 'sugiyama' ){
	    var renderer = new bbop.layout.sugiyama.render();
	    var layout = renderer.layout(graph);
	    var layout_nodes = layout.nodes;
	    each(layout_nodes,
		 function(ln){
		     position_object[ln['id']] = {x: ln['x'], y: ln['y']};
		 });
	}
	function get_pos(cn){
	    var po = position_object[cn.id()];
	    return {row: po['y'], col: po['x']};
	}
	
	// Nodes.
	var cyroots = [];
	var cynodes = [];
	var info_lookup = {};
	each(graph.all_nodes(),
	     function(node){
		 ll('node: ' + node.id());
		 info_lookup[node.id()] = {
		     'id': node.id(), 
		     'label': node.label() || node.id()
		 };
		 if( graph.is_root_node(node.id()) ){
		     cyroots.push(node.id());
		 }
		 var node_opts = {
		     //'group': 'nodes',
		     'data': {
			 'id': node.id(), 
			 'label': node.label() || node.id()
		     },
		     'grabbable': true
		 };
		 // Highlight the focus if there.
		 if( focus_nodes[node.id()] ){
		     node_opts['css'] = { 'background-color': '#111111' };
		 }
		 cynodes.push(node_opts);
	     });

	// Edges.
	var cyedges = [];
	each(graph.all_edges(),
	     function(edge){
		 var sub = edge.subject_id();
		 var obj = edge.object_id();
		 var prd = edge.predicate_id();
		 var clr = context.color(prd);
                 var eid = '' + prd + '_' + sub + '_' + obj;
		 ll('edge: ' + eid);
		 cyedges.push(
                     {
			 //'group': 'edges',
			 'data': {
                             'id': eid,
                             'pred': prd,
                             // 'source': sub,
                             // 'target': obj
                             'source': obj,
                             'target': sub
			 },
			 css: {
			     'line-color': clr
			 }
                     });
	     });

	// Render.
	var elements = {nodes: cynodes, edges: cyedges};
	
	var layout_opts = {
	    'sugiyama': {
                'name': 'grid',
		'padding': 30,
		'position': get_pos
	    },
	    'breadthfirst': {
                'name': 'breadthfirst',
                'directed': true,
                //'fit': true,
		//'maximalAdjustments': 0,
		'circle': false,
		'roots': cyroots
	    },
	    'cose': {
                'name': 'cose'//,
                // 'directed': true,
                // //'fit': true,
	        // //'maximalAdjustments': 0,
	        // 'circle': false,
	        // 'roots': cyroots
	    }   
	};

	jQuery('#grcon').cytoscape(
            {
		userPanningEnabled: true, // pan over box select
		'elements': elements,
		'layout': layout_opts[lchoice],
		hideLabelsOnViewport: true, // opt
		hideEdgesOnViewport: true, // opt
		textureOnViewport: true, // opt
		'style': [
                    {
			selector: 'node',
			css: {
                            'content': 'data(label)',
			    'font-size': 8,
			    'min-zoomed-font-size': 6, //10,
                            'text-valign': 'center',
                            'color': 'white',
			    'shape': 'roundrectangle',
                            'text-outline-width': 2,
                            'text-outline-color': '#222222'
			}
                    },
                    {
			selector: 'edge',
			css: {
                            //'content': 'data(pred)', // opt
                            'width': 2,
			    //'curve-style': 'haystack', // opt
                            'line-color': '#6fb1fc'
                            //'source-arrow-shape': 'triangle' // opt
			}
                    }
		]
            });

	var cy = jQuery('#grcon').cytoscape('get');

	// Bind event.
	cy.nodes().bind('click',
			function(e){
			    e.stopPropagation();
			    var nid = e.cyTarget.id();
			    man.set_id(nid);
			    spin.show();
			    man.search();
			});
	cy.nodes().bind('mouseover',
			function(e){
			    e.stopPropagation();
			    var nid = e.cyTarget.id();
			    var nlbl = info_lookup[nid]['label'];
 			    var popt = {
				title: nid,
				content: nlbl,
				animation: false,
				placement: 'top',
				trigger: 'manual'
			    };
			    //jQuery(this).popover(popt);
			    //jQuery(this).popover('show');
			    // TODO/BUG: this popover positioning got out of
			    // hand; just rewrite doing it manually with a
			    // div from bootstrap like normal people.
			    // (couldn't do it the obvious way because the
			    // canvas elements are just layers with nothing
			    // to adere to).
			    var epos = e.cyRenderedPosition;
			    jQuery(e.originalEvent.target).popover(popt);
			    jQuery(e.originalEvent.target).popover('show');
			    jQuery('.arrow').hide();
			    jQuery('.popover').css('top', epos.y -100);
			    jQuery('.popover').css('left', epos.x -100);
			    //ll('node: ' + nid);
			});
	cy.nodes().bind('mouseout',
			function(e){
			    e.stopPropagation();
			    jQuery(e.originalEvent.target).popover('destroy');
			});
	// each(cy.nodes(),
	//      function(nkey, node){
	// 	 jQuery(node.element()).popover(popt);
	//      });

	cy.edges().unselectify(); // opt
	cy.boxSelectionEnabled(false);
	cy.resize();

	// Make sure re respect resizing.
	jQuery(window).off('resize');
	jQuery(window).on('resize',
			  function(){
			      cy.resize(); 
			  });

	spin.hide();
	ll('done');
    }
    
    ///
    /// ...
    ///

    jQuery('#fb_add').click(function(){
				var inp = jQuery('#jumper').val();
				if( inp ){
				    man.set_id(inp);
				}
				spin.show();
				man.search();
			    });
    jQuery('#fb_clr').click(function(){
				jQuery('#jumper').val('');
				empty_graph();
			    });

    ///
    /// Ontologies shortcut selector buttons.
    ///

    // id and term are different since there might be HTML naming
    // problems with some ids.
    var shortcuts = {
	'bp': {
	    id: 'bp',
	    term: 'GO:0008150',
	    label: 'biological_process',
	    graph: {nodes:[{id:'GO:0008150', lbl:'biological_process'}]}
	},
	'cc': {
	    id: 'cc',
	    term: 'GO:0005575',
	    label: 'cellular_component',
	    graph: {nodes:[{id:'GO:0005575', lbl:'cellular_component'}]}
	},
	'mf': {
	    id: 'mf',
	    term: 'GO:0003674',
	    label: 'molecular_function',
	    graph: {nodes:[{id:'GO:0003674', lbl:'molecular_function'}]}
	}
    };

    // First, go through and add all of our shortcuts to the page.
    each(shortcuts,
	 function(skey, shortcut){
	     var sid = shortcut['id'];
	     var term = shortcut['term'];
	     var label = shortcut['label'];

	     var ltag_attr = {
		 'class' : 'btn btn-default',
		 'for': sid
	     };
	     var ltag = new bbop.html.tag('label', ltag_attr);

	     // 
	     var itag_attr = {
		 'id': sid,
		 'type': 'radio',
		 'name': 'graph_radio'
	     };
	     var itag = new bbop.html.input(itag_attr);

	     ltag.add_to(itag);
	     ltag.add_to(label);
	     jQuery("#graph_radio").append(ltag.to_string());
	 });

    // Now, make our different shortcut buttons active.
    each(shortcuts,
	 function(skey, shortcut){
	     var sid = shortcut['id'];
	     var trm = shortcut['term'];
	     jQuery('#' + sid).click(
		 function(){
		     man.set_id(trm);
		     jQuery('#jumper').val(trm);
		 }
	     );
	 });

    ///
    /// The autocomplete talking back to the tree browser.
    ///

    jQuery('#' + 'jumper').click(function(){ jQuery(this).val(''); }); // clear
    var a_widget = bbop.widget.search_box;
    var auto =
    	new a_widget(sd.golr_base(), gconf, 'jumper',
    		     {
    			 'label_template':
    			 '{{annotation_class_label}} ({{annotation_class}})',
    			 'value_template': '{{annotation_class}}',
    			 'list_select_callback': on_list_select
    		     });
    auto.set_personality('bbop_term_ac');
    auto.add_query_filter('document_category', 'ontology_class');
}
