with source_rows as (
    select
        tai.tenure_app_guid,
        coalesce(nullif(btrim(tai.forest_file_id), ''), nullif(btrim(ta.forest_file_id), '')) as rec_resource_id,
        coalesce(nullif(btrim(tai.submission_id), ''), nullif(btrim(ta.submission_id), '')) as submission_id,
        nullif(btrim(tai.image_file_name), '') as source_file_name,
        nullif(lower(btrim(tai.image_extension)), '') as source_extension,
        tai.image_file_size,
        nullif(upper(btrim(tai.image_map_size_code)), '') as page_size,
        case
            when upper(btrim(tai.image_orientation_code)) in ('P', 'PORTRAIT') then 'Portrait'
            when upper(btrim(tai.image_orientation_code)) in ('L', 'LANDSCAPE') then 'Landscape'
            else null
        end as page_orientation,
        case
            when nullif(regexp_replace(coalesce(tai.image_scale, ''), '[^0-9]', '', 'g'), '') is not null
                then regexp_replace(tai.image_scale, '[^0-9]', '', 'g')::integer
            else null
        end as scale,
        coalesce(tai.update_timestamp, ta.update_timestamp, tai.entry_timestamp, ta.entry_timestamp, now()) as updated_at,
        coalesce(nullif(btrim(tai.update_userid), ''), nullif(btrim(ta.update_userid), ''), nullif(btrim(tai.entry_userid), ''), nullif(btrim(ta.entry_userid), '')) as updated_by,
        coalesce(tai.entry_timestamp, ta.entry_timestamp, tai.update_timestamp, ta.update_timestamp, now()) as created_at,
        coalesce(nullif(btrim(tai.entry_userid), ''), nullif(btrim(ta.entry_userid), ''), nullif(btrim(tai.update_userid), ''), nullif(btrim(ta.update_userid), '')) as created_by
    from fta.tenure_application_images tai
    left join fta.tenure_application ta
        on ta.tenure_app_guid = tai.tenure_app_guid
        or (
            ta.forest_file_id = tai.forest_file_id
            and ta.submission_id = tai.submission_id
            and tai.submission_id is not null
        )
),
normalized as (
    select
        sr.*,
        case
            when sr.source_file_name ~ '\\.' then regexp_replace(sr.source_file_name, '\\.[^.]+$', '')
            else sr.source_file_name
        end as file_name,
        coalesce(
            sr.source_extension,
            nullif(lower(split_part(sr.source_file_name, '.', array_length(regexp_split_to_array(sr.source_file_name, '\\.'), 1))), ''),
            'pdf'
        ) as extension,
        case
            when sr.source_file_name ~ '\\.' then sr.source_file_name
            else sr.source_file_name || '.' || coalesce(sr.source_extension, 'pdf')
        end as file_name_with_ext
    from source_rows sr
    where sr.rec_resource_id is not null
      and sr.submission_id is not null
      and sr.source_file_name is not null
),
prepared as (
    select
        n.rec_resource_id,
        rss.submission_id,
        n.file_name,
        n.extension,
        n.image_file_size as file_size,
        'Exhibit_A/' || n.rec_resource_id || '/' || rss.submission_id || '/' || n.file_name_with_ext as s3_key,
        n.updated_at,
        n.updated_by,
        n.created_at,
        n.created_by,
        case
            when n.page_size in ('A', 'B', 'C', 'D', 'E') then n.page_size
            else null
        end as page_size,
        n.page_orientation,
        n.scale,
        'migrated from FTA'::varchar(20) as generation_method
    from normalized n
    join rst.recreation_resource rr
        on rr.rec_resource_id = n.rec_resource_id
    join rst.recreation_spatial_submission rss
        on rss.tenure_id = n.rec_resource_id
       and rss.submission_id = n.submission_id
),
deduped as (
    select
        p.*,
        row_number() over (
            partition by p.s3_key
            order by p.updated_at desc nulls last, p.created_at desc nulls last
        ) as rn
    from prepared p
)
insert into rst.recreation_exhibit_a_doc (
    rec_resource_id,
    submission_id,
    file_name,
    extension,
    file_size,
    s3_key,
    updated_at,
    updated_by,
    created_at,
    created_by,
    page_size,
    page_orientation,
    scale,
    generation_method
)
select
    d.rec_resource_id,
    d.submission_id,
    d.file_name,
    d.extension,
    d.file_size,
    d.s3_key,
    d.updated_at,
    d.updated_by,
    d.created_at,
    d.created_by,
    d.page_size,
    d.page_orientation,
    d.scale,
    d.generation_method
from deduped d
where d.rn = 1
on conflict (s3_key) do update
set
    rec_resource_id = excluded.rec_resource_id,
    submission_id = excluded.submission_id,
    file_name = excluded.file_name,
    extension = excluded.extension,
    file_size = excluded.file_size,
    updated_at = excluded.updated_at,
    updated_by = excluded.updated_by,
    created_at = excluded.created_at,
    created_by = excluded.created_by,
    page_size = excluded.page_size,
    page_orientation = excluded.page_orientation,
    scale = excluded.scale,
    generation_method = excluded.generation_method;
