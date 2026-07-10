-- Add resource_feature_ind to rst.recreation_resource.
-- Column is populated by the FTA migration (V1.0.2) when FTA data is loaded.

ALTER TABLE rst.recreation_resource
    ADD COLUMN IF NOT EXISTS resource_feature_ind varchar(1) DEFAULT 'N';

COMMENT ON COLUMN rst.recreation_resource.resource_feature_ind IS 'Indicates whether this is a resource feature established under the Government Action Regulation.';
