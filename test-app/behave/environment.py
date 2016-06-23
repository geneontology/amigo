####
#### Setup gross testing environment.
#### This includes server target and browser type.
####

import os
from selenium import webdriver

# ## From: https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver
# from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
# ffcaps = DesiredCapabilities.FIREFOX
# ffcaps["marionette"] = True
# ffcaps["binary"] = "/home/sjcarbon/local/src/tarballs/firefox/firefox"

## Run this before anything else.
def before_all(context):
    ## Determine the server target. Default: http://amigo.geneontology.org.
    context.target = 'http://amigo.geneontology.org/'
    if 'TARGET' in os.environ:
        context.target = os.environ['TARGET']
    ## Get the browser we're going to use. Default: firefox.
    if 'BROWSER' in os.environ and os.environ['BROWSER'] == 'firefox':
        context.browser = webdriver.Firefox(capabilities=ffcaps)
    else:
        context.browser = webdriver.PhantomJS()

    ## Set a decent timeout: 30s.
    context.browser.set_page_load_timeout(30)
        
## Do this after completing everything.
def after_all(context):
    context.browser.quit()
