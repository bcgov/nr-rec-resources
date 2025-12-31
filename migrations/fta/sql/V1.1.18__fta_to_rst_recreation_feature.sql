insert into rst.recreation_feature_code (recreation_feature_code, description, updated_at)
select
    rfc.recreation_feature_code,
    rfc.description,
    rfc.update_timestamp as updated_at
from
    fta.recreation_feature_code rfc
on conflict (recreation_feature_code)
do nothing;

insert into rst.recreation_feature (
    rec_resource_id,
    recreation_feature_code,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select
    rp.forest_file_id as rec_resource_id,
    rp.recreation_feature_code,
    rp.update_timestamp as updated_at,
    rp.update_userid as updated_by,
    rp.entry_timestamp as created_at,
    rp.entry_userid as created_by
from
    fta.recreation_project rp
where
    rp.recreation_feature_code is not null
on conflict (rec_resource_id, recreation_feature_code)
do update
set
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;

-- If a feature is removed/changed in FTA, remove it in RST
delete from rst.recreation_feature rf
where not exists (
    select 1
    from fta.recreation_project rp
    where rp.forest_file_id = rf.rec_resource_id
      and rp.recreation_feature_code = rf.recreation_feature_code
);
