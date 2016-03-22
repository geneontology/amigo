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

    target_clss = "bbop-widget-set-live-pager"
    webelt = context.browser.find_element_by_class_name(target_clss)
    eltext = webelt.text

    ## Extract by bounding between ': ' and ';'
    btm = eltext.index(': ')
    top = eltext.index(';')
    if btm != -1 and top != -1:
        count = float(count)
        found_number = float(eltext[btm:top])
        assert ((number_found <= 1.1 * count) and (number_found >= .9 * count))
    else:
        assert True is False
