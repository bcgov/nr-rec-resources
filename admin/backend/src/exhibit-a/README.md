# Exhibit A Endpoint

`POST /api/v1/exhibit-a/:applicationGuid`

Generates an Exhibit A PDF for a spatial submission by application GUID:

1. Loading submission header and geometry from RST tables.
2. Building ArcGIS `Web_Map_as_JSON`.
3. Calling ArcGIS export task (`execute` or `submitJob` flow).
4. Downloading the generated JPG.
5. Assembling and returning the final PDF.

## Request Body

```json
{
  "scale": 30000,
  "pageSize": "B",
  "pageOrientation": "L",
  "returnJson": false
}
```

All fields are optional.

## Response Modes

- Default: streams `application/pdf` with attachment filename
  `exhibit-a-<submissionId>.pdf`.
- `returnJson=true`: returns a JSON payload including map metadata and
  `pdfBase64`.

## Environment

Optional configuration values:

- `CFG_FTA_MAP_SERVICE`
- `CFG_FTA_ARC_GIS_SERVERS`
