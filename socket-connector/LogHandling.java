/**
 ** Copyright (C) 2020 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import netscape.javascript.*;

public class LogHandling {
	/**
	 * @brief Do an info log notification on the callers onlog
	 * method.
	 *
	 * @param caller The caller JavaScript object. 
	 * @param message The message being notified.
	 */
	public static void info (SocketState state, String message) {
		/* do a call operation */

		/* caller.call ("onlog", args); */
		String cmd = "JavaSocketConnector.call (" + state.conn_id + ", 'onlog', 'info', \"" + state.b64Encode (message) + "\");";
		/* System.out.println ("INFO: evaluating: " + cmd);
		   System.out.println ("INFO: connection id: " + state.conn_id);
		   System.out.println ("INFO: " + message); */
		state.browser.eval (cmd);
		return;
	}

	/**
	 * @brief Do an error log notification on the callers onlog
	 * method.
	 *
	 * @param caller The caller JavaScript object. 
	 * @param message The message being notified.
	 */
	public static void error (SocketState state, String message) {
		/* do a call operation */
		/* caller.call ("onlog", args); */
		state.browser.eval ("JavaSocketConnector.call (" + state.conn_id + ", 'onlog', 'error', \"" + state.b64Encode (message) + "\");");
		/* System.out.println ("ERROR: " + message); */
		return;
	}

	/**
	 * @brief Do an warn log notification on the callers onlog
	 * method.
	 *
	 * @param caller The caller JavaScript object. 
	 * @param message The message being notified.
	 */
	public static void warn (SocketState state, String message) {
		/* do a call operation */
		/* caller.call ("onlog", args); */
		state.browser.eval ("JavaSocketConnector.call (" + state.conn_id + ", 'onlog', 'warn', \"" + state.b64Encode (message) + "\");");
		/* System.out.println ("WARN: " + message); */
		return;
	}
}