insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description, updated_at)
select
    recreation_map_feature_code as rec_resource_type_code,
    description,
    update_timestamp as updated_at
from fta.recreation_map_feature_code
on conflict (rec_resource_type_code)
do update
set
    description = excluded.description
where
    excluded.description <> rst.recreation_resource_type_code.description;


-- Select distinct, ordered by amend_status_date as there are some duplicated with current_ind = 'Y'
-- In the future we will need to decide how to store historical records ie current_ind = 'N'
insert into
    rst.recreation_resource_type (rec_resource_id, rec_resource_type_code, updated_at, updated_by, created_at, created_by)
select distinct
    on (rmf.forest_file_id) rmf.forest_file_id as rec_resource_id,
    rmf.recreation_map_feature_code as rec_resource_type_code,
    rmf.update_timestamp as updated_at,
    rmf.update_userid as updated_by,
    rmf.entry_timestamp as created_at,
    rmf.entry_userid as created_by
from fta.recreation_map_feature rmf
where
    rmf.forest_file_id in (
        select
            rec_resource_id
        from
            rst.recreation_resource
    )
    and rmf.current_ind = 'Y'
order by
    rmf.forest_file_id,
    rmf.amend_status_date desc
on conflict (rec_resource_id)
do update
set
    rec_resource_type_code = excluded.rec_resource_type_code;
