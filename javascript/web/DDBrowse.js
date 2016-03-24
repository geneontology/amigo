////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;
var gserv_download = amigo.data.server.golr_download_base;
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

// Graphs.
var model = require('bbop-graph');

// HTML hooks.
var bid = 'dd_browser_id';

function DDBrowseInit(){
    
    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    // Manager creation wrapper (we use it a couple of times).
    function _create_manager(){

	// Create manager.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var manager = new golr_manager(gserv, gconf, engine, 'async');

	// Manager settings.
	var personality = 'ontology';
	var confc = gconf.get_class(personality);
	manager.set_personality(personality);
	manager.add_query_filter('document_category',
				 confc.document_category(), ['*']);

	return manager;	
    }

    // Convert a term callback into the proper json. This method is
    // used for the initial graph creation.
    function _term2json(doc){

	var root_id =  doc['id'];
	console.log("_term2json: " + doc + ', ' + root_id);

	// Extract the intersting graphs.
	var topo_graph_field = 'topology_graph_json';
	var trans_graph_field = 'regulates_transitivity_graph_json';
	var topo_graph = new model.graph();
	topo_graph.load_base_json(JSON.parse(doc[topo_graph_field]));
	var trans_graph = new model.graph();
	trans_graph.load_base_json(JSON.parse(doc[trans_graph_field]));

	// Using the annotation, get the spans for the IDs.
	var ac_badges = new AnnotationCountBadges();
	var ids_to_badge_text = ac_badges.get_future_badges([root_id]);

	//
	var kids_p = false;
	var kids = [];
	us.each(topo_graph.get_child_nodes(root_id), function(kid){
	    kids.push({
		'id': kid.id(),
		'text': kid.label() || kid.id()
	    });
	});
	if( kids.length > 0 ){
	    kids_p = true;
	}

	var lbl_txt = doc['annotation_class_label'] || root_id;
	    
	var tmpl = {
	    'id': root_id,
	    'icon': 'glyphicon glyphicon-record',
	    'text': lbl_txt + ids_to_badge_text[root_id],
	    //'icon': "string",
	    'state': {
		'opened': false,
		'disabled': false,
		'selected': false
	    },
	    'children': kids_p,
	    'li_attr': {},
	    'a_attr': {}
	};

	return tmpl;
    }

    // Convert a term children's into the proper json.
    function _desc2json(doc){
	console.log("_desc2json: " + doc);

	var kids = []; // ret

	// Extract the intersting graphs.
	var topo_graph_field = 'topology_graph_json';
	var trans_graph_field = 'regulates_transitivity_graph_json';
	var topo_graph = new model.graph();
	topo_graph.load_base_json(JSON.parse(doc[topo_graph_field]));
	var trans_graph = new model.graph();
	trans_graph.load_base_json(JSON.parse(doc[trans_graph_field]));

	//console.log('topo: ' + doc[topo_graph_field]);

	// Collect child ids.
	var child_ids = [];
	us.each(topo_graph.get_child_nodes(doc['id']), function(kid){
	    child_ids.push(kid.id());
	});

	// Using the annotation, get the spans for the IDs.
	var ac_badges = new AnnotationCountBadges();
	var ids_to_badge_text = ac_badges.get_future_badges(child_ids);

	//
	us.each(topo_graph.get_child_nodes(doc['id']), function(kid){

	    // Extract some info.
	    var oid = doc['id'];
	    var sid = kid.id();
	    var preds = topo_graph.get_predicates(sid, oid);
	    var imgsrc = bbop.resourcify(sd.image_base, preds[0], 'gif');

	    var lbl_txt =  kid.label() || sid;
	    
	    // Push template.
	    kids.push({
		'id': sid,
		'text': lbl_txt + ids_to_badge_text[sid],
		'icon': imgsrc,
		'state': {
		    'opened': false,
		    'disabled': false,
		    'selected': false
		},
		'children': true, // unknowable w/o lookahead
		'li_attr': {},
		'a_attr': {}
	    });
	});

	return kids;
    }

    ///
    /// The initial search manager.
    ///

    var search = _create_manager();

    // Initial trigger over root terms.
    var rt = [];
    us.each(sd.root_terms, function(pair){
	rt.push(pair['id']);
    });
    search.set_ids(rt);

    // Ready the callback.
    search.register('search', function(resp, man){
	
	// Verify and extract initial response.
	if( resp && resp.documents() && resp.documents().length ){
	    
	    var roots = [];
	    us.each(resp.documents(), function(doc){
		var json = _term2json(doc);
		roots.push(json);
	    });

	    //console.log(JSON.stringify(json));

	    // Render initial widget.
	    jQuery('#' + bid).jstree({
		'plugins' : ['sort'],
		'core': {
		    'multiple': false,
		    'data': function(jstree_node, cb){
			console.log("initial node work: " + jstree_node.id);
			if( jstree_node.id === '#' ){
			    cb(roots);
			}else{
			    var csearch = _create_manager();
			    csearch.register('search', function(resp,man){
				var children = [];
				if( resp && resp.documents() &&
				    resp.documents()[0] ){
				    children = _desc2json(resp.documents()[0]);
				 }
				cb(children);
			    });
			    csearch.set_id(jstree_node.id);
			    csearch.search();
			}
		    }
		}
	    });
	}
    });

    // Trigger.
    search.search();

    ///
    /// The info shield.
    ///

    // var shield = new widgets.display.term_shield(sd.golr_base, gconf,
    // 						 {'linker_function': linker});
    // shield.set_personality('ontology');

    jQuery('#' + bid).on('select_node.jstree', function (e, data){
	var r = [];
	us.each(data.selected, function(item){
	    r.push(data.instance.get_node(item)['id']);
	});
	console.log('Selected: ' + r.join(', '));
	if( r.length > 0 ){
	    alert(r[0]);
	    //shield.draw(r[0]);
	}
    });

}

///
///
///

// NOTE/SEE/WARNING: amigo/bin/amigo.js
// Coordinate an arbitary number of promises serially.
function run_promises(promise_runner_stack, 
                      accumulator_function, final_function, error_function){
    if( ! us.isEmpty(promise_runner_stack) ){
        var promise_runner = promise_runner_stack.shift();
        promise_runner().then(function(resp){
            accumulator_function(resp);
            run_promises(promise_runner_stack,
                         accumulator_function, final_function, error_function);
        }).fail(function(err){
            if(err){
                error_function(err);
            }
        }).done();
    }else{
        final_function();
    }
}

//
function AnnotationCountBadges (){
    
    var anchor = this;
    
    // This is the main data structure.
    var id_to_count = {};

    // Create a new function that returns a promise when called.
    var _new_response_promise = function(term_id){

	return function(){
	    // Create manager.
	    var engine = new jquery_engine(golr_response);
	    engine.method('GET');
	    engine.use_jsonp(true);
	    var manager = new golr_manager(gserv, gconf, engine, 'async');
	    
	    // Manager settings.
	    var personality = 'annotation';
	    var confc = gconf.get_class(personality);
	    manager.set_personality(personality);
	    manager.add_query_filter('document_category',
				     confc.document_category());
	    manager.set('rows', 0); // care not about rows
            manager.set_facet_limit(0); // care not about facets
	    
	    manager.add_query_filter('regulates_closure', term_id);
	    
	    return manager.search();
	};
    };

    // Enode ID safely and uniquely to a hex string.
    anchor.node_id_to_elt_id = function(id){
	
	var result = "";
	for( var i = 0;  i < id.length; i++ ){
	    var hex_dig = id.charCodeAt(i).toString(16);
	    hex_dig = "000" + hex_dig;
	    result += hex_dig.slice(-4);
	}
	
	return 'amigo_dd_browse_' + result;
    };
    
    // Return the text span of the badge to add to the tree term.
    anchor.get_future_badges = function(ids){
	
	var id_to_badge_text = {}; // sync deliverable
	var badge_promises = []; // async deliverables

	us.each(ids, function(id){

	    // Generate a unique element ID to use.
	    var elt_id = anchor.node_id_to_elt_id(id);
	
	    // Search our cache.
	    if( typeof(id_to_count[id]) !== 'undefined' ){
		console.log('hit cache with: ' + id);

		// The easy case where we have it.
		var atxt = ' <span id="' +
			elt_id + '" class="badge">' +
			id_to_count[id] + '</span>';
		id_to_badge_text[id] = atxt;

	    }else{
		console.log('missed cache with: ' + id);
	    
		//If it was not in our cache, we have to go out and
		//find it.
		//var manager = _new_manager();
		var resp_promise = _new_response_promise(id);
		badge_promises.push(resp_promise);
		
		// The easy case where we have it.
		var btxt = ' <span id="' + elt_id + '" class="badge">...</span>';
		id_to_badge_text[id] = btxt;
	    }
	});	

	// Action on getting a response.
	var accumulator_fun = function(resp){   
	    
	    // First, figure out who this was.
	    var acc = null;
	    var fqs = resp.parameter('fq');
	    us.each(fqs, function(fq){
		if( fq.substr(0, 17) === 'regulates_closure' ){
		    acc = fq.substr(18, fq.length-1);
		    acc = bbop.dequote(acc);
		}
	    });
	    
	    console.log('accumulation action for: ' + acc);

	    // Assuming we know...
	    if( acc ){

		// Get the annotation count...
                var total = resp.total_documents();

		// ...update the internal structures...
		id_to_count[acc] = total;
		// There /could/ technically be a race here...?
		var elt_id = anchor.node_id_to_elt_id(acc);
		var ctxt = ' <span id="' +
			elt_id + '" class="badge">' +
			id_to_count[acc] + '</span>';
		id_to_badge_text[acc] = ctxt;

		// ...update it in the DOM, if possible.
		console.log('update: ' + elt_id + ' to ' + total);
		console.log('update object: ', jQuery('#' + elt_id));
		jQuery('#' + elt_id).text(total);
	    }
        };
	
        // The final function is the data renderer.
        var final_fun = function(){
	    console.log('reached end of batch');
        };
	
        // In case of error.
        var error_fun = function(err){
	    if(err){
		console.log('error before end of batch');
	    }
        };
	
	run_promises(badge_promises, accumulator_fun, final_fun, error_fun);

	
	// While that async completes, add a place for it in the
	// DOM to come back to.
	return id_to_badge_text;
    };
}

///
///
///

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){ DDBrowseInit(); });
})();
