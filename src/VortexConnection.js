/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a new BEEP session against the remote host and port
 * configured. The constructor requires a transport object that
 * implements the particular details for the data exchange. Current it
 * is only implemented \ref VortexTCPTransport.
 *
 * See the following for connection creation examples: \ref jsvortex_manual_creating_a_connection.
 *
 * @param host {String} The host name to connect to.
 *
 * @param port {String} The port to connect to.
 *
 * @param timeout {Number} A connection timeout after which the operation
 * must be aborted.
 *
 * @param transport {VortexTCPTransport} Object implementing transport details
 * to perform the low-level (usually TCP) communication.
 *
 * @param connectionCreatedContext {Object} The object under which the
 * connectionCreatedHandler will execute (this reference).
 *
 * @param connectionCreatedHandler {Handler} The function or method to execute
 * when the connect operation has finished. This method will be
 * used to notify the connection created or errors found during
 * the operation.
 *
 * @return {VortexConnection} Returns a reference to a newly created
 * connection. Note the reference returned may still not be
 * connected. Use \ref VortexConnection.isOk method to check
 * connection status. Do not implement any operation until the
 * connection creation is notified through connectionCreatedHandler.
 *
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

    /* create stack error */
    this.stackError       = [];

    /**
     * @brief Allows to check if the connection is authenticated.
     *
     * After a complete call to \ref VortexConnection.saslAuth, this
     * variable signals if the connection was already authenticated.
     */
    this.isAuthenticated  = false;

    /* save handlers */
    this.createdHandler = connectionCreatedHandler;
    this.createdContext = connectionCreatedContext;
    Vortex.log ("VortexConnection.ctor: requesting to create a connection to " + host + ":" + port);

    /* PUBLIC: store properties */

    /**
     * @brief Channels available on the connection. The attribute
     * contains a hash where the index is the channel number and the
     * value is the \ref VortexChannel object.
     * @type Hash
     */
    this.channels = {};

    /**
     * @brief Contains the host to which this BEEP session is created.
     * @type String
     */
    this.host      = host;

    /**
     * @brief Contains the port to which this BEEP session is connected.
     * @type String
     */
    this.port      = port;

    /* define transport */
    this._transport = transport;

    /* register on read and on error */
    this._transport.onRead  (this, this._onRead);
    this._transport.onError (this, this._onError);
    this._transport.onStart (this, this._onStart);
    this._transport.onStop  (this, this._onStop);

    /* do TCP connect */
    Vortex.log ("Doing TCP connect to: " + host + ", port: " + port);
    this._transport.connect (host, port);
    Vortex.log ("Socket status after connection: " + this._transport.socket);

    /* check direct connection errors (like permissions) */
    if (this._transport.socket == -1) {
	/* report we have failed to create connection */
	this._reportConnCreated ();
    } /* end if */
};

/**
 * @brief Allows to check if the connection is
 * properly setup and running.
 *
 * @return {Boolean} true if the connection is ok (ready to use),
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
 * given profile. This function allows to check if, during the
 * greetings phase, the profile was advised as supported by the remote
 * BEEP peer.
 *
 * Bear in mind that some BEEP peers may hide profiles they really
 * support, acepting or denying them on channel start request,
 * according to runtime configuration (profile hiding). See
 * http://www.turbulence.ws profile path configuration:
 * http://www.aspl.es/turbulence/configuring.html#profile_path_conf
 *
 * @param profile {String} The profile to check to be supported by remote BEEP
 * peer.
 *
 * @return {Boolean} true if the profile was adviced, otherwise false
 * is returned.
 */
VortexConnection.prototype.isProfileSupported = function (profile) {
    for (position in this.profiles)  {
	if (this.profiles[position] == profile)
	    return true;
    } /* end while */
    return false;
};

/**
 * @brief Allows to create a new BEEP channel on the provided BEEP
 * session (\ref VortexConnection).
 *
 * @param params.channelNumber {Number} ? The BEEP channel number that
 * is requested. You can use 0 to request jsVortex to asign the next
 * available channel number.
 *
 * @param params.serverName {String} ? The serverName token. Configuring this
 * value request the remote BEEP peer to act as the value provided by
 * serverName. The first channel completely created that request this
 * value will be the serverName value for all channels in the
 * connection. From RFC3080: "The serverName attribute for the first
 * successful "start" element received by a BEEP peer is meaningful
 * for the duration of the BEEP session. If present, the BEEP peer
 * decides whether to operate as the indicated "serverName"; if not,
 * an "error" element is sent in a negative reply.
 *
 * @param params.profile {String} The BEEP profile identification string.
 *
 * @param params.profileContent {String} ? Content to be configured as
 * content for the channel start request.
 *
 * @param params.profileContentEncoding {Number} ? Optional profileContent encoding. This is used to notify remote BEEP peer
 * which is the encoding used for the profileContent configured. In
 * the case you are not using profileContent, use 0 for this
 * variable. Allowed values are:
 * - 0: not defined,
 * - 1: none,
 * - 2: base64
 *
 * @param params.onCloseHandler {Handler} ? Handler that is used by
 * jsVortex engine to notify that a channel close request was received
 * and a confirmation or refusal is required. If the handler is not
 * configured it is used default handler installed on the
 * connection. If the connection have no handler it is used global
 * handler which accept the channel to be closed.
 *
 * @param params.closeContext {Context} ? Object used to run the handler
 * under the context (this reference) of this object. Use null to not
 * configure any context (do not use "this" reference under such
 * case).
 *
 * @param params.onFrameReceivedHandler {Handler} ? Handler that is used by
 * jsVortex engine to notify that a frame was received. If the handler
 * is not configured the default handler configured in the connection
 * will be used. In the case This handler is also not configured, it
 * is used global handler configured. If no handler is found in that
 * chain the frame is dropped.
 *
 * @param params.receivedContext {Context} ? object used to run the handler
 * under the context ("this" reference) of this object. Use null to
 * not configure any context (do not use "this" reference under such
 * case).
 *
 * @param params.onChannelCreatedHandler {Handler} ? Handler that is used by
 * jsVortex engine to notify that the channel creation process has
 * finished, reporting either a failure or a sucess. If this handler
 * is not configured, the connection handler configured is used. If
 * this is also not defined, it is used configured global handler. If
 * no handler is configured, channel creation termination status is
 * not notified.
 *
 * @param params.onChannelCreatedContext {Context} ? Object used to run
 * the handler under the context ("this" reference) of this
 * object. Use null to not configure any context (do not use "this"
 * reference under such case).
 *
 * @return {Boolean} true if the method has issued the request to
 * start the channel, otherwise false is returned. Check errors found
 * using the connection stack error (\ref VortexConnection.hasErrors and
 * \ref VortexConnection.popError).
 *
 * The channel created will be notified at the configured \ref
 * VortexConnection.openChannel.params.onChannelCreatedHandler.param. The
 * handler is called with an object argument that contains the
 * following attributes:
 *
 * - \ref VortexConnection conn : the connection where the channel was created.
 *
 * - \ref VortexChannel channel : channel reference that was
 * created. If channel is null channel was not created. Check
 * replyCode and replyMsg for additional information. In the case a
 * connection error is found, see VortexConnection.hasErrors and
 * VortexConnection.popError
 *
 * - \ref String replyCode : A tree digit error code as defined by
 * section 8 from RFC 3080. Error code 200 means operation ok. Other
 * codes means error, detailed at replyMsg.
 *
 * - \ref String replyMsg : A textual diagnostic error describing replyCode.
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
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData], true);
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
	    VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData], true);
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
		[replyData], true);

	    /* nothing more */
	    return;
	}, params);

    /* do a log */
    Vortex.log ("VortexConnection.openChannel: created onDisconnect identifier: " + onDisconnectId);
    params.onDisconnectId = onDisconnectId;

    /* store start handler handler */
    this.startHandlers.push (params);

    /* record channel reference being created */
    params.channel = new VortexChannel (
	/* connection */
	this,
	/* channel number */
	params.channelNumber,
	/* profile */
	params.profile);

    /* check if we have profile content */
    var hasProfileContent = (params.profileContent != null) && (params.profileContent != undefined);

    /* build start request operation */
    var _message = "<start " + ((params.serverName != null) ? "serverName='" + params.serverName + "' " : "" ) + "number='" + params.channelNumber + "'>\r\n" +
	(hasProfileContent ? "   <profile uri='" + params.profile + "'><![CDATA[" + params.profileContent + "]]></profile>\r\n" :
	                     "   <profile uri='" + params.profile + "' />\r\n") +
	 "</start>\r\n";

    /* acquire channel 0 to send request */
    if (! this.channels[0].sendMSG (_message)) {
	/* uninstall disconnect handler to avoid twice notifications */
	this.uninstallOnDisconnect (onDisconnectId);

	/* drop message */
	this._onError ("Failed to send start request");

	/* create replyData to notify failure */
	var replyData = {
	    conn : this,
	    channel : null,
	    replyCode : "451",
	    replyMsg : "Failed to send start request"
	};
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData], true);
	return false;
    } /* end if */

    Vortex.log ("start request sent, now wait for reply to continue");

    /* check connection at this point */
    if (! this.isOk ()) {
	/* uninstall disconnect handler to avoid twice notifications */
	this.uninstallOnDisconnect (onDisconnectId);

	/* drop message */
	this._onError ("after sending start request, broken connection was found");

	/* create replyData to notify failure */
	var replyData = {
	    conn : this,
	    channel : null,
	    replyCode : "451",
	    replyMsg : "After sneding start request, broken connection was found"
	};
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData], true);
	return false;
    }

    return true;
};

/**
 * @brief Close the channel configured in the params object,
 * optionally doing a notification on the application level handler
 * provided.
 *
 * @param params An object that includes a list of attributes that are
 * parameters for this method.
 *
 * @param params.channelNumber {Number} The channel number to close on the
 * connection. If the channel is not available, the method report
 * error found.
 *
 * @param params.onChannelCloseHandler {Handler} ? The handler that is used by
 * the method to notify the caller with the termination status. On
 * this method is notified either if the channel was closed or the
 * error found.
 *
 * @param params.onChannelCloseContext {Object} ? The context object under
 * which the handler will be executed.
 *
 * @return {Boolean} true in the case the close operation start without incident
 * (request to close the message sent waiting for reply). Otherwise
 * false is returned indicating the close operation was not
 * started. You can safely skip value returned by the function and
 * handle all cases at the notification handler (onChannelCloseHandler).
 *
 * The handler \ref
 * VortexConnection.closeChannel.params.onChannelCloseHandler.param will be
 * called with an object with the following attributes once the
 * channel close process has finished (the channel may still be
 * available, so check status).
 *
 * - \ref VortexConnection conn : the connection where the channel was closed.
 *
 * - \ref Boolean status : true to signal that the channel was closed,
 * otherwise false is returned.
 *
 * - \ref String replyCode : tree digit error code indicating the
 * motive to deny channel close operation.
 *
 * - \ref String replyMsg : Human readable textual diagnostic
 * reporting motivy to deny channel close operation (or faillure
 * found).
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
	VortexEngine.apply (params.onChannelCloseHandler, params.onChannelCloseContext, [replyData], true);
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
	VortexEngine.apply (params.onChannelCloseHandler, params.onChannelCloseContext, [replyData], true);
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
	VortexEngine.apply (params.onChannelCloseHandler, params.onChannelCloseContext, [replyData], true);
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
		this.onChannelCloseHandler,
		this.onChannelCloseContext,
		[replyData], true);

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

	/* uninstall disconnect handler to avoid twice notifications */
	this.uninstallOnDisconnect (onDisconnectId);

	/* drop a message */
	this._onError ("Failed to send close message");

	/* notify caller */
	var replyData = {
	    /* connection closed but required to be notified */
	    conn: this,
	    /* channel was not closed */
	    status: false,
	    replyMsg: "Channel was not closed properly because it failed send operation (close message). Check connection errors."
	};

	/* call to notify */
	VortexEngine.apply (params.onChannelCloseHandler, params.onChannelCloseContext, [replyData], true);
	return false;
    } /* end if */

    /* check connection at this point */
    if (! this.isOk ()) {

	/* uninstall disconnect handler to avoid twice notifications */
	this.uninstallOnDisconnect (onDisconnectId);

	/* drop a message */
	this._onError ("after sending start request, broken connection was found");

	/* notify caller */
	var replyData = {
	    /* connection closed but required to be notified */
	    conn: this,
	    /* channel was not closed */
	    status: false,
	    replyMsg: "Channel was not closed properly because after sending start request, broken connection was found. Check connection errors."
	};

	/* call to notify */
	VortexEngine.apply (params.onChannelCloseHandler, params.onChannelCloseContext, [replyData], true);
	return false;
    } /* end if */

    Vortex.log ("VortexConnection.closeChannel: close request for channel " + channel.number + " sent ok");

    return true;
};

/**
 * @brief Allows to configure a handler (and a context), to get a
 * notification when the connection is closed either because a failure
 * found (BEEP channel management protocol violation) or because
 * remote BEEP peer have closed the connection.
 *
 * @param onDisconnectHandler {Handler} The handler to be executed when the
 * disconnect operation is found.
 *
 * @param onDisconnectContext {Object} ? The context object to run the handler on.
 *
 * @return true if handler were installed, otherwise false is
 * returned. The method can only return false if handler provided is
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
 * @brief Allows to uinstall a configured disconnect handler by
 * providing the onDisconnectId (value returned by \ref
 * VortexConnection.onDisconnect as the result of handler
 * configuration).
 *
 * @param onDisconnectId {Number} The handler unique identifier to
 * remove. This identifier was returned by a previous call to \ref
 * VortexConnection.onDisconnect.
 *
 * @return {Boolean} true if handler was removed, otherwise false is returned.
 */
VortexConnection.prototype.uninstallOnDisconnect = function (onDisconnectId) {

    /* check value received */
    if (! VortexEngine.checkReference (onDisconnectId))
	return false;

    Vortex.log ("VortexConnection.uninstallOnDisconnect: removing onDisconnectId: " + onDisconnectId);

    for (iterator in this.onDisconnectHandlers) {
	if (this.onDisconnectHandlers[iterator].id == onDisconnectId) {
	    /* remove item */
	    this.onDisconnectHandlers.splice (iterator, 1);

	    Vortex.log ("VortexConnection.uninstallOnDisconnect: found, length after operation: " + this.onDisconnectHandlers.length);

	    /* item removed, notify caller */
	    return true;
	} /* end if */
    } /* end for */

    return false;
};

/**
 * @brief Allows to start a SASL authentication process on the
 * connected BEEP session.
 *
 * @param params.mech {String} SASL mechamis to use for this
 * authentication process. Currently allowed SASL authentication
 * process are: PLAIN and ANONYMOUS.
 *
 * @param params.serverName {String} ? Optional string that allows to
 * configure/request under which domain will work this SASL
 * negotiation. This is used to provide different authentication
 * domains (according to the serverName).
 *
 * @param params.anonymousToken {String} ? Optional string used to
 * configure the anonymous token used by the ANONYMOUS SASL profile.
 *
 * @param params.authorizationId {string} ? This is the user or
 * identity we are requesting to act as. If not provided, the
 * authorizationId is derived from authenticationId.
 *
 * @param params.authenticationId {String} This is the actual
 * authentication credential to be validated. Keep in mind that it is
 * possible to provided a valid authenticationId and password but the
 * server side may deny the authorizationId (for example, requesting
 * to act as an administrator providing user level credentials).
 *
 * @param params.password {String} ? This the password associated to the
 * authenticationId. Some mechanism may not require this value.
 *
 * @param params.onAuthFinishedHandler {Handler} A handler which is
 * called to notify the SASL auth termination.
 *
 * @param params.onAuthFinishedContext [object] (Optional) user object
 * context to run the handler on.
 *
 * When the auth process finishes, no matter the result, the status is
 * notified through \ref
 * VortexConnection.saslAuth.params.onAuthFinishedHandler.param. This
 * handler receives a object that contains the following attributes:
 *
 * - \ref VortexConnection conn : The connection where the
 * authentication request was performed.
 *
 * - \ref String status : Termination status of the request. true to
 * signal authentication finished ok, otherwise false is returned.
 *
 * - \ref String statusMsg : The error message (if any).
 *
 */
VortexConnection.prototype.saslAuth = function (params) {

    /* check connection is ok */
    if (! this.isOk ()) {
	var saslData = {
	    conn : this,
	    status : false,
	    statusMsg :	"Unable to proceed with SASL authentication process, received a connection not ready."
	};
	/* notify connection error */
	VortexEngine.apply (params.onAuthFinishedHandler, params.onAuthFinishedContext, [saslData]);
	return;
    } /* end if */

    /* check that the connection is not already authenticated */
    if (this.isAuthenticated) {
	var saslData = {
	    conn : this,
	    status : false,
	    statusMsg :	"Connection already authenticated, current credentials are: " + this.authenticationId + ", acting as: " + this.authorizationId
	};
	/* notify connection error */
	VortexEngine.apply (params.onAuthFinishedHandler, params.onAuthFinishedContext, [saslData]);
	return;
    } /* end if */

    params.saslEngine =	new VortexSASLEngine (params);
    if (! params.saslEngine.clientInit ()) {
	/* failed to init SASL initial step, notify error */
	var saslData = {
	    conn : this,
	    status : false,
	    statusMsg :	"Failed to start local client SASL operation, error found: " + params.saslEngine.statusMsg
	};

	/* nullify engine */
	params.saslEngine = null;

	/* notify connection error */
	VortexEngine.apply (params.onAuthFinishedHandler, params.onAuthFinishedContext, [saslData]);
	return;
    } /* end if */

    /* get a reference to the connection */
    params.conn = this;

    Vortex.log ("VortexConnection.saslAuth: initial SASL exchange: " + params.saslEngine.blob);
    this.openChannel ({
	/* SASL profile requested */
	profile: "http://iana.org/beep/SASL/" + params.mech,
	serverName: params.serverName,
	profileContent : "<blob>" + params.saslEngine.blob + "</blob>",
	onFrameReceivedHandler : this.saslAuth._frameReceived,
	onFrameReceivedContext : params,
	onChannelCreatedHandler : this.saslAuth._channelCreated,
	onChannelCreatedContext : params
    });

    return;
};

/**
 * @internal Implementation to handle SASL channel creation and to
 * continue with the process if SASL requires.
 */
VortexConnection.prototype.saslAuth._channelCreated = function (replyData) {
    var channel = replyData.channel;
    if (channel == null) {
	/* failed to complete SASL authentication */
	var saslData = {
	    conn : replyData.conn,
	    /* SASL level error */
	    status : false,
	    statusMsg :	"Failed to complete SASL authentication, received a negative reply to create the channel. Error was: (" +
		replyData.replyCode + ") " + replyData.replyMsg,
	    /* specific channel creaion errors */
	    replyCode : replyData.replyCode,
	    replyMsg : replyData.replyMsg
	};

	/* nullify engine */
	this.saslEngine = null;

	/* notify connection error */
	VortexEngine.apply (this.onAuthFinishedHandler, this.onAuthFinishedContext, [saslData]);
	return;
    }
    Vortex.log ("VortexConnection.saslAuth._channelCreated: SASL channel created, now wait frames");
    return;
};

VortexConnection.prototype.saslAuth._frameReceived = function (frameReceived) {
    /* get a reference to the frame */
    var frame = frameReceived.frame;

    /* check frame type */
    Vortex.log ("VortexConnection.saslAuth._frameReceived: content received: " + frame.content);

    /* parse reply content to continue */
    var node = VortexXMLEngine.parseFromString (frame.content);

    if (node == null || node.name != 'blob') {
	/* failed to complete SASL authentication */
	var saslData = {
	    conn : this.conn,
	    status : false,
	    statusMsg :	"Failed to complete SASL authentication, undefined XML content after successful channel creation"
	};

	/* nullify engine */
	this.saslEngine = null;

	/* notify connection error */
	VortexEngine.apply (this.onAuthFinishedHandler, this.onAuthFinishedContext, [saslData]);
	return;
    } /* end if */

    /* provide content received to the saslEngine */
    Vortex.log ("VortexConnection.saslAuth._frameReceived: providing blob received to SASL engine: '" + node.content + "'");
    this.saslEngine.nextStep (node.content);

    /* check for status attribute */
    for (position in node.attrs) {

	/* check for status attribute */
	if (node.attrs[position].name == 'status') {
	    if (node.attrs[position].value == 'complete') {

		/* failed to complete SASL authentication */
		var saslData = {
		    conn : this.conn,
		    status : true,
		    statusMsg :	"Authentication OK"
		};

		/* configure connection */
		this.saslEngine.configureCredentials (this.conn);

		/* nullify engine */
		this.saslEngine = null;

		/* notify connection error */
		VortexEngine.apply (this.onAuthFinishedHandler, this.onAuthFinishedContext, [saslData]);
		return;

	    } else if (node.attrs[position].value == 'abort') {

		/* failed to complete SASL authentication */
		var saslData = {
		    conn : this.conn,
		    status : true,
		    statusMsg :	"Authentication FAILED"
		};

		/* nullify engine */
		this.saslEngine = null;

		/* notify connection error */
		VortexEngine.apply (this.onAuthFinishedHandler, this.onAuthFinishedContext, [saslData]);
		return;

	    } else if (node.attrs[position].value == 'continue') {

		/* SASL profile request to continue with the process: still not implemented */

	    } else {
		/* undefined status */
	    }

	    return;
	} /* end if */
    } /* end for */

    return;
};

/**
 * @brief Allows to start TLS protection for the current BEEP session.
 *
 * @param params.onTLSFinishHandler {Handler} ? The handler where the
 * TLS termination status is notified. You must not use the connection
 * until you get the notification on this handler.
 *
 * @param params.onTLSFinishContext {Object} ? Optional object that
 * provides the context to \ref
 * VortexConnection.enableTLS.params.onTLSFinishHandler.param.
 *
 * When the TLS process finishes, the handler \ref VortexConnection.enableTLS.params.onTLSFinishHandler.param is
 * called with a single object having the following properties:
 *
 * - \ref VortexConnection conn : The connection that was activated to
 * run TLS according to the termination status.
 *
 * - \ref Boolean  status : Boolean value to signal if the process finished properly or not.
 *
 * - \ref String statusMsg : An string providing a textual diagnostic if an error is found.
 */
VortexConnection.prototype.enableTLS = function (params) {

    /* check connection is ok */
    if (! this.isOk ()) {
	var tlsStatus = {
	    conn : this,
	    status : false,
	    statusMsg :	"Unable to proceed with TLS profile, connection is not ready or unconnected."
	};
	/* notify connection error */
	VortexEngine.apply (params.onTLSFinishHandler, params.onTLSFinishContext, [tlsStatus]);
	return;
    } /* end if */

    /* set a reference to the connection */
    params.conn = this;

    Vortex.log ("VortexConnection.enableTLS: create TLS channel");
    this.openChannel ({
	/* request TLS profile */
	profile: "http://iana.org/beep/TLS",
	profileContent : "<ready />",
	onFrameReceivedHandler : this.enableTLS._frameReceived,
	onFrameReceivedContext : params,
	onChannelCreatedHandler : this.enableTLS._channelCreated,
	onChannelCreatedContext : params
    });
    return;
};

VortexConnection.prototype.enableTLS._channelCreated = function (replyData) {
    var channel = replyData.channel;
    if (channel == null) {
	/* failed to create TLS channel */
	var tlsStatus = {
	    conn : replyData.conn,
	    /* tls status error */
	    status : false,
	    statusMsg :	"Failed to start TLS channel required to perform BEEP session security activation" +
		replyData.replyCode + ") " + replyData.replyMsg,
	    /* specific channel creaion errors */
	    replyCode : replyData.replyCode,
	    replyMsg : replyData.replyMsg
	};

	/* notify connection error */
	VortexEngine.apply (this.onTLSFinishHandler, this.onTLSFinishContext, [tlsStatus]);
	return;
    }
    Vortex.log ("VortexConnection.enableTLS._channelCreated: TLS channel created, now wait frames");
    return;
};

VortexConnection.prototype.enableTLS._frameReceived = function (frameReceived) {
    /* get a reference to the frame */
    var frame = frameReceived.frame;

    /* check frame type */
    Vortex.log ("VortexConnection.enableTLS._frameReceived: content received: " + frame.content);

    /* check reply received */
    if (frame.content != '<proceed />') {
	/* error found, manage here */
	return;
    }

    /* install on disconnect handler to get a notification of failure */
    var conn = frameReceived.conn;
    conn.enableTLSonDisconnectId = conn.onDisconnect (
	function (conn) {
	    /* this = params */
	    /* failed to create TLS channel */
	    var tlsStatus = {
		conn : conn,
		/* tls status error */
		status : false,
		statusMsg : "TLS failure during handshake. "
	    };

	    /* notify connection error */
	    VortexEngine.apply (this.onTLSFinishHandler, this.onTLSFinishContext, [tlsStatus]);
	    return;

	}, this);

    /* start here the TLS handshake */
    conn._transport.enableTLS ();

    /* check connection status here to reset its status */
    if (conn.isOk ()) {
	Vortex.log ("VortexConnection.enableTLS._frameReceived: connection status ok after TLS, prepare for greetings exchange");
	conn.resetConnection = true;
	conn.createdHandler  = VortexConnection._enableTLSConnectionCreated;
	conn.createdContext  = this;
    }

    return;
};

/**
 * @internal Handler used to get a notification about the connection
 * setup after all TLS handshake.
 *
 */
VortexConnection._enableTLSConnectionCreated = function (conn) {
    Vortex.log ("VortexConnection._enableTLSConnectionCreated: notifying TLS status after handshake");

    /* uninstall disconnect handler to avoid twice notifications */
    conn.uninstallOnDisconnect (conn.enableTLSonDisconnectId);
    delete conn.enableTLSonDisconnectId;

    /* create status variable to report */
    var tlsStatus = {
	conn : conn,
	status : conn.isOk (),
	statusMsg : (conn.isOk () ? "TLS handshake finished ok, connection secured!" : "FAILED to finish TLS handshake, connection is broken after negotiation")
    };

    /* notify connection */
    VortexEngine.apply (this.onTLSFinishHandler, this.onTLSFinishContext, [tlsStatus]);
    return;
};

/**
 * @brief Closes the transport connection without doing BEEP close
 * negotiation phase.
 *
 * @param error {String} ? Optional message to report as error. If
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
 * @brief Allows to check if there are pending error messages to
 * check.
 *
 * @return {Boolean} true if there are pending error messages,
 * otherwise false is returned.
 *
 */
VortexConnection.prototype.hasErrors = function () {
    /* check if there are at least one message to check */
    return this.stackError.length > 0;
};

/**
 * @brief Allows to get the next error message found on this
 * connection.
 *
 * @return {String} Next available message. You must check
 * \ref VortexConnection.hasErrors first.
 */
VortexConnection.prototype.popError = function () {
    /* return next element */
    return this.stackError.shift ();
};

/**
 * @brief Allows to get the first channel running a particular profile
 * or, if defined channelSelector, the first channel that makes that
 * function to return true.
 *
 * @param profile {String} The profile that the channel must run to be selected.
 *
 * @param channelSelector {Handler} ? An optional handler that will be
 * called to select the channel to be returned by the function.
 *
 * @param data {Object} ? Optional data to be passed to the \ref
 * VortexConnection.getChannelByUri.channelSelector handler if
 * defined.
 *
 * The \ref VortexConnection.getChannelByUri.channelSelector handler,
 * if defined, will receive the following parameters, and will return
 * true or false to select or not the channel:
 *
 * - channel : reference to the channel checked (\ref VortexChannel).
 * - profile : the profile as configured at the function call.
 * - data : data configured by the caller.
 */
VortexConnection.prototype.getChannelByUri = function (profile, channelSelector, data) {

    if (typeof channelSelector == "undefined") {
	/* find by uri */
	for (position in this.channels)  {
	    if (this.channels[position].profile == profile) {
		return this.channels[position];
	    } /* end while */
	}
	/* no channel found */
	return null;
    }

    /* find by function */
    for (position in this.channels) {
	/* call to check if the selector matches the function */
	if (channelSelector (this.channels[position], profile, data))
	    return this.channels[position];
    }
    return null;
};

/**
 * @internal Handler called when the connection is ready to send
 * initial BEEP exchange.
 *
 * "this" reference is pointing to the connection being created.
 */
VortexConnection.prototype._onStart = function () {
    Vortex.log ("VortexConnection._onStart: received notification to start connection..");

    /* create a channel 0 for this new connection */
    this.channels = {
	0 : new VortexChannel (this, 0, "N/A", VortexEngine.channel0Received)
    };

    /* flag greetings sent */
    this.greetingsSent = false;
    this.greetingsSent = false;

    /* check errors here */
    if (this._transport.socket == -1) {
	/* report we have failed to create connection */
	this._reportConnCreated ();
	return;
    }

    /* send greetings reply before receiving listener greetings */
    if (! this.channels[0].sendRPY ("<greeting />\r\n")) {
	Vortex.error ("Unable to send initial RPY with channel 0 greetings, notifying connection lost");
	/* report we have failed to send greetings */
	this._reportConnCreated ();
	return;
    }
    /* flag greetings as sent */
    this.greetingsSent = true;
    if (! this.greetingsPending) {
	/* flag connection as ready */
	this.isReady = true;
	/* report connection */
	this._reportConnCreated ();
    }
    return;
};

/**
 * @internal Handler called by VortexTCPTransport
 * module to notify a connection close.
 */
VortexConnection.prototype._onStop = function () {
    /* call to shutdown */
    if (this.isReady)
	this.shutdown ("Unexpected connection close received. Remote BEEP peer side is down or has closed the connection.");
    else {
	/* do connection shutdown but expected so, no error is imported */
	this.shutdown ();
    }
    return;
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

    /* check for tuning reset */
    if (connection.resetConnection) {
	/* call to init the connection */
	Vortex.log ("VortexConnection._onRead: during connection reset");
	connection._onStart ();
	Vortex.log ("VortexConnection._onRead: connection reset finished, now follow normal processing");

	/* remove the reference to avoid future resets */
	delete connection.resetConnection;
    }

    /* create the frame */
    var frameList = VortexEngine.getFrame (connection, data);
    if (frameList == null) {
	return false;
    }

    /* for each frame received */
    for (iterator in frameList) {
	var frame = frameList[iterator];

	/* get channel associated with the frame */
	var channel = this.channels [frame.channel];

	/* check if channel is available on the connection */
	if (channel == null) {
	    this.shutdown ("VortexConnection._onRead: found frame for a channel no available. Protocol violation.");
	    return false;
	}

	/* check to notify SEQ frame and requeue a send operation with pending messages */
	if (frame.type == 'SEQ') {
	    Vortex.log ("VortexConnection._onRead: notifying SEQ frame received: channel=" +
			channel.number + ", ackno=" + frame.seqno + ", window: " + frame.size);
	    VortexEngine.receivedSEQFrame.apply (channel, [frame]);
	    continue;
	}

	if (Vortex.logEnabled) {
	    Vortex.log ("VortexConnection._onRead: frame received (only header): " +
			frame.type + " " + frame.channel + " " + frame.msgno + " " +
			(frame.more ? '*' : '.') + " " + frame.seqno + " " +
			frame.size + " " + (frame.ansno == undefined ? "" : frame.ansno));
	} /* end if */

	/* update channel SEQ frame to continue receiving content */
	VortexEngine.checkSendSEQFrame (channel, frame);

	/* check if the channel has received handler */
	if (channel.onFrameReceivedHandler == null) {
	    Vortex.warn ("VortexConnection._onRead: received a frame for a channel without received handler. Discarding frame.");
	    continue;
	}

	/* check channel complete flag */
	if (channel.completeFrames && (channel.previousFrame || frame.more)) {
	    /* join received frame and store for later deliver */
	    channel.previousFrame = VortexEngine.joinFrame (connection, channel.previousFrame, frame);

	    /* check join operation before continue */
	    if (channel.previousFrame == null)
		return false;
	    Vortex.log2 ("Successful join operation, now check if we can deliver: " + channel.previousFrame.size + " bytes");

	    /* check if frame is now complete */
	    if (channel.previousFrame.more) {
		Vortex.log2 ("frame is still incomplete, storing for later use");
		/* found that the frame after joining
		 * is still not complete, going next */
		continue;
	    } /* end if */
	    Vortex.log2 ("It seems we are going to deliver the frame to the user, total size: " + channel.previousFrame.size);

	    /* reached this point, previousFrame is
	     * now complete and we can deliver it */
	    frame                 = channel.previousFrame;
	    channel.previousFrame = null;
	} /* end if */

	/* create notification object */
	var frameReceived = {
	    frame : frame,
	    channel : channel,
	    conn : this
	};

	/* parse here all MIME headers */
	frame.mimeHeaders = new Array ();
	Vortex.log ("VortexConnection._onRead: frame content size before parsing mime headers: " + frame.content.length);
	frame.content     = VortexEngine.parseMimeHeaders (frame.mimeHeaders, frame.content);
	Vortex.log ("VortexConnection._onRead: frame content size after parsing mime headers: " + frame.content.length);

	/* notify frame */
	if (channel.onFrameReceivedContext) {
	    /* do notification with context provided by user */
	    channel.onFrameReceivedHandler.apply (channel.onFrameReceivedContext, [frameReceived]);
	} else {
	    /* do notification with channel context */
	    channel.onFrameReceivedHandler.apply (channel, [frameReceived]);
	} /* end if */

	Vortex.log ("VortexConnection._onRead: frame delivered");
    } /* end iterator */

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

    /* return false */
    return false;
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
	if (this.createdContext != null) {
/*	    this.createdHandler.apply (this.createdContext, [this]); */
	    VortexEngine.apply (this.createdHandler, this.createdContext, [this], true);
	} else{
/*	    this.createdHandler.apply (this, [this]); */
	    VortexEngine.apply (this.createdHandler, this, [this], true);
	}
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

