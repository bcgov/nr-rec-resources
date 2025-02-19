create table rst.recreation_access_code (
    recreation_access_code varchar(3) primary key,
    description varchar(120),
    sub_description varchar(120)
);

comment on table rst.recreation_access_code is 'Codes describing types of access to Recreation Resources';

comment on column rst.recreation_access_code.recreation_access_code is 'Code identifying the type of access';

comment on column rst.recreation_access_code.description is 'Description of the code value';

comment on column rst.recreation_access_code.sub_description is 'Additional description of the code value';

create table rst.recreation_access (
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    recreation_access_code varchar(3) not null references rst.recreation_access_code (recreation_access_code)
);

comment on table rst.recreation_access is 'Recreation Resource Access types';

comment on column rst.recreation_access.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_access.recreation_access_code is 'Code identifying the type of access';

insert into
    rst.recreation_access_code (recreation_access_code, description, sub_description)
values
    ('B', 'Boat-in', 'Motor or Canoe/Kayak'),
    ('F', 'Fly-in', null),
    ('R', 'Road', '4 wheel drive, 2 wheel drive, or motor home'),
    ('T', 'Trail', 'Multi-use, Snowmobile, XC Ski, ATV, horse, mtn bike, hiking');
