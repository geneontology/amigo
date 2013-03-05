#!/usr/bin/emacs --script
;;;; 
;;;; ...
;;;;
;;;; Usage (cli):
;;;;    ./golr-refresh.el
;;;; Usage (crontab):
;;;;    emacs --quick -batch -l ./golr-refresh.el --eval="(golr-refresh-cli)"
;;;;
;;;; BUG: why the double output on my terminal?
;;;;

(require 'cl)

;;;
;;; Customizable variables.
;;;

(defgroup golr nil
  "GO in Solr Emacs group."
  :prefix "golr-"
  :group 'emacs)

(defcustom golr-owltools-location
  "/home/bbop/local/src/svn/owltools/"
  "The location of the OWLTools source code on the filesystem."
  :type 'string
  :group 'golr)

;; (defcustom golr-golr-location
;;   "/home/bbop/local/src/svn/geneontology/golr/"
;;   "The location of the OWLTools source code on the filesystem."
;;   :type 'string
;;   :group 'golr)

(defcustom golr-amigo-2-location
  "/home/bbop/local/src/git/amigo/"
  "The location of the AmiGO 2 source code on the filesystem."
  :type 'string
  :group 'golr)

(defcustom golr-bbop-js-location
  "/home/bbop/local/src/git/bbop-js/"
  "The location of the BBOP JS source code on the filesystem."
  :type 'string
  :group 'golr)

(defcustom golr-panther-tree-location
  "/home/bbop/tmp/tree/"
  "The location of the PANTHER tree directory on the filesystem."
  :type 'string
  :group 'golr)

(defcustom golr-maven-3-full-path
  "/home/bbop/local/src/java/apache-maven-3.0.4/bin/mvn"
  "The full path to Maven 3 binary."
  :type 'string
  :group 'golr)

(defcustom golr-ontology-url-list
  '("http://purl.obolibrary.org/obo/go.owl"
    "http://purl.obolibrary.org/obo/ncbitaxon/subsets/taxslim.owl"
    "http://purl.obolibrary.org/obo/cl.owl"
    "http://purl.obolibrary.org/obo/eco.owl")
  "The URLs for the ontologies that we want to load."
  :type 'sexp
  :group 'golr)

(defcustom golr-annotation-url-list
  '("http://www.geneontology.org/gene-associations/gene_association.GeneDB_Lmajor.gz"
    "http://www.geneontology.org/gene-associations/gene_association.GeneDB_Pfalciparum.gz"
    "http://www.geneontology.org/gene-associations/gene_association.GeneDB_Spombe.gz "
    "http://www.geneontology.org/gene-associations/gene_association.GeneDB_Tbrucei.gz"
    "http://www.geneontology.org/gene-associations/gene_association.GeneDB_tsetse.gz"
    "http://www.geneontology.org/gene-associations/gene_association.PAMGO_Atumefaciens.gz"
    "http://www.geneontology.org/gene-associations/gene_association.PAMGO_Ddadantii.gz"
    "http://www.geneontology.org/gene-associations/gene_association.PAMGO_Mgrisea.gz"
    "http://www.geneontology.org/gene-associations/gene_association.PAMGO_Oomycetes.gz"
    "http://www.geneontology.org/gene-associations/gene_association.aspgd.gz"
    "http://www.geneontology.org/gene-associations/gene_association.cgd.gz"
    "http://www.geneontology.org/gene-associations/gene_association.dictyBase.gz"
    "http://www.geneontology.org/gene-associations/gene_association.ecocyc.gz"
    "http://www.geneontology.org/gene-associations/gene_association.fb.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_arabidopsis.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_chicken.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_cow.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_dog.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_human.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_mouse.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_pdb.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_pig.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_rat.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_uniprot_noiea.gz"
    "http://www.geneontology.org/gene-associations/gene_association.goa_zebrafish.gz"
    "http://www.geneontology.org/gene-associations/gene_association.gonuts.gz"
    "http://www.geneontology.org/gene-associations/gene_association.gramene_oryza.gz"
    "http://www.geneontology.org/gene-associations/gene_association.jcvi.gz"
    "http://www.geneontology.org/gene-associations/gene_association.mgi.gz"
    "http://www.geneontology.org/gene-associations/gene_association.pombase.gz"
    "http://www.geneontology.org/gene-associations/gene_association.pseudocap.gz"
    "http://www.geneontology.org/gene-associations/gene_association.reactome.gz"
    "http://www.geneontology.org/gene-associations/gene_association.rgd.gz"
    "http://www.geneontology.org/gene-associations/gene_association.sgd.gz"
    "http://www.geneontology.org/gene-associations/gene_association.sgn.gz"
    "http://www.geneontology.org/gene-associations/gene_association.tair.gz"
    "http://www.geneontology.org/gene-associations/gene_association.wb.gz"
    "http://www.geneontology.org/gene-associations/gene_association.zfin.gz")
  "The URLs for the annotations (GAFs) that we want to load."
  :type 'sexp
  :group 'golr)

;;;
;;; General support functions.
;;;

(defun golr-shell-command (cmnd)
  "Standard shell command with printing."
  (princ (concat "[GOlr] " cmnd "\n"))
  (shell-command cmnd))

;;;
;;; Command bundles.
;;;

(defun golr-update-owltools ()
  (golr-shell-command
   (concat "cd " golr-owltools-location" && svn update --accept theirs-full")))

(defun golr-build-owltools ()
  (golr-shell-command
   (concat "cd " golr-owltools-location "OWLTools-Parent/ && "
	   golr-maven-3-full-path " clean package -DskipTests")))

(defun golr-load-golr ()
  (golr-shell-command
   (concat "OWLTOOLS_MEMORY=32G " golr-owltools-location
	   "OWLTools-Runner/bin/owltools"
	   " " (mapconcat 'identity golr-ontology-url-list " ")
	   " --merge-support-ontologies --reasoner elk"
	   " --solr-url http://localhost:8080/solr/"
	   " --solr-purge"
	   " --solr-config " golr-amigo-2-location "metadata/ont-config.yaml"
	   " --solr-load-ontology"
	   " --solr-load-panther " golr-panther-tree-location
	   " --solr-load-gafs"
	   " " (mapconcat 'identity golr-annotation-url-list " "))))

;; (defun golr-update-golr ()
;;   (golr-shell-command
;;    (concat "cd " golr-golr-location " && svn update --accept theirs-full")))

(defun golr-update-amigo-2 ()
  (golr-shell-command
   (concat "cd " golr-amigo-2-location " && git reset --hard && git pull")))

(defun golr-update-bbop-js ()
  (golr-shell-command
   (concat "cd " golr-bbop-js-location " && git reset --hard && git pull")))

(defun golr-build-bbop-js ()
  (golr-shell-command
   (concat "cd " golr-bbop-js-location " && make bundle")))

(defun golr-install-amigo-2 ()
  (golr-shell-command
   (concat "cd " golr-amigo-2-location " && make install")))

;;;
;;; Run from the command line.
;;;

(defun golr-refresh-cli ()
  "Command switch for command line use."
  (golr-update-owltools)
  (golr-build-owltools)
  (golr-load-golr)
  ;; (golr-update-golr)
  (golr-update-amigo-2)
  (golr-update-bbop-js)
  (golr-build-bbop-js)
  (golr-install-amigo-2))

;; Only run off of cli.
(let ((re "script"))
  (when (delq nil (mapcar (lambda (s) (string-match re s)) command-line-args))
    ;(princ "Detected CLI...")
    (golr-refresh-cli)))
