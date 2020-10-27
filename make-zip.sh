#!/bin/bash

######
## 
## Usage: 
##   do_shirnk file.js 
##
######
function do_shrink {

    # write release version
    sed  's/Vortex.log \(.*\);//g' $1 | sed  's/Vortex.log2 \(.*\);//g' | sed  's/Vortex.warn \(.*\);//g' | sed  's/Vortex.error \(.*\);//g' | sed 's/singleFile : false/singleFile : true/g' | shrinksafe >> ${DEST}/Vortex.js
    if [ "$?" != "0" ]; then
	echo "Failure found during compression, error code was: $?"
	exit -1
    fi
    # write debug version
    sed 's/singleFile : false/singleFile : true/g' $1 | shrinksafe >> ${DEST}/Vortex.debug.js
    if [ "$?" != "0" ]; then
	echo "Failure found during compression, error code was: $?"
	exit -1
    fi

    return;
}

if [  -n "$1" ]; then
    COPY_DIR="$1/"
fi

# update version
python ./prepare-version.py

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
do_shrink src/Vortex.js

# now append rest of files
do_shrink src/VortexConnection.js
do_shrink src/VortexEngine.js
do_shrink src/VortexChannel.js
do_shrink src/VortexTCPTransport.js
do_shrink src/VortexXMLEngine.js
do_shrink src/VortexSASLEngine.js
do_shrink src/VortexFrame.js
do_shrink src/VortexSASLEnginePlain.js
do_shrink src/VortexSASLEngineAnonymous.js
do_shrink src/VortexMimeHeader.js

# ensure right permissions
chmod 644 ${DEST}/*.{js,txt,jar} ${DEST}/README

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

