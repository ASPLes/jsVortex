#!/bin/sh

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
DEST=jsvortex-${jsvortex_version}
mkdir ${DEST}
cp doc/COPYING.txt ${DEST}/COPYING.txt
cp README ${DEST}/README
cp socket-connector/JavaSocketConnector.jar ${DEST}/
cp socket-connector/JavaSocketConnector.js ${DEST}/

# prepare shrink-safe
shrinksafe src/Vortex.js > ${DEST}/Vortex.js
echo "Vortex.singleFile = true;"

zip jsVortex-${jsvortex_version}.zip ${DEST}/*.{js,txt,jar} ${DEST}/README

rm -rf jsvortex-${jsvortex_version}
