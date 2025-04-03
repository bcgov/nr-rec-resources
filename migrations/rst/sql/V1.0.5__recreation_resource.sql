create table if not exists rst.recreation_resource (
    rec_resource_id varchar(20) not null primary key,
    name varchar(200),
    description text,
    closest_community varchar(200),
    display_on_public_site boolean default false,
    district_code varchar(4) references rst.recreation_district_code (district_code),
    maintenance_standard_code varchar(1) references rst.recreation_maintenance_standard_code (maintenance_standard_code)
);

select upsert_timestamp_columns ('rst', 'recreation_resource');

select setup_temporal_table ('rst', 'recreation_resource');

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column rst.recreation_resource.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_resource.name is 'Name of the Recreation Project.';

comment on column rst.recreation_resource.description is 'Field notes related to a recreation site. e.g. A managed, 11 unit site with 2WD access, gravel beach launch and a small float. Watch for hazards on the lake. This column is for internal use and is not a description for public use.';

comment on column rst.recreation_resource.closest_community is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';

comment on column rst.recreation_resource.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
