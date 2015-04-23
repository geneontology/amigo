####
#### Check that counts for basic searches is within 10% of given counts
####

import re
from behave import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@given('I go to search page "{searchpage}"')
def step_impl(context, searchpage):
    context.browser.get(context.target + searchpage)
    
@then('the total should be within 10% of recent count "{count}"')
def step_impl(context, count):
    webelt = context.browser.find_element_by_class_name('bbop-js-search-pane-meta')
    assert webelt.text.rfind('Total:') != -1
    line = webelt.text
    linetotal = map(int, re.findall('\d+', line))
    total = linetotal[0]
    thiscount = float(count)
    assert ((total < 1.1 * thiscount) and (total > .9 * thiscount))

@given('I want a screenshot of page "{page}"')
def step_impl(context, page):
    context.browser.maximize_window()
    context.browser.get(context.target + page)
    
@then('the screenshot is "{title}"')
def step_impl(context, title):
    context.browser.save_screenshot(title + '.png')
