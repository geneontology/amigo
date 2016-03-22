####
#### Check that counts for basic searches is within 10% of given counts
####

import re, os, time
import ftplib

from behave import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@given('I go to search page "{searchpage}"')
def step_impl(context, searchpage):
    context.browser.get(context.target + searchpage)
    
@then('the total should be within 10% of recent count "{count}"')
def step_impl(context, count):
    webelt = context.browser.find_element_by_class_name('bbop-widget-set-live-pager')
    assert webelt.text.rfind('Total:') != -1
    line = webelt.text
    linetotal = map(int, re.findall('\d+', line))
    total = linetotal[0]
    thiscount = float(count)
    assert ((total < 1.1 * thiscount) and (total > .9 * thiscount))
