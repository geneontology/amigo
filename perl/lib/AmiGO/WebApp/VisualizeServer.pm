=head1 AmiGO::WebApp::VisualizeServer

...

=cut


package AmiGO::WebApp::VisualizeServer;
use base 'AmiGO::WebApp';

use CGI::Application::Plugin::TT;
use CGI::Application::Plugin::Redirect;

use Data::Dumper;
use AmiGO::GraphViz;
use AmiGO::SVGRewrite;
use AmiGO::Input;
#use AmiGO::Aid;
#use AmiGO::Worker::Subset;
use AmiGO::Worker::Visualize;
use AmiGO::Worker::GOlr::Term;

##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 1;

  $self->mode_param('mode');
  #$self->start_mode('client_amigo');
  $self->start_mode('status');
  $self->error_mode('mode_fatal');
  $self->run_modes(
      ## GUI aspects.
      'status'             => 'mode_local_status',
      'client'             => 'mode_local_status', # placeholder for explanation
      'client_amigo'       => 'mode_client_amigo',
      'client_freeform'    => 'mode_client_freeform',
      ## Image production aspects.
      'quickgo'            => 'mode_quickgo',
      'amigo'              => 'mode_advanced',
      'freeform'           => 'mode_freeform',
      ## OTher handling.
      'AUTOLOAD'           => 'mode_exception'
#		   'subset'       => 'mode_subset',
#		   'single'       => 'mode_single', #TODO:'mode_single',
#		   'multi'              => 'mode_advanced', #TODO: 'mode_multi',
#		   'advanced'           => 'mode_advanced',
		  );
}

###
### Helpers.
###

## If a header is needed, set correct header type for format.
sub _add_fiddly_header {

  my $self = shift;
  my $type = shift || die "need type as arg: $!";
  my $inline_p = shift || die "need inline as arg: $!";

  ## Translate English to perl for bool.
  if( $inline_p eq 'true' ){
    $inline_p = 1;
  }elsif( $inline_p eq 'false' ){
    $inline_p = 0;
  }

  ##
  if( $inline_p ){
    ## If it is inline, we want no headers (raw image feed).
    #$self->header_add( -type => '' );
    $self->header_type('none');
  }else{
    if( $type && ($type eq 'svg' || $type eq 'svg_raw') ){
      $self->header_add( -type => 'image/svg+xml' );
    }elsif( $type && $type eq 'dot' ){
      $self->header_add( -type => 'text/plain' );
    }else{
      $self->header_add( -type => 'image/' . $type );
    }
  }
}


## Example:
sub mode_local_status {
   my $self = shift;
   return $self->mode_status('visualize');
}

## This is just a very thin pass-through client.
## TODO/BUG: not accepting "inline" parameter yet...
sub mode_client_freeform {

  my $self = shift;
  my $output = '';

  $self->{CORE}->kvetch('$self->query(): ' . Dumper($self->query()));

  ##
  my $i = AmiGO::Input->new($self->query());
  #my $params = $i->input_profile('visualize_freeform');
  my $params = $i->input_profile('visualize_client' );
  my $format = $params->{format};
  my $input_graph_data = $params->{graph_data};
  my $input_term_data = $params->{term_data};

  ## Cleanse input data of newlines.
  $input_graph_data =~ s/\n/ /gso;
  $input_term_data =~ s/\n/ /gso;

  $self->{CORE}->kvetch('graph_data: ' . $input_graph_data);

  ## If there is no incoming graph data, display the "client" page.
  ## Otherwise, forward to render app.
  if( ! defined $input_graph_data ){

    my $page_name = 'visualize_freeform';
    my($page_title,
       $page_content_title,
       $page_help_link) = $self->_resolve_page_settings($page_name);
    $self->set_template_parameter('page_name', $page_name);
    $self->set_template_parameter('page_title', $page_title);
    $self->set_template_parameter('page_content_title', $page_content_title);
    $self->set_template_parameter('page_help_link', $page_help_link);
    ## Additional.
    $self->set_template_parameter('amigo_mode', $page_name);

    my $prep =
      {
       css_library =>
       [
	#'standard',
	'com.bootstrap',
	'com.jquery.jqamigo.custom',
	'amigo',
	'bbop'
       ],
       javascript_library =>
       [
	'com.jquery',
	'com.bootstrap',
	'com.jquery-ui'
       ],
       javascript =>
       [
	$self->{JS}->get_lib('GeneralSearchForwarding.js')
       ],
       content =>
       [
	'pages/visualize_freeform.tmpl'
       ]
      };
    $self->add_template_bulk($prep);
    $output = $self->generate_template_page_with();

  }else{

    ## Safely, check to see if the graph JSON is even parsable.
    if( $input_graph_data ){
      if( ! $self->json_parsable_p($input_graph_data) ){
	my $str = 'Your graph JSON was not formatted correctly...';
	return $self->mode_fatal($str);
      }
    }

    ## The same for the term data.
    if( $input_term_data ){
      if( ! $self->json_parsable_p($input_term_data) ){
	my $str = 'Your term JSON was not formatted correctly...';
	return $self->mode_fatal($str);
      }
    }

    ## Decode the incoming graph data--easy!
    my $graph_hash = {};
    if( $input_graph_data ){
      $graph_hash = $self->{JS}->parse_json_data($input_graph_data);
    }

    ## Decode the incoming term data--easy!
    my $term_hash = {};
    if( $input_term_data ){
      $term_hash = $self->{JS}->parse_json_viz_data($input_term_data);
    }

    ## Produce the (possibly empty) image in SVG or PNG.
    my $gv = $self->_freeform_core($format, $graph_hash, $term_hash);
    $output = $self->_produce_appropriate_output($gv, $format);

    ## Get the headers correct.
    $self->_add_fiddly_header($format, 'false');
  }

  return $output;
}

## This is just a very thin pass-through client.
## TODO/BUG: not accepting "inline" parameter yet...
sub mode_client_amigo {

  my $self = shift;
  my $output = '';

  ##
  my $i = AmiGO::Input->new($self->query());
  #my $params = $i->input_profile('visualize_amigo');
  my $params = $i->input_profile('visualize_client');
  my $format = $params->{format};
  my $input_term_data_type = $params->{term_data_type};
  my $input_term_data = $params->{term_data};

  ## Cleanse input data of newlines.
  $input_term_data =~ s/\n/ /gso;

  ## If there is no incoming data, display the "client" page.
  ## Otherwise, forward to render app.
  if( ! defined $input_term_data ){

    ##
    my $page_name = 'visualize';
    my($page_title,
       $page_content_title,
       $page_help_link) = $self->_resolve_page_settings($page_name);
    $self->set_template_parameter('page_name', $page_name);
    $self->set_template_parameter('page_title', $page_title);
    $self->set_template_parameter('page_content_title', $page_content_title);
    $self->set_template_parameter('page_help_link', $page_help_link);
    ## Additional.
    $self->set_template_parameter('amigo_mode', $page_name);

    my $prep =
      {
       css_library =>
       [
	#'standard',
	'com.bootstrap',
	'com.jquery.jqamigo.custom',
	'amigo',
	'bbop'
       ],
       javascript_library =>
       [
	'com.jquery',
	'com.bootstrap',
	'com.jquery-ui'
       ],
       javascript =>
       [
	$self->{JS}->get_lib('GeneralSearchForwarding.js')
       ],
       content =>
       [
	'pages/visualize_amigo.tmpl'
       ]
      };
    $self->add_template_bulk($prep);
    $output = $self->generate_template_page_with();

  }else{

    ## Check to see if this JSON is even parsable...that's really all
    ## that we're doing here.
    if( $input_term_data_type eq 'json' ){
      if( ! $self->json_parsable_p($input_term_data) ){
	my $str = 'Your JSON was not formatted correctly, please go back and retry. Look at the <a href="http://wiki.geneontology.org/index.php/AmiGO_Manual:_Visualize">advanced format</a> documentation for more details.';
	return $self->mode_fatal($str);
      }
    }

    ## TODO: Until I can think of something better...
    if( $format eq 'navi' ){

      ## BETA: Just try and squeeze out whatever I can.
      my $in_terms = $self->{CORE}->clean_term_list($input_term_data);
      my $jump = $self->{CORE}->get_interlink({mode=>'layers_graph',
					       'arg' => {'terms' => $in_terms}});
      return $self->redirect($jump, '302 Found');

    }else{

      ##    # ## BUG: This redirect mechanism seem to be broken for large
      ## input. See: geneontology/amigo#184. Would like to just switch
      ## run modes.
      my $jump = $self->{CORE}->get_interlink({mode=>'visualize_service_amigo',
				       #optional => {url_safe=>1, html_safe=>0},
				       #optional => {html_safe=>0},
				       arg => {
					       format => $format,
					       data_type =>
					       $input_term_data_type,
					       data => $input_term_data,
					      }});
      #$self->{CORE}->kvetch("Jumping to: " . $jump);
      ##
      #$output = $jump;
      return $self->redirect($jump, '302 Found');
    }
  }

  return $output;
}

## Example:
## http://localhost:9999/visualize?mode=quickgo&term=GO:0022008
sub mode_quickgo {

  my $self = shift;
  my $output = '';

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('visualize_single');
  my $inline_p = $params->{inline};
  my $term = $params->{term};

  ##
  my $qg_viz = AmiGO::Worker::Visualize->new($term);

  ##
  $self->_add_fiddly_header('png', $inline_p);

  ##
  my $img = $qg_viz->quickgo() || die "could not get image for quickgo: $!";
  return $img;
}


## Add edges from hash ref to GraphViz object.
sub _add_gv_edges {
  my $self = shift;
  my $gv = shift || die 'need gv object';
  my $all_edges = shift || die 'need all edges object';

  ## Add edges to the visual graph.
  foreach my $eid (keys %$all_edges){
    my $sid = $all_edges->{$eid}{sub};
    my $oid = $all_edges->{$eid}{obj};
    my $pid = $all_edges->{$eid}{pred};
    $gv->add_edge($sid, $pid, $oid);
  }
}

sub _add_gv_nodes {
  my $self = shift;
  my $gv = shift || die 'need gv object';
  my $all_nodes = shift || die 'need all nodes object';
  my $term_hash = shift || {}; # fonts, colors, etc.

  ## Add nodes to the visual graph.
  foreach my $nacc (keys %$all_nodes){
    my $acc = $all_nodes->{$nacc}{acc};
    my $label = $all_nodes->{$nacc}{label};

    my $title = $acc;
    my $body = $label;
    my $border = '';
    my $fill = '';
    my $font = '';
    my $box_width = undef;
    my $box_height = undef;
    # my $node_width = undef;
    # my $node_height = undef;

    ## BUG: this bit is great, except it shouldn't be here--it
    ## should be generated on the "client" side. How should I do
    ## that since this is the client...?  Special section for
    ## jsoned data.
    ## Deal with additional data...
    if( defined $term_hash &&
	defined $term_hash->{$acc} &&
	ref($term_hash->{$acc}) eq 'HASH' ){
      my $data_hash = $term_hash->{$acc};
      $title = $data_hash->{title} if defined $data_hash->{title};
      $body = $data_hash->{body} if defined $data_hash->{body};
      $border = $data_hash->{border} if defined $data_hash->{border};
      $fill = $data_hash->{fill} if defined $data_hash->{fill};
      $font = $data_hash->{font} if defined $data_hash->{font};
      # ($fill, $font) = $aid->pval_to_color($term_hash->{$acc});
      $box_width = $data_hash->{box_width}
	if defined $data_hash->{box_width};
      $box_height = $data_hash->{box_height}
	if defined $data_hash->{box_height};
      # $node_width = $data_hash->{node_width}
      #   if defined $data_hash->{node_width};
      # $node_height = $data_hash->{node_height}
      #   if defined $data_hash->{node_height};
    }

    ## Back to standard adding.
    $gv->add_node($acc, $title, $body,
		  {
		   color => $border,
		   fillcolor => $fill,
		   fontcolor => $font,
		   box_width => $box_width,
		   box_height => $box_height,
		   # node_width => $node_width,
		   # node_height => $node_height,
		  });
    # if( ! $amigo_terms->{$title} ){
    #   $amigo_terms->{$title} = {
    # 			    name => $body,
    # 			    gene_products => {},
    # 			   };
    # }
  }
}

sub _get_format_appropriate_renderer {
  my $self = shift;
  my $format = shift || die 'need format';

  my $gv = undef;
  if( $format &&
      ($format eq 'svg' || $format eq 'svg_raw' || $format eq 'dot') ){
    $gv = AmiGO::GraphViz->new();
  }else{
    $gv = AmiGO::GraphViz->new({bitmap => 1});
  }

  return $gv;
}

## ...
sub _produce_appropriate_output {
  my $self = shift;
  my $gv = shift || die "need graphics object for output";
  my $format = shift || die "need format for output";
  my $amigo_terms = shift || {};

  my $output = undef;
  if( $format && $format eq 'svg' ){
    ## TODO: How old is this? Even used anymore? If eliminated,
    ## amigo_terms could go too.
    my $svg_file = $gv->get_svg();
    my $svg_rewriter = AmiGO::SVGRewrite->new();
    # $svg_rewriter->add_js_variable('amigo_terms', $amigo_terms);
    # $svg_rewriter->add_js_variable('amigo_species_order', []);
    # $svg_rewriter->add_js_library('org.bbop.NodeDetails');
    # $svg_rewriter->add_js_initializer("org.bbop.NodeDetails('detail_context');");
    # $svg_rewriter->add_js_library('org.bbop.Viewer');
    # $svg_rewriter->add_js_initializer("org.bbop.Viewer('rgsvg','tform_matrix');");
    $output = $svg_rewriter->rewrite($svg_file);
  }elsif( $format && $format eq 'svg_raw' ){
    $output = $gv->get_svg();
  }elsif( $format && $format eq 'dot' ){
    $output = $gv->get_dot();
  }else{
    $output = $gv->get_png();
  }

  return $output;
}

## Example:
## http://localhost/cgi-bin/amigo2/visualize?mode=advanced&term_data={"GO:0002244" : 0.00001, "GO:0048856" : 0.5}&format=svg
sub mode_advanced {
  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('visualize_amigo');
  my $inline_p = $params->{inline};
  my $format = $params->{format};
  my $input_term_data_type = $params->{term_data_type};
  my $input_term_data = $params->{term_data};

  # my $aid = AmiGO::Aid->new();
  #$self->{CORE}->kvetch('input: ' . $input_term_data);

  ## Decode the incoming term data, depending on incoming data
  ## type. Completely overwrite the input_term_list if we can using 
  my $term_list = [];
  my $term_hash = {};
  if( $input_term_data_type eq 'string' ){
    $term_list = $self->{CORE}->clean_term_list($input_term_data);
  }else{
    $term_hash = $self->{JS}->parse_json_viz_data($input_term_data);
    #if( defined($input_term_data) &&
    #	scalar(keys %$input_term_data) != 0 ){
    # $input_term_list = [];
    foreach my $itd (keys %$term_hash){
      push @$term_list, $itd;
    }
  }

  ## The term_hash is so useful, even if we came in through a list,
  ## let's minimally populate it.
  if( $self->{CORE}->empty_hash_p($term_hash) ){
    foreach my $tli (@$term_list){
      $term_hash->{$tli} = {};
    }
  }

  ## DEBUG.
  #$self->{CORE}->kvetch(Dumper($term_list));
  #$self->{CORE}->kvetch(Dumper($term_hash));
  $self->{CORE}->kvetch('term_hash: ' . Dumper($term_hash));

  ###
  ### Build graph.
  ###

  ## TODO: (removable?) We'll need the empty amigo_terms later on in
  ## some cases even if there is nothing (example: producing empty
  ## SVG).
  my $amigo_terms = {};

  ## Go through build graph routine only if there is something coming
  ## in on out term_list (which was generated by either direct list or
  ## indirect advanced format).
  my $all_edges = {};
  my $all_nodes = {};
  if( defined($term_list) &&
      scalar(@$term_list) != 0 ){

    ## Get information on all incoming terms.
    my $tinfo = AmiGO::Worker::GOlr::Term->new($term_list);
    my $tinfo_hash = $tinfo->get_info();

    ## Cycle through the info of all of the incoming terms and related
    ## edges.
    foreach my $acc (keys %$tinfo_hash){

      ## Pull out the raw graph info out.
      my $tinfo_item = $tinfo_hash->{$acc};

      ## Error check for "legit" but otherwise currently unresolvable
      ## input. For example, somebody using an alternate id instead of
      ## the canonical one: https://github.com/kltm/amigo/issues/91
      if( ! $tinfo_item ){
	$self->add_mq('error', 'The term ID that you are using '. $acc .' could not be satisfactorily resolved. Please make sure that you are using canonical IDs (rather than synonyms or alternate IDs) when using this tool.');
	die "The term ID that you're using could not be satisfactorily resolved";
      }else{

	$self->{CORE}->kvetch('process term: ' . $acc);

	my $topo_graph_raw = $tinfo_item->{topology_graph_json};
	my $topo_graph = $self->{CORE}->_read_json_string($topo_graph_raw);

	## Also, use the chewable graph as a filter to eliminate excess
	## child nodes from displays.
	my $cgraph = $tinfo_item->{chewable_graph};
	my $children_list = $cgraph->get_children($acc);
	my %children_hash = map { $_ => 1 } @$children_list;
	$self->{CORE}->kvetch('children_hash: ' . Dumper(\%children_hash));

	## Simply process the edges.
	foreach my $edge (@{$topo_graph->{'edges'}}){
	  my $sid = $edge->{'sub'};
	  my $oid = $edge->{'obj'};
	  my $pid = $edge->{'pred'} || '.';
	  ## Filter child rels out.
	  if( $children_hash{$sid} ){
	      $self->{CORE}->kvetch("dropped edge: $sid $pid $oid");
	   }else{
	       $self->{CORE}->kvetch("add edge: $sid $pid $oid");

	       my $vid = $sid . $pid . $oid;
	       $all_edges->{$vid} =
	       {
		   'sub' => $sid,
		   'obj' => $oid,
		   'pred' => $pid,
	       };
	   }
	}

	## A more complicates processing of the nodes.
	foreach my $node (@{$topo_graph->{'nodes'}}){
	  my $acc = $node->{'id'};
	  my $label = $node->{'lbl'};

	  ## Filter child nodes out.
	  if( ! $children_hash{$acc} ){
	    $all_nodes->{$acc} =
	      {
	       'acc' => $acc,
	       'label' => $label
	      };
	    $self->{CORE}->kvetch("node: $acc ($label)");
	  }
	}
      }
    }
  }

  ## Get correct graphics renderer.
  my $gv = $self->_get_format_appropriate_renderer($format);

  ## Assemble the found nodes (including the term hash style/label
  ## info) and edges into the GraphViz graph.
  $self->_add_gv_edges($gv, $all_edges);
  $self->_add_gv_nodes($gv, $all_nodes, $term_hash);

  #$gv->add_legend();

  ## Get the headers correct.
  $self->_add_fiddly_header($format, $inline_p);

  ## Produce the (possibly empty) image in SVG or PNG.
  my $output = $self->_produce_appropriate_output($gv, $format, $amigo_terms);
  return $output;
}

## The main worker in freeform.
## Returns an AmiGO::GraphViz object.
sub _freeform_core {
  my $self = shift;

  ## Core required arguments.
  my $format = shift || die "needs format";
  my $graph_hash = shift || die "needs graph data";
  my $term_hash = shift || undef;

  ## Optional hash arguments.
  my $args = shift || {};
  my $nodes_p = 1;
  my $edges_p = 1;
  $nodes_p = 0 if( defined $args->{nodes} && $args->{nodes} == 0 );
  $edges_p = 0 if( defined $args->{edges} && $args->{edges} == 0 );

  ## Simply process the nodes.
  my $all_nodes = {};
  my $all_edges = {};
  foreach my $node (@{$graph_hash->{'nodes'}}){
    my $acc = $node->{'id'};
    my $label = $node->{'lbl'};
    $all_nodes->{$acc} =
      {
       'acc' => $acc,
       'label' => $label
      };
    $self->{CORE}->kvetch("node: $acc ($label)");
  }

  ## Simply process the edges.
  foreach my $edge (@{$graph_hash->{'edges'}}){
    my $sid = $edge->{'sub'};
    my $oid = $edge->{'obj'};
    my $pid = $edge->{'pred'} || '.';
    my $vid = $sid . $pid . $oid;
    $all_edges->{$vid} =
      {
       'sub' => $sid,
       'obj' => $oid,
       'pred' => $pid,
      };
    $self->{CORE}->kvetch("edge: $sid $pid $oid");
  }

  ## Get correct graphics renderer.
  my $gv = $self->_get_format_appropriate_renderer($format);

  ## Assemble the found nodes (including the term hash style/label
  ## info) and edges into the GraphVix graph.
  $self->_add_gv_edges($gv, $all_edges) if $edges_p;
  $self->_add_gv_nodes($gv, $all_nodes, $term_hash) if $nodes_p;

  #$gv->add_legend();

  return $gv;
}

## Example:
sub mode_freeform {
  my $self = shift;

  ##
  my $i = AmiGO::Input->new($self->query());
  my $params = $i->input_profile('visualize_freeform');
  my $inline_p = $params->{inline};
  my $format = $params->{format};
  my $input_graph_data = $params->{graph_data} || '';
  my $input_term_data = $params->{term_data} || '';

  ## Decode the incoming graph data--easy!
  my $graph_hash = {};
  if( $input_graph_data ){
    $self->{CORE}->kvetch('got graph data');
    $graph_hash = $self->{JS}->parse_json_data($input_graph_data);
  }

  ## Decode the incoming term data--easy!
  my $term_hash = {};
  if( $input_term_data ){
    $self->{CORE}->kvetch('got term data');
    $term_hash = $self->{JS}->parse_json_viz_data($input_term_data);
  }

  ## Produce the (possibly empty) image in SVG or PNG.
  my $gv = $self->_freeform_core($format, $graph_hash, $term_hash);
  my $output = $self->_produce_appropriate_output($gv, $format);

  ## Get the headers correct.
  $self->_add_fiddly_header($format, $inline_p);

  return $output;
}

###
###
###

## Last called before the lights go out.
sub teardown {
  my $self = shift;

  # Disconnect when we're done, (Although DBI usually does this automatically)
  #$self->dbh->disconnect();
}



1;
