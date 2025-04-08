with map_feature as (
    select distinct on (rmf.forest_file_id, rmf.section_id)
        rmf.rmf_skey,
        rmf.forest_file_id as rec_resource_id,
        rmf.section_id,
        rmf.amendment_id,
        rmf.amend_status_code,
        rmf.recreation_map_feature_code as recreation_resource_type,
        rmf.amend_status_date,
        rmf.retirement_date,
        rmf.revision_count,
        rmf.entry_userid as created_by,
        rmf.entry_timestamp as created_at,
        rmf.update_userid as updated_by,
        rmf.update_timestamp as updated_at,
        rmf.recreation_map_feature_guid
    from fta.recreation_map_feature rmf
    where rmf.forest_file_id in (
        select rec_resource_id from rst.recreation_resource
    )
    and rmf.current_ind = 'Y'
    order by rmf.forest_file_id, rmf.section_id, rmf.amend_status_date desc
)
insert into rst.recreation_map_feature (
    rmf_skey, rec_resource_id, section_id, amendment_id, amend_status_code,
    recreation_resource_type, amend_status_date, retirement_date, revision_count,
    created_by, created_at, updated_by, updated_at, recreation_map_feature_guid
)
select *
from map_feature mf
where not exists (
    select 1
    from rst.recreation_map_feature existing
    where existing.rmf_skey = mf.rmf_skey
)
on conflict (rec_resource_id, section_id)
do update set
    rmf_skey = excluded.rmf_skey,
    amendment_id = excluded.amendment_id,
    amend_status_code = excluded.amend_status_code,
    recreation_resource_type = excluded.recreation_resource_type,
    amend_status_date = excluded.amend_status_date,
    retirement_date = excluded.retirement_date,
    revision_count = excluded.revision_count,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;


insert into rst.recreation_map_feature_geom (
    rmf_skey, map_feature_id, geometry_type_code, geometry, feature_area,
    feature_length, feature_perimeter, revision_count, created_by,
    created_at, updated_by, updated_at
)
select distinct on (rmf.map_feature_id)
    rmf.rmf_skey,
    rmf.map_feature_id,
    rmf.geometry_type_code,
    rmf.geometry,
    rmf.feature_area,
    rmf.feature_length,
    rmf.feature_perimeter,
    rmf.revision_count,
    rmf.entry_userid as created_by,
    rmf.entry_timestamp as created_at,
    rmf.update_userid as updated_by,
    rmf.update_timestamp as updated_at
from fta.recreation_map_feature_geom rmf
join rst.recreation_map_feature r on r.rmf_skey = rmf.rmf_skey  -- ensure only existing records are referenced
order by rmf.map_feature_id, rmf.update_timestamp desc
on conflict (map_feature_id)
do update
set
    rmf_skey = excluded.rmf_skey,
    geometry_type_code = excluded.geometry_type_code,
    geometry = excluded.geometry,
    feature_area = excluded.feature_area,
    feature_length = excluded.feature_length,
    feature_perimeter = excluded.feature_perimeter,
    revision_count = excluded.revision_count,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;
