%define jsvortex_version %(cat VERSION)

Name:           jsvortex
Version:        %{jsvortex_version}
Release:        5%{?dist}
Summary:        Javascript BEEP implementation web files
Group:          System Environment/Libraries
License:        GPLv2+ 
URL:            http://www.aspl.es/jsVortex
# Source:         %{name}-%{version}.tar.gz


%define debug_package %{nil}

%description
This package contains javascript BEEP implementation to be
placed on a web so it can be downloaded by a web browser to
connect to BEEP servers. The package includes java socket
connector applet.

%prep
# %setup -q

%build


%install
# mkdir -p %{buildroot}/usr/share/jsVortex
cd ../../ && make DESTDIR=%{buildroot} install
chmod 644 %{buildroot}/usr/share/jsVortex/*.{js,txt,jar}

# %post -p /sbin/ldconfig

# %postun -p /sbin/ldconfig

# %files -f %{name}.lang
# %doc COPYING.txt README
# %{_libdir}/libaxl.so.*

# %files devel
# %doc COPYING
# %{_includedir}/axl*
# %{_libdir}/libaxl.so
# %{_libdir}/pkgconfig/axl.pc

# jsvortex1 package
%package -n jsvortex1
Summary: Javascript BEEP implementation web files
Group: System Environment/Libraries
%description  -n jsvortex1
This package contains javascript BEEP implementation to be
placed on a web so it can be downloaded by a web browser to
connect to BEEP servers. The package includes java socket
connector applet.
%files -n jsvortex1
   /usr/share/jsVortex/COPYING.txt
   /usr/share/jsVortex/JavaSocketConnector.jar
   /usr/share/jsVortex/JavaSocketConnector.js
   /usr/share/jsVortex/README
   /usr/share/jsVortex/Vortex.debug.js
   /usr/share/jsVortex/Vortex.js


%changelog
* Sun Apr 07 2015 Francis Brosnan Blázquez <francis@aspl.es> - %{jsvortex_version}
- New upstream release

