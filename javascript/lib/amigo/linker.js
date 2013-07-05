/* 
 * Package: linker.js
 * 
 * Namespace: amigo.linker
 * 
 * Generic AmiGO link generator, fed by <amigo.data.server> for local
 * links and <amigo.data.xrefs> for non-local links.
 * 
 * NOTE: A lot of this is lifted from the (defunct) amigo.js
 * package. However, the future should be here.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
//bbop.core.require('amigo', 'data', 'server');
//bbop.core.require('amigo', 'data', 'xrefs');
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

    // With the new dispatcher, relative URLs no longer work, so we
    // have to bring in server data--first let's ensure it.
    if( ! amigo.data.server ){
	throw new Error('we are missing access to amigo.data.server!');
    }
    // Easy app base.
    var sd = new amigo.data.server();
    this.app_base = sd.app_base();
    // Internal term matcher.
    this.term_regexp = null;
    var internal_regexp_str = sd.term_regexp();    
    if( internal_regexp_str ){
	this.term_regexp = new RegExp(internal_regexp_str);
    }

    // Categories for different special cases (internal links).
    this.ont_category = {
	'term': true,
	'ontology_class': true,
	'annotation_class': true,
	'annotation_class_closure': true,
	'annotation_class_list': true
    };
    this.bio_category = {
        'gp': true,
	'gene_product': true,
	'bioentity': true
    };
    this.search_category = {
        'search': true,
	'live_search': true
    };
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

    // Nothing returns nothing.
    if( id && id != '' ){
	
	// AmiGO hard-coded link types.
	if( xid ){
	    if( this.ont_category[xid] ){
		//retval = 'amigo?mode=term&term=' + id;
		retval = this.app_base + '/amigo/term/' + id;
            }else if( this.bio_category[xid] ){
		//retval = 'amigo?mode=gene_product&gp=' + id;
		retval = this.app_base + '/amigo/gene_product/' + id;
            }else if( this.search_category[xid] ){
		if( id ){
		    //retval = 'amigo?mode=search&bookmark=' + id;
		    retval = this.app_base +'/amigo/search?bookmark='+ id;
		}else{
		//retval = 'amigo?mode=search';
		    retval = this.app_base + '/amigo/search';
		}
	    }
	}

	// Since we couldn't find anything with our explicit
	// transformation set, drop into the great abyss of the xref data.
	if( ! retval ){
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
		    retval =
			xref['url_syntax'].replace('[example_id]', sid, 'g');
		}
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

    // Don't even start if there is nothing.
    if( args ){

	// Get what fundamental arguments we can.
	var id = args['id'];
	if( id ){
	
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
		    if( this.ont_category[xid] ){
		    
			// Possible internal/external detection here.
			// var class_str = ' class="amigo-ui-term-internal" ';
			var class_str = '';
			var title_str = 'title="' + // internal default
			id + ' (go to the term details page for ' +
			    label + ')"';
			if( this.term_regexp ){
			    if( this.term_regexp.test(id) ){
			    }else{
				class_str = ' class="amigo-ui-term-external" ';
				title_str = ' title="' +
				    id + ' (is an external term; click ' +
				    'to view our internal information for ' +
				    label + ')" ';
			    }
			}
			
			//retval = '<a title="Go to the term details page for '+
 			retval = '<a ' + class_str + title_str +
			    ' href="' + url + '">' + hilite + '</a>';
		    }else if( this.bio_category[xid] ){
 			retval = '<a title="' + id +
			    ' (go to the details page for ' + label +
			    ')" href="' + url + '">' + hilite + '</a>';
		    }else if( this.search_category[xid] ){
			retval = '<a title="Reinstate bookmark for ' + label +
			    '." href="' + url + '">' + hilite + '</a>';
		    }
		}
		
		// If it wasn't in the special transformations, just make
		// something generic.
		if( ! retval ){
		    retval = '<a title="' + id +
			' (go to the page for ' + label +
			')" href="' + url + '">' + hilite + '</a>';
		}
	    }
	}
    }

    return retval;
};
