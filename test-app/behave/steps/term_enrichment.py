####
#### Steps for operating on the various term enrichment engines and
#### their results.
####

from behave import *
from selenium.webdriver.support.ui import Select

@given('I input the following text into the RTE input box')
def step_impl(context):
    input_box_text = context.text
    webelt = context.browser.find_element_by_id('rte_input')
    webelt.send_keys(input_box_text)

@given('I select "{results_format}" for the results')
def step_impl(context, results_format):
    select = Select(context.browser.find_element_by_id('rte_format'))
    select.select_by_visible_text(results_format)

@when('I submit the RTE form')
def step_impl(context):

    ## Try and track down that anonymous Submit button.
    okay_p = False
    webelt = None
    for x in xrange(3, 8):
        
        ## Try new path.
        xp = "/html/body/div[2]/div[" + `x` + "]/div/div/form/div[2]/button"
        try:
            webelt = context.browser.find_element_by_xpath(xp)
            okay_p = True
        except:
            pass

        ## Early exit if we found a working xpath.
        if okay_p:
            break

    ## If everything is alright, click on it.
    if okay_p and webelt:
        webelt.click()
    else:
        assert True is False
