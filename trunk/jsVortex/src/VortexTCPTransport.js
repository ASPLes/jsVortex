/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief TCP constructor for the set of functions that support I/O
 * with direct sockets.
 *
 * This class implement the direct TCP support to make jsVortex to
 * interact with networking. This class implements the specific
 * browser I/O networking. At this moment it is only supported
 * Firefox.
 *
 * @class
 */
function VortexTCPTransport () {
    var outstream = null;
    var instream  = null;
    var socket    = null;

    if (VortexTCPTransport.useTransport == 1) {
	Vortex.log ("Creating transport using Firefox nsISocketTransportService");

	/* define default write method */
	this.connect    = VortexFirefoxConnect;

	/* define default write method */
	this.write      = VortexFirefoxWrite;

	/* define default isOk method */
	this.isOk       = VortexFirefoxIsOk;

	/* define default close method */
	this.close      = VortexFirefoxClose;

	/* define default start TLS operation */
	this.enableTLS  = VortexFirefoxEnableTLS;

	/* do not require permissions */
	this.requirePerms = true;

    } else if (VortexTCPTransport.useTransport == 2) {
	Vortex.log ("Creating transport using Java Socket Connector");

	/* define default write method */
	this.connect    = VortexJSCConnect;

	/* define default write method */
	this.write      = VortexJSCWrite;

	/* define default isOk method */
	this.isOk       = VortexJSCisOK;

	/* define default close method */
	this.close      = VortexJSCClose;

	/* define default start TLS operation */
	this.enableTLS  = VortexJSCEnableTLS;

    } /* end if */
};

/**
 * @brief Configures the default transport to be used each time an
 * instance of VortexTCPTransport is craeted.
 * Transports available are:
 *  - 1 : Firefox native javascript sockets
 *  - 2 : JavaSocketConnector native sockets (default)
 */
VortexTCPTransport.useTransport = 2;

/**
 * @internal Firefox support for TCP connect.
 *
 * @param host The host to connect to.
 * @param port The port to connect to.
 *
 * @return The socket created.
 */
function VortexFirefoxConnect (host, port) {

    /* set unconfigured value */
    this.socket = -1;

    /* acquire priviledges */
    if (this.requirePerms) {
	try {
	    Vortex.log ("VortexFirefoxConnect: requesting permission to connect XPComponents");
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} catch (e) {
	    /* report error found */
	    this._reportError ("VortexFireFoxConnect: Unable to connect remote host " + host + ":" + port + ", user have denied permission. Error found: " + e.message +
		". Did you config signed.applets.codebase_principal_support = true");
	    return this.socket;
	}
    }

    /* acquire reference to the socket transport
     * service */
    var transportService =	Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);

    /* create a socket */
    this.socket    = transportService.createTransport(["starttls"], 1, host, port, null);

    /* create output stream for write operations */
    this.outstream = this.socket.openOutputStream (0, 4096, 2);


    /* create pump object to get notifications for data
     * ready to be read */
    var input_stream = this.socket.openInputStream (0, 4096, 2);
    this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    this.pump.init(input_stream, -1, -1, 5000, 2, false);

    /* notify handlers. We pass a reference to our own
     * class which implements onStartRequest,
     * onStopRequest, onDataAvailable */
    this.pump.asyncRead (this, null);

    /* create input stream (special case where an
     * scriptable instance is required) */
    this.instream  = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    this.instream.init(input_stream);

    Vortex.log ("VortexFireFoxConnect: connection done");

    /* notify connection ready at this point because firefox socket
     support do not notify it until data comes from the server. */
    VortexEngine.apply (this.onStartHandler, this.onStartObject, [], true);

    /* return socket created */
    return this.socket;
};

/**
 * @internal Implementation for firefox socket write operation.
 * FIXME. The method do not store the content that wasn't read
 * and pending to be sent.
 */
function VortexFirefoxWrite (data, length) {
    /* acquire priviledges */
    if (this.requirePerms) {
	try {
	    Vortex.log ("VortexFirefoxWrite: requesting permission to connect XPComponents");
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} catch (e) {
	    /* report error found */
	    this._reportError ("VortexFireFoxWrite: Unable to acquire permission to write to the socket. Error found: " + e.message +
		". Did you config signed.applets.codebase_principal_support = true");
	    return false;
	}
    } /* end acquire priviledges */

    /* do write */
    try {
	var result = this.outstream.write (data, length);
	this.outstream.flush ();
    } catch (e){
	this._reportError ("VortexFirefoxWrite: failed to write content, message was: " + e.message);
	return false;
    }
    return (result == length);
};

function VortexFirefoxIsOk () {

    try {
	/* acquire priviledges */
	if (this.requirePerms) {
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} /* end if */
    } catch (e) {
	this._reportError ("VortexFireFoxIsOK: Unable to acquire permissions to check socket. Error found: " + e.message +
	    ". Did you config signed.applets.codebase_principal_support = true");
	return false;
    }

    /* check for null reference */
    if (this.socket == null || this.socket == -1) {
	Vortex.warn ("VortexFirefoxIsOk: socket is null or -1: " + this.socket);
	return false;
    }

    /* check if the socket is alive */
    var result = this.socket.isAlive ();
    if (! result) {
	this.close ();
	return false;
    } /* end if */

    return true;
};

function VortexFirefoxClose () {
    try {
	/* acquire priviledges */
	if (this.requirePerms) {
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} /* end if */
    } catch (e) {
	this._reportError (
	    "Failed to acquire permissions to close input stream, socket and output stream. Error found: " + e.message +
	    ". Did you config signed.applets.codebase_principal_support = true");
	return;
    } /* end try */

    /* close streams */
    this.instream.close();
    this.outstream.close();

    /* close the socket */
    if (this.socket != -1)
	this.socket.close (0);

    this.socket = -1;
    return;
};

function VortexFirefoxEnableTLS (notify, ctx) {

    try {
	/* acquire priviledges */
	if (this.requirePerms) {
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} /* end if */
    } catch (e) {
	this._reportError ("VortexFirefoxEnableTLS: Unable to acquire permissions to enable TLS interface. Error found: " + e.message +
			   ". Did you config signed.applets.codebase_principal_support = true");
	/* call to notify */
	VortexEngine.apply (notify, ctx, [true], true);
	return false;
    }

    var securityInfo = this.socket.securityInfo.QueryInterface(Components.interfaces.nsISSLSocketControl);

    /* ignore for now cert problems: more work is required here */
    securityInfo.notificationCallbacks = {
	/* place a reference to the transport */
	transport: this,
	getInterface : function(iid) {
	    try {
		/* acquire priviledges */
		if (this.transport.requirePerms) {
		    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		} /* end if */
	    } catch (e) {
		this.transport._reportError ("VortexBadCertHandler.getInterface: Unable to acquire permissions to get TLS interface. Error found: " + e.message +
					     ". Did you config signed.applets.codebase_principal_support = true");
		return null;
	    }

	    if (iid.equals(Components.interfaces.nsIBadCertListener) ||	iid.equals(Components.interfaces.nsIBadCertListener2))
		return this;

	    /* interface not supported */
	    Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
	    return null;
	},
	notifyCertProblem : function (socketInfo, /*nsISSLStatus*/SSLStatus, /*String*/targetSite) {
	    try {
		/* acquire priviledges */
		if (this.transport.requirePerms) {
		    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		} /* end if */
	    } catch (e) {
		this.transport._reportError ("VortexBadCertHandler.notifyCertProblem: Unable to acquire permissions to notify certificate problem. Error found: " + e.message +
					     ". Did you config signed.applets.codebase_principal_support = true");
		return false;
	    }

	    Vortex.log ("Certificate problem with target site: " + targetSite);

	    /* see http://lxr.mozilla.org/seamonkey/source/security/manager/pki/resources/content/exceptionDialog.js
	     * addEcsption Method..
	     */
	    var overrideService = Components.classes["@mozilla.org/security/certoverride;1"].getService(Components.interfaces.nsICertOverrideService);

	    var flags = 0;
	    /* override untrusted */
	    flags |= overrideService.ERROR_UNTRUSTED;

	    /* override domain mismatch */
	    flags |= overrideService.ERROR_MISMATCH;

	    /* override certificate expired */
	    flags |= overrideService.ERROR_TIME;

	    /* get certificate */
	    var cert = SSLStatus.QueryInterface(Components.interfaces.nsISSLStatus).serverCert;
	    Vortex.log ("Server certificate: " + cert);
	    Vortex.log ("commonName: " + cert.commonName);
	    Vortex.log ("issuer: " + cert.issuer);
	    Vortex.log ("issuerCommonName: " + cert.issuerCommonName);
	    Vortex.log ("validity: " + cert.validity);
	    Vortex.log ("verifyForUsage: " + cert.verifyForUsage);

	    /* split target site */
	    var target = targetSite.split (":");

	    /* TODO: add server cert inorder to establish line of trust */
	    overrideService.rememberValidityOverride (
		/* host */
		target[0],
		/* port */
		target[1],
	    	cert,                            // -> SSLStatus
	    	flags,
	    	false); /* temporary */

	    return true;
	},
	notifySSLError : function (socketInfo, error, targetSite) {
	    Vortex.error ("SSL Error found: " + targetSite + ", error was: " + error);
	    return true;
	}
    };

    /* start TLS negotiation */
    Vortex.log ("Starting SSL operation..");
    securityInfo.StartTLS();
    Vortex.log ("SSL handshake done..");

    /* call to notify */
    VortexEngine.apply (notify, ctx, [true], true);

    return true;
}
/**
 * @internal This is a firefox handler called when the connection
 * receives content for the first time. It should notify connection
 * ready but doesn't do it.
 */
VortexTCPTransport.prototype.onStartRequest  = function (request, context) {
    /* nothing defined. */
    Vortex.log ("VortexTCPTransport.onStartRequest: request=" + request + ", context=" + context);
    return;

    try {
	/* call to notify start of the request */
	VortexEngine.apply (this.onStartHandler, this.onStartObject, []);
/*	this.onStartHandler.apply (this.onStartObject, []);  */
    } catch (e) {
	Vortex.error ("VortexTCPTransport.onStartRequest: exception found at onStartRequest: " + e.message);
    }
    return;
};

VortexTCPTransport.prototype.onStopRequest   = function (request, context, status) {

    try {
	/* acquire priviledges */
	if (this.requirePerms) {
	    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
	} /* end if */
    } catch (e) {
	this._reportError ("VortexTCPTransport.onStopRequest: Unable to acquire permissions to check socket. Error found: " + e.message +
	    ". Did you config signed.applets.codebase_principal_support = true");
	return;
    }
    Vortex.log ("VortexTCPTransport.onStopRequest: socket: " + this.socket + ", status=" + status);
    if (status == 2152398861) {
	this._reportError ("Connection refused: host is down or refusing connections");
    } else if (status == 0) {
	/* call to notify stop */
	this.onStopHandler.apply (this.onStopObject, [this.onStopObject]);
    } else if (status == 2153390050) {
	/* TLS handshake error */
	this._reportError ("TLS handshake error found.");
	this.onStopHandler.apply (this.onStopObject, [this.onStopObject]);
    } /* end if */

    /* signal connection closed */

    return;
};

VortexTCPTransport.prototype.onDataAvailable = function (request, context, inputStream, offset, count) {

    /* request permission */
    if (this.requirePerms) {
	netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
    }

/*    var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    instream.init(inputStream); */

    /* read data received */
    var data = this.instream.read(count);

    /* call to notify data read */
    this.onReadHandler.apply (this.onReadObject, [this.onReadObject, data]);
};

/**
 * @internal Method that allows to register a callback (handler)
 * that is called under the context of object when the connection is
 * ready to start the exchange.
 *
 * @param object The context under which the handler will be executed
 * (special reference this will point to this object).
 *
 * @param handler The method that is executed when the data is available.
 */
VortexTCPTransport.prototype.onStart = function (object, handler) {
    this.onStartObject  = object;
    this.onStartHandler = handler;
};

/**
 * @internal Method that allows to register a callback (handler)
 * that is called under the context of object when the connection is
 * closed.
 *
 * @param object The context under which the handler will be executed
 * (special reference this will point to this object).
 *
 * @param handler The method that is executed when the data is available.
 */
VortexTCPTransport.prototype.onStop = function (object, handler) {
    this.onStopObject  = object;
    this.onStopHandler = handler;
};

/**
 * @internal Method that allows to register a callback (handler) that
 * is called under the context of object when data was received in the
 * connection.
 *
 * @param object The context under which the handler will be executed
 * (special reference this will point to this object).
 *
 * @param handler The method that is executed when the data is available.
 */
VortexTCPTransport.prototype.onRead = function (object, handler) {
    this.onReadObject  = object;
    this.onReadHandler = handler;
};

/**
 * @internal Method that allows to registar a callback (handler) that
 * is called under the context of object when some error was found
 * during the transport function.
 *
 * @param object The context under which the handler will be executed
 * (special reference this will point to this object).
 *
 * @param handler The method that is executed when the data is available.
 */
VortexTCPTransport.prototype.onError = function (object, handler) {
    this.onErrorObject  = object;
    this.onErrorHandler = handler;
};

/**
 * @internal Function used to report an error found through onError
 * handler configured.
 *
 * @param error to be reported.
 */
VortexTCPTransport.prototype._reportError = function (errorMsg) {

    /* report console error */
    Vortex.error (errorMsg);

    /* report error through the handler */
    VortexEngine.apply (this.onErrorHandler, this.onErrorObject, [errorMsg]);

    return;
};

/**
 * @internal JavaSocketConnector support for TCP connect.
 *
 * @param host The host to connect to.
 * @param port The port to connect to.
 *
 * @return The socket created.
 */
function VortexJSCConnect (host, port) {

    /* check java applet was loaded */
    if (! JavaSocketConnector.isReady) {
	Vortex.error ("JavaSocketConnector applet was not loaded. Did you load from your weg page");
	this.socket = -1;
	this._reportError ("VortexJSCConnect: JavaSocketConnector applet was not loaded. Unable to initialize java socket connector.");
	return -1;
    }

    Vortex.log ("Creating connection with " + host + ":" + port + ", using JSC interface..");

    /* connect */
    this.socket = new JavaSocketConnector ({host: host, port: port});

    /* configure on open handler and the transport context  */
    this.socket.transport = this;
    this.socket.onopen    = VortexJSCConnect.onopen;
    this.socket.onmessage = VortexJSCConnect.onmessage;
    this.socket.onclose   = VortexJSCConnect.onclose;
    this.socket.onlog     = VortexJSCConnect.onlog;

    /* return socket created */
    return this.socket;
};

VortexJSCConnect.onopen = function () {
    /* under this handler "this" keyword points to the socket object */
    if (this.readyState == 1) {
	Vortex.log ("Connection OK, now proceed..: " + this.host + ":" + this.port);
    } else {
	Vortex.error ("Failed to connect to remote host: " + this.host + ":" + this.port);
	this.transport._reportError ("Failed to connect to remote host, connection refused");
    }

    /* notify connection ready at this point because firefox socket
     support do not notify it until data comes from the server. */
    VortexEngine.apply (this.transport.onStartHandler, this.transport.onStartObject, [], true);
    return;
};

/**
 * @internal Handler called eacy time some content is received on the socket.
 */
VortexJSCConnect.onmessage = function (message) {

    /* call to notify data read */
    this.transport.onReadHandler.apply (this.transport.onReadObject, [this.transport.onReadObject, message]);
};

/**
 * @internal Handler to receive all java socket connector work.
 */
VortexJSCConnect.onlog = function (type, message) {
    if (type == "info") {
	Vortex.log (message);
	return;
    } else if (type == "error") {
	Vortex.error (message);
	return;
    } else if (type == "warn") {
	Vortex.warn (message);
	return;
    }

    Vortex.error ("UNHANDLED TYPE: " + type + ": " + message);
    return;

};

/**
 * @internal Handler called eacy time some content is received on the socket.
 */
VortexJSCConnect.onclose = function () {

    /* call to notify data read */
    this.transport.onStopHandler.apply (this.transport.onStopObject, [this.transport.onStopObject]);
};

/**
 * @internal JavaSocketConnector write support.
 * @param data The set of octets to write.
 * @param length The amount of data from data to be written.
 */
function VortexJSCWrite (data, length) {
    /* this points to the transport (VortexTCPTransport) */
    return this.socket.send (data, length);
}

/**
 * @internal JavaSocketConnector socket check.
 */
function VortexJSCisOK () {

    /* Vortex.log ("Checking socket state: " + this.socket); */

    /* check socket termination */
    if (this.socket == -1)
	return false;

    /* Vortex.log ("Checking socket ready state: " + this.socket.readyState); */

    /* check that the socket is in readyState == OPEN */
    return (this.socket.readyState == 1);
}

/**
 * @internal Function that implements JSC especific TLS activation.
 *
 * @param notify The handler to be called to notify TLS activation.
 *
 * @param ctx The context under which the handler will run.
 *
 * @param trustPolicy ? Trust configuration
 *
 * @param certErrorHandler ? Handler to be called in the case
 * trustPolicy is equal to 2, causing that handler to be called in the
 * case of certificate error.
 *
 */
function VortexJSCEnableTLS (notify, ctx, trustPolicy, certErrorHandler) {

    /* define ontls handler */
    this.socket.ontls = function (status) {
	Vortex.log ("Received ontls notification, status was: " + status);
	/* marshall reply received to handler and context received */
	VortexEngine.apply (notify, ctx, [status]);
	return;
    };

    /* check trustPolicy */
    if (typeof trustPolicy != "undefined")
	this.socket.certTrustPolicy = trustPolicy;
    /* check certErrorHandler */
    if (typeof certErrorHandler != "undefined") {
	this.socket.oncerterror = function (subject, issuer, cert) {
	    /* forward call and return result */
	    return certErrorHandler.apply (ctx, [subject, issuer, cert]);
	};
    } /* end if */

    /* call to enable TLS */
    return this.socket.enableTLS ();
}

function VortexJSCClose () {

    /* do not implement any operation in the case the socket is
     already closed */
    if (this.socket == -1)
	return;

    /* call to close socket */
    this.socket.close ();

    /* clear socket reference */
    this.socket = -1;
    return;
}