####
#### Testing and load helpers for GOlr
####

###
### User vaiables.
###

## Options.
OWLTOOLS_MAX_MEMORY = 32G

## Bins.
MAVEN_EXE = ~/local/src/java/apache-maven-3.0.4/bin/mvn

## URLs.
SOLR = http://localhost:8080/solr/ 

## Paths.
OWLTOOLS = ~/local/src/svn/owltools/
PANTHER_FILES_DIR = ~/local/src/svn/geneontology.org/trunk/experimental/trees/panther_data/
BBOP_JS_ROOT = ~/local/src/git/bbop-js/

## Files.
SCHEMA_METADATA = \
 ../metadata/ont-config.yaml \
 ../metadata/bio-config.yaml \
 ../metadata/ann-config.yaml \
 ../metadata/protein-family-config.yaml \
 ../metadata/general-config.yaml \
 ../metadata/ann_ev_agg-config.yaml
ONTOLOGY_METADATA = ../metadata/ont-config.yaml
ONTOLOGIES = \
 http://purl.obolibrary.org/obo/go.owl \
 http://purl.obolibrary.org/obo/ncbitaxon/subsets/taxslim.owl \
 http://purl.obolibrary.org/obo/cl.owl \
 http://purl.obolibrary.org/obo/eco.owl \
 http://geneontology.org/ontology/extensions/gorel.owl
## Next:
# http://purl.obolibrary.org/obo/ma.owl \
# http://purl.obolibrary.org/obo/emap.owl \
# http://purl.obolibrary.org/obo/uberon/basic.owl

ALL_GAFS = \
	http://www.geneontology.org/gene-associations/gene_association.GeneDB_Lmajor.gz \
	http://www.geneontology.org/gene-associations/gene_association.GeneDB_Pfalciparum.gz \
	http://www.geneontology.org/gene-associations/gene_association.GeneDB_Spombe.gz  \
	http://www.geneontology.org/gene-associations/gene_association.GeneDB_Tbrucei.gz \
	http://www.geneontology.org/gene-associations/gene_association.GeneDB_tsetse.gz \
	http://www.geneontology.org/gene-associations/gene_association.PAMGO_Atumefaciens.gz \
	http://www.geneontology.org/gene-associations/gene_association.PAMGO_Ddadantii.gz \
	http://www.geneontology.org/gene-associations/gene_association.PAMGO_Mgrisea.gz \
	http://www.geneontology.org/gene-associations/gene_association.PAMGO_Oomycetes.gz \
	http://www.geneontology.org/gene-associations/gene_association.aspgd.gz \
	http://www.geneontology.org/gene-associations/gene_association.cgd.gz \
	http://www.geneontology.org/gene-associations/gene_association.dictyBase.gz \
	http://www.geneontology.org/gene-associations/gene_association.ecocyc.gz \
	http://www.geneontology.org/gene-associations/gene_association.fb.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_arabidopsis.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_chicken.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_cow.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_dog.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_human.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_mouse.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_pdb.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_pig.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_rat.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_uniprot_noiea.gz \
	http://www.geneontology.org/gene-associations/gene_association.goa_zebrafish.gz \
	http://www.geneontology.org/gene-associations/gene_association.gonuts.gz \
	http://www.geneontology.org/gene-associations/gene_association.gramene_oryza.gz \
	http://www.geneontology.org/gene-associations/gene_association.jcvi.gz \
	http://www.geneontology.org/gene-associations/gene_association.mgi.gz \
	http://www.geneontology.org/gene-associations/gene_association.pombase.gz \
	http://www.geneontology.org/gene-associations/gene_association.pseudocap.gz \
	http://www.geneontology.org/gene-associations/gene_association.reactome.gz \
	http://www.geneontology.org/gene-associations/gene_association.rgd.gz \
	http://www.geneontology.org/gene-associations/gene_association.sgd.gz \
	http://www.geneontology.org/gene-associations/gene_association.sgn.gz \
	http://www.geneontology.org/gene-associations/gene_association.tair.gz \
	http://www.geneontology.org/gene-associations/gene_association.wb.gz \
	http://www.geneontology.org/gene-associations/gene_association.zfin.gz \
	http://www.geneontology.org/gene-associations/submission/paint/pre-submission/gene_association.paint_other.gaf # And higher-level PAINT annotations.

MGI_GAF = http://www.geneontology.org/gene-associations/gene_association.mgi.gz
MGI_TEST_GAF = ./_test/mgi-limited.gaf

###
### Nothing to see below here: targets.
###

all:
	@echo "Not a valid target."

###
### OWLTools operations.
###

.PHONY: owltools-update
owltools-update:
	cd $(OWLTOOLS) && svn update
# svn update --accept theirs-full

.PHONY: owltools-build
owltools-build:
	cd $(OWLTOOLS)/OWLTools-Parent && $(MAVEN_EXE) clean package -DskipTests

.PHONY: owltools-test
owltools-test:
	cd $(OWLTOOLS)/OWLTools-Parent && $(MAVEN_EXE) clean package

###
### GOlr operations.
###

.PHONY: golr-install
golr-install:
	sudo ./tools/golr.el

.PHONY: golr-purge
golr-purge:
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools --solr-url $(SOLR) --solr-purge

.PHONY: golr-schema
golr-schema:
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools --solr-config $(SCHEMA_METADATA) --solr-schema-dump | ./tools/remove-schema-cruft.pl > ./solr/conf/schema.xml

###
### Loading.
###

## Create a warning message about loading.
.PHONY: message-load-start
message-load-start:
	../scripts/global-message.pl -e "GOlr is currently being reloaded--any results will be partial at best. Please check back later."

## Create a warning message about loading.
.PHONY: message-load-stop
message-load-stop:
	../scripts/global-message.pl -c

## Load the ontology stuff.
.PHONY: load-ontology
load-ontology: owltools-build
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools $(ONTOLOGIES) --merge-support-ontologies --reasoner elk --solr-url $(SOLR) --solr-config $(ONTOLOGY_METADATA) --solr-load-ontology

## Test GAF.
.PHONY: load-mgi-gaf
load-mgi-gaf: owltools-build
	make message-load-start
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools $(ONTOLOGIES) --merge-support-ontologies --reasoner elk --solr-url $(SOLR) --read-panther $(PANTHER_FILES_DIR) --solr-load-gafs $(MGI_GAF) --solr-load-panther
	make message-load-stop

## Test GAF: A test load with the MGI GAF--column 16, etc.
.PHONY: load-mgi-test-gaf
load-mgi-test-gaf: owltools-build
	make message-load-start
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools $(ONTOLOGIES) --merge-support-ontologies --reasoner elk --solr-url $(SOLR) --read-panther $(PANTHER_FILES_DIR) --solr-load-gafs $(MGI_TEST_GAF) --solr-load-panther
	make message-load-stop

## Test PANTHER: A test load with just PANTHER (no GAF info).
.PHONY: load-just-panther
load-just-panther: owltools-build
	make message-load-start
	$(OWLTOOLS)/OWLTools-Runner/bin/owltools --solr-url $(SOLR) --read-panther $(PANTHER_FILES_DIR) --solr-load-panther
	make message-load-stop

## The full and final load.
.PHONY: load-full
load-full: owltools-build
	make message-load-start
	OWLTOOLS_MEMORY=$(OWLTOOLS_MAX_MEMORY) $(OWLTOOLS)/OWLTools-Runner/bin/owltools $(ONTOLOGIES) --merge-support-ontologies --reasoner elk --solr-url $(SOLR) --solr-purge --solr-config $(ONTOLOGY_METADATA) --solr-load-ontology --read-panther $(PANTHER_FILES_DIR) --solr-load-gafs $(ALL_GAFS) --solr-load-panther
	make message-load-stop

###
### Services.
###

.PHONY: service-restart-nginx
service-restart-nginx:
	cd /tmp && sudo trash-put golr-rps-cache amigo2-rps-cache && sudo trash-empty && sudo /etc/init.d/nginx restart

.PHONY: service-restart-jetty
service-restart-jetty:
	sudo /etc/init.d/jetty restart
