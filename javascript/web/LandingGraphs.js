////
//// A twiddle to see if I can get Google Charts and BBOP playing
//// nicely. They seem to want to fight over the initialization.
////
//// Trying to let Google win--when it doesn't it seems to throw a fit
//// and redirect to nothingness. WTF, Google?
////

function LandingGraphsInit(){
    
    // For debugging.
    var logger = new bbop.logger('LG: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    // Setup the annotation profile and make the annotation document
    // category and the current acc sticky in the filters.
    var sd = new amigo.data.server(); // resource locations
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var a_widget = bbop.widget.search_box; // nick
    var linker = new amigo.linker();

    ///
    /// This next section is dedicated getting the autocomplete (and
    /// associated toggle) working.
    ///

    //
    jQuery('input:submit').prop('disabled', false);

    // Widget, default personality and filter.
    function forward(doc){
	if( doc && doc['id'] && doc['document_category'] ){
	    if( doc['document_category'] == 'ontology_class' ){
		window.location.href =
		    linker.url(doc['id'], 'term');
	    }else if( doc['document_category'] == 'bioentity' ){
		window.location.href =
		    linker.url(doc['id'], 'gp');
	    }
	}
    }

    // Set for the initial search box autocompleter.
    var ont_args = {
	'label_template':
	'{{annotation_class_label}} ({{id}})',
	'value_template': '{{annotation_class}}',
	'list_select_callback': forward
    };
    var bio_args = {
	'label_template':
	'{{bioentity_label}} ({{id}}/{{taxon_label}})',
	'value_template': '{{bioentity}}',
	'list_select_callback': forward
    };
    var auto = new a_widget(sd.golr_base(), gconf, 'query', ont_args);
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class'); // non-stick

    // Set bbop_ont as the default checked.
    jQuery('input[value="bbop_ont"]').attr('checked', true);

    // Make it responsive to what class we've selected by clicks.
    jQuery('input[name="golr_class"]').each(
	function(){
	    // Do the following when we click on a category.
	    jQuery(this).click(
		function(){
		    // Empty query box.
		    jQuery('#' + 'query').val('');

		    // Figure out what the new personality will be.
		    var flavor = jQuery(this).val();

		    // Destroy the old autocompleter and create a new
		    // one with the correct properties.
		    auto.destroy();

		    // Set new personality and filter for the
		    // search_box/manager.
		    if( flavor == 'bbop_ont' ){
			auto = new a_widget(sd.golr_base(), gconf, 'query',
					    ont_args);
			auto.set_personality(flavor);
			auto.add_query_filter('document_category',
					      'ontology_class');
		    }else if( flavor == 'bbop_bio' ){
			auto = new a_widget(sd.golr_base(), gconf, 'query',
					    bio_args);
			auto.set_personality(flavor);
			auto.add_query_filter('document_category',
					      'bioentity');
		    }else{
			alert("???: " + flavor);
		    }
		});
	});
}

// // The Google chart bits.
// google.load("visualization", "1.0", {packages:["corechart"]});
// google.setOnLoadCallback(GooglesLoaderIsAJerk);
// function GooglesLoaderIsAJerk(){

//     ///
//     /// This next section is dedicated to drawing the pie charts.
//     /// It uses its own trigger (reset) to pull the information.
//     ///
    
//     // Rendering.
//     var asrc = amigo.data.statistics.annotation_source;
//     var data_01 = google.visualization.arrayToDataTable(asrc, true);
//     var options_01 = { 'title': 'Sources', // (' + count + ')',
// 		       'width': 400, 'height': 300 };
//     var elt_01 = document.getElementById('graph_01');
//     var chart_01 = new google.visualization.PieChart(elt_01);
//     chart_01.draw(data_01, options_01);	

//     // Rendering.
//     var aev = amigo.data.statistics.annotation_evidence;
//     var data_02 = google.visualization.arrayToDataTable(aev, true);
//     var options_02 = { 'title': 'Evidence Overview', // (' + count + ')',
// 		       'width': 400, 'height': 300 };
//     var elt_02 = document.getElementById('graph_02');
//     var chart_02 = new google.visualization.PieChart(elt_02);
//     chart_02.draw(data_02, options_02);
    

// 	    // source data setup.
//     var aov = amigo.data.statistics.annotation_overview;
//     var data_03 = google.visualization.arrayToDataTable(aov);
//     var options_03 =
// 	{
// 	    'title': 'Annotations',
// 	    'width': 800, 'height': 500,
// 	    'isStacked': true, 'legend': 'bottom',
// 	    'vAxis': {'title': 'Number of annotations'}
// 	};
//     // Rendering.
//     var elt_03 = document.getElementById('graph_03');
//     var chart_03 = new google.visualization.ColumnChart(elt_03);
//     chart_03.draw(data_03, options_03);	
    
// }
