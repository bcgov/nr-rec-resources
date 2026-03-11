# GuardDuty S3 Malware Scan Scripts

Scripts to find S3 objects that have not been scanned by GuardDuty Malware
Protection and to run on-demand scans on them.

## Prerequisites

- **Node.js 18+** and workspace dependencies installed (`npm install` from repo
  root).
- **AWS credentials** (one of the following):

  - **SSO profiles (recommended)** – Define a profile in `~/.aws/config` with
    SSO settings (e.g. `dev-admin`, `prod-admin`). Log in, then pass the profile
    when running make:

    ```bash
    aws sso login --profile dev-admin
    make list-unscanned BUCKET=my-bucket PROFILE=dev-admin
    ```

  - **Temporary credentials** – From
    [BCGov AWS SSO](https://bcgov.awsapps.com/start/#/?tab=accounts), open an
    account, choose “Command line or programmatic access”, and paste the
    exported `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and
    `AWS_SESSION_TOKEN` into your shell before running the scripts. No `PROFILE`
    needed.

## Scripts

| Script                         | Make target      | Description                                                                                                                                                                            |
| ------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list-unscanned-s3-objects.ts` | `list-unscanned` | List objects in an S3 bucket that do **not** have the `GuardDutyMalwareScanStatus` tag (i.e. not yet scanned or not tagged). Optionally write those keys to a file.                    |
| `run-s3-malware-scan.ts`       | `scan`           | Run GuardDuty malware scan on each S3 object key listed in a file (one key per line).                                                                                                  |
| `verify-scan-tags.ts`          | `verify`         | Verify that every key in a file now has the `GuardDutyMalwareScanStatus` tag. Run after `scan` to confirm all objects were tagged. Exits non-zero if any key is still missing the tag. |

## Recommended flow

Run from `ops/src/guardduty/` or from repo root with
`make -C ops/src/guardduty <target> ...`.

1. **List unscanned objects** and review the output:

   ```bash
   make list-unscanned BUCKET=YOUR_BUCKET OUTPUT=unscanned-keys.txt PROFILE=dev-admin
   ```

2. Review the printed list and the generated file.
3. **Run the scan** on those objects:

   ```bash
   make scan BUCKET=YOUR_BUCKET KEYS_FILE=unscanned-keys.txt PROFILE=dev-admin
   ```

4. **Verify** that every key now has the scan tag:

   ```bash
   make verify BUCKET=YOUR_BUCKET KEYS_FILE=unscanned-keys.txt PROFILE=dev-admin
   ```

## Options

### list-unscanned-s3-objects

- `--bucket BUCKET` (required) – S3 bucket name. Can also set `BUCKET_NAME` env
  var.
- `--profile PROFILE` – AWS profile (or set `AWS_PROFILE`).
- `--region REGION` – AWS region (or set `AWS_REGION`).
- `--output FILE` – Write unscanned object keys to this file (one per line) for
  use with the `scan` target.

### run-s3-malware-scan

- `--bucket BUCKET` (required) – S3 bucket name. Can also set `BUCKET_NAME` env
  var.
- `--keys-file FILE` (required) – Path to file with object keys, one per line
  (e.g. from `--output` of list-unscanned). Can also set `KEYS_FILE` env var.
- `--profile PROFILE` – AWS profile (or set `AWS_PROFILE`).
- `--region REGION` – AWS region (or set `AWS_REGION`).

### verify-scan-tags

- `--bucket BUCKET` (required) – S3 bucket name. Can also set `BUCKET_NAME` env
  var.
- `--keys-file FILE` (required) – Path to file with object keys (same file used
  for the `scan` target). Can also set `KEYS_FILE` env var.
- `--profile PROFILE` – AWS profile (or set `AWS_PROFILE`).
- `--region REGION` – AWS region (or set `AWS_REGION`).
