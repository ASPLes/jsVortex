function run() {
    /* create socket connection */
    var socket = new JavaSocketConnector ({ host: 'dolphin.aspl.es', port: 25});

    /* configure on connect */
    socket.onopen = function () {

	if (this.status == 1) {
	    /* now send some content */
	    if (socket.send ("GET / HTTP/1.1\n\n")) {
		console.log ("Content sent...");
	    }
	}
    };

    /* configure an onmessage received */
    socket.onmessage = function (message) {
	document.getElementById('result').innerHTML += message + "<br>";
    };

}



