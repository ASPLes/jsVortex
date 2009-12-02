/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.security.*;
import java.security.cert.*;
import netscape.javascript.*;
import javax.net.ssl.*;

public class JSCTrustManager implements X509TrustManager {
	public JSObject caller;

	public X509Certificate[] getAcceptedIssuers() {
		throw new UnsupportedOperationException();
	}
	
	public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		throw new UnsupportedOperationException();
	}
	
	public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		for (X509Certificate cert : chain) {
			LogHandling.info (caller, "Received notification to accept or not server certificate");
			LogHandling.info (caller, "Certificate: " + cert.toString ());
			LogHandling.info (caller, "Certificate subject: " + cert.getSubjectDN());
			LogHandling.info (caller, "Certificate issuer: " + cert.getIssuerDN());
			LogHandling.info (caller, "Certificate principals: " + cert.getSubjectX500Principal().getName ());
			try {
				cert.checkValidity ();
				LogHandling.info (caller, "Certificate status: OK");
			} catch (Exception ex) {
				LogHandling.info (caller, "Certificate status: WRONG (" + ex.getMessage () + ")");
			}
		}
			
		return; /* no exception */
	}
}