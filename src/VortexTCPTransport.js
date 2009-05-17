/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief TCP constructor for the set of functions that support I/O
 * with direct sockets.
 *
 * One instance must be created for each connection for this class.
 */
function VortexTCPTransport () {
	var outstream = null;
	var instream  = null;
	var socket    = null;

	/* define default connect method */
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
};

/**
 * @brief Firefox support for TCP connect.
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
    this.outstream = this.socket.openOutputStream (0, 0, 0);

    /* create pump object to get notifications for data
     * ready to be read */
    var input_stream = this.socket.openInputStream (0, 0, 0);
    this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    this.pump.init(input_stream, -1, -1, 0, 0, false);

    /* notify handlers. We pass a reference to our own
     * class which implements onStartRequest,
     * onStopRequest, onDataAvailable */
    this.pump.asyncRead (this, null);

    /* create input stream (special case where an
     * scriptable instance is required) */
    this.instream  = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    this.instream.init(input_stream);

    Vortex.log ("VortexFireFoxConnect: connection done");

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
    this.instream.close();
    this.outstream.close();
    this.socket = -1;
    return;
};

function VortexFirefoxEnableTLS () {

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

	    /* TODO: add server cert inorder to establish line of trust */
	    //    overrideService.rememberValidityOverride (
	    //	targetSite, /* Host Name with port (host:port) */
	    //	cert,                            // -> SSLStatus
	    //	flags,
	    //	false, ""); /* temporary */

	    return true;
	},
	notifySSLError : function (socketInfo, error, targetSite) {
	    Vortex.log ("SSL Error found: " + targetSite + ", error was: " + error);
	    return true;
	}
    };

    /* start TLS negotiation */
    securityInfo.StartTLS();
}

VortexTCPTransport.prototype.onStartRequest  = function (request, context) {
    /* nothing defined. */
    Vortex.log ("VortexTCPTransport.onStartRequest: request=" + request + ", context=" + context);

    /* call to notify start of the request */
    this.onStartHandler.apply (this.onStartObject, []);
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

    var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    instream.init(inputStream);

    /* read data received */
    var data = instream.read(count);

    /* call to notify data read */
    this.onReadHandler.apply (this.onReadObject, [this.onReadObject, data]);
};

/**
 * @brief Public method that allows to register a callback (handler)
 * that is called under the context of object when the connection is
 * ready to start the exchange.
 *
 * The handler to be configured must have the following form:
 *
 * function ();
 *
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
 * @brief Public method that allows to register a callback (handler)
 * that is called under the context of object when the connection is
 * closed.
 *
 * The handler to be configured must have the following form:
 *
 * function ();
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
 * @brief Public method that allows to register a callback (handler)
 * that is called under the context of object when data was received
 * in the connection.
 *
 * The handler to be configured must have the following form:
 *
 * function (connection, data);
 *
 * WHERE: connection is the connection where that is available
 * and data is the data received.
 *
 * @param object The context under which the handler will be executed
 *  (special reference this will point to this object).
 *
 * @param handler The method that is executed when the data is available.
 */
VortexTCPTransport.prototype.onRead = function (object, handler) {
    this.onReadObject  = object;
    this.onReadHandler = handler;
};

/**
 * @brief Public method that allows to registar a callback (handler)
 * that is called under the context of object when some error was
 * found during the transport function.
 *
 * The handler to be configured must have the following form:
 *
 * function (error);
 *
 * WHERE: connection is the connection where that is available
 * and data is the data received.
 *
 * @param object The context under which the handler will be executed
 *  (special reference this will point to this object).
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
VortexTCPTransport.prototype._reportError = function (error) {
    /* report error through the handler */
    VortexEngine.apply (this.onErrorHandler, this.onErrorObject [error]);

    try {
	/* report console error */
	Vortex.error (error);
    } catch (e) {
	/* under some cases this symbol is not found */
    }

    return;
};

