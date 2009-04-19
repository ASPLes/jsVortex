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

    /* check to run a particular test */
    if (typeof testName != "undefined") {
	testName ();
	return;
    }

    /* run all tests */
    document.write ("<h1>jsVortex: running all regression tests..</h1>");
    testConnect ();

    return;
}







