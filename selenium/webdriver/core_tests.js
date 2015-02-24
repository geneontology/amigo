////
//// Basic simple tests to just make sure all the pages are where they
//// should be. This is also a basic work through how how to use Mocha
//// with selenium-webdriver.
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

    // Post-run.
    test.after(function(){
	driver.quit();
    });
});
