# Ops scripting package

TypeScript scripts for maintenance and operations. Each feature area lives under
`src/<feature>/` and has its own **Makefile** for running scripts (no npm
scripts per feature in this package).

## Script groups

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
