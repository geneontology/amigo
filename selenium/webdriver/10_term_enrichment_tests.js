////
//// Tests to make sure that term enrichment and services are running
//// correctly.
////
//// Usage:
////  : AMIGO=http://amigo2.berkeleybop.org ./node_modules/mocha/bin/mocha 10_term_enrichment_tests.js -t 10000
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

test.describe('Term Enrichment (RTE and PANTHER)', function(){
    
    // Pre-run.
    var driver;
    test.before(function() {
	driver = new firefox.Driver();
    });
    
    // TODO!
    test.it('pass', function(){
	assert.equal(1, 1, 'passed');
    });

    // Post-run.
    test.after(function(){
	driver.quit();
    });
});

