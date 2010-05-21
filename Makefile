all:
	@echo "Building ;-).."
clean:
	@echo "Cleaning.."

install:
	install -d $(DESTDIR)/usr/share/jsVortex
	install -m 644 src/*.js $(DESTDIR)/usr/share/jsVortex
	install -m 644 socket-connector/JavaSocketConnector.jar $(DESTDIR)/usr/share/jsVortex
	install -m 644 socket-connector/JavaSocketConnector.js $(DESTDIR)/usr/share/jsVortex