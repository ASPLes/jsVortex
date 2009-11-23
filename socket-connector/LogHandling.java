/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
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
	public static void info (JSObject caller, String message) {
		Object [] args = {"info", message};
		/* do a call operation */
		caller.call ("onlog", args);
		return;
	}

	/**
	 * @brief Do an error log notification on the callers onlog
	 * method.
	 *
	 * @param caller The caller JavaScript object. 
	 * @param message The message being notified.
	 */
	public static void error (JSObject caller, String message) {
		Object [] args = {"error", message};
		/* do a call operation */
		caller.call ("onlog", args);
		return;
	}

	/**
	 * @brief Do an warn log notification on the callers onlog
	 * method.
	 *
	 * @param caller The caller JavaScript object. 
	 * @param message The message being notified.
	 */
	public static void warn (JSObject caller, String message) {
		Object [] args = {"warn", message};
		/* do a call operation */
		caller.call ("onlog", args);
		return;
	}
}