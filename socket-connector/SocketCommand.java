/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import netscape.javascript.*;

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

	/**
	 * @brief Where the resulting socket is left.
	 */
	public Socket result;

	/** 
	 * @brief Output stream.
	 */
	public PrintWriter out;

	/** 
	 * @brief Input stream.
	 */
	public BufferedReader in;

	/** 
	 * @brief Implements the socket connect operation.
	 *
	 * @param browser The reference to the browser.
	 */
	public bool doOperation (JSObject browser) {
		try {
			/* do connect operation */
			socket = new Socket(host, port);
			out    = new PrintWriter(socket.getOutputStream(), true);

			/* create the listener */
			SocketListener listener = new SocketListener(socket, this);
			in     = listener.in;
			listener.start();

			/* notify here connection created */

		} catch (Exception ex) {
			error ("Could not connect to "+url+" on port "+p+"\n"+ex.getMessage());
			return false;
		}

		return true;
	}
}