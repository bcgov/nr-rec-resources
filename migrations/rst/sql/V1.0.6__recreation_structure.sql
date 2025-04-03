create table if not exists rst.recreation_structure_code (
    structure_code serial primary key,
    description varchar(120)
);

select upsert_timestamp_columns('rst', 'recreation_structure_code', true);

select setup_temporal_table('rst', 'recreation_structure_code');

comment on table rst.recreation_structure_code is 'Codes describing the type of structure (human-made improvement) within a recreation project';

comment on column rst.recreation_structure_code.structure_code is 'Indicates the type of structure (human-made improvement)';

comment on column rst.recreation_structure_code.description is 'Description of the code value';

-- Old ids were all over the place, using serial id
insert into rst.recreation_structure_code (description)
values
    ('Table - log'),
    ('Table - wheelchair accessible'),
    ('Toilet - wood'),
    ('Toilet - wheelchair accessible'),
    ('Fire ring'),
    ('Litter barrel - 45 gallon'),
    ('Barrel shelters'),
    ('Parking - unimproved'),
    ('Parking - unsurfaced'),
    ('Parking - spaces gravel'),
    ('Parking - spaces pavement'),
    ('Parking - wheelchair accessible'),
    ('Registration post'),
    ('Boat launch - cartop (unimproved)'),
    ('Boat launch - unimproved'),
    ('Boat launch - gravel'),
    ('Boat launch - concrete'),
    ('Safety barrier'),
    ('Signs'),
    ('Sign - stop'),
    ('Sign - directional (facility)'),
    ('Entrance kiosk'),
    ('Sign shelter'),
    ('Shelter (cabins, warming huts)'),
    ('Shelter - wheelchair accessible'),
    ('Traffic counter'),
    ('Dock wharf'),
    ('Dock wharf - wheelchair accessible'),
    ('Bench'),
    ('Boardwalk'),
    ('Bridge - foot (>6M)'),
    ('Bridge - foot (<6M)'),
    ('Bridge  - wheelchair accessible'),
    ('Corral - firewood'),
    ('Corral - firewood - wheelchair accessible'),
    ('Corral - horse'),
    ('Hitching rail'),
    ('Observation tower'),
    ('Viewing platform'),
    ('Viewing blinds'),
    ('Trail'),
    ('Trail - wheelchair accessible'),
    ('Tent pad'),
    ('Vehicle space'),
    ('Total length of associated roads'),
    ('Dock pier'),
    ('Dock floating'),
    ('Table - concrete'),
    ('Table - metal'),
    ('Toilet - metal'),
    ('Toilet - concrete'),
    ('Toilet - solar composting'),
    ('Litter barrel - bear proof single'),
    ('Litter barrel - bear proof double'),
    ('Gate'),
    ('In-site road'),
    ('Culvert'),
    ('Fencing - russell'),
    ('Stairs'),
    ('Pools and tubs- hotsprings'),
    ('Fish cleaning station'),
    ('Bridge - vehicle'),
    ('Bridge - foot (suspension)'),
    ('Cable car'),
    ('Helipad'),
    ('Log boom'),
    ('Bear cache'),
    ('Fencing - barb wire'),
    ('Fencing - log'),
    ('Fencing - chain link'),
    ('Sign shelter - small'),
    ('Sign shelter - large'),
    ('Sign - 3 blade'),
    ('Sign - highway'),
    ('Barrier - no post'),
    ('Barrier - lock block'),
    ('Gate - single'),
    ('Mooring buoy'),
    ('Registration box'),
    ('Barrier - rock'),
    ('Fencing - strand'),
    ('Gate - double'),
    ('Barrier - wood'),
    ('Bridge - foot');

create table if not exists rst.recreation_structure (
    rec_resource_id varchar(20) not null references rst.recreation_resource (rec_resource_id),
    structure_code int not null references rst.recreation_structure_code (structure_code),
    unique (rec_resource_id, structure_code)
);

select upsert_timestamp_columns('rst', 'recreation_structure');

select setup_temporal_table('rst', 'recreation_structure');

create index idx_recreation_structure_rec_resource_id on rst.recreation_structure(rec_resource_id);

comment on table rst.recreation_structure is 'Information relating to a recreation site improvement in a recreational tenure. All improvements are human-made.';

comment on column rst.recreation_structure.rec_resource_id is 'Identification manually assigned to a Recreation Resource';

comment on column rst.recreation_structure.structure_code is 'Indicates the type of structure (human-made improvement)';
