////
//// Attempt at an interactive web REPL for BBOP JS over GO data.
////
//// TODO: Callback makes fields and button unavailable until
//// return. TODO: Have panic timeout in the case that something
//// goes very wrong.
////

//var goo = 'goo!';

// Go and get the initial results for building our tree.
function REPLInit(){

    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('REPL: ' + str); }
    ll('');
    ll('REPL.js');
    ll('REPLInit start...');

    var cmnd_buff_id = 'command_buffer';

    ///
    /// Set the repl widget.
    ///

    // Pull in how we want to start.
    var initial_repl_commands = [
	"bbop.contrib.go.overlay('jquery');"
    ];
    var repl = new bbop.widget.repl('repl', initial_repl_commands);
				    //   {'buffer_id': cmnd_buff_id});

    ///
    /// Make the pull-down active.
    ///

    // Get things from pulldown into textarea on change.
    jQuery("#" + "golr_session_example_selection").change(
	function(){
	    var sess_golr = jQuery(this).val();
	    //ll('// sess_golr: ' + sess_golr);
	    //alert('foo!');
	    //jQuery('#' + cmnd_buff_id).val(sess_golr);
	    repl.replace_buffer_text(sess_golr);
	    repl.advance_log_to_bottom();
	});

    //ll('REPLInit done.');
}
