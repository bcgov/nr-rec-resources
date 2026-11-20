CREATE OR REPLACE VIEW rst.recreation_resource_type_view_public
 AS
 SELECT rr.rec_resource_id,
        CASE
            WHEN rr.display_on_public_site = true AND rr.recreation_resource_type::text = 'RR'::text THEN 'SIT'::character varying
            WHEN rr.display_on_public_site = true AND (rr.recreation_resource_type::text = ANY (ARRAY['RTR'::character varying, 'TBL'::character varying, 'TRB'::character varying]::text[])) THEN 'RTE'::character varying
            WHEN rr.display_on_public_site = true AND rr.recreation_resource_type::text = 'IFT'::text THEN 'IF'::character varying
            ELSE rr.recreation_resource_type
        END AS rec_resource_type_code,
        CASE
            WHEN rrtc.rec_resource_type_code::text = 'RTE'::text THEN 'Recreation trail'::character varying(200)
            ELSE rrtc.description
        END AS description
   FROM rst.recreation_resource rr
     LEFT JOIN rst.recreation_resource_type_code rrtc ON
        CASE
            WHEN rr.display_on_public_site = true AND rr.recreation_resource_type::text = 'RR'::text THEN 'SIT'::character varying
            WHEN rr.display_on_public_site = true AND (rr.recreation_resource_type::text = ANY (ARRAY['RTR'::character varying, 'TBL'::character varying, 'TRB'::character varying]::text[])) THEN 'RTE'::character varying
            WHEN rr.display_on_public_site = true AND rr.recreation_resource_type::text = 'IFT'::text THEN 'IF'::character varying
            ELSE rr.recreation_resource_type
        END::text = rrtc.rec_resource_type_code::text;

ALTER TABLE rst.recreation_resource_type_view_public
    OWNER TO root;
COMMENT ON VIEW rst.recreation_resource_type_view_public
    IS 'Provides resource type codes and descriptions for public site.
Converts RR to SIT, TBL/TRB/RTE to RTE, and IFT to IF for public display.
Gets the most recent recreation_resource_type from recreation_map_feature table.';
