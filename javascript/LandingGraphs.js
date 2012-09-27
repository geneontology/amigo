////
//// A twiddle to see if I can get Google Charts and BBOP playing
//// nicely. They seem to want to fight over the initialization.
////
//// Trying to let Google win--when it doesn't it seems to throw a fit
//// and redirect to nothingness. WTF, Google?
////

// The Google chart bits.
google.load("visualization", "1.0", {packages:["corechart"]});
google.setOnLoadCallback(GooglesLoaderIsAJerk);
function GooglesLoaderIsAJerk(){
    
    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var am = new bbop.amigo.amigo_meta(); // resource locations
    var gconf = new bbop.golr.conf(bbop.amigo.golr_meta);
    var a_widget = bbop.golr.manager.widget.autocomplete; // nick
    var amigo = new bbop.amigo();

    ///
    /// This next section is dedicated getting the autocomplete (and
    /// associated toggle) working.
    ///

    // Widget, default personality and filter.
    function forward(doc){
	if( doc && doc['id'] && doc['document_category'] ){
	    if( doc['document_category'] == 'ontology_class' ){
		window.location.href =
		    amigo.link.term({'acc': doc['id']});
	    }else if( doc['document_category'] == 'bioentity' ){
		window.location.href =
		    amigo.link.gene_product({'acc': doc['id']});
	    }
	}
    }
    var auto = new a_widget(am.golr_base(), gconf, 'query', 'label', forward);
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class'); // non-stick

    // Make it responsive to what clas we've selected.
    jQuery('input[name="golr_class"]').each(
	function(){
	    jQuery(this).click(
		function(){
		    // Empty query.
		    jQuery('#' + 'query').val('');

		    // Set new personality and filter.
		    var flavor = jQuery(this).val();
		    auto.set_personality(flavor);
		    auto.reset_query_filters();
		    if( flavor == 'bbop_ont' ){
			auto.add_query_filter('document_category',
					      'ontology_class');
		    }else if( flavor == 'bbop_bio' ){
			auto.add_query_filter('document_category',
					      'bioentity');
		    }else{
			alert("???: " + flavor);
		    }
		});
	});

    // Reset back to first option when we leave the page. Otherwise,
    // the radio button fall out of sync wit hthe search and we search
    // for ont when on bio.
    jQuery(window).unload(
	function(){
	    auto.set_personality('bbop_ont');
	    auto.add_query_filter('document_category', 'ontology_class');
	    jQuery('input[value="bbop_ont"]').attr('checked', true);
    	});

    // Set the ball rolling (attach jQuery autocomplete to doc).
    auto.make_active();

    ///
    /// This next section is dedicated to drawing the pie charts.
    /// It uses its own trigger (reset) to pull the information.
    ///

    // We get our own manager.
    var gm_ann = new bbop.golr.manager(am.golr_base(), gconf);
    gm_ann.set_personality('bbop_ann'); // profile in gconf
    gm_ann.add_query_filter('document_category', 'annotation', ['*']);
    
    // Set the callback.
    gm_ann.register('reset', 'foo', GraphDataCallback);

    // Render the charts with the data we're going to get from the
    // GOlr manager.
    function GraphDataCallback(json_data, manager){
    
	// Collect the data to display.
	var resp = bbop.golr.response;
	var count = resp.total_documents(json_data);
	var facet_list = resp.facet_field_list(json_data);

	// source data setup.
	var raw_data_01 = resp.facet_field(json_data, 'source');
	var data_01 = google.visualization.arrayToDataTable(raw_data_01);
	var options_01 = { 'title': 'Sources (' + count + ')',
			   'width': 400, 'height': 300 };	
	// Rendering.
	var elt_01 = document.getElementById('graph_01');
	var chart_01 = new google.visualization.PieChart(elt_01);
	chart_01.draw(data_01, options_01);	

	// evidence_type data setup.
	var raw_data_02 = resp.facet_field(json_data, 'evidence_type');
	var data_02 = google.visualization.arrayToDataTable(raw_data_02);
	var options_02 = { 'title': 'Evidence (' + count + ')',
			   'width': 400, 'height': 300 };	
	// Rendering.
	var elt_02 = document.getElementById('graph_02');
	var chart_02 = new google.visualization.PieChart(elt_02);
	chart_02.draw(data_02, options_02);	
    }

    // Trigger the data call and the draw (above).
    gm_ann.reset();
}
