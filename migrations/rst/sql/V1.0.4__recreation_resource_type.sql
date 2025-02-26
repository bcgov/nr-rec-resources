create table if not exists rst.recreation_resource_type_code (
    rec_resource_type_code varchar(10) primary key,
    description varchar(200) not null
);

select upsert_timestamp_columns('rst', 'recreation_resource_type_code');

select setup_temporal_table('rst', 'recreation_resource_type_code');

comment on table rst.recreation_resource_type_code is 'Codes describing types of Recreation Resources';

comment on column rst.recreation_resource_type_code.rec_resource_type_code is 'Identifies the Recreation Resource Type Code';

comment on column rst.recreation_resource_type_code.description is 'Description of the code value';


-- Based on fta.recreation_map_feature, though that table allows for multiple types per project we
-- are only going to insert the latest one sorted by amend_status_date
-- For the admin app we still need to decide on how to handle historical data - keep in same table or move to history tracking table
create table if not exists rst.recreation_resource_type (
    rec_resource_id varchar(20) primary key references rst.recreation_resource (rec_resource_id),
    rec_resource_type_code varchar(10) not null references rst.recreation_resource_type_code (rec_resource_type_code)
);

select upsert_timestamp_columns('rst', 'recreation_resource_type');

select setup_temporal_table('rst', 'recreation_resource_type');

comment on table rst.recreation_resource_type is 'Captures both current and historical attributes for Recreation Map Types';

comment on column rst.recreation_resource_type.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_resource_type.rec_resource_type_code is 'Identifies the Recreation Resource Type Code';
