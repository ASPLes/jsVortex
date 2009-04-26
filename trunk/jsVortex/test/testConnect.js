function testConnectResult (conn) {

    if (! conn.isOk ()) {
	log ("error", "Failed to connect..");

	/* check errors */
	while (conn.hasErrors ()) {
	    log ("error", conn.popError ());
	} /* end while */

	return false;
    }

    /* check connection */
    if (conn.isOk ()) {
	log ("ok", "Connected to host: " + conn.host + ", port: " + conn.port);
    } else {
	log ("error", "Regression test failed!");
	return false;
    }

    /* check connection greetings */
    if (conn.greetingsPending) {
	log ("error", "found connection with pending greetings (flag activated)");
	return false;
    }

    /* check channels opened */
    if (conn.channels.length != 1) {
	log ("error", "Expected to find 1 channel opened in the connection, but found: " + conn.channels.length);
	return false;
    }

    /* check profiles supported */
    if (conn.profiles.length != 29) {
	log ("error", "Expected to find 29 profiles registered");
	return false;
    }


    /* call for the next test */
    this.nextTest ();

    return true;
};

function testConnect () {

    log ("ok", "Connecting to " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testConnectResult, this);
    return true;
}

/**
 * @brief Constructor function that creates a new regression test.
 *
 * @param host The host	location of the regression test listener.
 * @param port The port location of the regression test listener.
 */
function RegressionTest (host, port) {

    /* initialize next test to execute */
    this.nextTestId = -1;

    /* record host and port */
    this.host       = host;
    this.port       = port;

    /* do not return nothing */
};

/**
 * @brief Method that runs the next test.
 */
RegressionTest.prototype.nextTest = function () {

    /* select next test to execute */
    this.nextTestId++;

    /* check available tests */
    if (this.tests.length == this.nextTestId) {
	log ("final-ok", "All regression tests finished OK!");
	return;
    } else if (this.tests.lenght < this.nextTestId) {
	log ("error", "regression test is calling to next test too many times: " + this.nextTestId);
	return;
    }

    /* call next test */
    console.log ("INFO: running test-" + this.nextTestId);
    log ("info", "Running TEST-" + this.nextTestId + ": " + this.tests[this.nextTestId].name);
    this.tests[this.nextTestId].testHandler.apply (this);
    return;
};

/* list of regression test available with its
 * associated test to show */
RegressionTest.prototype.tests = [
    {name: "BEEP basic connection test", testHandler: testConnect}
];


function log (status, log) {

    /* create the node that wild hold the content to log */
    var newNode = document.createElement ("p");
    dojo.addClass (newNode, "log-line");
    dojo.addClass (newNode, status);

    /* configure log line into the node */
    newNode.innerHTML = log;

    /* place the node into the panel */
    var logpanel = dojo.byId ("log-panel");
    dojo.place (newNode, logpanel);
}

function runTest (testName) {

    /* run all tests */
    /* document.write ("<h1>jsVortex: running all regression tests..</h1>"); */
    /* testConnect (); */
    var host = dojo.byId ("host").value;
    var port = dojo.byId ("port").value;

    /* not required to check host and port here, already done by the form */

    log ("ok", "Running all tests: " + host + ":" + port);

    /* create a regression test */
    var regTest = new RegressionTest (host, port);

    /* run tests */
    regTest.nextTest();

    return;
}

function clearLog () {
    /* clear log panel */
    var logpanel = dojo.byId ("log-panel");
    logpanel.innerHTML = "";
}

function prepareTest () {
    /* connect clicked signal */
    dojo.connect (dojo.byId("run-test"), "click", runTest);
    dojo.connect (dojo.byId ("clear-log"), "click", clearLog);

    /* configure default connection values */
    dojo.byId ("host").value = "localhost";

    /* configure default connection port value */
    dojo.byId ("port").value = "44010";
}

/* register our function in dojo */
dojo.addOnLoad (prepareTest);





