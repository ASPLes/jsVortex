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
 * mapping (\ref VortexTCPTransport) but it is expected to support other browsers and transport
 * mappings, especially Websocket.
 *
 * Currently jsVortex it provides and implements the following features:
 *
 * - Almost all core BEEP protocol is supported (still missing ANS/NUL
 * frame support). MSG, ERR and RPY frames are fully supported,
 * including SEQ frame (RFC3081).
 *
 * - Support TLS profile.
 * - Support SASL profiles: PLAIN and ANONYMOUS
 *
 * jsVortex is being developed using a regression test suite (using
 * http://www.dojotoolkit.org) to check and ensure all functions implemented are stable across
 * releases. See it in action at: http://www.aspl.es/jsVortex/testConnect.html
 *
 *
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
 * \section jsvortex_tutorial_intro Introduction (a quick guide)
 *
 * Before starting, if you are new to BEEP you have to know first something about its basic
 * concepts. It is recommended to take a look into the Vortex Library
 * 1.1 BEEP introduction (especially Section 1): http://www.aspl.es/fact/files/af-arch/vortex-1.1/html/starting_to_program.html
 *
 * That introduction includes useful information about BEEP and how
 * its elements are used together to enable you using and developing
 * BEEP enabled products.
 *
 * \section jsvortex_manual_creating_a_connection Creating a BEEP connection with jsVortex
 *
 * To start with BEEP you have to create a session with a
 * listener. For this quick tutorial you can use vortex-regression-listener (
 * it's the Vortex Library regression test server) but any BEEP server will do
 * (http://www.turbulence.ws).
 *
 * \code
 * function createConnection () {
 *     // create a BEEP connection against localhost:44010
 *     new VortexConnection (
 *         "localhost",
 *         "44010",
 *         new VortexTCPTransport (),
 *         connectionCreatedHandler, null);
 *
 *     // now jsVortex engine will notify connection created status
 *     // on handler connectionCreatedHandler
 * }
 * \endcode
 *
 * Previous piece of code will create a BEEP session to a BEEP peer
 * located at localhost:44010. It will do all greetings negotiation and,
 * if remote peer accepts the connection, then a working connection will be created.
 *
 * Due to the nature of Javascript execution context, this call will
 * return immediatly, notifying connection result on: \ref VortexConnection.connectionCreatedHandler.param.
 * For your application management you can store the reference returned by new \ref VortexConnection, but this
 * reference must not be used until notified by \ref VortexConnection.connectionCreatedHandler.param.
 *
 * Reached this point, your web application will receive the connection created at the handler
 * <b>connectionCreatedHandler</b> previously configured:
 *
 * \code
 * function connectionCreatedHandler (conn) {
 *     // check here connection status
 *     if (! conn.isOk ()) {
 *          // failed to connect, do some logging
 *          document.write ("<p>Connection to " + conn.host + ":" + conn.port + ", have failed: <p>");
 *          while (conn.hasErrors ()) {
 *               document.write ("<p>error found: " + conn.popError () + " </p>");
 *          }
 *     }
 *     // NICE: connection created
 *     document.write ("<p>Connection to " + conn.host + ":" + conn.port + ", created OK");
 * }
 * \endcode
 *
 * \note Obviously previous example uses <b>document.write</b> which is, in most cases, not the best
 * option for doing application logging. For example, if you can get firebug (http://getfirebug.org)
 * and use console.{log,warn,error} functions to do a better logging.
 *
 * \section jsvortex_manual_creating_a_channel Creating a BEEP channel with jsVortex
 *
 * After a successful connection creation, it is required to create a channel (\ref VortexChannel),
 * running a particular profile (\ref VortexChannel.profile) to exchange data. For this tutorial we will
 * use the <i>"echo profile"</i> used by vortex-regression-listener: \noref <b>http://iana.org/beep/transient/vortex-regression</b>.
 * This profile replies to all messages received with the same content, doing an "echo".
 *
 * At the end, the BEEP channel is the responsible of sending and receiving MIME
 * messages (formed by frames \ref VortexFrame) while the connection (\ref VortexConnection)
 * provides the abstraction to control all running channels, authentication and connection security.
 *
 * Now we open the channel with the following:
 *
 * \code
 * // open a channel running the profile http://iana.org/beep/transient/vortex-regression
 * conn.openChannel ({
 *      profile: "http://iana.org/beep/transient/vortex-regression",
 *      // request jsVortex to assign next available number
 *      channelNumber: 0,
 *      // configure the handler to be called on channel created
 *      onChannelCreatedHandler : channelCreated,
 * });
 * \endcode
 *
 * Previous code will ask to open a new channel running the profile configured
 * and it will notify channel created on the handler
 * (\ref VortexConnection.openChannel.params.onChannelCreatedHandler.param) configured,
 * in this case: <b>channelCreated</b>.	On that handler we should do something like:
 *
 * \code
 * function channelCreated (channelCreatedData) {
 *    if (channelCreatedData.channel == null) {
 *         // channel creation failed. Reply status
 *         document.write ("<p>Failed to create channel, reply code received: " + channelCreatedData.replyCode + ", textual error: " + channelCreatedData.replyMsg + "</p>");
 *         return;
 *    }
 *
 *    // reached this point, channel is created. Now, we are prepared to send and received content.
 * }
 * \endcode
 *
 * \note It is by no mean required to use profile names using \noref <b>http://</b>. In fact, this is a practice
 * deprecated in favor of URN references (for example <b>urn:your-company:beep:profiles:your-profile-name</b>).
 * However, at the time vortex-regression-listener was created, the common practise was using <b>http://</b>.
 * Having said that, you can safely use any unique string identifier as long as it is different from other's profiles id.
 *
 * \section jsvortex_manual_sending_messages Sending messages over a channel
 *
 * Now we have created the channel we can send and receive messages.
 * In BEEP a peer can issue messages and receive its replies, but that peer can also
 * receive messages issued by the remote peer. This is important:
 *
 * \note BEEP is peer oriented, there is no client or server concept but initiator and
 * listener with the only intention to differenciate what peer created the connection. After
 * that point, both peers, initiator and listener, can create channels and issue messages, and as such, both peers but be prepared
 * for this situation.
 *
 * For now, we will cover the traditional request-response pattern, where the
 * client issue a message and the server replies with some content.
 *
 */
