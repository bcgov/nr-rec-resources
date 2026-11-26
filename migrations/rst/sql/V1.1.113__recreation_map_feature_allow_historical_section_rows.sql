
-- Keep a non-unique lookup index for joins and filters.
CREATE INDEX IF NOT EXISTS idx_rmf_rec_resource_section
  ON rst.recreation_map_feature (rec_resource_id, section_id);

-- Remove legacy global uniqueness that blocks historical amendment rows.
ALTER TABLE rst.recreation_map_feature
  DROP CONSTRAINT IF EXISTS recreation_map_feature_rec_resource_id_section_id_key;
