# Exhibit A generation workflow

This document describes the end-to-end Exhibit A workflow used by the admin geospatial page, including:

- generate/regenerate Exhibit A from a spatial submission
- upload a manual Exhibit A PDF
- list/view/download the latest Exhibit A document

## Scope and entry points

- UI page: `admin/frontend/src/pages/rec-resource-page/components/RecResourceGeospatialSection/RecResourceGeospatialSection.tsx`
- Generate/regenerate API: `POST /api/v1/exhibit-a/:application_guid`
- Upload APIs:
  - `POST /api/v1/recreation-resources/:rec_resource_id/exhibit-a-docs/presign`
  - `POST /api/v1/recreation-resources/:rec_resource_id/exhibit-a-docs/finalize`
- List docs API:
  - `GET /api/v1/recreation-resources/:rec_resource_id/exhibit-a-docs`

## Roles and access

- `GET .../exhibit-a-docs` allows viewer/admin/super-admin.
- `POST .../exhibit-a-docs/presign` and `POST .../exhibit-a-docs/finalize` require super-admin.
- `POST /api/v1/exhibit-a/:application_guid` allows either:
  - `RST_SUPER_ADMIN` (admin app users)
  - `SNCSC_SERVICE` (service-to-service integration)
- In UI, Upload and Regenerate actions are enabled only for super-admin users.

## High-level flow

1. User opens a recreation resource geospatial page.
2. UI loads pending spatial submissions and Exhibit A docs.
3. For each submission row, UI resolves Exhibit A URL from one of:
   - locally updated URL after action in current session
   - `GET .../exhibit-a-docs` response matched by `submission_id`
   - fallback value from pending request row (`exhibit_a_url`)
4. User either:
   - regenerates Exhibit A (system-generated PDF), or
   - uploads a manual PDF.
5. UI invalidates pending request queries and updates table links.

## Regenerate workflow (primary generation path)

### UI behavior

From the row action `Regenerate` in `RecResourceGeospatialSection`:

1. UI checks `application_guid` and `submission_id` exist and user is super-admin.
2. UI shows spinner notification: `Generating Exhibit A...`.
3. UI calls `useCreateOrGetExhibitAByApplicationGuid` with:
   - `applicationGuid`: row `application_guid`
   - `generate: true`
   - `userId`: first available of `idir_username`, `preferred_username`, `email`, else `system`
4. On success, UI stores returned `pdfUrl` by `submission_id` and refreshes pending requests.
5. On failure, UI shows error notification.
6. Spinner notification is removed in `finally`.

### Backend behavior (`POST /api/v1/exhibit-a/:application_guid`)

Controller:

- Endpoint: `ExhibitAController.createOrGetByApplicationGuid`
- Payload type: `CreateExhibitAByApplicationGuidRequestDto`

Service (`ExhibitAService.createOrGetByApplicationGuid`):

1. Load submission by `application_guid` from `rst.recreation_spatial_submission`.
2. Persist adjudication fields on the submission:
   - `adjudication_comment` (JSON string or `null`)
   - `updated_by`, `created_by` (if empty), `updated_at`
3. Since `generate=true`, call `generate(submission_id, options)`.
4. Generation pipeline:
   - load submission header and map features
   - compute extent and derived geometry metrics
   - determine map scale, page size, orientation (unless explicitly requested)
   - resolve ArcGIS MapServer and visible layers
   - export map image via ArcGIS print/export endpoint
   - render PDF with `ExhibitAPdfBuilder`
   - upload PDF to S3 and obtain signed download URL
5. Save generated document metadata in `rst.recreation_exhibit_a_doc`:
   - deletes older row for same `rec_resource_id + submission_id`
   - inserts new row with `generation_method='regenerate'`
   - stores page size/orientation/scale, file size, audit fields
6. Return:
   - `submissionId`
   - signed `pdfUrl`
   - `size`, `orientation`, `scale`

## Technical generation specs

### Regenerate request contract

Endpoint: `POST /api/v1/exhibit-a/:application_guid`

Required body fields:

- `userId` (string, max 100)
- `generate` (boolean)

Optional body fields:

- `size` (`A|B|C|D|E`)
- `orientation` (`P|L`)
- `scale` (allowed: `5000,10000,15000,20000,30000,50000,75000,100000`)
- `adjudicationComments[]`

Behavior:

- If optional layout values are omitted, service derives them from geometry extent.
- If `generate=false`, service returns latest existing Exhibit A record URL (no new PDF generation).

### ArcGIS dependency and payload details

Generation uses two ArcGIS endpoints:

1. FTA MapServer base URL (for layers):
   - template from `CFG_FTA_ARC_GIS_SERVERS` or default
   - default template: `https://test.maps.gov.bc.ca/arcgis/rest/services/fta/%d/MapServer`
2. ArcGIS Export Web Map task (for rendered image):
   - from `CFG_FTA_MAP_SERVICE` or default
   - default: `https://test.maps.gov.bc.ca/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute`

MapServer resolution:

- Service tries requested scale first.
- If unavailable, it tries nearest known scales.
- It fetches visible layer IDs from `?f=pjson` or `/layers?f=pjson`.

Export request payload (`application/x-www-form-urlencoded`) includes:

- `Web_Map_as_JSON`: serialized web map object
- `Format=jpg`
- `f=json`
- `returnZ=true`, `returnM=true`
- `env:outSR` and `env:processSR` as empty strings

`Web_Map_as_JSON` structure includes:

- `baseMap.baseMapLayers[0].url`: selected FTA MapServer URL
- operational layer `fta-mapserver` with `visibleLayers`
- operational layer `submission-geometry` with feature collection containing:
  - submission geometry features (line/polygon/point) with renderer symbols
  - endpoint layers for P of C (green triangle) and P of T (red triangle)
  - label layer for section IDs
- `mapOptions`:
  - computed extent (WGS84)
  - selected `scale`
- `exportOptions`:
  - `outputSize` computed from PDF map frame size and DPI
  - `dpi` clamped between 72 and 200
- `layoutOptions`:
  - title text `Exhibit A`
  - metric scale bar configuration

ArcGIS response handling:

- Service searches JSON response for first HTTP(S) output URL.
- That URL is downloaded as binary map image.
- Missing output URL raises upstream gateway error with ArcGIS diagnostics.

### PDF composition details (`ExhibitAPdfBuilder`)

Input into PDF builder:

- `header` metadata
- `pageSize`, `pageOrientation`, `scale`
- downloaded ArcGIS map image bytes
- coordinate rows (section list + PofC/PofT UTM values)

Bundled static assets used:

- `rst_logo.png` (header branding)
- `legend.jpg` (legend panel)
- `north_arrow4.jpg` (north arrow)

PDF layout sections:

1. Title/header band
   - BC Recreation Sites and Trails logo
   - centered title `EXHIBIT A`
2. Metadata grid
   - `MAP OF`, natural resource district, recreation district
   - map projection (`NAD 1983 BC Env Albers`)
   - project type
   - submission ID
   - drawn by
   - date
   - map sheet line
   - UTM location line
   - geometry-dependent metrics:
     - polygon: area
     - linear: right-of-way + length
     - mixed: area + right-of-way + length
3. Main map frame
   - ArcGIS rendered map image
   - computed scale bar
4. Sidebar
   - north arrow
   - legend image
   - section coordinates list (auto-fit font/columns)
   - continuation pages if section list overflows

Map image fitting behavior:

- Builder first computes exact map frame dimensions in PDF points.
- Service requests ArcGIS image using that aspect ratio/size.
- This keeps printed scale accurate and avoids stretch/crop drift.

### Header fields persisted and rendered

Header values are loaded from joined submission/resource/org-unit data and include:

- identifiers: `submission_id`, `application_guid`, `tenure_id`
- naming/context: `title`, `district_name`, `forest_district`, `forest_region`
- project typing: `mgt_unit_type`, `project_type`
- map placement: `utm_zone`, `utm_easting`, `utm_northing`
- geometric stats: `area_ha`, `width_m`, `length_km`, `geometry_mode`
- audit/display: `drawn_by`, `submission_date`

## Get existing Exhibit A by application GUID (no regeneration)

Same endpoint, with `generate=false`:

1. Submission adjudication fields are still updated.
2. Service loads latest row from `rst.recreation_exhibit_a_doc` for `submission_id`.
3. If found, service returns a signed URL to existing `s3_key` and saved map metadata.
4. If not found, service returns `404 Not Found`.

## Manual upload workflow (override/fallback path)

### UI behavior

From row action `Upload`:

1. UI opens file picker (`accept=application/pdf`).
2. User confirms filename in `DocumentUploadModal`.
3. UI calls presign mutation with `{ recResourceId, fileName: <name>.pdf }`.
4. UI uploads file bytes directly to returned S3 `url` using HTTP `PUT`.
5. UI calls finalize mutation with:
   - `submission_id`
   - `document_id` from presign response
   - file metadata (`file_name`, `extension`, `file_size`)
6. On success, UI stores returned URL for the row and refreshes pending requests.
7. On failure, UI shows upload error notification.

### Backend behavior

Presign (`POST .../exhibit-a-docs/presign`):

1. Validate recreation resource exists.
2. Create `document_id` (UUID).
3. Build S3 key: `{rec_resource_id}/{document_id}/{file_name}`.
4. Return presigned PUT URL and key.

Finalize (`POST .../exhibit-a-docs/finalize`):

1. Validate recreation resource exists and `document_id` format.
2. Build final `s3_key`: `{rec_resource_id}/{document_id}/{file_name}.{extension}`.
3. If `submission_id` provided, delete existing docs for same submission/resource.
4. Insert row into `rst.recreation_exhibit_a_doc` with:
   - `generation_method='upload'`
   - submission link and file metadata
5. Return inserted document with signed `url`.

## Data model notes

Primary table: `rst.recreation_exhibit_a_doc`

Important columns used by workflow:

- identity/linking: `doc_id`, `rec_resource_id`, `submission_id`
- file metadata: `file_name`, `extension`, `file_size`, `s3_key`
- generation metadata: `generation_method`, `page_size`, `page_orientation`, `scale`
- auditing/timestamps: `created_by`, `updated_by`, `created_at`, `updated_at`

There is exactly one active Exhibit A row per `rec_resource_id + submission_id` after each upload/regenerate operation, because each operation deletes prior rows for that pair before insert.

## Error and recovery behavior

- Missing submission, resource, or document rows return `404`.
- ArcGIS/S3/network upstream failures are surfaced as gateway-style errors from generation service.
- UI catches action errors and shows notifications.
- Signed URLs are ephemeral; UI refresh/list actions obtain fresh signed URLs from backend.

## Related components and hooks

- Frontend hooks:
  - `useCreateOrGetExhibitAByApplicationGuid`
  - `usePresignExhibitAUpload`
  - `useFinalizeExhibitAUpload`
  - `useGetExhibitADocs`
- Backend services:
  - `ExhibitAService` (generation/regeneration path)
  - `ExhibitADocsService` (upload/list/delete path)

## Quick verification checklist

- Regenerate button enabled only for super-admin and rows with `application_guid`.
- Successful regenerate sets `generation_method` to `regenerate` in DB row.
- Successful upload sets `generation_method` to `upload` in DB row.
- Table row View/Download links open returned signed URL.
- Re-running regenerate/upload for same submission replaces prior row.

