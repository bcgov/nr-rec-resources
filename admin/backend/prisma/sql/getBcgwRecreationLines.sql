-- @param {Int} $1:limit
-- @param {Int} $2:offset
SELECT
  rmf_skey,
  forest_file_id,
  section_id,
  recreation_map_feature_code,
  project_type,
  retirement_date,
  amendment_id,
  map_label,
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
  feature_length,
  feature_length_m,
  geometry,
  COUNT(*) OVER ()::int AS total_count
FROM bcgw.recreation_lines
ORDER BY rmf_skey ASC
LIMIT $1
OFFSET $2;
