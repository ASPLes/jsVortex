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

if (typeof Vortex == "undefined") {
    /**
     * @brief Base functions used by jsVortex implementation. Vortex
     * module includes logging functions and support code to load required
     * content.
     */
    var Vortex = {
	/**
	 * @brief Logs a message to the console.log method defined. In
	 * the case Firebug is not available, nothing is showed. You can hook
	 * to this function to define your own logging function.
	 *
	 * @param message {String} The message to be showed.
	 */
	log: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.logEnabled)
		return;
	    /* do log */
	    console.log (message);
	},
	/**
	 * @brief Logs a second level message to the console.log
	 * method defined. This second level is considered a more detailed log
	 * which in general is not required. In the case Firebug is not
	 * available, nothing is showed. You can hook to this function to
	 * define your own logging function.
	 *
	 * @param message {String} The message to be showed.
	 */
	log2: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.log2Enabled)
		return;
	    /* do log */
	    console.log (message);
	},
	/**
	 * @brief Logs a message to the console.error method defined. In
	 * the case Firebug is not available, nothing is showed. You can hook
	 * to this function to define your own logging function.
	 *
	 * @param message {String} The error message to be showed.
	 */
	error: function (message) {
	    /* check if log is enabled */
	    if (! Vortex.logEnabled)
		return;
	    /* do log */
	    console.error (message);
	},
	/**
	 * @brief Logs a message to the console.warn method
	 * defined. In the case Firebug is not available, nothing is
	 * showed. You can hook to this function to define your own logging
	 * function.
	 *
	 * @param message {String} The warn message to be showed.
	 */
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
 * @param basepath {String} is the base location where
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
    Vortex.loadJs (basepath + "VortexSASLEnginePlain.js");
    Vortex.loadJs (basepath + "VortexSASLEngineAnonymous.js");

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
 * @internal
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

/**
 * \startpage jsVortex: An Open Source Javascript BEEP
 * (RFC3080/RFC3081) implementation
 *
 * \section intro Introduction
 *
 * jsVortex is javascript implementation of the BEEP protocol
 * specially designed to work in the context of a web
 * browser. Currently it is only supported Firefox, using a direct TCP
 * mapping but it is expected to support other browser and transport
 * mappings, especially Websocket.
 *
 * Currently jsVortex it provides or implements the following features:
 *
 * - Almost all core BEEP protocol is supported (still missing ANS/NUL
 * frame support). MSG, ERR and RPY frames are fully supported,
 * including SEQ frame (RFC3081).
 *
 * - Support TLS profile.
 * - Support SASL profiles: PLAIN and ANONYMOUS
 *
 * jsVortex is being developed using a regression test suite (using
 * http://www.dojotoolkit.org) to check and ensure all function implemented is stable across
 * releases. See it in action at: http://www.aspl.es/jsVortex/testConnect.html
 *
 * See the following documents for more information:
 *
 * - \ref jsvortex_license
 * - \ref jsvortex_manual
 * - \ref classes_and_modules
 *
 */

/**
 * \page jsvortex_license jsVortex License
 *
 * \section jsvortex_license_intro License used by the project
 *
 * All source code, utils, script and material associated to jsVortex
 * is license under the terms of the LGPL 2.1. You can get a full
 * english copy of this license at: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 *
 * \section jsvortex_license_implications jsVortex license implications
 *
 * In simple terms, this license allows you:
 *
 * - To create open source and closed source (also known as
 * proprietary) projects that uses jsVortex as part of its function.
 *
 * - In the case some modification is done to jsVortex, specially on
 * its API, this change must be returned back to the main official
 * jsVortex repository (the best approach) or to be provided to your
 * end users, including changes introduced along with the jsVortex
 * distribution with all the instructions required to apply the
 * modification.
 *
 * - You can't use the image of the jsVortex project or ASPL company
 * in form that is confused with your project image. End users must
 * not be confused in any form about these points.
 *
 */

/**
 * \page jsvortex_manual jsVortex Manual
 *
 * \section jsvortex_tutorial_intro Introduction
 *
 * This is some test...
 */
