insert into rst.recreation_resource (forest_file_id, name, description, site_location)
select
    rp.forest_file_id,
    rp.project_name as name,
    rc.project_comment as description,
    rp.site_location
from
    fta.recreation_project rp
left join
    fta.recreation_comment rc
on
    rp.forest_file_id = rc.forest_file_id
where
    rc.rec_comment_type_code = 'desc';
