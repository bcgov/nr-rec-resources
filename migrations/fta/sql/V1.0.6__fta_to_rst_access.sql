insert into rst.recreation_sub_access_code (sub_access_code, description, updated_at)
select
    recreation_sub_access_code as sub_access_code,
    description,
    update_timestamp as updated_at
from fta.recreation_sub_access_code
on conflict (sub_access_code) do update
set description = excluded.description
where rst.recreation_sub_access_code.description <> excluded.description;


insert into
    rst.recreation_access (rec_resource_id, access_code, sub_access_code, updated_at, updated_by, created_at, created_by)
select distinct -- distinct is used to avoid duplicate records that exist
    ra.forest_file_id as rec_resource_id,
    ra.recreation_access_code as access_code,
    ra.recreation_sub_access_code as sub_access_code,
    ra.update_timestamp as updated_at,
    ra.update_userid as updated_by,
    ra.entry_timestamp as created_at,
    ra.entry_userid as created_by
from
    fta.recreation_access ra
on conflict (rec_resource_id, access_code, sub_access_code) do update
set
    access_code = excluded.access_code,
    sub_access_code = excluded.sub_access_code,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;
