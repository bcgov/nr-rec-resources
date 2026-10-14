-- Notes and references fixture data.
--
-- Mixes staff-authored notes (source_system RST, editable) with rows taken
-- verbatim from the FTA PROVFOREST_NOTE and ASSOCIATED_USE extracts
-- (source_system FTA, read-only) so the locked path is testable locally.
--
-- Rows whose FTA entry_userid is RECREATION_CONVERSION are excluded: they are
-- machine-generated conversion summaries, not notes a person wrote.

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
    ('REC0587', 'NOTE', 'FTA Note', '<p>General Status/Use:   primarily used as picnic area<br>Outhouse: 70% full<br>Current Needs:  replace 2 fire rings (sites 2,3), install complete Entrance sign</p>', '2008-05-01', 'FTA', '53192', 'IDIR\JGILKES'),
    ('REC166903', 'NOTE', 'FTA Note', '<p>Area 1st legally designated under Rec2972. Variance June 20, 2013 to corrrect data errors, and designate area as Rec166903.</p>', '2013-06-26', 'FTA', '102520', 'IDIR\GELECLAI'),
    ('REC0019', 'NOTE', 'FTA Note', '<p>Data fix boundary adjustment private land overlap</p>', '2021-12-14', 'FTA', '174941', 'IDIR\BDOWEDOF'),
    ('REC0587', 'NOTE', 'FTA Note', '<p>Established Feb 28/85 (Forest Act, s104.1)</p>', '2010-02-08', 'FTA', '71399', 'IDIR\KEESKELI'),
    ('REC0108', 'NOTE', 'FTA Note', '<p>Data fix remove road r/w</p>', '2022-03-17', 'FTA', '176187', 'IDIR\BDOWEDOF'),
    ('REC262200', 'NOTE', 'FTA Note', '<p>More trails to be GPS''d</p>', '2020-02-24', 'FTA', '159838', 'IDIR\BDOWEDOF'),
    -- No human-entered association in ASSOCIATED_USE happens to land on a
    -- fixture resource, so this row copies the shape of a real one
    -- (REC5886 -> REC6085, source F, IDIR\EXMURRAY) onto REC0108 so the
    -- "FTA Associated File" title is exercised locally.
    ('REC0108', 'NOTE', 'FTA Associated File - Forest Tenure System (FTAS)', '<p>Source file ID: REC0108<br>Associated file ID: REC6085<br>File source: Forest Tenure System (FTAS) (F)</p>', '2006-09-25', 'FTA', 'REC0108|F|REC6085', 'IDIR\EXMURRAY'),
    ('REC0019', 'NOTE', 'Access road washout after spring melt', '<p>The last 2km of the access road washed out during the spring melt. Grading is scheduled but the site should be treated as <strong>4WD only</strong> until it is confirmed complete.</p>', '2026-04-18', 'RST', null, 'IDIR\SJOHNSON'),
    ('REC0019', 'NOTE', 'Tenure overlap with grazing licence', '<p>Portions of the site overlap an active grazing licence. Coordinate any footprint changes with the range officer before approving work.</p>', '2026-02-02', 'RST', null, 'IDIR\MCHEN'),
    ('REC0108', 'NOTE', 'Seasonal bear activity', '<p>Bear activity reported each year between August and October. Signage goes up at the start of August and comes down after the first hard frost.</p>', '2025-11-26', 'RST', null, 'IDIR\SJOHNSON')
on conflict do nothing;
