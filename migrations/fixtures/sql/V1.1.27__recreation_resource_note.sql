-- Notes and references fixture data.
--
-- Mixes editable staff-authored notes with read-only rows taken from the FTA
-- extracts, so both paths are testable locally.
--
-- The first block covers the resources at the top of the admin list, which
-- sorts by name, so the section can be demoed without searching for an id.
-- Those FTA rows carry real note text, author and date from the extracts, but
-- re-pointed onto these resources: the only real notes on them come from
-- RECREATION_CONVERSION, which the import filters out. Their source_key is
-- prefixed so a later real import cannot collide with them.

insert into rst.recreation_resource_note (
    rec_resource_id,
    note_type_code,
    title,
    body,
    date_logged,
    source_system,
    source_key,
    created_by
) values
    -- REC204117 0 K SNOWMOBILE PARKING LOT
    ('REC204117', 'NOTE', 'FTA Note', '<p>exclude trail portion on private land</p>', '2020-04-07', 'FTA', 'DEMO-161140', 'IDIR\BDOWEDOF'),
    ('REC204117', 'NOTE', 'Overflow lot is not plowed', '<p>Contractor only does the main lot. Overflow stays gated until spring.</p>', '2026-01-12', 'RST', null, 'IDIR\SJOHNSON'),
    -- REC1222 100 ROAD BRIDGE
    ('REC1222', 'NOTE', 'FTA Note', '<p>High risk of landslides at this site</p>', '2007-01-04', 'FTA', 'DEMO-43516', 'IDIR\TAMCMILL'),
    ('REC1222', 'NOTE', 'FTA Associated File - Forest Tenure System (FTAS)', '<p>Source file ID: REC1222<br>Associated file ID: REC6085<br>File source: Forest Tenure System (FTAS) (F)</p>', '2006-09-25', 'FTA', 'REC1222|F|REC6085', 'IDIR\EXMURRAY'),
    ('REC1222', 'NOTE', 'Load rating is from 2019', '<p>Posted rating is from the 2019 inspection. Engineering wants another look before hauling season, so treat it as <strong>provisional</strong>.</p>', '2026-03-04', 'RST', null, 'IDIR\MCHEN'),
    -- REC160773 10K CABIN
    ('REC160773', 'NOTE', 'FTA Note', '<p>At this time the cabin will be archived</p>', '2015-04-01', 'FTA', 'DEMO-116834', 'IDIR\BDOWEDOF'),
    ('REC160773', 'NOTE', 'Woodstove needs a new door gasket', '<p>Reported by a user in March. Parts are on order, no date yet.</p>', '2026-03-22', 'RST', null, 'IDIR\SJOHNSON'),
    -- REC203239 10 K SNOWMOBILE PARKING LOT
    ('REC203239', 'NOTE', 'FTA Note', '<p>-no rock fire pits have been removed<br>-no garbage has been cleaned up<br>-no site # signs<br>-no RFR''s removed</p>', '2007-05-31', 'FTA', 'DEMO-45322', 'IDIR\NKEKULA'),
    ('REC203239', 'NOTE', 'FTA Associated File - Land Titles Office', '<p>Source file ID: REC203239<br>Associated file ID: CA3918244<br>File source: Land Titles Office (L)</p>', '2019-04-11', 'FTA', 'REC203239|L|CA3918244', 'IDIR\BDOWEDOF'),
    -- REC6866 1861 GOLDRUSH PACK TRAIL
    ('REC6866', 'NOTE', 'FTA Note', '<p>Site used frequently for marshalling point/campsite for Grizzly Bear study crews</p>', '2007-03-03', 'FTA', 'DEMO-44311', 'IDIR\EABELS'),
    ('REC6866', 'NOTE', 'FTA Note', '<p>This file was a "Map Notation".<br><br>The application for ''reservation'' has been canceled April 01, 1985</p>', '2006-12-27', 'FTA', 'DEMO-43461', 'IDIR\TIMBENNE'),
    -- Real notes on their own resources
    ('REC0587', 'NOTE', 'FTA Note', '<p>General Status/Use:   primarily used as picnic area<br>Outhouse: 70% full<br>Current Needs:  replace 2 fire rings (sites 2,3), install complete Entrance sign</p>', '2008-05-01', 'FTA', '53192', 'IDIR\JGILKES'),
    ('REC166903', 'NOTE', 'FTA Note', '<p>Area 1st legally designated under Rec2972. Variance June 20, 2013 to corrrect data errors, and designate area as Rec166903.</p>', '2013-06-26', 'FTA', '102520', 'IDIR\GELECLAI'),
    ('REC0019', 'NOTE', 'FTA Note', '<p>Data fix boundary adjustment private land overlap</p>', '2021-12-14', 'FTA', '174941', 'IDIR\BDOWEDOF'),
    ('REC0587', 'NOTE', 'FTA Note', '<p>Established Feb 28/85 (Forest Act, s104.1)</p>', '2010-02-08', 'FTA', '71399', 'IDIR\KEESKELI'),
    ('REC0108', 'NOTE', 'FTA Note', '<p>Data fix remove road r/w</p>', '2022-03-17', 'FTA', '176187', 'IDIR\BDOWEDOF'),
    ('REC262200', 'NOTE', 'FTA Note', '<p>More trails to be GPS''d</p>', '2020-02-24', 'FTA', '159838', 'IDIR\BDOWEDOF'),
    -- Adapted from a real association onto a fixture resource, since no real
    -- one lands on any of them.
    ('REC0108', 'NOTE', 'FTA Associated File - Forest Tenure System (FTAS)', '<p>Source file ID: REC0108<br>Associated file ID: REC6085<br>File source: Forest Tenure System (FTAS) (F)</p>', '2006-09-25', 'FTA', 'REC0108|F|REC6085', 'IDIR\EXMURRAY'),
    ('REC0019', 'NOTE', 'Access road washed out', '<p>Last 2km went out in the spring melt. Grading is booked but it is <strong>4WD only</strong> until that is done.</p>', '2026-04-18', 'RST', null, 'IDIR\SJOHNSON'),
    ('REC0019', 'NOTE', 'Overlaps a grazing licence', '<p>Part of the site sits under an active grazing licence. Check with the range officer before approving any work.</p>', '2026-02-02', 'RST', null, 'IDIR\MCHEN'),
    ('REC0108', 'NOTE', 'Bears every fall', '<p>Reports come in every year from August to October. Signs go up in August and come down after the first hard frost.</p>', '2025-11-26', 'RST', null, 'IDIR\SJOHNSON')
on conflict do nothing;
