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
)
SELECT
    fd.spatial_feature_geometry,
    -- Return site point if available, otherwise return centroid as the site point
    public.st_asgeojson(COALESCE(sd.site_geometry, fd.feature_centroid)) as site_point_geometry,
    -- Use site point if available, otherwise use feature centroid
    -- Calculate latitude and longitude by transforming to WGS84 (SRID 4326)
    CASE
        WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NOT NULL THEN
            public.ST_Y(public.ST_Transform(
                CASE
                    WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                    THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                    ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                END,
                4326
            ))
        ELSE NULL
    END as latitude,
    CASE
        WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NOT NULL THEN
            public.ST_X(public.ST_Transform(
                CASE
                    WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                    THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                    ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                END,
                4326
            ))
        ELSE NULL
    END as longitude,
    -- Calculate UTM zone from longitude
    CASE
        WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NOT NULL THEN
            FLOOR((public.ST_X(public.ST_Transform(
                CASE
                    WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                    THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                    ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                END,
                4326
            )) + 180) / 6)::integer + 1
        ELSE NULL
    END as utm_zone,
    -- Calculate UTM easting
    -- Dynamically calculate the appropriate UTM SRID (326XX for WGS84 UTM Northern Hemisphere)
    CASE
        WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NOT NULL THEN
            ROUND(public.ST_X(public.ST_Transform(
                CASE
                    WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                    THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                    ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                END,
                32600 + FLOOR((public.ST_X(public.ST_Transform(
                    CASE
                        WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                        THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                        ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                    END,
                    4326
                )) + 180) / 6)::integer + 1
            )))::integer
        ELSE NULL
    END as utm_easting,
    -- Calculate UTM northing
    CASE
        WHEN COALESCE(sd.site_geometry, fd.feature_centroid) IS NOT NULL THEN
            ROUND(public.ST_Y(public.ST_Transform(
                CASE
                    WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                    THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                    ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                END,
                32600 + FLOOR((public.ST_X(public.ST_Transform(
                    CASE
                        WHEN public.ST_SRID(COALESCE(sd.site_geometry, fd.feature_centroid)) = 0
                        THEN public.ST_SetSRID(COALESCE(sd.site_geometry, fd.feature_centroid), 3005)
                        ELSE COALESCE(sd.site_geometry, fd.feature_centroid)
                    END,
                    4326
                )) + 180) / 6)::integer + 1
            )))::integer
        ELSE NULL
    END as utm_northing
FROM feature_data fd
LEFT JOIN site_data sd ON fd.rec_resource_id = sd.rec_resource_id;
