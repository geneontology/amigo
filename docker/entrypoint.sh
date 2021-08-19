#!/usr/bin/env bash

###
### AmiGO on Apache first.
###

if [ $GULP_INSTALL -eq 1 ]; then
   cp ./conf/examples/amigo.yaml.localhost_docker_loader ./conf/amigo.yaml
   npm install
   ./node_modules/.bin/gulp install

   for f in `ls /srv/amigo/perl/bin/*`
   do
     grep /srv/amigo/perl/bin/config.pl $f > /dev/null
     if [ $? -ne 0 ]; then
        sed -i s,config.pl,/srv/amigo/perl/bin/config.pl,g $f
     fi
   done

   grep /srv/amigo/perl/bin/config.pl /srv/amigo/perl/lib/AmiGO.pm > /dev/null
   if [ $? -ne 0 ]; then
      sed -i s,config.pl,/srv/amigo/perl/bin/config.pl,g /srv/amigo/perl/lib/AmiGO.pm
   fi
fi

echo "Starting the apache2 server with amigo installed"
cd /srv/amigo
/etc/init.d/apache2 start

echo "Launched, waiting for server response"

COUNTER=0
while ! nc -z localhost 9999; do
  echo "Not found on 9999, rechecking after 2 sec"
  sleep 2 # wait for 1 second before check again
  COUNTER=$((COUNTER + 1))

  if [ $COUNTER -gt 10 ]
  then
      echo "Something is wrong, exiting"
      exit 1 ;
  fi
done

echo "Server found on 9999"

SOLR_MEM=${GOLR_SOLR_MEMORY:="4G"}

echo "Starting the jetty server with Solr installed ($SOLR_MEM)"
cd /usr/share/jetty9
java -Xms$SOLR_MEM -Xmx$SOLR_MEM -DentityExpansionLimit=8172000 -Djava.awt.headless=true -Dsolr.solr.home=/srv/solr -Djava.io.tmpdir=/tmp/jetty9 -Djava.library.path=/usr/lib -Djetty.home=/usr/share/jetty9 -Djetty.logs=/var/log/jetty9 -Djetty.state=/tmp/jetty.state -Djetty.host=0.0.0.0 -Djetty.port=8080 -jar /usr/share/jetty9/start.jar --daemon /etc/jetty9/jetty-started.xml &

cd /srv/amigo
exec "$@"
