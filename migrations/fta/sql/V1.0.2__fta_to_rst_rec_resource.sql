-- Migrate data from fta schema to rst schema
insert into
    rst.recreation_resource (
        rec_resource_id,
        name,
        closest_community,
        display_on_public_site,
        updated_at,
        updated_by,
        created_at,
        created_by
    )
select
    rp.forest_file_id as rec_resource_id,
    rp.project_name as name,
    rp.site_location as closest_community,
    case
        when rp.recreation_view_ind = 'Y' then true
        else false
    end as display_on_public_site,
    rp.entry_timestamp as updated_at,
    rp.entry_userid as updated_by,
    rp.update_timestamp as created_at,
    rp.update_userid as created_by
from
    fta.recreation_project rp on conflict (rec_resource_id) do
update
set
    name = excluded.name,
    closest_community = excluded.closest_community,
    display_on_public_site = excluded.display_on_public_site,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by
where
    excluded.updated_at > rst.recreation_resource.updated_at;

-- Add description from fta.recreation_comment table
update rst.recreation_resource rr
set
    description = rc.project_comment
from
    fta.recreation_comment rc
where
    rr.rec_resource_id = rc.forest_file_id
    and rc.rec_comment_type_code = 'DESC';

-- Add district_code from recreation_district_xref
-- Select distinct, ordered by update_timestamp as there is a single forest_file_id with multiple district entries
update rst.recreation_resource
set district_code = xref.recreation_district_code
from (
    select distinct on (forest_file_id) forest_file_id, recreation_district_code
    from fta.recreation_district_xref
    order by forest_file_id, update_timestamp desc
) as xref
where recreation_resource.rec_resource_id = xref.forest_file_id;
