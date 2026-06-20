INSERT INTO rst.act_advisories_flat (
    rec_resource_id, advisory_number, title, description, submitted_by,
    access_status_name, access_status_grouplabel, access_status_description,
    event_type, urgency, advisory_status, is_reservations_affected,
    is_advisory_date_displayed, is_effective_date_displayed, is_end_date_displayed,
    is_updated_date_displayed, advisory_date, effective_date, end_date,
    expiry_date, updated_date, published_at,
    listing_rank, urgency_sequence, access_status_precedence, event_type_precedence
) VALUES
-- 1. Ecological Reserve Access Restriction (permit required, High urgency, Restricted access)
('REC204117', 1067, 'A permit is required to access this ecological reserve', '<div>Permits are available for research and educational activities only.</div>', 'Sarah Mitchell',
 'Restricted: permit required', 'Restricted', 'A permit is required to enter this park - typically for ecological reserves only',
 'Access restricted', 'High', 'Published', false,
 false, false, false, false,
 '2021-07-12 06:30:41+00', '2021-07-12 06:30:41+00', NULL,
 NULL, '2021-07-12 06:30:41+00', '2025-01-08 19:28:11+00',
 0, 3, 40, 172),

-- 2. Trail Closure (High urgency, Closed access)
('REC1222', 1068, 'Main trail closed due to severe washout and debris', '<div>Flooding has compromised the lower bridge. Structural engineering assessment pending.</div>', 'James Okafor',
 'Closed', 'Closed', 'The entire park or specific trails are completely closed to all public access.',
 'Trail closure', 'High', 'Published', false,
 true, true, false, true,
 '2026-05-15 08:00:00+00', '2026-05-15 08:00:00+00', NULL,
 NULL, '2026-05-16 14:22:10+00', '2026-05-16 14:25:00+00',
 1, 3, 50, 180),

-- 3. Wildlife Migration Notice (Low urgency, Open access — low urgency advisories use Open status)
('REC160773', 1069, 'Seasonal wildlife migration activity in area', '<div>Expect heavy elk presence along the northern boundary roads. Please drive with caution.</div>', 'Priya Sandhu',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Wildlife', 'Low', 'Published', false,
 false, true, false, false,
 '2026-05-20 12:00:00+00', '2026-05-22 00:00:00+00', NULL,
 NULL, '2026-05-20 12:00:00+00', '2026-05-20 12:05:00+00',
 5, 1, 20, 100),

-- 4. Service Disruption with Reservation Impact (Medium urgency, Open access)
('REC204117', 1070, 'Campground power grid upgrade delays reservation window', '<div>Electrical maintenance has been extended. Affected reservation holders will be contacted.</div>', 'Sarah Mitchell',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Service disruption', 'Medium', 'Published', true,
 true, true, true, true,
 '2026-05-25 09:15:00+00', '2026-06-01 00:00:00+00', '2026-06-15 18:00:00+00',
 '2026-06-16 00:00:00+00', '2026-05-25 10:00:00+00', '2026-05-25 10:02:00+00',
 2, 2, 10, 120),

-- 5. Bear Safety Advisory (High urgency, Caution: Wildlife activity)
('REC1222', 1071, 'Aggressive bear encounter reported near lakeside cache', '<div>A defensive black bear was reported near campsite 4. Ensure all attractants are locked up.</div>', 'James Okafor',
 'Caution: Wildlife activity', 'Caution', NULL,
 'Public safety', 'High', 'Published', false,
 true, true, false, false,
 '2026-05-28 17:30:00+00', '2026-05-28 17:30:00+00', NULL,
 NULL, '2026-05-28 17:45:00+00', '2026-05-28 17:46:00+00',
 0, 3, 30, 190),

-- 6. Prescribed Burn Preparation — Draft, not yet published
('REC160773', 1072, 'Scheduled preventative prescribed burn preparation', '<div>Crews will be staging equipment along the fire access roads. Draft review required before launch.</div>', 'Priya Sandhu',
 'Information', 'Information', 'General park notice or update.',
 'Fire Management', 'Low', 'Draft', false,
 false, false, false, false,
 '2026-05-30 11:00:00+00', '2026-06-10 07:00:00+00', NULL,
 NULL, '2026-05-30 11:00:00+00', NULL,
 10, 1, 10, 105),

-- 7. Archived Construction Notice (Low urgency, Open access, fully closed out with removal date)
('REC204117', 1073, 'Temporary construction noise near day use beach area', '<div>Heavy excavation equipment will be operating near the boat launch.</div>', 'Tom Belanger',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Construction', 'Low', 'Scheduled', false,
 true, true, true, true,
 '2026-04-01 08:00:00+00', '2026-04-05 08:00:00+00', '2026-04-10 17:00:00+00',
 '2026-04-11 00:00:00+00', '2026-04-10 17:05:00+00', '2026-04-01 08:30:00+00',
 99, 1, 0, 80),

-- 8. Flash Flood Closure (High urgency, Closed — no Extreme urgency level in the real system)
('REC1222', 1074, 'EVACUATION ORDER: Extreme flash flood risk', '<div>Leave the riverbank corridors immediately. Park rangers are supervising staging areas.</div>', 'James Okafor',
 'Closed', 'Closed', 'Immediate threat to human safety requires emergency park clearing.',
 'Natural Hazard', 'High', 'Published', true,
 true, true, false, false,
 '2026-05-31 22:10:00+00', '2026-05-31 22:10:00+00', NULL,
 NULL, '2026-05-31 22:15:00+00', '2026-05-31 22:15:12+00',
 0, 4, 100, 250),

-- 9. Boil Water Advisory (Medium urgency, Open access — real boil water advisories use Open status)
('REC160773', 1075, 'Boil water advisory active for campground taps', '<div>Routine testing showed elevated bacterial counts. Water treatment infrastructure is being flushed.</div>', 'Tom Belanger',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Boil water advisory', 'Medium', 'Published', false,
 true, true, false, true,
 '2026-05-29 06:00:00+00', '2026-05-29 06:00:00+00', NULL,
 NULL, '2026-05-31 09:00:00+00', '2026-05-29 06:45:00+00',
 3, 2, 35, 140),

-- 10. Campfire Ban (High urgency, Caution)
('REC204117', 1076, 'Category 1 open campfire ban instituted immediately', '<div>Due to climbing unseasonable indices, campfires are strictly prohibited across all backcountry sites.</div>', 'Sarah Mitchell',
 'Caution', 'Caution', 'Regional prohibitions or regulations have been modified.',
 'Campfires', 'High', 'Published', false,
 true, true, false, false,
 '2026-06-01 12:00:00+00', '2026-06-01 12:00:00+00', NULL,
 NULL, '2026-06-01 12:00:00+00', '2026-06-01 12:01:15+00',
 0, 3, 30, 200);
