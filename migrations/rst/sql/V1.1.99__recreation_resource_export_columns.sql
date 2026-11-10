-- Add recreation_resource columns required by updated RST file-details export.

ALTER TABLE rst.recreation_resource
  ADD COLUMN IF NOT EXISTS overflow_campsites integer;

COMMENT ON COLUMN rst.recreation_resource.overflow_campsites IS
  'The number of overflow campsite spaces for this recreation resource. Sourced from fta.recreation_project.overflow_campsites.';

ALTER TABLE rst.recreation_resource
  ADD COLUMN IF NOT EXISTS arch_impact_assess_date date;

COMMENT ON COLUMN rst.recreation_resource.arch_impact_assess_date IS
  'Date of the archaeological impact assessment for this recreation resource. Sourced from fta.recreation_project.arch_impact_date.';

SELECT sync_temporal_table_schema('rst', 'recreation_resource');
