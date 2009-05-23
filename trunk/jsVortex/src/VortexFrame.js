/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * BEEP frame instance. Creates a a new frame with the type configured
 * by the string received.
 *
 * @param strType The frame type to configure.
 *
 */
function VortexFrame (type,
		      channel,
		      msgno,
		      more,
		      seqno,
		      size,
		      ansno,
		      mimeHeaders,
		      content) {
    /**
     * Property to hold frame type. It is an string containing either
     * "RPY", "MSG", "ERR", "SEQ", "ANS", "NUL".
     */
    this.type        = type;

    /**
     * Contains the channel number where the frame was received. It is a number.
     */
    this.channel     = channel;

    /**
     * Contains the frame msgno identifier.
     */
    this.msgno       = msgno;

    /**
     * Contains a boolean value representing if the frame has the more
     * fragment enabled (pending content is to be received) or the
     * frame represents a single and complete message sent by the
     * remote BEEP peer.
     */
    this.more        = more;

    /**
     * Contains the seqno value associated with the frame. Taking the
     * exchange produced in a BEEP channel, this value contains the
     * first byte contained in the frame, which belongs to that
     * sequence.
     */
    this.seqno       = seqno;
    /**
     * Contains the frame size notified. This may not be the same as
     * the size of the content received since jsVortex does automatic
     * MIME parsing. You can get the size of your message, without MIME
     * headers, by calling to frame.content.length.
     */
    this.size        = size;

    /**
     * Contains the ansno value, and identifier used inside one to
     * many exchange style (ANS/NUL).
     */
    this.ansno       = ansno;

    /**
     * Contains a list of mime headers. Each item is an instance of
     * VortexMimeHeader.
     */
    this.mimeHeaders = mimeHeaders;

    /**
     * Contains the content of the frame, without MIME headers which
     * are processed and stored in mimeHeaders.
     */
    this.content     = content;
};



