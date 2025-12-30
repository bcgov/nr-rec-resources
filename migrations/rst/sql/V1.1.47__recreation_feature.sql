create table if not exists rst.recreation_feature_code (
    recreation_feature_code varchar(3) primary key,
    description varchar(120) not null
);

select upsert_timestamp_columns('rst', 'recreation_feature_code', true);
select setup_temporal_table('rst', 'recreation_feature_code', true);

comment on table rst.recreation_feature_code is 'Codes describing the recreation features within a recreation resource.';
comment on column rst.recreation_feature_code.recreation_feature_code is 'Code describing the Recreation Feature.';
comment on column rst.recreation_feature_code.description is 'Description of the code value.';

insert into rst.recreation_feature_code (recreation_feature_code, description)
values
('A1', 'Sport fish'),
('A2', 'Aquatic habitat'),
('A3', 'Fish run and observation'),
('A4', 'Edible aquatic foods'),
('B1', 'Fine texture beach'),
('B2', 'Sand beach'),
('B3', 'Pebble beach'),
('B4', 'Cobble beach'),
('B5', 'Rubble beach'),
('B6', 'Beach - texture unknown'),
('C1', 'Cultural site'),
('C2', 'Pastoral landscape'),
('C3', 'Vacant land'),
('C4', 'Man-made feature'),
('D0', 'Hydrologic'),
('E1', 'Alpine/high sub-alpine'),
('E2', 'Transitional'),
('E3', 'Coniferous'),
('E4', 'Deciduous'),
('E5', 'Mixed forest'),
('E6', 'Forest parkland'),
('E7', 'Non-forested'),
('E8', 'Wetland vegetation'),
('F1', 'Site-specific waterfall'),
('F2', 'Waterfall landscape'),
('F3', 'Rapids and chutes'),
('G1', 'Glaciers and glacial features'),
('G2', 'Snowfield and icefield'),
('H1', 'Historic site'),
('H2', 'Monument'),
('H3', 'Historic route'),
('H4', 'Historic native legend site'),
('J1', 'Estuary'),
('J2', 'Tidal marsh'),
('J3', 'Lagoon'),
('J4', 'Tidal flat'),
('J5', 'Rock platforms and ledges'),
('J6', 'Spits and hooks'),
('J7', 'Points'),
('J8', 'Tombolo'),
('J9', 'Pocket beaches'),
('L1', 'Glacial ice melting'),
('L2', 'Glacial ice movement'),
('L3', 'Periglacial'),
('L4', 'Moraine, ridges, and cirques'),
('L5', 'Karst'),
('L6', 'Avalanche tracks, talus, and scree'),
('L7', 'Landslides'),
('L8', 'Canyons, escarpments, and hoodoos'),
('L9', 'River and stream deposits'),
('M1', 'Frequent small water body'),
('M2', 'Small surface waters'),
('M3', 'Large surface waters'),
('P1', 'Habitation or campsites'),
('P2', 'Rock art'),
('P3', 'Prehistoric trails'),
('P4', 'Resource utilization sites'),
('Q1', 'Regional topographic patterns'),
('Q2', 'Local topographic patterns'),
('Q3', 'Shorelands'),
('R1', 'Exposed bed rock'),
('R2', 'Exposed internal rock structure'),
('R3', 'Mineral deposit'),
('R4', 'Fossils'),
('R5', 'Volcanic'),
('S1', 'Thermal springs'),
('S2', 'Freshwater springs'),
('S3', 'Mineral springs'),
('T1', 'Unmanaged trail'),
('T2', 'Active forest service trail'),
('T3', 'Inactive forest service trail'),
('U0', 'Harbours'),
('V0', 'Visual resource'),
('V1', 'High sensitivity rating'),
('V2', 'Medium sensitivity rating'),
('V3', 'Low sensitivity rating'),
('V4', 'High sensitivity, low visual absorption'),
('V5', 'High sensitivity, medium visual absorption'),
('V6', 'High sensitivity, high visual absorption'),
('V7', 'Medium sensitivity, low visual absorption'),
('V8', 'Medium sensitivity, medium visual absorption'),
('V9', 'Medium sensitivity, high visual absorption'),
('W1', 'Upland birds or aquatic birds'),
('W2', 'Small mammals'),
('W3', 'Large mammals'),
('W4', 'Marine mammals'),
('W5', 'Wildlife diversity'),
('X0', 'Miscellaneous feature');

-- Create table linking resources to feature codes
create table if not exists rst.recreation_feature (
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    recreation_feature_code varchar(3) not null references rst.recreation_feature_code (recreation_feature_code),
    unique (rec_resource_id, recreation_feature_code)
);

select upsert_timestamp_columns('rst', 'recreation_feature');
select setup_temporal_table('rst', 'recreation_feature', true);

comment on table rst.recreation_feature is 'Associates recreation resources with one or more recreation feature codes.';
comment on column rst.recreation_feature.rec_resource_id is 'Identification assigned to a Recreation Resource.';
comment on column rst.recreation_feature.recreation_feature_code is 'Code describing the Recreation Feature.';
