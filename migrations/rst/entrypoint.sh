#!/bin/sh
set -e

# Check APP_ENV and run flyway clean if it is set to 'dev'
# FLYWAY_CLEAN_DISABLED will also have to be set to 'false' for this to work
# if [ "$APP_ENV" = "dev" ]; then
#   echo "APP_ENV is set to $APP_ENV. Running flyway clean..."
#   flyway clean
# else
#   echo "APP_ENV is not 'dev'. Skipping flyway clean."
# fi

# Make APP_ENV available as a Flyway placeholder for conditional SQL in migrations
# This allows migrations to check the environment and execute conditionally
# while still being recorded in flyway_schema_history (avoiding version gaps)
if [ -n "$APP_ENV" ]; then
  export FLYWAY_PLACEHOLDERS_APP_ENV="$APP_ENV"
  echo "Setting Flyway placeholder APP_ENV=$APP_ENV for use in migrations"
fi

# Execute the passed arguments (default to Flyway commands)
exec flyway "$@"
