/*
 * Package: live_geospatial.js
 * 
 * Namespace: bbop-widget-set.live_geospatial
 * 
 * BBOP JS object to allow the live probing of a GOlr personality via
 * maps, etc.
 * 
 * This is a OMS/Leaflet widget..
 */

var us = require('underscore');
var bbop = require('bbop-core');

var html = require('./html');
var display = require('./display');
var generators = require('./generators');
//var clickable_object_generator = require('./display/clickable_object_generator');

/* global L */
// Code here will be ignored by JSHint, as we are technically
// "redefining" jQuery (although we are not).
/* jshint ignore:start */
var jQuery = require('jquery');
//require('jquery-ui');
/* jshint ignore:end */

/*
 * Constructor: live_filters
 * 
 * Contructor for the bbop-widget-set.live_filters object.
 * 
 * Widget interface to interactively explore a search personality with
 * no direct side effects.
 *
 * Arguments:
 *  interface_id - string id of the element to build on
 *  manager - the shared GOlr manager to use
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 * 
 * Returns:
 *  this object
 */
var live_geospatial = function(interface_id, manager, in_argument_hash){
    this._is_a = 'bbop-widget-set.live_geospatial';

    var anchor = this;
    var each = us.each;

    // Per-UI logger.
    var logger = new bbop.logger();
    logger.DEBUG = false;
    //logger.DEBUG = true;
    function ll(str){ logger.kvetch('GS: ' + str); }

    ///
    /// Deal with incoming arguments.
    ///

    // Our argument default hash.
    var default_hash = {
	height: 180,
	latitude: 0.0,
	longitude: 0.0,
	zoom: 0.0,
	// 'meta_label': 'Documents:&nbsp;',
	// 'display_meta_p': true,
	// 'display_free_text_p': true,
    };
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.fold(default_hash, folding_hash);
    
    ///
    /// Class variables.
    ///
    
    anchor._interface_id = interface_id;
    anchor._height = arg_hash['height'];
    anchor._latitude = arg_hash['latitude'];
    anchor._longitude = arg_hash['longitude'];
    anchor._zoom = arg_hash['zoom'];
    anchor._established_p = false;
    anchor._markers = [];

    ///
    /// Prepare the interface and setup the div hooks.
    ///
    
    jQuery('#' + interface_id).empty();

    // Prepare the d setion and add it.
    var enclosure =
	    new html.tag('div', {'generate_id': true,
				 'style': 'height: ' + anchor._height + 'px;'});
    jQuery('#' + interface_id).append(enclosure.to_string());

    // Set map into new area.
    //var ags = L.map(interface_id).setView([51.505, -0.09], 13);
    var ags = L.map(enclosure.get_id()).setView(
	[anchor._latitude, anchor._longitude],
	anchor._zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(ags);
    
    ///
    /// Response to map:
    /// Add currently seen markers to map.
    ///
    
    manager.register('search', function(resp, man){

	// First, clear current markers.
	each(anchor._markers, function(marker){
	    //marker.remove();
	    //marker.closePopup();
	    //marker.unbindPopup();
	    ags.removeLayer(marker);
	});
	anchor._markers = [];

	// Now add markers for all new results in table.
	// Until we have long lat loaded...
	var _rand_lat = function(){ return Math.random() * (-90 - 90) + 90;};
	var _rand_long = function(){ return Math.random() * (-180 - 180) + 180;};
	each(resp.documents(), function(doc){

	    // Add to display.
	    var marker = L.marker([_rand_lat(), _rand_long()]).addTo(ags)
		    .bindPopup(doc['annotation_class_label'] +
			       ', ' +
			       doc['bioentity_label']);
	    //.openPopup();

	    //Save for later destruction.
	    anchor._markers.push(marker);
	});

    }, 1, anchor._is_a + '_marker');

    ///
    /// Map to manager:
    /// Trigger filtered searches on movement, looking at current bounds.
    ///
    
    function on_move(e) {

	// Get the cardinal bounds.
	if( e && e.target && e.target.getBounds ){
	    var bounds = e.target.getBounds();
	    if( bounds ){
		var north = bounds.getNorth();
		var south = bounds.getSouth();
		var west = bounds.getWest();
		var east = bounds.getEast();
		console.log("Bounds set: ", bounds.toBBoxString());

		// TODO: Set manager with these bounds filters.
		//

		// Trigger search with new filters.
		manager.search();
	    }
	}
    }
    ags.on('moveend', on_move);

    ///
    /// ...
    ///

    // The display has been established.
    anchor._established_p = true;

};

///
/// Exportable body.
///

module.exports = live_geospatial;
