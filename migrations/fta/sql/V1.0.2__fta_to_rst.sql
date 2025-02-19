insert into
    rst.recreation_resource_type_code (rec_resource_type_code, description)
select
    recreation_map_feature_code,
    description
from
    fta.recreation_map_feature_code;

insert into
    rst.recreation_resource (
        rec_resource_id,
        name,
        description,
        closest_community,
        display_on_public_site,
        rec_resource_type,
        campsite_count
    )
select
    rp.forest_file_id,
    rp.project_name as name,
    case
        when rc.rec_comment_type_code = 'DESC' then rc.project_comment
        else ''
    end as description,
    rp.site_location as closest_community,
    case
        when rp.recreation_view_ind = 'Y' then true
        else false
    end as display_on_public_site,
    rmf.recreation_map_feature_code,
    coalesce(c.campsite_count, 0) as campsite_count
from
    fta.recreation_project rp
    left join fta.recreation_comment rc on rp.forest_file_id = rc.forest_file_id
    left join fta.recreation_map_feature rmf on rp.forest_file_id = rmf.forest_file_id
    left join
    (select forest_file_id, count(*) as campsite_count
     from fta.recreation_defined_campsite
     group by forest_file_id) c
on
    rp.forest_file_id = c.forest_file_id on conflict do nothing;

insert into
    rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    -- Convert strings codes ie '01', '02' to integers
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from
    fta.recreation_activity ra;

insert into
    rst.recreation_status (rec_resource_id, status_code, comment)
select
    forest_file_id,
    case
        when closure_ind = 'Y' then 2 -- Closed
        else 1 -- Open
    end as recreation_status_code,
    project_comment as description
from
    fta.recreation_comment
where
    rec_comment_type_code = 'CLOS';
