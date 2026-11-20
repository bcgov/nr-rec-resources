DROP VIEW bcgw.closures_full;

DROP VIEW bcgw.closures_short;

DROP MATERIALIZED VIEW IF EXISTS bcgw.resource_details_and_closures;

CREATE MATERIALIZED VIEW IF NOT EXISTS bcgw.resource_details_and_closures
TABLESPACE pg_default
AS
 WITH point_wgs84 AS (
         SELECT rsp.rec_resource_id,
            st_transform(st_setsrid(rsp.geometry, 3005), 4326) AS geom
           FROM rst.recreation_site_point rsp
        ), point_utm AS (
         SELECT point_wgs84.rec_resource_id,
            point_wgs84.geom,
            floor((st_x(point_wgs84.geom) + 180::double precision) / 6::double precision)::integer + 1 AS utm_zone
           FROM point_wgs84
        ), map_feature_agg AS (
         SELECT rmf.rec_resource_id,
            sum(rmfg.feature_area) AS tenure_app_total_area,
            sum(rmfg.feature_length) AS tenure_app_total_length
           FROM rst.recreation_map_feature rmf
             LEFT JOIN rst.recreation_map_feature_geom rmfg ON rmf.rmf_skey = rmfg.rmf_skey
          GROUP BY rmf.rec_resource_id
        ), campsite_counts AS (
         SELECT recreation_defined_campsite.rec_resource_id,
            count(*) AS defined_campsites
           FROM rst.recreation_defined_campsite
          GROUP BY recreation_defined_campsite.rec_resource_id
        ), closure AS (
         SELECT rs.rec_resource_id,
                CASE
                    WHEN rs.status_code = 2 THEN 'Y'::text
                    ELSE 'N'::text
                END AS closure_ind,
                CASE
                    WHEN rs.status_code = 2 THEN rs.comment_date
                    ELSE NULL::date
                END AS closure_date,
                CASE
                    WHEN rs.status_code = 2 THEN rs.comment
                    ELSE NULL::character varying
                END AS closure_comment
           FROM rst.recreation_status rs
        )
 SELECT rr.rec_resource_id AS forest_file_id,
    rr.name AS project_name,
    (rr.recreation_resource_type || ' - '::text) || rtc.description::text AS project_type,
    rr.recreation_resource_type AS project_type_code,
    rr.project_established_date,
    COALESCE(c.closure_ind, 'N'::text) AS closure_ind,
    c.closure_date,
    NULL::character varying(100) AS closure_type,
    c.closure_comment,
        CASE
            WHEN rr.display_on_public_site THEN 'Y'::text
            ELSE 'N'::text
        END AS recreation_view_ind,
    rr.rec_status_code AS file_status_st,
    (rr.rec_status_code::text || ' - '::text) || rssc.description::text AS status_description,
    rr.closest_community AS site_location,
    COALESCE(cc.defined_campsites, 0::bigint) AS defined_campsites,
    rr.description AS site_description_brief,
    rr.arch_impact_assess_ind,
    mfa.tenure_app_total_area,
    mfa.tenure_app_total_length,
    sd.description AS site_description,
    sd.description_date AS site_description_date,
    dd.description AS driving_directions,
    dd.driving_directions_date,
    rf.recreation_feature_code AS rec_feature_code,
    (rf.recreation_feature_code::text || ' - '::text) || rfc.description::text AS rec_feature_description,
    rdc.district_code AS recreation_district_code,
    rdc.description AS recreation_district_name,
    nrou.org_unit_code,
    nrou.org_unit_name,
    pu.utm_zone,
        CASE
            WHEN pu.utm_zone IS NOT NULL THEN st_x(st_transform(pu.geom, 32600 + pu.utm_zone))
            ELSE NULL::double precision
        END AS utm_easting,
        CASE
            WHEN pu.utm_zone IS NOT NULL THEN st_y(st_transform(pu.geom, 32600 + pu.utm_zone))
            ELSE NULL::double precision
        END AS utm_northing,
    st_y(pu.geom) AS latitude,
    st_x(pu.geom) AS longitude,
    st_asgeojson(pu.geom) AS shape
   FROM rst.recreation_resource rr
     LEFT JOIN map_feature_agg mfa ON rr.rec_resource_id::text = mfa.rec_resource_id::text
     LEFT JOIN rst.recreation_resource_type_code rtc ON rr.recreation_resource_type = rtc.rec_resource_type_code::text
     LEFT JOIN rst.recreation_resource_status_code rssc ON rr.rec_status_code::text = rssc.recreation_resource_status_code::text
     LEFT JOIN campsite_counts cc ON rr.rec_resource_id::text = cc.rec_resource_id::text
     LEFT JOIN rst.recreation_site_description sd ON rr.rec_resource_id::text = sd.rec_resource_id::text
     LEFT JOIN rst.recreation_driving_direction dd ON rr.rec_resource_id::text = dd.rec_resource_id::text
     LEFT JOIN rst.recreation_feature rf ON rr.rec_resource_id::text = rf.rec_resource_id::text
     LEFT JOIN rst.recreation_feature_code rfc ON rf.recreation_feature_code::text = rfc.recreation_feature_code::text
     LEFT JOIN rst.recreation_district_code rdc ON rr.district_code::text = rdc.district_code::text
     LEFT JOIN rst.natural_resource_org_unit nrou ON rr.rec_resource_id::text = nrou.rec_resource_id::text
     LEFT JOIN point_utm pu ON rr.rec_resource_id::text = pu.rec_resource_id::text
     LEFT JOIN closure c ON rr.rec_resource_id::text = c.rec_resource_id::text
WITH DATA;

ALTER TABLE IF EXISTS bcgw.resource_details_and_closures
    OWNER TO root;


CREATE UNIQUE INDEX resource_details_and_closures_forest_file_id_idx
    ON bcgw.resource_details_and_closures USING btree
    (forest_file_id COLLATE pg_catalog."default")
    TABLESPACE pg_default;
CREATE UNIQUE INDEX resource_details_and_closures_forest_file_id_idx1
    ON bcgw.resource_details_and_closures USING btree
    (forest_file_id COLLATE pg_catalog."default")
    TABLESPACE pg_default;

CREATE OR REPLACE VIEW bcgw.closures_full
 AS
 SELECT forest_file_id,
    project_name,
    project_type,
    project_type_code,
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
    shape
   FROM bcgw.resource_details_and_closures;

ALTER TABLE bcgw.closures_full
    OWNER TO root;

CREATE OR REPLACE VIEW bcgw.closures_short
 AS
 SELECT NULL::integer AS ften_rpd_sysid,
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
    NULL::integer AS objectid,
    NULL::bytea AS se_anno_cad_data
   FROM bcgw.resource_details_and_closures;

ALTER TABLE bcgw.closures_short
    OWNER TO root;

REFRESH MATERIALIZED VIEW bcgw.resource_details_and_closures;
