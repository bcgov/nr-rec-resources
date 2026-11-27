-- BCGW closure fields now come from ACT advisories instead of FTA closure comments.
--
-- The site's status is its top published advisory, ranked the same way as the public
-- site. When that advisory is Closed or Restricted (the public "Closed" filter):
--   closure_ind     = 'Y'
--   closure_date    = the advisory's displayed date, same pick as the public page:
--                     posted, else updated, else effective; posted if no flag is set
--   closure_comment = the advisory title
--   closure_type    = the advisory event type
-- Otherwise closure_ind = 'N' and the rest stay NULL, as they did with FTA.
--
-- A materialized view cannot be replaced in place, so it and the two views on top of it
-- are dropped and rebuilt. Everything other than the closure CTE is unchanged from V1.1.79,
-- and the column names and types BCGW reads stay the same.

DROP VIEW IF EXISTS bcgw.closures_full;
DROP VIEW IF EXISTS bcgw.closures_short;
DROP MATERIALIZED VIEW IF EXISTS bcgw.resource_details_and_closures;

CREATE MATERIALIZED VIEW bcgw.resource_details_and_closures AS
WITH
point_wgs84 AS (
  SELECT
    rsp.rec_resource_id,
    ST_Transform(ST_SetSRID(rsp.geometry, 3005), 4326) AS geom
  FROM rst.recreation_site_point rsp
),
point_utm AS (
  SELECT
    rec_resource_id,
    geom,
    floor((ST_X(geom) + 180) / 6)::int + 1 AS utm_zone
  FROM point_wgs84
),
map_feature_agg AS (
  SELECT
    rmf.rec_resource_id,
    MAX(rmf.recreation_resource_type)    AS recreation_resource_type,
    SUM(rmfg.feature_area)               AS tenure_app_total_area,
    SUM(rmfg.feature_length)             AS tenure_app_total_length
  FROM rst.recreation_map_feature rmf
  LEFT JOIN rst.recreation_map_feature_geom rmfg
    ON rmf.rmf_skey = rmfg.rmf_skey
  -- current rows only, same check as bcgw.recreation_map_features (V1.1.111)
  WHERE COALESCE(NULLIF(UPPER(BTRIM(rmf.current_ind::text)), ''), 'Y') IN ('Y', 'TRUE', 'T', '1')
  GROUP BY rmf.rec_resource_id
),
campsite_counts AS (
  SELECT rec_resource_id, COUNT(*) AS defined_campsites
  FROM rst.recreation_defined_campsite
  GROUP BY rec_resource_id
),
top_advisory AS (
  SELECT DISTINCT ON (af.rec_resource_id)
    af.rec_resource_id,
    af.access_status_grouplabel,
    af.title,
    af.event_type,
    af.is_advisory_date_displayed,
    af.is_updated_date_displayed,
    af.is_effective_date_displayed,
    af.advisory_date,
    af.updated_date,
    af.effective_date
  FROM rst.act_advisories_flat af
  -- active advisories only: published, not expired, already in effect. now() is
  -- read on each refresh, which the BCGW export does every run
  WHERE af.published_at IS NOT NULL
    AND (af.expiry_date IS NULL OR af.expiry_date > now())
    AND (af.effective_date IS NULL OR af.effective_date <= now())
  ORDER BY
    af.rec_resource_id,
    af.listing_rank DESC,
    af.urgency_sequence DESC,
    af.access_status_precedence ASC,
    af.updated_date DESC,
    af.advisory_date DESC,
    af.event_type_precedence ASC
),
closure AS (
  SELECT
    ta.rec_resource_id,
    'Y'                                                     AS closure_ind,
    -- dates are entered in Pacific time, so take the calendar date there
    (CASE
      WHEN ta.is_advisory_date_displayed THEN ta.advisory_date
      WHEN ta.is_updated_date_displayed THEN ta.updated_date
      WHEN ta.is_effective_date_displayed THEN ta.effective_date
      ELSE ta.advisory_date
    END AT TIME ZONE 'America/Vancouver')::date             AS closure_date,
    ta.title::varchar(5000)                                 AS closure_comment,
    ta.event_type::varchar(100)                             AS closure_type
  FROM top_advisory ta
  WHERE ta.access_status_grouplabel IN ('Closed', 'Restricted')
)
SELECT
  rr.rec_resource_id                                                    AS forest_file_id,
  rr.name                                                               AS project_name,
  mfa.recreation_resource_type || ' - ' || rtc.description             AS project_type,
  mfa.recreation_resource_type                                          AS project_type_code,
  rr.project_established_date,
  COALESCE(c.closure_ind, 'N')                                          AS closure_ind,
  c.closure_date,
  c.closure_type,
  c.closure_comment,
  CASE WHEN rr.display_on_public_site THEN 'Y' ELSE 'N' END            AS recreation_view_ind,
  rr.rec_status_code                                                    AS file_status_st,
  rr.rec_status_code || ' - ' || rssc.description                      AS status_description,
  rr.closest_community                                                  AS site_location,
  COALESCE(cc.defined_campsites, 0)                                     AS defined_campsites,
  rr.description                                                        AS site_description_brief,
  rr.arch_impact_assess_ind,
  mfa.tenure_app_total_area,
  mfa.tenure_app_total_length,
  sd.description                                                        AS site_description,
  sd.description_date                                                   AS site_description_date,
  dd.description                                                        AS driving_directions,
  dd.driving_directions_date,
  rf.recreation_feature_code                                            AS rec_feature_code,
  rf.recreation_feature_code || ' - ' || rfc.description               AS rec_feature_description,
  rdc.district_code                                                     AS recreation_district_code,
  rdc.description                                                       AS recreation_district_name,
  nrou.org_unit_code,
  nrou.org_unit_name,
  pu.utm_zone,
  CASE WHEN pu.utm_zone IS NOT NULL
    THEN ST_X(ST_Transform(pu.geom, 32600 + pu.utm_zone))
  END                                                                   AS utm_easting,
  CASE WHEN pu.utm_zone IS NOT NULL
    THEN ST_Y(ST_Transform(pu.geom, 32600 + pu.utm_zone))
  END                                                                   AS utm_northing,
  ST_Y(pu.geom)                                                         AS latitude,
  ST_X(pu.geom)                                                         AS longitude,
  ST_AsGeoJSON(pu.geom)                                                 AS shape
FROM rst.recreation_resource rr
  LEFT JOIN map_feature_agg mfa
    ON rr.rec_resource_id = mfa.rec_resource_id
  LEFT JOIN rst.recreation_resource_type_code rtc
    ON mfa.recreation_resource_type = rtc.rec_resource_type_code
  LEFT JOIN rst.recreation_resource_status_code rssc
    ON rr.rec_status_code = rssc.recreation_resource_status_code
  LEFT JOIN campsite_counts cc
    ON rr.rec_resource_id = cc.rec_resource_id
  LEFT JOIN rst.recreation_site_description sd
    ON rr.rec_resource_id = sd.rec_resource_id
  LEFT JOIN rst.recreation_driving_direction dd
    ON rr.rec_resource_id = dd.rec_resource_id
  LEFT JOIN rst.recreation_feature rf
    ON rr.rec_resource_id = rf.rec_resource_id
  LEFT JOIN rst.recreation_feature_code rfc
    ON rf.recreation_feature_code = rfc.recreation_feature_code
  LEFT JOIN rst.recreation_district_code rdc
    ON rr.district_code = rdc.district_code
  LEFT JOIN rst.natural_resource_org_unit nrou
    ON rr.rec_resource_id = nrou.rec_resource_id
  LEFT JOIN point_utm pu
    ON rr.rec_resource_id = pu.rec_resource_id
  LEFT JOIN closure c
    ON rr.rec_resource_id = c.rec_resource_id;

CREATE UNIQUE INDEX ON bcgw.resource_details_and_closures (forest_file_id);

CREATE VIEW bcgw.closures_full AS
SELECT * FROM bcgw.resource_details_and_closures;

CREATE VIEW bcgw.closures_short AS
SELECT
  NULL::integer                AS ften_rpd_sysid,
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
  NULL::integer                AS objectid,
  NULL::bytea                  AS se_anno_cad_data
FROM bcgw.resource_details_and_closures;
