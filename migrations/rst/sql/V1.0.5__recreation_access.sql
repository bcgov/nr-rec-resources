create table if not exists rst.recreation_access_code (
    access_code varchar(3) primary key,
    description varchar(120),
    sub_description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_access_code');

comment on table rst.recreation_access_code is 'Codes describing types of access to Recreation Resources';

comment on column rst.recreation_access_code.access_code is 'Code identifying the type of access';

comment on column rst.recreation_access_code.description is 'Description of the code value';

comment on column rst.recreation_access_code.sub_description is 'Additional description of the code value';

create table if not exists rst.recreation_sub_access_code (
    sub_access_code varchar(3) primary key,
    description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_sub_access_code');

comment on table rst.recreation_sub_access_code is 'Codes describing the Recreation Sub Access types within a project.';

comment on column rst.recreation_sub_access_code.sub_access_code is 'Code describing the Recreation Sub Access types.';

comment on column rst.recreation_sub_access_code.description is 'Description of the code value.';

create table if not exists rst.recreation_access (
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    access_code varchar(3) not null references rst.recreation_access_code (access_code),
    sub_access_code varchar(3) references rst.recreation_sub_access_code (sub_access_code),
    unique (rec_resource_id, access_code, sub_access_code)
);

select upsert_timestamp_columns('rst', 'recreation_access');

select setup_temporal_table('rst', 'recreation_access');

comment on table rst.recreation_access is 'Recreation Resource Access types';

comment on column rst.recreation_access.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_access.access_code is 'Code identifying the type of access';

-- Manually inserting these to split the description with sub_description
insert into
    rst.recreation_access_code (access_code, description, sub_description)
values
    ('B', 'Boat-in', 'Motor or Canoe/Kayak'),
    ('F', 'Fly-in', null),
    ('R', 'Road', '4 wheel drive, 2 wheel drive, or motor home'),
    ('T', 'Trail', 'Multi-use, Snowmobile, XC Ski, ATV, horse, mtn bike, hiking');

select upsert_timestamp_columns('rst', 'recreation_access_code');

select setup_temporal_table('rst', 'recreation_access_code');
