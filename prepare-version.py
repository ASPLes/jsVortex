#!/usr/bin/python

from core_admin_common import command
import sys

# update sources
# 23/02/2024 -- | github.com disabled svn
# 23/02/2024 -- (status, info) = command.run ("svn update .")
cmds = [
    "git fetch",
    "git pull --ff-only"
]
for cmd in cmds:
    # run commands to update local code
    (status, info) = command.run (cmd)
    if status:
        print "ERROR: failed to update svn, error was: %s" % info
        sys.exit (-1)
    # end if
# end for

# update version file
(status, info) = command.run ("""LANG=C git log | grep "^commit " | wc -l""")
if status:
    print "ERROR: failed to svn revision, error was: %s" % info
    sys.exit (-1)

# revision = info.strip ().split (": ")[1]
revision = info.strip ()

version = open ("VERSION").read ().strip ().split (".g")[0]

new_version = "%s.g%s" % (version, revision)
open ("VERSION", "w").write ("%s\n" % new_version)
print "NEW VERSION: %s (file updated)" % new_version
sys.exit (0)


    
    
