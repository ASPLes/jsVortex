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
    console.log ("Getting value from " + this.position + ", to " + iterator);

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
	console.log ("VortexEngine.parseMimeHeaders: header found: '" + mimeHead + "'");

	/* update position */
	this.position += iterator + 1;

	/* skip whitespaces */
	iterator = VortexEngine.consumeWhiteSpaces (data, 0);
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

	console.log ("VortexEngine.parseMimeHeaders: header content found: '" + mimeContent + "'");

	/* store mime header into the array */
	mimeHeader = new VortexMimeHeader (mimeHead, mimeContent);
	mimeHeaders.push (mimeHeader);

	/* skip header found */
	this.position += iterator + 2;

    } /* end while */

    this.position += 2;
    this.mimeHeadersSize = this.position - this.mimeHeadersSize;

    console.log ("VortexEngine.parseMimeHeaders: MIME parse finished at: " + this.position + ", MIME headers size: " + this.mimeHeadersSize);

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
    console.log ("Received frame type: " + strType + ", length: " + strType.length);

    /* configure initial position for this parse operation */
    this.position = 4;

    /* get the frame channel number */
    var channel  = this.getNumber (data);
    console.log ("channel: " + channel);

    /* get the frame msgno */
    var msgno = this.getNumber (data);
    console.log ("msgno: " + msgno);

    /* get more character */
    var more  =	data[this.position + 1] == '*';
    this.position += 2;
    console.log ("more: " + more);

    /* get seqno value */
    var seqno = this.getNumber (data);
    console.log ("seqno: " + seqno);

    /* get size value */
    var size = this.getNumber (data);
    console.log ("size: " + size);

    /* check if we have to read ansno value */
    var ansno;
    if (strType == "ANS") {
	ansno = this.getNumber (data);
    }

    /* now check BEEP header end */
    if (data[this.position] != '\r' || data[this.position + 1] != '\n') {
	console.log ("VortexEngine: ERROR: position: " + this.position);
	console.log ("VortexEngine: ERROR: expected to find \\r\\n BEEP header trailer, but not found: " + Number (data[this.position]) + ", " + Number (data[this.position + 1]));
	return null;
    }

    /* update position to MIME headers */
    console.log ("VortexEngine.getFrame: parsing MIME at: " + this.position);
    this.position += 2;

    /* parse here all MIME headers */
    var mimeHeaders = new Array ();
    this.parseMimeHeaders (mimeHeaders, data);

    var content = data.substring (this.position, this.position + size - this.mimeHeadersSize);
    console.log ("Content found (size: " + size + ", position: " + this.position + ", length: " + data.length + "): '" + content + "'");

    /* call to create frame object */
    var frame = new VortexFrame (strType, channel, msgno, more, seqno, size, ansno, mimeHeaders, content);

    console.log ("Frame type: " + frame.getFrameType ());

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

    console.log ("Frame received: " + frame.content);
    console.log ("Frame type: " + frame.type);

    /* now do XML processing */
    var document = VortexEngine.parseXML (frame.content);

    /* print document */
    VortexEngine.dumpXML (document, 0);

    /* follow here */
};

/**
 * @internal Do an xml parse operation.
 *
 * @param document The document	to parse.
 *
 * @return An object representing the document or null if it fails.
 */
VortexEngine.parseXML = function (data) {

    /* reset parser */
    this.position = 0;

    /* parse node root node */
    return VortexEngine.parseXMLNode (data, null);
};

VortexEngine.parseXMLNode = function (data, parentNode) {
    var iterator;

    /* init iterator */
    iterator = this.position;

    /* skip white spaces (first) */
    iterator = VortexEngine.consumeWhiteSpaces (data, iterator);

    /* find node name start tag */
    if (data[iterator] != '<') {
	console.log ("VortexEngine.parseXMLNode: expected to find XML start tag '<' NOT FOUND: '" + data[iterator] + "'");
	return null;
    }
    /* record position */
    this.position = iterator;

    /* now find tag end or an space */
    while (iterator < data.length) {
	if (data[iterator] == ' ' || data[iterator] == '>')
	    break;
	iterator++;
    } /* end while */

    /* check termination code */
    if (iterator == data.length) {
	console.log ("VortexEngine.parseXMLNode: expected to find XML end tag '>' NOT FOUND while reading input");
	return null;
    }

    var stringAux = data.substring (this.position + 1, iterator);
    console.log ("VortexEngine.parseXMLNode: node name found: '" + stringAux + "'");

    /* create the result node */
    var node = {
	name   : stringAux,
	attrs  : [],
	childs : []
    };

    /* now parse attributes */
    console.log ("VortexEngine.parseXMLNode: parsing attributes: iterator=" + iterator + ", data.length=" + data.length);
    while (iterator < data.length) {

	/* now consume spaces */
	while (iterator < data.length) {
	    if (data[iterator] == " ") {
		iterator++;
	    }
	    break;
	}

	/* check node termination without childs */
	if (data[iterator] == '/' && data[iterator + 1] == '>') {
	    /* node finished */
	    node.haveChilds = false;
	    iterator += 2;
	    break;
	}

	/* check node termination */
	if (data[iterator] == '>') {
	    /* node finished */
	    node.haveChilds = true;
	    iterator++;
	    break;
	}

	/* parse attributes */
	this.position = iterator;

	while (iterator < data.length) {
	    if (data[iterator] == '=')
		break;
	    iterator++;
	} /* end while */

	var attrName = data.substring (this.position, iterator);
	console.log ("VortexEngine.parseXMLNode: found xml node attribute: '" + attrName + "'");

	/* check proper attribute value def */
	iterator++;
	if (data[iterator] != "'" && data[iterator] != "\"") {
	    console.log ("VortexEngine.parseXMLNode: expected to find XML node attribute content definition start (either \" or ') but found NONE of them.");
	    return null;
	}
	iterator++;

	/* now look for attribute value finish */
	this.position = iterator;
	while (iterator < data.length && data[iterator] != "'" && data[iterator] != "\"")
	    iterator++;

	/* check termination condition */
	if (iterator == data.length) {
	    console.log ("VortexEngine.parseXMLNode: expected to find XML node attribute content termination but found end of stream.");
	    return null;
	}

	var attrValue = data.substring (this.position, iterator);
	console.log ("VortexEngine.parseXMLNode: found xml node attribute content: '" + attrValue + "'");

	/* store attributes inside the node */
	var attr = {
	    name  : attrName,
	    value : attrValue
	};

	/* store attribute into the node */
	node.attrs.push (attr);

	iterator++;
	this.position = iterator;
    }

    this.position = iterator;
    console.log ("Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

    /* consume more whitespaces */
    iterator      = VortexEngine.consumeWhiteSpaces (data, iterator);
    this.position = iterator;

    console.log ("Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

    if (node.haveChilds) {
	console.log ("VortexEngine.parseXMLNode: found pending childs");

	do {
	    /* read childs */
	    var child = VortexEngine.parseXMLNode (data, node);

	    /* stop processing if found an error */
	    if (child == null)
		return null;

	    /* store child read */
	    node.childs.push (child);

	    /* consume more whitespaces */
	    iterator = this.position;
	    console.log ("(2) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);
	    iterator      = VortexEngine.consumeWhiteSpaces (data, iterator);
	    this.position = iterator;
	    console.log ("(3) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

	    if (data[iterator] == '<' && data[iterator + 1] == '/')
		break;

	    console.log ("Found data: " + data[iterator] + data[iterator + 1]);
	} while (false);

	/* read node termination */
	iterator = VortexEngine.consumeWhiteSpaces (data, iterator);
	if (data[iterator] != '<' || data[iterator + 1] != '/') {
	    console.log ("VortexEngine.parseXMLNode: expected to find XML node termination </, but found: " + data[iterator] + data[iterator + 1]);
	    return null;
	} /* end if */

	/* find node termination */
	iterator += 2;
	while (data[iterator] != '>' && iterator <= data.length)
	    iterator++;

	/* check termination */
	if (data.length < iterator) {
	    console.log ("VortexEngine.parseXMLNode: expected to find XML node termination >, but found end of stream");
	    return null;
	}

	/* get termination node */
	stringAux = data.substring (this.position + 2, iterator);
	console.log ("VortexEngine.parseXMLNode: found node termination: " + stringAux);

	if (stringAux != node.name) {
	    console.log ("VortexEngine.parseXMLNode: expected to find node termination for: " + node.name + ", but found: " + stringAux);
	    return null;
	} /* end if */

	/* update parser position */
	this.position = iterator + 1;

    } /* end if (node.haveChilds) */

    /* return node created */
    return node;
};

/**
 * @internal Function used to implement w3c xml white
 * space consumption.
 *
 * @param data [string] The string where it is expected
 * to find whitespaces.
 *
 * @param iterator [int] The position to check.
 *
 * @return [int] The function returns an iterator update
 * with the first non-space character.
 */
VortexEngine.consumeWhiteSpaces = function (data, iterator)
{
    while (iterator < data.length) {
	/* if found something that is not a w3c whitespace, then stop */
	if (data[iterator] != " " && data[iterator] != '\r' && data[iterator] != '\n')
	    break;
	/* otherwise, look at the next position */
	iterator++;
    }
    return iterator;
};

/**
 * @internal Function used to dump xml content produced
 * by VortexEngine.parseXML.
 */
VortexEngine.dumpXML = function (document, tabs)
{

    var iterator = tabs;
    var string   = "";
    while (iterator > 0) {
	string = string + " ";
	iterator--;
    }

    if (document.haveChilds) {
	console.log (string + "<" + document.name + " " + VortexEngine.dumpAttrs (document) + ">");
	for (node in document.childs) {
	    VortexEngine.dumpXML (document.childs[node], tabs + 2);
	}
	console.log (string + "</" + document.name + ">");
    } else {
	console.log (string + "<" + document.name + " " + VortexEngine.dumpAttrs (document) + " />");
	return;
    }

};

/**
 * @internal Function used to dump xml node attributes
 * produced by VortexEngine.parseXML.
 */
VortexEngine.dumpAttrs = function (node) {

    var string;
    for (position in node.attrs) {
	if (string == undefined)
	    string = node.attrs[position].name + "='" + node.attrs[position].value + "'";
	else
	    string = string + " " + node.attrs[position].name + "='" + node.attrs[position].value + "'";
    }

    /* return string created */
    return string;
};