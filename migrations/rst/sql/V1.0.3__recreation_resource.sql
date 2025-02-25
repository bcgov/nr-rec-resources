create table if not exists rst.recreation_district_code (
    district_code varchar(4) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns('rst', 'recreation_district_code');

create table if not exists rst.recreation_resource (
    rec_resource_id varchar(20) not null primary key,
    name varchar(200),
    description varchar(5000),
    closest_community varchar(200),
    display_on_public_site boolean default false,
    district_code varchar(4) references rst.recreation_district_code (district_code)
);

select upsert_timestamp_columns('rst', 'recreation_resource');

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column rst.recreation_resource.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_resource.name is 'Name of the Recreation Project.';

comment on column rst.recreation_resource.closest_community is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';

comment on column rst.recreation_resource.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
