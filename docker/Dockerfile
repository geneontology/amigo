####
#### This docker file is trying to run and install AmiGO/GOlr
#### minimally as root on localhost:
####
#### Build (from repo root):
####   docker build -t geneontology/amigo-standalone:latest -t geneontology/amigo-standalone:`git log | head -1 | cut -d ' ' -f 2`_`date +%Y-%m-%dT%H%M%S` docker/amigo-standalone
####
#### To push:
####  docker push geneontology/amigo-standalone:latest
####  docker push geneontology/amigo-standalone:636b4aea877d2585be8d5e2d26f1a59422e43c45_2019-06-05T195931
####
#### Run with ports exposed:
####  docker run -p 8080:8080 -p 9999:9999 -v /tmp/srv-solr-data:/srv/solr/data -t geneontology/amigo-standalone:636b4aea877d2585be8d5e2d26f1a59422e43c45_2019-06-05T195931
####
#### Check on AmiGO and with port exposed:
####  docker run -it -p 9999:9999 -p 8080:8080 -v /tmp/srv-solr-data:/srv/solr/data geneontology/amigo-standalone:636b4aea877d2585be8d5e2d26f1a59422e43c45_2019-06-05T195931 /bin/bash
####

## Grab the latest(?) Ubuntu image.
FROM ubuntu:18.04

## Quiet it down a little bit.
ENV DEBIAN_FRONTEND noninteractive
ENV TERM linux

###
### Packages, repos, and location.
###

## Get the system updated and QoL.
RUN apt-get -qq update && apt-get -qq -y install \
	libterm-readline-gnu-perl apt-utils \
	software-properties-common netcat rsync \
	build-essential wget curl pigz subversion \
	less mg byobu htop iotop di git make kwalify vim \
	libcgi-application-perl \
	libcgi-application-plugin-session-perl \
	libcgi-application-plugin-tt-perl \
	libcgi-application-server-perl \
	libclone-perl libconfig-yaml-perl libdbi-perl \
	libdbd-sqlite3-perl libdbd-mysql-perl \
	libdata-formvalidator-perl libossp-uuid-perl \
	libfile-type-perl libfile-slurp-perl \
	libfreezethaw-perl libgraph-perl libgraphviz-perl \
	libjson-xs-perl liburi-perl libwww-mechanize-perl \
	liburi-encode-perl libxml-libxml-perl libxml-xpath-perl \
	dh-make-perl apache2 openjdk-8-jdk openjdk-8-jre jetty9 \
        monit psmisc logrotate

RUN echo "#!/bin/sh\nexit 0" > /usr/sbin/policy-rc.d \
    && rm -rf /var/log && mkdir -p /var/log
RUN mkdir -p /var/log/apache2/ && chmod -R 744 /var/log/apache2/

## AmiGO weirdness.
ADD docker/libsql-tokenizer-perl_0.24-2_all.deb /tmp/libsql-tokenizer-perl_0.24-2_all.deb
RUN dpkg -i /tmp/libsql-tokenizer-perl_0.24-2_all.deb

## Node.
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs \
    && apt-get -qq purge && apt-get -qq clean && rm -rf /var/lib/apt/lists/*

## Grab the AmiGO/GOlr repo and change context.
RUN mkdir -p /srv
USER root:www-data
# RUN git clone https://github.com/geneontology/amigo.git --branch master --single-branch /srv/amigo
ADD . /srv/amigo
WORKDIR /srv/amigo
# RUN git pull
USER root

###
### Apache.
###

## Get apache setup as a generic worker. Installation grouped above.
RUN a2dismod mpm_event mpm_worker \
    && a2enmod mpm_prefork \
    && a2dismod cgid mpm_event mpm_worker \
    && a2enmod alias mpm_prefork cgi rewrite proxy proxy_http proxy_html macro headers xml2enc

###
### GOlr/Jetty.
###

## GOlr/Jetty setup. Installation grouped above.
RUN cp ./golr/solr/solr.war /var/lib/jetty9/webapps/ \
    && chown jetty /var/lib/jetty9/webapps/solr.war \
    && chgrp adm /var/lib/jetty9/webapps/solr.war \
    && cp ./golr/jetty/jetty /etc/default/jetty9 \
    && mkdir -p /srv/solr/data \
    && mkdir -p /srv/solr/conf \
    && cp ./golr/solr/conf/schema.xml /srv/solr/conf/schema.xml \
    && cp ./golr/solr/conf/solrconfig.xml /srv/solr/conf/solrconfig.xml \
    && chown -R jetty /srv/solr/ \
    && chgrp -R adm /srv/solr/

## Custom runtime locations for jetty9/solr for the Docker environment.
RUN mkdir -p /tmp/jetty9 \
    && chown -R jetty /tmp/jetty9 \
    && chgrp -R adm /tmp/jetty9

###
### AmiGO.
###

## Final Apache setup.
## Get AmiGO docker config into place.
RUN cp ./conf/examples/apache2.18_04.localhost_root.conf /etc/apache2/sites-available/001-inline-amigo.conf \
    && cp /srv/amigo/conf/examples/apache2.ports.conf /etc/apache2/ports.conf \
    && a2ensite 001-inline-amigo \
    && cp ./conf/examples/amigo.yaml.localhost_docker_loader ./conf/amigo.yaml

## AmiGO install.
USER root:www-data
RUN npm install && ./node_modules/.bin/gulp install
USER root

## The root environment seems to do something funny with the perl5
## execution path; modify tp make sure everybody can get at it.
RUN sed -i s,config.pl,/srv/amigo/perl/bin/config.pl,g /srv/amigo/perl/bin/* \
    && sed -i s,config.pl,/srv/amigo/perl/bin/config.pl,g /srv/amigo/perl/lib/AmiGO.pm

###
### Finally.
###

##
EXPOSE 8080 9999
#WORKDIR /usr/share/jetty9

#ADD docker/run-apache-solr.sh /tmp/run-apache-solr.sh
#RUN ["chmod", "+x", "/tmp/run-apache-solr.sh"]
#CMD "/tmp/run-apache-solr.sh"

ENV GOLR_SOLR_MEMORY=4G
COPY ./docker/entrypoint.sh /
COPY ./docker/run-golr.sh /
RUN chmod +x /entrypoint.sh /run-golr.sh && md5sum ./conf/amigo.yaml > amigo-hash
COPY ./docker/java-golr-monit /etc/monit/conf-enabled/java
COPY ./docker/java-golr-monit /etc/monit/conf-enabled/java
COPY ./docker/console-capture-golr.xml /etc/jetty9/console-capture.xml
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["tail", "-f", "/dev/null" ]
