/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/

/**
 * @brief Creates a new mime header instance.
 *
 * @param header The MIME header name.
 * @param content The MIME header content.
 *
 * @return {VortexMimeHeader} A newly created MIME header unit.
 *
 * @class
 */
function VortexMimeHeader (header, content) {
    /**
     * @brief The MIME header name configured (for example "Received").
     */
    this.header  = header;
    /**
     * @brief The MIME header content.
     */
    this.content = content;
}