/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

if (typeof VortexEngine == "undefined") {
    /**
     * @brief VortexEngine provides some internal functions to process
     * incoming BEEP content and some public API used by other
     * jsVortex modules.
     */
    var VortexEngine = {
	/**
	 * Variable used by VortexEngine object to report
	 * number of items read after a VortexEngine.getNumber.
	 */
	itemsRead : 0,
	/**
	 * Variable used to track parser position.
	 */
	position : 0
    };
}

/**
 * @brief Allows to check if the object reference received is not null
 * or undefined. The function also checks the attribute to be present
 * in the object.
 *
 * @param object {Object} The reference to check.
 *
 * @param attr {String} ? Optional attribute to check. null to skip attribute
 * check. This can be used check if the object is really the
 * reference expected by selected a particular attribute that should
 * be available.
 *
 * @param msg {String} ? Optional error message to register in the
 * case of error.
 *
 * @return {Boolean} true If the reference is ok, therwise false is returned.
  */
VortexEngine.checkReference = function (object, attr, msg) {

    /* check for null reference */
    if (object == null || typeof (object) == "undefined") {
	if (msg) {
	    Vortex.error ("Undefined reference found at: " + arguments.callee.caller.name + ", " + msg);
	} else {
	    Vortex.error ("Undefined reference found at: " + arguments.callee.caller.name);
	}
	return false;
    }

    if (attr != null && typeof (attr) != "undefined") {
	if (object[attr] == null || object[attr] == "undefined") {
	    if (msg) {
		Vortex.error ("Undefined attribute [" + attr + "] expected to be found found at: " + arguments.callee.caller.name + ", " + msg);
	    } else {
		Vortex.error ("Undefined attribute [" + attr + "] expected to be found found at: " + arguments.callee.caller.name);
	    }
	    return false;
	} /* end if */
    } /* end if */

    /* attribute ok */
    return true;
};

/**
 * @brief Support function that allows to notify on the handler
 * provided, running optionally on the context provided, the list of
 * arguments provided. In the case the context is not provided, the
 * handler is executed with no context (this keyword points to null).
 *
 * @param handler {Handler} The handler to executed.
 *
 * @param context {Object} ? Optional reference to the context that is
 * required to run the handler on. In the case of null or undefined is
 * provided, the 'this' keyword will be the global object.
 *
 * @param call_args {Array} A list of arguments to be provided to the
 * handler. In the case of no arguments, do provide nothing (or null
 * or undefined).
 *
 * @param deffer {Boolean} Signal function to call the method via
 * setTimeout.
 *
 * @return The function returns the value returned by the application
 * if the handler, with the arguments provided, under the optional
 * context. In the case deffer option is set to true, the function
 * always return true
 */
VortexEngine.apply = function (handler, context, call_args, deffer) {
    /* check handler */
    if (typeof handler == "undefined" || handler == null)
	return false;

    if ((typeof deffer != "undefined") && deffer) {
	/* set a timeout function */
	setTimeout (
	    function () {VortexEngine.applyDeferred (handler, context, call_args); handler = null; context = null; call_args = null;},
	    /* one millisecond in the future */
	    1);
	return true;
    }

    /* check context */
    return handler.apply (context, call_args);
};

VortexEngine.applyDeferred = function (handler, context, call_args) {
    handler.apply (context, call_args);
};

/**
 * @brief Allows to count the number of items that are stored in the
 * provided object. This function is useful if the object is used as
 * an associative array.
 *
 * @param object {Object} The object that is required to return the
 * number of properties or items stored.
 *
 * @return {Number} 0 or the number of items stored.
 */
VortexEngine.count = function (object) {
    var size = 0;
    if (typeof object == "undefined")
	return 0;
    if ((typeof object.length) != "undefined")
	return object.length;
    for (var item in object) {
	size++;
    }
    return size;
};

/**
 * @brief Implements string.trim () method, removing leading and
 * trailing whitespaces.
 * @param string {String} The string to trim.
 *
 * @return An new string with content trimmed.
 */
VortexEngine.trim = function (string) {
    /* return result */
    return string.replace(/^\s+|\s+$/g, '');
};

/**
 * @brief Allows to join two frames doing a check operation during the
 * operation.
 *
 * It is assumed the two frames received to be joint represents a pair
 * that are consecutive in the seqno serie, that is, frameA goes
 * before frameB.
 *
 * @param conn {VortexConnection} A reference to the BEEP connection
 * where the frame was received.
 *
 * @param frameA {VortexFrame} The frame to join. It can be null, In such case, it
 * is returned frameB untouched.
 *
 * @param frameB {VortexFrame} The second frame to join. It cannot be null.
 *
 * @return {VortexFrame} The function returns a newly joined frame
 * reference or Null if it fails. In case of fail, check connection
 * errors (\ref VortexConnection.hasErrors and \ref
 * VortexConnection.popError).
 *
 */
VortexEngine.joinFrame = function (conn, frameA, frameB) {
    /* check errors */
    if (! VortexEngine.checkReference (frameB, "channel"))
	return null;

    /* basic case */
    if (frameA == null)
	return frameB;

    /* normal case */
    if (frameA.type != frameB.type) {
	conn.shutdown ("frame type mismatch while trying to joing frames");
	return null;
    }
    if (frameA.channel != frameB.channel) {
	conn.shutdown ("frame channel mismatch while trying to joing frames");
	return null;
    }
    if (! frameA.more && !frameB.more) {
	conn.shutdown ("frame more flag mismatch while trying to joing frames");
	return null;
    }
    if (frameA.msgno != frameB.msgno) {
	conn.shutdown ("frame msgno mismatch while trying to joing frames");
	return null;
    }
    if (frameA.ansno != frameB.ansno) {
	conn.shutdown ("frame ansno mismatch while trying to joing frames");
	return null;
    }
    if ((frameA.seqno + frameA.size) != frameB.seqno) {
	conn.shutdown ("frame seqno mismatch while trying to joing frames");
	return null;
    }

    /* do join operation after all checks */
    frameA.more    = (frameA.more && frameB.more);
    frameA.size    = (frameA.size + frameB.size);
    frameA.content = frameA.content + frameB.content;

    /* no mime headers are copied */
    return frameA;
};

/**
 * @internal Function that allows to get the next number inside
 * the stream referenced by data.
 *
 * @param data stream that should contain a number.
 *
 * @return The number read from the stream. The function updates
 * this.itemsRead and this.position after each operation.
 */
VortexEngine.getNumber = function (data) {

    var iterator = this.position;
    var value    = 0;

    /* skip white spaces (first) */
    while (iterator < data.length) {
	if (data.charAt(iterator) == " ") {
	    iterator++;
	}
	break;
    }

    /* now catch numbers */
    /* Vortex.log2 ("VortexEngine.getNumber: starting iterator=" + iterator + ", length: " + data.length); */
    while (iterator < data.length) {

	/* Vortex.log2 ("VortexEngine.getNumber: checking digit='" + data.charAt(iterator) + "' iterator=" + iterator + ", length: " + data.length); */

	var charItem = data.charAt(iterator);
	if (charItem == "0" ||
	    charItem == "1" ||
	    charItem == "2" ||
	    charItem == "3" ||
	    charItem == "4" ||
	    charItem == "5" ||
	    charItem == "6" ||
	    charItem == "7" ||
	    charItem == "8" ||
	    charItem == "9") {

	    /* Vortex.log2 ("VortexEngine.getNumber: found digit=" + charItem + " iterator=" + iterator + ", length: " + data.length); */

	    /* found valid digit value */
	    iterator++;
	    continue;
	} /* end if */

	/* Vortex.log2 ("VortexEngine.getNumber: stopping iteration at iterator=" + iterator + ", length: " + data.length); */

	break;
    }

    /* report a log */
    /* Vortex.log ("Getting value from " + this.position + ", to " + iterator); */

    /* update number of items read */
    this.itemsRead = iterator - this.position;
    if (this.itemsRead < 0)
	this.itemsRead = 0;

    /* return value found */
    var result = Number (data.substring (this.position, iterator));

    /* update position */
    this.position += this.itemsRead;

    return result;
};

/**
 * @internal Function that parses all MIME headers found
 * on the provided string, starting at the given position.
 *
 * @param mimeHeaders A caller created array were all MIME
 * headers found are placed.
 *
 * @param data A reference to the string containing all
 * the BEEP frame received.
 */
VortexEngine.parseMimeHeaders = function (mimeHeaders, data) {

    var iterator;
    var mimeHead;
    var mimeContent;

    /* record position to track mime headers size */
    this.position = 0;


    /* check for the basic case where no MIME headers are found */
    if (((this.position + 1) < data.length) &&
	data.charAt(this.position) == '\r' && data.charAt(this.position + 1) == '\n') {
	Vortex.log2 ("VortexEngine.parseMimeHeaders: empty MIME headers found");
	return data.substring (this.position + 2, data.length);
    }

    while (((this.position + 1) < data.length) &&
	data.charAt(this.position) != '\r' && data.charAt(this.position + 1) != '\n') {

	/* get index for : */
	iterator  = 0;
	while (((this.position + iterator) < data.length) && data.charAt(this.position + iterator) != ':') {
	    /* next iterator */
	    iterator++;
	} /* end while */

	/* if no data was found, go next */
	Vortex.log2 ("VortexEngine.parseMimeHeaders: this.position: " + this.position + ", iterator=" + iterator + ", data.length=" + data.length);
	if ((this.position + iterator) ==  data.length)
	    return data;

	/* get mime head */
	mimeHead = data.substring (this.position, this.position + iterator);
	Vortex.log2 ("VortexEngine.parseMimeHeaders: header found: '" + mimeHead + "'");

	/* update position */
	iterator++;
	this.position += iterator;

	/* skip whitespaces */
	iterator = 0;
	while ((this.position + iterator) < data.length) {
	    /* if found something that is not a w3c whitespace, then stop */
	    if (data.charAt(this.position + iterator) != " ")
		break;
	    /* otherwise, look at the next position */
	    iterator++;
	} /* end while */
	this.position += iterator;

	Vortex.log2 ("VortexEngine.parseMimeHeaders: mime header content starts at: " + this.position);

	/* now find mime header content end */
	iterator = 0;
	while (((this.position + iterator + 2) < data.length)) {
	    /* found single \r\n mime header stop, but also check that the next
	     * character is not an space ' ' or a tabular \t */
	    if (data.charAt(this.position + iterator) == '\r' &&
		data.charAt(this.position + iterator + 1) == '\n' &&
		data.charAt(this.position + iterator + 2) != ' ' &&
		data.charAt(this.position + iterator + 2) != '\t') {
		break;
	    } /* end if */

	    /* if go to the next byte */
	    iterator++;
	} /* end while */

	/* get mime content */
	Vortex.log2 ("VortexEngine.parseMimeHeaders: getting header content " + mimeHead + ": " + this.position + ", up to: " + (this.position + iterator));
	mimeContent = data.substring (this.position, this.position + iterator);

	Vortex.log2 ("VortexEngine.parseMimeHeaders: header content found: '" + mimeContent + "'");

	/* store mime header into the array */
	var mimeHeader = new VortexMimeHeader (mimeHead, mimeContent);
	mimeHeaders.push (mimeHeader);

	/* skip header found */
	this.position += (iterator + 2);

	Vortex.log2 ("VortexEngine.parseMimeHeaders: read mime header: " + mimeHeaders.length);

    } /* end while */

    this.position += 2;

    Vortex.log2 ("VortexEngine.parseMimeHeaders: MIME parse finished at: " + this.position);

    /* return rest of the content that is not mime */
    return data.substring (this.position, data.length);
};

VortexEngine.saveContent = function (connection, data) {

    /* check if content was not previously stored */
    if (connection.storedContent == undefined)
	connection.storedContent = "";

    /* save content appending it to previous content */
    connection.storedContent = connection.storedContent + data;

    return;
};

/**
 * @internal Function used to load a frame from the received data.
 *
 * @param connection The connection where the content was received.
 * @param data Raw network content received (octects).
 */
VortexEngine.getFrame = function (connection, data) {

    var frameList = [];
    var frame;

    /* check if the frame is complete */
    if (connection.storedContent != null && connection.storedContent.length > 0) {
	/* update data reference */
	data = connection.storedContent + data;
	/* reset stored content */
	connection.storedContent = "";
    } /* end if */

    /* configure initial position for this parse operation */
    this.position = 0;

    while (this.position < data.length) {

	Vortex.log ("VortexEngine.getFrame: Reading next frame from connection, position: " + this.position + ", data length: " + data.length + (data.length < 100 ? ", content: " + data : ""));

	/* get frame type */
	var initial = this.position;
	if ((data.length - initial) < 13) {
 	    /* not received enough data, save and retry later */
	    VortexEngine.saveContent (connection, data.slice (initial, data.length));
	    return frameList;
	} /* end if */

	var strType = data.substring (this.position, this.position + 3);
	Vortex.log ("VortexEngine.getFrame: Received frame type: " + strType + ", length: " + strType.length);
	this.position += 4;

	/* check here allowed frame headers */
	if (strType != 'RPY' &&
	    strType != 'MSG' &&
	    strType != 'ANS' &&
	    strType != 'NUL' &&
	    strType != 'ERR' &&
	    strType != 'SEQ') {
	    /* flag connection closed */
	    connection.shutdown ("Found not allowed BEEP header: " + strType + ", closing connection");
	    return null;
	} /* end if */

	/* get the frame channel number */
	var channel  = this.getNumber (data);
	Vortex.log ("VortexEngine.getFrame: channel: " + channel + ", next position: " + this.position);

	var more = false;
	if (strType != 'SEQ') {
	    /* get the frame msgno */
	    var msgno = this.getNumber (data);
	    Vortex.log2 ("msgno: " + msgno + ", next position: " + this.position);

	    /* get more character */
	    more  =	data.charAt(this.position + 1) == '*';
	    this.position += 2;
	    Vortex.log2 ("more: " + more + ", next position: " + this.position);
	} /* end if */

	/* get seqno|ackno value */
	var seqno = this.getNumber (data);
	Vortex.log2 ("seqno: " + seqno + ", next position: " + this.position);

	/* get size|window value */
	var size = this.getNumber (data);
	Vortex.log2 ("size: " + size + ", next position: " + this.position);

	if (strType != 'SEQ') {
	    /* check if we have to read ansno value */
	    var ansno;
	    if (strType == "ANS") {
		ansno = this.getNumber (data);
	    }
	} /* end if */

	/* now check BEEP header end */
	if (data.charAt(this.position) != '\r' || data.charAt(this.position + 1) != '\n') {

	    /* check if this header is taking too long */
	    /* if (data.length > 200) {
		connection._onError ("VortexEngine: ERROR (1): while reading BEEP header: " + strType);
		connection._onError ("VortexEngine: ERROR (2): position: " + this.position + ", initial: " + initial + ", length: " + data.length);
		connection._onError ("VortexEngine: ERROR (3): more: " + more + ", seqno: " + seqno + ", size: " + size);
		connection._onError ("VortexEngine: ERROR (4): first bytes: '" + data.slice (0, 100) + "'");
		connection._onError ("VortexEngine: ERROR (5): first from <initial> bytes: '" + data.slice (initial, 100) + "'");
		connection._onError ("VortexEngine: ERROR (6): last bytes: '" + data.slice (-100, -1) + "'");
		connection.shutdown (
		    "VortexEngine: ERROR: expected to find \\r\\n BEEP header trailer, but not found: " +
			Number (data.charAt(this.position)) + ", " + Number (data.charAt(this.position + 1)));
		return null;
	    } */

	    /* no trailing header found, save content from initial to the end and try later */
	    VortexEngine.saveContent (connection, data.slice (initial, data.length));
	    return frameList;
	}

	/* start reading frame content */
	this.position += 2;

	/* check if we have a SEQ to stop processing */
	if (strType == 'SEQ') {
	    Vortex.log ("VortexEngine.getFrame: found SEQ frame: SEQ " + channel + " " + seqno + " " + size);
    	    /* return frame read: seqno=ackno and size=window */
	    frame = new VortexFrame (strType, channel,
				     -1 /* msgno */, false /* more */,
				     seqno /* ackno */, size /* window */);
	    frameList.push (frame);
	    continue;
	} /* end if */

	/* NOTE: BEEP operates at byte level and so its header size is
	 expresed in bytes. However String inside javascript are
	 encoded in utf-16 which causes that strings that contains
	 code points above ascii to look sorter that the value
	 expresed by size. So, we try to find the END\r\n trail to get
	 the content and then check if byte length for that content
	 matches expected size */
	var beepTrailerIndex = data.indexOf ("END\r\n", this.position);
	if (beepTrailerIndex == -1) {
	    /* no beep trailer in content, so we have no complete frame */
	    VortexEngine.saveContent (connection, data.slice (initial, data.length));
	    return frameList;
	}

	/* get BEEP frame content */
	var content = data.slice (this.position, beepTrailerIndex);
	/* read frame content */
	Vortex.log2 ("Content found (byte size: " + size + ", unicode size: " + content.length + ", position: " + this.position + ", length: " + data.length + "): '" + content + "'");

	/* now check that byte level size of this content matches with
	 expected size */
	if (connection._transport == null || size > VortexEngine.byteLength (content)) {
	    var errMessage;
	    if (connection._transport != null) {
		errMessage = "VortexEngine: ERROR: expected to find byte length content " + size + ", but found: " + VortexEngine.byteLength (content) + ". Unicode length is: " + content.length + ". Protocol violation. Closing connection. this.position=" + this.position + ", beepTrailerIndex=" + beepTrailerIndex + ", content is: " + content;
	    } else {
		errMessage = "VortexEngine: ERROR: found null connection._transport during receive operation: byte length content " + size + ". Unicode length is: " + content.length + ". Protocol violation. Closing connection. this.position=" + this.position + ", beepTrailerIndex=" + beepTrailerIndex + ", content is: " + content;
	    }
	    Vortex.error (errMessage);
	    connection.shutdown (errMessage);
	    return null;
	}

	/* update to the next position (next frame) */
	this.position += (content.length + 5);

	/* call to create frame object */
	frame = new VortexFrame (strType, channel, msgno, more, seqno, size, ansno, null, content);

	Vortex.log ("PUSHING: new complete frame read: " + frame.type + ", channel: " + channel + ", msgno: " + msgno + ", more: " + more + ", seqno: " + seqno + ", size: " + size);
	frameList.push (frame);
    }

    /* check that all content was read */
    if (data.length != this.position) {
	/* comment left to be able to catch this error some day */
	Vortex.error ("VortexEngine.getFrame: pending data to be read after all operations: " + data.length + " != " + this.position);
    }

    /* return frame object */
    return frameList;
};

/**
 * @internal Handler used to process all messages
 * received over channel 0 for a particular connection.
 *
 * The function executes under the context of the channel
 * receiving the message. [this] reerence points to the channel.
 *
 * @param frame The frame received.
 */
VortexEngine.channel0Received = function (frameReceived) {

    Vortex.log ("VortexEngine.channel0Received: received frame..");

    /* acquire local frame var */
    var frame = frameReceived.frame;

    /* check if the connection is still waiting for greetings */
    if (this.conn.greetingsPending) {
	/* call to process incoming content to prepare the connection */
	Vortex.log ("VortexEngine.channel0Received: connection is not ready, process greetings and prepare connection, pass frame: ");
	VortexEngine.channel0PrepareConnection.apply (this, [frame]);

	/* flag that we have received and processed greetings */
	this.conn.greetingsPending = false;

	/* report connection creation status (only if greetings were sent) */
	if (this.conn.greetingsSent) {
	    this.conn._reportConnCreated ();
	}
	return;
    } /* end if */

    /* normal processing for BEEP channel 0 */
    var node = VortexXMLEngine.parseFromString (frame.content);

    /* check result returned before continue */
    if (node == null) {
	Vortex.error ("VortexEngine.channel0Received: failed to parse document received over channel 0, closing session");
	this.conn.shutdown ("VortexEngine.channel0Received: failed to parse document received over channel 0, closing session");
	return;
    } /* end if */

    if (node.name == "start") {
	/* received a start request */
    } else if (node.name == "close") {
	/* received a close request */
    } else if (node.name == "profile") {
	/* received a profile reply, check it */
	if (frame.type != "RPY") {
	    /* close the connection */
	    this.conn.shutdown ("Expected to reply a RPY frame type for a <profile> message but found: " + frame.type);
	    return;
	} /* end if */

	/* get the next	handler (the most older pending request) */
	var params = this.conn.startHandlers.shift ();
	if (! VortexEngine.checkReference (params)){
	    Vortex.error ("Expected to find a handler required to finish channel start and notify, but nothing was found");
	    return;
	} /* end if */

	/* flag as ready the channel */
	Vortex.log ("Channel start reply received for channel: " + params.channelNumber + ", running profile: " + params.profile);
	params.channel.isOpened = true;

	/* remove on disconnect */
	this.conn.uninstallOnDisconnect (params.onDisconnectId);

	/* add it to the connection */
	this.conn.channels[params.channelNumber] = params.channel;

	/* configure frame received handlers */
	params.channel.onFrameReceivedHandler = params.onFrameReceivedHandler;
	params.channel.onFrameReceivedContext = params.onFrameReceivedContext;

	/* check if this channel creation was done including a serverName request */
	if (params.serverName != null && this.conn.serverName == undefined)
	    this.conn.serverName = params.serverName;

	/* create replyData to notify failure */
	var replyData = {
	    conn : this.conn,
	    channel : params.channel,
	    replyCode : "200",
	    replyMsg : "Channel started ok"
	};

	/* notify the channel crated */
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData], true);

	/* check if the node has content to deliver it as a frame piggy back */
	if (node.content != undefined) {
	    Vortex.log ("Channel start reply piggy back found: " + node.content);
	    var _frameReceived = {
		/* build piggy back frame */
		frame : new VortexFrame (0, 0, 0, 0, 0, 0, 0, 0, node.content),
		channel : params.channel,
		conn : this.conn
	    };

	    /* notify frame */
	    VortexEngine.apply (params.onFrameReceivedHandler, params.onFrameReceivedContext, [_frameReceived], true);
	} /* end if */

	return;
    } else if (node.name == "ok") {
	/* received afirmative reply, this means we have to handle pending close request */
	if (frame.type != "RPY") {
	    /* close the connection */
	    this.conn.shutdown ("Channel close reply received but frame type expected is RPY, closing connection.");
	    return;
	}

	/* check for pending close request */
	var params = this.conn.closeHandlers.shift ();
	if (! VortexEngine.checkReference (params)){
	    Vortex.error ("Expected to find a handler required to finish channel close and notify, but nothing was found");
	    return;
	} /* end if */

	/* remove on disconnect */
	this.conn.uninstallOnDisconnect (params.onDisconnectId);

	/* get a reference to the channel being closed */
	var channel = this.conn.channels[params.channelNumber];

	/* remove reference from the connection to the channel */
	delete channel.conn.channels[channel.number];
	/* remove reference from channel to connection */
	delete channel.conn;

	/* discarding channel close notification */
	if (! VortexEngine.checkReference (params.onChannelCloseHandler))
	    return;

	/* create reply data to be passed to the handler */
	var replyData = {
	    /* connection where the channel was operating */
	    conn: this.conn,
	    /* channel closed */
	    status: true,
	    replyMsg: "Channel properly closed"
	};

	/* now notify */
	VortexEngine.apply (
	    params.onChannelCloseHandler,
	    params.onChannelCloseContext,
	    [replyData], true);

	return;
    } else if (node.name == "error") {
	if (frame.type != "ERR") {
	    /* close the connection */
	    this.conn.shutdown ("Expected to reply a RPY frame type for a <profile> message but found: " + frame.type);
	    return;
	} /* end if */

	/* get the next	handler (the most older pending request) */
	var params = this.conn.startHandlers.shift ();
	if (! VortexEngine.checkReference (params)){
	    Vortex.error ("Expected to find a handler required to finish channel start and notify, but nothing was found");
	    return;
	} /* end if */

	/* remove on disconnect */
	this.conn.uninstallOnDisconnect (params.onDisconnectId);

	/* create replyData to notify failure */
	var replyData = {
	    /* connection where the channel was tried to be opened */
	    conn : this.conn,
	    /* null reference to signal that the channel was not opened */
	    channel : null,
	    /* reply error code received by remote BEEP peer */
	    replyCode :	VortexEngine._getErrorCode (node),
	    /* human readable error message, textual diagnostic */
	    replyMsg : node.content
	};

	/* notify the channel crated */
	VortexEngine.apply (params.onChannelCreatedHandler, params.onChannelCreatedContext, [replyData]);
	return;
    }

    return;
};

/**
 * @internal Function used to find and return error code returned by
 * <error> element used by BEEP channel management.
 *
 * @param node The xml document containing an BEEP <error> node.
 */
VortexEngine._getErrorCode = function (node) {

    /* iterate over all attrirbutes finding code */
    for (var iterator in node.attrs) {
	if (node.attrs[iterator].name == 'code')
	    return node.attrs[iterator].value;
    } /* end for */

    Vortex.error ("VortexEngine._getErrorCode: Unable to error code in XML document");
    return "554";
};

/**
 * @internal Function used to process incoming
 * greetings, prepare connection and send initial greetings.
 *
 * @param frame The function receives a frame reference.
 *
 * @return true if the prepare process was ok, otherwise
 * false is returned.
 */
VortexEngine.channel0PrepareConnection = function (frame)
{

    /* check frame type */
    if (frame.type != "RPY") {
	Vortex.error ("VortexEngine.channel0PrepareConnection: received a non-positive greetings, closing BEEP session");
	this.conn.shutdown ();
	return false;
    }

    /* now do XML processing */
    var node = VortexXMLEngine.parseFromString (frame.content);

    /* check result (node reference) */
    if (node == null) {
	Vortex.error ("VortexEngine.channel0PrepareConnection: failed to parse initial <greeting>");
	this.conn.shutdown ();
	return false;
    }

    /* OPTIONAL: print document */
    /* VortexXMLEngine.dumpXML (node, 0); */

    /* check content received */
    if (node.name != "greeting") {
	Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find <greeting> node on BEEP greetings, but found: " + node.name);
	this.conn.shutdown ();
	return false;
    }

    /* start array of profiles supported */
    this.conn.profiles = [];

    /* check for profiles available */
    if (node.haveChilds) {

	/* for each xml <node> found inside <greeting> do: */
	for (var tag in node.childs) {

	    /* check <profile> node found inside <greeting> */
	    if (node.childs[tag].name != 'profile') {
		Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find <profile> node on BEEP greetings");
		this.conn.shutdown ();
		return false;
	    } /* end if */

	    /* now register the profile received in uri label */
	    for (var attr in node.childs[tag].attrs) {

		/* check uri attribute */
		if (node.childs[tag].attrs[attr].name != 'uri') {
		    Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find 'uri' attribute on <profile> node on BEEP greetings");
		    this.conn.shutdown ();
		    return false;
		}

		/* register profile */
		Vortex.log2 ("VortexEngine.channel0PrepareConnection: registering profile: " + node.childs[tag].attrs[attr].value);
		this.conn.profiles.push (node.childs[tag].attrs[attr].value);
	    } /* end for */
	} /* end for */
    } /* end if */

    /* flag connection as ready */
    this.conn.greetingsPending = false;

    return true;
};

/**
 * @internal Function used to process a SEQ frame received and to
 * proceed with pending send operations in the case SEQ frame received
 * opens the window.
 *
 * @param frame The SEQ frame having in seqno and size values
 * associated to ackno and window.
 *
 * NOTE: "this" keyword must point to channel.
 */
VortexEngine.receivedSEQFrame = function (frame) {
    Vortex.log2 ("VortexEngine.receivedSEQFrame: processing SEQ frame for channel: " + this.number);

    /* check that the amount of content now allowed by the SEQ frame
    is greater than current maxAllowedPeerSeqno */
    if (this.maxAllowedPeerSeqno > (frame.seqno + frame.size)) {
	this.conn.shutdown ("VortexEngine.receivedSEQFrame: Received a SEQ frame notification providing a window update which is smaller " +
			    "than current status. Window shrinking or notifying this values is not allowed");
	return;
    } else if (this.maxAllowedPeerSeqno == (frame.seqno + frame.size)) {
	Vortex.warn ("VortexEngine.receivedSEQFrame: received SEQ frame with empty update information (same values)");
	return;
    }

    /* reached this point, we have a SEQ frame update opening the
     * remote channel */
    this.maxAllowedPeerSeqno = (frame.seqno + frame.size);
    Vortex.log ("VortexEngine.receivedSEQFrame: updated maxAllowedPeerSeqno: " + this.maxAllowedPeerSeqno);

    /* now check for pending operations and send them
     *
     * WARNING: the following code may mean involve an active data
     * exchange starving other channels. Check how this interacts with
     * javascript execution model
     */
    var iterator = 0;
    while ((this.sendQueue.length > 0) && (iterator < 1)) {

	Vortex.log ("About to send a send operation because the queue is: " + this.sendQueue.length + ", and iterator is: " + iterator + ", channel: " + this.number);

	/* send operation, if it fails, just stop */
	if (! this.sendCommon (null, null))
	    break;

	Vortex.log ("VortexEngine.receivedSEQFrame: sent pending content: " + iterator + ", result=" + this.lastStatusCode);
	/* return; inexplicable return here*/

	/* check if the last operation was a partial send
	 * or if it is stalled or no pending content is found */
	if (this.lastStatusCode == 2 || this.lastStatusCode == -1 || this.lastStatusCode == -2)
	    break;
    }
    Vortex.log ("VortexEngine.receivedSEQFrame: finished");

    return;
};

/**
 * @internal Method that allows to check if we have to send a
 * SEQ frame update based on the content we have received.
 *
 * In the future this function will be used to implement SEQ
 * frame user space handling.
 */
VortexEngine.checkSendSEQFrame = function (channel, frame) {

    var halfSpace = (channel.maxAllowedSeqno - frame.seqno) / 2;
    if (frame.size > halfSpace) {
	/* send SEQ frame update (updating window to
	 * have current channel.windowSize */
	var acceptedSeqno  = (frame.seqno + frame.size);

	Vortex.log ("VortexEngine.checkSendSEQFrame: channel.windowSize=" + channel.windowSize + ", channel.maxAllowedSeqno=" + channel.maxAllowedSeqno + ", frame.seqno=" + frame.seqno + ", frame.size=" + frame.size);

	Vortex.log ("VortexEngine.checkSendSEQFrame: sending SEQ " + channel.number + " " + acceptedSeqno + " " + channel.windowSize + "\r\n");
	channel.conn._send ("SEQ " + channel.number + " " + acceptedSeqno + " " + channel.windowSize + "\r\n");

	/* update maxAllowedSeqno */
	channel.maxAllowedSeqno = (acceptedSeqno + channel.windowSize - 1) % VortexEngine.MaxSeqNo;
	Vortex.log ("VortexEngine.checkSendSEQFrame: updated maxAllowedSeqno value to: " + channel.maxAllowedSeqno + ", for channel: " + channel.number);
    } /* end if */

    /* not updating maxAllowedSeqno */
    return;
};

/**
 * @brief Value used to represent maximum allosed seqno value.
 */
VortexEngine.MaxSeqNo =	4294967295;

/**
 * @brief Allows to get the byte length of the provided content.
 *
 * @return Returns the byte length of the provided content.
 *
 */
VortexEngine.byteLength = function (content) {
    return unescape(encodeURIComponent(content)).length;
};