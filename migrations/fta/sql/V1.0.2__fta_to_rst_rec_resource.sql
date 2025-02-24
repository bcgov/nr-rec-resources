-- Migrate data from fta schema to rst schema
insert into
    rst.recreation_resource (
        rec_resource_id,
        name,
        closest_community,
        display_on_public_site
    )
select
    rp.forest_file_id as rec_resource_id,
    rp.project_name as name,
    rp.site_location as closest_community,
    case
        when rp.recreation_view_ind = 'Y' then true
        else false
    end as display_on_public_site
from
    fta.recreation_project rp;

-- Add description from fta.recreation_comment table
update rst.recreation_resource rr
set
    description = rc.project_comment
from
    fta.recreation_comment rc
where
    rr.rec_resource_id = rc.forest_file_id
    and rc.rec_comment_type_code = 'DESC';
