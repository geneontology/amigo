####
#### Check that counts for basic searches is within 10% of given counts
####

import re, os, time
import ftplib

from behave import *
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@given('I want a screenshot of page "{page}"')
def step_impl(context, page):
    context.browser.maximize_window()
    context.browser.get(context.target + page)
    
@then('the screenshot is "{title}"')
def step_impl(context, title):
    current_directory = os.getcwd()
    screenshot_directory = current_directory + "/screenshots"
    if not os.path.exists(screenshot_directory):
        os.mkdir(screenshot_directory)
    os.chdir(screenshot_directory)
    context.browser.save_screenshot(title + '.png')
    os.chdir(current_directory)