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

	// Extract data.
	var term_to_draw = doc['annotation_class'];
	var graph_json = doc['topology_graph_json'];

	// Add to global graph.
	var new_graph = new bbop.model.graph();
	new_graph.load_json(JSON.parse(graph_json));
	add_to_graph(new_graph, term_to_draw);

	// Figure out layout.
	var lchoice = jQuery('#layout_input').val();

	// Render.
	CytoDraw(graph, bbop.core.get_keys(focus_nodes),
		 lchoice, context, 'grcon',
		 _start_wait, _stop_wait, _data_call);
    }

    function on_list_select(doc){
	var term_to_draw = doc['annotation_class'];
	jQuery('#jumper').val(term_to_draw);
    }

    // Define spinner and helper functions; stop first wait.
    var spin =
	new bbop.widget.spinner("spn", sd.image_base() + '/waiting_ajax.gif',
				{'visible_p': false});
    function _start_wait(){
	spin.show();
    }
    function _stop_wait(){
	spin.hide();
    }

    //
    var man = new bbop.golr.manager.jquery(sd.golr_base(), gconf);
    man.add_query_filter('document_category', 'ontology_class');
    man.set_personality('ontology');
    man.register('search', 'foo',
		 function(response, manager){
		     var doc = response.get_doc(0);
		     jumper(doc);
		 });
    // Function to use for data calls in the cytoscape renderer.
    function _data_call(nid){
	man.set_id(nid);
	man.search();
    }

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
