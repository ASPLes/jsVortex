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

    /* flag the connection as not ready. This state will be
     * changed once we have completed session setup. */
    this.isReady   = false;

    /* save handlers */
    this.createdHandler = connectionCreatedHandler;
    this.createdContext = connectionCreatedContext;
    console.log ("VortexConnection.ctor: requesting to create a connection to " + host + ":" + port);

    /* store properties */
    this.host      = host;
    this.port      = port;

    /* define transport */
    this._transport = transport;

    /* register on read */
    this._transport.onRead (this, this._onRead);

    /* create a channel 0 for this new connection */
    this.channels = [
	new VortexChannel (this, 0, "N/A", VortexEngine.channel0Received, null)
    ];

    /* do TCP connect */
    console.log ("Doing TCP connect to: " + host + ", port: " + port);
    this._transport.connect (host, port);

    console.log ("Socket status after connection: " + this._transport.socket);
}

/**
 * @brief Allows to check if the connection is
 * properly setup and running.
 *
 * @return true if the connection is ok (ready to use),
 * otherwise false is returned.
 */
VortexConnection.prototype.isOk = function () {

    if (this._transport == null) {
	console.log ("Transport is not defined..");
	return false;
    }
    /* call to transport is ok implementation */
    if (! this._transport.isOk ()) {
	console.log ("VortexConnection.isOk: connection transport is not available.");
	return false;
    }

    /* check here if we have completed setup operation */
    return true;
    return this.isReady;

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
    console.log ("VortexConnection._onRead, data received: " + data);

    /* create the frame */
    var frame = VortexEngine.getFrame (connection, data);
    if (frame == null) {
	return false;
    }

    /* get channel associated with the frame */
    var channel = this.channels [frame.channel];

    /* check if channel is available on the connection */
    if (channel == null) {
	console.log ("VortexConnection._onRead: found frame for a channel no available. Protocol violation.");
	this.Shutdown ();
	return false;
    }

    /* check if the channel has received handler */
    if (channel.receivedHandler == null) {
	console.log ("VortexConnection._onRead: received a frame for a channel without received handler. Discarding frame.");
	return false;
    }

    /* notify frame */
    channel.receivedHandler.apply (channel, [frame]);

    console.log ("VortexConnection._onRead: frame delivered");
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

    /* check connection status */
    if (! this.isOk ()) {
	console.log ("VortexChannel._sned: unable to send content, connection is not ready.");
	return false;
    }

    /* send content */
    return this._transport.write (content, content.length);
};

