create table if not exists rst.recreation_maintenance_standard_code (
    maintenance_standard_code varchar(1) primary key,
    description varchar(200) not null
);

select upsert_timestamp_columns ('rst', 'recreation_maintenance_standard_code', true);

select setup_temporal_table ('rst', 'recreation_maintenance_standard_code');

comment on table rst.recreation_maintenance_standard_code is 'Codes describing the maintenance standards for recreation projects.';

comment on column rst.recreation_maintenance_standard_code.maintenance_standard_code is 'Code describing the Maintenance Standard of a given site. E.g. User Maintained, Maintained to Standard, Not Maintained.';

comment on column rst.recreation_maintenance_standard_code.description is 'Description of the code value';

insert into rst.recreation_maintenance_standard_code (maintenance_standard_code, description)
values ('U', 'User maintained'),
       ('M', 'Maintained to standard');
