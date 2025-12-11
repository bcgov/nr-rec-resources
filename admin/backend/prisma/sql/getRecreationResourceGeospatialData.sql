-- Get geospatial data including spatial geometries and calculated coordinates
-- This query is specifically for the geospatial endpoint
-- It transforms coordinates from the source SRID to WGS84 (lat/long) and UTM
-- If there's no site point, it calculates from the centroid of the spatial features
-- If geometry has no SRID (SRID=0), assumes BC Albers (SRID 3005)

WITH feature_data AS (
    SELECT
        rmf.rec_resource_id,
        array_agg(public.st_asgeojson(rmfg.geometry)) as spatial_feature_geometry,
        public.ST_Centroid(public.ST_Collect(rmfg.geometry)) as feature_centroid
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
-- Normalize SRID: use site point if available, otherwise feature centroid
-- If SRID is 0, assume BC Albers (3005)
normalized_geometry AS (
    SELECT
        fd.spatial_feature_geometry,
        COALESCE(sd.site_geometry, fd.feature_centroid) as source_geometry,
        CASE
            WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NULL THEN NULL
            WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
            THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
            ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
        END as geometry_with_srid
    FROM feature_data fd
    LEFT JOIN site_data sd ON fd.rec_resource_id = sd.rec_resource_id
),
-- Transform to WGS84 and extract coordinates
wgs84_coords AS (
    SELECT
        spatial_feature_geometry,
        source_geometry,
        geometry_with_srid,
        public.ST_Transform(geometry_with_srid, 4326) as wgs84_geometry,
        public.ST_X(public.ST_Transform(geometry_with_srid, 4326)) as longitude_raw,
        public.ST_Y(public.ST_Transform(geometry_with_srid, 4326)) as latitude_raw
    FROM normalized_geometry
    WHERE geometry_with_srid IS NOT NULL
),
-- Calculate UTM zone and SRID
utm_params AS (
    SELECT
        spatial_feature_geometry,
        source_geometry,
        geometry_with_srid,
        wgs84_geometry,
        longitude_raw,
        latitude_raw,
        FLOOR((longitude_raw + 180) / 6)::integer + 1 as utm_zone,
        32600 + FLOOR((longitude_raw + 180) / 6)::integer + 1 as utm_srid
    FROM wgs84_coords
)
SELECT
    spatial_feature_geometry,
    public.st_asgeojson(source_geometry) as site_point_geometry,
    ROUND(latitude_raw::numeric, 4) as latitude,
    ROUND(longitude_raw::numeric, 4) as longitude,
    utm_zone,
    ROUND(public.ST_X(public.ST_Transform(geometry_with_srid, utm_srid)))::integer as utm_easting,
    ROUND(public.ST_Y(public.ST_Transform(geometry_with_srid, utm_srid)))::integer as utm_northing
FROM utm_params;
