/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class SocketCommand implements Command {
	/** 
	 * @brief The host reference to connect to.
	 */
	public String host;
	/** 
	 * @brief The port reference to connect to.
	 */
	public int port;

	/** 
	 * @brief Reference to the caller javascript object where the
	 * onopen method is defined.
	 */
	public JSObject caller;

	/*** the following public members are initialized by the
	 *** command doOperation() 
	 ***/

	/**
	 * @brief Where the resulting socket is left.
	 */
	public Socket socket;

	/** 
	 * @brief Output stream.
	 */
	public PrintWriter out;

	/** 
	 * @brief Implements the socket connect operation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser) {
		try {
			LogHandling.info (caller, "Creating socket connection.."); 

			/* do connect operation */
			socket = new Socket (host, port);
			out    = new PrintWriter (socket.getOutputStream(), true);

			LogHandling.info (caller, "Starting listener.."); 

			/* create the listener */
			SocketListener listener = new SocketListener (socket, caller);

			/* record the socket listener */
			caller.setMember ("_jsc_listener", listener);

			/* configure socket, out and in references into the caller socket */
			caller.setMember ("_jsc_socket", socket);
			caller.setMember ("_jsc_out", out);
			caller.setMember ("_jsc_in", listener.in);

			/* change state to OPENED = 1 */
			caller.setMember ("readyState", 1);

			/* notify here connection created */
			caller.call ("onopen", null);

			/* start the listener at the end to avoid
			 * onmessage to be fired before onopen */
			listener.start();

		} catch (Exception ex) {
			LogHandling.error (caller, "Could not connect to " + host + " on port: " + port + "\n" + ex.getMessage()); 
			return false;
		}

		return true;
	}
}