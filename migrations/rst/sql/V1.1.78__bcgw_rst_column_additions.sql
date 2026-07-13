-- Add columns to RST tables needed by the BCGW views.
-- Populated by FTA migrations V1.1.22–V1.1.24.

ALTER TABLE rst.recreation_site_description
  ADD COLUMN IF NOT EXISTS description_date date;

COMMENT ON COLUMN rst.recreation_site_description.description_date IS
  'Date on which the site description comment was entered. Sourced from fta.recreation_comment.comment_date (rec_comment_type_code = ''DESC'').';

ALTER TABLE rst.recreation_driving_direction
  ADD COLUMN IF NOT EXISTS driving_directions_date date;

COMMENT ON COLUMN rst.recreation_driving_direction.driving_directions_date IS
  'Date on which the driving directions comment was entered. Sourced from fta.recreation_comment.comment_date (rec_comment_type_code = ''DRIV'').';

-- Stored as varchar(1) to match the BCGW field type (VARCHAR2(1)); FTA source is varchar(20)
-- but values are Y/N indicators so truncation via LEFT() is safe.
ALTER TABLE rst.recreation_resource
  ADD COLUMN IF NOT EXISTS arch_impact_assess_ind varchar(1);

COMMENT ON COLUMN rst.recreation_resource.arch_impact_assess_ind IS
  'Indicates if an archaeological impact assessment has been performed. Y or N. Sourced from fta.recreation_project.arch_impact_assess_ind.';

ALTER TABLE rst.recreation_resource
  ADD COLUMN IF NOT EXISTS resource_feature_ind varchar(1) DEFAULT 'N';

COMMENT ON COLUMN rst.recreation_resource.resource_feature_ind IS
  'Indicates whether this is a resource feature established under the Government Action Regulation.';
