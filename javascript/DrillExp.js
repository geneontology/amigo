////
//// A simple try at a more modern naive drill-down ontology browser.
////

// Logger for all functions.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('DD: ' + str); }    

// AmiGO helpers.
var amigo = new bbop.amigo();
var go_meta = new bbop.amigo.go_meta();
var solr_server = go_meta.golr_base();

// Go and get the initial results for building our tree.
function DDInit(){

    ll('');
    ll('DrillExp.js');
    ll('DDInit start...');

    // Define the manager.
    var filters = {
	'document_category': 'ontology_class',
	'is_obsolete': 'false'
    };
    var gm = new GOlrManager({url: solr_server, filters: filters});
    
    // Let's limit ourselves to 100 rows returned.
    gm.set('rows', 100);

    // Let's capture an initial url, then reset.
    gm.set_extra("&fq=-isa_partof_closure:[*%20TO%20*]");
    var reset_url = gm.get_query_url();
    gm.set_extra("");

    // Ready tree with response.
    var did = '#drilldown';
    jQuery(did).jstree(
	{
	    "json_data" : {
	        "ajax" : {
		    "type": 'GET',
		    "dataType": 'json',
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
			    //ll('kids: ' + n.attr('kids').length);
			}
			ll('try url: ' + retval);
	                return retval;
	            },
	            "error" : function(e) {
			ll('ERROR: ' + e);
			//throw new Error('...');
		    },
	            "success" : function(jdata) {

			// Figure out if there was a parent and
			// capture the id if there was.
			var parent_id = null;
			if( jdata &&
			    jdata.responseHeader &&
			    jdata.responseHeader.params &&
			    jdata.responseHeader.params.parent ){
				parent_id = jdata.responseHeader.params.parent;
			}

			// Gather the documents found.
			var docs = amigo.golr_response.documents(jdata);
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
	    "plugins" : ["json_data", "themeroller"]
	}).bind("select_node.jstree",
		function(e, data){
		    alert(data.rslt.obj.data("id"));
		});

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
    retnode['data'] = {"title" : label};

    // Turn to graph, get kids.
    var graph = new bbop.model.graph();
    graph.load_json(jQuery.parseJSON(doc['graph']));
    var kids = graph.get_child_nodes(doc['id']);

    // Add state and kid_query.
    if( ! kids || kids.length == 0 ){
	// ...
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

	// Try and dig out the rel.
	var isa_edge = graph.get_edge(raw_id, parent_id, 'is_a');
	var partof_edge = graph.get_edge(raw_id, parent_id, 'part_of');

	// Add icon property if there is a rel.
	if( isa_edge ){
	    retnode['data']['icon'] = 
	    	go_meta.image_base() + '/is_a.gif';
	}else if( partof_edge ){
	    retnode['data']['icon'] = 
	    	go_meta.image_base() + '/part_of.gif';
	}else{
	    retnode['data']['icon'] = 
	    	go_meta.image_base() + '/warning.png';
	}
    }

    return retnode;
}
