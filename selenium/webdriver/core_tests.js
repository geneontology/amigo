////
//// Basic simple tests to just make sure all the pages are where they
//// should be. This is also a basic work through how how to use Mocha
//// with selenium-webdriver.
////

var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var firefox = require('selenium-webdriver/firefox');
//var test = require('selenium-webdriver/testing');
var assert = require('chai').assert;

//describe('Core AmiGO 2', function(){
    
    // Pre-run.
    var driver;
//    before(function() {
	//console.log('start browser');
	//driver = new firefox.Driver();
	driver = new firefox.Driver();
//    });
    
//    it('should append query to title', function() {
	driver.get('http://www.google.com');
	driver.findElement(By.name('q')).sendKeys('webdriver');
	driver.findElement(By.name('btnG')).click();
// driver.getTitle().then(function(title) {
//  assert.equal("webdriver - Google Search", title);
// });
	//assert.equal('foo', driver.getTitle()); // fail
driver.wait(until.titleIs('webdriver - Google Search'), 1000).then(
    function(){
	driver.getTitle().then(function(title){
	    console.log(title);
	    assert.equal(title, 'webdriver - Google Search'); // okay
	});
    });
    
//     // Post-run.
//     after(function(){
// 	//console.log('shutdown browser');
// 	driver.quit();
//     });
// });
