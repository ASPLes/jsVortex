/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @internal The following is defined to avoid crashing js code in the
 * case console module is not defined.
 */
if (typeof console == "undefined") {
    this.console = {
	log:   function () {},
	error: function () {},
	warn:  function () {}
    };
}

/**
 * @brief Socket constructor. The constructor returns a Socket
 * object. The connection will be notified at the onopen method. To check TCP connection status check readyState member.
 *
 * @param params Associative array that includes all parameters expected by the method. Expected values are:
 * @param params.host {String} The host to connect to (ip or hostname).
 * @param params.port {String} The TCP port to connect to.
 *
 * @return Returns a reference to a JavaSocketConnector instance.
 */
function JavaSocketConnector (params) {
    /**
     * @brief Reference to the host the socket connects to.
     * @type {String}
     */
    this.host = params.host;
    /**
     * @brief Reference to the port the socket connects to.
     * @type {String}
     */
    this.port = params.port;

    /**
     * @brief Connection encoding.
     */
    this.encoding = params.encoding;
    if (typeof this.encoding == "undefined")
	this.encoding = document.characterSet;
    if (typeof this.encoding == "undefined")
	this.encoding = document.charset;

    /**
     * @brief Connection status. By default it is set to CONNECTING =
     * 0. The list of readyState are:
     *  - CONNECTING = 0
     *  - OPEN       = 1
     *  - CLOSED     = 2
     */
    this.readyState = 0;

    /* cache all methods to avoid depending on applets[''] to return
     the right reference: fixes some misterious FF bugs */
    if (typeof JavaSocketConnector._cached == "undefined" && navigator.appName == "Netscape") {
	  JavaSocketConnector._cached = {
	    connect : document.applets['JavaSocketConnector'].connect,
	    send : document.applets['JavaSocketConnector'].send,
	    enableTLS : document.applets['JavaSocketConnector'].enableTLS,
	    close : document.applets['JavaSocketConnector'].close
	  };
    }

    /* set connection id */
    this.id = JavaSocketConnector.nextId;
    JavaSocketConnector.nextId++;

    /* store a reference to the connection so it can be located by the
     * applet: this ugly hack is to support Safari browser poor java *
     * applet integration where a javascript object can't be passed */
    JavaSocketConnector.connections[this.id] = this;

    /* do a socket connection */
    this.state = document.applets.JavaSocketConnector.connect (params.host, params.port, this.encoding, String(this.id));
}

/**
 * @internal Reference used to identify all connections assigning one
 * unique identifier to each connection.
 */
JavaSocketConnector.nextId = 1;

/**
 * @internal Reference to all connections created by the applet so
 * they can be accessed via its identifier.
 */
JavaSocketConnector.connections = {};

/**
 * @brief Global variable used to signal that the applet was loaded
 * and started.
 */
JavaSocketConnector.isReady = false;

/**
 * @brief Allows to send content over the provided socket object.
 *
 * @param content The content to be sent.
 * @param length The amount of data to be sent from the content.
 *
 * @return true in the case the send operation was initiated,
 * otherwise false is returned.
 */
JavaSocketConnector.prototype.send = function (content, length) {
    /* check socket readyState */
    if (this.readyState != 1) {
	this.onlog ("error", "Unable to send content, socket readyState is: " + readyState);
	return false;
    }

    /* now send content */
    return document.applets.JavaSocketConnector.send (content, length, this.state);
};

/**
 * @brief Function used to enable TLS protection on the provided socket.
 * See also certTrustPolicy which allows configuring what to do in the case of certificate error.
 */
JavaSocketConnector.prototype.enableTLS = function () {
    /* check socket readyState */
    if (this.readyState != 1) {
	this.onlog ("error", "Unable to enable TLS, socket readyState is: " + readyState);
	return false;
    }

    /* now send content */
    return document.applets.JavaSocketConnector.enableTLS (this.state);
};

/**
 * @brief Certificate trust policy for TLS activation. This member
 * allows to configure what to do in the case server certificate
 * validation fails. Allowed values are:
 * 1 : Only accept valid server certificates.
 * 2 : Ask the user (caller) to accept or not a certificate when an error is found. The caller must have defined oncerterror method. See it for details.
 * 3 : In the case of certificate error, accept it.
 */
JavaSocketConnector.prototype.certTrustPolicy = 1;

JavaSocketConnector.prototype.close = function () {
    if (this.readyState == 2) {
	this.onlog ("warn", "Connection already closed");
	return;
    }

    /* call to close */
    document.applets.JavaSocketConnector.close (this.state);

    /* remove reference */
    delete JavaSocketConnector.connections[this.id];

    return;
};

/**
 * @brief Default method to get connection open notifications.
 */
JavaSocketConnector.prototype.onopen = function () {
    if (this.readyState == 1) {
	console.log ("USING DEFAULT onopen: Socket connected to: " + this.host + ", port: " + this.port);
	return;
    }
    console.error ("USING DEFAULT onopen: Failed to connect!");
};

/**
 * @brief This is the handler that will receive all content received
 * on the socket.
 *
 * @param content The content received over the socket.
 */
JavaSocketConnector.prototype.onmessage = function (content) {
    console.log ("USING DEFAULT onmessage: Content received: " + content);
};

/**
 * @brief This is the handler that will receive on close notifications.
 */
JavaSocketConnector.prototype.onclose = function () {
    console.log ("USING DEFAULT onclose: Close notification");
};

/**
 * @brief This is the handler that will be called once the TLS handshake have finished.
 */
JavaSocketConnector.prototype.ontls = function (status) {
    console.log ("USING DEFAULT ontls: TLS status was: " + status);
};

/**
 * @brief Handler called in the case TLS is activated and a server
 * certificate error is found.
 */
JavaSocketConnector.prototype.oncerterror = function (subjet, issuer, cert) {
    console.log ("USING DEFAULT oncerterror: validating subject: " + subject);
    /* this default implementation never accept a certificate */
    return false;
};

/**
 * @brief Default onlog handler used by the JavaSocketConnector applet
 * to relay all logs created during its function.
 */
JavaSocketConnector.prototype.onlog = function (type, message) {

    if (type == "info") {
	console.log (message);
	return;
    } else if (type == "error") {
	console.error (message);
	return;
    } else if (type == "warn") {
	console.warn (message);
	return;
    }

    console.error ("UNHANDLED TYPE: " + type + ": " + message);
    return;
};

/**
 * @internal Handler used by the java accept to marshall the call.
 */
JavaSocketConnector.prototype._marshallCall = function (context, call, arg) {
    call.apply (context, [arg]);
};

/**
 * @internal Function used by java applet to modify connection members.
 */
JavaSocketConnector.setMember = function (conn_id, member, value) {

    /* set the value */
    JavaSocketConnector.connections[conn_id][member] = value;

    return;
};

/**
 * @internal Function used by java applet to get connection members.
 */
JavaSocketConnector.getMember = function (conn_id, member, value) {
    /* set the value */
    return JavaSocketConnector.connections[conn_id][member];
};

/**
 * @internal Function used to marshall calls by eval calls from java
 * applet into javascript (mainly due to Mac/OSX safari restrictions).
 *
 */
JavaSocketConnector.call = function (conn_id, method, value, value2, value3) {

    /* code base64 content for string received */
    if (method == "onmessage") {
	value =	VortexBase64.decode (value);
    } else if (method == "onlog") {
	value2 = VortexBase64.decode (value2);
    } else if (method == "oncerterror") {
	value = VortexBase64.decode (value);
	value2 = VortexBase64.decode (value2);
	value3 = VortexBase64.decode (value3);
    }

    var conn = JavaSocketConnector.connections[conn_id];
    if (! conn) {
	Vortex.error ("JavaSocketConnection.call: unable to notify method " + method + ", over connection id: " + conn_id + ", conn reference was not found");
	return null;
    }

    /* call javascript method on the right connection */
    return conn[method] (value, value2, value3);
};
