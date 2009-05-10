/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Basic profile which allows to open channels
 * and send content that is replied by remote side. This is an
 * echo profile.
 */
const REGRESSION_URI      = 'http://iana.org/beep/transient/vortex-regression';

/**
 * @brief Profile used to check channel start denial.
 */
const REGRESSION_URI_DENY = "http://iana.org/beep/transient/vortex-regression/deny";

/**
 * @brief Profile used to check support to receive
 * messages from remote peer just after channel creation.
 */
const REGRESSION_URI_FAST_SEND = "http://iana.org/beep/transient/vortex-regression/fast-send";

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
    /* check connection here */
    if (! checkConnection (conn))
	return false;

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
	    return false;
	}

	/* check channel number */
	log ("info", "Frame msgno value: " + frame.msgno);
	if (frame.msgno != 2) {
	    log ("error", "Expected to find msgno equal to 2 but found: " + frame.msgno);
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
    log ("info", "Connect remote host" + this.host + ":" + this.port);
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
    if (! conn.isOk ()) {
	log ("error", "Expected connection ok to test channel denial, but found an error: " +
	    conn.isReady + ", socket: " + conn._transport.socket);
	showErrors (conn);
	return false;
    } /* end if */

    /* check channels before opening */
    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "Expected to find only one channel opened at this point but found: " + VortexEngine.count (conn.channels));
	this.stopTests = true;
	console.dir (conn.channels);
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
	log ("error", "Expected to find only one channel opened at this point but found: " + VortexEngine.count (conn.channels));
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

    if (! channel.sendMSG (testContentTransfer.testMSG2)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (2)");
	return false;
    }

    if (! channel.sendMSG (testContentTransfer.testMSG3)) {
	log ("error", "Expected fo be able to send content but failed VortexChannel.sendMSG (3)");
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

	/* close the channel before closing the connection */
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
	log ("erro", "Expected connection ok to test channel denial, but found an error:");
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
    log ("info", "Received reply code: " + replyData.replyCode + ", message: " + replyData.replyMsg);

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
    if (! channel.isReady) {
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
	log ("error", "Failed to connect.." + conn.isReady + ", socket: " + conn._transport.socket);
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
    if (VortexEngine.count (conn.channels) != 1) {
	log ("error", "Expected to find 1 channel opened in the connection, but found: " + VortexEngine.count (conn.channels));
	return false;
    }

    /* check profiles supported */
    if (conn.profiles.length != 29) {
	log ("error", "Expected to find 29 profiles registered");
	return false;
    }

    /* close the conection */
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
	log ("error", "Found connection status not ready " + conn.isReady + ", socket: " + conn._transport.socket +
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
	} else if (this.tests.lenght < this.nextTestId) {
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
	this.tests[this.nextTestId].testHandler.apply (this);
	return;
    } /* end while */
};

/* list of regression test available with its
 * associated test to show */
RegressionTest.prototype.tests = [
    {name: "Check if jsVortex is available", testHandler: testjsVortexAvailable},
    {name: "Library infraestructure check", testHandler: testInfraestructure},
    {name: "MIME support", testHandler : testMimeSupport},
    {name: "BEEP basic connection test", testHandler: testConnect},
    {name: "BEEP basic channel management test", testHandler: testChannels},
    {name: "BEEP basic channel management test (DENY)", testHandler: testChannelsDeny},
    {name: "BEEP basic content transfer", testHandler: testContentTransfer},
    {name: "BEEP large content transfer (SEQ frames)", testHandler: testLargeContentTransfer},
    {name: "BEEP receive content on channel creation", testHandler: testReceivedContentOnConnection}
];


function log (status, log) {

    /* create the node that wild hold the content to log */
    var newNode = document.createElement ("p");
    dojo.addClass (newNode, "log-line");
    dojo.addClass (newNode, status);

    /* configure log line into the node */
    newNode.innerHTML = log;

    /* place the node into the panel */
    var logpanel = dojo.byId ("log-panel");
    dojo.place (newNode, logpanel);
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

function prepareTest () {
    /* connect clicked signal */
    dojo.connect (dojo.byId("run-test"), "click", runTest);
    dojo.connect (dojo.byId ("clear-log"), "click", clearLog);

    /* configure default connection values */
    dojo.byId ("host").value = "localhost";

    /* configure default connection port value */
    dojo.byId ("port").value = "44010";

    /* fill all tests available */
    var tests              = RegressionTest.prototype.tests;
    var testAvailablePanel = dijit.byId("test-available-panel");
    var checkBox;
    for (test in tests) {

	/* flag the test to be runned */
	tests[test].runIt = true;

	/* create check box */
	checkBox = new dijit.form.CheckBox (
	    {id: tests[test].name,
	     checked: true,
	     position: test});
	/* configure onClick handler */
	checkBox.onClick = testClicked;

	/* add to the panel */
	dojo.place(checkBox.domNode, testAvailablePanel.domNode);

	/* create the label to be associated to the checkBox */
	var label = document.createElement ("label");
	label.for = tests[test].name;
	label.innerHTML = "TEST-" + test + ": " + tests[test].name;

	/* add to the panel */
	dojo.place (label, testAvailablePanel.domNode);

	/* add to the panel a line break */
	dojo.place (document.createElement ("br"), testAvailablePanel.domNode);
    }

    /* default configuration for first level log */
    dijit.byId ("logEnabled").attr ("checked", true);

    /* configure window height */
    var heightValue = (window.innerHeight - 110) + "px";
    dojo.style(dojo.byId ("test-available-panel"), "height", heightValue);
    dojo.style(dojo.byId ("log-panel"), "height", heightValue);
    dojo.style(dojo.byId ("global-container"), "height", (window.innerHeight - 88) + "px");

    /* call to resize */
    dijit.byId ("global-container").resize ();
}

/* register our function in dojo */
dojo.addOnLoad (prepareTest);





