create table if not exists rst.recreation_access_code (
    access_code varchar(3) primary key,
    description varchar(120),
    sub_description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_access_code', true);

select setup_temporal_table('rst', 'recreation_access_code');

comment on table rst.recreation_access_code is 'Codes describing types of access to Recreation Resources';

comment on column rst.recreation_access_code.access_code is 'Code identifying the type of access';

comment on column rst.recreation_access_code.description is 'Description of the code value';

comment on column rst.recreation_access_code.sub_description is 'Additional description of the code value';

create table if not exists rst.recreation_sub_access_code (
    sub_access_code varchar(3) primary key,
    description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_sub_access_code', true);

select setup_temporal_table('rst', 'recreation_sub_access_code');

comment on table rst.recreation_sub_access_code is 'Codes describing the Recreation Sub Access types within a project.';

comment on column rst.recreation_sub_access_code.sub_access_code is 'Code describing the Recreation Sub Access types.';

comment on column rst.recreation_sub_access_code.description is 'Description of the code value.';

insert into rst.recreation_sub_access_code (sub_access_code, description)
values
    ('2W', '2 wheel drive'),
    ('4W', '4 wheel drive'),
    ('BM', 'Motorized'),
    ('BN', 'Non-motorized'),
    ('FI', 'Fly-in'),
    ('MH', 'Motorhome'),
    ('TM', 'Multi-use'),
    ('TN', 'Non-motorized');

create table if not exists rst.recreation_access (
    id serial primary key, -- This is a surrogate key to make Prisma happy
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    access_code varchar(3) not null references rst.recreation_access_code (access_code),
    sub_access_code varchar(3) references rst.recreation_sub_access_code (sub_access_code),
    unique (rec_resource_id, access_code, sub_access_code)
);

select upsert_timestamp_columns('rst', 'recreation_access');

select setup_temporal_table('rst', 'recreation_access');

create index idx_recreation_access_rec_resource_id on rst.recreation_access(rec_resource_id);

comment on table rst.recreation_access is 'Recreation Resource Access types';

comment on column rst.recreation_access.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_access.access_code is 'Code identifying the type of access';

-- Manually inserting these to split the description with sub_description
insert into
    rst.recreation_access_code (access_code, description, sub_description)
values
    ('B', 'Boat-in', 'Motor or canoe/kayak'),
    ('F', 'Fly-in', null),
    ('R', 'Road', '4 wheel drive, 2 wheel drive, or motor home'),
    ('T', 'Trail', 'Multi-use, snowmobile, XC ski, ATV, horse, mtn bike, hiking');
