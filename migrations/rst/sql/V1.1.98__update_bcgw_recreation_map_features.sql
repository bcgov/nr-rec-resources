DROP VIEW bcgw.recreation_lines;

DROP VIEW bcgw.recreation_polygons;

DROP MATERIALIZED VIEW IF EXISTS bcgw.recreation_map_features;

CREATE MATERIALIZED VIEW IF NOT EXISTS bcgw.recreation_map_features
TABLESPACE pg_default
AS
 WITH campsite_counts AS (
         SELECT recreation_defined_campsite.rec_resource_id,
            count(*) AS defined_campsites
           FROM rst.recreation_defined_campsite
          GROUP BY recreation_defined_campsite.rec_resource_id
        )
 SELECT rmf.rmf_skey,
    rmf.rec_resource_id AS forest_file_id,
    rmf.section_id,
    rr.recreation_resource_type AS recreation_map_feature_code,
    rtc.description AS project_type,
    rmf.retirement_date,
    rmf.amendment_id,
        CASE
            WHEN rmf.retirement_date IS NOT NULL THEN 'RETIRED'::text
            WHEN rr.rec_status_code::text = 'PE'::text THEN 'PENDING'::text
            ELSE 'ACTIVE'::text
        END AS life_cycle_status_code,
    rr.name AS project_name,
    rf.recreation_feature_code,
    rr.resource_feature_ind,
    rr.right_of_way,
    rr.arch_impact_assess_ind,
    rr.closest_community AS site_location,
    rr.project_established_date,
        CASE
            WHEN rr.display_on_public_site THEN 'Y'::text
            ELSE 'N'::text
        END AS recreation_view_ind,
    rr.district_code AS recreation_district_code,
    COALESCE(cc.defined_campsites, 0::bigint) AS defined_campsites,
    rr.rec_status_code AS file_status_code,
    nrou.district_code,
    nrou.org_unit_name AS district_name,
    rmfg.geometry_type_code,
    rmfg.feature_length,
    rmfg.feature_length * 1000::numeric AS feature_length_m,
    rmfg.feature_area AS feature_area_ha,
    rmfg.feature_area * 10000::numeric AS feature_area_sqm,
    rmfg.feature_perimeter AS feature_perimeter_km,
    st_asgeojson(st_transform(st_setsrid(rmfg.geometry, 3005), 4326)) AS geometry
   FROM rst.recreation_map_feature rmf
     LEFT JOIN rst.recreation_map_feature_geom rmfg ON rmf.rmf_skey = rmfg.rmf_skey
     LEFT JOIN rst.recreation_resource rr ON rmf.rec_resource_id::text = rr.rec_resource_id::text
     LEFT JOIN rst.recreation_resource_type_code rtc ON rr.recreation_resource_type::text = rtc.rec_resource_type_code::text
     LEFT JOIN rst.recreation_feature rf ON rmf.rec_resource_id::text = rf.rec_resource_id::text
     LEFT JOIN rst.natural_resource_org_unit nrou ON rmf.rec_resource_id::text = nrou.rec_resource_id::text
     LEFT JOIN campsite_counts cc ON rmf.rec_resource_id::text = cc.rec_resource_id::text
WITH DATA;

ALTER TABLE IF EXISTS bcgw.recreation_map_features
    OWNER TO root;


CREATE UNIQUE INDEX recreation_map_features_rmf_skey_idx
    ON bcgw.recreation_map_features USING btree
    (rmf_skey)
    TABLESPACE pg_default;
CREATE UNIQUE INDEX recreation_map_features_rmf_skey_idx1
    ON bcgw.recreation_map_features USING btree
    (rmf_skey)
    TABLESPACE pg_default;

CREATE OR REPLACE VIEW bcgw.recreation_lines
 AS
 SELECT rmf_skey,
    forest_file_id,
    section_id,
    recreation_map_feature_code,
    project_type,
    retirement_date,
    amendment_id,
    COALESCE((forest_file_id::text || ' '::text) || section_id::text, forest_file_id::text) AS map_label,
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
    district_code AS district_name,
    NULL::integer AS feature_class_skey,
    feature_length,
    feature_length_m,
    geometry,
    NULL::integer AS objectid,
    NULL::bytea AS se_anno_cad_data
   FROM bcgw.recreation_map_features
  WHERE geometry_type_code::text = 'L'::text;

ALTER TABLE bcgw.recreation_lines
    OWNER TO root;

CREATE OR REPLACE VIEW bcgw.recreation_polygons
 AS
 SELECT rmf_skey,
    forest_file_id,
    section_id,
    recreation_map_feature_code,
    project_type,
    retirement_date,
    amendment_id,
    forest_file_id AS map_label,
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
    district_code AS geographic_district_code,
    district_name AS geographic_district_name,
    NULL::integer AS feature_class_skey,
    feature_area_ha AS feature_area,
    feature_perimeter_km AS feature_perimeter,
    feature_area_sqm,
    feature_perimeter_km * 1000::numeric AS feature_length_m,
    geometry,
    NULL::integer AS objectid,
    NULL::bytea AS se_anno_cad_data
   FROM bcgw.recreation_map_features
  WHERE geometry_type_code::text = 'P'::text;

ALTER TABLE bcgw.recreation_polygons
    OWNER TO root;

REFRESH MATERIALIZED VIEW bcgw.recreation_map_features;
