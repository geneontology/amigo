/*
 * The framework to hang the rest of the ol' BBOP widgets on.
 *
 * @module: bbop-widget-set
 */

var us = require('underscore');
var bbop = require('bbop-core');

/**
 * "Constructor" for bbop-widget-set.
 *
 * Parameters:
 *  n/a
 *
 * @constructor
 * @returns {Object} bbop-widget-set object
 */
var set = function(more_dispatch){
    this._is_a = 'bbop-widget-set';

    var anchor = this;

    // // The (TODO: now unused?) API lib.
    // this.api = require('./api');

    // // TODO: No longer necessary w/NPM switch.
    // this.version = require('./version');

    // // TODO: Not entirely sure what this was doing anyways.
    //this.data.statistics = require('./data/statistics');

};

///
/// Exportable body.
///

module.exports.set = set;

// html subsection is safe.
module.exports.html = require('./html');
// generators subsection is safe.
module.exports.generators = require('./generators');
// graph tools are safe
module.exports.graph_tools = require('./graph_tools');

try {
    // not so safe subsets
    module.exports.display = require('./display');
    // actual final widgets
    module.exports.autocomplete_simple = require('./autocomplete_simple');
    module.exports.live_filters = require('./live_filters');
    module.exports.live_geospatial = require('./live_geospatial');
    module.exports.live_pager = require('./live_pager');
    module.exports.live_results = require('./live_results');
    module.exports.browse = require('./browse');
    module.exports.repl = require('./repl');
}catch (e){
    //console.error(e);
    console.error('vvvvv');
    console.error('WARNING/BUG/TODO: Testing (?), so caught error when trying to pull in jQuery, as it fails on 1.9.1. This is solved for deployment using browserify. At some point need to upgrade to have an actually usable jQuery version in a node/npm environment, or at least a better behaved one.');
    console.error('^^^^^');
}
