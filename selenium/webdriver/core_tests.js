////
//// Basic simple tests to just make sure all the pages are where they
//// should be. This is also a basic example on how to use Mocha with
//// selenium-webdriver.
////
//// Usage:
////  : AMIGO=http://amigo2.berkeleybop.org ./node_modules/mocha/bin/mocha core_tests.js -t 10000
////

var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var firefox = require('selenium-webdriver/firefox');
var test = require('selenium-webdriver/testing');
var assert = require('chai').assert;

// Get which AmiGO we want from the env, or default.
var target = 'http://amigo.geneontology.org/';
if( process.env['AMIGO'] ){
    target = process.env['AMIGO'];
}

test.describe('Core AmiGO 2 (page tests)', function(){
    
    // Pre-run.
    var driver;
    test.before(function() {
	driver = new firefox.Driver();
    });
    
    test.it('home/landing page', function(){
	driver.get(target);
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Welcome');
	});
    });
    
    test.it('software list', function(){
	driver.get(target + '/amigo/software_list');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Tools and Resources');
	});
    });

    test.it('grebe', function(){
	driver.get(target + '/grebe');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Grebe');
	});
    });

    test.it('goose', function(){
	driver.get(target + '/goose');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: GO Online SQL/Solr Environment');
	});
    });

    test.it('RTE', function(){
	driver.get(target + '/rte');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'Term Enrichment Service');
	});
    });

    test.it('medial search', function(){
	driver.get(target + '/amigo/medial_search?q=foo');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Search Directory');
	});
    });

    test.it('search ontology', function(){
	driver.get(target + '/amigo/search/ontology');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Search');
	});
    });

    test.it('search bioentity', function(){
	driver.get(target + '/amigo/search/bioentity');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Search');
	});
    });

    test.it('search annotation', function(){
	driver.get(target + '/amigo/search/annotation');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Search');
	});
    });

    test.it('visualize', function(){
	driver.get(target + '/amigo/visualize');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Visualize');
	});
    });

    test.it('schema', function(){
	driver.get(target + '/amigo/schema_details');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Schema Details');
	});
    });

    test.it('load info', function(){
	driver.get(target + '/amigo/load_details');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Load Details');
	});
    });

    test.it('xrefs display', function(){
	driver.get(target + '/xrefs');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'Cross References');
	});
    });

    // Post-run.
    test.after(function(){
	driver.quit();
    });
});

test.describe('Core AmiGO 2 (simple data)', function(){
    
    // Pre-run.
    var driver;
    test.before(function() {
	driver = new firefox.Driver();
    });
    
    test.it('functioning medial search', function(){
	driver.get(target + '/amigo/medial_search?q=foo');
	driver.getTitle().then(function(title){
	    assert.equal(title, 'AmiGO 2: Search Directory');
	});
    });

    test.it('functioning term data get', function(){
	driver.get(target + '/amigo/term/GO:0022008');
	driver.getTitle().then(function(title){
	    var tl = 'AmiGO 2: Term Details for "neurogenesis" (GO:0022008)';
	    assert.equal(title, tl);
	});
    });

    test.it('functioning bioentiry data get', function(){
	driver.get(target + '/amigo/gene_product/UniProtKB:F1PQ05');
	driver.getTitle().then(function(title){
	    var tl = 'AmiGO 2: Gene Product Details for UniProtKB:F1PQ05';
	    assert.equal(title, tl);
	});
    });

    // Post-run.
    test.after(function(){
	driver.quit();
    });
});
