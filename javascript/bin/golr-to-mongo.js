/*  
 * Package: golr-to-mongo.js
 * 
 * This is a NodeJS script, using the require environment.
 * 
 * Get the ids and labels of the children of the specified term.
 * 
 * Usage like:
 *  : npm install mongodb
 *  : npm install bbop
 *  : npm install amigo2
 *  : node golr-to-mongo.js annotation
 *  : node golr-to-mongo.js ontology_class
 * 
 */

var bbop = require('bbop').bbop;
var amigo = require('amigo2').amigo;
var mc = require('mongodb').MongoClient;

// Aliases.
var each = bbop.core.each;
var what_is = bbop.core.what_is;
var is_defined = bbop.core.is_defined;

// Logger.
var logger = new bbop.logger();
logger.DEBUG = true;
function _ll(str){ logger.kvetch('g2m: ' + str); }

// User variables.
var golr_location = 'http://localhost:8080/solr/';
var golr_page_size = 1000;
var golr_field_blacklist = { // fields we will not port
  'phylo_graph_json': true
};
//var golr_location = 'http://localhost:8080/solr/';
var mongo_dbname = 'amigo';
var mongo_location = 'mongodb://127.0.0.1:27017/' + mongo_dbname;

// Check our args from the outside world.
//var term_acc = 'GO:0022008';
var golr_dcat_target = process.argv[2] || null;
if( ! golr_dcat_target ){
    _ll('no proper argument');
    process.kill();
}
_ll('doc type arg: ' + golr_dcat_target);

// Define and ready the GOlr manager.
var gconf = new bbop.golr.conf(amigo.data.golr);
var go = new bbop.golr.manager.nodejs(golr_location, gconf);
go.set_facet_limit(0); // no facets needed here
go.add_query_filter('document_category', golr_dcat_target, ['*']);

// Will get defined on connection to the MongoDB.
var mdb = null;
var mcoll = null;

// Flow control variables.
var done_paging_p = false;
var num_pages_done = 0;
var num_inserts_done = 0;

// Rexexp to match JSON blobs.
var json_blob_field_re = /_json$/;

// Define what we do when our (async) information comes back.
function golr_iter(resp){
    num_pages_done++;

    _ll('GOlr iter; total: ' + resp.total_documents() + ', ' +
	'start: ' + resp.start_document() + ', ' +
	'end: ' + resp.end_document() + ', ' + 
	'page: ' + num_pages_done);

    // Load the docs that we have so far.
    _insert_into_mongo(resp);

    // Now check to see if we need to keep going.
    if( resp.paging_p() && resp.paging_next_p() ){
	go.page_next();
    }else{
	_ll('no more paging');
	done_paging_p = true;
    }
}

function _process_solr_doc(in_doc){
    var out_doc = {};

    // For each return doc...
    each(in_doc,
	 function(field, value){

	     // Filter out things we don't want from the blacklist.
	     if( golr_field_blacklist[field] ){
		 // Skipped.
	     }else if( is_defined(value) && json_blob_field_re.test(field) ){
		 // Try and convert JSON strings and lists to actual
		 // objects.
		 try {
		     if( what_is(value) == 'string' ){ // a single string?
			 var deblobbed = JSON.parse(value);
			 out_doc[field] = deblobbed;
		     }else{ // or a list then
			 var list = [];
			 each(value,
			      function(val){
				  list.push = JSON.parse(val);
			      });
			 out_doc[field] = list;
		     }
		 } catch (x) {
		     //_ll('converted field: ' + field);
		     throw new Error('die on bad field (' +
				     field + '): ' + value + '; for ' +
				     in_doc['id']);
		 }
		 //_ll('converted field: ' + field);
	     }else{
		 // Otherwise, just pass the stuff through.
		 out_doc[field] = value; 
	     }
	 });

    return out_doc;
}

function _insert_into_mongo(resp){

    //_ll('insert a bunch of docs');

    var solr_docs = resp.documents();

    // Process the docs, turning "blob" fields into the real deal.
    // TODO: Check to see if it is a blacklisted field.
    var processed_solr_docs = [];
    each(solr_docs,
	 function(solr_doc){
	     processed_solr_docs.push(_process_solr_doc(solr_doc));
	 });

    // Insert the processed version.
    mcoll.insert(processed_solr_docs,
		 function(err, docs){
		     num_inserts_done++;

		     // Post insert action: log our current count and
		     // test to see if we're done.
		     mcoll.count(function(err, count){
				     _ll("MonGO; total inserts: " + count);

				     // Close the database connection
				     // when we have wrapped up.
				     if( done_paging_p &&
					 num_pages_done == num_inserts_done ){
					     _ll("closing mongodb connection");
					     mdb.close();
					 }		 
				 });
		     
		 });
}

function _on_mongodb_connect(err, db){
    if(err) throw err;

    _ll('mongodb connect');
    mdb = db; // finally defined the db connection
    mcoll = db.collection(golr_dcat_target);
    _ll('mongodb pre-clean (' + golr_dcat_target + ')');
    mcoll.remove(_on_mongodb_clear);
}

function _on_mongodb_clear(err){
    if(err) throw err;

    _ll('mongodb cleaned (' + golr_dcat_target + ')');
    // MongoDB is clean and ready, so bind and
    // trigger the start of this.
    go.register('search', 'do', golr_iter);
    //go.update('search');
    go.page(golr_page_size, 0);    
}

// Start all of the above by trying to connect to the MongoDB.
mc.connect(mongo_location, _on_mongodb_connect);
