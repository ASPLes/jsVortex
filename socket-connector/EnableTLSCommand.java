/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

/* tls support */
import javax.net.ssl.*;

public class EnableTLSCommand implements Command {
	/** 
	 * @brief Reference to the caller javascript object where the
	 * onopen method is defined.
	 */
	public JSObject caller;

	/** 
	 * @brief Implements socket TLS activation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser, JavaSocketConnector dispacher) {

		/* variables used */
		SocketListener listener = null;
		SSLSocket      sslsock  = null;
		
		LogHandling.info (caller, "Starting TLS handshake..");
		
		try {
			/* terminate current listener */
			listener = (SocketListener) caller.getMember ("_jsc_listener");
			listener.stopListener ();

			/* get default factory */
			SSLContext          sslContext          = SSLContext.getInstance ("TLSv1");
			TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance (TrustManagerFactory.getDefaultAlgorithm ());

			LogHandling.info (caller, "Preparing trust manager.. ..");
			JSCTrustManager jsctm = new JSCTrustManager (caller);
			sslContext.init (null, new TrustManager [] {jsctm}, null);

			LogHandling.info (caller, "Created trust manager.. ..");

			SSLSocketFactory    factory = (SSLSocketFactory) sslContext.getSocketFactory ();


			/* enable blocking the socket */
			Socket socket = (Socket) caller.getMember ("_jsc_socket");
			socket.setSoTimeout (0);

			sslsock = (SSLSocket) factory.createSocket(socket,
								   (String) caller.getMember ("host"),
								   _getPort (caller.getMember ("port")),
								   /* autoClose, close this socket if the other socket is closed */
								   true);

			/* ensure we are using TLS */
			String [] enabledProtocols = { "TLSv1" };
			sslsock.setEnabledProtocols (enabledProtocols);

			/* update socket reference */
			caller.setMember ("_jsc_socket", sslsock);
			PrintWriter out = new PrintWriter (sslsock.getOutputStream(), true);
			caller.setMember ("_jsc_out", out);

			/* start handshake */
			sslsock.startHandshake();

		} catch (SSLException ex) {
			/* configure ready state: CLOSED */
			caller.setMember ("readyState", 2);
			dispacher.notify (caller, "ontls", false);

			/* do nothing for now */
			LogHandling.error (caller, "Server certificate error, error was: " + ex.getMessage ());
			return false;
		} catch (Exception ex) {
			/* configure ready state: CLOSED */
			caller.setMember ("readyState", 2);
			dispacher.notify (caller, "ontls", false);
			LogHandling.error (caller, "Failed to finish TLS handshake, error found was: " + ex.getMessage ());
			return false;
		} /* end if */


		LogHandling.info (caller, "TLS handshake seems fine, now start a new listener to read incoming data");

		try {
			/* start listener */
			listener = new SocketListener ((Socket) sslsock, caller, dispacher);
			listener.disableOnOpenNotify = true;

			/* set new listener */
			caller.setMember ("_jsc_listener", listener);

			/* now input stream */
			caller.setMember ("_jsc_in", listener.in);

			/* start listener */
			listener.start ();
		} catch (Exception ex) {
			/* configure ready state: CLOSED */
			caller.setMember ("readyState", 2);
			dispacher.notify (caller, "ontls", false);
			LogHandling.error (caller, "TLS handshake process failure, failed to start socket listener after handshake");
			return false;
		}

		LogHandling.info (caller, "TLS handshare OK, notify user");
		
		/* notify tls status ok*/
		dispacher.notify (caller, "ontls", true);
		return true;
	}

	int _getPort (Object value) {
		if (value instanceof String)
			return Integer.parseInt ((String)value);
		if (value instanceof Integer)
			return (Integer) value;
		return -1;
	}

}