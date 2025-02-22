/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.applet.*;
import javax.swing.*;
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class JavaSocketConnector extends JApplet implements Runnable {

	/* A reference to the current browser (tab) opening the
	 * component */
	JSObject      browser      = null; /* browser */
	BlockingQueue commandQueue = null; /* command queue */

	/* list of callers that are inside the applet */
	Callers       callers      = null;
	boolean       running;

	/**
	 * Public initialization. Get a reference to the browser
	 * initializing the applet.
	 */
	public void init() {
		/* reference to the browser */
		browser = JSObject.getWindow (this);

		/* initialize callers */
		callers = new Callers ();

		return;
	}

	/** 
	 * @brief Stop the applet.
	 */
	public void stop () {
		running = false;
	}
	public void destroy () {
		stop ();
	}

	/** 
	 * @brief Main loop that waits for commands to be implemented
	 * under this thread because it has permission.
	 */
	public void start () {
		Thread th = new Thread (this);
		th.start();
	}

	public void run () {

		/* Notify the browser that the component was
		 * loaded. */
		JSObject member = (JSObject) browser.getMember ("JavaSocketConnector");
		member.setMember ("isReady", true);

		/* create commandQueue */
		commandQueue = new BlockingQueue ();

		running = true;
		Command cmd = null;

		/* set lowest priority */
		Thread.currentThread ().setPriority (Thread.MIN_PRIORITY);

		while (running){
			try {
				/* notify caller inside */
				synchronized (callers) {
					/* check if the caller list if
					 * empty (no javaScript thread
					 * is inside the applet) */
					if (callers.count > 0) 
						callers.wait ();
				} /* end if */
				/* give a try to other threads */
				Thread.yield ();

				/* Wait for the next operation requested */
				cmd = (Command) commandQueue.pop ();
			} catch (Exception ex) {
				/* do some log error here */
				continue;
			} /* end try */

			/* call to complete command */
			cmd.doOperation (browser, this);
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
	 * @param encoding The connection encoding..
	 * @param conn_id The connection id identifer of the caller object.
	 */
	public SocketState connect (String host, int port, String encoding, String conn_id) {

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* create the socket command */
		SocketState   state = new SocketState ();
		SocketCommand cmd   = new SocketCommand ();
		cmd.host        = host;
		cmd.port        = port;
		state.conn_id   = conn_id;
		state.encoding  = encoding;
		state.browser   = browser;
		/* System.out.println ("Received connection id: " + conn_id); */
		cmd.state     = state;

		/* queue the command */
		commandQueue.push (cmd);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}
		
		return state;
	}

	/** 
	 * @brief Allows to send the provided string over the provided
	 * out stream (associated to a particular socket).
	 *
	 * @param content The content to be sent.
	 * @param length The amount of data to be written.
	 * @param out The output stream object to write on.
	 */
	public boolean send (String content, int length, SocketState state){

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* queue a send operation */
		SendCommand sendCmd = new SendCommand ();
		try {
			sendCmd.content = content.getBytes (state.encoding);
		} catch (Exception ex) {
			LogHandling.error (state, "Unsupported enconding type: " + ex.getMessage()); 
			return false;
		}
		sendCmd.length  = sendCmd.content.length;
		sendCmd.output  = state.out;
		sendCmd.state   = state;

		/* queue command */
		commandQueue.push (sendCmd);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}

		return true;
	}

	/** 
	 * @brief Activates TLS support on the provided socket object
	 * (caller reference).
	 */
	public boolean enableTLS (SocketState state) {
		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* call to create command */
		EnableTLSCommand cmd = new EnableTLSCommand ();
		cmd.state            = state;

		commandQueue.push (cmd);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}

		return true;
	}

	/** 
	 * @brief Closes the socket by closing internal socket, output
	 * stream and input stream. The method also changes the
	 * readyState of the socket and fires the onclose event.
	 *
	 * @param caller The caller and at the same time the socket.
	 */
	public void close (SocketState state) {

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* close all items */
		state.listener.close ();
		try {state.out.close ();} catch (Exception ex) {}

		/* now change ready state */
		state.setMember ("readyState", 2); 

		/* fire onclose event */
		notify (state, "onclose", null);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}
		
		return;
	}

	public void notify (SocketState state, String handler, Object arg) {
		/* LogHandling.info (state, "Doing handler notification for: " + handler);   */

		/* call to notify */
		String cmd;
		if (arg == null) {
			cmd = "JavaSocketConnector.call (" + state.conn_id + ", '" + handler + "');";
		} else if (arg instanceof String) {
			/* encode string into base64 to support new lines */
			arg = state.b64Encode (arg.toString ());
			cmd = "JavaSocketConnector.call (" + state.conn_id + ", '" + handler + "', \"" + arg.toString () + "\");";
		} else {
			cmd = "JavaSocketConnector.call (" + state.conn_id + ", '" + handler + "', " + arg.toString () + ");";
		}

		/* LogHandling.info (state, "Calling to run: " + cmd);    */
		state.browser.eval (cmd);

		return;
	}

} /* end JavaSocketConnector */
