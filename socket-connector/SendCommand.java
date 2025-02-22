/**
 ** Copyright (C) 2025 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class SendCommand implements Command {
	/** 
	 * @brief Reference to the content to be sent.
	 */
	public byte [] content;
	/** 
	 * @brief Reference to the content length.
	 */
	public int length;

	/** 
	 * @brief Reference to the output buffer.
	 */
	public OutputStream output;

	/** 
	 * @brief Reference socket where the send operation is taking place.
	 */
	SocketState state;

	/*** the following public members are initialized by the
	 *** command doOperation() 
	 ***/

	/** 
	 * @brief Implements the socket connect operation.
	 *
	 * @param browser The reference to the browser.
	 */
	public boolean doOperation (JSObject browser, JavaSocketConnector dispacher) {
		try{
			/* try to send content */
			output.write (content, 0, length);
			output.flush ();
		} catch (Exception ex) {
			LogHandling.error (state, "Failed to send content, error found was: " + ex.getMessage());
			return false;
		}
		/* LogHandling.info (caller, "Sent content without problem.."); */
		return true;
	}
}