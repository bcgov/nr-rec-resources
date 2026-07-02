-- Create bcgw_recreation_resource_view for BCGW ingestion of recreation resources.
-- Columns description_date, driving_directions_date, arch_impact_assess_ind were added
-- to RST by V1.1.79 and V1.1.80 and are populated from FTA by V1.0.2, V1.1.15, V1.1.16.

CREATE MATERIALIZED VIEW rst.bcgw_recreation_resource_view AS
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
  GROUP BY rmf.rec_resource_id
),
campsite_counts AS (
  SELECT rec_resource_id, COUNT(*) AS defined_campsites
  FROM rst.recreation_defined_campsite
  GROUP BY rec_resource_id
),
closure AS (
  SELECT DISTINCT ON (rec_resource_id)
    rec_resource_id,
    CASE
      WHEN access_status_grouplabel IN ('Closed', 'Restricted') THEN 'Y'
      ELSE 'N'
    END                                                     AS closure_ind,
    advisory_date::date                                     AS closure_date,
    event_type                                              AS closure_type,
    regexp_replace(description, '<[^>]+>', '', 'g')         AS closure_comment
  FROM rst.act_advisories_flat
  WHERE advisory_status = 'Published'
  ORDER BY rec_resource_id, listing_rank ASC
)
SELECT
  rr.rec_resource_id                                                    AS forest_file_id,
  rr.name                                                               AS project_name,
  mfa.recreation_resource_type || ' - ' || rtc.description             AS project_type_code,
  mfa.recreation_resource_type                                          AS project_type,
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

CREATE UNIQUE INDEX ON rst.bcgw_recreation_resource_view (forest_file_id);
