
Feature: AmiGO autocomplete basically works
 AmiGO can have corrct data in the drop-down and navigate to a medial page.
 
 ## No Background necessary.

 @go
 Scenario: "neurogenesis" in the general search with submit goes to medial
    Given I go to page "/amigo/landing"
     and I type "neurogenesis" into the general search
     and I submit the general search
     then the title should be "AmiGO 2: Search Directory"
     and the class "panel-body" should contain "neurogenesis"

 @go
 Scenario: "neurogenesis" in the general search with a click goes to term page
    Given I go to page "/amigo/landing"
     and I type "neurogenesis" into the general search
     and I wait until "GO:0022008" appears in the autocomplete 
     and I click the general search item "neurogenesis (GO:0022008)"
     then the title should be "AmiGO 2: Term Details"
