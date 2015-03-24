####
#### Testing and release procedures for AmiGO JS.
####

## Default to dev.
TARGET ?= http://amigo2.berkeleybop.org

###
### Tests.
###

.PHONY: test-production
test-production:
	TARGET=$(TARGET) behave --tags ~@labs ./

.PHONY: test-labs
test-labs:
	TARGET=$(TARGET) behave --tags ~@production ./
