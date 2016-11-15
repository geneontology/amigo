////
//// Some unit testing for bracket.js.
////


var assert = require('chai').assert;

var bbop = require('bbop-core');
var us = require('underscore');
var each = us.each;

var bbop_widgets = require('..');
var graph_tools = bbop_widgets.graph_tools;

// Graphs.
var model = require('bbop-graph');

///
/// Start testing.
///

describe('bracket', function(){

    it('testing helpers', function(){

	var s = graph_tools;
	console.log('graph_tools', graph_tools);
	assert.equal(s.relation_weight(), 0, "weight: naught");
	assert.equal(s.relation_weight(''), 0, "weight: empty");
	assert.equal(s.relation_weight('bag'), 0, "weight: bag default");
	assert.equal(s.relation_weight('', 0), 0, "weight: empty default");
	assert.equal(s.relation_weight('', 5.5), 5.5, "weight: empty num");
	assert.equal(s.relation_weight('is_a'), 1, "weight: is_a default");
	assert.notEqual(s.relation_weight('is_a', 7), 7,
			"weight: default override");
	
	assert.equal(s.dominant_relationship(), null,
		     "dom_rel: naught");
	assert.equal(s.dominant_relationship('foo'), 'foo',
		     "dom_rel: naught foo");
	assert.equal(s.dominant_relationship('foo', 'is_a'), 'is_a',
		     "dom_rel: foo is_a");
	assert.equal(s.dominant_relationship('part_of', 'is_a'), 'part_of',
		     "dom_rel: part_of is_a");
	assert.equal(s.dominant_relationship('is_a', 'part_of'), 'part_of',
		     "dom_rel: is_a part_of");
	assert.equal(s.dominant_relationship(['is_a', 'part_of']), 'part_of',
		     "dom_rel: [is_a part_of]");
	assert.equal(s.dominant_relationship(['is_a', 'part_of'],
					     ['regulates']), 'regulates',
		     "dom_rel: regulates");

    });

    it('The topology graph from the GO:0022008 doc.', function(){

    	var topology_graph_raw =
    		{"nodes":[{"id":"GO:0009987","lbl":"cellular process"},{"id":"GO:0048869","lbl":"cellular developmental process"},{"id":"GO:0048731","lbl":"system development"},{"id":"GO:0007275","lbl":"multicellular organismal development"},{"id":"GO:0030154","lbl":"cell differentiation"},{"id":"GO:0007399","lbl":"nervous system development"},{"id":"GO:0048856","lbl":"anatomical structure development"},{"id":"GO:0008150","lbl":"biological_process"},{"id":"GO:0050769","lbl":"positive regulation of neurogenesis"},{"id":"GO:0042063","lbl":"gliogenesis"},{"id":"GO:0022008","lbl":"neurogenesis"},{"id":"GO:0032502","lbl":"developmental process"},{"id":"GO:0050767","lbl":"regulation of neurogenesis"},{"id":"GO:0032501","lbl":"multicellular organismal process"},{"id":"GO:0050768","lbl":"negative regulation of neurogenesis"},{"id":"GO:0048699","lbl":"generation of neurons"}],"edges":[{"sub":"GO:0022008","obj":"GO:0007399","pred":"part_of"},{"sub":"GO:0050768","obj":"GO:0022008","pred":"negatively_regulates"},{"sub":"GO:0042063","obj":"GO:0022008","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0030154","pred":"is_a"},{"sub":"GO:0032501","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0032502","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0048731","obj":"GO:0048856","pred":"is_a"},{"sub":"GO:0007399","obj":"GO:0048731","pred":"is_a"},{"sub":"GO:0007275","obj":"GO:0032501","pred":"is_a"},{"sub":"GO:0048869","obj":"GO:0009987","pred":"is_a"},{"sub":"GO:0048856","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0007275","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0050769","obj":"GO:0022008","pred":"positively_regulates"},{"sub":"GO:0048699","obj":"GO:0022008","pred":"is_a"},{"sub":"GO:0048869","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0009987","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0050767","obj":"GO:0022008","pred":"regulates"},{"sub":"GO:0030154","obj":"GO:0048869","pred":"is_a"},{"sub":"GO:0048731","obj":"GO:0007275","pred":"part_of"}]};

    	// Load the graphs
    	var topo = new model.graph();
    	topo.load_base_json(topology_graph_raw);
	
    	// The produced bracket layout should look like:
    	// [["GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx" "GO:xxxxxx" "GO:xxxxxxx" "GO:xxxxxxx"]]
    	var l = graph_tools.bracket_layout(topo, 'GO:0022008');
	
    	assert.equal(l[0].length, 1, "0,1");
    	assert.equal(l[0][0], "GO:0008150","0:0");
	
    	assert.equal(l[1].length, 2, "1,2");
    	assert.include(l[1], "GO:0032502", "1:0");
    	assert.include(l[1], "GO:0032501", "1:1");
	
    	assert.equal(l[2].length, 3, "2,3");
    	assert.include(l[2], "GO:0048856", "2:0");
    	assert.include(l[2], "GO:0009987", "2:1");
    	assert.include(l[2], "GO:0007275", "2:2");
	
    	assert.equal(l[3].length, 2, "3,2");
    	assert.include(l[3], "GO:0048869", "3:0");
    	assert.include(l[3], "GO:0048731", "3:1");
	
    	assert.equal(l[4].length, 2, "4,2");
    	assert.include(l[4], "GO:0030154", "4:0");
    	assert.include(l[4], "GO:0007399", "4:1");
	
    	assert.equal(l[5].length, 1, "5,1");
    	assert.equal(l[5][0], "GO:0022008", "5:0");
	
    	assert.equal(l[6].length, 5, "6,5");
    	assert.include(l[6], "GO:0048699", "6:0");
    	assert.include(l[6], "GO:0042063", "6:1");
    	assert.include(l[6], "GO:0050768", "6:2");
    	assert.include(l[6], "GO:0050769", "6:3");
    	assert.include(l[6], "GO:0050767", "6:4");
	
    	// Now lets look at the transitivity graph and a richer layout.
    	// The transitivity graph from the GO:0022008 doc.
    	var transitivity_graph_raw =
    		{"nodes":[{"id":"GO:0009987","lbl":"cellular process"},{"id":"GO:0022008","lbl":"neurogenesis"},{"id":"GO:0032502","lbl":"developmental process"},{"id":"GO:0032501","lbl":"multicellular organismal process"},{"id":"GO:0048869","lbl":"cellular developmental process"},{"id":"GO:0007275","lbl":"multicellular organismal development"},{"id":"GO:0048731","lbl":"system development"},{"id":"GO:0030154","lbl":"cell differentiation"},{"id":"GO:0007399","lbl":"nervous system development"},{"id":"GO:0048856","lbl":"anatomical structure development"},{"id":"GO:0008150","lbl":"biological_process"}],"edges":[{"sub":"GO:0022008","obj":"GO:0032502","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0007399","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0007275","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0032502","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0009987","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0030154","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0032501","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0048869","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0048856","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0008150","pred":"is_a"},{"sub":"GO:0022008","obj":"GO:0008150","pred":"part_of"},{"sub":"GO:0022008","obj":"GO:0048731","pred":"part_of"}]};
	
    	var trans = new model.graph();
    	trans.load_base_json(transitivity_graph_raw);
    	var rl = graph_tools.rich_bracket_layout(topo, trans, 'GO:0022008');
	
    	// Tests on exact rich layout (Just like AmiGO 2).
    	// Look like: [[["GO:0008150", "biological_process", "part_of"]], [["GO:0032502", "developmental process", "part_of"], ["GO:0032501", "multicellular organismal process", "part_of"]], [["GO:0048856", "anatomical structure development", "part_of"], ["GO:0009987", "cellular process", "is_a"], ["GO:0007275", "multicellular organismal development", "part_of"]], [["GO:0048869", "cellular developmental process", "is_a"], ["GO:0048731", "system development", "part_of"]], [["GO:0030154", "cell differentiation", "is_a"], ["GO:0007399", "nervous system development", "part_of"]], [["GO:0022008", "neurogenesis", "is_a"]], [["GO:0048699", "generation of neurons", "is_a"], ["GO:0042063", "gliogenesis", "is_a"], ["GO:0050768", "negative regulation of neurogenesis", "negatively_regulates"], ["GO:0050769", "positive regulation of neurogenesis", "positively_regulates"], ["GO:0050767", "regulation of neurogenesis", "regulates"]]]
    	assert.equal(rl[0].length, 1, "rl: 0,1");
    	assert.equal(rl[0][0][0], "GO:0008150","0:0");
    	assert.equal(rl[0][0][1], "biological_process","0:0");
    	assert.equal(rl[0][0][2], "part_of","0:0");
	
    	assert.equal(rl[1].length, 2, "rl: 1,2");
    	assert.equal("GO:0032502", rl[1][0][0], "rl: 1:0");
    	assert.equal("developmental process", rl[1][0][1], "rl: 1:0");
    	assert.equal("part_of", rl[1][0][2], "rl: 1:0");
    	assert.equal("GO:0032501", rl[1][1][0], "rl: 1:1");
    	assert.equal("multicellular organismal process", rl[1][1][1], "rl: 1:1");
    	assert.equal("part_of", rl[1][1][2], "rl: 1:1");
	
    	assert.equal(rl[2].length, 3, "rl: 2,3");
    	// assert.equal("GO:0048856", rl[2], "rl: 2:0");
    	// assert.equal("GO:0009987", rl[2], "rl: 2:1");
    	// assert.equal("GO:0007275", rl[2], "rl: 2:2");
	
    	assert.equal(rl[3].length, 2, "rl: 3,2");
    	// assert.equal("GO:0048869", rl[3], "rl: 3:0");
    	// assert.equal("GO:0048731", rl[3], "rl: 3:1");
	
    	assert.equal(rl[4].length, 2, "rl: 4,2");
    	// assert.equal("GO:0030154", rl[4], "rl: 4:0");
    	// assert.equal("GO:0007399", rl[4], "rl: 4:1");
	
    	assert.equal(rl[5].length, 1, "rl: 5,1");
    	// assert.equal(rl[5][0], "GO:0022008", "rl: 5:0");
	
    	assert.equal(rl[6].length, 5, "rl: 6,5");
    	// assert.equal("GO:0048699", rl[6], "rl: 6:0");
    	// assert.equal("GO:0042063", rl[6], "rl: 6:1");
    	// assert.equal("GO:0050768", rl[6], "rl: 6:2");
    	// assert.equal("GO:0050769", rl[6], "rl: 6:3");
    	assert.equal("GO:0050767", rl[6][4][0], "rl: 6:4");
    	assert.equal("regulation of neurogenesis", rl[6][4][1], "rl: 6:4");
    	assert.equal("regulates", rl[6][4][2], "rl: 6:4");
	
    });

    it('Real failing in NCBITaxon:89593 -- Craniata', function(){

    	var topology_graph_raw = {
    	    "nodes": [
    		{"id":"A","lbl":"root"},
    		{"id":"B","lbl":"cellular organisms"},
    		{"id":"C","lbl":"Eukaryota"},
    		{"id":"D","lbl":"Fungi/Metazoa group"},
    		{"id":"E","lbl":"Metazoa"},
    		{"id":"F","lbl":"Eumetazoa"},
    		{"id":"G","lbl":"Bilateria"},
    		{"id":"H","lbl":"Coelomata"},
    		{"id":"I","lbl":"Deuterostomia"},
    		{"id":"J","lbl":"Chordata"},
    		{"id":"K","lbl":"Craniata"},
    		{"id":"L","lbl":"Vertebrata"},
    		{"id":"M","lbl":"Hyperotreti"}
    	    ],
    	    "edges": [
    		{"sub":"B","obj":"A","pred":"is_a"},
    		{"sub":"C","obj":"B","pred":"is_a"},
    		{"sub":"D","obj":"C","pred":"is_a"},
    		{"sub":"E","obj":"D","pred":"is_a"},
    		{"sub":"F","obj":"E","pred":"is_a"},
    		{"sub":"G","obj":"F","pred":"is_a"},
    		{"sub":"H","obj":"G","pred":"is_a"},
    		{"sub":"I","obj":"H","pred":"is_a"},
    		{"sub":"J","obj":"I","pred":"is_a"},
    		{"sub":"K","obj":"J","pred":"is_a"},
    		{"sub":"L","obj":"K","pred":"is_a"},
    		{"sub":"M","obj":"K","pred":"is_a"}
    	    ]
    	};


    	// Load the graphs
    	var topo = new model.graph();
    	topo.load_base_json(topology_graph_raw);
	
    	// The produced bracket layout should look like:
    	// [["GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx"],
    	//  ["GO:xxxxxxx"],
    	//  ["GO:xxxxxxx", "GO:xxxxxxx" "GO:xxxxxx" "GO:xxxxxxx" "GO:xxxxxxx"]]
    	var l = graph_tools.bracket_layout(topo, 'K');
	
    	// Bracket sizes.
    	assert.equal(l[0].length, 1, "tax: 0.1");
    	assert.equal(l[1].length, 1, "tax: 1.1");
    	assert.equal(l[2].length, 1, "tax: 2.1");
    	assert.equal(l[3].length, 1, "tax: 3.1");
    	assert.equal(l[4].length, 1, "tax: 4.1");
    	assert.equal(l[5].length, 1, "tax: 5.1");
    	assert.equal(l[6].length, 1, "tax: 6.1");
    	assert.equal(l[7].length, 1, "tax: 7.1");
    	assert.equal(l[8].length, 1, "tax: 8.1");
    	assert.equal(l[9].length, 1, "tax: 9.1");
    	assert.equal(l[10].length, 1, "tax: 10.1");
    	assert.equal(l[11].length, 2, "tax: 11.2");

    	// Bracket contents.
    	assert.equal(l[0][0], "A", "tax: 0:0");
    	assert.equal(l[1][0], "B", "tax: 1:0");
    	assert.equal(l[2][0], "C", "tax: 2:0");
    	assert.equal(l[3][0], "D", "tax: 3:0");
    	assert.equal(l[4][0], "E", "tax: 4:0");
    	assert.equal(l[5][0], "F", "tax: 5:0");
    	assert.equal(l[6][0], "G", "tax: 6:0");
    	assert.equal(l[7][0], "H", "tax: 7:0");
    	assert.equal(l[8][0], "I", "tax: 8:0");
    	assert.equal(l[9][0], "J", "tax: 9:0");
    	assert.equal(l[10][0], "K", "tax: 10:0");
    	assert.equal(l[11][0], "L", "tax: 11:0");
    	assert.equal(l[11][1], "M", "tax: 11:1");

    });

});

