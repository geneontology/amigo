####
#### Testing and load helpers for GOlr
####

OWLTOOLS = ~/local/src/svn/owltools
SOLR = http://localhost:8080/solr/ 
PANTHER_FILES = ~/tmp/p2/panther_data/
ONTOLOGIES = http://purl.obolibrary.org/obo/go.owl \
 http://purl.obolibrary.org/obo/ncbitaxon/subsets/taxslim.owl \
 http://purl.obolibrary.org/obo/cl.owl \
 http://purl.obolibrary.org/obo/eco.owl
MGI_GAF = http://www.geneontology.org/gene-associations/gene_association.mgi.gz

all:
	@echo "Not a valid target."

###
### OWLTools operations.
###

.PHONY: owltools-update
owltools-update:
	cd $(OWLTOOLS) && svn update

.PHONY: owltools-update
owltools-build:
	cd $(OWLTOOLS)/OWLTools-Parent && mvn clean package -DskipTests

.PHONY: owltools-test
owltools-test:
	cd $(OWLTOOLS)/OWLTools-Parent && mvn clean package

###
### GOlr operations.
###

.PHONY: golr-install
golr-install:
	sudo ./tools/golr.el

.PHONY: golr-purge
golr-purge:
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools --solr-url $(SOLR) --solr-purge

###
### GAFs
### A test load with the MGI GAF.
### Column 16, etc.
###

.PHONY: load-mgi-gaf
load-mgi-gaf: owltools-build
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools $(ONTOLOGIES) --merge-support-ontologies --reasoner elk --solr-url $(SOLR) --solr-purge --solr-load-panther $(PANTHER_FILES) --solr-load-gafs $(MGI_GAF)
