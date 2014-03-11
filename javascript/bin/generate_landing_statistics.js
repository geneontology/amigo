#!/usr/bin/rhino
/* 
 * Package: generate_landing_statistics.js
 * 
 * This is a Rhino script.
 * 
 * Generate a whole huge chunk of data for others to work
 * with. Hard-wired to our public beta server.
 * 
 * Usage like:
 *  : generate_landing_statistics.js
 * 
 * WARNING: in all likelihood, usage will actually look like:
 *  : rhino -opt -1 ./generate_landing_statistics.js
 * This is because the static checking has a hard time with some of the 
 * code that we use (I suspect in the global namespace).
 */

///
/// First section for invariant bits that don't change across calls.
///

// Load the base files.
load('../../_data/bbop.js');
load('../staging/amigo2.js');

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
if( ! gm_ann.set_personality('annotation') ){ // profile in gconf
    throw new Error('There seems to have been an ERROR in the YAML loader...');
}
gm_ann.add_query_filter('document_category', 'annotation', ['*']);

// No facets, no returns--we just want the counts.
gm_ann.set_facet_limit(0);
gm_ann.set('rows', 0);

// A setup for our data for gnuplot like:
// http://gnuplot.sourceforge.net/demo/histograms.html
//var columns = ['AXES'];
//var rows = []; // first column will be label; like [[foo 1 2], [bar, 3, 4], ...]

var dat = [];

var our_species_of_interest = [
      ['human', '9606'],
      ['mouse', '10090'],
      ['rat', '10116'],
      ['chicken', '9031'],
      ['zebrafish', '7955'],
      ['fly', '7227'],
      ['worm', '6239'],
      ['dicty', '44689'],
      ['S. pombe', '4896'],
      ['S. cer.', '4932'],
      ['arabidopsis', '3702'],
      ['E. coli', '562'],
      ['aspergilus', '5062'],
      ['candida', '237561']
];

each(our_species_of_interest,
     function(spair){
	 var name = spair[0];
	 var ncbi = 'NCBITaxon:' + spair[1];
	 
	 // Reset.
    	 gm_ann.reset_query_filters();

	 // By taxon & experimental results.
	 gm_ann.add_query_filter('taxon_closure', ncbi, ['+']);
	 gm_ann.add_query_filter('evidence_type_closure',
				 'experimental evidence', ['+']);
	 var ex_resp = gm_ann.fetch();
	 var ex_count = ex_resp.total_documents() || 0;

	 // Reset.
    	 gm_ann.reset_query_filters();

	 // Non-experimental results.
	 gm_ann.add_query_filter('taxon_closure', ncbi, ['+']);
	 gm_ann.add_query_filter('evidence_type_closure',
				 'experimental evidence', ['-']);
	 var nx_resp = gm_ann.fetch();
	 var nx_count = nx_resp.total_documents() || 0;

	 //dat.push([name, ex_count, nx_count, (ex_count + nx_count)]);
	 //dat.push([name, ex_count, nx_count]);
	 dat.push([name, nx_count, ex_count]);
     });

// Sort the data.
dat.sort(
    function(a, b){
	var acn = a[1] + a[2];
	var bcn = b[1] + b[2];
	return bcn - acn;
    });

// Add header row.
//dat.unshift(["AXES",  "experimental",  "non-experimental", 'TOTAL']);
//dat.unshift(["AXES",  "experimental",  "non-experimental"]);
dat.unshift(["AXES",  "non-experimental",  "experimental"]);

// Output string.
//print(JSON.stringify(dat));
each(dat,
     function(dtm){
	 print(dtm.join("\t"));
     });
