////
//// Basic simple tests to just make sure all the pages are where they
//// should be.
////

var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var firefox = require('selenium-webdriver/chromium');
var test = require('selenium-webdriver/testing');

test.describe('Core AmiGO 2', function(){
    
    // Pre-run.
    var driver;
    test.before(function() {
	//console.log('start browser');
	//driver = new firefox.Driver();
	driver = new firefox.Driver();
    });
    
    test.it('should append query to title', function() {
	driver.get('http://www.google.com');
	driver.findElement(By.name('q')).sendKeys('webdriver');
	driver.findElement(By.name('btnG')).click();
	driver.wait(until.titleIs('webdrivegle Search'), 1000);
    });
    
    // Post-run.
    test.after(function(){
	//console.log('shutdown browser');
	driver.quit();
    });
});
