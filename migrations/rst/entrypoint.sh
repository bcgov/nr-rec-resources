#!/bin/sh
set -e

# Check APP_ENV and run flyway clean if it is set to 'dev'
# FLYWAY_CLEAN_DISABLED will also have to be set to 'false' for this to work
if [ "$APP_ENV" = "dev" ] || [ "$APP_ENV" = "test" ]; then
  echo "APP_ENV is set to $APP_ENV. Running flyway clean..."
  flyway clean
else
  echo "APP_ENV is not 'dev'. Skipping flyway clean."
fi

# Execute the passed arguments (default to Flyway commands)
exec flyway "$@"
