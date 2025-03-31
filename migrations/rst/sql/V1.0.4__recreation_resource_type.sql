create table if not exists rst.recreation_resource_type_code (
    rec_resource_type_code varchar(10) primary key,
    description varchar(200) not null
);

select
    upsert_timestamp_columns ('rst', 'recreation_resource_type_code', true);

select
    setup_temporal_table ('rst', 'recreation_resource_type_code');

comment on table rst.recreation_resource_type_code is 'Codes describing types of Recreation Resources';

comment on column rst.recreation_resource_type_code.rec_resource_type_code is 'Identifies the Recreation Resource Type Code';

comment on column rst.recreation_resource_type_code.description is 'Description of the code value';

insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description)
values
    ('IF', 'Interpretive forest'),
    ('RR', 'Recreation reserve'),
    ('RTR', 'Recreation trail'),
    ('SIT', 'Recreation site');
