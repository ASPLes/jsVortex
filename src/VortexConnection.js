/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a new BEEP session against the remote
 * host and port configured. The constructor requires a
 * transport object that implements the particular details
 * for the data exchange.
 *
 * @param host The host name to connect to.
 *
 * @param port The port to connect to.
 *
 * @param timeout A connection timeout after which the operation
 * must be aborted.
 *
 * @param transport Object implementing transport details
 * to perform the low-level (usually TCP) communication.
 *
 * @param connectionCreatedContext The object under which the
 * connectionCreatedHandler will execute (this reference).
 *
 * @param connectionCreatedHandler The function or method to execute
 * when the connect operation has finished. This method will be
 * used to notify the connection created or errors found during
 * the operation.
 *
 * @return Returns a reference to a newly created connection. Note
 * the reference returned may still not be connected. Use
 */
function VortexConnection (host,
			   port,
			   transport,
			   connectionCreatedHandler,
			   connectionCreatedContext,
			   timeout) {

    /* internal is ready flag */
    this.isReady          = true;
    /* internal flag to now we still are waiting for greetings */
    this.greetingsPending = true;

    /* PUBLIC: create stack error */
    this.stackError = [];

    /* save handlers */
    this.createdHandler = connectionCreatedHandler;
    this.createdContext = connectionCreatedContext;
    Vortex.log ("VortexConnection.ctor: requesting to create a connection to " + host + ":" + port);

    /* PUBLIC: store properties */
    this.host      = host;
    this.port      = port;

    /* define transport */
    this._transport = transport;

    /* register on read and on error */
    this._transport.onRead  (this, this._onRead);
    this._transport.onError (this, this._onError);

    /* create a channel 0 for this new connection */
    this.channels = [
	new VortexChannel (this, 0, "N/A", VortexEngine.channel0Received, null)
    ];

    /* do TCP connect */
    Vortex.log ("Doing TCP connect to: " + host + ", port: " + port);
    this._transport.connect (host, port);
    Vortex.log ("Socket status after connection: " + this._transport.socket);

    /* check errors here */
    if (this._transport.socket == -1) {
	/* report we have failed to create connection */
	this._reportConnCreated ();
	return this;
    }

    /* send greetings reply before receiving listener greetings */
    if (! this.channels[0].sendRPY ("<greeting />\r\n")) {
	Vortex.error ("Unable to send initial RPY with channel 0 greetings, notifying connection lost");
	/* report we have failed to send greetings */
	this._reportConnCreated ();
	return this;
    }
    return this;
};

/**
 * @brief Allows to check if the connection is
 * properly setup and running.
 *
 * @return true if the connection is ok (ready to use),
 * otherwise false is returned.
 */
VortexConnection.prototype.isOk = function () {

    /* do nothing if transport is not defined */
    if (this._transport == null)
	return false;

    /* call to transport is ok implementation */
    if (! this._transport.isOk ()) {
	Vortex.warn ("VortexConnection.isOk: connection transport is not available.");
	return false;
    }

    /* check here if we have completed setup operation */
    return this.isReady;

};

/**
 * @brief Allows to check if the provided connection supports the
 * profile. This function allows to check if in the greetings phase
 * the profile was advised as supported by the remote BEEP peer.
 *
 * Keep also in mind that some BEEP peers may hide profiles the really
 * support, acepting or denying them at channel start request.
 *
 * @param profile The profile to check to be supported by remote BEEP
 * peer.
 */
VortexConnection.prototype.isProfileSupported = function (profile) {
    while (position in this.profiles)  {
	if (this.profiles[position] == profile)
	    return true;
    } /* end while */
    return false;
};

/**
 * @brief Allows to create a new BEEP channel in the provided BEEP
 * session (connection).
 *
 * @param channelNumber [int] (Optional) The BEEP channel number that
 * is requested. You can use 0 to request jsVortex to asign the next
 * available channel number.
 *
 * @param serverName [string] The serverName token. Configuring this
 * value request the remote BEEP peer to act as the value provided by
 * serverName. The first channel completely created that request this
 * value will be the serverName value for all channels in the
 * connection. From RFC3080: "The serverName attribute for the first
 * successful "start" element received by a BEEP peer is meaningful
 * for the duration of the BEEP session. If present, the BEEP peer
 * decides whether to operate as the indicated "serverName"; if not,
 * an "error" element is sent in a negative reply.
 *
 * @param profile [string] The BEEP profile identification string.
 *
 * @param profileContent [string] Optional content to be configured as
 * content for the channel start request.
 *
 * @param profileContentEncoding [int] Optional	profileContent encoding.
 * This is used to notify remote BEEP peer which is the encoding
 * used for the profileContent configured. In the case you are not using
 * profileContent, use 0 for this variable. Allowed values are:
 * - 0: not defined,
 * - 1: none,
 * - 2: base64
 *
 * @param closeHandler [handler] Optional handler that is used by
 * jsVortex engine to notify that a channel close request was received
 * and a confirmation or refusal is required. If the handler is not
 * configured it is used default handler installed on the
 * connection. If the connection have no handler it is used global
 * handler which accept the channel to be closed.
 *
 * @param closeContext [object] Optional object used to run the
 * handler under the context (this reference) of this object. Use null
 * to not configure any context (do not use "this" reference under
 * such case).
 *
 * @param receivedHandler [handler] Optional handler that is used by
 * jsVortex engine to notify that a frame was received. If the handler
 * is not configured the default handler configured in the connection
 * will be used. In the case This handler is also not configured, it
 * is used global handler configured. If no handler is found in that
 * chain the frame is dropped.
 *
 * @param receivedContext [object] Optional object used to run the
 * handler under the context ("this" reference) of this object. Use
 * null to not configure any context (do not use "this" reference
 * under such case).
 *
 * @param onChannelCreatedHandler [handler] Optional handler that is
 * used by jsVortex engine to notify that the channel creation process
 * has finished, reporting either a failure or a sucess. If this
 * handler is not configured, the connection handler configured is
 * used. If this is also not defined, it is used configured global
 * handler. If no handler is configured, channel creation termination
 * status is not notified.
 *
 * @param onChannelCreatedContext [object] Optional object used to run
 * the handler under the context ("this" reference) of this
 * object. Use null to not configure any context (do not use "this"
 * reference under such case).
 *
 * @return true if the method has issued the request to start the channel,
 * otherwise false is returned. Check errors found at the connection
 * stack error (\ref VortexConnection.hasErrors and
 * \ref VortexConnection.popError).
 */
VortexConnection.prototype.openChannel = function (params) {

    /* check the connection status before continue */
    if (! VortexEngine.checkReference (params, "profile", "Expected profile to be used to request channel start"))
	return false;

    /* check channel number to use */
    if (params.channelNumber == undefined || params.channelNumber == 0)
	params.channelNumber = this._getNextChannelNumber ();
    else {
	/* check if the channel number request is already in use */
	if (this.channels[params.channelNumber] != undefined) {
	    this._onError (
		"Requested to open a channel that is already opened (" + params.channelNumber + "), running profile: " +
		this.channels[params.channelNumber].profile);
	    return false;
	} /* end if */
    } /* end if */

    Vortex.log ("requesting to start channel=" + params.channelNumber + ", with profile: " + params.profile);

    /* check to create channel start reply handlers to notify callers */
    if (conn.channels[0].startHandlers == undefined) {
	/* init an empty hash to hold all data associated to fully
	 * perfom a notification to the application level that the
	 * channel was created. */
	conn.channels[0].startHandlers = {};
    }

    /* check that the channel number is not in transit of being created */
    if (conn.channels[0].startHandlers[params.channelNumber] != undefined) {
	this._onError ("Requested to open a channel that is already in transit of being opened (" + params.channelNumber + ")");
	return false;
    }

    /* store start handler handler */
    conn.channels[0].startHandlers[params.channels] =  params;

    /* build start request operation */
    var message = "<start number='" + params.channelNumber + "'>\r\n" +
	"    <profile uri='" + params.profile + "' />\r\n" +
	"</start>\r\n";

    /* acquire channel 0 to send request */
    if (! conn.channels[0].sendMSG (message)) {
	this._onError ("Failed to send start request");
	return false;
    } /* end if */

    Vortex.log ("start request sent, now wait for reply to continue");
    return true;
};


/**
 * @brief Closes the transport connection without doing
 * BEEP close negotiation phase.
 */
VortexConnection.prototype.Shutdown = function () {
    /* call to close on transport */
    if (this._transport != null)
	this._transport.close ();

    /* flag connection is not ready */
    this.isReady    = false;

    /* nullify transport reference */
    this._transport = null;
};

/**
 * @brief Allows to check if there are pending error messages to check.
 *
 * @return true if there are pending error messages, otherwise false
 * is returned.
 */
VortexConnection.prototype.hasErrors = function () {
    /* check if there are at least one message to check */
    return this.stackError.length > 0;
};

/**
 * @brief Allows to get the next error message found on this
 * connection.
 */
VortexConnection.prototype.popError = function () {
    /* return next element */
    return this.stackError.shift ();
};

/**
 * @internal Handler that receives data from the transport object and parses
 * the content to produce a BEEP frame. Then this frame is dispached to
 * the appropriate frame received handler associated to a channel.
 *
 * This function executes under the context of the connection (this).
 *
 * @param connection The connection where the content was received.
 *
 * @param data Content received from the transport.
 */
VortexConnection.prototype._onRead = function (connection, data) {
    /* handle data received from the transport */
    Vortex.log ("VortexConnection._onRead, data received: " + data);

    /* create the frame */
    var frame = VortexEngine.getFrame (connection, data);
    if (frame == null) {
	return false;
    }

    /* get channel associated with the frame */
    var channel = this.channels [frame.channel];

    /* check if channel is available on the connection */
    if (channel == null) {
	Vortex.error ("VortexConnection._onRead: found frame for a channel no available. Protocol violation.");
	this.Shutdown ();
	return false;
    }

    /* check if the channel has received handler */
    if (channel.receivedHandler == null) {
	Vortex.warn ("VortexConnection._onRead: received a frame for a channel without received handler. Discarding frame.");
	return false;
    }

    /* notify frame */
    channel.receivedHandler.apply (channel, [frame]);

    Vortex.log ("VortexConnection._onRead: frame delivered");
    return true;
};

/**
 * @internal Function used to send raw content using configured transport.
 *
 * @param connection The connection where the send operation will
 * take place.
 *
 * @param content The content to be sent.
 *
 * @return true if the content was sent, otherwise false
 * is returned.
 */
VortexConnection.prototype._send = function (content) {

    try {
	/* check connection status */
	if (! this.isOk ()) {
	    Vortex.warn ("VortexConnection._send: unable to send content, connection is not ready.");
	    return false;
	}
	/* send content */
	return this._transport.write (content, content.length);
    } catch (e) {
	this.stackError.push ("VortexConnection._send: failed to send content, error found: " + e.message);
	return false;
    }
};

/**
 * @internal Handler that is called to save all errors
 * founc during processing to allow user to retrieve the
 * error found.
 */
VortexConnection.prototype._onError = function (error) {
    /* push error into the stack */
    this.stackError.push (error);
};

/**
 * @internal Handler used to report the user with the result
 * of creating a connection (either if the connection was or
 * not created).
 */
VortexConnection.prototype._reportConnCreated = function () {
    Vortex.log ("reporting reportConnCreated, status: " + this.isOk ());
    /* check if the connection handler notification is defined */
    if (this.createdHandler != null) {
	/* report using a particular context if defined */
	if (this.createdContext != null)
	    this.createdHandler.apply (this.createdContext, [this]);
	else
	    this.createdHandler.apply (this, [this]);
    } else {
	Vortex.warn ("Vortex: WARNING connection notification not defined!");
    } /* end if */

    return;
};

/**
 * @internal Function that tracks channel numbers that are
 * automatically assignated to created channels.
 *
 * @return Next channel number to be used.
 */
VortexConnection.prototype._getNextChannelNumber = function () {
    if (this.nextChannelNum == undefined) {
	this.nextChannelNum = 1;
	return this.nextChannelNum;
    }

    /* increase two units */
    this.nextChannelNum += 2;

    return this.nextChannelNum;
};

