####
#### Steps for operating on the various term enrichment engines and
#### their results.
####

from behave import *

@given('I input the following text into the RTE input box')
def step_impl(context):
    input_box_text = context.text
    webelt = context.browser.find_element_by_id('rte_input')
    webelt.send_keys(input_box_text)

@when('I submit the RTE form')
def step_impl(context):
    xp = "/html/body/div[2]/div[5]/div/div/form/div[2]/button"
    webelt = context.browser.find_element_by_xpath(xp)
    webelt.click()
