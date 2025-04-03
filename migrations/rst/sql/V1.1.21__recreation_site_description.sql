create table if not exists rst.recreation_site_description (
    rec_resource_id varchar(10) primary key references rst.recreation_resource(rec_resource_id),
    description text
);

comment on table rst.recreation_site_description is 'Description of a recreation resource for public display';

comment on column rst.recreation_site_description.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_site_description.description is 'Description of a recreation resource for public display.';

select upsert_timestamp_columns('rst', 'recreation_site_description');

select setup_temporal_table('rst', 'recreation_site_description');
