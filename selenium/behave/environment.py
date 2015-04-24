####
#### Setup gross testing environment.
#### This includes server target and browser type.
####

import os
from selenium import webdriver

## Run this before anything else.
def before_all(context):
    ## Determine the server target. Default: http://amigo2.berkeleybop.org.
    context.target = 'http://amigo2.berkeleybop.org'
    if 'TARGET' in os.environ:
        context.target = os.environ['TARGET']
    ## Get the browser we're going to use. Default: firefox.
    if 'BROWSER' in os.environ and os.environ['BROWSER'] == 'phantomjs':
        context.browser = webdriver.PhantomJS()
    else:
        context.browser = webdriver.Firefox()

## Do this after completing everything.
def after_all(context):
    context.browser.quit()
