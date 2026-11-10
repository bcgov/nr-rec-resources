-- Backfill rst.recreation_objective from fta.recreation_objective.

INSERT INTO rst.recreation_objective (
  rec_resource_id,
  objective_id,
  objective_description,
  objective_established_date,
  objective_amended_date,
  objective_cancelled_date,
  revision_count,
  entry_userid,
  entry_timestamp,
  update_userid,
  update_timestamp,
  created_by,
  created_at,
  updated_by,
  updated_at
)
SELECT
  ro.forest_file_id AS rec_resource_id,
  ro.objective_id,
  ro.objective_description,
  ro.objective_established_date,
  ro.objective_amended_date,
  ro.objective_cancelled_date,
  ro.revision_count,
  ro.entry_userid,
  ro.entry_timestamp,
  ro.update_userid,
  ro.update_timestamp,
  ro.entry_userid,
  ro.entry_timestamp,
  ro.update_userid,
  ro.update_timestamp
FROM fta.recreation_objective ro
INNER JOIN rst.recreation_resource rr
  ON rr.rec_resource_id = ro.forest_file_id
ON CONFLICT (rec_resource_id, objective_id)
DO UPDATE SET
  objective_description = EXCLUDED.objective_description,
  objective_established_date = EXCLUDED.objective_established_date,
  objective_amended_date = EXCLUDED.objective_amended_date,
  objective_cancelled_date = EXCLUDED.objective_cancelled_date,
  revision_count = EXCLUDED.revision_count,
  entry_userid = EXCLUDED.entry_userid,
  entry_timestamp = EXCLUDED.entry_timestamp,
  update_userid = EXCLUDED.update_userid,
  update_timestamp = EXCLUDED.update_timestamp,
  updated_by = EXCLUDED.updated_by,
  updated_at = EXCLUDED.updated_at;
