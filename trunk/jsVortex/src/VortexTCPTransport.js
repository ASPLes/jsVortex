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
	this.connect  = VortexFirefoxConnect;

	/* define default write method */
	this.write    = VortexFirefoxWrite;

	/* define default isOk method */
	this.isOk     = VortexFirefoxIsOk;

	/* define default close method */
	this.close    = VortexFirefoxClose;
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

    /* acquire priviledges */
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

    /* acquire reference to the socket transport
     * service */
    var transportService =	Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);

    /* create a socket */
    this.socket    = transportService.createTransport(null, 0, host, port, null);

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

    /* return socket created */
    return this.socket;
};

/**
 * @internal Implementation for firefox socket write operation.
 * FIXME. The method do not store the content that wasn't read
 * and pending to be sent.
 */
function VortexFirefoxWrite (data, length) {

    var result = this.outstream.write (data, length);
    return (result == length);
};

function VortexFirefoxIsOk () {
    /* acquire priviledges */
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

    /* check for null reference */
    if (this.socket == null)
	return false;

    /* check if the socket is alive */
    return this.socket.isAlive ();
};

function VortexFirefoxClose () {
    this.instream.close();
    this.outstream.close();
    return;
};

VortexTCPTransport.prototype.onStartRequest  = function (request, context) {
    /* nothing defined. */
};

VortexTCPTransport.prototype.onStopRequest   = function (request, context, status) {
/*	this.instream.close();
	this.outstream.close(); */
};

VortexTCPTransport.prototype.onDataAvailable = function (request, context, inputStream, offset, count) {

    /* request permission */
    netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');

    var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    instream.init(inputStream);

    /* read data received */
    var data = instream.read(count);

    /* call to notify data read */
    this.onReadHandler.apply (this.onReadObject, [this.onReadObject, data]);
};

VortexTCPTransport.prototype.onRead = function (object, handler) {
    this.onReadObject  = object;
    this.onReadHandler = handler;
};
