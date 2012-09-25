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
    var gm = new bbop.amigo.amigo_meta();
    var gconf = new bbop.golr.conf(bbop.amigo.golr_meta);
    var gm_ann = new bbop.golr.manager(gm.golr_base(), gconf);
    gm_ann.set_personality('bbop_ann'); // profile in gconf
    gm_ann.add_query_filter('document_category', 'annotation', ['*']);

    // Set the callback.
    gm_ann.register('reset', 'foo', DataCallback);

    // Render the charts with the data we're going to get from the
    // GOlr manager.
    function DataCallback(json_data, manager){
    
	// Collect the data to display.
	var resp = bbop.golr.response;
	var count = resp.total_documents(json_data);
	var facet_list = resp.facet_field_list(json_data);

	// source data setup.
	var raw_data_01 = resp.facet_field(json_data, 'source');
	var data_01 = google.visualization.arrayToDataTable(raw_data_01);
	var options_01 = { 'title': 'Sources', 'width': 400, 'height': 300 };	
	// Rendering.
	var elt_01 = document.getElementById('graph_01');
	var chart_01 = new google.visualization.PieChart(elt_01);
	chart_01.draw(data_01, options_01);	

	// evidence_type data setup.
	var raw_data_02 = resp.facet_field(json_data, 'evidence_type');
	var data_02 = google.visualization.arrayToDataTable(raw_data_02);
	var options_02 = { 'title': 'Evidence', 'width': 400, 'height': 300 };	
	// Rendering.
	var elt_02 = document.getElementById('graph_02');
	var chart_02 = new google.visualization.PieChart(elt_02);
	chart_02.draw(data_02, options_02);	
    }

    // Trigger the data call and the draw (above).
    gm_ann.reset();
}
