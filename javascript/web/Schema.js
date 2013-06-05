////
//// Render the schema information that we can squeeze out of the API.
////


//
function SchemaInit(){

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch(str); }

    // External meta-data.
    var sd = new amigo.data.server();
    var solr_server = sd.golr_base();
    var gconf = new bbop.golr.conf(amigo.data.golr);

    // Aliases.
    var each = bbop.core.each;
    var hashify = bbop.core.hashify;
    var get_keys = bbop.core.get_keys;
    var is_def = bbop.core.is_defined;
    var is_empty = bbop.core.is_empty;

    // Helper: dedupe a list...might be nice in core?
    function dedupe(list){
	var retlist = [];
	if( list && list.length > 0 ){
	    retlist = get_keys(hashify(list));
	}
	return retlist;
    }

    // Helper: turn:
    // : {'string1': ['foo'], 'string2': ['foo', 'bar', 'foo'],}
    // Into:
    // : "string1 (foo)<br />string2 (foo, bar)"
    function sfuse(hash){
	var retval = '';

	var cache = [];
	each(hash,
	     function(str, loc_list){
		 var locs = dedupe(loc_list);
		 cache.push( str + ' <small>[' + locs.join(', ') + ']</small>');
	     });
	if( cache.length > 0 ){
	    retval = cache.join('<br />');	    
	}
    
	return retval;
    }

    function _recolor_table(tid){
	jQuery('table#' + tid + ' tr:even').attr('class', 'even_row');
	jQuery('table#' + tid + ' tr:odd').attr('class', 'odd_row');
    }

    //ll('');
    ll('SchemaInit start...');

    // Make unnecessary things roll up.
    amigo.ui.rollup(["inf01"]);

    var classes = gconf.get_classes_by_weight();

    // First, let's go through all of the fields and figure out their
    // capacities.
	     //
    var field_cap_cache = {};
    var capacities = ['boost', 'result', 'filter'];
    each(classes,
	 function(conf_class, ccindex){
	     var personality = conf_class.id();
	     
	     each(capacities,
		  function(capacity){
		      var by_weights = conf_class.get_fields();
		      each(by_weights,
			   function(field){
			       var fid = field.id();
			       if( ! is_def(field_cap_cache[fid]) ){
				   field_cap_cache[fid] = {};
			       }
			       if( ! is_def(field_cap_cache[fid][capacity]) ){
				   field_cap_cache[fid][capacity] = [];
			       }
			       field_cap_cache[fid][capacity].push(
				   personality);
			   });
		  });
	 });

    // Now cycle through the main schema and build up an object for
    // use in table building.
    var fields = {};
    each(classes,
	 function(conf_class, ccindex){
	     var personality = conf_class.id();

	     var cfs = conf_class.get_fields();
	     each(cfs,
		  function(cf, cfindex){
		      // If we haven't seen it before, go ahead and
		      // add it.
		      var cid = cf.id();
		      if( ! bbop.core.is_defined( fields[cid]) ){
			  fields[cid] = {
			      personality: [],
			      label: {},
			      description: {},
			      capacity: {},
			      //required: 
			      multi: '???',
			      id: cid
			  };
		      }

		      // Personality is easy.
		      fields[cid]['personality'].push(personality);

		      // Multi is easy too since it must be uniform.
		      if( cf.is_multi() ){
			  fields[cid]['multi'] = 'yes';
		      }else{
			  fields[cid]['multi'] = 'no';
		      }
		      
		      // Capacity not too bad since we already
		      // did the work above.
		      if( field_cap_cache[cid] && 
			  ! is_empty(field_cap_cache[cid]) ){
			  fields[cid]['capacity'] = field_cap_cache[cid];
		      }
		      
		      // Label and description are harder. First grab
		      // raw versions, assert, then mark personality.
		      // Label.
		      var lbl = cf.display_name();
		      if( ! is_def(fields[cid]['label'][lbl]) ){
			  fields[cid]['label'][lbl] = [];
		      }
		      fields[cid]['label'][lbl].push(personality);
		      // Description.
		      var desc = cf.description();
		      if( ! is_def(fields[cid]['description'][desc]) ){
			  fields[cid]['description'][desc] = [];
		      }
		      fields[cid]['description'][desc].push(personality);
		  });
	 });

    // Generate a nice table head.    
    var thead = new bbop.html.tag('thead');
    each(['id', 'multi', 'display label(s)', 'description(s)',
	  'in capacity', 'personalities'],
	 function(title_item){
	     thead.add_to('<th>' + title_item +
			  '<img style="border: 0px;" src="' +
			  sd.image_base() + '/reorder.gif" />' +
			  '</th>');
	 });

    // Now a nice body. Add some buttons, but keep them for later.
    var tbody = new bbop.html.tag('tbody');
    each(fields,
	 function(fkey, fobj){
	     var cache = [];

	     // Unique.
	     cache.push(fobj['id']);
	     cache.push(fobj['multi']);

	     // Label and description need to be handled carefully.
	     cache.push( sfuse(fobj['label']) );
	     cache.push( sfuse(fobj['description']) );

	     // Careful handling.
	     cache.push( sfuse(fobj['capacity']) );

	     // Personality easily deduped.
	     cache.push(dedupe(fobj['personality']).join(', '));

	     // Assemble.
	     var tr = '<tr><td>' + cache.join('</td><td>') + '</td></tr>';
	     tbody.add_to(tr);
	 });

    // Generate the table itself.
    var tbl_attrs = {
	generate_id: true
    };
    var tbl = new bbop.html.tag('table', tbl_attrs);
    tbl.add_to(thead);
    tbl.add_to(tbody);

    var target_id = 'schema_info_table_div';

    // Add the table to the DOM.
    jQuery('#' + target_id).empty();
    jQuery('#' + target_id).append(tbl.to_string());

    // Apply a first round of coloring.
    _recolor_table(tbl.get_id());

    // Apply the tablesorter to what we got.
    jQuery('#' + tbl.get_id()).tablesorter(); 
    // Recolor on sort.
    jQuery('#' + tbl.get_id()).bind("sortEnd",
				    function(){ 
					_recolor_table(tbl.get_id());
				    });

    // Make the table filter active.
    var trs = jQuery('#' + tbl.get_id() + ' tbody > tr');
    var tds = trs.children();
    jQuery('#' + 'schema_info_search_div').keyup(
	function(){
            var stext = jQuery(this).val();

	    if( ! is_def(stext) || stext == "" ){
		// Restore when nothing found.
		trs.show();
	    }else{
		// Want this to be insensitive.
		stext = stext.toLowerCase();

		// All rows (the whole table) gets hidden.
		trs.hide();

		// jQuery filter to match element contents against
		// stext.
		function _match_filter(){
		    var retval = false;
		    var lc = jQuery(this).text().toLowerCase();
		    if( lc.indexOf(stext) > -1 ){
			retval = true;
		    }
		    return retval;
		}

		// If a td has a match, the parent (tr) gets shown.
		// Or: show only matching rows.
		tds.filter(_match_filter).parent("tr").show();
            }

	    // Recolor after filtering.
	    _recolor_table(tbl.get_id());
	});

    ll('SchemaInit done.');
}
