/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @internal ANONYMOUS support for VortexSASLEngine.
 * This class is not directly used by the API consumer.
 * Check \ref VortexSASLEngine.
 */
var VortexSASL_ANONYMOUS = {
    /**
     * SASL profile unique name identifying the mechanism.
     */
    name: "ANONYMOUS",
    /**
     * SASL profile check input function. This method is used by the SASL
     * profile to check its user input date requirements to successful
     * complete the SASL process.
     */
    checkInput: function (saslEngine) {
	/* check authentication and password */
	if (! VortexEngine.checkReference (saslEngine, "anonymousToken"))
	    return false;
	return true;
    },
    /**
     * Method called to allow the mechanism to produce the
     * initial blob to be sent to the server.
     */
    initMech: function (saslEngine) {
	/* produce initial SASL BLOB */
	saslEngine.blob = VortexBase64.encode (saslEngine.anonymousToken);
	return true;
    },
    /**
     * This method is executed to complete or continue with the
     * authentication process. In the case of PLAIN profile,
     * the function only check for empty input. This function
     * is also in charge of updated the saslEngine to signal
     * that it is authenticated.
     */
    nextStep: function (blob, saslEngine) {
	if ((typeof blob != undefined)) {
	    /* flag status as is */
	    saslEngine.status = true;
	    saslEngine.status = "Authentication OK";
	    return true;
	} /* end if */
	/* no more content is expected to be exchanged */
	return false;
    },
    /**
     * This method is called to request the mechanism to fill
     * the item object with the credentials that were used to
     * authenticated this SASL session. This is later used by
     * the application layer to check is auth status (for example
     * show the login in the top of the page).
     */
    configureCredentials: function (saslEngine, item) {
	/* update connection credentials */
	item.isAuthenticated       = true;
	item.anonymousToken        = saslEngine.anonymousToken;
	Vortex.log ("VortexSASL_ANONYMOUS.configureCredentials: storing user credentials: " + item.anonymousToken);
	return true;
    }
};