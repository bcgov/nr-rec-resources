-- Add rec_status_code column to rst.recreation_resource.

alter table rst.recreation_resource
    add column if not exists rec_status_code varchar(50) null;

comment on column rst.recreation_resource.rec_status_code is 'Site status value for a recreation resource. Sourced from fta.recreation_site_status_code.status.';

-- Sync the temporal history table so it has the new column
select sync_temporal_table_schema('rst', 'recreation_resource');
