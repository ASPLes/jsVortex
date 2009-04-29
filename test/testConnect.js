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

    /* close the conection properly */
    /* conn.sessionClose (); */

    /* call for the next test */
    this.nextTest ();

    return true;
};

function testConnect () {

    log ("info", "Connecting to " + this.host + ":" + this.port);
    var conn = new VortexConnection (this.host,
				     this.port,
				     new VortexTCPTransport (),
				     testConnectResult, this);
    return true;
}

function testIntraestructure () {
    log ("info", "Checking VortexEngine.checkReference..");

    /* check null reference */
    if (VortexEngine.checkReference (null)) {
	log ("error", "Expected to find a failure while passing a null reference");
	return false;
    }

    /* check undefined reference */
    if (VortexEngine.checkReference (undefined)) {
	log ("error", "Expected to find a failure while passing a null reference");
	return false;
    }

    var object = {};

    /* check defined reference */
    if (! VortexEngine.checkReference (object)) {
	log ("error", "Expected to find a success while passing a defined empty reference");
	return false;
    }

    /* check defined reference but with an undefined attribute */
    if (VortexEngine.checkReference (object, "value")) {
	log ("error", "Expected to find a failure while passing a defined empty reference with a check of an undefined attribute");
	return false;
    }

    /* define the value */
    object.value = "this is a test";

    /* check defined reference but with an undefined attribute */
    if (! VortexEngine.checkReference (object, "value")) {
	log ("error", "Expected to find a success while passing a defined reference with a check of a defined attribute (value)");
	return false;
    }

    /* call for the next test */
    this.nextTest ();

    return true;
};

function testjsVortexAvailable () {

    log ("info", "Checking if jsVortex is available on this system");

    if (typeof(VortexEngine) == undefined || VortexEngine == null) {
	log ("error", "jsVortex installation not available");
	return false;
    }

    /* engine available */
    this.nextTest ();
    return true;
};

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

    /* drop an ok message to signal test ok */
    if (this.nextTestId != -1) {
	log ("ok", "TEST-" + this.nextTestId + " : OK");
    }

    while (true) {
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

	/* check if the test is available */
	if (! this.tests[this.nextTestId].runIt) {
	    /* skip test */
	    continue;
	}

	/* call next test */
	console.log ("INFO: running test-" + this.nextTestId);
	log ("info", "Running TEST-" + this.nextTestId + ": " + this.tests[this.nextTestId].name);
	this.tests[this.nextTestId].testHandler.apply (this);
	return;
    } /* end while */
};

/* list of regression test available with its
 * associated test to show */
RegressionTest.prototype.tests = [
    {name: "Check if jsVortex is available", testHandler: testjsVortexAvailable},
    {name: "Library infraestructure check", testHandler: testIntraestructure},
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

    /* clear log */
    dojo.byId ("log-panel").innerHTML = "";

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

/**
 * @internal Function called when a test check box is clicked.
 */
function testClicked (event) {
    var status = event.currentTarget.checked;
    var id     = event.currentTarget.id;
    var tests  = RegressionTest.prototype.tests;
    for (position in tests) {
	if (tests[position].name == id) {
	    /* flag the test to be runned or not */
	    tests[position].runIt = status;
	    break;
	} /* end if */
    }
}

function prepareTest () {
    /* connect clicked signal */
    dojo.connect (dojo.byId("run-test"), "click", runTest);
    dojo.connect (dojo.byId ("clear-log"), "click", clearLog);

    /* configure default connection values */
    dojo.byId ("host").value = "localhost";

    /* configure default connection port value */
    dojo.byId ("port").value = "44010";

    /* fill all tests available */
    var tests              = RegressionTest.prototype.tests;
    var testAvailablePanel = dijit.byId("test-available-panel");
    var checkBox;
    for (test in tests) {
	console.log ("Test available: " + tests[test].name);

	/* flag the test to be runned */
	tests[test].runIt = true;

	/* create check box */
	checkBox = new dijit.form.CheckBox (
	    {id: tests[test].name,
	     checked: true,
	     position: test});
	/* configure onClick handler */
	checkBox.onClick = testClicked;

	/* add to the panel */
	dojo.place(checkBox.domNode, testAvailablePanel.domNode);

	/* create the label to be associated to the checkBox */
	var label = document.createElement ("label");
	label.for = tests[test].name;
	label.innerHTML = "TEST-" + test + ": " + tests[test].name;

	/* add to the panel */
	dojo.place (label, testAvailablePanel.domNode);

	/* add to the panel a line break */
	dojo.place (document.createElement ("br"), testAvailablePanel.domNode);

    }
}

/* register our function in dojo */
dojo.addOnLoad (prepareTest);





