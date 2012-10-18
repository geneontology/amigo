/* 
 * Package: linker.js
 * 
 * Namespace: amigo.linker
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
 * Constructor: linker
 * 
 * Create an object that can make URLs and/or anchors.
 * 
 * These functions have a well defined interface so that other
 * packages can use it.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  self
 */
amigo.linker = function (){
    this._is_a = 'amigo.linker';
};

/*
 * Function: url
 * 
 * Return a url string.
 * 
 * Arguments:
 *  args - id
 *  xid - *[optional]* an internal transformation id
 * 
 * Returns:
 *  string (url); null if it couldn't create anything
 */
amigo.linker.prototype.url = function (id, xid){
    
    var retval = null;

    // AmiGO hard-coded link types.
    if( xid ){
	if( xid == 'term' ||
	    xid == 'annotation_class' ||
	    xid == 'ontology_class' ){
		retval = 'amigo?mode=golr_term_details&term=' + id;
        }else if( xid == 'gp' ||
		  xid == 'gene_product' ||
		  xid == 'bioentity' ){
	        retval = 'amigo?mode=golr_gene_product_details&gp=' + id;
        }
    }

    // Since we couldn't find anything with our explicit
    // transformation set, drop into the great abyss of the xref data.
    if( ! retval){
	if( ! amigo.data.xrefs ){
	    throw new Error('amigo.data.xrefs is missing!');
	}

	// First, extract the probable source and break it into parts.
	var full_id_parts = bbop.core.first_split(':', id);
	if( full_id_parts && full_id_parts[0] && full_id_parts[1] ){
	    var src = full_id_parts[0];
	    var sid = full_id_parts[1];

	    // Now, check to see if it is indeed in our store.
	    var lc_src = src.toLowerCase();
	    var xref = amigo.data.xrefs[lc_src];
	    if( xref && xref['url_syntax'] ){
		retval = xref['url_syntax'].replace('[example_id]', sid);
	    }
	}
    }
    
    return retval;
};

/*
 * Function: anchor
 * 
 * Return a link as a chunk of HTML, all ready to consume in a
 * display.
 * 
 * Arguments:
 *  args - hash--'id' required; 'label' and 'hilite' are inferred if not extant
 *  xid - *[optional]* an internal transformation id
 * 
 * Returns:
 *  string (link); null if it couldn't create anything
 */
amigo.linker.prototype.anchor = function(args, xid){
    
    var anchor = this;
    var retval = null;

    // Get what fundamental arguments we can.
    var id = args['id'];
    if( ! id ){ 
	throw new Error('"id" is a required argument');
    }

    // Infer label from id if not present.
    var label = args['label'];
    if( ! label ){ label = id; }

    // Infer label from id if not present.
    var hilite = args['hilite'];
    if( ! hilite ){ hilite = label; }

    // See if the URL is legit. If it is, make something for it.
    var url = this.url(id, xid);
    if( url ){
	
	// First, see if it is one of the internal ones we know about
	// and make something special for it.
	if( xid ){
	    if( xid == 'term' ||
		xid == 'annotation_class' ||
		xid == 'ontology_class' ){
		    retval = '<a title="Go to the term details page for ' +
			label +	'." href="' + url + '">' + hilite + '</a>';
            }else if( xid == 'gp' ||
		      xid == 'gene_product' ||
		      xid == 'bioentity' ){
		    retval = '<a title="Go to the gene product ' +
			      'details page for ' + label +
			      '." href="' + url + '">' + hilite + '</a>';
	    }
	}

	// If it wasn't in the special transformations, just make
	// something generic.
	if( ! retval ){
	    retval = '<a title="Go to the page for ' + label +
		'." href="' + url + '">' + hilite + '</a>';
	}
    }

    return retval;
};
