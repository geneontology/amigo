####
#### Testing and benchmarking for AmiGO JS.
####
#### A report-mistakes-only testing run can be done as:
####   make test | grep -i fail
####

TESTS = $(wildcard *.js.tests) \
 $(wildcard lib/amigo/*.js.tests) \
 $(wildcard lib/amigo/amigo/*.js.tests)
#BENCHMARKS = $(wildcard _benchmark/*.js)
JS = smjs # or smjs, rhino
JSFLAGS = # Some require things like "-opt -1" in some cases (big GO tests)
JSENGINES = node smjs rhino

all:
	@echo "Default JS engine: $(JS)"
	@echo "All JS engines: $(JSENGINES)"
	@echo "Try make: 'test' or 'docs'"

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
	naturaldocs --rebuild-output --input ./lib/amigo --project docs/.naturaldocs_project/ --output html docs/
