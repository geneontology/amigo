////
//// Some unit testing for amigo.js
////
//// Usage:
////    Command line: "smjs -f amigo.tests.js"
////    Interactive: "smjs -f amigo.tests.js -f -"
////


// Load testing.
load('test.js');
var mr_t = new org.bbop.test();

// Correct environment.
load('amigo.js');

///
/// Start unit testing.
///

// Constructors.
var core = new org.bbop.amigo.core();
mr_t.is_defined(core);

// Test data. TODO: Split to separate file.
(function(){
    var d0 =
	{"success": 1,
	 "type": 'foo',
	 "errors": [],
	 "results": {"default": []}};
    var d1 =
	{"success": 1,
	 "errors": [],
	 "results": {"default": [],
		     "new": [],
		     "foo": [
			 {"date": "2009-05-21 01:39:07",
			  "name": "",
			  "type": "term",
			  "key": "GO:123"},
			 {"date":" 2009-05-21 01:39:24",
			  "name": "",
			  "type": "term",
			  "key": "GO:456"}
		     ]
		    }};
    var d2 =
	{"success": 0,
	 "errors": ["test error 1",
		    "test error 2"],
	 "results": {"default": [],
		     "new": []}};
    var d3 =
	{"errors": ["test error 1"],
	 "results": {"default": [],
		     "new": []}};
    var s0 = // Okay JSON string.
    '{"success": 1, "errors": [], "results": {"default": [], "new": [], "foo": [{"date": "2009-05-21 01:39:07", "name": "", "type": "term", "key": "GO:123"},{"date":" 2009-05-21 01:39:24", "name": "", "type": "term", "key": "GO:456"} ] }}';
    var s1 = // Borked JSON string.
    '{"success": 1, "errors": [], "results": {"default": [], "new": [], "foo": [{"date": "2009-05-21 01:39:07", "name": "", "type": "term", "key": "GO:123"},{"date":" 2009-05-21 01:39:24", "name": "", "type": "term", "key": "GO:456"} }}';
    
    // Response success.
    mr_t.is_same_atom(true, core.response.success(d0) , '');
    mr_t.is_same_atom(true, core.response.success(d1) , '');
    mr_t.is_same_atom(false, core.response.success(d2) , '');
    mr_t.is_same_atom(false, core.response.success(d3) , '');

    // Right type?
    mr_t.is_same_atom('foo', core.response.type(d0) , '');
    mr_t.is_same_atom('unknown', core.response.type(d1) , '');
    
    // Find error messages?
    mr_t.is_same_atom(0, core.response.errors(d0).length , '');
    mr_t.is_same_atom(0, core.response.errors(d1).length , '');
    mr_t.is_same_atom(2, core.response.errors(d2).length);
    mr_t.is_same_atom(1, core.response.errors(d3).length);

    // JSON parser...
    var good = org.bbop.amigo.json.parse(s0);
    mr_t.is_defined(good);
    mr_t.is_same_atom('GO:456', good.results.foo[1].key,
		  'parsed object has correct key');

    // Check a parse gone bad.
    var bad = null;
    try {
	bad = org.bbop.amigo.json.parse(s1);
    }catch(err){
	mr_t.is_same_atom(1, 1, 'should be error on bad parse');    
    }finally{
	if( bad ){
	    mr_t.is_same_atom(1, 2, 'bad parse should not generate object');    
	}
    }
})();

// Check randomness.
(function(){
    mr_t.is_same_atom(10, core.util.randomness().length);
    mr_t.is_same_atom(1, core.util.randomness(1).length);
    mr_t.is_same_atom(10, core.util.randomness(10).length);
    mr_t.is_same_atom(100, core.util.randomness(100).length);
    mr_t.is_true(core.util.randomness(10) != core.util.randomness(10),
		 "checking entropy in universe");
})();

// Check urls.
(function(){
    // Do some link testing.
    mr_t.is_same_url(core.api.completion({}),
		     "completion?narrow=false&ontology=&format=amigo&type=general&query=",
		     "link compare testing 1");
    // Different order.
    mr_t.is_same_url(core.api.completion({}),
		     "completion?narrow=false&ontology=&type=general&format=amigo&query=",
		     "link compare testing 2");
    // Just different.
    mr_t.is_different_url(core.api.completion({}),
			  "completion?type=general&format=opensearch&query=",
			  "link compare testing 3");
    // Again just different.
    mr_t.is_different_url(core.api.completion({}),
			  "completion?type=general&format=&query=",
			  "link compare testing 4");
    
    // A little real link testing.
    mr_t.is_same_url(core.api.completion({type:'term', format:'opensearch'}),
		     "completion?narrow=false&ontology=&type=term&format=opensearch&query=",
		     "completion api test 1");
})();

// Check hash merging.
(function(){
    var a_hash = {foo: 1, bar: 2};
    mr_t.is_same_hash({}, core.util.merge({},{}), 'empty merge');
    mr_t.is_same_hash(a_hash, core.util.merge({foo:1, bar:2},{}), 'same merge');
    mr_t.is_same_hash(a_hash, core.util.merge({foo:1, bar:3},{bar:2}),
		      'distinct merge');
    mr_t.is_different_hash(a_hash, core.util.merge({foo:1},{bar:2}),
			   'bar merge');
})();

// Check cloning.
(function(){

    var foo = {a: 1, b: true, c:[1,2,[3]], d:{one: 'a', two: ['b']}};
    var bar = core.util.clone(foo);

    // Change the original.
    foo.a = 2;
    foo.b = false;
    foo.c[2][0] = 4;
    foo.d.two[0] = 'c';

    // Check the similarities.
    mr_t.is_same_atom(foo.c.length, bar.c.length, 'array length preserved');
    mr_t.is_same_atom(foo.c[0], bar.c[0], 'array 0 preserved');
    mr_t.is_same_atom(foo.d.one, bar.d.one, 'hash prop preserved');    

    // Check differences.
    mr_t.is_different_atom(foo.a, bar.a, 'different int');
    mr_t.is_different_atom(foo.b, bar.b, 'different bool');
    mr_t.is_different_atom(foo.c[2][0], bar.c[2][0], 'different double index');
    mr_t.is_different_atom(foo.d.two[0], bar.d.two[0], 'different in hash');
})();

// Check encoding ids.
(function(){

    var rounds = ["GO:1234567", "GO::GO:1234567", "::1:2::3:"];
    var coders = [new core.util.coder(),
		  new core.util.coder({string: "_TEST_", size: 1})];

    // Iterate through coders and strings.
    for( var cdr = 0; cdr < coders.length; cdr++ ){
	var coder = coders[cdr];
	for( var rnd = 0; rnd < rounds.length; rnd++ ){
	    var round = rounds[rnd];

	    //
	    var enc = coder.encode(round);
	    //print(enc);
	    mr_t.is_same_atom(round, coder.decode(enc),
			      "round trip (coder: " +
			      cdr + ', string: "' +
			      round + '")');
	}
    }
})();

///
/// End unit testing.
///

// Final report.
mr_t.report();

///
/// See how kvetch behaves.
///

core.kvetch("FAIL: You should *not* see this string (1)!");
org.bbop.amigo.DEBUG = true;
//core.kvetch("[You should see this string--please ignore.]");
org.bbop.amigo.DEBUG = false;
core.kvetch("FAIL: You should *not* see this string (2)!");

///
/// Play with prototypes...
///

function Foo(id){

    var internal_id = id;
    this.id = function(){
	return internal_id;
    }

    // Private?
    var power_p = false;
    this.on = function(){
	power_p = true;
    }
    this.off = function(){
	power_p = false;
    }
    this.power_p = function(){
	return power_p;
    };

    // Public?
    this.moving_p = false;
    this.go = function(){
	this.moving_p = true;
    };
}

// NOTE: not attached during apply.
Foo.prototype.stopFoo = function(){
    this.moving_p = false;
};

function Bar(name){

    // Apply the Foo "constructor" to this (which is our Bar
    // instance). Mangle the if on the way.
    Foo.apply(this, [arguments[0] + "_blah"]);

    // Capture.
    this.status = function(){
	return " (type, " + this.id() +
	    ") (power, " + this.power_p() +
	    ") (moving, " + this.moving_p + ")";
    }
}
Bar.prototype.stopBar = function(){
    this.moving_p = false;
};
// NOTE: although the the prototype is correct, cannot pass
// constructor arguments as above.
//Bar.prototype = new Foo;

c = new Bar("123");
c.status();
c.on();
c.go();
//c.stopFoo(); // Nope.
c.stopBar(); // Okay.
c.status();


// Define A.
Arg = function (prop){
    if(prop){
	this.prop_a = prop;
    }
    prop_b = prop + '...but not';
};
Arg.prototype = {
    prop_a: 'n/a',
    get_prop_a: function(){
	return this.prop_a;
    }
    ,
    get_prop_b: function(){
	return this.prop_b || 'n/b';
    }
};

// Define B.
Arg.Blah = function(prop_a, prop_c){
    Arg.call(this, prop_a);
    this.prop_c = prop_c || 'n/c';
};
extend(Arg.Blah, Arg);


ab = new Arg.Blah('foo', 'bar');
ab.get_prop_b();
