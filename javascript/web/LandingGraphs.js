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
    var a_widget = bbop.widget.autocomplete; // nick
    var linker = new amigo.linker();

    ///
    /// This next section is dedicated getting the autocomplete (and
    /// associated toggle) working.
    ///

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
    var auto = new a_widget(sd.golr_base(), gconf, 'query', 'label', forward);
    auto.set_personality('bbop_ont'); // profile in gconf
    auto.add_query_filter('document_category', 'ontology_class'); // non-stick

    //
    jQuery('input[value="bbop_ont"]').attr('checked', true);


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

    // // Reset back to first option when we leave the page. Otherwise,
    // // the radio button fall out of sync wit hthe search and we search
    // // for ont when on bio.
    // jQuery(window).unload(
    // 	function(){
    // 	    auto.set_personality('bbop_ont');
    // 	    auto.add_query_filter('document_category', 'ontology_class');
    // 	    //alert('unloading');
    // 	});

    ///
    /// This next section is dedicated to drawing the pie charts.
    /// It uses its own trigger (reset) to pull the information.
    ///

    // We get our own manager.
    var gm_ann = new bbop.golr.manager.jquery(sd.golr_base(), gconf);
    gm_ann.set_personality('bbop_ann'); // profile in gconf
    gm_ann.add_query_filter('document_category', 'annotation', ['*']);
    
    // Set the callback.
    gm_ann.register('reset', 'foo', GraphDataCallback);

    // Render the charts with the data we're going to get from the
    // GOlr manager.
    function GraphDataCallback(json_data, manager){
    
	// Collect the data to display.
	var resp = new bbop.golr.response(json_data);
	var count = resp.total_documents();
	var facet_list = resp.facet_field_list();

	// source data setup.
	var raw_data_01 = resp.facet_field('source');
	var data_01 = google.visualization.arrayToDataTable(raw_data_01);
	var options_01 = { 'title': 'Sources (' + count + ')',
			   'width': 400, 'height': 300 };	
	// Rendering.
	var elt_01 = document.getElementById('graph_01');
	var chart_01 = new google.visualization.PieChart(elt_01);
	chart_01.draw(data_01, options_01);	

	// evidence_type data setup.
	var raw_data_02 = resp.facet_field('evidence_type_closure');
	var data_02 = google.visualization.arrayToDataTable(raw_data_02);
	var options_02 = { 'title': 'Evidence (' + count + ')',
			   'width': 400, 'height': 300 };	
	// Rendering.
	var elt_02 = document.getElementById('graph_02');
	var chart_02 = new google.visualization.PieChart(elt_02);
	chart_02.draw(data_02, options_02);	

	///
	/// Okay, let's tran and mimic Mike's graphs from Caltech 2012.
	/// http://wiki.geneontology.org/index.php/File:GO-annotations.201201008.pdf
	///

	// Setup what data we will want and a variable to catch it in
	// a table-like form for graphing later.
	var our_sources = ['MGI', 'ZFIN', 'PomBase', 'dictyBase'];
	var our_ev = [
	    'author statement',
	    'biological system reconstruction',
	    'combinatorial evidence',
	    'curator inference',
	    'experimental evidence',
	    'genomic context evidence',
	    'imported information',
	    'similarity evidence'
	];
	var our_ev_copy = bbop.core.clone(our_ev);
	our_ev_copy.unshift('Source');
	var agg_data_03 = [our_ev_copy];

	// Gather the URLs for the data we want to look at.
	bbop.core.each(our_sources,
    		       function(isrc){
    			   gm_ann.reset_query_filters();
    			   gm_ann.add_query_filter('source', isrc);
    			   gm_ann.add_to_batch();
    		       });

	// Create a function to collect the data to display.
	// This will be run on every url collected above.
	var our_accumulator = function(json_data, manager){

	    var resp = new bbop.golr.response(json_data);
	    
	    // The evidence facet.
	    var facet_list = resp.facet_field_list();
	    var ev_fasc_hash = resp.facet_counts()['evidence_type_closure'];

	    // Recover the current source from the response.
	    var fqs = resp.query_filters();
	    var src = bbop.core.get_keys(fqs['source'])[0];

	    // Data row assembly.
	    var row_cache = [src];
	    bbop.core.each(our_ev,
			   function(e){
			       var ev_cnt = ev_fasc_hash[e] || 0;
			       ll('  ' + e + ': ' + ev_cnt);
			       row_cache.push(ev_cnt);
			   });
	    agg_data_03.push(row_cache);
	};

	// Our final (drawing) routine; to be run when all of the
	// above data has been collected.
	var our_final = function(){

	    ll('Graphing collected data.');

	    // source data setup.
	    var data_03 = google.visualization.arrayToDataTable(agg_data_03);
	    var options_03 =
		{
		    'title': 'Annotations',
		    'width': 700, 'height': 500,
		    'isStacked': true, 'legend': 'bottom',
		    'vAxis': {'title': 'Number of annotations'}
		};
	    // Rendering.
	    var elt_03 = document.getElementById('graph_03');
	    var chart_03 = new google.visualization.ColumnChart(elt_03);
	    chart_03.draw(data_03, options_03);	
	};

	// Trigger the batch events.
	gm_ann.run_batch(our_accumulator, our_final);
    }

    // Trigger the data call and the draw (above).
    gm_ann.reset();
}
