////
//// Render pretty numbers!
////

// Let jshint pass over over our external globals (browserify takes
// care of it all).
/* global jQuery */
/* global global_statistics_cache */
/* global Plotly */

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

function BasePageInit(){    
    // Use jQuery UI to tooltip-ify doc.
    var tt_args = {'position': {'my': 'left bottom', 'at': 'right top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);
}

function BaseStatisticsInit(){

    var glob = global_statistics_cache;

    ///
    /// Annotation \ species | exp/non-exp
    ///
    
    (function(){

	var exp_trace = {
	    x: [],
	    y: [],
	    name: 'Experimental',
	    type: 'bar'
	};

	var nonexp_trace = {
	    x: [],
	    y: [],
	    name: 'Non-experimental',
	    type: 'bar'
	};
	
	// Okay, create some tracks.
	us.each(glob['species_of_interest'], function(spec){
	    var lbl = spec[0];
	    var id = spec[1];

	    // Add axis label.
	    exp_trace.x.unshift(lbl);
	    nonexp_trace.x.unshift(lbl);

	    // Add data.
	    exp_trace.y.unshift(glob.annotations.species_by_exp[id]);
	    nonexp_trace.y.unshift(glob.annotations.species_by_nonexp[id]);
	});

	var data = [exp_trace, nonexp_trace];
	
	var layout = {
	    title: 'Experimental annotations by species',
	    barmode: 'stack',
	    xaxis: {
		title: 'Species',
		autorange: 'reversed'
	    },
	    yaxis: {
		title: 'Annotations'
	    }
	};
	
	Plotly.newPlot('graph01', data, layout);

    })();

    ///
    /// Annotation \ sources | exp/non-exp
    ///

    (function(){

	var exp_trace = {
	    x: [],
	    y: [],
	    name: 'Experimental',
	    type: 'bar'
	};

	var nonexp_trace = {
	    x: [],
	    y: [],
	    name: 'Non-experimental',
	    type: 'bar'
	};
	
	// Okay, create some tracks.
	us.each(glob['sources_of_interest'], function(src){

	    // Add axis label.
	    exp_trace.x.unshift(src);
	    nonexp_trace.x.unshift(src);

	    // Add data.
	    exp_trace.y.unshift(glob.annotations.sources_by_exp[src]);
	    nonexp_trace.y.unshift(glob.annotations.sources_by_nonexp[src]);
	});

	var data = [exp_trace, nonexp_trace];
	
	var layout = {
	    title: 'Experimental annotations by source',
	    barmode: 'stack',
	    xaxis: {
		title: 'Sources',
		autorange: 'reversed'
	    },
	    yaxis: {
		title: 'Annotations'
	    }
	};
	
	Plotly.newPlot('graph02', data, layout);

    })();
}

///
/// A slightly more complicated starter: don't start unless we got the
/// goods passed in from the server.
///

// Embed the jQuery setup runner.
(function (){
    jQuery(document).ready(function(){
	BasePageInit();
	if( us.isObject(global_statistics_cache) &&
	    ! us.isEmpty(global_statistics_cache) ){
	    BaseStatisticsInit();
	}
    });
})();
