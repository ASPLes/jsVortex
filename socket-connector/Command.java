/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import netscape.javascript.*;

interface Command {
	/** 
	 * @brief Public interface that allows JavaSocketConnector
	 * class to implement several commands in the priviledge
	 * thread.
	 */
	boolean doOperation (JSObject browser); 
}