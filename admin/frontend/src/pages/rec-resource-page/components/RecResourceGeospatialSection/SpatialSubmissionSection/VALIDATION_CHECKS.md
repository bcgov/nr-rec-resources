# Spatial Submission Validation Checks

This document lists the validations currently applied in the Spatial Submission
workflow.

Source files:

- `admin/frontend/src/pages/rec-resource-page/components/RecResourceGeospatialSection/SpatialSubmissionSection/spatialSubmissionUtils.ts`
- `admin/frontend/src/pages/rec-resource-page/components/RecResourceGeospatialSection/SpatialSubmissionSection/SpatialSubmissionSection.tsx`

## 1) File and Binary Safety Checks

These run when a user uploads a file (`readSpatialFile`).

### Enforced (blocking)

- **Extension allowlist**: only `.shp` is accepted (case-insensitive).
- **Double-extension guard**: names such as `.shp.exe` or embedded `.shp.`
  patterns are rejected.
- **File size cap**: hard limit of **10 MB**.
- **Minimum header size**: file must contain at least the 100-byte shapefile
  header.
- **Magic number check**: first 4 bytes must be ESRI shapefile code `9994`
  (big-endian).
- **Header bbox numeric integrity**: bbox values must be finite numbers (no
  `NaN`/`Infinity`).
- **Header bbox operational extent**: header extent must be within configured BC
  bounds.

### Not currently implemented in frontend runtime

- **Parser sandboxing/isolation** (worker container/serverless) is not
  implemented in this client-side flow. Parsing currently runs in-browser.

## 2) Submission Metadata Validation

These run before geometry processing (`validateSubmissionMetadata`).

### Enforced (blocking)

- **Email format** must be valid.
- **Telephone** must be exactly 10 digits.
- **Root namespace** must be `esf`.
- **Business namespace** must be non-empty.
- **Code lists**:
  - Action Code in `I`, `U`
  - Accuracy Code in `1`, `5`, `10`, `100`, `1000`
  - Capture Method in `GPS`, `DIGITIZE`, `Ortho`, `Mono`
  - Data Source in `AirPhoto`, `TRIM`, `Satellite`, `Survey`, `Unknown`
- **Alphanumeric/length constraints** for key fields:
  - REC# max 10 chars
  - District code max 50 chars
  - Contact name max 250 chars

## 3) Spatial Reference and Coordinate Checks

These run in `validateGeometry`.

### Enforced (blocking)

- **Feature collection must contain at least one feature**.
- **Feature count cap**: max `5000` features.
- **Per-feature vertex cap**: max `50000` vertices.
- **Total vertex cap**: max `200000` vertices in the file.
- **Finite coordinate check**: rejects any `NaN`/`Infinity` coordinates.
- **Per-feature BC extent check**: each feature bbox must fall within configured
  BC bounds.

### Warning (non-blocking)

- **CRS mismatch warning**: if detected source CRS does not match expected CRS,
  a warning is added indicating reprojection may be required.

## 4) Geometry Type and Topology Checks

### Enforced (blocking)

- **Geometry type enforcement** against selected form type:
  - Point
  - LineString (Linear)
  - Polygon
  - Multi\* geometries are normalized for type matching (e.g., `MultiPolygon` ->
    `Polygon`).
- **Self-intersection check** (`turf.kinks`) where applicable.
- **Polygon ring closure**: checks all polygon/multipolygon rings are closed.
- **Duplicate consecutive vertex check**.
- **Zero/near-zero geometry metrics**:
  - Polygon area must be > epsilon.
  - Line length must be > epsilon.

## 5) Derived Metric and Complexity Threshold Checks

### Enforced (blocking)

- **Total line length cap**: max `2,000,000` meters.
- **Total polygon area cap**: max `50,000,000,000` square meters.

These are computed from uploaded geometry at validation time.

## 6) UI Behavior (Current)

- The form performs validation through the **Validate Spatial File** action.
- Spatial map is displayed in **view-only mode** for preview.
- XML conversion/download actions are removed from the current UI flow.

## 7) Severity Model

Validation issues are tagged as:

- `ERROR` -> blocks successful validation result.
- `WARNING` -> shown to user but does not block success.

## 8) Notes for Future Hardening

If you want to align with stricter security controls, consider moving shapefile
parsing and validation server-side with:

- isolated workers/containers,
- resource quotas and timeouts,
- parser-level CVE patching lifecycle,
- audit logging of upload validation failures.
