function testConnect () {
    document.write ("Connecting to localhost:602<br>");
    var conn = new VortexConnection ("localhost", "602", new VortexTCPTransport ());
    if (! conn.isOk ()) {
	document.write ("<div class='error'>Failed to connect..</div>");
	return false;
    } else {
	document.write ("Connected OK!!<br>");
    }

    document.write ("Connected to host: " + conn.host + ", port: " + conn.port + "<br>");

    return true;
}

function runTest (testName) {

    /* check to run a particular test */
    if (typeof testName != "undefined") {
	return testName ();
    }

    /* run all tests */
    document.write ("<h1>jsVortex: running all regression tests..</h1>");
    document.write ("<h2>jsVortex-01: testing basic BEEP connect..</h1>");
    if (! testConnect ())
	return false;
    return true;
}

if (runTest ()) {
    document.write ("<div class='ok'>All tests ok!</div>");
} else {
    document.write ("<div class='error'>Regression test failed!</div>");
}





