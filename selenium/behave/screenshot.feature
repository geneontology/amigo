Feature: AmiGO pages have proper layout

 ## No Background necessary.

 Scenario Outline: the core landing pages exist
   Given I want a screenshot of page "<page>"
    then the screenshot is "<title>"
   Examples: core pages
    | page                     | title                                        |
#   |--------------------------+----------------------------------------------|
    | /                        | welcome                             |
    |/amigo/search/annotation?q=*:*&fq=assigned_by:"MGI"&fq=qualifier:"not"&fq=source:"RGD"&sfqdocument_category:"annotation"|mgi-not-rgd|
## Ignore this next bit unless you're an Emacs org-mode user.
