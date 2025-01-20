create extension if not exists "postgis";

create schema if not exists rst;

create table if not exists rst.recreation_resource (
    rec_resource_id varchar(200) not null primary key,
    name varchar(200),
    description varchar(5000),
    site_location varchar(200)
);

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

create table rst.recreation_activity_code (
    recreation_activity_code varchar(3) primary key,
    description varchar(120)
);

comment on table rst.recreation_activity_code is 'Activity code types for recreation projects.';

comment on column rst.recreation_activity_code.recreation_activity_code is 'Code describing the Recreation Activity.';

comment on column rst.recreation_activity_code.description is 'Description of the code value.';

create table if not exists rst.recreation_activity (
    id serial primary key, -- This is a surrogate key to make Prisma happy
    rec_resource_id varchar(200) not null references rst.recreation_resource (rec_resource_id),
    recreation_activity_code varchar(3) not null references rst.recreation_activity_code (recreation_activity_code)
);

comment on table rst.recreation_activity is 'The types of available activities for a given project.';

comment on column rst.recreation_activity.rec_resource_id is 'File identification assigned to Provincial Forest Use files. Assigned file number. Usually the Licence, Tenure or Private Mark number.';

comment on column rst.recreation_activity.recreation_activity_code is 'Code describing the Recreation Activity.';
