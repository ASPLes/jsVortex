/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class SendCommand implements Command {
	/** 
	 * @brief Reference to the content to be sent.
	 */
	public String content;
	/** 
	 * @brief Reference to the content length.
	 */
	public int length;

	/** 
	 * @brief Reference to the output buffer.
	 */
	public PrintWriter output;

	/** 
	 * @brief Reference to the caller javascript object where the
	 * onopen method is defined.
	 */
	public JSObject caller;

	/*** the following public members are initialized by the
	 *** command doOperation() 
	 ***/

	/** 
	 * @brief Implements the socket connect operation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser) {
		try{
			/* try to send content */
			output.write (content, 0, length);
			output.flush ();
		} catch (Exception ex) {
			LogHandling.error (caller, "Failed to send content, error found was: " + ex.getMessage());
			return false;
		}
		LogHandling.info (caller, "Sent content without problem..");
		return true;
	}
}