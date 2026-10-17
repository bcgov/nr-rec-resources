# FTA Note Import

Scripts for importing historical notes from the FTA CSV extracts, and for
checking the CSVs against the `fta` mirror tables.

## Prerequisites

- Node.js v18+
- A database migrated to at least `V1.1.95`
- The two CSV extracts. They are not committed to this repo

```bash
cd ops
npm install
```

## Environment Variables

- **DATABASE_URL** (required): PostgreSQL connection string
- **LOG_LEVEL** (optional): Winston log level. Default `info`

## import-fta-notes

Loads `PROVFOREST_NOTE.csv` and `ASSOCIATED_USE.csv` into the database. Two
targets:

- `--target rst` (default) writes finished notes straight into
  `rst.recreation_resource_note`, skipping the `fta` schema. Use it to get real
  notes in front of the app.
- `--target fta` stages the `fta` mirror tables instead, so the real
  `V1.1.24__fta_to_rst_recreation_resource_note.sql` transform can be run
  against them. Use it to test the transform.

Imported notes land with `source_system = 'FTA'`, which makes them read-only in
the admin app.

```bash
# What would be imported, without writing
make -C ops/src/fta-notes import-fta-notes-dry \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Import
make -C ops/src/fta-notes import-fta-notes \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Stage the fta mirror tables, then run the transform yourself
make -C ops/src/fta-notes import-fta-notes \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv ARGS="--target fta"

# Delete every FTA-sourced note first, then re-import
make -C ops/src/fta-notes import-fta-notes-clean \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv

# Against a different database
make -C ops/src/fta-notes import-fta-notes \
  DB_URL="postgresql://user:pass@host:5432/db" NOTES_CSV=... ASSOC_CSV=...
```

Paths may be absolute or relative to the repo root.

```
Options:
  --notes-csv   Path to PROVFOREST_NOTE.csv            (required)
  --assoc-csv   Path to ASSOCIATED_USE.csv             (required)
  --target      rst | fta                              (default: rst)
  --dry-run     Read and filter without writing        (boolean)
  --clean       Delete all FTA-sourced notes first     (boolean, rst only)
  --help        Show help
```

### What gets filtered out

Reported separately per source.

| Reason                      | Why                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `skippedNotRecFile`         | `FOREST_FILE_ID` is not a `REC%` id                                                                                                     |
| `skippedConversionAccount`  | Created or last updated by `RECREATION_CONVERSION`, the 2005 data migration. Its rows are generated summaries, not notes a person wrote |
| `skippedNoMatchingResource` | No row in `rst.recreation_resource` with that id                                                                                        |

Rows are dropped rather than failing the run, since the target database may only
be partly populated.

### Data Mapping

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
`rst.fta_note_to_html` and `rst.fta_note_pivot_date` from migration `V1.1.95`.
Every path that imports FTA notes calls them, so keep the logic there.

### A note on date formats

These CSVs carry two-digit years (`92-11-24`). The ones backend-el produces
carry ISO-8601 timestamps, because `CSVPrinter` writes
`LocalDateTime.toString()`. That is why `fta_note_pivot_date` is applied here
but not in the transform, where the column has already been parsed into a date.

Under the default `DateStyle` of `ISO, MDY`, `05-07-06` would silently parse as
2006-05-07 and `92-11-24` would error, so the two-digit form must never reach a
`date` column directly.

### Re-running

Safe. Rows are keyed on `(source_system, source_key)` and the insert ignores
conflicts, so a second run reports everything under `alreadyPresent`.

`--clean` deletes **all** notes with `source_system = 'FTA'`, including any
loaded by database fixtures. Staff-authored notes are untouched.

## check-csv-columns

Compares a CSV header against the column order of its `fta` mirror table.

`aws_s3.table_import_from_s3` with an empty column list is positional:
`HEADER true` only skips the first line, it does not match on names. A column
added to one side and not the other loads every value into the wrong column,
silently.

```bash
make -C ops/src/fta-notes check-csv-columns \
  NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv
```

Exits non-zero and logs each mismatched position if they disagree.

## Logging

- **File**: `ops/logs/<script>-YYYY-MM-DDTHH-mm-ss.log`, JSON
- **Console**: human-readable, to stderr
