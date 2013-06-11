#!/usr/bin/python

from core_admin_common import command
import sys

# update sources
(status, info) = command.run ("svn update .")
if status:
    print "ERROR: failed to update svn, error was: %s" % info
    sys.exit (-1)

# update version file
(status, info) = command.run ("LANG=C svn info . | grep Revision")
if status:
    print "ERROR: failed to svn revision, error was: %s" % info
    sys.exit (-1)

revision = info.strip ().split (": ")[1]

version = open ("VERSION").read ().strip ().split (".g")[0]

new_version = "%s.g%s" % (version, revision)
open ("VERSION", "w").write ("%s\n" % new_version)
print "NEW VERSION: %s (file updated)" % new_version
sys.exit (0)


    
    
