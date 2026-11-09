-- Sync recreation_asset_code dimension flags with the reviewed per-type answers.
-- Asset codes not listed here keep their current flags.

update rst.recreation_asset_code ac
set has_length = v.has_length,
    has_width  = v.has_width,
    has_area   = v.has_area
from (values
    -- asset_code, has_length, has_width, has_area
    (1,   false, false, false), -- Table - Log
    (2,   false, false, false), -- Table - Wheelchair Accessible
    (5,   false, false, false), -- Toilet - Wood
    (6,   false, false, false), -- Toilet - Wheelchair Accessible
    (11,  false, false, false), -- Fire Ring
    (16,  false, false, false), -- Litter Barrel - 45 Gallon
    (19,  false, false, false), -- Barrel Shelters
    (21,  true,  true,  true ), -- Parking - Unimproved
    (22,  true,  true,  true ), -- Parking - Unsurfaced
    (23,  true,  true,  true ), -- Parking - Spaces Gravel
    (24,  true,  true,  true ), -- Parking - Spaces Pavement
    (25,  true,  true,  true ), -- Parking - Wheelchair Accessible
    (28,  false, false, false), -- Registration Post
    (30,  true,  false, false), -- Boat Launch - Cartop (Unimproved)
    (31,  true,  false, false), -- Boat Launch - Unimproved
    (32,  true,  false, false), -- Boat Launch - Gravel
    (33,  true,  false, false), -- Boat Launch - Concrete
    (36,  true,  false, false), -- Safety Barrier
    (40,  false, false, false), -- Signs
    (41,  false, false, false), -- Sign - Stop
    (42,  false, false, false), -- Sign - Directional (Facility)
    (43,  false, false, false), -- Entrance Kiosk
    (44,  false, false, false), -- Sign Shelter
    (46,  true,  true,  true ), -- Shelter (Cabins, Warming Huts)
    (47,  true,  true,  true ), -- Shelter - Wheelchair Accessible
    (51,  false, false, false), -- Traffic Counter
    (54,  true,  true,  false), -- Dock Wharf
    (57,  false, false, false), -- Bench
    (60,  true,  true,  false), -- Boardwalk
    (62,  true,  true,  false), -- Bridge - Foot (<6M)
    (63,  true,  true,  false), -- Bridge - Wheelchair Accessible
    (66,  true,  true,  true ), -- Corral - Firewood
    (69,  true,  true,  true ), -- Corral - Horse
    (71,  true,  false, false), -- Hitching Rail
    (73,  false, false, false), -- Observation Tower
    (75,  true,  true,  true ), -- Viewing Platform
    (78,  true,  true,  false), -- Trail
    (81,  true,  true,  false), -- Tent Pad
    (85,  false, false, false), -- Vehicle Space
    (86,  true,  true,  false), -- Total Length of Associated Roads
    (87,  true,  true,  false), -- Dock Pier
    (88,  true,  true,  false), -- Dock Floating
    (89,  false, false, false), -- Table - Concrete
    (90,  false, false, false), -- Table - Metal
    (91,  false, false, false), -- Toilet - Metal
    (92,  false, false, false), -- Toilet - Concrete
    (93,  false, false, false), -- Toilet - Solar Composting
    (94,  false, false, false), -- Litter Barrel - Bear Proof Single
    (95,  false, false, false), -- Litter Barrel - Bear Proof Double
    (96,  true,  false, false), -- Gate
    (97,  true,  true,  false), -- In-Site Road
    (98,  true,  true,  false), -- Culvert
    (99,  true,  false, false), -- Fencing - Russell
    (100, true,  false, false), -- Stairs
    (101, false, false, false), -- Pools and Tubs- Hotsprings
    (102, false, false, false), -- Fish Cleaning Station
    (103, true,  true,  false), -- Bridge - Vehicle
    (104, true,  true,  false), -- Bridge - Foot (Suspension)
    (105, true,  false, false), -- Cable Car
    (106, false, false, false), -- Helipad
    (107, false, false, false), -- Log Boom
    (108, false, false, false), -- Bear Cache
    (109, true,  false, false), -- Fencing - Barb Wire
    (110, true,  false, false), -- Fencing - Log
    (111, true,  false, false), -- Fencing - Chain Link
    (112, false, false, false), -- Sign Shelter - Small
    (113, false, false, false), -- Sign Shelter - Large
    (114, false, false, false), -- Sign - 3 Blade
    (200, true,  false, false), -- Barrier - No Post
    (201, true,  false, false), -- Barrier - Lock Block
    (202, false, false, false), -- Gate - Single
    (203, false, false, false), -- Mooring Buoy
    (204, false, false, false), -- Registration Box
    (210, true,  false, false), -- Barrier - Rock
    (216, true,  false, false), -- Fencing - Strand
    (223, false, false, false), -- Gate - Double
    (225, true,  false, false), -- Barrier - Wood
    (226, true,  true,  true )  -- Bridge - Foot
) as v (asset_code, has_length, has_width, has_area)
where ac.asset_code = v.asset_code;
