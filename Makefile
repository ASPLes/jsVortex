all:
	@echo "Building ;-).."
clean:
	@echo "Cleaning.."

install:
	install -d $(DESTDIR)/usr/share/jsVortex
	./make-zip.sh $(DESTDIR)/usr/share/jsVortex
	
