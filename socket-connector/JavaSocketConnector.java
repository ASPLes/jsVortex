/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.applet.*;
import javax.swing.*;
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class JavaSocketConnector extends JApplet {

	/* A reference to the current browser (tab) opening the
	 * component */
	JSObject browser = null;		// The browser
	Socket socket = null;			// The current socket
	PrintWriter out = null;			// Output
	SocketListener listener = null;		// Listens for input
	boolean running = false;		// Am I still running?
	String address = null;			// Where you will connect to
	int port = -1;					// Port
	boolean connectionDone = false;	// Thread synchronization

	BlockingQueue commandQueue = null;

	/**
	 * Public initialization. Get a reference to the browser
	 * initializing the applet.
	 */
	public void init() {
		/* reference to the browser */
		browser = JSObject.getWindow (this);
		return;
	}

	// Stop and destroy
	public void stop(){
		running = false;
		disconnect();
	}
	public void destroy(){
		running = false;
		disconnect();
	}

	/** 
	 * @brief Main loop that waits for commands to be implemented
	 * under this thread because it has permission.
	 */
	public void start () {
		/* Notify the browser that the component was
		 * loaded. */
		browser.call("java_socket_bridge_ready", null);

		/* create commandQueue */
		commandQueue = new BlockingQueue ();

		running = true;
		Command cmd = null;
		while(running){
			try {
				/* Wait for the next operation requested */
				cmd = (Command) commandQueue.pop ();
			} catch (Exception ex) {
				/* do some log error here */
				continue;
			} /* end try */

			/* call to complete command */
			cmd.doOperation (browser);
		}  /* end while */
		return;
	}

	/** 
	 * @brief Socket connect to the host and port provided. Once
	 * the connection is created, it is notified on the provided
	 * handler.
	 * 
	 * @param host The host to connect to.
	 * @param port The port to connect to.
	 */
	public boolean connect (String host, int port, JSObject caller) {

		/* create the socket command */
		SocketCommand cmd = new SocketCommand ();
		cmd.host   = host;
		cmd.port   = port;
		cmd.caller = caller;

		/* do some logging */
		LogHandling.info (caller, "Received request to connect to: " + host + ":" + port);

		/* queue the command */
		commandQueue.push (cmd);
		
		return true;
	}

	/** 
	 * @brief Allows to send the provided string over the provided
	 * out stream (associated to a particular socket).
	 *
	 * @param content The content to be sent.
	 * @param out The output stream object to write on.
	 */
	public boolean send (String content, PrintWriter output, JSObject caller){
		try{
			/* try to send content */
			output.write (content);
			output.flush ();
		} catch (Exception ex) {
			LogHandling.error (caller, "Failed to send content, error found was: " + ex.getMessage());
			return false;
		}
		LogHandling.info (caller, "Sent content without problem..");
		return true;
	}


	/**** NO LONGER REQUIRED ****/
	// Disconnect
	public boolean disconnect(){
		if(socket != null){
			try{
				log("Java Socket Bridge DISCONNECTED: "+getUrl());
				listener.close();
				out.close();
				socket = null;
				address = null;
				port = -1;
				return true;
			}
			catch(Exception ex){
				error("An error occured while closing the socket\n"+ex.getMessage());
				socket = null;
				return false;
			}
		}
		return false;
	}

	// Get input from the socket
	public void hear(String message){
		Object[] arguments = new Object[1];
		arguments[0] = message;
		browser.call("on_socket_get", arguments);
		log("Java Socket Bridge RECEIVED: "+message);
	}

	// Report an error
	public void error (String message){
		message = "Java Socket Connector ERROR: " + message;
		log(message);
		Object[] arguments = new Object[1];
		arguments[0] = message;

		/* nullify arguments to stop */
		address = null;
		port    = -1;

		browser.call("on_socket_error", arguments);
	}

	// Log something
	public void log(String message){
		System.out.println(message);
	}

	// Get the connected URL
	private String getUrl(){
		if(socket == null) return null;
		return socket.getInetAddress().getHostName() +":"+socket.getPort();
	}
} /* end JavaSocketConnector */
