/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.io.*;
import java.net.*;
import netscape.javascript.*;

// Thread that listens for input
public class SocketListener extends Thread {

	public Socket         socket;		
	public BufferedReader in;       
	boolean               running = false;	
	JSObject              caller;

	/** 
	 * @brief Creates a socket listener that reads content from
	 * the socket and notifies content read into the callers
	 * onmessage method.
	 */ 
	public SocketListener (Socket _socket, JSObject _caller) throws IOException{
		/* get references */
		socket = _socket;
		caller = _caller;

		/* create input buffer */
		in = new BufferedReader (new InputStreamReader (socket.getInputStream()));
	}

	/** 
	 * @brief Terminates the execution of the socket listener
	 * instance.
	 */
	public void close () {
		LogHandling.info (caller, "Finishing socket listener instance..");
		try {
			if(running == false) 
				return;
			running = false;
			/* close the socket */
			if (! socket.isClosed ())
				socket.close();
			in.close();
		} catch (Exception ex) {}
		return;
	}

	/** 
	 * @internal Loop that iterates reading content from the
	 * socket and notifying such content on the socket onmessage
	 * handler.
	 */
	public void run () {
		running = true;
		String str = null;
		while (running) {
			try{
				str = in.readLine();
				if (str == null) {
					LogHandling.info (caller, "Calling to close socket listener because it was received empty content..");
					close();
					return;
				}

				/* notify content found */
				Object args [] = {str};
				caller.call ("onmessage", args);
			} catch (Exception ex) {
				/* check that we are stopping the listener */
				if (! running)
					return;
				LogHandling.error (caller, "Error found while reading content from socket, error was: " + ex.getMessage());
				close ();

				/* fire onclose event */
				caller.call ("onclose", null);

				return;
			}
		}
		close();
		return;
	}
}