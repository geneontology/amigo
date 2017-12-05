# FROM ubuntu:16.04
#
# RUN apt-get update
# RUN apt-get -yu install jetty
#
# WORKDIR /golr
# ADD . /golr
#
# WORKDIR /golr/bin
# RUN wget http://skyhook.berkeleybop.org/snapshot/bin/owltools
# ENV PATH=${PATH}:$(pwd)
#
# WORKDIR /golr/lib
# RUN wget http://apache.cs.utah.edu/lucene/solr/3.6.0/apache-solr-3.6.0.tgz
# RUN tar -xvf apache-solr-3.6.0.tgz

####
#### This docker file is trying to run and install AmiGO/GOlr
#### minimally as root on localhost.
####
#### Build image with playbooks from this directory:
####  docker build --tag geneontology/golr:`date +%Y-%m-%dT%H%M%S` --file /home/sjcarbon/local/src/git/operations/docker/Dockerfile.golr_manual /home/sjcarbon/local/src/git/operations
#### Ways of pushing:
####  docker push geneontology/golr:2017-08-22T134812
####  docker push geneontology/golr:master
#### Run in foreground with external access @19999:
####  docker run -p 19999:8080 -v /tmp/srv-solr-data:/srv/solr/data geneontology/golr:2017-08-22T134812
#### Run and connect into image with shell:
####  docker run -t -v /tmp/srv-solr-data:/srv/solr/data -i geneontology/golr:2017-08-22T134812 /bin/bash
####

## Grab the latest(?) Ubuntu image.
FROM ubuntu:16.04

## Quiet it down a little bit.
ENV DEBIAN_FRONTEND noninteractive
ENV TERM linux

## Get the system updated.
RUN apt-get update
#RUN apt-get -y dist-upgrade
## Small "repairs" for sanity.
RUN apt-get -y install libterm-readline-gnu-perl
RUN apt-get -y install apt-utils
RUN apt-get -y install software-properties-common

## Sanity packages.
RUN apt-get -y install less mg byobu htop iotop di git make kwalify

## Node.
RUN apt-get -y install build-essential curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs

## Grab the AmiGO/GOlr repo and change context.
RUN mkdir -p /srv
RUN git clone https://github.com/geneontology/amigo.git --branch master --single-branch /srv/amigo
WORKDIR /srv/amigo
RUN git pull

## GOlr/Jetty setup.
RUN apt-get -y install jetty9
RUN cp ./golr/solr/solr.war /var/lib/jetty9/webapps/
RUN chown jetty /var/lib/jetty9/webapps/solr.war
RUN chgrp adm /var/lib/jetty9/webapps/solr.war
RUN cp ./golr/jetty/jetty /etc/default/jetty9
RUN mkdir -p /srv/solr/data
RUN mkdir -p /srv/solr/conf
RUN cp ./golr/solr/conf/schema.xml /srv/solr/conf/schema.xml
RUN cp ./golr/solr/conf/solrconfig.xml /srv/solr/conf/solrconfig.xml
RUN chown -R jetty /srv/solr/
RUN chgrp -R adm /srv/solr/

## Custom runtime locations for jetty9/solr for the Docker environment.
RUN mkdir -p /tmp/jetty9
RUN chown -R jetty /tmp/jetty9
RUN chgrp -R adm /tmp/jetty9

##
EXPOSE 8080
WORKDIR /usr/share/jetty9
##
RUN java -Xmx3g -Djava.awt.headless=true -Dsolr.solr.home=/srv/solr -Djava.io.tmpdir=/tmp/jetty9 -Djava.library.path=/usr/lib -Djetty.home=/usr/share/jetty9 -Djetty.logs=/var/log/jetty9 -Djetty.state=/tmp/jetty.state -Djetty.host=0.0.0.0 -Djetty.port=8080 -jar /usr/share/jetty9/start.jar --daemon etc/jetty-logging.xml etc/jetty-started.xml
#
# WORKDIR /srv/amigo
#
# RUN npm install
# RUN npm install gulp
# RUN cp /srv/amigo/conf/examples/amigo.yaml.docker /srv/amigo/conf/amigo.yaml
#
# CMD ./node_modules/.bin/gulp load-ontology
