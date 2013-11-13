/* 
 * Package: echo.js
 * 
 * Namespace: amigo.handlers.echo
 * 
 * Static function handler for echoing inputs--really used for
 * teaching and testing.
 */

if ( typeof amigo == "undefined" ){ var amigo = {}; }
if ( typeof amigo.handlers == "undefined" ){ amigo.handlers = {}; }

/*
 * Function: echo
 * 
 * Applies bbop.core.dump to whatever comes in.
 * 
 * Parameters:
 *  thing
 * 
 * Returns:
 *  a string; it /will/ be a string
 * 
 * Also See: <bbop.handler>
 */
amigo.handlers.echo = function(thing, name, context){

    // Force a return string into existence.
    var retstr = null;
    try {
	retstr = bbop.core.dump(thing);
    } catch (x) {
	retstr = '';
    }

    // // Appaend any optional stuff.
    // var is_def = bbop.core.is_defined;
    // var what = bbop.core.what_is;
    // if( is_def(name) && what(name) == 'string' ){
    // 	retstr += ' (' + name + ')';
    // }
    // if( is_def(context) && what(context) == 'string' ){
    // 	retstr += ' (' + context + ')';
    // }

    return retstr;
};
