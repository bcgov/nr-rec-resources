insert into rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from fta.recreation_activity ra
on conflict (rec_resource_id, recreation_activity_code)
do update
set recreation_activity_code = excluded.recreation_activity_code
where rst.recreation_activity.recreation_activity_code != excluded.recreation_activity_code;
