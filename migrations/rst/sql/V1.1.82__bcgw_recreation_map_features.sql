-- Add recreation line and polygon layers to the bcgw schema.
--
-- bcgw.recreation_map_features  — materialized view; one row per rmf_skey (lines + polygons)
-- bcgw.recreation_lines         — thin view; backs FTEN_RECREATION_LINES_SVW / FTEN_REC_TRAILS_SVW
-- bcgw.recreation_polygons      — thin view; backs FTEN_RECREATION_POLY_SVW
--
-- geometry_type_code values in rst.recreation_map_feature_geom: 'L' (line), 'P' (polygon)
-- Feature measurements: FTA/RST stores feature_area in hectares, feature_length in kilometres.
-- BCGW FEATURE_LENGTH is also in kilometres (FEATURE_LENGTH_M is the metres equivalent).
-- feature_area is converted ha → m² (* 10000) for the polygon layer.
-- DISTRICT_NAME on the line layer is VARCHAR2(6) in BCGW — confirmed from actual data to hold
-- the district code (e.g. 'DCC'), not the full org unit name.

CREATE MATERIALIZED VIEW bcgw.recreation_map_features AS
WITH
campsite_counts AS (
  SELECT rec_resource_id, COUNT(*) AS defined_campsites
  FROM rst.recreation_defined_campsite
  GROUP BY rec_resource_id
)
SELECT
  rmf.rmf_skey,
  rmf.rec_resource_id                                            AS forest_file_id,
  rmf.section_id,
  rmf.recreation_resource_type                                   AS recreation_map_feature_code,
  rtc.description                                                AS project_type,
  rmf.retirement_date,
  rmf.amendment_id,
  CASE
    WHEN rmf.retirement_date IS NOT NULL THEN 'RETIRED'
    WHEN rr.rec_status_code = 'PE'       THEN 'PENDING'
    ELSE 'ACTIVE'
  END                                                            AS life_cycle_status_code,
  rr.name                                                        AS project_name,
  rf.recreation_feature_code,
  rr.resource_feature_ind,
  rr.right_of_way,
  rr.arch_impact_assess_ind,
  rr.closest_community                                           AS site_location,
  rr.project_established_date,
  CASE WHEN rr.display_on_public_site THEN 'Y' ELSE 'N' END     AS recreation_view_ind,
  rr.district_code                                               AS recreation_district_code,
  COALESCE(cc.defined_campsites, 0)                              AS defined_campsites,
  rr.rec_status_code                                             AS file_status_code,
  nrou.district_code,
  nrou.org_unit_name                                             AS district_name,
  rmfg.geometry_type_code,
  rmfg.feature_length                                             AS feature_length,
  rmfg.feature_length * 1000                                     AS feature_length_m,
  rmfg.feature_area * 10000                                      AS feature_area,
  rmfg.feature_area * 10000                                      AS feature_area_sqm,
  rmfg.feature_perimeter * 1000                                  AS feature_perimeter,
  ST_AsGeoJSON(ST_Transform(ST_SetSRID(rmfg.geometry, 3005), 4326)) AS geometry
FROM rst.recreation_map_feature rmf
LEFT JOIN rst.recreation_map_feature_geom rmfg
  ON rmf.rmf_skey = rmfg.rmf_skey
LEFT JOIN rst.recreation_resource_type_code rtc
  ON rmf.recreation_resource_type = rtc.rec_resource_type_code
LEFT JOIN rst.recreation_resource rr
  ON rmf.rec_resource_id = rr.rec_resource_id
LEFT JOIN rst.recreation_feature rf
  ON rmf.rec_resource_id = rf.rec_resource_id
LEFT JOIN rst.natural_resource_org_unit nrou
  ON rmf.rec_resource_id = nrou.rec_resource_id
LEFT JOIN campsite_counts cc
  ON rmf.rec_resource_id = cc.rec_resource_id;

CREATE UNIQUE INDEX ON bcgw.recreation_map_features (rmf_skey);

-- BCGW-facing views — thin lenses over the materialized view above.
-- Column order matches the BCGW layer property definitions exactly.

CREATE VIEW bcgw.recreation_lines AS
SELECT
  rmf_skey,
  forest_file_id,
  section_id,
  recreation_map_feature_code,
  project_type,
  retirement_date,
  amendment_id,
  COALESCE(forest_file_id || ' ' || section_id, forest_file_id) AS map_label,
  project_name,
  recreation_feature_code,
  resource_feature_ind,
  right_of_way,
  arch_impact_assess_ind,
  site_location,
  project_established_date,
  recreation_view_ind,
  recreation_district_code,
  defined_campsites,
  life_cycle_status_code,
  file_status_code,
  district_code,
  district_code                        AS district_name,
  NULL::integer                        AS feature_class_skey,
  feature_length,
  feature_length_m,
  geometry,
  NULL::integer                        AS objectid,
  NULL::bytea                          AS se_anno_cad_data
FROM bcgw.recreation_map_features
WHERE geometry_type_code = 'L';

CREATE VIEW bcgw.recreation_polygons AS
SELECT
  rmf_skey,
  forest_file_id,
  section_id,
  recreation_map_feature_code,
  project_type,
  retirement_date,
  amendment_id,
  forest_file_id                       AS map_label,
  project_name,
  recreation_feature_code,
  resource_feature_ind,
  arch_impact_assess_ind,
  site_location,
  project_established_date,
  recreation_view_ind,
  recreation_district_code,
  defined_campsites,
  life_cycle_status_code,
  file_status_code,
  district_code                        AS geographic_district_code,
  district_name                        AS geographic_district_name,
  NULL::integer                        AS feature_class_skey,
  feature_area,
  feature_perimeter,
  feature_area_sqm,
  feature_length_m,
  geometry,
  NULL::integer                        AS objectid,
  NULL::bytea                          AS se_anno_cad_data
FROM bcgw.recreation_map_features
WHERE geometry_type_code = 'P';

-- Add the new materialized view to the existing pg_cron refresh schedule.
-- cron.schedule with the same job name performs an upsert, replacing the prior command.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_available_extensions
        WHERE name = 'pg_cron'
    ) THEN
        RAISE NOTICE 'pg_cron not available, skipping schedule update.';
        RETURN;
    END IF;

    BEGIN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron exists but cannot be loaded, skipping.';
        RETURN;
    END;

    PERFORM cron.schedule(
        'refresh_rsts_materialized_views',
        '*/5 * * * *',
        $sql$
            REFRESH MATERIALIZED VIEW rst.recreation_resource_access_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_district_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_type_count_view;
            REFRESH MATERIALIZED VIEW rst.recreation_resource_search_view;
            REFRESH MATERIALIZED VIEW CONCURRENTLY bcgw.resource_details_and_closures;
            REFRESH MATERIALIZED VIEW CONCURRENTLY bcgw.recreation_map_features;
        $sql$
    );
END;
$$;
