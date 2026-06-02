INSERT INTO rst.act_advisories_flat (
    rec_resource_id, advisory_number, title, description, submitted_by,
    access_status_name, access_status_grouplabel, access_status_description,
    event_type, urgency, advisory_status, is_reservations_affected,
    is_advisory_date_displayed, is_effective_date_displayed, is_end_date_displayed,
    is_updated_date_displayed, advisory_date, effective_date, end_date,
    expiry_date, removal_date, updated_date, modified_date, published_at,
    listing_rank, urgency_sequence, access_status_precedence, event_type_precedence
) VALUES
-- 1. Active Restricted Advisory (Matches your baseline API payload exactly)
('REC204117', 1067, 'A permit is required to access this ecological reserve', '<div>Permits are available for research and educational activities only.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Restricted: permit required', 'Restricted', 'A permit is required to enter this park - typically for ecological reserves only',
 'Access restricted', 'High', 'Published', false,
 false, false, false, false,
 '2021-07-12 06:30:41+00', '2021-07-12 06:30:41+00', NULL,
 NULL, NULL, '2021-07-12 06:30:41+00', '2025-01-08 19:28:08+00', '2025-01-08 19:28:11+00',
 0, 3, 40, 172),

-- 2. Regular Trail Closure Notice
('REC1222', 1068, 'Main trail closed due to severe washout and debris', '<div>Flooding has compromised the lower bridge. Structural engineering assessment pending.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Closed', 'Closed', 'The entire park or specific trails are completely closed to all public access.',
 'Trail closure', 'High', 'Published', false,
 true, true, false, true,
 '2026-05-15 08:00:00+00', '2026-05-15 08:00:00+00', NULL,
 NULL, NULL, '2026-05-16 14:22:10+00', '2026-05-16 14:22:10+00', '2026-05-16 14:25:00+00',
 1, 3, 50, 180),

-- 3. Low Urgency Informational Notice
('REC160773', 1069, 'Seasonal wildlife migration activity in area', '<div>Expect heavy elk presence along the northern boundary roads. Please drive with caution.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Caution', 'Caution', 'Special safety hazards exist; visitors should exercise extreme vigilance.',
 'Information', 'Low', 'Published', false,
 false, false, false, false,
 '2026-05-20 12:00:00+00', '2026-05-22 00:00:00+00', NULL,
 NULL, NULL, '2026-05-20 12:00:00+00', '2026-05-20 12:05:00+00', '2026-05-20 12:05:00+00',
 5, 1, 20, 100),

-- 4. Dynamic Reservation Impact Notice
('REC204117', 1070, 'Campground power grid upgrade delays reservation window', '<div>Electrical maintenance has been extended. Affected reservation holders will be contacted.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Special Note', 'Information', NULL,
 'Service disruption', 'Medium', 'Published', true,
 true, true, true, true,
 '2026-05-25 09:15:00+00', '2026-06-01 00:00:00+00', '2026-06-15 18:00:00+00',
 '2026-06-16 00:00:00+00', NULL, '2026-05-25 10:00:00+00', '2026-05-25 10:00:00+00', '2026-05-25 10:02:00+00',
 2, 2, 10, 120),

-- 5. Public Safety Advisory with No Status Description
('REC1222', 1071, 'Aggressive bear encounter reported near lakeside cache', '<div>A defensive black bear was reported near campsite 4. Ensure all attractants are locked up.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Caution: Wildlife activity', 'Caution', NULL,
 'Public safety', 'High', 'Published', false,
 true, true, false, false,
 '2026-05-28 17:30:00+00', '2026-05-28 17:30:00+00', NULL,
 NULL, NULL, '2026-05-28 17:45:00+00', '2026-05-28 17:45:00+00', '2026-05-28 17:46:00+00',
 0, 3, 30, 190),

-- 6. Draft Advisory (Demonstrates Null Published Status)
('REC160773', 1072, 'Scheduled preventative prescribed burn preparation', '<div>Crews will be staging equipment along the fire access roads. Draft review required before launch.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Information', 'Information', 'General park notice or update.',
 'Fire Management', 'Low', 'Draft', false,
 false, false, false, false,
 '2026-05-30 11:00:00+00', '2026-06-10 07:00:00+00', NULL,
 NULL, NULL, '2026-05-30 11:00:00+00', '2026-05-30 11:30:00+00', NULL,
 10, 1, 10, 105),

-- 7. Complete Historic Record (With Populated Removal/End Dates)
('REC204117', 1073, 'Temporary construction noise near day use beach area', '<div>Heavy excavation equipment will be operating near the boat launch.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Full Access', 'Open', 'Park facilities are running under normal conditions.',
 'Construction', 'Low', 'Archived', false,
 true, true, true, true,
 '2026-04-01 08:00:00+00', '2026-04-05 08:00:00+00', '2026-04-10 17:00:00+00',
 '2026-04-11 00:00:00+00', '2026-04-11 06:00:00+00', '2026-04-10 17:05:00+00', '2026-04-11 06:00:00+00', '2026-04-01 08:30:00+00',
 99, 1, 0, 80),

-- 8. Emergency Closure Triggered by Flash Floods
('REC1222', 1074, 'EVACUATION ORDER: Extreme flash flood risk', '<div>Leave the riverbank corridors immediately. Park rangers are supervising staging areas.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Emergency Evacuation', 'Closed', 'Immediate threat to human safety requires emergency park clearing.',
 'Natural Hazard', 'Extreme', 'Published', true,
 true, true, false, false,
 '2026-05-31 22:10:00+00', '2026-05-31 22:10:00+00', NULL,
 NULL, NULL, '2026-05-31 22:15:00+00', '2026-05-31 22:15:00+00', '2026-05-31 22:15:12+00',
 0, 4, 100, 250),

-- 9. Water Quality Alert affecting specific amenities
('REC160773', 1075, 'Boil water advisory active for campground taps', '<div>Routine testing showed elevated bacterial counts. Water treatment infrastructure is being flushed.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Restricted Facility Use', 'Caution', 'Certain facilities or services are offline or unsafe.',
 'Health Advisory', 'Medium', 'Published', false,
 true, true, false, true,
 '2026-05-29 06:00:00+00', '2026-05-29 06:00:00+00', NULL,
 NULL, NULL, '2026-05-31 09:00:00+00', '2026-05-31 09:00:00+00', '2026-05-29 06:45:00+00',
 3, 2, 35, 140),

-- 10. Fire Ban Notification
('REC204117', 1076, 'Category 1 open campfire ban instituted immediately', '<div>Due to climbing unseasonable indices, campfires are strictly prohibited across all backcountry sites.</div>', 'iou6ya5nwcph2mlmnq9cwi4i',
 'Fire Restructured', 'Caution', 'Regional prohibitions or regulations have been modified.',
 'Fire Ban', 'High', 'Published', false,
 true, true, false, false,
 '2026-06-01 12:00:00+00', '2026-06-01 12:00:00+00', NULL,
 NULL, NULL, '2026-06-01 12:00:00+00', '2026-06-01 12:00:00+00', '2026-06-01 12:01:15+00',
 0, 3, 30, 200);
