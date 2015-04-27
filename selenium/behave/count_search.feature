Feature: AmiGO search pages show counts consistent with data loads

 ## No Background necessary.

 @production
 Scenario Outline: the search pages on the production server show counts consistent with data loads
   Given I go to search page "<searchpage>"
    then the total should be within 10% of recent count "<count>"
   Examples: search pages
    | searchpage               | count                    |
#   |--------------------------+--------------------------|
    | /amigo/search/annotation | 4715870                  |
    | /amigo/search/ontology   | 74795                    |
    | /amigo/search/bioentity  | 828351                   |
## 

 @labs
 Scenario Outline: the search pages on the labs server show counts consistent with data loads
   Given I go to search page "<searchpage>"
    then the total should be within 10% of recent count "<count>"
   Examples: search pages
    | searchpage               | count                    |
#   |--------------------------+--------------------------|
    | /amigo/search/annotation | 4724502                  |
    | /amigo/search/ontology   | 1319608                  |
    | /amigo/search/bioentity  | 828489                   |
## 
