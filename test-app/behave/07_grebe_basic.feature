
Feature: Search templates (aka Grebe) basically works
 AmiGO correctly takes input in a Grebe selection box and correctly opens
 a new window with properly filtered search results.
 
 ## No Background necessary.

 @go
 Scenario: "cytoplasm" in the first template (Q2) gives correct filters
    Given I go to page "/grebe"
     and I type "GO:0005737" into the input with id "q2f1"
     and I click the form button with id "q2-action"
     and I go to the new window
     and I wait until the document contains "Results count"
     then the document should contain "GO:0005737"
