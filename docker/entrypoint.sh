#!/usr/bin/env bash

###
### AmiGO on Apache first.
###

AMIGO="${AMIGO:=1}" 
GOLR="${GOLR:=1}" 

if [ $AMIGO -ne 0 ]; then
   md5sum -c amigo-hash
   GULP_INSTALL=$?
   echo "GULP_INSTALL=$GULP_INSTALL"
   if [ $GULP_INSTALL -ne 0 ]; then
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

      md5sum ./conf/amigo.yaml > amigo-hash
   fi

   echo "Starting the apache2 server with amigo installed"
   /etc/init.d/apache2 start
   sleep 1
   /etc/init.d/apache2 status
fi

if [ $GOLR -ne 0 ]; then
   SOLR_MEM=${GOLR_SOLR_MEMORY:="4G"}

   echo "Starting the jetty server with Solr installed ($SOLR_MEM)"
   cd /usr/share/jetty9
   java -Xms$SOLR_MEM -Xmx$SOLR_MEM -DentityExpansionLimit=8172000 -Djava.awt.headless=true -Dsolr.solr.home=/srv/solr -Djava.io.tmpdir=/tmp/jetty9 -Djava.library.path=/usr/lib -Djetty.home=/usr/share/jetty9 -Djetty.logs=/var/log/jetty9 -Djetty.state=/tmp/jetty.state -Djetty.host=0.0.0.0 -Djetty.port=8080 -jar /usr/share/jetty9/start.jar --daemon /etc/jetty9/jetty-started.xml &
fi

cd /srv/amigo
exec "$@"
