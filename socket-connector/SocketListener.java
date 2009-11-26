/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.io.*;
import java.net.*;
import netscape.javascript.*;

// Thread that listens for input
public class SocketListener extends Thread {

	public Socket            socket;		
	public InputStream       in;       
	boolean                  running = false;	
	JSObject                 caller;

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
		in = socket.getInputStream();
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
		byte[] buffer = new byte[8192];
		int    size;

		/* notify here connection created */
		caller.call ("onopen", null);

		while (running) {
			try{
				size = in.read (buffer, 0, buffer.length);
				if (size == 0 || size == -1) {
					LogHandling.info (caller, "Calling to close socket listener because it was received empty content..");
					close();

					/* fire onclose event */
					caller.call ("onclose", null);

					return;
				}

				/* notify content found */
				str = new String (buffer, 0, size);
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