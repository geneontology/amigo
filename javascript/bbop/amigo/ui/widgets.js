////////////
////
//// bbop.amigo.ui.widgets
////
//// Purpose: Provide standard HTML UI production functions. Also adds
//// a few GUI elements that can be used as the app needs.
////          
//// Ajax widgets built on jQuery and automatically installed
//// into the document (hidden until used).
////
//// DEPENDS: bbop.core
//// DEPENDS: bbop.amigo
//// DEPENDS: bbop.amigo.go_meta
//// DEPENDS: com.jquery (1.3.2)
////
//////////


// Module and namespace checking.
// TODO: Will we need a ui class up there?
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'amigo');
bbop.core.require('bbop', 'amigo', 'go_meta');
bbop.core.namespace('bbop', 'amigo', 'ui');


//
//bbop.amigo.ui.widgets = function(wid){  
bbop.amigo.ui.widgets = function(){  

    // Bring in utilities.
    var amigo = new bbop.amigo();
    var meta = new bbop.amigo.go_meta();

    // We'll be doing a lot of debugging.
    function ll(str){ bbop.core.kvetch(str); }
    ll("");

    // ...use this a lot...
    function _wrap(str){ return '<h2>' + str + '</h2>'; }

    //     // Handle arguments.
    //     // TODO:
    //     var foo = '_there_needs_to_be_a_foo_argument_';
    //     if( args ){
    // 	//
    // 	if( args['foo'] ){
    // 	    if( args['foo'] == 'bar' ){
    // 		foo = 'bibble';
    // 	    }
    // 	}
    //     }

    // Generate unique-ish ids.
    var id_base = "org_bbop_amigo_ui_widgets_gui_";

    // Generate and destory used tags.
    function _generate_element(ctype){

	var UID = id_base + amigo.util.randomness();
	var div_text = '<div id="' + UID + '"></div>';

	jQuery("body").append(jQuery(div_text).hide());
	var elt = jQuery('#' + UID);

	elt.addClass("org_bbop_amigo_ui_widget_base");
	elt.addClass("org_bbop_amigo_ui_widget_for_" + ctype);

	return elt;
    }
    function _destroy_element(){
	jQuery(this).remove();
    }

    ///
    /// Wait handling.
    /// NOTE: not sure how this will work with the single shared pane.
    ///

    // Add to the document body and hide.
    var WAITING = id_base + amigo.util.randomness();
    var waiting_text = '<div id="' + WAITING + '"></div>';
    jQuery("body").append(jQuery(waiting_text).hide());
    jQuery('#' + WAITING).addClass("org_bbop_amigo_ui_widget_base");
    jQuery('#' + WAITING).addClass("org_bbop_amigo_ui_widget_for_waiting");

    ll("Creating wait widget div: " + WAITING);

    //     // TESTING: run one through it's paces.
    //     jQuery('#' + WAITING).show();
    //     jQuery('#' + WAITING).fadeOut('slow');
    //     jQuery('#' + WAITING).fadeIn('slow');
    //     jQuery('#' + WAITING).slideUp('slow');
    //     jQuery('#' + WAITING).slideDown('slow');
    //     jQuery('#' + WAITING).fadeOut();

    // Counts and processing.
    var current_waits = 0;
    var current_wait_message = "Processing...";
    this.start_wait = function(msg){

	ll("Outstanding waits: " + current_waits + " for " + WAITING);

	if( current_waits == 0 ){
	    //jQuery('#' + WAITING).fadeIn('fast');
	    ll("   None, so do slidedown for: " + WAITING);
	    jQuery('#' + WAITING).slideDown('fast');
	}
	//jQuery('#' + WAITING).html(msg + ' (' + (current_waits + 1) + ')');
	jQuery('#' + WAITING).html(_wrap(msg));
	current_waits++;
    };
    this.finish_wait = function(){
	if( current_waits == 1 ){
	    //jQuery('#' + WAITING).fadeOut('fast');
	    jQuery('#' + WAITING).slideUp('fast');
	}
	current_waits--;
    };

    ///
    /// Unitary tool tip widget.
    /// NOTE: Should share same problems as above.
    ///

    // Add to the document body and hide.
    var UTOOLTIP = id_base + amigo.util.randomness();
    var utool_text = '<div id="' + UTOOLTIP + '"></div>';
    jQuery("body").append(jQuery(utool_text).hide());
    // TODO: better styles for this...
    jQuery('#' + UTOOLTIP).addClass("org_bbop_amigo_ui_widget_base");
    jQuery('#' + UTOOLTIP).addClass("org_bbop_amigo_ui_widget_for_waiting");
    
    ll("Creating unitary_tooltip div: " + UTOOLTIP);

    //
    this.tooltip_show = function(msg){
	ll('utool show');
	jQuery('#' + UTOOLTIP).html(msg);
	jQuery('#' + UTOOLTIP).show();
    };
    this.tooltip_hide = function(){
	ll('utool hide');
	jQuery('#' + UTOOLTIP).hide();
    };

    ///
    /// Notice and error handling.
    ///
    // elt.show().fadeIn('slow').fadeOut('slow', _destroy_element);

    //
    this.notice = function(msg){
	var elt = _generate_element('notice');
	elt.html(_wrap(msg));
	elt.show().slideDown('slow').slideUp('slow', _destroy_element);
    };

    //
    this.warning = function(msg){
	var elt = _generate_element('warning');
	elt.html(_wrap(msg));
	elt.show().slideDown('slow').slideUp('slow', _destroy_element);
    };

    //
    this.error = function(msg){
	var elt = _generate_element('error');
	elt.html(_wrap(msg));
	elt.show().fadeTo(2500, 0.9).fadeOut(1000, _destroy_element);
    };

    ///
    /// String-emitting widget templates.
    ///

    //
    this.table = {};

    // Headers must be the same width as row.
    this.table.simple = function(headers, rows){
	
	var buf = new Array();

	buf.push('<table border="1">');

	//
	if( headers && headers.length > 0 ){
	    buf.push('<tr>');
	    for( var i = 0; i < headers.length; i++ ){
		buf.push('<td>');
		buf.push(headers[i]);
		buf.push('</td>');
	    }
	    buf.push('</tr>');
	}

	//
	for( var j = 0; j < rows.length; j++ ){
	    if( j % 2 == 0 ){
		buf.push('<tr class="even_row">');
	    }else{
		buf.push('<tr class="odd_row">');
	    }

	    var tds = rows[j];
	    for( var k = 0; k < tds.length; k++ ){
		buf.push('<td>');
		buf.push(tds[k]);
		buf.push('</td>');
	    }
	    
	    buf.push('</tr>');
	}
	
	buf.push('</table>');

	return buf.join('');
    };

    //
    this.form = {};

    //
    this.form.hidden_input = function(name,  value){

	var buf = new Array();

	buf.push('<input type="hidden" name="');
	buf.push(name);
	buf.push('" value="');
	buf.push(value);
	buf.push('" />');

	return buf.join('');
    };

    //
    this.form.text_input = function(id, name, size, label){

	var buf = new Array();

	buf.push('<label for="');
	buf.push(id);
	buf.push('">');
	buf.push(label);
	buf.push('</label>');
	buf.push('<input class="textBox textBoxLighten" type="text" name="');
	buf.push(name);
	buf.push('" size="');
	buf.push(size);
	buf.push('" value="" id="');
	buf.push(id);
	buf.push('">');
    
	return buf.join('');
    };

    // TODO/BUG: the needs to be refined/generalized from the filter
    // type we have here now...
    this.form.multiselect = function(id, name, size, data, label){

	var buf = new Array();

	// Add the label.
	//buf.push('<legend>');
	buf.push('<label for="');
	buf.push(id);
	buf.push('" class="select">');
	//buf.push('" class="">');
	buf.push(label);
	buf.push('</label>');
	//buf.push('</legend>');
	//buf.push('<br />');

	//
	buf.push('<select id="');
	buf.push(id);
	buf.push('" name="');
	buf.push(name);
	buf.push('" multiple size="');
	buf.push(size);
	buf.push('">');
	
	//
	buf.push('<option value="" selected>No filter</option>');

	//
	for( var ms = 0; ms < data.length; ms++ ){
	    buf.push('<option value="');
	    buf.push(data[ms][1]);
	    buf.push('">');
	    buf.push(data[ms][0]);
	    buf.push('</option>');
	}

	//
	buf.push('</select>');
	//buf.push('<br />');
	return buf.join('');
    };

    // We'll assume that is they want a null option, they'll push it
    // on the data array.
    this.form.select = function(id, name, data, selected, label){

	var buf = new Array();

	// Add the label.
	if( label ){
	    buf.push('<label for="');
	    buf.push(id);
	    buf.push('" class="select">');
	    //buf.push('" class="">');
	    buf.push(label);
	    buf.push('</label>');
	    //buf.push('<br />');
	}

	//
	buf.push('<select id="');
	buf.push(id);
	buf.push('" name="');
	buf.push(name);
	buf.push('">');
	
	//
	//buf.push('<option value="" selected>No filter</option>');

	//
	for( var ms = 0; ms < data.length; ms++ ){

	    var key = data[ms][0];
	    var val = data[ms][1];

	    buf.push('<option value="');
	    buf.push(val);
	    if( selected && selected == key ){
		buf.push('" selected>');
	    }else{
		buf.push('">');
	    }
	    buf.push(key);
	    buf.push('</option>');
	}

	//
	buf.push('</select>');
	//buf.push('<br />');
	return buf.join('');
    };

    //
    this.form.checkbox = {};
    this.form.checkbox.front = function(id, name, label, checked){

	var checked_p = false;
	if( checked && checked == true ){
	    checked_p = true;
	}

	var buf = new Array();

	buf.push('<input class="textBox" type="checkbox" name="');
	buf.push(name);
	buf.push('" value="checked" id="');
	//buf.push('" id="');
	buf.push(id);
	buf.push('"');
	if( checked_p ){ // optional checking
	    buf.push(' checked');
	}
	buf.push('>');
	buf.push('<label for="');
	buf.push(name);
	buf.push('">');
	buf.push(label);
	buf.push('</label>');
    
	return buf.join('');
    };

    // Create listener for actions on the form.
    this.form.create_jquery_marshal = function(form_id, form_fields){

	return function(event){

	    // These will actually be variables used during function
	    // generation in final form.
	    //var form_id = '#app-form';
	    //var form_fields = ['input', 'option:selected'];

	    // Create jQuery selector string.
	    var minibuf = new Array();
	    for( var q = 0; q < form_fields.length ; q++ ){
		minibuf.push( form_id + ' ' + form_fields[q] );
	    }
	    var selector_string = minibuf.join(', ');
	    // ll('selector string: ' + selector_string);
	    
	    //
	    //var found = new Array();
	    var found = {};
	    var form_inputs = jQuery(selector_string);
	    form_inputs.each(function(i, item) {
	    
		var value = jQuery(item).val();
		var name = null;
		if( item.name ){
		    name = item.name;
		}else{
		    name = jQuery(item).parent().attr('name');
		}
		// ll('_'+ i +':'+ name +':'+ value);

		if( ! found[name] ){
		    found[name] = [];
		}
		found[name].push(value);
	    });
	    return found;
	};
    };
};

    
