/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import netscape.javascript.*;
import java.net.*;
import java.io.*;

public class SocketState {
	/** 
	 * @brief Reference to the output stream.
	 */
	public OutputStream out;

	/** 
	 * @brief Reference to the socket listener.
	 */
	public SocketListener listener;

	/** 
	 * @brief Reference to the socket object.
	 */
	public Socket socket;
}