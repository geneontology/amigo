####
#### Testing and benchmarking for AmiGO JS.
####
#### A report-mistakes-only testing run can be done as:
####   make test | grep -i fail
####

TESTS = $(wildcard *.js.tests) \
 $(wildcard bbop/*.js.tests) \
 $(wildcard bbop/amigo/*.js.tests)
#BENCHMARKS = $(wildcard _benchmark/*.js)
JS = smjs # or smjs, rhino
JSFLAGS = # Some require things like "-opt -1" in some cases (big GO tests)
JSENGINES = node smjs rhino

all:
	@echo "Default JS engine: $(JS)"
	@echo "All JS engines: $(JSENGINES)"
	@echo "Tests defined: $(TESTS)"
#	@echo "Benchmarks defined: $(BENCHMARKS)"
	@echo "Try 'make test', 'make benchmark', or 'make docs'"

###
### Tests.
###

.PHONY: test $(TESTS)

test: $(TESTS)

$(TESTS):
	echo "trying: $@"
	cd $(@D) && $(JS) $(JSFLAGS) -f $(@F)

# ###
# ### Benchmarks.
# ###

# .PHONY: benchmark $(BENCHMARKS)

# benchmark: $(BENCHMARKS)

# $(BENCHMARKS):
# 	for e in $(JSENGINES); do \
#            echo "Trying engine: $$e"; \
#            $$e -f $@; \
#         done

###
### Documentation.
###

.PHONY: docs

docs:
	naturaldocs --rebuild-output --input ./ --project docs/.naturaldocs_project/ --output html docs/
