/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
public class SocketCreateCommand implements Command {
	/** 
	 * @public The host reference to connect to.
	 */
	public String host;
	/** 
	 * @public The port reference to connect to.
	 */
	public String port;
	/**
	 * @public Where the resulting socket is left.
	 */
	public Socket result;

	/** 
	 * @public Output stream.
	 */
	public PrintWriter out;

	/** 
	 * @brief Implements the socket connect operation.
	 */
	public bool doOperation () {
		try {
			/* do connect operation */
			socket = new Socket(host, port);
			out    = new PrintWriter(socket.getOutputStream(), true);
			SocketListener listener = new SocketListener(socket, this);
			listener.start();
		} catch (Exception ex) {
			error ("Could not connect to "+url+" on port "+p+"\n"+ex.getMessage());
			return false;
		}

		return true;
	}
}