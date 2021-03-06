function run() {

    /* check that the applet was loaded */
    if (! JavaSocketConnector.isReady) {
	alert ("Unable to run test. The Java applet wasn't loaded or was not accepted by the user");
	return;
    } /* end if */

    /* create socket connection */
    var socket = new JavaSocketConnector ({ host: 'dolphin.aspl.es', port: 25});

    /* configure on connect */
    socket.onopen = function () {

	if (this.readyState == 1) {
	    /* now send some content */
	    if (socket.send ("GET / HTTP/1.1\n\n", 16)) {
		document.getElementById('result').innerHTML += "STEP 1: Content sent...<br>";
		console.log ("STEP 1: Content sent...");
	    }
	}
    };

    /* configure an onmessage received */
    socket.onmessage = function (message) {
	document.getElementById('result').innerHTML += "STEP 2: " + message + "<br>";

	/* now close the connection */
/*	socket.close (); */
    };

    /* configure onclose handler */
    socket.onclose = function () {
	document.getElementById('result').innerHTML += "STEP 3: Connection closed! <br>";
    };
}



