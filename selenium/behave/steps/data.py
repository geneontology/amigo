####
#### Steps for extracting and checking the data profile in a page.
####

from behave import *

@then('the number of documents should be greater than "{number}"')
def step_impl(context, number):

    ## Get the right element by class association.
    ## WARNING: would work with only one widget on a page.
    target_clss = "bbop-js-search-pane-meta"
    webelt = context.browser.find_element_by_class_name(target_clss)
    eltext = webelt.text

    ## Extract by bounding between ': ' and ';'
    btm = eltext.index(': ')
    top = eltext.index(';')
    if btm != -1 and top != -1:
        found_number = eltext[btm:top]
        assert found_number > int(number)
    else:
        assert True is False
