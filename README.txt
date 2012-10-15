## While you can run release, testing, and docs for the JS separately
## from the rest of the AmiGO installation process, you probably
## shouldn't. For the eperimental install with Gannet and GOOSE, try:
./install -v -e -g

## To get the TAGS file for editing perl an js:
rm -f TAGS; find ./perl/lib ./javascript/bbop ../../javascript/trunk/lib | grep ".*\.\(js\|pm\)$" | xargs ctags -e -a
