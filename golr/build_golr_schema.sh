#!/bin/sh

~/git/OWLTools-GO-svn/bin/owltools -solr-config ~/git/amigo/metadata/ont-config.yaml ~/git/amigo/metadata/bio-config.yaml ~/git/amigo/metadata/ann-config.yaml ~/git/amigo/metadata/ann_ev_agg-config.yaml -solr-schema-dump > ~/git/amigo/golr/solr/conf/2-schema.xml
