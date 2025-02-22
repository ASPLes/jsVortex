/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
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
	warn: function () {},
	dir: function () {}
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
	log2Enabled : false,
	/**
	 * @internal flag used to signal vortex that should load its
	 * components file by file or assuming all jsVortex is inside
	 * a single file. Do not touch this variable.
	 */
	singleFile : false
    };
}

/**
 * @brief Loads all required vortex sources.
 *
 * @param basepath {String} is the base location where
 * all jsVortex sources are located.
 */
Vortex.load = function (basepath) {

    /* check if we have already loaded all jsVortex due to shrinksafe version used */
    if (Vortex.singleFile)
	return;

    /** start **/
    if (typeof basepath == "undefined") {
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
 * browser. Currently all major browsers are supported: Firefox,
 * Internet Explorer, Google Chrome, Safari and Opera using the
 * JavaSocketConnector bundled, but it is expected to support other
 * browsers and transport mappings, especially Websocket.
 *
 * Currently jsVortex provides and implements the following features:
 *
 * - Almost all core BEEP protocol is supported (still missing ANS/NUL
 * frame support). MSG, ERR and RPY frames are fully supported,
 * including SEQ frame (RFC3081).
 *
 * - TLS profile support.
 * - Supported SASL profiles: PLAIN and ANONYMOUS
 * - Full MIME support.
 *
 * jsVortex is being developed using a regression test suite (using
 * http://www.dojotoolkit.org) to check and ensure all functions implemented are stable across
 * releases. The objective is to deliver a professional and commercial grade Javascript BEEP implementation that ensures its function on each release done.
 *
 * See the following documents to know more about jsVortex API and its function:
 *
 * - \ref jsvortex_license
 * - \ref jsvortex_manual
 * - \ref classes_and_modules
 * - \ref jsvortex_common_errors
 *
 * \section community_support Community support
 *
 * Community assisted support is provided through Vortex Library mailing list located at: http://lists.aspl.es/cgi-bin/mailman/listinfo/vortex.
 * 
 * \section professional_support Professional ensured support
 *
 * <a href="http://www.aspl.es">ASPL</a> provides professional support
 * for jsVortex inside <i><b>Vortex Library Tech Support program</b></i>. See the
 * following for more information: http://www.aspl.es/jsVortex/professional.html
 *
 *
 *
 */

/**
 * \page jsvortex_license jsVortex License
 *
 * \section jsvortex_license_intro License used by the project
 *
 * All source code, utils, script and material associated to jsVortex
 * is license under the terms of the LGPL 2.1. You can get a full
 * English copy of this license at: http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 *
 * \section jsvortex_license_implications jsVortex license implications
 *
 * In simple terms, this license allows you:
 *
 * - To create open source and closed source (also known as
 * proprietary) projects that uses jsVortex as part of its function without having to buy a license.
 *
 * - In the case some modification is done to jsVortex, especially to
 * its API, this change must be returned back to the main official
 * jsVortex repository (the best approach) or to be provided to your
 * end users, including changes introduced along with the jsVortex
 * distribution with all the instructions required to apply the
 * modification. In other words, your end users must be able to get your
 * modifications either because they were included in the official jsVortex
 * repository or because they are available along with the software acquired.
 *
 * - You can't use the image of the jsVortex project or ASPL company
 * in form that is confused with your project image. End users must
 * not be confused in any form about these points.
 *
 *
 */

/**
 * \page jsvortex_manual jsVortex Manual
 *
 * \section# jsvortex_manual_index Index
 *
 * <ol>
 *   <li><b>Introduction:</b>
 *    - \ref jsvortex_manual_intro
 *    - \ref jsvortex_manual_creating_a_connection
 *    - \ref jsvortex_manual_creating_a_channel
 *    - \ref jsvortex_manual_sending_messages
 *   </li><!-- test -->
 *
 *   <li><b>Session authentication and protection</b><br />
 *    - \ref jsvortex_manual_sasl_auth
 *    - \ref jsvortex_manual_tls
 *   </li>
 * </ol>
 *
 * \section jsvortex_manual_intro Introduction (a quick guide)
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
 * return immediately, notifying connection result on: \ref VortexConnection.connectionCreatedHandler.param.
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
 *      onChannelCreatedHandler : channelCreated
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
 *         document.write ("<p>Failed to create channel, reply code received: " + channelCreatedData.replyCode +
 *                         ", textual error: " + channelCreatedData.replyMsg + "</p>");
 *         return;
 *    }
 *
 *    // reached this point, channel is created. Now, we are prepared to send and received content.
 *    var channel = channelCreatedData.channel;
 * }
 * \endcode
 *
 * \note It is by no mean required to use profile names using \noref <b>http://</b>. In fact, this is a practice
 * deprecated in favor of URN references (for example <b>urn:your-company:beep:profiles:your-profile-name</b>).
 * However, at the time vortex-regression-listener was created, the common practise was using \noref <b>http://</b>.
 * Having said that, you can safely use any unique string identifier as long as it is different from other's profiles id.
 *
 * \section jsvortex_manual_sending_messages Sending messages over a channel
 *
 * Now we have created the channel we can send and receive messages.
 * In BEEP a peer can issue messages and receive its replies, but that peer can also
 * receive messages issued by the remote peer. This is important:
 *
 * \note BEEP is peer oriented, there is no client or server concept but initiator and
 * listener with the only intention to differentiate what peer created the connection. After
 * that point, both peers, initiator and listener, can create channels and issue messages, and as such, both peers must be prepared
 * for this situation.
 *
 * For now, we will cover the traditional request-response pattern, where the
 * client issue a message and the server replies with some content. BEEP has 5 predefined frame types that are used for different data interactions:
 *
 * - MSG frame is used as the basic frame request.
 *
 * - RPY frame is used to reply to a MSG frame received. A BEEP peer
 * can't init an interaction with this frame (there is an exception,
 * inside greetings, but this is only informative, in practical terms
 * there is no exception for this rule).
 *
 * - ERR frame is used to reply to a MSG frame received in an negative
 * way. Again, a BEEP peer can't init an interaction with this
 * frame. It is also important to note that some profiles uses ERR
 * message as a way to notify error replies but other profiles still
 * use MSG/RPY interaction implementing the error handling inside the
 * body exchanged. BEEP do not enforce how to implement error handling and error reply.
 *
 * - ANS frame is used to implement a one-to-many reply style to a MSG
 * frame received. The NUL frame is used to finish such reply.
 *
 * Now we know BEEP frame types, we will use MSG/RPY basic interaction like follows:
 *
 * \code
 * // with the channel we have created in previous example, we configure the
 * // frame received handler (you can configure it at openChannel):
 * channel.onFrameReceivedHandler = frameReceived;
 * channel.onFrameReceivedContext = this; // this provides a context for frameReceived
 *                                        // it is not required.
 *
 * // now send a MSG frame
 * channel.sendMSG ("BEEP rocks!");
 * \endcode
 *
 * Now, when the reply arrives, a call to the handler <b>frameReceived</b> will process the content as follows:
 *
 * \code
 * function frameReceived (received) {
 *     // received object contains a reference to frame, channel and conn (connection)
 *     var frame   = received.frame;
 *
 *     // show content received
 *     document.write ("<p>Received frame with type: " + frame.type + ", and content: " + frame.content + "</p>");
 * }
 * \endcode
 *
 * \section jsvortex_manual_sasl_auth Using SASL to authenticate BEEP peers
 *
 * BEEP has built-in support for peer authentication using SASL framework. This provides session central
 * authentication making all channels running on the same connection to be bound to such authentication
 * credentials.
 *
 * Currently jsVortex supports SASL PLAIN and ANONYMOUS mechanism. The first, PLAIN, is the most usual
 * for simple user/password authentication. Keep in mind that it should be combined with TLS profile since
 * all auth exchange goes uncyphered over the wire.
 *
 * ANONYMOUS mechanism is provided to support such services (like anonymous FTP) that may require
 * public anonymous access but still requires a tracking string.
 *
 * For now, we will concentrate on SASL PLAIN. The idea with SASL is that you use the same activation
 * code (or really similar) to enable authentication. Thus, enabling PLAIN or CRAM-MD5 requires from
 * the developer the same steps because SASL framework hides all the details that makes each mechanism different.
 *
 * First, you'll have to connect to a BEEP listener. Once you have a connection created, SASL
 * authentication is enabled as follows:
 *
 * \code
 * // assuming "conn" is a BEEP connection created with new VortexConnection ()
 * conn.saslAuth ({
 *    // request sasl PLAIN mechanism
 *    mech: "PLAIN",
 *    // provides authentication crendentials
 *    authenticationId: "alice",
 *    password: "mySecretPassword",
 *    // provide notification handlers
 *    onAuthFinishedHandler: saslAuthFinished,
 *    onAuthFinishedContext: this
 * });
 * \endcode
 *
 * Once the authentication process finishes, the handler <b>onAuthFinishedHandler</b> is called.
 * Here is a template to check auth status:
 *
 * \code
 * function saslAuthFinished (saslResult) {
 *    // check sasl status
 *    if (! saslResult.status) {
 *        document.write ("<p>SASL auth failed, error reported: " + saslResult.statusMsg + "</p>");
 *        return;
 *    }
 *
 *    // Once SASL auth finish, the connection remains authenticated with the Id
 *    // provided. A connection can't be reauthenticated
 *    var conn = saslResult.conn;
 *
 *    document.write ("<p>Connection is authenticated? " + conn.isAuthenticated + "</p>");
 * }
 * \endcode
 *
 * \section jsvortex_manual_tls Using TLS to secure a BEEP session
 *
 * Once you have connected to remote BEEP server (see \ref jsvortex_manual_creating_a_connection),
 * you can secure the session using TLS. Here is how:
 *
 * \code
 *  // with a working session (conn), enable TLS
 *  conn.enableTLS ({
 *	// provide initial handlers to configure TLS termination status
 *	onTLSFinishHandler : onTLSFinishHandler,
 *	onTLSFinishContext : someData,
 *	// always accept certificate errors
 *	trustPolicy : 3
 * });
 *
 * \endcode
 *
 * Now, inside onTLSFinishHandler handler, some code to handle TLS termination status:
 *
 * \code
 * function onTLSFinishHandler (tlsReply) {
 *
 *    // check connection status
 *    var conn = tlsReply.conn;
 *    if (! conn.isOk ()) {
 *	// some error reporting ..
 *	return false;
 *    }
 *
 *    // check TLS status
 *    if (! tlsReply.status) {
 *	// some tls error reporting..
 *	conn.shutdown ();
 *	return false;
 *    }
 *
 *    // ...Found TLS initial status OK, now you can create channels and exchange data as usual
 *    return;
 * }
 * \endcode
 *
 * 
 *
 */

/** 
 * \page jsvortex_common_errors Common errors and solutions
 * 
 * \section jsvortex_common_errors_calling_npobject On connect, we are getting an error like "error calling method on npobject"
 * 
 * This error may happen in all browsers because it is associated with the java engine itself.
 * 
 * This is because your browsers is caching an old version of the
 * JavaSocketApplet or the javascript code is not synchronized with
 * the applet. 
 * 
 * To solve it, do the following:
 * 
 * 1) Close all your browsers instances to ensure your browsers releases the applet loaded.
 * 
 * 2) Then launch the java control panel:
 *    - On Windows, get inside control panel and launch java control panel
 *    - On Linux, run the command:  "ControlPanel"
 *    - On Mac, click Macintosh HD > Applications > Utilities > Java > Java Plugin Settings
 * 
 * 3) Then select in the general tab, under the section "Internet
 * temporal archives", click on "Configure" and then click to "remove
 * files".  
 * 
 * 4) Start your browsers and check again to connect with jsVortex.
 * 
 * \section jsvortex_common_errors_no_applet_in_mac On MAC OS/X, the applet is not loaded 
 * 
 * Java applets is controlled in MAC via system update. You can
 * install/upgrade your java installation on MAC standalone. Update
 * your MAC to get latests updates until you get at least the
 * following version when you run the following command on MAC OS/X
 * terminal:
 * 
 * \code
 * >> java -version
 * java version "1.6.0_26"
 * \endcode
 * 
 * Once done, recheck your jsVortex enabled application.
 * 
 * \section jsvortex_common_errors_tls_failure_during_handshake I'm receiving a "TLS failure during handshake. Transport TLS failed." in the login
 * 
 * This is caused by an old jsVortex version which throws an exception
 * inside a method that wasn't called by old java runtimes. To fix the
 * issue use latest jsVortex. This is a known issue that was fixed in
 * 0.5.3 release.
 * 
 * \section jsvortex_common_errors_found_security_manager_is_denying_the_connection I'm receiving a "Found security manager is denying the connection: access denied ("java.net.Socket:Permission", "you-server-ip", "connect,resolve")
 * 
 * This error has to do with some of the following reasons:
 * 
 * - 1) A firewall is blocking the connection to your server.
 * - 2) Your applet is using a proxy (not supported yet).
 * - 3) Or because your applet is not able to resolve the server name you are connecting to.
 * - 4) Or because there is a problem with the cache that is making your browser to use an old jsVortex applet.
 * 
 * To solve the the issue check the following:
 * 
 * 1) Ensure you can run a plain "telnet" against the host and port you are using to connect with jsVortex to ensure your applet will be able to connect too. This will spot if this is a connection blocked problem or a name resolution problem.
 * 
 * 2) Ensure you aren't using a proxy. For that, run the Java control panel (ControlPanel command in linux, Control panel -> Java). Once inside, inside "General" tab, "Network configuration" and then check "Use direct connect".
 * 
 * 3) If the problem persists, clear your browser and Java cache , and the close all instances before trying again.
 */

/**
 * \page jsvortex_regression_test How to configure a local jsVortex regression test
 *
 * \section jsvortex_regression_test_intro Introduction
 *
 * The following are the set of instructions to configure a regression test environment
 * in your local network. To do so, you have to prepare a vortex library installation,
 * an apache (or similar) and the dojo stuff required by the regression test panel.
 *
 * \section jsvortex_regression_test_preparing Preparation
 *
 * <ol>
 *  <li>First, you have to configure an HTTP server to load the panel and jsVortex sources.
 *      You can use the example found at: https://dolphin.aspl.es/svn/publico/af-arch/trunk/jsVortex/doc/jsvortex-regtest.apache2.conf.
 *
 *  Once you have configured it, make sure you can access the regression test page using an
 *  URL similar to http://jsvortex-regtest/jsVortex/test/testConnect.html. It is assumed you are
 *  using <b>jsvortex-regtest</b> as host name, but this can be any other value. The important
 *  element to meet is the url pattern above. Do not worry if the panel does not load properly.
 *  This is expected.
 * </li>
 *
 *
 * <li>Now, you have to prepare all dojo stuff (http://www.dojotoolkit.org). The following
 * steps shows you how to download dojo into test/ directory where testConnect.html is
 * located:
 *
 * \code
 * >> cd test/
 * >> wget http://download.dojotoolkit.org/release-1.4.3/dojo-release-1.4.3.tar.gz
 * >> mv dojo-release-1.4.3 dojoroot
 * \endcode
 *
 * </li>
 *
 * <li>Now, we have to place all jsVortex sources in a sibling directory to <b>test/</b>,
 * called <b>src/</b>. That is, testConnect.html is expecting to find Vortex.js at the
 * following URL: http://jsvortex-regtest/jsVortex/src/Vortex.js</li>
 *
 * <li>Now, you'll have to download latest Vortex Library 1.1 and install it on the
 * system that will act as server. Follow instructions indicated at http://www.aspl.es/vortex.
 * Once you have Vortex Library installed, you must run regression test server found inside Vortex
 * Library <b>test/</b> directory.
 *
 * \code
 * >> ./vortex-regression-test
 * \endcode
 *
 * <li>If you did properly configure everything you should be able to load regression
 * test from http://jsvortex-regtest/jsVortex/test/testConnect.html, using as host the
 * listener running <b>vortex-regression-test</b> and port <b>44010</b>.
 * </li>
 *
 * </ol>
 *
 */