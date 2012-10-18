////
//// See if we can get a more sensible JS-based ontology browser
//// working.
////

function BrowseInit(){
    
    ///
    /// General setup--resource locations.
    /// Solr server, GOlr config, etc.
    ///

    var sd = new amigo.data.server();
    var gconf = new bbop.golr.conf(amigo.data.golr);

    ///
    /// The tree browser.
    ///

    // Setup the widget with the server info.
    // Launch at a root with a boring callback.
    var linker = new amigo.linker();
    var cclass = gconf.get_class('bbop_ont');
    var b_widget = bbop.widget.browse;
    var b =
	new b_widget(sd.golr_base(), gconf, 'browser_id',
		     function(term_acc, term_doc){
			 // Local form.
			 new bbop.widget.term_shield(term_doc, linker, cclass);
			 // Remote form.
			 // new bbop.widget.term_shield(term_acc, linker,
			 // 			     cclass, sd.golr_base());
		     } );
    b.draw_browser('GO:0008150');

    ///
    /// Ontology selector.
    ///

    jQuery("#graph_radio").buttonset();
    var loop = bbop.core.each;
    loop(['bp', 'cc', 'mf'],
	 function(ont){
	     jQuery('#'+ont).click(function(){
				       var o = jQuery(this).attr('id');
				       if( o == 'bp' ){
					   b.draw_browser('GO:0008150');
				       }else if( o == 'cc' ){
					   b.draw_browser('GO:0005575');
				       }else{
					   b.draw_browser('GO:0003674');
				       }
				   });
	 });

    ///
    /// The autocomplete talking back to the tree browser.
    ///

    jQuery('#' + 'jumper').click(function(){ jQuery(this).val(''); }); // clear
    function jumper(doc){ b.draw_browser(doc['id']); }
    var a_widget = bbop.widget.autocomplete;
    var auto = new a_widget(sd.golr_base(), gconf, 'jumper', 'label', jumper);
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class');
}
