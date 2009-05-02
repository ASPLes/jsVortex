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
    this.channels = {
	0 : new VortexChannel (this, 0, "N/A", VortexEngine.channel0Received, null)
    };

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
    for (position in this.profiles)  {
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
 *
 * onChannelCreatedHandler is called with an object argument that
 * contains the following attributes:
 *
 * - conn [VortexConnection] : the connection where the channel was created.
 *
 * - channel [VortexChannel] : channel reference that was created. If
 * channel is null channel was not created. Check replyCode and
 * replyMsg for additional information. In the case a connection error
 * is found, see VortexConnection.hasErrors and
 * VortexConnection.popError
 *
 * - replyCode [string] : A tree digit error code as defined by
 * section 8 from RFC 3080. Error code 200 means operation ok. Other
 * codes means error, detailed at replyMsg.
 *
 * - replyMsg [string] : A textual diagnostic error describing replyCode.
 *
 */
VortexConnection.prototype.openChannel = function (params) {

    /* check the connection status before continue */
    if (! VortexEngine.checkReference (params, "profile", "Expected profile to be used to request channel start")) {
	var replyData = {
	    conn : this,
	    channel : null,
	    replyCode : "504",
	    replyMsg : "Caller didn't define profile to start."
	};
	Vortex.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData]);
	return false;
    }

    /* check channel number to use */
    if (params.channelNumber == undefined || params.channelNumber <= 0)
	params.channelNumber = this._getNextChannelNumber ();
    else {
	/* check if the channel number request is already in use */
	if (this.channels[params.channelNumber] != undefined) {
	    /* create message */
	    var errMsg = "Requested to open a channel that is already opened (" + params.channelNumber + "), running profile: " +
		this.channels[params.channelNumber].profile;

	    /* stack it */
	    this._onError (errMsg);

	    /* create replyData to notify failure */
	    var replyData = {
		conn : this,
		channel : null,
		replyCode : "550",
		replyMsg : errMsg
	    };
	    Vortex.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData]);
	    return false;
	} /* end if */
    } /* end if */

    Vortex.log ("requesting to start channel=" + params.channelNumber + ", with profile: " + params.profile);

    /* check to create channel start reply handlers to notify callers */
    if (this.startHandlers == undefined) {
	/* init an empty list to hold pending start handlers */
	this.startHandlers = [];
    }

    /* install onDisconnect handler to get a notification if the
     connection is closed during the transit of closing the channel */
    var onDisconnectId = this.onDisconnect (
	function (conn) {
	    /* create replyData to notify failure */
	    var replyData = {
		conn : conn,
		channel : null,
		replyCode : "451",
		replyMsg : "During channel start operation a failure was found (connection lost)"
	    };

	    /* notify params=this */
	    VortexEngine.apply (
		this.onChannelCreatedHandler,
		this.onChannelCreatedContext,
		[replyData]);

	    /* nothing more */
	    return;
	}, params);

    /* do a log */
    Vortex.log ("VortexConnection.openChannel: created onDisconnect identifier: " + onDisconnectId);
    params.onDisconnectId = onDisconnectId;

    /* store start handler handler */
    this.startHandlers.push (params);

    /* record channel reference being created */
    params.channel = new VortexChannel (this, params.channelNumber, params.profile);

    /* build start request operation */
    var _message = "<start number='" + params.channelNumber + "'>\r\n" +
	"    <profile uri='" + params.profile + "' />\r\n" +
	"</start>\r\n";

    /* acquire channel 0 to send request */
    if (! this.channels[0].sendMSG (_message)) {
	this._onError ("Failed to send start request");

	/* create replyData to notify failure */
	var replyData = {
	    conn : this,
	    channel : null,
	    replyCode : "451",
	    replyMsg : "Failed to send start request"
	};
	Vortex.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData]);
	return false;
    } /* end if */

    Vortex.log ("start request sent, now wait for reply to continue");

    /* check connection at this point */
    if (! this.isOk ()) {
	Vortex.error ("after sending start request, broken connection was found");

	/* create replyData to notify failure */
	var replyData = {
	    conn : this,
	    channel : null,
	    replyCode : "451",
	    replyMsg : "After sneding start request, broken connection was found"
	};
	Vortex.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData]);
	return false;
    }

    return true;
};

/**
 * @brief Close the channel configured in the params object,
 * optionally doing a notification on the application level handler
 * provided.
 *
 * @param channelNumber [int] Number of the channel to close on the
 * connection. If the channel is not available, the method reports
 * error found.
 *
 * @param channelCloseHandler [handler] The handler that is used by
 * the method to notify the caller with the termination status. On
 * this method is notified either if the channel was closed or the
 * error found.
 *
 * @param channelCloseContext [object] The context object under which
 * the handler will be executed.
 *
 * @return true in the case the close operation start without incident
 * (request to close the message sent waiting for reply). Otherwise
 * false is returned indicating the close operation was not
 * started. You can safely skip value returned by the function and
 * handle all cases at the notification handler (channelCloseHandler).
 *
 */
VortexConnection.prototype.closeChannel = function (params) {

    /* check we have atleast defined channelNumber */
    if (! VortexEngine.checkReference (params, "channelNumber")) {
	/* create reply data */
	var replyData = {
	    conn : this,
	    status : false,
	    replyMsg  : "Received request to close a channel without providing the channel number to close"
	};
	/* notify user */
	VortexEngine.apply (params.channelCloseHandler, params.channelCloseContext, [replyData]);
	return false;
    }

    /* check if the channel exists */
    if (! VortexEngine.checkReference (this.channels[params.channelNumber], "number")) {
	/* create reply data */
	var replyData = {
	    conn : this,
	    status : false,
	    replyMsg  : "Received a request to close channel: " + params.channelNumber + ", but that channel is not available on the connection"
	};
	/* notify user */
	VortexEngine.apply (params.channelCloseHandler, params.channelCloseContext, [replyData]);
	return false;
    }

    /* get a reference to the channel to better work from here */
    var channel = this.channels[params.channelNumber];
    if (channel._isBeingClosed) {
	/* create reply data */
	var replyData = {
	    conn : this,
	    status : false,
	    replyMsg  : "Received a request to close channel: " + params.channelNumber + ", but that channel is already in process of being closed"
	};
	/* notify user */
	VortexEngine.apply (params.channelCloseHandler, params.channelCloseContext, [replyData]);
	return false;
    }

    /* flag the channel as closed */
    channel._isBeingClosed = true;

    if (this.closeHandlers == undefined) {
	/* init empty list to hold pending close handlers */
	this.closeHandlers = [];
    }

    /* install onDisconnect handler to get a notification if the
     connection is closed during the transit of closing the channel */
    var onDisconnectId = this.onDisconnect (
	function (conn) {
	    /* build reply data */
	    var replyData = {
		/* connection closed but required to be notified */
		conn: conn,
		/* channel was not closed */
		status: false,
		replyMsg: "Channel was not closed because it was found a connection close during the operation. Check connection errors."
	    };

	    /* notify params=this */
	    VortexEngine.apply (
		this.channelCloseHandler,
		this.channelCloseContext,
		[replyData]);

	    /* nothing more */
	    return;
	}, params);

    /* do a log */
    Vortex.log ("VortexConnection.closeChannel: created onDisconnect identifier: " + onDisconnectId);
    params.onDisconnectId = onDisconnectId;

    /* store request as pending */
    this.closeHandlers.push (params);

    Vortex.log ("VortexConnection.closeChannel: requested to close channel: " +
		channel.number + ", running profile: " + channel.profile);

    /* build close message */
    var _message = "<close number='" + channel.number + "' code='200' />\r\n";

    if (! this.channels[0].sendMSG (_message)) {
	this._onError ("Failed to send close message");
	return false;
    }

    Vortex.log ("VortexConnection.closeChannel: close request for channel " + channel.number + " sent ok");

    /* check connection at this point */
    if (! this.isOk ()) {
	Vortex.error ("after sending start request, broken connection was found");
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [this, null]);
	return false;
    }

    return true;
};

/**
 * @brief Allows to configure a handler and a context to run on, to
 * enable the caller getting a notification when the connection is
 * closed either because a failure found (BEEP channel management
 * protocol violation) or because remote BEEP peer have closed the
 * connection.
 *
 * @param onDisconnectHandler The handler to be executed when the
 * disconnect operation is found.
 *
 * @param onDisconnectContext The context object to run the handler on.
 *
 * @return true if handler were installed, otherwise false is
 * returned.  The method can only return false if handler provided is
 * null or undefined.
 *
 */
VortexConnection.prototype.onDisconnect = function (onDisconnectHandler, onDisconnectContext) {

    /* check handler */
    if (! VortexEngine.checkReference (onDisconnectHandler))
	return false;

    /* check and initialize onDisconnect handlers id */
    if (this.onDisconnect.nextId == undefined)
	this.onDisconnect.nextId = 0;
    /* produce next id */
    this.onDisconnect.nextId++;

    /* store content */
    var handlers = {
	handler : onDisconnectHandler,
	context : onDisconnectContext,
	id : this.onDisconnect.nextId
    };

    /* define list of handlers */
    if (this.onDisconnectHandlers == undefined)
	this.onDisconnectHandlers = [];

    /* store the pair handler/context */
    this.onDisconnectHandlers.push (handlers);

    return this.onDisconnect.nextId;
};

/**
 * @brief Allows to uinstall a configured onDisconnect handler by
 * providing the onDisconnectId (value returned by
 * VortexConnection.onDisconnect as the result of handler
 * configuration).
 *
 * @param onDisconnectId The handler unique identifier to remove.
 *
 * @return true if handler was removed, otherwise false is returned.
 */
VortexConnection.prototype.uninstallOnDisconnect = function (onDisconnectId) {

    /* check value received */
    if (! VortexEngine.checkReference (onDisconnectId))
	return false;

    for (iterator in this.onDisconnectHandlers) {
	if (this.onDisconnectHandlers[iterator].id == onDisconnectId) {
	    /* remove item */
	    this.onDisconnectHandlers.splice (iterator, 1);

	    /* item removed, notify caller */
	    return true;
	} /* end if */
    } /* end for */

    return false;
};


/**
 * @brief Closes the transport connection without doing BEEP close
 * negotiation phase.
 *
 * @param error [string] Optional message to report as error. If
 * defined, this value will be queued to be retrieved by the users
 * using VortexConnection.hasErrors () method.
 *
 */
VortexConnection.prototype.shutdown = function (error) {
    /* call to close on transport */
    if (this._transport != null)
	this._transport.close ();

    /* flag connection is not ready */
    this.isReady    = false;

    /* nullify transport reference */
    this._transport = null;

    /* push message if defined */
    if (typeof error != undefined)
	this._onError (error);

    /* now check and notify disconnect */
    if (this.onDisconnectHandlers != undefined) {
	while (this.onDisconnectHandlers.length > 0) {
	    /* get next element a call to notify */
	    var handlers = this.onDisconnectHandlers.shift ();
	    VortexEngine.apply (handlers.handler, handlers.context, [this]);
	} /* end while */
    }

    return;
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
    Vortex.log2 ("VortexConnection._onRead, data received: " + data);

    /* create the frame */
    var frame = VortexEngine.getFrame (connection, data);
    if (frame == null) {
	return false;
    }

    /* get channel associated with the frame */
    var channel = this.channels [frame.channel];

    /* check if channel is available on the connection */
    if (channel == null) {
	this.shutdown ("VortexConnection._onRead: found frame for a channel no available. Protocol violation.");
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
 * @internal Handler that is called to save all errors founc during
 * processing to allow user to retrieve the error found.
 *
 * jsVortex internals report errors using this method to allow the
 * application level to later retrieve these errors by using
 * VortexConnection.hasErrors and VortexConnection.popError
 *
 * @param error The error to report (and queue)
 */
VortexConnection.prototype._onError = function (error) {

    /* check and configure default error limit to store */
    if (this.errorLimit == undefined)
	this.errorLimit = 10;

    /* push error into the stack */
    this.stackError.push (error);

    /* shift all ancient messages until stacked errors are less that
     the allows value. This allows to keep errors stacked controlled */
    while (this.stackError.length > this.errorLimit)
	this.stackError.shift ();

    return;
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

