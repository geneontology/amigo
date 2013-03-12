/* 
 * Package: owl_class_expression.js
 * 
 * Namespace: amigo.handler.owl_class_expression
 * 
 * Static function handler for displaying OWL class expression
 * results.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'json');
bbop.core.require('amigo', 'linker');
bbop.core.namespace('amigo', 'handler', 'owl_class_expression');

/*
 * Function: owl_class_expression
 * 
 * Example incoming data:
 * 
 * : { handler: "amigo.handler.owl_class_expression",
 * :   relationship: {
 * :     relation: [{id: "RO:001234", label: "regulates"},
 * :                {id:"BFO:0003456", label: "hp"}], 
 * :     id: "MGI:MGI:185963",
 * :     label: "kidney"
 * :   }
 * : }
 * 
 * Parameters:
 *  object; see above
 * 
 * Returns:
 *  HTML string
 * 
 * Also See: <bbop.handler>
 */
amigo.handler.owl_class_expression = function(owlo){

    var retstr = "";

    // Add logging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    //logger.DEBUG = false;
    function ll(str){ logger.kvetch(str); }

    // Check to make sure that it looks right.
    var is_def = bbop.core.is_defined;
    var what_is = bbop.core.what_is;
    var loop = bbop.core.each;
    if( ! is_def(owlo['relationship']) ||
	! what_is(owlo['relationship']) == 'object' ||
	! what_is(owlo['relationship']['relation']) == 'array' ||
	! is_def(owlo['relationship']['id']) ||
	! is_def(owlo['relationship']['label']) ){
	// 'Twas an error--ignore.
	//throw new Error('sproing!');
    }else{
	
	//throw new Error('sproing!');
	var link = new amigo.linker();

	// Okay, right structure--first assemble the relationships,
	// then tag onto end.
	var rel_buff = [];
	bbop.core.each(owlo['relationship']['relation'],
		       function(rel){
			   // Check to make sure that these are
			   // structured correctly as well.
			   var rel_id = rel['id'];
			   var rel_lbl = rel['label'];
			   if( is_def(rel_id) && is_def(rel_lbl) ){
			       var an =
				   link.anchor({id: rel_id, label: rel_lbl});
			       rel_buff.push(an);
			       ll('in ' + rel_id + ' + ' + rel_lbl + ': ' + an);
			   }
		       });
	retstr = rel_buff.join(' ') + ' ' +
	    link.anchor({id: owlo['relationship']['id'],
			 label: owlo['relationship']['label']});
    }
    
    return retstr;
};
