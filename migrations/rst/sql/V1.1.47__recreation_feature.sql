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
('A1', 'Sport Fish'),
('A2', 'Aquatic Habitat'),
('A3', 'Fish Run and Observation'),
('A4', 'Edible Aquatic Foods'),
('B1', 'Fine Texture Beach'),
('B2', 'Sand Beach'),
('B3', 'Pebble Beach'),
('B4', 'Cobble Beach'),
('B5', 'Rubble Beach'),
('B6', 'Beach - Texture Unknown'),
('C1', 'Cultural Site'),
('C2', 'Pastoral Landscape'),
('C3', 'Vacant Land'),
('C4', 'Man-Made Feature'),
('D0', 'Hydrologic'),
('E1', 'Alpine/High Sub-Alpine'),
('E2', 'Transitional'),
('E3', 'Coniferous'),
('E4', 'Deciduous'),
('E5', 'Mixed Forest'),
('E6', 'Forest Parkland'),
('E7', 'Non-Forested'),
('E8', 'Wetland Vegetation'),
('F1', 'Site-Specific Waterfall'),
('F2', 'Waterfall Landscape'),
('F3', 'Rapids and Chutes'),
('G1', 'Glaciers and Glacial Features'),
('G2', 'Snowfield and Icefield'),
('H1', 'Historic Site'),
('H2', 'Monument'),
('H3', 'Historic Route'),
('H4', 'Historic Native Legend Site'),
('J1', 'Estuary'),
('J2', 'Tidal Marsh'),
('J3', 'Lagoon'),
('J4', 'Tidal Flat'),
('J5', 'Rock Platforms and Ledges'),
('J6', 'Spits and Hooks'),
('J7', 'Points'),
('J8', 'Tombolo'),
('J9', 'Pocket Beaches'),
('L1', 'Glacial Ice Melting'),
('L2', 'Glacial Ice Movement'),
('L3', 'Periglacial'),
('L4', 'Moraine, Ridges, and Cirques'),
('L5', 'Karst'),
('L6', 'Avalance Tracks, Talus, and Scree'),
('L7', 'Landslides'),
('L8', 'Canyons, Escarpments, and Hoodoos'),
('L9', 'River and Stream Deposits'),
('M1', 'Frequent Small Water Body'),
('M2', 'Small Surface Waters'),
('M3', 'Large Surface Waters'),
('P1', 'Habitation or Campsites'),
('P2', 'Rock Art'),
('P3', 'Prehistoric Trails'),
('P4', 'Resource Utilization Sites'),
('Q1', 'Regional Topographic Patterns'),
('Q2', 'Local Topographic Patterns'),
('Q3', 'Shorelands'),
('R1', 'Exposed Bed Rock'),
('R2', 'Exposed Internal Rock Structure'),
('R3', 'Mineral Deposit'),
('R4', 'Fossils'),
('R5', 'Volcanic'),
('S1', 'Thermal Springs'),
('S2', 'Freshwater Springs'),
('S3', 'Mineral Springs'),
('T1', 'Unmanaged Trail'),
('T2', 'Active Forest Service Trail'),
('T3', 'Inactive Forest Service Trail'),
('U0', 'Harbours'),
('V0', 'Visual Resource'),
('V1', 'High Sensitivity Rating'),
('V2', 'Medium Sensitivity Rating'),
('V3', 'Low Sensitivity Rating'),
('V4', 'High Sensitivity, Low Visual Absorption'),
('V5', 'High Sensitivity, Medium Visual Absorption'),
('V6', 'High Sensitivity, High Visual Absorption'),
('V7', 'Medium Sensitivity, Low Visual Absorption'),
('V8', 'Medium Sensitivity, Medium Visual Absorption'),
('V9', 'Medium Sensitivity, High Visual Absorption'),
('W1', 'Upland Birds or Aquatic Birds'),
('W2', 'Small Mammals'),
('W3', 'Large Mammals'),
('W4', 'Marine Mammals'),
('W5', 'Wildlife Diversity'),
('X0', 'Miscellaneous Feature');

-- Create table linking resources to zero-or-more feature codes
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
