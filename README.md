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

# Releases

The SOP for releases is:

* `npm install`
* `gulp release`
* `cd javascript/npm/amigo2-instance-data/ && gulp release && cd ../bbop-widget-set && gulp release && cd ../../..`
* `git commit -a -m "SOP update for metadata"`
* `git push`
