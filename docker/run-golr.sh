#!/usr/bin/env bash

SOLR_MEM=${GOLR_SOLR_MEMORY:="4G"}

killall java
echo "Starting the jetty server with Solr installed ($SOLR_MEM)"
mkdir -p /var/log/jetty9
cd /usr/share/jetty9
java -Xms$SOLR_MEM -Xmx$SOLR_MEM -DentityExpansionLimit=8172000 -Djava.awt.headless=true -Dsolr.solr.home=/srv/solr -Djava.io.tmpdir=/tmp/jetty9 -Djava.library.path=/usr/lib -Djetty.home=/usr/share/jetty9 -Djetty.state=/tmp/jetty.state -Djetty.http.host=0.0.0.0 -Djetty.http.port=8080 -jar /usr/share/jetty9/start.jar --daemon /etc/jetty9/jetty-started.xml /etc/jetty9/console-capture.xml &
