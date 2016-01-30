////
//// A little fun driving a view with cytoscape.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_id */
/* global global_model */
/* global global_barista_location */
/* global global_minerva_definition_name */
/* global global_collapsible_relations */
/* global amigo */

var us = require('underscore');
var bbop = require('bbop-core');
var bbop_legacy = require('bbop').bbop;
//var barista_response = require('bbop-response-barista');

// Help with strings and colors--configured separately.
var aid = new bbop_legacy.context(amigo.data.context);

var model = require('bbop-graph-noctua');

var cytoscape = require('cytoscape');

// Aliases
var each = us.each;
var noctua_graph = model.graph;
var noctua_node = model.node;
var noctua_annotation = model.annotation;
var edge = model.edge;
var each = us.each;
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
var noctua_model = require('bbop-graph-noctua');

//
var sd = new amigo.data.server();
var gserv = sd.golr_base();

var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var golr_response = require('bbop-response-golr');

///
/// ...
///

// Limits.
var max = 200;

// Variables.
var graph_id = 'cytoview';
var graph_layout = 'breadthfirst'; // default
var graph_fold = 'editor'; // default
var graph = null; // the graph itself
var cy = null;
var layout_opts = null;

///
///
///

///
var AmiGOBioViewInit = function(model_ids){

    var logger = new bbop.logger('amigo cvi');
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    ///
    /// Helpers.
    ///

    //
    function _render_graph(ngraph, layout, fold){
	//ll('in render');

	// Wipe it and start again.
	jQuery('#'+graph_id).empty();

	// Try and get it folded as desired.
	ngraph.unfold();
	if( fold === 'evidence' ){
	    graph_fold = fold;
	    ngraph.fold_evidence();
	}else if( fold === 'editor' ){
	    graph_fold = fold;
	    ngraph.fold_go_noctua(global_collapsible_relations);
	}else{
	    graph_fold = fold;
	}

	// Stolen from the internal workings of widgetry.
	// Part 1.
	var cat_list = [];
	each(ngraph.all_nodes(), function(enode, enode_id){
	    each(enode.types(), function(in_type){
		cat_list.push(in_type.category());
	    });
	});
	var tmph = bbop.hashify(cat_list);
	cat_list = us.keys(tmph);

	// Translate into something cytoscape can understand.
	var elements = [];
	each(ngraph.all_nodes(), function(n){
	    //ll('elm: ' + n.id());

	    // Stolen from the internal workings of widgetry.
	    // Part 1.
	    var bin = {};
	    each(n.types(), function(in_type){
		var cat = in_type.category();
		if( ! bin[cat] ){ bin[cat] = []; }
		bin[cat].push(in_type);
	    });
	    var table_row = [];
	    each(cat_list, function(cat_id){
		var accumulated_types = bin[cat_id];
		var cell_cache = [];
		each(accumulated_types, function(atype){
		    //var tt = widgetry.type_to_span(atype, aid);
		    var tt = atype.to_string();
		    cell_cache.push(tt);
		});
		table_row.push(cell_cache.join("\n"));
	    });

	    // Make a label from it.
	    var nlbl = table_row.join("\n");

	    // Create the final element.
	    elements.push({
		group: 'nodes',
		data: {
		    id: n.id(),
		    label: nlbl,
		    degree: (ngraph.get_child_nodes(n.id()).length * 10)+
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
		    label: aid.readable(e.predicate_id()),
		    color: aid.color(e.predicate_id())
		}
	    });
	});

	// Get roots for algorithms that need it.
	var roots = graph.get_root_nodes();
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
			'min-zoomed-font-size': 6, //10,
                        'text-valign': 'center',
                        'color': 'white',
			'shape': 'roundrectangle',
                        'text-outline-width': 2,
                        'text-outline-color': '#222222',
			'text-wrap': 'wrap',
			'text-max-width': '100px'
		    }
		},
		{
		    selector: 'edge',
		    style: {
			'target-arrow-color': 'data(color)',
			'target-arrow-shape': 'triangle',
			'target-arrow-fill': 'filled',
			'line-color': 'data(color)',
			'content': 'data(label)',
			'font-size': 8,
			'min-zoomed-font-size': 6, //10,
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
    /// Get aaallll the data...well X.
    ///
    
    // Events registry.
    var engine = new jquery_engine(golr_response);
    engine.method('POST');
    engine.use_jsonp(true);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    //var confc = gconf.get_class('model_annotation');
    manager.set_personality('model_annotation');
    manager.add_query_filter('document_category',
			     //confc.document_category(), ['*']);    
			     'model_annotation', ['*']);    
    // Get only up to X targets
    manager.set_facet_limit(0);
    manager.set_results_count(max);
    //manager.set_ids(model_ids);
    manager.set_targets(model_ids, ['model']);

    // On search, assemble and display.
    manager.register('search', function(resp, man){
	
	graph = new noctua_graph();
	
	each(resp.documents(), function(doc){
	    
	    // Iteratively Add data.
	    if( doc && doc['owl_blob_json'] ){
		var jobj = JSON.parse(doc['owl_blob_json']);
		graph.load_data_basic(jobj);
	    }
	});

	// The actually display step.
	_render_graph(graph, 'breadthfirst', 'editor');

	// Go ahead and wire-up the interface.
	jQuery("#" + "layout_selection").change(function(event){
	    graph_layout = jQuery(this).val();
	    //_render_graph(graph, graph_layout, graph_fold);
	    cy.layout(layout_opts[graph_layout]);
	});
	jQuery("#" + "fold_selection").change(function(event){
	    graph_fold = jQuery(this).val();
	    _render_graph(graph, graph_layout, graph_fold);
	});
    });

    // Start trigger.
    var p = manager.search();
    console.log('bar', p);
};

// Start the day the jQuery way.
jQuery(document).ready(function(){

    // Events registry.
    // Get all 'noctua_model_meta'.
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    //var tmp_srv = 'http://amigo-dev-golr.berkeleybop.org/';
    //var manager = new golr_manager(tmp_srv, gconf, engine, 'async');
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    //var confc = gconf.get_class('noctua_model_meta');
    manager.set_personality('noctua_model_meta');
    manager.add_query_filter('document_category',
			     //confc.document_category(), ['*']);    
			     'noctua_model_meta', ['*']);
    manager.set_facet_limit(0);
    manager.set_results_count(max);

    // On search, report.
    var model_ids = [];
    manager.register('search', function(resp, man){

	//
	each(resp.documents(), function(doc){
	    model_ids.push('gomodel:' + doc['id'].substr(-16));
	});

	AmiGOBioViewInit(model_ids);

    });

    // Start trigger.
    var p = manager.search();
    console.log('model_ids', model_ids);
    console.log('foo', p);
});
