#!/bin/bash

gitlog-to-changelog  | sed  's/jsVortex: *//g' > ChangeLog
