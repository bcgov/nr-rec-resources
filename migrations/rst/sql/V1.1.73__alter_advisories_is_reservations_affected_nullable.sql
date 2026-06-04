ALTER TABLE rst.act_advisories_flat
    ALTER COLUMN is_reservations_affected DROP NOT NULL,
ALTER COLUMN is_updated_date_displayed DROP NOT NULL,
    DROP COLUMN removal_date,
    DROP COLUMN modified_date;

ALTER TABLE rst.act_advisories_flat_history
    ALTER COLUMN is_reservations_affected DROP NOT NULL,
ALTER COLUMN is_updated_date_displayed DROP NOT NULL,
    DROP COLUMN removal_date,
    DROP COLUMN modified_date;

-- Add standard audit columns (created_at, created_by, updated_at, updated_by) to both base and history tables.
select upsert_timestamp_columns('rst', 'act_advisories_flat', true);
select upsert_timestamp_columns('rst', 'act_advisories_flat_history', true);
