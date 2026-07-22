insert into rst.recreation_driving_direction (
    rec_resource_id,
    description,
    driving_directions_date
)
select
    rp.forest_file_id as rec_resource_id,
    rc.project_comment as description,
    rc.comment_date as driving_directions_date
from
    fta.recreation_project rp
left join
    fta.recreation_comment rc
on
    rp.forest_file_id = rc.forest_file_id
    and rc.rec_comment_type_code = 'DRIV'
where
    rc.project_comment is not null
on conflict (rec_resource_id) do update
set
    description = excluded.description,
    driving_directions_date = excluded.driving_directions_date;
