////
//// Experimental test playground.
////

// Browser setup and start.
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;
var firefox = require('selenium-webdriver/firefox');
var driver = new firefox.Driver();

// Get which AmiGO we want from the env, or default.
var target = 'http://amigo.geneontology.org/';
if( process.env['AMIGO'] ){
    target = process.env['AMIGO'];
}

// // Example of just going to a page and checking something.
// // Front page.
// driver.get(target);
// driver.wait(until.titleIs('AmiGO 2: Welcome'), 1000);

// // Example of a form submission and simple check.
// // Medial search from autocomplete.
// driver.get(target);
// driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
// driver.findElement(By.id('query-form')).submit();
// driver.wait(until.titleIs('AmiGO 2: Search Directory'), 1000);

///
/// Work.
///

// Example of checking for the existance of something in a dynamic
// dropdown.
// Autocomplete for "neurogenesis" (check that dropdown occurs with
// GO:0022008).
driver.get(target);
driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
//var ul = driver.findElement(By.className('ui-autocomplete'));
//ul.wait(until.elementTextContains('GO:0022008'), 1000);
console.log(  driver.wait(until.elementLocated(By.className('ui-autocomplete')), 1000).then(function(){ console.log('foo'); })  );
driver.getText

//.then(function(foo){ console.log('boom: ', foo); foo.findElement(By.className('ui-autocomplete')).getText(); });
// 	foo.getText().then(
// 	    function(text){
// 		//return text.search('GO:0022008') !== -1;
// 		console.log(text);
// 	    })
//    });

//driver.findElement(By.className('ui-autocomplete'))
//driver.getText().then(function(text){
    //return text.search('GO:0022008') !== -1;
//    console.log(text);
    // if( text.search('GO:0022008') == -1 ){
    // 	throw new Error('bad assert');
    // }
    // return text.search('GO:xxx') !== -1;
//});

// Done.
driver.quit();
