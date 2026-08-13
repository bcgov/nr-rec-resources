-- Recreation Asset fixtures
-- asset_code values reference rst.recreation_asset_code (legacy codes from V1.1.83):
--   1=Table-Log, 2=Table-Wheelchair, 5=Toilet-Wood, 11=Fire Ring,
--   16=Litter Barrel-45gal, 57=Bench, 78=Trail, 81=Tent Pad, 85=Vehicle Space, 227=Campsite


insert into rst.recreation_asset (
    rec_resource_id, asset_code, asset_tag, asset_name, asset_comment,
    asset_length, asset_width, asset_area, default_value, actual_value, installation_date
)
values
    -- REC204117 - top-level campsite assets
    ('REC204117', 227, 'CS-001', 'Campsite 1', 'Lakeside campsite', null, null, null, 250.00, 250.00, '2015-06-01'),
    ('REC204117', 227, 'CS-002', 'Campsite 2', 'Forested campsite', null, null, null, 250.00, 250.00, '2015-06-01'),
    ('REC204117', 11,  'FR-001', null,          'Fire ring at campsite 1', null, null, null, 80.00, 80.00, '2015-06-01'),
    ('REC204117', 1,   'TBL-001', null,         'Log table at campsite 1', null, null, null, 60.00, 60.00, '2015-06-01'),
    ('REC204117', 5,   'TOI-001', null,         'Wood toilet block',       null, null, null, 500.00, 480.00, '2015-06-01'),
    -- REC1222
    ('REC1222', 227, 'CS-001', 'Campsite 1', null, null, null, null, 250.00, null, '2010-05-15'),
    ('REC1222', 227, 'CS-002', 'Campsite 2', null, null, null, null, 250.00, null, '2010-05-15'),
    ('REC1222', 227, 'CS-003', 'Campsite 3', null, null, null, null, 250.00, null, '2010-05-15'),
    ('REC1222', 11,  'FR-001', null,         'Fire ring campsite 1', null, null, null, 80.00, null, '2010-05-15'),
    ('REC1222', 57,  'BEN-001', null,        'Bench near trailhead', null, null, null, 45.00, null, '2010-05-15'),
    -- REC160773
    ('REC160773', 78,  'TRL-001', 'Main Trail', 'Primary hiking trail', 3200.0, 2.0, null, 12000.00, 11500.00, '2012-08-20'),
    ('REC160773', 81,  'TP-001',  null,          'Tent pad 1',           null,   null, 20.0, 150.00, 150.00, '2012-08-20'),
    ('REC160773', 81,  'TP-002',  null,          'Tent pad 2',           null,   null, 20.0, 150.00, 150.00, '2012-08-20'),
    ('REC160773', 5,   'TOI-001', null,           'Pit toilet',          null,   null, null, 500.00, 500.00, '2012-08-20'),
    -- REC203239
    ('REC203239', 85,  'PKG-001', 'Vehicle Space / Parking', 'Main gravel parking area', null, null, 400.0, 800.00, 800.00, '2018-04-10'),
    ('REC203239', 227, 'CS-001', 'Campsite 1', null, null, null, null, 250.00, null, '2018-04-10'),
    ('REC203239', 227, 'CS-002', 'Campsite 2', null, null, null, null, 250.00, null, '2018-04-10'),
    ('REC203239', 11,  'FR-001', null,         null, null, null, null, 80.00,  null, '2018-04-10'),
    -- REC6866
    ('REC6866', 227, 'CS-001', 'Campsite 1', 'Riverside campsite', null, null, null, 250.00, 275.00, '2009-07-01'),
    ('REC6866', 227, 'CS-002', 'Campsite 2', null,                 null, null, null, 250.00, null,   '2009-07-01'),
    ('REC6866', 16,  'LB-001',  null,         'Litter barrel 45gal', null, null, null, 120.00, 120.00, '2009-07-01'),
    ('REC6866', 2,   'TBL-002', null,         'Accessible table',    null, null, null, 90.00,  90.00, '2009-07-01'),
    -- REC160432
    ('REC160432', 227, 'CS-001', 'Campsite 1', null, null, null, null, 250.00, null, '2014-06-15'),
    ('REC160432', 227, 'CS-002', 'Campsite 2', null, null, null, null, 250.00, null, '2014-06-15'),
    ('REC160432', 5,   'TOI-001', null, 'Pit toilet',      null, null, null, 500.00, 500.00, '2014-06-15'),
    ('REC160432', 57,  'BEN-001', null, 'Entrance bench',  null, null, null,  45.00, null,   '2014-06-15'),
    -- REC6739
    ('REC6739', 78,  'TRL-001', 'Lakeshore Trail', null, 1800.0, 1.5, null, 7200.00, 7200.00, '2011-09-01'),
    ('REC6739', 81,  'TP-001',  null,               'Tent pad 1', null, null, 18.0, 150.00, 150.00, '2011-09-01'),
    ('REC6739', 81,  'TP-002',  null,               'Tent pad 2', null, null, 18.0, 150.00, 140.00, '2011-09-01'),
    ('REC6739', 11,  'FR-001',  null,               null,         null, null, null,  80.00, null,   '2011-09-01'),
    -- REC16158
    ('REC16158', 227, 'CS-001', 'Campsite 1', null, null, null, null, 250.00, null, '2013-05-20'),
    ('REC16158', 227, 'CS-002', 'Campsite 2', null, null, null, null, 250.00, null, '2013-05-20'),
    ('REC16158', 1,   'TBL-001', null, 'Log table',   null, null, null, 60.00, 60.00, '2013-05-20'),
    ('REC16158', 5,   'TOI-001', null, 'Wood toilet', null, null, null, 500.00, 500.00, '2013-05-20');


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
