-- Make effective_date and updated_date nullable in act_advisories_flat and act_advisories_flat_history

ALTER TABLE rst.act_advisories_flat
  ALTER COLUMN effective_date DROP NOT NULL,
  ALTER COLUMN updated_date DROP NOT NULL;

ALTER TABLE rst.act_advisories_flat_history
  ALTER COLUMN effective_date DROP NOT NULL,
  ALTER COLUMN updated_date DROP NOT NULL;
