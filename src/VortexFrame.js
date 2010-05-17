/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief BEEP frame instance. Creates a a new frame with the type
 * configured by the string received.
 *
 * @param type {String} The frame type to configure.
 *
 * @param channel {Number} Channel number where this frame was received.
 *
 * @param msgno {Number} Frame msgno value to configure.
 *
 * @param more {Boolean} Frame complete indicator.
 *
 * @param seqno {Number} Frame seqno value to configure.
 *
 * @param size {Number} Frame size value to configure.
 *
 * @param ansno {Number} ? Frame ansno value to configure. This value
 * is optional if you aren't producing RPY, ERR or MSG frame.
 *
 * @param msgno {Number} Optional array of MIME headers
 * to be configured as content received in the frame.
 *
 * @param content {String} The frame content.
 *
 * @class
 *
 * @return A newly \ref VortexFrame instance created.
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
     * @brief Property to hold frame type. It is an string containing
     * either "RPY", "MSG", "ERR", "SEQ", "ANS", "NUL".
     * @type {String}
     */
    this.type        = type;

    /**
     * @brief Contains the channel number where the frame was
     * received. It is a number.
     * @type {Number}
     */
    this.channel     = channel;

    /**
     * Contains the frame msgno identifier.
     * @type {Number}
     */
    this.msgno       = msgno;

    /**
     * @brief Contains a boolean value representing if the frame has
     * the more fragment enabled (pending content is to be received) or
     * the frame represents a single and complete message sent by the
     * remote BEEP peer.
     * @type {Boolean}
     */
    this.more        = more;

    /**
     * @brief Contains the seqno value associated with the frame. Taking the
     * exchange produced in a BEEP channel, this value contains the
     * first byte contained in the frame, which belongs to that
     * sequence.
     * @type {Number}
     */
    this.seqno       = seqno;
    /**
     *
     * @brief Contains the frame size notified. This may not be the same
     * as the size of the content received since jsVortex does automatic
     * MIME parsing and because BEEP headers operates at byte level while
     * javascript content uses UTF-16. You can get the size of your
     * message, without MIME headers, by calling to frame.content.length.
     *
     * @type {Number}
     */
    this.size        = size;

    /**
     * @brief Contains the ansno value, and identifier used inside one to
     * many exchange style (ANS/NUL).
     * @type {Number}
     */
    this.ansno       = ansno;

    /**
     * @brief Contains a list of mime headers. Each item is an instance of
     * \ref VortexMimeHeader.
     * @type {VortexMimeHeader []}
     */
    this.mimeHeaders = mimeHeaders;

    /**
     * @brief Contains the content of the frame, without MIME headers
     * which are processed and stored in mimeHeaders.
     * @type {String}
     */
    this.content     = content;
};



