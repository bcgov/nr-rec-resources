-- Table for Exhibit A documents, stored in a dedicated S3 bucket.

create table if not exists rst.recreation_exhibit_a_doc
(
    doc_id          uuid        primary key default gen_random_uuid(),
    rec_resource_id varchar(10) not null references rst.recreation_resource,
    file_name       varchar     not null,
    extension       varchar     not null,
    file_size       bigint,
    s3_key          varchar     not null unique
);

select upsert_timestamp_columns('rst'::text, 'recreation_exhibit_a_doc'::text);

select setup_temporal_table('rst'::text, 'recreation_exhibit_a_doc'::text, false);

comment on table  rst.recreation_exhibit_a_doc                    is 'Exhibit A documents for a recreation resource, stored in a dedicated S3 bucket';
comment on column rst.recreation_exhibit_a_doc.doc_id             is 'Unique UUID identifier for the Exhibit A document';
comment on column rst.recreation_exhibit_a_doc.rec_resource_id    is 'Recreation Resource ID this document belongs to';
comment on column rst.recreation_exhibit_a_doc.file_name          is 'Display file name of the document (without extension)';
comment on column rst.recreation_exhibit_a_doc.extension          is 'File extension (e.g. pdf)';
comment on column rst.recreation_exhibit_a_doc.file_size          is 'File size in bytes';
comment on column rst.recreation_exhibit_a_doc.s3_key             is 'S3 object key (path) in the Exhibit A bucket';

create index if not exists idx_recreation_exhibit_a_doc_rec_resource_id
    on rst.recreation_exhibit_a_doc (rec_resource_id);
