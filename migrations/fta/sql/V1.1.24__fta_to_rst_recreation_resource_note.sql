-- Historical notes from FTA, written as rst notes with source_system 'FTA'.
-- Rows created or last updated by RECREATION_CONVERSION are generated summaries
-- from the 2005 data migration, not notes a person wrote.
--
-- entry_timestamp is already a date here: backend-el writes LocalDateTime as
-- ISO-8601, which the csv import parses on the way into fta.
--
-- forest_file_id is any FTA forest file, so the join to recreation_resource
-- drops notes whose file isn't a recreation resource.

insert into rst.recreation_resource_note (
    rec_resource_id,
    note_type_code,
    title,
    body,
    date_logged,
    source_system,
    source_key,
    created_by,
    updated_by
)
select
    pn.forest_file_id,
    'NOTE',
    'FTA Note',
    rst.fta_note_to_html(pn.note),
    pn.entry_timestamp,
    'FTA',
    pn.provforest_note_skey::text,
    pn.entry_userid,
    pn.update_userid
from fta.provforest_note pn
join rst.recreation_resource rr
    on rr.rec_resource_id = pn.forest_file_id
where pn.forest_file_id like 'REC%'
  and pn.entry_userid is distinct from 'RECREATION_CONVERSION'
  and pn.update_userid is distinct from 'RECREATION_CONVERSION'
on conflict (source_system, source_key) where source_key is not null
do update set
    title = excluded.title,
    body = excluded.body,
    date_logged = excluded.date_logged,
    created_by = excluded.created_by,
    updated_by = excluded.updated_by;

insert into rst.recreation_resource_note (
    rec_resource_id,
    note_type_code,
    title,
    body,
    date_logged,
    source_system,
    source_key,
    created_by,
    updated_by
)
select
    au.forest_file_id,
    'NOTE',
    'FTA Associated File - ' || coalesce(fsc.description, au.file_source_code),
    rst.fta_note_to_html(
        'Source file ID: '     || au.forest_file_id     || E'\n' ||
        'Associated file ID: ' || au.associated_file_id || E'\n' ||
        'File source: '        || coalesce(fsc.description, au.file_source_code)
                               || ' (' || au.file_source_code || ')'
    ),
    au.entry_timestamp,
    'FTA',
    au.forest_file_id || '|' || au.file_source_code || '|' || au.associated_file_id,
    au.entry_userid,
    au.update_userid
from fta.associated_use au
join rst.recreation_resource rr
    on rr.rec_resource_id = au.forest_file_id
left join rst.recreation_file_source_code fsc
    on fsc.file_source_code = au.file_source_code
where au.forest_file_id like 'REC%'
  and au.entry_userid is distinct from 'RECREATION_CONVERSION'
  and au.update_userid is distinct from 'RECREATION_CONVERSION'
on conflict (source_system, source_key) where source_key is not null
do update set
    title = excluded.title,
    body = excluded.body,
    date_logged = excluded.date_logged,
    created_by = excluded.created_by,
    updated_by = excluded.updated_by;
