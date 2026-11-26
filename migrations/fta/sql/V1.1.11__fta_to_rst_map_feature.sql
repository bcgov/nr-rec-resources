-- REC4735 kept 8 features under section ids FTA has since renamed, so nothing
-- below matches their slot and they never get refreshed. Listed by skey because
-- it is the only resource like this. Geometry goes first since its fk would
-- block the delete.
with orphaned as (
    select rmf_skey
    from rst.recreation_map_feature
    where rec_resource_id = 'REC4735'
      and rmf_skey between 261861 and 261868
),
deleted_orphan_geom as (
    delete from rst.recreation_map_feature_geom
    where rmf_skey in (select rmf_skey from orphaned)
    returning rmf_skey
)
delete from rst.recreation_map_feature
where rmf_skey in (select rmf_skey from orphaned);


with map_feature as (
    select distinct on (rmf.forest_file_id, rmf.section_id)
        rmf.rmf_skey,
        rmf.forest_file_id as rec_resource_id,
        rmf.section_id,
        rmf.amendment_id,
        rmf.amend_status_code,
        rmf.recreation_map_feature_code as recreation_resource_type,
        rmf.current_ind,
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
), updated as (
    update rst.recreation_map_feature existing
    set
        amendment_id = mf.amendment_id,
        amend_status_code = mf.amend_status_code,
        recreation_resource_type = mf.recreation_resource_type,
        current_ind = mf.current_ind,
        amend_status_date = mf.amend_status_date,
        retirement_date = mf.retirement_date,
        revision_count = mf.revision_count,
        updated_by = mf.updated_by,
        updated_at = mf.updated_at
    from map_feature mf
    where existing.rec_resource_id = mf.rec_resource_id
      and existing.section_id is not distinct from mf.section_id
)
insert into rst.recreation_map_feature (
    rmf_skey, rec_resource_id, section_id, amendment_id, amend_status_code,
    recreation_resource_type, current_ind, amend_status_date, retirement_date, revision_count,
    created_by, created_at, updated_by, updated_at, recreation_map_feature_guid
)
select *
from map_feature mf
where not exists (
    select 1
    from rst.recreation_map_feature existing
    where existing.rec_resource_id = mf.rec_resource_id
      and existing.section_id is not distinct from mf.section_id
)
on conflict (rmf_skey)
do update
set
    rec_resource_id = excluded.rec_resource_id,
    section_id = excluded.section_id,
    amendment_id = excluded.amendment_id,
    amend_status_code = excluded.amend_status_code,
    recreation_resource_type = excluded.recreation_resource_type,
    current_ind = excluded.current_ind,
    amend_status_date = excluded.amend_status_date,
    retirement_date = excluded.retirement_date,
    revision_count = excluded.revision_count,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at,
    recreation_map_feature_guid = excluded.recreation_map_feature_guid;


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
join rst.recreation_map_feature r on r.rmf_skey = rmf.rmf_skey
order by rmf.map_feature_id, rmf.update_timestamp desc
on conflict (rmf_skey)
do update
set
    map_feature_id = excluded.map_feature_id,
    geometry_type_code = excluded.geometry_type_code,
    geometry = excluded.geometry,
    feature_area = excluded.feature_area,
    feature_length = excluded.feature_length,
    feature_perimeter = excluded.feature_perimeter,
    revision_count = excluded.revision_count,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;
