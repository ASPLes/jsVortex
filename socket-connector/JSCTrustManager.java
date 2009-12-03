/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.security.*;
import java.security.cert.*;
import netscape.javascript.*;
import javax.net.ssl.*;

public class JSCTrustManager implements X509TrustManager {
	public JSObject            caller;
	public TrustManagerFactory trustManagerFactory;
	/** 
	 * @brief Allows to configure trust policy in the case
	 * certifica is wrong. Valid values for this trustPolicy are:
	 *
	 * 1 : Only accept valid certificates that passes chain test.
	 * 2 : In the case of certificate error, ask caller to accept or not the certificate.
	 * 3 : In the case of certificate error, accept certificate.
	 */
	public int                 trustPolicy;
	
	public JSCTrustManager () {
		/* initialize default trust policy (only accept valid
		 * certificates). */
		trustPolicy = 1;
	}

	public X509Certificate[] getAcceptedIssuers() {
		throw new UnsupportedOperationException();
	}
	
	public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		throw new UnsupportedOperationException();
	}
	
	public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
		for (X509Certificate cert : chain) {
			LogHandling.info (caller, "Received notification to accept or not server certificate");
			try {
				/* get X509 manager */
				X509TrustManager manager = (X509TrustManager) trustManagerFactory.getTrustManagers()[0];

				/* do chain certificate validation */
				manager.checkServerTrusted (chain, authType);

				LogHandling.info (caller, "Certificate status: OK");
			} catch (Exception ex) {
				LogHandling.error (caller, "Certificate status: WRONG (" + ex.getMessage () + "), Trust Policy: " + trustPolicy);
				switch (trustPolicy) {
				case 1:
					/* rethrow certificate error */
					throw new CertificateException ("Server certificate validation failed and trust policy only accepts valid certificates", ex);
				case 2:
					/* ask user to accept or not certificate. */
					Object [] args = {cert.getSubjectDN (), cert.getIssuerDN (), cert.toString ()};
					Boolean result  = (Boolean) caller.call ("oncerterror", args);
					if (! result.booleanValue ())
						throw new CertificateException ("Server certificate validation failed and user has denied accepting it", ex);
					break;
				case 3:
					break;
				} /* end switch */
			}
			return; 
		}
			
		return; /* no exception */
	}
}

