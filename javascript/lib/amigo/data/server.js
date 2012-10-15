/*
 * Package: amigo_meta.js
 *
 * Namespace: bbop.amigo.amigo_meta
 *
 * This package was automatically created during an AmiGO 2 installation.
 *
 * Purpose: Useful information about the GO and AmiGO.
 *          Also serves as a repository and getter for web
 *          resources such as images.
 *
 * Requirements: amigo.js for bbop.amigo namespace.
 *
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 *
 */

/*
 * Constructor: amigo_meta
 * 
 * The configuration for the server settings.
 * Essentially a JSONification of the config.pl AmiGO 2 file.
 * 
 * Arguments:
 *  n/a
 */
bbop.amigo.amigo_meta = function(){

    // All of the server/instance-specific meta-data.
    var meta_data = {"html_base":"http://localhost/amigo2","app_base":"http://localhost/cgi-bin/amigo2","term_regexp":"all|GO:[0-9]{7}","species":[],"ontologies":[],"gp_types":[],"sources":[],"species_map":{},"bbop_img_star":"http://localhost/amigo2/images/star.png","image_base":"http://localhost/amigo2/images","evidence_codes":{},"golr_base":"http://localhost:8080/solr/"};

    // Break out the data and various functions to access it...
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };
    var species = meta_data.species;
    this.species = function(){ return species; };
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };
    var sources = meta_data.sources;
    this.sources = function(){ return sources; };
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };
    var bbop_img_star = meta_data.bbop_img_star;
    this.bbop_img_star = function(){ return bbop_img_star; };
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };
    var golr_base = meta_data.golr_base;
    this.golr_base = function(){ return golr_base; };

    // Does it look like a term?
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str);
    this.term_id_p = function(term_id){
       var retval = false;
       if( tre.test(term_id) ){
          retval = true;
       }
       return retval;
    };

    // Get a named resource from the meta_data hash if possible.
    this.get_image_resource = function(resource){

       var retval = null;
       var mangled_res = 'bbop_img_' + resource;

       if( meta_data[mangled_res] ){
          retval = meta_data[mangled_res];
       }
       return retval;
    };
};
