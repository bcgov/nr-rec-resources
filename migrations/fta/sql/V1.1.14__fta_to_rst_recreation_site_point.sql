insert into rst.recreation_site_point (rec_resource_id, geometry, revision_count, updated_at, updated_by, created_at, created_by)
select distinct on (frsp.forest_file_id, frsp.geometry)
    frsp.forest_file_id   as rec_resource_id,
    frsp.geometry,
    frsp.revision_count,
    frsp.update_timestamp as updated_at,
    frsp.update_userid    as updated_by,
    frsp.entry_timestamp  as created_at,
    frsp.entry_userid     as created_by
from fta.recreation_site_point frsp
join rst.recreation_resource rr on frsp.forest_file_id = rr.rec_resource_id
on conflict (rec_resource_id)
do update
set rec_resource_id = excluded.rec_resource_id,
    geometry        = excluded.geometry,
    revision_count  = excluded.revision_count,
    updated_by      = excluded.updated_by,
    updated_at      = excluded.updated_at,
    created_at      = excluded.created_at,
    created_by      = excluded.created_by;
