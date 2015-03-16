
Feature: AmiGO core data is okay
 Basic pages that need minimal extant data themselves exist.

 ## No Background necessary.

 Scenario: the medial search page exists
    Given I go to page "/amigo/medial_search?q=foo"
     then the title should be "AmiGO 2: Search Directory"

 @go
 Scenario: an ontology term page exists
    Given I go to page "/amigo/term/GO:0022008"
     then the title should be "AmiGO 2: Term Details for "neurogenesis" (GO:0022008)"

 @go
 Scenario: an ontology term page exists
    Given I go to page "/amigo/gene_product/UniProtKB:F1PQ05"
     then the title should be "AmiGO 2: Gene Product Details for UniProtKB:F1PQ05"
