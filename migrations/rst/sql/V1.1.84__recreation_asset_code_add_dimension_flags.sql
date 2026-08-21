-- Add dimension flag columns to recreation_asset_code
-- These boolean flags indicate which dimension measurements are applicable
-- for a given asset type, derived from fta.recreation_struct_dimen_xref.

alter table rst.recreation_asset_code
    add column if not exists has_length boolean not null default false,
    add column if not exists has_width  boolean not null default false,
    add column if not exists has_area   boolean not null default false;

comment on column rst.recreation_asset_code.has_length is 'Indicates whether a length measurement is applicable for this asset type (dimension code L).';
comment on column rst.recreation_asset_code.has_width  is 'Indicates whether a width measurement is applicable for this asset type (dimension code W).';
comment on column rst.recreation_asset_code.has_area   is 'Indicates whether an area measurement is applicable for this asset type (dimension code A).';

-- Set has_length = true for asset codes that have dimension code 'L'
update rst.recreation_asset_code
set has_length = true
where asset_code in (
    21,  -- Parking - Unimproved
    22,  -- Parking - Unsurfaced
    23,  -- Parking - Spaces Gravel
    24,  -- Parking - Spaces Pavement
    25,  -- Parking - Wheelchair Accessible
    30,  -- Boat Launch - Cartop (Unimproved)
    32,  -- Boat Launch - Gravel
    33,  -- Boat Launch - Concrete
    36,  -- Safety Barrier
    46,  -- Shelter (Cabins, Warming Huts)
    47,  -- Shelter - Wheelchair Accessible
    54,  -- Dock Wharf
    60,  -- Boardwalk
    62,  -- Bridge - Foot (<6M)
    63,  -- Bridge - Wheelchair Accessible
    71,  -- Hitching Rail
    78,  -- Trail
    79,  -- Trail - Wheelchair Accessible
    81,  -- Tent Pad
    86,  -- Total Length of Associated Roads
    87,  -- Dock Pier
    88,  -- Dock Floating
    96,  -- Gate
    97,  -- In-Site Road
    98,  -- Culvert
    103, -- Bridge - Vehicle
    104, -- Bridge - Foot (Suspension)
    105, -- Cable Car
    109, -- Fencing - Barb Wire
    110, -- Fencing - Log
    111, -- Fencing - Chain Link
    200, -- Barrier - No Post
    201, -- Barrier - Lock Block
    210, -- Barrier - Rock
    216, -- Fencing - Strand
    225, -- Barrier - Wood
    226  -- Bridge - Foot
);

-- Set has_width = true for asset codes that have dimension code 'W'
update rst.recreation_asset_code
set has_width = true
where asset_code in (
    21,  -- Parking - Unimproved
    22,  -- Parking - Unsurfaced
    23,  -- Parking - Spaces Gravel
    24,  -- Parking - Spaces Pavement
    25,  -- Parking - Wheelchair Accessible
    46,  -- Shelter (Cabins, Warming Huts)
    47,  -- Shelter - Wheelchair Accessible
    54,  -- Dock Wharf
    60,  -- Boardwalk
    81,  -- Tent Pad
    87,  -- Dock Pier
    88,  -- Dock Floating
    97,  -- In-Site Road
    98   -- Culvert
);

-- Set has_area = true for asset codes that have dimension code 'A'
update rst.recreation_asset_code
set has_area = true
where asset_code in (
    21,  -- Parking - Unimproved
    22,  -- Parking - Unsurfaced
    23,  -- Parking - Spaces Gravel
    24,  -- Parking - Spaces Pavement
    25   -- Parking - Wheelchair Accessible
);

select sync_temporal_table_schema('rst', 'recreation_asset_code');
