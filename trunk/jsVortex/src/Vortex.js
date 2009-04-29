/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @internal Definition to define empty console.log members in the
 * case we don't have firebug.
 */
if (typeof console == "undefined") {
    this.console = {
	log: function () {},
	error: function () {},
	warn: function () {}
    };
}

/**
 * @brief Check for console log to define it. This is done because
 * having firebug disabled causes to stop processing the rest of the
 * document.
 */
if (typeof Vortex == "undefined") {
    this.Vortex = {
	log: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.logEnabled)
		return;
	    /* do log */
	    console.log (message);
	},
	error: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.logEnabled)
		return;
	    /* do log */
	    console.error (message);
	},
	warn: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.logEnabled)
		return;
	    /* do log */
	    console.warn (message);
	},
	/**
	 * @brief Default configuration, log disabled. 
	 */
	logEnabled : true
    };
}

/**
 * @brief Loads all required vortex sources.
 *
 * @param basepath [string] is the base location where
 * all jsVortex sources are located.
 */
Vortex.Load = function (basepath) {
    /**
     * @internal function used by load method to load rest of
     * files associated to jsVortex.
     */
    function VortexLoadJs (filename){
	var fileref  = document.createElement('script');
	fileref.type = "text/javascript";
	fileref.src  = filename;

	console.log ("Vortex: loading file: " + filename + ", status: " + (typeof fileref));

	if (typeof fileref != "undefined")
	    document.getElementsByTagName("head")[0].appendChild(fileref);
	return;
    } /* end vortexLoadJs */

    /** start **/
    if (basepath == "undefined") {
	basepath = "";
    } else if (basepath[basepath.length - 1] != "/") {
	basepath = basepath + "/";
    }

    console.log ("Vortex: loading jsVortex from: " + basepath);
    VortexLoadJs (basepath + "VortexTCPTransport.js");
    VortexLoadJs (basepath + "VortexConnection.js");
    VortexLoadJs (basepath + "VortexChannel.js");
    VortexLoadJs (basepath + "VortexEngine.js");
    VortexLoadJs (basepath + "VortexXMLEngine.js");
    VortexLoadJs (basepath + "VortexFrame.js");
    VortexLoadJs (basepath + "VortexMimeHeader.js");

    return;
};

/**
 * The following code tries to figure the baseurl used to load Vortex.js
 * so the rest of files can be loaded.
 */
Vortex.log ("Vortex: found vortex header, loading rest of files..");
var scripts = document.getElementsByTagName("script");
var rePkg = /Vortex\.js(\W|$)/i;
for (var iterator = 0; iterator < scripts.length; iterator++) {
    /* get <script src=""> content */
    var src = scripts[iterator].getAttribute("src");
    if(!src)
	continue;
    Vortex.log ("Vortex: found src: " + src);

    var match = src.match(rePkg);
    if (match) {
	var baseurl = src.substring(0, match.index);
	Vortex.log ("Vortex base path: " + baseurl);

	/* now load rest of Vortex components */
	Vortex.Load (baseurl);
	break;
    }
} /* end for */

