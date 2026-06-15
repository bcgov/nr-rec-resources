INSERT INTO rst.act_advisories_flat (
    rec_resource_id, advisory_number, title, description, submitted_by,
    access_status_name, access_status_grouplabel, access_status_description,
    event_type, urgency, advisory_status, is_reservations_affected,
    is_advisory_date_displayed, is_effective_date_displayed, is_end_date_displayed,
    is_updated_date_displayed, advisory_date, effective_date, end_date,
    expiry_date, updated_date, published_at,
    listing_rank, urgency_sequence, access_status_precedence, event_type_precedence
) VALUES
-- 1. Season permit required — top advisory on REC204117 (precedence 40, Restricted)
('REC204117', 1067, 'Season fee permit required for trail access', '<div>Trail fee permits must be purchased and displayed on vehicles. Managed in partnership with the Coquihalla Summit Snowmobile Club during the fee collection period.</div>', 'Sarah Mitchell',
 'Restricted: permit required', 'Restricted', 'A permit is required to enter this park - typically for ecological reserves only',
 'Access restricted', 'High', 'Published', false,
 false, false, false, false,
 '2021-07-12 06:30:41+00', '2021-07-12 06:30:41+00', NULL,
 '2026-11-01 00:00:00+00', '2021-07-12 06:30:41+00', '2025-01-08 19:28:11+00',
 0, 3, 40, 172),

-- 2. Full trail closure — top advisory on REC1222 (precedence 10, Closed) ← CLOSED resource 1
('REC1222', 1068, 'Main trail closed due to severe washout and debris', '<div>Flooding has compromised the lower bridge. Structural engineering assessment pending.</div>', 'James Okafor',
 'Full closure', 'Closed', 'The entire park or specific trails are completely closed to all public access.',
 'Trail closure', 'High', 'Published', false,
 true, true, false, true,
 '2026-05-15 08:00:00+00', '2026-05-15 08:00:00+00', NULL,
 '2026-09-01 00:00:00+00', '2026-05-16 14:22:10+00', '2026-05-16 14:25:00+00',
 0, 3, 10, 180),

-- 3. Wildfire evacuation order — top advisory on REC203239 (precedence 20, Closed) ← CLOSED resource 2
('REC203239', 1069, 'EVACUATION ORDER: Active wildfire within park boundary', '<div>An active wildfire is burning within 2 km of the parking lot. All visitors must leave immediately. Firefighting crews are on site.</div>', 'Priya Sandhu',
 'Under evacuation order', 'Closed', 'Immediate threat to human safety requires emergency park clearing.',
 'Wildfire', 'High', 'Published', true,
 true, true, false, true,
 '2026-05-20 12:00:00+00', '2026-05-20 12:00:00+00', NULL,
 '2026-07-15 00:00:00+00', '2026-05-20 14:30:00+00', '2026-05-20 14:31:00+00',
 0, 3, 20, 65),

-- 4. Seasonal cabin access restrictions — top advisory on REC160773 (precedence 120, Seasonal restrictions)
('REC160773', 1070, 'Seasonal facility closures — cabin restricted to emergency use only', '<div>Winter seasonal access restrictions are in effect. The 10K cabin is for emergency use only during avalanche season. Check local conditions before visiting.</div>', 'Priya Sandhu',
 'Seasonal restrictions', 'Seasonal restrictions', 'Seasonal access restrictions are in effect.',
 'Seasonal closure', 'Medium', 'Published', false,
 true, true, true, false,
 '2026-05-30 11:00:00+00', '2026-06-10 07:00:00+00', NULL,
 '2026-10-01 00:00:00+00', '2026-05-30 11:00:00+00', '2026-05-30 11:35:00+00',
 0, 2, 120, 65),

-- 5. Bear activity warning — top advisory on REC0108 (precedence 92, Visit with caution)
('REC0108', 1071, 'Bear activity warning near the day use area', '<div>A bear has been sighted frequenting the day use picnic area. Store food securely and supervise children at all times.</div>', 'Tom Belanger',
 'Warning', 'Visit with caution', 'A public-safety-related incident has occurred that may affect access to the park',
 'Public safety', 'High', 'Published', false,
 true, true, false, true,
 '2026-06-02 09:00:00+00', '2026-06-02 09:00:00+00', NULL,
 '2026-08-02 00:00:00+00', '2026-06-02 09:15:00+00', '2026-06-02 09:16:00+00',
 0, 3, 92, 70),

-- 6. Partial road closure — top advisory on REC0180 (precedence 50, Limited access)
('REC0180', 1072, 'North access road partially closed for bridge repairs', '<div>Bridge structural repairs are underway on the north access road. Single-lane alternating traffic in effect.</div>', 'James Okafor',
 'Partial closure', 'Limited access', 'There is a legal order that prohibits entry to a portion of this park.',
 'Trail closure', 'High', 'Published', false,
 true, true, false, true,
 '2026-06-03 08:00:00+00', '2026-06-03 08:00:00+00', NULL,
 '2026-09-03 00:00:00+00', '2026-06-03 08:30:00+00', '2026-06-03 08:31:00+00',
 0, 3, 50, 180),

-- 7. Trail signage update — sole advisory on REC6866 (precedence 999, Open)
('REC6866', 1073, 'Historic trail route markers refreshed for the summer season', '<div>New waymarkers and interpretive signage have been installed along the 1861 Goldrush Pack Trail. Trail is fully open and in excellent condition.</div>', 'Sarah Mitchell',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Construction', 'Low', 'Published', false,
 true, true, true, true,
 '2026-05-01 08:00:00+00', '2026-05-05 08:00:00+00', '2026-05-15 17:00:00+00',
 '2026-05-16 00:00:00+00', '2026-05-01 17:05:00+00', '2026-05-01 08:30:00+00',
 0, 1, 999, 280),

-- 8. Elevated water levels notice — sole advisory on REC203900 (precedence 999, Open)
('REC203900', 1074, 'Seasonal water levels affecting shoreline access at 18 Mile', '<div>Water levels on Revelstoke Lake are elevated this season due to power generation cycles. Shoreline campsites remain accessible but may be wet near the water line.</div>', 'James Okafor',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Flooding', 'Low', 'Published', false,
 false, true, false, false,
 '2026-05-18 09:00:00+00', '2026-05-18 09:00:00+00', NULL,
 '2026-09-30 00:00:00+00', '2026-05-18 09:30:00+00', '2026-05-18 09:31:00+00',
 0, 1, 999, 120),

-- 9. Wildlife migration notice — sole advisory on REC2094 (precedence 999, Open)
('REC2094', 1075, 'Seasonal wildlife migration activity near Bull River confluence', '<div>Expect elk and deer presence along the river corridor. Please observe wildlife from a distance and store food securely at all times.</div>', 'Tom Belanger',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Wildlife', 'Low', 'Published', false,
 false, true, false, false,
 '2026-05-22 12:00:00+00', '2026-05-24 00:00:00+00', NULL,
 '2026-07-22 00:00:00+00', '2026-05-22 12:00:00+00', '2026-05-22 12:05:00+00',
 0, 1, 999, 75),

-- 10. Campfire ban — secondary advisory on REC204117 (precedence 92, beaten by Restricted at 40)
('REC204117', 1076, 'Category 1 open campfire ban instituted immediately', '<div>Due to elevated fire risk in the Merritt area, campfires are strictly prohibited across all backcountry sites.</div>', 'Sarah Mitchell',
 'Warning', 'Visit with caution', 'Regional prohibitions or regulations have been modified.',
 'Campfires', 'High', 'Published', false,
 true, true, false, false,
 '2026-06-01 12:00:00+00', '2026-06-01 12:00:00+00', NULL,
 '2026-09-30 00:00:00+00', '2026-06-01 12:00:00+00', '2026-06-01 12:01:15+00',
 0, 3, 92, 65),

-- 11. Aggressive bear near campsite — secondary advisory on REC1222 (precedence 92, beaten by Full closure at 10)
('REC1222', 1077, 'Aggressive bear encounter reported near lakeside cache', '<div>A defensive black bear was reported near campsite 4. Ensure all attractants are locked up.</div>', 'James Okafor',
 'Warning', 'Visit with caution', 'A public-safety-related incident has occurred that may affect access to the park',
 'Public safety', 'High', 'Published', false,
 true, true, false, false,
 '2026-05-28 17:30:00+00', '2026-05-28 17:30:00+00', NULL,
 '2026-07-28 00:00:00+00', '2026-05-28 17:45:00+00', '2026-05-28 17:46:00+00',
 0, 3, 92, 70),

-- 12. Boil water advisory — secondary advisory on REC160773 (precedence 999, beaten by Seasonal restrictions at 120)
('REC160773', 1078, 'Boil water advisory active for cabin water supply', '<div>Routine testing showed elevated bacterial counts in the emergency cabin water supply. Use treated or bottled water only until further notice.</div>', 'Tom Belanger',
 'Open', 'Open', 'Park facilities are running under normal conditions.',
 'Boil water advisory', 'Medium', 'Published', false,
 true, true, false, true,
 '2026-05-29 06:00:00+00', '2026-05-29 06:00:00+00', NULL,
 '2026-07-01 00:00:00+00', '2026-05-31 09:00:00+00', '2026-05-29 06:45:00+00',
 0, 1, 999, 180);
