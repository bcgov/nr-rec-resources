-- Append-only audit log for fee determination letter (FDL) confirmations.
-- A row is written whenever a fee is created or its amount is updated, recording
-- the IDIR username of the staff member who confirmed the FDL at that point.
create table if not exists rst.recreation_fee_fdl_log (
    id           bigserial   primary key,
    fee_id       integer     not null references rst.recreation_fee(fee_id),
    confirmed_by text        not null,
    confirmed_at timestamptz not null default now()
);

comment on table rst.recreation_fee_fdl_log is 'Append-only audit log recording each time a fee determination letter was confirmed by staff when creating or updating a recreation fee.';

comment on column rst.recreation_fee_fdl_log.id is 'Surrogate primary key.';
comment on column rst.recreation_fee_fdl_log.fee_id is 'Foreign key to the recreation fee this confirmation relates to.';
comment on column rst.recreation_fee_fdl_log.confirmed_by is 'IDIR username of the staff member who confirmed the fee determination letter.';
comment on column rst.recreation_fee_fdl_log.confirmed_at is 'Timestamp when the confirmation was recorded.';
