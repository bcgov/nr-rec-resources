create table if not exists rst.recreation_resource_image
(
    image_id        uuid primary key default gen_random_uuid(),
    rec_resource_id varchar(10) not null references rst.recreation_resource,
    file_name       varchar not null,
    extension       varchar not null,
    file_size       bigint
);

select upsert_timestamp_columns('rst', 'recreation_resource_image');

select setup_temporal_table('rst', 'recreation_resource_image', false);

comment on column rst.recreation_resource_image.image_id is 'Unique UUID identifier for the image';
comment on column rst.recreation_resource_image.rec_resource_id is 'Recreation Resource ID';
comment on column rst.recreation_resource_image.file_name is 'File name of the image';
comment on column rst.recreation_resource_image.extension is 'File extension (e.g., jpg, png)';
comment on column rst.recreation_resource_image.file_size is 'File size in bytes';

create index if not exists idx_recreation_resource_image_rec_resource_id
    on rst.recreation_resource_image(rec_resource_id);

create table if not exists rst.recreation_resource_document
(
    doc_id          uuid primary key default gen_random_uuid(),
    rec_resource_id varchar(10) not null references rst.recreation_resource,
    doc_code        varchar not null references rst.recreation_resource_doc_code,
    file_name       varchar not null,
    extension       varchar not null,
    file_size       bigint
);

select upsert_timestamp_columns('rst', 'recreation_resource_document');

select setup_temporal_table('rst', 'recreation_resource_document', false);

comment on column rst.recreation_resource_document.doc_id is 'Unique UUID identifier for the document';
comment on column rst.recreation_resource_document.rec_resource_id is 'Recreation Resource ID';
comment on column rst.recreation_resource_document.doc_code is 'Foreign key reference to document code type';
comment on column rst.recreation_resource_document.file_name is 'File name of the document';
comment on column rst.recreation_resource_document.extension is 'File extension (e.g., pdf)';
comment on column rst.recreation_resource_document.file_size is 'File size in bytes';

create index if not exists idx_recreation_resource_document_rec_resource_id
    on rst.recreation_resource_document(rec_resource_id);
