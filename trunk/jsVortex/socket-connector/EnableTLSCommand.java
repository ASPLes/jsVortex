/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

/* tls support */
import java.security.*;
import java.security.cert.*;
import javax.net.ssl.*;

public class EnableTLSCommand implements Command {
	/** 
	 * @brief Reference to the caller javascript object where the
	 * onopen method is defined.
	 */
	public JSObject caller;

	/** 
	 * @brief Member pointing to socket state.
	 */
	public SocketState state;

	/** 
	 * @brief Implements socket TLS activation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser, JavaSocketConnector dispacher) {

		/* variables used */
		SocketListener listener = null;
		SSLSocket      sslsock  = null;
		
		LogHandling.info (caller, "JavaSocketConnector.EnableTLSCommand.doOperation: Starting TLS handshake..");
		
		try {
			/* terminate current listener */
			listener = state.listener;
			listener.stopListener ();

			/* get default factory */
			SSLContext          sslContext          = SSLContext.getInstance ("TLSv1");
			TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance (TrustManagerFactory.getDefaultAlgorithm ());
			trustManagerFactory.init ((KeyStore) null);

			/* create our custom trust manager */
			LogHandling.info (caller, "JavaSocketConnector.EnableTLSCommand.doOperation: Preparing trust manager....");
			JSCTrustManager jsctm     = new JSCTrustManager ();
			jsctm.caller              = caller;
			jsctm.trustManagerFactory = trustManagerFactory;

			/* get certificate trust policy */
			LogHandling.info (caller, "JavaSocketConnector.EnableTLSCommand.doOperation: getting certTrustPolicy configuration....");
			jsctm.trustPolicy = _getInteger (caller.getMember ("certTrustPolicy"));

			/* init ssl context */
			sslContext.init (null, new TrustManager [] {jsctm}, null);

			LogHandling.info (caller, "JavaSocketConnector.EnableTLSCommand.doOperation: Created trust manager.. ..");

			SSLSocketFactory    factory = (SSLSocketFactory) sslContext.getSocketFactory ();


			/* enable blocking the socket */
			Socket socket = state.socket;
			socket.setSoTimeout (0);

			sslsock = (SSLSocket) factory.createSocket(socket,
								   (String) caller.getMember ("host"),
								   _getInteger (caller.getMember ("port")),
								   /* autoClose, close this socket if the other socket is closed */
								   true);

			/* ensure we are using TLS */
			String [] enabledProtocols = { "TLSv1" };
			sslsock.setEnabledProtocols (enabledProtocols);

			/* update socket reference */
			state.socket = sslsock;
			state.out    = sslsock.getOutputStream();

			/* start handshake */
			sslsock.startHandshake();

		} catch (SSLException ex) {
			/* do nothing for now */
			LogHandling.error (caller, "Server certificate error, error was: " + ex.getMessage ());

			/* configure ready state: CLOSED */
			caller.setMember ("readyState", 2);
			dispacher.notify (caller, "ontls", false);
			return false;
		} catch (Exception ex) {
			LogHandling.error (caller, "JavaSocketConnector.EnableTLSCommand.doOperation: Failed to finish TLS handshake, error found was: " + ex.getMessage ());

			/* configure ready state: CLOSED */
			caller.setMember ("readyState", 2);
			dispacher.notify (caller, "ontls", false);
			return false;
		} /* end if */


		LogHandling.info (caller, "TLS handshake seems fine, now start a new listener to read incoming data");

		try {
			/* start listener */
			listener = new SocketListener ((Socket) sslsock, caller, dispacher, state.encoding);
			listener.disableOnOpenNotify = true;

			/* set new listener */
			state.listener = listener;

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

	int _getInteger (Object value) {
		if (value instanceof String)
			return Integer.parseInt ((String)value);
		if (value instanceof Integer)
			return (Integer) value;
		if (value instanceof Double)
			return ((Double) value).intValue ();
		return -1;
	}

}