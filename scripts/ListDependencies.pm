####
#### From http://perlmonks.org/?node_id=203148
####

package ListDependencies;

use strict;

## Original:
# unshift @INC, sub {
#   local $_ = $_[1];
#   return unless /[[:upper:]]/;
#   s/\.pm$//i;
#   s/[\/:]/::/g;
#   print STDERR $_, $/;
# };

unshift @INC, sub {
  local $_ = $_[1];
  return if /\.pl$/;
  return if /^[[:lower:]]/;
  s/\.pm$//i;
  s/[\/:]/::/g;
  print $_, $/;
};



1;
