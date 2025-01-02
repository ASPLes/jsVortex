/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.io.*;
import java.net.*;
import netscape.javascript.*;

// Thread that listens for input
public class SocketListener extends Thread {

	public Socket            socket;		
	public String            encoding;
	public InputStream       in;       
	public boolean           disableOnOpenNotify;

	boolean                  running = false;	
	SocketState              state;
	JavaSocketConnector      dispacher;
	Thread                   listenerThread;

	/** 
	 * @brief Creates a socket listener that reads content from
	 * the socket and notifies content read into the callers
	 * onmessage method.
	 */ 
	public SocketListener (Socket _socket, SocketState _state, JavaSocketConnector _dispacher, String _encoding) throws IOException{
		/* get references */
		socket    = _socket;
		state     = _state;
		dispacher = _dispacher;
		encoding  = _encoding;

		/* create input buffer */
		in = socket.getInputStream();

		/* set default state */
		disableOnOpenNotify = false;
	}

	/** 
	 * @brief Terminates the execution of the socket listener
	 * instance.
	 */
	public void close () {
		LogHandling.info (state, "SocketListener.close: finishing socket listener instance..");
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

	public void stopListener () {
		try {
			/* set to terminate */
			running = false;

			/* stop listener thread */
			listenerThread.interrupt ();

			/* wait for the thread to stop */
			listenerThread.join ();

		} catch (Exception ex) {
			LogHandling.error (state, "SocketListener.stopListener: Failed to stop listener, error found was: " + ex.getMessage ());
		}
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

		/* set lowest priority */
		listenerThread = Thread.currentThread ();
		listenerThread.setPriority (Thread.MIN_PRIORITY);

		/* notify here connection created */
		if (! disableOnOpenNotify)
			dispacher.notify (state, "onopen", null);

		/* configure default timeout: 20ms */
		try {socket.setSoTimeout (20);} catch (Exception ex) {}

		while (running) {
			try{
				/* read from the inputstream */
				size = in.read (buffer, 0, buffer.length);

				if (size == 0 || size == -1) {

					LogHandling.info (state, "SocketListener.run: Calling to close socket listener because it was received empty content..");
					close();

					/* fire onclose event */
					dispacher.notify (state, "onclose", null);

					return;
				}

				/* notify content found */
				str = new String (buffer, 0, size, encoding);
				dispacher.notify (state, "onmessage", str);
			} catch (SocketTimeoutException ex) {
				if (! running) /* check to terminate listener */
					return;
				/* timeout, continue */
				continue;
			} catch (Exception ex) {

				/* check that we are stopping the listener */
				if (! running)
					return;
				LogHandling.error (state, "SocketListener.run: Error found while reading content from socket, error was: " + ex.getMessage());
				close ();

				/* fire onclose event */
				dispacher.notify (state, "onclose", null);

				return;
			}
		}
		close();
		return;
	}
}