////
//// Trying an ontology browser using cytoscapejs.
//// Fun places: GO:0002296 GO:0014811
////

///
/// Stolen bbop-mme-context.js
///

/*
 * Constructor: bbop_mme_context
 * 
 * Initial take from AmiGO/Aid.pm
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  aiding object
 */
var bbop_mme_context = function(){

    // Relations.
    // Colors are X11: http://cng.seas.rochester.edu/CNG/docs/x11color.html
    var entities = {
	'instance_of':
	{
	    readable: 'activity',
	    priority: 8,
	    aliases: [
		'activity'
	    ],
	    color: '#FFFAFA' // snow
	},
	'BFO:0000050':
	{
	    readable: 'part of',
	    priority: 15,
	    aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000050',
		//'http://purl.obolibrary.org/obo/part_of',
		'BFO_0000050',
		'part:of',
		'part of',
		'part_of'
	    ],
	    color: '#add8e6' // light blue
	},
	'BFO:0000051':
	{
	    readable: 'has part',
	    priority: 4,
	    aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000051',
		'has:part',
		'has part',
		'has_part'
	    ],
	    color: '#6495ED' // cornflower blue
	},
	'BFO:0000066':
	{
	    readable: 'occurs in',
	    priority: 12,
	    aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000066',
		//'BFO_0000066',
		'occurs:in',
		'occurs in',
		'occurs_in'
	    ],
	    color: '#66CDAA' // medium aquamarine
	},
	'RO:0002202':
	{
	    readable: 'develops from',
	    priority: 0,
	    aliases: [
		'develops:from',
		'develops from',
		'develops_from'
	    ],
	    color: '#A52A2A' // brown
	},
	'RO:0002211':
	{
	    readable: 'regulates',
	    priority: 16,
	    aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002211'
		'regulates'
	    ],
	    color: '#2F4F4F' // dark slate grey
	},
	'RO:0002212':
	{
	    readable: 'negatively regulates',
	    priority: 17,
	    aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002212'
		'negatively:regulates',
		'negatively regulates',
		'negatively_regulates'
	    ],
	    glyph: 'bar',
	    color: '#FF0000' // red
	},
	'RO:0002213':
	{
	    readable: 'positively regulates',
	    priority: 18,
	    aliases: [
		//'http://purl.obolibrary.org/obo/RO_0002213'
		'positively:regulates',
		'positively regulates',
		'positively_regulates'
	    ],
	    glyph: 'arrow',
	    color: '#008000' //green
	},
	'RO:0002233':
	{
	    readable: 'has input',
	    priority: 14,
	    aliases: [
		//'http://purl.obolibrary.org/obo/BFO_0000051',
		'has:input',
		'has input',
		'has_input'
	    ],
	    color: '#6495ED' // cornflower blue
	},
	'RO:0002234':
	{
	    readable: 'has output',
	    priority: 0,
	    aliases: [
		'has:output',
		'has output',
		'has_output'
	    ],
	    color: '#ED6495' // ??? - random
	},
	'RO:0002330':
	{
	    readable: 'genomically related to',
	    priority: 0,
	    aliases: [
		'genomically related to',
		'genomically_related_to'
	    ],
	    color: '#9932CC' // darkorchid
	},
	'RO:0002331':
	{
	    readable: 'involved in',
	    priority: 3,
	    aliases: [
		'involved:in',
		'involved in',
		'involved_in'
	    ],
	    color: '#E9967A' // darksalmon
	},
	'RO:0002332':
	{
	    readable: 'regulates level of',
	    priority: 0,
	    aliases: [
		'regulates level of',
		'regulates_level_of'
	    ],
	    color: '#556B2F' // darkolivegreen
	},
	'RO:0002333':
	{
	    readable: 'enabled by',
	    priority: 13,
	    aliases: [
		'RO_0002333',
		'enabled:by',
		'enabled by',
		'enabled_by'
	    ],
	    color: '#B8860B' // darkgoldenrod
	},
	'RO:0002334':
	{
	    readable: 'regulated by',
	    priority: 0,
	    aliases: [
		'RO_0002334',
		'regulated by',
		'regulated_by'
	    ],
	    color: '#86B80B' // ??? - random
	},
	'RO:0002335':
	{
	    readable: 'negatively regulated by',
	    priority: 0,
	    aliases: [
		'RO_0002335',
		'negatively regulated by',
		'negatively_regulated_by'
	    ],
	    color: '#0B86BB' // ??? - random
	},
	'RO:0002336':
	{
	    readable: 'positively regulated by',
	    priority: 0,
	    aliases: [
		'RO_0002336',
		'positively regulated by',
		'positively_regulated_by'
	    ],
	    color: '#BB0B86' // ??? - random
	},
	'activates':
	{
	    readable: 'activates',
	    priority: 0,
	    aliases: [
		'http://purl.obolibrary.org/obo/activates'
	    ],
	    //glyph: 'arrow',
	    //glyph: 'diamond',
	    //glyph: 'wedge',
	    //glyph: 'bar',
	    color: '#8FBC8F' // darkseagreen
	},
	'RO:0002406':
	{
	    readable: 'directly activates',
	    priority: 20,
	    aliases: [
		//'http://purl.obolibrary.org/obo/directly_activates',
		'directly:activates',
		'directly activates',
		'directly_activates'
	    ],
	    glyph: 'arrow',
	    color: '#2F4F4F' // darkslategray
	},
	'upstream_of':
	{
	    readable: 'upstream of',
	    priority: 2,
	    aliases: [
		//'http://purl.obolibrary.org/obo/upstream_of'
		'upstream:of',
		'upstream of',
		'upstream_of'
	    ],
	    color: '#FF1493' // deeppink
	},
	'RO:0002408':
	{
	    readable: 'directly inhibits',
	    priority: 19,
	    aliases: [
		//'http://purl.obolibrary.org/obo/directly_inhibits'
		'directly:inhibits',
		'directly inhibits',
		'directly_inhibits'
	    ],
	    glyph: 'bar',
	    color: '#7FFF00' // chartreuse
	},
	'indirectly_disables_action_of':
	{
	    readable: 'indirectly disables action of',
	    priority: 0,
	    aliases: [
		//'http://purl.obolibrary.org/obo/indirectly_disables_action_of'
		'indirectly disables action of',
		'indirectly_disables_action_of'
	    ],
	    color: '#483D8B' // darkslateblue
	},
	'provides_input_for':
	{
	    readable: 'provides input for',
	    priority: 0,
	    aliases: [
		'GOREL_provides_input_for',
		'http://purl.obolibrary.org/obo/GOREL_provides_input_for'
	    ],
	    color: '#483D8B' // darkslateblue
	},
	'RO:0002413':
	{
	    readable: 'directly provides input for',
	    priority: 1,
	    aliases: [
		'directly_provides_input_for',
		'GOREL_directly_provides_input_for',
		'http://purl.obolibrary.org/obo/GOREL_directly_provides_input_for'
	    ],
	    glyph: 'diamond',
	    color: '#483D8B' // darkslateblue
	}
    };

    // Compile entity aliases.
    var entity_aliases = {};
    bbop.core.each(entities,
		   function(ekey, eobj){
		       entity_aliases[ekey] = ekey; // identity
		       bbop.core.each(eobj['aliases'],
				      function(alias){
					  entity_aliases[alias] = ekey;
				      });
		   });

    // Helper fuction to go from unknown id -> alias -> data structure.
    this._dealias_data = function(id){
	
	var ret = null;
	if( id ){
	    if( entity_aliases[id] ){ // directly pull
		var tru_id = entity_aliases[id];
		ret = entities[tru_id];
	    }
	}

	return ret;
    };

    /* 
     * Function: readable
     *
     * Returns a human readable form of the inputted string.
     *
     * Parameters: 
     *  ind - incoming data id
     *
     * Returns:
     *  readable string or original string
     */
    this.readable = function(ind){
	var ret = ind;

	var data = this._dealias_data(ind);
	if( data && data['readable'] ){
	    ret = data['readable'];
	}
	
	return ret;
    };

    /* 
     * Function: color
     *
     * Return the string of a color of a rel.
     *
     * Parameters: 
     *  ind - incoming data id
     *
     * Returns:
     *  appropriate color string or 'grey'
     */
    this.color = function(ind){
	
	var ret = '#808080'; // grey

	var data = this._dealias_data(ind);
	if( data && data['color'] ){
	    ret = data['color'];
	}
	
	return ret;
    };

    /* 
     * Function: relation_glyph
     *
     * Return the string indicating the glyph to use for the edge marking.
     *
     * Parameters: 
     *  ind - incoming data id
     *
     * Returns:
     *  appropriate color string or null
     */
    this.glyph = function(ind){
	
	var ret = null; // default

	var data = this._dealias_data(ind);
	if( data && data['glyph'] ){
	    ret = data['glyph'];
	}
	
	return ret;
    };

    /* 
     * Function: priority
     *
     * Return a number representing the relative priority of the
     * entity under consideration.
     *
     * Parameters: 
     *  ind - incoming data id
     *
     * Returns:
     *  appropriate integer or 0
     */
    this.priority = function(ind){
	
	var ret = 0;

	var data = this._dealias_data(ind);
	if( data && data['priority'] ){
	    ret = data['priority'];
	}
	
	return ret;
    };

    /* 
     * Function: all_entities
     *
     * Return a list of the currently known entities.
     *
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  list
     */
    this.all_entities = function(){	
	var rls = bbop.core.get_keys(entities);
	return rls;
    };

    /* 
     * Function: all_known
     *
     * Return a list of the currently known entities and their aliases.
     *
     * Parameters: 
     *  n/a
     *
     * Returns:
     *  list
     */
    this.all_known = function(){	
	var rls = bbop.core.get_keys(entity_aliases);
	return rls;
    };
};

///
/// Actual initializer.
///

function FreeBrowseInit(){
    
    var logger = new bbop.logger('fb');
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    var context = new bbop_mme_context();

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
