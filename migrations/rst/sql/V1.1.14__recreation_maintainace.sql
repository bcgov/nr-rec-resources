create table if not exists rst.recreation_maintenance_code (
    recreation_maintenance_code varchar(1) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns('rst', 'recreation_maintenance_code', true);

select setup_temporal_table('rst', 'recreation_maintenance_code');

comment on table rst.recreation_maintenance_code is 'Recreation maintenance standard codes for classifying site maintenance levels.';
comment on column rst.recreation_maintenance_code.recreation_maintenance_code is 'A code indicating a specific maintenance standard. E.g., M for Maintained to Standard, U for User Maintained.';
comment on column rst.recreation_maintenance_code.description is 'Description of the maintenance standard type.';

insert into rst.recreation_maintenance_code (recreation_maintenance_code, description)
values
    ('M', 'Maintained to Standard'),
    ('U', 'User Maintained');

create table if not exists rst.recreation_maintenance (
    id serial primary key,
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id),
    recreation_maintenance_code varchar(1) not null references rst.recreation_maintenance_code (recreation_maintenance_code),
    unique (rec_resource_id, recreation_maintenance_code)
);

select upsert_timestamp_columns('rst', 'recreation_maintenance');

select setup_temporal_table('rst', 'recreation_maintenance');
