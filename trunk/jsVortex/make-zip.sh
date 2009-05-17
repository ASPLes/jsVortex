#!/bin/sh

# acquire current version
jsvortex_version=`cat VERSION`

# create temporal link to simulate release directory
ln -s src jsvortex-${jsvortex_version}
zip jsVortex-${jsvortex_version}.zip jsvortex-${jsvortex_version}/*.js; 
rm jsvortex-${jsvortex_version}
