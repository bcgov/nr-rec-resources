create table if not exists rst.recreation_maintainace_code (
    recreation_maintainace_code varchar(1) primary key,
    description varchar(120) not null
);

comment on table rst.recreation_maintainace_code is 'Recreation maintenance standard codes for classifying site maintenance levels.';
comment on column rst.recreation_maintainace_code.recreation_maintainace_code is 'A code indicating a specific maintenance standard. E.g., M for Maintained to Standard, U for User Maintained.';
comment on column rst.recreation_maintainace_code.description is 'Description of the maintenance standard type.';

insert into rst.recreation_maintainace_code (recreation_maintainace_code, description)
values
    ('M', 'Maintained to Standard'),
    ('U', 'User Maintained');

create table if not exists rst.recreation_maintainace (
    id serial primary key,
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id),
    recreation_maintainace_code varchar(1) not null references rst.recreation_maintainace_code (recreation_maintainace_code)
);
