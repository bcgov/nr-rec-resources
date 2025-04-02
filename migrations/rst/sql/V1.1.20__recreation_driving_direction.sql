create table if not exists rst.recreation_driving_direction(
    rec_resource_id varchar(10) primary key references rst.recreation_resource,
    description text
);

comment on table rst.recreation_driving_direction is 'Driving directions to a recreation resource for public display';

comment on column rst.recreation_driving_direction.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_driving_direction.description is 'Descripption of the driving directions to a recreation resource for public display.';

select upsert_timestamp_columns('rst', 'recreation_driving_direction');

select setup_temporal_table('rst', 'recreation_driving_direction');
