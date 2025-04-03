create table if not exists rst.recreation_district_code (
    district_code varchar(4) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns ('rst', 'recreation_district_code', true);

select setup_temporal_table ('rst', 'recreation_district_code');

comment on table rst.recreation_district_code is 'Recreation district codes for classification of areas within a project.';

comment on column rst.recreation_district_code.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';

comment on column rst.recreation_district_code.description is 'Description of the recreation district boundary type.';

comment on table rst.recreation_district_code is 'Recreation district codes for classification of areas within a project';

comment on column rst.recreation_district_code.district_code is 'A code indicating a recreation district boundary. EG Cascades, Chilliwack, Discovery Coast. Note: There are 17 Recreation District Boundaries, most of which have different geographical boundaries than Forest District Boundaries. Because of this, Rec District Boundary Codes are different from Forest District Boundary Codes.';
comment on column rst.recreation_district_code.description is 'Description of the recreation district boundary type';

insert into rst.recreation_district_code (district_code, description)
values
('RDCC', 'Quesnel-Central Cariboo'),
('RDCK', 'Chilliwack'),
('RDCO', 'Columbia-Shuswap'),
('RDCR', 'Discovery Coast'),
('RDCS', 'Cascades'),
('RDHG', 'Haida Gwaii'),
('RDHW', 'Headwaters'),
('RDKA', 'Kamloops'),
('RDKB', 'Kootenay-Boundary'),
('RDKM', 'North Coast-Kalum-Cassiar'),
('RDMH', '100 Mile-Chilcotin'),
('RDOS', 'Okanagan'),
('RDPC', 'Peace-Ft. Nelson'),
('RDPG', 'Prince George-Mackenzie'),
('RDQC', 'Queen Charlotte Islands (Haida Gwaii)'),
('RDRM', 'Rocky Mountain'),
('RDRN', 'Rocky Mountain North'),
('RDRS', 'Rocky Mountain South'),
('RDSI', 'Sunshine Coast/South Island'),
('RDSQ', 'Squamish'),
('RDSS', 'Nadina-Skeena'),
('RDVA', 'Vanderhoof-Ft. St. James');
