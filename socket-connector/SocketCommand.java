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
	public SocketState state;

	/** 
	 * @brief Implements the socket connect operation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser, JavaSocketConnector dispacher) {
		try {
			/* do connect operation */
			state.socket = new Socket (host, port);
			state.out    = state.socket.getOutputStream();
			/* new PrintWriter (state.socket.getOutputStream(), true); */

			LogHandling.info (caller, "Starting listener.."); 

			/* create the listener */
			state.listener = new SocketListener (state.socket, caller, dispacher);

			/* change state to OPENED = 1 */
			caller.setMember ("readyState", 1);

			/* start the listener at the end to avoid
			 * onmessage to be fired before onopen */
			state.listener.start();

		} catch (Exception ex) {
			LogHandling.error (caller, "Unable to connect to " + host + " on port: " + port + "\n" + ex.getMessage()); 

			/* readyState = CLOSED */
			caller.setMember ("readyState", 2);

			/* notify onopen event */
			dispacher.notify (caller, "onopen", null);

			return false;
		}

		return true;
	}
}