/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a new SASL engine using the initial data provided in
 * the params object.
 *
 * @param params This object contains the initial data required to
 * produce the client blob. This object is expected to contain the
 * following data:
 *
 * - mech : [string] The SASL mechanism to use for this engine instance.
 *
 * - authorizationId : [string] (Optional) authorization string.
 *
 * - authenticationId : [string] The actual credential identity.
 *
 * - password : [string] (Optional) Password associated to the the authentication user.
 *
 */
function VortexSASLEngine (params) {
    /* record initial data provided */
    this.mech             = params.mech;
    this.authenticationId = params.authenticationId;
    this.authorizationId  = params.authorizationId;
    this.password         = params.password;

    /* current internal status */
    this.blob             = null;
    this.status           = false;
    this.statusMsg        = null;
};

/**
 * @brief Initialize SASL engine with the current data.
 *
 * @return true if the initialization was ok. After proper
 * initialization, the caller must access to blob parameter and send
 * it to the server. The function return false if an initialization
 * error is found. Check statusMsg parameter to see the error.
 *
 */
VortexSASLEngine.prototype.clientInit = function () {
    /* check supported mechanism */
    if (this.mech != 'PLAIN') {
	this.statusMsg = "Unsupported SASL mechanism, failed to continue: " + this.mech;
	return false;
    }

    if (this.mech == 'PLAIN') {
	/* check authentication and password */
	if (! VortexEngine.checkReference (this.authenticationId))
	    return false;
	if (! VortexEngine.checkReference (this.password))
	    return false;

	/* derive authorizationId from authenticationId in the case it is
	 not defined */
	if (this.authorizationId == null || this.authorizationId == undefined)
	    this.authorizationId = this.authenticationId;

	/* produce initial SASL BLOB */
	this.blob = VortexBase64.encode (this.authorizationId + '\0' + this.authenticationId + '\0' + this.password);
	return true;
    } /* end if */

    return false;
};

/**
 * Base64 encode / decode functions taken from:
 * http://www.webtoolkit.info/
 **/
var VortexBase64 = {
    /* private property */
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* public method for encoding */
    encode : function (input) {
	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;

	input = VortexBase64._utf8_encode(input);

	while (i < input.length) {

	    chr1 = input.charCodeAt(i++);
	    chr2 = input.charCodeAt(i++);
	    chr3 = input.charCodeAt(i++);

	    enc1 = chr1 >> 2;
	    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	    enc4 = chr3 & 63;

	    if (isNaN(chr2)) {
		enc3 = enc4 = 64;
	    } else if (isNaN(chr3)) {
		enc4 = 64;
	    }

	    output = output +
	    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	} /* end while */

	return output;
    }, /* encode */

    /* public method for decoding */
    decode : function (input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	while (i < input.length) {

	    enc1 = this._keyStr.indexOf(input.charAt(i++));
	    enc2 = this._keyStr.indexOf(input.charAt(i++));
	    enc3 = this._keyStr.indexOf(input.charAt(i++));
	    enc4 = this._keyStr.indexOf(input.charAt(i++));

	    chr1 = (enc1 << 2) | (enc2 >> 4);
	    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	    chr3 = ((enc3 & 3) << 6) | enc4;

	    output = output + String.fromCharCode(chr1);

	    if (enc3 != 64) {
		output = output + String.fromCharCode(chr2);
	    }
	    if (enc4 != 64) {
		output = output + String.fromCharCode(chr3);
	    }
	} /* end while */

	output = VortexBase64._utf8_decode(output);

	return output;

    }, /* end decode */

    /* private method for UTF-8 encoding */
    _utf8_encode : function (string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {
	    var c = string.charCodeAt(n);

	    if (c < 128) {
		utftext += String.fromCharCode(c);
	    } else if((c > 127) && (c < 2048)) {
		utftext += String.fromCharCode((c >> 6) | 192);
		utftext += String.fromCharCode((c & 63) | 128);
	    } else {
		utftext += String.fromCharCode((c >> 12) | 224);
		utftext += String.fromCharCode(((c >> 6) & 63) | 128);
		utftext += String.fromCharCode((c & 63) | 128);
	    }
	}

	return utftext;
    }, /* end _utf8_encode */

    /* private method for UTF-8 decoding */
    _utf8_decode : function (utftext) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;

	while ( i < utftext.length ) {
	    c = utftext.charCodeAt(i);

	    if (c < 128) {
		string += String.fromCharCode(c);
		i++;
	    } else if((c > 191) && (c < 224)) {
		c2 = utftext.charCodeAt(i+1);
		string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
		i += 2;
	    } else {
		c2 = utftext.charCodeAt(i+1);
		c3 = utftext.charCodeAt(i+2);
		string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
		i += 3;
	    }
	} /* end while */

	return string;
    } /* end _utf8_decode */
};