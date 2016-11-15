////
//// Some unit testing for html.js
////


var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var bbop_widgets = require('..');
var html = bbop_widgets.html;

describe('"Type checker" to enforce "interfaces" during testing.', function(){

    it('check "interface"', function(){

	us.each([
	    html.tag,
	    html.accordion,
	    html.list,
	    html.input,
	    html.anchor,
	    html.image,
	    html.table,
	    html.button,
	    html.span,
	    html.collapsible
	], function(ithing, index){
	    assert.isTrue(bbop.has_interface(ithing,
					     ['to_string',
					      'add_to',
					      'empty',
					      'get_id']),
    			  bbop.what_is(ithing) + ' ' + index +
			  ' supplies interface');
	});
    });
});

describe('tag', function(){

    it('part 1', function(){
	
	var t1 = new html.tag('div');
	assert.equal(bbop.what_is(t1), 'bbop-widget-set.html.tag', 'id');
	
	assert.equal(t1.to_string(), '<div />', "same div");
	
	var t2 = new html.tag('div', {foo: "bar"});
	assert.equal(t2.to_string(), '<div foo="bar" />', "same div attr");
	
	var t3 = new html.tag('div', {bar: "bib"});
	t3.add_to(t2);
	assert.equal(t3.to_string(),
		     '<div bar="bib"><div foo="bar" /></div>',
		     "same div compound");
	
	t3.empty();
	assert.equal(t3.to_string(),
		     '<div bar="bib" />',
		     "div emptied");
    });
    
    it('part 2', function(){

	var t1 = new html.tag('div', {foo: "bar"},
			      new html.tag('span', {'class': 'red'},
					   ['foo', 'bar']));
	assert.equal(t1.to_string(),
		     '<div foo="bar"><span class="red">foobar</span></div>',
		     "same hard div attr");
	
	t1.add_to(new html.tag('p', {}, 'happy'));
	assert.equal(t1.to_string(),
		     '<div foo="bar"><span class="red">foobar' +
		     '</span><p>happy</p></div>',
		     "same hard div attr 2");
    });

});

describe('accordion', function(){

    it('part 1', function(){
	
	var a0 = new html.accordion([]);
	assert.equal(bbop.what_is(a0), 'bbop-widget-set.html.accordion', 'id');
	assert.equal(a0.to_string(), '<div />', 'nil accordion');
	
	var a1 = new html.accordion([['foo', 'bar']],
				    {id: 'test-accordion'});
	assert.equal(a1.to_string(),
		     '<div id="test-accordion"><h3><a href="#">foo</a>' + 
		     '</h3><div><p>bar</p></div></div>',
		     'simple accordion');
	
	var t2 = new html.tag('div', {foo: "bar"}, 'bib');
	var a2 = new html.accordion([['foo1', 'yay!'], ['foo2', t2]],
				    {id: 'test-accordion'});
	assert.equal(a2.to_string(),
		     '<div id="test-accordion"><h3><a href="#">foo1</a>' + 
		     '</h3><div><p>yay!</p></div><h3><a href="#">foo2</a>' +
		     '</h3><div><p><div foo="bar">bib</div></p></div></div>',
		     'harder accordion');
	
	var a3 = new html.accordion([['foo', 'bar']],
				    {id: 'test-accordion'}, true);
	assert.equal(a3.get_section_id('foo').length, 34,
		     'id accordion');
    });
});

describe('list', function(){

    it('part 1', function(){
	
	var l1 = new html.list(['foo', 'bar'], {id: 'test-list'});
	assert.equal(bbop.what_is(l1), 'bbop-widget-set.html.list', 'id');

	assert.equal(l1.to_string(),
		     '<ul id="test-list"><li>foo</li><li>bar</li></ul>',
		     "check list 1");

	var l2 = new html.list([], {id: 'test-list'});
	l2.add_to('foo');
	l2.add_to('bar');
	assert.equal(l2.to_string(),
		     '<ul id="test-list"><li>foo</li><li>bar</li></ul>',
		     "check list 2");

	var l3 = new html.list([], {id: 'test-list'});
	l3.add_to('');
	l3.add_to('foo');
	l3.add_to('bar');
	assert.equal(l3.to_string(),
		     '<ul id="test-list"><li /><li>foo</li>' + 
		     '<li>bar</li></ul>',
		     "check list 3");
    });
});

describe('input', function(){

    it('part 1', function(){

	var i1 = new html.input({id: 'test-input', type: 'text'});
	assert.equal(i1.to_string(),
		     '<input id="test-input" type="text" />',
		     "quick input 1");
	var i2 = new html.input({id: 'test-input', type: 'text'});
	i2.add_to('foo');
	assert.equal(i2.to_string(),
		     '<input id="test-input" type="text">foo</input>',
		     "quick input 2");
	i2.empty();
	assert.equal(i2.to_string(),
		     '<input id="test-input" type="text" />',
		     "empty input");
    });
});

describe('table', function(){

    it('part 1', function(){
	
	// Simple.
	var t1 = new html.table([], []);
	assert.equal(bbop.what_is(t1), 'bbop-widget-set.html.table', 'table id');
	assert.equal(t1.to_string(), '<table><tbody /></table>', "table");

	// Equiv ops.
	t1.add_to(['foo', 'bar']);
	var t2 = new html.table([], [['foo', 'bar']]);
	assert.equal(t1.to_string(), t2.to_string(), 'equiv ops');
	assert.equal(t1.to_string(), '<table><tbody><tr class="even_row"><td>foo</td><td>bar</td></tr></tbody></table>', 'good out');

	// empty
	t1.empty();
	assert.equal(t1.to_string(), '<table><tbody /></table>', "empty table");

	// multi-row
	t1.add_to('foo');
	t1.add_to('bar');
	assert.equal(t1.to_string(), '<table><tbody><tr class="even_row"><td>foo</td></tr><tr class="odd_row"><td>bar</td></tr></tbody></table>', 'row out');

	// headers.
	var t3 = new html.table(['aaa', 'bbb'], [['one', 'two'], ['foo', 'bar']]);
	assert.equal(t3.to_string(), '<table><thead><tr><th>aaa</th><th>bbb</th></tr></thead><tbody><tr class="even_row"><td>one</td><td>two</td></tr><tr class="odd_row"><td>foo</td><td>bar</td></tr></tbody></table>', 'header table');
	t3.empty();
	assert.equal(t3.to_string(), '<table><thead><tr><th>aaa</th><th>bbb</th></tr></thead><tbody /></table>', 'header empty');
	
    });
});

describe('anchor', function(){

    it('part 1', function(){

	var a1 = new html.anchor();
	assert.equal(bbop.what_is(a1), 'bbop-widget-set.html.anchor', 'a id');
	assert.equal(a1.to_string(), '<a />', "anchor 1");
	a1.add_to('foo');
	assert.equal(a1.to_string(), '<a>foo</a>', "anchor 2");
	
	var a2 = new html.anchor('foo', {'href': 'bar', 'title': 'bib'});
	assert.equal(a2.to_string(),
		     '<a href="bar" title="bib">foo</a>',
		     "anchor 3");
	a2.empty();
	assert.equal(a2.to_string(),
		     '<a href="bar" title="bib" />',
		     "anchor 4");
	
    });
});

describe('button', function(){

    it('part 1', function(){
	
	// Basic button.
	var b1 = new html.button();
	assert.equal(bbop.what_is(b1), 'bbop-widget-set.html.button', 'buttonness');
	assert.equal(b1.to_string(), '<button />', "button 1 a");
	b1.add_to('foo');
	assert.equal(b1.to_string(), '<button>foo</button>', "button 1 b");
	
	// Fancy button and null id test.
	var b2 = new html.button('foo');
	assert.equal(b2.to_string(),
		     '<button>foo</button>',
		     "button 2 a");
	assert.isTrue(b2.get_id() == null,
		      "button 2 b");
	b2.empty();
	assert.equal(b2.to_string(),
     		     '<button />',
     		     "button 2 c");
	
	// Do some testing with the ids.
	var b3 = new html.button('foo', {'generate_id': true});
	// '<button>foo</button>',
	assert.equal(b3.get_id().length, 37, 'button id okay');
	assert.equal(b3.to_string().length, 63, 'button id with string okay');
	
    });
});

describe('image/img', function(){

    it('part 1', function(){
	
	var a1 = new html.image();
	assert.equal(bbop.what_is(a1), 'bbop-widget-set.html.image', 'a id');
	assert.equal(a1.to_string(), '<img />', "image 1");
	a1.add_to('foo');
	assert.equal(a1.to_string(), '<img>foo</img>', "image 2");
	
	var a2 = new html.image({'src': 'bar', 'title': 'bib'});
	assert.equal(a2.to_string(),
     		     '<img src="bar" title="bib" />',
     		     "image 3");
	
	// var a3 = new html.image({'alt': 'foo', 'src': 'bar',
	// 			      'generate_id': true});
	// assert.equal(a3.to_string(),
	//      		  '<img alt="foo" src="bar" />',
	//      		  "image 4");
	
    });
});

describe('ensure that the id generation actually works right', function(){

    it('part 1', function(){

	// These better be different!
	var t_attrs = {'generate_id': true};
	var t1 = new html.tag('foo', t_attrs);
	var t2 = new html.tag('foo', t_attrs);
	assert.notEqual(t1.get_id(), t2.get_id(), 'random tag ids');
	
	// These better be different!
	var l_attrs = {'generate_id': true};
	var l1 = new html.list([], l_attrs);
	var l2 = new html.list([], l_attrs);
	assert.notEqual(l1.get_id(), l2.get_id(), 'random list ids');
	
    });
});

describe('collapsible', function(){
    
    it('part 1', function(){
	
	var c = new html.collapsible();
	c.add_to('foo', 'bar');
	assert.equal(c.to_string().length, 498,
		     'widget seems to have the right number of chars');
	assert.equal(c.get_section_id('foo').length, 32,
		     'get seems to have the right number of chars');
    });
});
