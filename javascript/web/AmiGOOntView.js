////
//// A little fun driving a view with cytoscape. Try and view all
//// loaded ontologies.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */

var us = require('underscore');
var bbop = require('bbop-core');
//var bbop_legacy = require('bbop').bbop;
//var barista_response = require('bbop-response-barista');

// Help with strings and colors--configured separately.
var amigo = new (require('amigo2-instance-data'))(); // no overload

var model = require('bbop-graph-noctua');

var cytoscape = require('cytoscape');

// Bring in and register dagre with cytoscape.js.
var cydagre = require('cytoscape-dagre');
var dagre = require('dagre');
cydagre( cytoscape, dagre );

// Aliases
var each = us.each;
var graph = model.graph;
var node = model.node;
var edge = model.edge;
var is_defined = bbop.is_defined;
var what_is = bbop.what_is;
var uuid = bbop.uuid;

// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
var jQuery = require('jquery');
/* jshint ignore:end */

var class_expression = require('class-expression');
var minerva_requests = require('minerva-requests');
var model = require('bbop-graph');

//
var gserv = amigo.data.server.golr_base;

var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var golr_response = require('bbop-response-golr');

///
/// ...
///

// Limits.
// This is approx: |n|= 3435 and |e|= 4545.
var max = 1000;
// This is approx: |n|= 24236  and |e|= 41741.
//var max = 10000;
// This is approx: |n|= 50314  and |e|= 131680.
//var max = 100000;

// Variables.
var graph_id = 'cytoview';
var graph_layout = 'breadthfirst'; // default
var display_graph = new graph(); // the graph itself
var cy = null;
var layout_opts = null;

///
///
///

///
var AmiGOOntViewInit = function(){

    var logger = new bbop.logger('amigo ont view');
    logger.DEBUG = true;

    ///
    /// Helpers.
    ///

    // ISO8601-ish (no timezone offset).
    function timestamp(){
	
	var date = new Date();
	
	// Munge.
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = (m < 10 ? "0" : "") + m;
	var d = date.getDate();
	d = (d < 10 ? "0" : "") + d;
	var h = date.getHours();
	h = (h < 10 ? "0" : "") + h;
	var min = date.getMinutes();
	min = (min < 10 ? "0" : "") + m;
	var s = date.getSeconds();
	s = (s < 10 ? "0" : "") + s;
	
	// Assemble.
	return y +"-"+ m +"-"+ d + "T" + h + ":" + min + ":" + s;
    }

    function ll(str){ logger.kvetch('[' + timestamp() + '] ' + str); }

    //
    function _render_graph(ngraph, layout){
	//console.log('in render', ngraph);

	ll('# nodes: ' + ngraph.all_nodes().length);
	ll('# edges: ' + ngraph.all_edges().length);

	// Wipe it and start again.
	jQuery('#'+graph_id).empty();

	// Translate into something cytoscape can understand.
	var elements = [];
	each(ngraph.all_nodes(), function(n){
	    //ll('elm: ' + n.id());

	    // Create the final element.
	    elements.push({
		group: 'nodes',
		data: {
		    id: n.id(),
		    label: n.label(),
		    degree: (ngraph.get_child_nodes(n.id()).length * 10) +
			ngraph.get_parent_nodes(n.id()).length
		}
	    });
	});
	each(ngraph.all_edges(), function(e){
	    elements.push({
		group: 'edges',
		data: {
		    id: e.id(),
		    source: e.subject_id(),
		    target: e.object_id(),
		    predicate: e.predicate_id(),
		    label: amigo.readable(e.predicate_id()),
		    color: amigo.color(e.predicate_id())
		}
	    });
	});

	// Get roots for algorithms that need it.
	var roots = display_graph.get_root_nodes();
	var root_ids = [];
	each(roots, function(root){
	    root_ids.push(root.id());
	});

	// Setup possible layouts.
	layout_opts = {
	    'cose': {
		name: 'cose',
	    	padding: 10,
	    	animate: false,
		useMultitasking: true, // try this one out
	    	// animate: true,
		// 'directed': true,
		'fit': true
		// //'maximalAdjustments': 0,
		// 'circle': false,
		// 'roots': cyroots
	    },
	    // 'sugiyama': {
	    //     'name': 'grid',
	    //     'padding': 30,
	    //     'position': get_pos
	    // },
	    'random': {
		name: 'random',
		fit: true
	    },
	    'grid': {
		name: 'grid',
		fit: true,
		padding: 30,
		rows: undefined,
		columns: undefined
	    },
	    'circle': {
		name: 'circle',
		fit: true,
		sort: function(a, b){
		    return a.data('degree') - b.data('degree');
		}
	    },
	    'breadthfirst': {
		name: 'breadthfirst',
		directed: true,
		fit: true,
		//maximalAdjustments: 0,
		circle: false//,
		//roots: root_ids
	    }
	    // 'arbor': {
	    // 	name: 'arbor',
	    // 	fit: true, // whether to fit to viewport
	    // 	padding: 10 // fit padding
	    // },
	};
	
	// Ramp up view.
	cy = cytoscape({
	    // UI loc
	    container: document.getElementById(graph_id),
	    // actual renderables
	    elements: elements,
	    layout: layout_opts[layout],
	    style: [
		{
		    selector: 'node',
		    style: {
			'content': 'data(label)',
			'font-size': 8,
			'min-zoomed-font-size': 6, //10, speed
                        'text-valign': 'center',
                        'color': 'white',
			//'shape': 'roundrectangle',
			'shape': 'rectangle', // speed
                        'text-outline-width': 2,
                        'text-outline-color': '#222222',
			'text-wrap': 'wrap',
			'text-max-width': '100px'
		    }
		},
		{
		    selector: 'edge',
		    style: {
			//'target-arrow-color': 'data(color)',
			//'target-arrow-shape': 'triangle',
			//'target-arrow-fill': 'filled',
			'line-color': 'data(color)',
			'content': 'data(label)',
			'curve-style': 'haystack', // speed
			'font-size': 8,
			'min-zoomed-font-size': 6, //10, speed
                        'text-valign': 'center',
                        'color': 'white',
			'width': 6,
                        'text-outline-width': 2,
                        'text-outline-color': '#222222'
		    }
		}
	    ],
	    // initial viewport state:
	    zoom: 1,
	    pan: { x: 0, y: 0 },
	    // interaction options:
	    minZoom: 1e-50,
	    maxZoom: 1e50,
	    'textureOnViewport': true, // speed
	    'shadow-blur': 0, // speed
	    'hideEdgesOnViewport': true, // speed
	    'hideLabelsOnViewport': true, // speed
	    zoomingEnabled: true,
	    userZoomingEnabled: true,
	    panningEnabled: true,
	    userPanningEnabled: true,
	    boxSelectionEnabled: false,
	    selectionType: 'single',
	    touchTapThreshold: 8,
	    desktopTapThreshold: 4,
	    autolock: false,
	    autoungrabify: false,
	    autounselectify: false,
	    ready: function(){
		ll('cytoview ready, ' + elements.length + ' elements');
	    }
	});

	//
	cy.viewport({
	    zoom: 2,
	    pan: { x: 100, y: 100 }
	});
    }

    ///
    /// Get aaallll the data.
    ///
    
    // Events registry.
    var engine = new jquery_engine(golr_response);
    engine.method('POST');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    manager.set_personality('ontology');
    manager.add_query_filter('document_category', 'ontology_class', ['*']);
    manager.add_query_filter('idspace', 'GO', ['*']);
    manager.add_query_filter('is_obsolete', 'false', ['*']);

    // Try and limit the return fields.
    manager.set_facet_limit(0);
    manager.set_results_count(max);
    manager.set('fl', 'neighborhood_graph_json,score');

    // On search, assemble and display.
    manager.register('search', function(resp, man){
	
	ll('data captured, assemble graph...');

	// Cache all nodes and edges for single construction.
	var ncache = {};
	var ecache = {};
	each(resp.documents(), function(doc){
	    
	    // Iteratively add data.
	    if( doc && doc['neighborhood_graph_json'] ){

		var jobj = JSON.parse(doc['neighborhood_graph_json']);		
		each(jobj.nodes, function(n){
		    ncache[n.id] = n;
		});
		each(jobj.edges, function(e){
		    ecache[e.sub + '|' + e.obj + '|' + e.pred] = e;
		});
	    }
	});

	// Assemble cached data.
	display_graph.load_base_json({
	    'nodes': us.values(ncache),
	    'edges': us.values(ecache)
	});

	// The actually display step.
	ll('graph assembled, start render...');
	_render_graph(display_graph, 'breadthfirst');

	// Go ahead and wire-up the interface.
	jQuery("#" + "layout_selection").change(function(event){
	    graph_layout = jQuery(this).val();
	    cy.layout(layout_opts[graph_layout]);
	});
    });

    // Start trigger.
    ll('start data get...');
    var p = manager.search();
    //console.log('bar', p);
};

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ AmiGOOntViewInit(); });
})();
