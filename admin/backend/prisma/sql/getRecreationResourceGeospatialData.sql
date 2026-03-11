-- Get geospatial data including spatial geometries and site point coordinates.
-- Used by: geospatial endpoint (GET /recreation-resources/:id/geospatial).
-- Returns at most one row per rec_resource_id ($1).
--
-- Output: spatial_feature_geometry (GeoJSON array), total_length_km, total_area_hectares,
-- right_of_way_m, site point (geometry + lat/long + UTM zone/easting/northing).
-- Coordinates are NULL when no site point exists. SRID=0 is treated as BC Albers (3005).
--
-- CTE flow: feature geom (normalize SRID → type → aggregate area/perimeter/length)
--           site point (normalize SRID → WGS84 → lon/lat + UTM zone → single UTM transform → easting/northing)
--           FULL OUTER JOIN feature + site so we get a row even with only features or only site point.

WITH
-- Feature geometry: map features (polygons or lines) for this resource. Normalize SRID for area/length math.
feature_geom_normalized AS (
    SELECT
        rmf.rec_resource_id,
        rmfg.geometry,
        CASE
            WHEN public.ST_SRID(rmfg.geometry) = 0
            THEN public.ST_SetSRID(rmfg.geometry, 3005)
            ELSE rmfg.geometry
        END AS geom_3005
    FROM rst.recreation_map_feature rmf
    INNER JOIN rst.recreation_map_feature_geom rmfg USING (rmf_skey)
    WHERE rmf.rec_resource_id = $1
        AND rmf.retirement_date IS NULL
),
-- Single ST_GeometryType per row so we can branch on polygon vs line in aggregates.
feature_geom_typed AS (
    SELECT
        rec_resource_id,
        geometry,
        geom_3005,
        public.ST_GeometryType(geom_3005) AS geom_type
    FROM feature_geom_normalized
),
-- Aggregate: GeoJSON array of features; polygon area (m²→ha) and perimeter (m→km); line length (m→km).
feature_data AS (
    SELECT
        rec_resource_id,
        array_agg(public.st_asgeojson(geometry)) AS spatial_feature_geometry,
        ROUND(SUM(
            CASE
                WHEN geom_type IN ('ST_Polygon', 'ST_MultiPolygon')
                THEN public.ST_Area(geom_3005)
                ELSE 0
            END
        )::numeric / 10000, 4) AS total_area_hectares,
        ROUND(SUM(
            CASE
                WHEN geom_type IN ('ST_Polygon', 'ST_MultiPolygon')
                THEN public.ST_Perimeter(geom_3005)
                ELSE 0
            END
        )::numeric / 1000, 4) AS perimeter_km,
        ROUND(SUM(
            CASE
                WHEN geom_type IN ('ST_LineString', 'ST_MultiLineString')
                THEN public.ST_Length(geom_3005)
                ELSE 0
            END
        )::numeric / 1000, 4) AS length_km
    FROM feature_geom_typed
    GROUP BY rec_resource_id
),
-- Site point: single point per resource (map pin / UTM source). At most one row.
site_data AS (
    SELECT
        rec_resource_id,
        geometry as site_geometry
    FROM rst.recreation_site_point
    WHERE rec_resource_id = $1
),
-- Normalize site point SRID so ST_Transform has a defined CRS.
site_geometry_normalized AS (
    SELECT
        sd.rec_resource_id,
        sd.site_geometry,
        CASE
            WHEN sd.site_geometry IS NULL THEN NULL
            WHEN public.ST_SRID(sd.site_geometry) = 0
            THEN public.ST_SetSRID(sd.site_geometry, 3005)
            ELSE sd.site_geometry
        END as geometry_with_srid
    FROM site_data sd
),
-- One WGS84 transform per site point; used for lat/long and to compute UTM zone.
site_coordinates_wgs84 AS (
    SELECT
        rec_resource_id,
        site_geometry,
        geometry_with_srid,
        public.ST_Transform(geometry_with_srid, 4326) AS wgs84
    FROM site_geometry_normalized
    WHERE geometry_with_srid IS NOT NULL
),
-- Lon/lat once; reused for UTM zone (avoids duplicate ST_X(wgs84) in next CTE).
site_coordinates_xy AS (
    SELECT
        rec_resource_id,
        site_geometry,
        geometry_with_srid,
        public.ST_X(wgs84) AS longitude_raw,
        public.ST_Y(wgs84) AS latitude_raw
    FROM site_coordinates_wgs84
),
-- UTM zone from longitude (zone 1–60); utm_srid = 32600 + zone for Northern Hemisphere.
site_coordinates AS (
    SELECT
        rec_resource_id,
        site_geometry,
        geometry_with_srid,
        longitude_raw,
        latitude_raw,
        (FLOOR((longitude_raw + 180) / 6)::integer + 1) AS utm_zone,
        (32600 + FLOOR((longitude_raw + 180) / 6)::integer + 1) AS utm_srid
    FROM site_coordinates_xy
),
-- Single UTM transform per site point; easting/northing from ST_X/ST_Y (avoids second ST_Transform).
site_utm_geom AS (
    SELECT
        sc.rec_resource_id,
        sc.site_geometry,
        sc.geometry_with_srid,
        sc.longitude_raw,
        sc.latitude_raw,
        sc.utm_zone,
        sc.utm_srid,
        public.ST_Transform(sc.geometry_with_srid, sc.utm_srid) AS utm_geom
    FROM site_coordinates sc
),
site_coordinates_with_utm AS (
    SELECT
        rec_resource_id,
        site_geometry,
        geometry_with_srid,
        longitude_raw,
        latitude_raw,
        utm_zone,
        utm_srid,
        ROUND(public.ST_X(utm_geom))::integer AS utm_easting,
        ROUND(public.ST_Y(utm_geom))::integer AS utm_northing
    FROM site_utm_geom
)
SELECT
    COALESCE(fd.spatial_feature_geometry, ARRAY[]::text[]) AS spatial_feature_geometry,
    -- Total length: polygon perimeter + linear length (km, 4 dp).
    COALESCE(fd.perimeter_km, 0) + COALESCE(fd.length_km, 0) AS total_length_km,
    -- Total area: polygon area + trail area (length_km × right_of_way_m / 10 → ha). COALESCE for FULL OUTER JOIN when fd is null.
    ROUND(
        COALESCE(fd.total_area_hectares, 0)
        + CASE
            WHEN fd.length_km IS NOT NULL AND rr.right_of_way IS NOT NULL
            THEN (fd.length_km * rr.right_of_way)::numeric / 10
            ELSE 0
          END,
        4
    ) AS total_area_hectares,
    rr.right_of_way AS right_of_way_m,
    public.st_asgeojson(sc.site_geometry) AS site_point_geometry,
    ROUND(sc.latitude_raw::numeric, 4) AS latitude,
    ROUND(sc.longitude_raw::numeric, 4) AS longitude,
    sc.utm_zone,
    sc.utm_easting,
    sc.utm_northing
FROM feature_data fd
FULL OUTER JOIN site_coordinates_with_utm sc ON fd.rec_resource_id = sc.rec_resource_id
LEFT JOIN rst.recreation_resource rr ON rr.rec_resource_id = $1;  -- right_of_way (m) for trail area
