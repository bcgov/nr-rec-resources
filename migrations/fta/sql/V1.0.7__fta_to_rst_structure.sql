insert into rst.recreation_structure (rec_resource_id, structure_code, updated_at, updated_by, created_at, created_by)
select distinct on (rs.forest_file_id, rsc_rst.structure_code)
    rs.forest_file_id as rec_resource_id,
    rsc_rst.structure_code as structure_code,
    rs.update_timestamp as updated_at,
    rs.update_userid as updated_by,
    rs.entry_timestamp as created_at,
    rs.entry_userid as created_by
from
    fta.recreation_structure rs
    join fta.recreation_structure_code rsc_fta
        on rs.recreation_structure_code = rsc_fta.recreation_structure_code
    join rst.recreation_structure_code rsc_rst
        on rsc_fta.description = rsc_rst.description  -- match descriptions since we changed the structure code ids since they were messy
order by rs.forest_file_id, rsc_rst.structure_code, rs.update_timestamp desc
on conflict (rec_resource_id, structure_code)
do update
set
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
