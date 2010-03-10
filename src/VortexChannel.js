/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a channel object associated to the connection
 * provided, channel number and profile provided.
 *
 * This constructor is not used directly the by API consumer. A \ref
 * VortexConnection instance is used to create channels using:  \ref VortexConnection.openChannel
 *
 * @param conn {VortexConnection} Connection to be associated to the channel.
 *
 * @param number {Number} The channel number.
 *
 * @param profile {String} The profile associated to the channel.
 *
 * @param onFrameReceivedHandler {Handler} ? Handler called to notify
 * frames received on this channel.
 *
 * @param onFrameReceivedContext {Object} ? context to run
 * onFrameReceivedHandler.
 *
 * @param onCloseHandler {Handler} ? Handler called if a channel close
 * notification is received for this channel.
 *
 * @param onCloseContext {Object} ? Optional context to run
 * onCloseContext.
 *
 * @return A new reference to the channel object created. This
 * reference can't be used until the BEEP channel negotation finishes.
 *
 * The handler \ref VortexChannel.onFrameReceivedHandler.param is activated
 * each time a frame is received. This handler receives an object that
 * provides the following attributes:
 *
 * - \ref VortexFrame frame : The frame that was received.
 * - \ref VortexChannel channel : The channel where the frame was received.
 * - \ref VortexConnection conn : The connection where the frame was received.
 *
 * See also the following reference to know more about creating channels: \ref jsvortex_manual_creating_a_channel.
 */
function VortexChannel (conn,
			number,
			profile,
			onFrameReceivedHandler,
			onFrameReceivedContext,
			onCloseHandler,
			onCloseContext) {

    /**
     * @brief Channel's connection reference.
     * @type VortexConnection
     */
    this.conn                   = conn;

    /**
     * @brief Channel number.
     * @type Number
     */
    this.number                 = number;
    /**
     * @brief Channel profile
     * @type String
     */
    this.profile                = profile;

    /**
     * @brief Channel received handler.
     * @type Handler
     *
     * This is activated each time a frame is received.
     * This handler receives an object that provides the
     *  following attributes:
     *
     * - \ref VortexFrame frame : The frame that was received.
     * - \ref VortexChannel channel : The channel where the frame was received.
     * - \ref VortexConnection conn : The connection where the frame was received.
     */
    this.onFrameReceivedHandler = onFrameReceivedHandler;
    this.onFrameReceivedContext = onFrameReceivedContext;

    /**
     * @internal hash used to track particular frame received handlers
     * configured to handle replies to particular issued messages on
     * this channel. In the case it is defined this frame received,
     * onFrameReceivedHandler is ignored.
     */
    this.msgNoFrameReceived     = {};

    /**
     * @brief Channel close handler.
     * @type Handler
     */
    this.onCloseHandler         = onCloseHandler;
    this.onCloseContext         = onCloseContext;

    /* configure initial window size */
    this.windowSize             = 4096;

    /* nextMsgno: holds the next value to be used
     * for the next send operation. */
    this.nextMsgno              = 0;

    /* lastMsgno: holds the last msgno value used for MSG frame sent
     * over this channel. This value will likely contain the same value
     * like nextMsgno - 1, but under some circumstances it is possible
     * to reuse message numbers. This value tracks that value. */
    this.lastMsgno              = -1;

    /* lastMsgnoReplyReceived: holds the last msgno frame replied on
     * the channel. */
    this.lastMsgnoReplyReceived = -1;

    /* nextReplyMsgno: holds the next message number we
     * have to reply to. Because javascript single thread nature
     * this value holds the sequencial reply operations that
     * takes place in a channel. In fact sendRPY do not require
     * the msg_no to reply to because no other thread can reply
     * than the current one. This means the caller can't reply to
     * a message having pending messages to be replied. */
    this.nextReplyMsgno         = 0;

    /* maxAllowedSeqno: holds the max allowed incoming
     * content (byte stream) to be received before
     * issuing a new SEQ frame */
    this.maxAllowedSeqno        = 4095;

    /* nextSeqno: holds the next expected incoming seqno
     * value for the first byte on the next frame received.
     */
    this.nextSeqno              = 0;

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
    this.isOpened   = (number == 0);

    /**
     * @brief Allows to control if the channel should deliver complete
     * frames (joining fragments automatically).
     *
     * By default all frames received on this channel will be
     * delivered complete. This means that partial frames received
     * won't be notified until all pieces are received.
     *
     * You can change this value to false so all frame fragments
     * received will be received. Keep in mind you'll have to
     * handle frame joining (if required).
     */
    this.completeFrames = true;

    /**
     * @brief Holds an status code value for the last send operation
     * done with \ref VortexChannel.sendMSG or \ref
     * VortexChannel.sendRPY.
     *
     * The following values are indicated after a send operation:
     *
     * - 1 : All content was sent into a single message (no content was left
     * waiting for a SEQ frame to complete the sequence). In this case the
     * function returns true.
     *
     * - 2 : Part of the message was sent and the rest was queued to later
     * delivery (until SEQ frame from remote side is received). In this
     * case the function returns true.
     *
     * - 0 : Failed to send the content. Error found during the
     * operation. Check connection stack error. In this case the send function
     * returns false. See \ref VortexConnection.hasErrors.
     *
     * - -1 : Channel is stalled and no more send operations are
     * allowed. The entire message was queued for later delivery. In this
     * case the function returns true.
     *
     * - -2 : No pending content to be sent. This is useful when content and
     * type are null references (to request a flush operation for pending
     * queued content when a SEQ frame is received). This is mostly used
     * by jsVortex engine. In this case the function returns true.
     *
     */
     this.lastStatusCode = 0;
};

/**
 * @brief Allows to send a message over the channe selected using MSG
 * frame type.
 *
 * The method receives the content to be sent and an array of MIME
 * headers (\ref VortexMimeHeader).
 *
 * @param content {String} The message to be sent over this channel.
 *
 * @param mimeHeaders {VortexMimeHeader []} ? An list of MIME headers to
 * associate with the message.
 *
 * @param onFrameReceivedHandler {onFrameReceivedHandler} ? Optional
 * handler that overrides current \ref VortexChannel.onFrameReceivedHandler
 * handler configured. This handler is used to handle frame replies
 * (RPY, ERR, ANS/NUL) for the particular send operation produced by a
 * call to this method.
 *
 * @param onFrameReceivedContext {Object} ? Context under which will be executed \ref VortexChannel.sendMSG.param.onFrameReceivedHandler.
 *
 * @return {Boolean} The function returns true if the send operation was
 * completed or partially completed or still not send because the
 * message was queued (pending for a SEQ frame) but no error was
 * found. In the case an unrecoverable error is found, the function
 * returns false. You must also check for \ref VortexChannel.lastStatusCode to
 * get more information for the last operation.
 *
 */
VortexChannel.prototype.sendMSG = function (content, mimeHeaders, onFrameReceivedHandler, onFrameReceivedContext) {
    /* build mime headers provided by the user */
    var _mimeHeaders = this.getMimeHeaders (mimeHeaders);

    /* use common implementation */
    return this.sendCommon (_mimeHeaders + "\r\n" + content, "MSG", onFrameReceivedHandler, onFrameReceivedContext);
};

/**
 * @brief Allows to send a message over the channe selected using ERR
 * frame type.
 *
 * The method receives the content to be sent and an array of MIME
 * headers (\ref VortexMimeHeader).
 *
 * @param content {String} The message to be sent over this channel.
 *
 * @param mimeHeaders {VortexMimeHeader []} ? An list of MIME headers to
 * associate with the message.
 *
 * @return {Boolean} The function returns true if the send operation was
 * completed or partially completed or still not send because the
 * message was queued (pending for a SEQ frame) but no error was
 * found. In the case an unrecoverable error is found, the function
 * returns false. You must also check for \ref VortexChannel.lastStatusCode to
 * get more information for the last operation.
 *
 */
VortexChannel.prototype.sendERR = function (content, mimeHeaders) {
    /* build mime headers provided by the user */
    var _mimeHeaders = this.getMimeHeaders (mimeHeaders);

    /* use common implementation */
    return this.sendCommon (_mimeHeaders + "\r\n" + content, "ERR");
};

/**
 * @brief Sends content the provided over the channel using RPY frame
 * type. The method checks if the connection is ready and the
 * transport available.
 *
 * @param content {String} The content to be sent.
 *
 * @param mimeHeaders {VortexMimeHeader []} ? An array containing a list
 * of VortexMimeHeader objects having the list of mime headers to
 * configure.
 *
 * @return The function returns true if the send operation was
 * completed or partially completed or still not send because the
 * message was queued (pending for a SEQ frame) but no error was
 * found. In the case an unrecoverable error is found, the function
 * returns false. You must also check for \ref VortexChannel.lastStatusCode to
 * get more information for the last operation.
 *
 */
VortexChannel.prototype.sendRPY = function (content, mimeHeaders) {
    /* build mime headers provided by the user */
    var _mimeHeaders = this.getMimeHeaders (mimeHeaders);

    /* use common implementation */
    return this.sendCommon (_mimeHeaders + "\r\n" + content, "RPY");
};

/**
 * @brief Closes a channel defined by the caller reference.
 *
 * This function allows to close a channel using its reference. It is
 * implemented on top of \ref VortexConnection.closeChannel.
 *
 * @param params.onChannelCloseHandler {Handler} ? The handler that is used by
 * the method to notify the caller with the termination status. On
 * this method is notified either if the channel was closed or the
 * error found.
 *
 * @param params.onChannelCloseContext {Object} ? The context object under
 * which the handler will be executed.
 *
 * @return {Boolean} true in the case the close operation start
 * without incident (request to close the message sent waiting for
 * reply). Otherwise false is returned indicating the close operation
 * was not started. You can safely skip value returned by the function
 * and handle all cases at the notification handler (\ref
 * VortexChannel.close.params.onChannelCloseHandler.param). Note that
 * this function may return true but the close operation may be
 * defined. The channel isn't closed until its notified through \ref
 * VortexChannel.close.params.onChannelCloseHandler.param.
 *
 * The handler \ref
 * VortexChannel.close.params.onChannelCloseHandler.param is called
 * when the close operation finishes and receives an object with the
 * following attributes:
 *
 * - \ref VortexConnection conn : the connection where the channel was closed.
 *
 * - \ref Boolean status : true to signal that the channel was closed, otherwise
 * false is returned.
 *
 * - \ref String replyCode : tree digit error code indicating the motive to deny
 * channel close operation.
 *
 * - \ref String replyMsg : Human readable textual diagnostic reporting motivy to
 * deny channel close operation (or faillure found).
 *
 */
VortexChannel.prototype.close = function (params) {

    if (! VortexEngine.checkReference (params))
	return false;

    /* add channelNumber paramer to params */
    params.channelNumber = this.number;

    /* call to close using connection close channel */
    return this.conn.closeChannel (params);
};

/**
 * @brief Allows to check if a channel is in ready state, that is, no
 * pending replies are waiting. This means that the next message sent
 * over this channel will be the next to be replied. A channel that is
 * not in ready state can be used to send more messages but replies to
 * those message will be blocked by pending replies of previous
 * messages.
 *
 * @return {Boolean} true if the channel is ready, otherwise false is
 * returned.
 */
VortexChannel.prototype.isReady = function () {
    /* check if the last message was replied */
    Vortex.log ("VortexChannel.isReady: checking is channel: " +
		this.number + ", is ready: (lastMsgno=" + this.lastMsgno + " == lastMsgnoReplyReceived=" + this.lastMsgnoReplyReceived + ")");
    return (this.lastMsgno == this.lastMsgnoReplyReceived);
};

/**
 * @internal Method used as a base implementation for
 * VortexChannel.sendRPY and VortexChannel.sendMSG.
 *
 * @param content {string} The content to be sent.
 *
 * @param mimeHeaders {array of VortexMimeHeader} An array containing
 * a list of VortexMimeHeader objects having the list of mime headers
 * to configure. In the case null is provided, no MIME header is
 * placed on the frame sent.
 *
 * @return The function returns true if the send operation was
 * completed or partially completed or still not send because the
 * message was queued (pending for a SEQ frame) but no error was
 * found. In the case an unrecoverable error is found, the function
 * returns false. You must also check for channel.lastStatusCode to
 * get more information for the last operation. See the following values:
 *
 * 1 : All content was sent into a single message (no content was left
 * waiting for a SEQ frame to complete the sequence). In this case the
 * function returns true.
 *
 * 2 : Part of the message was sent and the rest was queued to later
 * delivery (until SEQ frame from remote side is received). In this
 * case the function returns true.
 *
 * 0 : Failed to send the content. Error found during the
 * operation. Check connection stack error. In this case the function
 * returns false.
 *
 * -1 : Channel is stalled and no more send operations are
 * allowed. The entire message was queued for later delivery. In this
 * case the function returns true.
 *
 * -2 : No pending content to be sent. This is useful when content and
 * type are null references (to request a flush operation for pending
 * queued content when a SEQ frame is received). This is mostly used
 * by jsVortex engine. In this case the function returns true.
 *
 */
VortexChannel.prototype.sendCommon = function (content, type, onFrameReceivedHandler, onFrameReceivedContext) {

    var pendingSend;
    var resending = (content == null && type == null);

    if (! this.isOpened) {
	Vortex.warn ("VortexChannel.sendCommon (" + type + "): unable to send content, connection is not ready.");
	this.lastStatusCode = 0;
	return false;
    } /* end if */

    /* check queue status */
    if (this.sendQueue.length > 0) {

	/* queue caller content only if it is found to be defined */
	if (content != null && type != null) {

	    /* pending messages to be sent on the queue, store
	     * current message and manage next message in the
	     * queue */
	    pendingSend = {
		content: content,
		type : type
	    };

	    /* add the content in the end of the queue */
	    this.sendQueue.push (pendingSend);
	} /* end if */

	/* update content reference (get the first element
	 * from the queue and remote it from the queue) */
	pendingSend = this.sendQueue.shift ();
	/* update local variables */
	content     = pendingSend.content;
	type        = pendingSend.type;

    } /* end if */

    /* check here if content == null (we are requesting to flush previous content) */
    if (content == null && type == null) {
	Vortex.log ("VortexChannel.sendCommon: no more content peding to be sent");
	this.lastStatusCode = -2;
	return true;
    }

    /* now check how much from this content we can send assuming
     * remote allowed seqno (maxAllowedPeerSeqno) */
    var allowedSize = (this.maxAllowedPeerSeqno - this.nextPeerSeqno);
    Vortex.log ("VortexChannel.sendCommon (" + type + "): doing a send operation, allowed bytes: " + allowedSize + ", content size: " + content.length);
    Vortex.log ("VortexChannel.sendCommon (" + type + "): maxAllowedPeerSeqno: " + this.maxAllowedPeerSeqno + ", nextPeerSeqno: " + this.nextPeerSeqno);

    /* check channel stalled */
    if (allowedSize == 0) {
	Vortex.warn ("VortexChannel.sendCommon (" + type + "): channel is stalled, queueing content");

	/* add the content at the begining of the queue to
	 * handle it first on the next operation. */
	pendingSend = { content: content,  type : type };
	this.sendQueue.unshift (pendingSend);

	/* return here to stop trying to send content */
	this.lastStatusCode = -1;
	return true;
    }

    /* check if we can send all content in a single frame */
    var isComplete = true;
    if (content.length > allowedSize) {
	Vortex.log ("VortexChannel.sendCommon (" + type + "): found send operation with a message larger than allowed remote seqno");
	/* we have too much content to be sent at this moment, split
	 * and store to continue. At this point we know we can send at
	 * least one byte. */
	var pending_content = content.substring (allowedSize, content.length);
	Vortex.log ("VortexChannel.sendCommon (" + type + "): queueing the rest for later send: " + pending_content.length + " bytes");

	/* store pending content for later retrieval */
	pendingSend = {
	    content: pending_content,
	    type: type
	};
	this.sendQueue.unshift (pendingSend);

	/* update content to be sent */
	content = content.substring (0, allowedSize);
	Vortex.log ("VortexChannel.sendCommont (" + type + "): sending allowed content: " + content.length + " bytes");

	/* flag if the frame contains all the content to be sent */
	isComplete = false;
    } /* end if */

    /* reached this point, we have in content all the content to be sent
     * over this channel and, if pending content was found (either because
     * SEQ no exhausted or because the content was to large) it is already
     * queued for later management. */

    /* build the frame to sent */
    var frame;
    if (type == "RPY") {
	/* RPY frames */
	frame        = "RPY " + this.number + " " + this.nextReplyMsgno + " " +
	    (isComplete ? ". " : "* ") + this.nextPeerSeqno + " " + (content.length) + "\r\n" + content + "END\r\n";

	/* increase next replyMsgno only if we have sent a comple reply */
	if (isComplete)
	    this.nextReplyMsgno++;
    } else {
	/* MSG frames */
	frame        = type + " " + this.number + " " + this.nextMsgno + " " +
	    (isComplete ? ". " : "* ") + this.nextPeerSeqno + " " + (content.length) + "\r\n" + content + "END\r\n";

	/* increase nextMsgno only if we have sent a complete message */
	if (isComplete) {

	    /* check and configure onFrameReceivedHandler for this send operation (only for MSG operations) */
	    if (typeof onFrameReceivedHandler != "undefined") {
		Vortex.log ("Configuring particular onFrameReceivedHandler for message number: " + this.nextMsgno);
		/* configure a particular frame received handler for this particular send operation */
		this.msgNoFrameReceived[this.nextMsgno.toString ()] = {
		    handler : onFrameReceivedHandler,
		    ctx     : onFrameReceivedContext
		};
	    } /* end if */

	    /* record last msgno value used */
	    this.lastMsgno = this.nextMsgno;

	    /* update next msgNo value to be used. */
	    this.nextMsgno++;
	}
    } /* end if */

    /* update channel status */
    this.nextPeerSeqno += content.length;

    /* signal send operation ok, but use 1 to signal complete send (no
    pending content) */
    this.lastStatusCode = (isComplete ? 1 : 2);

    /* send the content */
    Vortex.log ("VortexChannel.sendCommon: about to do send operation: " + frame.length + " bytes");
    return this.conn._send.apply (this.conn, [frame]);
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
    if (this.number == 0) {
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