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
	 */
	public boolean connect (String host, int port, JSObject caller) {

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* create the socket command */
		SocketCommand cmd = new SocketCommand ();
		cmd.host   = host;
		cmd.port   = port;
		cmd.caller = caller;

		/* queue the command */
		commandQueue.push (cmd);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}
		
		return true;
	}

	/** 
	 * @brief Allows to send the provided string over the provided
	 * out stream (associated to a particular socket).
	 *
	 * @param content The content to be sent.
	 * @param length The amount of data to be written.
	 * @param out The output stream object to write on.
	 */
	public boolean send (String content, int length, PrintWriter output, JSObject caller){

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* queue a send operation */
		SendCommand sendCmd = new SendCommand ();
		sendCmd.content = content;
		sendCmd.length  = length;
		sendCmd.output  = output;
		sendCmd.caller  = caller;

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
	public boolean enableTLS (JSObject caller) {
		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		/* call to create command */
		EnableTLSCommand cmd = new EnableTLSCommand ();
		cmd.caller           = caller;

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
	public void close (JSObject caller) {

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		PrintWriter    out      = (PrintWriter) caller.getMember ("_jsc_out");
		caller.removeMember ("_jsc_out");

		Socket         socket   = (Socket) caller.getMember ("_jsc_socket");
		caller.removeMember ("_jsc_socket");

		SocketListener listener = (SocketListener) caller.getMember ("_jsc_listener");
		caller.removeMember ("_jsc_listener");

		/* close all items */
		listener.close ();
		try {out.close ();} catch (Exception ex) {}

		/* now change ready state */
		caller.setMember ("readyState", 2);

		/* fire onclose event */
		notify (caller, "onclose", null);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}
		
		return;
	}

	public void notify (JSObject caller, String handler, Object arg) {
		/* LogHandling.info (caller, "Doing handler notification for: " + _handler);  */

		/* notify caller inside */
		synchronized (callers) {
			callers.count++;
		}

		InvokeCommand invokeCmd = new InvokeCommand ();
		invokeCmd.handler = handler;
		invokeCmd.caller  = caller;
		invokeCmd.arg     = arg;

		/* push command */
		commandQueue.push (invokeCmd);

		/* notify caller inside */
		synchronized (callers) {
			callers.count--;
			callers.notify ();
		}
	}

} /* end JavaSocketConnector */