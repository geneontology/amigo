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

    // var cmnd_buff_id = 'command_buffer';

    // // Make unnecessary things roll up.
    // amigo.ui.rollup(["inf01"]);

    ///
    /// Set the repl widget.
    ///

    // Pull in how we want to start.
    var initial_repl_commands = [
	//"bbop.contrib.go.overlay('jquery');"

	'var loop = bbop.core.each;',
	'var dump = bbop.core.dump;',
	'var what_is = bbop.core.what_is;',

	// Defined a global logger.
	'var logger = new bbop.logger();',
	'logger.DEBUG = true;',
	'function ll(str){ return logger.kvetch(str); }',
	
	// Get our data env right.
	'var server_meta = new amigo.data.server();',
	'var gloc = server_meta.golr_base();',
	'var gconf = new bbop.golr.conf(amigo.data.golr);',

	// Support a call back to data.
	'var data = null;',
	"function callback(response){ data = response; ll('// Returned value placed in [data].'); }",

	// Get a global manager.
	//'var go = new bbop.golr.manager' + mtype + '(gloc, gconf);',
	'var go = new bbop.golr.manager.jquery(gloc, gconf);',
	"go.register('search', 's', callback);",

	// Add GO-specific methods to our manager.
	"bbop.golr.manager.prototype.gaf_url = function(){ return this.get_download_url(['source', 'bioentity_internal_id', 'bioentity_label', 'qualifier', 'annotation_class', 'reference', 'evidence_type', 'evidence_with', 'aspect', 'bioentity_name', 'synonym', 'type', 'taxon', 'date', 'assigned_by', 'annotation_extension_class', 'bioentity_isoform']); };",
	"bbop.golr.manager.prototype.doc_type = function(t){ return this.add_query_filter('document_type', t); };",

	// jQuery helpers.
	"var empty = function(did){ jQuery('#' + did).empty(); };",
	"var append = function(did, str){ jQuery('#' + did).append(str); };"
    ];
    var repl = new bbop.widget.repl('repl-div', initial_repl_commands,
				    {
					// 'buffer_id': cmnd_buff_id,
					//display_initial_commands_p: true
					display_initial_commands_p: false
				    });
    // // Redefine ll to call advance log as well.
    // function ll(str){
    // 	logger.kvetch(str);
    // 	repl.advance_log_to_bottom();
    // 	return str;
    // }

    ///
    /// Make the pull-down active.
    ///

    // Get things from pulldown into textarea on change.
    jQuery("#" + "golr_session_example_selection").change(
	function(event){
	    var sess_golr = jQuery(this).val();
	    //ll('// sess_golr: ' + sess_golr);
	    //alert('foo!');
	    //jQuery('#' + cmnd_buff_id).val(sess_golr);
	    repl.replace_buffer_text(sess_golr);
	    //repl.advance_log_to_bottom();
	});

    // Roll up the function/object dictionary.
    jQuery("#" + "env-entities").hide();
    jQuery("#" + "show-entities").click(
	function(){
	    jQuery("#" + "env-entities").slideToggle();
	});

    ll('REPLInit done.');
}
