/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

if (typeof VortexXMLEngine == "undefined") {
    /**
     * @brief Simple XML parser used by jsVortex to implement BEEP
     * channel 0 functions.
     *
     * Take a look into \ref VortexXMLEngine.parseFromString to
     * know how to parse XML content, producing a javascript oject.
     */
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
 * This function parses an XML document inside the provided data
 * parameter a returns a object with the following recursive
 * attributes:
 *
 * - <b>name</b>: Name to the xml node, that is, having the following
 * example: <jsvortex it-rocks='yes' />, the xml node name will be
 * 'jsvortex'.
 *
 * - <b>attrs</b>: List of attributes associated to the XML node. Each
 * attribute item of the list have have <b>name</b> and <b>value</b>.
 *
 * - <b>childs</b>: List of child nodes that this node has, each one
 * recursively representing this structure (name, attrs and childs).
 *
 * @param data {String} The XML document to parse. This parameter
 * represents an string that contains an XML document.
 *
 * @return {Object} An object representing the document or null if it
 * fails.
 *
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

    /* check for <!CDATA[ sections */
    if ((iterator + 9) < data.length &&
	data[iterator] == '<' &&
	data[iterator + 1] == '!' &&
	data[iterator + 2] == '[' &&
	data[iterator + 3] == 'C' &&
	data[iterator + 4] == 'D' &&
	data[iterator + 5] == 'A' &&
	data[iterator + 6] == 'T' &&
	data[iterator + 7] == 'A' &&
	data[iterator + 8] == '[') {

	Vortex.log ("VortexXMLEngine.parseXMLNode: Found <![CDATA[ ]> declaration, reading content");

	/* found CDATA declaration */
	iterator += 9;
	this.position = iterator;

	while ((iterator + 2) < data.length) {
	    if (data[iterator] == ']' && data[iterator + 1] == ']' && data[iterator + 2] == '>')
		break;
	    iterator++;
	} /* end while */

	if (iterator + 2 >= data.lenght) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find CDATA termination ]]>");
	    return null;
	} /* end if */

	parentNode.content = data.substring (this.position, iterator);
	this.position      = (iterator + 3);
	Vortex.log ("VortexXMLEngine.parseXMLNode: Found xml CDATA content for node '" + parentNode.name + "': " + parentNode.content);
	return null;
    }

    /* find node name start tag */
    if (data[iterator] != '<') {

	/* check we have parent */
	if (parentNode == null) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: found PCDATA but no parent to assign it. Input looks like invalid XML");
	    return null;
	} /* end if */

	/* find node termination */
	while (iterator < data.length) {
	    if (data[iterator] == '<')
		break;
	    iterator++;
	} /* end while */

	/* configure content found */
	parentNode.content = data.substring (this.position, iterator);
	this.position      = iterator;
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: Found xml PC content for node '" + parentNode.name + "': " + parentNode.content);
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
	Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML end tag '>' NOT FOUND while reading input");
	return null;
    }

    var stringAux = data.substring (this.position + 1, iterator);
    Vortex.log2 ("VortexXMLEngine.parseXMLNode: node name found: '" + stringAux + "'");

    /* create the result node */
    var node = {
	name   : stringAux,
	attrs  : [],
	childs : []
    };

    /* now parse attributes */
    Vortex.log2 ("VortexXMLEngine.parseXMLNode: parsing attributes: iterator=" + iterator + ", data.length=" + data.length);
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
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found xml node attribute: '" + attrName + "'");

	/* check proper attribute value def */
	iterator++;
	if (data[iterator] != "'" && data[iterator] != "\"") {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content definition start (either \" or ') but found NONE of them.");
	    return null;
	}
	iterator++;

	/* now look for attribute value finish */
	this.position = iterator;
	while (iterator < data.length && data[iterator] != "'" && data[iterator] != "\"")
	    iterator++;

	/* check termination condition */
	if (iterator == data.length) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content termination but found end of stream.");
	    return null;
	}

	var attrValue = data.substring (this.position, iterator);
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found xml node attribute content: '" + attrValue + "'");

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
    /* Vortex.log2 ("(0) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position); */

    /* consume more whitespaces */
    iterator      = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
    this.position = iterator;

    /* Vortex.log2 ("(1) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]); */

    /* process childs inside */
    if (node.haveChilds) {
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found pending childs for node <" + node.name + ">");

	do {
	    /* read childs */
	    var child = VortexXMLEngine.parseXMLNode (data, node);

	    /* stop processing if found an error */
	    if (child == null)
		break;

	    /* store child read */
	    node.childs.push (child);

	    /* consume more whitespaces */
	    iterator = this.position;
	    Vortex.log2 ("(2) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);
	    iterator      = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
	    this.position = iterator;
	    Vortex.log2 ("(3) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data[iterator] + data[iterator + 1]);

	    if (data[iterator] == '<' && data[iterator + 1] == '/')
		break;

	} while (true);

	/* read node termination */
	iterator = VortexXMLEngine.consumeWhiteSpaces (data, this.position);
	if (data[iterator] != '<' || data[iterator + 1] != '/') {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node termination </, but found: " + data[iterator] + data[iterator + 1]);
	    return null;
	} /* end if */

	/* find node termination */
	iterator += 2;
	while (data[iterator] != '>' && iterator <= data.length)
	    iterator++;

	/* check termination */
	if (data.length < iterator) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node termination >, but found end of stream");
	    return null;
	}

	/* get termination node */
	stringAux = data.substring (this.position + 2, iterator);
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found node termination: " + stringAux);

	if (stringAux != node.name) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find node termination for: " + node.name + ", but found: " + stringAux);
	    return null;
	} /* end if */

	/* update parser position */
	this.position = iterator + 1;
    } /* end if (node.haveChilds) */

    Vortex.log2 ("VortexXMLEngine.parseXMLNode: finished node parsing for: " + node.name);

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
	Vortex.log (string + "<" + document.name + " " + VortexXMLEngine.dumpAttrs (document) + ">");
	for (node in document.childs) {
	    VortexXMLEngine.dumpXML (document.childs[node], tabs + 2);
	}
	Vortex.log (string + "</" + document.name + ">");
    } else {
	Vortex.log (string + "<" + document.name + " " + VortexXMLEngine.dumpAttrs (document) + " />");
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