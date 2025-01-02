#!/bin/bash

rsync -avz *.html *.svg *.js *.png *.css aspl-web@www.aspl.es:www/jsVortex/
rsync -avz es/*.html aspl-web@www.aspl.es:www/jsVortex/es/
rsync -avz images/*.png aspl-web@www.aspl.es:www/jsVortex/images/


