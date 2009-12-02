/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.security.*;
import java.security.cert.*;
import netscape.javascript.*;
import javax.net.ssl.*;

public class JSCTrustManager implements X509TrustManager {
	JSObject caller;
	public JSCTrustManager (JSObject _caller) {
		caller = _caller;
	}
	
	public X509Certificate[] getAcceptedIssuers() {
		throw new UnsupportedOperationException();
	}
	
	public void checkClientTrusted(X509Certificate[] chain, String authType)
		throws CertificateException {
		throw new UnsupportedOperationException();
	}
	
	public void checkServerTrusted(X509Certificate[] chain, String authType)
		throws CertificateException {
		LogHandling.info (caller, "Received notification to accept or not server certificate");
		return; /* no exception */
	}
}