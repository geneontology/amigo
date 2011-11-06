////
//// Templates for output build around bbop.html.
//// Takes namespace GOlrTemplate.
////
//// TODO/BUG: remove the bits of bbop.html interface we don't need?
////

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'amigo');
bbop.core.require('bbop', 'html');
bbop.core.namespace('GOlrTemplate');

// GOlrTemplate.amigo = function (){
//     bbop.amigo.call(this);
// };
// GOlrTemplate.amigo.prototype = new bbop.amigo;


GOlrTemplate.two_column_layout = function (col1, col2){
    bbop.html.tag.call(this, 'div', {'class': 'twocol-wrapper'});

    // Left (control) side.
    this._two_column_stack_left =
	new bbop.html.tag('div',
			  {'class': 'twocol-leftcolumn',
			   'style': 'margin-top: -15px;'},
			  col1);
    this.add_to(this._two_column_stack_left);

    // Right (display) side.
    this._two_column_stack_right =
	new bbop.html.tag('div',
			  {'class': 'twocol-content',
			   'style': 'margin-left: 26em; margin-top: -15px;'},
			  col2);
    this.add_to(this._two_column_stack_right);
};
GOlrTemplate.two_column_layout.prototype = new bbop.html.tag;

// ...
GOlrTemplate.meta_results = function (total, first, last){
    bbop.html.tag.call(this, 'div');

    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
    this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
    this.add_to('Last: ' + last + '<br />');
    this.add_to('TODO: paging');
    // <a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
};
GOlrTemplate.meta_results.prototype = new bbop.html.tag;

// // ...
// GOlrTemplate.results_table_bio = function (header_list, results_list){
//     bbop.html.tag.call(this, 'div');

//     this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');

//     var p1 = new bbop.html.tag('p');
//     var p2 = new bbop.html.tag('p');

//     this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
//     this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
//     this.add_to('Last: ' + last + '<br />');
//     this.add_to('TODO: paging');
//     // <a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
// };
// GOlrTemplate.results_table_bio.prototype = new bbop.html.tag;

// ...
GOlrTemplate.results_term_table = function (docs){
    //bbop.html.tag.call(this, 'div');

    var amigo = new bbop.amigo();

    // ...
    var headers = ['score', 'name/description'];
    var table_buff = [];
    bbop.core.each(docs,
		   function(doc){
		       var entry_buff = [];

		       // Score handling for first entry.
		       var score = doc['score'] || 0.0;
		       score = bbop.core.to_string(100.0 * score);
		       entry_buff.push(bbop.core.crop(score, 4) + '%');

		       // Acc, name, and link construction.
		       // Description and final string assembly for
		       // second entry.
		       var acc = doc['id'] || null;
		       var link = amigo.link.term({'acc': acc});
		       var name = doc['label'] || 'n/a';
		       var a_title = 'Go to term details page for '+ name +'.';
		       var anchor =
			   new bbop.html.anchor(name, {'href': link,
						       'title': a_title});
		       var desc = doc['description'] || 'n/a';
		       entry_buff.push(anchor.to_string() +' (' + acc + ')' +
				       '<p>' +  desc + '</p>');

		       table_buff.push(entry_buff);
		   });
    
    return new bbop.html.table(headers,table_buff);
};
GOlrTemplate.results_term_table.prototype = new bbop.html.tag;

// ...
GOlrTemplate.results_gp_table = function (docs){
    // bbop.html.tag.call(this, 'div');

    // ...
    var headers = ['score', 'symbol/description', 'type', 'source', 'species'];
    var table_buff = [];
    bbop.core.each(docs,
		   function(doc){
		       var entry_buff = [];

		       // Score handling for first entry.
		       var score = doc['score'] || 0.0;
		       score = bbop.core.to_string(100.0 * score);
		       entry_buff.push(bbop.core.crop(score, 4) + '%');

		       // Acc, symbol, and desc construction.
		       // Description and final string assembly for
		       // second entry.
		       var acc = doc['id'] || null;
		       var link = amigo.link.gene_product({'acc': acc});
		       var name = doc['label'] || 'n/a';
		       var a_title = 'Go to gene product details page for ' +
			   name + '.';
		       var anchor =
			   new bbop.html.anchor(name, {'href': link,
						       'title': a_title});
		       var desc = doc['descriptive_name'] || 'n/a';
		       entry_buff.push(anchor.to_string() +' (' + acc + ')' +
				       '<p>' +  desc + '</p>');

		       // Third slot.
		       entry_buff.push(doc['type'] || 'n/a');

		       // Fourth slot.
		       entry_buff.push(doc['source'] || 'n/a');

		       // Fifth slot.
		       entry_buff.push(doc['taxon'] || 'n/a');

		       table_buff.push(entry_buff);
		   });
    return new bbop.html.table(headers,table_buff);
};
GOlrTemplate.results_gp_table.prototype = new bbop.html.tag;

// ...
GOlrTemplate.results_annotation_table = function (docs){
    // bbop.html.tag.call(this, 'div');

    var headers = ['score', 'term', 'evidence', 'gp symbol',
		   'type', 'source', 'species', 'extension'];
    // 'extension',
    var table_buff = [];
    bbop.core.each(docs,
		   function(doc){
		       var entry_buff = [];

		       // Score handling for first entry.
		       var score = doc['score'] || 0.0;
		       score = bbop.core.to_string(100.0 * score);
		       entry_buff.push(bbop.core.crop(score, 4) + '%');

		       // Acc, name, and link construction.
		       // Description and final string assembly for
		       // second entry.
		       var term_acc = doc['annotation_class'] || null;
		       var term_link = amigo.link.term({'acc': term_acc});
		       var term_name = doc['annotation_class_label'] || 'n/a';
		       var term_a_title = 'Go to term details page for ' +
			   term_name + '.';
		       var anchor =
			   new bbop.html.anchor(term_name,
						{'href': term_link,
						 'title': term_a_title});
		       entry_buff.push(anchor.to_string());

		       // Evidence is third.
		       entry_buff.push(doc['evidence_type'] || 'n/a');

		       // GP stuff. Fourth entry.
		       var gp_acc = doc['bioentity_id'] || null;
		       var gp_link = amigo.link.gene_product({'acc': gp_acc});
		       var symbol = doc['bioentity_label'] || 'n/a';
		       var gp_a_title = 'Go to gene product details page for ' +
			   symbol + '.';
		       var gp_anchor =
			   new bbop.html.anchor(symbol, {'href': gp_link,
							 'title': gp_a_title});
		       entry_buff.push(gp_anchor.to_string());

		       // Fifth slot.
		       entry_buff.push(doc['type'] || 'n/a');

		       // Sixth slot.
		       entry_buff.push(doc['source'] || 'n/a');

		       // Seventh slot.
		       entry_buff.push(doc['taxon'] || 'n/a');

		       // Eighth slot.
		       var exts = doc['annotation_extension_class'] || [];
		       var exts_str = exts.join(' ');
		       if( exts_str.length == 0 ){ exts_str = 'n/a'; }
		       entry_buff.push(exts_str);

		       table_buff.push(entry_buff);
		   });
    
    return new bbop.html.table(headers,table_buff);
};
GOlrTemplate.results_annotation_table.prototype = new bbop.html.tag;

// ...
GOlrTemplate.results_annotation_aggregate_table = function (docs){
    // bbop.html.tag.call(this, 'div');

    var headers = ['score', 'term', 'evidence', 'symbol',
		   'type', 'source', 'species'];
    // 'extension',
    var table_buff = [];
    bbop.core.each(docs,
		   function(doc){
		       var entry_buff = [];

		       // Score handling for first entry.
		       var score = doc['score'] || 0.0;
		       score = bbop.core.to_string(100.0 * score);
		       entry_buff.push(bbop.core.crop(score, 4) + '%');

		       // Acc, name, and link construction.
		       // Description and final string assembly for
		       // second entry.
		       var term_acc = doc['annotation_class'] || null;
		       var term_link = amigo.link.term({'acc': term_acc});
		       var term_name = doc['annotation_class_label'] || 'n/a';
		       var term_a_title = 'Go to term details page for ' +
			   term_name + '.';
		       var anchor =
			   new bbop.html.anchor(term_name,
						{'href': term_link,
						 'title': term_a_title});
		       entry_buff.push(anchor.to_string());

		       // Evidence closure is third.
		       var all_ev = doc['evidence_closure'] || [];
		       entry_buff.push(all_ev.join(', ') || 'n/a');

		       // GP stuff. Fourth entry.
		       var gp_acc = doc['bioentity_id'] || null;
		       var gp_link = amigo.link.gene_product({'acc': gp_acc});
		       var symbol = doc['bioentity_label'] || 'n/a';
		       var gp_a_title = 'Go to gene product details page for ' +
			   symbol + '.';
		       var gp_anchor =
			   new bbop.html.anchor(symbol, {'href': gp_link,
							 'title': gp_a_title});
		       entry_buff.push(gp_anchor.to_string());

		       // Fifth slot.
		       entry_buff.push(doc['type'] || 'n/a');

		       // Sixth slot.
		       entry_buff.push(doc['source'] || 'n/a');

		       // Seventh slot.
		       entry_buff.push(doc['taxon'] || 'n/a');

		       table_buff.push(entry_buff);
		   });
    
    return new bbop.html.table(headers,table_buff);
};
GOlrTemplate.results_annotation_aggregate_table.prototype = new bbop.html.tag;
