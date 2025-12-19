-- Get geospatial data including spatial geometries and site point coordinates
-- This query is specifically for the geospatial endpoint
-- It transforms coordinates from the site point to WGS84 (lat/long) and UTM
-- Only returns coordinate data if a site point exists; coordinates are NULL otherwise
-- If geometry has no SRID (SRID=0), assumes BC Albers (SRID 3005)

WITH feature_data AS (
    SELECT
        rmf.rec_resource_id,
        array_agg(public.st_asgeojson(rmfg.geometry)) as spatial_feature_geometry
    FROM rst.recreation_map_feature rmf
    INNER JOIN rst.recreation_map_feature_geom rmfg USING (rmf_skey)
    WHERE rmf.rec_resource_id = $1
        AND rmf.retirement_date IS NULL
    GROUP BY rmf.rec_resource_id
),
site_data AS (
    SELECT
        rec_resource_id,
        geometry as site_geometry
    FROM rst.recreation_site_point
    WHERE rec_resource_id = $1
),
-- Normalize SRID for site point: if SRID is 0, assume BC Albers (3005)
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
-- Transform site point to WGS84 and extract coordinates
site_coordinates AS (
    SELECT
        rec_resource_id,
        site_geometry,
        geometry_with_srid,
        public.ST_Transform(geometry_with_srid, 4326) as wgs84_geometry,
        public.ST_X(public.ST_Transform(geometry_with_srid, 4326)) as longitude_raw,
        public.ST_Y(public.ST_Transform(geometry_with_srid, 4326)) as latitude_raw,
        FLOOR((public.ST_X(public.ST_Transform(geometry_with_srid, 4326)) + 180) / 6)::integer + 1 as utm_zone,
        32600 + FLOOR((public.ST_X(public.ST_Transform(geometry_with_srid, 4326)) + 180) / 6)::integer + 1 as utm_srid
    FROM site_geometry_normalized
    WHERE geometry_with_srid IS NOT NULL
)
SELECT
    COALESCE(fd.spatial_feature_geometry, ARRAY[]::text[]) as spatial_feature_geometry,
    public.st_asgeojson(sc.site_geometry) as site_point_geometry,
    ROUND(sc.latitude_raw::numeric, 4) as latitude,
    ROUND(sc.longitude_raw::numeric, 4) as longitude,
    sc.utm_zone,
    ROUND(public.ST_X(public.ST_Transform(sc.geometry_with_srid, sc.utm_srid)))::integer as utm_easting,
    ROUND(public.ST_Y(public.ST_Transform(sc.geometry_with_srid, sc.utm_srid)))::integer as utm_northing
FROM feature_data fd
FULL OUTER JOIN site_coordinates sc ON fd.rec_resource_id = sc.rec_resource_id;
