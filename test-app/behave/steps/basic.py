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

@then('the link "{full_link_text}" appears in the document')
def step_impl(context, full_link_text):
    webelt = context.browser.find_element_by_link_text(full_link_text)
    assert webelt

## The document body should contain a certain piece of text.
@then('the document should contain "{text}"')
def step_impl(context, text):
    print(context.browser.title)
    webelt = context.browser.find_element_by_tag_name('html')
    print(webelt.text)
    assert webelt.text.rfind(text) != -1
    # webelt = context.browser.find_element_by_tag_name('body')
    # print(webelt.get_attribute('innerHTML'))
    # assert webelt.get_attribute('innerHTML').rfind(text) != -1

## The document body should not contain a hyperlink with text.
@then('the document should not contain link with "{text}"')
def step_impl(context, text):
    from selenium.common.exceptions import NoSuchElementException
    isNotFound = False
    try:
        context.browser.find_element_by_link_text(text)
    except NoSuchElementException:
        isNotFound = True
    assert isNotFound

## The document body should not contain an internal hyperlink to {link}
@then('the document should not contain an internal link to "{link}"')
def step_impl(context, link):
    webelts = context.browser.find_elements_by_tag_name('a')
    isNotFound = True
    for elt in webelts:
        href = elt.get_attribute("href")
        if href.rfind(context.target+link) != -1:
            isNotFound = False
    assert isNotFound == True

## A given tab should contain a given piece of text/content.
@then('the "{tabname}" tab should contain "{text}"')
def step_impl(context, tabname, text):
    # print(context.browser.title)
    webelts = context.browser.find_elements_by_class_name("tab")
    found_tab = False
    for w in webelts:
        if w.text.rfind(tabname) != -1:
            found_tab = True
            parent = w.find_element_by_xpath("..")
            tab_href = parent.get_attribute("href")
            url = urlparse(tab_href)
            tab_id = url.fragment
            # print(tab_id)
            tab_area_elt = context.browser.find_element_by_id(tab_id)
            # print(tab_area_elt.text)
            assert tab_area_elt and tab_area_elt.text.rfind(text) != -1
    assert found_tab
