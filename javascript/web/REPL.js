////
//// Attempt at an interactive web REPL for BBOP JS over GO data.
////
//// TODO: Callback makes fields and button unavailable until
//// return. TODO: Have panic timeout in the case that something
//// goes very wrong.
////

// Go and get the initial results for building our tree.
function REPLInit(){

    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('REPL: ' + str); }
    ll('');
    ll('REPL.js');
    ll('REPLInit start...');

    // Pull in how we want to start.
    var initial_repl_commands = [
	'var $ = null;',
	'var server_meta = new amigo.data.server();',
	'var gloc = server_meta.golr_base();',
	'var gconf = new bbop.golr.conf(amigo.data.golr);',
	'var go = new bbop.golr.manager.jquery(gloc, gconf);',
	//'var rmsg = "// [Done callback.]";',
	"function callback(json){ $ = new bbop.golr.response(json); }",
	"go.register('search', 's', callback);"
    ];
    var repl = new bbop.widget.repl('repl', initial_repl_commands,
				    {});

    //ll('REPLInit done.');
}
