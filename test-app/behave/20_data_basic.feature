
Feature: Basic loaded data seems sane

 The data loaded into the AmiGO instance has the basic properties of
 sane data. The document counts of vaious pages given various filters
 should seem acceptable.
 
 ## No Background necessary.

 @data
 Scenario: the ontology search page contains sufficient terms
    Given I go to page "/amigo/search/ontology"
     then the number of documents should be greater than "70000"

 ## Using a data bookmark
 @data
 Scenario: SGD has more than 1800 "phylogenetic evidence" annotations
    Given I go to page "/amigo/search/annotation?q=*:*&fq=source:"SGD"&fq=evidence_type_closure:"phylogenetic evidence"&sfq=document_category:"annotation""
     then the number of documents should be greater than "1800"
