/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Basic profile which allows to open channels
 * and send content that is replied by remote side. This is an
 * echo profile.
 */
var REGRESSION_URI      = "http://iana.org/beep/transient/vortex-regression";

/**
 * @brief Profile used to check channel start denial.
 */
var REGRESSION_URI_DENY = "http://iana.org/beep/transient/vortex-regression/deny";

/**
 * @brief Profile used to check support to receive
 * messages from remote peer just after channel creation.
 */
var REGRESSION_URI_FAST_SEND = "http://iana.org/beep/transient/vortex-regression/fast-send";

/**
 * @brief Profile used to check support for connection lost during
 * operation normal operation (frame received, start channel and close
 * channel).
 */
var REGRESSION_URI_SUDDENTLY_CLOSE = "http://iana.org/beep/transient/vortex-regression/suddently-close";


/******* BEGIN: testUtf8Messages ******/
function testUtf8Messages () {
    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testUtf8Messages.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testUtf8Messages.Result = function (conn) {

    /* check connection status */
    if (! checkConnection (conn))
	return false;

    log ("info", "Open a channel to send utf-8");
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testUtf8Messages.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testUtf8Messages.channelCreated = function (replyData) {

    log ("info", "Channel creation reply received, checking data..");

    /* check channel status */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation with serverName associated");
	return false;
    }

    /* configure frame received to get remote serverName configured */
    channel.onFrameReceivedHandler = testUtf8Messages.frameReceived;
    channel.onFrameReceivedContext = this;

    log ("info", "Sending unicode content and checking reply size...");

    /* send content */
    testUtf8Messages.message = "Sending camión con avión y cigüeña..";
    if (! channel.sendMSG (testUtf8Messages.message, null)) {
	log ("error", "To be able to send");
	return false;
    }

    return true;
};

testUtf8Messages.frameReceived = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return false;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != testUtf8Messages.message) {
	log ("error", "Expected to find content: " + testUtf8Messages.message + ", but found: " + frame.content);
	return false;
    }

    log ("info", "Utf bytes sent!");

    /* configure frame received to get remote serverName configured */
    frameReceived.channel.onFrameReceivedHandler = testUtf8Messages.checkCount;
    frameReceived.channel.onFrameReceivedContext = this;

    /* ok, now request to to count bytes and check result */
    if (! frameReceived.channel.sendMSG ("count bytes: " + testUtf8Messages.message, null)) {
	log ("error", "Unable to send message to request counting bytes..");
	return false;
    } /* end if */

    return true;

};

testUtf8Messages.checkCount = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != "41") {
	log ("error", "Expected to find content content count 41 bytes (unicode) but found: " + frame.content);
	return;
    }

    /* shutdown connection */
    conn.shutdown ();

    /* go to next test */
    this.nextTest ();
    return;
};

/******* END: testUtf8Messages ******/

/******* BEGIN: testUtf8Messages2 ******/
function testUtf8Messages2 () {
    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testUtf8Messages2.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testUtf8Messages2.Result = function (conn) {

    /* check connection status */
    if (! checkConnection (conn))
	return false;

    log ("info", "Open a channel to send utf-8");
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testUtf8Messages2.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testUtf8Messages2.channelCreated = function (replyData) {

    log ("info", "Channel creation reply received, checking data..");

    /* check channel status */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation with serverName associated");
	return false;
    }

    /* configure frame received to get remote serverName configured */
    channel.onFrameReceivedHandler = testUtf8Messages2.frameReceived;
    channel.onFrameReceivedContext = this;

    log ("info", "Sending unicode content and checking reply size...");

    /* send content */
    testUtf8Messages2.message = "Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..Sending camión con avión y cigüeña..";
    if (! channel.sendMSG (testUtf8Messages2.message, null)) {
	log ("error", "To be able to send");
	return false;
    }

    return true;
};

testUtf8Messages2.frameReceived = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return false;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != testUtf8Messages2.message) {
	log ("error", "Expected to find content: " + testUtf8Messages2.message + ", but found: " + frame.content);
	return false;
    }

    log ("info", "Utf bytes sent!");

    /* configure frame received to get remote serverName configured */
    frameReceived.channel.onFrameReceivedHandler = testUtf8Messages2.checkCount;
    frameReceived.channel.onFrameReceivedContext = this;

    /* ok, now request to to count bytes and check result */
    if (! frameReceived.channel.sendMSG ("count bytes: " + testUtf8Messages2.message, null)) {
	log ("error", "Unable to send message to request counting bytes..");
	return false;
    } /* end if */

    return true;

};

testUtf8Messages2.checkCount = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != "4521") {
	log ("error", "Expected to find content content count 4521 bytes (unicode) but found: " + frame.content);
	return;
    }

    /* go to next test */
    this.nextTest ();
    return;
};

/******* END: testUtf8Messages2 ******/

/******* BEGIN: testTlsProfileHandleError ******/
function testTlsProfileHandleError () {

    /* skip this test for WebSocket */
    log ("info", "Checking test with transport: " + VortexTCPTransport.useTransport);
    if (VortexTCPTransport.useTransport == 3) {
	this.nextTest ();
	return;
    } /* end if */

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testTlsProfileHandleError.connectionResult, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return;
}

testTlsProfileHandleError.connectionResult = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    log ("info", "Connection, now openinig TLS channel");
    conn.enableTLS ({
	/* provide initial handlers to configure TLS termination status */
	onTLSFinishHandler : testTlsProfile.onTLSFinishHandler,
	onTLSFinishContext : this,
	/* ask on certificate error */
	trustPolicy : 2,
	/* certificate error handling */
	onCertError : testTlsProfileHandleError.onCertError
    });

    return true;
};

testTlsProfileHandleError.onCertError = function (subject, issuer, cert) {

    log ("info", "Received notification to handle cert error: subject: " + subject);
    Vortex.log ("   Certificate: " + subject);
    var expectedSubject = 'EMAILADDRESS=vortex-tech-support@aspl.es, CN=localhost, OU=TI Support, O="Advanced Software Production Line, S.L.", L=Alcala de Henares, ST=Madrid, C=ES';
    Vortex.log ("Expected value: " + expectedSubject);
    if (subject == expectedSubject)
	return true;
    log ("error", "Received an unexpected subject, failed to handle certificate error. Expected to find: " + expectedSubject + "<br>But received: " + subject);
    return false;
};

/******* END: testTlsProfileHandleError ******/

/******* BEGIN: testTlsProfileCertError ******/
function testTlsProfileCertError () {

    /* skip this test for WebSocket */
    log ("info", "Checking test with transport: " + VortexTCPTransport.useTransport);
    if (VortexTCPTransport.useTransport == 3) {
	this.nextTest ();
	return;
    } /* end if */

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testTlsProfileCertError.connectionResult, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return;
}

testTlsProfileCertError.connectionResult = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    log ("info", "Connection, now openinig TLS channel");
    conn.enableTLS ({
	/* provide initial handlers to configure TLS termination status */
	onTLSFinishHandler : testTlsProfileCertError.onTLSFinishHandler,
	onTLSFinishContext : this
    });

    return true;
};

testTlsProfileCertError.onTLSFinishHandler = function (tlsReply) {
    /* check certificate error */
    if (tlsReply.status) {
	log ("error", "Expected to find TLS activation error, but found proper status");
	return false;
    } /* end if */

    /* next test */
    this.nextTest ();
    return true;
};
/******* END: testTlsProfileCertError ******/

/******* BEGIN: testTlsProfile ******/
function testTlsProfile () {

    /* check for WebSocket */
    var prefix = "";
    var port   = this.port;
    if (VortexTCPTransport.useTransport == 3) {
	prefix = "wss://";
	port   = "44014";
    } /* end if */

    /* create a connection */
    var conn = new VortexConnection (
	prefix + this.host,
	port,
	new VortexTCPTransport (),
	testTlsProfile.connectionResult, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testTlsProfile.connectionResult = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    if (VortexTCPTransport.useTransport == 3) {
	/* check connection status */

	/* now test the session: now open a channel here to do some useful work */
	log ("info", "Now create a channel and transfer some content");
	conn.openChannel ({
	    profile: REGRESSION_URI,
	    channelNumber: 0,
	    onChannelCreatedHandler : testTlsProfile.channelCreated,
	    onChannelCreatedContext : this
	});
	return;
    }

    log ("info", "Connection, now openinig TLS channel");
    conn.enableTLS ({
	/* provide initial handlers to configure TLS termination status */
	onTLSFinishHandler : testTlsProfile.onTLSFinishHandler,
	onTLSFinishContext : this,
	/* always accept certificate errors */
	trustPolicy : 3
    });

    return true;
};

testTlsProfile.onTLSFinishHandler = function (tlsReply) {

    log ("info", "TLS Status received...");

    /* check connection status */
    var conn = tlsReply.conn;
    if (! checkConnection (conn)) {
	log ("error", "Expected to find proper connection, no matter TLS result, but found failure: ");
	return false;
    } /* end if */

    /* check TLS status */
    if (! tlsReply.status) {
	log ("error", "Expected to find proper TLS notification, but found failure: (rpyCode: " + tlsReply.replyCode + ") " + tlsReply.replyMsg + ", statusMsg: " + tlsReply.statusMsg);
	conn.shutdown ();
	return false;
    }
    log ("info", "Found TLS initial status OK, now checking rest of data");

    /* more checks here: issuer, common name, validation, etc */


    /* now test the session: now open a channel here to do some useful work */
    log ("info", "Now create a channel and transfer some content");
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testTlsProfile.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testTlsProfile.channelCreated = function (replyData) {
    /* log data received */
    log ("info", "Channel start reply code received: " +
	 replyData.replyCode + ", message: " + replyData.replyMsg);
    /* check reference */
    if (replyData.channel == null) {
	log ("error", "Expected to find proper channel reference, but found null. Errors found are:");
	showErrors (replyData.conn);
	return false;
    }

    /* check reply code */
    if (replyData.replyCode != "200") {
	log ("error", "Expected to find reply code to start channel equal to '200' but found: " + replyData.replyCode);
	return false;
    }

    /* send some content */
    log ("info", "Received reply code: " + replyData.replyCode + ", message: " + replyData.replyMsg);

    /* get a reference to the channel */
    var channel = replyData.channel;

    /* configure received handler here */
    channel.onFrameReceivedHandler = testContentTransfer.frameReceived;
    channel.onFrameReceivedContext = this;

    /* reset test */
    testContentTransfer.nextMsg  = 1;

    /* send content */
    log ("info", "Sending content (first message)");
    if (! channel.sendMSG (testContentTransfer.testMSG1)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "TLS: Expected complete send operation after first message, but found different status code: " + channel.lastStatusCode);
	return false;
    }

    log ("info", "Sending content (second message)");
    if (! channel.sendMSG (testContentTransfer.testMSG2)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (2)");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "TLS: Expected complete send operation after second message, but found different status code: " + channel.lastStatusCode);
	return false;
    }

    log ("info", "Sending content (third message)");
    if (! channel.sendMSG (testContentTransfer.testMSG3)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (3)");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "TLS: Expected complete send operation after third message, but found different status code: " + channel.lastStatusCode);
	return false;
    }

    /* check connection here */
    if (! replyData.conn.isOk ()) {
	log ("error", "Expected to find proper connection status after send operations but found a failure");
	showErrors (replyData.conn);
	this.stopTests = true;
	return false;
    } /* end if */

    return true;
}

/******* END: testTlsProfile ******/

/******* BEGIN: testSaslAnonymousFailure ******/
function testSaslAnonymousFailure () {

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSaslAnonymousFailure.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSaslAnonymousFailure.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "connection created, now being auth operation (ANONYMOUS) with failure expected");

    /* do auth operation */
    conn.saslAuth ({
	mech: "ANONYMOUS",
	/* anonymous token */
	anonymousToken: "test-fail@aspl.es",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testSaslAnonymousFailure.onAuthFinished,
	onAuthFinishedContext: this
    });

    return true;
};

testSaslAnonymousFailure.onAuthFinished = function (saslResult) {

    /* get a reference to the connection */
    var conn = saslResult.conn;

    /* check first connection status */
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection proper status no matter the SASL authentication result");
	this.stopTests = true;
	return false;
    } /* end if */

    /* check sasl authentication status */
    if (saslResult.status ) {
	log ("error", "Expected to find SASL ANONYMOUS authentication failure, but found authentication succeed: " + saslResult.statusMsg);

	/* close the connection */
	conn.shutdown ();

	return false;
    } /* end if */

    /* check connection authentication */
    if (conn.isAuthenticated != false) {
	log ("error", "Expected to find not authenticated SASL session but found flag activated: " + conn.isAuthenticated);
	return false;
    }

    /* check credentials */
    if (conn.anonymousToken == "test-fail@aspl.es") {
	log ("error", "Expected to not find proper authentication anonymous token, but found: " + conn.anonymousToken);
	return false;
    } /* end if */

    /* check channel error code */
    if (saslResult.replyCode != '535') {
	log ("error", "Expected to find authentication error code 535, but found something different: " + saslResult.replyCode);
	return false;
    } /* end if */

    /* close the connection */
    conn.shutdown ();

    /* next test */
    this.nextTest ();
    return true;
};
/******* END:   testSaslAnonymous ******/

/******* BEGIN: testUnsupportedSaslProfile ******/
function testUnsupportedSaslProfile () {

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testUnsupportedSaslProfile.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testUnsupportedSaslProfile.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "connection created, now try an unsupported sasl mechanism");

    /* do auth operation */
    conn.saslAuth ({
	mech: "UNSUPPORTED",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testUnsupportedSaslProfile.onAuthFinished,
	onAuthFinishedContext: this
    });

    return true;
};

testUnsupportedSaslProfile.onAuthFinished = function (saslResult) {

    /* get a reference to the connection */
    var conn = saslResult.conn;

    /* check first connection status */
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection proper status no matter the SASL authentication result");
	return false;
    } /* end if */

    /* check sasl authentication status */
    if (saslResult.status ) {
	log ("error", "Expected to find a failure due to requesting the use of an unsupported SASL mechanism: " + saslResult.statusMsg);

	/* close the connection */
	conn.shutdown ();

	return false;
    } /* end if */

    log ("info", "Status received: " + saslResult.statusMsg);

    /* check connection authentication */
    if (conn.isAuthenticated == true) {
	log ("error", "Expected to find SASL authentication failure with flag not activated: " + conn.isAuthenticated);
	return false;
    }

    /* close the connection */
    conn.shutdown ();

    /* next test */
    this.nextTest ();
    return true;
};
/******* END:   testUnsupportedSaslProfile ******/

/******* BEGIN: testSaslAnonymous ******/
function testSaslAnonymous () {

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSaslAnonymous.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSaslAnonymous.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "connection created, now being auth operation (ANONYMOUS)");

    /* do auth operation */
    conn.saslAuth ({
	mech: "ANONYMOUS",
	/* anonymous token */
	anonymousToken: "test@aspl.es",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testSaslAnonymous.onAuthFinished,
	onAuthFinishedContext: this
    });

    return true;
};

testSaslAnonymous.onAuthFinished = function (saslResult) {

    /* get a reference to the connection */
    var conn = saslResult.conn;

    /* check first connection status */
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection proper status no matter the SASL authentication result");
	return false;
    } /* end if */

    /* check sasl authentication status */
    if (! saslResult.status ) {
	log ("error", "Expected to find proper SASL ANONYMOUS authentication, but failure found: " + saslResult.statusMsg);

	/* close the connection */
	conn.shutdown ();

	return false;
    } /* end if */

    /* check connection authentication */
    if (conn.isAuthenticated != true) {
	log ("error", "Expected to find authenticated SASL session but found flag not activated: " + conn.isAuthenticated);
	return false;
    }

    /* check credentials */
    if (conn.anonymousToken != "test@aspl.es") {
	log ("error", "Expected to find proper authentication anonymous token, but found: " + conn.anonymousToken);
	return false;
    } /* end if */

    /* close the connection */
    conn.shutdown ();

    /* next test */
    this.nextTest ();
    return true;
};
/******* END:   testSaslAnonymous ******/

/******* BEGIN: testSaslPlainFailure ******/
function testSaslPlainFailure () {

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSaslPlainFailure.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSaslPlainFailure.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "connection created, now being auth operation");

    /* do auth operation */
    conn.saslAuth ({
	mech: "PLAIN",
	/* authentication id: the actual user credential */
	authenticationId: "evil-bob",
	/* password */
	password: "secret",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testSaslPlainFailure.onAuthFinished,
	onAuthFinishedContext: this
    });

    return true;
};

testSaslPlainFailure.onAuthFinished = function (saslResult) {

    /* get a reference to the connection */
    var conn = saslResult.conn;

    /* check first connection status */
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection proper status no matter the SASL authentication result");
	return false;
    } /* end if */

    /* check sasl authentication status */
    if (saslResult.status ) {
	log ("error", "Expected to find a SASL autentication failure but found: " + saslResult.statusMsg);

	/* close the connection */
	conn.shutdown ();

	return false;
    } /* end if */

    /* check connection authentication */
    if (conn.isAuthenticated || conn.isAuthenticated != false) {
	log ("error", "Expected to find unauthenticated SASL session but found flag activated: " + conn.isAuthenticated);
	return false;
    }

    /* check channel error code */
    if (saslResult.replyCode != '535') {
	log ("error", "Expected to find authentication error code 535, but found something different: " + saslResult.replyCode);
	return false;
    } /* end if */

    /* close the connection */
    conn.shutdown ();

    /* next test */
    this.nextTest ();
    return true;
};

/******* BEGIN: testSaslPlain ******/
function testSaslPlain () {

    /* create a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSaslPlain.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSaslPlain.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "connection created, now being auth operation");

    /* do auth operation */
    conn.saslAuth ({
	mech: "PLAIN",
	/* authentication id: the actual user credential */
	authenticationId: "bob",
	/* password */
	password: "secret",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testSaslPlain.onAuthFinished,
	onAuthFinishedContext: this
    });

    return true;
};

testSaslPlain.onAuthFinished = function (saslResult) {

    /* get a reference to the connection */
    var conn = saslResult.conn;

    /* check first connection status */
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection proper status no matter the SASL authentication result");
	return false;
    } /* end if */

    /* check sasl authentication status */
    if (! saslResult.status ) {
	log ("error", "Expected to find a proper sasl autentication operation but found a failure: " + saslResult.statusMsg);

	/* close the connection */
	conn.shutdown ();

	return false;
    } /* end if */

    log ("info", "Authentication ok!");

    /* check authentication status and information */
    if (! conn.isAuthenticated) {
	log ("error", "Expected to find proper authentication flag but it wasn't found");
	return false;
    } /* end if */

    log ("info", "Checking credentials...");

    /* check credentials */
    if (conn.authorizationId != "bob" ||
	conn.authenticationId != "bob") {
	/* report error */
	log ("error", "Expected to find proper authentication information associated to the connection, but a mismatch was found");
	return false;
    } /* end if */

    log ("info", "Credentials ok...");

    /* now check to perform again sasl operation */
    conn.saslAuth ({
	mech: "PLAIN",
	/* authentication id: the actual user credential */
	authenticationId: "evil-bob",
	/* password */
	password: "secret",
	/* notification handlers (and its context) */
	onAuthFinishedHandler: testSaslPlain.onAuthFinishedFailure,
	onAuthFinishedContext: this
    });

    return true;
};

testSaslPlain.onAuthFinishedFailure = function (saslResult) {

    log ("info", "Received reply, checking connection status..");

    /* check connection status */
    if (! checkConnection (saslResult.conn))
	return false;

    log ("info", "Checking expected sasl failure for a second auth try after a successful auth operation");

    /* check SASL status */
    if (saslResult.status) {
	log ("error", "Expected to find a failure because authentication already established.");
	return false;
    } /* end if */

    /* check here again all credentials */
    var conn = saslResult.conn;
    if (conn.authorizationId != "bob" ||
	conn.authenticationId != "bob") {
	/* report error */
	log ("error", "Expected to find proper authentication information associated to the connection, but a mismatch was found");
	return false;
    } /* end if */

    log ("info", "Credentials ok...");

    /* close the connection */
    conn.shutdown ();

    /* call for the next test */
    this.nextTest ();
    return true;
};

/******* END:   testSaslPlain ******/

/******* BEGIN: testOnConnectionClose ******/
function testOnConnectionClose () {

    /* open a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testOnConnectionClose.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;

}

testOnConnectionClose.Result = function (conn) {

    /* check connection status */
    if (! checkConnection (conn))
	return false;

    log ("info", "Connection created, now register a disconnected handler..");

    /* install on disconnect handlers */
    conn.onDisconnect (testOnConnectionClose.disconnected, this);

    log ("info", "Sending wrong content to activate connection close on remote side..");

    /* send wrong content to the remote side to force a connection
     close */
    conn._send ("This is a wrong BEEP content\r\n\r\n");

    return true;
};

testOnConnectionClose.disconnected = function (conn) {

    /* check connection status */
    if (conn.isOk ()) {
	log ("error", "Found connection status Ok when it was expected a failure");
	return false;
    } /* end if */

    log ("info", "Received connection close notification ok..");

    /* call to run next test */
    this.nextTest ();
    return true;
};

/******* END: testOnConnectionClose ******/

/******* BEGIN: testServerName *******/
function testServerName () {

    /* avoid running this test while running with webSocket */
    if (VortexTCPTransport.useTransport == 3) {
	/* call to execute next test */
	this.nextTest ();
	return;
    }

    /* open a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testServerName.Result, this);
}
testServerName.Result = function (conn) {

    /* check connection status */
    if (! checkConnection (conn))
	return false;

    log ("info", "Open a channel using serverName=dolphin.aspl.es");
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	serverName: "dolphin.aspl.es",
	onChannelCreatedHandler : testServerName.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testServerName.channelCreated = function (replyData) {

    log ("info", "Channel creation reply received, checking data..");

    /* check channel status */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation with serverName associated");
	return false;
    }

    log ("info", "Checking serverName configured..");

    /* check connection serverName */
    var conn = replyData.conn;
    if (VortexTCPTransport.useTransport == 3) {
	if (conn.serverName != this.host) {
	    log ("error", "Expected to find proper serverName configuration for first channel with serverName configured");
	    return false;
	}
    } else {
	if (conn.serverName != 'dolphin.aspl.es') {
	    log ("error", "Expected to find proper serverName configuration for first channel with serverName configured");
	    return false;
	}
    }

    /* configure frame received to get remote serverName configured */
    channel.onFrameReceivedHandler = testServerName.frameReceived;
    channel.onFrameReceivedContext = this;

    log ("info", "Getting remote serverName configured...");

    /* send content */
    if (! channel.sendMSG ("GET serverName", null)) {
	log ("error", "Expected to be able to send content to get remote serverName configured but a failure was found");
	return false;
    }

    return true;
};

testServerName.frameReceived = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return false;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != "dolphin.aspl.es") {
	log ("error", "Expected to find remote serverName equal to dolphin.aspl.es but found: " + frame.content);
	return false;
    }

    log ("info", "Remote serverName configured OK: dolphin.aspl.es");

    /* now open another channel requesting a different serverName */
    log ("info", "Ok, now open a channel using serverName=whale.aspl.es");
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	serverName: "whale.aspl.es",
	onChannelCreatedHandler : testServerName.channelCreated2,
	onChannelCreatedContext : this
    });

    return true;

};

testServerName.channelCreated2 = function (replyData) {

    log ("info", "Channel creation reply received (2), checking data..");

    /* check channel status */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation with serverName associated");
	return false;
    }

    log ("info", "Checking serverName configured..");

    /* check connection serverName */
    var conn = replyData.conn;
    if (conn.serverName != 'dolphin.aspl.es') {
	log ("error", "Expected to find proper serverName configuration for first channel with serverName configured");
	return false;
    }

    /* configure frame received to get remote serverName configured */
    channel.onFrameReceivedHandler = testServerName.frameReceived2;
    channel.onFrameReceivedContext = this;

    log ("info", "Getting remote serverName configured...");

    /* send content */
    if (! channel.sendMSG ("GET serverName", null)) {
	log ("error", "Expected to be able to send content to get remote serverName configured but a failure was found");
	return false;
    }

    return true;
};

testServerName.frameReceived2 = function (frameReceived) {

    /* check connection first */
    var conn = frameReceived.conn;
    if (! checkConnection (conn))
	return false;

    /* check content */
    var frame = frameReceived.frame;
    if (frame.content != "dolphin.aspl.es") {
	log ("error", "Expected to find remote serverName equal to dolphin.aspl.es but found: " + frame.content);
	return false;
    }

    log ("info", "Remote serverName configured OK: dolphin.aspl.es");

    conn.shutdown ();

    /* call to execute next test */
    this.nextTest ();
    return true;

};


/******* END: testServerName *******/

/******* BEGIN: testSuddentlyClosed3 ******/
function testSuddentlyClosed3 () {

    if (this.nextTestId != 13) {
	console.error ("Expected to find nextTestId == 12 but found (1): " + this.nextTestId);
	log ("error", "Found some tests out there that are calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 13 but found: " + this.nextTestId);
	return false;
    }

    /* open a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSuddentlyClosed3.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSuddentlyClosed3.Result = function (conn) {

    if (this.nextTestId != 13) {
	console.error ("Expected to find nextTestId == 12 but found (2): " + this.nextTestId);
	log ("error", "Found some tests out there (at top of Result) that is calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 12 but found: " + this.nextTestId);
	return false;
    }

    /* check connection here */
    if (! checkConnection (conn))
	return false;

    /* create a channel that will fail on the next close operation */
    log ("info", "Open a channel to receive content after opening the channel");
    conn.openChannel ({
	profile: REGRESSION_URI_SUDDENTLY_CLOSE,
	channelNumber: 0,
	profileContent: "3",
	onChannelCreatedHandler : testSuddentlyClosed3.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testSuddentlyClosed3.channelCreated = function (replyData) {

    log ("info", "Ok, channel creation reply recevied, first part of the test complete");

    if (this.nextTestId != 13) {
	console.error ("Expected to find nextTestId == 12 but found (3): " + this.nextTestId);
	log ("error", "Found some tests out there (channelCreated at the top) that is calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 12 but found: " + this.nextTestId);
	return false;
    } /* end if */

    /* check that the channel creation was ok */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation but null reference found. Error code and message was: " +
	     replyData.replyCode + ": " + replyData.replyMsg);
	showErrors (replyData.conn);
	return false;
    } /* end if */

    /* check connection here */
    var conn = replyData.conn;
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection status ok, but found a failure");
	showErrors (conn);
	return false;
    } /* end if */

    /* now close the channel (and an error is expected to be found
     during the operation) */
    log ("info", "Now send a frame with a failure expected in the middle of the operation...");

    /* check reference */
    if (! VortexEngine.checkReference (this, "tests")) {
	log ("error", "Expected to find tests variable in 'this' reference inside testSuddentlyClosed3.channelCreated..");
	return false;
    } /* end if */

    /* set here disconnection handlers */
    conn.onDisconnect (testSuddentlyClosed3.connectionClosed, this);

    if (this.nextTestId != 13) {
	console.error ("Expected to find nextTestId == 13 but found (4): " + this.nextTestId);
	log ("error", "Found some tests out there (channelCreated) that is calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 13 but found: " + this.nextTestId);
	return false;
    }

    if (! channel.sendMSG ("this is a test that shouldn't be received")) {
	log ("error", "Expected to be able to send the message");
	showErrors (conn);
	return false;
    } /* end if */

    return true;
};

testSuddentlyClosed3.connectionClosed =	function (conn) {

    if (this.nextTestId != 13) {
	console.error ("Expected to find nextTestId == 13 but found (5): " + this.nextTestId);
	log ("error", "Found some tests out there (connectionClosed) that is calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 13 but found: " + this.nextTestId);
	return false;
    }

    /* check connection expected to fail */
    if (conn.isOk ()) {
	log ("error", "Expected to find connection failure but found a connection properly running");
	return false;
    } /* end if */

    /* check reference */
    if (! VortexEngine.checkReference (this, "tests")) {
	log ("error", "Expected to find tests variable in 'this' reference inside testSuddentlyClosed3.connectionClosed..");
	return false;
    } /* end if */

    /* call to run next test */
    this.nextTest ();
    return true;
};

/******* BEGIN: testSuddentlyClosed2 ******/
function testSuddentlyClosed2 () {

    if (this.nextTestId != 12) {
	console.error ("Expected to find nextTestId == 12 but found (6): " + this.nextTestId);
	log ("error", "Found some tests out there that is calling more times to this.nextTest () <br />" +
	     "which is a sign of something wrong. Expected to find current Id equal to 11 but found: " + this.nextTestId);
	return false;
    }

    /* open a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSuddentlyClosed2.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testSuddentlyClosed2.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    /* create a channel that will fail on the next close operation */
    log ("info", "Open a channel expected to fail");
    testSuddentlyClosed2.channelCreated.count = 0;
    conn.openChannel ({
	profile: REGRESSION_URI_SUDDENTLY_CLOSE,
	channelNumber: 0,
	profileContent: "2",
	onChannelCreatedHandler : testSuddentlyClosed2.channelCreated,
	onChannelCreatedContext : this
    });
    return true;
};

testSuddentlyClosed2.channelCreated = function (replyData) {

    var conn = replyData.conn;

    log ("info", "Ok, channel creation reply received, check expected failure");
    testSuddentlyClosed2.channelCreated.count++;
    if (testSuddentlyClosed2.channelCreated.count > 1) {
	log ("error", "Found testSuddentlyClosed2.channelCreated called several times when it was expected only one time..");
	showErrors (conn);
	return false;
    }

    /* check that the channel creation was ok */
    var channel = replyData.channel;
    if (channel != null) {
	log ("error", "Expected to find channel creation failure but a defined reference was found. ");
	showErrors (replyData.conn);
	return false;
    } /* end if */

    /* check now connection */
    if (conn.isOk ()) {
	log ("error", "Expected to find connection closed but found it running");
	return false;
    } /* end if */

    /* fully close connection */
    conn.shutdown ();

    /* call next text */
    this.nextTest ();
    return true;
};

/******* END:   testSuddentlyClosed ******/

/******* BEGIN: testSuddentlyClosed ******/
function testSuddentlyClosed () {

    /* open a connection */
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testSuddentlyClosed.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testSuddentlyClosed.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    /* create a channel that will fail on the next close operation */
    log ("info", "Open a channel to receive content after opening the channel");
    conn.openChannel ({
	profile: REGRESSION_URI_SUDDENTLY_CLOSE,
	channelNumber: 0,
	onChannelCreatedHandler : testSuddentlyClosed.channelCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testSuddentlyClosed.channelCreated = function (replyData) {

    log ("info", "Ok, channel creation reply recevied, first part of the test complete");

    /* check that the channel creation was ok */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation but null reference found. Error code and message was: " +
	     replyData.replyCode + ": " + replyData.replyMsg);
	showErrors (replyData.conn);
	return false;
    } /* end if */

    /* check connection here */
    var conn = replyData.conn;
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection status ok, but found a failure");
	showErrors (conn);
	return false;
    } /* end if */

    /* now close the channel (and an error is expected to be found
     during the operation) */
    log ("info", "Now close channel expecting a connection failure in the middle...");

    /* call to close the connection */
    testSuddentlyClosed.closeChannel.count = 0;
    channel.close ({
	onChannelCloseHandler: testSuddentlyClosed.closeChannel,
	onChannelCloseContext: this
    });

    return true;
};

testSuddentlyClosed.closeChannel = function (replyData) {


    log ("info", "Ok, channel close reply recevied, second part of the test complete");

    /* get a reference to the connection */
    var conn = replyData.conn;

    testSuddentlyClosed.closeChannel.count++;
    if (testSuddentlyClosed.closeChannel.count > 1) {
	log ("error", "Found testSuddentlyClosed.closeChannel.count called several times when it was expected only one time.." + replyData.replyMsg);
	showErrors (conn);
	return false;
    }

    /* check connection status here, it can be ok */
    if (conn.isOk ()) {
	log ("error", "Expected to find a connection failure for a close channel operation..");
	return false;
    } /* end if */

    /* check channel close status */
    if (replyData.status) {
	log ("error", "Expected to find a failure during channel close, because a predictable connection failure");
	return false;
    } /* end if */

    /* finish connection */
    conn.shutdown ();

    /* next test */
    this.nextTest ();
    return true;
};

/******* END:   testSuddentlyClosed ******/

/******* BEGIN: testReceivedContentOnConnection ******/
function testReceivedContentOnConnection () {
    var conn = new VortexConnection (
	this.host,
	this.port,
	new VortexTCPTransport (),
	testReceivedContentOnConnection.Result, this);

    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testReceivedContentOnConnection.Result = function (conn) {
    /* check connection here */
    if (! checkConnection (conn))
	return false;

    /* create a channel and set received handlers to reply content */
    log ("info", "Open a channel to receive content after opening the channel");
    testReceivedContentOnConnection.msg = 1;
    conn.openChannel ({
	profile: REGRESSION_URI_FAST_SEND,
	channelNumber: 0,
	onFrameReceivedHandler: testReceivedContentOnConnection.frameReceived,
	onFrameReceivedContext: this
    });

    return true;
};

testReceivedContentOnConnection.frameReceived = function (frameReceived) {

    var frame = frameReceived.frame;

    /* check frame received */
    log ("info", "Checking message type for content received");
    if (frame.type != 'MSG') {
	log ("error", "Expected to receive content after channel creation");
	return false;
    }

    if (testReceivedContentOnConnection.msg == 1) {
	/* check message content received */
	if (frame.content != "message 1") {
	    log ("error", "Expected to receive first message 'message 1' but found: " + frame.content);
	    return false;
	} /* end if */

	/* flag to check next message */
	testReceivedContentOnConnection.msg++;
    } else if (testReceivedContentOnConnection.msg == 2) {
	/* check message content received */
	if (frame.content != "message 2") {
	    log ("error", "Expected to receive first message 'message 2' but found: " + frame.content);
	    return false;
	} /* end if */

	/* flag to check next message */
	testReceivedContentOnConnection.msg++;
    } /* end if */

    log ("info", "Content received seems ok");

    /* send replies */
    var channel = frameReceived.channel;

    if (! channel.sendRPY ("")) {
	log ("error", "Expected to find proper channel reply operation but found a failure");
	showErrors (frameReceived.conn);
	return false;
    } /* end if */

    log ("info", "Reply sent..");

    /* check to terminate closing the channel */
    if (testReceivedContentOnConnection.msg == 3) {

	log ("info", "Closing channel after all messages were received and its replies sent...");

	/* call to close the connection */
	channel.close ({
	    onChannelCloseHandler: testReceivedContentOnConnection.closeChannel,
	    onChannelCloseContext: this
	});
    } /* end if */

    return true;
};

testReceivedContentOnConnection.closeChannel = function (replyData) {

    /* check connection */
    var conn = replyData.conn;
    if (! checkConnection (conn))
	return false;

    /* check channel close status */
    if (! replyData.status) {
	log ("error", "expected to find proper channel close operation after content received and replied");
	return false;
    }

    /* close the connection */
    conn.shutdown ();

    /* call to next test */
    this.nextTest ();
    return true;
};

/******* END:   testReceivedContentOnConnection ******/

/******* BEGIN: testContentTransfer ******/
function testLargeContentTransfer () {
    log ("info", "doing connection..");
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testLargeContentTransfer.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testLargeContentTransfer.Result = function (conn) {

    log ("info", "received connection reply..checking..");

    /* check connection here */
    if (! checkConnection (conn))
	return false;

    log ("info", "ok, now open a channel to test transfer..");

    /* create a channel */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler: testLargeContentTransfer.ResultCreated,
	onChannelCreatedContext: this
    });

    return true;
};

testLargeContentTransfer.ResultCreated = function (replyData) {

    log ("info", "channel created reply received..checking..");

    /* get channel reference */
    var channel = replyData.channel;
    if (channel == null) {
	log ("error", "Expected to find proper channel creation, but found a failure");
	return false;
    }

    /* set here received handlers */
    channel.onFrameReceivedHandler = testLargeContentTransfer.frameReceived;
    channel.onFrameReceivedContext = this;

    /* flag first message pending to be received */
    testLargeContentTransfer.frameReceived.msg = 1;

    /* send two large messages */
    log ("info", "Sending first large message");
    if (! channel.sendMSG (testLargeContentTransfer.testMSG1)) {
	log ("error", "Failed to send first message");
	return false;
    }

    log ("info", "Sending second large message");
    if (! channel.sendMSG (testLargeContentTransfer.testMSG1 + "msg2")) {
	log ("error", "Failed to send first message");
	return false;
    }

    log ("info", "Sending third large message");
    if (! channel.sendMSG (testLargeContentTransfer.testMSG1 + "msg3")) {
	log ("error", "Failed to send first message");
	return false;
    }

    log ("info", "Waiting responses..");
    return true;
};

/** large message, size: 6253 **/
testLargeContentTransfer.testMSG1 = "##This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary . This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary content. This is a large file that contains arbitrary .##";

testLargeContentTransfer.frameReceived = function (frameReceived) {
    log ("info", "Reply received, checking frame");

    var frame = frameReceived.frame;

    /* really more tests are required here */
    if (frame.type != 'RPY') {
	log ("error", "Expected to find RPY frame type, but found: " + frame.type);
	return false;
    }

    /* check send particular data */
    if (testLargeContentTransfer.frameReceived.msg == 1) {

	/* check content */
	if (frame.content != testLargeContentTransfer.testMSG1) {
	    log ("error", "Frame received: '" + frame.content + "'");
	    log ("error", "Expected to find frame content not found in reply.." + frame.content.length + " != " + testLargeContentTransfer.testMSG1.length);
	    return false;
	}

	/* check channel number */
	log ("info", "Frame msgno value: " + frame.msgno);
	if (frame.msgno != 0) {
	    log ("error", "Expected to find msgno equal to 0 but found: " + frame.msgno);
	    return false;
	}

	/* update next expected message */
	testLargeContentTransfer.frameReceived.msg++;

    } else if (testLargeContentTransfer.frameReceived.msg == 2) {

	/* check content */
	if (frame.content != (testLargeContentTransfer.testMSG1 + "msg2")) {
	    log ("error", "Frame received: '" + frame.content + "'");
	    log ("error", "Expected to find frame content not found in reply.." + frame.content.length + " != " + testLargeContentTransfer.testMSG1.length);
	    return false;
	}

	/* check channel number */
	log ("info", "Frame msgno value: " + frame.msgno);
	if (frame.msgno != 1) {
	    log ("error", "Expected to find msgno equal to 1 but found: " + frame.msgno);
	    return false;
	}

	/* update next expected message */
	testLargeContentTransfer.frameReceived.msg++;

    } else if (testLargeContentTransfer.frameReceived.msg == 3) {

	/* check content */
	if (frame.content != (testLargeContentTransfer.testMSG1 + "msg3")) {
	    log ("error", "Frame received: '" + frame.content + "'");
	    log ("error", "Expected to find frame content not found in reply.." + frame.content.length + " != " + testLargeContentTransfer.testMSG1.length);
	    this.stopTests = true;
	    return false;
	}

	/* check channel number */
	log ("info", "Frame msgno value: " + frame.msgno);
	if (frame.msgno != 2) {
	    log ("error", "Expected to find msgno equal to 2 but found: " + frame.msgno);
	    this.stopTests = true;
	    return false;
	}

	/* update next expected message */
	testLargeContentTransfer.frameReceived.msg++;
    }

    /* after these checks, check connection is ready */
    var conn = frameReceived.conn;
    if (! conn.isOk ()) {
	log ("error", "Expected to find connection ok after tests..");
	return false;
    }

    /* close the connection if we have received last message */
    if (testLargeContentTransfer.frameReceived.msg == 4) {
	/* close the connection */
	conn.shutdown ();

	/* call to next test */
	this.nextTest ();
    } /* end if */

    return true;
};

/******* END:   testContentTransfer ******/

/******* BEGIN: testContentTransfer ******/
function testContentTransfer () {
    log ("info", "Connect remote host " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testContentTransfer.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
};

testContentTransfer.Result = function (conn) {
    log ("info", "Received connect reply..checking..");
    if (! conn.isOk ()) {
	log ("error", "Expected connection ok to test channel denial, but found an error: " +
	    conn.isReady + ", socket: " + conn._transport.socket);
	showErrors (conn);
	return false;
    } /* end if */

    /* check channels before opening */
    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "1) Expected to find only one channel opened at this point but found: " + VortexEngine.count (conn.channels));
	this.stopTests = true;
	return false;
    }

    /* try to create a channel which is
     * going to be denied by remote side */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler: testContentTransfer.ResultCreated,
	onChannelCreatedContext: this
    });

    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "2) Expected to find only one channel opened at this point but found: " + VortexEngine.count (conn.channels));
	this.stopTests = true;
	return false;
    }

    /* wait for reply */
    return true;
};

/* message tests */
testContentTransfer.testMSG1 = "This is test of an small content";
testContentTransfer.testMSG2 = "Another text to test. This is test of an small content second part.";
testContentTransfer.testMSG3 = "More content to be sent. This is test of an small content third part.";

testContentTransfer.ResultCreated = function (replyData) {

    /* check reply */
    if (replyData.channel == null) {
	log ("error", "Expected to find proper channel creation, but found null reference");
	return false;
    }

    /* check here code replied */
    log ("info", "Received reply code: " + replyData.replyCode + ", message: " + replyData.replyMsg);

    /* get a reference to the channel */
    var channel = replyData.channel;

    /* configure received handler here */
    channel.onFrameReceivedHandler = testContentTransfer.frameReceived;
    channel.onFrameReceivedContext = this;

    /* reset test */
    testContentTransfer.nextMsg  = 1;

    /* send content */
    if (! channel.sendMSG (testContentTransfer.testMSG1)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG");
	return false;
    }

    /* check here that the channel now is not ready */
    if (channel.isReady ()) {
	log ("error", "Expected to find channel not in ready state, but found in such state");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "Expected complete send operation after first message, but found different status code: " + channel.lastStatusCode);
	return false;
    }

    if (! channel.sendMSG (testContentTransfer.testMSG2)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (2)");
	return false;
    }

    /* check here that the channel now is not ready */
    if (channel.isReady ()) {
	log ("error", "Expected to find channel not in ready state, but found in such state");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "Expected complete send operation after second message, but found different status code: " + channel.lastStatusCode);
	return false;
    }


    if (! channel.sendMSG (testContentTransfer.testMSG3)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (3)");
	return false;
    }

    /* check here that the channel now is not ready */
    if (channel.isReady ()) {
	log ("error", "Expected to find channel not in ready state, but found in such state");
	return false;
    }

    /* check that all content was sent (without partials) */
    if (channel.lastStatusCode != 1) {
	log ("error", "Expected complete send operation after third message, but found different status code: " + channel.lastStatusCode);
	return false;
    }

    /* check connection here */
    if (! replyData.conn.isOk ()) {
	log ("error", "Expected to find proper connection status after send operations but found a failure");
	showErrors (replyData.conn);
	this.stopTests = true;
	return false;
    } /* end if */

    return true;
};

testContentTransfer.frameReceived = function (frameReceived) {

    var frame = frameReceived.frame;

    /* check frame received */
    if (frame.type != "RPY") {
	log ("error", "Expected to find reply type RPY but found: " + frame.type);
	return false;
    }

    log ("info", "Frame content received: " + frame.content);
    switch (testContentTransfer.nextMsg) {
    case 1:
	/* check for first message */
	if (frame.content != testContentTransfer.testMSG1) {
	    log ("error", "Expected to find message content: '" +
		 testContentTransfer.testMSG1 + "' but found: '" + frame.content + "'");
	    return false;
	} /* end if */

	/* more elements to check */
	break;
    case 2:
	/* check for first message */
	if (frame.content != testContentTransfer.testMSG2) {
	    log ("error", "Expected to find message content: '" +
		 testContentTransfer.testMSG2 + "' but found: '" + frame.content + "'");
	    return false;
	} /* end if */

	/* more elements to check */
	break;
    case 3:
	/* check for first message */
	if (frame.content != testContentTransfer.testMSG3) {
	    log ("error", "Expected to find message content: '" +
		 testContentTransfer.testMSG3 + "' but found: '" + frame.content + "'");
	    return false;
	} /* end if */

	/* more elements to check */
	break;
    } /* end switch */

    /* update next test messag expected */
    testContentTransfer.nextMsg++;
    log ("info", "Message received status is: " + testContentTransfer.nextMsg);

    /* check if last message was found */
    if (testContentTransfer.nextMsg == 4) {

	/* check here that all messages are flushed */
	var channel = frameReceived.channel;
	if (channel.sendQueue.length != 0) {
	    log ("error", "Expected to find empty pending message queue, but found: " +  channel.sendQueue.length + " items");
	    showErrors (replyData.conn);
	    return false;
	}

	/* check connection here */
	if (! frameReceived.conn.isOk ()) {
	    log ("error", "Expected to find proper connection status after send operations but found a failure");
	    showErrors (replyData.conn);
	    this.stopTests = true;
	    return false;
	} /* end if */

	/* check channel size */
	if (VortexEngine.count (frameReceived.conn.channels) != 2) {
	    log ("error", "Expected to find 2 channels opened but found: " + VortexEngine.count (frameReceived.conn.channels));
	    showErrors (frameReceived.conn);
	    this.stopTests = true;
	    return false;
	}

	/* check here that the channel now is not ready */
	if (! channel.isReady ()) {
	    log ("error", "Expected to find channel not in ready state, but found in such state");
	    return false;
	}

	/* close the channel before closing the connection */
	log ("info", "Now close the channel opened..");
	channel.close ({
	    onChannelCloseHandler : testContentTransfer.closeHandler,
	    onChannelCloseContext : this
	});

    } /* end if */
    return true;
};

testContentTransfer.closeHandler = function (closeData) {
    var conn = closeData.conn;

    if (! conn.isOk ()) {
	log ("error", "Expected to find proper connection after close operation");
	return false;
    }

    /* check number of channels opened */
    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "Expected to find only 1 channel opened but found: " + VortexEngine.count (conn.channels));
	return false;
    }

    log ("info", "Channel close reply received and reply OK..");

    /* close connection */
    conn.shutdown ();

    /* call to next test */
    this.nextTest ();
    return true;
};

/******* END: testContentTransfer ******/

/******* BEGIN: testChannelsDeny ******/
/**
 * @brief Allows to check support to detect and notify that a channel
 * creation was denied.
 */
function testChannelsDeny () {
    /* do a connection */
    log ("info", "Connecting to " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testChannelsDeny.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testChannelsDeny.Result = function (conn) {
    if (! conn.isOk ()) {
	log ("error", "Expected connection ok to test channel denial, but found an error:");
	showErrors (conn);
	return false;
    } /* end if */

    /* try to create a channel which is
     * going to be denied by remote side */
    conn.openChannel ({
	profile: REGRESSION_URI_DENY,
	channelNumber: 0,
	onChannelCreatedHandler: testChannelsDeny.ResultCreated,
	onChannelCreatedContext: this
    });

    /* wait for reply */
    return true;
};

testChannelsDeny.ResultCreated = function (replyData) {

    if (replyData.channel != null) {
	log ("error", "Expected to find channel creation failure, but found a proper reference");
	return false;
    }

    /* check here code replied */
    log ("info", "Test DENY: Received reply code: " + replyData.replyCode + ", message: " + replyData.replyMsg);

    /* check error code */
    if (replyData.replyCode != '554') {
	log ("error", "Expected transaction failed error (unable to start channel) for a profile that always deny creating a channel. Error code expected: 554, but found: " +
	    replyData.replyCode +", message: " + replyData.replyMsg);
	showErrors (replyData.conn);
	return false;
    } /* end if */

    /* close the conection */
    replyData.conn.shutdown ();

    /* call for the next test */
    this.nextTest ();

    return true;
};

/******* END: testChannelsDeny ******/

/******* BEGIN: testChannels ******/
function testChannels () {
    /* do a connection */
    log ("info", "Connecting to " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testChannels.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testChannels.Result = function (conn) {
    if (! conn.isOk ()) {
	log ("error", "Expected to find proper connection to check channels");
	showErrors (conn);
	return false;
    }

    /* ok, now check profiles available */
    if (! conn.isProfileSupported (REGRESSION_URI)) {
	log ("error", "Expected to find profile supported: " + REGRESSION_URI);
	showErrors (conn);
	return false;
    }

    /* now open a channel here to do some useful work */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testChannels.ResultCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testChannels.ResultCreated = function (replyData) {
    /* log data received */
    log ("info", "Channel start reply code received: " +
	 replyData.replyCode + ", message: " + replyData.replyMsg);
    /* check reference */
    if (replyData.channel == null) {
	log ("error", "Expected to find proper channel reference, but found null. Errors found are:");
	showErrors (conn);
	return false;
    }

    /* check reply code */
    if (replyData.replyCode != "200") {
	log ("error", "Expected to find reply code to start channel equal to '200' but found: " + replyData.replyCode);
	return false;
    }

    /* check that the message is defined */
    if (typeof replyData.replyMsg == undefined) {
	log ("error", "Expected to find defined replyMsg, but found undefined value");
	return false;
    }

    /* get channel reference */
    var channel = replyData.channel;
    var conn = replyData.conn;

    /* check the channel to be created and ready */
    if (! channel.isOpened) {
	log ("error", "Expected to find proper channel creation, but found not ready channel");
	return false;
    }

    /* check channel profile */
    if (channel.profile != REGRESSION_URI) {
	log ("error", "Expected to find channel created under URI " + REGRESSION_URI + ", but found: " + channel.profile);
	return false;
    }

    /* check connection references */
    if (channel.conn != conn) {
	log ("error", "Expected to find channel's connection reference to be equal to reference notified");
	return false;
    }

    /* check number of channels opened */
    if (VortexEngine.count (conn.channels) != 2) {
	log ("error", "Expected to find 2 channels opened but found: " + VortexEngine.count (conn.channels));
	return false;
    }

    /* check that all onDisconnect content was removed */
    if (conn.onDisconnectHandlers.length != 0) {
	log ("error", "Expected to find on disconnect handlers to be removed from the connection (0) but found: " +
	     conn.onDisconnectHandlers.length);
	return false;
    } /* end if */

    /* check that the channel is ready without having sent nothing */
    if (! channel.isReady ()) {
	log ("error", "Expected to find channel in ready status, but found a failure");
	return false;
    }

    /* now close the channel */
    log ("info", "channel created, now requesting to close it");
    conn.closeChannel ({
	    channelNumber: channel.number,
	    onChannelCloseHandler: testChannels.CloseResult,
	    onChannelCloseContext: this
    });

    return true;
};

testChannels.CloseResult = function (replyData) {

    Vortex.log ("Received channel close reply");
    if (! replyData.status ){
	log ("error", "Expected to find proper channel close, but found a failure. Error received: " +
	     replyData.replyCode + ": " + replyData.replyMsg);
	showErrors (conn);
	return false;
    }

    /* check here the connection status */
    if (! replyData.conn.isOk ()) {
	log ("error", "Expected to find proper channel close, but the connection supporting the channel is not opened");
	showErrors (replyData.conn);
	return false;
    }

    /* check here the number of channels opened */
    if (VortexEngine.count (replyData.conn.channels) != 1) {
	log ("error", "Expected to find 1 channel opened, but found: " + Vortex.count (replyData.conn.channels));
	return false;
    }

    /* call to shutdown connection */
    replyData.conn.shutdown ();

    /* call to trigger next test */
    this.nextTest ();

    return true;
};
/******* END: testChannels ******/

/******* BEGIN: testChannelFind ******/
function testChannelFind () {
    /* open a connection */
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testChannelFind.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testChannelFind.Result = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    /* open a channel, now open a channel here to do some useful work */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testChannelFind.ResultCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testChannelFind.ResultCreated = function (channelCreated) {
    var channel = channelCreated.channel;
    if (channel == null) {
	log ("error", "Found channel not created when it was expected proper results..");
	return false;
    }

    /* now open again the channel */
    var conn = channelCreated.conn;

    /* find channel by uri */
    var channel2 = conn.getChannelByUri (REGRESSION_URI);
    if (channel2 == null) {
	log ("error", "Expected to find channel running profile=" + REGRESSION_URI + " but found null reference");
	return false;
    }

    /* now check reference returned */
    if (channel2.profile != REGRESSION_URI) {
	log ("error", "Expected (2) to find channel running profile=" + REGRESSION_URI + " but found null reference");
	return false;
    }

    /* no check find by function */
    channel2 = conn.getChannelByUri (REGRESSION_URI, function (channel, profile, data) {
					 if (profile == REGRESSION_URI &&
					     channel.profile == profile &&
					     data == 3) {
					     /* channel found */
					     return true;
					 }
					 /* channel not found */
					 return false;
				     }, 3);

    /* find channel by uri */
    if (channel2 == null) {
	log ("error", "Expected (3) to find channel running profile=" + REGRESSION_URI + " but found null reference");
	return false;
    }

    /* now check reference returned */
    if (channel2.profile != REGRESSION_URI) {
	log ("error", "Expected (4) to find channel running profile=" + REGRESSION_URI + " but found null reference");
	return false;
    }

    /* close the connection */
    conn.shutdown ();

    /* call to run the text test */
    this.nextTest ();
    return true;
};

/******* END: testChannelFind ******/

/******* BEGIN: testPerMessageFrameReceived ******/
function testPerMessageFrameReceived () {
    /* open a connection */
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testPerMessageFrameReceived.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testPerMessageFrameReceived.Result = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    /* open a channel, now open a channel here to do some useful work */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testPerMessageFrameReceived.ResultCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testPerMessageFrameReceived.ResultCreated = function (channelCreated) {
    var channel = channelCreated.channel;
    if (channel == null) {
	log ("error", "Found channel not created when it was expected proper results..");
	return false;
    }

    log ("info", "channel created..doing send operations");

    /* configure frame received for general receive operations */
    channel.onFrameReceivedHandler = testPerMessageFrameReceived.frameReceived;
    channel.onFrameReceivedContext = this;

    /* record a counter on the channel */
    channel.testStatusCount = 0;

    /* now do tree send operations, making the second operation to be
    handled by a particular frame received */
    channel.sendMSG ("This is a test");
    channel.sendMSG ("This is a test 2", [],
		     function (frameReceivedData) {
			 /* reference to the channel */
			 var channel = frameReceivedData.channel;

			 channel.testStatusCount++;
			 log ("info", "Received reply into first particular frame received, status count is: " + channel.testStatusCount);
		     });
    channel.sendMSG ("This is a test 3");
    channel.sendMSG ("This is a test 4", [],
		     function (frameReceivedData) {
			 /* reference to the channel */
			 var channel = frameReceivedData.channel;

			 channel.testStatusCount++;
			 channel.testStatusCount++;
			 log ("info", "Received reply into second particular frame received, status count is: " + channel.testStatusCount);
		     });
    channel.sendMSG ("This is a test 5");

    return true;
};

testPerMessageFrameReceived.frameReceived = function (frameReceivedData) {

    var channel = frameReceivedData.channel;

    channel.testStatusCount++;
    log ("info", "Received reply into general frame received, status count is: " + channel.testStatusCount);

    if (channel.testStatusCount == 6) {

	if (VortexEngine.count (channel.msgNoFrameReceived) > 0) {
	    log ("error", "Expected to not find particular handlers for test channel");
	    return;
	}

	/* now close the channel */
	channel.close ();

	log ("info", "now testing another order..");

	/* now open a new channel */
	/* open a channel, now open a channel here to do some useful work */
	var conn = frameReceivedData.conn;
	conn.openChannel ({
	    profile: REGRESSION_URI,
	    channelNumber: 0,
	    onChannelCreatedHandler : testPerMessageFrameReceived.ResultCreated2,
	    onChannelCreatedContext : this
	});

    }
    return;
};

testPerMessageFrameReceived.ResultCreated2 = function (channelCreated) {
    var channel = channelCreated.channel;
    if (channel == null) {
	log ("error", "Found channel not created when it was expected proper results..");
	return false;
    }

    log ("info", "channel created..doing send operations");

    /* configure frame received for general receive operations */
    channel.onFrameReceivedHandler = testPerMessageFrameReceived.frameReceived2;
    channel.onFrameReceivedContext = this;

    /* record a counter on the channel */
    channel.testStatusCount = 0;

    /* now do tree send operations, making the second operation to be
    handled by a particular frame received */
    channel.sendMSG ("This is a test", [],
		     function (frameReceivedData) {
			 /* reference to the channel */
			 var channel = frameReceivedData.channel;

			 channel.testStatusCount++;
			 log ("info", "Received reply into first particular frame received, status count is: " + channel.testStatusCount);
		     });
    channel.sendMSG ("This is a test 2");
    channel.sendMSG ("This is a test 3");

    channel.sendMSG ("This is a test 4");
    channel.sendMSG ("This is a test 5", [],
		     function (frameReceivedData) {
			 /* reference to the channel */
			 var channel = frameReceivedData.channel;

			 channel.testStatusCount++;
			 channel.testStatusCount++;
			 log ("info", "Received reply into second particular frame received, status count is: " + channel.testStatusCount);
		     });
    channel.sendMSG ("This is a test 6");

    return true;
};

testPerMessageFrameReceived.frameReceived2 = function (frameReceivedData) {

    var channel = frameReceivedData.channel;

    channel.testStatusCount++;
    log ("info", "Received reply into general frame received, status count is: " + channel.testStatusCount);

    if (channel.testStatusCount == 7) {

	log ("info", "Now checking to finish test..");

	if (VortexEngine.count (channel.msgNoFrameReceived) > 0) {
	    log ("error", "Expected to not find particular handlers for test channel");
	    return;
	}

	/* close connection */
	var conn = frameReceivedData.conn;
	conn.shutdown ();

	log ("info", "Received all message replies, going to next test");
	this.nextTest ();
	return;
    }
    return;
};

/******* END: testPerMessageFrameReceived ******/

/******* BEGIN: testChannelsInUse ******/
function testChannelsInUse () {
    /* open a connection */
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testChannelsInUse.Result, this);
    /* check object returned */
    if (! VortexEngine.checkReference (conn, "host")) {
	log ("error", "Expected to find a connection object after connection operation");
	this.stopTests = true;
    }
    return true;
}

testChannelsInUse.Result = function (conn) {
    /* check connection */
    if (! checkConnection (conn))
	return false;

    /* open a channel, now open a channel here to do some useful work */
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: 0,
	onChannelCreatedHandler : testChannelsInUse.ResultCreated,
	onChannelCreatedContext : this
    });

    return true;
};

testChannelsInUse.ResultCreated = function (channelCreated) {
    var channel = channelCreated.channel;
    if (channel == null) {
	log ("error", "Found channel not created when it was expected proper results..");
	return false;
    }

    /* now open again the channel */
    var conn = channelCreated.conn;
    conn.openChannel ({
	profile: REGRESSION_URI,
	channelNumber: channel.number,
	onChannelCreatedHandler : testChannelsInUse.ResultCreatedFailed,
	onChannelCreatedContext : this
    });

    return true;
};

testChannelsInUse.ResultCreatedFailed = function (replyData) {
    log ("info", "Channel creation process reply received, checking expected failure");

    /* check connection status */
    var conn = replyData.conn;
    if (! checkConnection (conn)) {
	log ("error", "Expected to find proper connection status after wrong channel creation, but found connection not working");
	return false;
    }

    /* check channel reference */
    var channel = replyData.channel;
    if (channel != null) {
	log ("error", "Expected to find null channel reference error after wrong creation");
	return false;
    } /* end if */

    if (replyData.replyCode != '550') {
	log ("error", "Expected to find reply code 550 but found: " + replyData.replyCode);
	return false;
    }

    /* close the connection */
    conn.shutdown ();

    /* call to run the text test */
    this.nextTest ();
    return true;
};
/******* END: testChannelsInUse ******/

/******* BEGIN: testMimeSupport ******/
function testMimeSupport () {

    var content;
    var expected;
    var content2;
    var mimeHeaders;

    /* check simple empty mime headers */
    log ("info", "Checking empty MIME headers..");
    content     = "\r\nThis is a test";
    expected    = "This is a test";
    mimeHeaders = [];
    content2    = VortexEngine.parseMimeHeaders (mimeHeaders, content);

    /* check expected value */
    if (content2 != expected) {
	log ("error", "Expected to find properly parsed content '" + content2 + "' but found '" + expected + "'");
	return false;
    } /* end if */

    /* check mimeHeaders count */
    if (mimeHeaders.length != 0) {
	log ("error", "Expected to find 0 MIME headers but found: " + mimeHeaders.length);
	return false;
    } /* end if */

    /* check wrong MIME configuration */
    log ("info", "Checking wrong MIME headers ignore support..");
    content     = "This is a test";
    expected    = "This is a test";
    mimeHeaders = [];
    content2    = VortexEngine.parseMimeHeaders (mimeHeaders, content);

    /* check expected value */
    if (content2 != expected) {
	log ("error", "Expected to find properly parsed content '" + content2 + "' but found '" + expected + "'");
	return false;
    } /* end if */

    /* check mimeHeaders count */
    if (mimeHeaders.length != 0) {
	log ("error", "Expected to find 0 MIME headers but found: " + mimeHeaders.length);
	return false;
    } /* end if */

    /* check simple empty mime headers */
    log ("info", "Checking single MIME headers..");
    content     = "Content-Type: application/beep+xml\r\n\r\nThis is a test";
    expected    = "This is a test";
    mimeHeaders = [];
    content2    = VortexEngine.parseMimeHeaders (mimeHeaders, content);

    /* check expected value */
    if (content2 != expected) {
	log ("error", "Expected to find properly parsed content '" + content2 + "' but found '" + expected + "'");
	return false;
    } /* end if */

    /* check mimeHeaders count */
    if (mimeHeaders.length != 1) {
	log ("error", "Expected to find 1 MIME headers but found: " + mimeHeaders.length);
	return false;
    } /* end if */

    if (mimeHeaders[0].header != "Content-Type") {
	log ("error", "Expected to find Content-Type mime header, but found: " + mimeHeaders[0].header);
	return false;
    }
    if (mimeHeaders[0].content != "application/beep+xml") {
	log ("error", "Expected to find 'application/beep+xml' mime header, but found: '" + mimeHeaders[0].content + "'");
	return false;
    }

    /* check simple empty mime headers */
    log ("info", "Checking multiple MIME headers..");
    content     = "Content-Type: application/beep+xml\r\n" +
	"MimeTest: more content testing how works MIME support\r\n" +
	"Return-path: some route to some host \r\n" +
	"Message-ID: MESSAGE-TEST\r\n" +
	"Return-path: some other router to some other host\r\n" +
	"\r\n" +
	"This is a test";
    expected    = "This is a test";
    mimeHeaders = [];
    content2    = VortexEngine.parseMimeHeaders (mimeHeaders, content);

    /* check expected value */
    if (content2 != expected) {
	log ("error", "Expected to find properly parsed content '" + content2 + "' but found '" + expected + "'");
	return false;
    } /* end if */

    /* check mimeHeaders count */
    if (mimeHeaders.length != 5) {
	log ("error", "Expected to find 5 MIME headers but found: " + mimeHeaders.length);
	return false;
    } /* end if */

    /* check first header */
    if (mimeHeaders[0].header != "Content-Type") {
	log ("error", "Expected to find Content-Type mime header, but found: " + mimeHeaders[0].header);
	return false;
    }
    if (mimeHeaders[0].content != "application/beep+xml") {
	log ("error", "Expected to find 'application/beep+xml' mime header, but found: '" + mimeHeaders[0].content + "'");
	return false;
    }

    /* check second header */
    if (mimeHeaders[1].header != "MimeTest") {
	log ("error", "Expected to find MimeTest mime header, but found: " + mimeHeaders[1].header);
	return false;
    }
    if (mimeHeaders[1].content != "more content testing how works MIME support") {
	log ("error", "Expected to find 'more content testing how works MIME support' mime header, but found: '" + mimeHeaders[1].content + "'");
	return false;
    }

    /* check third header */
    if (mimeHeaders[2].header != "Return-path") {
	log ("error", "Expected to find Return-path mime header, but found: " + mimeHeaders[2].header);
	return false;
    }
    if (mimeHeaders[2].content != "some route to some host ") {
	log ("error", "Expected to find 'some route to some host ' mime header, but found: '" + mimeHeaders[2].content + "'");
	return false;
    }

    /* check fourth header */
    if (mimeHeaders[3].header != "Message-ID") {
	log ("error", "Expected to find Message-ID mime header, but found: " + mimeHeaders[3].header);
	return false;
    }
    if (mimeHeaders[3].content != "MESSAGE-TEST") {
	log ("error", "Expected to find 'MESSAGE-TEST' mime header, but found: '" + mimeHeaders[3].content + "'");
	return false;
    }

    /* check fourth header */
    if (mimeHeaders[4].header != "Return-path") {
	log ("error", "Expected to find Return-path mime header, but found: " + mimeHeaders[4].header);
	return false;
    }
    if (mimeHeaders[4].content != "some other router to some other host") {
	log ("error", "Expected to find 'some other router to some other host' mime header, but found: '" + mimeHeaders[4].content + "'");
	return false;
    }

    /* call for the next test */
    this.nextTest ();
    return true;
}
/******* END:   testMimeSupport ******/

/******* BEGIN: testXMLSupport ******/
function testXMLSupport () {

    /* check simple empty mime headers */
    log ("info", "Checking basic XML document handling..");

    var value = "<example value='10' value2='20'><child-node><params>asdfasdfasdf</params></child-node><child-node /></example>";
    var document = VortexXMLEngine.parseFromString (value);

    if (document == null) {
	log ("error", "Failed to parse document: " + value + ", received null value from function");
	return false;
    };

    log ("info", "Parse seems right, now check content received");

    if (document.name != "example") {
	log ("error", "Expected to find <example> as root node, but found: " + document.name);
	return false;
    }

    /* get child named */
    log ("info", "Getting childs by name..");
    var childNode = VortexXMLEngine.getChildByName (document, "child-node");
    if (childNode == null) {
	log ("error", "Expected to find <child-node> as child of <example> but null was found");
	return false;
    }

    if (childNode.name != "child-node") {
	log ("error", "Expected to find <child-node> as child of <example> but node returned by the function doesn't have that name");
	return false;
    }

    /* get more childs */
    childNode = VortexXMLEngine.getChildByName (childNode, "params");
    if (childNode == null) {
	log ("error", "Expected to find <params> as child of <child-node> but null was found");
	return false;
    }

    if (childNode.name != "params") {
	log ("error", "Expected to find <params> as child of <child-node> but node returned by the function doesn't have that name");
	return false;
    }

    /* now get something that should be there */
    if (VortexXMLEngine.getChildByName (childNode, "params") != null) {
	log ("error", "Expected to NOT find <params> as child of <params> but something was found");
	return false;
    }

    /* ensure we get the content */
    log ("info", "Checking support to get content");
    if (childNode.content != "asdfasdfasdf") {
	log ("error", "Expected to find content: 'asdfasdfasdf' but found: " + childNode.content);
	return false;
    }

    /* get check support for attributes */
    log ("info", "Now checking xml attribute node..");
    if (VortexXMLEngine.getAttr (document, "value") != "10") {
	log ("error", "Expected to find 10 as attribute value for attr 'value' inside node <example />, but found: " + VortexXMLEngine.getAttr (document, "value"));
	return false;
    }

    if (! VortexXMLEngine.hasAttr (document, "value", "10")) {
	log ("error", "Expected to find 10 as attribute value for attr 'value' inside node <example />, but found: " + VortexXMLEngine.getAttr (document, "value"));
	return false;
    }

    if (! VortexXMLEngine.hasAttr (document, "value")) {
	log ("error", "Expected to find attribute 'value' inside node <example />, but it wasn't found: " + VortexXMLEngine.getAttr (document, "value"));
	return false;
    }

    if (VortexXMLEngine.hasAttr (document, "value", "20")) {
	log ("error", "Expected to NOT find 20 as attribute value for attr 'value' inside node <example />, but found: " + VortexXMLEngine.getAttr (document, "value"));
	return false;
    }

    /* check dumping functions */
    var content = VortexXMLEngine.dumpXML (document, 4);

    log ("info", "Now testing traversal functions..");
    value    = "<root><value /><value2 /><value3 /><value4 /></root>";
    document = VortexXMLEngine.parseFromString (value);

    if (document.name != "root") {
	log ("error", "Expected to find <root> node name but found: " + document.name);
	return false;
    }

    childNode = VortexXMLEngine.firstChild (document);
    if (childNode.name != "value") {
	log ("error", "Expected to find first child <value> node name but found: " + childNode.name);
	return false;
    }
    var iterator = 0;
    while (childNode != null) {
	log ("info", "Checking child node: " + childNode.name);
	if (iterator == 0) {
	    if (childNode.name != "value") {
		log ("error", "Expected to find <value> node name but found: " + childNode.name);
		return false;
	    }
	} else if (iterator == 1) {
	    if (childNode.name != "value2") {
		log ("error", "Expected to find <value2> node name but found: " + childNode.name);
		return false;
	    }
	} else if (iterator == 2) {
	    if (childNode.name != "value3") {
		log ("error", "Expected to find <value3> node name but found: " + childNode.name);
		return false;
	    }
	} else if (iterator == 3) {
	    if (childNode.name != "value4") {
		log ("error", "Expected to find <value4> node name but found: " + childNode.name);
		return false;
	    }
	} else if (iterator == 4) {
	    log ("error", "Expected to find <value4> node name but found: " + childNode.name);
	    return false;
	}

	/* get next iterator */
	childNode = VortexXMLEngine.nextNode (childNode);

	/* next iterator */
	iterator++;
    } /* end while */

    /* create a document */
    var node = VortexXMLEngine.createNode ("test-node");

    var child = VortexXMLEngine.createNode ("child1");
    if (! VortexXMLEngine.setChild (node, child)) {
	log ("error", "Failed to add child node into the document");
        return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node><child1 /></test-node>") {
	log ("error", "Expected to find different dump (1) ");
        return false;
    }

    /* set new childs with content */
    child = VortexXMLEngine.createNode ("child-first");
    if (! VortexXMLEngine.setChild (node, child, "first")) {
	log ("error", "Failed to add child node into the document");
        return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node><child-first /><child1 /></test-node>") {
	log ("error", "Expected to find different dump (2) ");
        return false;
    }

    /* set new childs with content */
    child = VortexXMLEngine.createNode ("child-last");
    if (! VortexXMLEngine.setChild (node, child, "last")) {
	log ("error", "Failed to add child node into the document");
        return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node><child-first /><child1 /><child-last /></test-node>") {
	log ("error", "Expected to find different dump (3) ");
        return false;
    }

    /* set child on a particular position */
    child = VortexXMLEngine.createNode ("child-nth");
    if (! VortexXMLEngine.setChild (node, child, 2)) {
	log ("error", "Failed to add child node into the document");
        return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node><child-first /><child1 /><child-nth /><child-last /></test-node>") {
	log ("error", "Expected to find different dump (4) ");
        return false;
    }

    /* set attributes */
    if (! VortexXMLEngine.setAttr (node, "value", "10")) {
	log ("error", "Expected to be able to insert attribute but found failure");
	return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node value='10' ><child-first /><child1 /><child-nth /><child-last /></test-node>") {
	log ("error", "Expected to find different dump (5) ");
        return false;
    }

    /* set attributes */
    if (! VortexXMLEngine.setAttr (node, "value", "25")) {
	log ("error", "Expected to be able to insert attribute but found failure");
	return false;
    }

    /* set attributes */
    if (! VortexXMLEngine.setAttr (node, "value2", "37")) {
	log ("error", "Expected to be able to insert attribute but found failure");
	return false;
    }

    if (VortexXMLEngine.dumpXML (node) != "<test-node value='25' value2='37' ><child-first /><child1 /><child-nth /><child-last /></test-node>") {
	log ("error", "Expected to find different dump (5) ");
        return false;
    }

    /* now dettach nodes */
    log ("info", "Checking node detaching support");
    child = VortexXMLEngine.getChildByName (node, "child-nth");
    VortexXMLEngine.detach (child);

    if (VortexXMLEngine.dumpXML (node) != "<test-node value='25' value2='37' ><child-first /><child1 /><child-last /></test-node>") {
	log ("error", "Expected to find different dump (5) ");
        return false;
    }

    /* check replacement */
    log ("info", "Checking node replacement support");

    child = VortexXMLEngine.getChildByName (node, "child1");
    VortexXMLEngine.detach (child, document);

    if (VortexXMLEngine.dumpXML (node) != "<test-node value='25' value2='37' ><child-first /><root><value /><value2 /><value3 /><value4 /></root><child-last /></test-node>") {
	log ("error", "Expected to find different dump (6) ");
        return false;
    }

    /* checking adding the header to the dump */
    var checkValue = "PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0nVVRGLTgnIHN0YW5kYWxvbmU9J3llcycgPz4KPG5vZGU+PGNoaWxkPnRoaXMgaXMgYSB0ZXN0PC9jaGlsZD48L25vZGU+";
    if (VortexBase64.encode (VortexXMLEngine.dumpXML (VortexXMLEngine.parseFromString ("<node><child>this is a test</child></node>"), 0, true)) != checkValue) {
        log ("error", "Expected to find other content for a XML dump with header but found something different..");
	return false;
    } /* end if */

    log ("info", "Checking dump with headers..");
    var dump = VortexXMLEngine.dumpXML (document, 4, true);

    var document2 = VortexXMLEngine.parseFromString (VortexXMLEngine.dumpXML (document, 4, true));
    if (document2 == null) {
	log ("error", "Failed to parse document after dump with headers..");
	return false;
    }
    /* check headers parsed */
    if (document2.encoding != "UTF-8") {
	log ("error", "Expected to find encoding header set to UTF-8 but found: " + document2.encoding);
	return false;
    }
    if (document2.standalone != "yes") {
	log ("error", "Expected to find standalone header set to yes but found: " + document2.standalone);
	return false;
    }
    if (document2.version != "1.0") {
	log ("error", "Expected to find version header set to '1.0' but found: " + document2.version);
	return false;
    }

    var charSource = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><PREFERENCESDOC><tmlCorePreferences><EnableFileLog type='bool'>1</EnableFileLog><LogMaskValue type='int'>512</LogMaskValue></tmlCorePreferences></PREFERENCESDOC>";
    console.log ("#############################      Source String content:         #########################");
    console.log (charSource);

    var doc1 = VortexXMLEngine.parseFromString (charSource);
    console.log ("#############################      first doc content:         #########################");
    console.dir (doc1);

    /* get node */
    node = VortexXMLEngine.get (doc1, "/PREFERENCESDOC/tmlCorePreferences/EnableFileLog");
    if (VortexXMLEngine.getAttr (node, "type") != "bool") {
	log ("error", "Expected to find attribute type=bool but found: " + VortexXMLEngine.getAttr (node, "type"));
	return false;
    } /* end if */

    /* get node */
    node = VortexXMLEngine.get (doc1, "/PREFERENCESDOC/tmlCorePreferences/LogMaskValue");
    if (VortexXMLEngine.getAttr (node, "type") != "int") {
	log ("error", "Expected to find attribute type=int but found: " + VortexXMLEngine.getAttr (node, "type"));
	return false;
    } /* end if */

    /* get node */
    node = VortexXMLEngine.get (doc1, "/PREFERENCESDOC");
    if (node.name != "PREFERENCESDOC") {
	log ("error", "Expected to find node PREFERENCESDOC");
	return false;
    }

    var charResult1 = VortexXMLEngine.dumpXML (doc1, 0);
    console.log ("#############################      Dump- Result content:         #########################");
    console.log (charResult1);

    var doc2 = VortexXMLEngine.parseFromString (charResult1);
    console.log ("#############################      second doc content:         #########################");
    console.dir (doc2);

    /* call for the next test */
    this.nextTest ();
    return true;
}
/******* END:   testXMLSupport ******/

/******* BEGIN: testConnect ******/
function testConnect () {

    log ("info", "Connecting to " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testConnect.Result, this);
    return true;
}

testConnect.Result = function (conn) {

    if (! conn.isOk ()) {
	log ("error", "Failed to connect.DEBUG: conn.isOk() = false, conn.isReady=" + conn.isReady + ", socket: " + conn._transport.socket);
	showErrors (conn);
	return false;
    }

    /* check connection */
    if (conn.isOk ()) {
	log ("info", "testConnect.Result: Connected to host: " + conn.host + ", port: " + conn.port);
    } else {
	log ("error", "Regression test failed, greetingsSent=" + conn.greetingsSent + ", greetingsReceived=" + conn.greetingsReceived);
	showErrors (conn);
	return false;
    }

    /* check connection greetings */
    if (conn.greetingsPending) {
	log ("error", "found connection with pending greetings (flag activated)");
	this.stopTests = true;
	return false;
    }

    /* check connection greetings sent */
    if (! conn.greetingsSent) {
	log ("error", "found connection with pending greetings to be sent (flag not activated: greetingsSent)");
	this.stopTests = true;
	return false;
    }

    /* check channels opened */
    log ("info", "Counting channels..");
    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "Expected to find 1 channel opened in the connection, but found: " + VortexEngine.count (conn.channels));
	return false;
    }

    /* check profiles supported */
    if (conn.profiles.length != 34) {
	log ("error", "Expected to find 34 profiles registered but found: " + conn.profiles.length);
	return false;
    }

    /* close the conection */
    Vortex.log ("Calling to close connection inside testConnect: conn.shutdown ()");
    conn.shutdown ();

    /* call for the next test */
    this.nextTest ();

    return true;
};
/******* END: testConnect ******/

function checkApply (value) {
    if (this != testInfraestructure) {
	log ("error", "Expected to find proper this reference, but found something different");
	return;
    } /* end if */

    /* accumulate value received */
    this.value += value;
    return;
}

function checkApply2 (value, value2) {
    if (this == null) {
	log ("error", "Expected to not find null for 'this' reference, but found it");
	return -1;
    } /* end if */

    /* accumulate value received */
    return value + value2;
}

function testInfraestructure () {
    var currentlog = Vortex.logEnabled;
    log ("info", "Checking VortexEngine.checkReference..");

    /* check null reference */
    Vortex.logEnabled = false;
    if (VortexEngine.checkReference (null)) {
	log ("error", "Expected to find a failure while passing a null reference");
	return false;
    }

    /* check undefined reference */
    if (VortexEngine.checkReference (undefined)) {
	log ("error", "Expected to find a failure while passing a null reference");
	return false;
    }

    var object = {};

    /* check defined reference */
    Vortex.logEnabled = true;
    if (! VortexEngine.checkReference (object)) {
	log ("error", "Expected to find a success while passing a defined empty reference");
	return false;
    }

    /* check defined reference but with an undefined attribute */
    Vortex.logEnabled = false;
    if (VortexEngine.checkReference (object, "value")) {
	log ("error", "Expected to find a failure while passing a defined empty reference with a check of an undefined attribute");
	return false;
    }

    /* define the value */
    object.value = "this is a test";

    /* check defined reference but with an undefined attribute */
    Vortex.logEnabled = true;
    if (! VortexEngine.checkReference (object, "value")) {
	log ("error", "Expected to find a success while passing a defined reference with a check of a defined attribute (value)");
	return false;
    }

    /* now check VortexEngine.apply */
    testInfraestructure.value = 1;
    VortexEngine.apply (checkApply, testInfraestructure, [3]);
    if (testInfraestructure.value != 4) {
	log ("error", "Expected to find value 4 but found: " + testInfraestructure.value);
	return false;
    }
    /* now check it without context */
    var value = VortexEngine.apply (checkApply2, null, [4, 8]);
    if (value != 12) {
	log ("error", "Expected to find value 12 but found: " + value);
	return false;
    }

    /* check deffer mechanism */
    log ("info", "Calling next test by doing a deferred invocation..");
    VortexEngine.apply (testInfraestructure.nextTest, this, [3, currentlog], true);

    return true;
};

testInfraestructure.nextTest = function (number, currentlog)
{
    log ("info", "Received deferred invocation..");

    if (number != 3) {
	log ("error", "Expected to find argument value 3 but found " + number + ", after requesting deferred execution");
	return false;
    }

    /* restore log level */
    Vortex.logEnabled = currentlog;

    /* call for the next test */
    this.nextTest ();

    return true;
};



function testjsVortexAvailable () {

    log ("info", "Checking if jsVortex is available on this system");

    if (typeof(VortexEngine) == undefined || VortexEngine == null) {
	log ("error", "jsVortex installation not available");
	return false;
    }

    /* engine available */
    this.nextTest ();
    return true;
};

function checkConnection (conn) {
    if (! conn.isOk ()) {
	log ("error", "Found connection status: " + conn.isReady + ", socket: " + (conn._transport != null ? conn._transport.socket : "transport is null" ) +
	     ", greetingsSent=" + conn.greetingsSent + ", greetingsReceived=" + conn.greetingsReceived);
	showErrors (conn);
	this.stopTests = true;
	return false;
    }

    /* check additional variables */
    if (conn.greetingsPending) {
	log ("error", "found connection with pending greetings (flag activated)");
	this.stopTests = true;
	return false;
    }

    /* check connection greetings sent */
    if (! conn.greetingsSent) {
	log ("error", "found connection with pending greetings to be sent (flag not activated: greetingsSent)");
	this.stopTests = true;
	return false;
    }

    /* drop ok log status */
    log ("info", "Connected to host: " + conn.host + ":" + conn.port);

    return true;
};

function showErrors (conn) {

    /* check for pending errors */
    if (! conn.hasErrors ())
	return;

    /* log all errors */
    log ("error", "Connection errors found follows: ");
    while (conn.hasErrors ())
	log ("error", conn.popError ());

    if (VortexTCPTransport.useTransport == 3 && conn.host.indexOf ("wss://") >= 0) {
	log ("error", "Remember to include an exception to accept certificate provided at: " + conn.host + ":" + conn.port);
    }

    /* close the connection */
    conn.shutdown ();

    return;
}

/**
 * @brief Constructor function that creates a new regression test.
 *
 * @param host The host	location of the regression test listener.
 * @param port The port location of the regression test listener.
 */
function RegressionTest (host, port) {

    /* initialize next test to execute */
    this.nextTestId = -1;

    /* record host and port */
    this.host       = host;
    this.port       = port;

    /* signal if tests must be stoped */
    this.stopTests  = false;

    /* do not return nothing */
};

/**
 * @brief Method that runs the next test.
 */
RegressionTest.prototype.nextTest = function () {

    /* check to stop tests */
    if (this.stopTests)
	return;

    /* drop an ok message to signal test ok */
    if (this.nextTestId != -1) {
	log ("ok", "TEST-" + this.nextTestId + " " + this.tests[this.nextTestId].name + ": OK");
    }

    while (true) {
	/* select next test to execute */
	this.nextTestId++;

	/* check available tests */
	if (this.tests.length == this.nextTestId) {
	    log ("final-ok", "All regression tests finished OK!");
	    return;
	} else if (this.tests.length < this.nextTestId) {
	    log ("error", "regression test is calling to next test too many times: " + this.nextTestId);
	    return;
	}

	/* check if the test is available */
	if (! this.tests[this.nextTestId].runIt) {
	    /* skip test */
	    continue;
	}

	/* call next test */
	Vortex.log ("INFO: running test-" + this.nextTestId);
	log ("info", "Running TEST-" + this.nextTestId + ": " + this.tests[this.nextTestId].name);

	/* rest of cases */
	VortexEngine.apply (this.tests[this.nextTestId].testHandler, this, [], true);

/*	setTimeout (function (_this) {
			log ("info", "Inside settimeout: " + _this); */
			/* call next test */
/*			_this.tests[_this.nextTestId].testHandler.apply (_this);
		    }, 1, this); */
/*	this.tests[this.nextTestId].testHandler.apply (this);*/
	return;
    } /* end while */
};

/* list of regression test available with its
 * associated test to show */
RegressionTest.prototype.tests = [
    {name: "Check if jsVortex is available",            testHandler: testjsVortexAvailable},
    {name: "Library infraestructure check",             testHandler: testInfraestructure},
    {name: "MIME support",                              testHandler: testMimeSupport},
    {name: "XML basic support",                         testHandler: testXMLSupport},
    {name: "BEEP basic connection test",                testHandler: testConnect},
    {name: "BEEP basic channel management test",        testHandler: testChannels},
    {name: "BEEP basic channel management test (DENY)", testHandler: testChannelsDeny},
    {name: "BEEP basic content transfer",               testHandler: testContentTransfer},
    {name: "BEEP large content transfer (SEQ frames)",  testHandler: testLargeContentTransfer},
    {name: "BEEP receive content on channel creation",  testHandler: testReceivedContentOnConnection},
    {name: "BEEP session suddently closed",             testHandler: testSuddentlyClosed},
    {name: "BEEP session suddently closed (bis)",       testHandler: testSuddentlyClosed},
    {name: "BEEP session suddently closed (II)",        testHandler: testSuddentlyClosed2},
    {name: "BEEP session suddently closed (III)",       testHandler: testSuddentlyClosed3},
    {name: "BEEP on connection close check",            testHandler: testOnConnectionClose},
    {name: "BEEP serverName support",                   testHandler: testServerName},
    {name: "Check for unsupported SASL profile",        testHandler: testUnsupportedSaslProfile},
    {name: "SASL profile ANONYMOUS support",            testHandler: testSaslAnonymous},
    {name: "SASL profile ANONYMOUS support (failure)",  testHandler: testSaslAnonymousFailure},
    {name: "SASL profile PLAIN support",                testHandler: testSaslPlain},
    {name: "SASL profile PLAIN support (failure)",      testHandler: testSaslPlainFailure},
    {name: "TLS profile support",                       testHandler: testTlsProfile},
    {name: "TLS profile support (Cert error)",          testHandler: testTlsProfileCertError},
    {name: "TLS profile support (Handle Cert error)",   testHandler: testTlsProfileHandleError},
    {name: "BEEP opening channels already in use",      testHandler: testChannelsInUse},
    {name: "BEEP check channel find by uri/func",       testHandler: testChannelFind},
    {name: "BEEP check channel per message frame received", testHandler: testPerMessageFrameReceived},
    {name: "BEEP check utf-8 messages (detecting real octect length)", testHandler: testUtf8Messages},
    {name: "BEEP check utf-8 messages (detecting real octect length II)", testHandler: testUtf8Messages2}
];


function log (status, logMsg) {

    var timeStamp;
    if (status != 'ok' && status != 'final-ok') {
	var end;
	if (log.start == undefined) {
	    /* create an start */
	    log.start = new Date();
		timeStamp = "Diff 0: ";
	} else {
	    /* create the stop */
	    end = new Date ();

	    /* compare with previous */
	    timeStamp = "Diff " + String ((end.getTime()) - (log.start.getTime ())) + ": ";

	    /* init new start */
	    log.start = end;
	}
    } else {
	timeStamp = "";
    } /* end if */

    /* set a default string if it is undefined */
    if (typeof logMsg == "undefined")
	logMsg = "";

    logMsg = logMsg.replace (/</g, "&lt;");

    /* add timestamp */
    logMsg = timeStamp + logMsg;

    /* create the node that wild hold the content to log */
    var newNode = document.createElement ("pre");
    dojo.addClass (newNode, "log-line");
    dojo.addClass (newNode, status);

    /* configure log line into the node */
    newNode.innerHTML = logMsg;

    /* place the node into the panel */
    var logpanel = dojo.byId ("log-panel");
    dojo.place (newNode, logpanel);

    /* scroll down a content pane */
    logpanel.scrollTop = logpanel.scrollHeight;

    return;
}

function runTest (testName) {

    /* run all tests */
    /* document.write ("<h1>jsVortex: running all regression tests..</h1>"); */
    /* testConnect (); */
    var host = dojo.byId ("host").value;
    var port = dojo.byId ("port").value;

    /* not required to check host and port here, already done by the form */
    log ("ok", "Running all tests: " + host + ":" + port);

    /* clear log */
    dojo.byId ("log-panel").innerHTML = "";

    /* check if regression tests are enabled */
    var checkBox = dijit.byId ("log2Enabled");
    Vortex.log2Enabled = checkBox.checked;

    checkBox = dijit.byId ("logEnabled");
    Vortex.logEnabled  = checkBox.checked;

    log ("info", "Running tests with log status [first level: " + Vortex.logEnabled + ", second level: " + Vortex.log2Enabled + "]");
    Vortex.log ("First level log check");
    Vortex.log2 ("Second level log check");

    /* create a regression test */
    var regTest = new RegressionTest (host, port);

    /* run tests */
    regTest.nextTest();

    return;
}

function clearLog () {
    /* clear log panel */
    var logpanel = dojo.byId ("log-panel");
    logpanel.innerHTML = "";
}

/**
 * @internal Function called when a test check box is clicked.
 */
function testClicked (event) {
    var status = event.currentTarget.checked;
    var id     = event.currentTarget.id;
    var tests  = RegressionTest.prototype.tests;
    for (position in tests) {
	if (tests[position].name == id) {
	    /* flag the test to be runned or not */
	    tests[position].runIt = status;
	    break;
	} /* end if */
    }
}

function invertSelection (event) {

    for (iterator in RegressionTest.prototype.tests) {
	/* acquire a reference to the test object */
	var test = RegressionTest.prototype.tests[iterator];

	/* invert its current configuration to be executed */
	test.runIt = ! test.runIt;

	/* flag "checked" with the new state */
	test.checkBox.attr ("checked", test.runIt);
    }

    return;
}

function transportSelected (event) {
    clearLog ();
    log ("info", "TCP Transport selected: " + event);
    if (event == "WebSocket Connector") {
	VortexTCPTransport.useTransport = 3;
	dojo.byId ("port").value = "44013";
    } else if (event == "Java Socket Connector") {
	VortexTCPTransport.useTransport = 2;
	dojo.byId ("port").value = "44010";
    } else if (event == "Firefox nsISocketTransportService")
	VortexTCPTransport.useTransport = 1;
    return;
}

function resizeTestWindow () {

    /* configure window height */
    var windowHeight = dijit.getViewport ().h;
    var heightValue = (windowHeight - dojo.marginBox (dojo.query (".vortex-regtest-header")[0]).h - dojo.marginBox (dojo.query ("#control-panel")[0]).h) + "px";
    /* dojo.style(dojo.byId ("test-available-panel"), "height", heightValue);
    dojo.style(dojo.byId ("log-panel"), "height", heightValue); */
    dojo.style(dojo.byId ("global-container"), "height", heightValue);

    /* call to resize */
    dijit.byId ("global-container").resize ();

    return;
}

function prepareTest () {
    /* connect clicked signal */
    dojo.connect (dojo.byId("run-test"), "click", runTest);
    dojo.connect (dojo.byId ("clear-log"), "click", clearLog);
    dojo.connect (dojo.byId ("invert-selection"), "click", invertSelection);
    dojo.connect (dijit.byId ("transportType"), "onChange", transportSelected);

    /* configure default connection values */
    dojo.byId ("host").value = location.hostname;

    /* configure default connection port value */
    dojo.byId ("port").value = "44010";

    /* fill all tests available */
    var tests              = RegressionTest.prototype.tests;
    var testAvailablePanel = dijit.byId("test-available-panel");
    var checkBox;
    for (test in tests) {

	/* flag the test to be runned */
	tests[test].runIt = true;

	/* create the label to be associated to the checkBox */
	var label = document.createElement ("label");

	/* label.for = tests[test].name; */
	dojo.attr (label, 'for', tests[test].name);
	dojo.attr (label, 'htmlFor', tests[test].name);

	label.innerHTML = "TEST-" + test + ": " + tests[test].name;

	/* create check box */
	checkBox = new dijit.form.CheckBox (
	    {id: tests[test].name,
	     checked: true,
	     position: test});

	/* configure onClick handler */
	checkBox.onClick = testClicked;

	/* add a reference on the test */
	tests[test].checkBox = checkBox;

	/* add to the panel */
	dojo.place(checkBox.domNode, testAvailablePanel.domNode);

	/* add to the panel */
	dojo.place (label, testAvailablePanel.domNode);

	/* add to the panel a line break */
	dojo.place (document.createElement ("br"), testAvailablePanel.domNode);
    }

    /* default configuration for first level log */
    dijit.byId ("logEnabled").attr ("checked", true);

    /* call to resize */
    resizeTestWindow ();

    /* catch resize event */
    dojo.connect (window, "resize", resizeTestWindow);

    setTimeout (function () {
	/* call to detect transport */
	VortexDetectTransport ();
	if (VortexTCPTransport.useTransport == 3) {
	    dijit.byId ("transportType").attr ("value", "WebSocket Connector");
	    dojo.byId ("port").value = "44013";
	} else if (VortexTCPTransport.useTransport == 2) {
	    dijit.byId ("transportType").attr ("value", "Java Socket Connector");
	    dojo.byId ("port").value = "44010";
	}

	return;
    }, 100);
}

/* register our function in dojo */
dojo.addOnLoad (prepareTest);





