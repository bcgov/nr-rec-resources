CREATE OR REPLACE VIEW rst.recreation_resource_type_view_admin
 AS
 SELECT rr.rec_resource_id,
    rr.recreation_resource_type AS rec_resource_type_code,
    rrtc.description
   FROM rst.recreation_resource rr
     LEFT JOIN rst.recreation_resource_type_code rrtc ON rr.recreation_resource_type::text = rrtc.rec_resource_type_code::text;

ALTER TABLE rst.recreation_resource_type_view_admin
    OWNER TO root;
COMMENT ON VIEW rst.recreation_resource_type_view_admin
    IS 'Provides resource type codes and descriptions for admin interface.
Shows actual resource types without conversion (including RR).
Gets the most recent recreation_resource_type from recreation_map_feature table.';
