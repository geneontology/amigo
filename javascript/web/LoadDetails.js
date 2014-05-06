////
//// Just make tables sortable.
////

//
function LoadDetailsInit(){

    // // Per-manager logger.
    // var logger = new bbop.logger();
    // logger.DEBUG = true;
    // function ll(str){ logger.kvetch(str); }

    // Apply the tablesorter to what we got.
    jQuery('#' + 'details_ont').tablesorter(); 
    jQuery('#' + 'details_gaf').tablesorter(); 
    
    //ll('LoadDetailsInit done.');
}
