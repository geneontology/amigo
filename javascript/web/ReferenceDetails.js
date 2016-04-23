////
//// A lot of the commented out stuff in the other completely gone here.
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_acc */
/* global global_live_search_query */
/* global global_live_search_filters */
/* global global_live_search_pins */

var us = require('underscore');
var bbop = require('bbop-core');
var widgets = require('bbop-widget-set');
var html = widgets.html;

// Config.
var amigo = new (require('amigo2-instance-data'))(); // no overload
var golr_conf = require('golr-conf');
var gconf = new golr_conf.conf(amigo.data.golr);
var sd = amigo.data.server;
var gserv = amigo.data.server.golr_base;
var gserv_download = amigo.data.server.golr_download_base;
var defs = amigo.data.definitions;
// Linker.
var linker = amigo.linker;
// Handler.
var handler = amigo.handler;
// Management.
var jquery_engine = require('bbop-rest-manager').jquery;
var golr_manager = require('bbop-manager-golr');
var golr_response = require('bbop-response-golr');
// And a basic response.
var rest_response = require('bbop-rest-response').base;

// // XML.
// var xpath = require('xpath');
// var dom = require('xmldom').DOMParser;
var jxon = require('jxon');

// Aliases.
var dlimit = defs.download_limit;

//
function UnableToMakeContact(msg){

    // Clear.
    jQuery('#info-area').empty();
    jQuery('#results-area').empty();

    // Reformat as needed.
    jQuery('#top-panel').removeClass('panel-default');
    jQuery('#top-panel').addClass('panel-danger');
    jQuery('#results-area').removeClass('row');

    // Apologize.
    jQuery('#info-area').append(
	['<p class="well">',
	 'Unable to contact NCBI E-utilities for ID: "' + global_acc + '".',
	 '<br />',
	 msg,
	 '</p>'].join(' '));
    jQuery('#results-area').append('<p class="well">No results available.</p>');
}

//
function ReferenceDetailsInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('RX: ' + str); }    

    ll('');
    ll('ReferenceDetails.js');
    ll('ReferenceDetailsInit start...');

    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);

    // // Tabify the layout if we can (may be in a non-tabby version).
    // var dtabs = jQuery("#display-tabs");
    // if( dtabs ){
    // 	ll('Apply tabs...');
    // 	jQuery("#display-tabs").tabs();
    // 	jQuery("#display-tabs").tabs('option', 'active', 0);
    // }
    
    ///
    /// Manager setup.
    ///
    
    var engine = new jquery_engine(golr_response);
    engine.method('GET');
    engine.use_jsonp(true);
    var refman = new golr_manager(gserv, gconf, engine, 'async');
    
    var confc = gconf.get_class('annotation');

    // // Setup the annotation profile and make the annotation document
    // // category and the current acc sticky in the filters.
    // var refman_args = {
    // 	'linker': linker,
    // 	'handler': handler,
    // 	'spinner_shield_message' : 'Loading and using this widget may take a long time on some large filter sets. If it takes too long, please close it and further narrow your results using other facets or the text search.<br />Waiting...',
    // 	'spinner_search_source' : sd.image_base + '/waiting_ajax.gif'
    // };
    // var refman = new widget.search_pane(gserv, gconf,
    // 					  'display-associations',
    // 					  refman_args);

    // Set the manager profile.
    refman.set_personality('annotation'); // profile in gconf
    refman.include_highlighting(true);

    // Two sticky filters.
    refman.add_query_filter('document_category', 'annotation', ['*']);
    refman.add_query_filter('reference', global_acc, ['*']);

    // Experiment.
    // Process incoming queries, pins, and filters (into
    // manager)--the RESTy bookmarking API.
    if( global_live_search_query ){ //has incoming query
    	ll("Try and use incoming query (set default): " +
	   global_live_search_query);
    	refman.set_comfy_query(global_live_search_query);
    }
    if( us.isArray(global_live_search_filters) ){ //has incoming filters
	us.each(global_live_search_filters, function(filter){
	    refman.add_query_filter_as_string(filter, ['$']);
	});
    }
    if( us.isArray(global_live_search_pins) ){ //has incoming pins
	us.each(global_live_search_pins, function(pin){
	    refman.add_query_filter_as_string(pin, ['*']);
	});
    }

    ///
    /// Major widget attachements to the manager.
    ///

    // Attach filters to manager.
    var hargs = {
	meta_label: 'Total annotations:&nbsp;',
	// free_text_placeholder:
	// 'Input text to filter against all remaining documents',
	'display_free_text_p': false
    };
    var filters = new widgets.live_filters('accordion', refman, gconf, hargs);
    filters.establish_display();

    // Attach pager to manager.
    var pager_opts = {
	results_title: 'Total annotations:&nbsp;',
    };
    var pager = new widgets.live_pager('pager', refman, pager_opts);
    
    // Attach the results pane and download buttons to manager.
    var default_fields = confc.field_order_by_weight('result');
    var btmpl = widgets.display.button_templates;    
    var flex_download_button = btmpl.flexible_download_b3(
	'Download <small>(up to ' + dlimit + ')</small>',
	dlimit,
	default_fields,
	'annotation',
	gconf,
	gserv_download);
    var results_opts = {
	//'callback_priority': -200,
	'user_buttons_div_id': pager.button_span_id(),
	'user_buttons': [
	    flex_download_button
	]
    };
    var results = new widgets.live_results('results', refman, confc,
					   handler, linker, results_opts);

    // Add pre and post run spinner (borrow filter's for now).
    refman.register('prerun', function(){
	filters.spin_up();
    });
    refman.register('postrun', function(){
	filters.spin_down();
    });

    refman.search();

     ///
    /// Create a bookmark for searching annotations and
    /// bioentities with this term. Generate links and activate
    /// hidden stubs in the doc.
    ///

    jQuery('#prob_related').removeClass('hidden');

    // Get bookmark for annotations.
    (function(){
	 // Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');

	man.set_personality('annotation');
	man.add_query_filter('document_category', 'annotation', ['*']);
	man.add_query_filter('reference', global_acc);
	var lstate = man.get_filter_query_string();
	var lurl = linker.url(lstate, 'search', 'annotation');
	 // Add it to the DOM.
	jQuery('#prob_ann_href').attr('href', lurl);
	jQuery('#prob_ann').removeClass('hidden');
    })();
    
    // Get bookmark for annotation download.
    (function(){
	// Ready bookmark.
	var engine = new jquery_engine(golr_response);
	engine.method('GET');
	engine.use_jsonp(true);
	var man = new golr_manager(gserv, gconf, engine, 'async');
	
	man.set_personality('annotation');
	man.add_query_filter('document_category', 'annotation', ['*']);
	man.add_query_filter('reference', global_acc);
	var dstate = man.get_download_url(defs.gaf_from_golr_fields, {
	    'rows': dlimit,
	    'encapsulator': '',
	    'golr_download_url': gserv_download
	});
	jQuery('#prob_ann_dl_href').attr('href', dstate);
	jQuery('#prob_ann_dl').removeClass('hidden');
    })();

    //
    ll('ReferenceDetailsInit done.');
}

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){

	if( ! global_acc ){
	    UnableToMakeContact('Response error.');
	}else if( ! bbop.first_split(':', global_acc)  ){
	    UnableToMakeContact('Response error.');
	}else if( ! bbop.first_split(':', global_acc)[1]  ){
	    UnableToMakeContact('Response error.');
	}else if( bbop.first_split(':', global_acc)[1] === '' ){
	    UnableToMakeContact('Response error.');
	}else{

	    var id_part = bbop.first_split(':', global_acc)[1];

	    // First, try and get the PubMed information for our item.
	    try { 
		
		// Setup.
		var ncbi_engine = new jquery_engine(rest_response);
		ncbi_engine.method('GET');
		// They use CORS?
		//ncbi_engine.use_jsonp(true);
		
		// If error.
		ncbi_engine.register('error', function(resp, man){
		    //console.log(resp.message());
		    //console.log(resp);
		    UnableToMakeContact('BBOP response error.');
		});
		
		// Run.
		ncbi_engine.register('success', function(resp, man){
		    
		    var xml = resp.raw();
		    //console.log(xml);

		    var jx = null;
		    if( typeof xml === 'string' ){
			jx = jxon.stringToJs(xml);
		    }else{
			jx = jxon.xmlToJs(xml);
		    }
		    console.log(jx);

		    // Our operating object.
		    var op = jx.PubmedArticleSet.PubmedArticle.MedlineCitation.Article;

		    // Title.
		    var title = 'n/a';
		    title = op.ArticleTitle;

		    // Date.
		    var date = 'n/a';
		    var year = op.ArticleDate.Year;
		    var month = op.ArticleDate.Month;
		    var day = op.ArticleDate.Day;
		    date = [year, month, day].join('-');

		    // Authors.
		    var authors = 'n/a';
		    var acache = [];
		    us.each(op.AuthorList.Author, function(auth){
			var name = '';
			if( auth.ForeName ){ name += auth.ForeName; }
			//if( auth.Initials ){ name += ' ' + auth.Initials + '.'; }
			if( auth.LastName ){ name += ' ' + auth.LastName; }
			acache.push(name);
		    });
		    if( ! us.isEmpty(acache) ){
			authors = acache.join(', ');
		    }

		    // Abstract.
		    var abstract = 'n/a';
		    var abscache = [];
		    us.each(op.Abstract.AbstractText, function(abs){
			if( abs._ ){ abscache.push(abs._); }
		    });
		    if( ! us.isEmpty(abscache) ){
			//abstract = '<p>' + abscache.join('</p><p>') + '</p>';
			abstract = abscache.join('<br />');
		    }

		    // Render.
		    jQuery('#info-area').empty();
		    var info = [
			'<dl class="dl-horizontal amigo-detail-info">',
			// Title.
			'<dt>Title</dt>',
			'<dd>',
			title,
			'</dd>',
			// Date.
			'<dt>Date</dt>',
			'<dd>',
			date,
			'</dd>',
			// Author.
			'<dt>Author(s)</dt>',
			'<dd>',
			authors,
			'</dd>',
			// Abstract.
			'<dt>Abstract</dt>',
			'<dd id="abstract">',
			abstract,
			'</dd>',
	// 		// Related.
	// 		'<dt id="prob_related" class="hidden">Related</dt>',
	// 		'<dd id="prob_ann" class="hidden">',
	// 		'<a id="prob_ann_href" href="#" class="btn btn-primary btn-xs">Link</a> to all direct and indirect <strong>annotations</strong> to ' + global_acc + '.',
	// 		'</dd>',
	// 		'<dd id="prob_ann_dl" class="hidden">',
	// '<a id="prob_ann_dl_href" href="#" class="btn btn-primary btn-xs">Link</a> to all direct and indirect <strong>annotations download</strong> (limited to first 10,000) for ' + global_acc + '.',
	// 		'</dd>',
			// Pubmed.
			'<dt>PubMed</dt>',
			'<dd>',
			'<a href="https://www.ncbi.nlm.nih.gov/pubmed/22835028">' + global_acc + '</a>',
			'</dd>',
			// Feedback.
			'<dt>Feedback</dt>',
			'<dd>',
			'Contact the <a href="http://geneontology.org/form/contact-go" title="GO Helpdesk.">GO Helpdesk</a> if you find mistakes or have concerns about the data you find here.',
			'</dd>',
			'</dl>'
		    ];
		    jQuery('#info-area').append(info.join(' '));

		    jQuery('#info-area').append([
			'<p>',
			'Powered by NCBI\'s <a href=http://eutils.ncbi.nlm.nih.gov"">E-utilities</a>.',
			'<br />',
			'Please read NCBI\'s <a href="http://www.ncbi.nlm.nih.gov/About/disclaimer.html">Disclaimer and Copyright notice.',
			'</p>',
		    ].join(' '));

		    _shrink_wrap('abstract');

		    // Start the normal GOlr services.
		    ReferenceDetailsInit();
		    
		});
		
		// Trigger.	    
		var url = 'http://eutils.ncbi.nlm.nih.gov';
		var path = '/entrez/eutils/efetch.fcgi';
		var pay = {
		    'tool': 'amigo_client_2.4.x',
		    'email': 'sjcarbon@lbl.gov',
		    'retmode': 'XML',
		    'db': 'pubmed',
		    'id': id_part
		};
		var meth = 'GET';
		ncbi_engine.start(url + path, pay, 'GET');
		
	    }catch (e) {
		UnableToMakeContact('General error.');
	    }
	}
	
    });
})();


// Take and element, look at it's contents, if it's above a certain
// threshold, shrink with "more..." button, otherwise leave alone.
function _shrink_wrap(elt_id){

    // Now take what we have, and wrap around some expansion code if
    // it looks like it is too long.
    var _trim_hash = {};
    var _trimit = 100;
    // Only want to compile once.
    var ea_regexp = new RegExp("\<\/a\>", "i"); // detect an <a>
    var br_regexp = new RegExp("\<br\ \/\>", "i"); // detect a <br />

    function _trim_and_store( in_str ){
	
	var retval = in_str;

	// Let there be tests.
	var list_p = br_regexp.test(retval);
	var anchors_p = ea_regexp.test(retval);
	
	// Try and break without breaking anchors, etc.
	var tease = null;
	if( ! anchors_p && ! list_p ){
	    // A normal string then...trim it!
	    //ll("\tT&S: easy normal text, go nuts!");
	    tease = new html.span(bbop.crop(retval, _trimit, '...'),
				  {'generate_id': true});
	}else if( anchors_p && ! list_p ){
	    // It looks like it is a link without a break, so not
	    // a list. We cannot trim this safely.
	    //ll("\tT&S: single link so cannot work on!");
	}else{
	    //ll("\tT&S: we have a list to deal with");
	    
	    var new_str_list = retval.split(br_regexp);
	    if( new_str_list.length <= 3 ){
		// Let's just ignore lists that are only three
		// items.
		//ll("\tT&S: pass thru list length <= 3");
	    }else{
		//ll("\tT&S: contruct into 2 plus tag");
		var new_str = '';
		new_str = new_str + new_str_list.shift();
		new_str = new_str + '<br />';
		new_str = new_str + new_str_list.shift();
		tease = new html.span(new_str, {'generate_id': true});
	    }
	}
	
	// If we have a tease (able to break down incoming string),
	// assemble the rest of the packet to create the UI.
	if( tease ){
	    // Setup the text for tease and full versions.
	    var bgen = function(lbl, dsc){
		var b = new html.button(lbl, {
		    'generate_id': true,
		    'type': 'button',
		    'title': dsc || lbl,
		    //'class': 'btn btn-default btn-xs'
		    'class': 'btn btn-primary btn-xs'
		});
		return b;
	    };
	    var more_b = new bgen('more', 'Display the complete list');
	    var full = new html.span(retval, {'generate_id': true});
	    var less_b = new bgen('less', 'Display the truncated list');
	    
	    // Store the different parts for later activation.
	    var tease_id = tease.get_id();
	    var more_b_id = more_b.get_id();
	    var full_id = full.get_id();
	    var less_b_id = less_b.get_id();
	    _trim_hash[tease_id] = [tease_id, more_b_id, full_id, less_b_id];
	    
	    // New final string.
	    retval = tease.to_string() + " " +
		more_b.to_string() + " " +
		full.to_string() + " " +
		less_b.to_string();
	}
	
	return retval;
    }

    var pre_html = jQuery('#' + elt_id).html();
    if( pre_html && pre_html.length && (pre_html.length > _trimit * 2) ){

	// Get the new value into the wild.
	var new_str = _trim_and_store(pre_html);
	if( new_str !== pre_html ){
	    jQuery('#' + elt_id).html(new_str);  

	    // Bind the jQuery events to it.
	    // Add the roll-up/down events to the doc.
	    us.each(_trim_hash, function(val, key){
    		var tease_id = val[0];
    		var more_b_id = val[1];
    		var full_id = val[2];
    		var less_b_id = val[3];
		
    		// Initial state.
    		jQuery('#' + full_id ).hide();
    		jQuery('#' + less_b_id ).hide();
		
    		// Click actions to go back and forth.
    		jQuery('#' + more_b_id ).click(function(){
    		    jQuery('#' + tease_id ).hide();
    		    jQuery('#' + more_b_id ).hide();
    		    jQuery('#' + full_id ).show('fast');
    		    jQuery('#' + less_b_id ).show('fast');
    		});
    		jQuery('#' + less_b_id ).click(function(){
    		    jQuery('#' + full_id ).hide();
    		    jQuery('#' + less_b_id ).hide();
    		    jQuery('#' + tease_id ).show('fast');
    		    jQuery('#' + more_b_id ).show('fast');
    		});
	    });    
	}
    }
}
