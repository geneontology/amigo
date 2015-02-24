////
//// Test to make sure the basic autocomplete mechanism is working as
//// expected.
////
//// Usage:
////  : AMIGO=http://amigo2.berkeleybop.org ./node_modules/mocha/bin/mocha 05_autocomplete_tests.js -t 10000
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

test.describe('AmiGO 2 (autocomplete/search)', function(){
    
    // Pre-run.
    var driver;
    test.before(function() {
	driver = new firefox.Driver();
    });
    
    // Medial search works from autocomplete (submit, not click).
    test.it('neurogenesis medial from autocomplete', function(){

	// Input "neurgenesis" and hit "return".
	driver.get(target);
	driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
	driver.findElement(By.id('query-form')).submit();
	
	// No JS tricks, so we can check our results
	// immediately. First, make sure we're on medial.
	driver.getTitle().then(
	    function(title){
		assert.equal(title, 'AmiGO 2: Search Directory');
	    });
	// Next, make sure it's for "neurogenesis".
	driver.findElement(By.className('panel-body')).getText().then(
	    function(text){
		assert.notEqual(-1, text.search('neurogenesis'),
				'found neurogenesis in the body');
	    });
    });

    // Jump straight to term from autocomplete.
    test.it('neurogenesis details page from autocomplete', function(){

	// Input "neurgenesis", wait for the return and click the
	// element.
	driver.get(target);
	driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
	driver.wait(until.elementTextContains(
	    driver.findElement(By.className('ui-autocomplete')), 'GO:0022008'), 1000);
	var ltxt = 'neurogenesis (GO:0022008)';
	driver.findElement(By.linkText(ltxt)).click();
	// Make sure we're on the right page.
	var tl = 'AmiGO 2: Term Details for "neurogenesis" (GO:0022008)';
	driver.wait(until.titleIs(tl), 1000);
	driver.getTitle().then(function(title){
	    assert.equal(title, tl);
	});
    });    

    // Post-run.
    test.after(function(){
	driver.quit();
    });
});
