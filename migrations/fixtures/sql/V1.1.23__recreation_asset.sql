-- Recreation Asset fixtures
-- asset_code values reference rst.recreation_asset_code (legacy codes from V1.1.83):
--   1=Table-Log, 2=Table-Wheelchair, 5=Toilet-Wood, 11=Fire Ring,
--   16=Litter Barrel-45gal, 57=Bench, 78=Trail, 81=Tent Pad, 85=Vehicle Space, 227=Campsite


insert into rst.recreation_asset (
    rec_resource_id, asset_code, asset_tag, asset_name, asset_comment,
    asset_length, asset_width, asset_area, actual_value, installation_date
)
values
    -- REC204117 - top-level campsite assets
    ('REC204117', 227, 'CS-001', 'Campsite 1', 'Lakeside campsite', null, null, null, 250.00, '2015-06-01'),
    ('REC204117', 227, 'CS-002', 'Campsite 2', 'Forested campsite', null, null, null, 250.00, '2015-06-01'),
    ('REC204117', 11,  'FR-001', 'Fire Ring 1', 'Fire ring at campsite 1', null, null, null, 80.00, '2015-06-01'),
    ('REC204117', 1,   'TBL-001', 'Table Wood 1', 'Log table at campsite 1', null, null, null, 60.00, '2015-06-01'),
    ('REC204117', 5,   'TOI-001', 'Toilet Wood Block', 'Wood toilet block',       null, null, null, 480.00, '2015-06-01'),
    -- REC1222
    ('REC1222', 227, 'CS-001', 'Campsite 1', null, null, null, null, null, '2010-05-15'),
    ('REC1222', 227, 'CS-002', 'Campsite 2', null, null, null, null, null, '2010-05-15'),
    ('REC1222', 227, 'CS-003', 'Campsite 3', null, null, null, null, null, '2010-05-15'),
    ('REC1222', 11,  'FR-001', 'Fire Ring 1', 'Fire ring campsite 1', null, null, null, null, '2010-05-15'),
    ('REC1222', 57,  'BEN-001', 'Trailhead Bench', 'Bench near trailhead', null, null, null, null, '2010-05-15'),
    -- REC160773
    ('REC160773', 78,  'TRL-001', 'Main Trail', 'Primary hiking trail', 3200.0, 2.0, null, 11500.00, '2012-08-20'),
    ('REC160773', 81,  'TP-001',  'Tent Pad 1', 'Tent pad 1',           null,   null, 20.0, 150.00, '2012-08-20'),
    ('REC160773', 81,  'TP-002',  'Tent Pad 2', 'Tent pad 2',           null,   null, 20.0, 150.00, '2012-08-20'),
    ('REC160773', 5,   'TOI-001', 'Pit Toilet', 'Pit toilet',          null,   null, null, 500.00, '2012-08-20'),
    -- REC203239
    ('REC203239', 85,  'PKG-001', 'Main Parking Lot', 'Main gravel parking area', null, null, 400.0, 800.00, '2018-04-10'),
    ('REC203239', 227, 'CS-001', 'Campsite 1', null, null, null, null, null, '2018-04-10'),
    ('REC203239', 227, 'CS-002', 'Campsite 2', null, null, null, null, null, '2018-04-10'),
    ('REC203239', 11,  'FR-001', 'Fire Ring 1', null, null, null, null, null, '2018-04-10'),
    -- REC6866
    ('REC6866', 227, 'CS-001', 'Campsite 1', 'Riverside campsite', null, null, null, 275.00, '2009-07-01'),
    ('REC6866', 227, 'CS-002', 'Campsite 2', null,                 null, null, null, null,   '2009-07-01'),
    ('REC6866', 16,  'LB-001',  'Litter Barrel 1', 'Litter barrel 45gal', null, null, null, 120.00, '2009-07-01'),
    ('REC6866', 2,   'TBL-002', 'Table Accessible 1', 'Accessible table',    null, null, null, 90.00, '2009-07-01'),
    -- REC160432
    ('REC160432', 227, 'CS-001', 'Campsite 1', null, null, null, null, null, '2014-06-15'),
    ('REC160432', 227, 'CS-002', 'Campsite 2', null, null, null, null, null, '2014-06-15'),
    ('REC160432', 5,   'TOI-001', 'Pit Toilet', 'Pit toilet',      null, null, null, 500.00, '2014-06-15'),
    ('REC160432', 57,  'BEN-001', 'Entrance Bench', 'Entrance bench',  null, null, null, null, '2014-06-15'),
    -- REC6739
    ('REC6739', 78,  'TRL-001', 'Lakeshore Trail', null, 1800.0, 1.5, null, 7200.00, '2011-09-01'),
    ('REC6739', 81,  'TP-001',  'Tent Pad 1', 'Tent pad 1', null, null, 18.0, 150.00, '2011-09-01'),
    ('REC6739', 81,  'TP-002',  'Tent Pad 2', 'Tent pad 2', null, null, 18.0, 140.00, '2011-09-01'),
    ('REC6739', 11,  'FR-001',  'Fire Ring 1', null,         null, null, null, null,   '2011-09-01'),
    -- REC16158
    ('REC16158', 227, 'CS-001', 'Campsite 1', null, null, null, null, null, '2013-05-20'),
    ('REC16158', 227, 'CS-002', 'Campsite 2', null, null, null, null, null, '2013-05-20'),
    ('REC16158', 1,   'TBL-001', 'Middle Log', 'Log table',   null, null, null, 60.00, '2013-05-20'),
    ('REC16158', 5,   'TOI-001', 'Wood Toilet', 'Wood toilet', null, null, null, 500.00, '2013-05-20');


-- Recreation Asset parent/child fixtures
-- Attaches a subset of non-campsite assets to a campsite asset via parent_id, so some
-- campsites (not all -- reflects real-world data variance) roll up child assets like
-- fire rings and tables. Looked up by rec_resource_id + asset_tag since asset_id is
-- identity-generated above.

update rst.recreation_asset child
set parent_id = parent.asset_id
from (
    values
        ('REC204117', 'FR-001',  'CS-001'),
        ('REC204117', 'TBL-001', 'CS-001'),
        ('REC1222',   'FR-001',  'CS-001'),
        ('REC203239', 'FR-001',  'CS-001'),
        ('REC6866',   'TBL-002', 'CS-001')
) as link(rec_resource_id, child_tag, parent_tag)
join rst.recreation_asset parent
  on parent.rec_resource_id = link.rec_resource_id
 and parent.asset_tag       = link.parent_tag
where child.rec_resource_id = link.rec_resource_id
  and child.asset_tag       = link.child_tag;


-- Recreation Asset Repair fixtures
-- Uses asset_ids generated above; since they are identity columns starting at 1 we reference by relative position.
-- We use a CTE to look up asset_ids by rec_resource_id + asset_tag for safety.

insert into rst.recreation_asset_repair (
    asset_id, recreation_remed_repair_code, estimated_repair_cost, actual_repair_cost,
    repair_completed_date, urgency, trail_segment_start, trail_segment_end
)
select a.asset_id, r.recreation_remed_repair_code, r.estimated_repair_cost,
       r.actual_repair_cost, r.repair_completed_date, r.urgency,
       r.trail_segment_start, r.trail_segment_end
from (
    values
        ('REC204117', 'CS-001', 'BR', 120.50,  120.50,  '2025-02-01'::date, 'Low',    null,     null),
        ('REC204117', 'CS-002', 'MA', 135.75,  135.75,  '2025-02-02'::date, 'Medium', null,     null),
        ('REC204117', 'TOI-001','CL', 320.00,  310.00,  '2025-03-15'::date, 'High',   null,     null),
        ('REC1222',   'CS-001', 'MI', 95.00,   null,    null::date,          'Low',    null,     null),
        ('REC1222',   'CS-002', 'BR', 110.00,  null,    null::date,          'Medium', null,     null),
        ('REC160773', 'TRL-001','MA', 4500.00, 4200.00, '2025-04-10'::date, 'Medium', '0+000',  '1+600'),
        ('REC160773', 'TOI-001','RR', 480.00,  480.00,  '2025-04-12'::date, 'High',   null,     null),
        ('REC203239', 'PKG-001','MI', 650.00,  620.00,  '2025-01-20'::date, 'Low',    null,     null),
        ('REC203239', 'CS-001', 'BR', 140.00,  null,    null::date,          'Medium', null,     null),
        ('REC6866',   'CS-001', 'CL', 75.20,   75.20,   '2025-02-15'::date, 'Low',    null,     null),
        ('REC6866',   'LB-001', 'MA', 200.00,  195.00,  '2025-05-01'::date, 'Medium', null,     null),
        ('REC160432', 'CS-001', 'RR', 100.00,  100.00,  '2025-02-20'::date, 'Low',    null,     null),
        ('REC160432', 'TOI-001','CL', 510.00,  null,    null::date,          'High',   null,     null),
        ('REC6739',   'TRL-001','BR', 3200.00, 3100.00, '2025-03-01'::date, 'Medium', '0+500',  '1+800'),
        ('REC6739',   'TP-002', 'MI', 85.00,   85.00,   '2025-03-05'::date, 'Low',    null,     null),
        ('REC16158',  'CS-001', 'MA', 85.00,   null,    null::date,          'Low',    null,     null),
        ('REC16158',  'TOI-001','BR', 420.00,  420.00,  '2025-03-07'::date, 'High',   null,     null)
) as r(rec_resource_id, asset_tag, recreation_remed_repair_code,
        estimated_repair_cost, actual_repair_cost, repair_completed_date,
        urgency, trail_segment_start, trail_segment_end)
join rst.recreation_asset a
  on a.rec_resource_id = r.rec_resource_id
 and a.asset_tag       = r.asset_tag;


-- Recreation Asset Geometry fixtures
-- Point coordinates offset (in metres, BC Albers/SRID 3005) from each parent site's
-- recreation_site_point location, so assets within a site are spatially distinct but
-- clustered around the site itself. Uses the same asset_id lookup pattern as the repairs above.

insert into rst.recreation_asset_geom (asset_id, geometry_type_code, geometry)
select a.asset_id, g.geometry_type_code, ST_SetSRID(ST_MakePoint(g.x, g.y), 3005)
from (
    values
        -- REC204117 (base 1361130.4325, 527433.4637)
        ('REC204117', 'CS-001',  'PT', 1361090.4325, 527463.4637),
        ('REC204117', 'CS-002',  'PT', 1361170.4325, 527463.4637),
        ('REC204117', 'FR-001',  'PT', 1361095.4325, 527458.4637),
        ('REC204117', 'TBL-001', 'PT', 1361085.4325, 527453.4637),
        ('REC204117', 'TOI-001', 'PT', 1361130.4325, 527383.4637),
        -- REC1222 (base 1216456.3273, 1054575.6144)
        ('REC1222', 'CS-001',  'PT', 1216396.3273, 1054615.6144),
        ('REC1222', 'CS-002',  'PT', 1216456.3273, 1054635.6144),
        ('REC1222', 'CS-003',  'PT', 1216516.3273, 1054615.6144),
        ('REC1222', 'FR-001',  'PT', 1216401.3273, 1054610.6144),
        ('REC1222', 'BEN-001', 'PT', 1216456.3273, 1054505.6144),
        -- REC160773 (base 1362150.3155, 518263.5836)
        ('REC160773', 'TRL-001', 'PT', 1362150.3155, 518263.5836),
        ('REC160773', 'TP-001',  'PT', 1362180.3155, 518243.5836),
        ('REC160773', 'TP-002',  'PT', 1362195.3155, 518238.5836),
        ('REC160773', 'TOI-001', 'PT', 1362130.3155, 518233.5836),
        -- REC203239 (base 1363478.082, 519590.9172)
        ('REC203239', 'PKG-001', 'PT', 1363478.082, 519650.9172),
        ('REC203239', 'CS-001',  'PT', 1363438.082, 519570.9172),
        ('REC203239', 'CS-002',  'PT', 1363518.082, 519570.9172),
        ('REC203239', 'FR-001',  'PT', 1363443.082, 519565.9172),
        -- REC6866 (base 1299471.4207, 903383.8712)
        ('REC6866', 'CS-001',  'PT', 1299431.4207, 903413.8712),
        ('REC6866', 'CS-002',  'PT', 1299511.4207, 903413.8712),
        ('REC6866', 'LB-001',  'PT', 1299471.4207, 903343.8712),
        ('REC6866', 'TBL-002', 'PT', 1299481.4207, 903348.8712),
        -- REC160432 (base 1347040.2173, 570323.5138)
        ('REC160432', 'CS-001',  'PT', 1347000.2173, 570353.5138),
        ('REC160432', 'CS-002',  'PT', 1347080.2173, 570353.5138),
        ('REC160432', 'TOI-001', 'PT', 1347040.2173, 570273.5138),
        ('REC160432', 'BEN-001', 'PT', 1347040.2173, 570393.5138),
        -- REC6739 (base 1579269.7377, 509919.8572)
        ('REC6739', 'TRL-001', 'PT', 1579269.7377, 509919.8572),
        ('REC6739', 'TP-001',  'PT', 1579299.7377, 509899.8572),
        ('REC6739', 'TP-002',  'PT', 1579314.7377, 509894.8572),
        ('REC6739', 'FR-001',  'PT', 1579249.7377, 509904.8572),
        -- REC16158 (base 1214885.9193, 573045.471)
        ('REC16158', 'CS-001',  'PT', 1214845.9193, 573075.471),
        ('REC16158', 'CS-002',  'PT', 1214925.9193, 573075.471),
        ('REC16158', 'TBL-001', 'PT', 1214885.9193, 573045.471),
        ('REC16158', 'TOI-001', 'PT', 1214885.9193, 572985.471)
) as g(rec_resource_id, asset_tag, geometry_type_code, x, y)
join rst.recreation_asset a
  on a.rec_resource_id = g.rec_resource_id
 and a.asset_tag       = g.asset_tag;
