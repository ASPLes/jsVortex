#!/bin/sh

# remove chrome directory
rm -rf chrome
mkdir chrome
mkdir chrome/content
(cd chrome/content; for I in `ls -1 ../../../../../src/Vortex*.js`; do ln -s $I; done; cd -)
