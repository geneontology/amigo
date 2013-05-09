////
//// A twiddle to see if I can get Google Charts and BBOP playing
//// nicely. They seem to want to fight over the initialization.
////
//// Trying to let Google win--when it doesn't it seems to throw a fit
//// and redirect to nothingness. WTF, Google?
////

function LandingGraphsInit(){
    
    // For debugging.
    var logger = new bbop.logger('LG: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    // Make unnecessary things roll up.
    amigo.ui.rollup(["inf01"]);

    // Use jQuery UI to tooltip-ify doc.
    //jQuery('.bbop-js-tooltip').tooltip();
    var tt_args = {'position': {'my': 'center bottom-20', 'at': 'center top'}};
    jQuery('.bbop-js-tooltip').tooltip(tt_args);
}
