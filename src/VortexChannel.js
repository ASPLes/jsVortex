/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a channel object associated to the connection
 * provided, channel number and profile provided.
 *
 * @param conn Connection to be associated to the channel.
 *
 * @param number The channel number.
 *
 * @param profile The profile associated to the channel.
 *
 * @param onFrameReceivedHandler Handler called to notify frames
 * received on this channel.
 *
 * @param onFrameReceivedContext Optional context to run
 * onFrameReceivedHandler.
 *
 * @param onCloseHandler Handler called if a channel close
 * notification is received for this channel.
 *
 * @param onCloseContext Optional context to run onCloseContext.
 *
 * @return A new reference to the channel object created.
 *
 * onFrameReceivedHandler receives an object that provides the
 * following attributes:
 *
 * - frame : The frame that was received.
 * - channel : The channel where the frame was received.
 * - conn : The connection where the frame was received.
 */
function VortexChannel (conn,
			number,
			profile,
			onFrameReceivedHandler,
			onFrameReceivedContext,
			onCloseHandler,
			onCloseContext) {

    /**
     * @brief Channel's connection.
     */
    this.conn                   = conn;

    /**
     * @brief Channel number.
     */
    this.number                 = number;
    /**
     * @brief Channel profile
     */
    this.profile                = profile;
    /**
     * @brief Channel received handler.
     */
    this.onFrameReceivedHandler = onFrameReceivedHandler;
    this.onFrameReceivedContext = onFrameReceivedContext;

    /**
     * @brief Channel close handler.
     */
    this.onCloseHandler         = onCloseHandler;
    this.onCloseContext         = onCloseContext;

    /* configure initial window size */
    this.windowSize             = 4096;

    /* nextMsgno: holds the next value to be used
     * for the next send operation. */
    this.nextMsgno              = 0;

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
    this.isReady   = (number == 0);
};

/**
 * @brief Allows to send a message over the channe selected.
 *
 * @param message The message to be sent over this channel
 */
VortexChannel.prototype.sendMSG = function (content, mimeHeaders) {
    /* use common implementation */
    return this.sendCommon (content, mimeHeaders, "MSG");
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
    /* use common implementation */
    return this.sendCommon (content, mimeHeaders, "RPY");
};

/**
 * @internal Method used as a base implementation for
 * VortexChannel.sendRPY and VortexChannel.sendMSG.
 *
 * @param content [string] The content to be sent.
 *
 * @param mimeHeaders [array of VortexMimeHeader] An array containing
 * a list of VortexMimeHeader objects having the list of mime headers
 * to configure. In the case null is provided, no MIME header is
 * placed on the frame sent.
 *
 * @return 1 if the case the content was queued to be sent, otherwise
 * 0 is returned. The function returns 2 in the case the channel is
 * stale (no SEQ no is available to send content).
 *
 */
VortexChannel.prototype.sendCommon = function (content, mimeHeaders, type) {

    if (! this.isReady) {
	Vortex.warn ("VortexChannel.sendCommon (" + type + "): unable to send content, connection is not ready.");
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
    Vortex.log ("VortexChannel.sendCommon (" + type + "): doing a send operation, allowed bytes: " + allowedSize + ", content size: " + content.length);

    /* check channel stalled */
    if (allowedSize == 0) {
	Vortex.warn ("VortexChannel.sendCommon (" + type + "): channel is stalled, queueing content");

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
    var frame;
    if (type == "RPY") {
	/* RPY frames */
	frame        = "RPY " + this.number + " " + this.nextReplyMsgno + " " +
	    (isComplete ? ". " : "* ") + this.nextPeerSeqno + " " + (content.length + _mimeHeaders.length + 2) + "\r\n" +
	    this.getMimeHeaders (mimeHeaders) + "\r\n" + content + "END\r\n";
    } else {
	/* MSG frames */
	frame        = "MSG " + this.number + " " + this.nextMsgno + " " +
	    (isComplete ? ". " : "* ") + this.nextPeerSeqno + " " + (content.length + _mimeHeaders.length + 2) + "\r\n" +
	    this.getMimeHeaders (mimeHeaders) + "\r\n" + content + "END\r\n";
    }

    /* Vortex.log ("VortexChanenl.sendRPY: sending frame: " + frame); */

    /* update channel status */
    this.nextPeerSeqno += (content.length + _mimeHeaders.length + 2);

    /* send the content */
    return (this.connection._send.apply (this.connection, [frame]));
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