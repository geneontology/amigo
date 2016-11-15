/* 
 * Package: alternate_id.js
 * 
 * Namespace: amigo.handlers.alternate_id
 * 
 * 
 */

if ( typeof amigo === "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers === "undefined" ){ amigo.handlers = {}; }

/*
 * Function: alternate_id
 * 
 * Essentially do /nothing/ to alternate ids--ignore them.
 * 
 * Parameters:
 *  string or null
 * 
 * Returns:
 *  same
 * 
 * Also See: <bbop.handler>
 */
amigo.handlers.alternate_id = function(id){

    var retstr = id;
    return retstr;
};
