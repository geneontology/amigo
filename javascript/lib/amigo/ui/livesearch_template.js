/*
 * Package: livesearch_template.js
 * 
 * Namespace: amigo.ui.livesearch_template
 * 
 * Templates for output built around bbop.html.
 * 
 * These function/objects are either subclasses of <bbop.html.tag> or
 * return an object from the <bbop.html> family.
 * 
 * TODO/BUG: remove the bits of bbop.html interface we don't need?
 */

bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'amigo');
bbop.core.require('bbop', 'html');
bbop.core.namespace('amigo', 'ui', 'livesearch_template');

/*
 * Function: two_column_layout
 *
 * Produce a div containing a CSS hardwired two-column layout.
 * These are currently hardwired to:
 * 
 * : 'class': 'twocol-leftcolumn', 'style': 'margin-top: -15px;'
 * : 'class': 'twocol-content', 'style': 'margin-left: 26em; margin-top: -15px;'
 * 
 * Parameters:
 *  col1 - the string or <bbop.html> object for the left column
 *  col2 - the string or <bbop.html> object for the right column
 *
 * Returns:
 *  <bbop.html.tag>
 */
amigo.ui.livesearch_template.two_column_layout = function (col1, col2){
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
amigo.ui.livesearch_template.two_column_layout.prototype = new bbop.html.tag;

/*
 * Function: meta_results
 *
 * Draw a typical meta results section for the response data.
 * 
 * Parameters:
 *  total - integer
 *  first - integer
 *  last - integer
 * 
 * Returns:
 *  <bbop.html.tag>
 */
amigo.ui.livesearch_template.meta_results = function (total, first, last){
    bbop.html.tag.call(this, 'div');

    // Add number slots.
    this.add_to('Total: ' + total + '&nbsp;&nbsp;&nbsp;');
    this.add_to('First: ' + first + '&nbsp;&nbsp;&nbsp;');
    this.add_to('Last: ' + last + '<br />');

    // // Add button slots.
    // this.add_to('<button />');
    ////<a id="for_paging_id_f0ccpl4zp0" href="#results_block">forward -&gt;</a>
};
amigo.ui.livesearch_template.meta_results.prototype = new bbop.html.tag;

/*
 * Function: results_table_by_class_conf
 *
 * Using a conf class and a set of data, automatically populate and
 * return a results table.
 *  
 * Parameters:
 *  class_conf - a <bbop.golr.conf_class>
 *  docs_array - the docs array from the solr return
 *  linker_function - see <bbop.amigo.linker> for more details
 *
 * Returns:
 *  <bbop.html.table> filled with results
 */
amigo.ui.livesearch_template.results_table_by_class = function (cclass, docs,
							    linker_function){
    //bbop.html.tag.call(this, 'div');
    //var amigo = new bbop.amigo();

    // // Temp logger.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch('TT: ' + str); }

    var each = bbop.core.each; // conveience

    // Start with score, and add the others by order of the class
    // results_weights field.
    var headers = ['score'];
    var headers_display = ['Score'];
    var results_order = cclass.field_order_by_weight('result');
    each(results_order,
	 function(fid){
	     // Store the raw headers/fid for future use.
	     headers.push(fid);
	     // Get the headers into a presentable state.
	     var field = cclass.get_field(fid);
	     if( ! field ){ throw new Error('conf error: not found:' + fid); }
	     headers_display.push(field.display_name());
	 });

    // // For each doc, deal with it as best we can using a little
    // // probing. Score is a special case as it is not an explicit
    // // field.
    // function _process_doc(doc){
    // 	var entry_buff = [];
	
    // }
    function _process_entry(fid, iid, doc){

	var retval = '';

	// Probe.
	//var iid = doc[fid];
	var ilabel = doc[fid + '_label'];
	var link = linker_function(fid, {id: iid, label: ilabel}, 'link');

	// See what we got.
	if( link ){
	    retval = link;
	}else if( ilabel ){
	    retval = ilabel;
	}else{
	    retval = iid;
	}

	return retval;
    }

    var table_buff = [];
    each(docs,
	 function(doc){
	     
	     // Well, they had better be in here, so we're
	     // just gunna cycle through all the headers/fids.
	     var entry_buff = [];
	     each(headers,
		  function(fid){
		      // Remember: score is a special--non-explicit--case.
		      if( fid == 'score' ){
			  var score = doc['score'] || 0.0;
			  score = bbop.core.to_string(100.0 * score);
			  entry_buff.push(bbop.core.crop(score, 4) + '%');
		      }else{
			  // Not "score", so let's figure out what we
			  // can automatically.
			  var field = cclass.get_field(fid);

			  // Make sure we can iterate over whatever it
			  // is.
			  var bits = [];
			  if( field.is_multi() ){
			      bits = doc[fid];
			  }else{
			      bits = [doc[fid]];
			  }

			  // Render each of the bits.
			  var tmp_buff = [];
			  each(bits,
			       function(bit){
				   var out = _process_entry(fid, bit, doc);
				   //ll('out: ' + out);
				   tmp_buff.push(out);
			       });
			  entry_buff.push(tmp_buff.join(' '));
		      }
		  });
	     table_buff.push(entry_buff);
	 });
    
    return new bbop.html.table(headers_display, table_buff);
};
amigo.ui.livesearch_template.results_table_by_class.prototype = new bbop.html.tag;

// // ...
// amigo.ui.livesearch_template.results_term_table = function (docs){
//     //bbop.html.tag.call(this, 'div');

//     var amigo = new bbop.amigo();

//     // ...
//     var headers = ['score', 'name/description'];
//     var table_buff = [];
//     bbop.core.each(docs,
// 		   function(doc){
// 		       var entry_buff = [];

// 		       // Score handling for first entry.
// 		       var score = doc['score'] || 0.0;
// 		       score = bbop.core.to_string(100.0 * score);
// 		       entry_buff.push(bbop.core.crop(score, 4) + '%');

// 		       // Acc, name, and link construction.
// 		       // Description and final string assembly for
// 		       // second entry.
// 		       var acc = doc['id'] || null;
// 		       var link = amigo.link.term({'acc': acc});
// 		       var name = doc['label'] || 'n/a';
// 		       var a_title = 'Go to term details page for '+ name +'.';
// 		       var anchor =
// 			   new bbop.html.anchor(name, {'href': link,
// 						       'title': a_title});
// 		       var desc = doc['description'] || 'n/a';
// 		       entry_buff.push(anchor.to_string() +' (' + acc + ')' +
// 				       '<p>' +  desc + '</p>');

// 		       table_buff.push(entry_buff);
// 		   });
    
//     return new bbop.html.table(headers,table_buff);
// };
// amigo.ui.livesearch_template.results_term_table.prototype = new bbop.html.tag;

// // ...
// amigo.ui.livesearch_template.results_gp_table = function (docs){
//     // bbop.html.tag.call(this, 'div');

//     // ...
//     var headers = ['score', 'symbol/description', 'type', 'source', 'species'];
//     var table_buff = [];
//     bbop.core.each(docs,
// 		   function(doc){
// 		       var entry_buff = [];

// 		       // Score handling for first entry.
// 		       var score = doc['score'] || 0.0;
// 		       score = bbop.core.to_string(100.0 * score);
// 		       entry_buff.push(bbop.core.crop(score, 4) + '%');

// 		       // Acc, symbol, and desc construction.
// 		       // Description and final string assembly for
// 		       // second entry.
// 		       var acc = doc['id'] || null;
// 		       var link = amigo.link.gene_product({'acc': acc});
// 		       var name = doc['label'] || 'n/a';
// 		       var a_title = 'Go to gene product details page for ' +
// 			   name + '.';
// 		       var anchor =
// 			   new bbop.html.anchor(name, {'href': link,
// 						       'title': a_title});
// 		       var desc = doc['descriptive_name'] || 'n/a';
// 		       entry_buff.push(anchor.to_string() +' (' + acc + ')' +
// 				       '<p>' +  desc + '</p>');

// 		       // Third slot.
// 		       entry_buff.push(doc['type'] || 'n/a');

// 		       // Fourth slot.
// 		       entry_buff.push(doc['source'] || 'n/a');

// 		       // Fifth slot.
// 		       entry_buff.push(doc['taxon'] || 'n/a');

// 		       table_buff.push(entry_buff);
// 		   });
//     return new bbop.html.table(headers,table_buff);
// };
// amigo.ui.livesearch_template.results_gp_table.prototype = new bbop.html.tag;

// // ...
// amigo.ui.livesearch_template.results_annotation_table = function (docs){
//     // bbop.html.tag.call(this, 'div');

//     var headers = ['score', 'term', 'evidence', 'gp symbol',
// 		   'type', 'source', 'species', 'extension'];
//     // 'extension',
//     var table_buff = [];
//     bbop.core.each(docs,
// 		   function(doc){
// 		       var entry_buff = [];

// 		       // Score handling for first entry.
// 		       var score = doc['score'] || 0.0;
// 		       score = bbop.core.to_string(100.0 * score);
// 		       entry_buff.push(bbop.core.crop(score, 4) + '%');

// 		       // Acc, name, and link construction.
// 		       // Description and final string assembly for
// 		       // second entry.
// 		       var term_acc = doc['annotation_class'] || null;
// 		       var term_link = amigo.link.term({'acc': term_acc});
// 		       var term_name = doc['annotation_class_label'] || 'n/a';
// 		       var term_a_title = 'Go to term details page for ' +
// 			   term_name + '.';
// 		       var anchor =
// 			   new bbop.html.anchor(term_name,
// 						{'href': term_link,
// 						 'title': term_a_title});
// 		       entry_buff.push(anchor.to_string());

// 		       // Evidence is third.
// 		       entry_buff.push(doc['evidence_type'] || 'n/a');

// 		       // GP stuff. Fourth entry.
// 		       var gp_acc = doc['bioentity_id'] || null;
// 		       var gp_link = amigo.link.gene_product({'acc': gp_acc});
// 		       var symbol = doc['bioentity_label'] || 'n/a';
// 		       var gp_a_title = 'Go to gene product details page for ' +
// 			   symbol + '.';
// 		       var gp_anchor =
// 			   new bbop.html.anchor(symbol, {'href': gp_link,
// 							 'title': gp_a_title});
// 		       entry_buff.push(gp_anchor.to_string());

// 		       // Fifth slot.
// 		       entry_buff.push(doc['type'] || 'n/a');

// 		       // Sixth slot.
// 		       entry_buff.push(doc['source'] || 'n/a');

// 		       // Seventh slot.
// 		       entry_buff.push(doc['taxon'] || 'n/a');

// 		       // Eighth slot.
// 		       var exts = doc['annotation_extension_class'] || [];
// 		       var exts_str = exts.join(' ');
// 		       if( exts_str.length == 0 ){ exts_str = 'n/a'; }
// 		       entry_buff.push(exts_str);

// 		       table_buff.push(entry_buff);
// 		   });
    
//     return new bbop.html.table(headers,table_buff);
// };
// amigo.ui.livesearch_template.results_annotation_table.prototype = new bbop.html.tag;

// // ...
// amigo.ui.livesearch_template.results_annotation_aggregate_table = function (docs){
//     // bbop.html.tag.call(this, 'div');

//     var headers = ['score', 'term', 'evidence', 'symbol',
// 		   'type', 'source', 'species'];
//     // 'extension',
//     var table_buff = [];
//     bbop.core.each(docs,
// 		   function(doc){
// 		       var entry_buff = [];

// 		       // Score handling for first entry.
// 		       var score = doc['score'] || 0.0;
// 		       score = bbop.core.to_string(100.0 * score);
// 		       entry_buff.push(bbop.core.crop(score, 4) + '%');

// 		       // Acc, name, and link construction.
// 		       // Description and final string assembly for
// 		       // second entry.
// 		       var term_acc = doc['annotation_class'] || null;
// 		       var term_link = amigo.link.term({'acc': term_acc});
// 		       var term_name = doc['annotation_class_label'] || 'n/a';
// 		       var term_a_title = 'Go to term details page for ' +
// 			   term_name + '.';
// 		       var anchor =
// 			   new bbop.html.anchor(term_name,
// 						{'href': term_link,
// 						 'title': term_a_title});
// 		       entry_buff.push(anchor.to_string());

// 		       // Evidence closure is third.
// 		       var all_ev = doc['evidence_closure'] || [];
// 		       entry_buff.push(all_ev.join(', ') || 'n/a');

// 		       // GP stuff. Fourth entry.
// 		       var gp_acc = doc['bioentity_id'] || null;
// 		       var gp_link = amigo.link.gene_product({'acc': gp_acc});
// 		       var symbol = doc['bioentity_label'] || 'n/a';
// 		       var gp_a_title = 'Go to gene product details page for ' +
// 			   symbol + '.';
// 		       var gp_anchor =
// 			   new bbop.html.anchor(symbol, {'href': gp_link,
// 							 'title': gp_a_title});
// 		       entry_buff.push(gp_anchor.to_string());

// 		       // Fifth slot.
// 		       entry_buff.push(doc['type'] || 'n/a');

// 		       // Sixth slot.
// 		       entry_buff.push(doc['source'] || 'n/a');

// 		       // Seventh slot.
// 		       entry_buff.push(doc['taxon'] || 'n/a');

// 		       table_buff.push(entry_buff);
// 		   });
    
//     return new bbop.html.table(headers,table_buff);
// };
// amigo.ui.livesearch_template.results_annotation_aggregate_table.prototype = new bbop.html.tag;
