Feature: AmiGO search start pages show counts consistent with data loads

 ## No Background necessary.

 Scenario Outline: the search page shows counts consistent with data loads
   Given I go to search page "<searchpage>"
    then the total should be within 10% of recent count "<count>"
   Examples: search pages
    | searchpage               | count                    |
#   |--------------------------+--------------------------|
    | /amigo/search/annotation | 4722464                  |
    | /amigo/search/ontology   | 1319364                    |
    | /amigo/search/bioentity  | 828474                   |
## 
