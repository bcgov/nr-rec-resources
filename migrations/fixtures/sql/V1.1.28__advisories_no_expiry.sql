-- Status only counts unexpired advisories, and the expiry dates in
-- V1.1.21__advisories_data.sql have all passed. Clear them so the fixture
-- advisories keep setting each site's status.
UPDATE rst.act_advisories_flat
SET expiry_date = NULL
WHERE (rec_resource_id, advisory_number) IN (
  ('REC204117', 1067),
  ('REC1222', 1068),
  ('REC203239', 1069),
  ('REC160773', 1070),
  ('REC0108', 1071),
  ('REC0180', 1072),
  ('REC6866', 1073),
  ('REC203900', 1074),
  ('REC2094', 1075),
  ('REC204117', 1076),
  ('REC1222', 1077),
  ('REC160773', 1078)
);
