# Geospatial data and spatial calculations

This document describes how geospatial data is stored and how **total length**,
**total area**, and **right-of-way** are calculated for recreation resources
(sites and trails) in the admin backend.

## Source data

- **Feature geometry:** `rst.recreation_map_feature` +
  `rst.recreation_map_feature_geom` — polygons (sites) or linear features
  (trails).
- **Site point:** `rst.recreation_site_point` — point used for UTM/lat-long and
  map pin.
- **Right-of-way:** `rst.recreation_resource.right_of_way` — width in metres
  (used for linear features only).

Implementation:
`admin/backend/prisma/sql/getRecreationResourceGeospatialData.sql` and the
geospatial API/service.

## SRID normalization

Stored geometries may have **SRID = 0** (unknown). For correct area, length,
perimeter, and coordinate transforms they are normalized to **BC Albers
(SRID 3005)** when SRID is 0:

- `rst.recreation_map_feature_geom.geometry` — normalized before `ST_Area`,
  `ST_Perimeter`, `ST_Length`.
- `rst.recreation_site_point.geometry` — normalized before `ST_Transform` to
  WGS84/UTM.

If a geometry already has a non-zero SRID, it is left unchanged.

## Total length (`total_length_km`)

- **Polygons (sites):** Sum of **perimeter** of all polygon/multi-polygon parts
  (metres → km, 4 decimal places).
- **Linear (trails):** Sum of **length** of all line/multi-line parts (metres →
  km, 4 decimal places).

For resources that have both (unusual), both contributions are summed.

## Total area (`total_area_hectares`)

- **Polygons:** Sum of **area** of all polygon/multi-polygon parts in BC Albers
  (m² → hectares, 4 decimal places).
- **Linear:** Trail area = `length_km × right_of_way_m / 10` (hectares), only
  when `right_of_way_m` is set.

Total area = polygon area + trail area (if any).

## Right-of-way (`right_of_way_m`)

Read from `rst.recreation_resource.right_of_way` (metres). Used for linear
features to compute trail area; displayed in the admin UI as "Right-of-way width
(m)".

## Coordinate output

- **Site point only:** Lat/long (WGS84) and UTM zone, easting, northing are
  derived from `rst.recreation_site_point` after normalizing SRID and
  transforming to the appropriate CRS.
- If there is no site point, coordinate fields are NULL.
