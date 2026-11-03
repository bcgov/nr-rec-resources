alter table rst.recreation_exhibit_a_doc
    add column if not exists submission_id varchar(50);

alter table rst.recreation_exhibit_a_doc
    add column if not exists page_size varchar(1);

alter table rst.recreation_exhibit_a_doc
    add column if not exists page_orientation varchar(20);

alter table rst.recreation_exhibit_a_doc
    add column if not exists scale integer;

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists submission_id varchar(50);

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists page_size varchar(1);

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists page_orientation varchar(20);

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists scale integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_recreation_exhibit_a_doc_submission_id'
          AND connamespace = 'rst'::regnamespace
    ) THEN
        ALTER TABLE rst.recreation_exhibit_a_doc
            ADD CONSTRAINT fk_recreation_exhibit_a_doc_submission_id
                FOREIGN KEY (submission_id)
                    REFERENCES rst.recreation_spatial_submission (submission_id);
    END IF;
END
$$;

create index if not exists idx_recreation_exhibit_a_doc_submission_id
    on rst.recreation_exhibit_a_doc (submission_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_recreation_exhibit_a_doc_page_size'
          AND connamespace = 'rst'::regnamespace
    ) THEN
        ALTER TABLE rst.recreation_exhibit_a_doc
            ADD CONSTRAINT chk_recreation_exhibit_a_doc_page_size
                CHECK (page_size in ('A', 'B', 'C', 'D', 'E') or page_size is null);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_recreation_exhibit_a_doc_page_orientation'
          AND connamespace = 'rst'::regnamespace
    ) THEN
        ALTER TABLE rst.recreation_exhibit_a_doc
            ADD CONSTRAINT chk_recreation_exhibit_a_doc_page_orientation
                CHECK (page_orientation in ('Portrait', 'Landscape') or page_orientation is null);
    END IF;
END
$$;

comment on column rst.recreation_exhibit_a_doc.submission_id is 'Spatial submission identifier linked to this Exhibit A output.';
comment on column rst.recreation_exhibit_a_doc.page_size is 'Selected Exhibit A page size (A-E).';
comment on column rst.recreation_exhibit_a_doc.page_orientation is 'Selected Exhibit A orientation (Portrait or Landscape).';
comment on column rst.recreation_exhibit_a_doc.scale is 'Selected Exhibit A map scale.';
