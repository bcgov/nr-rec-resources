-- @param {Int} $1:limit
-- @param {Int} $2:offset
SELECT
  forest_file_id,
  project_name,
  project_type,
  closure_ind,
  closure_date,
  closure_type,
  site_location,
  defined_campsites,
  recreation_district_code,
  recreation_district_name,
  org_unit_name,
  closure_comment,
  site_description,
  driving_directions,
  latitude,
  longitude,
  shape,
  COUNT(*) OVER ()::int AS total_count
FROM rst.bcgw_closures_short_view
ORDER BY forest_file_id ASC
LIMIT $1
OFFSET $2;
