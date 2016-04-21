////
//// Trying an ontology browser using cytoscapejs.
//// Fun places: GO:0002296 GO:0014811
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require("bbop-widget-set");
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;
// Linker.
var linker = amigo.linker;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// Graphs.
var model = require('bbop-graph');
var cytoscape = require('cytoscape');

// Aliases
var each = us.each;

// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
var jQuery = require('jquery');
/* jshint ignore:end */

///
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

    function jumper(doc){

	// Extract data.
	var term_to_draw = doc['annotation_class'];
	var graph_json = doc['topology_graph_json'];

	// Add to global graph.
	var new_graph = new model.graph();
	new_graph.load_base_json(JSON.parse(graph_json));
	add_to_graph(new_graph, term_to_draw);

	// Figure out layout.
	var lchoice = jQuery('#layout_input').val();

	// Render.
	CytoDraw(graph, us.keys(focus_nodes),
		 lchoice, amigo, 'grcon',
		 _start_wait, _stop_wait, _data_call);

	// Update color explanations to the newest.
	var color_clust = [];
	var erels = graph.all_predicates();
	each(erels, function(erel){
	    color_clust.push({
		'label': amigo.readable(erel),
		'color': amigo.color(erel),
		'priority': amigo.priority(erel)
	    });
	});
	color_clust.sort(function(a, b){ return b.priority - a.priority; });
	// Assemble HTML for label display.
	var fc = [];
	fc.push('<ul class="list-unstyled">');
	each(color_clust, function(c){
	    fc.push('<li>');
	    fc.push('<span class="label" style="background-color:' +
		    c.color + ';">' + c.label + '</span>');
	    fc.push('</li>');
	});
	fc.push('</ul>');
	// Add to DOM.
	jQuery('#color_exp').empty();
	jQuery('#color_exp').append(fc.join(''));
    }

    function on_list_select(doc){
	var term_to_draw = doc['annotation_class'];
	jQuery('#jumper').val(term_to_draw);
    }

    // // Define spinner and helper functions; stop first wait.
    // var spin = new widgets.spinner("spn", sd.image_base +'/waiting_ajax.gif',
    // 				   {'visible_p': false});
    function _start_wait(){
    	//spin.show();
    }
    function _stop_wait(){
    	//spin.hide();
    }

    // Manager setup.
    var man = null;
    (function(){
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	man = new golr_manager(gserv, gconf, engine, 'async');
	man.set_personality('ontology'); // profile in gconf
	man.add_query_filter('document_category', 'ontology_class');
	man.register('search', function(response, manager){
	    var doc = response.get_doc(0);
	    jumper(doc);
	});
    })();
    // Function to use for data calls in the cytoscape renderer.
    function _data_call(nid){
	man.set_id(nid);
	man.search();
    }

    ///
    /// ...
    ///

    // The global graph object which is always rendered.
    var graph = new model.graph();
    var focus_nodes = {};
   
    // Destroy cytoscape graph as well as the resetting the global
    // graph object.
    function empty_graph(){
	graph = new model.graph();
	focus_nodes = {};
	jQuery('#grcon').empty();
	jQuery('#color_exp').empty();
    }

    //
    function add_to_graph(new_graph, focus_id){

	// Add another focus.
	focus_nodes[focus_id] = true;

	// Merge new graph into global graph.
	graph.merge_in(new_graph);
    }

    ///
    /// ...
    ///

    jQuery('#fb_add').click(function(){
	var inp = jQuery('#jumper').val();
	if( inp ){
	    man.set_id(inp);
	}
	_start_wait();
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
    each(shortcuts, function(shortcut, skey){
	var sid = shortcut['id'];
	var term = shortcut['term'];
	var label = shortcut['label'];

	var ltag_attr = {
	    'class' : 'btn btn-default',
	    'for': sid
	};
	var ltag = new html.tag('label', ltag_attr);
	
	// 
	var itag_attr = {
	    'id': sid,
	    'type': 'radio',
	    'name': 'graph_radio'
	};
	var itag = new html.input(itag_attr);
	
	ltag.add_to(itag);
	ltag.add_to(label);
	jQuery("#graph_radio").append(ltag.to_string());
    });
    
    // Now, make our different shortcut buttons active.
    each(shortcuts, function(shortcut, skey){
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

    // Manager setup.
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    manager.set_personality('ontology'); // profile in gconf
    manager.set_personality('bbop_term_ac');
    manager.add_query_filter('document_category', 'ontology_class');

    jQuery('#' + 'jumper').click(function(){ jQuery(this).val(''); }); // clear
    var auto = new widgets.autocomplete_simple(
    	manager, gserv, gconf, 'jumper',
    	{
    	    'label_template':
    	    '{{annotation_class_label}} ({{annotation_class}})',
    	    'value_template': '{{annotation_class}}',
    	    'list_select_callback': on_list_select
    	});
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ FreeBrowseInit(); });
})();


////
//// An abstraction of the drawing routine used several places.
////

function CytoDraw(graph, focus_node_list,
		  layout_name, context, elt_id,
		  start_wait, stop_wait, data_call){
    
    var logger = new bbop.logger('CD');
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    ll('in');

    // Convert the focus node list into a usable hash.
    var focus_nodes = {};
    each(focus_node_list, function(fn){
	focus_nodes[fn] = true;
    });
    
    // Get the layout information into the position object
    // required by cytoscape.js for sugiyama in grid, if required.
    var position_object = {};
    if( layout_name === 'sugiyama' ){
	var renderer = new bbop.layout.sugiyama.render();
	var layout = renderer.layout(graph);
	var layout_nodes = layout.nodes;
	each(layout_nodes, function(ln){
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
    each(graph.all_nodes(), function(node){
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
    each(graph.all_edges(), function(edge){
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
	'random': {
	    name: 'random'//,
	    // fit: true
	},
	'grid': {
	    name: 'grid',
	    // fit: true,
	    padding: 30,
	    rows: undefined,
	    columns: undefined
	},
	'circle': {
	    name: 'circle'//,
	    //fit: true
	},
	'concentric': {
	    name: 'concentric'//,
	    //fit: true
	},
	'breadthfirst': {
            'name': 'breadthfirst',
            'directed': true,
            //'fit': true,
	    //'maximalAdjustments': 0,
	    'circle': false,
	    'roots': cyroots
	},
	// 'arbor': {
	// },
	'cose': {
            'name': 'cose'//,
            // 'directed': true,
            // //'fit': true,
	    // //'maximalAdjustments': 0,
	    // 'circle': false,
	    // 'roots': cyroots
	}
    };
    
    jQuery('#' + elt_id).cytoscape(
        {
	    userPanningEnabled: true, // pan over box select
	    'elements': elements,
	    'layout': layout_opts[layout_name],
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
    
    var cy = jQuery('#' + elt_id).cytoscape('get');

    // Bind event.
    cy.nodes().bind('click',
		    function(e){
			e.stopPropagation();
			var nid = e.cyTarget.id();
			start_wait();
			data_call(nid);
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
			// TODO/BUG: Also, unfortunately, I cannot
			// figure out why I am stuck with the
			// single frozen pop-up on the versions of
			// jQuery/UI that monarch is using. I cannot
			// change from the intial, probably a quirk of
			// bs3). Manually change it.
			var new_html = '<div style="display: none;" class="arrow"></div><h3 class="popover-title">' + nid + '</h3><div class="popover-content">' + nlbl + '</div>';
			jQuery('.popover').html(new_html);

			//ll('node: ' + nid);
		    });
    cy.nodes().bind('mouseout',
		    function(e){
			e.stopPropagation();
			jQuery(e.originalEvent.target).popover('destroy');
		    });

    // 
    cy.edges().unselectify(); // opt
    cy.boxSelectionEnabled(false);
    cy.resize();
    
    // Make sure re respect resizing.
    jQuery(window).off('resize');
    jQuery(window).on('resize',
		      function(){
			  cy.resize(); 
		      });
    
    stop_wait();
    ll('done');
    return cy;
}
