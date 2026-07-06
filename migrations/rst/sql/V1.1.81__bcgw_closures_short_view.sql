-- Thin regular view over the closures materialized view exposing the 20-column
-- "short" closure layer for BCGW ingestion.
-- PROJECT_TYPE in this layer is the combined string (e.g. "SIT - Recreation Site"),
-- which lives in project_type_code on the materialized view.

CREATE VIEW rst.bcgw_closures_short_view AS
SELECT
  NULL::integer                AS ften_rpd_sysid,
  forest_file_id,
  project_name,
  project_type_code            AS project_type,
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
  NULL::integer                AS objectid,
  NULL::bytea                  AS se_anno_cad_data
FROM rst.bcgw_recreation_resource_view;
