-- Migrate data from fta schema to rst schema

insert into rst.recreation_resource (
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
    fta.recreation_project rp
on conflict (rec_resource_id)
do update
set
    name = excluded.name,
    closest_community = excluded.closest_community,
    display_on_public_site = excluded.display_on_public_site
where
    rst.recreation_resource.name is distinct from excluded.name
    or rst.recreation_resource.closest_community is distinct from excluded.closest_community
    or rst.recreation_resource.display_on_public_site is distinct from excluded.display_on_public_site;


-- Add description from fta.recreation_comment table
update rst.recreation_resource rr
set
    description = rc.project_comment
from
    fta.recreation_comment rc
where
    rr.rec_resource_id = rc.forest_file_id
    and rc.rec_comment_type_code = 'DESC'
    and (rr.description is distinct from rc.project_comment or rr.description is null);

-- Add district_code from recreation_district_xref
update rst.recreation_resource rr
set
    district_code = xref.recreation_district_code
from
    fta.recreation_district_xref xref
where
    rr.rec_resource_id = xref.forest_file_id
    and rr.district_code is distinct from xref.recreation_district_code;
