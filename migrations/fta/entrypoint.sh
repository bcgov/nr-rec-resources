#!/bin/sh
set -e

# Flyway clean the fta schema each time so we can re-import the CSV data.
# Set FTA_TO_RST_ENABLED=false to keep only V1.0.1, which imports CSV into fta.
FTA_TO_RST_ENABLED=${FTA_TO_RST_ENABLED:-false}

echo "Running flyway clean..."
flyway clean

if [ "$FTA_TO_RST_ENABLED" = "false" ] || [ "$FTA_TO_RST_ENABLED" = "0" ]; then
  echo "FTA-to-RST transforms are disabled; importing CSV data only."
  exec flyway migrate -target=1.0.1
fi

exec flyway "$@"
