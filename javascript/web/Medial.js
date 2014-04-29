////
//// Add extra data/links to searches dealing with single terms.
////

//
function MedialInit(){

    // Logger.
    var logger = new bbop.logger();
    logger.DEBUG = true;
    function ll(str){ logger.kvetch('M: ' + str); }    

    ll('');
    ll('Medial.js');
    ll('MedialInit start...');

    // Only trigger when we've been passed the candidate.
    if( ! global_acc ){
	ll('No candidate--skipping');
    }else{
	
	// Ready the configuration that we'll use.
	var gconf = new bbop.golr.conf(amigo.data.golr);
	var sd = new amigo.data.server();
	var solr_server = sd.golr_base();
	var al = new amigo.linker();

	///
	/// Create a bookmark for searching annotations and
	/// bioentities with this term. Generate links and activate
	/// hidden stubs in the doc.
	///
    
	// Get bookmark for annotations.
	(function(){
	     var man = new bbop.golr.manager.jquery(solr_server, gconf);
	     man.set_personality('annotation');
	     man.add_query_filter('document_category', 'annotation', ['*']);
	     man.add_query_filter('regulates_closure', global_acc);
	     //ll('qurl: ' + man.get_query_url());
	     //var lstate = encodeURIComponent(man.get_state_url());
	     var lstate = man.get_filter_query_string();
	     var lurl = al.url(lstate, 'search', 'annotation');
	     
	     // Add it to the DOM.
	     jQuery('#prob_ann_href').attr('href', lurl);
	     jQuery('#prob_ann').removeClass('hidden');
	 })();
    }
    
	// Get bookmark for annotations.
	(function(){
	     var man = new bbop.golr.manager.jquery(solr_server, gconf);
	     man.set_personality('annotation');
	     man.add_query_filter('document_category', 'annotation', ['*']);
	     man.add_query_filter('regulates_closure', global_acc);
	     //ll('qurl: ' + man.get_query_url());
	     //var lstate = encodeURIComponent(man.get_state_url());
	     var lstate = man.get_filter_query_string();
	     var lurl = al.url(lstate, 'search', 'annotation');
	     
	     // Add it to the DOM.
	     jQuery('#prob_ann_href').attr('href', lurl);
	     jQuery('#prob_ann').removeClass('hidden');
	 })();
    
    // Get bookmark for annotations.
    (function(){
	 var man = new bbop.golr.manager.jquery(solr_server, gconf);
	 man.set_personality('annotation');
	 man.add_query_filter('document_category', 'bioentity', ['*']);
	 man.add_query_filter('regulates_closure', global_acc);
	 //ll('qurl: ' + man.get_query_url());
	 //var lstate = encodeURIComponent(man.get_state_url());
	 var lstate = man.get_filter_query_string();
	 var lurl = al.url(lstate, 'search', 'bioentity');
	 
	 // Add it to the DOM.
	 jQuery('#prob_bio_href').attr('href', lurl);
	 jQuery('#prob_bio').removeClass('hidden');
     })();
    
    //
    ll('MedialInit done.');
}
