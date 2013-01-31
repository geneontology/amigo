////
//// A simple try at a more modern naive drill-down ontology browser.
////

// Just double check we have the right libraries coming in.
//bbop.core.require('bbop', 'core');
//bbop.core.require('bbop', 'logger');
//bbop.core.require('bbop', 'amigo');
//bbop.core.require('bbop', 'amigo', 'golr_meta');
//bbop.core.require('bbop', 'model');
//bbop.core.require('bbop', 'golr', 'manager');

// Logger for all functions.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('DD: ' + str); }    

// Global AmiGO helpers.
var server_meta = new amigo.data.server();
var linker = new amigo.linker();

// Go and get the initial results for building our tree.
function DDInit(){

    ll('');
    ll('DrillExp.js');
    ll('DDInit start...');

    var gconf = new bbop.golr.conf(amigo.data.golr);
    var gm = new bbop.golr.manager.jquery(server_meta.golr_base(), gconf);
    //gm.set_personality('bbop_ont'); // profile in gconf
    gm.add_query_filter('document_category', 'ontology_class', ['*']);
    
    // Let's limit ourselves to 100 rows returned so we don't overload
    // while (dumb) browsing.
    gm.set('rows', 100);

    // Let's capture an initial url (one that gets the roots), then
    // reset.
    gm.set_query('id:"GO:0008150" or id:"GO:0005575" or id:"GO:0003674"');
    var reset_url = gm.get_query_url();
    gm.reset_query();

    // Ready tree with response.
    var did = '#drilldown';
    jQuery(did).jstree(
	{
	    "json_data" : {
	        "ajax" : {
		    "type": 'GET',
		    "dataType": 'jsonp',
		    "jsonp": 'json.wrf',
	            "url" : function (n) {
			var retval = reset_url;
			if( !n || ! n.attr || ! n.attr("id") ){
			    ll('url: initial');
			}else{
			    ll('url: open');

			    // Get id.
			    var attr_id = n.attr("id");

			    if( n.attr('kid_query') ){
				gm.set('parent', n.attr('id'));
				gm.set('q', n.attr('kid_query'));
				retval = gm.get_query_url();
			    }else{
				retval = null;
			    }
			}
			ll('try url: ' + retval);
	                return retval;
	            },
	            "error" : function(e) {
			ll('ERROR: ' + e);
			//throw new Error('...');
		    },
	            "success" : function(json_data) {

			//ll('SUCCESS on data');

			// Figure out if there was a parent and
			// capture the id if there was.
			var parent_id = null;
			if( json_data &&
			    json_data.responseHeader &&
			    json_data.responseHeader.params &&
			    json_data.responseHeader.params.parent ){
				parent_id = json_data.responseHeader.params.parent;
			}

			// Gather the documents found.
			var resp = new bbop.golr.response(json_data);
			var docs = resp.documents();
			var json_nodes = [];
			var each = bbop.core.each;
			each(docs,
			     function(doc){
				 json_nodes.push(_doc_to_tree_node(doc,
								   parent_id));
			     });
			
			// Alpha sort, but get GO stuff first.
			json_nodes.sort(
			    function(a, b){

				// First id suffix-ish compare (dirty)
				// for GO.
				var foo = 0;
				var a_id = a['attr']["id"].substr(0, 2);
				var b_id = b['attr']["id"].substr(0, 2);
				if (a_id == 'GO' && b_id != 'GO' ){
				    foo = -1;
				}else if (a_id != 'GO' && b_id == 'GO' ){
				    foo = 1;
				}else{
				    // Then a general suffix compare.
				    foo = a_id.localeCompare(b_id);

				    if( foo == 0 ){
					// And finally an alpha label
					// comparison.
					var a_t = a['data']['title'];
					var b_t = b['data']['title'];
					foo = a_t.localeCompare(b_t);
				    }
				}
				return foo;
			    });
			
	                return json_nodes;
	            }
	        }
	    },
	    "plugins" : ["json_data", "themeroller"]});
    // Revoved the bits that override the normal HTML click
    // functionality. Nice to know it's there though.
    //     "plugins" : ["json_data", "themeroller", "ui"]
    // }).bind("select_node.jstree",
    // 	// TODO: Probably want a callback to the server here
    // 	// to get more detailed information; just a
    // 	// placeholder linker for now.
    // 	function(e, data){
    // 	    var attr_id = data.rslt.obj[0].id;
    // 	    var linky = api.link.term({acc: attr_id});
    // 	    window.location.href = linky;
    // 	    // Or perhaps a pop-up info window?
    // 	    // var dia = '<div>' +
    // 	    // 	api.html.term_link(attr_id,
    // 	    // 			     'Link to ' + attr_id + '.') +
    // 	    // 	'</div>';
    // 	    // jQuery(dia).dialog({closeOnEscape: true,
    // 	    // 			modal: true,
    // 	    // 			title: 'Quick info about: ' + attr_id});
    // 	});

    ll('DDInit done.');
}

// Return the jsTree node defined by this single argument doc.
function _doc_to_tree_node(doc, parent_id){

    var retnode = {};

    // ID.
    var raw_id = doc['id'];
    var safe_id = raw_id; // need to process?
    retnode['attr'] = { "id" : safe_id }; 

    // Label (with fallback).
    var label = doc['label'];
    if( ! label || label == '' ){
	label = raw_id;
    }else{
	label = label + ' (' + raw_id + ')';
    }

    // Set anchor title and href.
    var detlink = linker.url(raw_id, 'term');
    retnode['data'] = {"title" : label,
		       "attr": {"href": detlink}};

    // Turn to graph, get kids.
    var graph = new bbop.model.graph();
    graph.load_json(jQuery.parseJSON(doc['topology_graph']));
    var kids = graph.get_child_nodes(doc['id']);

    // Add state and kid_query.
    if( ! kids || kids.length == 0 ){
	// No kids...
    }else{
	// No kids, make sure the node is closed.
    	retnode['state'] = 'closed';

	// Collect kid info for the query to get them later.
	var qbuff = [];
	bbop.core.each(kids,
		       function(kid){
			   qbuff.push('id:"' + kid.id() + '"');
		       });
	retnode['attr']['kid_query'] = qbuff.join(' OR ');
    }

    // If the parent_id is defined, use that to pull the relationship
    // out of the graph and get a more appropriate icon.
    if( parent_id ){

	// Try and dig out the rel to display.
	var edges = graph.get_edges(raw_id, parent_id);
	if( edges && edges.length ){
	    var weight = {
		'is_a': 3,
		'part_of': 2
	    };
	    var unknown_rel_weight = 1;
	    edges.sort(
		function(a, b){
		    var aw = weight[a.predicate_id()];
		    if( ! aw ){ aw = unknown_rel_weight; }
		    var bw = weight[b.predicate_id()];
		    if( ! bw ){ bw = unknown_rel_weight; }
		    return bw - aw;
		});

	    // Add it in a brittle way.
	    var prime_rel = edges[0].predicate_id();
	    retnode['data']['icon'] = 
	    	server_meta.image_base() + '/' + prime_rel + '.gif';
	}
    }

    return retnode;
}
