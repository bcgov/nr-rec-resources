create table if not exists rst.recreation_resource_doc_code
(
    doc_code    varchar primary key,
    description varchar
);

select upsert_timestamp_columns('rst', 'recreation_resource_doc_code');

select setup_temporal_table('rst', 'recreation_resource_doc_code');

comment on column rst.recreation_resource_doc_code.doc_code is 'Unique identifier for the document code';
comment on column rst.recreation_resource_doc_code.description is 'Description of the document code';

insert into rst.recreation_resource_doc_code (doc_code, description)
values ('RM', 'Recreation Map')
on conflict do nothing;

create table if not exists rst.recreation_resource_docs
(
    ref_id          varchar primary key,
    rec_resource_id varchar(10) references rst.recreation_resource,
    title           varchar,
    url             varchar,
    doc_code        varchar references rst.recreation_resource_doc_code,
    extension       varchar,
    unique (rec_resource_id, ref_id)
);

select upsert_timestamp_columns('rst', 'recreation_resource_docs');

select setup_temporal_table('rst', 'recreation_resource_docs');

comment on column rst.recreation_resource_docs.rec_resource_id is 'Recreation Resource ID';
comment on column rst.recreation_resource_docs.ref_id is 'Unique reference identifier for the document';
comment on column rst.recreation_resource_docs.title is 'Title of the document';
comment on column rst.recreation_resource_docs.url is 'URL where the document can be accessed';
comment on column rst.recreation_resource_docs.doc_code is 'Foreign key reference to document code type';
