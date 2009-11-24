/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
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
 * object. The connection will be notified at the onopen method or
 */
function JavaSocketConnector (params) {
    /**
     * @brief Reference to the host the socket connects to.
     */
    this.host = params.host;
    /**
     * @brief Reference to the port the socket connects to.
     */
    this.port = params.port;

    /**
     * @brief Connection status. By default it is set to CONNECTING =
     * 0. The list of readyState are:
     *  - CONNECTING = 0
     *  - OPEN       = 1
     *  - CLOSED     = 2
     */
    this.readyState = 0;

    /* do a socket connection */
    document.getElementById('JavaSocketConnector').connect (params.host, params.port, this);
}

/**
 * @brief Allows to send content over the provided socket object.
 *
 * @param content The content to be sent.
 *
 * @return true in the case the send operation was initiated,
 * otherwise false is returned.
 */
JavaSocketConnector.prototype.send = function (content) {
    /* check socket readyState */
    if (this.readyState != 1) {
	this.onlog ("error", "Unable to send content, socket readyState is: " + readyState);
	return false;
    }

    /* now send content */
    return document.getElementById('JavaSocketConnector').send (content, this._jsc_out, this);
};

JavaSocketConnector.prototype.close = function () {
    if (this.readyState == 2) {
	this.onlog ("warn", "Connection already closed");
	return;
    }

    /* call to close */
    document.getElementById('JavaSocketConnector').close (this);
    return;
};

/**
 * @brief Default method to get connection open notifications.
 */
JavaSocketConnector.prototype.onopen = function () {
    if (this.readyState == 1) {
	console.log ("Socket connected to: " + this.host + ", port: " + this.port);
	return;
    }
    console.error ("Failed to connect!");
};

/**
 * @brief This is the handler that will receive all content received
 * on the socket.
 *
 * @param content The content received over the socket.
 */
JavaSocketConnector.prototype.onmessage = function (content) {
    console.log ("Content received: " + content);
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


// Applet reports it is ready to use
function java_socket_bridge_ready(){
	java_socket_bridge_ready_flag = true;
}

// Connect to a given url and port
function socket_connect(url, port){
	if(java_socket_bridge_ready_flag){
		return get_java_socket_bridge().connect(url, port);
	}
	else{
		on_socket_error("Java Socket Bridge cannot connect until the applet has loaded");
	}
}

// Disconnect
function socket_disconnect(){
	if(java_socket_bridge_ready_flag){
		return get_java_socket_bridge().disconnect();
	}
	else{
		on_socket_error("Java Socket Bridge cannot disconnect until the applet has loaded");
	}
}

// Write something to the socket
function socket_send(message){
	if(java_socket_bridge_ready_flag){
		return get_java_socket_bridge().send(message);
	}
	else{
		on_socket_error("Java Socket Bridge cannot send a message until the applet has loaded");
	}
}

// Get something from the socket
function on_socket_get(message){}

// Report an error
function on_socket_error(message){
	alert(message);
}

// Get the applet object
function get_java_socket_bridge(){
	return document.getElementById('JavaSocketConnector');
}