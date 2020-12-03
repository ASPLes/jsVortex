/**
 ** Copyright (C) 2020 Advanced Software Production Line, S.L.
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

	/** 
	 * @brief This is the encoding to be used on this connection.
	 */
	public String encoding;

	/** 
	 * @brief The connection id this socket state is bound to.
	 */
	public String conn_id;

	/** 
	 * @brief Reference to the browser..
	 */
	public JSObject browser;

	/** 
	 * @brief Allows to get the value of a member for the provided
	 * connection.
	 *
	 * @param member The member to be configured.
	 */
	public Object getMember (String member) {
		return browser.eval ("JavaSocketConnector.getMember (" + conn_id + ", '" + member + "');");
	}
	
	/** 
	 * @brief Allows to set the member associated to the provided
	 * connection.
	 *
	 * @param member The member to be configured.
	 *
	 * @aram value The value to be configured.
	 */
	public void setMember (String member, Object value) {
		/* LogHandling.info (this, "Setting member '" + member + "' with value '" + value.toString () + "'"); */
		if (value instanceof String)
			browser.eval ("JavaSocketConnector.setMember (" + conn_id + ", '" + member + "', '" + value + "');");
		else
			browser.eval ("JavaSocketConnector.setMember (" + conn_id + ", '" + member + "', " + value.toString () + ");");
		return;
	}

	/** 
	 * @brief Allows to encode the provide value using current connection encoding..
	 *
	 * @param value The value to encode.
	 *
	 * @return The string  encoded.
	 */
	public String b64Encode (String value) {
		return Base64Coder.encodeString (value, encoding);
	}
}