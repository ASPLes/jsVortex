/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class InvokeCommand implements Command {
	/** 
	 * @brief List of arguments.
	 */
	public Object [] args;

	/** 
	 * @brief Reference to the caller javascript object where the
	 * onopen method is defined.
	 */
	public JSObject caller;

	/** 
	 * @brief Implements browser notification.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser, JavaSocketConnector dispacher) {
		/* do call operation */
		caller.call ("_marshallCall", args);
		return true;
	}
}