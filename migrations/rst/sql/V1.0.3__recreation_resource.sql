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

select setup_temporal_table('rst', 'recreation_resource');

comment on table rst.recreation_resource is 'Resource information relating to a recreational file. A recreation file can have only one resource. A recreation resource must be of type Site, Reserve, Trail, or Interpretive Forest.';

comment on column rst.recreation_resource.rec_resource_id is 'Identification manually assigned to a Recreation Resource.';

comment on column rst.recreation_resource.name is 'Name of the Recreation Project.';

comment on column rst.recreation_resource.closest_community is 'A text description generally describing the closest community or, for more isolated sites and trails, it could be a geographic feature to a recreation site or trail. e.g. VERNON, KELOWNA, PRINCE GEORGE.';

comment on column rst.recreation_resource.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';


-- Test temporal tables
insert into
  rst.recreation_resource (
    rec_resource_id,
    name,
    description,
    closest_community,
    display_on_public_site
  )
values
  (
    'REC99', -- test id
    'Test',
    'The Zero K Tulameen Snowmobile Parking Lot is an area managed for snowmobilers who use the Mt. Henning and 10 K Area Snowmobile Trails in the vicinity. The parking lot and the trail network it supports is managed under a partnership agreement with the Coquihalla Summit Snowmobile Club during the snowmobile season and has an informative kiosk, outhouse and fee collection hut complete with a heated change room. Fees are applicable for the use of the snowmobile trails which are frequently groomed.',
    'MERRITT',
    true
  );

-- Test update
update
  rst.recreation_resource
set
  name = 'Test Updated'
where
  rec_resource_id = 'REC99';

-- Test update 2
update
  rst.recreation_resource
set
  name = 'Test Updated 2'
where
  rec_resource_id = 'REC99';

-- Test update 3

update
  rst.recreation_resource
set
  name = 'Test Updated 3'
where
  rec_resource_id = 'REC99';
