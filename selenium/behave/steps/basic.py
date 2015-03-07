####
#### A set of basic steps.
####

from behave import *

## The basic and critical "go to page".
@given('I go to page "{page}"')
def step_impl(context, page):
    #print(context.browser.title)
    context.browser.get(context.target + page)
    
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
