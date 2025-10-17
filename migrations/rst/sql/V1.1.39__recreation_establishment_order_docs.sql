create table if not exists rst.recreation_establishment_order_docs
(
    s3_key          varchar primary key,
    rec_resource_id varchar(10) references rst.recreation_resource,
    title           varchar,
    file_size       bigint,
    extension       varchar
);

select upsert_timestamp_columns('rst', 'recreation_establishment_order_docs');

select setup_temporal_table('rst', 'recreation_establishment_order_docs');

comment on column rst.recreation_establishment_order_docs.s3_key is 'S3 object key (path) for the establishment order document';
comment on column rst.recreation_establishment_order_docs.rec_resource_id is 'Recreation Resource ID';
comment on column rst.recreation_establishment_order_docs.title is 'Title of the establishment order document';
comment on column rst.recreation_establishment_order_docs.file_size is 'File size in bytes';
comment on column rst.recreation_establishment_order_docs.extension is 'File extension (e.g., pdf)';

create index if not exists idx_recreation_establishment_order_docs_rec_resource_id
    on rst.recreation_establishment_order_docs(rec_resource_id);
