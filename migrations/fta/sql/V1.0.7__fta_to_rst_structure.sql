insert into rst.recreation_structure_code (structure_code, description, updated_at)
select
    recreation_structure_code as structure_code,
    description,
    update_timestamp as updated_at
from fta.recreation_structure_code
on conflict (structure_code)
do nothing; -- on conflict do nothing as we made changes to the descriptions


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

-- If a structure row is removed in FTA, remove it in RST
delete from rst.recreation_structure rst_rs
where not exists (
    select 1
    from fta.recreation_structure rs
    join fta.recreation_structure_code rsc_fta
        on rs.recreation_structure_code = rsc_fta.recreation_structure_code
    join rst.recreation_structure_code rsc_rst
        on rsc_fta.description = rsc_rst.description
    where
        rs.forest_file_id = rst_rs.rec_resource_id
        and rsc_rst.structure_code = rst_rs.structure_code
);
