insert into rst.recreation_resource (
    rec_resource_id,
    name,
    closest_community,
    display_on_public_site,
    updated_at,
    updated_by,
    created_at,
    created_by,
    description,
    district_code,
    maintenance_standard_code,
    project_established_date,
    control_access_code,
    risk_rating_code
)
select
    rp.forest_file_id as rec_resource_id,
    rp.project_name as name,
    rp.site_location as closest_community,
    case
        when rp.recreation_view_ind = 'Y' then true
        else false
    end as display_on_public_site,
    rp.update_timestamp as updated_at,
    rp.update_userid as updated_by,
    rp.entry_timestamp as created_at,
    rp.entry_userid as created_by,
    rp.site_description as description,
    xref.recreation_district_code as district_code,
    rp.recreation_maintain_std_code as maintenance_standard_code,
    rp.project_established_date as project_established_date,
    rp.recreation_control_access_code as control_access_code,
    rp.recreation_risk_rating_code as risk_rating_code
from
    fta.recreation_project rp
left join
    (
        select distinct on (forest_file_id)
            forest_file_id,
            recreation_district_code
        from
            fta.recreation_district_xref
        order by
            forest_file_id, update_timestamp desc
    ) as xref
on
    rp.forest_file_id = xref.forest_file_id
on conflict (rec_resource_id) do update
set
    name = excluded.name,
    closest_community = excluded.closest_community,
    display_on_public_site = excluded.display_on_public_site,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by,
    description = excluded.description,
    district_code = excluded.district_code,
    maintenance_standard_code = excluded.maintenance_standard_code,
    project_established_date = excluded.project_established_date,
    control_access_code = excluded.control_access_code,
    risk_rating_code = excluded.risk_rating_code;
