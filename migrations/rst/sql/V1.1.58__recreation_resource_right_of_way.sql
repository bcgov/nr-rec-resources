-- Add right_of_way column to rst.recreation_resource.

alter table rst.recreation_resource
    add column if not exists right_of_way numeric(7, 1) null;

comment on column rst.recreation_resource.right_of_way is 'Identifies the Right of Way width for a linear feature. Sourced from fta.recreation_project.right_of_way.';

-- Sync the temporal history table so it has the new column
select sync_temporal_table_schema('rst', 'recreation_resource');
