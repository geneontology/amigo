////
//// Some unit testing for linker.js (even though its data is generated).
////

var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

///
/// Start unit testing.
///

describe('linker tests', function(){

    var amigo_gen = require('..');
    var amigo = new amigo_gen();
    var l = amigo.linker;
    var ab = amigo.data.server.app_base;

    it('pre-basics: who are we?', function(){
	assert.equal(bbop.what_is(amigo), 'amigo2-instance-data',
		     'truth in: ' + bbop.what_is(amigo));
	assert.equal(bbop.what_is(l), 'amigo2.linker',
		     'truth in: ' + bbop.what_is(amigo));
    });

    it('basics', function(){

	assert.equal(l.url('GO:0022008'),
		     'http://amigo.geneontology.org/amigo/term/GO:0022008',
		     'linker: go');
    	assert.equal(l.url('GO:0022008', 'term'),
    		     //'amigo?mode=term&term=GO:0022008',
    		     //'term/GO:0022008',
    		     ab + '/amigo/term/GO:0022008',
    		     'linker: go term');
    	assert.equal(l.url('foo', 'gp'),
    		     //'amigo?mode=gene_product&gp=foo',
    		     //'gene_product/foo',
    		     ab + '/amigo/gene_product/foo',
    		     'linker: go gp');
    	assert.equal(l.url('SGD:S000006169'),
    		     'http://www.yeastgenome.org/locus/S000006169/overview',
    		     'linker: sgd');
    	assert.equal(l.url('XXXX:S000006169'),
    		     null,
    		     'linker: null');
	
    });

    it('internal edge cases', function(){

    	// Some hard-wired internal link testing.
    	function _ends_with(str, suff){
    	    var off = str.length - suff.length;
    	    var ret = false;
    	    if( str.indexOf(suff, off) !== -1 ){
    		ret = true;
    	    }
    	    return ret;
    	}
    	assert.isTrue(_ends_with(l.url(null, 'medial_search'),
    				 '/amigo/medial_search'),
    		      'interlink: medial_search special (1)');
    	assert.isTrue(_ends_with(l.url('', 'medial_search'),
    				 '/amigo/medial_search?q='),
    		      'interlink: medial_search special (2)');
    	assert.isTrue(_ends_with(l.url('foo', 'medial_search'),
    				 '/amigo/medial_search?q=foo'),
    		      'interlink: medial_search special (3)');
    	assert.isTrue(_ends_with(l.url(null, 'grebe'), '/grebe'),
    		      'interlink: grebe not special (1)');
    	assert.isTrue(_ends_with(l.url('', 'grebe'), '/grebe'),
    		      'interlink: grebe not special (2)');
    	assert.isTrue(_ends_with(l.url('foo', 'grebe'), '/grebe'),
    		      'interlink: grebe not special (3): ' +
		      l.url('foo', 'grebe'));
	
    });

    it('synonyms', function(){

    	// Okay, now check that synonyms work like we think they should.
    	// Try it on the every annoying NCBITaxon.
    	assert.equal(l.url('taxon:7227'),
    		     'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=7227',
    		     'linker: ncbi taxon 1');
    	assert.equal(l.url('NCBITaxon:7227'),
    		     'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=7227',
    		     'linker: ncbi taxon 2');
    	assert.equal(l.url('ncbi_taxid:7227'),
    		     'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=7227',
    		     'linker: ncbi taxon 3');
    });

    it('weird and edge cases', function(){

    	// And let's make sure that nothing produces nothing.
    	assert.isNull(l.url(null), 'null url');
    	assert.isNull(l.url(''), "'' url");
    	assert.isNull(l.anchor(null), 'null anchor');
	
    	// And make sure that we can do things like PANTHER's double.
    	// url_syntax: http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt
    	assert.equal(l.url('PAINT_REF:PTHR10046'),
    		     'http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt',
    		     'linker: panther');
	
    });

});
