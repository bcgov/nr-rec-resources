create table if not exists rst.recreation_resource_type_code (
    rec_resource_type_code varchar(10) primary key,
    description varchar(200) not null
);

comment on table rst.recreation_resource_type_code is 'Codes describing types of Recreation Resources';

comment on column rst.recreation_resource_type_code.rec_resource_type_code is 'Identifies the Recreation Resource Type Code';

comment on column rst.recreation_resource_type_code.description is 'Description of the code value';

create table if not exists rst.recreation_resource_type (
    id serial primary key, -- This is a surrogate key to make Prisma happy
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    rec_resource_type_code varchar(10) not null references rst.recreation_resource_type_code (rec_resource_type_code)
);

comment on table rst.recreation_resource_type is 'Captures both current and historical attributes for Recreation Map Types';

comment on column rst.recreation_resource_type.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_resource_type.rec_resource_type_code is 'Identifies the Recreation Resource Type Code';
