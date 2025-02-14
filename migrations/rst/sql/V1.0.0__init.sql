create extension if not exists "postgis";

create schema if not exists rst;

create table if not exists rst.recreation_resource_type_code (
    rec_resource_type_code varchar(10) primary key,
    description varchar(200)
);

create table if not exists rst.recreation_district_code (
    district_code varchar(4) primary key,
    description varchar(120) not null
);

create table if not exists rst.recreation_resource (
    rec_resource_id varchar(200) not null primary key,
    name varchar(200),
    description varchar(5000),
    closest_community varchar(200),
    display_on_public_site boolean default false,
    campsite_count integer default 0,
    rec_resource_type varchar(10) not null references rst.recreation_resource_type_code (rec_resource_type_code),
    district_code varchar(4) references rst.recreation_district_code (district_code)
);

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column rst.recreation_resource.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_resource.name is 'Name of the Recreation Project.';

comment on column rst.recreation_resource.closest_community is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';

comment on column rst.recreation_resource.rec_resource_type is 'Code representing a specific feature associated with the recreation resource.';

comment on column rst.recreation_resource.campsite_count is 'Number of campsites available in the recreation site or trail.';

comment on column rst.recreation_resource.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
