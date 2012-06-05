/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

if (typeof VortexXMLEngine == "undefined") {
    /**
     * @brief XML parser used by jsVortex to implement BEEP
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
 * @return {xmlNode} An object representing the document or null if it
 * fails.
 *
 * Use this function to produce an javascript object representation
 * from a string representing an XML document:
 *
 * \code
 *
 * // declare some xml content
 * var value =
 *    "<example value='10' value2='20'>" +
 *    "  <child-node><params>asdfasdfasdf</params></child-node><child-node />" +
 *    "</example>";
 *
 * // parse into a document (an xml node)
 * var document = VortexXMLEngine.parseFromString (value);
 *
 * // print some data
 * console.log ("Document with xml root node: " + document.name);
 *
 * // iterate over all childs xml root node has
 * var child = VortexXMLEngine.firstChild (document);
 * while (child) {
 *     // print child names
 *     console.log ("Child found: " + child.name);
 *
 *     // get next child
 *     child = VortexXMLEngine.nextNode (child);
 * }
 * \endcode
 *
 * Note this function returns a xmlNode, not a document so it can be
 * used to load complete xml documents or portions of xml as long as
 * they have a root xml node.
 */
VortexXMLEngine.parseFromString = function (data) {

    /* reset parser */
    this.position = 0;

    /* check if the document has a header <?xml ... ?> */
    var headers = {};
    if (data.charAt (0) == "<" && 
	data.charAt (1) == "?" &&
	data.charAt (2) == "x" &&
	data.charAt (3) == "m" &&
	data.charAt (4) == "l") {
	/* found xml header parse it */
        var iterator = 5;
	while (data.charAt (iterator) != "?" && data.charAt (iterator + 1) != ">")
	    iterator++;

	/* process headers */
	var header = VortexEngine.trim (data.substring (5, iterator));
	var pieces = header.split (" ");

	for (var iter in pieces) {
	    /* get the header */
	    header = pieces[iter];
	    
	    if (header.substring (0, 9) == "version='") {
		headers['version'] = header.split ("=")[1].replace (/'/g, "");
		continue;
	    }
	    if (header.substring (0, 10) == "encoding='") {
		headers['encoding'] = header.split ("=")[1].replace (/'/g, "");
		continue;
	    }
	    if (header.substring (0, 12) == "standalone='") {
		headers['standalone'] = header.split ("=")[1].replace (/'/g, "");
		continue;
	    }
	}
	this.position = (iterator + 2);
    }

    /* parse node root node */
    var result = VortexXMLEngine.parseXMLNode (data, null);
    
    for (var iter in headers) {
	/* set headers found */
	result[iter] = headers[iter];
    }
    
    return result;
};

VortexXMLEngine.parseXMLNode = function (data, parentNode) {
    var iterator;

    /* init iterator */
    iterator = this.position;

    /* skip white spaces (first) */
    iterator = VortexXMLEngine.consumeWhiteSpaces (data, iterator);

    /* check for <!CDATA[ sections */
    if ((iterator + 9) < data.length &&
	data.charAt(iterator) == '<' &&
	data.charAt(iterator + 1) == '!' &&
	data.charAt(iterator + 2) == '[' &&
	data.charAt(iterator + 3) == 'C' &&
	data.charAt(iterator + 4) == 'D' &&
	data.charAt(iterator + 5) == 'A' &&
	data.charAt(iterator + 6) == 'T' &&
	data.charAt(iterator + 7) == 'A' &&
	data.charAt(iterator + 8) == '[') {

	Vortex.log ("VortexXMLEngine.parseXMLNode: Found <![CDATA[ ]> declaration, reading content");

	/* found CDATA declaration */
	iterator += 9;
	this.position = iterator;

	while ((iterator + 2) < data.length) {
	    if (data.charAt(iterator) == ']' && data.charAt(iterator + 1) == ']' && data.charAt(iterator + 2) == '>')
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
    if (data.charAt(iterator) != '<') {

	/* check we have parent */
	if (parentNode == null) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: found PCDATA but no parent to assign it. Input looks like invalid XML");
	    return null;
	} /* end if */

	/* find node termination */
	while (iterator < data.length) {
	    if (data.charAt(iterator) == '<')
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
	if (data.charAt(iterator) == ' ' || data.charAt(iterator) == '>')
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
	childs : [],
	nextNode : null,
	previousNode : null,
	parentNode : null
    };

    /* now parse attributes */
    Vortex.log2 ("VortexXMLEngine.parseXMLNode: parsing attributes: iterator=" + iterator + ", data.length=" + data.length);
    while (iterator < data.length) {

	/* now consume spaces */
	while (iterator < data.length && data.charAt(iterator) == " ") 
	    iterator++;
	if (iterator >= data.length) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: end of input while parsing attributes found: " + node.name);
	    return null;
	} /* end if */

	Vortex.log2 ("VortexXMLEngine.parseXMLNode: looking for attributes, next content found is: '" + data.charAt (iterator) + "', position=" + iterator);

	/* check node termination without childs */
	if (data.charAt(iterator) == '/' && data.charAt(iterator + 1) == '>') {
	    /* node finished */
	    node.haveChilds = false;
	    iterator += 2;
	    break;
	}

	/* check node termination */
	if (data.charAt(iterator) == '>') {
	    /* node finished */
	    node.haveChilds = true;
	    iterator++;
	    break;
	}

	/* parse attributes */
	this.position = iterator;

	while (iterator < data.length) {
	    if (data.charAt(iterator) == '=')
		break;
	    iterator++;
	} /* end while */

	var attrName = data.substring (this.position, iterator);
	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found xml node attribute: '" + attrName + "'");

	/* check proper attribute value def */
	iterator++;
	if (data.charAt(iterator) != "'" && data.charAt(iterator) != "\"") {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content definition start (either \" or ') but found NONE of them.");
	    return null;
	}
	iterator++;

	/* now look for attribute value finish */
	this.position = iterator;
	while (iterator < data.length && data.charAt(iterator) != "'" && data.charAt(iterator) != "\"")
	    iterator++;

	/* check termination condition */
	if (iterator == data.length) {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node attribute content termination but found end of stream.");
	    return null;
	}

	var attrValue = data.substring (this.position, iterator);

	/* store attributes inside the node */
	var attr = {
	    name  : attrName,
	    value : attrValue
	};

	/* store attribute into the node */
	node.attrs.push (attr);

	iterator++;
	this.position = iterator;

	Vortex.log2 ("VortexXMLEngine.parseXMLNode: found xml node attribute content: '" + attrValue + "', position=" + this.position);
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

	    /* check for empty nodes with child configuration
	     <this-node-is-empty></this-node-is-empty> */
	if (data.charAt(iterator) == '<' && data.charAt(iterator + 1) == '/') {
	    /* restore proper configuration */
	    node.haveChilds = false;
	} else {

	    do {
		/* read childs */
		var child = VortexXMLEngine.parseXMLNode (data, node);

		/* stop processing if found an error */
		if (child == null) {
		    Vortex.log2 ("VortexXMLEngine.parseXMLNode: no childs where found..");
		    break;
		}

		/* configure child */
		child.parentNode = node;
		if (node.childs.length > 0) {
		    /* set up a reference to the previous */
		    child.previousNode = node.childs[node.childs.length -1];

		    /* and configure next */
		    child.previousNode.nextNode = child;
		} /* end if */
		    
		/* store child read */
		node.haveChilds = true;
		node.childs.push (child);

		/* consume more whitespaces */
		iterator = this.position;
		Vortex.log2 ("(2) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data.charAt(iterator) + data.charAt(iterator + 1));
		iterator      = VortexXMLEngine.consumeWhiteSpaces (data, iterator);
		this.position = iterator;
		Vortex.log2 ("(3) Finished node header parsing: iterator=" + iterator + ", this.position=" + this.position + ", data: " + data.charAt(iterator) + data.charAt(iterator + 1));

		if (data.charAt(iterator) == '<' && data.charAt(iterator + 1) == '/')
		    break;
	    } while (true);

	    /* consume after node termination */
	    iterator = VortexXMLEngine.consumeWhiteSpaces (data, this.position);
	}

	/* read node termination */
	if (data.charAt(iterator) != '<' || data.charAt(iterator + 1) != '/') {
	    Vortex.error ("VortexXMLEngine.parseXMLNode: expected to find XML node termination </, but found: " + data.charAt(iterator) + data.charAt(iterator + 1));
	    return null;
	} /* end if */

	/* find node termination */
	iterator += 2;
	while (data.charAt(iterator) != '>' && iterator <= data.length)
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
	if (data.charAt(iterator) != " " && data.charAt(iterator) != '\r' && data.charAt(iterator) != '\n')
	    break;
	/* otherwise, look at the next position */
	iterator++;
    }
    return iterator;
};

/**
 * @brief Function used to dump xml content produced by VortexXMLEngine.parseXML.
 *
 * @param document {xmlNode} The javascript object produced by \ref VortexXMLEngine.parseFromString to be dumped
 *
 * @param tabs {Number}? Optional value that allows to configure
 * number of white spaces to be introduced on each level. This option
 * produced pretty printable XML output.
 *
 * @param addHeader {Boolean}? Optional value that makes the function
 * to add the xml header <?xml ...> in the case it is true. By default
 * the header is never added.
 *
 * @return {String} Returns a string representing the xml document.
 */
VortexXMLEngine.dumpXML = function (document, tabs, addHeader)
{

    /* set default value */
    if (! tabs)
	tabs = 0;

    var ender = "";
    if (tabs > 0)
	ender = "\n";

    var iterator = tabs;
    var string   = "";
    while (iterator > 0) {
	string = string + " ";
	iterator--;
    }


    /* add xml header */
    var result = "";
    if (addHeader)
	result = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>\n";

    var attrs  = "";
    if (document.childs.length > 0) {
	attrs = VortexXMLEngine.dumpAttrs (document);
	if (attrs.length > 0)
	    result += string + "<" + document.name + " " + VortexXMLEngine.dumpAttrs (document) + ">" + ender;
	else
	    result += string + "<" + document.name + ">" + ender;

	/* add content */
	if (document.content)
	    result += document.content;

	for (var node in document.childs) {
	    result += VortexXMLEngine.dumpXML (document.childs[node], tabs * 2, false);
	}
	result += string + "</" + document.name + ">" + ender;
    } else {
	attrs = VortexXMLEngine.dumpAttrs (document);
	if (document.content) {
	    if (attrs.length > 0)
		result += string + "<" + document.name + " " + attrs + " >" + document.content + "</" + document.name + ">" + ender;
	    else
		result += string + "<" + document.name + ">" + document.content + "</" + document.name + ">" + ender;

	} else {
	    if (attrs.length > 0)
		result += string + "<" + document.name + " " + attrs + " />" + ender;
	    else
		result += string + "<" + document.name + " />" + ender;
	}
    }

    return result;
};

/**
 * @internal Function used to dump xml node attributes
 * produced by VortexXMLEngine.parseXML.
 */
VortexXMLEngine.dumpAttrs = function (node) {

    var string = "";
    for (var position in node.attrs) {
	var attr = node.attrs[position];
	string = string + attr.name + "='" + attr.value + "' ";
    }

    /* return string created */
    return string;
};

/**
 * @brief Allows to create a new xmlNode.
 *
 * @param name {String} The node name to give to the newly created xmlNode.
 *
 * @param content {String}? Optional string to be configured as
 * content into the node. 
 *
 * @return {xmlNode} Returns a newly created xml node with the provided name.
 *
 * Some examples using this function:
 * \code
 * // The following creates an empty node <test-node />
 * var xmlNode = VortexXMLEngine.createNode ("test-node");
 *
 * // The following creates a node with content <test-node>this is a test</test-node>
 * var xmlNode = VortexXMLEngine.createNode ("test-node", "this is a test");
 *
 * // remember to can set the content after using .content attribute 
 * xmlNode.content = "This is a nother content";
 *
 * // you can also change the node name with
 * xmlNode.name = "this-is-a-test";
 * \endcode
 */
VortexXMLEngine.createNode = function (name, content) {
    
    /* return a newly created node */
    return {
	name   : name,
	attrs  : [],
	childs : [],
	nextNode : null,
	previousNode : null,
	parentNode : null
    };
};

/** 
 * @brief Allows to set a child xmlNode to a another.
 * 
 * @param parent {xmlNode} The xml node that will hold the provided child.
 * 
 * @param child {xmlNode} The node to be set as child.
 * 
 * @param location {String}? Optional string that allows configuring
 * where the child will be configured. By default the child is
 * configured as the last one. You can use any of the following
 * locations: "first", "last" or an intenger value, which will be
 * handled as the index where to add the node.
 * 
 * @return {Boolean} The function returns true if the node was added,
 * otherwise false is returned. The function fails to add the node if
 * the parent or the child are undefined or the location do not follow
 * instructions provided.
 */
VortexXMLEngine.setChild = function (parent, child, location) {
    if (typeof parent == "undefined" || parent == null) 
	return false;
    if (typeof child == "undefined" || child == null)
	return false;

    /* if no node was found, just add it */
    if (parent.childs.length == 0) {
	child.parentNode = parent;
	parent.childs.push (child);
	return true;
    }

    if (typeof location == "undefined")
	location = "last";

    if (location == "first") {
	/* configure old first */
	parent.childs[0].previousNode = child;

	/* configure added node */
	child.nextNode     = parent.childs[0];
	child.previousNode = null;

	/* add the child */
	parent.childs.unshift (child);

	/* set parent */
	child.parentNode = parent;
	
	return true;
    } else if (location == "last") {
	/* configure old last */
	parent.childs[parent.childs.length -1].nextNode = child;

	/* configure added node */
	child.previousNode = parent.childs[parent.childs.length -1];
	child.nextNode = null;

	/* add the child */
	parent.childs.push (child);

	/* set parent */
	child.parentNode = parent;

	return true;
    } else if (typeof location == "number") {
	if (location < 0) {
	    location = 0;
	} else if (location > parent.childs.length) {
 	    location = parent.childs.length;
	}

	/* add the child */
	if (location == 0)
	    return VortexXMLEngine.setChild (parent, child, "first");
	else if (location == parent.childs.length) 
	    return VortexXMLEngine.setChild (parent, child, "last");
	else {
	    /* add the child into its position */
	    parent.childs.splice (location, 0, child);

	    /* set new next node */
	    parent.childs[location - 1].nextNode = child;
	    child.previousNode = parent.childs[location - 1];
	    
	    /* set new previous node */
	    parent.childs[location + 1].previousNode = child;
	    child.nextNode = parent.childs[location + 1];

	    /* set parent */
	    child.parentNode = parent;

	    /* notify done */
	    return true;
	} /* end if */
    }
    
    /* this shouldn't be reached */
    return false;    
};

/**
 * @brief Allows to get the first child node with the provided
 * childName on the provided node.
 *
 * @param node {xmlNode} The node or document that represents an xml document
 *
 * @param childName {String} The string representing the child node.
 *
 * @return {xmlNode} Returns a reference to the child node or null if
 * no child with that name was found.
 */
VortexXMLEngine.getChildByName = function (node, childName) {

    for (var iter in node.childs) {
        var child = node.childs[iter];

	/* check child found */
	if (child.name == childName)
	    return child;
    }

    /* no child was found */
    return null;
};

/**
 * @brief Allows to get the first child that a node has.
 *
 * @param node {xmlNode} The node to get  the first child from.
 *
 * @return {xmlNode} A reference to the first child node or null if it fails.
 */
VortexXMLEngine.firstChild = function (node) {

    if (typeof node == "undefined" || node == null)
	return null;

    if (node.childs.length == 0)
	return null;

    /* return first child */
    return node.childs[0];
};

/**
 * @brief Allows to get the last child that a node has.
 *
 * @param node {xmlNode} The node to get  the last child from.
 *
 * @return {xmlNode} A reference to the last child node or null if it fails.
 */
VortexXMLEngine.lastChild = function (node) {

    if (typeof node == "undefined" || node == null)
	return null;

    if (node.childs.length == 0)
	return null;

    /* return last child */
    return node.childs[node.childs.length - 1];
};

/**
 * @brief Allows to get the next node to the provided node (its sibling).
 *
 * @param node {xmlNode} The node to get the next node to it.
 *
 * @return {xmlNode} A reference to the first child node or null if it fails.
 */
VortexXMLEngine.nextNode = function (node) {

    if (typeof node == "undefined" || node == null)
	return null;

    /* return current state */
    return node.nextNode;
};

/**
 * @brief Allows to get the previous node to the provided node (its
 * previous sibling).
 *
 * @param node {xmlNode} The node to get the previous node to it.
 *
 * @return {xmlNode} A reference to the first child node or null if it fails.
 */
VortexXMLEngine.previousNode = function (node) {

    if (typeof node == "undefined" || node == null)
	return null;

    /* return current state */
    return node.previousNode;
};

/**
 * @brief Allows to get the attribute value associated to the xml node.
 *
 * @param node {xmlNode} The node or document that represents an xml document
 *
 * @param attrName {String} The string representing the xml attribute.
 *
 * @return {String} Returns the value associated to the provided
 * attribute or null if nothing was found.
 */
VortexXMLEngine.getAttr = function (node, attrName) {
    for (var iter in node.attrs) {
	var attr = node.attrs[iter];

	if (attr.name == attrName)
	    return attr.value;
    }

    return null;
};



/**
 * @brief Allows to check if the provided node has an attribute or if
 * it has that attribute with the provided value.
 *
 * The function accepts two or three parameters. When provided two,
 * the function only checks if the node has the provided attribute. In
 * the case three params are provided, it is assumed the caller wants
 * to also check the attribute value too.
 *
 * @param node {xmlNode} The node or document that represents an xml document
 *
 * @param attrName {String} The string representing the xml attribute.
 *
 * @param attrValue {String}? Optional value to check if the attribute
 * has the provided value.
 *
 * @return {Boolean} Returns true to signal the node has the provided
 * attribute or it has the provided attribute with the provided
 * value. Otherwise, false is returned.
 */
VortexXMLEngine.hasAttr = function (node, attrName, attrValue) {
    for (var iter in node.attrs) {
	var attr = node.attrs[iter];

	if (attr.name == attrName) {
	    /* attribute found */
	    if (typeof attrValue == "undefined")
		return true;

	    /* check attribute value */
	    return attr.value == attrValue;
	}
    }

    return false;
};

/**
 * @brief Allows to set the provided attribute=value on the give <node />
 *
 * @param node {xmlNode} The node or document that represents an xml document
 *
 * @param attrName {String} The string representing the xml attribute.
 *
 * @param attrValue {String} The value to be set on the attribute.
 *
 * @return {Boolean} Returns true if the attribute was added,
 * otherwise false is returned. The function can only fail if some of
 * the values aren't provided. If a second call is provided over the
 * same attribute the value will be replaced.
 */
VortexXMLEngine.setAttr = function (node, attrName, attrValue) {
    /* check if the attribute exists */
    if (! VortexXMLEngine.hasAttr (node, attrName)) {
	node.attrs.push ({
	    name : attrName,
	    value : attrValue
	});
	return true;
    }

    for (var iter in node.attrs) {
	var attr = node.attrs[iter];

	if (attr.name == attrName) {
	    attr.value = attrValue;
	    return true;
	}
    }

    return false;
};

/**
 * @brief Allows to dettach the provided node from its holding document.
 *
 * @param node {xmlNode} The node or document that represents an xml document
 *
 * @param replacement {xmlNode}? Optional xml node that can be used as
 * replacement for the node removed. 
 *
 */
VortexXMLEngine.detach = function (node, replacement) {
    
    /* check if the node is not attached to any document */
    if (node.parentNode == null)
	return;
	
    /* clear previous reference */
    if (node.previousNode) {
	if (replacement) {
	    /* we have a replacement */
	    replacement.previousNode          = node.previousNode;
	    replacement.previousNode.nextNode = replacement;
	} else {
	    /* without replacement, just remove */
	    node.previousNode.nextNode = node.nextNode;
	}
    }
    node.previousNode = null;

    /* clear next reference */
    if (node.nextNode)  {
	if (replacement) {
	    /* we have a replacement */
	    replacement.nextNode              = node.nextNode;
	    replacement.nextNode.previousNode = replacement;
	} else {
	    /* without replacement, just remove */
	    node.nextNode.previousNode = node.previousNode;
	}
    }
    node.previousNode = null;

    /* flag this node to be removed */
    node.__pRemove = true;

    /* remove from the document */
    while (true) {
	var found = false;
	for (var iter in node.parentNode.childs) {
	    /* get child and check flag */
	    var child = node.parentNode.childs[iter];
	    if (child.__pRemove) {
		if (replacement)
		    node.parentNode.childs[iter] = replacement;
		else
		    node.parentNode.childs.splice (iter, 1);
		found = true;
		break;
	    } /* end if */
	} /* end for */

	if (! found)
	    break;
    } /* end while */

    /* remove this attribute */
    delete node.__pRemove;

    /* set replacement parent node */
    if (replacement)
	replacement.parentNode = node.parentNode;

    /* clear node parent reference */
    node.parentNode = null;
    
    return;
};

/** 
 * @brief Allows to get the first node found on the provided path. 
 *
 * Assuming you have the following xml document:
 * \code
 * <root-node>
 *    <first-child>
 *       <item>content</item>
 *    </first-child>
 * </root-node>
 * \endcode
 *
 * You can call this function using the following to get a reference
 * to the item node.
 *
 * \code
 * var node = VortexXMLEngine.get (doc, "/root-node/first-child/item")
 * \endcode
 * 
 * @param doc {xmlNode} The node where the find operation will happen.
 *
 * @param path {String} The search string to use to locate the node to
 * find.
 *
 * @return {xmlNode} A reference to the first node found or null it if
 * fail.
 */
VortexXMLEngine.get = function (doc, path) {
    
    var items = path.split ("/");
    items.shift ();

    /* get the first node */
    var node = doc;
    if (node.name != items[0])
	return null;

    var iterator = 1;
    while (iterator < items.length) {
	/* get the child called */
	node = VortexXMLEngine.getChildByName (node, items[iterator]);
	if (node == null)
	    return null;

	/* next level */
	iterator ++;
    } /* end while */

    return node;
};