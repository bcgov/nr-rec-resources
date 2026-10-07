# Spatial Submission Validation Checks

This is the current validation inventory for the spatial submission flow.

## Sources

- `admin/frontend/src/components/RecResourceSpatial/spatialSubmissionUtils.ts`
- `admin/frontend/src/components/RecResourceSpatial/spatialSubmission.geometryValidation.ts`
- `admin/frontend/src/components/RecResourceSpatial/spatialSubmission.sectionIds.ts`
- `admin/frontend/src/components/RecResourceSpatial/SpatialSubmissionSection.tsx`

## Severity model

- `ERROR`: blocking
- `WARNING`: non-blocking

## 1) Upload and file parsing validations

These validations are surfaced in the UI as:

- `Unable to parse shapefile: <error message>`

### File selection and extension checks

- Invalid extension / suspicious filename
  - `Upload either one .zip shapefile bundle or .shp with an optional matching .dbf.`
- File too large (> 10 MB)
  - `Spatial file exceeds 10MB limit.`
- No files selected
  - `A .shp file is required.`
- More than one `.zip`
  - `Please upload only one .zip file at a time.`
- `.zip` mixed with other files
  - `Upload either one .zip file or .shp/.dbf files, not both.`
- Missing `.shp`
  - `A .shp file is required.`
- More than one `.shp`
  - `Please upload only one .shp file at a time.`
- More than one `.dbf`
  - `Please upload only one .dbf file at a time.`

### ZIP content checks

- Multiple shapefile layers in one zip
  - `The uploaded .zip contains multiple shapefile layers. Please zip only one shapefile dataset (.shp/.shx/.dbf/.prj/.cpg) and re-upload.`
- `.shp` exists but `.dbf` missing
  - `The .zip contains "<file>.shp" but no .dbf file, so no attributes (including Section ID) can be read. Add the matching .dbf to the .zip and re-upload.`
- `.shp` and `.dbf` names do not match
  - `The .zip contains "<file>.shp" and "<file>.dbf" but their filenames don't match, so attributes couldn't be linked to geometry. Rename them to share the same base name (e.g. both "trail.shp" and "trail.dbf"), re-zip, and re-upload.`
- Parsed ZIP does not contain a valid layer
  - `Uploaded archive did not contain a valid shapefile layer.`
- Parsed ZIP has no shapefile layers
  - `No shapefile layers were found in the uploaded .zip file.`
- Unsupported parsed ZIP payload
  - `Unable to parse uploaded .zip shapefile bundle.`
- Parsed ZIP has no features
  - `No features found in uploaded .zip shapefile bundle.`
- Parsed ZIP features have no attributes
  - `Zip parsed geometry but no attributes were found. Ensure the .zip contains a matching .dbf (and optional .cpg) with the same basename as the .shp.`
- Parsed ZIP features missing geometry
  - `Zip parsing resulted in <n> features without geometry. The .shp/.dbf files may be corrupted.`

### SHP/DBF binary checks

- `.shp` / `.dbf` stem mismatch
  - `The .dbf filename must match the uploaded .shp filename.`
- Incomplete SHP header (<100 bytes)
  - `Invalid shapefile: header is incomplete.`
- Wrong SHP magic number
  - `Invalid shapefile signature (magic number mismatch).`
- SHP header bbox has NaN/Infinity
  - `Invalid shapefile header bbox: contains NaN or Infinity.`
- SHP header bbox outside BC extent
  - `Shapefile header extent lies outside supported BC bounds (EPSG:3005).`
- Parsed SHP has no features
  - `No features found in shapefile.`

## 2) Section ID attribute validations

These come from `extractSectionIdDetails`.

### Warnings

- No Section ID field but attributes exist
  - `No Section ID field was found among the uploaded attributes (<field list>). Expected a field such as SECTION_ID.`
- No Section ID field and no attributes at all
  - `No Section ID field was found: the uploaded file has no attributes at all.`

### Errors

- Missing Section ID values
  - Code: `SECTION_ID_MISSING`
  - `<n> feature(s) are missing a <fieldName> value: #<feature>, #<feature>.`
- Duplicate Section ID values
  - Code: `SECTION_ID_DUPLICATE`
  - `Section ID "<value>" is used by <n> features (#<feature>, #<feature>); each feature should have a unique <fieldName>.`

## 3) Geometry and topology validations

These come from `validateGeometry` and are shown as `[<type>] <message>`.

### CRS

- Type: `CRS`, Severity: `WARNING`, Code: `CRS_MISMATCH`
  - `Source CRS (<source>) does not match expected EPSG:3005. Reprojection may be required.`

### Geometry integrity and limits

- Type: `GEOMETRY`, Severity: `ERROR`
  - `Shapefile contains no feature geometries.`
  - `Feature count (<count>) exceeds limit (5000).`
  - `Feature #<n> has no geometry.`
  - `Feature #<n> contains NaN or Infinity coordinate values.`
  - `Feature #<n> vertex count (<count>) exceeds per-feature limit (50000).`
  - `Feature #<n> contains duplicate consecutive vertices.`
  - `Feature #<n>: self-intersections/bow-tie detected.`
  - `Feature #<n> has zero or near-zero polygon area.`
  - `Feature #<n> ring #<n>: LinearRing is not closed.`
  - `Feature #<n> polygon #<n> ring #<n>: LinearRing is not closed.`
  - `Feature #<n> has zero or near-zero line length.`
  - `Total vertex count (<count>) exceeds file limit (200000).`
  - `<n> feature(s) have geometry type (<actual types>) but expected <Point|LineString|Polygon>.`

### Extent

- Type: `EXTENT`, Severity: `WARNING`, Code: `EXTENT_VERIFICATION_RECOMMENDED`
  - `Feature #<n> coordinates appear to be outside typical BC bounds. Verify the coordinate system is EPSG:3005.`

### Polygon topology

- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `POLYGON_REQUIRES_MULTIPOLYGON`
  - `Feature #<n> is a Polygon with multiple disjoint parts. Use MultiPolygon instead.`
- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `MULTIPLE_POLYGON_FEATURES`
  - `The file contains <count> separate polygon records. Combine them into a single MultiPolygon record (one record per REC).`
- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `POLYGON_OVERLAP`
  - `Feature #<a> overlaps Feature #<b>. Polygon areas must not overlap.`
- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `POLYGON_SEPARATION_EXCEEDED`
  - `Distance between Feature #<a> and Feature #<b> (<distance>m) exceeds 500m.`

### Line topology

- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `LINE_DUPLICATE`
  - `Feature #<b> duplicates Feature #<a>.`
- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `LINE_OVERLAP`
  - `Feature #<a> overlaps Feature #<b>. Lines must not overlap.`

### Point topology

- Type: `TOPOLOGY`, Severity: `ERROR`, Code: `NODE_OVERLAP`
  - `Overlapping nodes detected at (<x>, <y>): Feature #<a>, Feature #<b>.`

## 4) Form-level validation messages

These are not `ValidationIssue` entries, but are part of the current validation
UX.

- Required field inline feedback
  - `This is required.`
- Missing required metadata/selection fields when creating request
  - `Please complete required fields: <field labels>.`
- Create request attempted before successful spatial validation
  - `Please validate a shapefile before creating the request.`

## 5) Validation success / workflow notices

- Validation success notice
  - `Spatial file validated successfully.`
- District options load warning
  - `Unable to load district/type options. Please refresh and try again.`
