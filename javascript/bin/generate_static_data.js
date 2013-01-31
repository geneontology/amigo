#!/usr/bin/rhino
/* 
 * Package: generate_static_data.js
 * 
 * This is a Rhino script.
 * 
 * Generate the static data necessary to run the AmiGO 2 graphs once
 * up front (don't need it dynamic since it only changes on reload).
 * 
 * Usage like:
 *  : generate_static_data.js --ann-source
 *  : generate_static_data.js --ann-evidence
 *  : generate_static_data.js --ann-overview
 */

///
/// First section for invariant bits that don't change across calls.
///

// Load the base files.
load('../../_data/bbop.js');
load('../staging/amigo.js');

// For debugging.
var logger = new bbop.logger('static data gen');
logger.DEBUG = true;
function ll(str){
    logger.kvetch(str);
}
    
// We get our own manager.
var gserv = new amigo.data.server();
var gconf = new bbop.golr.conf(amigo.data.golr);
var gm_ann = new bbop.golr.manager.rhino(gserv.golr_base(), gconf);
gm_ann.debug(false);
gm_ann.set_facet_limit(-1);
if( ! gm_ann.set_personality('bbop_ann') ){ // profile in gconf
    //ll('There seems to have been an ERROR in the YAML loader...');
    throw new Error('There seems to have been an ERROR in the YAML loader...');
}
var loop = bbop.core.each;

// Let's constrain things a bit for the sake of clarity.
var our_sources_of_interest = [
    'dictyBase',
    'EcoCyc',
    'FlyBase',
    'MGI',
    'PomBase',
    'RGD',
    'SGD',
    'TAIR',
    'WB',
    'ZFIN'
];
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

    if( arg == '--ann-source' || arg == '--ann-evidence' ){

	///
	/// These two are for our "pie" chart class stuff: annotation
	/// source and annotation evidence break-downs.
	///

	// General annotation data setup for both categories.
	gm_ann.add_query_filter('document_category', 'annotation', ['*']);
	var resp = new bbop.golr.response(gm_ann.fetch());
	var count = resp.total_documents();
	var facet_list = resp.facet_field_list();
	var raw_data = null;
	
	// Annotation source is easy, but we want to slim evidence
	// down to the slim defined above.
	if( arg == '--ann-source' ){
	    raw_data = resp.facet_field('source');
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

	// // Dump out the data we collected.
	// function ddump(data){
	//     loop(data,
	// 	 function(item, index){
	// 	     var f = item[0];
	// 	     var c = item[1];
	// 	     print('' + f + ': ' + c);
	// 	 }
	// 	);
	// }
	// ddump(raw_data);
	if( raw_data ){	    
	    raw_data.sort(function(a, b){
			      var val_a = a[1];
			      var val_b = b[1];
			      return val_b - val_a;
			  });
	}
	print(bbop.core.dump(raw_data));

    }else if( arg == '--ann-overview' ){

	///
	/// This is a more complicated collection that requires
	/// multiple passes to get.
	///

	// Setup what data we will want and a variable to catch it in
	// a table-like form for graphing later.
	var our_ev_of_interest_copy = bbop.core.clone(our_ev_of_interest);
	our_ev_of_interest_copy.unshift('Source');
	var agg_data_03 = [our_ev_of_interest_copy];

	// Cycle over the sources we want to look at while collecting
	// data.
	loop(our_sources_of_interest,
	     function(isrc){
    		 gm_ann.reset_query_filters();
    		 gm_ann.add_query_filter('source', isrc);
		 
		 // ll('isrc: ' + isrc);

		 var resp = new bbop.golr.response(gm_ann.fetch());
		 // The evidence facet.
		 var facet_list = resp.facet_field_list();
		 var ev_fasc_hash =
		     resp.facet_counts()['evidence_type_closure'];
	 
		 // Recover the current source from the response.
		 var fqs = resp.query_filters();
		 var src = bbop.core.get_keys(fqs['source'])[0];
	 
		 // ll('ev_fasc_hash: ' + bbop.core.dump(ev_fasc_hash));
		 
		 // Data row assembly.
		 var row_cache = [src];
		 bbop.core.each(our_ev_of_interest,
				function(e){
				    var ev_cnt = ev_fasc_hash[e] || 0;
				    //ll(' "' + e + '": ' + ev_cnt);
				    row_cache.push(ev_cnt);
				});
		 agg_data_03.push(row_cache);
	     });
	
	print(bbop.core.dump(agg_data_03));
	
    }
}
