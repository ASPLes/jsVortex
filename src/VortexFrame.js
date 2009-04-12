/**
 * @brief Creates a a new frame with the type configured
 * by the string received.
 *
 * @param strType The frame type to configure.
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
     * @internal Property to hold frame type.
     */
    this.type        = type;
    this.channel     = channel;
    this.msgno       = msgno;
    this.more        = more;
    this.seqno       = seqno;
    this.size        = size;
    this.ansno       = ansno;
    this.mimeHeaders = mimeHeaders;
    this.content     = content;
};



/**
 * @brief Allows to get frame type for a given instance.
 */
VortexFrame.prototype.getFrameType = function () {
  return this.type;
};