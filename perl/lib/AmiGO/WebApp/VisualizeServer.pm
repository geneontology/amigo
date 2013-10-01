=head1 AmiGO::WebApp::VisualizeServer

...

=cut


package AmiGO::WebApp::VisualizeServer;
use base 'AmiGO::WebApp';

use CGI::Application::Plugin::TT;
use Data::Dumper;
use AmiGO::GraphViz;
use AmiGO::SVGRewrite;
use AmiGO::WebApp::Input;
#use AmiGO::Aid;
#use AmiGO::Worker::Subset;
use AmiGO::Worker::Visualize;
use AmiGO::Worker::GOlr::Term;
#use AmiGO::Worker::GOlr::ComplexAnnotationUnit;
use AmiGO::Worker::GOlr::ComplexAnnotationGroup;

##
sub setup {

  my $self = shift;

  $self->{STATELESS} = 1;

  $self->mode_param('mode');
  $self->start_mode('status');
  $self->error_mode('mode_fatal');
  $self->run_modes(
		   'quickgo'            => 'mode_quickgo', #TODO: fold into ...?
#		   'subset'       => 'mode_subset',
#		   'single'       => 'mode_single',
		   'basic'              => 'mode_advanced', #TODO:'mode_single',
		   'multi'              => 'mode_advanced', #TODO: 'mode_multi',
		   'advanced'           => 'mode_advanced',
		   'freeform'           => 'mode_freeform',
		   'complex_annotation' => 'mode_complex_annotation',
		   'status'             => 'mode_local_status',
		   'AUTOLOAD'           => 'mode_exception'
		  );
}


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
   return $self->mode_status('visualize server');
}

## Example:
## http://localhost/cgi-bin/amigo/visualize?mode=quickgo&term=GO:0048856
sub mode_quickgo {

  my $self = shift;
  my $output = '';

  ##
  my $i = AmiGO::WebApp::Input->new();
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
    $svg_rewriter->add_js_variable('amigo_terms', $amigo_terms);
    $svg_rewriter->add_js_variable('amigo_species_order', []);
    $svg_rewriter->add_js_library('org.bbop.NodeDetails');
    $svg_rewriter->add_js_initializer("org.bbop.NodeDetails('detail_context');");
    $svg_rewriter->add_js_library('org.bbop.Viewer');
    $svg_rewriter->add_js_initializer("org.bbop.Viewer('rgsvg','tform_matrix');");
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
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('visualize');
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
      my $topo_graph_raw = $tinfo_item->{topology_graph_json};
      my $topo_graph = $self->{CORE}->_read_json_string($topo_graph_raw);

      ## Also, use the chewable graph as a filter to eliminate excess
      ## child nodes from displays.
      my $cgraph = $tinfo_item->{chewable_graph};
      my $children_list = $cgraph->get_children($acc);
      my %children_hash = map { $_ => 1 } @$children_list;
      $self->{CORE}->kvetch(Dumper(\%children_hash));
      $self->{CORE}->kvetch(Dumper($term_hash));

      ## Simply process the edges.
      foreach my $edge (@{$topo_graph->{'edges'}}){
	my $sid = $edge->{'sub'};
	my $oid = $edge->{'obj'};
	my $pid = $edge->{'pred'} || '.';
	## Filter child rels out.
	if( ! $children_hash->{$sid} && ! $term_hash->{$oid} ){
	  my $vid = $sid . $pid . $oid;
	  $all_edges->{$vid} =
	    {
	     'sub' => $sid,
	     'obj' => $oid,
	     'pred' => $pid,
	    };
	  $self->{CORE}->kvetch("edge: $sid $pid $oid");
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

  ## Get correct graphics renderer.
  my $gv = $self->_get_format_appropriate_renderer($format);

  ## Assemble the found nodes (including the term hash style/label
  ## info) and edges into the GraphVix graph.
  $self->_add_gv_edges($gv, $all_edges);
  $self->_add_gv_nodes($gv, $all_nodes, $term_hash);

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

  return $gv;
}

## Example:
sub mode_freeform {
  my $self = shift;

  ##
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('visualize_freeform');
  my $inline_p = $params->{inline};
  my $format = $params->{format};
  my $input_graph_data = $params->{graph_data} || '';
  my $input_term_data = $params->{term_data} || '';

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
  my $output = $self->_produce_appropriate_output($gv, $format);

  ## Get the headers correct.
  $self->_add_fiddly_header($format, $inline_p);

  return $output;
}

## Example:
sub mode_complex_annotation {
  my $self = shift;

  ##
  my $i = AmiGO::WebApp::Input->new();
  my $params = $i->input_profile('visualize_complex_annotation');
  my $inline_p = $params->{inline};
  my $format = $params->{format};
  ## Harder argument.
  $params->{complex_annotation} = $self->param('complex_annotation')
    if ! $params->{complex_annotation} && $self->param('complex_annotation');
  my $input_id = $params->{complex_annotation};

  ## Input sanity check.
  if( ! $input_id ){
    return $self->mode_fatal("No input complex annotation id argument.");
  }

  ###
  ### Get full info.
  ###

  ## Get the data from the store.
  #my $ca_worker = AmiGO::Worker::GOlr::ComplexAnnotationUnit->new($input_id);
  my $ca_worker = AmiGO::Worker::GOlr::ComplexAnnotationGroup->new($input_id);
  my $ca_info_hash = $ca_worker->get_info();

  ## First make sure that things are defined.
  if( ! defined($ca_info_hash) ||
      $self->{CORE}->empty_hash_p($ca_info_hash) ||
      ! defined($ca_info_hash->{$input_id}) ){
    return $self->mode_not_found($input_id,
				 'complex annotation');
  }

  ###
  ### Sort out the graph jimmied out of the GOlr/Worker.
  ###

  ## Unit we get topo and style separated, reduce the graph ourselves.
  my $multi_json_str = $ca_info_hash->{$input_id}{topology_graph_json};
  my $multi_json = $self->{CORE}->_read_json_string($multi_json_str);

  ## Unwind out given graph into a simpler form.
  my $graph_hash = {'nodes'=>[], 'edges'=>[]};
  #my $term_hash = {};
  my $stacked_node_hash = {};
  my $nodes = $multi_json->{nodes};
  foreach my $node (@$nodes){

    my $nid = $node->{id};
    my $nlbl = $node->{lbl} || '???';

    my $enby = '';
    my $unk = [];
    my $actv = '';
    my $proc = '';
    my $loc = [];
    if( $node->{meta} ){
      $enby = $node->{meta}{enabled_by} if $node->{meta}{enabled_by};
      $unk = $node->{meta}{unknown} if $node->{meta}{unknown};
      $actv = $node->{meta}{activity} if $node->{meta}{activity};
      $proc = $node->{meta}{process} if $node->{meta}{process};
      $loc = $node->{meta}{location} if $node->{meta}{location};
    }

    push @{$graph_hash->{nodes}},
      {
       'id' => $nid,
       #'lbl' => $nlbl,
      };

    # $term_hash->{$nid} =
    #   {
    #    #'title' => $nlbl,
    #    'title' => $enby,
    #    #'body' => '<HTML>' . join('<BR>', @{[$enby, $actv]}) . '</HTML>'
    #    'body' => join(" ", @{['e:'.$enby, 'a:'.$actv, 'p:'.$proc,
    # 			      'l'.join(":", @$loc)]})
    #    #'body' => $actv
    #   };

    my $stack = [];
    push @$stack, {
		  'color' => 'white',
		  'field' => 'enabled by',
		  'label' => $enby
		 } if $enby;
    push @$stack, {
		  'color' => 'lightblue',
		  'field' => 'activity',
		  'label' => $actv
		 } if $actv;
    foreach my $u (@$unk){
      push @$stack, {
		     'color' => 'lavenderblush',
		     'field' => 'unknown',
		     'label' => $u
		    };
    }
    push @$stack, {
		  'color' => 'coral2',
		  'field' => 'process',
		  'label' => $proc
		 } if $proc;
    foreach my $l (@$loc){
      push @$stack, {
		     'color' => 'yellow',
		     'field' => 'location',
		     'label' => $l
		    };
    }

    $stacked_node_hash->{$nid} =
      {
       'id' => $nid,
       'stack' => $stack
      };
  }
  $self->{CORE}->kvetch('nodes added: ' . scalar(@$nodes));

  my $edges = $multi_json->{edges};
  foreach my $edge (@$edges){
    my $sub = $edge->{sub};
    my $obj = $edge->{obj};
    my $pred = $edge->{pred} || '';
    push @{$graph_hash->{edges}},
      {
       # BUG
       #'sub'=> $sub,
       #'obj'=> $obj,
       'obj'=> $sub,
       'sub'=> $obj,
       'pred'=> $pred,
      };
  }

  ## Produce the edges part of the image using the freeform core.
  #my $gv = $self->_freeform_core($format, $graph_hash, $term_hash, {nodes=>0});
  my $gv = $self->_freeform_core($format, $graph_hash, {}, {nodes=>0});

  ## Do our own stacked nodes for the nodes.
  foreach my $snid (keys %$stacked_node_hash){
    my $stacked_node = $stacked_node_hash->{$snid};
    my $id = $stacked_node->{id};
    my $stack = $stacked_node->{stack};
    $gv->add_complex_node($id, $stack);
  }

  ## Produce output and get the headers correct.
  my $output = $self->_produce_appropriate_output($gv, $format);
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
