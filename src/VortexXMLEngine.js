if (typeof VortexXMLEngine == "undefined") {
    var VortexXMLEngine = {
	/**
	 * @internal Variable used to track XML
	 * parser stream position.
	 */
	position : 0
    };
};


/**
 * @brief Do an xml parse operation on the provided stream
 *
 * @param document The document	to parse.
 *
 * @return An object representing the document or null if it fails.
 */
VortexXMLEngine.parseFromString = function (data) {

    /* reset parser */
    this.position = 0;

    /* parse node root node */
    return VortexXMLEngine.parseXMLNode (data, null);
};

VortexXMLEngine.parseXMLNode = function (data, parentNode) {
    var iterator;

    /* init iterator */
    iterator = this.position;

    /* skip white spaces (first) */
    iterator = VortexXMLEngine.consumeWhiteSpaces (data, iterator);

    /* find node name start tag */
    if (data[iterator] != '<') {
	console.log ("VortexXMLEngine.parseXMLNode: expected to find XML start tag '<' NOT FOUND: '" + data[iterator] + "'");
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
	console.log ("VortexXMLEngine.parseXMLNode: expected to find XML end tag '>' NOT FOUND while reading input");
	return null;
    }

    var stringAux = data.substring (this.position + 1, iterator);
    console.log ("VortexXMLEngine.parseXMLNode: node name found: '" + stringAux + "'");

    /* create the result node */
    var node = {
	name   : stringAux,
	attrs  : [],
	childs : []
    };

    /* now parse attributes */
    console.log ("VortexXMLEngine.parseXMLNode: parsing attributes: iterator=" + iterator + ", data.length=" + data.length);
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
	console.log ("VortexXMLEngine.parseXMLNode: found xml node attribute: '" + attrName + "'");

	/* check proper attribute value def */
	iterator++;
	if (data[iterator] != "'" && data[iterator] != "\"") {
	    console.log ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content definition start (either \" or ') but found NONE of them.");
	    return null;
	}
	iterator++;

	/* now look for attribute value finish */
	this.position = iterator;
	while (iterator < data.length && data[iterator] != "'" && data[iterator] != "\"")
	    iterator++;

	/* check termination condition */
	if (iterator == data.length) {
	    console.log ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content termination but found end of stream.");
	    return null;
	}

	var attrValue = data.substring (this.position, iterator);
	console.log ("VortexXMLEngine.parseXMLNode: found xml node attribute content: '" + attrValue + "'");

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
    iterator      = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
    this.position = iterator;

    console.log ("Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

    if (node.haveChilds) {
	console.log ("VortexXMLEngine.parseXMLNode: found pending childs");

	do {
	    /* read childs */
	    var child = VortexXMLEngine.parseXMLNode (data, node);

	    /* stop processing if found an error */
	    if (child == null)
		return null;

	    /* store child read */
	    node.childs.push (child);

	    /* consume more whitespaces */
	    iterator = this.position;
	    console.log ("(2) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);
	    iterator      = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
	    this.position = iterator;
	    console.log ("(3) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

	    if (data[iterator] == '<' && data[iterator + 1] == '/')
		break;

	    console.log ("Found data: " + data[iterator] + data[iterator + 1]);
	} while (false);

	/* read node termination */
	iterator = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
	if (data[iterator] != '<' || data[iterator + 1] != '/') {
	    console.log ("VortexXMLEngine.parseXMLNode: expected to find XML node termination </, but found: " + data[iterator] + data[iterator + 1]);
	    return null;
	} /* end if */

	/* find node termination */
	iterator += 2;
	while (data[iterator] != '>' && iterator <= data.length)
	    iterator++;

	/* check termination */
	if (data.length < iterator) {
	    console.log ("VortexXMLEngine.parseXMLNode: expected to find XML node termination >, but found end of stream");
	    return null;
	}

	/* get termination node */
	stringAux = data.substring (this.position + 2, iterator);
	console.log ("VortexXMLEngine.parseXMLNode: found node termination: " + stringAux);

	if (stringAux != node.name) {
	    console.log ("VortexXMLEngine.parseXMLNode: expected to find node termination for: " + node.name + ", but found: " + stringAux);
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
VortexXMLEngine.consumeWhiteSpaces = function (data, iterator)
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
 * by VortexXMLEngine.parseXML.
 */
VortexXMLEngine.dumpXML = function (document, tabs)
{

    var iterator = tabs;
    var string   = "";
    while (iterator > 0) {
	string = string + " ";
	iterator--;
    }

    if (document.haveChilds) {
	console.log (string + "<" + document.name + " " + VortexXMLEngine.dumpAttrs (document) + ">");
	for (node in document.childs) {
	    VortexXMLEngine.dumpXML (document.childs[node], tabs + 2);
	}
	console.log (string + "</" + document.name + ">");
    } else {
	console.log (string + "<" + document.name + " " + VortexXMLEngine.dumpAttrs (document) + " />");
	return;
    }

};

/**
 * @internal Function used to dump xml node attributes
 * produced by VortexXMLEngine.parseXML.
 */
VortexXMLEngine.dumpAttrs = function (node) {

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