
Feature: AmiGO core data is okay
 Basic pages that need minimal extant data themselves exist.

 ## No Background necessary.

 Scenario: the medial search page exists
    Given I go to page "/amigo/medial_search?q=foo"
     then the title should be "AmiGO 2: Search Directory"

 ## Also from: https://github.com/geneontology/amigo/issues/235
 @go
 Scenario: an ontology term page exists
    Given I go to page "/amigo/term/GO:0022008"
     then the title should be "AmiGO 2: Term Details for "neurogenesis" (GO:0022008)"
     then the class "page-header" should contain "neurogenesis"

 @go
 Scenario: an ontology gene product page exists
    Given I go to page "/amigo/gene_product/FB:FBgn0029157"
     then the title should be "AmiGO 2: Gene Product Details for FB:FBgn0029157"

 @go
 Scenario: the owltools loader details page gives some information
    Given I go to page "/amigo/owltools_details"
     then the document should contain "git-revision-url"

 ## From: https://github.com/geneontology/amigo/issues/240
 ## and https://github.com/geneontology/amigo/issues/244
 @go
 Scenario: the owltools loader details page gives some information
    Given I go to page "/amigo/gene_product/UniProtKB:P35222"
     then the class "page-header" should contain "Catenin beta-1"
     and the class "amigo-detail-info" should contain "Catenin beta-1"
