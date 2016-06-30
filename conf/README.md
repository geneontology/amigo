# Overview

## AmiGO configuration example (amigo.yaml)

Found in examples/

* amigo.yaml.jenkins-production-test
<br>Used for periodically testing the production machine from the development Jenkins machines.
* amigo.yaml.localhost
<br>Used for local-only development of GO AmiGO instances.
* amigo.yaml.localhost-monarch
<br>Used for local-only development of Monarch AmiGO instances.
* amigo.yaml.localhost-planteome
<br>Used for local-only development of Planteome AmiGO instances.
* amigo.yaml.nakama
<br>Used for deployment and testing of BBOP's "branch/production" instance of AmiGO.
* amigo.yaml.noctua
<br> Used for deployment of GOlr (and AmiGO, for testing) of NEO for use with Noctua.
* amigo.yaml.production
<br> The closest possible amigo.yaml to what is run on the production site; used by developers to communicate desired changes to the production configuration.
* amigo.yaml.public
  ??? Likely an unnecessary addition that was initially added to capture the same information in amigo.yaml.production.
* amigo.yaml.tomodachi
<br>Used for deployment and testing of BBOP's "master" instance of AmiGO.

## Apache

amigo2-apache.conf is an example Apache 2 configuration for a fairly
standard AmiGO 2 setup.
