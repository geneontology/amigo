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

all:
	@echo "Default JS engine: $(JS)"
	@echo "All JS engines: $(JSENGINES)"
	@echo "Try make: 'test', 'docs', 'install', 'bundle', or 'release'"

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
### Installation.
###

.PHONY: install

install:
	./install -v -e -g

###
### Create exportable JS bundle.
###

.PHONY: bundle

bundle:
	./install -b

###
### Release: docs and bundle; then to an upload.
###

.PHONY: release

release: bundle docs
	s3cmd put javascript/staging/amigo*.js s3://bbop/jsapi/
