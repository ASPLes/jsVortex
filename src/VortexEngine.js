/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

if (typeof VortexEngine == "undefined") {
    /* define engine module */
    var VortexEngine = {
	/**
	 * Variable used by VortexEngine object to report
	 * number of items read after a VortexEngine.getNumber.
	 */
	itemsRead : 0,
	/**
	 * Variable used to track parser position.
	 */
	position : 0,
	/**
	 * Variable used to track mime headers size.
	 */
	mimeHeadersSize : 0
    };
}

/**
 * @brief Allows to check if the object reference
 * received is not null or undefined. The function also
 * checks the attribute to be present in the object.
 *
 * @param object The reference to check.
 *
 * @param attr Optional attribute to check. null to skip attribute check.
 * This can be used check if the object is really the reference expected by
 * selected a particular attribute that should be available.
 *
 * @param msg Optional error message to register in the case of error.
 *
 * @return true If the reference is ok, therwise false is returned.
 */
VortexEngine.checkReference = function (object, attr, msg) {

    /* check for null reference */
    if (object == null || typeof(object) == undefined) {
	if (msg) {
	    Vortex.error ("Undefined reference found at: " + arguments.callee.caller.name + ", " + msg);
	} else {
	    Vortex.error ("Undefined reference found at: " + arguments.callee.caller.name);
	}
	return false;
    }

    if (attr != null && typeof(attr) != undefined) {
	if (object[attr] == null || object[attr] == undefined) {
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
	if (data[iterator] == " ") {
	    iterator++;
	}
	break;
    }

    /* now catch numbers */
    while (iterator < data.length) {
	if (data[iterator] == "0" ||
	    data[iterator] == "1" ||
	    data[iterator] == "2" ||
	    data[iterator] == "3" ||
	    data[iterator] == "4" ||
	    data[iterator] == "5" ||
	    data[iterator] == "6" ||
	    data[iterator] == "7" ||
	    data[iterator] == "8" ||
	    data[iterator] == "9") {

	    /* found valid digit value */
	    iterator++;
	    continue;
	} /* end if */

	break;
    }

    /* report a log */
    Vortex.log ("Getting value from " + this.position + ", to " + iterator);

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
    this.mimeHeadersSize = this.position;

    while (data[this.position] != '\r' && data[this.position + 1] != '\n') {
	/* get index for : */
	iterator  = 0;
	while (data[this.position + iterator] != ':')
	    iterator++;

	/* get mime head */
	mimeHead = data.substring (this.position, this.position + iterator);
	Vortex.log ("VortexEngine.parseMimeHeaders: header found: '" + mimeHead + "'");

	/* update position */
	this.position += iterator + 1;

	/* skip whitespaces */
	while (iterator < data.length) {
	    /* if found something that is not a w3c whitespace, then stop */
	    if (data[iterator] != " ")
		break;
	    /* otherwise, look at the next position */
	    iterator++;
	} /* end while */
	this.position += iterator;

	/* now find mime header content end */
	iterator = 0;
	while ((data[this.position + iterator] != '\r' ||
		data[this.position + iterator + 1] != '\n') &&
		data[this.position + iterator + 2] != ' ' &&
		data[this.position + iterator + 2] != '\t') {
	    iterator++;
	} /* end while */

	/* get mime content */
	mimeContent = data.substring (this.position, this.position + iterator);

	Vortex.log ("VortexEngine.parseMimeHeaders: header content found: '" + mimeContent + "'");

	/* store mime header into the array */
	var mimeHeader = new VortexMimeHeader (mimeHead, mimeContent);
	mimeHeaders.push (mimeHeader);

	/* skip header found */
	this.position += iterator + 2;

    } /* end while */

    this.position += 2;
    this.mimeHeadersSize = this.position - this.mimeHeadersSize;

    Vortex.log ("VortexEngine.parseMimeHeaders: MIME parse finished at: " + this.position + ", MIME headers size: " + this.mimeHeadersSize);

    return;
};


/**
 * @internal Function used to load a frame from the received data.
 *
 * @param connection The connection where the content was received.
 * @param data Raw network content received (octects).
 */
VortexEngine.getFrame = function (connection, data) {

    /* check if the frame is complete */

    /* get frame type */
    var strType = data.substring (0,3);
    Vortex.log ("Received frame type: " + strType + ", length: " + strType.length);

    /* configure initial position for this parse operation */
    this.position = 4;

    /* get the frame channel number */
    var channel  = this.getNumber (data);
    Vortex.log ("channel: " + channel);

    /* get the frame msgno */
    var msgno = this.getNumber (data);
    Vortex.log ("msgno: " + msgno);

    /* get more character */
    var more  =	data[this.position + 1] == '*';
    this.position += 2;
    Vortex.log ("more: " + more);

    /* get seqno value */
    var seqno = this.getNumber (data);
    Vortex.log ("seqno: " + seqno);

    /* get size value */
    var size = this.getNumber (data);
    Vortex.log ("size: " + size);

    /* check if we have to read ansno value */
    var ansno;
    if (strType == "ANS") {
	ansno = this.getNumber (data);
    }

    /* now check BEEP header end */
    if (data[this.position] != '\r' || data[this.position + 1] != '\n') {
	Vortex.error ("VortexEngine: ERROR: position: " + this.position);
	Vortex.error ("VortexEngine: ERROR: expected to find \\r\\n BEEP header trailer, but not found: " + Number (data[this.position]) + ", " + Number (data[this.position + 1]));
	return null;
    }

    /* update position to MIME headers */
    Vortex.log ("VortexEngine.getFrame: parsing MIME at: " + this.position);
    this.position += 2;

    /* parse here all MIME headers */
    var mimeHeaders = new Array ();
    this.parseMimeHeaders (mimeHeaders, data);

    var content = data.substring (this.position, this.position + size - this.mimeHeadersSize);
    Vortex.log ("Content found (size: " + size + ", position: " + this.position + ", length: " + data.length + "): '" + content + "'");

    /* call to create frame object */
    var frame = new VortexFrame (strType, channel, msgno, more, seqno, size, ansno, mimeHeaders, content);

    Vortex.log ("Frame type: " + frame.getFrameType ());

    /* return frame object */
    return frame;
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
VortexEngine.channel0Received = function (frame) {

    /* check if the connection is still waiting for greetings */
    if (this.connection.greetingsPending) {

	/* call to process incoming content to prepare the connection */
	Vortex.log ("VortexEngine.channel0Received: connection is not ready, process greetings and prepare connection");
	VortexEngine.channel0PrepareConnection.apply (this, [frame]);

	/* report connection creation status (only if handler defined) */
	this.connection._reportConnCreated ();
	return;
    } /* end if */

    /* normal processing for BEEP channel 0 */
    return;
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
	this.connection.Shutdown ();
	return false;
    }

    /* now do XML processing */
    var node = VortexXMLEngine.parseFromString (frame.content);

    /* check result (node reference) */
    if (node == null) {
	Vortex.error ("VortexEngine.channel0PrepareConnection: failed to parse initial <greeting>");
	this.connection.Shutdown ();
	return false;
    }

    /* OPTIONAL: print document */
    /* VortexXMLEngine.dumpXML (node, 0); */

    /* check content received */
    if (node.name != "greeting") {
	Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find <greeting> node on BEEP greetings, but found: " + node.name);
	this.connection.Shutdown ();
	return false;
    }

    /* start array of profiles supported */
    this.connection.profiles = [];

    /* check for profiles available */
    if (node.haveChilds) {

	/* for each xml <node> found inside <greeting> do: */
	for (tag in node.childs) {

	    /* check <profile> node found inside <greeting> */
	    if (node.childs[tag].name != 'profile') {
		Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find <profile> node on BEEP greetings");
		this.connection.Shutdown ();
		return false;
	    } /* end if */

	    /* now register the profile received in uri label */
	    for (attr in node.childs[tag].attrs) {

		/* check uri attribute */
		if (node.childs[tag].attrs[attr].name != 'uri') {
		    Vortex.error ("VortexEngine.channel0PrepareConnection: expected to find 'uri' attribute on <profile> node on BEEP greetings");
		    this.connection.Shutdown ();
		    return false;
		}

		/* register profile */
		Vortex.log ("VortexEngine.channel0PrepareConnection: registering profile: " + node.childs[tag].attrs[attr].value);
		this.connection.profiles.push (node.childs[tag].attrs[attr].value);
	    } /* end for */
	} /* end for */
    } /* end if */

    /* flag connection as ready */
    this.connection.greetingsPending = false;

    return true;
};

