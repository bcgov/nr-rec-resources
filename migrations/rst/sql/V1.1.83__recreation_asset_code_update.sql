-- Truncate and repopulate recreation_asset_code with legacy structure codes
-- asset_code values are preserved from the legacy recreation_structure_code (non-sequential)

truncate table rst.recreation_asset_code restart identity cascade;

-- Re-enable identity override by inserting explicit asset_code values
alter table rst.recreation_asset_code alter column asset_code drop default;
alter sequence rst.recreation_asset_code_asset_code_seq restart with 1;

insert into rst.recreation_asset_code (asset_code, description)
overriding system value
values
    (1,   'Table - Log'),
    (2,   'Table - Wheelchair Accessible'),
    (5,   'Toilet - Wood'),
    (6,   'Toilet - Wheelchair Accessible'),
    (11,  'Fire Ring'),
    (16,  'Litter Barrel - 45 Gallon'),
    (19,  'Barrel Shelters'),
    (21,  'Parking - Unimproved'),
    (22,  'Parking - Unsurfaced'),
    (23,  'Parking - Spaces Gravel'),
    (24,  'Parking - Spaces Pavement'),
    (25,  'Parking - Wheelchair Accessible'),
    (28,  'Registration Post'),
    (30,  'Boat Launch - Cartop (Unimproved)'),
    (31,  'Boat Launch - Unimproved'),
    (32,  'Boat Launch - Gravel'),
    (33,  'Boat Launch - Concrete'),
    (36,  'Safety Barrier'),
    (40,  'Signs'),
    (41,  'Sign - Stop'),
    (42,  'Sign - Directional (Facility)'),
    (43,  'Entrance Kiosk'),
    (44,  'Sign Shelter'),
    (46,  'Shelter (Cabins, Warming Huts)'),
    (47,  'Shelter - Wheelchair Accessible'),
    (51,  'Traffic Counter'),
    (54,  'Dock Wharf'),
    (55,  'Dock Wharf - Wheelchair Accessible'),
    (57,  'Bench'),
    (60,  'Boardwalk'),
    (61,  'Bridge - Foot (>6M)'),
    (62,  'Bridge - Foot (<6M)'),
    (63,  'Bridge - Wheelchair Accessible'),
    (66,  'Corral - Firewood'),
    (67,  'Corral - Firewood - Wheelchair Accessible'),
    (69,  'Corral - Horse'),
    (71,  'Hitching Rail'),
    (73,  'Observation Tower'),
    (75,  'Viewing Platform'),
    (76,  'Viewing Blinds'),
    (78,  'Trail'),
    (79,  'Trail - Wheelchair Accessible'),
    (81,  'Tent Pad'),
    (85,  'Vehicle Space'),
    (86,  'Total Length of Associated Roads'),
    (87,  'Dock Pier'),
    (88,  'Dock Floating'),
    (89,  'Table - Concrete'),
    (90,  'Table - Metal'),
    (91,  'Toilet - Metal'),
    (92,  'Toilet - Concrete'),
    (93,  'Toilet - Solar Composting'),
    (94,  'Litter Barrel - Bear Proof Single'),
    (95,  'Litter Barrel - Bear Proof Double'),
    (96,  'Gate'),
    (97,  'In-Site Road'),
    (98,  'Culvert'),
    (99,  'Fencing - Russell'),
    (100, 'Stairs'),
    (101, 'Pools and Tubs - Hotsprings'),
    (102, 'Fish Cleaning Station'),
    (103, 'Bridge - Vehicle'),
    (104, 'Bridge - Foot (Suspension)'),
    (105, 'Cable Car'),
    (106, 'Helipad'),
    (107, 'Log Boom'),
    (108, 'Bear Cache'),
    (109, 'Fencing - Barb Wire'),
    (110, 'Fencing - Log'),
    (111, 'Fencing - Chain Link'),
    (112, 'Sign Shelter - Small'),
    (113, 'Sign Shelter - Large'),
    (114, 'Sign - 3 Blade'),
    (115, 'Sign - Highway'),
    (200, 'Barrier - No Post'),
    (201, 'Barrier - Lock Block'),
    (202, 'Gate - Single'),
    (203, 'Mooring Buoy'),
    (204, 'Registration Box'),
    (210, 'Barrier - Rock'),
    (216, 'Fencing - Strand'),
    (223, 'Gate - Double'),
    (225, 'Barrier - Wood'),
    (226, 'Bridge - Foot'),
    (227, 'Campsite');

-- Restore the serial default pointing to the sequence
alter table rst.recreation_asset_code alter column asset_code set default nextval('rst.recreation_asset_code_asset_code_seq');

-- Advance the sequence past the highest inserted value so future inserts don't collide
select setval('rst.recreation_asset_code_asset_code_seq', 300);

-- Add inspection/hazard tree assessment date columns to recreation_resource (sourced from fta.recreation_project)
alter table rst.recreation_resource
    add column if not exists last_rec_inspection_date date null;

comment on column rst.recreation_resource.last_rec_inspection_date is
    'The last date of inspection for the recreation resource. Sourced from fta.recreation_project.last_rec_inspection_date.';

alter table rst.recreation_resource
    add column if not exists last_hzrd_tree_assess_date date null;

comment on column rst.recreation_resource.last_hzrd_tree_assess_date is
    'The date of the last hazard tree assessment for the recreation resource. Sourced from fta.recreation_project.last_hzrd_tree_assess_date.';

select sync_temporal_table_schema('rst', 'recreation_resource');
