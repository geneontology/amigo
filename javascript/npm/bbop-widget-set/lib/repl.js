/*
 * Package: repl.js
 *
 * Namespace: bbop-widget-set.repl
 *
 * A self-contained flexible REPL to use as a base to explore the BBOP
 * environment that you setup.
 *
 * This is a completely self-contained UI and manager.
 *
 * WARNING: This widget cannot display any kind of HTML tags in the
 * log.
 */

var us = require('underscore');
var bbop = require('bbop-core');

var html = require('./html');
var display = require('./display');
var generators = require('./generators');

/*
 * Constructor: repl
 *
 * Contructor for the bbop-widget.repl object.
 *
 * The in_argument_hash has the following options.
 *
 *  buffer_id - the id of the evaluation buffer textarea (default: null/random)
 *  cli_id - the id of the CLI textarea (default: null/random)
 *  display_initial_commands_p - (default true)
 *
 * If you do not specify ids for the inputs, random ones will be
 * generated.
 *
 * Arguments:
 *  interface_id - string id of the element to build on
 *  initial_commands - a list of initial commands to feed the interpreter
 *  in_argument_hash - *[optional]* optional hash of optional arguments
 *
 * Returns:
 *  this object
 */
var repl = function(interface_id, initial_commands, in_argument_hash){
    this._is_a = 'bbop-widget-set.repl';

    // Aliases.
    var anchor = this;
    var loop = bbop.each;

    // Our argument default hash.
    var default_hash =
	{
	    'buffer_id': null,
	    'cli_id': null,
	    'display_initial_commands_p': true
	};
    var folding_hash = in_argument_hash || {};
    var arg_hash = bbop.fold(default_hash, folding_hash);
    var in_buffer_id = arg_hash['buffer_id'];
    var in_cli_id = arg_hash['cli_id'];
    var display_initial_commands_p = arg_hash['display_initial_commands_p'];

    // Get no commands if nothing else.
    var init_buffer = initial_commands || [];

    // The main div we'll work with.
    var repl_id = interface_id;
    jQuery('#' + repl_id).empty();

    // Save our CLI history as we go.
    var history_pointer = 0;
    var history_list = [''];

    ///
    /// Setup the HTML and layout on the page.
    ///

    // Env into work buffer.
    var command_buffer_args = {'rows': '12', cols:'80'};
    if( in_buffer_id ){
	command_buffer_args['id'] = in_buffer_id;
    }else{
	command_buffer_args['generate_id'] = true;
    }
    var command_buffer = new html.tag('textarea', command_buffer_args,
					   init_buffer.join("\n"));
    jQuery('#' + repl_id).append(command_buffer.to_string());

    jQuery('#' + repl_id).append('<br />');

    // Command buffer eval button.
    var command_buffer_button = new html.button('Evaluate buffer',
	    				   {'generate_id': true});
    jQuery('#' + repl_id).append(command_buffer_button.to_string());

    // Clear buffer button.
    var clear_buffer_button = new html.button('Clear buffer',
	    					   {'generate_id': true});
    jQuery('#' + repl_id).append(clear_buffer_button.to_string());

    // Clear log button.
    var clear_log_button = new html.button('Clear log',
	    					{'generate_id': true});
    jQuery('#' + repl_id).append(clear_log_button.to_string());

    jQuery('#' + repl_id).append('<br />');

    // Log (+ clear botton).
    // //var logging_console_id = 'bbop-logger-console-text';
    // var logging_console_id = 'bbop-logger-console-textarea';
    // var logging_console = new html.tag('textarea',
    // 					    {'rows': '7', cols:'80',
    // 					     'readonly': 'readonly',
    // 					     'id': logging_console_id});
    var logging_console_id = 'bbop-logger-console-html';
    var logging_console = new html.tag('div',
    				       {'id': logging_console_id,
					'class': 'nowrap',
    					'style': 'height: 7em; width: 40em; border: 1px solid #888888; overflow: auto;'});
    jQuery('#' + repl_id).append(logging_console.to_string());

    //jQuery('#' + repl_id).append('<br />');

    // A usage message.
    var cli_msg = new html.tag('span', {},
				    "[eval: return; ctrl+up/down: history]:");
    jQuery('#' + repl_id).append(cli_msg.to_string());
    jQuery('#' + repl_id).append('<br />');

    // Command line.
    var command_line_args = {'rows': '1', cols:'80'};
    if( in_cli_id ){
	command_line_args['id'] = in_cli_id;
    }else{
	command_line_args['generate_id'] = true;
    }
    var command_line = new html.tag('textarea', command_line_args);
    jQuery('#' + repl_id).append(command_line.to_string());

    ///
    /// Core helper functions.
    ///

    // Per-UI logger. Notice that we waited until after the log div
    // was added to run this to make sure we bind to the right spot.
    var rlogger = new bbop.logger();
    rlogger.DEBUG = true;
    //function log(str){ rlogger.kvetch('repl (pre): ' + str); }
    function log(str){ rlogger.kvetch(str); }

    // Advance the log to the bottom.
    function _advance_log_to_bottom(){
    	// var cons = jQuery('#' + logging_console_id);
    	// var foo = cons.scrollTop(cons[0].scrollHeight);
    };

    // Eval!
    function _evaluate(to_eval){

	var retval = null;
	var retval_str = '';
	var okay_p = true;

	try{
	    // If we get through this, things have gone well.
	    // Global eval actually kind of tricky:
	    //  http://perfectionkills.com/global-eval-what-are-the-options/
	    //var ret = eval(to_eval);
	    //var ret = jQuery.globalEval(to_eval);
	    retval = window.eval(to_eval);
	    if( bbop.is_defined(retval) ){
		//log('// in def if');
		if( bbop.what_is(retval) == 'string' ){
		    // // log('// in str if');
		    // retval_str = retval;
		    // // var gt_re = new RegExp("/\>/", "gi");
		    // // var lt_re = new RegExp("/\</", "gi");
		    // retval_str.replace(">", "&gt;");
		    // retval_str.replace("<", "&lt;");
		    // //retval_str = '<pre>' + retval_str + '</pre>';
		    // // log('// end: (' + retval_str + ')');
		    // retval_str = '<code>' + retval_str + '</code>';
		    // retval_str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		    retval_str = '"' + retval + '"';
		}else{
		    retval_str = retval; // worth a try at least
		}
	    }else{
		// Maybe undefined, but probably just no return value.
		//retval_str = '[undefined]';
		retval_str = '';
	    }
	}catch (x){
	    // Bad things happened.
	    retval = null;
	    retval_str = '[n/a]';
	    okay_p = false;
	}

	return [retval, retval_str, okay_p];
    }

    // Update the CLI to the current point in the history.
    function _update_cli(){

	var item = history_list[history_pointer];
	jQuery('#' + command_line.get_id()).val(item);
	//log('// [history]: ' + item);
	//log('// history: '+history_pointer+', '+history_list.length);
	//_advance_log_to_bottom();
    }

    ///
    /// Build callbacks.
    ///

    // A lot of cases for button presses when reading from the command
    // line.
    function read_cli(event){

	var which = event.which;
	var ctrl_p = event.ctrlKey;
	//log('cli: ' + which + ', ' + ctrl_p);

	if ( which == 13 ) { // return

	    // Stop events.
	    event.preventDefault();

	    // Get and ensure nice JS, wipe CLI clean.
	    var to_eval = jQuery('#' + command_line.get_id()).val();
	    if( to_eval != '' ){
		jQuery('#' + command_line.get_id()).val('');

		// Enter the new command into our history and bump the
		// index to the last thing pushed on.
		history_list.pop(); // pop the empty ''
		history_list.push(to_eval);
		history_list.push(''); // push new empty ''
		history_pointer = history_list.length -1;
		//log('// history: '+history_pointer+', '+history_list.length);

		// Log, eval, log.
		to_eval = bbop.ensure(to_eval, ';', 'back');
		log(to_eval);
		var evals = _evaluate(to_eval);
		log('// ' + evals[1]);
		_advance_log_to_bottom();

		return false;
	    }
	}else if( ctrl_p && which == 38 ){ // ctrl + up

	    // Stop stuff?
	    event.preventDefault();

	    if( history_pointer == 0 ){
		_update_cli();
	    }else if( history_pointer > 0 ){
		history_pointer--;
		_update_cli();
	    }

	    return false;

	}else if( ctrl_p && which == 40 ){ // ctrl + down

	    // Stop stuff?
	    event.preventDefault();

	    if( history_pointer < history_list.length -1 ){
		history_pointer++;
		_update_cli();
	    }

	    return false;
	}

	return true;
    }
    jQuery('#' + command_line.get_id()).keydown(read_cli);

    // Bind buffer eval.
    function read_buffer(){
	var to_eval = jQuery('#' + command_buffer.get_id()).val();
	if( to_eval != '' ){
	    log('// Evaluating buffer...');
	    var evals = _evaluate(to_eval);
	    log('// ' + evals[1]);
	    _advance_log_to_bottom();
	}
    }
    var cbbid = '#' + command_buffer_button.get_id();
    var command_buffer_button_props = {
	icons: { primary: "ui-icon-play"},
	disabled: false,
	text: true
    };
    jQuery(cbbid).button(command_buffer_button_props).click(read_buffer);

    // Bind buffer clear.
    function clear_buffer(){
	//jQuery('#' + logging_console_id).val('');
	//alert('to clear: ' + command_buffer.get_id());
	// FF, at least, does something weird here and empty() does
	// not always work--doubling seems to be file.
	jQuery('#' + command_buffer.get_id()).val('');
	//jQuery('#' + command_buffer.get_id()).empty();
    }
    var cbuid = '#' + clear_buffer_button.get_id();
    var clear_buffer_button_props = {
	icons: { primary: "ui-icon-trash"},
	disabled: false,
	text: true
    };
    jQuery(cbuid).button(clear_buffer_button_props).click(clear_buffer);

    // Bind log clear.
    function clear_log(){
	//jQuery('#' + logging_console_id).val('');
	jQuery('#' + logging_console_id).empty();
    }
    var clbid = '#' + clear_log_button.get_id();
    var clear_log_button_props = {
	icons: { primary: "ui-icon-trash"},
	disabled: false,
	text: true
    };
    jQuery(clbid).button(clear_log_button_props).click(clear_log);

    ///
    /// Bootstrap session.
    ///

    // Evaluate what we initially put in the command buffer.
    jQuery(cbbid).click(); // run the stuff in the buffer
    if( display_initial_commands_p == false ){ // maybe make it disappear
	clear_buffer();
	clear_log();
    }
    log('// [Session start.]');

    ///
    /// External use methods.
    ///

    /*
     * Function: get_id
     *
     * Get the id of different components in the REPL.
     *
     * Currently supported arguments are:
     *  - 'buffer'
     *
     * Arguments:
     *  str - the item you want to check
     *
     * Returns:
     *  string or null
     */
    this.get_id = function(str){

	var retval = null;

	if( str ){
	    if( str == 'buffer' ){
		retval = command_buffer.get_id();
	    }
	}

	return retval;
    };

    /*
     * Function: replace_buffer_text
     *
     * Replace the buffer text with new text.
     *
     * Arguments:
     *  str - the new text for the command buffer
     *
     * Returns:
     *  n/a
     */
    this.replace_buffer_text = function(str){
	clear_buffer();
	//jQuery('#' + command_buffer.get_id()).append(str);
	jQuery('#' + command_buffer.get_id()).val(str);
    };

    /*
     * Function: advance_log_to_bottom
     *
     * Can't be bothered to check now, but this needs to be done
     * separately from the log because of an initial race condition.
     *
     * Arguments:
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.advance_log_to_bottom = function(){
	_advance_log_to_bottom();
    };

    /*
     * Function: destroy
     *
     * Remove the autocomplete and functionality from the DOM.
     *
     * Arguments:
     *  n/a
     *
     * Returns:
     *  n/a
     */
    this.destroy = function(){
	jQuery('#' + anchor._interface_id).val('');
    };

};

///
/// Exportable body.
///

module.exports = repl;
