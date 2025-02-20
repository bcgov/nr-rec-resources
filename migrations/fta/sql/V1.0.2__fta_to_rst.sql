-- Migrate data from fta schema to rst schema

insert into rst.recreation_resource (rec_resource_id, name, closest_community, display_on_public_site)
select
    rp.forest_file_id,
    rp.project_name,
    rp.site_location,
    case when rp.recreation_view_ind = 'Y' then true else false end
from fta.recreation_project rp;

-- Add description from fta.recreation_comment table
update rst.recreation_resource rr
set description = rc.project_comment
from fta.recreation_comment rc
where rr.rec_resource_id = rc.forest_file_id
and rc.rec_comment_type_code = 'DESC';

-- Add campsite_count from recreation_defined_campsite
update rst.recreation_resource rr
set campsite_count = c.campsite_count
from (
    select forest_file_id, count(*) as campsite_count
    from fta.recreation_defined_campsite
    group by forest_file_id
) c
where rr.rec_resource_id = c.forest_file_id;

-- Add district_code from recreation_district_xref
update rst.recreation_resource rr
set district_code = xref.recreation_district_code
from fta.recreation_district_xref xref
where rr.rec_resource_id = xref.forest_file_id;

insert into rst.recreation_activity (rec_resource_id, recreation_activity_code)
select
    ra.forest_file_id as rec_resource_id,
    -- Convert strings codes ie '01', '02' to integers
    cast(ra.recreation_activity_code as int) as recreation_activity_code
from fta.recreation_activity ra;

insert into rst.recreation_status (rec_resource_id, status_code, comment)
select
    forest_file_id,
    case
        when closure_ind = 'Y' then 2 -- Closed
        else 1 -- Open
    end as recreation_status_code,
    project_comment as description
from fta.recreation_comment
where rec_comment_type_code = 'CLOS';

insert into rst.recreation_resource_type_code (rec_resource_type_code, description)
select recreation_map_feature_code, description
from fta.recreation_map_feature_code;

-- Select distinct, ordered by amend_status_date as there are some duplicated with current_ind = 'Y'
-- In the future we will need to decide how to store historical records ie current_ind = 'N'
insert into rst.recreation_resource_type (rec_resource_id, rec_resource_type_code)
select distinct on (rmf.forest_file_id)
    rmf.forest_file_id,
    rmf.recreation_map_feature_code
from fta.recreation_map_feature rmf
where rmf.forest_file_id in (select rec_resource_id from rst.recreation_resource)
and rmf.current_ind = 'Y'
order by rmf.forest_file_id, rmf.amend_status_date desc;

insert into rst.recreation_access (rec_resource_id, access_code, sub_access_code)
select
    ra.forest_file_id as rec_resource_id,
    -- access_code and sub_access_code are reversed in the fta data for some reason
    ra.recreation_access_code as sub_access_code,
    ra.recreation_sub_access_code as access_code
from fta.recreation_access ra;

-- FTA structure_code ids were all over the place, so using serial id.
-- Need to verify this matches up and inserts the correct ids
insert into rst.recreation_structure (rec_resource_id, structure_code)
select
    fta.recreation_structure.forest_file_id as rec_resource_id,
    rst.recreation_structure_code.structure_code
from fta.recreation_structure
join fta.recreation_structure_code
on fta.recreation_structure.structure_id = fta.recreation_structure_code.recreation_structure_code
join rst.recreation_structure_code
on fta.recreation_structure_code.description = rst.recreation_structure_code.description;
