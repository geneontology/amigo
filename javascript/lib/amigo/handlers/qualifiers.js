/* 
 * Package: qualifiers.js
 * 
 * Namespace: amigo.handlers.qualifiers
 * 
 * 
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers == "undefined" ){ amigo.handlers = {}; }

/*
 * Function: qualifiers
 * 
 * Essentially catch certain strings and hightlight them.
 * 
 * Example incoming data as string:
 * 
 * : "not"
 * 
 * Parameters:
 *  string or null
 * 
 * Returns:
 *  HTML string
 * 
 * Also See: <bbop.handler>
 */
amigo.handlers.qualifiers = function(in_qual){

    var retstr = in_qual;

    // Aliases.
    var is_def = bbop.core.is_defined;
    var what_is = bbop.core.what_is;
    //var loop = bbop.core.each;


    if( is_def(in_qual) ){
	if( what_is(in_qual) == 'string' ){
	    if( in_qual == 'not' || in_qual == 'NOT' ){
		retstr = 'NOOOOT';
	    }
	}
    }

    return retstr;
};
