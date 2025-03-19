insert into rst.recreation_maintenance (
    rec_resource_id,
    recreation_maintenance_code,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select distinct on (rp.forest_file_id, rp.recreation_maintain_std_code)
    rp.forest_file_id as rec_resource_id,
    rp.recreation_maintain_std_code as recreation_maintenance_code,
    rp.update_timestamp as updated_at,
    rp.update_userid as updated_by,
    rp.entry_timestamp as created_at,
    rp.entry_userid as created_by
from fta.recreation_project rp
left join fta.recreation_maintain_std_code rmsc
    on rp.recreation_maintain_std_code = rmsc.recreation_maintain_std_code
order by rp.forest_file_id, rp.recreation_maintain_std_code, rp.update_timestamp desc
on conflict (rec_resource_id, recreation_maintenance_code)
do update set
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by,
    created_at = excluded.created_at,
    created_by = excluded.created_by;
    