#!/bin/sh

if [  -n "$1" ]; then
    COPY_DIR="$1/"
fi

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
DEST=jsVortex-${jsvortex_version}
mkdir ${DEST}
echo "Creating content into ${DEST}"
cp -v doc/COPYING.txt ${DEST}/COPYING.txt
cp -v README ${DEST}/README
cp -v socket-connector/JavaSocketConnector.jar ${DEST}/
shrinksafe socket-connector/JavaSocketConnector.js > ${DEST}/JavaSocketConnector.js

# prepare shrink-safe: do initial file changing loading style
shrinksafe src/Vortex.js | sed 's/singleFile:false/singleFile:true/g' > ${DEST}/Vortex.js

# now append rest of files
shrinksafe src/VortexConnection.js >> ${DEST}/Vortex.js
shrinksafe src/VortexEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexChannel.js >> ${DEST}/Vortex.js
shrinksafe src/VortexTCPTransport.js >> ${DEST}/Vortex.js
shrinksafe src/VortexConnection.js >> ${DEST}/Vortex.js
shrinksafe src/VortexXMLEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEngine.js >> ${DEST}/Vortex.js
shrinksafe src/VortexFrame.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEnginePlain.js >> ${DEST}/Vortex.js
shrinksafe src/VortexSASLEngineAnonymous.js >> ${DEST}/Vortex.js
shrinksafe src/VortexMimeHeader.js >> ${DEST}/Vortex.js

zip -q jsVortex-${jsvortex_version}.zip ${DEST}/*.{js,txt,jar} ${DEST}/README

# copy files if defined
if [ -n "${COPY_DIR}" ]; then
   echo "Copying to ${COPY_DIR}, listing source"
   ls -la ${DEST}
   echo "Copying.."
   cp -v ${DEST}/* ${COPY_DIR}
fi

rm -rf ${DEST}

# report file created
echo "jsVortex-${jsvortex_version}.zip"

