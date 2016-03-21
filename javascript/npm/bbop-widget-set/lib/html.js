/* 
 * Package: html.js
 * 
 * Namespace: html
 * 
 * Right now contains html.tag, but all html producing functions
 * should go in here somewhere.
 * 
 * All html implement the interface:
 *  .to_string(): returns a string of you and below
 *  .add_to(): add things between the tags
 *  .empty(): empties all things between the tags
 *  .get_id(): return the id or null if not defined
 * These are enforced during the tests.
 * 
 * For functions that take attribute hashes, there is a special
 * attribute {'generate_id': true} that will generate a somewhat
 * random id if an incoming id was not already specified. This id can
 * be retrieved using get_id().
 * 
 * This package takes all of the html.* namespace.
 */

var us = require('underscore');
var bbop = require('bbop-core');

var html = {};

/*
 * Namespace: html.tag
 * 
 * Constructor: tag
 * 
 * Create the fundamental tag object to work with and extend.
 * 
 * Parameters:
 *  tag - the tag name to be created
 *  attrs - *[serially optional]* the typical attributes to add
 *  below - *[optional]* a list/array of other html objects that exists "between" the tags
 * 
 * Returns:
 *  html.tag object
 */
html.tag = function(tag, attrs, below){
    this._is_a = 'bbop-widget-set.html.tag';

    // Arg check--attrs should be defined as something.
    if( ! attrs ){
	attrs = {};
    }else{
	// Prevent sharing of structure.
	attrs = bbop.clone(attrs);
    }

    // Generate (or not) id if it was requested.
    if( ! bbop.is_defined(attrs['id']) &&
	bbop.is_defined(attrs['generate_id']) &&
	bbop.is_defined(attrs['generate_id']) === true ){
	    // Add a real id.
	    attrs['id'] = 'gen_id-bbop-html-'+ bbop.randomness(20);
	    // Remove the 'generated_id' property.
	    delete attrs['generate_id'];
	}
    this._attrs = attrs;
    
    // Arg check--below should be some kind of an array.
    if( ! below ){
	below = [];
    }else if( us.isArray(below) ){
	// do nothing
    }else{
	// hopefully a html.tag then
	below = [below];
    }

    // Accumulate the incoming attributes if there are any.
    var additional_attrs = '';
    us.each(this._attrs, function(in_val, in_key){
	additional_attrs = additional_attrs + ' ' +
	    in_key + '="' + in_val + '"';
    });

    this._car = '<' + tag + additional_attrs + '>';
    this._cdr = '</' + tag + '>';
    this._contents = below;
    this._singleton = '<' + tag + additional_attrs + ' />';
};

/*
 * Function: to_string
 * 
 * Convert a tag object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.tag.prototype.to_string = function(){
    var acc = '';
    us.each(this._contents, function(item, i){
	// if( typeof(item) === 'string' ){
	// 	   acc = acc + item;
	// }else if( typeof(item['to_string']) === 'function' ){
	// 	   acc = acc + item.to_string();
	// }else{
	// 	   throw new Error('No to_string for (' +
	// 			   bbop.what_is(item) +
	// 			   ') ' + item);
	// }
	acc = acc + bbop.to_string(item);
    });
    
    // Special return case if there are no children (to prevent
    // weirdness for things like br and input).
    var output = this._singleton;
    if( acc !== '' ){ output = this._car + acc + this._cdr; }

    return output;
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  bbop_html_tag_or_string - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.tag.prototype.add_to = function(bbop_html_tag_or_string){
    this._contents.push(bbop_html_tag_or_string);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.tag.prototype.empty = function(){
    this._contents = [];
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.tag.prototype.get_id = function(){
    var retval = null;
    if( bbop.is_defined(this._attrs['id']) ){
	retval = this._attrs['id'];
    }
    return retval;
};

/*
 * Namespace: html.accordion
 * 
 * Constructor: accordion
 * 
 * Create the a frame for the functional part of a jQuery accordion
 * structure.
 * 
 * :Input:
 * : [[title, string/*.to_string()], ...]
 * :
 * :Output:
 * : <div id="accordion">
 * :  <h3><a href="#">Section 1</a></h3>
 * :  <div>
 * :   <p>
 * :    foo
 * :   </p>
 * :  </div>
 * :  ...
 * : </div>
 * 
 * Parameters:
 *  in_list - accordion frame headers: [[title, string/*.to_string()], ...]
 *  attrs - *[serially optional]* attributes to apply to the new top-level div
 *  add_id_p - *[optional]* true or false; add a random id to each section
 * 
 * Returns:
 *  html.accordion object
 * 
 * Also see: <tag>
 */
html.accordion = function(in_list, attrs, add_id_p){
    this._is_a = 'bbop-widget-set.html.accordion';

    //
    if( typeof(add_id_p) === 'undefined' ){ add_id_p = false; }

    // Arg check--attrs should be defined as something.
    this._attrs = attrs || {};

    // Internal stack always starts with a div.
    this._div_stack = new html.tag('div', this._attrs);

    this._section_id_to_content_id = {};

    // Iterate over the incoming argument list.
    var accordion_this = this;
    us.each(in_list, function(item){
	var sect_title = item[0];
	var content = item[1];
	accordion_this.add_to(sect_title, content, add_id_p);
    });
};

/*
 * Function: to_string
 * 
 * Convert the accordion object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.accordion.prototype.to_string = function(){
    return this._div_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add a contect section to the accordion.
 * 
 * Parameters:
 *  section_info - a string or a hash with 'id', 'label', and 'description'
 *  content_blob - string or html object to put in a section
 *  add_id_p - *[optional]* true or false; add a random id to the section
 * 
 * Returns: n/a
 */
html.accordion.prototype.add_to =
    function(section_info, content_blob, add_id_p){

    // If section_info isn't an object, assume it is a string and use
    // it for everything.
    var section_id = null;
    var section_label = null;
    var section_desc = null;
    if(typeof section_info !== 'object' ){
	section_id = section_info;
	section_label = section_info;
    }else{
	if( section_info['id'] ){ section_id = section_info['id']; }
	if( section_info['label'] ){ section_label = section_info['label']; }
	if( section_info['description'] ){
	    section_desc = section_info['description'];
	}
    }

    // Add header section.
    //var h3 = new html.tag('h3', {title: section_desc});
    var h3 = new html.tag('h3');
    var anc = null;
    if( section_desc ){
	// anc = new html.tag('a', {href: '#'}, section_label);
	anc = new html.tag('a', {href: '#', title: section_desc},
				section_label);
    }else{
	anc = new html.tag('a', {href: '#'}, section_label);
    }
    h3.add_to(anc);
    this._div_stack.add_to(h3);

    var div = null;

    // Generate random id for the div.
    if( typeof(add_id_p) === 'undefined' ){ add_id_p = false; }
    if( add_id_p ){
	var rid = 'accordion-' + section_id + '-' + bbop.randomness(20);
	this._section_id_to_content_id[section_id] = rid;    
	div = new html.tag('div', {'id': rid});	
    }else{
	div = new html.tag('div');	
    }

    // Add add content stub to section.
   var p = new html.tag('p', {}, bbop.to_string(content_blob));
    div.add_to(p);
    this._div_stack.add_to(div);
};

// // Add a section to the accordion.
// html.accordion.prototype.add_to_section = function(sect_id, content){
//     var cdiv = this._section_id_to_content_div[sect_id];
//     if( ! cdiv ){
// 	throw new Error('Cannot add to undefined section.');
//     }
// };

/*
 * Function: empty
 * 
 * Empty all sections from the accordion.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.accordion.prototype.empty = function(){
    this._div_stack = new html.tag('div', this._attrs);
    this._section_id_to_content_id = {};
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.accordion.prototype.get_id = function(){
    return this._div_stack.get_id();
};

/*
 * Function: get_section_id
 * 
 * Get the "real" section id by way of the "convenience" section id?
 * 
 * Parameters:
 *  sect_id - TODO ???
 * 
 * Returns: TODO ???
 */
html.accordion.prototype.get_section_id = function(sect_id){
	return this._section_id_to_content_id[sect_id];    
};


// // TODO: just empty the contents from an ided section.
// html.accordion.prototype.empty_section = function(sect_id){
//     var div = this._section_id_to_content_div[sect_id];
//     div.empty();
// };

/*
 * Namespace: html.list
 * 
 * Constructor: list
 * 
 * Create the a frame for an unordered list object.
 * 
 * :Input:
 * : [string/*.to_string(), ...]
 * :
 * :Output:
 * : <ul id="list">
 * :  <li>foo</li>
 * :   ...
 * : </ul>
 * 
 * Parameters:
 *  in_list - list of strings/html objects to be li separated
 *  attrs - *[optional]* attributes to apply to the new top-level ul
 * 
 * Returns:
 *  html.list object
 * 
 * Also see: <tag>
 */
html.list = function(in_list, attrs){
    this._is_a = 'bbop-widget-set.html.list';
    
    // Arg check--attrs should be defined as something.
    if( ! attrs ){ attrs = {}; }
    this._attrs = attrs;

    // Internal stack always starts with a ul.
    this._ul_stack = new html.tag('ul', this._attrs);

    var list_this = this;
    us.each(in_list, function(item){ list_this.add_to(item); });
};

/*
 * Function: to_string
 * 
 * Convert a list object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.list.prototype.to_string = function(){
    return this._ul_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add a new li section to a list.
 * 
 * Optionally, it can take multiple arguments and will add each of
 * them to the new li tag in turn.
 * 
 * Parameters:
 *  item1 - another tag object or a string (html or otherwise)
 *  item2 - *[optional]* ...on forever
 * 
 * Returns: n/a
 */
html.list.prototype.add_to = function(){

    // Convert anonymous arguments into an Array.
    var args = Array.prototype.slice.call(arguments); 

    // Cycle through and add them to the accumulator for the new li.
    var li_acc = [];
    us.each(args, function(arg){
	li_acc.push(bbop.to_string(arg));
    });

    // Join them and add them to the stack of the encompassing ul.
    var li = new html.tag('li', {}, li_acc.join(" "));
    this._ul_stack.add_to(li);
};

/*
 * Function: empty
 * 
 * Remove all content (li's) from the list.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.list.prototype.empty = function(){
    this._ul_stack = new html.tag('ul', this._attrs);
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.list.prototype.get_id = function(){
    return this._ul_stack.get_id();
};

/*
 * Namespace: html.input
 * 
 * Constructor: input
 * 
 * Create a form input.
 * 
 * Parameters:
 *  attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  html.input object
 */
html.input = function(attrs){
    this._is_a = 'bbop-widget-set.html.input';
    
    // Arg check--attrs should be defined as something.
    if( ! attrs ){ attrs = {}; }
    this._attrs = attrs;

    // Internal stack always starts with a ul.
    this._input_stack = new html.tag('input', this._attrs);
};

/*
 * Function: to_string
 * 
 * Convert an input into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.input.prototype.to_string = function(){
    return this._input_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the input tags.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.input.prototype.add_to = function(item){
    this._input_stack.add_to(bbop.to_string(item));
};

/*
 * Function: empty
 * 
 * Reset/remove all children.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.input.prototype.empty = function(){
    this._input_stack = new html.tag('input', this._attrs);
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.input.prototype.get_id = function(){
    return this._input_stack.get_id();
};

/*
 * Namespace: html.anchor
 * 
 * Constructor: anchor
 * 
 * Create an anchor object. Note: href, title, etc. go through
 * in_attrs.
 * 
 * Parameters:
 *  in_cont - the contents between the "a" tags
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  html.anchor object
 */
html.anchor = function(in_cont, in_attrs){
    this._is_a = 'bbop-widget-set.html.anchor';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack always starts with a ul.
    this._anchor_stack = new html.tag('a', this._attrs, in_cont);
};

/*
 * Function: to_string
 * 
 * Convert an anchor object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.anchor.prototype.to_string = function(){
    return this._anchor_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.anchor.prototype.add_to = function(item){
    this._anchor_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.anchor.prototype.empty = function(){
    this._anchor_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.anchor.prototype.get_id = function(){
    return this._anchor_stack.get_id();
};

/*
 * Namespace: html.image
 * 
 * Constructor: image
 * 
 * Create an image (img) object. Note: alt, title, etc. go through
 * in_attrs.
 * 
 * Parameters:
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  html.image object
 */
html.image = function(in_attrs){
    this._is_a = 'bbop-widget-set.html.image';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack always starts with a ul.
    this._image_stack = new html.tag('img', this._attrs);
};

/*
 * Function: to_string
 * 
 * Convert an image object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.image.prototype.to_string = function(){
    return this._image_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.image.prototype.add_to = function(item){
    this._image_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.image.prototype.empty = function(){
    this._image_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.image.prototype.get_id = function(){
    return this._image_stack.get_id();
};

/*
 * Namespace: html.table
 * 
 * Constructor: table
 * 
 * Create a simple table structure.
 * in_headers is necessary, but can be empty.
 * in_entries is necessary, but can be empty.
 * 
 * Parameters:
 *  in_headers - ordered list of headers
 *  in_entries - lists of lists of entry items
 *  in_attrs - *[optional]* the typical attributes to add to the table
 * 
 * Returns:
 *  html.table object
 */
html.table = function(in_headers, in_entries, in_attrs){
    this._is_a = 'bbop-widget-set.html.table';
    
    // Arg check--attrs should be defined as something.
    var headers = in_headers || [];
    var entries = in_entries || [];
    this._attrs = in_attrs || {};

    // Row class count.
    this._count = 0;

    // Internal stack always starts with a table.
    this._table_stack = new html.tag('table', this._attrs);

    // Only add headers if they exist.
    if( ! us.isEmpty(headers) ){
	var head_row = new html.tag('tr');
	us.each(headers, function(header){
	    var th = new html.tag('th');
	    th.add_to(header);
	    head_row.add_to(th);
	});
	var head_stack = new html.tag('thead');
	head_stack.add_to(head_row);
	this._table_stack.add_to(head_stack);
    }

    // Add incoming rows to the body. Keep the body stack around for
    // bookkeeping.
    this._body_stack = new html.tag('tbody');
    this._table_stack.add_to(this._body_stack);

    var this_table = this;
    us.each(entries, function(item){ this_table.add_to(item); });
};

/*
 * Function: to_string
 * 
 * Convert a table object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.table.prototype.to_string = function(){
    return this._table_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add data row. The entries argument is coerced into an array of tds.
 * 
 * Parameters:
 *  entries - lists of lists of entry items
 * 
 * Returns: n/a
 */
html.table.prototype.add_to = function(entries){
    
    //this._body_stack = new html.tag('tbody');

    // Get the class for the row.
    var row_class = 'odd_row';
    if( this._count % 2 === 0 ){ row_class = 'even_row'; }
    this._count = this._count + 1;

    var tr = new html.tag('tr', {'class': row_class});

    // Array or not, add everything as tds.
    if( ! us.isArray(entries) ){ entries = [entries]; }
    us.each(entries, function(entry){
	var td = new html.tag('td');
	td.add_to(entry);
	tr.add_to(td);
    });
    this._body_stack.add_to(tr);
};

/*
 * Function: empty
 * 
 * Headers do not get wiped, just the data rows in the tbody.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.table.prototype.empty = function(){
    this._count = 0;
    this._body_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.table.prototype.get_id = function(){
    return this._table_stack.get_id();
};

/*
 * Namespace: html.button
 * 
 * Constructor: button
 * 
 * Create a button object.
 * For after-the-fact decoration, take a look at:
 * <https://jquery-ui.googlecode.com/svn/tags/1.6rc5/tests/static/icons.html>
 * 
 * Parameters:
 *  in_label - label
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  html.button object
 */
html.button = function(in_label, in_attrs){
    this._is_a = 'bbop-widget-set.html.button';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack is just the top-level button.
    this._button_stack = new html.tag('button', this._attrs, in_label);
};

/*
 * Function: to_string
 * 
 * Convert a button object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.button.prototype.to_string = function(){
    return this._button_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * Not really worth much as it just equates to changing the label.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.button.prototype.add_to = function(item){
    this._button_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags. This equates to removing the
 * label.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.button.prototype.empty = function(){
    this._button_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.button.prototype.get_id = function(){
    return this._button_stack.get_id();
};

/*
 * Namespace: html.span
 * 
 * Constructor: span
 * 
 * Create a span object.
 * Fun for calling live bits after the fact.
 * 
 * Parameters:
 *  in_label - label
 *  in_attrs - *[optional]* the typical attributes to add
 * 
 * Returns:
 *  html.span object
 */
html.span = function(in_label, in_attrs){
    this._is_a = 'bbop-widget-set.html.span';
    
    // Arg check--attrs should be defined as something.
    this._attrs = in_attrs || {};

    // Internal stack is just the top-level span.
    this._span_stack = new html.tag('span', this._attrs, in_label);
};

/*
 * Function: to_string
 * 
 * Convert a span object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.span.prototype.to_string = function(){
    return this._span_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add content between the tags. Order of addition is order of output.
 * Not really worth much as it just equates to changing the label.
 * 
 * Parameters:
 *  item - another tag object or a string (html or otherwise)
 * 
 * Returns: n/a
 */
html.span.prototype.add_to = function(item){
    this._span_stack.add_to(item);
};

/*
 * Function: empty
 * 
 * Remove all content between the tags. This equates to removing the
 * label.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.span.prototype.empty = function(){
    this._span_stack.empty();
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.span.prototype.get_id = function(){
    return this._span_stack.get_id();
};

/*
 * Namespace: html.collapsible
 * 
 * Constructor: collapsible
 * 
 * Create the a frame for the functional part of a jQuery collapsible
 * structure.
 * 
 * :Input:
 * : [[title, string/*.to_string()], ...]
 * :
 * :Output:
 * :<div class="panel-group" id="accordion">
 * : <div class="panel panel-default">
 * :  <div class="panel-heading">
 * :   <h4 class="panel-title">
 * :    <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
 * :     ...
 * :    </a>
 * :   </h4>
 * :  </div>
 * :  <div id="collapseOne" class="panel-collapse collapse in">
 * :   <div class="panel-body">
 * :    ...
 * :   </div>
 * :  </div>
 * : </div>
 * : ...
 * 
 * Parameters:
 *  in_list - collapsible frame headers: [[title, string/*.to_string()], ...]
 *  attrs - *[serially optional]* attributes to apply to the new top-level div
 * 
 * Returns:
 *  html.collapsible object
 * 
 * Also see: <tag>
 */
html.collapsible = function(in_list, attrs){
    this._is_a = 'bbop-widget-set.html.collapsible';

    // Arg check--attrs should be defined as something.
    this._attrs = attrs || {};

    // We must add 'panel-group' to the class list.
    if( this._attrs['class'] ){
	this._attrs['class'] = this._attrs['class'] + ' panel-group';
    }else{
	this._attrs['class'] = 'panel-group';
    }

    // An id is necessary, and needs to be generated up front for
    // reference.
    this._cid = null;
    if( ! this._attrs['id'] ){
	this._attrs['id'] = 'gen_id-bbop-html-clps-' + bbop.randomness(20);
    }
    this._cid = this._attrs['id'];

    // Internal stack always starts with a div.
    this._div_stack = new html.tag('div', this._attrs);

    this._section_id_to_content_id = {};

    // Iterate over the incoming argument list.
    var collapsible_this = this;
    us.each(in_list, function(item){
	var sect_title = item[0];
	var content = item[1];
	collapsible_this.add_to(sect_title, content);
    });
};

/*
 * Function: to_string
 * 
 * Convert the collapsible object into a html-ized string.
 * 
 * Parameters: n/a
 * 
 * Returns:
 *  string
 */
html.collapsible.prototype.to_string = function(){
    return this._div_stack.to_string();
};

/*
 * Function: add_to
 * 
 * Add a contect section to the collapsible.
 * 
 * Parameters:
 *  section_info - a string or a hash with 'id', 'label', and 'description'
 *  content_blob - string or html object to put in a section
 * 
 * Returns: n/a
 */
html.collapsible.prototype.add_to = function(section_info, content_blob){
	
    // If section_info isn't an object, assume it is a string and
    // use it for everything.
    var section_id = null;
    var section_label = null;
    var section_desc = null;
    if(typeof section_info !== 'object' ){ // is a string
	section_id = section_info;
	section_label = section_info;
    }else{
	if( section_info['id'] ){ section_id = section_info['id']; }
	if( section_info['label'] ){ section_label = section_info['label']; }
	if( section_info['description'] ){
	    section_desc = section_info['description'];
	}
    }

    // Section ID and bookkeeping.
    var coll_id = 'collapsible-' + section_id + '-' + bbop.randomness(20);
    var cont_id = 'content-' + section_id + '-' + bbop.randomness(20);
    this._section_id_to_content_id[section_id] = cont_id;    

    // Inner-most header structure: label.
    //    <a data-toggle="collapse" data-parent="#this._cid" href="#cont_id">
    var title_a_attrs = {
    	'data-toggle': 'collapse',
    	'data-parent': '#' + this._cid,
    	'href': '#' + coll_id
    };
    // Cannot be null in assembly.
    if( section_desc ){	title_a_attrs['title'] = section_desc; }
    var title_a = new html.tag('a', title_a_attrs, section_label);
    
    //   <h4 class="panel-title">
    var h4_attrs = {
    	'class': 'panel-title'
    };
    var h4 = new html.tag('h4', h4_attrs, title_a);

    // Complete the panel heading.
    //  <div class="panel-heading">
    var divh_attrs = {
    	'class': 'panel-heading'
    };
    var divh = new html.tag('div', divh_attrs, h4);
    
    // Add the panel body.
    //    <div class="panel-body">
    var body_attrs = {
    	'class': 'panel-body',
	'style': 'overflow-x: auto;', // emergency overflow scrolling
    	'id': cont_id
    };
    var body = new html.tag('div', body_attrs, content_blob);

    // Add the collapsing frame around the panel body.
    //  <div id="collapseOne" class="panel-collapse collapse in">
    var divb_attrs = {
    	'class': 'panel-collapse collapse',
    	'id': coll_id
    };
    var divb = new html.tag('div', divb_attrs, body);

    // Add both to the local panel container.
    // <div class="panel panel-default">
    var divp_attrs = {
    	'class': 'panel panel-default'
    };
    var divp = new html.tag('div', divp_attrs, [divh, divb]);
    
    //
    this._div_stack.add_to(divp);
};

/*
 * Function: empty
 * 
 * Empty all sections from the collapsible.
 * 
 * Parameters: n/a
 * 
 * Returns: n/a
 */
html.collapsible.prototype.empty = function(){
    this._div_stack = new html.tag('div', this._attrs);
    this._section_id_to_content_id = {};
};

/*
 * Function: get_id
 * 
 * Return the id if extant, null otherwise.
 * 
 * Parameters: n/a
 * 
 * Returns: string or null
 */
html.collapsible.prototype.get_id = function(){
    return this._div_stack.get_id();
};

/*
 * Function: get_section_id
 * 
 * Get the "real" section id by way of the "convenience" section id?
 * 
 * Parameters:
 *  sect_id - TODO ???
 * 
 * Returns: TODO ???
 */
html.collapsible.prototype.get_section_id = function(sect_id){
	return this._section_id_to_content_id[sect_id];    
};


///
/// Exportable body.
///

module.exports = html;
