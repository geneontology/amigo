////
//// 
////

var us = require('underscore');
var bbop = require('bbop-core');
var fs = require('fs');

var amigo = new (require('amigo2-instance-data'))();

var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;

var node_engine = require('bbop-rest-manager').node;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');

///
/// Range variables.
///

var our_evidence_of_interest = [
    'similarity evidence', // okay
    'experimental evidence', // okay
    'curator inference', // okay
    'author statement',
    'combinatorial evidence',
    'genomic context evidence'
    //'biological system reconstruction',
    //'imported information'
];

var our_species_of_interest = [
      ['H. sapiens', '9606'],
      ['M. musculus', '10090'],
      ['R. norvegicus', '10116'],
      ['G. gallus', '9031'],
      ['D. rerio', '7955'],
      ['D. melanogaster', '7227'],
      ['C. elegans', '6239'],
      ['D. discoideum', '44689'],
      ['S. pombe', '4896'],
      ['S. cerevisiae', '4932'],
      ['A. thaliana', '3702'],
      ['E. coli', '562'],
      ['A. oryzae', '5062'],
      ['C. albicans', '5476']
];

///
///
///

// We'll be using a lot of managers here, use creator macro.

function _new_total_manager_by_personality(personality){

    var engine = new node_engine(golr_response);
    var manager = new golr_manager(gserv, gconf, engine, 'async');
    
    manager.set_personality(personality);
    manager.add_query_filter('document_category', personality);

    manager.set('rows', 0);
    manager.set_facet_limit(0);

    return manager;
}

///
///
///

// Doesn't matter what personality, we're just using this as the
// coordinator.
var glob_manager = _new_total_manager_by_personality('annotation');
var glob = {
    species_of_interest: our_species_of_interest,
    evidence_of_interest: our_evidence_of_interest,
    annotations: {
	species_by_exp : {},
	species_by_nonexp : {},
	evidence : {}
    }
};
var glob_funs = [];

// Looking by species.
us.each(our_species_of_interest, function(species){

    var lbl = species[0];
    var id = species[1];

    // Experimental.
    glob_funs.push(function(){

	var manager = _new_total_manager_by_personality('annotation');
	//  Minimal, only want count.
	manager.add_query_filter('taxon', 'NCBITaxon:' + id);
	manager.add_query_filter('evidence_type_closure',
				 'experimental evidence');

	manager.register('search', function(resp){
	    glob['annotations']['species_by_exp'][id] = resp.total_documents();
	    //	    console.log(glob);
	});

	return manager.search();
    });
    
    // Non-experimental.
    glob_funs.push(function(){

	var manager = _new_total_manager_by_personality('annotation');
	//  Minimal, only want count.
	manager.add_query_filter('taxon', 'NCBITaxon:' + id);
	manager.add_query_filter('evidence_type_closure',
				 'experimental evidence', ['-']);

	manager.register('search', function(resp){
	    glob['annotations']['species_by_nonexp'][id] =resp.total_documents();
	});

	return manager.search();
    });
     
});

// Looking by evidence.
us.each(our_evidence_of_interest, function(ev){

    // ...
    glob_funs.push(function(){

	var manager = _new_total_manager_by_personality('annotation');
	//  Minimal, only want count.
	manager.add_query_filter('evidence_type_closure', ev);

	manager.register('search', function(resp){
	    glob['annotations']['evidence'][ev] = resp.total_documents();
	});

	return manager.search();
    });
    
});

///
/// Runner.
///

var fun_count = 0;
var total_funs = glob_funs.length;
glob_manager.run_promise_functions(glob_funs, function(resp, man){
    fun_count++;
    console.log(fun_count + ' of ' + total_funs);
}, function(man){
    // Dump to file.
    fs.writeFileSync('./perl/bin/amigo-base-statistics-cache.json',
		     JSON.stringify(glob));
}, function(err, man){
    // No error code.
});
