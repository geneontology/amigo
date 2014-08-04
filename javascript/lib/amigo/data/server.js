/*
 * Package: server.js
 * 
 * Namespace: amigo.data.server
 * 
 * This package was automatically created during AmiGO 2 installation.
 * 
 * Purpose: Useful information about GO and the AmiGO installation.
 *          Also serves as a repository and getter for web
 *          resources such as images.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.data == "undefined" ){ amigo.data = {}; }

/*
 * Constructor: server
 * 
 * The configuration for the server settings.
 * Essentially a JSONification of the config.pl AmiGO 2 file.
 * 
 * Arguments:
 *  n/a
 */
amigo.data.server = function(){

    // All of the server/instance-specific meta-data.
<<<<<<< HEAD
    var meta_data = {"sources":[],"term_regexp":"^all$|^GO:[0-9]{7}$","galaxy_base":"http://galaxy.berkeleybop.org/","app_base":"http://localhost/cgi-bin/amigo2","gp_types":[],"ontologies":[],"image_base":"http://localhost/amigo2/images","species_map":{},"species":[],"golr_base":"http://localhost:8080/solr/","html_base":"http://localhost/amigo2","evidence_codes":{},"bbop_img_star":"http://localhost/amigo2/images/star.png","beta":"1"};
=======
    var meta_data = {"css_base":"http://localhost:9999/static/css","js_dev_base":"http://localhost:9999/static/staging","species_map":{},"ontologies":[],"beta":"1","html_base":"http://localhost:9999/static","galaxy_base":null,"gp_types":[],"golr_base":"http://localhost:8080/solr/","species":[],"sources":[],"app_base":"http://localhost:9999","image_base":"http://localhost:9999/static/images","evidence_codes":{},"bbop_img_star":"http://localhost:9999/static/images/star.png","term_regexp":"all|GO:[0-9]{7}","js_base":"http://localhost:9999/static/js"};
>>>>>>> issue-124

    ///
    /// Break out the data and various functions to access them...
    ///

    /*
<<<<<<< HEAD
     * Function: sources
     * 
     * Access to AmiGO variable sources.
=======
     * Function: css_base
     * 
     * Access to AmiGO variable css_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var sources = meta_data.sources;
    this.sources = function(){ return sources; };

    /*
     * Function: term_regexp
     * 
     * Access to AmiGO variable term_regexp.
=======
    var css_base = meta_data.css_base;
    this.css_base = function(){ return css_base; };

    /*
     * Function: js_dev_base
     * 
     * Access to AmiGO variable js_dev_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };

    /*
     * Function: galaxy_base
     * 
     * Access to AmiGO variable galaxy_base.
=======
    var js_dev_base = meta_data.js_dev_base;
    this.js_dev_base = function(){ return js_dev_base; };

    /*
     * Function: species_map
     * 
     * Access to AmiGO variable species_map.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var galaxy_base = meta_data.galaxy_base;
    this.galaxy_base = function(){ return galaxy_base; };

    /*
     * Function: app_base
     * 
     * Access to AmiGO variable app_base.
=======
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };

    /*
     * Function: ontologies
     * 
     * Access to AmiGO variable ontologies.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };

    /*
     * Function: gp_types
     * 
     * Access to AmiGO variable gp_types.
=======
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };

    /*
     * Function: beta
     * 
     * Access to AmiGO variable beta.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };

    /*
     * Function: ontologies
     * 
     * Access to AmiGO variable ontologies.
=======
    var beta = meta_data.beta;
    this.beta = function(){ return beta; };

    /*
     * Function: html_base
     * 
     * Access to AmiGO variable html_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };

    /*
     * Function: image_base
     * 
     * Access to AmiGO variable image_base.
=======
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };

    /*
     * Function: galaxy_base
     * 
     * Access to AmiGO variable galaxy_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };

    /*
     * Function: species_map
     * 
     * Access to AmiGO variable species_map.
=======
    var galaxy_base = meta_data.galaxy_base;
    this.galaxy_base = function(){ return galaxy_base; };

    /*
     * Function: gp_types
     * 
     * Access to AmiGO variable gp_types.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };

    /*
     * Function: species
     * 
     * Access to AmiGO variable species.
=======
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };

    /*
     * Function: golr_base
     * 
     * Access to AmiGO variable golr_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var species = meta_data.species;
    this.species = function(){ return species; };
=======
    var golr_base = meta_data.golr_base;
    this.golr_base = function(){ return golr_base; };
>>>>>>> issue-124

    /*
     * Function: species
     * 
     * Access to AmiGO variable species.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var species = meta_data.species;
    this.species = function(){ return species; };

    /*
     * Function: html_base
     * 
     * Access to AmiGO variable html_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };

    /*
<<<<<<< HEAD
     * Function: evidence_codes
     * 
     * Access to AmiGO variable evidence_codes.
=======
     * Function: app_base
     * 
     * Access to AmiGO variable app_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };

    /*
     * Function: bbop_img_star
     * 
     * Access to AmiGO variable bbop_img_star.
=======
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };

    /*
     * Function: image_base
     * 
     * Access to AmiGO variable image_base.
>>>>>>> issue-124
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
<<<<<<< HEAD
    var bbop_img_star = meta_data.bbop_img_star;
    this.bbop_img_star = function(){ return bbop_img_star; };
=======
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };
>>>>>>> issue-124

    /*
     * Function: evidence_codes
     * 
     * Access to AmiGO variable evidence_codes.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };

    /*
     * Function: bbop_img_star
     * 
     * Access to AmiGO variable bbop_img_star.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var bbop_img_star = meta_data.bbop_img_star;
    this.bbop_img_star = function(){ return bbop_img_star; };

    /*
     * Function: term_regexp
     * 
     * Access to AmiGO variable term_regexp.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };

    /*
     * Function: js_base
     * 
     * Access to AmiGO variable js_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var js_base = meta_data.js_base;
    this.js_base = function(){ return js_base; };


    // Does it look like a term?
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str);

    /*
     * Function: term_id_p
     * 
     * True or false on whether or not a string looks like a GO term id.
     * 
     * Parameters:
     *  term_id - the string to test
     * 
     * Returns:
     *  boolean
     */
    this.term_id_p = function(term_id){
       var retval = false;
       if( tre.test(term_id) ){
          retval = true;
       }
       return retval;
    };

    /*
     * Function: get_image_resource
     * 
     * Get a named resource from the meta_data hash if possible.
     * 
     * Parameters:
     *  resource - the string id of the resource
     * 
     * Returns:
     * string (url) of resource
     */
    this.get_image_resource = function(resource){

       var retval = null;
       var mangled_res = 'bbop_img_' + resource;

       if( meta_data[mangled_res] ){
          retval = meta_data[mangled_res];
       }
       return retval;
    };
};
