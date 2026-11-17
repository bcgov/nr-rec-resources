-- bcgw.recreation_lines.district_name was returning the district code, not the name.
--
-- The column was aliased from district_code to match what BCGW's own
-- FTEN_RECREATION_LINES_SVW.DISTRICT_NAME holds (VARCHAR2(6), the code). But now this needs to be fixed.
-- The polygon view has always used the real name.
--
-- Have to drop-create the view rather than CREATE/REPLACE because the column's type changes from
-- varchar(6) to varchar(100), which CREATE OR REPLACE VIEW does not allow. The materialized
-- view is untouched. Everything below other than district_name is unchanged from V1.1.103.

DROP VIEW IF EXISTS bcgw.recreation_lines;

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
  district_name,
  NULL::integer                        AS feature_class_skey,
  feature_length,
  feature_length_m,
  geometry,
  NULL::integer                        AS objectid,
  NULL::bytea                          AS se_anno_cad_data
FROM bcgw.recreation_map_features
WHERE geometry_type_code = 'L';
