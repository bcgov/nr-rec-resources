-- ACT no longer always populates submitted_by (CMS-2031). created_by takes over as the
-- author shown in the admin UI. Both are nullable; neither is guaranteed by the API.

ALTER TABLE rst.act_advisories_flat
    ALTER COLUMN submitted_by DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS created_by varchar(120);

ALTER TABLE rst.act_advisories_flat_history
    ALTER COLUMN submitted_by DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS created_by varchar(120);

-- Backfill so advisories that predate the ACT change still show an author.
UPDATE rst.act_advisories_flat
SET created_by = submitted_by
WHERE created_by IS NULL;

comment on column rst.act_advisories_flat.created_by is 'Name of the individual who created the advisory in Act. Supplied by the Act integration and used as the published-by value in the admin UI.';
