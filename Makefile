####
#### Testing and release procedures for AmiGO JS.
####
#### A report-mistakes-only testing run can be done as:
####   make test | grep -i fail
####

METADATA ?= $(wildcard metadata/*.yaml)
JS ?= rhino # or smjs
JSFLAGS ?= -opt -1
#JSENGINES = node smjs rhino
BBOP_JS ?= ../bbop-js/
TESTS = $(wildcard javascript/lib/amigo/*.js.tests) \
 $(wildcard javascript/lib/amigo/data/*.js.tests) \
 $(wildcard javascript/lib/amigo/ui/*.js.tests) \
 $(wildcard javascript/lib/amigo/handler/*.js.tests)
#BENCHMARKS = $(wildcard _benchmark/*.js)

all:
	@echo "Default JS engine: $(JS)"
	@echo "See: http://wiki.geneontology.org/index.php/AmiGO_Manual:_Installation_2.0"
	@echo "for more details."
#	@echo "All JS engines: $(JSENGINES)"
#	@echo "Try make: 'test', 'docs', 'install', 'bundle', 'data', or 'release'"

###
### Tests.
###

.PHONY: test $(TESTS)
test: $(TESTS)
$(TESTS): bundle
	echo "trying: $@"
	cd $(@D) && $(JS) $(JSFLAGS) -f $(@F)

###
### Check the metadata using kwalify.
###

.PHONY: check_metadata $(METADATA)
check_metadata: $(METADATA)
$(METADATA):
	kwalify -f ./scripts/schema.yaml $@

###
### Just the exit code results of the tests.
###

.PHONY: pass
pass: check_metadata
	make test | grep -i fail; test $$? -ne 0

###
### Documentation for JavaScript and Perl modules.
###

.PHONY: docs
docs:
	naturaldocs --rebuild-output --input ./javascript/lib/amigo --project javascript/docs/.naturaldocs_project/ --output html javascript/docs/
	naturaldocs --rebuild-output --input ./perl/lib/ --project perl/docs/.naturaldocs_project/ --output html perl/docs

###
### Create exportable JS bundle. Only captures the statistics data if
### it has been generated separately.
###

.PHONY: bundle
bundle:
	./install -b

.PHONY: bundle-uncompressed
bundle-uncompressed:
	./install -b -u

# ###
# ### Produce static statistics data files for landing page.
# ###

# .PHONY: data

# data:
# 	cd ./javascript/bin/; rhino -opt -1 ./generate_static_data.js --ann-source >../../staging/ann-source.dat; rhino -opt -1 ./generate_static_data.js --ann-evidence >../../staging/ann-evidence.dat; rhino -opt -1 ./generate_static_data.js --ann-overview >../../staging/ann-overview.dat

###
### Installation.
###

.PHONY: install
install: test docs
	./install -v -e -g

## This target skips testing.
.PHONY: install-uncompressed
install-uncompressed: docs
	./install -v -e -g -u

###
### Copy in the standard inital values for installation.
###

.PHONY: initialize
initialize:
	cp conf/.initial_values.yaml conf/amigo.yaml

###
### Copy in some dummy values for use with testing.
###

.PHONY: dummy
dummy:
	cp conf/.dummy_values.yaml conf/amigo.yaml

###
### Release: docs and bundle; then to an upload.
###

.PHONY: release
release: bundle docs
	s3cmd -P put javascript/staging/amigo*.js s3://bbop/jsapi/

###
### Ctags file for development.
### Only sensible when used in a dev environment with bbop-js nearby.
###

.PHONY: tags
tags:
	@echo "Using BBOP-JS at: $(BBOP_JS)"
	rm -f TAGS
	find ./perl/lib ./javascript/lib/amigo $(BBOP_JS)/lib/bbop | grep ".*\.\(js\|pm\)$$" | xargs ctags -e -a

###
### Refresh the bundle in BBOP JS and install.
### Copy the bundle over for easy use by our tests.
### Only sensible when used in a dev environment with bbop-js nearby.
###

.PHONY: refresh
refresh: tags bundle
	@echo "Using BBOP-JS at: $(BBOP_JS)"
	cd $(BBOP_JS); make bundle
	cp $(BBOP_JS)/staging/bbop.js ./_data
	cp ./javascript/lib/amigo/data/*.js $(BBOP_JS)/_data/
	cp ./javascript/lib/amigo/data/golr.js $(BBOP_JS)/demo/
	./install -v -e -g
	./scripts/blank-kvetch.pl

###
### Essentially a lite refresh for when working on or testing HTML,
### CSS, etc.
###

.PHONY: rollout
rollout:
	./install -v -e -g
	./scripts/blank-kvetch.pl
