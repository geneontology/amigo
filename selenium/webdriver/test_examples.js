////
//// The point here is to given some examples of how
//// selenium-webdriver works with promises, etc. Also a proving
//// ground for non-Mocha test types. Read all the way through as
//// there are negative examples as well.
////
//// See README.org in this directory.
////
//// Usage:
////  : AMIGO=http://amigo2.berkeleybop.org BROWSER=firefox node test_examples.js
////

// Setup the driver we'll use. Default to Firefox, but allow others
// with an environmental variable.
var driver = null;
if( process.env['BROWSER'] && process.env['BROWSER'] === 'chrome' ){
    // BUG/TODO: Still working out chrome/chromium
    // webdriver. Currently bad libs on Ubuntu, so not going to
    // progress much there.
    // var webdriver = require('selenium-webdriver');
    // driver = new webdriver.Builder().
    // 	withCapabilities(webdriver.Capabilities.chrome()).
    // 	build();
    var webdriver = require('selenium-webdriver/chrome');
    driver = new webdriver.Driver();
}else if( process.env['BROWSER'] && process.env['BROWSER'] === 'phantomjs' ){
    var webdriver = require('selenium-webdriver/phantomjs');
    driver = new webdriver.Driver();
}else{
    // Default to Firefox.
    var webdriver = require('selenium-webdriver/firefox');
    driver = new webdriver.Driver();
}

// Get which AmiGO we want from the env, or default.
var target = 'http://amigo.geneontology.org/';
if( process.env['AMIGO'] ){
    target = process.env['AMIGO'];
}

// Setup some useful aliases, etc.
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var assert = require('chai').assert;

// // NOTE:
// // This seemingly simple test cannot run because there may not be a
// // title yet when this code is reached (browser still loading,
// // etc.). We need to wait, but since we're asynchronous we
// // cannot. From the next example we'll start using implicit promises from
// // the selenium-webdriver framework.
// driver.get(target);
// assert.equal(driver.getTitle(), 'AmiGO 2: Welcome');

// Another try, this time using the implicit promises. The anonymous
// function after the "then" is called when the getTitle variable is
// resolved.
driver.get(target);
driver.getTitle().then(function(title){
    assert.equal(title, 'AmiGO 2: Welcome');
});

// Another way to write the previous function (except this time with a
// slightly different target) explicitly using the promise chaining
// would be as below. However, I think it's safe to say that it's a
// bit nasty looking and we'd rather avoid it if we can.
driver.get(target + '/grebe').then(
    function(){
	driver.getTitle().then(
	    function(title){
		assert.equal(title, 'AmiGO 2: Grebe');
	    });
    });

// Building on this, here's an example of form submission and a
// simple check that we get to the medial search page.
driver.get(target);
driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
driver.findElement(By.id('query-form')).submit();
driver.getTitle().then(
    function(title){
	assert.equal(title, 'AmiGO 2: Search Directory');
    });

// Now an example with Google to demonstrate something. While rather
// redundant on its surface, this shows an unexpected JS behaviour
// well. Because Google no longer does a direct query on search,
// rather a JS update on input, the initial title is /not/ "webdriver
// - Google Search", but rather just "Google" (which would be the
// initial title without the wait).
// driver.get('http://www.google.com');
// driver.findElement(By.name('q')).sendKeys('webdriver');
// driver.findElement(By.name('btnG')).click();
// driver.wait(until.titleIs('webdriver - Google Search'), 3000);
// driver.getTitle().then(
//     function(title){
// 	assert.equal(title, 'webdriver - Google Search');
//     });

// // NOTE:
// // Okay, given the above, for our final trick we're going to try and
// // check that something appears in an autocomplete dropdown as we
// // type. This next example, oddly, does not work. Why? Because (from
// // what I can tell) the ui-autocomplete class appears in the DOM
// // before the rest of the autocomplete dropdown text does. This also
// // means that the test /will/ run when done manually, if run line by
// // separate line in the REPL--the text gets fully written into the
// // "ui-autocomplete" element because you're going slower. Okay, let's
// // try again.
// driver.get(target);
// driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
// driver.wait(until.elementLocated(By.className('ui-autocomplete')), 3000);
// driver.findElement(By.className('ui-autocomplete')).getText().then(
//     function(text){
// 	console.log('text: ', text);
// 	assert.notEqual(-1, text.search('GO:0022008'));
//     });

// Okay, another try, this time realizing that we really have to wait
// for our target to appear before we can check on it, and not wait
// for a proxy ("ui-autocomplete" in the previous example).
// // Firefox a little slow sometimes here, so wait for it.
//driver.get(target + '/amigo');//.then(function(){
driver.get(target);//.then(function(){
driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
driver.wait(until.elementTextContains(
    driver.findElement(By.className('ui-autocomplete')), 'GO:0022008'), 3000);
driver.findElement(By.className('ui-autocomplete')).getText().then(
    function(text){
	//console.log(text);
	assert.notEqual(-1, text.search('neurogenesis \\(GO:0022008\\)'),
			'found neurogenes is properly in the dropdown');
    });
//});
// And now we're done, so close it out nicely.
driver.quit();
