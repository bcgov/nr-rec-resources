with source_rows as (
    select
        coalesce(nullif(btrim(tai.forest_file_id), ''), nullif(btrim(ta.forest_file_id), '')) as rec_resource_id,
        coalesce(nullif(btrim(tai.submission_id), ''), nullif(btrim(ta.submission_id), '')) as submission_id,
        -- strip any folder path, then collapse repeated extensions (.pdf.pdf -> .pdf)
        regexp_replace(
                regexp_replace(btrim(tai.image_file_name), '^.*[\\/]', ''),
                '(\.[^.]+)\1+$', '\1', 'i'
        ) as clean_name,
        nullif(lower(btrim(tai.image_extension)), '') as source_extension,
        tai.image_file_size as file_size,
        nullif(upper(btrim(tai.image_map_size_code)), '') as page_size,
        case upper(btrim(tai.image_orientation_code))
            when 'P' then 'Portrait'  when 'PORTRAIT'  then 'Portrait'
            when 'L' then 'Landscape' when 'LANDSCAPE' then 'Landscape'
            end as page_orientation,
        nullif(regexp_replace(coalesce(tai.image_scale, ''), '[^0-9]', '', 'g'), '')::integer as scale,
        coalesce(tai.update_timestamp, ta.update_timestamp, tai.entry_timestamp, ta.entry_timestamp, now()) as updated_at,
        coalesce(nullif(btrim(tai.update_userid), ''), nullif(btrim(ta.update_userid), ''),
                 nullif(btrim(tai.entry_userid), ''),  nullif(btrim(ta.entry_userid), '')) as updated_by,
        coalesce(tai.entry_timestamp, ta.entry_timestamp, tai.update_timestamp, ta.update_timestamp, now()) as created_at,
        coalesce(nullif(btrim(tai.entry_userid), ''),  nullif(btrim(ta.entry_userid), ''),
                 nullif(btrim(tai.update_userid), ''), nullif(btrim(ta.update_userid), '')) as created_by
    from fta.tenure_application_images tai
             left join fta.tenure_application ta
                       on ta.tenure_app_guid = tai.tenure_app_guid
                           or (ta.forest_file_id = tai.forest_file_id
                               and ta.submission_id = tai.submission_id)
    where nullif(btrim(tai.image_file_name), '') is not null
),
     prepared as (
         select
             s.rec_resource_id,
             rss.application_guid,
             regexp_replace(s.clean_name, '\.[^.]+$', '')                       as file_name,
             coalesce(s.source_extension,
                      lower(substring(s.clean_name from '\.([^.]+)$')),
                      'pdf')                                                    as extension,
             s.file_size,
             coalesce(nullif(regexp_replace(s.rec_resource_id, '[^A-Za-z0-9._-]', '_', 'g'), ''), 'unknown_resource') || '/'
                 || coalesce(nullif(regexp_replace(s.submission_id, '[^A-Za-z0-9._-]', '_', 'g'), ''), 'unknown_submission') || '/'
                 || regexp_replace(s.clean_name, '[^A-Za-z0-9._-]', '_', 'g')     as s3_key,
             s.updated_at, s.updated_by, s.created_at, s.created_by,
             case when s.page_size in ('A','B','C','D','E') then s.page_size end as page_size,
             s.page_orientation,
             s.scale,
             'migrated from FTA'::varchar(20)                                   as generation_method
         from source_rows s
                  join rst.recreation_resource rr
                       on rr.rec_resource_id = s.rec_resource_id
                  join rst.recreation_spatial_submission rss
                       on rss.tenure_id = s.rec_resource_id
                           and rss.submission_id = s.submission_id
     )
insert into rst.recreation_exhibit_a_doc (
    rec_resource_id, application_guid, file_name, extension, file_size, s3_key,
    updated_at, updated_by, created_at, created_by,
    page_size, page_orientation, scale, generation_method
)
select distinct on (s3_key)
    rec_resource_id, application_guid, file_name, extension, file_size, s3_key,
    updated_at, updated_by, created_at, created_by,
    page_size, page_orientation, scale, generation_method
from prepared
order by s3_key, updated_at desc nulls last, created_at desc nulls last
on conflict (s3_key) do update set
                                   rec_resource_id   = excluded.rec_resource_id,
                                   application_guid  = excluded.application_guid,
                                   file_name         = excluded.file_name,
                                   extension         = excluded.extension,
                                   file_size         = excluded.file_size,
                                   updated_at        = excluded.updated_at,
                                   updated_by        = excluded.updated_by,
                                   created_at        = excluded.created_at,
                                   created_by        = excluded.created_by,
                                   page_size         = excluded.page_size,
                                   page_orientation  = excluded.page_orientation,
                                   scale             = excluded.scale,
                                   generation_method = excluded.generation_method;
