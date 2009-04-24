function testConnectResult (conn) {

    if (! conn.isOk ()) {
	document.write ("<div class='error'>Failed to connect..</div>");
	return false;
    } else {
	document.write ("Connected OK!!<br>");
    }

    document.write ("Connected to host: " + conn.host + ", port: " + conn.port + "<br>");

    if (conn.isOk ()) {
	document.write ("<div class='ok'>All tests ok!</div>");
    } else {
	document.write ("<div class='error'>Regression test failed!</div>");
    }

    return true;
};

function testConnect () {

    document.write ("<h2>jsVortex-01: testing basic BEEP connect..</h1>");

    document.write ("Connecting to localhost:44010<br>");
    var conn = new VortexConnection ("localhost", "44010",
				     new VortexTCPTransport (),
				     this.testConnectResult, null);
    return true;
}

function runTest (testName) {

    /* run all tests */
    /* document.write ("<h1>jsVortex: running all regression tests..</h1>"); */
    /* testConnect (); */
    var host = dojo.byId ("host").value;
    var port = dojo.byId ("port").value;
    console.log ("Running all tests: " + host + ":" + port);




    return;
}

function prepareTest () {
    /* connect clicked signal */
    dojo.connect (dojo.byId("run-test"), "click", runTest);

    /* configure default connection values */
    dojo.byId ("host").value = "localhost";

    /* configure default connection port value */
    dojo.byId ("port").value = "44010";
}

/* register our function in dojo */
dojo.addOnLoad (prepareTest);





