create table if not exists rst.recreation_campsite (
    rec_resource_id varchar(20) primary key references rst.recreation_resource (rec_resource_id),
    campsite_count int not null default 0
);

select upsert_timestamp_columns('rst', 'recreation_campsite');

select setup_temporal_table('rst', 'recreation_campsite');

comment on table rst.recreation_campsite is 'Stores the number of campsites associated with each recreation resource.';

comment on column rst.recreation_campsite.rec_resource_id is 'Foreign key linking to the recreation resource this campsite count belongs to.';

comment on column rst.recreation_campsite.campsite_count is 'The number of campsites available at this recreation resource.';
