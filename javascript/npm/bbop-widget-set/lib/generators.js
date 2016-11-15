
var us = require('underscore');
var bbop = require('bbop-core');

var html = require('./html');

var generators = {};

/*
 * Method: clickable_object
 * 
 * Generator for a clickable object.
 * 
 * TODO: May eventually expand it to include making a jQuery button.
 * 
 * Arguments:
 *  label - *[optional]* the text to use for the span or label (defaults to '')
 *  source - *[optional]* the URL source of the image (defaults to '')
 *  id - *[optional]* the id for the object (defaults to generate_id: true)
 * 
 * Returns:
 *  html.span or html.image
 */
generators.clickable_object = function(label, source, id){
    //this._is_a = 'bbop-widget-set.display.clickable_object';
    //var anchor = this;
    // // Per-UI logger.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch('W (clickable_object): ' + str); }

    // Default args.
    if( ! label ){ label = ''; }
    if( ! source ){ source = ''; }

    // Decide whether we'll use an incoming id or generate our own.
    var args = {};
    if( id ){
	args['id'] = id;
    }else{
	args['generate_id'] = true;
    }

    // Figure out an icon or a label.
    var obj = null;
    if( source === '' ){
	obj = new html.span(label, args);
    }else{
	args['src'] = source;
	args['title'] = label;
	obj = new html.image(args);
    }

    return obj;
};

/*
 * Package: text_buttom_sim.js
 * 
 * Namespace: bbop-widget-set.display.text_button_sim
 * 
 * BBOP object to produce a clickable text span, that in conjunction with the local CSS, should make an awfully button looking creature.
 * 
 * It uses the class: "bbop-js-text-button-sim".
 * 
 * Note: this is a method, not a constructor.
 */

/*
 * Method: text_button_sim_generator
 * 
 * Generator for a text span for use for buttons.
 * 
 * Arguments:
 *  label - *[optional]* the text to use for the span or (defaults to 'X')
 *  title - *[optional]* the hover text (defaults to 'X')
 *  id - *[optional]* the id for the object (defaults to generate_id: true)
 *  add_attrs - *[optional]* more attributes to be folded in to the span as hash
 * 
 * Returns:
 *  html.span
 */
generators.text_button_sim = function(label, title, id, add_attrs){
    
    // Default args.
    if( ! label ){ label = 'X'; }
    if( ! title ){ title = 'X'; }
    if( ! add_attrs ){ add_attrs = {}; }
    
    // Decide whether we'll use an incoming id or generate our own.
    var args = {
	'class': "bbop-js-text-button-sim",
	'title': title
    };
    if( id ){
	args['id'] = id;
    }else{
	args['generate_id'] = true;
    }

    // Addtional optional atrributes and overrides.    
    args = bbop.merge(args, add_attrs);

    var obj = new html.span(label, args);    
    return obj;
};

///
/// Exportable body.
///

module.exports = generators;
