////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

function DDBrowseInit(){
    
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

    ///
    /// The info shield.
    ///

    var linker = new amigo.linker();
    var shield = new bbop.widget.term_shield(sd.golr_base(), gconf,
					     {'linker_function': linker});
    shield.set_personality('ontology');

    // Convert a term callback into the proper json.
    function _term2json(doc){

	// Extract the intersting graphs.
	var topo_graph_field = 'topology_graph_json';
	var trans_graph_field = 'regulates_transitivity_graph_json';
	var topo_graph = new bbop.model.graph();
	topo_graph.load_json(JSON.parse(doc[topo_graph_field]));
	var trans_graph = new bbop.model.graph();
	trans_graph.load_json(JSON.parse(doc[trans_graph_field]));

	//console.log('topo: ' + doc[topo_graph_field]);

	//
	//var kids = trans_graph.get_child_nodes(doc['id']), function(kid){
	var kids_p = false;
	var kids = [];
	each(topo_graph.get_child_nodes(doc['id']), function(kid){
	    kids.push({
		'id': kid.id(),
		'text': kid.label() || kid.id()
	    });
	});
	if( kids.length > 0 ){
	    kids_p = true;
	};

	var tmpl = {
	    'id': doc['id'],
	    'text': doc['annotation_class_label'] || doc['id'],
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

	// Extract the intersting graphs.
	var topo_graph_field = 'topology_graph_json';
	var trans_graph_field = 'regulates_transitivity_graph_json';
	var topo_graph = new bbop.model.graph();
	topo_graph.load_json(JSON.parse(doc[topo_graph_field]));
	var trans_graph = new bbop.model.graph();
	trans_graph.load_json(JSON.parse(doc[trans_graph_field]));

	//console.log('topo: ' + doc[topo_graph_field]);

	//
	//var kids = trans_graph.get_child_nodes(doc['id']), function(kid){
	var kids = [];
	each(topo_graph.get_child_nodes(doc['id']), function(kid){
	    kids.push({
		'id': kid.id(),
		'text': kid.label() || kid.id(),
		//'icon': "string",
		'state': {
		    'opened': false,
		    'disabled': false,
		    'selected': false
		},
		'children': true,
		'li_attr': {},
		'a_attr': {}
	    });
	});

	return kids;
    }

    ///
    /// The manager.
    ///

    // Ready the manager.
    var search = new bbop.golr.manager.jquery(sd.golr_base(), gconf);
    var personality = 'ontology';
    var confc = gconf.get_class(personality);
    search.set_personality(personality);
    search.add_query_filter('document_category',
			    confc.document_category(), ['*']);

    search.register('search', 'foo', function(resp, man){

	// Verify and extract initial response.
	if( resp && resp.documents() && resp.documents().length ){

	    var roots = [];
	    each(resp.documents(), function(doc){
		var json = _term2json(doc);
		roots.push(json);
	    });

	    //console.log(JSON.stringify(json));

	    // Render initial widget.
	    jQuery('#' + "dd_browser_id").jstree({
		'core': {
		    'data': function(jstree_node, cb){
			console.log("node work: " + jstree_node.id);
			if( jstree_node.id === "#" ){
			    cb(roots);
			}else{
			    //console.log("bang: " + jstree_node);
			    var csearch =
				    new bbop.golr.manager.jquery(sd.golr_base(),
								 gconf);
			    var confc = gconf.get_class(personality);
			    csearch.set_personality(personality);
			    csearch.add_query_filter('document_category',
						     confc.document_category(),
						    ['*']);
			    csearch.register('search','foo',function(resp,man){
				var children = [];
				if( resp && resp.documents() &&
				    resp.documents()[0] ){
					children =
					    _desc2json(resp.documents()[0]);
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

    // Initial trigger.
    search.set_ids(['GO:0008150', 'GO:0005575', 'GO:0003674']);
    search.search();

    ///
    /// The tree browser.
    ///


 // [
 // 		{
 // 		    "text" : "Root node", "children" : [
 // 			{ "text" : "Child node 1" },
 // 			{ "text" : "Child node 2" }
 // 		    ]
 // 		}
 // 	    ]
 // 	}
 //    });
}
