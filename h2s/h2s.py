#!/usr/bin/python

# Copyright (C) 2012 Advanced Software Production Line, S.L.
# See license.txt or http://www.aspl.es/vortex

import select
import socket
import sys
import Queue

import vortex
import vortex.sasl
import vortex.tls

# create listener operation
server = socket.socket (socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt (socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.setblocking(0)

# Bind the socket to the port
server_address = ('localhost', 443)
server.bind (server_address)

# Listen for incoming connections
server.listen (5)

# Sockets from which we expect to read
inputs = [ server ]

# Outgoing message queues (socket:Queue)
message_queues = {}

def clean_lines (x):
    return x.strip ()

def parse_http_request (data):
    if len (data) < 10:
        print "ERROR: received less data than expected to setup an minimal exchange\n"
        return None

    # parse HTTP headers 
    payload = {}
    payload['method'] = data[:3]
    if payload['method'] not in ["GET", "POST"]:
        print "ERROR: received unsupported method: %s" % payload['method']
        return None

    # parse all mime headers, to jump into content received
    iterator = 0
    found_content = False
    while (iterator + 3) < len(data):

        if data[iterator] == "\r" and data[iterator + 1] == "\n" and data[iterator + 2] == "\r" and data[iterator + 3] == "\n":
            found_content = True
            break

        iterator += 1
    # end while

    if not found_content:
        print "ERROR: no mime headers was found..."
        return None

    # get content
    payload['content'] = data[iterator+4:]

    # parse mime headers
    mime_headers = data[:iterator+3].split ("\n")
    mime_headers = filter (clean_lines, mime_headers)

    iterator = 0
    result   = {}
    for mime_header in mime_headers:
        # cleanup input line
        mime_header = mime_header.strip ()

        if not mime_header:
            continue

        # parse each mime header
        items = filter (clean_lines, mime_header.split (":"))
        if len (items) != 2:
            continue

        # get key and value
        key   = items[0]
        value = ":".join (items[1:]).strip ()

        # get key and value
        result[key] = value

    # setup mime headers found
    payload['mime_headers'] = result

    return payload

def send_http_reply (http_header, http_content, content_type = "application/octet-stream"):

    # reconfigure content type in the case of a failure 
    if http_header[:2] == "40":
        content_type = "text/html"
    
    # write headers
    s.send ("HTTP/1.1 %s\r\n" % http_header)
    s.send ("Content-Type: %s\r\n" % content_type)
    s.send ("Content-Length: %d\r\n" % len (http_content))
    s.send ("Server: jsVortex HTTP-2-BEEP bridge here\r\n")
    s.send ("Pragma: no-cache\r\n")
    s.send ("Cache-Control: no-cache\r\n")
    s.send ("\r\n")

    # send content
    s.send (http_content)

    return

def handle_new_connection_command (s, payload):
    # call to create a new connection
    conn = vortex.Connection (ctx, "localhost", "602")
    if not conn.is_ok ():
        send_http_reply ("404 Connection failed", "Unable to create BEEP session")
        return

    # ok, register this connection associated to the provided socket
    conn.set_data ("source_ip", s.getpeername ())

    # set connection identifier
        
    

def process_command (s, payload):

    # process command
    content = payload['content']
    if not content:
        send_http_reply ("200 OK", "Hello there", "text/html")
        return

    # check for new connection
    if content[:15] == "new connection ":
        handle_new_connection_command (s, payload)
    if content[:17] == "close connection ":
        handle_close_connection_command (s, payload)
    if content[:10] == "push data ":
        handle_push_data_command (s, payload)
    if content[:10] == "poll data ":
        handle_poll_data_command (s, payload)

    print "WARNING: no command request was received..."
    return
    
    

def handle_data_received (s, data):
    payload = parse_http_request (data)
    if payload is None:
        print "ERROR: failed to parse incoming data from source client X, closing connection"
        handle_disconnect_from (s)
        return

    print "DATA received: %s" % payload

    # process command
    process_command (s, payload)
    
    return
    

def handle_disconnect_from (s):
    # first of all close it
    s.close ()
    inputs.remove (s)

    # print "DISCONNECT RECEIVED FROM: %s" % s.getpeername()

#### MAIN ####

# create vortex context and init it
ctx = vortex.Ctx ()

if not ctx.init ():
    print "ERROR: failed to init vortex context, failed to start HTTP bridge"
    sys.exit (-1)

while inputs:

    # wait for reading operations
    readable, writable, exceptional = select.select (inputs, [], inputs)

    for s in readable:
        
        # handle server sockets 
        if s is server:
            # accept incoming connection or not
            connection, client_address = s.accept()
            # set it non-blocking
            connection.setblocking(0)
            inputs.append(connection)
            
            continue

        # normal content received (get content)
        data = s.recv (1024)
        if not data:
            # disconnect from client, remove from the client
            handle_disconnect_from (s)
            continue

        # handle data received
        handle_data_received (s, data)
    # end for

    for s in exceptional:
        handle_disconnect_from (s)
    # end for
# end while
    

        
            
            
