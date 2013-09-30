function PhyloGraphInit(){
    
    var server_meta = new amigo.data.server();
    var gloc = server_meta.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    
    var r = new bbop.widget.phylo.renderer('test0', gloc, gconf);

    // Either directly start the render with the global ID or add a listener
    // to the selection.
    if( global_family && global_family != '' ){
	r.show_family("PANTHER:" + global_family);
    }else{
	jQuery("#family_id").change(
	    function() {
		r.show_family("PANTHER:"+ jQuery("#family_id :selected").val());
	    });
	jQuery("#family_id").change();	
    }
}
