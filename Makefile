####
#### Testing and release procedures for AmiGO JS.
####
#### A report-mistakes-only testing run can be done as:
####   make test | grep -i fail
####

TESTS = $(wildcard javascript/lib/amigo/*.js.tests) \
 $(wildcard javascript/lib/amigo/data/*.js.tests) \
 $(wildcard javascript/lib/amigo/ui/*.js.tests)
#BENCHMARKS = $(wildcard _benchmark/*.js)
JS = smjs # or smjs, rhino
JSFLAGS = # Some require things like "-opt -1" in some cases (big GO tests)
JSENGINES = node smjs rhino
BBOP_JS = ../../../../git/bbop-js/

all:
	@echo "Default JS engine: $(JS)"
	@echo "All JS engines: $(JSENGINES)"
	@echo "Try make: 'test', 'docs', 'install', 'bundle', 'data', or 'release'"

###
### Tests.
###

.PHONY: test $(TESTS)

test: $(TESTS)

$(TESTS):
	echo "trying: $@"
	cd $(@D) && $(JS) $(JSFLAGS) -f $(@F)

###
### Documentation.
###

.PHONY: docs

docs:
	naturaldocs --rebuild-output --input ./javascript/lib/amigo --project javascript/docs/.naturaldocs_project/ --output html javascript/docs/
	naturaldocs --rebuild-output --input ./perl/lib/ --project perl/docs/.naturaldocs_project/ --output html perl/docs

###
### Produce static statistics data files for landing page.
###

.PHONY: data

data:
	cd ./javascript/bin/; ./generate_static_data.js --ann-source >../../staging/ann-source.dat; ./generate_static_data.js --ann-evidence >../../staging/ann-evidence.dat; ./generate_static_data.js --ann-overview >../../staging/ann-overview.dat

###
### Ctags file for development.
###

.PHONY: tags

tags:
	rm -f TAGS
	find ./perl/lib ./javascript/lib/amigo $(BBOP_JS)/lib/bbop | grep ".*\.\(js\|pm\)$$" | xargs ctags -e -a

###
### Create exportable JS bundle.
###

.PHONY: bundle

bundle: data
	./install -b

###
### Installation.
###

.PHONY: install

install: bundle
	./install -v -e -g

###
### Refresh the bundle in BBOP JS and install.
### Copy the bundle over for easy use by our tests.
###

.PHONY: refresh

refresh: tags bundle
	cd $(BBOP_JS); make bundle
	cp $(BBOP_JS)/staging/bbop.js ./_data
	./install -v -e -g

###
### Release: docs and bundle; then to an upload.
###

.PHONY: release

release: bundle docs
	s3cmd -P put javascript/staging/amigo*.js s3://bbop/jsapi/
