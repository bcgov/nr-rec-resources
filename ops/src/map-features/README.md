# Map Feature Cleanup

One-time removal of `rst.recreation_map_feature` rows the FTA sync can no longer
reach. Pure deletes, one transaction, safe to re-run.

## Prerequisites

- Node.js v18+
- A database migrated to at least `V1.1.113`

```bash
cd ops
npm install
```

## Environment Variables

- **DATABASE_URL** (required unless `--database-url` is passed): PostgreSQL
  connection string
- **LOG_LEVEL** (optional): Winston log level. Default `info`

## cleanup-stale-map-features

```bash
# Run every check and roll back
make -C ops/src/map-features cleanup-stale-map-features-dry

# Apply
make -C ops/src/map-features cleanup-stale-map-features

# Against a different database
make -C ops/src/map-features cleanup-stale-map-features \
  DB_URL="postgresql://user:pass@host:5432/db"
```

```
Options:
  --dry-run        Run every check and roll back instead of committing  (boolean)
  --database-url   Connection string, overrides DATABASE_URL            (string)
  --help           Show help
```

### What gets deleted

| Population             | Rows on prod | How they are picked                                |
| ---------------------- | ------------ | -------------------------------------------------- |
| Duplicate polygon rows | 77           | Everything but the highest `rmf_skey` in each slot |
| `REC4735` orphan lines | 8            | `rmf_skey` between 261861 and 261868               |

**Duplicate polygons.** Polygons carry a null `section_id`. The old upsert in
`V1.1.11` arbitrated on `(rec_resource_id, section_id)`, and a unique constraint
treats nulls as distinct, so the conflict never fired for a polygon and every
amendment inserted another row instead of updating the one we had. The current
`V1.1.11` gates its insert on the slot, so no new ones can form.

Highest `rmf_skey` is the live row. That was checked against the BCGW polygon
layer and held for all 72 duplicated slots, with no exceptions: 149 rows across
72 slots, and the 77 that are not the highest are exactly the 77 our layer
publishes that BCGW does not.

**REC4735.** Its sections were renamed from numbers (`1`..`7`, `PARK 1`) to
names (`SITKUM CREEK`, `GOAT MOUNTAIN`, ...) under fresh skeys. The old rows sit
in slots FTA stopped reporting, so nothing slot-based matches them and the sync
leaves them alone forever. They are listed by skey because no general rule can
tell them apart from features FTA merely stopped reporting, which we want to
keep.

### Checks

Everything runs inside one transaction. Any failed check rolls the whole thing
back and exits non-zero.

| Check                        | Why                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Survivors have geometry      | A surviving row with no geometry drops out of both BCGW layers, since the views join geometry and then filter on `geometry_type_code` |
| Deleted count matches target | Guards against the delete and the preview disagreeing                                                                                 |
| No duplicate slots left      | Every null-section slot holds exactly one row                                                                                         |
| No orphans left              | Nothing remains in `REC4735`'s orphan skey range                                                                                      |
| `REC4735` not emptied        | Its six current features must survive                                                                                                 |
| No dangling geometry         | Nothing in `recreation_map_feature_geom` without a parent row                                                                         |

The orphan row count is compared against the 8 the investigation found. A
different number logs a warning rather than failing, since the count
legitimately drops to 0 once the cleanup has run.

### Side effects

`V1.1.110` added `recreation_spatial_submission_map_feature.rmf_skey` with
`ON DELETE SET NULL`, so a submission pointing at a deleted row loses that link
quietly rather than erroring. The script counts those links and logs a warning
before deleting, so the dry run tells you whether any exist.

Deletes are archived by the versioning trigger into
`rst.recreation_map_feature_history`.

### Re-running

Safe. The second run finds nothing to delete and reports "already clean".

## Logging

- **File**: `ops/logs/<script>-YYYY-MM-DDTHH-mm-ss.log`, JSON
- **Console**: human-readable, to stderr
