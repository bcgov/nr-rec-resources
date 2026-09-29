-- Marks an agreement as cancelled. Cancelling is a one-way action in the admin
-- app: the API rejects any attempt to set this back to false.
alter table rst.recreation_agreement_holder
    add column if not exists cancelled boolean not null default false;

-- Added to the history table up front, and nullable: sync_temporal_table_schema
-- copies `not null` from the source column but only carries a default when
-- column_default is set, so syncing `not null default false` onto a non-empty
-- history would fail.
alter table rst.recreation_agreement_holder_history
    add column if not exists cancelled boolean;

select setup_temporal_table ('rst', 'recreation_agreement_holder', true);

comment on column rst.recreation_agreement_holder.cancelled is 'Whether the agreement has been cancelled. Owned by RST and deliberately not refreshed by the FTA sync. Cancellation is one-way; the admin API rejects un-cancelling.';
