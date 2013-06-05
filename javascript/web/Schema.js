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

    // Helper: dedupe a list...might be nice in core?
    function dedupe(list){
	var retlist = [];
	if( list && list.length > 1 ){
	    retlist = get_keys(hashify(list));
	}
	return retlist;
    }

    //ll('');
    ll('SchemaInit start...');

    // Make unnecessary things roll up.
    amigo.ui.rollup(["inf01"]);

    // Cycle through the schema and build up an object for use in
    // table building.
    var fields = {};
    var classes = gconf.get_classes_by_weight();
    each(classes,
	 function(cc, ccindex){
	     var ccid = cc.id();
	     var cfs = cc.get_fields();
	     each(cfs,
		  function(cf, cfindex){
		      // If we haven't seen it before, go ahead and
		      // add it.
		      var cid = cf.id();
		      if( ! bbop.core.is_defined( fields[cid]) ){
			  fields[cid] = {
			      label: [],
			      description: [],
			      personality: [],
			      //required: 
			      id: cid
			  };
		      }

		      // Add the extra information that we've gotten.
		      fields[cid]['label'].push(cf.display_name());
		      fields[cid]['description'].push(cf.description());
		      fields[cid]['personality'].push(ccid);
		  });
	 });

    // Generate a nice table head.    
    var thead = new bbop.html.tag('thead');
    each(['id', 'label(s)', 'description(s)', 'in personality'],
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

	     // Dedupe.
	     cache.push(dedupe(fobj['label']).join(', '));
	     cache.push(dedupe(fobj['description']).join('<br />'));
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

    // Apply the tablesorter to what we got.
    jQuery('#' + tbl.get_id()).tablesorter(); 

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
	});

    ll('SchemaInit done.');
}
