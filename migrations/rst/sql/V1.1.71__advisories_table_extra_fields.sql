ALTER TABLE rst.act_advisories_flat
    ADD COLUMN listing_rank integer NOT NULL DEFAULT 0,
    ADD COLUMN urgency_sequence integer NOT NULL DEFAULT 0,
    ADD COLUMN access_status_precedence integer NOT NULL DEFAULT 0,
    ADD COLUMN event_type_precedence integer NOT NULL DEFAULT 0;

comment on column rst.act_advisories_flat.listing_rank is 'Rank for ordering advisories in listings, calculated based on urgency, access status, and event type to ensure the most critical advisories are displayed prominently.';
comment on column rst.act_advisories_flat.urgency_sequence is 'Sequence number for the urgency level associated with the advisory.';
comment on column rst.act_advisories_flat.access_status_precedence is 'Precedence level for the access status associated with the advisory.';
comment on column rst.act_advisories_flat.event_type_precedence is 'Precedence level for the event type associated with the advisory.';
