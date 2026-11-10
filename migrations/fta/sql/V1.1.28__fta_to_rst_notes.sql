-- Field notes and objectives, as read-only notes on the resource.
--
-- Neither source carries a title in FTA, so one is assigned here. The site
-- description also still lands on recreation_resource.description, which the
-- overview section reads.
--
-- forest_file_id is any FTA forest file, so the join to recreation_resource
-- drops rows whose file isn't a recreation resource.

insert into rst.recreation_resource_note (
    rec_resource_id,
    note_type_code,
    title,
    body,
    date_logged,
    source_system,
    source_key,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select
    rp.forest_file_id as rec_resource_id,
    'FIELD_NOTE' as note_type_code,
    'Field note' as title,
    rst.fta_note_to_html(rp.site_description) as body,
    coalesce(rp.update_timestamp, rp.entry_timestamp)::date as date_logged,
    'FTA' as source_system,
    'FIELD_NOTE|' || rp.forest_file_id as source_key,
    rp.update_timestamp as updated_at,
    rp.update_userid as updated_by,
    rp.entry_timestamp as created_at,
    rp.entry_userid as created_by
from
    fta.recreation_project rp
join
    rst.recreation_resource rr
on
    rr.rec_resource_id = rp.forest_file_id
where
    btrim(coalesce(rp.site_description, '')) <> ''
on conflict (source_system, source_key) where source_key is not null
do update
set
    title = excluded.title,
    body = excluded.body,
    date_logged = excluded.date_logged,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;


-- Cancelled objectives are dropped, so the delete below also clears any note
-- for one cancelled since the last sync.
insert into rst.recreation_resource_note (
    rec_resource_id,
    note_type_code,
    title,
    body,
    date_logged,
    source_system,
    source_key,
    updated_at,
    updated_by,
    created_at,
    created_by
)
select
    ro.forest_file_id as rec_resource_id,
    'OBJECTIVE' as note_type_code,
    'Objective' as title,
    rst.fta_note_to_html(ro.objective_description) as body,
    coalesce(ro.objective_established_date, ro.entry_timestamp::date) as date_logged,
    'FTA' as source_system,
    'OBJECTIVE|' || ro.objective_id as source_key,
    ro.update_timestamp as updated_at,
    ro.update_userid as updated_by,
    ro.entry_timestamp as created_at,
    ro.entry_userid as created_by
from
    fta.recreation_objective ro
join
    rst.recreation_resource rr
on
    rr.rec_resource_id = ro.forest_file_id
where
    ro.objective_cancelled_date is null
    and btrim(coalesce(ro.objective_description, '')) <> ''
on conflict (source_system, source_key) where source_key is not null
do update
set
    title = excluded.title,
    body = excluded.body,
    date_logged = excluded.date_logged,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by;


-- If a site description is cleared in FTA, remove the note in RST.
-- Scoped by note_type_code so staff-authored and one-time imported notes,
-- which this sync does not own, are left alone.
delete from rst.recreation_resource_note n
where n.source_system = 'FTA'
  and n.note_type_code = 'FIELD_NOTE'
  and not exists (
      select 1
      from fta.recreation_project rp
      where rp.forest_file_id = n.rec_resource_id
        and btrim(coalesce(rp.site_description, '')) <> ''
  );

-- If an objective is cancelled or removed in FTA, remove the note in RST
delete from rst.recreation_resource_note n
where n.source_system = 'FTA'
  and n.note_type_code = 'OBJECTIVE'
  and not exists (
      select 1
      from fta.recreation_objective ro
      where 'OBJECTIVE|' || ro.objective_id = n.source_key
        and ro.objective_cancelled_date is null
        and btrim(coalesce(ro.objective_description, '')) <> ''
  );
