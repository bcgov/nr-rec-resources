-- Test fixtures for Kamloops and Prince George community/city search and map zoom testing.
-- IDs are real prod rec_resource_ids that match FOREST_FILE_ID values in the ArcGIS
-- FeatureServer, so map icons will appear when these resources are returned by search.

-- ============================================================
-- RECREATION_RESOURCE
-- ============================================================
insert into rst.recreation_resource (
    rec_resource_id, name, description, closest_community,
    display_on_public_site, district_code, maintenance_standard_code,
    project_established_date, control_access_code, risk_rating_code,
    right_of_way, rec_status_code
)
values
    ('REC6759',   'LAC DU BOIS ORV',         'Off-road vehicle recreation area north of Kamloops.',                   'KAMLOOPS',      true, 'RDKA', 'M', '2005-01-01', 'R', 'M', null, 'HI'),
    ('REC166399', 'EDITH LAKE',               'Recreation site at Edith Lake with angling and boating.',              'KAMLOOPS',      true, 'RDKA', 'M', '2010-06-01', 'R', 'L', null, 'HI'),
    ('REC98308',  'HARPER MTN BIKE AREA',     'Hiking and mountain biking area on Harper Mountain east of Kamloops.', 'KAMLOOPS',      true, 'RDKA', 'M', '2008-03-15', 'R', 'L', null, 'HI'),
    ('REC97932',  'EAGLE EYE LOOKOUT',        'Hiking trail with panoramic views south of Kamloops.',                 'KAMLOOPS',      true, 'RDKA', 'M', '2007-05-10', 'R', 'L', null, 'HI'),
    ('REC240138', 'SCUITTO LAKE',             'Recreation site at Scuitto Lake for camping and angling.',             'KAMLOOPS',      true, 'RDKA', 'M', '2015-04-20', 'R', 'L', null, 'HI'),
    ('REC98115',  'PIDHERNY',                 'Multi-use recreation site for hiking and mountain biking.',            'PRINCE GEORGE', true, 'RDPG', 'M', '2006-08-15', 'R', 'L', null, 'HI'),
    ('REC33110',  'CHILAKO RIVER',            'Riverside recreation site with beach activities.',                     'PRINCE GEORGE', true, 'RDPG', 'M', '2005-07-01', 'R', 'L', null, 'HI'),
    ('REC162814', 'TABOR MTN. TRAIL SYSTEM',  'Multi-use trail system on Tabor Mountain near Prince George.',         'PRINCE GEORGE', true, 'RDPG', 'M', '2011-05-15', 'R', 'L', null, 'HI');

-- ============================================================
-- RECREATION_STATUS
-- ============================================================
insert into rst.recreation_status (rec_resource_id, status_code, comment)
values
    ('REC6759',   1, 'Open'),
    ('REC166399', 1, 'Open'),
    ('REC98308',  1, 'Open'),
    ('REC97932',  1, 'Open'),
    ('REC240138', 1, 'Open'),
    ('REC98115',  1, 'Open'),
    ('REC33110',  1, 'Open'),
    ('REC162814', 2, 'Temporarily closed due to wet trail conditions.');

-- ============================================================
-- RECREATION_ACTIVITY
-- ============================================================
insert into rst.recreation_activity (rec_resource_id, recreation_activity_code)
values
    ('REC6759',   20),  -- Trail bike riding - motorized
    ('REC166399',  1),  -- Angling
    ('REC166399',  2),  -- Boating
    ('REC98308',  12),  -- Hiking
    ('REC98308',  27),  -- Mountain biking
    ('REC97932',  12),  -- Hiking
    ('REC240138',  1),  -- Angling
    ('REC240138', 32),  -- Camping
    ('REC98115',  12),  -- Hiking
    ('REC98115',  27),  -- Mountain biking
    ('REC33110',   8),  -- Beach activities
    ('REC33110',   9),  -- Picnicking
    ('REC33110',   7),  -- Swimming & bathing
    ('REC162814', 12),  -- Hiking
    ('REC162814', 27),  -- Mountain biking
    ('REC162814', 19);  -- Horseback riding

-- ============================================================
-- RECREATION_SITE_POINT
-- Geometries are expressed as WGS84 lat/lon and transformed to BC Albers (EPSG:3005).
-- Coordinates are approximate real-world locations for each resource.
-- ============================================================
insert into rst.recreation_site_point (
    rec_resource_id, geometry, revision_count,
    updated_at, updated_by, created_at, created_by, sys_period
)
values
    -- Kamloops area (~50.67, -120.33)
    ('REC6759',   ST_Transform(ST_SetSRID(ST_MakePoint(-120.43, 50.83), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC166399', ST_Transform(ST_SetSRID(ST_MakePoint(-120.48, 50.73), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC98308',  ST_Transform(ST_SetSRID(ST_MakePoint(-120.10, 50.67), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC97932',  ST_Transform(ST_SetSRID(ST_MakePoint(-120.32, 50.62), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC240138', ST_Transform(ST_SetSRID(ST_MakePoint(-120.35, 50.79), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    -- Prince George area — real ArcGIS locations (EPSG:3857 → WGS84 converted)
    ('REC98115',  ST_Transform(ST_SetSRID(ST_MakePoint(-122.864484, 53.985556), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC33110',  ST_Transform(ST_SetSRID(ST_MakePoint(-122.970036, 53.831133), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    ('REC162814', ST_Transform(ST_SetSRID(ST_MakePoint(-122.449725, 53.943315), 4326), 3005), 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)');

-- ============================================================
-- RECREATION_MAP_FEATURE
-- Sets recreation_resource_type used in search result cards.
-- SIT = Recreation site, RTE = Recreation trail
-- rmf_skey values start at 900001 to avoid conflicts with existing fixtures.
-- ============================================================
insert into rst.recreation_map_feature (
    rmf_skey, rec_resource_id, section_id, amendment_id, amend_status_code,
    recreation_resource_type, amend_status_date, retirement_date, revision_count,
    recreation_map_feature_guid, updated_at, updated_by, created_at, created_by, sys_period
)
values
    (900001, 'REC6759',   null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-6759',   '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900002, 'REC166399', null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-166399', '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900003, 'REC98308',  null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-98308',  '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900004, 'REC97932',  null, 1, 'APP', 'RTE', '2021-01-01', null, 1, 'fixture-rmf-97932',  '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900005, 'REC240138', null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-240138', '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900006, 'REC98115',  null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-98115',  '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900007, 'REC33110',  null, 1, 'APP', 'SIT', '2021-01-01', null, 1, 'fixture-rmf-33110',  '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900008, 'REC162814', null, 1, 'APP', 'RTE', '2021-01-01', null, 1, 'fixture-rmf-162814', '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)');

-- ============================================================
-- RECREATION_MAP_FEATURE_GEOM
-- Small circular polygons (100m radius) around each site point.
-- Required so the detail endpoint's INNER JOIN on recreation_map_feature_geom
-- returns rows and includes site_point_geometry in the API response.
-- map_feature_id values start at 9000001 to avoid conflicts.
-- ============================================================
insert into rst.recreation_map_feature_geom (
    rmf_skey, map_feature_id, geometry_type_code, geometry, feature_area, feature_length, feature_perimeter,
    revision_count, updated_at, updated_by, created_at, created_by, sys_period
)
values
    (900001, 9000001, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-120.43, 50.83), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900002, 9000002, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-120.48, 50.73), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900003, 9000003, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-120.10, 50.67), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900004, 9000004, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-120.32, 50.62), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900005, 9000005, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-120.35, 50.79), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900006, 9000006, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-122.864484, 53.985556), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900007, 9000007, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-122.970036, 53.831133), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)'),
    (900008, 9000008, 'P', ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(-122.449725, 53.943315), 4326), 3005), 100), 0.0314, 0.628, 0.628, 1, '2021-01-01 00:00:00', 'FIXTURE', '2021-01-01 00:00:00', 'FIXTURE', '["2025-03-25 00:51:09.255651+00",)');

-- Refresh materialized views so new resources appear in search results
refresh materialized view rst.recreation_resource_access_count_view;
refresh materialized view rst.recreation_resource_district_count_view;
refresh materialized view rst.recreation_resource_type_count_view;
refresh materialized view rst.recreation_resource_search_view;
