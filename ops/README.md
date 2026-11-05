# Ops scripting package

TypeScript scripts for maintenance and operations. Each feature area lives under
`src/<feature>/` and has its own **Makefile** for running scripts (no npm
scripts per feature in this package).

## Script groups

### Exhibit A S3 copy

Copy legacy Exhibit A objects from `rst-fta-lza-dataload-oracle` into an
environment bucket `rst-lza-exhibit-a-docs-{env}` while preserving object keys
(for example `Exhibit_A/{forest_file_id}/{submission_id}/...`).

```bash
npm run sync-exhibit-a-docs -- --env dev --dry-run
npm run sync-exhibit-a-docs -- --env dev
```

You can also target an explicit destination bucket:

```bash
npm run sync-exhibit-a-docs -- --target-bucket rst-lza-exhibit-a-docs-test
```

### GuardDuty (S3 malware scan)

See **[src/guardduty/README.md](src/guardduty/README.md)** for:

- Listing S3 objects that have not been scanned by GuardDuty Malware Protection
- Running on-demand GuardDuty malware scans on those objects

Quick start (from repo root or from `ops/src/guardduty/`):

```bash
make -C ops/src/guardduty list-unscanned BUCKET=YOUR_BUCKET [OUTPUT=unscanned-keys.txt]
make -C ops/src/guardduty scan BUCKET=YOUR_BUCKET KEYS_FILE=unscanned-keys.txt
make -C ops/src/guardduty help
```
