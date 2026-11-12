-- An archived resource should now report LIFE_CYCLE_STATUS_CODE = 'RETIRED' on all of its
-- map features, not just the ones carrying a retirement_date of their own.
--
-- Archived resources whose features had no retirement_date were falling through to 'ACTIVE'.
--
-- 'RETIRED' rather than a new 'ARCHIVED' value because BCGW's LIFE_CYCLE_STATUS_CODE is
-- VARCHAR2(7), 'ARCHIVED' does not fit, previous map features were showing 'RETIRED' as well
--
-- A materialized view cannot be replaced in place, so had to be rebuilt.
-- Everything other than the CASE is
-- the same as from V1.1.80.

DROP VIEW IF EXISTS bcgw.recreation_lines;
DROP VIEW IF EXISTS bcgw.recreation_polygons;
DROP MATERIALIZED VIEW IF EXISTS bcgw.recreation_map_features;

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
    WHEN rmf.retirement_date IS NOT NULL
      OR rr.rec_status_code = 'AR'       THEN 'RETIRED'
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
  rmfg.feature_area                                              AS feature_area_ha,
  rmfg.feature_area * 10000                                      AS feature_area_sqm,
  rmfg.feature_perimeter                                         AS feature_perimeter_km,
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
  feature_area_ha                      AS feature_area,
  feature_perimeter_km                 AS feature_perimeter,
  feature_area_sqm,
  feature_perimeter_km * 1000          AS feature_length_m,
  geometry,
  NULL::integer                        AS objectid,
  NULL::bytea                          AS se_anno_cad_data
FROM bcgw.recreation_map_features
WHERE geometry_type_code = 'P';
