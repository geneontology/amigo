FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive
ENV TERM linux

RUN apt-get update

RUN apt-get -y install less htop git make
RUN apt-get -y install libterm-readline-gnu-perl
RUN apt-get -y install apt-utils
RUN apt-get -y install software-properties-common
RUN apt-get -y install openjdk-8-jre openjdk-8-jdk

# Node
RUN apt-get -y install build-essential curl
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs

WORKDIR /srv
RUN git clone https://github.com/geneontology/amigo.git --branch docker-loading-service
WORKDIR /srv/amigo

RUN npm install
RUN npm install gulp
RUN cp conf/examples/amigo.yaml.docker-service conf/amigo.yaml

CMD ./node_modules/.bin/gulp load-ontology
