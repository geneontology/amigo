Feature: AmiGO basic pages okay
 AmiGO's basic landing pages are all functional;
 all non-data pages can be correctly accessed.

 ## No Background necessary.

 Scenario Outline: the core landing pages exist on the production server
   Given I go to page "<page>"
    then the title should be "<title>"
   Examples: core pages
    | page                     | title                                        |
#   |--------------------------+----------------------------------------------|
    | /                        | AmiGO 2: Welcome                             |
    | /amigo                   | AmiGO 2: Welcome                             |
    | /amigo/landing           | AmiGO 2: Welcome                             |
    | /amigo/search/annotation | AmiGO 2: Search                              |
    | /amigo/search/ontology   | AmiGO 2: Search                              |
    | /amigo/search/bioentity  | AmiGO 2: Search                              |
    | /amigo/software_list     | AmiGO 2: Tools and Resources                 |
    | /dd_browse               | AmiGO 2: Drill-down Browser
    | /grebe                   | AmiGO 2: Search Templates                    |
    | /goose                   | AmiGO 2: GO Online SQL/Solr Environment (GOOSE) |
    | /gannet                  | AmiGO 2: GO-flavored Solr exploration        |
    | /rte                     | Term Enrichment Service                      |
    | /visualize               | AmiGO 2: Service Status for visualize        |
    | /visualize?mode=client_amigo | AmiGO 2: Visualize                       |
    | /amigo/schema_details    | AmiGO 2: Schema Details                      |
    | /amigo/load_details      | AmiGO 2: Load Details                        |
    | /amigo/owltools_details  | AmiGO 2: OWLTools/Loader Details             |
    | /xrefs                   | AmiGO 2: Cross References                    |
## Ignore this next bit unless you're an Emacs org-mode user.
#    | /amigo/visualize         | AmiGO 2: Visualize                           |
