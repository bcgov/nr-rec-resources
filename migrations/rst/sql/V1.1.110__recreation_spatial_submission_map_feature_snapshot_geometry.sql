ALTER TABLE rst.recreation_spatial_submission_map_feature
  ADD COLUMN IF NOT EXISTS rmf_skey integer
  REFERENCES rst.recreation_map_feature(rmf_skey) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rssmf_rmf_skey
  ON rst.recreation_spatial_submission_map_feature (rmf_skey);

ALTER TABLE rst.recreation_map_feature
  ADD COLUMN IF NOT EXISTS current_ind char(1) NOT NULL DEFAULT 'Y';

ALTER TABLE rst.recreation_map_feature
  DROP CONSTRAINT IF EXISTS recreation_map_feature_rec_resource_id_section_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_rmf_current_section
  ON rst.recreation_map_feature (rec_resource_id, section_id)
  WHERE current_ind = 'Y' AND section_id IS NOT NULL;

DO $$
BEGIN
  -- Check for duplicate submission_id values before creating unique index:
  -- SELECT submission_id, COUNT(*)
  -- FROM rst.recreation_spatial_submission
  -- GROUP BY submission_id
  -- HAVING COUNT(*) > 1;
  IF EXISTS (
    SELECT 1
    FROM rst.recreation_spatial_submission
    GROUP BY submission_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot create uq_recreation_spatial_submission_submission_id: duplicate submission_id values exist in rst.recreation_spatial_submission';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_recreation_spatial_submission_submission_id
  ON rst.recreation_spatial_submission (submission_id);
