////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

function BrowseInit(){
    
    // Don't need much since we're going straight after IDs.
    var am = new bbop.amigo.amigo_meta(); // resource locations
    var gconf = new bbop.golr.conf(bbop.amigo.golr_meta);
    var b_widget = bbop.golr.manager.widget.browse;
    //var amigo = new bbop.amigo();

    // Setup.
    var b = new b_widget(am.golr_base(), gconf, 'browser_id');
    b.draw_browser('GO:0008150');
}
