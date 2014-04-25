////
//// ...
////

function LandingGraphsInit(){
    
    // For debugging.
    var logger = new bbop.logger('LG: ');
    logger.DEBUG = true;
    function ll(str){
	logger.kvetch(str);
    }
    
    // // Make unnecessary things roll up.
    // amigo.ui.rollup(["inf01"]);

    // Use jQuery UI to tooltip-ify doc.
    //jQuery('.bbop-js-tooltip').tooltip();
    var tt_args = {
	'position': {'my': 'center bottom-5', 'at': 'center top'},
	'tooltipClass': 'amigo-searchbar-tooltip-style'
    };
    jQuery('.amigo-landing-tooltip').tooltip(tt_args);
}
