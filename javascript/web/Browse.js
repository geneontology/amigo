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
    // Alias.
    var loop = bbop.core.each;

    ///
    /// The info shield.
    ///

    var linker = new amigo.linker();
    var shield = new bbop.widget.term_shield(sd.golr_base(), gconf,
					     {'linker_function': linker });
    shield.set_personality('bbop_ont');

    ///
    /// The tree browser.
    ///

    // Setup the widget with the server info.
    // Launch at a root with a boring callback.
    var b_widget = bbop.widget.browse;
    var b =
	new b_widget(sd.golr_base(), 
		     gconf, 
		     'browser_id',
		     {
			 'base_icon_url': sd.image_base(),
			 'info_icon': 'info',
			 'current_icon': 'current_term',
			 'image_type': 'gif',
			 'info_button_callback':
			 function(term_acc, term_doc){
			     // // Local form.
			     // shield.draw(term_doc);
			     // Remote form (works).
			     shield.draw(term_acc);
			 }
		     });
    b.draw_browser('GO:0008150');

    ///
    /// Ontologies shortcut selector buttons.
    ///

    // id and term are different since there might be HTML naming
    // problems with some ids.
    var shortcuts = [
	{
	    id: 'bp',
	    label: 'biological process',
	    term: 'GO:0008150'
	},
	{
	    id: 'cc',
	    label: 'cellular component',
	    term: 'GO:0005575'
	},
	{
	    id: 'mf',
	    label: 'molecular function',
	    term: 'GO:0003674'
	}
    ];

    // First, go through and add all of our shortcuts to the page.
    loop(shortcuts,
	 function(shortcut){
	     var sid = shortcut['id'];
	     var term = shortcut['term'];
	     var label = shortcut['label'];

	     // 
	     var itag = new bbop.html.input({id: sid, type: 'radio',
					     name: 'graph_radio'});
	     var ltag = new bbop.html.tag('label', {for: sid}, label);
	     jQuery("#graph_radio").append(itag.to_string());
	     jQuery("#graph_radio").append(ltag.to_string());
	 });

    // Now, make our different shortcut buttons active.
    jQuery("#graph_radio").buttonset();
    loop(shortcuts,
	 function(shortcut){
	     var sid = shortcut['id'];
	     var term = shortcut['term'];
	     jQuery('#' + sid).click(function(){ b.draw_browser(term); });
	 });

    // Finally, start the first draw with an artificial click on the
    // first shortcut button.
    var start_id = shortcut[0]['id'];
    jQuery('#' + start_id).click();

    ///
    /// The autocomplete talking back to the tree browser.
    ///

    jQuery('#' + 'jumper').click(function(){ jQuery(this).val(''); }); // clear
    function jumper(doc){ b.draw_browser(doc['id']); }
    var a_widget = bbop.widget.search_box;
    var auto = new a_widget(sd.golr_base(), gconf, 'jumper',
			    {
				'label_template':
				'{{annotation_class_label}} ({{id}})',
				'value_template': '{{annotation_class}}',
				'list_select_callback': jumper
			    });
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class');
}
