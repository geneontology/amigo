# To get the TAGS file for editing perl an js:
rm -f TAGS; find ./perl/lib ./javascript/bbop ../../javascript/trunk/lib | grep ".*\.\(js\|pm\)$" | xargs ctags -e -a
