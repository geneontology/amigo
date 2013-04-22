////
//// For now, a simple hook into Grebe once live. Just three lines, so
//// will probably leave DEBUG in.
////

var global_grebe_list = [
    {
	'question_id': 'foo1',
	'personality': 'bbop_ann',
	'document_category': 'annotation',
	'field_translations': [
	    {
		'field_id': 'bar1',
		'field_filter': 'isa_partof_closure_label',
		'widget_personality': 'bbop_ont',
		'widget_filter': 'ontology_class'
	    }
	]
    }
];

//
function GrebeInit(){

    // Per-manager logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;

    //ll('');
    ll('GrebeInit start...');

    // Aliases.
    var each = bbop.core.each;
    var clone = bbop.core.clone;
    var is_defined = bbop.core.is_defined;
    var search_box = bbop.widget.search_box;
    function ll(str){ logger.kvetch(str); }

    // Manager generation prep.
    var sd = new amigo.data.server(); // resource locations
    var gconf = new bbop.golr.conf(amigo.data.golr);
    var linker = new amigo.linker();

    // Auto complete argument sets.
    var _do_nothing = function(){};
    var ont_args = {
	'label_template':
	'{{annotation_class_label}} ({{id}})',
	'value_template': '{{annotation_class_label}}',
	'list_select_callback': _do_nothing
	//'list_select_callback': forward
    };
    var bio_args = {
	'label_template':
	'{{bioentity_label}} ({{id}}/{{taxon_label}})',
	'value_template': '{{bioentity}}',
	'list_select_callback': _do_nothing
	//'list_select_callback': forward
    };

    // The multi-level cache for the lists.
    var map = {};

    // Iterate over our structured list and try to apply the
    // information to make a live manager to use. This will also
    // generate a list of independant managers that will listen and
    // act on the autocomplete input actions.
    //var grebe_managers = [];
    each(global_grebe_list,
	 function(grebe_item){
	    
	     // First, let's decompose the grebe list item into
	     // sensible parts
	     var question_id = grebe_item['question_id'];
	     var document_category = grebe_item['document_category'];
	     var personality = grebe_item['personality'];
	     var field_translations = grebe_item['field_translations'];

	     ll('processing: ' + question_id);

	     // Ensure map.
	     if( ! is_defined(map[question_id]) ){
		 map[question_id] = {
		     'question_id': question_id,
		     'document_category': document_category,
		     'personality': personality,
		     'field_translations': []
		 };
	     }

	     // // Check to see if that field exists in our document. If
	     // // it does, pull it.
	     // if( jQuery('#' + question_id ) ){

	     // Now walk through and tie this manager to the
	     // proper fields.
	     each(field_translations,
		  function(field_translation){

		      // Pull out the important fields of this item.
		      var field_id = field_translation['field_id'];
		      var field_filter = field_translation['field_filter'];
		      var widget_personality =
			  field_translation['widget_personality'];
		      var widget_filter = field_translation['widget_filter'];
		      ll('ft: ' + field_id + ' ' + field_filter);
		      ll('wt: ' + widget_personality + ' ' + widget_filter);

		      // 
		      var auto = new search_box(sd.golr_base(), gconf,
						field_id, ont_args);
		      auto.set_personality(widget_personality);
		      auto.add_query_filter('document_category', widget_filter);

		      // Ensure map and store these for processing on
		      // click.
		      // if(! is_defined(map[question_id]['field_translations']) ){
		      // 	  map[question_id]['field_translations'] = [];
		      // }
		      map[question_id]['field_translations'].push(
			  {
			      'field_id': field_id,
			      'field_filter': field_filter,
			      // Store the manager for later.
			      'manager': auto
			  });

		      //ll('a1: ' + auto);
		      //ll('a2: ' + bbop.core.what_is(auto));
		  });
	     
	     // Finally, set the icon to open a new window when
	     // clicked.
	     jQuery('#' + question_id).find('.grebe-action-icon').click(
		 function(){

		     // First, create a new manager for this line item.
		     // We'll build-up its filters as we go.
		     var mgr =
			 new bbop.golr.manager.jquery(sd.golr_base(), gconf);

		     // Collect the contents of the input boxes and
		     // fold those into the jumping search manager.
		     var smap = map[question_id];
		     var qid = smap['question_id'];
		     var dc = smap['document_category'];
		     var prs = smap['personality'];
		     var fts = smap['field_translations'];

		     // The primary filters.
		     mgr.set_personality(prs);
		     mgr.add_query_filter('document_category', dc, ['*']);
		     
		     // Unwind the map of names to autocompletes
		     each(fts,
			  function(ft){
			      //var fid = ft['field_id'];
			      var ffield = ft['field_filter'];
			      var ac = ft['manager'];
			      var fc = ac.content();
			      ll('ffield: ' + ffield);
			      ll('iid: ' + ac._interface_id);
			      ll('content: ' + fc);
			      mgr.add_query_filter(ffield, fc);
			  });

		     //alert('clicked: ' + qid);
		     //alert('clicked: ' + mgr.get_query_url());

		     // Jump to that search in AmiGO 2.
		     var state = mgr.get_state_url();
		     var pop = linker.url(encodeURIComponent(state), 'search');
		     window.open(pop, '_blank');
		 });
	 });
    
    // Make unnecessary things roll up.
    //bbop.core.each(["information", "mirrors", "solr_options"],
    //bbop.core.each(["information", "mirrors"],
    bbop.core.each(["information"],
    		   function(eltid){
    		       jQuery('#'+eltid).hide();
    		       var elt = jQuery('#' + eltid + '_click');
    		       elt.click(function(){
    				     jQuery('#'+eltid).toggle("blind",{},250);
    				     return false;
    				 });
    		   });
    
    ll('GrebeInit done.');
}
