#!/bin/sh

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
ln -s src jsvortex-${jsvortex_version}
ln -s ../doc/COPYING.txt src/COPYING.txt
ln -s ../README src/README
ln -s ../socket-connector/JavaSocketConnector.jar src/
ln -s ../socket-connector/JavaSocketConnector.js src/
zip jsVortex-${jsvortex_version}.zip \
    jsvortex-${jsvortex_version}/*.{js,txt,jar} \
    jsvortex-${jsvortex_version}/README
rm src/README
rm src/COPYING.txt
rm src/JavaSocketConnector.jar
rm src/JavaSocketConnector.js
rm jsvortex-${jsvortex_version}
