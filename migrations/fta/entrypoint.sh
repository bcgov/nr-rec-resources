#!/bin/sh
set -e

# Flyway clean the fta schema each time so we can re-import the data
# FLYWAY_CLEAN_DISABLED will also have to be set to 'false' for this to work
echo "Running flyway clean..."
flyway clean

# Execute the passed arguments (default to Flyway commands)
exec flyway "$@"
