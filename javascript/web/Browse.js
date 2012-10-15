////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

function BrowseInit(){
    
    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    var amigo = new bbop.amigo();
    var am = new bbop.amigo.amigo_meta();
    var gconf = new bbop.golr.conf(bbop.amigo.golr_meta);

    ///
    /// The tree browser.
    ///

    // Setup the widget with the server info.
    // Launch at a root with a boring callback.
    var b_widget = bbop.golr.manager.jquery.browse;
    var b = new b_widget(am.golr_base(), gconf, 'browser_id',
			 function(term_acc){ alert('info: '+ term_acc); } );
    b.draw_browser('GO:0008150');

    ///
    /// The autocomplete talking back to the tree browser.
    ///

    jQuery('#' + 'jumper').click(function(){ jQuery(this).val(''); }); // clear
    function jumper(doc){ b.draw_browser(doc['id']); }
    var a_widget = bbop.golr.manager.widget.autocomplete;
    var auto = new a_widget(am.golr_base(), gconf, 'jumper', 'label', jumper);
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class');
}
