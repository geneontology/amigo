#!/usr/bin/rhino
/* 
 * Package: generate_general_statistics.js
 * 
 * This is a Rhino script.
 * 
 * Generate a whole huge chunk of data for others to work
 * with. Hard-wired to our public beta server.
 * 
 * Usage like:
 *  : generate_general_statistics.js --ann-source
 *  : generate_general_statistics.js --ann-evidence
 *  : generate_general_statistics.js --ann-assigned-by
 *  : generate_general_statistics.js --ann-overview
 * 
 * WARNING: in all likelihood, usage will actually look like:
 *  : rhino -opt -1 ./generate_static_data.js --ann-source
 * This is because the static checking has a hard time with some of the 
 * code that we use (I suspect in the global namespace).
 */

///
/// First section for invariant bits that don't change across calls.
///

// Load the base files.
load('../../_data/bbop.js');
load('../staging/amigo.js');

// For debugging.
var logger = new bbop.logger('statistics');
logger.DEBUG = true;
function ll(str){
    logger.kvetch(str);
}
    
// Aliases.
var each = bbop.core.each;

// We get our own manager.
//var gserv = new amigo.data.server();
var gconf = new bbop.golr.conf(amigo.data.golr);
var gm_ann = new bbop.golr.manager.rhino('http://golr.berkeleybop.org/', gconf);
gm_ann.debug(false);

// Set ourselves to annotations.
if( ! gm_ann.set_personality('bbop_ann') ){ // profile in gconf
    throw new Error('There seems to have been an ERROR in the YAML loader...');
}
gm_ann.add_query_filter('document_category', 'annotation', ['*']);

// Get all the facets--everything.
gm_ann.set_facet_limit(-1);

// A setup for our data for gnuplot like:
// http://gnuplot.sourceforge.net/demo/histograms.html
//var columns = ['AXES'];
//var rows = []; // first column will be label; like [[foo 1 2], [bar, 3, 4], ...]

// We will want to filter ECO a bit.
// The is for the ann-overview mode.
var our_ev_of_interest = [
    'similarity evidence', // okay
    'experimental evidence', // okay
    'curator inference', // okay
    'author statement',
    'combinatorial evidence',
    'genomic context evidence',
    'biological system reconstruction',
    'imported information'
];
	    
// Get the flag for what we'll be doing.
// var flag = arguments[arguments.length -1];
for( var flag_index = 0; flag_index <= (arguments.length -1); flag_index++ ){
    var arg = arguments[flag_index];
    //ll('arg: ' + arg);

    if( arg == '--ann-source' ||
	arg == '--ann-assigned-by' ||
	arg == '--ann-evidence' ){

	///
	/// These two are for our "pie" chart class stuff: annotation
	/// source and annotation evidence break-downs.
	///

	// General annotation data setup for both categories.
	var resp = gm_ann.fetch();
	var count = resp.total_documents();
	var facet_list = resp.facet_field_list();
	var raw_data = null;
	
	// Annotation source is easy, but we want to slim evidence
	// down to the slim defined above.
	if( arg == '--ann-source' ){
	    raw_data = resp.facet_field('source');
	}else if( arg == '--ann-assigned-by' ){
	    raw_data = resp.facet_field('assigned_by');
	}else if( arg == '--ann-evidence' ){
	    
	    var raw_data_pre = resp.facet_field('evidence_type_closure');
	    var our_ev_hash = bbop.core.hashify(our_ev_of_interest);
	    raw_data =
		bbop.core.pare(raw_data_pre,
			       function(item, index){
				   var ret = true;
				   if( our_ev_hash[item[0]] ){
				       ret = false;
				   }
				   return ret;
			       });
	}
	
	// Sort and print out whatever we got above
	if( raw_data ){	    
	    raw_data.sort(function(a, b){
			      var val_a = a[1];
			      var val_b = b[1];
			      return val_b - val_a;
			  });
	}
	// Print a header row, then the rest.
	print("AXES\tCount");
	each(raw_data,
	     function(line){
		 print(line[0] + "\t" + line[1]);
	     });
	
    }else if( arg == '--ann-overview' ){
	
	///
	/// This is a more complicated collection that requires
	/// multiple passes to get.
	///

	// First, get all of our possible sources.
	var resp = gm_ann.fetch();
	//var count = resp.total_documents();
	var facet_list = resp.facet_field_list();
	var source_data = resp.facet_field('source');	
	var our_sources_of_interest = [];
	each(source_data,
	     function(src_facet){
		 our_sources_of_interest.push(src_facet[0]);
	     });

	// Now setup what data we will want and a variable to catch it
	// in a table-like form for graphing later.
	var our_ev_of_interest_copy = bbop.core.clone(our_ev_of_interest);
	//our_ev_of_interest_copy.unshift('Source');
	//var agg_data_03 = [our_ev_of_interest_copy];
	//var agg_data_03 = [];

	// Cycle over the sources we want to look at while collecting
	// data.
	print('AXES' + "\t" + our_ev_of_interest.join("\t"));
	// each([our_sources_of_interest[0],
	//       our_sources_of_interest[1]],
	each(our_sources_of_interest,
	     function(isrc){
    		 gm_ann.reset_query_filters();
    		 gm_ann.add_query_filter('source', isrc);
		 
		 // ll('isrc: ' + isrc);
		 
		 var resp = gm_ann.fetch();
		 // The evidence facet.
		 var facet_list = resp.facet_field_list();
		 var ev_fasc_hash =
		     resp.facet_counts()['evidence_type_closure'];
	 
		 // // Recover the current source from the response.
		 //var fqs = resp.query_filters();
		 //var src = bbop.core.get_keys(fqs['source'])[0];
	 
		 // ll('ev_fasc_hash: ' + bbop.core.dump(ev_fasc_hash));
		 
		 // Data row assembly.
		 var row_cache = [isrc];
		 bbop.core.each(our_ev_of_interest,
				function(e){
				    var ev_cnt = ev_fasc_hash[e] || 0;
				    //print(isrc + "\t" + e + "\t" + ev_cnt);
				    //print("\n");
				    row_cache.push(ev_cnt);
				});
		 print(row_cache.join("\t"));
	     });
	
	//print(bbop.core.dump(agg_data_03));
	
    }
}
