////
//// Attempt at an interactive web REPL for BBOP JS over GO data.
////

// Logger for all functions.
var logger = new bbop.logger();
logger.DEBUG = true;
function ll(str){ logger.kvetch('REPL: ' + str); }    


// Go and get the initial results for building our tree.
function REPLInit(){

    ll('');
    ll('REPL.js');
    ll('REPLInit start...');

    // AmiGO env.
    var server_meta = new amigo.data.server();
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var go = new bbop.golr.manager.jquery(server_meta.golr_base(), gconf);

    var repl_id = 'repl';
    jQuery('#' + repl_id).empty();

    ///
    /// Setup the environment on the page.
    ///

    // TODO: Work buffer.
    var eval_buffer = new bbop.html.tag('textarea',
					{'rows': '12', cols:'80',
					 'generate_id': true});
    jQuery('#' + repl_id).append(eval_buffer.to_string());

    // Eval button.
    var eval_button = new bbop.html.button('Evaluate buffer.',
	    				   {'generate_id': true});
    jQuery('#' + repl_id).append(eval_button.to_string());
    var eval_button_props = {
	icons: { primary: "ui-icon-play"},
	disabled: false,
	text: false
    };
    jQuery('#' + eval_button.get_id()).button(eval_button_props).click(
	function(){
	    alert('TODO: EVAL: ' + jQuery('#' + eval_buffer.get_id()).val());
	});

    // TODO: Command line.

    // TODO: Log (+ clear botton).

    // TODO: Callback makes fields and button unavailable until
    // return. TODO: Have panic timeout incase something goes very
    // wrong.

    ll('REPLInit done.');
}
