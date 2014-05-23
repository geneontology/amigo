////
//// 
//// 

// Run the layout after everything is loaded.
function PT(){

    ///
    
    // Example graph hand loaded through tree.
    var r0 = new bbop.widget.phylo_old.renderer('pgraph_0', true);
    
    bbop.core.each(global_graph['nodes'],
		   function(n){
		       var nid = n['id'];
		       var nlbl = n['lbl'];
		       var nmeta = n['meta'];

		       var node = new bbop.model.tree.node(nid);
		       if( nlbl ){ node.label(nlbl); }
		       if( nmeta ){ node.metadata(nmeta); };

		       r0.add_node(node);
		   });
    bbop.core.each(global_graph['edges'],
		   function(e){

		       var dist = 0.0;
		       var edge =
			   new bbop.model.tree.edge(e['sub'], e['obj'], dist);

		       if( e['meta'] ){
			   edge.metadata(e['meta']);
			   if( e['meta']['distance'] ){
			       dist = parseFloat(e['meta']['distance']);
			       edge.distance(dist);
			   }
		       }

		       r0.add_edge(edge);
		   });

    // Set settable rendering properties.
    r0.use_animation = true;
    r0.box_width = 115;
    r0.box_height = 25;

    // Display.
    r0.display();
}
