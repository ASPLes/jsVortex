#!/bin/sh

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
ln -s src jsvortex-${jsvortex_version}
ln -s ../doc/COPYING.txt src/COPYING.txt
ln -s ../README src/README
zip jsVortex-${jsvortex_version}.zip \
    jsvortex-${jsvortex_version}/*.{js,txt} \
    jsvortex-${jsvortex_version}/README
rm src/README
rm src/COPYING.txt
rm jsvortex-${jsvortex_version}
