#!/usr/bin/env bash

AMIGO="${AMIGO:=1}" 
GOLR="${GOLR:=1}" 

if [ $AMIGO -ne 0 ]; then
   md5sum -c amigo-hash
   GULP_INSTALL=$?
   echo "GULP_INSTALL=$GULP_INSTALL"
   cp ./conf/amigo.yaml.orig ./conf/amigo.yaml
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

      md5sum ./conf/amigo.yaml.orig > amigo-hash
   fi

   echo "Starting the apache2 server with amigo installed"
   /etc/init.d/apache2 start
fi

if [ $GOLR -ne 0 ]; then
   echo "Starting monit which will start the jetty server with Solr installed"
   /etc/init.d/monit start
fi

echo "Starting crond"
/etc/init.d/cron start

cd /srv/amigo
exec "$@"
