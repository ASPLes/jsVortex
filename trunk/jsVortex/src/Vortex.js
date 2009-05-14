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
	log2: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.log2Enabled)
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
	logEnabled : true,
	/**
	 * @brief By default second level log disabled.
	 */
	log2Enabled : false
    };
}

/**
 * @brief Loads all required vortex sources.
 *
 * @param basepath [string] is the base location where
 * all jsVortex sources are located.
 */
Vortex.load = function (basepath) {

    /** start **/
    if (basepath == "undefined") {
	basepath = "";
    } else if (basepath[basepath.length - 1] != "/") {
	basepath = basepath + "/";
    }

    /* store base path */
    Vortex.basepath = basepath;

    console.log ("Vortex: loading jsVortex from: " + Vortex.basepath);
    Vortex.loadJs (basepath + "VortexTCPTransport.js");
    Vortex.loadJs (basepath + "VortexConnection.js");
    Vortex.loadJs (basepath + "VortexChannel.js");
    Vortex.loadJs (basepath + "VortexEngine.js");
    Vortex.loadJs (basepath + "VortexXMLEngine.js");
    Vortex.loadJs (basepath + "VortexFrame.js");
    Vortex.loadJs (basepath + "VortexMimeHeader.js");
    Vortex.loadJs (basepath + "VortexSASLEngine.js");

    return;
};

/**
 * @internal function used by load method to load rest of
 * files associated to jsVortex.
 */
Vortex.loadJs = function (filename){
    var fileref  = document.createElement('script');
    fileref.type = "text/javascript";
    fileref.src  = filename;

    console.log ("Vortex: loading file: " + filename + ", status: " + (typeof fileref));

    if (typeof fileref != "undefined")
	document.getElementsByTagName("head")[0].appendChild(fileref);
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
	Vortex.load (baseurl);
	break;
    }
} /* end for */

