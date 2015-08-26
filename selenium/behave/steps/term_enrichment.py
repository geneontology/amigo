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

    ## Current 2.4.x location.
    xp_24x = "/html/body/div[2]/div[5]/div/div/form/div[2]/button"
    ## Current 2.3.x location.   
    xp_23x = "/html/body/div[2]/div[5]/div/div/form/div[2]/button"

    ## Try them both, starting with 2.4.x
    okay_p = False
    webelt = None
    try:
        webelt = context.browser.find_element_by_xpath(xp_24x)
        okay_p = True
    except:
        pass
    if not okay_p:
        try:
            webelt = context.browser.find_element_by_xpath(xp_23x)
            okay_p = True
        except:
            pass

    ## If everything is alright, click on it.
    if okay_p and webelt:
        webelt.click()
    else:
        assert True is False
