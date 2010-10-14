#!/bin/sh

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
DEST=jsVortex-${jsvortex_version}
mkdir ${DEST}
cp doc/COPYING.txt ${DEST}/COPYING.txt
cp README ${DEST}/README
cp socket-connector/JavaSocketConnector.jar ${DEST}/
shrinksafe socket-connector/JavaSocketConnector.js > ${DEST}/JavaSocketConnector.js

# prepare shrink-safe: do initial file changing loading style
shrinksafe src/Vortex.js | sed 's/singleFile:false/singleFile:true/g' > ${DEST}/Vortex.js

# now append rest of files
shrinksafe src/VortexConnection.js >> ${DEST}/Vortex.js
shrinksafe src/VortexEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexChannel.js >> ${DEST}/Vortex.js
shrinksafe src/VortexTCPTransport.js >> ${DEST}/Vortex.js
shrinksafe src/VortexConnection_comp.js >> ${DEST}/Vortex.js
shrinksafe src/VortexXMLEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexFrame.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEnginePlain.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEngineAnonymous.js >> ${DEST}/Vortex.js
shrinksafe src/VortexMimeHeader.js >> ${DEST}/Vortex.js

zip jsVortex-${jsvortex_version}.zip ${DEST}/*.{js,txt,jar} ${DEST}/README

rm -rf ${DEST}
