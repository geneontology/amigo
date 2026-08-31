####
#### A set of basic steps.
####

from behave import *
from urllib.parse import urlparse

## The basic and critical "go to page".
@given('I go to page "{page}"')
def step_impl(context, page):
    ## Save the starting state for later possible use.
    context._starting_windows = context.browser.window_handles
    
    #print(context.browser.title)
    context.browser.get(context.target + page)
    
## A similar quirky action, trying to go to a newly opened "window".
## Think what happens during an open "_blank".
@given('I go to the new window')
def step_impl(context):
    #print(context.browser.title)
    ## Try and calculate the newest open window.
    all_windows = context.browser.window_handles
    #print(all_windows)
    new_window = list(set(all_windows) - set(context._starting_windows))[0]
    #print(all_windows)
    context.browser.switch_to_window(new_window)
    
@then('the title should be "{title}"')
def step_impl(context, title):
    #print(context.browser.title)
    #print(title)
    assert context.browser.title == title

@then('the title should contain "{text}"')
def step_impl(context, text):
    assert text in context.browser.title

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

## TODO/BUG: Make use of the explicit waits instead of the (rather
## lame) implicit waits:
## http://selenium-python.readthedocs.org/en/latest/waits.html
## See above autocomplete.py.
@given('I wait until the document contains "{text}"')
def step_impl(context, text):

    ## Implicity poll for items to appear for 10 seconds.
    context.browser.implicitly_wait(10)
    print(context.browser.title)
    webelt = context.browser.find_element_by_tag_name('html')
    print(webelt.text)
    assert webelt.text.rfind(text) != -1

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

## Check for broken images on the page
@then('the page should not contain broken images')
def step_impl(context):
    from selenium.webdriver.common.by import By
    
    # Get all images on the page
    images = context.browser.find_elements(By.TAG_NAME, 'img')
    
    # Check each image
    broken_images = []
    for img in images:
        # Check if the image is displayed
        if not img.is_displayed():
            # Get image details for logging
            img_src = img.get_attribute('src')
            img_alt = img.get_attribute('alt')
            broken_images.append(f"Broken image: src={img_src}, alt={img_alt}")
    
    # Assert that no broken images were found
    assert len(broken_images) == 0, f"Found {len(broken_images)} broken images: {broken_images}"
