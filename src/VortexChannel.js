/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

function VortexChannel (connection,
			num,
			profile,
			receivedHandler,
			closeHandler) {

    this.connection      = connection;
    this.num             = num;
    this.profile         = profile;
    this.receivedHandler = receivedHandler;
    this.closeHandler    = closeHandler;

    /* configure initial window size */
    this.windowSize          = 4096;

    /* nextMsgno: holds the next value to be used
     * for the next send operation. */
    this.nextMsgno       = 0;

    /* nextReplyMsgno: holds the next message number we
     * have to reply to. Because javascript single thread nature
     * this value holds the sequencial reply operations that
     * takes place in a channel. In fact sendRPY do not require
     * the msg_no to reply to because no other thread can reply
     * than the current one. This means the caller can't reply to
     * a message having pending messages to be replied. */
    this.nextReplyMsgno  = 0;

    /* maxAllowedSeqno: holds the max allowed incoming
     * content (byte stream) to be received before
     * issuing a new SEQ frame */
    this.maxAllowedSeqno     = 4095;

    /* nextSeqno: holds the next expected incoming seqno
     * value for the first byte on the next frame received.
     */
    this.nextSeqno           = 0;

    /* maxAllowedPeerSeqno: holds the maximum amount
     * of content (last byte) that can be sent to the
     * remote peer before the next incoming SEQ frame
     * is received updating such value.
     */
    this.maxAllowedPeerSeqno = 4095;

    /* nextPeerSeqno: holds the next seqno value to be
     * used for the next send operation.
     */
    this.nextPeerSeqno = 0;

    /* sendQueue: holds a list of pending messages to
     * be sent over this channel. Before a message is
     * sent over a channel, it is "queued" to give priority
     * to previous messages.
     *
     * In the case of empty queue, the message is sent
     * directly unless remote seqno accepts this
     * (maxAllowedPeerSeqno).
     *
     * In the case only a piece of the message can be sent
     * it is splitted, sent and the rest of the message is
     * queued until a SEQ frame is received.
     */
    this.sendQueue = new Array ();

    /* channel status (if channel number if 0, it is ready,
     * otherwise it is pending to be fully opened) */
    this.isReady   = (num == 0);
};

/**
 * @brief Sends content the provided over the channel. The method checks
 * if the connection is ready and the transport available.
 *
 * @param content [string] The content to be sent.
 *
 * @param mimeHeaders [array of VortexMimeHeader] An array containing a list of VortexMimeHeader
 * objects having the list of mime headers to configure. In the case null is
 * provided, no MIME header is placed on the frame sent.
 *
 * @return 1 if the case the content was queued to be sent, otherwise
 * 0 is returned. The function returns 2 in the case the channel is stale
 * (no SEQ no is available to send content).
 */
VortexChannel.prototype.sendRPY = function (content, mimeHeaders) {
    if (! this.isReady) {
	Vortex.warn ("VortexChannel.send: unable to send content, connection is not ready.");
	return false;
    }

    /* check queue status */
    if (this.sendQueue.length > 0) {
	/* pending messages to be sent on the queue, store
	 * current message and manage next message in the
	 * queue */

	/* add the content in the end of the queue */
	this.sendQueue.push (content);

	/* update content reference (get the first element
	 * from the queue and remote it from the queue) */
	content = this.sendQueue.shift ();
    }

    /* now check how much from this content we can send assuming
     * remote allowed seqno (maxAllowedPeerSeqno) */
    var allowedSize = (this.maxAllowedPeerSeqno - this.nextPeerSeqno);
    Vortex.log ("VortexChannel.sendRPY: doing a send operation, allowed bytes: " + allowedSize + ", content size: " + content.length);

    /* check channel stalled */
    if (allowedSize == 0) {
	Vortex.warn ("VortexChannel.sendRPY: channel is stalled, queueing content");

	/* add the content at the begining of the queue to
	 * handle it first on the next operation. */
	this.sendQueue.unshift (content);

	return false;
    }

    /* check if we can send all content in a single frame */
    var isComplete = true;
    if (content.length > allowedSize) {
	/* we have too much content to be sent at this moment, split
	 * and store to continue. At this point we know we can send at
	 * least one byte. */
	var pending_content = content.substring (allowedSize, content.length - 1);
	this.sendQueue.unshift (pending_content);

	/* update content to be sent */
	content = data.substring (0, allowedSize - 1);

	/* flag if the frame contains all the content to be sent */
	isComplete = false;
    } /* end if */

    /* reached this point, we have in content all the content to be sent
     * over this channel and, if pending content was found (either because
     * SEQ no exhausted or because the content was to large) it is already
     * queued for later management. */

    /* build the frame to sent */
    var _mimeHeaders = this.getMimeHeaders (mimeHeaders);
    var frame        = "RPY " + this.num + " " + this.nextReplyMsgno + " " +
	(isComplete ? ". " : "* ") + this.nextPeerSeqno + " " + (content.length + _mimeHeaders.length + 2) + "\r\n" + this.getMimeHeaders (mimeHeaders) + "\r\n" + content + "END\r\n";

    /* Vortex.log ("VortexChanenl.sendRPY: sending frame: " + frame); */

    /* update channel status */
    this.nextPeerSeqno += content.length;

    /* send the content */
    return (this.connection._send.apply (this.connection, [frame]));
};

/**
 * @brief Allows to create a new BEEP channel in the provided
 * connection.
 *
 * @param connection [VortexConnection] The BEEP session where the channel will be created.
 *
 * @param channelNumber [int] The BEEP channel number	that is requested.
 * You can use 0 to request jsVortex to asign the next available channel
 * number.
 *
 * @param serverName [string] The serverName token. Configuring this value request
 * the remote BEEP peer to act as the value provided by serverName. The
 * first channel completely created that request this value will be the
 * serverName value for all channels in the connection. From RFC3080:
 * "The serverName attribute for the first successful "start" element
 * received by a BEEP peer is meaningful for the duration of the BEEP
 * session. If present, the BEEP peer decides whether to operate as the
 * indicated "serverName"; if not, an "error" element is sent in a
 * negative reply.
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
 *  \ref VortexConnection.popError).
 */
VortexChannel.prototype.createChannel = function (connection,
						  channelNumber,
						  serverName,
						  profile,
						  profileContent,
						  profileContentEncoding,
					          closeHandler,            closeContext,
						  receivedHandler,         receivedContext,
						  onChannelCreatedHandler, onChannelCreatedContext) {
    /* check the connection status before continue */
    if (VortexEngine.checkReference (connection, "host"))
	return false;


    return true;
};

/**
 * @internal Method used to produce MIME headers to be added
 * to messages sent.
 *
 * @param mimeHeaders [array of VortexMimeHeader] Optional reference to an array of
 * mime headers to be configured.
 *
 * @return [string] Returns the string representation for the MIME headers.
 */
VortexChannel.prototype.getMimeHeaders = function (mimeHeaders) {

    /* mime headers for channel 0 */
    if (this.num == 0) {
	return "Content-Type: application/beep+xml\r\n";
    }

    /* check user defined mime headers */
    if (mimeHeaders != undefined && mimeHeaders != null ) {
	/* create the mime representation with the information
	 * received inside the array mimeHeaders */
	var result = "";
	for (i in mimeHeaders) {
	    result = result + mimeHeaders[i].header + ": " + mimeHeaders[i].content + "\r\n";
	}
	/* return result created */
	return result;
    } /* end if */

    /* no mime headers configured, return empty string */
    return "";
};