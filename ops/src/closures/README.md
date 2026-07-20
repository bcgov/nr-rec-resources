# JSON Export of Closed Rec Resources (FTA Closures)

Exports all Rec Resources with a status of **Closed** as a JSON array, for
import into ACT (advisory generation).

## Background

Closure data originates in FTA's `recreation_comment` table
(`rec_comment_type_code = 'CLOS'`) and is migrated into `rst.recreation_status`
by `migrations/fta/sql/V1.0.5__fta_to_rst_status.sql`, which preserves the FTA
audit fields:

| Export field       | rst.recreation_status column |
| ------------------ | ---------------------------- |
| `closure_comment`  | `comment`                    |
| `entry_userid`     | `created_by`                 |
| `entry_timestamp`  | `created_at`                 |
| `update_userid`    | `updated_by`                 |
| `update_timestamp` | `updated_at`                 |

`rec_resource_type_code` comes from `rst.recreation_resource_type_view_admin`
(actual type codes, no RR→SIT public conversion).

## Usage

```sh
cd ops
npm install

DATABASE_URL="postgresql://user:pass@host:5432/db" \
  npm run export-closed-resources -- --output closed-rec-resources.json
```

Options:

- `--output <path>` - output file path (defaults to
  `closed-rec-resources-<YYYY-MM-DD>.json`)
- `--pretty` / `--no-pretty` - pretty-print JSON (default: pretty)

## Output format

```json
[
  {
    "rec_resource_id": "REC0002",
    "rec_resource_type_code": "SIT",
    "closure_comment": "Site is closed due to flooding",
    "entry_userid": "mjolund",
    "entry_timestamp": "2026-07-08T15:30:00.000Z",
    "update_userid": "mjolund",
    "update_timestamp": "2026-07-08T15:30:00.000Z"
  }
]
```

The optional ACT override fields (`headline`, `access_status_name`, `urgency`,
`event_type`, `advisory_date`) are intentionally **not** included - ACT applies
its defaults. If curated values are ever needed, extend the
`ClosedResourceExport` interface and query in `export-closed-resources.ts`
before running the export.

## Notes

- Records missing a `rec_resource_type_code` are logged as warnings - review
  before delivery.
- This export must be re-run immediately prior to the ACT MVP production launch,
  so keep this script/process in place.
