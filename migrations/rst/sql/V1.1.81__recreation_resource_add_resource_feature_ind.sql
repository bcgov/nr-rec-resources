-- Add resource_feature_ind to rst.recreation_resource, sourced from fta.recreation_project.
-- Backfills all existing rows from FTA; defaults to 'N' where FTA has no value.

ALTER TABLE rst.recreation_resource
    ADD COLUMN IF NOT EXISTS resource_feature_ind varchar(1) DEFAULT 'N';

UPDATE rst.recreation_resource rr
SET resource_feature_ind = fp.resource_feature_ind
FROM fta.recreation_project fp
WHERE rr.rec_resource_id = fp.forest_file_id
  AND fp.resource_feature_ind IS NOT NULL;

COMMENT ON COLUMN rst.recreation_resource.resource_feature_ind IS 'Indicates whether this is a resource feature established under the Government Action Regulation.';
