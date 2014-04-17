////
//// Trying an ontology browser using cytoscapejs.
////

function FreeBrowseInit(){
    
    var logger = new bbop.logger('fb');
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

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
	var graph = new bbop.model.graph();
	graph.load_json(JSON.parse(graph_json));
	draw_graph(graph);
    }
    
    //
    var man = new bbop.golr.manager.jquery(sd.golr_base(), gconf);
    man.add_query_filter('document_category', 'ontology_class');
    //relman.add_query_filter('document_category', 'ontology_class', ['*']);
    man.set_personality('ontology');
    man.register('search', 'foo',
		 function(response, manager){
		     var doc = response.get_doc(0);
		     jumper(doc);
		 });
    
    ///
    ///
    ///
    
    //
    function draw_graph(graph){

	ll('in');

	jQuery('#grcon').empty();

	// Nodes.
	var cynodes = [];
	each(graph.all_nodes(),
	     function(node){
		 ll('node: ' + node.id());
		 cynodes.push(
		     {
			 //'group': 'nodes',
			 'data': {
			     'id': node.id(), 
			     'label': node.label() || node.id()
			 },
			 'grabbable': true
		     });
	     });

	// Edges.
	var cyedges = [];
	each(graph.all_edges(),
	     function(edge){
		 var sub = edge.subject_id();
		 var obj = edge.object_id();
		 var prd = edge.predicate_id();
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
			 }
                     });
	     });
	
	// Render.
	var elements = {nodes: cynodes, edges: cyedges};
	
	jQuery('#grcon').cytoscape(
            {
		'elements': elements,
		'layout': {
                    'name': 'breadthfirst',
                    'directed': true,
                    'fit': true
		},
		'style': [
                    {
			selector: 'node',
			css: {
                            'content': 'data(label)',
                            'text-valign': 'center',
                            'color': 'white',
                            'text-outline-width': 2,
                            'text-outline-color': '#888'
			}
                    },
                    {
			selector: 'edge',
			css: {
                            'content': 'data(pred)',
                            'width': 2,
                            'line-color': '#6fb1fc',
                            'source-arrow-shape': 'triangle'
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
			    man.search();
			});
	
	ll('done');
    }
    
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
	     //var ltag = new bbop.html.tag('label', ltag_attr, label);
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
    //    jQuery("#graph_radio").buttonset();
    each(shortcuts,
	 function(skey, shortcut){
	     var sid = shortcut['id'];
	     jQuery('#' + sid).click(
		 function(){
		     var sc_g = new bbop.model.graph();
		     sc_g.load_json(shortcut['graph']);
		     draw_graph(sc_g);
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
    			 'list_select_callback': jumper
    		     });
    //auto.set_personality('ontology'); // profile in gconf
    auto.set_personality('bbop_term_ac');
    auto.add_query_filter('document_category', 'ontology_class');

    // Initialize on BP.
    var init_g = new bbop.model.graph();
    init_g.load_json(shortcuts['bp']['graph']);
    draw_graph(init_g);
}
