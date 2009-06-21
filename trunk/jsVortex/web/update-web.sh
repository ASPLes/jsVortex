#!/bin/sh

function get_selection () {
    echo $1;
    read selection
    
    if [ "$selection" == "" ]; then
    	selection="y";
    fi 
    
    if [ "$selection" == "Y" ]; then
    	selection="y";
    fi 
    
    # return selection
}

echo "Enter site location string to upload the content: ";
read sitelocation

echo "Site location found: ${sitelocation}";

# upload web content
html_files="firefox.html  index.html  professional.html  about.html  download.html  doc.html  news.html jsvortex2.css dojo.js jsVortexPage.js"
get_selection "Upload web html files? (Y/n)";
if [ "$selection" == "y" ]; then
	echo "Uploading web html files..";
	scp ${html_files} "${sitelocation}:www/jsVortex"
fi

# upload web content images
web_images="images/page-rule.png \
	images/aspl-alt-logo-large.png \
	images/firefox-ask-user-permission-es.png \
	images/firefox-ask-user-permission-en.png \
	images/jsvortex-logo-large.png \
	images/aspl-alt-logo.png \
	images/firefox-signed-applets.png \
	images/firefox-about-config.png \
	images/jsvortex-logo.png \
	images/beep.png \
	images/news.png \
	images/about.png \
	images/download.png \
	images/professional.png \
	images/doc.png \
	images/start.png \
	images/content-end.png \
	images/content-begin.png \
	images/head-end.png \
	images/head-begin.png \
	images/head-middle.png \
	images/page-content-rule.png \
	images/content-middle.png"

get_selection "Upload web images? (Y/n)";
if [ "$selection" == "y" ]; then
	echo "Uploading web images..";
	scp ${web_images} "${sitelocation}:www/jsVortex/images"
fi

get_selection "Upload jsVortex API documentation? (Y/n)";
if [ "$selection" == "y" ]; then
	echo "Uploading jsVortex API documentation..";
	cd ../doc; rm -rf html; make; 
	scp -r ../doc/html/* "${sitelocation}:www/jsVortex/docs"
fi

get_selection "Upload jsVortex source files? (Y/n)";
if [ "$selection" == "y" ]; then
	echo "Uploading jsVortex source files..";
	scp ../src/*.js "${sitelocation}:www/jsVortex/src/"
fi


