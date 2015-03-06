####
#### A set of basic steps.
####

from behave import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# @given('a set of page title')
# def step_impl(context):
#     pass

# @when('we implement a test')
# def step_impl(context):
#     assert True is not False

# @then('behave will test it for us!')
# def step_impl(context):
#     assert context.failed is False

@given('I go to page "{page}"')
def step_impl(context, page):
    #print(context.browser.title)
    context.browser.get(context.target + page)

@given('I type "{text}" into the general search')
def step_impl(context, text):
    #print(context.browser.title)
    webelt = context.browser.find_element_by_id('gsf-query')
    webelt.send_keys('neurogenesis')

@given('I submit the general search')
def step_impl(context):
    #print(context.browser.title)
    webelt = context.browser.find_element_by_id('query-form')
    webelt.submit()

@given('I wait until "{item}" appears in the autocomplete')
def step_impl(context, item):
    element = WebDriverWait(context.browser, 1000).until(
        EC.text_to_be_present_in_element(
            context.browser.find_element_by_class_name('ui-autocomplete'), item
        )
    )
    
@given('I click the general search item "{item}"')
def step_impl(context, item):
    #print(context.browser.title)
    webelt = context.browser.find_element_by_link_text(item)
    webelt.click()
    
@then('the title should be "{title}"')
def step_impl(context, title):
    #print(context.browser.title)
    #print(title)
    assert context.browser.title == title

@then('the class "{clss}" should contain "{text}"')
def step_impl(context, clss, text):
    #print(context.browser.title)
    #print(title)
    webelt = context.browser.find_element_by_class_name(clss)
    assert webelt.text.rfind(text) != -1
