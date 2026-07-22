-- @param {Int} $1:limit
-- @param {Int} $2:offset
SELECT
  forest_file_id,
  project_name,
  project_type_code,
  project_type,
  project_established_date,
  closure_ind,
  closure_date,
  closure_type,
  closure_comment,
  recreation_view_ind,
  file_status_st,
  status_description,
  site_location,
  defined_campsites,
  site_description_brief,
  arch_impact_assess_ind,
  tenure_app_total_area,
  tenure_app_total_length,
  site_description,
  site_description_date,
  driving_directions,
  driving_directions_date,
  rec_feature_code,
  rec_feature_description,
  recreation_district_code,
  recreation_district_name,
  org_unit_code,
  org_unit_name,
  utm_zone,
  utm_easting,
  utm_northing,
  latitude,
  longitude,
  shape,
  COUNT(*) OVER ()::int AS total_count
FROM bcgw.resource_details_and_closures
ORDER BY forest_file_id ASC
LIMIT $1
OFFSET $2;
