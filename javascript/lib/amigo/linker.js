/* 
 * Package: linker.js
 * Namespace: amigo.linker*
 * 
 * Generic AmiGO linking function. A real function mind you--not an
 * object generator.
 * 
 * TODO: maybe this should actually be under bbop.html so we could
 * make use of the anchor tag stuff?
 * 
 * NOTE: A lot of this is lifted from the (defunct) amigo.js
 * package. However, the future should be here.
 * 
 * NOTE: This should pull data from something like amigo.data.xrefs
 * instead.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
//bbop.core.require('bbop', 'logger');
bbop.core.namespace('amigo', 'linker');

/*
 * Function: linker
 * 
 * Return a link as a chunk of HTML, all ready to consume.
 * 
 * Arguments:
 *  xid - an internal transformation id
 *  args - hash--'id' required; 'label' inferred if not extant; else optional
 *  type - 'url' or 'html'; defaults to url if not defined
 * 
 * Returns: string (url or link); null if it couldn't find anything
 */
amigo.linker = function (xid, args, type){
    this._is_a = 'amigo.linker';
    
    var anchor = this;
    var retval = null;

    // // Linker logger.
    // var logger = new bbop.logger(this._is_a);
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch(str); }

    // Get what fundamental arguments we can.
    var id = args['id'];
    if( ! id ){ throw new Error('"id" is a required argument'); }

    // Infer label if not present.
    var label = args['label'];
    if( ! label ){ label = id; }

    // Figure out putput type as best as possible
    if( ! type ){ type = 'url'; }
    if( type != 'url' && type != 'link' ){
	throw new Error('undefined type');
    }

    ///
    /// All of out functions spun out.
    ///

    function _term_url(id, label, args){
	return 'amigo?mode=golr_term_details&term=' + id;
    }
    function _term_link(id, label, args){
	return '<a title="Go to the term details page for ' + id +
	    '." href="' + _term_url(id, label, args) + '">' + label +'</a>';
    }

    function _gene_product_url(id, label, args){
	return 'amigo?mode=golr_gene_product_details&gp=' + id;
    }
    function _gene_product_link(id, label, args){
	return '<a title="Go to the gene product details page for ' + id +
	    '." href="' + _gene_product_url(id, label, args) + '">' + label +
	    '</a>';
    }

    ///
    /// The Great Muxer.
    ///

    if( xid == 'term' || xid == 'annotation_class' || xid == 'ontology_class' ){
	if( type == 'url' ){
	    retval = _term_url(id, label, args);
	}else{
	    retval = _term_link(id, label, args);
	}
    }else if( xid == 'gp' || xid == 'gene_product' || xid == 'bioentity' ){
	if( type == 'url' ){
	    retval = _gene_product_url(id, label, args);
	}else{
	    retval = _gene_product_link(id, label, args);
	}	
    }else{
	// TODO: Since we couldn't find anything...drop into the great
	// abyss of the xrefs data.
    }
    
    return retval;
};
