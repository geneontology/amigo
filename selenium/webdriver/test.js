////
//// 
////

// Browser setup and start.
var By = require('selenium-webdriver').By,
until = require('selenium-webdriver').until,
firefox = require('selenium-webdriver/firefox');
var driver = new firefox.Driver();

// Get which AmiGO we want from the env, or default.
var target = 'http://amigo.geneontology.org/';
if( process.env['AMIGO'] ){
    target =  process.env['AMIGO'];
}

// Front page.
driver.get(target);
driver.wait(until.titleIs('AmiGO 2: Welcome'), 1000);

// Medial search
driver.get(target);
driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
driver.findElement(By.id('query-form')).submit();
driver.wait(until.titleIs('AmiGO 2: Search Directory'), 1000);

// Autocomplete for "neurogenesis" (check that dropdown occurs with
// GO:0022008).
driver.get(target);
driver.findElement(By.id('gsf-query')).sendKeys('neurogenesis');
var ul = driver.findElement(By.className('ui-autocomplete'));
ul.getText().then(function(text){
    return text.search('GO:0022008') !== -1;
});

// Done.
driver.quit();
