package org.bbop.evaggxform;

//import org.slf4j.impl.StaticLoggerBinder;
import org.apache.log4j.Logger;
import org.apache.log4j.Level;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.SolrInputDocument;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.CommonsHttpSolrServer;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.SolrPingResponse;


class EvAggXFormRun {

	private static Logger LOG = Logger.getLogger(EvAggXFormRun.class);
	private static String url = "http://skewer.lbl.gov:8080/solr/";
	private static int batch_size = 1000;

	public static void main(String [] args) throws Exception{		
		
		SolrServer server = new CommonsHttpSolrServer(url);

		SolrPingResponse pr = server.ping();
		LOG.info("Status: " + pr.getStatus());	

	    SolrQuery query = new SolrQuery();
	    query.setRows(batch_size);
	    query.setQuery( "document_category:annotation_aggregate*" );
	    
	    QueryResponse rsp = server.query( query );
	    SolrDocumentList docs = rsp.getResults();

	    long found_n = docs.getNumFound();
	    LOG.info("found: " + found_n);
	    LOG.info("start: " + docs.getStart());
	    LOG.info("size: " + docs.size());

	    int offset_n = 0;
	    int processed_n = 1;
	    while( offset_n < found_n ){

		    query.setStart(offset_n);

	    	for( SolrDocument doc : server.query(query).getResults() ){

	    		String in_id = (String) doc.getFieldValue("id");
	    		
	    		// Get the munged GO id.
	    		String[] split_str = in_id.split("\\^\\^\\^");
	    		String go_acc = split_str[1];
	    		LOG.info("(" + processed_n + "/" + found_n + "): " + go_acc + ", with: " + doc.size());

	    		// Create new doc for replacing the old one.
	    		// Start by copying all the elements of the old doc over.
	    		SolrInputDocument new_doc = new SolrInputDocument();
	    		for( String field_name : doc.getFieldNames() ){
	    			Object field_vals = doc.getFieldValues(field_name);
	    			new_doc.setField(field_name, field_vals);
	    		}
	    		// Make sure we don't clobber our old ids.
	    		String new_id = "retry^^^" + in_id;
	    		new_doc.setField("id", new_id);
	    		// Now add our new alternate_id field.
	    		new_doc.setField("alternate_id", go_acc);
	    		//LOG.info("new doc with: " + new_doc.size());
	    		
	    		// Add the new doc.
	    		server.add(new_doc);
	    		
	    		// Increment; see above.
	    		processed_n++;
	        }
	    	
	    	// Commit in chunks of slice size and increment.
    		LOG.info("Commit batch of: " + batch_size);
	    	server.commit();
	    	offset_n += batch_size;
	    }
	    
	    // Final optimize process.
		LOG.info("Final optimize...");
	    server.optimize();
		LOG.info("Done!");
	}
}
