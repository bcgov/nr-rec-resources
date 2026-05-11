-- Add recurring flag and month/day range columns to recreation_fee
-- recurring_start_mmdd and recurring_end_mmdd store plain MM-DD strings (e.g. '06-01', '08-31')
-- No date parsing or pg_rrule extension required - values are built/read in the application layer
ALTER TABLE rst.recreation_fee
  ADD COLUMN IF NOT EXISTS recurring_ind        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurring_start_mmdd TEXT    NULL,
  ADD COLUMN IF NOT EXISTS recurring_end_mmdd   TEXT    NULL;

-- Mirror columns on history table for audit/temporal tracking
ALTER TABLE rst.recreation_fee_history
  ADD COLUMN IF NOT EXISTS recurring_ind        BOOLEAN NULL,
  ADD COLUMN IF NOT EXISTS recurring_start_mmdd TEXT    NULL,
  ADD COLUMN IF NOT EXISTS recurring_end_mmdd   TEXT    NULL;
