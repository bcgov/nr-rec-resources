create table if not exists rst.recreation_structure_code (
    structure_code serial primary key,
    description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_structure_code');

select setup_temporal_table('rst', 'recreation_structure_code');

comment on table rst.recreation_structure_code is 'Codes describing the type of structure (human-made improvement) within a recreation project';

comment on column rst.recreation_structure_code.structure_code is 'Indicates the type of structure (human-made improvement)';

comment on column rst.recreation_structure_code.description is 'Description of the code value';

-- Old ids were all over the place, using serial id
insert into rst.recreation_structure_code (description)
values
    ('Table - Log'),
    ('Table - Wheelchair Accessible'),
    ('Toilet - Wood'),
    ('Toilet - Wheelchair Accessible'),
    ('Fire Ring'),
    ('Litter Barrel - 45 Gallon'),
    ('Barrel Shelters'),
    ('Parking - Unimproved'),
    ('Parking - Unsurfaced'),
    ('Parking - Spaces Gravel'),
    ('Parking - Spaces Pavement'),
    ('Parking - Wheelchair Accessible'),
    ('Registration Post'),
    ('Boat Launch - Cartop (Unimproved)'),
    ('Boat Launch - Unimproved'),
    ('Boat Launch - Gravel'),
    ('Boat Launch - Concrete'),
    ('Safety Barrier'),
    ('Signs'),
    ('Sign - Stop'),
    ('Sign - Directional (Facility)'),
    ('Entrance Kiosk'),
    ('Sign Shelter'),
    ('Shelter (Cabins, Warming Huts)'),
    ('Shelter - Wheelchair Accessible'),
    ('Traffic Counter'),
    ('Dock Wharf'),
    ('Dock Wharf - Wheelchair Accessible'),
    ('Bench'),
    ('Boardwalk'),
    ('Bridge - Foot (>6M)'),
    ('Bridge - Foot (<6M)'),
    ('Bridge  - Wheelchair Accessible'),
    ('Corral - Firewood'),
    ('Corral - Firewood - Wheelchair Accessible'),
    ('Corral - Horse'),
    ('Hitching Rail'),
    ('Observation Tower'),
    ('Viewing Platform'),
    ('Viewing Blinds'),
    ('Trail'),
    ('Trail - Wheelchair Accessible'),
    ('Tent Pad'),
    ('Vehicle Space'),
    ('Total Length of Associated Roads'),
    ('Dock Pier'),
    ('Dock Floating'),
    ('Table - Concrete'),
    ('Table - Metal'),
    ('Toilet - Metal'),
    ('Toilet - Concrete'),
    ('Toilet - Solar Composting'),
    ('Litter Barrel - Bear Proof Single'),
    ('Litter Barrel - Bear Proof Double'),
    ('Gate'),
    ('In-Site Road'),
    ('Culvert'),
    ('Fencing - Russell'),
    ('Stairs'),
    ('Pools and Tubs- Hotsprings'),
    ('Fish Cleaning Station'),
    ('Bridge - Vehicle'),
    ('Bridge - Foot (Suspension)'),
    ('Cable Car'),
    ('Helipad'),
    ('Log Boom'),
    ('Bear Cache'),
    ('Fencing - Barb Wire'),
    ('Fencing - Log'),
    ('Fencing - Chain Link'),
    ('Sign Shelter - Small'),
    ('Sign Shelter - Large'),
    ('Sign - 3 Blade'),
    ('Sign - Highway'),
    ('Barrier - No Post'),
    ('Barrier - Lock Block'),
    ('Gate - Single'),
    ('Mooring Buoy'),
    ('Registration Box'),
    ('Barrier - Rock'),
    ('Fencing - Strand'),
    ('Gate - Double'),
    ('Barrier - Wood'),
    ('Bridge - Foot');

create table if not exists rst.recreation_structure (
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    structure_code int not null references rst.recreation_structure_code (structure_code),
    unique (rec_resource_id, structure_code)
);

select upsert_timestamp_columns('rst', 'recreation_structure');

select setup_temporal_table('rst', 'recreation_structure');

comment on table rst.recreation_structure is 'Information relating to a recreation site improvement in a recreational tenure. All improvements are human-made.';

comment on column rst.recreation_structure.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_structure.structure_code is 'Indicates the type of structure (human-made improvement)';
