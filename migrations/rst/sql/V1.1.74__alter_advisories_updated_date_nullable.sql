ALTER TABLE rst.act_advisories_flat
    ALTER COLUMN updated_date DROP NOT NULL;

ALTER TABLE rst.act_advisories_flat_history
    ALTER COLUMN updated_date DROP NOT NULL;
