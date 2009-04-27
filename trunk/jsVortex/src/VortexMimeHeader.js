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
 * @return A newly created MIME header unit.
 */
function VortexMimeHeader (header, content) {
    this.header  = header;
    this.content = content;
}