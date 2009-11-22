/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

import java.io.*;
import java.net.*;

// Thread that listens for input
public class SocketListener extends Thread{

	// Instance variables
	JavaSocketConnector parent;	// Report to this object
	Socket socket;				// Listen to this socket
	BufferedReader in;			// Input
	boolean running = false;	// Am I still running?

	// Constructor
	public SocketListener (Socket s, JavaSocketConnector b) throws IOException{
		parent = b;
		socket = s;
		in = new BufferedReader(new InputStreamReader(s.getInputStream()));
	}

	// Close
	public void close() throws IOException{
		if(running == false) return;
		running = false;
		socket.close();
		in.close();
	}

	// Main loop
	public void run(){
		running = true;
		String str = null;
		while(running){
			try{
				str = in.readLine();
				if(str==null){
					parent.disconnect();
					close();
				}
				else{
					parent.hear(str);
				}
			}
			catch(Exception ex){
				if(running){
					parent.error("An error occured while reading from the socket\n"+ex.getMessage());
					parent.disconnect();
					try{ close(); } catch(Exception ex2){}
				}
			}
		}
		try{ close(); } catch(Exception ex){}
	}
}