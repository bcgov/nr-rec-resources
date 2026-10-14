# FTA Note Import

One-time import of historical notes from the FTA CSV extracts into
`rst.recreation_resource_note`.

## Overview

Loads `PROVFOREST_NOTE.csv` and `ASSOCIATED_USE.csv` directly into the notes
table, so dev and test can hold real imported notes.

Imported notes land with `source_system = 'FTA'`, which makes them read-only in
the admin app: the API rejects updates and deletes against them.

## Prerequisites

- Node.js v18+
- A database migrated to at least `V1.1.93`, which adds the mapping functions
- The two CSV extracts. They are not committed to this repo

## Setup

```bash
cd ops
npm install
```

## Environment Variables

- **DATABASE_URL** (required): PostgreSQL connection string
  - Example: `postgresql://postgres:default@localhost:5432/postgres`
- **LOG_LEVEL** (optional): Winston log level. Default `info`

## Usage

Through the Makefile, from the repo root. Paths may be absolute or relative to
the repo root:

```bash
# Report what would be imported, without writing
make -C ops/src/fta-notes import-fta-notes-dry \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Import
make -C ops/src/fta-notes import-fta-notes \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Delete every FTA-sourced note first, then re-import
make -C ops/src/fta-notes import-fta-notes-clean \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Against a different database
make -C ops/src/fta-notes import-fta-notes \
  DB_URL="postgresql://user:pass@host:5432/db" \
  NOTES_CSV=... ASSOC_CSV=...
```

Or directly:

```bash
cd ops
DATABASE_URL="postgresql://postgres:default@localhost:5432/postgres" \
  npx tsx src/fta-notes/import-fta-notes.ts --help
```

## Command Line Options

```
Options:
  --notes-csv   Path to PROVFOREST_NOTE.csv            (required)
  --assoc-csv   Path to ASSOCIATED_USE.csv             (required)
  --dry-run     Read and filter without writing        (boolean)
  --clean       Delete all FTA-sourced notes first     (boolean)
  --help        Show help
```

## What gets filtered out

Reported separately per source so the gap is visible rather than silent.

| Reason                      | Why                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skippedNotRecFile`         | `FOREST_FILE_ID` is not a `REC%` id, matching every existing `fta_to_rst_*` transform                                                              |
| `skippedConversionAccount`  | Created or last updated by `RECREATION_CONVERSION`, the 2005 data migration. Its rows are generated conversion summaries, not notes a person wrote |
| `skippedNoMatchingResource` | No row in `rst.recreation_resource` with that id                                                                                                   |

Rows are dropped rather than failing the run, since the target database may only
be partly populated.

## Data Mapping

|                  | PROVFOREST_NOTE        | ASSOCIATED_USE                                         |
| ---------------- | ---------------------- | ------------------------------------------------------ |
| `source_key`     | `PROVFOREST_NOTE_SKEY` | `FOREST_FILE_ID\|FILE_SOURCE_CODE\|ASSOCIATED_FILE_ID` |
| `title`          | `FTA Note`             | `FTA Associated File - <source description>`           |
| `body`           | the `NOTE` text        | source id, associated id and file source               |
| `date_logged`    | `ENTRY_TIMESTAMP`      | `ENTRY_TIMESTAMP`                                      |
| `created_by`     | `ENTRY_USERID`         | `ENTRY_USERID`                                         |
| `note_type_code` | `NOTE`                 | `NOTE`                                                 |

Source descriptions come from `rst.recreation_file_source_code`.

Escaping and date conversion happen in the database, through
`rst.fta_note_to_html` and `rst.fta_note_pivot_date` from migration `V1.1.93`.
Every path that imports FTA notes calls them, so keep the logic there.

- `fta_note_to_html` escapes `&`, `<` and `>`, then converts line breaks to
  `<br>`
- `fta_note_pivot_date` turns `YY-MM-DD` into a date, pivoting two-digit years
  at 50

## Re-running

Safe. Rows carry `(source_system, source_key)` and the insert ignores conflicts,
so a second run reports `insertedNotes=0` and everything under `alreadyPresent`.
Use `--clean` to force a full refresh after changing the mapping.

Note that `--clean` deletes **all** notes with `source_system = 'FTA'`,
including any loaded by database fixtures. Staff-authored notes are untouched.

## Logging

- **File**: `ops/logs/import-fta-notes-YYYY-MM-DDTHH-mm-ss.log`, JSON
- **Console**: human-readable, to stderr

## Example Output

```
info (import-fta-notes): Loaded reference data recreationResources=60 fileSourceCodes=19
info (import-fta-notes): Read CSV extracts provforestNoteRows=7111 associatedUseRows=3748
info (import-fta-notes): PROVFOREST_NOTE after filtering eligible=9 skippedNotRecFile=78 skippedConversionAccount=5164 skippedNoMatchingResource=1860
info (import-fta-notes): ASSOCIATED_USE after filtering eligible=27 skippedNotRecFile=728 skippedConversionAccount=2865 skippedNoMatchingResource=128
info (import-fta-notes): Import complete insertedNotes=9 insertedAssociations=27 alreadyPresent=0
```

A low eligible count against a large extract is expected locally, since most
notes belong to resources that do not exist there.
