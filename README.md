# Overview

  This README file will be filled out more in the future. However, for
  the time being, please see the
  [AmiGO 2 Manual](http://wiki.geneontology.org/index.php/AmiGO_2_Manual)
  for more details about the code and installation. You may also be
  interested in the related information found in
  [BBOP JS](https://github.com/berkeleybop/bbop-js).

# Installation

The main installation information is available
[on the wiki](http://wiki.geneontology.org/index.php/AmiGO_2_Manual:_Installation).

# Provisioning & Orchestration

See [docs](provision/production/PRODUCTION_PROVISION_README.md).

# Jenkins (example)

## Loading

This is a load example using
[this configuration](https://github.com/geneontology/amigo/blob/master/conf/examples/amigo.yaml.tomodachi).

```bash
## Get to the app home and make sure we're in the right place.
cd /home/bbop/local/src/git/amigo
git reset --hard && git pull

## Get the environment and variables ready.
npm install
cp conf/examples/amigo.yaml.tomodachi conf/amigo.yaml
## Need to generate config.pl
./node_modules/.bin/gulp install

## Do the load.
./node_modules/.bin/gulp message-load-start
/bin/rm -f /tmp/golr_timestamp.log
./node_modules/.bin/gulp golr-purge
./node_modules/.bin/gulp check-ontology-data
./node_modules/.bin/gulp load-all
./node_modules/.bin/gulp message-load-clear
```

## Deployment & Unit Tests

This is an example automatic deployment and unit/app testing using
[this configuration](https://github.com/geneontology/amigo/blob/master/conf/examples/amigo.yaml.tomodachi).

```bash
## I believe Xvfb should die on shell exit?
Xvfb :1 -screen 5 1024x768x8 &

## Get to the app home and make sure we're in the right place.
cd /home/bbop/local/src/git/amigo
git pull && git reset --hard

## Get the environment and variables ready.
npm install
cp conf/examples/amigo.yaml.tomodachi conf/amigo.yaml
## Need to generate config.pl
./node_modules/.bin/gulp install

## Make the proper python virtualenv setup with the libs we need.
cd test-app/behave
virtualenv `pwd`
source bin/activate
pip install selenium behave jsonpath-rw
## Get back to top.
cd ../..

## Run unit tests against AmiGO labs (master).
DISPLAY=:1.5 ./node_modules/.bin/gulp tests

## Pop out of our wonderland.
deactivate
```

# Releases (legacy setups)

The SOP for a metadata release; i.e. new npm packages is:

* `npm install`
* `gulp release`
* `cd javascript/npm/amigo2-instance-data/ && gulp release && cd ../bbop-widget-set && gulp release && cd ../../..`
* `git commit -a -m "SOP update for metadata"`
* `git push`

# Releases (docker; WIP)

The SOP for a metadata release; i.e. new npm packages is:

* [ Get geneontology/amigo-standalone running; might be easiest to just give it a small index and invade]
* `docker ps`
* `docker exec -u 0 -it whatever_name /bin/bash`
* `root@amigo:/srv/amigo# git reset --hard && git pull`
* `root@amigo:/srv/amigo# npm install`
* `root@amigo:/srv/amigo# cp conf/examples/amigo.yaml.public conf/amigo.yaml`
* `root@amigo:/srv/amigo# mg conf/amigo.yaml`
* [ fix metadata paths to '/srv/amigo' ]
* `./node_modules/.bin/gulp install`
* `./node_modules/.bin/gulp release`
* `cd javascript/npm/amigo2-instance-data/`
* `/srv/amigo/node_modules/.bin/gulp release`
* `cd ../bbop-widget-set && npm install gulp-mocha`
* `/srv/amigo/node_modules/.bin/gulp release`
* `cd ../../..`

The last step there errors out for various "Error: auth required for publishing" reasons, obviously.
WIP items:

* TODO: outline how to add npm auth
* TODO: outline what to do with the package.json files (need GH auth)
* TODO: outline outline what to do is the package-lock.json files get updated
