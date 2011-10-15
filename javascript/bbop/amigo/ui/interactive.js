////////////
////
//// bbop.amigo.ui.interactive
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
//// DEPENDS: com.jquery (1.3.2)+?
////
//////////


// Module and namespace checking.
// TODO: Will we need a ui class up there?
bbop.core.require('bbop', 'core');
bbop.core.require('bbop', 'logger');
bbop.core.require('bbop', 'amigo');
bbop.core.require('bbop', 'amigo', 'go_meta');
bbop.core.namespace('bbop', 'amigo', 'ui', 'interactive');


//
bbop.amigo.ui.interactive.multi_model = function(in_data){

    var anchor = this; // top-level this

    // Bring in utilities.
    var core = new bbop.amigo();
    var meta = new bbop.amigo.go_meta();

    // We'll be doing a lot of debugging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }
    ll("");

    // 
    this.initial_data = in_data;
    this.current_data = {};


    // (Re)set data to initial state.
    function _reset_data(){
	
	anchor.current_data = {};
	//anchor.initial_data[bbop.core.randomness()] =
	anchor.current_data['_nil_'] =
	    {
		value: "",
		label: "No Filter",
		count: 0,
		selected: true,
		special: true
	    };
	for( var ms = 0; ms < anchor.initial_data.length; ms++ ){
	    // anchor.current_data[bbop.core.randomness()] =
	    anchor.current_data[anchor.initial_data[ms][1]] =
		{
		    value: anchor.initial_data[ms][1],
		    label: anchor.initial_data[ms][0],
		    count: 0,
		    selected: false,
		    special: false
		};
	}
    };
    this.reset_data = _reset_data;


    // See if data item exists by key.
    function _has_item(in_arg_key){
	var retval = false;
	if( typeof anchor.current_data[in_arg_key] != 'undefined' ){
	    retval = true;
	}
	return retval;
    }
    this.has_item = _has_item;


    // Add a new data item to the model.
    function _add_item(in_arg_key, data){

	var retval = false;
	if( typeof anchor.current_data[in_arg_key] == 'undefined' ){
	    // BUG/TODO: this should be a copy.
	    anchor.current_data[in_arg_key] = data;
	    //ll("add_item: adding key (w/data): " + in_arg_key);
	    retval = true;
	}
	return retval;
    }
    this.add_item = _add_item;


    // Update the underlying data structure. Can change count or
    // selected or whatever.
    function _update_value(inkey, intype, inval){

	// Update the value in question.
	var rval = false;
	if( typeof anchor.current_data[inkey] != 'undefined' &&
	    typeof anchor.current_data[inkey][intype] != 'undefined' ){
		anchor.current_data[inkey][intype] = inval;
		rval = true;
		// ll("\tupdated: " + inkey +
		// 	    "'s " + intype +
		// 	    ' to ' + inval);
	    }

	// Bookkeeping to keep the "no filter" option selected
	// or not in all cases.
	if( _get_selected_items().length == 0 ){
	    anchor.current_data['_nil_']['selected'] = true;	    
	}else{
	    anchor.current_data['_nil_']['selected'] = false;
	}

	return rval;
    };
    this.update_value = _update_value;


    // Give all possible current filters except the nil/default-no
    // filter.
    function _get_all_items(){
	var ret_filters = [];
	var complete_filters = bbop.core.get_keys(anchor.current_data);
	for( var cfi = 0; cfi < complete_filters.length; cfi++ ){
	    var test_filter = complete_filters[cfi];
	    if( test_filter != '_nil_' ){
		ret_filters.push(test_filter);
	    }
	}
	return ret_filters;
    }
    this.get_all_items = _get_all_items;


    // Give all selected current filters.
    function _get_selected_items(){
	
	var ret_filters = [];

	// Push out the filters that have selected == true.
	var all_filters = _get_all_items();
	for( var afi = 0; afi < all_filters.length; afi++ ){
	    var filter_name = all_filters[afi];
	    var fconf = anchor.current_data[filter_name];
	    if( fconf &&
		typeof fconf['selected'] != 'undefined' &&
		fconf['selected'] == true ){
		    ret_filters.push(filter_name);
		}
	}

	return ret_filters;
    }
    this.get_selected_items = _get_selected_items;


    // Give current data.
    function _get_state(){
	return anchor.current_data;
    }
    this.get_state = _get_state;

    ///
    /// Constructor.
    ///

    _reset_data();
};

    
//
bbop.amigo.ui.interactive.multi_widget = function(in_id, in_name,
						  in_size, in_label){

    var anchor = this; // top-level this

    // Bring in utilities.
    var amigo = new bbop.amigo();
    //var meta = new bbop.amigo.go_meta();

    // We'll be doing a lot of debugging.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }
    ll("");

    // Copy in atom arguments.
    this.mid = in_id;
    this.mname = in_name;
    this.msize = in_size;
    this.mlabel = in_label;
    this.mdata = {};

    function _update_with(in_data){
	anchor.mdata = in_data;
    }
    this.update_with = _update_with;

    // Render the label to an HTML string.
    function _render_label(){
	
	var buf = new Array();

	// Add the label.
	buf.push('<label for="');
	buf.push(anchor.mid);
	buf.push('" class="select">');
	buf.push(anchor.mlabel);
	buf.push('</label>');

	return buf.join('');	
    }
    this.render_label = _render_label;


    // Render the options to an HTML string.
    function _render_option(){

	var buf = new Array();

	// Sort the items in the mdata array.
	// Also keep a lookup for a "special" entry.
	// var default_on_p = false;
	var mdata_keys = bbop.core.get_keys(anchor.mdata);
	function _data_comp(a, b){

	    // Get the associated data.
	    var a_data = anchor.mdata[a];
	    var b_data = anchor.mdata[b];

	    // if( (a_data['special'] == true && a_data['selected'] == true) ||
	    // 	(b_data['special'] == true && b_data['selected'] == true) ){
	    // 	default_on_p = true;
	    // }

	    //
	    var retval = 0;
	    if( a_data['special'] != b_data['special'] ){
		if( a_data['count'] == true ){
		    retval = 1;
		}else{
		    retval = -1;
		}
	    }else if( a_data['count'] != b_data['count'] ){
		if( a_data['count'] > b_data['count'] ){
		    retval = -1;
		}else{
		    retval = 1;
		}
	    }else if( a_data['label'] != b_data['label'] ){
		if( a_data['label'] > b_data['label'] ){
		    retval = 1;
		}else{
		    retval = -1;
		}
	    }

	    return retval;
	}
	mdata_keys.sort(_data_comp); // inplace sort

	//
	for( var mski = 0; mski < mdata_keys.length; mski++ ){

	    var write_data = anchor.mdata[mdata_keys[mski]];
	    
	    // Write out option if:
	    // 1) the default is selected (so we want to see everything)
	    // 2) the selection is special
	    // 3) if the default is not selected, either the item is selected or
	    // 4) it has a count (and is thus interesting)
	    if( // default_on_p == true ||
	    	write_data['selected'] == true ||
	    	write_data['special'] == true ||
	    	( write_data['count'] && write_data['count'] > 0 ) ){
		    
		    buf.push('<option');
		    // Title.
		    buf.push(' title="');
		    buf.push(write_data['value']);
		    buf.push('"');		
		    // Value.
		    buf.push(' value="');
		    buf.push(write_data['value']);
		    buf.push('"');		
		    if( write_data['selected'] ){
			buf.push(' selected="selected"');
		    }
		    buf.push('>');
		    //buf.push(bbop.core.crop(write_data['label']));
		    buf.push(bbop.core.crop(write_data['label'], 40, '...'));
		    
		    if( write_data['count'] && write_data['count'] > 0 ){
			buf.push(' (' + write_data['count'] + ')');
		    }
		    
		    buf.push('</option>');
		}
		
	}
	return buf.join('');
    }
    this.render_option = _render_option;


    // Render the select frame to an HTML string.
    function _render_select(){

	var buf = new Array();

	//
	buf.push('<select id="');
	buf.push(anchor.mid);
	buf.push('" name="');
	buf.push(anchor.mname);
	buf.push('" multiple size="');
	buf.push(anchor.msize);
	buf.push('">');
	
	buf.push(_render_option());

	//
	buf.push('</select>');

	return buf.join('');
    }
    this.render_select = _render_select;


    // Initial rendering of our widget to a string. Should only be
    // called once.
    this.render_initial = function(){

	var buf = new Array();

	buf.push(_render_label());
	buf.push(_render_select());

	return buf.join('');
    };


    // ...
    this.render_update = function(){
	jQuery('#' + anchor.mid).html(_render_option());
    };

};
