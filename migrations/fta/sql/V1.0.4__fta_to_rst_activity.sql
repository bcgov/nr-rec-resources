insert into rst.recreation_activity (rec_resource_id, recreation_activity_code, updated_at, updated_by, created_at, created_by)
select
    ra.forest_file_id as rec_resource_id,
    cast(ra.recreation_activity_code as int) as recreation_activity_code,
    ra.update_timestamp as updated_at,
    ra.update_userid as updated_by,
    ra.update_timestamp as created_at,
    ra.update_userid as created_by
from fta.recreation_activity ra
on conflict (rec_resource_id, recreation_activity_code)
do update
set recreation_activity_code = excluded.recreation_activity_code,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
where rst.recreation_activity.updated_at is distinct from excluded.updated_at;
