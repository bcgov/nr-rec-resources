-- An amended feature comes back from FTA under a new rmf_skey, so clear out the
-- row we were holding for that slot before loading the new one. A slot is
-- (rec_resource_id, section_id), matched with `is not distinct from` because
-- polygons have no section_id and plain `=` never matches on null.
--
-- Only slots FTA still fills get cleared, so anything it has stopped reporting
-- stays where it is. Geometry goes in the same statement, its fk to
-- recreation_map_feature would otherwise block the delete.
with superseded as (
    select existing.rmf_skey
    from rst.recreation_map_feature existing
    where exists (
        select 1
        from fta.recreation_map_feature f
        where f.forest_file_id = existing.rec_resource_id
          and f.section_id is not distinct from existing.section_id
          and f.current_ind = 'Y'
    )
    and not exists (
        select 1
        from fta.recreation_map_feature f
        where f.rmf_skey = existing.rmf_skey
          and f.current_ind = 'Y'
    )
),
deleted_geom as (
    delete from rst.recreation_map_feature_geom
    where rmf_skey in (select rmf_skey from superseded)
    returning rmf_skey
)
delete from rst.recreation_map_feature
where rmf_skey in (select rmf_skey from superseded);


-- rmf_skey is the feature's identity in FTA, so the upsert keys on it and the
-- update picks up anything FTA has changed since, retirement_date included.
-- distinct on keeps the latest amendment per slot, in case FTA reports more
-- than one current row for one.
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
from map_feature
on conflict (rmf_skey)
do update set
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
