////
//// 
//// 

// Run the layout after everything is loaded.
function PT(){

    ///
    
    // Example graph hand loaded through tree.
    var r0 = new bbop.render.phylo.renderer('pgraph_0', true);
    
    bbop.core.each(global_graph['nodes'],
		   function(n){
		       r0.add_node(n['id']);		       
		   });
    bbop.core.each(global_graph['edges'],
		   function(e){
		       r0.add_edge(e['sub'], e['obj'], parseFloat(e['meta']));
		   });

    // Set settable rendering properties.
    r0.use_animation = true;
    r0.box_width = 115;
    r0.box_height = 25;

    // Display.
    r0.display();
}
