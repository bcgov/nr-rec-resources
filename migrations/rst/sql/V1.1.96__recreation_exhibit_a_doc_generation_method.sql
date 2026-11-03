alter table rst.recreation_exhibit_a_doc
    add column if not exists generation_method varchar(20);

alter table rst.recreation_exhibit_a_doc_history
    add column if not exists generation_method varchar(20);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_recreation_exhibit_a_doc_generation_method'
          AND connamespace = 'rst'::regnamespace
    ) THEN
        ALTER TABLE rst.recreation_exhibit_a_doc
            ADD CONSTRAINT chk_recreation_exhibit_a_doc_generation_method
                CHECK (generation_method in ('upload', 'regenerate') or generation_method is null);
    END IF;
END
$$;

comment on column rst.recreation_exhibit_a_doc.generation_method is 'How Exhibit A was produced: upload or regenerate.';
