insert into
    rst.recreation_defined_campsite (rec_resource_id, campsite_number, estimated_repair_cost, recreation_remed_repair_code, repair_complete_date, created_at, updated_at, created_by, updated_by)
select distinct
    fdc.forest_file_id as rec_resource_id,
    fdc.campsite_number,
    fdc.estimated_repair_cost,
    fdc.recreation_remed_repair_code,
    fdc.repair_complete_date,
    fdc.entry_timestamp as created_at,
    fdc.update_timestamp as updated_at,
    fdc.entry_userid as created_by,
    fdc.update_userid as updated_by
from
    fta.recreation_defined_campsite fdc
inner join (
    select
        forest_file_id,
        campsite_number,
        max(revision_count) as max_revision_count
    from fta.recreation_defined_campsite
    group by forest_file_id, campsite_number
) latest
on fdc.forest_file_id = latest.forest_file_id
and fdc.campsite_number = latest.campsite_number
and fdc.revision_count = latest.max_revision_count
on conflict (rec_resource_id, campsite_number) do update
set
    campsite_number = excluded.campsite_number,
    estimated_repair_cost = excluded.estimated_repair_cost,
    recreation_remed_repair_code = excluded.recreation_remed_repair_code,
    repair_complete_date = excluded.repair_complete_date,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;

-- If a campsite row is removed in FTA, remove it in RST
delete from rst.recreation_defined_campsite rst_rdc
where not exists (
    select 1
    from fta.recreation_defined_campsite fdc
    inner join (
        select
            forest_file_id,
            campsite_number,
            max(revision_count) as max_revision_count
        from fta.recreation_defined_campsite
        group by forest_file_id, campsite_number
    ) latest
        on fdc.forest_file_id = latest.forest_file_id
       and fdc.campsite_number = latest.campsite_number
       and fdc.revision_count = latest.max_revision_count
    where
        fdc.forest_file_id = rst_rdc.rec_resource_id
      and fdc.campsite_number = rst_rdc.campsite_number
);
