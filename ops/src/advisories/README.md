# Advisory Sync Script

This script syncs public advisories from the Advisories API to the RST
database's `act_advisories_flat` table.

## Overview

The script fetches advisories from the Advisories API endpoint and populates the
local database with advisory data. It handles:

- Fetching advisories with pagination
- Flattening advisories by recreation resource (advisories can be associated
  with multiple resources)
- Upserting data into the `act_advisories_flat` table
- Concurrent database operations for improved performance
- Comprehensive logging to both file and console

## Prerequisites

- Node.js v18+
- PostgreSQL database with the RST schema
- Environment variables configured

## Setup

Before running the script for the first time:

```bash
cd ops

# Install dependencies
npm install

```

This generates the Prisma client from the schema in `ops/prisma/schema.prisma`.

## Environment Variables

- **DATABASE_URL** (required): PostgreSQL connection string

  - Format: `postgresql://user:password@host:port/database`
  - Example: `postgresql://postgres:default@database:5432/postgres`

- **API_BASE_URL** (optional): Base URL for the CMS API

  - Can also be provided via `--api-base-url` CLI argument (takes priority)
  - Required: Either via environment variable or CLI argument

- **LOG_LEVEL** (optional): Winston log level
  - Options: `error`, `warn`, `info`, `debug`
  - Default: `info`

## Usage

### Basic Usage

```bash
# Install dependencies (from ops folder or root)
npm install

# Run the sync script
npm run sync-advisories
```

### With Options

```bash
# Dry run (validate data without writing to database)
npm run sync-advisories -- --dry-run --api-base-url https://api.example.com

# Custom page size
npm run sync-advisories -- --page-size 50 --api-base-url https://api.example.com

# Limit to first N pages (useful for testing)
npm run sync-advisories -- --max-pages 2 --api-base-url https://api.example.com

# Control concurrency of database writes
npm run sync-advisories -- --concurrency 10 --api-base-url https://api.example.com

# Combine options
npm run sync-advisories -- --dry-run --max-pages 1 --page-size 25 --api-base-url https://api.example.com
```

### Using tsx directly

```bash
npx tsx src/advisories/sync-advisories.ts --help
npx tsx src/advisories/sync-advisories.ts --dry-run --api-base-url https://api.example.com
npx tsx src/advisories/sync-advisories.ts --api-base-url https://api.example.com --max-pages 5
```

## Docker/Docker Compose

When using Docker Compose with the local database:

```bash
# Set up environment (from root directory)
export DATABASE_URL="postgresql://postgres:default@localhost:5432/postgres"

# Run from ops directory with API base URL
cd ops
npm install
npm run sync-advisories -- --api-base-url https://alpha-test-cms.bcparks.ca
```

Or with Docker:

```bash
docker exec -e DATABASE_URL="postgresql://postgres:default@database:5432/postgres" \
  $(docker-compose ps -q backend) \
  npx tsx ops/src/advisories/sync-advisories.ts --api-base-url https://alpha-test-cms.bcparks.ca
```

## Command Line Options

```
Options:
  --dry-run           Fetch and validate data without writing to database (boolean)
  --page-size         Number of advisories per API page (default: 100)
  --max-pages         Maximum number of pages to fetch
  --concurrency       Number of concurrent database writes (default: 5)
  --api-base-url      Base URL for the CMS API (required)
  --help              Show help
```

## Data Mapping

The script maps CMS API advisory data to the `act_advisories_flat` table:

| CMS Field                             | DB Column                     | Notes                      |
| ------------------------------------- | ----------------------------- | -------------------------- |
| `advisoryNumber`                      | `advisory_number`             |                            |
| `title`                               | `title`                       |                            |
| `description`                         | `description`                 | HTML content               |
| `accessStatus.accessStatus`           | `access_status_name`          |                            |
| `accessStatus.groupLabel`             | `access_status_grouplabel`    |                            |
| `accessStatus.description`            | `access_status_description`   |                            |
| `eventType.eventType`                 | `event_type`                  |                            |
| `eventType.precedence`                | `event_type_precedence`       |                            |
| `urgency.urgency`                     | `urgency`                     |                            |
| `urgency.sequence`                    | `urgency_sequence`            |                            |
| `advisoryStatus.advisoryStatus`       | `advisory_status`             |                            |
| `isReservationsAffected`              | `is_reservations_affected`    |                            |
| `isAdvisoryDateDisplayed`             | `is_advisory_date_displayed`  |                            |
| `isEffectiveDateDisplayed`            | `is_effective_date_displayed` |                            |
| `isEndDateDisplayed`                  | `is_end_date_displayed`       |                            |
| `isUpdatedDateDisplayed`              | `is_updated_date_displayed`   |                            |
| `advisoryDate`                        | `advisory_date`               | Converted to timestamp     |
| `effectiveDate`                       | `effective_date`              | Converted to timestamp     |
| `endDate`                             | `end_date`                    | Nullable                   |
| `expiryDate`                          | `expiry_date`                 | Nullable                   |
| `updatedDate`                         | `updated_date`                | Falls back to modifiedDate |
| `modifiedDate`                        | `modified_date`               |                            |
| `publishedAt`                         | `published_at`                | Nullable                   |
| `listingRank`                         | `listing_rank`                |                            |
| `recreationResources[].recResourceId` | `rec_resource_id`             | Flattened by resource      |

## Logging

Logs are written to:

- **File**: `ops/logs/sync-advisories-YYYY-MM-DDTHH-mm-ss.log` (JSON format)
- **Console**: Human-readable format to stderr

Each log entry includes:

- Timestamp
- Log level
- Script name
- Message
- Contextual metadata (key=value pairs)

## Example Log Output

```
[2024-06-04T18:45:30.123Z] info (sync-advisories): Starting advisory sync dryRun=false pageSize=100 maxPages=unlimited concurrency=5 apiBaseUrl=https://alpha-test-cms.bcparks.ca
[2024-06-04T18:45:31.456Z] info (sync-advisories): Fetching page 1/5
[2024-06-04T18:45:35.789Z] info (sync-advisories): Total: 437, Pages: 5
[2024-06-04T18:45:35.890Z] info (sync-advisories): Processing 100 advisory records on page 1
[2024-06-04T18:45:37.012Z] info (sync-advisories): Completed page 1 (Total: 100)
[2024-06-04T18:45:40.345Z] info (sync-advisories): Sync completed totalProcessed=437
```

## Performance Considerations

- **Concurrency**: The `--concurrency` option controls how many database writes
  happen in parallel. Higher values = faster but more resource-intensive.
- **Page Size**: Larger page sizes reduce API calls but may timeout on large
  responses. Default of 100 is conservative.
- **Dry Run**: Use `--dry-run` to validate data without database I/O.

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check network connectivity to the database host

### API Errors

- Verify API_BASE_URL is correct and accessible
- Check for network/firewall issues
- Review logs for detailed error messages

### Database Conflicts

- The script uses UPSERT, so re-running is safe
- Check logs for specific advisory numbers that failed
- Verify database permissions for the user

## Development

To modify the script:

1. Edit `src/advisories/sync-advisories.ts`
2. Ensure TypeScript compiles: `npx tsc --noEmit`
3. Test with dry run: `npm run sync-advisories -- --dry-run --max-pages 1`
4. Review logs in `logs/` directory
