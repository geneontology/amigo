#!/usr/bin/rhino
/* 
 * Package: generate_ann-asp-ev-chart_statistics.js
 * 
 * This is a Rhino script.
 * 
 * Generate a whole huge chunk of data for others to work
 * with. Hard-wired to our public beta server.
 * 
 * Usage like:
 *  : generate_ann-asp-ev-chart_statistics.js
 * 
 * WARNING: in all likelihood, usage will actually look like:
 *  : rhino -opt -1 ./generate_ann-asp-ev-chart_statistics.js
 * This is because the static checking has a hard time with some of the 
 * code that we use (I suspect in the global namespace).
 */

///
/// User variables.
///

// Defined dynamically below.
// source
var our_sources_of_interest = [
    // 'MGI',
    // 'RGD',
    // 'AspGD',
    // 'TAIR',
    // 'CGD',
    // 'ZFIN',
    // 'TIGR',
    // 'WB',
    // 'FB',
    // 'SGD',
    // 'dictyBase',
    // 'JCVI',
    // 'GR',
    // 'PomBase',
    // 'NCBI',
    // 'ENSEMBL',
    // 'Gene',
    // 'PseudoCAP',
    // 'GeneDB',
    // 'GeneDB',
    // 'RefSeq',
    // 'Reactome',
    // 'GeneDB',
    // 'SGN',
    // 'ASAP',
    // 'Ensembl',
    // 'NCBI',
    // 'NCBI',
    // 'EcoCyc',
    // 'PAMGO',
    // 'MetaCyc'
///
/// Mike's set.
///
// 'EcoCyc',
// 'PomBase',
// 'SGD',
// 'dictyBase',
// 'WB',
// 'FB',
// 'Chicken',
// 'Cow',
// 'ZFIN',
// 'Pig',
// 'Dog',
// 'RGD',
// 'MGI',
// 'TAIR',
// 'Human'
];

// regulates_closure_label
var our_asp_of_interest = [
    'cellular_component',
    'biological_process',
    'molecular_function'
];

// evidence_type_closure
var our_ev_of_interest = [
    'similarity evidence', // okay
    'experimental evidence', // okay
    'curator inference', // okay
    'author statement',
    'combinatorial evidence',
    'genomic context evidence'
    //'biological system reconstruction',
    //'imported information'
];

///
/// First section for JS invariant bits that don't change across
/// calls, bootstrapping, etc.
///

// Load the base files.
load('../../node_modules/bbop/bbop.js');
load('../../node_modules/amigo2/amigo2.js');

// For debugging.
var logger = new bbop.logger('statistics');
//logger.DEBUG = true;
logger.DEBUG = false;
function ll(str){
    logger.kvetch(str);
}
    
// Aliases.
var each = bbop.core.each;

// Get our own manager.
//var gserv = new amigo.data.server();
var gconf = new bbop.golr.conf(amigo.data.golr);
var gm_ann = new bbop.golr.manager.rhino('http://golr.geneontology.org/solr/', gconf);
gm_ann.debug(false);
// Set ourselves to annotations.
if( ! gm_ann.set_personality('annotation') ){ // profile in gconf
    throw new Error('There seems to have been an ERROR in the YAML loader...');
}
gm_ann.add_query_filter('document_category', 'annotation', ['*']);
// Get all the facets--everything.
gm_ann.set_facet_limit(-1);
	    
///
/// Variable data definition.
///

// First, get athe initial state.
var init_resp = gm_ann.fetch();

// Pull all possible sources if not defined.
if( our_sources_of_interest.length == 0 ){    
    var all_source_data = init_resp.facet_field('source');	
    each(all_source_data,
	 function(src_facet){
	     our_sources_of_interest.push(src_facet[0]);
	 });
}

///
/// Data run.
///

// For gnuplot.
//print('AXES' + "\t" + 'aspect' + "\t" + our_ev_of_interest.join("\t"));
print('AXES' + "\t" + our_ev_of_interest.join("\t"));


// Cycle over the sources we want to look at while collecting
// data.
each(our_sources_of_interest,
     function(isrc){
		 each(our_asp_of_interest,
		      function(iasp){
			  
			  // Reset, filter, and call.
    			  gm_ann.reset_query_filters();
			  gm_ann.add_query_filter('source', isrc);
			  gm_ann.add_query_filter('regulates_closure_label',
						  iasp);
 			  var resp = gm_ann.fetch();

			  // Extract the annotation count closure on
			  // the final axis (harder, but saves a lot
			  // of time).
			  var facet_list = resp.facet_field_list();
			  var ev_fasc_hash =
			      resp.facet_counts()['evidence_type_closure'];
	 
			  // ll('ev_fasc_hash: '+bbop.core.dump(ev_fasc_hash));
		 
			  // Data row assembly.
			  var min_asp = iasp;
			  if( iasp == 'cellular_component' ){
			      min_asp = 'c';
			  }else if( iasp == 'biological_process' ){
			      min_asp = 'p';
			  }else if( iasp == 'molecular_function' ){
			      min_asp = 'f';
			  }
			  //var row_cache = [isrc, min_asp];
			  //var row_cache = [isrc + ' ('+ iasp + ')'];
			  var row_cache = [min_asp + ': ' + isrc];
			  bbop.core.each(our_ev_of_interest,
					 function(iev){
					     var ev_cnt =
						 ev_fasc_hash[iev] || 0;
					     ll(isrc + ' ' +
						iasp + ' ' +
						iev + ' ' +
						ev_cnt);
					     row_cache.push(ev_cnt);
					 });
			  print(row_cache.join("\t"));
		      });
	 // TODO/BUG: Uuuugly hack for gnuplot being a PITA.
	 print(["", "?",  "?",  "?",  "?",  "?",  "?"].join("\t"));
     });
