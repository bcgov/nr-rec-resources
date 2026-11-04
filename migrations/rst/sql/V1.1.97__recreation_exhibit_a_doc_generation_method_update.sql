alter table rst.recreation_exhibit_a_doc
    drop constraint if exists chk_recreation_exhibit_a_doc_generation_method;

alter table rst.recreation_exhibit_a_doc
    add constraint chk_recreation_exhibit_a_doc_generation_method
        check (generation_method in ('upload', 'regenerate', 'migrated from FTA') or generation_method is null);

comment on column rst.recreation_exhibit_a_doc.generation_method is
    'How Exhibit A was produced: upload, regenerate, or migrated from FTA.';
