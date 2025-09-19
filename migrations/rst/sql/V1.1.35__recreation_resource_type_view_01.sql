CREATE OR REPLACE VIEW rst.recreation_resource_type_view
 AS
 SELECT rr.rec_resource_id,
        CASE
            WHEN rr.display_on_public_site = true AND rmf.recreation_resource_type::text = 'RR'::text THEN 'SIT'::character varying
            ELSE rmf.recreation_resource_type
        END AS rec_resource_type_code,
    rrtc.description
   FROM rst.recreation_resource rr
     LEFT JOIN ( SELECT DISTINCT ON (recreation_map_feature.rec_resource_id) recreation_map_feature.rec_resource_id,
            recreation_map_feature.recreation_resource_type,
            recreation_map_feature.amend_status_date
           FROM rst.recreation_map_feature
          ORDER BY recreation_map_feature.rec_resource_id, recreation_map_feature.amend_status_date DESC) rmf ON rr.rec_resource_id::text = rmf.rec_resource_id::text
     LEFT JOIN rst.recreation_resource_type_code rrtc ON
        CASE
            WHEN rr.display_on_public_site = true AND rmf.recreation_resource_type::text = 'RR'::text THEN 'SIT'::character varying
            ELSE rmf.recreation_resource_type
        END::text = rrtc.rec_resource_type_code::text;

ALTER TABLE rst.recreation_resource_type_view
    OWNER TO root;
COMMENT ON VIEW rst.recreation_resource_type_view
    IS 'Provides a list of resource type codes and descriptions for recreation resources to be used
as the source of truth for getting the recreation resource type code for a recreation resource
for display on the public site. This was needed to mitigate bugs from junk data in the recreation
map feature table as well as the request to show some recreation reserves as sites on the public site.';
