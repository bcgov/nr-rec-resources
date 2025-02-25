create table if not exists rst.recreation_campsite (
    rec_resource_id VARCHAR(200) not null primary key,
    campsite_count int not null default 0,
    foreign key (rec_resource_id) references rst.recreation_resource (rec_resource_id) on delete cascade
);

select upsert_timestamp_columns('rst', 'recreation_campsite');

comment on table rst.recreation_campsite is 'Stores the number of campsites associated with each recreation resource.';

comment on column rst.recreation_campsite.rec_resource_id is 'Foreign key linking to the recreation resource this campsite count belongs to.';

comment on column rst.recreation_campsite.campsite_count is 'The number of campsites available at this recreation resource.';
