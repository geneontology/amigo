////
//// Tests to make sure that term enrichment and services are running
//// correctly.
////
//// Usage:
////  : AMIGO=http://amigo2.berkeleybop.org ./node_modules/mocha/bin/mocha 10_term_enrichment_tests.js -t 100000
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
    
    // Simple trial through the RTE page.
    test.it('to PANTHER from RTE, no checking', function(){
	driver.get(target + '/rte');

	// Load the form and click "submit" (given by xpath).
	var entries = [
	    'P31946   ,P62258',
	    'Q04917,P61981',
	    'P31947  baxter',
	    'P27348,',
	    'P63104 ,  Q96QU6',
	    'Q8NCW5 ,'
	];
	driver.findElement(By.id('rte_input')).sendKeys(entries.join("\n"));
	var xp = '/html/body/div[2]/div[4]/div/div/form/div[2]/button';
	driver.findElement(By.xpath(xp)).click();

	// Wait for PANTHER to resolve. This can take a while. Check
	// the title.
	var tl = 'PANTHER - Compare lists to reference list';
	driver.wait(until.titleIs(tl), 100000);
	driver.getTitle().then(function(title){
	    assert.equal(title, tl);
	});
    });
    // Post-run.
    test.after(function(){
	driver.quit();
    });
});

